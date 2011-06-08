// ==UserScript==
// @name           FFN Autopager Cross-Browser
// @namespace      net.projectdlp.js.ffn.autopager
// @description    Autopages between chapters for FanFiction.Net
// @version 1.2.6
// @uso:version 1.2.6
// @include        http://*.fanfiction.net/*
// @match          http://*.fanfiction.net/*
// @run-at         document-end
// ==/UserScript==

// All your GM code must be inside this function
function letsJQuery() {
	var currentPage = 0;
	var maxPage = 0;
	var loc;
	
	function loadNextChapter() {
		// As long as we have chapters to load...
		if (currentPage < maxPage && !loading) {
			// Next page number, necessary because of JS engine bug in FF 3.6.13
			// + is for type coersion.
			var nextPage = +currentPage + +1;
			
			// Redirect page
			var url = loc[1]+'/s/'+loc[2]+'/'+ nextPage +'/'+loc[4];
			$(location).attr('url', url);
		}	
	}
	
	function hideSocialBullshit() {
	    // TODO: Doesn't work perfectly with live-loaded chapters. Will fix in 1.2.7
	    $('div.a2a_default_style').remove();
	}
	
	// Most importantly, hide social media bullshit
	hideSocialBullshit();
	
	// Grab the storyid/url out of the URL
	loc = /(.*)\/s\/(\d+)\/(\d+)(?:\/(.*))?/i.exec(document.location);
	
	// Grab current page and greatest page
	maxPage = $('select[name="chapter"]:first > *').length;
	currentPage = +loc[3];
	//alert(currentPage);
	
	// Ensure dropdown is set properly (to fix issue with reloads)
	$('select[name="chapter"]').map(function() {
		this.selectedIndex = +currentPage - 1;
	});
	
	// Rename the storytext...
	$('div#storytext').attr('id', 'storytext' + currentPage);

	// Attach to scroll
	$(window).scroll(function(){
		// If the window hits the bottom, do some loaderizing
		if ($(window).scrollTop() == $(document).height() - $(window).height() && !loading){
			loadNextChapter();
		}
	});
}

// Create element to inject jQuery into page
var jQuery = document.createElement("script"),
    inject = document.createElement("script");

// Set script element to jQuery Google CDN
jQuery.setAttribute('type', 'text/javascript');
jQuery.setAttribute('src', 'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js');

// Load script element with our userjs
inject.setAttribute('type', 'text/javascript');
inject.appendChild(document.createTextNode('(' + letsJQuery + ')()'));

// Append script
document.body.appendChild(jQuery);
document.body.appendChild(inject);
