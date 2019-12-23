"use strict";

var Config = require("./config");

var userConfig = new Config("user-config.json");
module.exports = userConfig;