MAKEFLAGS += --no-print-directory
SHELL := /bin/bash

default:
	django-static

tar:
	rm -f ds.tar; rm -f ds.tar.bz2
	make clean || true
	make django-static
	tar cv --exclude='db.sqlite3' --exclude='.gitkeep' --exclude='__init__.py' --exclude='*.pyc' -C src/ -f ds.tar py/
	tar rv -C build-tools -f ds.tar install.sh
	tar rv -C build-tools -f ds.tar db-import.sh
	bzip2 -9 ds.tar

clean:
	rm -r src/py/static/*

django:
	cd src/py && python manage.py migrate && cd ../..
	django-admin compilemessages
	make clean || true
	make django-static

django-static:
	make clean-ui || true
	cp src/reset.css ui-demo
	make css-prod
	make js-prod
	make images
	mv ui-demo/img src/py/static

translations:
	django-admin makemessages -l bg
	django-admin makemessages -l fr

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
	node build-tools/build-legacy-css.js ui-demo/ds.css > ui-demo/ds.legacy.css

css-prod:
	bash -c build-tools/build-css-prod.sh
	mv ui-demo/*.css src/py/static

js-ui:
	cat src/js/dev-*.js > ui-demo/ds.js
	cat src/js/[0-9]*.js >> ui-demo/ds.js
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
	cp img/{*.png,*.ico,*.gif} ui-demo/img

db-backup:
	bash -c build-tools/db-export.sh

db-import:
	bash -c 'build-tools/db-import.sh db/ds.db.tar'
