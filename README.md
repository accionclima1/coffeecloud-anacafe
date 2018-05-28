# Coffee Cloud App

Coffee Cloud App for Anacafe

## Getting Started

This is an hybrid app using web technologies to generate cross-platform applications from a single source code.

## Prerequisite Technologies
### Linux
* *Node.js* - <a href="http://nodejs.org/download/">Download</a> and Install Node.js, nodeschool has free <a href=" http://nodeschool.io/#workshoppers">node tutorials</a> to get you started. We recommend node-4.x as the preferred node version to run mean stack.
* *MongoDB* - <a href="https://www.mongodb.org/downloads">Download</a> and Install mongodb - <a href="https://docs.mongodb.org/manual/">Checkout their manual</a> if you're just starting.

If you're using ubuntu, this is the preferred repository to use...

```bash
$ curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
$ sudo apt-get update
$ sudo apt-get install nodejs
```

* *Git* - Get git using a package manager or <a href="http://git-scm.com/downloads">download</a> it.

### Windows
* *Node.js* - <a href="http://nodejs.org/download/">Download</a> and Install Node.js, nodeschool has free <a href=" http://nodeschool.io/#workshoppers">node tutorials</a> to get you started.
* *MongoDB* - Follow the great tutorial from the mongodb site - <a href="https://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/">"Install Mongodb On Windows"</a>
* *Git* - The easiest way to install git and then run the rest of the commands through the *git bash* application (via command prompt) is by downloading and installing <a href="http://git-scm.com/download/win">Git for Windows</a>

### OSX
* *Node.js* -  <a href="http://nodejs.org/download/">Download</a> and Install Node.js or use the packages within brew or macports.
* *MongoDB* - Follow the tutorial here - <a href="https://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/">Install mongodb on OSX</a>
* *git* - Get git <a href="http://git-scm.com/download/mac">from here</a>.

## Prerequisite packages

*  currently uses grunt as a build tool and bower to manage frontend packages.
```
$ npm install -g grunt
// and bower
$ npm install -g bower
```

### Installing

Install dependencies 

```
use npm install to begin


```

End with an example of getting some data out of the system or using it for a little demo

## Running the app

```
node ./bin/www to launch express app
```

## Remote deployment

ssh -i ~/.ssh/coffeecloud.pem ubuntu@coffeecloud.centroclima.org


cd apps/coffeecloud/Coffee-Cloud

sudo forever start bin/www
sudo git pull
sudo forever stopall


##for DB access

user: "cafenube",
pwd: "Sec03lP1nt0"
db name: dummyDB
ssh -N -L 8888:127.0.0.1:80 -i ~/.ssh/coffeecloud.pem bitnami@coffeecloud.centroclima.org


sudo fuser -k 80/tcp