[![npm version](https://img.shields.io/npm/v/lrm-mapzen.svg?style=flat-square)](https://www.npmjs.com/package/lrm-mapzen)
# Add support for Mapzen Turn-by-Turn routing in Leaflet Routing Machine

Mapzen Turn-by-Turn is an open-source routing service with dynamic run-time costing that lets you integrate automobile, bicycle, pedestrian, or multimodal navigation into a web or mobile application.

Use this plug-in to create a Leaflet map that has a route line between map locations (also known as waypoints), a text narrative of maneuvers to perform on the route, distances along your route and estimated travel times, and the ability to drag the route start and endpoints to get a different path.

With lrm-mapzen, Mapzen Turn-by-Turn is substituted for the default routing service used in Leaflet Routing Machine. You need to install the lrm-mapzen plug-in and obtain an API key from [mapzen.com/developers](http://mapzen.com/developers).

## Get started with lrm-mapzen

Follow along with [this tutorial](https://mapzen.com/documentation/turn-by-turn/add-routing-to-a-map/) to build a map with lrm-mapzen.

[Download lrm-mapzen](http://mapzen.com/resources/lrm-mapzen.zip) and insert a reference to the JavaScript file into your page right after the line where it loads Leaflet Routing Machine:

```html
[...]
<script src="leaflet-routing-machine.js"></script>
<script src="lrm-mapzen.js"></script>
[...]
```

Also, include the stylesheet. This can replace the default `leaflet-routing-machine.css` provided by LRM, since the Mapzen plug-in includes its own styles and icons.

```html
<link rel="stylesheet" href="leaflet.routing.mapzen.css">
```

Insert your [Mapzen API key](https://mapzen.com/developers) for the placeholder text (mapzen-xxxxxx) and a routing options object to at least include the costing mode (`auto`, `bicycle`, `pedestrian`, or `multimodal`). Note that no additional options are needed for `formatter`.

```js
var map = L.map('map');

L.Routing.control({
  // [...] See MapzenTurn-by-Turn API documentation for other options
  router: L.Routing.mapzen('mapzen-xxxxxx', {
    costing:'auto'
  }),
  formatter: new L.Routing.mapzenFormatter()
}).addTo(map);
```

If you want to include additional costing options to help define the the route and estimated time along the path, you can pass a costing option object as one of router parameters. You can also include options for directions in order to change the language, distance units or narrative guidance production. See the [Mapzen Turn-by-Turn API documentation](https://mapzen.com/documentation/turn-by-turn/api-reference/) for more information on the available options.

```js
L.Routing.control({
  router: L.Routing.mapzen('mapzen-xxxxxx', {
    costing: "bicycle",
    costing_options: {
      bicycle: {
        bicycle_type: "Road",
        cycling_speed: "17.0",
        use_roads: "0.1"
      },
    },
    directions_options: {
      language: 'en-US'
    }
  }),
  formatter: new L.Routing.mapzenFormatter(),
}).addTo(map);
```

With the`multimodal` costing mode, you can set costing options for preferences for taking buses or rail lines or having to make transfers. If you include a `date_time`, you can request a transit route departing at a certain time, for example. See the [Mapzen Turn-by-Turn API documentation](https://mapzen.com/documentation/turn-by-turn/api-reference/) for more information on the available options.

```js
L.Routing.control({
  router: L.Routing.mapzen('mapzen-xxxxxx', {
    // you need to pass mapzenLine as routeLine to router to see subroutes of transit routing.
    // you can skip routeLine if you don't want to use subroutes.
    routeLine: function (route, options) { return L.Routing.mapzenLine(route, options); },
    costing: "multimodal",
    date_time: {
      type: 1,
      value: "2016-05-10T08:00"
    }
  }),
  formatter: new L.Routing.mapzenFormatter(),
}).addTo(map);
```

See the [Leaflet Routing Machine documentation](http://www.liedman.net/leaflet-routing-machine/tutorials/) and [Mapzen Turn-by-Turn API documentation](https://mapzen.com/documentation/turn-by-turn/api-reference/) for more information.

## Use lrm-mapzen with npm and Browserify

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
  router: L.Routing.mapzen('mapzen-xxxxxx', {costing:'auto'}),
  formatter: new L.Routing.mapzenFormatter()
}).addTo(map);
```

For `router`, insert your [Mapzen Turn-by-Turn API key](https://mapzen.com/developers) and a routing options object to at least include the routing mode (such as `auto`, `bicycle`, `pedestrian`, or `multimodal`); see the [Mapzen Turn-by-Turn API documentation](https://mapzen.com/documentation/turn-by-turn/api-reference/) for more information. (Note that no additional options are needed for `formatter`.)

You can also change the route costing mode after the router is created. Say you had different transportation options on your map and wanted to change `costing` to `bicycle` when that button is clicked:

```js
var rr = L.Routing.mapzen('mapzen-xxxxxx', {costing:'auto'});
[...]
bikeButton.onClick: function () {
  rr.route({costing: "bicycle"});
}
```

## Run a local example

If you want to run your lrm-mapzen plug-in locally for testing and development purposes:

- Install lrm-mapzen through npm or [download the contents of the lrm-mapzen repo](https://github.com/mapzen/lrm-mapzen/archive/master.zip)
- Get your API key from [mapzen.com/developers](https://mapzen.com/developers/)
- Paste it into the example's index.js and choose the transportation/costing mode (`auto`, `bicycle`, or `pedestrian`)
- Start a local web server (such as `python -m SimpleHTTPServer` or the local server you prefer)
- Go to `http://localhost:8000/examples` in your browser (all assets needed to run Mapzen are in the `/examples` folder)
