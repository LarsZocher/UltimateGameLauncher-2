var fs = require('fs');
var path = require('path');

class Config {
    constructor(name) {
        this.data = {};
        this.name = name;
        this.isLoaded = false;

        var electron = require('electron');
        this.app;
        if(electron.remote)
            this.app = electron.remote.app;
        else
            this.app = electron.app;
            
        if(!this.isLoaded)
            this.load();
    }

    load() {
        var config = path.join(this.app.getPath("userData"), this.name);
        console.log("[Config] loading: "+config);
        if(fs.existsSync(config)){
            let rawdata = fs.readFileSync(config);
            this.data = JSON.parse(rawdata);
        }
        this.isLoaded = true;
    }

    save() {
        var config = path.join(this.app.getPath("userData"), this.name);
        var name = this.name;
        fs.writeFile(config, JSON.stringify(this.data, null, 2), function(err) {
            if(err){
                console.log(err);
            }
            console.log("[Config] Saved: "+name);
        });
    }

    delete(){
        var config = path.join(this.app.getPath("userData"), this.name);
        fs.unlinkSync(config);
    }

    exists(){
        var config = path.join(this.app.getPath("userData"), this.name);
        return fs.existsSync(config);
    }

    set(path, obj) {
        var parts = path.split(".");
        var currentPath = this.data;
        for (var i = 0; i<parts.length; i++) {
            var part = parts[i];
            if(!isset(currentPath[part])){
                currentPath[part] = {};
            }
            if(i==parts.length-1)
                currentPath[part] = obj;
            currentPath = currentPath[part];
        }
    }

    setDefault(path, obj){
        var parts = path.split(".");
        var currentPath = this.data;
        for (var i = 0; i<parts.length; i++) {
            var part = parts[i];
            if(!isset(currentPath[part])){
                if(i==parts.length-1){
                    if(!isset(currentPath[part]))
                        currentPath[part] = obj;
                    return;
                }
                currentPath[part] = {};
            }
            currentPath = currentPath[part];
        }
    }

    get() { 
        return this.data;
    }
}

function issetval(obj, value){
    return (isDefined(obj[value]) && obj[value]!="null");
}

function isset(obj){
    return (isDefined(obj) && obj!="null");
}

function isDefined(object){
    return (typeof object !== 'undefined');
}

module.exports = Config;