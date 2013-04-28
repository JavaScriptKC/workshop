(function () {

  var socket = io.connect('http://nodelabs.herokuapp.com:80');
  //var socket = io.connect('http://localhost:4040');

  socket.on("connect", function () {
    socket.emit("username", whoami());
  });

  socket.on("user", function (user) {
    saveToCache("user", user);
    updateUI();
  });

  socket.on("settings", function (settings) {
    saveToCache("settings", settings);
    updateUI();
  });

  var whoami = function () {
    var cookieValue = $.cookie("username");

    if (cookieValue) return cookieValue;
    else {
      saveToCache("user", {});

      if (window.location.pathname != "/") {
        return window.location.href = "/";
      }

      $("#next .stop").hide();
      $("#next .userprompt").show();
    }
  };

  var promptForUsername = function (e) {
    e.preventDefault();

    var username = prompt("Pick a username!");
    $.cookie("username", username);

    $("#next .stop").show();
    $("#next .userprompt").hide();
    socket.emit("username", whoami());
  };

  var saveToCache = function (key, data) {
    $.cookie(key, JSON.stringify(data));
  };

  var loadFromCache = function (key) {
    return JSON.parse($.cookie(key) || "{}");
  };

  var updateUI = function () {
    var thisPage = window.location.pathname;
    var settings = loadFromCache("settings");
    var user = loadFromCache("user");
    var canContinue = false;

    if (!$.cookie("username")) return;

    if (thisPage == "/" || thisPage == "index.html") {
      canContinue = settings.allowFirstLab;
    }
    else {
      canContinue = user.completed && user.completed[thisPage];
    }

    var stop = $("#next .stop");
    var next = $("#next .continue");

    if (canContinue) {
      stop.hide();
      next.show();
    }
    else {
      stop.show();
      next.hide();
    }
  };

  var unlockNextLab = function (e) {
    e.preventDefault();

    var thisPage = window.location.pathname;
    var url = "http://nodelabs.herokuapp.com/" + encodeURIComponent($.cookie("username")) + thisPage;
    
    $.ajax(url, { dataType: "jsonp" });
  };

  $(document).ready(function () {
    $("#next .userprompt a").click(promptForUsername);
    $("a.unlock").click(unlockNextLab);

    updateUI();
  });

})();
