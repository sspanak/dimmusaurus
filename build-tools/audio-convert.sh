#!/bin/bash

input_dir=`echo $1 | sed -e 's|/$||'`
output_dir=`echo $2 | sed -e 's|/$||'`
format=$3

if ! [[ -d $input_dir && -d $output_dir ]] || [[ $format != 'opus' && $format != 'aac' ]]
then
	echo 'Converts a directory of .flac files to .opus/.aac. Requires faac, flac and ffmpeg to be installed.'
	echo 'Usage:'
	echo "  $0 INPUT_DIR OTPUT_DIR aac|opus"
	exit 42
fi

if [[ $format == 'opus' ]]
then
	for f in "$input_dir"/*.flac
	do
		filename=`basename "$f"`
		filename="${filename%.flac}"
		ffmpeg -i "$f" -c:a libopus -b:a 128k "$output_dir"/"$filename".opus
	done
fi

if [[ $format == 'aac' ]]
then
	cd $input_dir
	for f in "$input_dir"/*.flac
	do
		filename=`basename "$f"`
		filename="${filename%.flac}"
		ffmpeg -i "$f" -c:a aac -b:a 160k -movflags +faststart "$output_dir"/"$filename".mp4
	done
fi
