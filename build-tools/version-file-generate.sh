#!/bin/bash

if ! [[ -f Makefile && -d src && -d src/py ]]
then
	echo "Please run this script from the root project directory."
	exit 1
fi

total_commits=`git rev-list --count HEAD`
last_commit_hash=`git log -n 1 --pretty=format:"%h"`
last_commit_date=`git log -n 1 --date=iso --pretty=format:"%ad"`

json='{
	"build": "'"$total_commits"'",
	"last_commit_date": "'"$last_commit_date"'",
	"last_commit_hash": "'"$last_commit_hash"'",
	"version": "7.2"
}'

echo $json > src/py/static/version.json
