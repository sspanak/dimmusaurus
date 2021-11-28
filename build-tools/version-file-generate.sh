#!/bin/bash

if ! [[ -f Makefile && -d src && -d src/py ]]
then
	echo "Please run this script from the root project directory."
	exit 1
fi

build-tools/generate-version.sh > src/py/static/version.json
