#!/bin/bash

if ! [[ -f Makefile && -f README.md && -f LICENSE.txt ]]
then
	echo "Please run this script from the root project directory."
	exit 1
fi

version=`build-tools/generate-version.sh short`
sed -r -i "s/Version 7\.[0-9]+/Version $version/" README.md

year=`date +"%Y"`
sed -r -i "s/2004-2[0-9]{3}/2004-$year/" LICENSE.txt

