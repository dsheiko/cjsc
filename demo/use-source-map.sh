#!/bin/bash
cd source-map && node ../../cjsc.js ./src/use-main-flow.js ./build.js --source-map=*.map --source-map-url=/cjsc/demo/source-map/ && cd ..
echo "fire up http://../demo/source-map/index.html"