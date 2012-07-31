var number = 1;

var count = function () {
   console.log(number);
   number = number + 1;
};

var loop = function () {
   if (number <= 10) {
      count();
      process.nextTick(loop);
   }
}

loop();

console.log("Hello from down here!");