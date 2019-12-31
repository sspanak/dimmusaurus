#!/bin/bash
MAKEFLAGS += --no-print-directory

default:
	make ui

ui:
	make css
	cp src/{js.js,index.html,reset.css} dist

css:
	cat src/css/css-*.css > dist/css.css

images:
	mkdir -p dist/img
	cp -r img/* dist/img

clean:
	rm -r dist/*
