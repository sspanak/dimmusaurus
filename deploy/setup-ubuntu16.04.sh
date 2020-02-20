#!/bin/bash

PROJECT_ROOT="www/ds"
ENV_NAME="dsenv"

sudo apt update

# Python 3.8 setup
# Ubuntu 16.04 does not support Python 3.8 officially, so we do the following hacks
sudo apt -y install software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt -y install python3.8 python3.8-dev python3.8-venv python3.8-distutils python3-setuptools
sudo python3.8 -m easy_install pip

# Other requirements setup
sudo apt -y install apache2 libapache2-mod-wsgi-py3
sudo python3.8 -m pip install virtualenv

# Project setup
mkdir -p $PROJECT_ROOT
cd $PROJECT_ROOT
virtualenv -q -p /usr/bin/python3.8 $ENV_NAME
source $ENV_NAME/bin/activate
pip install Django==3.0.2 markdown2 django-markdown-deux
deactivate

# Optionally:
# sudo apt remove software-properties-common
# sudo apt autoremove
