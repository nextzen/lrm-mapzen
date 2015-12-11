#!/bin/bash

VERSION=`echo "console.log(require('./package.json').version)" | node`

echo Building dist files for $VERSION...
mkdir -p dist
browserify -t browserify-shim src/L.Routing.Mapzen.js src/L.Routing.Mapzen.Formatter.js > dist/lrm-mapzen.js
uglifyjs dist/lrm-mapzen.js > dist/lrm-mapzen.min.js

cp css/leaflet.routing.mapzen.css dist/leaflet.routing.mapzen.css
cp css/leaflet.routing.icons.png dist/leaflet.routing.icons.png
cp css/modes.icons.svg dist/modes.icons.svg
cp css/modes.icons.png dist/modes.icons.png
cp css/routing-icon.png dist/routing-icon.png

echo Done.
