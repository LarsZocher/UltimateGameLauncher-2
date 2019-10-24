const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;

//Listen for the app to be ready
app.on('ready', function () {
    //Create new window
    mainWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration: true
        },
        width: 1100,
        height: 600,
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