#!/bin/bash
# WARNING! This will TRUNCATE each table before importing a .csv file

if [ $# != 2 ]
then
	echo "Imports a database backup into sqlite3 database."
	echo "WARNING! This script TRUNCATE each table before importing a .csv file"
	echo
	echo "Usage: $0 DB_BACKUP.TAR TARGET_DATABASE.SQLITE3"
	exit 42
fi

if ! [[ -f $1 ]]
then
	 echo "Could not open backup file: '$1'."
  exit 1
fi

if ! [[ -f $2 && $2 == *sqlite3 ]]
then
  echo "'$2' does not seem to be sqlite3 database. Aborting."
  exit 2
fi


work_dir='/tmp/ds-db-import-temp'
mkdir -p $work_dir

rm -f $work_dir/*.csv
tar -xf $1 --strip-components=1 -C $work_dir

# Truncate tables
for csv in $work_dir/*.csv; do
	csv_file=`basename $csv`
	table_name="${csv_file%.*}"
	echo "Truncating '$table_name'"

sqlite3 $2 <<!
delete from $table_name;
vacuum;
!
done;

# Import
for csv in $work_dir/*.csv; do
	csv_file=`basename $csv`
	table_name="${csv_file%.*}"
	echo "Importing '$csv_file' to table '$table_name'"

sqlite3 $2 <<!
.mode csv
.import $csv $table_name
!
done;

rm -rf $work_dir

echo Done
