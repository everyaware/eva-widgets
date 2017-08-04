// TODO: add jquery version number on EveryAware
// TODO: references to more advanced tutorials to explain life cycle methods
// TODO: test if this works at all :D
define(['jquery'], function($) {
	
	/**
 	 * This widget shows the string "Hello World!".
 	 */
	function Widget(selector, config) {
		$(selector).html("Hello World!");
	}
	
	/*
	 * These are some required life cycle functions. 
	 * We don't need to implement anything more sophisticated for this simple widget.
	 * Other tutorials go into more detail.
	 */
	Widget.prototype.redraw = function() {};
	Widget.prototype.destroy = function() {};
	Widget.prototype.getConfig = function() { return {}; }
	Widget.prototype.renderConfigDialog = function(selector, callback) {};
	
	// return our widget
	return Widget;
	
});
