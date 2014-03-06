---
layout: post
title: "JavaScript must-knows"
author: NodeKC
tags:
---

# JavaScript must-knows

JavaScript is a language that many developers are familiar with but lack a deep understanding. The language lends itself to new programmers, in part, because of its simple syntax. Many fundamental concepts and features of the language can be overlooked with a simple procedural approach. The goal of this lab is to give you a better understanding of some core concepts and important language features of JavaScript.

## What is ```this```?

Have a look at this snippet and pay special attention to the use of the keyword ```this```.

{% highlight javascript %}
var obj = {
   doSomething: function () {
      this.a = "bob";

      function doAnotherThing () {
         console.log("Name: " + this.a);
      };

      console.log("Name: " + this.a);
      doAnotherThing();
   }
};

//What does this print?
obj.doSomething();
{% endhighlight %}

Those unfamiliar with how ```this``` is handled may think the call to ```obj.doSomething``` would output the following (assuming the snippet above is saved in a file named `this.js`:

{% highlight bash %}
> node this.js
Name: bob
Name: bob
{% endhighlight %}

This is a very common mistake. What is actually output is this:


{% highlight bash %}
> node this.js
Name: bob
Name: undefined
{% endhighlight %}

Here is another example and then we will explain what is going on.

{% highlight javascript %}
function Adder (a) {
   this.a = a;
};

Adder.prototype.addAsync = function (b) {
   setTimeout(function () {
      console.log(this.a + b);
   }, 10);
};

var r = new Adder(5);
r.addAsync(10);

{% endhighlight %}

This example is supposed to add two numbers together after 10 milliseconds. What is the output of this example? Some may think it would print 15, the result of 5 + 10. The correct answer is ```NaN```. Why? The answer lies in the value of ```this```.

If there is anything you will walk away from after this lab I hope you no longer write bugs that involve ```this```.

The value of ```this``` is the object that a function is defined on. Inner functions or function calls that are not a part of the object will have the default object set to ```this```. The default object in browsers is ```window``` and in Node.js is ```global```.

{% highlight javascript %}
var obj = { a: "Example" };

var printer = function () {
   console.log(this);
   console.log(this.a);
};

obj.p = printer;

printer() // => undefined

obj.p() // => Example
{% endhighlight %}

Notice how the value of the call to ```printer``` that was not attached to an object was ```undefined```. Once we set the property p to the printer function and invoke it you will see that this now refers to the object defined. When an object is created from a constructor function using the new keyword, a brand new object is set to ```this```. For example:

{% highlight javascript %}
var ctor = function (a) {
   this.a = a;
};

ctor.prototype.print = function () {
   console.log(this.a);
};

var o1 = new ctor('test1');
o1.print(); // => test1

var o2 = new ctor('test2');
o2.print(); // => test2
{% endhighlight %}

So, you have seen the default behavior of how JavaScript handles the ```this``` keyword. The value of ```this``` can be controlled in a function call via a few methods available on Function.prototype ```apply```, ```call```, and ```bind```. Each of these methods allow you to modify the value of this when the function is called. The first two options (apply and call) invoke the function immediately, whereas the third (bind) provides a new function with ```this``` bound. The value of ```this``` is the first argument to each of these methods. Here is an example:

{% highlight javascript %}
var obj = { a: "Example" };

//Note this is not defined on obj
var printer = function () {
   console.log(this.a);
};

var newPrinter = printer.bind(obj); // Not immediately invoked

newPrinter();       // => "Example"
printer.apply(obj); // => "Example"
printer.call(obj);  // => "Example"
{% endhighlight %}

The difference between ```apply``` and ```call``` is that `apply` allows you to invoke the function with the arguments as an array; ```call``` requires the parameters to be listed explicitly.


# Var

The keyword ```var``` is used to define variables. Unfortunately, JavaScript does not require the use of this keyword when defining variables. Forgetting to leave off the var keyword can pollute the global object with unnecessary properties. It can also create innocent looking bugs. Have a look at the following example, What is the output?

{% highlight javascript %}
function doStuff() {
   for (i = 0; i < 5; i++) {
      console.log(i);
   }
}

function example() {
   for (i = 0; i < 5; i++) {
      doStuff();
   }
}

example();
{% endhighlight %}

At first glance it looks like it would output the numbers 0 to 5 - 5 times. Sadly, it does not; instead it outputs the number 0 - 5 just once! What is the problem? It is the fact that this example omits the use of the var keyword. To fix this we must declare the loop control variables within the function. Fixing the above example looks like this (note the use of var):

{% highlight javascript %}
function doStuff() {
   var i;
   for (i = 0; i < 5; i++) {
      console.log(i);
   }
}

function example() {
   for (var i = 0; i < 5; i++) {
      doStuff();
   }
}

example();
{% endhighlight %}

Using JavaScripts strict mode will prevent you from defining properties on the global object. There are other advantages to using strict mode, but this one is my favorite. Strict mode is applied within an execution context instead of over the entire JavaScript VM. To enable strict mode simple include the string ```"use strict";``` at the top of an execution context. Here is an example of using strict mode just for a single function.

{% highlight javascript %}
var strictFunction = function () {
  "use strict";
  x = 1; // => Throws error because of strict mode!
};

var notSoStrictFunction = function () {
   a = 1; // Still assigns a to the global object because "use strict" has not been applied to this execution context. No error is thrown.
};

strictFunction(); //throws error because x has not been defined
notSoStrictFunction(); // No problem defining a on the global object
{% endhighlight %}

# Use ```===``` over ```==```

It\'s highly advised to always use the `===` and `!==` (read as strictly (not) equals) equality operators. The difference between `===` and `==` is that the former enforces that the types of the objects match, so a string can never equal a number. Whereas `==` will return true for `1 == "1"`.

{% highlight javascript %}
// Consider taking input from an input field. This will be a string.
var input = "10";

// Compare the string "10" to the number 10. Because of == the number is coerced to a string.
if (input == 10) {
   console.log(input * 5);
   console.log(input + 5);
}

if (input === 10) {
   console.log('this will not be reached');
}

if ((typeof input == typeof 10) && (input == 10)) {
   console.log('this is essentially the same as ===');
}

{% endhighlight %}

Sometimes it\'s okay to use the double equality but be aware that the objects will be coerced to a common type before performing the equality comparison.
