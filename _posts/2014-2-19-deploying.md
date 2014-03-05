---
layout: post
title: "Setting up a production Node.js + Nginx environment"
author: NodeKC
tags:
---

# Introduction
Node scales by the process. This is achieved by setting up multiple node processes that accept connections on a non standard port and setting up a reverse proxy to route connections. In this lab we'll work through deploying several node processes and configuring an nginx reverse proxy to route traffic. The configuration we'll be using will be for a simple case. Advanced configuration of nginx and operating systems will not be covered because of the wild difference between implementations. These instructions have been designed with the use of an Ubuntu AMI from AWS (amazon web services).

# Node Environment

EC2 -> Launch Instance -> Free tier -> Ubuntu Server 13.10 - ami-ace67f9c (64-bit) / ami-aae67f9a -> Free Micro Instance -> Configure security group (step 6, at the top before launching instance) -> Enable http 80 and https 443 -> Launch -> Select a new key pair (very important to keep this around)

Locate the public ip address for the virtual machine you just created. You can ssh into it with the following command. Assuming your .pem file is in the same directory as you're running the command.

{% highlight bash %}
ssh -i node.pem ubuntu@54.213.246.161
{% endhighlight %}

## Installing Node

Node has great instructions on how to install from apt-get [here](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager).  The important part is here:

{% highlight bash %}
sudo apt-get update
sudo apt-get install -y python-software-properties python g++ make
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs

sudo ln -s /usr/bin/node /usr/bin/nodejs
{% endhighlight %}

This sets up a new aptitude repository where the most recent stable version of node should be available. At the time of this writing the official ubuntu repositories had an out-dated version of node.

Verify your installation

{% highlight bash %}
node -v
{% endhighlight %}

# Setting up a node process

Let's start by creating a simple node web application using express. From your home directory:

{% highlight bash %}
> mkdir node_app
> cd node_app
> npm init
{% endhighlight%}

Run through the prompts to initialize your package.json file.

{% highlight bash %}
npm install express --save
{% endhighlight %}

This will install express and update your package.json file.

Now create a file named `server.js` and add the following contents to create a basic web application with express.

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

Let's start the process and run a quick curl request. Notice that the port specified is 3000.

{% highlight bash %}
node server.js&
curl -I localhost:3000
{% endhighlight %}

Now kill the process and let\'s continue.

{% highlight bash %}
killall node
{% endhighlight %}

## Cluster

We'll start scaling Node using a built in technique. The cluster module that's part of the core node library is an option. In the current version of node (v0.10.\*) the cluster module doesn't appropriately route traffic to child processes. Node leaves the routing of incoming connections to the operating system.  Unix based operating systems do a poor job of distributing new connections amongst child processes. Windows is not affected by this issue. In the next stable version of Node the distribution of incoming connections will be handled by node and by default use a round-robin approach. Despite the fact that it's not a great choice to use at this time we're going to cover how it works.


### Master and child

The structure for using the cluster module is extremely simple.

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

There's a sleight of hand going on in this example. It looks as though all child processes are listening on port 3000. What's actually happening is that the master process is requesting the handle to the port from the operating system. When the child process requests that same port it's provided with the already acquired handle. Each of these processes is now accepting connections on that port. The operating system is responsible for routing requests to each process. As mentioned before, this will change in the next stable version of node.

## Multiple processes

Let's see how we can get another process up and running. This time we're going to change the port specification line to look at the environment. It's recommended to store the port configuration for a node process in the environment for the process. If you have not read about 12 factor applications now's a good time. [12 factor applications](http://12factor.net/) is a highly recommended starting point for creating scalable applications.

Change the port configuration line to this.

{% highlight javascript %}
//pull port configuration from the environment
app.set('port', process.env.PORT || 3000);
{% endhighlight %}

Now when we launch our process we can set the PORT environment variable. Let's try it by running passing different ports to a few node processes.

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

Alright, now we see how we can configure node process to listen on different ports via an environment variable. Let's see how to manage the lifetime several processes.

## Forever

Forever is an executable that's responsible for keeping a given process alive. If the process crashes, it's the responsibility of forever to start it again. Processes will die. This is a fundamental fact. It's worth mentioning that if a process encounters an unexpected exception it should terminate completely. This is recommended because the state of the process may be unknown. It's usually just as easy to start a brand new process than to deal with one in possibly an invalid state.

{% highlight bash %}
sudo npm install forever -g
{% endhighlight %}

Now we can use forever to ensure our node server continues running.

{% highlight bash %}
PORT=4000 forever start server.js
{% endhighlight %}

Now, let\'s find the process id of the newly started process and kill it.

{% highlight bash %}
ps -ax | grep node
{% endhighlight %}

You'll see a line like this:

{% highlight bash %}
7076 ?        Sl     0:00 /usr/bin/nodejs /home/ubuntu/node_app/server.js
{% endhighlight %}

Let's kill that process.

{% highlight bash %}
kill -9 7076
{% endhighlight %}

Re-run the process grep and you should see a new process id assigned to the node process! Great! Now we have a way to keep the process running. The next step handle keeping processes running after a system restart.


## Upstart
[This script was borrowed from here](https://www.exratione.com/2013/02/nodejs-and-forever-as-a-service-simple-upstart-and-init-scripts-for-ubuntu/)

{% highlight bash %}
#!upstart

description "Example upstart script for a Node.js process"

start on startup
stop on shutdown
expect fork

# The full path to the directory containing the node and forever binaries.
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


## Cluster

# Reverse proxy via nginx
- basic configuration for a single node process or straight to a cluster?
- ssl
- discuss HAProxy

# Redis and MongoDB
