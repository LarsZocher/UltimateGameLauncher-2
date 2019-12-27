const fs = require('fs');
const request = require('request');
const electron = require('electron');
var app;
if(electron.remote)
    app = electron.remote.app;
else
    app = electron.app;
const pngToIco = require('png-to-ico');
const path = require('path');

if(!fs.existsSync(path.join(app.getPath("userData"), "images"))){
    fs.mkdirSync(path.join(app.getPath("userData"), "images"));
}
if(!fs.existsSync(path.join(app.getPath("userData"), "images/icons"))){
    fs.mkdirSync(path.join(app.getPath("userData"), "images/icons"));
}

function download(uri, filename, callback){
    request.head(uri, function(err, res, body){
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);
  
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

function downloadIcon(uri, fileName){
    return new Promise(res=>{
        download(uri, path.join(app.getPath("userData"), "images/icons/"+fileName), function(){
            console.log("[Images] Downloaded icon: "+uri);
            res(path.join(app.getPath("userData"), "images/icons/"+fileName));
        });
    });
}
function downloadPngIcon(uri, fileName){
    return new Promise(res=>{
        var filePath = path.join(app.getPath("userData"), "images/icons/"+fileName);
        download(uri, filePath, function(){
            console.log("[Images] Downloaded icon: "+uri);
            pngToIco(filePath).then(buf => {
                filePath = filePath.replace(".png", ".ico");
                fs.writeFileSync(filePath, buf);
                res(filePath);
            });
        });
    });
}

module.exports = {
    downloadIcon,
    downloadPngIcon
}