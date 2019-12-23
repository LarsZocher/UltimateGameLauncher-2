"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _react = _interopRequireDefault(require("react"));

var Switch =
/*#__PURE__*/
function (_React$Component) {
  (0, _inherits2["default"])(Switch, _React$Component);

  function Switch(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, Switch);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Switch).call(this, props));
    _this.state = {
      checked: false
    };

    _this.toggleButton = function () {
      //console.trace();
      _this.setState({
        checked: !_this.state.checked
      });
    };

    if (props.checked) _this.state.checked = props.checked;
    return _this;
  }

  (0, _createClass2["default"])(Switch, [{
    key: "render",
    value: function render() {
      console.log(this.state.checked);
      return _react["default"].createElement("div", {
        className: "onoffswitch"
      }, _react["default"].createElement("input", {
        type: "checkbox",
        name: "onoffswitch",
        className: "onoffswitch-checkbox",
        checked: this.state.checked,
        onChange: this.toggleButton,
        id: this.props.id
      }), _react["default"].createElement("label", {
        className: "onoffswitch-label",
        htmlFor: this.props.id
      }, _react["default"].createElement("span", {
        className: "onoffswitch-inner"
      }), _react["default"].createElement("span", {
        className: "onoffswitch-switch"
      })));
    }
  }]);
  return Switch;
}(_react["default"].Component);

exports["default"] = Switch;