chrome.app.runtime.onLaunched.addListener(function(){
	chrome.app.window.create(
		'index.html', 
		{
			'id': 'sample',
			'outerBounds' :{
				'minWidth':800,
				'minHeight':800
			}
		  }
	);
});