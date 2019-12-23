"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var fs = require('fs');

var path = require('path');

var Config =
/*#__PURE__*/
function () {
  function Config(name) {
    (0, _classCallCheck2["default"])(this, Config);
    this.data = {};
    this.name = name;
    this.isLoaded = false;

    var electron = require('electron');

    this.app;
    if (electron.remote) this.app = electron.remote.app;else this.app = electron.app;
    if (!this.isLoaded) this.load();
  }

  (0, _createClass2["default"])(Config, [{
    key: "load",
    value: function load() {
      var config = path.join(this.app.getPath("userData"), this.name);
      console.log("[Config] loading: " + config);

      if (fs.existsSync(config)) {
        var rawdata = fs.readFileSync(config);
        this.data = JSON.parse(rawdata);
      }

      this.isLoaded = true;
    }
  }, {
    key: "save",
    value: function save() {
      var config = path.join(this.app.getPath("userData"), this.name);
      var name = this.name;
      fs.writeFile(config, JSON.stringify(this.data, null, 2), function (err) {
        if (err) {
          console.log(err);
        }

        console.log("[Config] Saved: " + name);
      });
    }
  }, {
    key: "delete",
    value: function _delete() {
      var config = path.join(this.app.getPath("userData"), this.name);
      fs.unlinkSync(config);
    }
  }, {
    key: "exists",
    value: function exists() {
      var config = path.join(this.app.getPath("userData"), this.name);
      return fs.existsSync(config);
    }
  }, {
    key: "set",
    value: function set(path, obj) {
      var parts = path.split(".");
      var currentPath = this.data;

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
      var currentPath = this.data;

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
  }, {
    key: "get",
    value: function get() {
      return this.data;
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