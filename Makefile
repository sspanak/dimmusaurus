#!/bin/bash
MAKEFLAGS += --no-print-directory

default:
	make ui

ui:
	make css
	make js
	cp src/{index.html,reset.css} dist

css:
	cat src/css/*.css \
		| sed -r -e "s@\s*([,;:>{}])\s*@\1@g" \
		| tr --delete '\n\t' \
		| sed -r -e "s@\/\*+[^\/]+\*\/@@g" \
		| sed -r -e "s@\/\*[^\*]+\*\/@@g" \
		> dist/ds.min.css

js:
	cat src/js/*.js > dist/ds.js

images:
	mkdir -p dist/img
	cp -r img/* dist/img

clean:
	rm -r dist/*
