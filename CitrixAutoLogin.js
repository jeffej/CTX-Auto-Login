var username, passwd, ns_url;
var webviewEle;
var firstLoad = true, listenterAdded = false;

function createWebview() {
  console.info('TRACE: create webview element');
  webviewEle = document.createElement('webview');
  webviewEle.id = 'webviewEle';
  webviewEle.style.height = '500px';
  webviewEle.style.width = '750px';
  webviewEle.style.border = '1px solid green';
  webviewEle.src = 'about:blank';
  document.body.appendChild(webviewEle);
}

window.onload = function() {
  
  //Load configuration from JSON
  loginDomain = "";
  userUsername = "";
  userPassword = "";
  chrome.storage.managed.get(null,function(result)
  {
    if (result!==undefined && result["nsURL"]!==undefined)
    {
      loginDomain = result["nsURL"];
      console.log("nsURL from JSON: " + loginDomain);
    }
    
    if (result!==undefined && result["userUsername"]!==undefined)
    {
      userUsername = result["userUsername"];
      console.log("userUsername from JSON: " + userUsername);
    }
    
    if (result!==undefined && result["userPassword"]!==undefined)
    {
      userPassword = result["userPassword"];
      console.log("userPassword from JSON: " + userPassword);
    }
  });
  
  console.info('TRACE: onload');
  createWebview();
  window.addEventListener('message', e => {
    let msg = e.data.split(':');
    if(e.data.startsWith('icaData:')){
      iniIcadata = e.data.substring(8);
      console.log('ICA Data - ' + iniIcadata);
      //launching a session using chrome SDK
      document.getElementById("createSession").click();
    }
    else{
      let logs = msg[1].split('-->');
      for(let j=0; j < logs.length; j++){
        console.log('Webview Injected Logs : ' + logs[j]);
      }
    }
  });
  var test = "https://";
  document.getElementById('autolo').onclick = function() {autoLogin(loginDomain, userUsername, userPassword)};
};

//Follows the steps mentioned on https://sysadminasaservice.wordpress.com/2015/08/30/login-to-storefront-with-curl/
function autoLogin(loginDomain, userUsername, userPassword) {
  /*ns_url = document.getElementById('nsURL').value;
  username = document.getElementById('username').value;
  passwd = document.getElementById('passwd').value;*/
  ns_url = 'https://login.chromesummit.com/Citrix/StoreWeb';
  username = 'Administrator';
  passwd = 'Adminrx0518.';
  
  if (loginDomain === "") {loginDomain = document.getElementById('nsURL').value;}
  ns_url = loginDomain;
  if (userUsername === "") {userUsername = document.getElementById('username').value;}
  username = userUsername;
  if (userPassword === "") {userPassword = document.getElementById('passwd').value;}
  passwd = userPassword;
  console.log("The vars below should match from the app policy JSON");
  console.log("ns_url from inside autoLogin(): " + ns_url);
  console.log("username from inside autoLogin(): " + username);
  console.log("passwd from inside autoLogin(): " + passwd);
  
  //starting once all cookies are cleared for ns_url
  if(webviewEle && webviewEle.src !== 'about:blank'){
    firstLoad = true;
    console.info('TRACE: webview not blank, src = ' + webviewEle.src);
  }
  else{
    console.info('TRACE: set webview element src to ns_url: ' + ns_url);
    webviewEle.src = ns_url;
  }
  
  console.info('TRACE: clear cookies always first');
  var cleared = webviewEle.clearData(
    { since: 0 },
    { cookies: true, sessionCookies: true, persistentCookies: true },
    function() {
      console.log('TRACE: cookies cleared');
      start();
    }
  );
}

//since we cleared cookies for ns_url it should behave as follows :
// 1. load webview with login page which triggers loadstop event
// 2. Make XHR call to /cgi/login (For Netscaler login) and reload page
// 3. Loadstop gets triggered again because of reload(should take you to Storefront page) and then we Inject post login scripts

function start(){
  console.info('TRACE: start autologin');
  if(!listenterAdded) {
    listenterAdded = true;
    webviewEle.addEventListener('contentload', function() {
      console.log('TRACE: contentload triggered', webviewEle.src);
      if(firstLoad){
        firstLoad = false;
        preLogin();
      }
      else{
        postLogin();
      }
    });
  }
  webviewEle.src = ns_url;

  function preLogin() {
    console.info('TRACE: Executing preLogin');
    webviewEle.executeScript({code:
      "var dataFromWebview = {}; \
      var appOrigin, appWindow; \
      var logBuffer = '';\
      \
      window.addEventListener('message', (e) => { console.log(e,e.source); appOrigin = e.origin; appWindow= e.source; d = e.data.split(':'); dataFromWebview[d[0]] = d[1]; }); \
      \
      function logMsg(msg){ console.log(msg); if(appWindow){if(logBuffer.length > 0) {msg = logBuffer + msg; logBuffer = '';}appWindow.postMessage('log:' + msg, appOrigin);} else{logBuffer = logBuffer + msg + '-->';} }\
      \
      function getCookie(name) { var results = document.cookie.match('(^|;) ?' + name + '=([^;]*)'); return results ? unescape(results[2]) : null; } \
      logMsg('Step 1 - Login to NS Gateway'); \
      logMsg('Cookies before cgi login - ' + document.cookie); \
      var xhr = new XMLHttpRequest();  \
      xhr.open('POST', '/cgi/login'); \
      xhr.onreadystatechange = function(){ if(xhr.readyState === 4 && xhr.status===200){ \
        if(getCookie('NSC_AAAC')){ \
          logMsg('Login Successful, ' + 'Cookies - ' + document.cookie); \
          location.reload(); \
        }else { \
          logMsg('Login failed, Cookies - ' + document.cookie);\
        } \
      }}; \
      xhr.send('login=" + username + "&passwd=" + passwd + "'); \
      "
    },
    function(){
      console.log('preLogin - sending dummy post message to contentwindow to get reference of current window inside webview');
      webviewEle.contentWindow.postMessage('dummy:dummy','*');
    });
  }
  
  function postLogin(){
    //Injecting code for login and fetching resources
    console.info('TRACE: Executing postLogin');
    webviewEle.executeScript({
      code:
      "var dataFromWebview = {}; \
      var appOrigin, appWindow, csrf; \
      var xhr = new XMLHttpRequest(); \
      var logBuffer = ''; \
      window.addEventListener('message', (e) => { console.log(e); appOrigin = e.origin; appWindow= e.source; d = e.data.split(':'); dataFromWebview[d[0]] = d[1]; console.log(appWindow);}); \
      \
      function getCookie(name) { var results = document.cookie.match('(^|;) ?' + name + '=([^;]*)'); return results ? unescape(results[2]) : null; } \
      \
      function logMsg(msg){ console.log(msg); if(appWindow){if(logBuffer.length > 0) {msg = logBuffer + msg; logBuffer = '';}appWindow.postMessage('log:' + msg, appOrigin);} else{logBuffer = logBuffer + msg + '-->';} } \
      \
      logMsg('Checking CSRF Token - ' + document.cookie);\
      \
      var poller = setInterval(checkCSRFToken,100); \
      var count = 0;\
      function checkCSRFToken(){ csrf = getCookie('CsrfToken'); if(count > 100 ){clearInterval(poller); logMsg('Polling Ended Cookies -' + document.cookie);} count+=1; console.log('polling', document.cookie); if(csrf){clearInterval(poller); getAuthMethods();}} \
      \
      function getAuthMethods(){ \
        logMsg('Step 3b - Get Auth methods from Storefront'); \
        xhrWrapper({'url':'Authentication/GetAuthMethods', 'onSuccess': 'getAuthMethodSuccess'}); \
      } \
      function getAuthMethodSuccess(data, xmlData){ \
        logMsg('parsing authMethods' + data.replace(/:/g,'-')); \
        let url; \
        let methods = xmlData.getElementsByTagName('method'); \
        for(let i =0; i< methods.length; i++){ if(methods[i].attributes['name'].nodeValue === 'CitrixAGBasic') { url = methods[i].attributes['url'].nodeValue; break;};} \
        if(url){ loginStorefront(url); } else{ console.log('CitrixAGBasic is not enabled'); } \
      } \
      function loginStorefront(authURL){ \
        logMsg('Step 4 - Login to Storefront' + authURL); \
        xhrWrapper({'url':authURL, 'onSuccess': 'getResources'}); \
      } \
      function getResources(){ \
        logMsg('Step 5 - List Resources'); \
        xhrWrapper({'url':'Resources/List', 'data':'format=json&resourceDetails=Default1', 'onSuccess': 'displayResources'}); \
      } \
      function displayResources(data){ \
        logMsg('Displaying resources' + data.replace(/:/g,'-'));\
        document.body.innerHTML = ''; \
        let res = JSON.parse(data).resources; \
        for(let i = 0; i < res.length; i+=1){ \
          let divEle = document.createElement('div'); divEle.id=i;\
          divEle.addEventListener('click', (e) => { getICA(xhr, res, divEle.id); } ); \
          let name = document.createElement('p'); let imgRes = document.createElement('img'); \
          name.innerText=res[i].name; imgRes.src= res[i].iconurl;  \
          divEle.appendChild(name); divEle.appendChild(imgRes); document.body.appendChild(divEle); \
        } \
      } \
      function getICA(xhr, res, id){ \
        logMsg('Step 7 - Fetching ICA'); \
        let currentTime = (new Date()).getTime(); \
        xhrWrapper({'method':'GET', 'url': res[id].launchurl +'?csrfToken='+csrf+'&launchID='+currentTime, 'onSuccess': 'postICA'}); \
      } \
      function postICA(){ \
        logMsg('Sending ICA to main window for session launch'); \
        appWindow.postMessage('icaData:' + xhr.responseText, appOrigin); \
      } \
      function xhrWrapper(params){ \
        let method = 'POST'; \
        let data = '';\
        if(params.method) { method = params.method; } \
        xhr.open(method, params.url); \
        if(csrf) {xhr.setRequestHeader('Csrf-Token', csrf);} \
        let isUsingHttps = location.protocol.toLowerCase() == 'https:' ? 'Yes' : 'No'; \
        xhr.setRequestHeader('X-Citrix-IsUsingHTTPS', isUsingHttps); \
        xhr.withCredentials = true; \
        xhr.onreadystatechange = function(){ if(xhr.readyState === 4 && xhr.status===200){ console.log(xhr.responseText); window[params.onSuccess](xhr.responseText,xhr.responseXML);}}; \
        if(params.data){data = params.data;}\
        logMsg('Making XHR to ' + params.url + ' with cookies - ' + document.cookie);\
        xhr.send(data); \
      } \
      "
    },
    function(){
      console.log('postLogin - sending dummy post message to contentwindow to get reference of current window inside webview');
      webviewEle.contentWindow.postMessage('dummy:dummy','*');
    });
  }
}