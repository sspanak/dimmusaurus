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
# 	make js-ui && mv ui-demo/ds.js ui-demo/ds.min.js && mv ui-demo/ds.legacy.js ui-demo/ds.legacy.min.js
	make images
	mv ui-demo/img src/py/static

	# Create a dummy song for download test
	mkdir -p src/py/static/download
	touch src/py/static/download/10-smrad.ogg
	echo 'asdasdd' >> src/py/static/download/10-smrad.ogg

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
	mv ui-demo/*.css src/py/static

js-ui:
	cat src/js/*.js	> ui-demo/ds.js
	npm run --silent build-legacy-js -- ui-demo/ds.js > ui-demo/ds.legacy.js

js-debug-prod:
	make js-ui
	mv ui-demo/ds.js src/py/static/ds.min.js
	mv ui-demo/ds.legacy.js src/py/static/ds.legacy.min.js

js-prod:
	bash -c build-tools/build-js-prod.sh
	mv ui-demo/*.js src/py/static

images:
	mkdir -p ui-demo/img
	cp img/{*.png,*.ico} ui-demo/img

db-backup:
	bash -c build-tools/db-export.sh

db-import:
	bash -c 'build-tools/db-import.sh db/ds.db.tar'
