var texturemap = [];
var tcs = [];

(function() {
    var resourceCache = {};
    var loading = [];
    var readyCallbacks = [];

    // Load an image url or an array of image urls
    function load(urlOrArr) {
        if(urlOrArr instanceof Array) {
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        }
        else {
            _load(urlOrArr);
        }
    }

    function _load(url) {
        if(resourceCache[url]) {
            return resourceCache[url];
        }
        else {
            var img = new Image();
            img.onload = function() {
                resourceCache[url] = img;

                if(isReady()) {
                    readyCallbacks.forEach(function(func) { func(); });
                }
            };
            resourceCache[url] = false;
            img.src = url;
        }
    }

    function get(url) {
        return resourceCache[url];
    }

    function isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    function onReady(func) {
        readyCallbacks.push(func);
    }

    window.resources = { 
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
   };
})();

function loadXmlStr(filename, cb)
{
    var xmlHTTP = new XMLHttpRequest();
    try
    {
    xmlHTTP.open("GET", filename, false);
    xmlHTTP.send(null);
    }
    catch (e) {
        window.alert("Unable to load the requested file.");
        return;
    }

    cb(xmlHTTP.responseText);
}

resources.load([
    'img/anim.png', // and other images
]);

function loadXML(cb) {
    loadXMLFile('./img/anim.xml', cb);//loadedXML);
}

function loadXMLFile(fileName, cb){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            loadedXML(this, cb);
        }
    };
    xhttp.open("GET", fileName, true);
    xhttp.send();
}

function loadedXML(xmlData, cb){
    var xml = xmlData.responseXML;
    var subtextures = xml.getElementsByTagName("SubTexture");
    var i = 0;
    while(i<subtextures.length){
        var name = subtextures[i].getAttribute("name");
        var x = subtextures[i].getAttribute("x");
        var y = subtextures[i].getAttribute("y");
        var w = subtextures[i].getAttribute("width");
        var h = subtextures[i].getAttribute("height");
        var frameX = 0;
        var frameY = 0;
        var frameW = 0;
        var frameH = 0;
        if(subtextures[i].hasAttribute("frameX")){
            frameX = subtextures[i].getAttribute("frameX");
            frameY = subtextures[i].getAttribute("frameY");
            frameW = subtextures[i].getAttribute("frameW");
            frameH = subtextures[i].getAttribute("frameH");
        }
        addTile(name, x, y, w, h, frameX, frameY, frameW, frameH);
        i++;
    }
    cb();
}

function Tile(name, x,y,w,h,framex,framey,framew,frameh){
    this._name = name;
    this._x = parseFloat(x);
    this._y = parseFloat(y);
    this._w = parseFloat(w);
    this._h = parseFloat(h);
    this._frameX = parseFloat(framex);
    this._frameY = parseFloat(framey);
    this._frameW = parseFloat(framew);
    this._frameH = parseFloat(frameh);
}

function addTile(name, x, y,w,h,framex,framey,framew,frameh){
    texturemap[name] = new Tile(name, x,y,w,h,framex,framey,framew,frameh);
}

function TileClip(name){
    this._frames = [];
    this._frame = 0;
    this._x = 100;
    this._y = 100;

    this._pivotx = 0;
    this._pivoty = 0;

    if(texturemap[name]){
        this._frames.push(texturemap[name]);
    } else {
        var i = 0;
        while(true){
            i++;
            var num = "";
            if(i<10){
                num="000";
            } else if(i<100){
                num+="00";
            } else if(i<1000){
                num+="0";
            }
            num = num+i;
            var imgName= name+num;
            if(texturemap[imgName]){
                this._frames.push(texturemap[imgName]);
            } else {
                break;
            }
        }
    }

    // Set frame 1 to frames.length
    this.setFrame = function(f){
        if(f - 1 > this._frames.length-1){
            this._frame = this._frames.length-1;
        } else {
            this._frame = f - 1; // 0 index
        }
    }

    this.setPivot = function(x, y){
        this._pivotx = x;
        this._pivoty = y;
    }

    this.render = function(){
        var r = this._frames[this._frame];
        ctx.drawImage(resources.get("img/anim.png"),
                      r._x, r._y,
                      r._w, r._h,
                      this._x - this._pivotx, this._y - this._pivoty,
                      r._w, r._h);
    }
}
