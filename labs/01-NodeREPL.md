#Getting started with the Node REPL

##Take-aways

##Step 1

- Launch the Node REPL

```JavaScript
> node
```

- Evaluate a few simple expressions

```JavaScript
> 1 + 5
6
> function add(a, b) { return a + b; }
undefined
> add(1, 5)
6
```

If we want to keep the result around from the function invocation we can type this:

```JavaScript
> var result = _
undefined
> result
6
```

Working with arrays. There are a few different ways to create arrays in JavaScript. First, you can use the array syntax ```[1,3,3,7]```. This will create an array with four elements. A difference between arrays in JavaScript and many other languages is that they are mutable. It is not required to specify the size of an array at creation time. Although, it's more performant it's not required. The second way of creating an array is with the ```Array``` constructor. Give these examples a try.

```JavaScript
> []
[]
> [].length
0
> new Array() //using the Array constructor function
[]
> var a =  ['apple', 'banana', 'kiwi'] //using the array initializer syntax
['apple', 'banana', 'kiwi']
> a.length
3
> a.push("lemon")
4 //push returns the size of the array after the push operation completes
> a.unshift("lime") 
5 //unshift adds an element to the beginning of the array and returns the new length
> a
['lime', apple', 'banana', 'kiwi', 'lemon']
> a.pop()
'lemon' //pop removes and returns the last value in the array.
> a.shift()
'lime' //shift removes and returns the first value in the array.
> a.slice(0, 1)
['apple', 'banana' ] //slice can be used to copy a portion of an array to a new array. 
> a
['apple', 'banana', 'kiwi'] //the array is not changed.
> a.slice(0)
['apple', 'banana', 'kiwi'] //Provides a way to copy the entire array.
```

#Objects

There's two primary ways to create a JavaScript object ```var o = {}``` and ```var o = new Object()```

```JavaScript
> var o = {}
{}
> o.foo
undefined
> o.foo = 'bar'
'bar'
> o.foo.length
3
> o['foo'].length //Objects can be accessed using the array syntax. This also allows for object properties to have spaces or other special characters.
3
> o.bar = [1, 2, 3, 4]
[1, 2, 3, 4]
> o.bar.length
4
> o.foobar = function () { console.log('foo bar!') }
[Function]
> o.foobar()
'foo bar!'
> o['foobar']()
'foo bar!'
```