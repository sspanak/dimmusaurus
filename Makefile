MAKEFLAGS += --no-print-directory
SHELL := /bin/bash

default:
	make django-static
	make docs

tar:
	make clean
	make django-static
	make docs

	tar cv \
		--exclude='db.sqlite3' --exclude='.gitkeep' \
		--exclude='__pycache__' --exclude='*.pyc' --exclude='migrations' \
		--exclude='manage.py' --exclude='wsgi.py' --exclude='asgi.py'\
		--exclude="django.po" \
		-C src/ \
		-f ds.tar \
		--transform s/py/pysaurus/ \
		py/
	tar rv -C deploy-tools -f ds.tar setup-project.sh
	tar rv -C deploy-tools -f ds.tar setup-debian11.sh
	tar rv -C deploy-tools -f ds.tar db-import.sh
	tar rv -C deploy-tools -f ds.tar vhost.conf.sample
	tar rv -f ds.tar LICENSE.txt
	bzip2 -9 ds.tar

clean:
	rm -rf dist/*
	rm -f ds.tar; rm -f ds.tar.bz2

django:
	make clean
	make django-static
	cd dist/py \
		&& python3 -m pip install -r requirements.txt \
		&& python3 manage.py makemigrations \
		&& python3 manage.py migrate

django-static:
	make clean
	cp -r src/py/ dist/
	make css
	make js
	make images
	bash -c build-tools/version-file-generate.sh
	django-admin compilemessages

translations:
	cd src/py && django-admin makemessages -l bg
	cd src/py && django-admin makemessages -l fr

ui:
	cp src/demo.html dist/index.html
	make images
	make css-debug
	make js-debug

serve-ui:
	cd dist/ && python3 -m http.server 3000

css-debug:
	bash -c build-tools/css-build-dev.sh
	cat src/css/ui-demo.css >> dist/py/static/ds.css

css:
	bash -c build-tools/css-build-dev.sh
	npx csso dist/py/static/ds.css > dist/py/static/ds.min.css
	npx csso dist/py/static/ds.legacy.css > dist/py/static/ds.legacy.min.css
	rm dist/py/static/{ds,ds.legacy}.css

js-debug:
	mkdir -p dist/py/main/templates/main \
	 && cp src/js/detect-old-browser.js dist/py/main/templates/main/

	mkdir -p dist/py/static \
	 && echo "'use strict';" > dist/py/static/ds.js \
	 && cat src/js/[0-9]*.js >> dist/py/static/ds.js \
	 && npx babel src/js/polyfills.js dist/py/static/ds.js > dist/py/static/ds.legacy.js

js:
	make js-debug
	npx terser -c drop_console=true,passes=2,ecma=2018 dist/py/static/ds.js > dist/py/static/ds.min.js
	npx terser -c drop_console=true,passes=2 dist/py/static/ds.legacy.js > dist/py/static/ds.legacy.min.js
	rm dist/py/static/{ds,ds.legacy}.js

images:
	mkdir -p dist/py/static/img
	cp img/{*.png,*.ico,*.gif,*.svg} dist/py/static/img

db-backup:
	bash -c deploy-tools/db-export.sh

db-import:
	bash -c 'deploy-tools/db-import.sh db/ds.db.tar dist/py/db.sqlite3'

docs:
	bash -c build-tools/update-docs.sh
