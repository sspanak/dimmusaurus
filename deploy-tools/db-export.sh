#!/bin/bash

if ! [[ -f Makefile && -d db ]]
then
	echo "Please run this script from the root project directory."
	exit 1
fi

export_dir='db'

sqlite3 -csv src/py/db.sqlite3 "select id, pub_date, language, title, body from main_news;" > $export_dir/main_news.csv
sqlite3 -csv src/py/db.sqlite3 "select id, release_date from music_album;" > $export_dir/music_album.csv
sqlite3 -csv src/py/db.sqlite3 "select id, description, language, slug, title, album_id from music_albumdetails;" > $export_dir/music_albumdetails.csv
sqlite3 -csv src/py/db.sqlite3 "select id, is_hidden, length, release_date, slug, original_title, youtube, album_order, album_id from music_song;" > $export_dir/music_song.csv
sqlite3 -csv src/py/db.sqlite3 "select id, description, language, title, song_id from music_songdescription;" > $export_dir/music_songdescription.csv
sqlite3 -csv src/py/db.sqlite3 "select id, file_name, file_type, song_id from music_songfile;" > $export_dir/music_songfile.csv
sqlite3 -csv src/py/db.sqlite3 "select id, title, lyrics, english_title, english_lyrics, song_id from music_songlyrics;" > $export_dir/music_songlyrics.csv

now=`date '+%Y_%m_%d__%H_%M_%S'`;
filename="$export_dir/ds.db-export-$now.tar"

now=`date '+%Y-%m-%d %H:%M:%S'`;
computer_id=`uname -s -r`;
echo "1,\"$computer_id\",\"$now\",\"$filename\"" > $export_dir/main_dbversion.csv

tar -cf $filename $export_dir/*.csv && echo "Created database backup:" && echo "   $filename";
rm -f $export_dir/*.csv
