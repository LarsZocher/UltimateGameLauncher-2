var fs = require('fs');
var path = require('path');
var processExists = require('process-exists');
var userConfig = require("../config/users.js");
var gamesConfig = require("../config/games.js");
var Config = require("../config/config");
var battleConfig = new Config("../Battle.net/Battle.net.config");

var requestChache = [];
var gamesCache = {};

var electron = require('electron');
let app;
if(electron.remote)
    app = electron.remote.app;
else
    app = electron.app;

var vbsFile = path.join(app.getPath("userData"), "checkBattlenet.vbs");

gamesConfig.setDefault("battlenet", {});

createVBSFile();

function getGames(){
    return requestGames();
}

function requestGames(){
    return new Promise(res => {
        console.log(`[Battlenet] loading games`);
        if(requestChache.length!=0){
            console.log(`[Battlenet] loaded ${requestChache.length} games from cache`);
            res(requestChache);
            return;
        }
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                if(this.responseText == "null"){
                    res();
                    console.log(`[Battlenet] loaded 0 games`);
                    return;
                }
                var result = JSON.parse(this.responseText);
                requestChache = result;
                for (const app of result) {
                    gamesCache[app.appId] = app;
                }
                console.log(`[Battlenet] loaded ${result.length} games`);
                res(result);
            }
        };
        xmlhttp.open("GET", "https://ugl.seemslegit.me/api/getGames?type=BATTLENET", true);
        xmlhttp.send();
    });
}

function getLibraryInfo(id){
    return new Promise(res=>{
        var data = {};
        data.heroImage = "https://ugl.seemslegit.me/resources/BATTLENET/header/"+id+".jpg";
        getUserOfGame(id).then(user=>{
            data.info = gamesCache[id];
            data.user = user;
            res(data);
        });
    });
}

function closeBattlenet(){
    console.log("[Battlenet] Stopping battlenet");
    var executablePath = "taskkill /F /IM Battle.net.exe";
    const { exec } = require('child_process');
    exec(executablePath, (error, stdout, stderr) => {
        
    });
}

async function start(id){
    var user = await getUserOfGame(id);
    var changedUser = false;
    var before = [...getUsers()];
    console.log(user+" | "+ getUsers()[0]);
    if(getUsers()[0]!=user){
        var after = [user];
        for (const u of getUsers()) {
            if(u!=user)
                after.push(u);
        }
        battleConfig.data.Client.SavedAccountNames = after.join(",");
        battleConfig.save();
        changedUser = true;
    }
    if(await isRunning()){
        closeBattlenet();
    }

    await timeout(400);

    var executablePath = "\""+ path.join(getBattlenetPath(), "Battle.net.exe")+"\" --exec=\"launch "+id+"\"";
    const { exec } = require('child_process');
    exec(executablePath, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });

    exec(vbsFile, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        exec(executablePath, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
            if(changedUser){
                setTimeout(()=>{
                    console.log(before);
                    battleConfig.load();
                    battleConfig.data.Client.SavedAccountNames = before.join(",");
                    console.log(battleConfig.data.Client.SavedAccountNames);
                    battleConfig.save();
                },1000);
            }
        });
    });
}

function createVBSFile(){
    var data = 'Set WshShell = WScript.CreateObject("WScript.Shell")\nDim counter\ncounter = 30\ndo\ncounter = counter - 1\nIf counter = 0 Then \nWscript.Quit\nEnd If\nret = wshShell.AppActivate("Blizzard Battle.net")\nIf ret = True Then \nWscript.Quit\nEnd If\nWScript.Sleep 500 \nLoop';
    fs.writeFile(vbsFile, data, function(err) {
        if(err){
            console.log(err);
        }
        console.log("[Battlenet] created vbs: "+vbsFile);
    });
}

function getUsers(){
    return battleConfig.data.Client.SavedAccountNames.split(",");
}

function getUserOfGame(id){
    return new Promise(res=>{
        if(id!=null){
            if(gamesConfig.data.battlenet[id]){
                for (const user of getUsers()) {
                    if(user == gamesConfig.data.battlenet[id]){
                        res(user);
                    }
                }
            }else{
                res(getUsers()[0]);
            }
        }
    });
}

function isRunning(){
    return new Promise(res=>{
        processExists("Battle.net.exe").then(isRunning=>res(isRunning));
    });
}

function setUserOfGame(id, username){
    if(id!=null && username !=null){
        gamesConfig.data.battlenet[id] = username;
        gamesConfig.save();
    }
}

function getBattlenetPath(){
    for (const key in battleConfig.data) {
        if (battleConfig.data[key].Path) {
            return battleConfig.data[key].Path;
        }
    }
    return null;
}

async function timeout(time){
    let p = new Promise((res, rej) => {
        setTimeout(()=>{
            res();
        }, time);
    });
    return p;
}

module.exports = {
    getGames,
    getUsers,
    getBattlenetPath,
    start,
    getUserOfGame,
    setUserOfGame,
    getLibraryInfo
}