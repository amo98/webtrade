/*
onload = function() {
  var login = document.getElementById("login");
  var output = document.getElementById("output");

  login.onclick = function() {
    var redirectUrl = "https://" + chrome.runtime.id + ".chromiumapp.org/";
    var clientId = "1ac94815c30440efa6f7de3c0d529515";
    var authUrl = "https://instagram.com/oauth/authorize/?" +
        "client_id=" + clientId + "&" +
        "response_type=token&" +
        "redirect_uri=" + encodeURIComponent(redirectUrl);
 
    chrome.identity.launchWebAuthFlow({url: authUrl, interactive: true},
        function(responseUrl) {
      console.log(responseUrl);
      var accessToken = responseUrl.substring(responseUrl.indexOf("=") + 1);
      console.log(accessToken);

      var api = new btceAPI(accessToken);
      api.request("users/self/feed", undefined, function(data) {  
        console.log(data);
        output.textContent = JSON.stringify(data, null, 4);
        

      });
    });
  };
};

var btceAPI = function(accessToken) {
  this.request = function(method, arguments, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      callback(JSON.parse(xhr.response));
    };

    xhr.open("GET", "https://api.instagram.com/v1/" + method + "?access_token=" + accessToken);
    xhr.send();
  };
}
*/

  var login=document.getElementById("login");
  var output = document.getElementById("output");
  var ticker = document.getElementById("ticker");
var key="DV9IQLKJ-IBGRXLLC-MQQ1BNOA-WQDKRCGJ-YVM4Q2O9";
var sec="7488fd6a2094652667e2e062158226c654d11055c508485c6e612a0c1055405b";
  var nonce=5;



  ticker.onclick=function(){
    var tickurl="https://btc-e.com/tapi";
    console.log(tickurl);
    var api= new btceAPI("nonce=10&method=getInfo");
    
    api.request(tickurl,function(data){
      console.log(data);
      output.textContent=JSON.stringify(data,null,4);
    });
    
  };

var btceAPI = function(reqPam) {
  this.request = function(requrl, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      callback(JSON.parse(xhr.response));
    };

    xhr.open("POST", requrl,true );
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.setRequestHeader("key","DV9IQLKJ-IBGRXLLC-MQQ1BNOA-WQDKRCGJ-YVM4Q2O9");
    xhr.setRequestHeader("sign",sign(sec,reqPam));
    //xhr.setRequestHeader("nonce",nonce);
    
    xhr.send(reqPam);
  };
};

function makenonce(){nonce++};

function sign (secret,message){
  return  CryptoJS.HmacSHA512(message, secret);
}