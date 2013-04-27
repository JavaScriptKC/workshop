(function () {

  var socket = io.connect('http://nodelabs.herokuapp.com:80');
  //var socket = io.connect('http://localhost:4040');

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
      $("#next .userprompt a").click(function (e) {
        e.preventDefault();

        var username = prompt("What's your twitter username?");
        $.cookie("username", username);

        $("#next .stop").show();
        $("#next .userprompt").hide();
        socket.emit("username", whoami());
      });
    }
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
    var nextPage;

    if (!$.cookie("username")) return;

    if (thisPage == "/" || thisPage == "index.html") {
      nextPage = settings.allowFirstLab ? {
        url: "/repl.html",
        title: "1. REPL Lab"
      } : null;
    }

    if (nextPage) {
      var text;

      if (thisPage == "/") text = "And we&rsquo;re off! Start on the first lab.";
      else text = "Keep it up! Continue on to the next lab.";

      var container = $("#next");

      container.removeClass("disabled").html("<a>" + text + "<span></span></a>");
      $("a", container).attr("href", nextPage.url);
      $("span", container).text(nextPage.title);
    }
  };

  $(document).ready(function () {
    socket.emit("username", whoami());
    updateUI();
  });

})();
