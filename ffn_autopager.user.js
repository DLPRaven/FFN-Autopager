// ==UserScript==
// @name           FFN Autopager Cross-Browser
// @namespace      net.projectdlp.js.ffn.autopager
// @description    Autopages between chapters for FanFiction.Net
// @version 1.2.5
// @uso:version 1.2.5
// @include        http://*.fanfiction.net/*
// @match          http://*.fanfiction.net/*
// @run-at         document-end
// ==/UserScript==

// All your GM code must be inside this function
function letsJQuery() {
	var currentPage = 0;
	var maxPage = 0;
	var loc;
	var loading = false;
	
	function loadNextChapter() {
		// As long as we have chapters to load...
		if (currentPage < maxPage && !loading) {
			// Prevent the event from being called again before load
			loading = true;
		
			// Next page number, necessary because of JS engine bug in FF 3.6.13
			// + is for type coersion.
			var nextPage = +currentPage + +1;
			
			// AJAX get of next page
			var url = loc[1]+'/s/'+loc[2]+'/'+ nextPage +'/'+loc[4];
			$.get(url, function(data){
			
				// Match out storytext
				var regmatch = (new RegExp('<div id=storytext class=storytext>([\\s\\S]*?)<\\/div>')).exec(data);
				if (regmatch == null) {
					alert("Error loading next chapter.");
				}
				
				// Match out title
				var titlematch = (new RegExp('<title>([^>]*)</title>')).exec(data);
				if (titlematch == null ) {
				  titlematch[1] = document.title;
				}

				// Increment the selectboxes
				$('select[name="chapter"]').map(function() {
					this.selectedIndex = currentPage;
				});

				// Get Chapter title
				var chaptertitle = $('select[name="chapter"]:first :selected').text();
				
				// Change title
				document.title = titlematch[1];
				
				// Append chapter
				$('div#storytext' + currentPage).after("<hr /><h3>" + chaptertitle + "</h3>" + regmatch[0]);
				
				// Rename storytext
				$('div#storytext').attr('id', 'storytext' + nextPage);
				
				// Push history state
				window.history.pushState({mine:true}, document.title, '/s/'+loc[2]+'/'+ nextPage +'/'+loc[4]);
				
				// Change the next URL
				var nextNextPage = +nextPage + +1;
				$('select[name="chapter"] + input').attr('onClick', "self.location='/s/"+loc[2]+'/'+ nextNextPage +'/'+loc[4]+"'");
								
				// Increment chapter
				currentPage++;
				
				// If we reach the end, hide the next button
				if (currentPage == maxPage) {
					// Select first "input" element after the dropdown
					$('select[name="chapter"] + input').hide();
				}
			});
			
			// Unflag protection
			loading = false;
		}	
	}
	
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
