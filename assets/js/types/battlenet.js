var fs = require('fs');
var path = require('path');
var processExists = require('process-exists');
var userConfig = require("../config/users.js");
var gamesConfig = require("../config/games.js");
var Config = require("../config/config");
var battleConfig = new Config("../Battle.net/Battle.net.config");
var uglConfig = require("../config");
var electron = require('electron');

let app;
if(electron.remote)
    app = electron.remote.app;
else
    app = electron.app;

var vbsFile = path.join(app.getPath("userData"), "checkBattlenet.vbs");

uglConfig.setDefault("battlenet.showAllGames", false);
uglConfig.saveData();
gamesConfig.setDefault("battlenet", {});

var requestChache = [];
var gamesCache = {};

var hasBattlenet = battleConfig.exists();

if(!hasBattlenet)
    console.warn("[Battlenet] Battlenet was not found! Disabled Battlenet features");

createVBSFile();

function getGames(){
    if(!hasBattlenet) return [];
    if(uglConfig.data.battlenet.showAllGames)
        return requestGames();
    else{
        return new Promise(res=>{
            var data = [];
            requestGames().then(games=>{
                for (const game of games) {
                    if(hasGame(game.appId))
                        data.push(game);
                }
                res(data);
            });
        });
    }
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

function openClient() {
    var executablePath = "\""+ path.join(getBattlenetPath(), "Battle.net.exe")+"\"";
    const { exec } = require('child_process');

    console.log("[Battlenet] starting battlenet");
    exec(executablePath, 
        { 
            cwd: getBattlenetPath()
        },
        (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}

async function start(id, cb = null){
    console.log("[Battlenet] starting "+id);
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
        console.log("[Battlenet] closing battlenet");
        closeBattlenet();
    }

    await timeout(400);

    var executablePath = "\""+ path.join(getBattlenetPath(), "Battle.net.exe")+"\" --exec=\"launch "+id+"\"";
    const { exec } = require('child_process');

    console.log("[Battlenet] starting battlenet 1");
    exec(executablePath, 
        { 
            cwd: getBattlenetPath()
        },
        (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });

    console.log("[Battlenet] starting vbs");
    exec(vbsFile, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log("[Battlenet] starting battlenet 2");
        exec(executablePath, 
            { 
                cwd: getBattlenetPath()
            },
            (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
            console.log("[Battlenet] starting done!");
            if(changedUser){
                setTimeout(()=>{
                    console.log(before);
                    battleConfig.load();
                    battleConfig.data.Client.SavedAccountNames = before.join(",");
                    console.log(battleConfig.data.Client.SavedAccountNames);
                    battleConfig.save();
                    if(cb!=null)
                        cb();
                },1000);
            }else{
                if(cb!=null)
                    cb();
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

function hasGame(id){
    var configName = gamesCache[id].configName;
    return Object.keys(battleConfig.data.Games).includes(configName);
}

function getUsers(){
    if(!hasBattlenet)
        return [];
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

function getShortcutOptions(id){
    return new Promise(res=>{
        var data = {};
        data.img = "https://ugl.seemslegit.me/resources/BATTLENET/icon/"+id+".png";
        data.name = gamesCache[id].displayName;
        res(data);
    });
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
    getLibraryInfo,
    hasGame,
    getShortcutOptions,
    openClient
}