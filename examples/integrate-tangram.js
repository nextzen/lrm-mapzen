var map = TangramLayer.map

var demo = {
  costing: 'auto'
}

/**
 * Returns a string of next Tuesday's date based
 * on the current day of the week.  If today is Tuesday,
 * then we use the following Tuesday's date.
 *
 * @returns {string} in format of 'YYYY-MM-DD'
 */
function getNextTuesday () {
  var today = new Date(), day, tuesday;
  day = today.getDay();
  tuesday = today.getDate() - day + (day === 0 ? -6 : 2);
  tuesday += 7;
  today.setDate(tuesday);
  return today.toISOString().split('T')[0];
}

var control = L.Routing.control({
  routeLine: function (route, options) { return L.Routing.mapzenLine(route, options); },
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



L.easyButton('btn-tangram', function(btn, map) {
  control.options.lineOptions = {
    styles:[{ color: 'white', opacity: 0.01, weight: 9 }],
    useTangram: true
  }
  control.route();
}).addTo(map);
