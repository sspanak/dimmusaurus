#!/bin/bash

input_dir=`echo $1 | sed -e 's|/$||'`
output_dir=`echo $2 | sed -e 's|/$||'`
format=$3

if ! [[ -d $input_dir && -d $output_dir ]] || [[ $format != 'opus' && $format != 'aac' ]]
then
	echo 'Converts a directory of .flac files to .opus/.aac. Requires fdkaac, flac and ffmpeg to be installed.'
	echo 'Note: It is an input directory, not dir/*.flac'
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
	for f in "$input_dir"/*.flac
	do
		filename=`basename "$f"`
		filename="${filename%.flac}"
		ffmpeg -i "$f" -ar 44100 -sample_fmt s16 -f wav -acodec pcm_s16le -ac 2 - | fdkaac --ignorelength --profile 2 --bitrate-mode 4 -o "$output_dir"/__tmp.m4a -
		ffmpeg -i "$f" -i "$output_dir"/__tmp.m4a -map 1 -c copy -map_metadata 0 -map_metadata:s:a 0:s:a -movflags +faststart "$output_dir"/"$filename".m4a

		rm "$output_dir"/__tmp.m4a
	done
fi
