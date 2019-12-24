"use strict";

var steam = require("./types/steam.js");

var battle = require("./types/battlenet.js");

var uid = require("./uniqueID");

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
  var id = uid.resolve(uniqueID);

  if (id != null) {
    switch (id.type) {
      case "STEAM":
        console.log("launching: " + id.id);
        steam.getUserOfGame(id.id).then(function (user) {
          steam.start(id.id, user.name);
        });
        break;

      case "BATTLENET":
        console.log("launching: " + id.id);
        battle.start(id.id);
        break;
    }
  }
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

module.exports = {
  getGames: getGames,
  startGame: startGame,
  getUserOfGame: getUserOfGame,
  setUserOfGame: setUserOfGame,
  getLibraryInfo: getLibraryInfo,
  getLibraryListInfo: getLibraryListInfo,
  getUsernames: getUsernames
};