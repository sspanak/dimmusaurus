#!/bin/bash
# Meant to be run from root directory or by Makefile

cat src/css/[0-9]*.css > ui-demo/ds.css
cp src/css/legacy.css ui-demo/ds.legacy.css
npm run --silent build-legacy-css >> ui-demo/ds.legacy.css

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
