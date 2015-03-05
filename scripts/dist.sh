#!/bin/bash

VERSION=`echo "console.log(require('./package.json').version)" | node`

echo Building dist files for $VERSION...
mkdir -p dist
browserify -t browserify-shim src/L.Routing.GraphHopper.js >dist/lrm-graphhopper.js
uglifyjs dist/lrm-graphhopper.js >dist/lrm-graphhopper.min.js
echo Done.
