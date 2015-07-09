(function() {
  'use strict';

  var L = (typeof window !== "undefined" ? window.L : typeof global !== "undefined" ? global.L : null);
  var corslite = require('corslite');
  var polyline = require('polyline');

  L.Routing = L.Routing || {};

  L.Routing.Valhalla = L.Class.extend({
    options: {
      serviceUrl: '//valhalla.mapzen.com/',
      timeout: 30 * 1000,
      transitmode: 'auto'
    },

    initialize: function(accessToken, transitmode, options) {
      L.Util.setOptions(this, options);
      this._accessToken = accessToken;
      this._transitmode = transitmode;
      this._hints = {
        locations: {}
      };
    },

    route: function(waypoints, callback, context, options) {
      var timedOut = false,
        wps = [],
        url,
        timer,
        wp,
        i;

      options = options || {};
      //waypoints = options.waypoints || waypoints;
      url = this.buildRouteUrl(waypoints, options);


      timer = setTimeout(function() {
                timedOut = true;
                callback.call(context || callback, {
                  status: -1,
                  message: 'OSRM request timed out.'
                });
              }, this.options.timeout);

      // Create a copy of the waypoints, since they
      // might otherwise be asynchronously modified while
      // the request is being processed.
      for (i = 0; i < waypoints.length; i++) {
        wp = waypoints[i];
        wps.push({
          latLng: wp.latLng,
          name: wp.name || "",
          options: wp.options || {}
        });
      }


      corslite(url, L.bind(function(err, resp) {
        var data;

        clearTimeout(timer);
        if (!timedOut) {
          if (!err) {
            data = JSON.parse(resp.responseText);
            this._routeDone(data, wps, callback, context);
          } else {
            callback.call(context || callback, {
              status: err.status,
              message: err.responseText
            });
          }
        }
      }, this), true);

      return this;
    },

    _routeDone: function(response, inputWaypoints, callback, context) {
      var coordinates,
          alts,
          actualWaypoints,
          i;
      context = context || callback;
      if (response.trip.status !== 0) {
        callback.call(context, {
          status: response.status,
          message: response.status_message
        });
        return;
      }

      var insts = [];
      var coordinates = [];
      var shapeIndex =  0;

      for(var i = 0; i < response.trip.legs.length; i++){
        var coord = polyline.decode(response.trip.legs[i].shape, 6);

        for(var k = 0; k < coord.length; k++){
          coordinates.push(coord[k]);
        }

        for(var j =0; j < response.trip.legs[i].maneuvers.length; j++){
          var res = response.trip.legs[i].maneuvers[j];
          res.distance = response.trip.legs[i].maneuvers[j]["length"];
          res.index = shapeIndex + response.trip.legs[i].maneuvers[j]["begin_shape_index"];
          insts.push(res);
        }

        shapeIndex += response.trip.legs[i].maneuvers[response.trip.legs[i].maneuvers.length-1]["begin_shape_index"];
      }

      actualWaypoints = this._toWaypoints(inputWaypoints, response.trip.locations);


      alts = [{
        name: this._trimLocationKey(inputWaypoints[0].latLng) + " , " + this._trimLocationKey(inputWaypoints[1].latLng) ,
        unit: response.trip.units,
        transitmode: this._transitmode,
        coordinates: coordinates,
        instructions: insts,//response.route_instructions ? this._convertInstructions(response.route_instructions) : [],
        summary: response.trip.summary ? this._convertSummary(response.trip.summary) : [],
        inputWaypoints: inputWaypoints,
        waypoints: actualWaypoints,
        waypointIndices: this._clampIndices([0,response.trip.legs[0].maneuvers.length], coordinates)
      }];

      // only versions <4.5.0 will support this flag
        if (response.hint_data) {
          this._saveHintData(response.hint_data, inputWaypoints);
        }
      callback.call(context, null, alts);
    },

    _saveHintData: function(hintData, waypoints) {
      var loc;
      this._hints = {
        checksum: hintData.checksum,
        locations: {}
      };
      for (var i = hintData.locations.length - 1; i >= 0; i--) {
        loc = waypoints[i].latLng;
        this._hints.locations[this._locationKey(loc)] = hintData.locations[i];
      }
    },

    _toWaypoints: function(inputWaypoints, vias) {
      var wps = [],
          i;
      for (i = 0; i < vias.length; i++) {
        wps.push(L.Routing.waypoint(L.latLng([vias[i]["lat"],vias[i]["lon"]]),
                                    "name",
                                    {}));
      }

      return wps;
    },
    ///mapzen example
    buildRouteUrl: function(waypoints, options) {
      var locs = [],
          locationKey,
          hint;
      var transitM = options.transitmode || this._transitmode;
      var streetName = options.street;
      this._transitmode = transitM;

      for (var i = 0; i < waypoints.length; i++) {
        var loc;
        locationKey = this._locationKey(waypoints[i].latLng).split(',');
        if(i === 0 || i === waypoints.length-1){
          loc = {
            lat: parseFloat(locationKey[0]),
            lon: parseFloat(locationKey[1]),
            type: "break"
          }
        }else{
          loc = {
            lat: parseFloat(locationKey[0]),
            lon: parseFloat(locationKey[1]),
            type: "through"
          }
        }
        locs.push(loc);
      }

       var params = JSON.stringify({
         locations: locs,
         costing: transitM,
         street: streetName
       });

      return this.options.serviceUrl + 'route?json=' +
              params + '&api_key=' + this._accessToken;
    },

    _locationKey: function(location) {
      return location.lat + ',' + location.lng;
    },

    _trimLocationKey: function(location){
      var lat = location.lat;
      var lng = location.lng;

      var nameLat = Math.floor(location.lat * 1000)/1000;
      var nameLng = Math.floor(location.lng * 1000)/1000;

      return nameLat + ' , ' + nameLng;

    },

    _convertSummary: function(route) {
      return {
        totalDistance: route.length,
        totalTime: route.time
      };
    },

    _convertInstructions: function(osrmInstructions) {
      var result = [],
          i,
          instr,
          type,
          driveDir;

      for (i = 0; i < osrmInstructions.length; i++) {
        instr = osrmInstructions[i];
        type = this._drivingDirectionType(instr[0]);
        driveDir = instr[0].split('-');
        if (type) {
          result.push({
            type: type,
            distance: instr[2],
            time: instr[4],
            road: instr[1],
            direction: instr[6],
            exit: driveDir.length > 1 ? driveDir[1] : undefined,
            index: instr[3]
          });
        }
      }

      return result;
    },

    _clampIndices: function(indices, coords) {
      var maxCoordIndex = coords.length - 1,
        i;
      for (i = 0; i < indices.length; i++) {
        indices[i] = Math.min(maxCoordIndex, Math.max(indices[i], 0));
      }
    }
  });

  L.Routing.valhalla = function(accessToken, transitmode, options) {
    return new L.Routing.Valhalla(accessToken, transitmode, options);
  };

  module.exports = L.Routing.Valhalla;
})();