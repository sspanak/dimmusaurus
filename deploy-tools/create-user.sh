#!/bin/bash

USERNAME="<USERNAME>"

sudo useradd $USERNAME
mkdir -p /home/$USERNAME
chmod +x /home/$USERNAME
chown $USERNAME:$USERNAME /home/$USERNAME
usermod -aG sudo $USERNAME

chsh -s /bin/bash

echo "Created user $USERNAME. Do not forget to change the password!"
