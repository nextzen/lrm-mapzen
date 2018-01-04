(function() {
  'use strict';

  var L = require('leaflet');
  var corslite = require('@mapbox/corslite');
  var polyline = require('@mapbox/polyline');

  var Waypoint = require('./mapzenWaypoint');

  module.exports = L.Class.extend({
    options: {
      serviceUrl: 'https://valhalla.mapzen.com/route?',
      timeout: 30 * 1000
    },

    initialize: function(accessToken, options) {
      L.Util.setOptions(this, options);
      // There is currently no way to differentiate the options for Leaflet Routing Machine itself from options for route call
      // So we resort the options here
      // In future, lrm-mapzen will consider exposing routingOptions object to users
      this.options.routingOptions = {};
      for (var key in options) {
        if (key !== 'serviceUrl' || key !== 'timeout') {
          this.options.routingOptions[key] = options[key];
        }
      }

      // Deprecation warnings for Mapzen hosted service.
      // Make sure people aware of Mapzen hosted services are going down.
      var mapzenHostedServiceUrl = '//valhalla.mapzen.com';
      if (this.options.serviceUrl.indexOf(mapzenHostedServiceUrl) > -1) {
        console.warn('Mapzen is shutting down its services including Turn-by-turn. Read more at https://mapzen.com/blog/shutdown');
      }

      this._accessToken = accessToken;
    },

    route: function(waypoints, callback, context, options) {
      var timedOut = false,
        wps = [],
        url,
        timer,
        wp,
        i;
      var routingOptions = L.extend(this.options.routingOptions, options);

      url = this.buildRouteUrl(waypoints, routingOptions);
      timer = setTimeout(function() {
                timedOut = true;
                callback.call(context || callback, {
                  status: -1,
                  message: 'Time out.'
                });
              }, this.options.timeout);

      // Create a copy of the waypoints, since they
      // might otherwise be asynchronously modified while
      // the request is being processed.
      for (i = 0; i < waypoints.length; i++) {
        wp = waypoints[i];
        wps.push(new Waypoint(L.latLng(wp.latLng), wp.name || "", wp.options || {}))
      }

      corslite(url, L.bind(function(err, resp) {
        var data;
        clearTimeout(timer);
        if (!timedOut) {
          if (!err) {
            data = JSON.parse(resp.responseText);
            this._routeDone(data, wps, routingOptions, callback, context);
          } else {
            console.log("Error : " + err.response);
            callback.call(context || callback, {
              status: err.status,
              message: err.response
            });
          }
        }
      }, this), true);

      return this;
    },

    _routeDone: function(response, inputWaypoints, routingOptions, callback, context) {

      var coordinates,
          alts,
          outputWaypoints,
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
          coordinates.push(L.latLng(coord[k][0], coord[k][1]));
        }

        for(var j =0; j < response.trip.legs[i].maneuvers.length; j++){
          var res = response.trip.legs[i].maneuvers[j];
          res.distance = response.trip.legs[i].maneuvers[j]["length"];
          res.index = shapeIndex + response.trip.legs[i].maneuvers[j]["begin_shape_index"];
          insts.push(res);
        }

        if(routingOptions.costing === 'multimodal') insts = this._unifyTransitManeuver(insts);

        shapeIndex += response.trip.legs[i].maneuvers[response.trip.legs[i].maneuvers.length-1]["begin_shape_index"];
      }

      outputWaypoints = this._toWaypoints(inputWaypoints, response.trip.locations);
      var subRoutes;
      if (routingOptions.costing == 'multimodal') subRoutes = this._getSubRoutes(response.trip.legs)

      alts = [{
        name: this._trimLocationKey(inputWaypoints[0].latLng) + " , " + this._trimLocationKey(inputWaypoints[inputWaypoints.length-1].latLng) ,
        unit: response.trip.units,
        costing: routingOptions.costing,
        coordinates: coordinates,
        subRoutes: subRoutes,
        instructions: insts,//response.route_instructions ? this._convertInstructions(response.route_instructions) : [],
        summary: response.trip.summary ? this._convertSummary(response.trip.summary) : [],
        inputWaypoints: inputWaypoints,
        outputWaypoints: outputWaypoints,
        actualWaypoints: outputWaypoints, // DEPRECATE THIS on v2.0
        waypointIndices: this._clampIndices([0,response.trip.legs[0].maneuvers.length], coordinates)
      }];

      callback.call(context, null, alts);
    },

    // lrm mapzen is trying to unify manuver of subroutes,
    // travle type number including transit routing is > 30 including entering the station, exiting the station
    // look at the api docs for more info (docs link coming soon)
    _unifyTransitManeuver: function(insts) {

      var transitType;
      var newInsts = insts;

      for(var i = 0; i < newInsts.length; i++) {
        if(newInsts[i].type == 30) {
          transitType = newInsts[i].travel_type;
          break;
        }
      }

      for(var j = 0; j < newInsts.length; j++) {
        if(newInsts[j].type > 29) newInsts[j].edited_travel_type = transitType;
      }

      return newInsts;

    },

    //creates section of the polyline based on change of travel mode for multimodal
    _getSubRoutes: function(legs) {

      var subRoute = [];

      for (var i = 0; i < legs.length; i++) {

        var coords = polyline.decode(legs[i].shape, 6);

        var lastTravelType;
        var transitIndices = [];
        for(var j = 0; j < legs[i].maneuvers.length; j++){

          var res = legs[i].maneuvers[j];
          var travelType = res.travel_type;

          if(travelType !== lastTravelType || res.type === 31 /*this is for transfer*/) {
            //transit_info only exists in the transit maneuvers
            //loop thru maneuvers and populate indices array with begin shape index
            //also populate subRoute array to contain the travel type & color associated with the transit polyline sub-section
            //otherwise just populate with travel type and use fallback style
            if(res.begin_shape_index > 0) transitIndices.push(res.begin_shape_index);
            if(res.transit_info) subRoute.push({ travel_type: travelType, styles: this._getPolylineColor(res.transit_info.color) })
            else subRoute.push({travel_type: travelType})
          }

          lastTravelType = travelType;
        }

        //add coords length to indices array
        transitIndices.push(coords.length);

        //logic to create the subsets of the polyline by indexing into the shape
        var index_marker = 0;
        for(var index = 0; index < transitIndices.length; index++) {
          var subRouteArr = [];
          var overwrapping = 0;
          //if index != the last indice, we want to overwrap (or add 1) so that routes connect
          if(index !== transitIndices.length-1) overwrapping = 1;
          for (var ti = index_marker; ti < transitIndices[index] + overwrapping; ti++){
            subRouteArr.push(coords[ti]);
          }

          var temp_array = subRouteArr;
          index_marker = transitIndices[index];
          subRoute[index].coordinates = temp_array;
        }
      }
      return subRoute;
    },

    _getPolylineColor: function(intColor) {

      // isolate red, green, and blue components
      var red = (intColor >> 16) & 0xff,
          green = (intColor >> 8) & 0xff,
          blue = (intColor >> 0) & 0xff;

      // calculate luminance in YUV colorspace based on
      // https://en.wikipedia.org/wiki/YUV#Conversion_to.2Ffrom_RGB
      var lum = 0.299 * red + 0.587 * green + 0.114 * blue,
          is_light = (lum > 0xbb);

      // generate a CSS color string like 'RRGGBB'
      var paddedHex = 0x1000000 | (intColor & 0xffffff),
          lineColor = paddedHex.toString(16).substring(1, 7);

      var polylineColor = [
            // Color of outline depending on luminance against background.
            (is_light ? {color: '#000', opacity: 0.8, weight: 8}
                      : {color: '#fff', opacity: 0.8, weight: 8}),
            // Color of the polyline subset.
            {color: '#'+lineColor.toUpperCase(), opacity: 1, weight: 6}
          ];

      return polylineColor;
   },

    _toWaypoints: function(inputWaypoints, vias) {
      var wps = [],
          i;
      for (i = 0; i < vias.length; i++) {
        var etcInfo = {};
        for (var key in vias[i]) {
          if(key !== 'lat' && key !== 'lon') {
            etcInfo[key] = vias[i][key];
          }
        }
        wps.push(new Waypoint(L.latLng([vias[i]["lat"],vias[i]["lon"]]),
                                    null,
                                    etcInfo));
      }
      return wps;
    },

    buildRouteUrl: function(waypoints, options) {
      var locs = [];

      for (var i = 0; i < waypoints.length; i++) {
        var loc = {
          lat: waypoints[i].latLng.lat,
          lon: waypoints[i].latLng.lng,
        }
        for (var key in waypoints[i].options) {
          if (waypoints[i].options[key]) loc[key] = waypoints[i].options[key];
        }
        locs.push(loc);
      }

      var paramsToPass = L.extend(options, { locations: locs });
      var params = JSON.stringify(paramsToPass);

      return this.options.serviceUrl + 'json=' +
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

    _convertInstructions: function(instructions) {
      var result = [],
          i,
          instr,
          type,
          driveDir;

      for (i = 0; i < instructions.length; i++) {
        instr = instructions[i];
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

})();
