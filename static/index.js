const isEnSystem = navigator.language.toLowerCase().includes('en');
let isDesktop = navigator['userAgent'].match(/(ipad|iphone|ipod|android|windows phone)/i) ? false : true;
let fontunit = isDesktop ? 20 : ((window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth) / 320) * 10;
document.write('<style type="text/css">' +
    'html,body {font-size:' + (fontunit < 30 ? fontunit : '30') + 'px;}' +
    (isDesktop ? '#welcome,#GameTimeLayer,#GameLayerBG,#GameScoreLayer.SHADE{position: absolute;}' :
        '#welcome,#GameTimeLayer,#GameLayerBG,#GameScoreLayer.SHADE{position:fixed;}@media screen and (orientation:landscape) {#landscape {display: box; display: -webkit-box; display: -moz-box; display: -ms-flexbox;}}') +
    '</style>');
let map = { 'd': 1, 'f': 2, 'j': 3, 'k': 4 };
let key = ['!'];
// 在这里允许识别 D, T, A
let chs = ['@', '!', '#', '&', '+', '-', '%', '*', 'D', 'T', 'A'];
let len = key.length;
let hide = false;
let __Time = 20;
let __k = 4;
let _close = false;
let _fsj = false;
var url = './static/image/ClickBefore.png';

let lastTapTime = 0;

function isplaying() {
    return document.getElementById('welcome').style.display == 'none' &&
        document.getElementById('GameScoreLayer').style.display == 'none' &&
        document.getElementById("setting1").style.display == 'none';
}

function gl() {
    let tmp = [];
    len = key.length;
    for (let i = 0; i < len; ++i) {
        // 识别自定义字母和数字
        if (chs.includes(key[i]) || (key[i] >= '1' && key[i] <= __k.toString())) {
            tmp.push(key[i]);
        } else if (key[i] == '！') {
            tmp.push('!');
        }
    }
    key = tmp;
    if (key.length == 0) key = ['!'];
    len = key.length;
}

if (isDesktop) {
    document.write('<div id="gameBody">');
    document.onkeydown = function (e) {
        let key = e.key.toLowerCase();
        if (Object.keys(map).indexOf(key) !== -1 && isplaying()) {
            click(map[key]);
        } else if (key == 'r' && document.getElementById('GameScoreLayer').style.display != 'none') {
            gameRestart();
            document.getElementById('GameScoreLayer').style.display = 'none'
        }
    }
}

let body, blockSize, GameLayer = [], GameLayerBG, touchArea = [], GameTimeLayer;
let transform, transitionDuration;

function init() {
    showWelcomeLayer();
    body = document.getElementById('gameBody') || document.body;
    body.style.height = window.innerHeight + 'px';
    transform = typeof (body.style.webkitTransform) != 'undefined' ? 'webkitTransform' : (typeof (body.style.msTransform) != 'undefined' ? 'msTransform' : 'transform');
    transitionDuration = transform.replace(/ransform/g, 'ransitionDuration');
    GameTimeLayer = document.getElementById('GameTimeLayer');
    GameLayer.push(document.getElementById('GameLayer1'));
    GameLayer[0].children = GameLayer[0].querySelectorAll('div');
    GameLayer.push(document.getElementById('GameLayer2'));
    GameLayer[1].children = GameLayer[1].querySelectorAll('div');
    GameLayerBG = document.getElementById('GameLayerBG');
    if (GameLayerBG.ontouchstart === null) {
        GameLayerBG.ontouchstart = gameTapEvent;
    } else {
        GameLayerBG.onmousedown = gameTapEvent;
    }
    gameInit();
    initSetting();
    window.addEventListener('resize', refreshSize, false);
    let btn = document.getElementById('ready-btn');
    btn.className = 'btn btn-primary btn-lg';
    btn.onclick = function () { closeWelcomeLayer(); }
}

function winOpen() {
    window.open(location.href + '?r=' + Math.random(), 'nWin', 'height=500,width=320,toolbar=no,menubar=no,scrollbars=no');
    let opened = window.open('about:blank', '_self');
    opened.opener = null;
    opened.close();
}
let refreshSizeTime;

function refreshSize() {
    clearTimeout(refreshSizeTime);
    refreshSizeTime = setTimeout(_refreshSize, 200);
}

function _refreshSize() {
    countBlockSize();
    for (let i = 0; i < GameLayer.length; i++) {
        let box = GameLayer[i];
        for (let j = 0; j < box.children.length; j++) {
            let r = box.children[j], rstyle = r.style;
            rstyle.left = (j % __k) * blockSize + 'px';
            rstyle.bottom = Math.floor(j / __k) * blockSize + 'px';
            rstyle.width = blockSize + 'px';
            rstyle.height = blockSize + 'px';
        }
    }
    let f, a;
    if (GameLayer[0].y > GameLayer[1].y) {
        f = GameLayer[0]; a = GameLayer[1];
    } else {
        f = GameLayer[1]; a = GameLayer[0];
    }
    let y = ((_gameBBListIndex) % 10) * blockSize;
    f.y = y;
    f.style[transform] = 'translate3D(0,' + f.y + 'px,0)';
    a.y = -blockSize * Math.floor(f.children.length / __k) + y;
    a.style[transform] = 'translate3D(0,' + a.y + 'px,0)';
}

function countBlockSize() {
    blockSize = body.offsetWidth / __k;
    body.style.height = window.innerHeight + 'px';
    GameLayerBG.style.height = window.innerHeight + 'px';
    touchArea[0] = window.innerHeight - blockSize * 0;
    touchArea[1] = wind
