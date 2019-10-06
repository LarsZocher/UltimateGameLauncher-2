var app_data = {};

function app_loadData(){
    const fs = require('fs');
    if(fs.existsSync('app_data.json')){
        let rawdata = fs.readFileSync('app_data.json');
        app_data = JSON.parse(rawdata);
    }
}

function app_saveData(){
    const fs = require('fs');
    fs.writeFileSync('app_data.json', JSON.stringify(app_data, null, 2));
}