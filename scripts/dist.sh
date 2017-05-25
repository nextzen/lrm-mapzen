#!/bin/bash

VERSION=`echo "console.log(require('./package.json').version)" | node`

echo Building dist files for $VERSION...
mkdir -p dist
browserify -t browserify-shim src/*.js > dist/lrm-mapzen.js
browserify -t uglifyify -t browserify-shim src/*.js | uglifyjs -c > dist/lrm-mapzen.min.js

node-sass --output-style compressed -o dist/ src/styles/lrm-mapzen.scss

cp src/styles/lrm-mapzen-icons.svg dist/lrm-mapzen-icons.svg
cp src/styles/lrm-mapzen-modes.svg dist/lrm-mapzen-modes.svg
cp src/styles/lrm-mapzen-icons.png dist/lrm-mapzen-icons.png
cp src/styles/routing-icon.png dist/routing-icon.png

echo Done.
