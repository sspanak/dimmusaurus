#!/bin/bash
# Meant to be run from root directory or by Makefile

cat src/js/[0-9]*.js \
	| sed -r -e "s@\/\/[^\n]+@@g" \
	| tr --delete '\n\t' \
	| sed -r -e "s@Logger\.[^;]+;@@g" \
	| sed -r -e "s@\/\*+[^\/]+\*\/@@g" \
	| sed -r -e "s@\/\*[^\*]+\*\/@@g" \
	| sed -r -e "s@\s*([{}(),:;=+\-\*\\\?|&!])\s*@\1@g" \
	> ui-demo/ds.min.js

npm --silent run build-legacy-js -- ui-demo/ds.min.js \
	| tr --delete '\n\t' \
	| sed -r -e "s@\s*([{}(),:;=+\-\*\\\?|&!])\s*@\1@g" \
	> ui-demo/ds.legacy.min.js
