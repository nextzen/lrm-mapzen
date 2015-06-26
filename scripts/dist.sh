#!/bin/bash

VERSION=`echo "console.log(require('./package.json').version)" | node`

echo Building dist files for $VERSION...
mkdir -p dist
browserify -t browserify-shim src/L.Routing.Valhalla.js >dist/lrm-valhalla.js
uglifyjs dist/lrm-valhalla.js >dist/lrm-valhalla.min.js
echo Done.
