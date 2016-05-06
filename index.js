var map = L.map('map');


if (hasWebGL()) {
  // use Tangram to draw tiles when there is WebGL available on the browser
  var layer = Tangram.leafletLayer({
    scene: 'https://cdn.rawgit.com/tangrams/refill-style/gh-pages/refill-style.yaml',
    attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
  });
  layer.addTo(map);
} else {
  // Use normal OSM tiles instead of Tangram when there is no webgl available
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
   }).addTo(map);
}


// detect webgl on browser for Tangram
function hasWebGL() {
  try {
    var canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (x) {
    return false;
  }
}

var control = L.Routing.control({
  routeLine: function (route, options) { return L.Routing.mapzenLine(route, options); },
  waypoints: [
    L.latLng(37.752, -122.418),
    L.latLng(37.779, -122.391)
  ],
  // You can get your own Mapzen turn-by-turn & search API key from the Mapzen developer portal (https://mapzen.com/developers/)
  geocoder: L.Control.Geocoder.mapzen('search-RH8pVLv'),
  reverseWaypoints: true,
  router: L.Routing.mapzen('valhalla-PVA4Y8g', {costing: 'auto'}),
  formatter: new L.Routing.mapzenFormatter(),
  summaryTemplate:'<div class="start">{name}</div><div class="info {costing}">{distance}, {time}</div>'
}).addTo(map);

L.Routing.errorControl(control).addTo(map);

// Adding easy button for UI

L.easyButton('btn-auto', function(btn, map){
  control.getRouter().options.costing = 'auto';
  control.route();
}).addTo(map);

L.easyButton('btn-bicycle', function(btn, map){
  control.getRouter().options.costing = 'bicycle';
  control.route();
}).addTo(map);

L.easyButton('btn-pedestrian', function(btn, map){
  control.getRouter().options.costing = 'pedestrian';
  control.route();
}).addTo(map);

L.easyButton('btn-multimodal', function(btn, map){
  control.getRouter().options.costing = 'multimodal';
  control.route();
}).addTo(map);