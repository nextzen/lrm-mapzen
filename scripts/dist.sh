#!/bin/bash

VERSION=`echo "console.log(require('./package.json').version)" | node`

echo Building dist files for $VERSION...
mkdir -p dist
browserify -t browserify-shim src/* > dist/lrm-mapzen.js
browserify -t uglifyify -t browserify-shim src/* | uglifyjs -c > dist/lrm-mapzen.min.js

cp css/leaflet.routing.mapzen.css dist/lrm-mapzen.css
cp css/lrm-mapzen-icons.svg dist/lrm-mapzen-icons.svg
cp css/lrm-mapzen-modes.svg dist/lrm-mapzen-modes.svg
cp css/lrm-mapzen-icons.png dist/lrm-mapzen-icons.png
cp css/routing-icon.png dist/routing-icon.png

echo Done.
