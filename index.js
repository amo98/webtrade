

var reg;
var method = { "method": ["getInfo", "TransHistory", "TradeHistory", "OrderList", "Trade", "CancelOrder"] };
var TRADE = { "trade": ["ltc_btc", "nmc_btc", "ppc_btc", "btc_usd", "ltc_usd", "nmc_usd", "ppc_usd"]};
var users = {
    user:[
    {
        param: {
            "getInfo": "",
            "TransHistory": { "from": "", "count": "", "from_id": "", "end_id": "", "order": "", "since": "", "end": "60", "pair": "100" },
            "OrderList": { "from": "", "count": "", "from_id": "", "end_id": "", "order": "", "since": "", "end": "", "pair": "", "active": "" },
            "Trade": { "pair": "", "type": "", "rate": "", "amount": "" },
            "CancelOrder": { "order_id": "" },
            "method": "",
            "nonce": 0
        },
        result: {
            "getInfo": "",
            "TransHistory": "",
            "OrderList": "",
            "Trade": "",
            "CancelOrder": "",
            "ticker": { "last": 0, "buy": 0, "sell": 0 },
            "depth": { "asks": [[]], "bids": [[]] }
        }
    }

]
};
var param = {
    "getInfo": "",
    "TransHistory": { "from": "", "count": "", "from_id": "", "end_id": "", "order": "", "since": "", "end": "60", "pair": "100" },
    "OrderList": { "from": "", "count": "", "from_id": "", "end_id": "", "order": "", "since": "", "end": "", "pair": "", "active": "" },
    "Trade": { "pair": "", "type": "", "rate": "", "amount": "" },
    "CancelOrder": { "order_id": "" },
    "method": "",
    "nonce": 0
};
var result = {
    "getInfo": "",
    "TransHistory": "",
    "OrderList": "",
    "Trade": "",
    "CancelOrder": "",
    "ticker": { "last": 0, "buy": 0, "sell": 0 },
    "depth": { "asks": [[]], "bids": [[]] }
};

var chosenEntry = null;
var chosenUser = 0;
var chosenMethod = null;
var chosenTrade = "ltc_btc";

function sign(secret, message) {
    return CryptoJS.HmacSHA512(message, secret);
}

function btcReq(reqParam, reqUrl, callback) {
    log(reqUrl);
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        log(xhr.response);
        callback(JSON.parse(xhr.response));
    };

    if (reqParam != "") {
        log("reqParam=" + reqParam);
        xhr.open("POST", reqUrl, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("key", reg.user[0].key);
        xhr.setRequestHeader("sign", sign(reg.user[0].sec, reqParam));

        xhr.send(reqParam);
    } else {
        log("GET " + reqUrl);
        xhr.open("GET", reqUrl, true);
        xhr.send();
    }
};
function makeReqParam() {
    var i;
    var str;
    str = "method=" + param.method + "&nonce=" + users.user[chosenUser].param.nonce;
    for (i in users.user[chosenUser].param[param.method]) {
        if (users.user[chosenUser].param[param.method][i])
            (str) ? (str = str + "&" + i + "=" + users.user[chosenUser].param[param.method][i]) : (str = i + "=" + users.user[chosenUser].param[param.method][i]);
    } 
    return str
}
function btcApi(method, callback) {
    param.method = method;

    var callbackReq = function (respon) {
        users.user[chosenUser].param.nonce++;
        users.user[chosenUser].result[param.method] = respon;
        callback(method);
    };
    var reqParam = makeReqParam(param);
    console.log("str=" + reqParam);
    btcReq(reqParam, reg.btcApiUrl, callbackReq);

};
function load(file) {


}
function log(text) {
    output.textContent = text + "\r\n" + output.textContent;
}
// for files, read the text content into the textarea

var trader = document.getElementById("Trader");
var ticker = document.getElementById("Ticker");
var loader = document.getElementById("Loader");
var saver = document.getElementById("Saver");
var pricer = document.getElementById("Pricer");
var output = document.getElementById("output");
var bors = document.getElementById("buyorsell");
var sltuser = document.getElementById("User");
var nc = document.getElementById("nonce");
nc.onclick = function () { users.user[chosenUser].param.nonce++ };

sltuser.onchange=function (e) {
    chosenUser = sltuser.value;
    log("chosenUser=" + chosenUser);
};

ticker.onclick = function () {
    //btcApi("getInfo", function (method) { console.log(result[method]) });

};


loader.addEventListener('click', function (e) {
    var accepts = [{
        mimeTypes: ['text/*'],
        extensions: ['json']
    }];
    chrome.fileSystem.chooseEntry({ type: 'openFile', accepts: accepts }, function (theEntry) {
        if (!theEntry) {
            log( 'No file selected.');
            return;
        }
        // use local storage to retain access to this file
        chrome.storage.local.set({ 'chosenFile': chrome.fileSystem.retainEntry(theEntry) });
        chosenEntry = theEntry;
        chosenEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function () {
                log(this.result);
                reg = JSON.parse(this.result);
                users.user[chosenUser].param.nonce = (reg.user[0].nonce);//reg.user[0].nonce;
                trader.innerHTML = "";
                for (i in TRADE.trade) {
                    trader.innerHTML += "<option value='" + TRADE.trade[i] + "'>" + TRADE.trade[i] + "</option>";
                }
                btcReq("", reg.url + reg.chosenTrade + "/ticker", function (resu) { pricer.value = resu.ticker.last; });
                sltuser.innerHTML = "";
                for (i in reg.user) {
                    sltuser.innerHTML += "<option value='" + reg.user[i].id + "'>" + reg.user[i].name + "</option>";
                }
                log("nonce=" + users.user[chosenUser].param.nonce);
                btcApi("getInfo", function (method) { log(JSON.stringify(users.user[chosenUser].result[method])) });
            };
            reader.readAsText(file);

        });
    });    
    log("click nonce" + users.user[chosenUser].param.nonce);
});


saver.addEventListener('click', function (e) {
    reg.user[chosenUser].nonce = users.user[chosenUser].param.nonce;
    console.log("saver nonce" + users.user[chosenUser].param.nonce);
    chrome.fileSystem.getWritableEntry(chosenEntry, function (writableFileEntry) {
        writableFileEntry.createWriter(function (writer) {
            var blob = new Blob([JSON.stringify(reg)], { type: "text/plain" });
            writer.onwriteend = function (e) { writer.write(blob); writer.onwriteend = function (e) { console.log("Writer end!") }};
            writer.truncate(0);
            
            
        }, function (e) { console.log(e) });
    });

});

function test(){
    
}