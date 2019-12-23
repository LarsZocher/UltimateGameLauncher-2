"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _Switch = _interopRequireDefault(require("../../../containers/Switch"));

var config = require("../../../config");

function init() {
  _reactDom["default"].render(_react["default"].createElement(_Switch["default"], {
    checked: config.data.settings.update.updatesOnStartup,
    id: "updates-o-s"
  }), document.getElementById('updates-o-s-c'));

  _reactDom["default"].render(_react["default"].createElement(_Switch["default"], {
    checked: config.data.settings.update.checkForUpdates,
    id: "check-f-u"
  }), document.getElementById('check-f-u-c'));

  $("#updates-o-s").click(function () {
    config.set("settings.update.updatesOnStartup", $(this).prop('checked'));
    config.saveData();
  });
  $("#check-f-u").click(function () {
    config.set("settings.update.checkForUpdates", $(this).prop('checked'));
    config.saveData();
  });
}

module.exports = {
  init: init
};