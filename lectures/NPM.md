# NPM (Node Package Manager)

Node package manager is without a doubt one of the reasons Node.js has become so popular. NPM is not the only package manager that was created in response to Node.js but it's definitely the most widely used and is well maintained. Since members of the community have accepted it as the go to place to modules it has been pulled into Node core.

Other languages and platforms provide similar package managers for example Ruby Gems is the go to place to find packages for Ruby. Examples of other package managers include:

* C# - NuGet (http://nuget.org) with an awesome extension called "Chocolatey NuGet" for command line installation of common windows binaries.

* Python - PyPm

* Debian - aptitude

NPM was created by Isaac Schlueter who is also the primary gate keeper for the main Node.js project. 

Package managers do the heavy lifting for many mundane tasks including installing, packaging, downloading, building, and most importantly resolving complex dependency trees.

Anyone has the ability to create an NPM package. Some might think this is a flaw in the design because of potential name squatters. This problem, however, has not plagued the Node community at all. As a matter of fact, the community has been very responsible when it comes to name collisions. 

NPM provides statistics on its main website that can help those in search of a new package to have an idea of what they're getting. Simple statistics such as total downloads on a weekly basis and overall can answer the question of is this package still used by others. Number of dependents of a package is also an excellent indicator of how useful and stable a package is.

![An example of a highly depended on module.](https://raw.github.com/nodekc/workshop/master/lectures/images/underscore_npm.png)

NPM is managed through a command line interface using the command ```npm```. There's a ton of arguments that can be provided to perform different actions. The full list of arguments can be discovered by executing ```npm -l```.

The most commonly used npm commands are: 

* install <package name|location|git repo|tgz> (to install a package in node_modules)
* init (to create the packages.json file)
* docs <package name> (to open the doc's page for a package)
* link  <location> (to link to a package locally during development)

### npm install

One of the sweetest things about NPM is that you can install from a variety of locations. Most commonly, however, packages are installed from the npmjs.org repository. 

## What is an NPM package?

a) a folder containing a program described by a package.json file

b) a gzipped tarball containing (a)

c) a url that resolves to (b)

d) a <name>@<version> that is 
published on the registry with (c)

e) a <name>@<tag> that points to (d)

f) a <name> that has a "latest" tag satisfying (e)

g) a git url that, when cloned, results in (a).

### Package.json

* Name
* Version
* Engines
* Scripts
* Author
* Main
* Directories

### .npmignore

Allows you to keep out unwanted directories or files from being published to NPM. If this file does not exist NPM will abide by .gitignore if it is present. The .npmignore file will completely override the .gitignore.

## Publishing a package 

```npm adduser```

```npm publish```

Keep in mind that everything in your package directory will be published unless it's in the .gitignore or .npmignore files.






