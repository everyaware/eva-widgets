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
   * This widget shows the string "Hello <name>!". Where <name> is set via the config.
   */
  function Widget(selector, config) {

    // save selector for later reference
    this.selector = selector;

    // set name to print from config or use default
    if (config && config.name) {
      this.name = config.name;
    } else {
      this.name = "Config"
    }

    // render content
    this.renderHelloName();
  }

  /**
   * Custom function to draw the "Hello <name>!" string.
   */
  Widget.prototype.renderHelloName = function() {
    $(this.selector).html('Hello ' + this.name + '!');
  }

  /**
   * Mandatory functions
   */
  Widget.prototype.getConfig = function() {
    return {
      name: this.name
    };
  }

  Widget.prototype.getSelector = function() {
    return this.selector;
  }

  /**
   *  This function will be called when the user presses the config-button for
   *  your widget. You receive a selector from the dashboard where you should
   *  render your config dialog into. You also get a callback function that you
   *  have to call when the config dialog is supposed to be closed.
   */
  Widget.prototype.renderConfigDialog = function(selector, callback) {
    var self = this
    // Render basic form
    $(selector).html('<div class="helloname">Name: <input type="text" value="' +
											self.name + '"/><button>Save!</button></div>');

    $(selector).find('button').on('click', function() {
      self.name = $("input", selector).val();
      self.renderHelloName();
      // The callback needs to be executed to tell the dashboard that the config
      // dialog should be closed now.
      callback();
    });
  };

  Widget.prototype.redraw = function() {};
  Widget.prototype.destroy = function() {};

  // return our widget
  return Widget;

});
