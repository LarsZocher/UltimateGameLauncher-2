"use strict";

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _Test = _interopRequireDefault(require("../containers/Test.js"));

var _Switch = _interopRequireDefault(require("../containers/Switch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_reactDom["default"].render(_react["default"].createElement(_Switch["default"], {
  checked: true
}), document.getElementById('game-c'));