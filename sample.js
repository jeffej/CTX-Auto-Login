var iniIcadata;
var sessionId;
var sessionObj;
document.addEventListener("DOMContentLoaded",function(){
	init();
	// document.getElementById("icaUpload").addEventListener("change",function(e){
	// 	var files = e.target.files;		
	// 	var reader = new FileReader ();
	// 	reader.onerror = function (errMessage) {};
    //     reader.onload = function (e) {
    //         iniIcadata = e.target.result;
    //     };
    //     reader.readAsText (files[0]);
	// });	
});
		//Use appropriate citrix Workspace app id. This sample uses EAR. 
		// EAR = lbfgjakkeeccemhonnolnmglmfmccaag , prod version = haiffjcadagjlijoggckpgfnoeiflnem
		//kdndmepchimlohdcdkokdddpbnniijoa
var citrixReceiverId = "haiffjcadagjlijoggckpgfnoeiflnem";
function init() {
	var sessionObj;
	document.getElementById("createSession").addEventListener("click", createSessionHandler);
	//document.getElementById("start").addEventListener("click", startHandler);
	document.getElementById("disconnect").addEventListener("click", disconnectHandler);
	document.getElementById("lock").addEventListener("click", lockHandler);
	document.getElementById("unlock").addEventListener("click", unlockHandler);
	document.getElementById("remove").addEventListener("click", removeHandler);
	document.getElementById("logoff").addEventListener("click", logoffHandler);
	document.getElementById("sendCAD").addEventListener("click", sendCAD);
	document.getElementById("customBounds").addEventListener("click", customBoundsHandler);
	
	function createSessionHandler() {
		var options = {
			"launchType": "message" 
		};
		var showToolbar = document.getElementById("toolbar").checked;
		options["preferences"]={											
									"ui": {
										"toolbar": {
													"menubar": showToolbar
												},
												
												"sessionsize" :{
													"minwidth" : 200,
													"minheight" : 200
									}
								} 
		};
		citrix.receiver.createSession(citrixReceiverId, options, responseCallback);
		function responseCallback(response) {
			sessionObj = response;
			setTimeout(function(){
				startHandler();
			},2000);
		}
	}

	function startHandler(e) {
		if (sessionObj) {
			var launchData = {};
			launchData["type"] = "ini";
			launchData["value"] = iniIcadata;
			sessionObj.start(launchData, successCallback);
			function successCallback(response) {
				console.log('start ', response);
			}
			sessionObj.addListener('onConnection', listenerCallback);
			sessionObj.addListener('onConnectionClosed', onConnectionClosedCallback);
			sessionObj.addListener('onError', listenerCallback);
			sessionObj.addListener('onURLRedirection', listenerCallback);
		}
	}
			
	function onConnectionClosedCallback() {
		if (response.type == "onConnectionClosed") {
			console.log('onConnectionClosed event triggered', response);
			sessionObj = null;
		}
	}
	
	function listenerCallback(response) {
		if (response.type == "onConnection") {
			console.log('onConnection event triggered', response);
		} else if (response.type == "onError") {
			console.log('onError event triggered', response);
		} else if (response.type == "onURLRedirection") {
			console.log('onURLRedirection event triggered', response);
		}
	}
	
	function disconnectHandler(e) {
		if (sessionObj) {
			sessionObj.disconnect(disconnectCallback);
			function disconnectCallback(response) {
				console.log('disconnect ', response);
			}
						}
						}
	
	function logoffHandler(e) {
		if (sessionObj) {
			sessionObj.logoff(logoffCallback);
			function logoffCallback(response) {
				console.log('logoff ', response);
			}
		}
	}
	
	function customBoundsHandler(e){
		var bounds = {
			"autoresize":false,
			"width": document.getElementById("cWidth").value,
			"height":document.getElementById("cHeight").value
		}
		if (sessionObj) {
			sessionObj.changeResolution(bounds, boundsChangedCallback);
			function boundsChangedCallback(response) {
				console.log('bounds changed ', response);
			}
		}
	}
	
	function sendCAD(e) {
		if (sessionObj) {
			sessionObj.sendSpecialKeys("ctrl+alt+del", callBack);
			function callBack(response) {
				console.log('sendCAD response ', response);
			}
		}
	}
				
	function lockHandler(e) {
		if (sessionObj) {
			sessionObj.hide(hideCallback);
			function hideCallback(response) {
				console.log('hide ', response);
			}
		}
						}
	
	function unlockHandler(e) {
		if (sessionObj) {
			sessionObj.show(showCallback);
			function showCallback(response) {
				console.log('show ', response);
	}
}
}

	function removeHandler(e) {
		if (sessionObj) {
			sessionObj.removeListener('onConnectionClosed', onConnectionClosedCallback);
            }
        }
    }
