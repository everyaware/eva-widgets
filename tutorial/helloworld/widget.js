/**
 *	This file contains the implementation of the widget type.
 *	It should be implemented as a module with the AMD format (see:
 *	http://requirejs.org/docs/whyamd.html).
 *
 *	EveryAware Gears provides some libraries that can easily be used in a widget
 *	type.
 *	Examples:
 *	'jquery'			-	jQuery 3.2.1
 *	'jquery-ui'		- jQuery UI 1.12.1
 *	'd3'					- D3.js 4.8.0
 *	'handlebars'	-	Handlebars 4.0.5
 *	'lodash'			- Lodash 4.17.4
 *	'openlayers'	- OpenLayers 3.19.1
 *	'showdown'		- Showdown 1.7.2
 *	'sockjs'			- SockJS 1.1.1
 *
 *	Note: It is possible that these libraries are getting updated once in while.
 *
 * 	However, you can also load your dependencies from external sites by
 *	providing URLs to the define-function. This allows you to use other library
 *	versions and other libraries entirely. It also makes your widget type more
 *	robust in case we update the libraries provided by EveryAware Gears.
 */
define(['jquery'], function($) {

	/**
 	 * This widget shows the string "Hello World!".
 	 */
	function Widget(selector, config) {
		// save selector for later reference
		this.selector = selector;

		// render content
		$(selector).html("Hello World!");
	}

	/*
	 * These are some required life cycle functions.
	 * We don't need to implement anything more sophisticated for this simple widget.
	 * Other tutorials go into more detail.
	 */
	Widget.prototype.getConfig = function() { return {}; }
	Widget.prototype.getSelector = function() {return this.selector;}
	Widget.prototype.renderConfigDialog = function(selector, callback) {};
	Widget.prototype.redraw = function() {};
	Widget.prototype.destroy = function() {};

	// return our widget
	return Widget;

});
