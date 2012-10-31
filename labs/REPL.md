# Node REPL

## Overview

In this lab you'll learn how to use the Node REPL to execute ad-hoc JavaScript statements. By the end you should be comfortable defining strings, objects, arrays, and functions.

### Time 

30 minutes

### Objectives

- How to start the Node REPL
- How to execute statements
- How to interact with Arrays
- How to interact with Objects
- How to define functions
- How to execute multi-line statements
- How to exit the Node REPL

## Starting the Node REPL

To launch the Node REPL open a command prompt or terminal and execute ```node```. Once open, evaluate a few simple expressions

```JavaScript
> 1 + 5
6
> function add(a, b) { return a + b; }
undefined
> add(1, 5)
6
```

Notice the result of the statement executed is printed on the following line without ```>```. 

If you forgot to assign the value of the previously executed statement, the Node REPL provides a useful syntax to access the previous result.

```JavaScript
> "Node Rocks!"
"Node Rocks!"
> _
"Node Rocks!"
> var lastResult = _
undefined
> lastResult
"Node Rocks!"
```

## Arrays

There are a few different ways to create arrays in JavaScript. First, you can use the array syntax, for example ```[1,3,3,7]```. This will create an array with four elements. A major difference between arrays in JavaScript and many other languages is that they are mutable and the size is not required to create. Another way of creating an array is with the ```Array``` constructor. 
    
  * The array Initializer:

    ```JavaScript
    > [1, 2]
    [1, 2]
    > [1,2].length
    2
    ```
  * Using the array constructor function:

    ```JavaScript
    > new Array()
    []
    > _.length
    0
    ```

Adding an item to an array:

```JavaScript
> var a =  ['apple', 'banana', 'kiwi']
['apple', 'banana', 'kiwi']
> a.length
3
> a.push("lemon")
4 //push returns the size of the array after the push operation completes
> a.unshift("lime") 
5 //unshift adds an element to the beginning of the array and returns the new length
```

Removing an item from an array: 

```JavaScript
> a
['lime', 'apple', 'banana', 'kiwi', 'lemon']
> a.pop()
'lemon' //pop removes and returns the last value in the array.
> a.shift()
'lime' //shift removes and returns the first value in the array.
```

Copying an array:

```JavaScript
> a
['apple', 'banana', 'kiwi']
> a.slice(0, 1)
['apple'] //slice can be used to copy a portion of an array to a new array. The first argument is the start index and the second argument is the end index. This is not inclusive on the end.
> a
['apple', 'banana', 'kiwi'] //the array is not changed.
> a.slice(0)
['apple', 'banana', 'kiwi'] //Provides a way to copy the entire array.
```

## Objects

There's two primary ways to create a JavaScript object: ```var o = {}``` and ```var o = new Object()```.

Setting properties using the dot syntax:

```JavaScript
> var o = {}
undefined
> o.foo
undefined
> o.foo = 'bar'
'bar'
> o.foo.length
3
```

Properties using the array syntax:

```JavaScript
> o['foo']
'bar'
> o['foo'].length //This also allows for object properties to have spaces or other special characters.
3
```

Objects can be composed of other objects: 


```JavaScript
> o.bar = [1, 2, 3, 4]
[1, 2, 3, 4]
> o.bar.length
4
> o.foobar = function () { return 'foo bar!'; }
[Function]
> o.foobar()
'foo bar!'
> o['foobar']()
'foo bar!'
```

## Functions

1. JavaScript functions are declared using the ```function``` keyword. 

```JavaScript
var Foo = function () { }
```

1. Functions that do not have a name are *Anonymous Functions*. These are commonly used as callback arguments to other functions.

```JavaScript
//Anonymous function declaration
function () { }

//Declare a function that takes a callback argument
var Foo = function (callback) {
    //Foo function body
    callback();
}

//An anonymous function used as a callback argument
Foo(function () {
    //Callback function body
});
```

## Multi-line statements

1. The Node REPL allows for multi-line statements to be executed. When a line cannot be processed as a complete JavaScript statement the Node REPL prompts for more input (this example starts a functional closure but does not terminate it with a closing bracket):

```
> var boo = function () {
... 
```

1. The ```...``` indicates that the Node REPL expects more input. ```CTRL+C``` can be used to terminate the multi-line statement. Now, define a multi-line function and execute it: 

```JavaScript
> var boo = function () {
..... return "Hello World!";
..... }
undefined
> boo()
'Hello World!'
```

## Exiting the REPL

Exiting the Node REPL can be done many ways including killing the process. However, the most common way is by pressing ```CTRL+C``` twice. 

### Exiting Node programatically:

```JavaScript
process.exit()
```
