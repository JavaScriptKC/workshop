(function () {

  var socket = io.connect('http://nodelabs.herokuapp.com:80');
  //var socket = io.connect('http://localhost:3000');

  socket.on("connect", function () {
    var username = whoami();
    if (username) {
      socket.emit("username", username);
    }
  });

  socket.on("user", function (user) {
    saveToCache("user", user);
  });

  socket.on("settings", function (settings) {
    saveToCache("settings", settings);
  });

  var whoami = function () {
    var cookieValue = $.cookie("username");

    if (cookieValue) return cookieValue;
    else {
      saveToCache("user", {});

      if (window.location.pathname != "/") {
        return window.location.href = "/";
      }
    }
  };

  var promptForUsername = function (e) {
    e.preventDefault();

    var username = prompt("Whats your name? This helps us track your progress.");
    
    if (!username || username.trim() === '')  
      return;

    $.cookie("username", username);
    var location = $(this).attr('href');
    socket.emit("username", username, function () {
      document.location.href = location;
    });
  };

  var saveToCache = function (key, data) {
    $.cookie(key, JSON.stringify(data));
  };

  var loadFromCache = function (key) {
    return JSON.parse($.cookie(key) || "{}");
  };

  var injectYourUsername = function (index, element) {
    var html = $(element).html();
    var replaced = html.replace(/your-username/g, whoami());

    if (html != replaced) {
      $(element).html(replaced);
    }
  };

  $(document).ready(function () {
    if (!$.cookie("username")) {
      $("#next .userprompt a").click(promptForUsername); 
    }
    else {   
      var thisPage = window.location.pathname;
      var url = "http://nodelabs.herokuapp.com/" + encodeURIComponent(whoami()) + thisPage;
      
      $.ajax(url, { dataType: "jsonp" });
    }

    $("code").each(injectYourUsername);
  });

})();
