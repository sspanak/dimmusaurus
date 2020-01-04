MAKEFLAGS += --no-print-directory
SHELL := /bin/bash

default:
	make ui

ui:
	make css
	make js-prod
	cp src/{index.html,reset.css} dist

css:
	cat src/css/*.css \
		| sed -r -e "s@\s*([,;:>{}])\s*@\1@g" \
		| tr --delete '\n\t' \
		| sed -r -e "s@\/\*+[^\/]+\*\/@@g" \
		| sed -r -e "s@\/\*[^\*]+\*\/@@g" \
		> dist/ds.min.css

js:
	cat src/js/*.js	> dist/ds.js

js-prod:
	cat src/js/[0-9]*.js \
	| sed -r -e "s@\/\/[^\n]+@@g" \
	| tr --delete '\n\t' \
	| sed -r -e "s@Logger\.[^;]+;@@g" \
	| sed -r -e "s@\/\*+[^\/]+\*\/@@g" \
	| sed -r -e "s@\/\*[^\*]+\*\/@@g" \
	| sed -r -e "s@\s*([{}(),:;=+\-\*\\\?|&!])\s*@\1@g" \
	> dist/ds.min.js


images:
	mkdir -p dist/img
	cp -r img/* dist/img

clean:
	rm -r dist/*
