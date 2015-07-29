#!/bin/bash

VERSION=`echo "console.log(require('./package.json').version)" | node`

echo Building dist files for $VERSION...
mkdir -p dist
browserify -t browserify-shim src/L.Routing.Valhalla.js src/L.Routing.Valhalla.Formatter.js > dist/lrm-valhalla.js
uglifyjs dist/lrm-valhalla.js > dist/lrm-valhalla.min.js

cp css/leaflet.routing.valhalla.css dist/leaflet.routing.valhalla.css
cp css/leaflet.routing.icons.png dist/leaflet.routing.icons.png
cp css/leaflet.routing.icons.svg dist/leaflet.routing.icons.svg
cp css/modes.icons.svg dist/modes.icons.svg

echo Done.
