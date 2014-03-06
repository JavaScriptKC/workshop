---
layout: post
title: "Setting up a production ready Node.js process"
author: NodeKC
tags:
---

# Setting up a production ready Node.js process

## Introduction

Node scales by the process. This is achieved by setting up multiple Node processes that accept connections on a non standard port and setting up a reverse proxy to route connections. In this lab you will learn how to stand up Node processes in fault tolerant way. These instructions have been designed with the use of an Ubuntu AMI from AWS (amazon web services).

## Node Environment

Log into your EC2 dashboard and create a new virtual machine to install Node. You can do this by going to:

* Launch Instance
* Select Free tier
* Ubuntu Server 13.10 - ami-ace67f9c (64-bit) / ami-aae67f9a
* Free Micro Instance
* Configure security group (step 6, at the top before launching instance)
* Enable http 80 and https 443
* Launch
* Select a new key pair (very important to keep this around)

Locate the public ip address for the virtual machine you just created. You can ssh into it with the following command.

{% highlight bash %}
ssh -i node.pem ubuntu@54.213.246.161
{% endhighlight %}

## Installing Node

Node has great instructions on how to install from apt-get [here](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager).  The important part is here:

(Make sure not to copy and paste this because it prompts for input)

{% highlight bash %}
sudo apt-get update
sudo apt-get install -y python-software-properties python g++ make
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs

sudo ln -s /usr/bin/node /usr/bin/nodejs
{% endhighlight %}

This sets up a new aptitude repository where the most recent stable version of Node should be available. At the time of this writing the official Ubuntu repositories had an out-dated version of Node (0.6.7).

Verify your installation.

{% highlight bash %}
node -v
{% endhighlight %}

## Setting up a Node process

Let\'s start by creating a simple Node web application using Express. Express is a framework for creating web applications. Now, from your home directory on the new virtual machine:

{% highlight bash %}
> mkdir node_app
> cd node_app
> npm init
{% endhighlight%}

Run through the prompts to initialize your `package.json` file. It really doesn\'t matter what you respond with.

{% highlight bash %}
npm install express --save
{% endhighlight %}

This will install Express and add it as a dependency to your `package.json` file.

Now create a file named `server.js` and add the following contents to create a basic web application using Express. This example listens on port 3000 and responds to all HTTP verbs at any path with its process id.

{% highlight javascript %}
var express = require('express');
var app = express();
var server = require('http').createServer(app);

app.configure(function () {
   app.set('port', 3000);
});

app.all('*', function (req, res) {
   res.send(200, 'Hello from pid: ' + process.pid + '\n');
});

server.listen(app.get('port'));


console.log('Server listening on port ' + app.get('port'));
{% endhighlight %}

Let\'s start the process and run a quick curl request. Notice that the port specified is 3000.

{% highlight bash %}
node server.js&
curl -I localhost:3000
{% endhighlight %}

Now kill the process and let\'s continue.

{% highlight bash %}
killall node
{% endhighlight %}

### Cluster

We\'ll start scaling Node using the cluster module that\'s part of the core library. As of Node.js v0.10.0 the cluster module doesn\'t evenly distribute traffic to child processes. This is because Node leaves the routing of incoming connections to the operating system. Unfortunately, Unix based operating systems do a poor job of distributing new connections amongst child processes. In part this is because it\'s trying to be efficient by handing off the request to an already foreground process, which in this case is the most recently used. Windows is not affected by this issue because it uses a different scheduling mechanism. In the next stable version of Node the distribution of incoming connections will be handled by Node and use a round-robin approach by default. Despite the fact that it\'s not a great choice to use at this time we\'re going to cover how it works.


### Master and child

The structure for using the cluster module is simple. Require the `cluster` module and it has a property that states whether or not the current process is the master process. If  your process is the master process it\'s responsible for forking child processes. After this it\'s business as usual. Your Node program doesn\'t know any different. Child processes can listen on the same port (3000 in the example below) without a problem. This is because Node has hooks into the points where you request access to a port and hands out an already acquired file descriptor [file descriptor](http://en.wikipedia.org/wiki/File_descriptor) to the child processes.

{% highlight javascript %}
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var cluster = require('cluster');

if (cluster.isMaster) {
   // Spawn 5 child processes as the master.
   for (var i = 0; i < 5; i++) {
      cluster.fork();
   }
}
else {
   // Bootstrap the application. This is child process.
   app.configure(function () {
      app.set('port', 3000);
   });

   app.all('*', function (req, res) {
      res.send(200, 'Hello world!');
   });

   server.listen(app.get('port'));


   console.log('Server listening on port ' + app.get('port'));
}
{% endhighlight %}

## Multiple processes

Let\'s see how we can get another process up and running. This time we\'re going to change the port specification line to look at the environment (access your environment using `SET` on windows and `export` on unix). The environment can hold many application specific settings like connection strings and paths. If you have not read about 12 factor applications now\'s a good time. [12 factor applications](http://12factor.net/) is a highly recommended starting point for creating scalable applications.

Change the port configuration line to this:

{% highlight javascript %}
//pull port configuration from the environment
app.set('port', process.env.PORT || 3000);
{% endhighlight %}

Now when we launch our process we can set the PORT environment variable. Let\'s try it by passing different ports to a few Node processes. We can prime the environment for the process by setting the variables just before launching.

{% highlight bash %}
PORT=4000 node server.js&
PORT=4001 node server.js&
{% endhighlight %}

and test them:

{% highlight bash %}
curl -I localhost:4000
curl -I localhost:4001
{% endhighlight %}

and kill them

{% highlight bash %}
killall node
{% endhighlight %}

Alright, now we see how to configure Node process to listen on different ports via an environment variable. Let\'s see how to manage the lifetime of our Node processes.

## Forever

Forever is an executable that\'s responsible for keeping a given process alive. If the process crashes, forever is there to to start it again. Processes will die. It\'s worth mentioning that if a process encounters an unexpected exception it should terminate completely. This is recommended because the state of the process may be unknown and it\'s better to start in a predictable state. It\'s usually just as easy to start a brand new process and allow other Node processes handle traffic in the meantime.

{% highlight bash %}
sudo npm install forever -g
{% endhighlight %}

Now we can use forever to ensure our Node server continues running.

{% highlight bash %}
PORT=4000 forever start server.js
{% endhighlight %}

Now, let\'s find the process id of the newly started process and kill it.

{% highlight bash %}
ps -ax | grep node
{% endhighlight %}

You\'ll see a line like this:

{% highlight bash %}
7076 ?        Sl     0:00 /usr/bin/nodejs /home/ubuntu/node_app/server.js
{% endhighlight %}

Let\'s kill that process.

{% highlight bash %}
kill -9 7076
{% endhighlight %}

Re-run the grep command above and you should see a new process id assigned to the Node process! Great! Now we have a way to keep the process running. The next step handle keeping processes running after a system restart.


## Upstart
[This script was borrowed from here](https://www.exratione.com/2013/02/nodejs-and-forever-as-a-service-simple-upstart-and-init-scripts-for-ubuntu/)

Place this script in `/etc/init/node_app.conf`.

{% highlight bash %}
#!upstart

description "Example upstart script for a Node.js process"

start on startup
stop on shutdown
expect fork

# The full path to the directory containing the Node and Forever binaries.
# env NODE_BIN_DIR="/home/node/local/node/bin"
# Set the NODE_PATH to the Node.js main node_modules directory.
# env NODE_PATH="/home/node/local/node/lib/node_modules"
# The directory containing the application Javascript file.
# env APPLICATION_DIRECTORY="/home/node/my-application"
# The application start Javascript filename.
# env APPLICATION_START="start-my-application.js"
# Log file path.
# env LOG="/var/log/my-application.log"

env NODE_BIN_DIR="/usr/bin/"
env NODE_PATH="/usr/lib/node_modules"
env APPLICATION_DIRECTORY="/home/ubuntu/node_app"
env APPLICATION_START="server.js"
env LOG="/var/log/node_app.log"

script
    PATH=$NODE_BIN_DIR:$PATH
    exec forever --sourceDir $APPLICATION_DIRECTORY -a -l $LOG \
         --minUptime 5000 --spinSleepTime 2000 start $APPLICATION_START
end script

pre-stop script
    PATH=$NODE_BIN_DIR:$PATH
    exec forever stop $APPLICATION_START >> $LOG
end script
{% endhighlight %}

Now to start the process enter this command:

{% highlight bash %}
> sudo start node_app
{% endhighlight %}

Verify the process is up and running:

{% highlight javascript %}
> ps ax | grep node
{% endhighlight %}

Stopping is simple too:

{% highlight bash %}
> sudo stop node_app
{% endhighlight %}

Now whenever the server restarts it\'ll automatically start the Node process.

{% highlight bash %}
> sudo reboot
{% endhighlight %}

After everything has come back up run our simple process verification again. At this point we know how to set up a Node process and keep it alive in a production environment. We could stop here and serve requests directly from Node. However, many production environments accept requests by means of a [reverse proxy](http://en.wikipedia.org/wiki/Reverse_proxy).

## Reverse proxy and SSL termination via nginx or HAProxy

Most production environments route requests through reverse proxy. This process is meant to terminate SSL and distribute traffic to an appropriate Node process. It can also detect failed Nodes and route traffic around them. A few popular choices for a reverse proxy and SSL termination server are [nginx](http://nginx.org) and [HAProxy](http://haproxy.1wt.eu/). Configuration of each of these ranges from straight forward to extremely complex. Some configurations even use message queuing systems like [RabbitMQ](https://www.rabbitmq.com/) to persist all incoming requests that wait for a Node process to fulfill.
