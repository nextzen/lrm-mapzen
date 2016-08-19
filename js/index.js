var map = L.Mapzen.map('map', {
  scene: L.Mapzen.BasemapStyles.Refill
});

var hashControl = new HashControl();

var routingData = {
  waypoints: [
    L.latLng(37.752, -122.418),
    L.latLng(37.779, -122.391)
  ],
  costing: 'auto'
}


// read searchquery and set up hash if there is none
// you can ignore this part if you are not planning to setup search query for your page
var hashVal = hashControl.read()
if( hashVal !== null) {
  var wps = [];
  for(var key in hashVal) {
    if(key.startsWith('point')) {
      var idx = parseInt(key.charAt(5));
      var kind = key.slice(6,9);
      if(wps[idx] === undefined) wps[idx] = L.latLng(0,0);
      wps[idx][kind] = hashVal[key];
    }
  }

  var mode = hashVal.mode;

  routingData.waypoints = wps;
  routingData.costing = mode;

} else {
  // when there was no hash set yet
  hashControl.set({
    point0lat: routingData.waypoints[0].lat,
    point0lng: routingData.waypoints[0].lng,
    point1lat: routingData.waypoints[1].lat,
    point1lng: routingData.waypoints[1].lng,
    mode: routingData.costing
  })
}

var control = L.Routing.control({
  routeLine: function (route, options) { return L.Routing.mapzenLine(route, options); },
  waypoints: routingData.waypoints,
  // You can get your own Mapzen turn-by-turn & search API key from the Mapzen developer portal (https://mapzen.com/developers/)
  geocoder: L.Control.Geocoder.mapzen('search-RH8pVLv'),
  reverseWaypoints: true,
  router: L.Routing.mapzen('valhalla-PVA4Y8g', {costing: routingData.costing}),
  collapsible: true,
  show: (map.getSize().x > 768)? true: false,
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


// change hash value whenever new routing starts
// you can ignore this part if you are not planning to setup search query for your page
control.on('routingstart', function () {
  var waypoints = control.getWaypoints();
  var mode = control.getRouter().options.costing;
  var newHashData = {}
  for(var i in waypoints) {
    var latKeyName = 'point' + i + 'lat';
    var lngKeyName = 'point' + i + 'lng';
    newHashData[latKeyName] = parseFloat(waypoints[i].latLng.lat).toFixed(4);
    newHashData[lngKeyName] = parseFloat(waypoints[i].latLng.lng).toFixed(4);
  }
  newHashData['mode'] = mode;
  hashControl.set(newHashData);
})

// to show where waypoints are even if there is no routing data
control.on('routingerror', function () {
  var waypoints = control.getWaypoints();
  map.fitBounds([
    waypoints[0].latLng,
    waypoints[waypoints.length-1].latLng
  ]);
})
