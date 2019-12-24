
const steam = require("./types/steam.js");
const battle = require("./types/battlenet.js");
const uid = require("./uniqueID");

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

function startGame(uniqueID){
    var id = uid.resolve(uniqueID);
    if(id!=null){
        switch(id.type){
            case "STEAM":
                console.log("launching: "+id.id);
                steam.getUserOfGame(id.id).then(user=>{
                    steam.start(id.id, user.name);
                });
                break;
            case "BATTLENET":
                console.log("launching: "+id.id);
                battle.start(id.id);
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

module.exports = {
    getGames,
    startGame,
    getUserOfGame,
    setUserOfGame,
    getLibraryInfo,
    getLibraryListInfo,
    getUsernames
};