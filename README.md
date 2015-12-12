Leaflet Routing Machine / Turn by Turn by Mapzen powered by Valhalla
============================================

Extends [Leaflet Routing Machine](https://github.com/perliedman/leaflet-routing-machine) with support for [Mapzen Turn by Turn](https://mapzen.com/projects/valhalla).

Mapzen Turn by Turn is a free, open-source routing service with dynamic run-time costing that lets you integrate automobile, bicycle, and pedestrian navigation into a web or mobile application. To use Mapzen Turn by Turn with the Leaflet Routing Machine, install the lrm-mapzen plug-in with npm and get your free API key from [mapzen.com/developers](http://mapzen.com/developers).

## How to use

As with the other LRM plug-ins, you can [download lrm-mapzen](https://mapzen.com/resources/lrm-valhalla-0.0.9.zip) and insert the JavaScript file into your page right after the line where it loads Leaflet Routing Machine:

```html
/* ... */
<script src="leaflet-routing-machine.js"></script>
<script src="lrm-mapzen.js"></script>
/* ... */
```

Also, include the stylesheet. This can replace the default `leaflet-routing-machine.css` provided by LRM, since the Mapzen plugin includes its own styles and icons.

```html
<link rel="stylesheet" href="leaflet.routing.mapzen.css">
```

Insert your [Mapzen Turn by Turn API key](https://mapzen.com/developers) and the routing mode (`auto`, `bicycle`, or `pedestrian`). (Note that no options are needed for `formatter`.)

```js
var map = L.map('map');

L.Routing.control({
  // [...] See MapzenTurn by Turn API documentation for other options
  router: L.Routing.mapzen('<my api key>', 'auto'),
  formatter: new L.Routing.Mapzen.Formatter()
}).addTo(map);
```

See the [Leaflet Routing Machine documentation](http://www.liedman.net/leaflet-routing-machine/tutorials/) and  [Mapzen Turn by Turn API documentation](https://mapzen.com/documentation/turn-by-turn/api-reference/) for more information.


If you want to include additional costing options to help define the the route and estimated time along the path, you can pass costing option object as one of router parameter. See the [Mapzen Turn by Turn API documentation](https://mapzen.com/documentation/turn-by-turn/api-reference/) for more information on the available options for each routing mode.

```js
L.Routing.control({
  router: L.Routing.mapzen('<my api key>', 'bicycle', {
        bicycle: {
        bicycle_type: "Road",
        cycling_speed: 17,
        use_roads: "0.1"
      }
    }),
  formatter: new L.Routing.Mapzen.Formatter(),
}).addTo(map);
```

## Using Mapzen Turn by Turn with npm and Browserify

Like other plug-ins, the Mapzen plug-in can be installed using npm instead of downloading the script manually:

```sh
npm install --save lrm-mapzen
```

Once the Mapzen plug-in is installed, update the router and formatter instances to tell the Leaflet Routing Machine to use Mapzen’s engine. 

```js
var L = require('leaflet');
require('leaflet-routing-machine');
require('lrm-mapzen');

var map = L.map('map');

L.Routing.control({
  router: L.Routing.mapzen('<my api key>', 'auto'),
  formatter: new L.Routing.Mapzen.Formatter()
}).addTo(map);
```


For `router`, insert your [Mapzen Turn by Turn API key](https://mapzen.com/developers) and the routing mode (such as `auto`, `bicycle`, or `pedestrian`); see the [Mapzen Turn by Turn API documentation](https://mapzen.com/documentation/turn-by-turn/api-reference/) for more information. (Note that no options are needed for `formatter`.)

You can also change the routing mode after the router is created. Say you had different transportation options on your map and wanted to change `transitmode` to `bicycle` when that button is clicked: 

```js
var rr = L.Routing.mapzen('<my api key>', 'auto');
[...]
bikeButton.onClick: function () {
  rr.route({transitmode: "bicycle"});
}
```

## Running a local example

If you want to run your lrm-mapzen plug-in locally for test and development purposes:

- Install lrm-mapzen through npm or [download the contents of the lrm-mapzen repo](https://github.com/mapzen/lrm-mapzen/archive/master.zip)
- get your API key from [mapzen.com/developers](https://mapzen.com/developers/)
- paste it into the example's index.js and choose the transportation mode (`auto`, `bicycle`, or `pedestrian`)
- start a local web server (such as `python -m SimpleHTTPServer` or the local server you prefer)
- go to `http://localhost:8000/examples` in your browser (all assets needed to run Mapzen are in the `/examples` folder)

