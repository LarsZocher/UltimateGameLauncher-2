
function resolve(uniqueID) {
    if(uniqueID!=null){
        if(uniqueID.split("_").length == 2){
            return { type: uniqueID.split("_")[0].toUpperCase(), id: uniqueID.split("_")[1]};
        }
    }
    return;
}

module.exports = {
    resolve
}