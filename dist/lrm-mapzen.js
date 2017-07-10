(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function corslite(url, callback, cors) {
    var sent = false;

    if (typeof window.XMLHttpRequest === 'undefined') {
        return callback(Error('Browser not supported'));
    }

    if (typeof cors === 'undefined') {
        var m = url.match(/^\s*https?:\/\/[^\/]*/);
        cors = m && (m[0] !== location.protocol + '//' + location.hostname +
                (location.port ? ':' + location.port : ''));
    }

    var x = new window.XMLHttpRequest();

    function isSuccessful(status) {
        return status >= 200 && status < 300 || status === 304;
    }

    if (cors && !('withCredentials' in x)) {
        // IE8-9
        x = new window.XDomainRequest();

        // Ensure callback is never called synchronously, i.e., before
        // x.send() returns (this has been observed in the wild).
        // See https://github.com/mapbox/mapbox.js/issues/472
        var original = callback;
        callback = function() {
            if (sent) {
                original.apply(this, arguments);
            } else {
                var that = this, args = arguments;
                setTimeout(function() {
                    original.apply(that, args);
                }, 0);
            }
        }
    }

    function loaded() {
        if (
            // XDomainRequest
            x.status === undefined ||
            // modern browsers
            isSuccessful(x.status)) callback.call(x, null, x);
        else callback.call(x, x, null);
    }

    // Both `onreadystatechange` and `onload` can fire. `onreadystatechange`
    // has [been supported for longer](http://stackoverflow.com/a/9181508/229001).
    if ('onload' in x) {
        x.onload = loaded;
    } else {
        x.onreadystatechange = function readystate() {
            if (x.readyState === 4) {
                loaded();
            }
        };
    }

    // Call the callback with the XMLHttpRequest object as an error and prevent
    // it from ever being called again by reassigning it to `noop`
    x.onerror = function error(evt) {
        // XDomainRequest provides no evt parameter
        callback.call(this, evt || true, null);
        callback = function() { };
    };

    // IE9 must have onprogress be set to a unique function.
    x.onprogress = function() { };

    x.ontimeout = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    x.onabort = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    // GET is the only supported HTTP Verb by XDomainRequest and is the
    // only one supported here.
    x.open('GET', url, true);

    // Send the request. Sending data is not supported.
    x.send(null);
    sent = true;

    return x;
}

if (typeof module !== 'undefined') module.exports = corslite;

},{}],2:[function(require,module,exports){
'use strict';

/**
 * Based off of [the offical Google document](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
 *
 * Some parts from [this implementation](http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/PolylineEncoder.js)
 * by [Mark McClure](http://facstaff.unca.edu/mcmcclur/)
 *
 * @module polyline
 */

var polyline = {};

function py2_round(value) {
    // Google's polyline algorithm uses the same rounding strategy as Python 2, which is different from JS for negative values
    return Math.floor(Math.abs(value) + 0.5) * Math.sign(value);
}

function encode(current, previous, factor) {
    current = py2_round(current * factor);
    previous = py2_round(previous * factor);
    var coordinate = current - previous;
    coordinate <<= 1;
    if (current - previous < 0) {
        coordinate = ~coordinate;
    }
    var output = '';
    while (coordinate >= 0x20) {
        output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 63);
        coordinate >>= 5;
    }
    output += String.fromCharCode(coordinate + 63);
    return output;
}

/**
 * Decodes to a [latitude, longitude] coordinates array.
 *
 * This is adapted from the implementation in Project-OSRM.
 *
 * @param {String} str
 * @param {Number} precision
 * @returns {Array}
 *
 * @see https://github.com/Project-OSRM/osrm-frontend/blob/master/WebContent/routing/OSRM.RoutingGeometry.js
 */
polyline.decode = function(str, precision) {
    var index = 0,
        lat = 0,
        lng = 0,
        coordinates = [],
        shift = 0,
        result = 0,
        byte = null,
        latitude_change,
        longitude_change,
        factor = Math.pow(10, precision || 5);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decoded.
    while (index < str.length) {

        // Reset shift, result, and byte
        byte = null;
        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        shift = result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
};

/**
 * Encodes the given [latitude, longitude] coordinates array.
 *
 * @param {Array.<Array.<Number>>} coordinates
 * @param {Number} precision
 * @returns {String}
 */
polyline.encode = function(coordinates, precision) {
    if (!coordinates.length) { return ''; }

    var factor = Math.pow(10, precision || 5),
        output = encode(coordinates[0][0], 0, factor) + encode(coordinates[0][1], 0, factor);

    for (var i = 1; i < coordinates.length; i++) {
        var a = coordinates[i], b = coordinates[i - 1];
        output += encode(a[0], b[0], factor);
        output += encode(a[1], b[1], factor);
    }

    return output;
};

function flipped(coords) {
    var flipped = [];
    for (var i = 0; i < coords.length; i++) {
        flipped.push(coords[i].slice().reverse());
    }
    return flipped;
}

/**
 * Encodes a GeoJSON LineString feature/geometry.
 *
 * @param {Object} geojson
 * @param {Number} precision
 * @returns {String}
 */
polyline.fromGeoJSON = function(geojson, precision) {
    if (geojson && geojson.type === 'Feature') {
        geojson = geojson.geometry;
    }
    if (!geojson || geojson.type !== 'LineString') {
        throw new Error('Input must be a GeoJSON LineString');
    }
    return polyline.encode(flipped(geojson.coordinates), precision);
};

/**
 * Decodes to a GeoJSON LineString geometry.
 *
 * @param {String} str
 * @param {Number} precision
 * @returns {Object}
 */
polyline.toGeoJSON = function(str, precision) {
    var coords = polyline.decode(str, precision);
    return {
        type: 'LineString',
        coordinates: flipped(coords)
    };
};

if (typeof module === 'object' && module.exports) {
    module.exports = polyline;
}

},{}],3:[function(require,module,exports){
(function (global){
var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);
var MapzenRouter = require('./mapzenRouter');
var MapzenLine = require('./mapzenLine');
var MapzenFormatter = require('./mapzenFormatter');
var MapzenWaypoint = require('./mapzenWaypoint');

L.Routing = L.Routing || {};
L.routing = L.routing || {};

L.Routing.Mapzen = MapzenRouter;
L.Routing.MapzenLine = MapzenLine;
L.Routing.MapzenFormatter = MapzenFormatter;
L.Routing.MapzenWaypoint = MapzenWaypoint;


L.routing.mapzen = function(key, options) {
  return new MapzenRouter(key, options);
}

L.routing.mapzenLine = function(route, options) {
  return new MapzenLine(route, options);
}

L.routing.mapzenFormatter = function(options) {
  return new MapzenFormatter(options);
}

L.routing.mapzenWaypoint = function(latLng, name, options) {
  return new MapzenWaypoint(latLng, name, options);
}

// deperecate these parts later

L.Routing.mapzen = L.routing.mapzen;
L.Routing.mapzenLine = L.routing.mapzenLine;
L.Routing.mapzenFormatter = L.routing.mapzenFormatter;
L.Routing.mapzenWaypoint = L.routing.mapzenWaypoint;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mapzenFormatter":4,"./mapzenLine":5,"./mapzenRouter":6,"./mapzenWaypoint":7}],4:[function(require,module,exports){
(function (global){
(function() {
  'use strict';

  var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

  //L.extend(L.Routing, require('./L.Routing.Localization'));
  module.exports = L.Class.extend({
    options: {
      units: 'metric',
      unitNames: {
        meters: 'm',
        kilometers: 'km',
        yards: 'yd',
        miles: 'mi',
        hours: 'h',
        minutes: 'mín',
        seconds: 's'
      },
      language: 'en',
      roundingSensitivity: 1,
      distanceTemplate: '{value} {unit}'
    },

    initialize: function(options) {
      L.setOptions(this, options);
    },

    formatDistance: function(d /* Number (meters) */) {
      var un = this.options.unitNames,
          v,
        data;
      if (this.options.units === 'imperial') {
        //valhalla returns distance in km
        d  = d * 1000;
        d = d / 1.609344;
        if (d >= 1000) {
          data = {
            value: (this._round(d) / 1000),
            unit: un.miles
          };
        } else {
          data = {
            value: this._round(d / 1.760),
            unit: un.yards
          };
        }
      } else {
        v = d;
        data = {
          value: v >= 1 ? v: v*1000,
          unit: v >= 1 ? un.kilometers : un.meters
        };
      }

       return L.Util.template(this.options.distanceTemplate, data);
    },

    _round: function(d) {
      var pow10 = Math.pow(10, (Math.floor(d / this.options.roundingSensitivity) + '').length - 1),
        r = Math.floor(d / pow10),
        p = (r > 5) ? pow10 : pow10 / 2;

      return Math.round(d / p) * p;
    },

    formatTime: function(t /* Number (seconds) */) {
      if (t > 86400) {
        return Math.round(t / 3600) + ' h';
      } else if (t > 3600) {
        return Math.floor(t / 3600) + ' h ' +
          Math.round((t % 3600) / 60) + ' min';
      } else if (t > 300) {
        return Math.round(t / 60) + ' min';
      } else if (t > 60) {
        return Math.floor(t / 60) + ' min' +
          (t % 60 !== 0 ? ' ' + (t % 60) + ' s' : '');
      } else {
        return t + ' s';
      }
    },

    formatInstruction: function(instr, i) {
      // Valhalla returns instructions itself.
      return instr.instruction;
    },

    getIconName: function(instr, i) {
      // you can find all Valhalla's direction types at https://github.com/valhalla/odin/blob/master/proto/tripdirections.proto
      switch (instr.type) {
        case 0:
          return 'kNone';
        case 1:
          return 'kStart';
        case 2:
          return 'kStartRight';
        case 3:
          return 'kStartLeft';
        case 4:
          return 'kDestination';
        case 5:
          return 'kDestinationRight';
        case 6:
          return 'kDestinationLeft';
        case 7:
          return 'kBecomes';
        case 8:
          return 'kContinue';
        case 9:
          return 'kSlightRight';
        case 10:
          return 'kRight';
        case 11:
          return 'kSharpRight';
        case 12:
          return 'kUturnRight';
        case 13:
          return 'kUturnLeft';
        case 14:
          return 'kSharpLeft';
        case 15:
          return 'kLeft';
        case 16:
          return 'kSlightLeft';
        case 17:
          return 'kRampStraight';
        case 18:
          return 'kRampRight';
        case 19:
          return 'kRampLeft';
        case 20:
          return 'kExitRight';
        case 21:
          return 'kExitLeft';
        case 22:
          return 'kStayStraight';
        case 23:
          return 'kStayRight';
        case 24:
          return 'kStayLeft';
        case 25:
          return 'kMerge';
        case 26:
          return 'kRoundaboutEnter';
        case 27:
          return 'kRoundaboutExit';
        case 28:
          return 'kFerryEnter';
        case 29:
          return 'kFerryExit';
        // lrm-mapzen unifies transit commands and give them same icons
        case 30:
        case 31: //'kTransitTransfer'
        case 32: //'kTransitRemainOn'
        case 33: //'kTransitConnectionStart'
        case 34: //'kTransitConnectionTransfer'
        case 35: //'kTransitConnectionDestination'
        case 36: //'kTransitConnectionDestination'
          if (instr.edited_travel_type) return 'kTransit' + this._getCapitalizedName(instr.edited_travel_type);
          else return 'kTransit';
      }
    },

    _getInstructionTemplate: function(instr, i) {
      return instr.instruction + " " +instr.length;
    },
    _getCapitalizedName: function(name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  });

})();
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

	module.exports = L.LayerGroup.extend({
		includes: L.Mixin.Events,

		options: {
			styles: [
				{color: 'white', opacity: 0.8, weight: 8},
				{color: '#06a6d4', opacity: 1, weight: 6}
			],
			missingRouteStyles: [
				{color: 'black', opacity: 0.15, weight: 8},
				{color: 'white', opacity: 0.6, weight: 6},
				{color: 'gray', opacity: 0.8, weight: 4, dashArray: '7,12'}
			],
			addWaypoints: true,
			extendToWaypoints: true,
			missingRouteTolerance: 10
		},

		initialize: function(route, options) {
			L.setOptions(this, options);
			L.LayerGroup.prototype.initialize.call(this, options);
			this._route = route;

			if (this.options.extendToWaypoints) {
				this._extendToWaypoints();
			}

			if (route.subRoutes) {
				for(var i = 0; i < route.subRoutes.length; i++) {
					if(!route.subRoutes[i].styles) route.subRoutes[i].styles = this.options.styles;
					this._addSegment(
						route.subRoutes[i].coordinates,
						route.subRoutes[i].styles,
						this.options.addWaypoints);
				}
			} else {
			 this._addSegment(
			 	route.coordinates,
			 	this.options.styles,
			 	this.options.addWaypoints);
			}
		},

		addTo: function(map) {
			map.addLayer(this);
			return this;
		},
		getBounds: function() {
			return L.latLngBounds(this._route.coordinates);
		},

		_findWaypointIndices: function() {
			var wps = this._route.inputWaypoints,
			    indices = [],
			    i;
			for (i = 0; i < wps.length; i++) {
				indices.push(this._findClosestRoutePoint(wps[i].latLng));
			}

			return indices;
		},

		_findClosestRoutePoint: function(latlng) {
			var minDist = Number.MAX_VALUE,
				minIndex,
			    i,
			    d;

			for (i = this._route.coordinates.length - 1; i >= 0 ; i--) {
				// TODO: maybe do this in pixel space instead?
				d = latlng.distanceTo(this._route.coordinates[i]);
				if (d < minDist) {
					minIndex = i;
					minDist = d;
				}
			}

			return minIndex;
		},

		_extendToWaypoints: function() {
			var wps = this._route.inputWaypoints,
				wpIndices = this._getWaypointIndices(),
			    i,
			    wpLatLng,
			    routeCoord;

			for (i = 0; i < wps.length; i++) {
				wpLatLng = wps[i].latLng;
				routeCoord = L.latLng(this._route.coordinates[wpIndices[i]]);
				if (wpLatLng.distanceTo(routeCoord) >
					this.options.missingRouteTolerance) {
					this._addSegment([wpLatLng, routeCoord],
						this.options.missingRouteStyles);
				}
			}
		},

		_addSegment: function(coords, styles, mouselistener) {
			var i,
				pl;
			for (i = 0; i < styles.length; i++) {
				pl = L.polyline(coords, styles[i]);
				this.addLayer(pl);
				if (mouselistener) {
					pl.on('mousedown', this._onLineTouched, this);
				}
			}
		},

		_findNearestWpBefore: function(i) {
			var wpIndices = this._getWaypointIndices(),
				j = wpIndices.length - 1;
			while (j >= 0 && wpIndices[j] > i) {
				j--;
			}

			return j;
		},

		_onLineTouched: function(e) {
			var afterIndex = this._findNearestWpBefore(this._findClosestRoutePoint(e.latlng));
			this.fire('linetouched', {
				afterIndex: afterIndex,
				latlng: e.latlng
			});
		},

		_getWaypointIndices: function() {
			if (!this._wpIndices) {
				this._wpIndices = this._route.waypointIndices || this._findWaypointIndices();
			}

			return this._wpIndices;
		}
	});

})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (global){
(function() {
  'use strict';

  var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mapzenWaypoint":7,"@mapbox/corslite":1,"@mapbox/polyline":2}],7:[function(require,module,exports){
(function (global){
(function() {
  'use strict';

  var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

  module.exports = L.Class.extend({
    options: {
    // lrm-mapzen passes these options of locations to the request call
    // to see more options https://mapzen.com/documentation/mobility/turn-by-turn/api-reference/#locations
      type: null, // 'break' or 'through'. If no type is provided, the type is assumed to be a break.
      name: null,
      haeding: null,
      heading_tolerance: null,
      street: null,
      way_id: null,
      minimum_reachability: null,
      radius: null
    },
    initialize: function(latLng, name, options) {
      L.Util.setOptions(this, options);
      this.latLng = L.latLng(latLng);
      this.name = name;
    }
  });
})();
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[3,4,5,6,7]);
