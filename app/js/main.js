"use strict";

var electron = require('electron');

var url = require('url');

var path = require('path');

var _require = require("electron-updater"),
    autoUpdater = _require.autoUpdater;

var app = electron.app,
    BrowserWindow = electron.BrowserWindow,
    Menu = electron.Menu,
    ipcMain = electron.ipcMain;

var config = require("../js/config");

var mainWindow;
var addWindow;
var updateWindow;
console.log(process.argv);
var updateFromSettings = false;
config.setDefault("settings.update.updatesOnStartup", true);
config.setDefault("settings.update.checkForUpdates", true);
config.saveData();

var sendStatusToWindow = function sendStatusToWindow(text) {
  if (updateWindow && !updateFromSettings) {
    updateWindow.webContents.send("message", text);
  } else {
    mainWindow.webContents.send("message", text);
  }
};

var updateStatus = function updateStatus(percent, speed, downloaded) {
  if (updateWindow && !updateFromSettings) {
    updateWindow.webContents.send("u-update", percent, speed, downloaded);
  } else {
    mainWindow.webContents.send("u-update", percent, speed, downloaded);
  }
};

autoUpdater.on('checking-for-update', function () {
  sendStatusToWindow('Checking for update...');
});
autoUpdater.on('update-available', function (info) {
  sendStatusToWindow('Update available.');
});
autoUpdater.on('update-not-available', function (info) {
  sendStatusToWindow('Update not available.');
  if (!updateFromSettings) updateFinished();
});
autoUpdater.on('error', function (err) {
  sendStatusToWindow('Error in auto-updater. ' + err);
  if (!updateFromSettings) setTimeout(function () {
    updateFinished();
  }, 1000);
});
autoUpdater.on('download-progress', function (progressObj) {
  var log_message = "Download speed: " + formatSizeUnits(progressObj.bytesPerSecond);
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow("Downloading update...");
  updateStatus(progressObj.percent, formatSizeUnits(progressObj.bytesPerSecond) + "/s", formatSizeUnits(progressObj.transferred) + "/" + formatSizeUnits(progressObj.total));
});
autoUpdater.on('update-downloaded', function (info) {
  sendStatusToWindow('Update downloaded');
  if (!updateFromSettings) autoUpdater.quitAndInstall();else mainWindow.webContents.send("u-downloaded");
});
ipcMain.on('check-for-updates', function (e) {
  updateFromSettings = true;
  autoUpdater.checkForUpdates();
});
ipcMain.on('apply-update', function (e) {
  autoUpdater.quitAndInstall();
});

function formatSizeUnits(bytes) {
  if (bytes >= 1073741824) {
    bytes = (bytes / 1073741824).toFixed(2) + " GB";
  } else if (bytes >= 1048576) {
    bytes = (bytes / 1048576).toFixed(2) + " MB";
  } else if (bytes >= 1024) {
    bytes = (bytes / 1024).toFixed(2) + " KB";
  } else if (bytes > 1) {
    bytes = bytes + " bytes";
  } else if (bytes == 1) {
    bytes = bytes + " byte";
  } else {
    bytes = "0 bytes";
  }

  return bytes;
}

function updateFinished() {
  createMainWindow();
  updateWindow.close();
} //Listen for the app to be ready


function createMainWindow() {
  //Create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    width: 1256,
    height: 600,
    minHeight: 600,
    minWidth: 1000,
    frame: false,
    backgroundColor: '#111111'
  });
  console.log(__dirname); //Load html

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../pages/mainWindow.html'),
    protocol: 'file',
    slashes: true
  }));
  mainWindow.on('closed', function () {
    app.quit();
  }); //Build menu from template

  var mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
}

function createUpdateWindow() {
  updateWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    width: 400,
    height: 150,
    frame: false,
    resizable: false,
    backgroundColor: '#111111'
  });
  console.log(__dirname);
  updateWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../pages/update.html'),
    protocol: 'file',
    slashes: true
  }));
  updateWindow.on('closed', function () {
    updateWindow = null;
  });
}

app.on('ready', function () {
  if (!app.isPackaged || !config.data.settings.update.updatesOnStartup) {
    createMainWindow();
  } else {
    createUpdateWindow();
    updateWindow.webContents.once('dom-ready', function () {
      autoUpdater.checkForUpdatesAndNotify();
    });
  }
}); //Handle add window

function createAddWindow() {
  //Create new window
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Eintrag hinzufügen',
    webPreferences: {
      nodeIntegration: true
    }
  }); //Load html

  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file',
    slashes: true
  }));
  addWindow.on('close', function () {
    addWindow = null;
  });
} //Catch Item add


ipcMain.on('item:add', function (e, item) {
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
}); //Create menu template

var mainMenuTemplate = [{
  label: 'File',
  submenu: [{
    label: 'Eintrag hinzufügen',
    click: function click() {
      createAddWindow();
    }
  }, {
    label: 'Lösche Einträge',
    click: function click() {
      mainWindow.webContents.send('item:clear');
    }
  }, {
    label: 'Beenden',
    accelerator: process.platform == 'darwin' ? 'Command+Q' : 'CTRL+Q',
    click: function click() {
      app.quit();
    }
  }]
}]; //If mac, add empty obj

if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({});
} //Add dev tools


if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Entwickler',
    submenu: [{
      label: 'Toggle DevTools',
      accelerator: process.platform == 'darwin' ? 'Command+I' : 'CTRL+I',
      click: function click(item, focusedWindow) {
        focusedWindow.toggleDevTools();
      }
    }, {
      role: 'reload'
    }]
  });
}