Leaflet Routing Machine / GraphHopper
=====================================

[![npm version](https://img.shields.io/npm/v/lrm-mapbox.svg)](https://www.npmjs.com/package/lrm-graphhopper)

Extends [Leaflet Routing Machine](https://github.com/perliedman/leaflet-routing-machine) with support for [GraphHopper](https://graphhopper.com/).

_Note_: This lib is under active development. Beware that this might be more unstable than the usual ad hoc OSS you pick up. Feedback, issues or pull requests are of course very welcome.

## Installing

To use with for example Browserify:

```sh
npm install --save lrm-graphhopper
```

There's not pre-built files yet, but I will get to it.

## Using

There's a single class exported by this module, `L.Routing.GraphHopper`. It implements the [`IRouter`](http://www.liedman.net/leaflet-routing-machine/api/#irouter) interface. Use it to replace Leaflet Routing Machine's default OSRM router implementation:

```javascript
var L = require('leaflet');
require('leaflet-routing-machine');
require('lrm-graphhopper'); // This will tack on the class to the L.Routing namespace

L.Routing.control({
    router: new L.Routing.GraphHopper('your GraphHopper API key'),
}).addTo(map);
```

Note that you will need to pass a valid GraphHopper API key to the constructor.
