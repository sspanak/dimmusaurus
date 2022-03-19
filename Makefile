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
		-C . \
		-f ds.tar \
		--transform s/dist/pysaurus/ \
		dist/
	tar rv -C deploy-tools -f ds.tar setup-project.sh
	tar rv -C deploy-tools -f ds.tar setup-debian11.sh
	tar rv -C deploy-tools -f ds.tar db-import.sh
	tar rv -C deploy-tools -f ds.tar vhost.conf.sample
	tar rv -f ds.tar LICENSE.txt
	bzip2 -9 ds.tar

	rm -rf dist/*

clean:
	rm -rf dist/*
	rm -f ds.tar
	rm -f ds.tar.bz2

django:
	@make django-static && \
	echo 'Installing requirements.txt... ' && \
		cd dist && \
		python3 -m pip install -r requirements.txt && \
		python3 manage.py makemigrations && \
		python3 manage.py migrate

django-static:
	make clean
	django-admin compilemessages
	@printf 'Copying PY... ' && cp -r src/py/* dist/ && echo "OK"
	@bash -c build-tools/html-minify.sh
	@printf 'Copying the database... ' && \
		rm dist/db.sqlite3 && ln -s "$(PWD)/src/py/db.sqlite3" dist/db.sqlite3 && \
		echo 'OK'
	@make css
	@make js
	@make images
	build-tools/generate-version.sh > dist/static/version.json

translations:
	cd src/py && django-admin makemessages -l bg
	cd src/py && django-admin makemessages -l fr

ui:
	make clean
	cp src/demo.html dist/index.html
	@make images
	@make css-debug
	@make js-debug

serve-ui:
	cd dist/ && python3 -m http.server 3000

css-debug:
	@printf 'Building CSS... ' && \
		bash -c build-tools/css-build.sh && \
		cat src/css/ui-demo.css >> dist/static/ds.css && \
		cp dist/static/ds.css dist/static/ds.min.css && \
		cp dist/static/ds.legacy.css dist/static/ds.legacy.min.css && \
	echo 'OK'

css:
	@printf 'Building CSS... ' && \
		bash -c build-tools/css-build.sh && \
	echo 'OK' && \
	printf 'Minifying CSS... ' && \
		cat dist/static/ds.css | node build-tools/css-minify.js > dist/static/ds.min.css && \
		cat dist/static/ds.legacy.css | node build-tools/css-minify.js > dist/static/ds.legacy.min.css && \
		rm -f dist/static/{ds,ds.legacy}.css && \
	echo 'OK'

js-debug:
	@printf 'Building JS... ' && \
		mkdir -p dist/main/templates/main && \
			cp src/js/{detect-old-browser,theme}.js dist/main/templates/main/ && \
		mkdir -p dist/static && \
			echo "'use strict';" > dist/static/ds.js && \
			cat src/js/[0-9]*.js >> dist/static/ds.js && \
			npx babel src/js/polyfills.js dist/static/ds.js > dist/static/ds.legacy.js && \
			cp dist/static/ds.js dist/static/ds.min.js && \
			cp dist/static/ds.legacy.js dist/static/ds.legacy.min.js && \
	echo 'OK'

js:
	@make js-debug && \
	printf 'Minifying JS... ' && \
		npx terser -c drop_console=true,passes=2 src/js/detect-old-browser.js > dist/main/templates/main/detect-old-browser.js && \
		npx terser -c drop_console=true,passes=2 src/js/theme.js > dist/main/templates/main/theme.js && \
		npx terser -c drop_console=true,passes=2,ecma=2018 dist/static/ds.js > dist/static/ds.min.js && \
		npx terser -c drop_console=true,passes=2 dist/static/ds.legacy.js > dist/static/ds.legacy.min.js && \
		rm -f dist/static/{ds,ds.legacy}.js && \
	echo 'OK'

images:
	@printf 'Copying images... ' && \
		mkdir -p dist/static/img && cp img/{*.png,*.ico,*.gif,*.svg} dist/static/img && \
	echo 'OK'

db-backup:
	bash -c deploy-tools/db-export.sh

db-import:
	bash -c 'deploy-tools/db-import.sh db/ds.db.tar dist/db.sqlite3'

docs:
	bash -c build-tools/update-docs.sh
