#!/bin/bash

if ! [[ -f Makefile && -d ui-demo && -d src && -d src/css ]]
then
	echo "Please run this script from the root project directory."
	exit 1
fi

cat src/css/[0-9]*.css > ui-demo/ds.css
node build-tools/build-legacy-css.js ui-demo/ds.css > ui-demo/ds.legacy.css

for f in ui-demo/ds.css ui-demo/ds.legacy.css;
do
	cat $f \
	| sed -r -e "s@\s*([,;:>{}])\s*@\1@g" \
	| tr --delete '\n\t' \
	| sed -r -e "s@\/\*+[^\/]+\*\/@@g" \
	| sed -r -e "s@\/\*[^\*]+\*\/@@g" \
	> ${f/.css/.min.css};

	rm $f
done
