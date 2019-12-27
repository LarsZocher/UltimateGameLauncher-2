"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var steam = require("./types/steam.js");

var battle = require("./types/battlenet.js");

var uid = require("./uniqueID");

var images = require("./images");

var ws = require('windows-shortcuts');

var electron = require("electron");

var path = require("path");

var app;
if (electron.remote) app = electron.remote.app;else app = electron.app;

function getGames() {
  return new Promise(function (res) {
    var apps = [];
    Promise.all([steam.getGames(), battle.getGames()]).then(function (values) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = values[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var value = _step.value;
          apps = apps.concat(value);
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

      res(apps);
      return;
    });
  });
}

function startGame(uniqueID) {
  var cb,
      id,
      _args = arguments;
  return _regenerator["default"].async(function startGame$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          cb = _args.length > 1 && _args[1] !== undefined ? _args[1] : null;
          id = uid.resolve(uniqueID);

          if (!(id != null)) {
            _context.next = 12;
            break;
          }

          _context.t0 = id.type;
          _context.next = _context.t0 === "STEAM" ? 6 : _context.t0 === "BATTLENET" ? 9 : 12;
          break;

        case 6:
          console.log("launching: " + id.id);
          steam.getUserOfGame(id.id).then(function (user) {
            steam.start(id.id, user.name, cb);
          });
          return _context.abrupt("break", 12);

        case 9:
          console.log("launching: " + id.id);
          battle.start(id.id, cb);
          return _context.abrupt("break", 12);

        case 12:
        case "end":
          return _context.stop();
      }
    }
  });
}

function getUserOfGame(uniqueID) {
  return new Promise(function (res) {
    var id = uid.resolve(uniqueID);

    if (id != null) {
      switch (id.type) {
        case "STEAM":
          steam.getUserOfGame(id.id).then(function (user) {
            return res(user);
          });
          break;

        case "BATTLENET":
          battle.getUserOfGame(id.id).then(function (user) {
            return res(user);
          });
          break;
      }
    }
  });
}

function setUserOfGame(uniqueID, username) {
  var id = uid.resolve(uniqueID);

  if (id != null) {
    switch (id.type) {
      case "STEAM":
        steam.setUserOfGame(id.id, username);
        break;

      case "BATTLENET":
        battle.setUserOfGame(id.id, username);
        break;
    }
  }
}

function getUsernames(type) {
  if (type != null) {
    switch (type) {
      case "STEAM":
        var data = [];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = steam.getUsers()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var user = _step2.value;
            data.push(user.name);
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

        return data;
        break;

      case "BATTLENET":
        return battle.getUsers();
        break;
    }
  }
}

function getLibraryInfo(uniqueID) {
  return new Promise(function (res) {
    var id = uid.resolve(uniqueID);

    if (id != null) {
      switch (id.type) {
        case "STEAM":
          steam.getLibraryInfo(id.id).then(function (response) {
            res(response);
          });
          break;

        case "BATTLENET":
          battle.getLibraryInfo(id.id).then(function (response) {
            res(response);
          });
          break;
      }
    }
  });
}

function getLibraryListInfo(data) {
  var id = uid.resolve(data.uniqueID);

  if (id != null) {
    switch (id.type) {
      case "STEAM":
        return {
          img: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/' + data.appId + '/' + data.icon + '.jpg'
        };
        break;

      case "BATTLENET":
        return {
          img: 'https://ugl.seemslegit.me/resources/BATTLENET/icon/' + data.appId + '.png'
        };
        break;
    }
  }
}

function createShortcut(uniqueID) {
  return new Promise(function (res) {
    var id = uid.resolve(uniqueID);

    if (id != null) {
      var lnkPath = "";
      var options = {};

      var create = function create() {
        ws.create(lnkPath, options, function (err) {
          res(err);
        });
      };

      options.target = app.getPath("exe");
      options.args = "-startApp " + uniqueID;
      options.runStyle = ws.MIN;
      options.desc = "A game shortcut for the Ultimate Game Launcher - " + uniqueID;

      switch (id.type) {
        case "STEAM":
          steam.getShortcutOptions(id.id).then(function (data) {
            lnkPath = path.join(app.getPath("desktop"), data.name.replace(/[<>:"\/\\|?*]+/g, '') + ".lnk");
            images.downloadIcon(data.img, uniqueID + ".ico").then(function (img) {
              options.icon = img;
              create();
            });
          });
          break;

        case "BATTLENET":
          battle.getShortcutOptions(id.id).then(function (data) {
            lnkPath = path.join(app.getPath("desktop"), data.name.replace(/[<>:"\/\\|?*]+/g, '') + ".lnk");
            images.downloadPngIcon(data.img, uniqueID + ".png").then(function (img) {
              options.icon = img;
              create();
            });
          });
          break;
      }
    }
  });
}

function openClientUID(uniqueID) {
  var id = uid.resolve(uniqueID);
  openClient(id.type);
}

function openClient(type) {
  switch (type) {
    case "STEAM":
      steam.openSteam();
      break;

    case "BATTLENET":
      battle.openClient();
      break;
  }
}

module.exports = {
  getGames: getGames,
  startGame: startGame,
  getUserOfGame: getUserOfGame,
  setUserOfGame: setUserOfGame,
  getLibraryInfo: getLibraryInfo,
  getLibraryListInfo: getLibraryListInfo,
  getUsernames: getUsernames,
  createShortcut: createShortcut,
  openClient: openClient,
  openClientUID: openClientUID
};