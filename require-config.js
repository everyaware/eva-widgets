requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: ORIGIN + '/libs',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../js/app',
        styles: '../css',
        bootstrap: 'bootstrap/dist/js/bootstrap.min',
        'bootstrap-css': 'bootstrap/dist/css/bootstrap.min',
        d3: 'd3/dist/d3.min',
        'function.name-polyfill': 'function.name-polyfill/Function.name',
        gridstack: 'gridstack/dist/gridstack.min',
        'gridstack.jQueryUI': 'gridstack/dist/gridstack.jQueryUI.min',
        'gridstack-css': 'gridstack/dist/gridstack.min',
        handlebars: 'handlebars/dist/handlebars.amd.min',
        jquery: 'jquery/dist/jquery.min',
        'jquery.ui.touch-punch': 'jquery-ui-touch-punch/jquery.ui.touch-punch.min',
        lodash: 'lodash/lodash.min',
        'oauth2-client': '@zalando/oauth2-client-js/dist/oauth2-client',
        'css': 'require-css/css.min',
        'text': 'text/text',
        showdown: 'showdown/dist/showdown.min',
        'sockjs': 'sockjs-client/dist/sockjs.min',
        'stomp': 'stompjs/lib/stomp.min',
		'jquery-awesomeinput': '../js/lib/jquery.awesome-input',
        'jquery-gridinput': '../js/lib/jquery.grid-input',
        'jquery.fancytree': '../js/lib/fancytree/modules/jquery.fancytree',
        'jquery.fancytree-glyph': '../js/lib/fancytree/modules/jquery.fancytree.glyph',
        'jquery.fancytree.ui-deps': '../js/lib/fancytree/modules/jquery.fancytree.ui-deps',
        'jquery-ui-css': 'jquery-ui/themes/base/all'
    },
    shim: {
        'bootstrap': {
            deps: [ 'jquery' ]
        },
        'jquery.ui.touch-punch': {
            deps: [ 'jquery-ui/ui/widget', 'jquery-ui/ui/widgets/mouse' ]
        },
		'jquery-awesomeinput': {
			deps: ['jquery']
		},
        'jquery-gridinput': {
            deps: [ 'jquery' ]
		},
        'stomp': {
            deps: [ 'sockjs' ],
            exports: 'Stomp'
        }
    },
    map: {
        'gridstack.jQueryUI': {
            //require-css mapping
            //'css': 'css',

            'jquery-ui/core': 'jquery-ui/ui/core',
            'jquery-ui/data': 'jquery-ui/ui/data',
            'jquery-ui/disable-selection': 'jquery-ui/ui/disable-selection',
            'jquery-ui/draggable': 'jquery-ui/ui/draggable',
            'jquery-ui/focusable': 'jquery-ui/ui/focusable',
            'jquery-ui/form': 'jquery-ui/ui/form',
            'jquery-ui/ie': 'jquery-ui/ui/ie',
            'jquery-ui/jquery-1-7': 'jquery-ui/ui/jquery-1-7',
            'jquery-ui/keycode': 'jquery-ui/ui/keycode',
            'jquery-ui/labels': 'jquery-ui/ui/labels',
            'jquery-ui/mouse': 'jquery-ui/ui/mouse',
            'jquery-ui/plugin': 'jquery-ui/ui/plugin',
            'jquery-ui/resizable': 'jquery-ui/ui/resizable',
            'jquery-ui/safe-active-element': 'jquery-ui/ui/safe-active-element',
            'jquery-ui/safe-blur': 'jquery-ui/ui/safe-blur',
            'jquery-ui/scroll-parent': 'jquery-ui/ui/scroll-parent',
            'jquery-ui/tabbable': 'jquery-ui/ui/tabbable',
            'jquery-ui/unique-id': 'jquery-ui/ui/unique-id',
            'jquery-ui/version': 'jquery-ui/ui/version',
            'jquery-ui/widgets/mouse': 'jquery-ui/ui/widgets/mouse',
            'jquery-ui/widgets/draggable': 'jquery-ui/ui/widgets/draggable',
            'jquery-ui/widgets/droppable': 'jquery-ui/ui/widgets/droppable',
            'jquery-ui/widgets/resizable': 'jquery-ui/ui/widgets/resizable',
            'jquery-ui/widget': 'jquery-ui/ui/widget'
        },
		'jquery-fancytree': {
            'jquery.fancytree.ui-deps': 'fancytree/modules/jquery.fancytree.ui-deps'
		}
    },
    config: {
        text: {
            useXhr: function(url, protocol, hostname, port) {
                return true;
            }
        }
    }
});