#!/bin/bash

if ! [[ -f Makefile && -d ui-demo && -d src && -d src/css ]]
then
	echo "Please run this script from the root project directory."
	exit 1
fi

# geometry
cat src/css/{normalize.css,[0-8]*.css} > ui-demo/ds.all.css
node build-tools/css-convert-legacy.js ui-demo/ds.all.css > ui-demo/ds.css
rm ui-demo/ds.all.css

#colors
cat src/css/[9]*colors*.css > ui-demo/ds.colors.css
cat ui-demo/ds.colors.css >> ui-demo/ds.css
node build-tools/css-convert-legacy.js ui-demo/ds.colors.css > ui-demo/ds.legacy.css
rm ui-demo/ds.colors.css
