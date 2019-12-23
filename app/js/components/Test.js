"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Test = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _react = _interopRequireWildcard(require("react"));

var e = _react["default"].createElement;

var Test =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(Test, _Component);

  function Test() {
    (0, _classCallCheck2["default"])(this, Test);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Test).apply(this, arguments));
  }

  (0, _createClass2["default"])(Test, [{
    key: "render",
    value: function render() {
      var _this = this;

      return 'button', {
        onClick: function onClick() {
          return _this.setState({
            liked: true
          });
        }
      }, 'Like';
    }
  }]);
  return Test;
}(_react.Component);

exports.Test = Test;