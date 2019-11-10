var registeredPages = {};
var currentPage = {};
const path = require("path");

function registerPage(name, path, container, options = {}, css = {}){
    registeredPages[name] = {};
    registeredPages[name].css = {};
    registeredPages[name].path = path;
    registeredPages[name].container = container;
    registeredPages[name].options = options;
    if(css.type)
        registeredPages[name].css.type = css.type;
    if(css.self)
        registeredPages[name].css.self = css.self;
    if(css.active)
        registeredPages[name].css.active = css.active;
}

function loadPage(name, options = {}, css = {}){
    doLoad(name, options, css, _loadPageContent);
}

function loadPageSync(name, options = {}, css = {}){
    doLoad(name, options, css, _loadPageContentSync);
}

function doLoad(name, options = {}, css = {}, loadFunction){
    if(!registeredPages[name]){
        console.log("[Pages] Page "+name+" is not registered");
        return;
    }
    var resOptions = Object.assign({}, registeredPages[name].options, options);
    var resCss = Object.assign({}, registeredPages[name].css, css);

    if(resCss.type){
        $(resCss.type).each(function(){
            if($(this).hasClass(resCss.active))
                $(this).removeClass(resCss.active)
        });
    }
    if(resCss.self){
        $(resCss.self).addClass(resCss.active);
    }

    loadFunction(registeredPages[name].path, registeredPages[name].container, resOptions);
}

function _loadPageContent(page, containerSelector, options = {}){
    var pagetag = page + (options.tag?options.tag:"");
    var container = $(containerSelector).get(0);
    if(currentPage[container.id] && currentPage[container.id] == pagetag && !options.force)
        return
    if(options.deleteAll)
        currentPage = {};
    currentPage[container.id] = pagetag;
    var filePath = path.join(__dirname, "..\\pages\\"+ page)
    console.log("[Pages] Loading in content: "+filePath);
    fs.readFile(filePath, (err, data) => {
        container.innerHTML = data
        var scripts = container.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
            eval(scripts[i].innerText);
        }
    });
}

function _loadPageContentSync(page, containerSelector, options = {}){
    var pagetag = page + (options.tag?options.tag:"");
    var container = $(containerSelector).get(0);
    if(currentPage[container.id] && currentPage[container.id] == pagetag && !options.force)
        return
    if(options.deleteAll)
        currentPage = {};
    currentPage[container.id] = pagetag;
    var filePath = path.join(__dirname, "..\\pages\\"+ page)
    console.log("[Pages] Loading in content sync: "+filePath);
    var data = fs.readFileSync(filePath);

    container.innerHTML = data
    var scripts = container.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
        eval(scripts[i].innerText);
    }
}

module.exports = {
    registerPage,
    loadPage,
    loadPageSync,
    registeredPages,
    currentPage
}