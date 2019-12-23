"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Config =
/*#__PURE__*/
function () {
  function Config(name) {
    (0, _classCallCheck2["default"])(this, Config);
    var data = {};
    var fileName = name;
    var isLoaded = false;

    var fs = require('fs');

    var path = require('path');

    var electron = require('electron');

    var app;
    if (electron.remote) app = electron.remote.app;else app = electron.app;
    if (!isLoaded) load();
  }

  (0, _createClass2["default"])(Config, [{
    key: "load",
    value: function load() {
      var config = path.join(app.getPath("userData"), name);
      console.log("[Config] loading: " + config);

      if (fs.existsSync(config)) {
        var rawdata = fs.readFileSync(config);
        data = JSON.parse(rawdata);
      }

      isLoaded = true;
    }
  }, {
    key: "save",
    value: function save() {
      var config = path.join(app.getPath("userData"), name);
      fs.writeFile(config, JSON.stringify(data, null, 2), function (err) {
        if (err) {
          console.log(err);
        }

        console.log("[Config] Saved: " + name);
      });
    }
  }, {
    key: "set",
    value: function set(path, obj) {
      var parts = path.split(".");
      var currentPath = data;

      for (var i = 0; i < parts.length; i++) {
        var part = parts[i];

        if (!isset(currentPath[part])) {
          currentPath[part] = {};
        }

        if (i == parts.length - 1) currentPath[part] = obj;
        currentPath = currentPath[part];
      }
    }
  }, {
    key: "setDefault",
    value: function setDefault(path, obj) {
      var parts = path.split(".");
      var currentPath = data;

      for (var i = 0; i < parts.length; i++) {
        var part = parts[i];

        if (!isset(currentPath[part])) {
          if (i == parts.length - 1) {
            if (!isset(currentPath[part])) currentPath[part] = obj;
            return;
          }

          currentPath[part] = {};
        }

        currentPath = currentPath[part];
      }
    }
  }]);
  return Config;
}();

function issetval(obj, value) {
  return isDefined(obj[value]) && obj[value] != "null";
}

function isset(obj) {
  return isDefined(obj) && obj != "null";
}

function isDefined(object) {
  return typeof object !== 'undefined';
}

module.exports = Config;