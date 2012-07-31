var number = 1;

var count = function () {
   console.log(number);
   number = number + 1;
};

while (number <= 10) {
   count();
}

console.log("Hello from down here!");