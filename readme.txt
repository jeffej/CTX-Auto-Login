This opens App/Desktop in a new window.

Setup:
This sample uses chromeSDK which also requires Citrix Workspace App for Chrome

1. 	Open chrome://extensions.
2.	Load this app by clicking load unpacked extension.
3.	Publish Citrix Workspace app for chrome from Google admin console with policy to whitelist this sample app(see policy.txt) -> step required only for session launch
4.	Replace citrixReceiverId value with published CWA id if it's different (inside sample.js) and reload the app. -> step required only for session launch
5. 	Enter netscaler url, username and password.
5.	Click on List Apps/Desktop (use this button only to list resources. Don't login inside webview content incase if it's stuck at any login screen)
6.	Click on some resource and wait for 1-2 sec (incase ICA fetch takes time) -> step required only for session launch

Note : policy.txt contains example to whitelist third party chrome app from Google admin console.

How it works:
1. clears cookies for Netscaler URL
2. Load webview with Netscaler url. since cookies doesn't exist it'll show login page
3. contentload event triggers and we login into Netscaler using cgi/login XHR request with credentials provided (preLogin function)
4. on XHR success reload the webview
5. contenload event occurs again and then execute postLogin part

Debug:
If Installed in public session enable usage of built in dev tools using admin console.
1. Check index.html log : open chrome://extensions -> click on details for this app -> index.html or using chrome://inspect/#apps
2. Check embedded webview logs : chorme://inspect ->  chrome://inspect/#apps 

Please share both logs and screenshot incase if it's failing.