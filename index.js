var map = L.map('map');

console.log(webgl_support());
if(webgl_support() == null){

  //in case browser doesn't support webgl
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);


}else{

  //using Tangram for map rendering. About Tangram : https://mapzen.com/projects/tangram
var layer = Tangram.leafletLayer({
  scene: 'resource/scene.yaml',
        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
});
layer.addTo(map);

}

L.Routing.control({
  waypoints: [
    L.latLng(57.74, 11.94),
    L.latLng(57.6792, 11.949)
  ],
  // you can get valhalla api key at https://mapzen.com/developers
  router: L.Routing.valhalla('valhalla-lyk3MNE','auto'),
  formatter: new L.Routing.Valhalla.Formatter(),
  summaryTemplate:'<div class="start">{name}</div><div class="info {transitmode}">{distance}, {time}</div>',
  routeWhileDragging: false
}).addTo(map);


function webgl_support() { 
   try{
    var canvas = document.createElement( 'canvas' ); 
    return !! window.WebGLRenderingContext && ( 
         canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) );
   }catch( e ) { return false; } 
 };