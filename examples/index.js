L.Mapzen.apiKey = 'search-RH8pVLv';

var map = L.Mapzen.map('map', {
  tangramOptions: {
    scene: L.Mapzen.BasemapStyles.Zinc
  }

});

var locator = L.Mapzen.locator();
locator.addTo(map);

var control = L.routing.control({
  waypoints: [
    L.latLng(37.752, -122.418),
    L.latLng(37.779, -122.391)
  ],
  // You can get your own Mapzen turn-by-turn & search API key from the Mapzen developer portal (https://mapzen.com/developers/)
  geocoder: L.Control.Geocoder.mapzen(),
  reverseWaypoints: true,
  router: L.Routing.mapzen('valhalla-PVA4Y8g', {costing: 'auto'}),
  formatter: new L.Routing.mapzenFormatter(),
  summaryTemplate:'<div class="start">{name}</div><div class="info {costing}">{distance}, {time}</div>'
}).addTo(map);

L.Routing.errorControl(control).addTo(map);