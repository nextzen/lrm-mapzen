var L = require('leaflet');
var MapzenRouter = require('./mapzenRouter');
var MapzenLine = require('./mapzenLine');
var MapzenFormatter = require('./mapzenFormatter');

L.Routing = L.Routing || {};
L.routing = L.routing || {};

L.Routing.Mapzen = MapzenRouter;
L.Routing.MapzenLine = MapzenLine;
L.Routing.MapzenFormatter = MapzenFormatter;


L.routing.mapzen = function(key, options) {
  return new MapzenRouter(key, options);
}

L.routing.mapzenLine = function(route, options) {
  return new MapzenLine(route, options);
}

L.routing.mapzenFormatter = function(options) {
  return new MapzenFormatter(options);
}

// deperecate these parts later

L.Routing.mapzen = L.routing.mapzen;
L.Routing.mapzenLine = L.routing.mapzenLine;
L.Routing.mapzenFormatter = L.routing.mapzenFormatter;