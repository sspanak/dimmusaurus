#!/bin/bash

stop_if_root() {
	if [[ `whoami` == 'root' ]]; then
		echo 'Please run this script as non-root user.'
		exit 42
	fi
}


print_help() {
	printf "Usage: $0 [OPTION]"
	printf "\nPossible options:\n"
	echo '  --all           Runs the entire setup process.'
	echo '  --apache        Sets up Apache virtualhost.'
	echo '  --project       Erases and copies new source code, static files, and reinitializes database.'
	echo '  --src           Copies only the source code. Useful if updating.'
	echo '  --virtualenv    Sets up virtualenv based on user input.'
}


read_user_input() {
	# virtualenv
	if [[ $COMMAND != '--src' ]]; then
		read -p 'Python virtual environment name (default: dsenv): ' ENV_NAME
		if [[ -z $ENV_NAME ]]; then
			ENV_NAME="dsenv"
		fi
	fi

	# project directory is always needed
	read -p 'Project path (default: ~/django-sites/ds): ' PROJECT_ROOT
	if [[ -z $PROJECT_ROOT ]]; then
		PROJECT_ROOT="/home/`whoami`/django-sites/ds"
	fi

	# host and port
	if [[ $COMMAND != '--src' && $COMMAND != '--virtualenv' ]]; then
		read -p 'Host (default: dimmu-saurus.net): ' HOST
		if [[ -z $HOST ]]; then
			HOST='dimmu-saurus.net'
		fi

		read -p 'Port (default: None): ' PORT
	fi
}


setup_virtualenv() {
	if [ -d $PROJECT_ROOT ]; then
		echo "  Error: '$PROJECT_ROOT' already exists. Aborting installation."
		exit 1
	fi

	mkdir -p $PROJECT_ROOT

	cd $PROJECT_ROOT
	printf "Creating '$ENV_NAME'... "
	virtualenv -q -p /usr/bin/python3.8 $ENV_NAME && echo OK

	source $ENV_NAME/bin/activate
	cp -v $SETUP_DIR/pysaurus/requirements.txt $PROJECT_ROOT
	pip install -r requirements.txt
	deactivate

	rm $PROJECT_ROOT/requirements.txt
}


setup_project() {
	if [ ! -d $PROJECT_ROOT/$ENV_NAME ]; then
		echo "  Error: virtualenv not found in '$PROJECT_ROOT'. Run with '--virtualenv' first."
		exit 2
	fi

	cd $PROJECT_ROOT
	rm -rf $PROJECT_ROOT/pysaurus

	source $ENV_NAME/bin/activate
	django-admin startproject pysaurus

	printf 'Copying source code... '
	cp -u -r $SETUP_DIR/pysaurus/* $PROJECT_ROOT/pysaurus && \
		cp -f $SETUP_DIR/pysaurus/pysaurus/urls.py $PROJECT_ROOT/pysaurus/pysaurus/ && \
		echo OK

	printf 'Updating configuration... '
	new_secret=`cat ~/django-sites/ds/pysaurus/pysaurus/settings.py | grep SECRET_KEY`

	cp $SETUP_DIR/pysaurus/pysaurus/settings.py $PROJECT_ROOT/pysaurus/pysaurus/settings.ds.py && \
		# update HOST and PORT
		sed -r -i "s/SITE_HOST\s*=\s*'[^']+'/SITE_HOST = '$HOST'/" $PROJECT_ROOT/pysaurus/pysaurus/settings.ds.py && \
		sed -r -i "s/SITE_PORT\s*=\s*'[^']+'/SITE_PORT = '$PORT'/" $PROJECT_ROOT/pysaurus/pysaurus/settings.ds.py && \

		# use the secret from the newly generated settings.py
		sed -r -i "s/SECRET_KEY\s*=\s*'[^']+'//" $PROJECT_ROOT/pysaurus/pysaurus/settings.ds.py && \
		echo $new_secret >> $PROJECT_ROOT/pysaurus/pysaurus/settings.ds.py && \

		# change some settings that should not be on production
		sed -r -i "s/DEBUG\s*=\s*True/DEBUG = False/" $PROJECT_ROOT/pysaurus/pysaurus/settings.ds.py

		# replace the standard settings.py with our version
		rm $PROJECT_ROOT/pysaurus/pysaurus/settings.py && \
		mv $PROJECT_ROOT/pysaurus/pysaurus/settings.ds.py $PROJECT_ROOT/pysaurus/pysaurus/settings.py && \
		echo 'OK'

	cd $PROJECT_ROOT/pysaurus
	./manage.py makemigrations main music
	./manage.py migrate
}


copy_src() {
	if [ ! -d $PROJECT_ROOT/$ENV_NAME ]; then
		echo "  Error: virtualenv not found in '$PROJECT_ROOT'. Run with '--virtualenv' first."
		exit 3
	fi

	cd $PROJECT_ROOT/pysaurus
	rm -r bio locale main music

	printf 'Copying source code... '
	cp -u -r $SETUP_DIR/pysaurus/{bio,locale,main,music} $PROJECT_ROOT/pysaurus && echo OK

	# Relaunch the WSGI daemon
	touch $PROJECT_ROOT/pysaurus/pysaurus/wsgi.py
}


setup_apache() {
	cd $SETUP_DIR
	cat ./vhost.conf.sample \
		| sed -r -e "s|dimmu-saurus.net|$HOST|" \
		| sed -r -e "s|\.dimmu-saurus.net|.$HOST|" \
		| sed -r -e "s|/path/to/site|$PROJECT_ROOT|" \
		| sed -r -e "s|/path/to/venv|$PROJECT_ROOT/$ENV_NAME|" > vhost.conf

	if ! [[ -z $PORT ]]; then
		sed -i "s/:80>/:$PORT>/" vhost.conf
	fi

	if [[ $HOST =~ ^[0-9]{1,3}\.[0-9]{1,3}\. ]]; then
		sed -i -r s/[[:space:]]*ServerAlias[^\n]+// vhost.conf
	fi

	sudo mv vhost.conf /etc/apache2/sites-available/dimmu-saurus.conf

	sudo a2ensite dimmu-saurus
	printf "Reloading configuration... ";	sudo service apache2 reload && echo OK
}

### Main ###
stop_if_root

if [[ $# == 0 ]] || [[ $1  != '--all' && $1 != '--apache' && $1 != '--project' && $1 != '--virtualenv' && $1 != '--src' ]]
then
	print_help
	exit 0
fi

if ! [[ -d pysaurus ]]
then
	echo 'Error: source code directory not found. Please, run this script from the directory where you extracted it.'
	exit 42
fi

COMMAND=$1
SETUP_DIR=`pwd`

read_user_input

[[ $COMMAND == '--all' || $COMMAND == '--virtualenv' ]] && setup_virtualenv
[[ $COMMAND == '--all' || $COMMAND == '--project' ]] && setup_project
[[ $COMMAND == '--all' || $COMMAND == '--apache' ]] && setup_apache

[[ $COMMAND == '--src' ]] && copy_src

echo Done.
