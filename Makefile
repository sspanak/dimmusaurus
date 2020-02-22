MAKEFLAGS += --no-print-directory
SHELL := /bin/bash

default:
	django-static

tar:
	rm -f ds.tar; rm -f ds.tar.bz2
	make clean || true
	make django-static
	tar cv \
		--exclude='db.sqlite3' --exclude='.gitkeep' \
		--exclude='__pycache__' --exclude='*.pyc' --exclude='migrations' \
		--exclude='manage.py' --exclude='wsgi.py' --exclude='asgi.py'\
		-C src/ \
		-f ds.tar \
		--transform s/py/pysaurus/ \
		py/
	tar rv -C deploy-tools -f ds.tar setup-project.sh
	tar rv -C deploy-tools -f ds.tar setup-ubuntu16.04.sh
	tar rv -C deploy-tools -f ds.tar db-import.sh
	tar rv -C deploy-tools -f ds.tar vhost.conf.sample
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
	bash -c build-tools/css-build-dev.sh
	cat src/css/ui-demo.css >> ui-demo/ds.css

css-prod:
	bash -c build-tools/css-build-prod.sh

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
	bash -c deploy-tools/db-export.sh

db-import:
	bash -c 'deploy-tools/db-import.sh db/ds.db.tar'
