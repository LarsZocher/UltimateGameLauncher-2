const electron = require('electron');
const url = require('url');
const path = require('path');
const {autoUpdater} = require("electron-updater");

const { app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;
let updateWindow;

const sendStatusToWindow = (text) => {
    if(updateWindow) {
        updateWindow.webContents.send("message", text);
    }
}

const updateStatus = (percent, speed, downloaded) => {
    if(updateWindow) {
        updateWindow.webContents.send("u-update", percent, speed, downloaded);
    }
}

autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.');
    updateFinished();
})
autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
    setTimeout(()=>{
        updateFinished();
    }, 1000);
})
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond/1000;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow("Downloading update...");
    updateStatus(progressObj.percent, progressObj.bytesPerSecond/1000, progressObj.transferred + "/" + progressObj.total);
})
autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded');
    autoUpdater.quitAndInstall();
});

function updateFinished(){
    createMainWindow();
    updateWindow.close();
}

//Listen for the app to be ready
function createMainWindow() {
    //Create new window
    mainWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration: true
        },
        width: 1256,
        height: 600,
        minHeight: 600,
        minWidth: 1000,
        frame: false,
        backgroundColor: '#111111'
    });
    console.log(__dirname);
    //Load html
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../pages/mainWindow.html'),
        protocol: 'file',
        slashes: true
    }));

    mainWindow.on('closed', function () {
        app.quit();
    })

    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
}

function createUpdateWindow(){
    updateWindow = new BrowserWindow({
        webPreferences:{
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
    })
}

app.on('ready', function()  {
    if(!app.isPackaged){
        createMainWindow();
    }else{
        createUpdateWindow();
        updateWindow.webContents.once('dom-ready', function () {
            autoUpdater.checkForUpdatesAndNotify();
        });
    }
});

//Handle add window
function createAddWindow() {
    //Create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Eintrag hinzufügen',
        webPreferences:{
            nodeIntegration: true
        }
    });
    //Load html
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file',
        slashes: true
    }));

    addWindow.on('close', function () {
        addWindow = null;
    })
}

//Catch Item add
ipcMain.on('item:add', function(e, item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

//Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Eintrag hinzufügen',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Lösche Einträge',
                click(){
                    mainWindow.webContents.send('item:clear')
                }
            },
            {
                label: 'Beenden',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'CTRL+Q',
                click() {
                    app.quit();
                }
            },
        ]
    }
];

//If mac, add empty obj
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

//Add dev tools
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Entwickler',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'CTRL+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}