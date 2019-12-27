
const steam = require("./types/steam.js");
const battle = require("./types/battlenet.js");
const uid = require("./uniqueID");
const images = require("./images");
const ws = require('windows-shortcuts');
const electron = require("electron");
const path = require("path");
var app;
if(electron.remote)
    app = electron.remote.app;
else
    app = electron.app;
 

function getGames(){
    return new Promise(res=>{
        var apps = [];
        Promise.all([steam.getGames(), battle.getGames()]).then(values=>{
            for (const value of values) {
                apps = apps.concat(value);
            }
            res(apps);
            return;
        });
    });
}

async function startGame(uniqueID, cb = null){
    var id = uid.resolve(uniqueID);
    if(id!=null){
        switch(id.type){
            case "STEAM":
                console.log("launching: "+id.id);
                steam.getUserOfGame(id.id).then(user=>{
                    steam.start(id.id, user.name, cb);
                });
                break;
            case "BATTLENET":
                console.log("launching: "+id.id);
                battle.start(id.id, cb);
                break;
        }
    }
}

function getUserOfGame(uniqueID){
    return new Promise(res=>{
        var id = uid.resolve(uniqueID);
        if(id!=null){
            switch(id.type){
                case "STEAM":
                    steam.getUserOfGame(id.id).then(user=>res(user));
                    break;
                case "BATTLENET":
                    battle.getUserOfGame(id.id).then(user=>res(user));
                    break;
            }
        }
    });
}

function setUserOfGame(uniqueID, username){
    var id = uid.resolve(uniqueID);
    if(id!=null){
        switch(id.type){
            case "STEAM":
                steam.setUserOfGame(id.id, username);
                break;
            case "BATTLENET":
                battle.setUserOfGame(id.id, username);
                break;
        }
    }
}

function getUsernames(type){
    if(type!=null){
        switch(type){
            case "STEAM":
                var data = [];
                for (const user of steam.getUsers()) {
                    data.push(user.name);
                }
                return data;
                break;
            case "BATTLENET":
                return battle.getUsers();
                break;
        }
    }
}

function getLibraryInfo(uniqueID){
    return new Promise(res=>{
        var id = uid.resolve(uniqueID);
        if(id!=null){
            switch(id.type){
                case "STEAM":
                    steam.getLibraryInfo(id.id).then(response=>{
                        res(response);
                    });
                    break;
                case "BATTLENET":
                    battle.getLibraryInfo(id.id).then(response=>{
                        res(response);
                    });
                    break;
            }
        }
    });
}

function getLibraryListInfo(data){
    var id = uid.resolve(data.uniqueID);
    if(id!=null){
        switch(id.type){
            case "STEAM":
                return {img: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/'+data.appId+'/'+data.icon+'.jpg'};
                break;
            case "BATTLENET":
                return {img: 'https://ugl.seemslegit.me/resources/BATTLENET/icon/'+data.appId+'.png'};
                break;
        }
    }
}

function createShortcut(uniqueID){
    return new Promise(res=>{
        var id = uid.resolve(uniqueID);
        if(id!=null){
            var lnkPath = "";
            var options = {};
            var create = (()=>{
                ws.create(lnkPath, options, function(err){
                    res(err);
                }); 
            });
            options.target = app.getPath("exe");
            options.args = "-startApp "+uniqueID;
            options.runStyle = ws.MIN;
            options.desc = "A game shortcut for the Ultimate Game Launcher - "+uniqueID;
            switch(id.type){
                case "STEAM":
                    steam.getShortcutOptions(id.id).then(data=>{
                        lnkPath = path.join(app.getPath("desktop"), data.name.replace( /[<>:"\/\\|?*]+/g, '' ) + ".lnk");
                        images.downloadIcon(data.img, uniqueID+".ico").then(img=>{
                            options.icon = img;
                            create();
                        });
                    });
                    break;
                case "BATTLENET":
                    battle.getShortcutOptions(id.id).then(data=>{
                        lnkPath = path.join(app.getPath("desktop"), data.name.replace( /[<>:"\/\\|?*]+/g, '' ) + ".lnk");
                        images.downloadPngIcon(data.img, uniqueID+".png").then(img=>{
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
    switch(type){
        case "STEAM":
            steam.openSteam();
            break;
        case "BATTLENET":
            battle.openClient();
            break;
    }
}

module.exports = {
    getGames,
    startGame,
    getUserOfGame,
    setUserOfGame,
    getLibraryInfo,
    getLibraryListInfo,
    getUsernames,
    createShortcut,
    openClient,
    openClientUID
};