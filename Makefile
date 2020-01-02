#!/bin/bash
MAKEFLAGS += --no-print-directory

default:
	make ui

ui:
	make css
	cp src/{js.js,index.html,reset.css} dist

css:
	cat src/css/css-*.css > dist/css.css
	sed -r "s@\s*([,;:>{}])\s*@\1@g" dist/css.css | tr --delete '\n\t' | sed -r -e "s@\/\*+[^\/]+\*\/@@g" > dist/ds.min.css
	rm dist/css.css

js:
	@echo Not implemented yet.

images:
	mkdir -p dist/img
	cp -r img/* dist/img

clean:
	rm -r dist/*
