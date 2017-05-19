#!/bin/sh

# install git
sudo yum install git

# install node and npm
sudo yum install nodejs npm --enablerepo=epel

# install gulp globally
sudo npm install gulp -g

# install aglio globally (for api blueprint)
sudo npm install aglio -g

# install mocha globally
sudo npm install mocha -g

#setup mongo
#
#use admin
#
#db.createUser(
#  {
#    user: "gagouser",
#    pwd: "111111",
#    roles: [ { role: "root", db: "admin" } ]
#  }
#);