#!/bin/bash

VERSION=`echo "console.log(require('./package.json').version)" | node`

echo Building dist files for $VERSION...
mkdir -p dist
browserify -t browserify-shim src/* > dist/lrm-mapzen.js
browserify -t uglifyify -t browserify-shim src/* | uglifyjs -c > dist/lrm-mapzen.min.js

cp css/leaflet.routing.mapzen.css dist/leaflet.routing.mapzen.css
cp css/leaflet.routing.icons.svg dist/leaflet.routing.icons.svg
cp css/modes.icons.svg dist/modes.icons.svg
cp css/routing-icon.png dist/routing-icon.png

echo Done.
