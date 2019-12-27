"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var Registry = require('winreg');

var Config = require('../config/config');

var fs = require('fs');

var path = require('path');

var vdf = require('simple-vdf');

var userConfig = require("../config/users.js");

userConfig.setDefault("steam", []);

var gamesConfig = require("../config/games.js");

gamesConfig.setDefault("steam", {});

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var user_cache = {};
var apps_cache = {};
var appsUser_cache = {};
var store_cache = {};
var oldConfig = new Config("app_data.json");

if (oldConfig.exists()) {
  userConfig.data.steam = oldConfig.data.users;
  userConfig.save();
  oldConfig["delete"]();
}

function getGames() {
  return new Promise(function (res) {
    var u = 1;

    if (getUsers().length == 0) {
      u = addUsersFromSteam();
    }

    Promise.all([u]).then(function (values) {
      var ids = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = getUsers()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var user = _step.value;
          ids.push(user.steam64id);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      getGamesFromUsers(ids).then(function (data) {
        res(data);
      });
    });
  });
}

function getAppsById(ids) {
  var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return new Promise(function (res) {
    var toRequest = [];
    var inCache = [];

    if (!force) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = ids[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var id = _step2.value;

          if (!(id in apps_cache)) {
            toRequest.push(id);
          } else inCache.push(id);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    } else {
      toRequest = ids;
    }

    if (toRequest.length == 0) {
      var result = [];
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = ids[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var id = _step3.value;
          result.push(apps_cache[id]);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      res(result);
      return;
    }

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var result = JSON.parse(this.responseText);
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = result[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var app = _step4.value;
            apps_cache[app.appId] = app;
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
              _iterator4["return"]();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = inCache[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var id = _step5.value;
            result.push(apps_cache[id]);
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
              _iterator5["return"]();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        res(result);
      }
    };

    for (var i = 0; i < toRequest.length; i++) {
      toRequest[i] = "STEAM_" + toRequest[i];
    }

    xmlhttp.open("GET", "https://ugl.seemslegit.me/api/getGames?uniqueID=" + toRequest.join(","), true);
    xmlhttp.send();
  });
}

function getStoreInfo(appid) {
  return new Promise(function (res) {
    if (store_cache[appid]) {
      res(store_cache[appid]);
      return;
    }

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var result = JSON.parse(this.responseText);
        store_cache[appid] = result;
        res(result);
      }
    };

    xmlhttp.open("GET", "https://store.steampowered.com/api/appdetails?appids=" + appid, true);
    xmlhttp.send();
  });
}

function getGamesFromUsers(users) {
  var includeFree = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  return new Promise(function (res) {
    var cacheName = users.join() + "" + includeFree;
    console.log("[Steam] loading games from user ".concat(users.join(",")));

    if (appsUser_cache[cacheName]) {
      console.log("[Steam] loaded ".concat(appsUser_cache[cacheName].length, " games from users ").concat(users.join(","), " from cache"));
      res(appsUser_cache[cacheName]);
      return;
    }

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        if (this.responseText == "null") {
          res();
          console.log("[Steam] loaded 0 games from users ".concat(users.join(",")));
          return;
        }

        var result = JSON.parse(this.responseText);
        appsUser_cache[cacheName] = result;
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = result[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var app = _step6.value;
            apps_cache[app.appId] = app;
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
              _iterator6["return"]();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }

        console.log("[Steam] loaded ".concat(result.length, " games from users ").concat(users.join(",")));
        res(result);
      }
    };

    xmlhttp.open("GET", "https://ugl.seemslegit.me/api/getGamesFromUsers?id=" + users.join(",") + "&includefree=" + includeFree, true);
    xmlhttp.send();
  });
}

function getSteamUserInfo(steamId) {
  var p;
  return _regenerator["default"].async(function getSteamUserInfo$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!user_cache[steamId]) {
            _context.next = 3;
            break;
          }

          console.log("user from cache");
          return _context.abrupt("return", user_cache[steamId]);

        case 3:
          p = new Promise(function (res, rej) {
            var xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = function () {
              if (this.readyState == 4 && this.status == 200) {
                if (this.responseText == "null") {
                  res();
                  return;
                }

                var parser = new DOMParser();
                var xml = parser.parseFromString(this.responseText, "text/xml");
                user_cache[steamId] = xml;
                res(xml);
              }
            };

            xmlhttp.open("GET", "https://steamcommunity.com/profiles/" + steamId + "?xml=1", true);
            xmlhttp.send();
          });
          return _context.abrupt("return", p);

        case 5:
        case "end":
          return _context.stop();
      }
    }
  });
}

function getUsers() {
  return userConfig.data.steam;
}

function addUser(user) {
  if (user == null) return;

  if (user.name && user.steam64id) {
    userConfig.data.steam.push(user);
    userConfig.save();
    console.log("[Steam] User " + user.name + " added");
  } else console.error("[Steam] Failed to add user");
}

function start(appid) {
  var user,
      cb,
      cu,
      executablePath,
      _require,
      exec,
      _args2 = arguments;

  return _regenerator["default"].async(function start$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          user = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : null;
          cb = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : null;
          console.log("[Steam] Opening app " + appid + " with user '" + user + "'");
          _context2.next = 5;
          return _regenerator["default"].awrap(getCurrentUser());

        case 5:
          cu = _context2.sent;

          if (!(user != null && cu != user)) {
            _context2.next = 9;
            break;
          }

          _context2.next = 9;
          return _regenerator["default"].awrap(changeUser(user, false));

        case 9:
          _context2.next = 11;
          return _regenerator["default"].awrap(getSteamExe());

        case 11:
          _context2.t0 = _context2.sent;
          _context2.t1 = "\"" + _context2.t0;
          _context2.t2 = _context2.t1 + "\" -applaunch ";
          _context2.t3 = appid;
          executablePath = _context2.t2 + _context2.t3;
          _require = require('child_process'), exec = _require.exec;
          exec(executablePath, function (error, stdout, stderr) {
            if (error) {
              console.error("exec error: ".concat(error));
              return;
            }

            console.log("stdout: ".concat(stdout));
            console.error("stderr: ".concat(stderr));
          });
          setTimeout(function () {
            if (cb != null) cb();
          }, 1000);

        case 19:
        case "end":
          return _context2.stop();
      }
    }
  });
}

function addUsersFromSteam() {
  return new Promise(function (res) {
    getSteamPath().then(function (steamPath) {
      var config = path.join(steamPath, "config/loginusers.vdf");
      console.log("[Steam] Adding users known from steam in: " + config);

      if (fs.existsSync(config)) {
        var rawdata = fs.readFileSync(config, "utf8");
        var data = vdf.parse(rawdata);

        for (var user in data.users) {
          addUser({
            name: data.users[user].AccountName,
            steam64id: user
          });
        }

        res();
        return;
      }
    });
  });
}

function getUserOfGame(appid) {
  return new Promise(function (res) {
    if (appid != null) {
      if (gamesConfig.data.steam[appid]) {
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = getUsers()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var user = _step7.value;

            if (user.name == gamesConfig.data.steam[appid]) {
              res(user);
            }
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
              _iterator7["return"]();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }
      } else {
        getGames().then(function (apps) {
          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = apps[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var app = _step8.value;

              if (app.appId == appid) {
                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                  for (var _iterator9 = getUsers()[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var _user = _step9.value;

                    if (_user.steam64id == Object.keys(app.playtime)[0]) {
                      res(_user);
                    }
                  }
                } catch (err) {
                  _didIteratorError9 = true;
                  _iteratorError9 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
                      _iterator9["return"]();
                    }
                  } finally {
                    if (_didIteratorError9) {
                      throw _iteratorError9;
                    }
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
                _iterator8["return"]();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }

          res();
        });
      }
    }
  });
}

function setUserOfGame(appid, username) {
  if (appid != null && username != null) {
    gamesConfig.data.steam[appid] = username;
    gamesConfig.save();
  }
}

function getLibraryInfo(appid) {
  return _regenerator["default"].async(function getLibraryInfo$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          return _context3.abrupt("return", new Promise(function (res) {
            var data = {};
            var img = new Promise(function (re) {
              image('https://steamcdn-a.akamaihd.net/steam/apps/' + appid + '/library_hero.jpg?t=1568744817', {
                success: function success() {
                  data.heroImage = "https://steamcdn-a.akamaihd.net/steam/apps/" + appid + "/library_hero.jpg?t=1568744817";
                  re();
                },
                failure: function failure() {
                  getStoreInfo(appid).then(function (info) {
                    if (info[appid].success) {
                      data.heroImage = info[appid].data.screenshots[0].path_full;
                      re();
                    } else {
                      data.heroImage = "https://steamcdn-a.akamaihd.net/steam/apps/" + appid + "/header.jpg?t=1568744817";
                      re();
                    }
                  });
                }
              });
            });
            var appInfo = new Promise(function (re) {
              if (apps_cache[appid]) {
                re();
              } else {
                getAppsById(appid).then(re());
              }
            });
            Promise.all([getUserOfGame(appid), appInfo, img]).then(function (values) {
              data.user = values[0].name;
              data.info = apps_cache[appid];
              if (apps_cache[appid].playtime && apps_cache[appid].playtime[values[0].steam64id]) data.playtime = apps_cache[appid].playtime[values[0].steam64id];
              res(data);
            });
          }));

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
}

function getShortcutOptions(appid) {
  return new Promise(function (res) {
    var data = {};
    getAppsById([appid]).then(function (info) {
      data.img = "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/" + appid + "/" + info[0].clientIcon + ".ico";
      data.name = info[0].displayName;
      res(data);
    });
  });
}

function isRunning() {
  var executablePath, util, exec, _ref, stdout, stderr;

  return _regenerator["default"].async(function isRunning$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          executablePath = "tasklist";
          util = require('util');
          exec = util.promisify(require('child_process').exec);
          _context4.next = 5;
          return _regenerator["default"].awrap(exec(executablePath));

        case 5:
          _ref = _context4.sent;
          stdout = _ref.stdout;
          stderr = _ref.stderr;
          return _context4.abrupt("return", stdout.includes("Steam.exe"));

        case 9:
        case "end":
          return _context4.stop();
      }
    }
  });
}

function isLoggedIn() {
  var regKey, p;
  return _regenerator["default"].async(function isLoggedIn$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          regKey = new Registry({
            hive: Registry.HKCU,
            key: '\\Software\\Valve\\Steam\\ActiveProcess'
          });
          p = new Promise(function (res, rej) {
            regKey.values(function (err, items) {
              for (var i = 0; i < items.length; i++) {
                if (items[i].name == "ActiveUser") {
                  res(items[i].value != 0x0);
                }
              }
            });
          });
          _context5.next = 4;
          return _regenerator["default"].awrap(p);

        case 4:
          return _context5.abrupt("return", _context5.sent);

        case 5:
        case "end":
          return _context5.stop();
      }
    }
  });
}

function getLastUser() {
  var regKey, p;
  return _regenerator["default"].async(function getLastUser$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          regKey = new Registry({
            hive: Registry.HKCU,
            key: '\\Software\\Valve\\Steam'
          });
          p = new Promise(function (res, rej) {
            regKey.values(function (err, items) {
              for (var i = 0; i < items.length; i++) {
                if (items[i].name == "AutoLoginUser") {
                  res(items[i].value);
                }
              }
            });
          });
          return _context6.abrupt("return", p);

        case 3:
        case "end":
          return _context6.stop();
      }
    }
  });
}

function getSteamPath() {
  var regKey, p;
  return _regenerator["default"].async(function getSteamPath$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          regKey = new Registry({
            hive: Registry.HKCU,
            key: '\\Software\\Valve\\Steam'
          });
          p = new Promise(function (res, rej) {
            regKey.values(function (err, items) {
              for (var i = 0; i < items.length; i++) {
                if (items[i].name == "SteamPath") {
                  res(items[i].value);
                }
              }
            });
          });
          return _context7.abrupt("return", p);

        case 3:
        case "end":
          return _context7.stop();
      }
    }
  });
}

function getSteamExe() {
  var regKey, p;
  return _regenerator["default"].async(function getSteamExe$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          regKey = new Registry({
            hive: Registry.HKCU,
            key: '\\Software\\Valve\\Steam'
          });
          p = new Promise(function (res, rej) {
            regKey.values(function (err, items) {
              for (var i = 0; i < items.length; i++) {
                if (items[i].name == "SteamExe") {
                  res(items[i].value);
                }
              }
            });
          });
          return _context8.abrupt("return", p);

        case 3:
        case "end":
          return _context8.stop();
      }
    }
  });
}

function getCurrentUser() {
  var li;
  return _regenerator["default"].async(function getCurrentUser$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.next = 2;
          return _regenerator["default"].awrap(isLoggedIn());

        case 2:
          li = _context9.sent;
          console.log("[Steam] Logged in: " + li);

          if (!li) {
            _context9.next = 8;
            break;
          }

          _context9.next = 7;
          return _regenerator["default"].awrap(getLastUser());

        case 7:
          return _context9.abrupt("return", _context9.sent);

        case 8:
          return _context9.abrupt("return", "");

        case 9:
        case "end":
          return _context9.stop();
      }
    }
  });
}

function changeUser(name) {
  var oSteam,
      running,
      regKey,
      p,
      _args10 = arguments;
  return _regenerator["default"].async(function changeUser$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          oSteam = _args10.length > 1 && _args10[1] !== undefined ? _args10[1] : true;
          console.log("[Steam] Changing user to: " + name);
          _context10.next = 4;
          return _regenerator["default"].awrap(isRunning());

        case 4:
          running = _context10.sent;

          if (!running) {
            _context10.next = 9;
            break;
          }

          closeSteam();
          _context10.next = 9;
          return _regenerator["default"].awrap(timeout(1500));

        case 9:
          regKey = new Registry({
            hive: Registry.HKCU,
            key: '\\Software\\Valve\\Steam'
          });
          p = new Promise(function (res, rej) {
            regKey.set('AutoLoginUser', Registry.REG_SZ, name, function () {
              if (oSteam) {
                openSteam();
              }

              res();
            });
          });
          return _context10.abrupt("return", p);

        case 12:
        case "end":
          return _context10.stop();
      }
    }
  });
}

function closeSteam() {
  console.log("[Steam] Stopping steam");
  var executablePath = "taskkill /F /IM steam.exe";

  var _require2 = require('child_process'),
      exec = _require2.exec;

  exec(executablePath, function (error, stdout, stderr) {});
}

function openSteam() {
  var executablePath, _require3, exec;

  return _regenerator["default"].async(function openSteam$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          console.log("[Steam] Starting steam");
          _context11.next = 3;
          return _regenerator["default"].awrap(getSteamExe());

        case 3:
          _context11.t0 = _context11.sent;
          _context11.t1 = '"' + _context11.t0;
          executablePath = _context11.t1 + '"';
          _require3 = require('child_process'), exec = _require3.exec;
          exec(executablePath, function (error, stdout, stderr) {});

        case 8:
        case "end":
          return _context11.stop();
      }
    }
  });
}

function timeout(time) {
  var p;
  return _regenerator["default"].async(function timeout$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          p = new Promise(function (res, rej) {
            setTimeout(function () {
              res();
            }, time);
          });
          return _context12.abrupt("return", p);

        case 2:
        case "end":
          return _context12.stop();
      }
    }
  });
}

function hasUserSG(user) {
  if (!hasUserSecret(user)) return false;
  if (!issetval(user.auth, "password")) return false;
  if (!issetval(user.auth, "deviceid")) return false;
  if (!issetval(user.auth, "identity_secret")) return false;
  return true;
}

function hasUserSecret(user) {
  if (!issetval(user, "auth")) return false;
  if (!issetval(user.auth, "shared_secret")) return false;
  return true;
}

function issetval(obj, value) {
  return isDefined(obj[value]) && obj[value] != "null";
}

function isset(obj) {
  return isDefined(obj) && obj != "null";
}

function isDefined(object) {
  return typeof object !== 'undefined';
}

module.exports = {
  getGames: getGames,
  getUsers: getUsers,
  addUser: addUser,
  start: start,
  isRunning: isRunning,
  isLoggedIn: isLoggedIn,
  getLastUser: getLastUser,
  getSteamPath: getSteamPath,
  getSteamExe: getSteamExe,
  getCurrentUser: getCurrentUser,
  changeUser: changeUser,
  closeSteam: closeSteam,
  openSteam: openSteam,
  getSteamUserInfo: getSteamUserInfo,
  getAppsById: getAppsById,
  getUserOfGame: getUserOfGame,
  setUserOfGame: setUserOfGame,
  getLibraryInfo: getLibraryInfo,
  userConfig: userConfig,
  gamesConfig: gamesConfig,
  hasUserSecret: hasUserSecret,
  hasUserSG: hasUserSG,
  addUsersFromSteam: addUsersFromSteam,
  getStoreInfo: getStoreInfo,
  getShortcutOptions: getShortcutOptions
};