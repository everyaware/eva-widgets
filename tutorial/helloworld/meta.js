/**
 *	This file provides some meta information for the widget type.
 *	It should be implemented as a module with the AMD format (see:
 *	http://requirejs.org/docs/whyamd.html).
 */
define(function() {
	// This meta module should return a JavaScript object that contains the meta
	// data.
	return {
		// name will be shown to the user as the name of the widget type at widget
		// creation.
		name: 'Hello World',
		// description is a small text that explains the purpose of this widget type
		// Note: this is currently not used by Gears but you should still provide it.
		description: 'Prints a simple "Hello World!"',
		// imageUrl should point to a image that is shown to the user at widget
		// creation. This example doesn't have a image but it is recommended to
		// provide one.
		imageUrl: undefined
	};
})
