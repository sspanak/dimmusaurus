#!/bin/bash

if ! [[ -f Makefile && -d ui-demo && -d src && -d src/css ]]
then
	echo "Please run this script from the root project directory."
	exit 1
fi

# geometry
# the legacy rules are only a few, so we it's more efficient to include them in the main file
cat src/css/{normalize.css,[0-8]*.css} | node build-tools/css-convert-legacy.js > ui-demo/ds.css

# colors - legacy
node build-tools/css-convert-legacy.js < src/css/90-colors-white-stripes.css > ui-demo/ds.legacy.css

# colors - modern
cat src/css/[9]*colors*.css >> ui-demo/ds.css
echo "@media screen and (prefers-color-scheme: dark) {" >> ui-demo/ds.css
cat src/css/91-colors-black-sabbath.css | sed -r "s@\.black\-sabbath@body:not(.white-stripes)@g" >> ui-demo/ds.css
echo "}" >> ui-demo/ds.css
