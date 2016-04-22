# Extend Leaflet Routing Machine with Mapzen Turn-by-Turn routing

LRM-Mapzen extends [Leaflet Routing Machine](https://github.com/perliedman/leaflet-routing-machine) with support for the [Mapzen Turn-by-Turn](https://mapzen.com/projects/valhalla) routing service.

Mapzen Turn-by-Turn is an open-source routing service with dynamic run-time costing that lets you integrate automobile, bicycle, and pedestrian navigation into a web or mobile application. To use Mapzen Turn-by-Turn with the Leaflet Routing Machine, install the lrm-mapzen plug-in and obtain an API key from [mapzen.com/developers](http://mapzen.com/developers).

Use this plug-in to create a map that has a route line between map locations (also known as waypoints), a text narrative of maneuvers to perform on the route, distances along your route and estimated travel times, and the ability to drag the route start and endpoints to get a different path. Mapzen Turn-by-Turn is substituted for the default routing service used in Leaflet Routing Machine.

## Get started with LRM-Mapzen

Follow along with [this tutorial](https://mapzen.com/documentation/turn-by-turn/add-routing-to-a-map/) to build a map with LRM-Mapzen.

[Download lrm-mapzen](http://mapzen.com/resources/lrm-mapzen-0.1.2.zip) and insert a reference to the JavaScript file into your page right after the line where it loads Leaflet Routing Machine:

```html
[...]
<script src="leaflet-routing-machine.js"></script>
<script src="lrm-mapzen.js"></script>
[...]
```

Also, include the stylesheet. This can replace the default `leaflet-routing-machine.css` provided by LRM, since the Mapzen plugin includes its own styles and icons.

```html
<link rel="stylesheet" href="leaflet.routing.mapzen.css">
```

Insert your [Mapzen Turn-by-Turn API key](https://mapzen.com/developers) for the placeholder text (valhalla-xxxxxx) and the routing mode (`auto`, `bicycle`, or `pedestrian`). (Note that no options are needed for `formatter`.)

```js
var map = L.map('map');

L.Routing.control({
  // [...] See MapzenTurn-by-Turn API documentation for other options
  router: L.Routing.mapzen('valhalla-xxxxxx', 'auto'),
  formatter: new L.Routing.Mapzen.Formatter()
}).addTo(map);
```

If you want to include additional costing options to help define the the route and estimated time along the path, you can pass a costing option object as one of router parameters. See the [Mapzen Turn-by-Turn API documentation](https://mapzen.com/documentation/turn-by-turn/api-reference/) for more information on the available options for each routing mode.

```js
L.Routing.control({
  router: L.Routing.mapzen('valhalla-xxxxxx', 'bicycle', {
        bicycle: {
        bicycle_type: "Road",
        cycling_speed: 17,
        use_roads: "0.1"
      }
    }),
  formatter: new L.Routing.Mapzen.Formatter(),
}).addTo(map);
```

See the [Leaflet Routing Machine documentation](http://www.liedman.net/leaflet-routing-machine/tutorials/) and [Mapzen Turn-by-Turn API documentation](https://mapzen.com/documentation/turn-by-turn/api-reference/) for more information.

## Use Mapzen Turn-by-Turn with npm and Browserify

The Mapzen plug-in can be installed using npm instead of downloading the script manually:

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
  router: L.Routing.mapzen('valhalla-xxxxxx', 'auto'),
  formatter: new L.Routing.Mapzen.Formatter()
}).addTo(map);
```

For `router`, insert your [Mapzen Turn-by-Turn API key](https://mapzen.com/developers) and the routing mode (such as `auto`, `bicycle`, or `pedestrian`); see the [Mapzen Turn-by-Turn API documentation](https://mapzen.com/documentation/turn-by-turn/api-reference/) for more information. (Note that no options are needed for `formatter`.)

You can also change the routing mode after the router is created. Say you had different transportation options on your map and wanted to change `transitmode` to `bicycle` when that button is clicked:

```js
var rr = L.Routing.mapzen('valhalla-xxxxxx', 'auto');
[...]
bikeButton.onClick: function () {
  rr.route({transitmode: "bicycle"});
}
```

## Run a local example

If you want to run your lrm-mapzen plug-in locally for testing and development purposes:

- Install lrm-mapzen through npm or [download the contents of the lrm-mapzen repo](https://github.com/mapzen/lrm-mapzen/archive/master.zip)
- Get your API key from [mapzen.com/developers](https://mapzen.com/developers/)
- Paste it into the example's index.js and choose the transportation mode (`auto`, `bicycle`, or `pedestrian`)
- Start a local web server (such as `python -m SimpleHTTPServer` or the local server you prefer)
- Go to `http://localhost:8000/examples` in your browser (all assets needed to run Mapzen are in the `/examples` folder)
