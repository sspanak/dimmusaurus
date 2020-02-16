#!/bin/bash

if ! [[ -f Makefile && -d ui-demo && -d src && -d src/css ]]
then
	echo "Please run this script from the root project directory."
	exit 1
fi

bash -c build-tools/css-build-dev.sh

for f in ui-demo/ds.css ui-demo/ds.legacy.css;
do
	cat $f \
	| sed -r -e "s@\s*([,;:>{}])\s*@\1@g" \
	| tr --delete '\n\t' \
	| sed -r -e "s@\/\*+[^\/]+\*\/@@g" \
	| sed -r -e "s@\/\*[^\*]+\*\/@@g" \
	> ${f/.css/.min.css};

	rm $f
done

mv ui-demo/*.css src/py/static
