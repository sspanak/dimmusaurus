#!/bin/bash
# Meant to be run from root directory or by Makefile

export_dir='db'

sqlite3 -csv src/py/db.sqlite3 "select * from main_news;" > $export_dir/main_news.csv
sqlite3 -csv src/py/db.sqlite3 "select * from music_album;" > $export_dir/music_album.csv
sqlite3 -csv src/py/db.sqlite3 "select * from music_albumdetails;" > $export_dir/music_albumdetails.csv
sqlite3 -csv src/py/db.sqlite3 "select * from music_song;" > $export_dir/music_song.csv
sqlite3 -csv src/py/db.sqlite3 "select * from music_songdescription;" > $export_dir/music_songdescription.csv
sqlite3 -csv src/py/db.sqlite3 "select * from music_songfile;" > $export_dir/music_songfile.csv
sqlite3 -csv src/py/db.sqlite3 "select * from music_songlyrics;" > $export_dir/music_songlyrics.csv

now=`date '+%Y_%m_%d__%H_%M_%S'`;
filename="$export_dir/ds.db-export-$now.tar"

tar -cf $filename $export_dir/*.csv && echo "Created database backup:" && echo "   $filename";
rm -f $export_dir/*.csv
