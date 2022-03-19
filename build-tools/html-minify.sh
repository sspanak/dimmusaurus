#!/bin/bash

if ! [[ -f Makefile && -d dist && -d src && -d src/py ]]
then
	echo "Please run this script from the root project directory."
	exit 1
fi


html_minify() {
	cat $1 \
	| tr --delete '\n\r' \
	| sed -r "s@[\t ]+@ @g" \
	| sed -r "s@(>|%\}|\}\}) (<|\{%|\{\{)@\1\2@g"
}


for src_file in src/py/*/templates/{*.html,*/*.html};
do
	printf "Minifiying $src_file... " \
		&& dist_file="${src_file/src\/py\//dist/}" \
		&& mkdir -p `dirname $dist_file` \
		&& touch $dist_file \
		&& html_minify $src_file > $dist_file \
		&& echo 'OK'
done

