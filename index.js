

var reg;
var method = { "method": ["getInfo", "TransHistory", "TradeHistory", "OrderList", "Trade", "CancelOrder"] };
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
var chosenTrade = "btc/ltc";

function sign(secret, message) {
    return CryptoJS.HmacSHA512(message, secret);
}

function btcReq(reqParam, reqUrl, callback) {

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        callback(JSON.parse(xhr.response));
    };
    xhr.open("POST", reqUrl, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("key", reg.user[0].key);
    xhr.setRequestHeader("sign", sign(reg.user[0].sec, reqParam));
    xhr.send(reqParam);
};
function makeReqParam() {
    var i;
    var str;
    str = "method=" + param.method + "&nonce=" + param.nonce;
    for (i in param[param.method]) {
        if (param[param.method][i])
            (str) ? (str = str + "&" + i + "=" + param[param.method][i]) : (str = i + "=" + param[param.method][i]);
    } 
    return str
}
function btcApi(method, callback) {
    param.method = method;

    var callbackReq = function (respon) {
        param.nonce++;
        result[param.method] = respon;
        callback(method);
    };
    var reqParam = makeReqParam(param);
    console.log("str=" + reqParam);
    btcReq(reqParam, reg.btcApiUrl, callbackReq);

};
function load() {


}
// for files, read the text content into the textarea


var ticker = document.getElementById("ticker");
var input = document.getElementById("input");
var quit= document.getElementById("quit");
var output = document.getElementById("output");
ticker.onclick = function () {
    btcApi("getInfo", function (method) { console.log(result[method]) });
};

function log(text) {
    output.textContent = text + "\r\n" + output.textContent;
}
input.addEventListener('click', function (e) {
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
                log( this.result );
                reg = JSON.parse(this.result);
                param.nonce = reg.user[0].nonce;//reg.user[0].nonce;
                log( "nonce=" + param.nonce );
            };
            reader.readAsText(file);
        });
    });    
    log("click nonce" + param.nonce);
});


quit.addEventListener('click', function (e) {
    reg.user[0].nonce = param.nonce;
    console.log("quit nonce" + param.nonce);
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