#!/bin/bash

if [[ `whoami` != 'root' ]]; then
	echo "This script requires root privileges. Run with: sudo $0."
	exit 42
fi


#### Python ####
# Ubuntu 16.04 does not support Python 3.8 officially, so we do the following hacks
spcAvailable=$(whereis add-apt-repository | grep bin)
if [[ ! -z spcAvailable ]]
then
	# required if add-apt-repository is not installed
	apt -y install software-properties-common
fi
add-apt-repository -y ppa:deadsnakes/ppa
apt update

apt -y install python3.8 python3.8-dev python3.8-venv python3.8-distutils python3-setuptools
python3.8 -m easy_install pip
python3.8 -m pip install virtualenv

#### Apache ####
apt -y install apache2

# Next libapache2-mod-wsgi-py3 works with the built-in Python 3.5, so we have to manually build
# a newer version.
# Otherwise, we could have just done: "apt install libapache2-mod-wsgi-py3"

apt -y install apache2-dev # required for building the mod_wsgi module

cd /opt
wget https://github.com/GrahamDumpleton/mod_wsgi/archive/4.7.1.tar.gz
tar xvf 4.7.1.tar.gz

cd mod_wsgi-4.7.1
./configure --with-python=/usr/bin/python3.8 && make && make install && \
echo 'LoadModule wsgi_module /usr/lib/apache2/modules/mod_wsgi.so' > /etc/apache2/mods-available/wsgi.load && \
a2enmod wsgi && systemctl restart apache2

cd ..
rm -rf mod_wsgi-4.7.1
rm 4.7.1.tar.gz


if [[ ! -z spcAvailable ]]
then
	apt -y remove software-properties-common
	echo;
	echo "Several packages were installed as dependencies for this script."
	echo "It is recommended to remove them using 'apt autoremove', then reboot, as they consume a lot memory."
fi

echo Done
