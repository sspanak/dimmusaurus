MAKEFLAGS += --no-print-directory
SHELL := /bin/bash

default:
	make pystatic

clean:
	rm -r src/py/static/*

pystatic:
	make clean-ui || true
	cp src/reset.css ui-demo
	make css-prod
	make js-prod
	make images
	mv ui-demo/{*.css,*.js} src/py/static
	mv ui-demo/img src/py/static

ui:
	cp src/reset.css ui-demo
	cp src/demo.html ui-demo/index.html
	make css-ui
	make js-ui
	make images

clean-ui:
	rm -r ui-demo/*

css-ui:
	cat src/css/{[0-9]*.css,dev-demo.css} > ui-demo/ds.css
	cp src/css/legacy.css ui-demo/ds.legacy.css
	npm run --silent build-legacy-css >> ui-demo/ds.legacy.css

css-prod:
	bash -c build-tools/build-css-prod.sh

js-ui:
	cat src/js/*.js	> ui-demo/ds.js
	npm run --silent build-legacy-js -- ui-demo/ds.js > ui-demo/ds.legacy.js

js-prod:
	bash -c build-tools/build-js-prod.sh

images:
	mkdir -p ui-demo/img
	cp img/{*.png,*.ico} ui-demo/img
