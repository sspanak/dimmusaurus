#!/bin/bash

if ! [[ -f Makefile && -d dist && -d dist/static ]]
then
	echo "Please run this script from the root project directory."
	exit 1
fi

build-tools/generate-version.sh > dist/static/version.json
