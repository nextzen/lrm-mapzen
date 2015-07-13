var map = L.map('map',{
  inertia: false
});

// Using Tangram 
var layer = Tangram.leafletLayer({
  scene: 'scene.yaml',
        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
});
layer.addTo(map);

/*
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
*/
L.Routing.control({
	waypoints: [
		L.latLng(57.74, 11.94),
		L.latLng(57.6792, 11.949)
	],
  // you can get valhalla api key from Mapzen developer (https://mapzen.com/developers)
	router: L.Routing.valhalla('my-api-key','auto'),
  formatter: new L.Routing.Valhalla.Formatter(),
  summaryTemplate:'<div class="start">{name}</div><div class="info {transitmode}">{distance}, {time}</div>',
  routeWhileDragging: false
}).addTo(map);
