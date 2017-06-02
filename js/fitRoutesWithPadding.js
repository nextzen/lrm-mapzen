/* This example is to add a buffer to selected routes */

L.Mapzen.apiKey ='vector-tiles-nccaBBc';
var map = L.Mapzen.map('map', {
  tangramOptions: {
    scene: L.Mapzen.BasemapStyles.Refill
  }
});
var hashControl = new HashControl();

var routingData = {
  waypoints: [
    L.latLng(37.752, -122.418),
    L.latLng(37.779, -122.391)
  ],
  costing: 'auto'
}

map.setView([37.752, -122.418], 13);

L.Mapzen.hash({
  map: map
})

var control = L.Routing.control({
  routeLine: function (route, options) {
    var mapzenRouteLine = L.Routing.mapzenLine(route, options);
    return mapzenRouteLine;
  },
  waypoints: routingData.waypoints,
  // You can get your own Mapzen turn-by-turn & search API key from the Mapzen developer portal (https://mapzen.com/developers/)
  geocoder: L.Control.Geocoder.mapzen('search-RH8pVLv'),
  reverseWaypoints: true,
  router: L.Routing.mapzen('valhalla-PVA4Y8g', {costing: routingData.costing}),
  collapsible: true,
  fitSelectedRoutes: false, /* Turn off default behaviour */
  show: (map.getSize().x > 768)? true: false,
  formatter: new L.Routing.mapzenFormatter(),
  summaryTemplate:'<div class="start">{name}</div><div class="info {costing}">{distance}, {time}</div>'
}).addTo(map);

L.Routing.errorControl(control).addTo(map);

control.on('routesfound', function (route) {
  /* We turned off the default behaviour of routing machine, which fits start and destination point to the map without buffer */
  /* We are setting our desired behaviour here (adding topLeft[100,100] buffer, with bottomRight [100, 100] buffer) */
  var allRoutesCoords = [];
  /* Collecting all the result route coordinates */
  for (var i = 0, j = route.routes.length; i < j; i++) {
    for(var k = 0, l = route.routes[i].coordinates.length; k < l; k++) {
      allRoutesCoords.push(route.routes[i].coordinates[k]);
    }
  }

  var bounds = L.latLngBounds(allRoutesCoords);
  map.fitBounds(bounds, {
    paddingTopLeft: [100, 100],
    paddingBottomRight: [100, 100]
  });
});

// to show where waypoints are even if there is no routing data
control.on('routingerror', function () {
  var waypoints = control.getWaypoints();
  map.fitBounds([
    waypoints[0].latLng,
    waypoints[waypoints.length-1].latLng
  ]);
})
