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
	cat src/css/*.css > ui-demo/ds.css

css-prod:
	cat src/css/[0-9]*.css \
		| sed -r -e "s@\s*([,;:>{}])\s*@\1@g" \
		| tr --delete '\n\t' \
		| sed -r -e "s@\/\*+[^\/]+\*\/@@g" \
		| sed -r -e "s@\/\*[^\*]+\*\/@@g" \
		> ui-demo/ds.min.css

js-ui:
	cat src/js/*.js	> ui-demo/ds.js

js-prod:
	cat src/js/[0-9]*.js \
	| sed -r -e "s@\/\/[^\n]+@@g" \
	| tr --delete '\n\t' \
	| sed -r -e "s@Logger\.[^;]+;@@g" \
	| sed -r -e "s@\/\*+[^\/]+\*\/@@g" \
	| sed -r -e "s@\/\*[^\*]+\*\/@@g" \
	| sed -r -e "s@\s*([{}(),:;=+\-\*\\\?|&!])\s*@\1@g" \
	> ui-demo/ds.min.js

images:
	mkdir -p ui-demo/img
	cp img/{*.png,*.ico} ui-demo/img
