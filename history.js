//To Fix - node attr in custom drawPage and title code.Sasha.

/*Variables*/

	/*Store cache data. Properties are pathnames (location.pathname).*/
	var store = {};
	var accountSettings, profileSettings, privacySetings;
	var activeClass = "active";
	var popped = ('state' in window.history), initialURL = location.href;
	var titles = {};
/*Functions*/

	$(function() { history.replaceState({ tag: true }, null); });
	
	$(function() { 
		accountSettings = $( "div.setting_panel ul.nav-tabs li a" )[0];
		profileSettings = $( "div.setting_panel ul.nav-tabs li a" )[1];
		privacySetings = $( "div.setting_panel ul.nav-tabs li a" )[2]; 
	});
	

	function myPushState( link ){
		history.pushState({ tag: true }, null, link);
	}

	function myPopState(e){
		var initialPop = !popped && location.href == initialURL;
		popped = true;
		if ( initialPop ) return;
		if (!e.originalEvent.state) return;
		var pathname = location.pathname;
		switch ( pathname ){
			case '/settings' : drawPage(config.a_settings, drawSettingsPage, accountSettings, titles['/settings']);
				break;
			case '/settings/profile' : drawPage(config.a_settings_profile, drawSettingsPage, profileSettings, titles['/settings/profile']);
				break;
			case '/settings/privacy' : drawPage(config.a_settings_privacy, drawSettingsPage, privacySetings, titles['/settings/privacy'] );
				break;
			default : console.log("History is empty.");
				break;
		}
	}

	/*
	 Add to temporary cache part of html markup.
	 It will saved in 'store'(object), where properties are named as a pathname.
	 */

	function makeCache( nodes, title ){
		var path = location.pathname;
		if(!store[path]){
			store[path] = nodes;
			titles[path] = title;
		}
	}
	/*
	 Ajax request for page. On done - making custom cache of response-data and callback drawPage.
	 First parameter 'url' - actual url to the API.
	 Second parameter 'callbackDrawPage' will callback custom function and draw response data.
	 Third and fourth parameters ('node' and 'title') are used in callback function, where 'title' is actual document
	 title and 'node' is some DOM-element what is need to be changed(for example, underline opened tab).
	*/
	function getPage( url, callbackDrawPage, node, title ){
		$.ajax({
			type: 'POST',
			beforeSend: function(){
				$(".main-loader").addClass(activeClass);
			},
			url: url
		}).done(function( data ){
			if( data.status <= -1 ){
				makeCache( data.html, data.title );
				callbackDrawPage( node, data.title );
			} else if( data.status == 0 ){
				$(".main-loader").removeClass(activeClass);
				makeCache( data.html, data.title );
				callbackDrawPage( node, data.title );
				document.title = data.title;
			} else {
				console.log('Server Error: Check your internet connection.');
			}
		}).fail(function(){
			console.log('ajax failed');
		}).always(function(){
			$(".main-loader").removeClass(activeClass);
		});
	}

	/*
	 Function that need to be called on event.
	 Checking cache and make decision. If yes, callback custom drawFunction. If no - request and then callback drawFunction.
	 Parameters are similar.
	 */

	function drawPage( url, callbackDrawPage, node, title ){
		var pathname = location.pathname;
		if( !store[pathname] ){
			getPage( url, callbackDrawPage, node, title );
		} else {
			callbackDrawPage( node, title );
		}
	}

	/*Custom functions for pages*/

	function drawSettingsPage( node, title ){

		var pathname = location.pathname;
		var ul = $( "div.setting_panel ul.nav-tabs " );
		var activeClass = "active";
		var data = store[pathname];

		//make underline
		$(ul).children().each(function(i){
			$(this).removeClass(activeClass);
		});
		switch(pathname){
			case '/settings' : $(accountSettings).parent().attr('class', "active");
				break;
			case '/settings/profile' : $(profileSettings).parent().attr('class', "active");
				break;
			case '/settings/privacy' : $(privacySetings).parent().attr('class', "active");
				break;
		}

		//change title
		document.title = title;

		//draw
		$( 'div.setting_panel ul').nextAll().remove();
			$( ul ).after( data );
	}