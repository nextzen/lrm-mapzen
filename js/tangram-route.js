L.Mapzen.apiKey ='vector-tiles-nccaBBc';

var map = L.Mapzen.map('map', {
  tangramOptions: {
    scene: L.Mapzen.BasemapStyles.Refill
  }
});


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


// Tangram Style objects;

var ants = {
  "base": "lines",
  "blend": "overlay",
  "texcoords": true,
  "animated": true,
  "shaders": {
    "blocks": {
      "color": "color.a = step(.5,fract(u_time-v_texcoord.y*.5));"
    }
  }
};

var routeStyle =  {
    "lines": {
      "color": "#f66",
      "order": 1000,
      "width": "10px"
    },
    "ants": {
      "color": [
        0,
        0.36,
        0.6
      ],
      "order": 300000,
      "width": "5px"
    }
};


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

    var routeSourceName = 'routes';

    scene.config.styles.ants = ants;
    scene.config.layers.routelayer = { 'data': { 'source': routeSourceName }, 'draw': routeStyle };

    scene.setDataSource(routeSourceName, {
      type: 'GeoJSON',
      data: routeObj
    });

    return L.Routing.mapzenLine(route, options);
  }
  control.route();
});

function flipped(coords) {
  var flipped = [];
  for (var i = 0; i < coords.length; i++) {
    var coord = [];
    coord.push(coords[i].lng);
    coord.push(coords[i].lat);
    flipped.push(coord);
  }
  return flipped;
}
