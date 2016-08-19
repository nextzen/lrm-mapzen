var map = L.Mapzen.map('map', {
  scene: './js/route-scene.yaml'
})



var demo = {
  costing: 'auto'
}
var tangramLoaded = false;

var control = L.Routing.control({
  routeLine: function (route, options) { return L.Routing.mapzenLine(route, options);},
  // Draw SVG route before Tangram's scene gets loaded
  lineOptions: {
    styles: [{ color: '#f66', opacity: 0.8, weight: 9 }]
  },
  waypoints: [
    L.latLng(37.752, -122.418),
    L.latLng(37.779, -122.391)
  ],
  // You can get your own Mapzen turn-by-turn & search API key from the Mapzen developer portal (https://mapzen.com/developers/)
  geocoder: L.Control.Geocoder.mapzen('search-RH8pVLv'),
  reverseWaypoints: true,
  router: L.Routing.mapzen('valhalla-PVA4Y8g', demo),
  formatter: new L.Routing.mapzenFormatter(),
  summaryTemplate:'<div class="start">{name}</div><div class="info {costing}">{distance}, {time}</div>'
}).addTo(map);

L.Routing.errorControl(control).addTo(map);


map.on('tangramloaded', function (e) {
  var layer = e.tangramLayer;
  var scene = e.tangramLayer.scene;

  control.options.routeLine = function(route, options) {
    // Make SVG Line (almost) transparent
    // So that Tangram layer takes visual priority
    options.styles = {
      styles: [{ color: 'white', opacity: 0.01, weight: 9 }]
    };

    var coordinatesGeojson= {
      type: 'LineString',
      coordinates: flipped(route.coordinates)
    };

    var routeSource = {};
    routeSource.type = "FeatureCollection";
    routeSource.features = [];
    routeSource.features.push({
      type: "Feature",
      properties: {},
      geometry: coordinatesGeojson
    });

    var routeObj = {
      "routelayer": routeSource
    }

    scene.setDataSource('routes', {
      type: 'GeoJSON',
      data: routeObj
    });
    console.log("scene after process")
    console.log(scene);
    return L.Routing.mapzenLine(route, options);
  }

});


// scene.subscribe({
//   view_complete: function () {

//     if (!tangramLoaded) {

//       control.options.routeLine = function(route, options) {
//         // Make SVG Line (almost) transparent
//         // So that Tangram layer takes visual priority
//         options.styles = {
//           styles: [{ color: 'white', opacity: 0.01, weight: 9 }]
//         };

//         var coordinatesGeojson= {
//           type: 'LineString',
//           coordinates: flipped(route.coordinates)
//         };

//         var routeSource = {};
//         routeSource.type = "FeatureCollection";
//         routeSource.features = [];
//         routeSource.features.push({
//           type: "Feature",
//           properties: {},
//           geometry: coordinatesGeojson
//         });

//         var routeObj = {
//           "routelayer": routeSource
//         }

//         scene.setDataSource('routes', {
//           type: 'GeoJSON',
//           data: routeObj
//         });

//         return L.Routing.mapzenLine(route, options);
//       }
//       control.route();
//       tangramLoaded = true;
//     }
//   }
// });


function flipped(coords) {
  var flipped = [];
  for (var i = 0; i < coords.length; i++) {
    flipped.push(coords[i].slice().reverse());
  }
  return flipped;
}
