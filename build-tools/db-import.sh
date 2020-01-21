#!/bin/bash
# WARNING! This will TRUNCATE each table before importing a .csv file
# Meant to be run from root directory or by Makefile

if [ $# -eq 0 ]
then
	echo "Please provide database .tar file as a first argument to the script."
	exit 1
fi

export_dir='db'

rm -f $export_dir/*.csv
tar -xf $1 --strip-components=1 -C $export_dir

# Truncate tables
for csv in db/*.csv; do
	csv_file=`basename $csv`
	table_name="${csv_file%.*}"
	echo "Truncating '$table_name'"

sqlite3 src/py/db.sqlite3 <<!
delete from $table_name;
vacuum;
!
done;

# Import
for csv in db/*.csv; do
	csv_file=`basename $csv`
	table_name="${csv_file%.*}"
	echo "Importing '$csv_file' to table '$table_name'"

sqlite3 src/py/db.sqlite3 <<!
.mode csv
.import $csv $table_name
!
done;

rm -f $export_dir/*.csv

echo Done
