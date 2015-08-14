Leaflet Routing Machine / Valhalla by Mapzen
============================================


     ██▒   █▓ ▄▄▄       ██▓     ██░ ██  ▄▄▄       ██▓     ██▓    ▄▄▄      
    ▓██░   █▒▒████▄    ▓██▒    ▓██░ ██▒▒████▄    ▓██▒    ▓██▒   ▒████▄    
     ▓██  █▒░▒██  ▀█▄  ▒██░    ▒██▀▀██░▒██  ▀█▄  ▒██░    ▒██░   ▒██  ▀█▄  
      ▒██ █░░░██▄▄▄▄██ ▒██░    ░▓█ ░██ ░██▄▄▄▄██ ▒██░    ▒██░   ░██▄▄▄▄██ 
       ▒▀█░   ▓█   ▓██▒░██████▒░▓█▒░██▓ ▓█   ▓██▒░██████▒░██████▒▓█   ▓██▒
       ░ ▐░   ▒▒   ▓▒█░░ ▒░▓  ░ ▒ ░░▒░▒ ▒▒   ▓▒█░░ ▒░▓  ░░ ▒░▓  ░▒▒   ▓▒█░
       ░ ░░    ▒   ▒▒ ░░ ░ ▒  ░ ▒ ░▒░ ░  ▒   ▒▒ ░░ ░ ▒  ░░ ░ ▒  ░ ▒   ▒▒ ░
         ░░    ░   ▒     ░ ░    ░  ░░ ░  ░   ▒     ░ ░     ░ ░    ░   ▒   
          ░        ░  ░    ░  ░ ░  ░  ░      ░  ░    ░  ░    ░  ░     ░  ░
         ░                                                                    


Extends [Leaflet Routing Machine](https://github.com/perliedman/leaflet-routing-machine) with support for [Valhalla](https://mapzen.com/projects/valhalla).

Valhalla is a free, open-source routing service with dynamic run-time costing that lets you integrate automobile, bicycle, and pedestrian navigation into a web or mobile application. To use Valhalla with the Leaflet Routing Machine, install the lrm-valhalla plug-in with npm and get your free API key from [mapzen.com/developers](http://mapzen.com/developers).

## How to use

As with the other LRM plug-ins, you can [download lrm-valhalla](https://mapzen.com/resources/lrm-valhalla-0.0.9.zip) and insert the JavaScript file into your page right after the line where it loads Leaflet Routing Machine:

```html
/* ... */
<script src="leaflet-routing-machine.js"></script>
<script src="lrm-valhalla.js"></script>
/* ... */
```

Also, include the stylesheet. This can replace the default `leaflet-routing-machine.css` provided by LRM, since the Valhalla plugin includes its own styles and icons.

```html
<link rel="stylesheet" href="leaflet.routing.valhalla.css">
```

Insert your [Valhalla API key](https://mapzen.com/developers) and the routing mode (`auto`, `bicycle`, or `pedestrian`). (Note that no options are needed for `formatter`.)

```js
var map = L.map('map');

L.Routing.control({
  // [...] See Valhalla API documentation for other options
  router: L.Routing.valhalla('<my api key>', 'auto'),
  formatter: new L.Routing.Valhalla.Formatter()
}).addTo(map);
```

See the [Leaflet Routing Machine documentation](http://www.liedman.net/leaflet-routing-machine/tutorials/) and  [Valhalla API documentation](https://github.com/valhalla/valhalla-docs/blob/gh-pages/api-reference.md) for more information.


If you want to include additional costing options to help define the the route and estimated time along the path, you can pass `costingOptions` object as one of router options. See the [Valhalla API documentation](https://github.com/valhalla/demos/blob/master/docs/valhalla_service.md#costing-options) for more information on the available options for each routing mode.

```js
L.Routing.control({
  router: L.Routing.valhalla('<my api key>', 'bicycle', {
        bicycle: {
        bicycle_type: "Road",
        cycling_speed: 17,
        use_roads: "0.1"
      }
    }),),
  formatter: new L.Routing.Valhalla.Formatter(),
}).addTo(map);
```

## Using Valhalla with npm and Browserify

Like other plug-ins, the Valhalla plug-in can be installed using npm instead of downloading the script manually:

```sh
npm install --save lrm-valhalla
```

Once the Valhalla plug-in is installed, update the router and formatter instances to tell the Leaflet Routing Machine to use Valhalla’s engine. 

```js
var L = require('leaflet');
require('leaflet-routing-machine');
require('lrm-valhalla');

var map = L.map('map');

L.Routing.control({
  router: L.Routing.valhalla('<my api key>', 'auto'),
  formatter: new L.Routing.Valhalla.Formatter()
}).addTo(map);
```


For `router`, insert your [Valhalla API key](https://mapzen.com/developers) and the routing mode (such as `auto`, `bicycle`, or `pedestrian`); see the [Valhalla API documentation](https://github.com/valhalla/valhalla-docs/blob/gh-pages/api-reference.md) for more information. (Note that no options are needed for `formatter`.)

You can also change the routing mode after the router is created. Say you had different transportation options on your map and wanted to change `transitmode` to `bicycle` when that button is clicked: 

```js
var rr = L.Routing.valhalla('<my api key>', 'auto');
[...]
bikeButton.onClick: function () {
  rr.route({transitmode: "bicycle"});
}
```

## Running a local example

If you want to run your lrm-valhalla plug-in locally for test and development purposes:

- Install lrm-valhalla through npm or [download the contents of the lrm-valhalla repo](https://github.com/valhalla/lrm-valhalla/archive/master.zip)
- get your API key from [mapzen.com/developers](https://mapzen.com/developers/)
- paste it into the example's index.js and choose the transportation mode (`auto`, `bicycle`, or `pedestrian`)
- start a local web server (such as `python -m SimpleHTTPServer` or the local server you prefer)
- go to `http://localhost:8000/examples` in your browser (all assets needed to run Valhalla are in the `/examples` folder)

