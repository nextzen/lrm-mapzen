var demo = {
  costing: 'multimodal',
  date_time: {
    type: 1, //depart at
    value: getNextTuesday() + 'T08:00' // Turn-by-turn supports depart time for transit routing. For demo we wanted to be consistent and always use Next Tuesday at 8am
  }
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

var map = L.map('map');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

var locator = L.Mapzen.locator();
locator.addTo(map);

var control = L.Routing.control({
  waypoints: [
    L.latLng(37.752, -122.418),
    L.latLng(37.779, -122.391)
  ],
  // You can get your own Mapzen turn-by-turn & search API key from the Mapzen developer portal (https://mapzen.com/developers/)
  geocoder: L.Control.Geocoder.mapzen('search-RH8pVLv'),
  reverseWaypoints: true,
  router: L.Routing.mapzen('valhalla-PVA4Y8g', demo),
  formatter: L.Routing.mapzenFormatter(),
  routeLine: function (route, options) { return L.Routing.mapzenLine(route, options); },
  summaryTemplate:'<div class="route-info {costing}">{distance}, {time}</div>'
}).addTo(map);

L.Mapzen.hash({
  map: map
})