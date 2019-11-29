"use strict";

var apps_cache = {};

function getAppsById(cb, ids) {
  var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var toRequest = [];
  var inCache = [];

  if (!force) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = ids[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var id = _step.value;

        if (!(id in apps_cache)) {
          toRequest.push(id);
        } else inCache.push(id);
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
  } else {
    toRequest = ids;
  }

  if (toRequest.length == 0) {
    var result = [];
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = ids[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var id = _step2.value;
        result.push(apps_cache[id]);
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

    cb(result);
    return;
  }

  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var result = JSON.parse(this.responseText);
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = result[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var app = _step3.value;
          apps_cache[app.appId] = app;
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

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = inCache[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var id = _step4.value;
          result.push(apps_cache[id]);
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

      cb(result);
    }
  };

  for (var i = 0; i < toRequest.length; i++) {
    toRequest[i] = "STEAM_" + toRequest[i];
  }

  xmlhttp.open("GET", "https://ugl.seemslegit.me/api/getGames?uniqueID=" + toRequest.join(","), true);
  xmlhttp.send();
}

function getAppsFromUser(cb, userId) {
  var onlyGames = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  console.log("[Steam] loading games from user ".concat(userId));
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      if (this.responseText == "null") {
        cb([]);
        console.log("[Steam] loaded 0 games from user ".concat(userId, "! Is the profile private?"));
        return;
      }

      var result = JSON.parse(this.responseText);
      console.log("[Steam] loaded ".concat(result.length, " games from user ").concat(userId));
      cb(result);
    }
  };

  xmlhttp.open("GET", "https://ugl.seemslegit.me/api/getGamesFromUser?id=" + userId, true);
  xmlhttp.send();
}

function getAppIdsFromCache() {
  if (!app_data["apps"]) {
    return [];
  }

  return Object.keys(app_data["apps"]);
}

function openApp(appid) {
  var user,
      cu,
      executablePath,
      _require,
      exec,
      _args = arguments;

  return regeneratorRuntime.async(function openApp$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          user = _args.length > 1 && _args[1] !== undefined ? _args[1] : null;
          console.log("[Steam] Opening app " + appid + " with user '" + user + "'");
          _context.next = 4;
          return regeneratorRuntime.awrap(getCurrentUser());

        case 4:
          cu = _context.sent;
          console.log("[Steam] " + cu + " " + user + " - " + (cu != user));

          if (!(user != null && cu != user)) {
            _context.next = 9;
            break;
          }

          _context.next = 9;
          return regeneratorRuntime.awrap(changeUser(user, false));

        case 9:
          _context.next = 11;
          return regeneratorRuntime.awrap(getSteamExe());

        case 11:
          _context.t0 = _context.sent;
          _context.t1 = "\"" + _context.t0;
          _context.t2 = _context.t1 + "\" -applaunch ";
          _context.t3 = appid;
          executablePath = _context.t2 + _context.t3;
          _require = require('child_process'), exec = _require.exec;
          exec(executablePath, function (error, stdout, stderr) {
            if (error) {
              console.error("exec error: ".concat(error));
              return;
            }

            console.log("stdout: ".concat(stdout));
            console.error("stderr: ".concat(stderr));
          });

        case 18:
        case "end":
          return _context.stop();
      }
    }
  });
}

function isRunning() {
  var executablePath, util, exec, _ref, stdout, stderr;

  return regeneratorRuntime.async(function isRunning$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          executablePath = "tasklist";
          util = require('util');
          exec = util.promisify(require('child_process').exec);
          _context2.next = 5;
          return regeneratorRuntime.awrap(exec(executablePath));

        case 5:
          _ref = _context2.sent;
          stdout = _ref.stdout;
          stderr = _ref.stderr;
          return _context2.abrupt("return", stdout.includes("Steam.exe"));

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  });
}

function isLoggedIn() {
  var Registry, regKey, p;
  return regeneratorRuntime.async(function isLoggedIn$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          Registry = require('winreg'), regKey = new Registry({
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
          _context3.next = 4;
          return regeneratorRuntime.awrap(p);

        case 4:
          return _context3.abrupt("return", _context3.sent);

        case 5:
        case "end":
          return _context3.stop();
      }
    }
  });
}

function getLastUser() {
  var Registry, regKey, p;
  return regeneratorRuntime.async(function getLastUser$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          Registry = require('winreg'), regKey = new Registry({
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
          _context4.next = 4;
          return regeneratorRuntime.awrap(p);

        case 4:
          return _context4.abrupt("return", _context4.sent);

        case 5:
        case "end":
          return _context4.stop();
      }
    }
  });
}

function getSteamPath() {
  var Registry, regKey, p;
  return regeneratorRuntime.async(function getSteamPath$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          Registry = require('winreg'), regKey = new Registry({
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
          _context5.next = 4;
          return regeneratorRuntime.awrap(p);

        case 4:
          return _context5.abrupt("return", _context5.sent);

        case 5:
        case "end":
          return _context5.stop();
      }
    }
  });
}

function getSteamExe() {
  var Registry, regKey, p;
  return regeneratorRuntime.async(function getSteamExe$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          Registry = require('winreg'), regKey = new Registry({
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
          _context6.next = 4;
          return regeneratorRuntime.awrap(p);

        case 4:
          return _context6.abrupt("return", _context6.sent);

        case 5:
        case "end":
          return _context6.stop();
      }
    }
  });
}

function getCurrentUser() {
  var li;
  return regeneratorRuntime.async(function getCurrentUser$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(isLoggedIn());

        case 2:
          li = _context7.sent;
          console.log("[Steam] Logged in: " + li);

          if (!li) {
            _context7.next = 8;
            break;
          }

          _context7.next = 7;
          return regeneratorRuntime.awrap(getLastUser());

        case 7:
          return _context7.abrupt("return", _context7.sent);

        case 8:
          return _context7.abrupt("return", "");

        case 9:
        case "end":
          return _context7.stop();
      }
    }
  });
}

function changeUser(name) {
  var openSteam,
      running,
      Registry,
      regKey,
      p,
      _args8 = arguments;
  return regeneratorRuntime.async(function changeUser$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          openSteam = _args8.length > 1 && _args8[1] !== undefined ? _args8[1] : true;
          console.log("[Steam] Changing user to: " + name);
          _context8.next = 4;
          return regeneratorRuntime.awrap(isRunning());

        case 4:
          running = _context8.sent;

          if (!running) {
            _context8.next = 9;
            break;
          }

          closeSteam();
          _context8.next = 9;
          return regeneratorRuntime.awrap(timeout(1500));

        case 9:
          Registry = require('winreg'), regKey = new Registry({
            hive: Registry.HKCU,
            key: '\\Software\\Valve\\Steam'
          });
          p = new Promise(function (res, rej) {
            regKey.set('AutoLoginUser', Registry.REG_SZ, name, function () {
              if (openSteam) {
                this.openSteam();
              }

              res();
            });
          });
          _context8.next = 13;
          return regeneratorRuntime.awrap(p);

        case 13:
        case "end":
          return _context8.stop();
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

  return regeneratorRuntime.async(function openSteam$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          console.log("[Steam] Starting steam");
          _context9.next = 3;
          return regeneratorRuntime.awrap(getSteamExe());

        case 3:
          _context9.t0 = _context9.sent;
          _context9.t1 = '"' + _context9.t0;
          executablePath = _context9.t1 + '"';
          _require3 = require('child_process'), exec = _require3.exec;
          exec(executablePath, function (error, stdout, stderr) {});

        case 8:
        case "end":
          return _context9.stop();
      }
    }
  });
}

var user_cache = {};

function getSteamUserInfo(steamId) {
  var p;
  return regeneratorRuntime.async(function getSteamUserInfo$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          if (!user_cache[steamId]) {
            _context10.next = 3;
            break;
          }

          console.log("user from cache");
          return _context10.abrupt("return", user_cache[steamId]);

        case 3:
          p = new Promise(function (res, rej) {
            var xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = function () {
              //console.log(this.responseText);
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
          _context10.next = 6;
          return regeneratorRuntime.awrap(p);

        case 6:
          return _context10.abrupt("return", _context10.sent);

        case 7:
        case "end":
          return _context10.stop();
      }
    }
  });
}

function timeout(time) {
  var p;
  return regeneratorRuntime.async(function timeout$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          p = new Promise(function (res, rej) {
            setTimeout(function () {
              res();
            }, time);
          });
          _context11.next = 3;
          return regeneratorRuntime.awrap(p);

        case 3:
        case "end":
          return _context11.stop();
      }
    }
  });
}