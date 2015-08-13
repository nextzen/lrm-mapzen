var map = L.map('map');

// Using Tangram 
var layer = Tangram.leafletLayer({
  scene: 'scene.yaml',
  attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
});
layer.addTo(map);


// You can also use normal OSM tiles instead of Tangram
// L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
//   attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);


L.Routing.control({
  waypoints: [
    L.latLng(36.4192141, -119.8706489),
    L.latLng(36.4156136, -119.849234)
  ],
  // You can get your own Valhalla API key from the Mapzen developer portal (https://mapzen.com/developers/)
  router: L.Routing.valhalla('<my api key>', 'bicycle'),

  formatter: new L.Routing.Valhalla.Formatter(),
  summaryTemplate:'<div class="start">{name}</div><div class="info {transitmode}">{distance}, {time}</div>',
  routeWhileDragging: false
}).addTo(map);
