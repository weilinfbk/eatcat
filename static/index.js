// 强制清理旧缓存
if (!localStorage.getItem('eatcat_v15')) {
    document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    localStorage.setItem('eatcat_v15', 'ok');
}

const isEnSystem = navigator.language.toLowerCase().includes('en');
let isDesktop = navigator['userAgent'].match(/(ipad|iphone|ipod|android|windows phone)/i) ? false : true;
let fontunit = isDesktop ? 20 : ((window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth) / 320) * 10;

let dynamicStyle = document.createElement('style');
dynamicStyle.type = 'text/css';
dynamicStyle.textContent = 'html,body {font-size:' + (fontunit < 30 ? fontunit : '30') + 'px;}' +
    (isDesktop ? '#welcome,#GameTimeLayer,#GameLayerBG,#GameScoreLayer.SHADE{position: absolute;}' :
        '#welcome,#GameTimeLayer,#GameLayerBG,#GameScoreLayer.SHADE{position:fixed;}@media screen and (orientation:landscape) {#landscape {display: box; display: -webkit-box; display: -moz-box; display: -ms-flexbox;}}') +
    '#GameLayerBG { touch-action: none !important; -webkit-user-select: none !important; }' +
    '.block.hit { opacity: 0.35; }' +
    '.block.bad { background-color: #d33 !important; }';
document.head.appendChild(dynamicStyle);

let map = { 'd': 1, 'f': 2, 'j': 3, 'k': 4 };
let key = ['!'];
let chs = ['@', '!', '#', '&', '+', '-', '%', '*', 'D', 'T', 'A'];
let len = key.length;
let hide = false;
let __Time = 20;
let __k = 4;
let _close = false;
let _fsj = false;
var url = './static/image/ClickBefore.png';

function isplaying() {
    return document.getElementById('welcome').style.display == 'none' &&
        document.getElementById('GameScoreLayer').style.display == 'none' &&
        document.getElementById("setting1").style.display == 'none';
}

function gl() {
    let tmp = [];
    for (let i = 0; i < key.length; ++i) {
        let ch = key[i];
        if (chs.includes(ch)) {
            tmp.push(ch);
        } else if (ch >= '1' && ch <= '9') {
            let n = parseInt(ch, 10);
            if (n >= 1 && n <= Math.max(__k, 9)) tmp.push(ch);
        } else if (ch == '！') {
            tmp.push('!');
        }
    }
    key = tmp;
    if (key.length == 0) key = ['!'];
    len = key.length;
    last = 0;
}

if (isDesktop) {
    let gameBodyDiv = document.createElement('div');
    gameBodyDiv.id = 'gameBody';
    document.body.appendChild(gameBodyDiv);
    
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

function bindEvents() {
    GameLayerBG.onmousedown = null;
    GameLayerBG.ontouchstart = null;
    GameLayerBG.onpointerdown = null;
    GameLayerBG.removeEventListener('touchstart', handleTouchStart);
    GameLayerBG.removeEventListener('pointerdown', handlePointerDown);

    if (window.PointerEvent) {
        GameLayerBG.addEventListener('pointerdown', handlePointerDown, { passive: false });
    } else if ('ontouchstart' in window) {
        GameLayerBG.addEventListener('touchstart', handleTouchStart, { passive: false });
    } else {
        GameLayerBG.onmousedown = gameTapEvent;
    }
}

function handlePointerDown(e) {
    e.preventDefault();
    gameTapEvent(e);
}

function handleTouchStart(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        let touch = e.changedTouches[i];
        let elem = document.elementFromPoint(touch.clientX, touch.clientY);
        if (elem) {
            gameTapEvent({
                target: elem,
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }
    }
}

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
    
    bindEvents();

    gameInit();
    initSetting();
    window.addEventListener('resize', refreshSize, false);
    let btn = document.getElementById('ready-btn');
    btn.className = 'btn btn-primary btn-lg';
    btn.onclick = function () { closeWelcomeLayer(); }
}

function refreshSize() {
    clearTimeout(refreshSizeTime);
    refreshSizeTime = setTimeout(_refreshSize, 200);
}
let refreshSizeTime;

function _refreshSize() {
    if (!_gameStart && !_gameOver) {
        countBlockSize();
        gameRestart();
    }
}

function countBlockSize() {
    blockSize = body.offsetWidth / __k;
    body.style.height = window.innerHeight + 'px';
    GameLayerBG.style.height = window.innerHeight + 'px';
    touchArea[0] = window.innerHeight - blockSize * 0; // 最底边
    touchArea[1] = window.innerHeight - blockSize * 3; // 距离顶部 3 格的界限
}

let _gameBBList = [], _gameBBListIndex = 0, _gameOver = false, _gameStart = false, _gameTime, _gameTimeNum, _gameScore, _date1, deviation_time;

function playAudio(id) {
    if (_close) return;
    try {
        var audio = new Audio('./static/music/' + id + '.mp3');
        audio.volume = 0.8;
        audio.play().catch(function(e) {});
    } catch(e) {}
}

function gameInit() {
    gameRestart();
}

let last = 0, lkey = 0;

function gameRestart() {
    last = 0; lkey = 0; _gameBBList = []; _gameBBListIndex = 0; _gameScore = 0; _gameOver = false; _gameStart = false;
    _gameTimeNum = __Time;
    GameTimeLayer.innerHTML = creatTimeText(_gameTimeNum);
    countBlockSize();
    
    for (let i = 0; i < GameLayer.length; i++) {
        let box = GameLayer[i];
        for (let j = 0; j < box.children.length; j++) {
            let r = box.children[j];
            r.className = 'block';
            r.style.backgroundImage = "none";
            r.notEmpty = false;
        }
    }
    
    refreshGameLayer(GameLayer[0]);
    refreshGameLayer(GameLayer[1], 1);
}

function gameStart() {
    _date1 = new Date();
    _gameStart = true;
    _gameTimeNum = __Time;
    _gameTime = setInterval(gameTime, 1000);
}

let date2 = new Date();

function gameOver() {
    date2 = new Date();
    if (!_date1) { _date1 = date2; }
    _gameOver = true;
    clearInterval(_gameTime);
    setTimeout(function () {
        GameLayerBG.className = '';
        showGameScoreLayer();
    }, 1500);
}

function gameTime() {
    _gameTimeNum--;
    if (_gameTimeNum <= 0) {
        GameTimeLayer.innerHTML = isEnSystem ? '&nbsp;&nbsp;&nbsp;&nbsp;Time\'s Up!' : '&nbsp;&nbsp;&nbsp;&nbsp;时间到！';
        gameOver();
        GameLayerBG.className += ' flash';
        playAudio("end");
    } else {
        GameTimeLayer.innerHTML = creatTimeText(_gameTimeNum);
    }
}

function creatTimeText(n) {
    return isEnSystem ? '&nbsp;Time Left: ' + n : '&nbsp;剩余时间:' + n;
}

let _ttreg = / t{1,2}(\d+)/, _clearttClsReg = / t{1,2}\d+| bad| hit/;

function Randomfrom(Min, Max) {
    let Range = Max - Min, Rand = Math.random();
    return Min + Math.round(Rand * Range);
}

function randomPos() {
    let x = 0;
    if (key[last] == '!') {
        x = Math.floor(Math.random() * 1000) % __k;
    } else if (key[last] == '@') {
        x = Math.floor(Math.random() * 1000) % __k;
        if (x == lkey) {
            x++;
            if (x == __k) x = 0;
        }
    } else if (key[last] == '#') {
        x = lkey;
    } else if (key[last] == '&') {
        x = __k - 1 - lkey;
    } else if (key[last] == '+') {
        let num = parseInt(key[last + 1]) || 0;
        last++;
        x = (lkey + num) % __k;
    } else if (key[last] == '-') {
        let num = parseInt(key[last + 1]) || 0;
        last++;
        x = (lkey - num + __k) % __k;
    } else if (key[last] == '%') {
        let num1 = parseInt(key[last + 1]) - 1;
        let num2 = parseInt(key[last + 2]) - 1;
        if (num2 < num1) num2 += __k;
        x = Randomfrom(num1, num2) % __k;
        last += 2;
    } else if (key[last] == '*') {
        let l = parseInt(key[last + 1]);
        let nums = [];
        for (let i = 1; i <= l; ++i) nums.push(parseInt(key[last + i + 1]) - 1);
        last += l + 1;
        x = nums[Randomfrom(0, l - 1)];
    } else {
        x = parseInt(key[last]) - 1;
    }
    
    if (isNaN(x) || x < 0 || x >= __k) x = 0;
    lkey = x;
    last++;
    if (last >= len) last = 0;
    return x;
}

function refreshGameLayer(box, loop, offset) {
    let totalRows = Math.floor(box.children.length / __k);
    let startRow = loop ? 0 : 1;
    let baseGroup = loop ? 100 : 0;

    for (let j = 0; j < box.children.length; j++) {
        let r = box.children[j], rstyle = r.style;
        rstyle.left = (j % __k) * blockSize + 'px';
        rstyle.bottom = Math.floor(j / __k) * blockSize + 'px';
        rstyle.width = blockSize + 'px';
        rstyle.height = blockSize + 'px';
        rstyle.backgroundImage = "none";
        r.className = 'block';
        r.notEmpty = false;
    }

    for (let row = startRow; row < totalRows; row++) {
        let currentKey = key[last];
        let isChordMode = (currentKey === 'D' || currentKey === 'T' || currentKey === 'A');

        if (isChordMode) {
            let pCount = 2;
            if (currentKey === 'T' && __k >= 3) pCount = 3;
            if (currentKey === 'A' && __k >= 4) pCount = __k;
            pCount = Math.min(pCount, __k);

            let allCols = Array.from({length: __k}, (_, i) => i);
            let posArray = [];
            for (let i = 0; i < pCount; i++) {
                let idx = Math.floor(Math.random() * allCols.length);
                posArray.push(allCols.splice(idx, 1)[0]);
            }

            posArray.forEach(col => {
                let targetJ = row * __k + col;
                let r = box.children[targetJ];
                if (r) {
                    _gameBBList.push({ cell: col, id: r.id, hit: false, chordGroup: baseGroup + row });
                    r.style.backgroundImage = "url(" + url + ")";
                    r.style.backgroundSize = 'cover';
                    r.className += ' t' + (Math.floor(Math.random() * 1000) % (__k + 1) + 1);
                    r.notEmpty = true;
                }
            });

            last++;
            if (last >= len) last = 0;
        } else {
            let x = randomPos();
            let targetJ = row * __k + x;
            let r = box.children[targetJ];
            if (r) {
                _gameBBList.push({ cell: x, id: r.id, hit: false, chordGroup: undefined });
                r.style.backgroundImage = "url(" + url + ")";
                r.style.backgroundSize = 'cover';
                r.className += ' t' + (Math.floor(Math.random() * 1000) % (__k + 1) + 1);
                r.notEmpty = true;
            }
        }
    }

    if (loop) {
        box.style.webkitTransitionDuration = '0ms';
        box.style.display = 'none';
        box.y = -blockSize * (Math.floor(box.children.length / __k) + (offset || 0)) * loop;
        setTimeout(function () {
            box.style[transform] = 'translate3D(0,' + box.y + 'px,0)';
            setTimeout(function () { box.style.display = 'block'; }, 0);
        }, 0);
    } else {
        box.y = 0;
        box.style[transform] = 'translate3D(0,' + box.y + 'px,0)';
    }
    // 🌟 将动画时间缩短到 80ms，视觉跟手，按快了不至于漏
    box.style[transitionDuration] = '200ms';
}

function gameLayerMoveNextRow() {
    for (let i = 0; i < GameLayer.length; i++) {
        let g = GameLayer[i];
        g.y += blockSize;
        if (g.y > blockSize * (Math.floor(g.children.length / __k))) {
            refreshGameLayer(g, 1, -1);
        } else {
            g.style[transform] = 'translate3D(0,' + g.y + 'px,0)';
        }
    }
    if (_gameBBListIndex > 200) {
        _gameBBList = _gameBBList.slice(_gameBBListIndex);
        _gameBBListIndex = 0;
    }
}

// 🌟 核心修改：彻底采用旧版的“无脑列判定”，无视空地，X轴对了就吃！
function gameTapEvent(e) {
    if (_gameOver) return false;

    let tar = e.target;
    let y = e.clientY;
    let x = e.clientX - body.offsetLeft;

    if (!tar) return false;

    let p = _gameBBList[_gameBBListIndex];
    if (!p) {
        let upper = GameLayer[0].y < GameLayer[1].y ? GameLayer[0] : GameLayer[1];
        if (upper.y < 0) refreshGameLayer(upper, 1, -1);
        p = _gameBBList[_gameBBListIndex];
        if (!p) return false;
    }

    let hitIndex = -1;
    
    // 完全还原旧版粗暴判定：只要按在正确的列，且在有效高度内，就直接算命中，不管点的是不是猫猫本体
    if (!_fsj) {
        if (x >= p.cell * blockSize && x < (p.cell + 1) * blockSize) {
            if (y > touchArea[1]) {
                hitIndex = _gameBBListIndex;
            }
        } else if (p.chordGroup !== undefined) {
            for (let i = _gameBBListIndex; i < _gameBBList.length; i++) {
                let cur = _gameBBList[i];
                if (cur.chordGroup !== p.chordGroup) break;
                if (cur.hit) continue;
                if (x >= cur.cell * blockSize && x < (cur.cell + 1) * blockSize && y > touchArea[1]) {
                    hitIndex = i; break;
                }
            }
        }
    } else {
        if (tar.notEmpty) {
            if (p.chordGroup !== undefined) {
                for (let i = _gameBBListIndex; i < _gameBBList.length; i++) {
                    let cur = _gameBBList[i];
                    if (cur.chordGroup !== p.chordGroup) break;
                    if (cur.hit) continue;
                    if (cur.id == tar.id) { hitIndex = i; break; }
                }
            } else {
                if (p.id == tar.id) hitIndex = _gameBBListIndex;
            }
        }
    }

    if (hitIndex !== -1) {
        if (!_gameStart) gameStart();
        playAudio("tap");

        let curP = _gameBBList[hitIndex];
        if (curP.hit) return false;
        curP.hit = true;

        let curTar = document.getElementById(curP.id);
        if (curTar) {
            curTar.className = curTar.className.replace(_ttreg, ' tt$1');
            curTar.style.backgroundImage = "none";
            curTar.notEmpty = false;
        }
        _gameScore++;

        let allHit = true;
        if (p.chordGroup !== undefined) {
            for (let i = _gameBBListIndex; i < _gameBBList.length; i++) {
                let cur = _gameBBList[i];
                if (cur.chordGroup !== p.chordGroup) break;
                if (!cur.hit) { allHit = false; break; }
            }
        }

        if (allHit) {
            while (_gameBBListIndex < _gameBBList.length && _gameBBList[_gameBBListIndex].hit) {
                _gameBBListIndex++;
            }
            gameLayerMoveNextRow();
        }
        return false;
    } else {
        // 宽容保护：普通模式下，点上方豁免
        if (!_fsj) {
            let currentCat = document.getElementById(p.id);
            if (currentCat) {
                let rect = currentCat.getBoundingClientRect();
                if (y < rect.top) {
                    return false;
                }
            }
        }

        if (!_gameStart) gameStart();
        playAudio("err");
        gameOver();
        
        if (tar.classList && tar.classList.contains('block')) {
            tar.classList.add('bad');
        }
        return false;
    }
}

function createGameLayer() {
    let html = '<div id="GameLayerBG">';
    for (let i = 1; i <= 2; i++) {
        let id = 'GameLayer' + i;
        html += '<div id="' + id + '" class="GameLayer">';
        for (let j = 0; j < (__k * 2 >= 10 ? __k * 2 : __k * 3); j++) {
            for (let k = 0; k < __k; k++) {
                html += '<div id="' + id + '-' + (k + j * __k) + '" num="' + (k + j * __k) + '" class="block"></div>';
            }
        }
        html += '</div>';
    }
    html += '</div><div id="GameTimeLayer"></div>';
    return html;
}

function closeWelcomeLayer() {
    let l = document.getElementById('welcome');
    l.style.display = 'none';
}

function showWelcomeLayer() {
    let l = document.getElementById('welcome');
    l.style.display = 'block';
}

function showGameScoreLayer() {
    let l = document.getElementById('GameScoreLayer');
    let lastId = _gameBBList[_gameBBListIndex - 1] ? _gameBBList[_gameBBListIndex - 1].id : (_gameBBList[0] ? _gameBBList[0].id : null);
    let c = 1;
    if (lastId) {
        let match = document.getElementById(lastId).className.match(_ttreg);
        if (match) c = match[1];
    }
    l.className = l.className.replace(/bgc\d/, 'bgc' + c);
    document.getElementById('GameScoreLayer-text').innerHTML = hide ? '' : "<span style='color:red;'>" + shareText(_gameScore) + "</span>";

    let dt = deviation_time > 0 ? deviation_time : 1;
    let score_text = '';
    if (isEnSystem) {
        score_text = 'You survived ';
        score_text += "<span style='color:red;'>" + (dt / 1000).toFixed(2) + "</span>" + ' seconds!<br>Your score is ';
        score_text += "<span style='color:red;'>" + _gameScore + "</span>";
        score_text += '<br>You clicked ';
        score_text += "<span style='color:red;'>" + (_gameScore * 1000 / dt).toFixed(2);
        score_text += "</span>" + ' times per second on average!';
        score_text += "<br>Equivalent to <span style='color:red;'>" + (_gameScore * 15000 / dt).toFixed(2) + "</span> BPM 16th notes!";
    } else {
        score_text = '您坚持了 ';
        score_text += "<span style='color:red;'>" + (dt / 1000).toFixed(2) + "</span>" + ' 秒哦！<br>您的得分为 ';
        score_text += "<span style='color:red;'>" + _gameScore + "</span>";
        score_text += '<br>您平均每秒点击了 ';
        score_text += "<span style='color:red;'>" + (_gameScore * 1000 / dt).toFixed(2);
        score_text += "</span>" + ' 次哦！';
        score_text += "<br>相当于 <span style='color:red;'>" + (_gameScore * 15000 / dt).toFixed(2) + "</span> BPM 下的十六分音符哦！";
    }
    document.getElementById('GameScoreLayer-score').innerHTML = score_text;

    let bast = cookie('bast-score');
    if (!bast || _gameScore > bast) {
        bast = _gameScore;
        cookie('bast-score', bast, 100);
    }
    document.getElementById('GameScoreLayer-bast').innerHTML = (isEnSystem ? 'Best Score: ' : '历史最佳得分 ') + "<span style='color:red;'>" + bast + "</span>";
    let now = (isEnSystem ? 'Your custom pattern: ' : '您的自定义键型为：') + "<span style='color:red;'>" + key.join('') + "</span>";
    document.getElementById('now').innerHTML = now;
    l.style.display = 'block';
}

function hideGameScoreLayer() {
    let l = document.getElementById('GameScoreLayer');
    l.style.display = 'none';
}

function replayBtn() {
    gameRestart();
    hideGameScoreLayer();
}

function backBtn() {
    gameRestart();
    hideGameScoreLayer();
    showWelcomeLayer();
}

function shareText(score) {
    deviation_time = Math.max(1, date2.getTime() - (_date1 ? _date1.getTime() : date2.getTime()));
    if (isEnSystem) {
        if (score <= 2.5 * __Time) return 'Keep going! I believe in you!';
        if (score <= 5 * __Time) return '^_^ Try harder, you are the Stamina King!';
        if (score <= 7.5 * __Time) return 'PRO!';
        if (score <= 10 * __Time) return 'G O D!';
        return 'Are you an alien?';
    } else {
        if (score <= 2.5 * __Time) return '加油！我相信您可以的！';
        if (score <= 5 * __Time) return '^_^ 加把劲，底力大王就是您！';
        if (score <= 7.5 * __Time) return '您！';
        if (score <= 10 * __Time) return '太 您 了！';
        return '您是外星人嘛？';
    }
}

function toStr(obj) {
    return typeof obj == 'object' ? JSON.stringify(obj) : obj;
}

function cookie(name, value, time) {
    if (name) {
        if (value) {
            if (time) {
                let date = new Date();
                date.setTime(date.getTime() + 864e5 * time), time = date.toGMTString();
            }
            return document.cookie = name + "=" + escape(toStr(value)) + (time ? "; expires=" + time + (arguments[3] ? "; domain=" + arguments[3] + (arguments[4] ? "; path=" + arguments[4] + (arguments[5] ? "; secure" : "") : "") : "") : ""), !0;
        }
        return value = document.cookie.match("(?:^|;)\\s*" + name.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1") + "=([^;]*)"),
            value = value && "string" == typeof value[1] ? unescape(value[1]) : !1, (/^(\{|\[).+\}|\]$/.test(value) || /^[0-9]+$/.test(value)) && eval("value=" + value), value;
    }
    let data = {};
    value = document.cookie.replace(/\s/g, "").split(";");
    for (let i = 0; value.length > i; i++) name = value[i].split("="), name[1] && (data[name[0]] = unescape(name[1]));
    return data;
}

let gameRootDiv = document.createElement('div');
gameRootDiv.innerHTML = createGameLayer();
while (gameRootDiv.firstChild) {
    document.body.appendChild(gameRootDiv.firstChild);
}

function rebuildGameLayer() {
    let el = document.getElementById('GameLayerBG'), fa = el.parentNode;
    fa.removeChild(el);
    fa.removeChild(GameTimeLayer);
    fa.appendChild(parseElement(createGameLayer()));
    fa.appendChild(parseElement("<div id = \"GameTimeLayer\"></div>"));
    GameTimeLayer = document.getElementById("GameTimeLayer");
    GameLayer = [];
    GameLayer.push(document.getElementById('GameLayer1'));
    GameLayer[0].children = GameLayer[0].querySelectorAll('div');
    GameLayer.push(document.getElementById('GameLayer2'));
    GameLayer[1].children = GameLayer[1].querySelectorAll('div');
    GameLayerBG = document.getElementById('GameLayerBG');
    bindEvents();
}

function initSetting() {
    if (cookie('k')) {
        let tsmp = parseInt(cookie('k'));
        if (tsmp != __k) {
            __k = tsmp;
            rebuildGameLayer();
        }
    }
    if (cookie('time')) {
        __Time = parseInt(cookie('time'));
        GameTimeLayer.innerHTML = creatTimeText(__Time);
    }
    if (cookie('key')) {
        var str = cookie('key');
        map = {};
        for (let i = 0; i < __k; ++i) map[str.charAt(i).toLowerCase()] = i + 1;
    }
    if (cookie('note')) {
        var note = cookie('note');
        key = note.split('');
        gl();
    }
    if (cookie("hide") && cookie("hide").toString() == '1') hide = true;
    if (cookie("fsj") && cookie("fsj").toString() == '1') _fsj = true;
    if (cookie("close") && cookie("close").toString() == '1') _close = true;
    gameRestart();
}

function show_btn(i) {
    document.getElementById("tt").style.display = "block";
    document.getElementById("ttt").style.display = "block";
    document.getElementById("btn_group").style.display = "block";
    document.getElementById("btn_group2").style.display = "block";
    document.getElementById("setting" + i.toString()).style.display = "none";
}

function nxtpage(i) {
    document.getElementById("setting" + i.toString()).style.display = "none";
    document.getElementById("setting" + (i + 1).toString()).style.display = "block";
}

function lstpage(i) {
    document.getElementById("setting" + i.toString()).style.display = "none";
    document.getElementById("setting" + (i - 1).toString()).style.display = "block";
}

function show_setting() {
    var str = [];
    for (var i = 1; i <= __k; ++i) str.push('a');
    for (var ke in map) str[map[ke] - 1] = ke.charAt(0);
    
    document.getElementById("k").value = __k.toString();
    document.getElementById("keyboard").value = str.join('');
    document.getElementById("timeinput").value = __Time.toString();
    document.getElementById("note").value = key.join('');
    document.getElementById("hide").checked = hide;
    document.getElementById("close").checked = _close;
    document.getElementById("fsj").checked = _fsj;
    document.getElementById("btn_group").style.display = "none";
    document.getElementById("btn_group2").style.display = "none";
    document.getElementById("tt").style.display = "none";
    document.getElementById("ttt").style.display = "none";
    document.getElementById("setting1").style.display = "block";
}

function parseElement(htmlString) {
    return new DOMParser().parseFromString(htmlString, 'text/html').body.childNodes[0];
}

function save_cookie() {
    let str = document.getElementById("keyboard").value;
    let Time = document.getElementById("timeinput").value;
    let note = document.getElementById("note").value;
    hide = document.getElementById("hide").checked;
    _close = document.getElementById("close").checked;
    _fsj = document.getElementById("fsj").checked;

    let tsmp = parseInt(document.getElementById("k").value);
    if (tsmp != __k) {
        __k = tsmp;
        rebuildGameLayer();
    }

    map = {};
    for (let i = 0; i < __k; ++i) map[str.charAt(i).toLowerCase()] = i + 1;

    __Time = parseInt(Time);
    GameTimeLayer.innerHTML = creatTimeText(__Time);
    key = note.split('');
    gl();
    cookie('k', __k.toString(), 100);
    cookie('note', key.join(''), 100);
    cookie('time', Time, 100);
    cookie('key', str, 100);
    cookie('close', _close ? "1" : "0", 100);
    cookie('hide', hide ? "1" : "0", 100);
    cookie('fsj', _fsj ? "1" : "0", 100);
    gameRestart();
}

function isnull(val) {
    let str = val.replace(/(^\s*)|(\s*$)/g, '');
    return str == '' || str == undefined || str == null;
}

function click(index) {
    let p = _gameBBList[_gameBBListIndex];
    if (!p) return;
    let base = parseInt(document.getElementById(p.id).getAttribute("num")) - p.cell;
    let num = base + index - 1;
    let id = p.id.substring(0, 11) + num;
    let fakeEvent = {
        clientX: ((index - 1) * blockSize + index * blockSize) / 2 + body.offsetLeft,
        clientY: (touchArea[0] + touchArea[1]) / 2,
        target: document.getElementById(id),
    };
    gameTapEvent(fakeEvent);
}

function foreach() {
    var arrCookie = document.cookie.split("; ");
    for (var i = 0; i < arrCookie.length; i++) {
        var arr = arrCookie[i].split("=");
        if (arr.length > 0) DelCookie(arr[0]);
    }
}

function GetCookieVal(offset) {
    var endstr = document.cookie.indexOf(";", offset);
    if (endstr == -1) endstr = document.cookie.length;
    return decodeURIComponent(document.cookie.substring(offset, endstr));
}

function DelCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = GetCookie(name);
    document.cookie = name + "=" + cval + "; expires=" + exp.toGMTString();
}

function GetCookie(name) {
    var arg = name + "=", alen = arg.length, clen = document.cookie.length, i = 0;
    while (i < clen) {
        var j = i + alen;
        if (document.cookie.substring(i, j) == arg) return GetCookieVal(j);
        i = document.cookie.indexOf(" ", i) + 1;
        if (i == 0) break;
    }
    return null;
}

function autoset(asss) {
    key = asss.split('');
    gl();
    gameRestart();
}

function showImg(input) {
    var file = input.files[0];
    url = window.URL.createObjectURL(file);
    if (typeof GameLayer !== 'undefined') {
        for (var i = 0; i < GameLayer.length; i++) {
            var children = GameLayer[i].children;
            for (var j = 0; j < children.length; j++) {
                if (children[j].notEmpty) {
                    children[j].style.backgroundImage = "url(" + url + ")";
                }
            }
        }
    }
}

function stair() {
    key = [];
    for (var i = 1; i < __k; ++i) key.push(i.toString());
    for (var i = __k; i > 1; --i) key.push(i.toString());
    gl();
    gameRestart();
}
