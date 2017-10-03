var map = L.map('map');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);


var control = L.Routing.control({
  waypoints: [
    L.latLng(37.752, -122.418),
    L.latLng(37.779, -122.391)
  ],
  // You can get your own Mapzen turn-by-turn & search API key from the Mapzen developer portal (https://mapzen.com/developers/)
  geocoder: L.Control.Geocoder.mapzen('search-RH8pVLv'),
  fitSelectedRoutes: true,
  reverseWaypoints: true,
  router: L.Routing.mapzen('valhalla-PVA4Y8g', {costing: 'auto'}),
  formatter: new L.Routing.mapzenFormatter(),
  summaryTemplate:'<div class="route-info {costing}">{distance}, {time}</div>'
}).addTo(map);



L.Routing.errorControl(control).addTo(map);