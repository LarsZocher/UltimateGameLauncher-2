"use strict";

var steam = require("./types/steam.js");

var uid = require("./uniqueID");

function getGames() {
  //startGame("STEAM_730");
  return new Promise(function (res) {
    steam.getGames().then(function (response) {
      res(response);
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
    }
  }
}

module.exports = {
  getGames: getGames,
  startGame: startGame,
  getUserOfGame: getUserOfGame,
  setUserOfGame: setUserOfGame,
  getLibraryInfo: getLibraryInfo,
  getLibraryListInfo: getLibraryListInfo
};