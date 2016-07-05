var TangramLayer = (function () {

  var layer;
  var map;

  var startMap = function () {
     map = L.map('map');
  }

  var startLayer = function () {
    if (hasWebGL()) {
      // use Tangram to draw tiles when there is WebGL available on the browser
      layer = Tangram.leafletLayer({
        scene: './js/route-scene.yaml',
        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
      });
      layer.addTo(map);
    } else {
      // Use normal OSM tiles instead of Tangram when there is no webgl available
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
         attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
       }).addTo(map);
    }
  }

  // detect webgl on browser for Tangram
  var hasWebGL = function () {
    try {
      var canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (x) {
      return false;
    }
  }

  startMap();
  startLayer();

  return {
    layer: layer,
    map: map
  }

})();