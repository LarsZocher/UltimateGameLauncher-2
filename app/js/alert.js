"use strict";

var fs = require('fs');

var path = require("path");

var hasContent = false;
var isVisible = false;

function setContent(page) {
  var data = fs.readFileSync(path.resolve("assets/pages/" + page));
  var container = $("#alert-container").get(0);
  container.innerHTML = data;
  var scripts = container.getElementsByTagName("script");

  for (var i = 0; i < scripts.length; i++) {
    eval(scripts[i].innerText);
  }
}

function show() {
  $("#alerts").css("display", "grid");
  this.isVisible = true;
}

function hide() {
  $("#alerts").css("display", "none");
  this.isVisible = false;
}

module.exports = {
  setContent: setContent,
  show: show,
  hide: hide,
  isVisible: isVisible
};