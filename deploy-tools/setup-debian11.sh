#!/bin/bash

if [[ `whoami` != 'root' ]]; then
	echo "This script requires root privileges. Run with: sudo $0."
	exit 42
fi

apt update && apt upgrade

#### Python ####
ln -s /usr/bin/python3.9 /usr/bin/python
apt -y install python3-venv python3-pip python3-distutils
python3.9 -m pip install virtualenv

#### SQLITE ####
apt -y install sqlite3 # for easier database imports


#### Apache ####
apt -y install apache2 libapache2-mod-wsgi-py3
a2enmod headers expires wsgi
systemctl restart apache2

echo "Done"
