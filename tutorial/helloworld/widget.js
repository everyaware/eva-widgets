// EveryAware provides jquery 3.2.1 when requiring 'jquery'
define(['jquery'], function($) {

	/**
 	 * This widget shows the string "Hello World!".
 	 */
	function Widget(selector, config) {
		// save selector for later reference
		this.selector = selector;

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
