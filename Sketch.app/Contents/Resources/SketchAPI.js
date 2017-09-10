/*

This is a prototype Javascript API for Sketch.

The intention is to make something which is:

- native Javascript
- an easily understandable subset of the full internals of Sketch
- fully supported by Bohemian between releases (ie we try not to change it, unlike our internal API which we can and do change whenever we need to)
- still allows you to drop down to our internal API when absolutely necessary.

Comments and suggestions for this API are welcome - send them to developers@sketchapp.com.

All code (C) 2016 Bohemian Coding.


** PLEASE NOTE: this API is not final, and should be used for testing & feedback purposes only. **
** The idea eventually is that it's fixed - but until we've got the design right, it WILL change. **



Example script:

var sketch = context.api()

log(sketch.api_version)
log(sketch.version)
log(sketch.build)
log(sketch.full_version)


var document = sketch.selectedDocument;
var selection = document.selectedLayers;
var page = document.selectedPage;

var group = page.newGroup({frame: new sketch.Rectangle(0, 0, 100, 100), name:"Test"});
var rect = group.newShape({frame: new Sketch.rectangle(10, 10, 80, 80)});

log(selection.isEmpty);
selection.iterate(function(item) { log(item.name); } );

selection.clear();
log(selection.isEmpty);

group.select();
rect.addToSelection();

sketch.getStringFromUser("Test", "default");
sketch.getSelectionFromUser("Test", ["One", "Two"], 1);
sketch.message("Hello mum!");
sketch.alert("Title", "message");

*/

var __globals = this;
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _Application = require('./Application.js');

/**
    Return a function that captures the context.
    When called, this function will initialise the API
    and return an Application object that provides access
    to all API functions.

    We do it like this to defer having to perform a lot
    of setup until context.api() is actually called -- thus
    scripts which don't call it at all suffer minimal overhead.
 */

function SketchAPIWithCapturedContext(context) {
    return function () {

        // The Application object effectively *is* the api -- all other
        // functions and objects can be accessed via it.

        return new _Application.Application(context);
    };
}

// HACK: expose the SketchAPIWithCapturedContext function globally
// I suspect that there's a better way to do this, but I've
// not yet figured it out.

// ********************************
// ## Sketch API.
//
// All code (C) 2016 Bohemian Coding.
// ********************************

__globals.SketchAPIWithCapturedContext = SketchAPIWithCapturedContext;

},{"./Application.js":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Application = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _WrappedObject2 = require('./WrappedObject.js');

var _Document = require('./Document.js');

var _Rectangle = require('./Rectangle.js');

var _Group = require('./Group.js');

var _Text = require('./Text.js');

var _Image = require('./Image.js');

var _Shape = require('./Shape.js');

var _Artboard = require('./Artboard.js');

var _Page = require('./Page.js');

var _Tester = require('./Tester.js');

var _Layer = require('./Layer.js');

var _Selection = require('./Selection.js');

var _Style = require('./Style.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // ********************************
// # Application.js
// # Sketch Javascript API.
//
// All code (C) 2016 Bohemian Coding.
// ********************************

/**
 Gives you access to Sketch, and provides access to:
 - the document model and the layer tree
 - metadata abound sketch itself
 - utilities for interacting with the user
 - access to the running plugin, it's resources and settings
 */

var Application = function (_WrappedObject) {
    _inherits(Application, _WrappedObject);

    /**
     Construct a new Application object.
     An instance of this class will be passed back to you when you
     initialise the API, so you generally shouldn't need to make new ones.
      @param context The context dictionary passed to the script when it was invoked.
     @return A new Application object.
     */

    function Application(context) {
        _classCallCheck(this, Application);

        /**
         Metadata about this version of Sketch.
         @type {dictionary}
         */
        var _this = _possibleConstructorReturn(this, (Application.__proto__ || Object.getPrototypeOf(Application)).call(this, context));

        _this._metadata = MSApplicationMetadata.metadata();

        // expose some classes
        _this.Application = Application;
        _this.Rectangle = _Rectangle.Rectangle;
        _this.Document = _Document.Document;
        _this.Group = _Group.Group;
        _this.Text = _Text.Text;
        _this.Image = _Image.Image;
        _this.Shape = _Shape.Shape;
        _this.Artboard = _Artboard.Artboard;
        _this.Page = _Page.Page;
        _this.Selection = _Selection.Selection;
        _this.Style = _Style.Style;
        return _this;
    }

    /**
     The version of this API.
      @return A version string.
     */

    _createClass(Application, [{
        key: 'settingForKey',


        /**
         Return the value of a global setting for a given key.
         @param key The setting to look up.
         @return The setting value.
          This is equivalent to reading a setting for the currently
         running version of Sketch using the `defaults` command line tool,
         eg: defaults read com.bohemiancoding.sketch3 <key>
         */

        value: function settingForKey(key) {
            return NSUserDefaults.standardUserDefaults().objectForKey_(key);
        }

        /**
         Set the value of a global setting for a given key.
          @param key The setting to set.
         @param value The value to set it to.
          This is equivalent to writing a setting for the currently
         running version of Sketch using the `defaults` command line tool,
         eg: defaults write com.bohemiancoding.sketch3 <key> <value>
         */

    }, {
        key: 'setSettingForKey',
        value: function setSettingForKey(key, value) {
            NSUserDefaults.standardUserDefaults().setObject_forKey_(value, key);
        }

        /**
         Return a file URL pointing to a named resource in the plugin's Resources/
         folder.
          @param name The resource file name, including any file extension.
         @return The resource location, in the form "file://path/to/resource".
         */

    }, {
        key: 'resourceNamed',
        value: function resourceNamed(name) {
            return this._object.plugin.urlForResourceNamed_(name);
        }

        /**
         Shows a simple input sheet which displays a message, and asks for a single string
         input.
         @param msg The prompt message to show.
         @param initial The initial value of the input string.
         @return The string that the user input.
         */

    }, {
        key: 'getStringFromUser',
        value: function getStringFromUser(msg, initial) {
            var panel = MSModalInputSheet.alloc().init();
            var result = panel.runPanelWithNibName_ofType_initialString_label_("MSModalInputSheet", 0, initial, msg);
            return result;
        }

        /**
         Shows an input sheet which displays a popup with a series of options,
         from which the user is asked to choose.
          @param msg The prompt message to show.
         @param items A list of option items.
         @param selectedItemIndex The index of the item to select initially.
         @return An array with two items: [responseCode, selection].
          The result consists of a response code and a selection. The code will be
         one of NSAlertFirstButtonReturn or NSAlertSecondButtonReturn.
         The selection will be the integer index of the selected item.
         */

    }, {
        key: 'getSelectionFromUser',
        value: function getSelectionFromUser(msg, items, selectedItemIndex) {
            selectedItemIndex = selectedItemIndex || 0;

            var accessory = NSComboBox.alloc().initWithFrame(NSMakeRect(0, 0, 200, 25));
            accessory.addItemsWithObjectValues(items);
            accessory.selectItemAtIndex(selectedItemIndex);

            var alert = NSAlert.alloc().init();
            alert.setMessageText(msg);
            alert.addButtonWithTitle('OK');
            alert.addButtonWithTitle('Cancel');
            alert.setAccessoryView(accessory);

            var responseCode = alert.runModal();
            var sel = accessory.indexOfSelectedItem();

            return [responseCode, sel];
        }

        /**
         Output a message to the log console.
          @param {string} message The message to output.
         */

    }, {
        key: 'log',
        value: function log(message) {
            print(message);
        }

        /**
         Assert that a given condition is true.
         If the condition is false, throws an exception.
          @param condition An expression that is expected to evaluate to true if everything is ok.
         */

    }, {
        key: 'assert',
        value: function assert(condition) {
            if (!condition) {
                throw "Assert failed!";
            }
        }

        /**
         The selected document.
          If the user invoked the script explicitly (for example by selecting a menu item),
         this will be the document that they were working in at the time - ie the frontmost one.
         If the script was invoked as an action handler, this will be the document that the action
         occurred in.
          @return A Document object.
         */

    }, {
        key: 'newDocument',


        /**
         Create a new document and bring it to the front.
         @return The new document.
         */

        value: function newDocument() {
            var app = NSDocumentController.sharedDocumentController();
            app.newDocument_(this);
            return new _Document.Document(app.currentDocument(), this);
        }

        /**
         Show a small, temporary, message to the user.
         The message appears at the bottom of the selected document,
         and is visible for a short period of time. It should consist of a single
         line of text.
          @param {string} message The message to show.
         */

    }, {
        key: 'message',
        value: function message(_message) {
            this._object.document.showMessage(_message);
        }

        /**
         Show an alert with a custom title and message.
          @param {string} title The title of the alert.
         @param {string} message The text of the message.
          The alert is modal, so it will stay around until the user dismisses it
         by pressing the OK button.
         */

    }, {
        key: 'alert',
        value: function alert(title, message) {
            var app = NSApplication.sharedApplication();
            app.displayDialog_withTitle(title, message);
        }

        /**
         Return a lookup table of known mappings between Sketch model classes
         and our JS API wrapper classes.
          @return {dictionary} A dictionary with keys for the Sketch Model classes, and values for the corresponding API wrapper classes.
         */

    }, {
        key: 'wrapperMappings',
        value: function wrapperMappings() {
            var mappings = {
                MSLayerGroup: _Group.Group,
                MSPage: _Page.Page,
                MSArtboardGroup: _Artboard.Artboard,
                MSShapeGroup: _Shape.Shape,
                MSBitmapLayer: _Image.Image,
                MSTextLayer: _Text.Text
            };
            return mappings;
        }

        /**
         Return a wrapped version of a Sketch object.
         We don't know about *all* Sketch object types, but
         for some we will return a special subclass.
         The fallback position is just to return an instance of WrappedObject.
          @param {object} sketchObject The underlying sketch object that we're wrapping.
         @param {Document} inDocument The wrapped document that this object is part of.
         @return {WrappedObject} A javascript object (subclass of WrappedObject), which represents the Sketch object we were given.
        */

    }, {
        key: 'wrapObject',
        value: function wrapObject(sketchObject, inDocument) {
            var mapping = this.wrapperMappings();

            var jsClass = mapping[sketchObject.class()];
            if (!jsClass) {
                print("no mapped wrapper for " + sketchObject.class());
                jsClass = _WrappedObject2.WrappedObject;
            }

            return new jsClass(sketchObject, inDocument);
        }

        /**
         Return a list of tests to run for this class.
          We could do some fancy introspection here to derive the tests from
         the class, but for now we're opting for the simple approach.
          @return {dictionary} A dictionary containing the tests to run. Each key is the name of a test, each value is a function which takes a Tester instance.
         */

    }, {
        key: 'runUnitTests',


        /**
         Run all of our internal unit tests.
         Returns a dictionary indicating how many tests ran, passed, failed, and crashed,
         and a list of more detailed information for each failure.
          At some point we may switch to using Mocha or some other test framework, but for
         now we want to be able to invoke the tests from the Sketch side or from a plugin
         command, so it's simpler to use a simple test framework of our own devising.
         */

        value: function runUnitTests() {
            var tests = {
                "suites": {
                    "Application": Application.tests(),
                    "Artboard": _Artboard.Artboard.tests(),
                    "Document": _Document.Document.tests(),
                    "Group": _Group.Group.tests(),
                    "Image": _Image.Image.tests(),
                    "Layer": _Layer.Layer.tests(),
                    "Page": _Page.Page.tests(),
                    "Rectangle": _Rectangle.Rectangle.tests(),
                    "Selection": _Selection.Selection.tests(),
                    "Shape": _Shape.Shape.tests(),
                    "Text": _Text.Text.tests(),
                    "WrappedObject": _WrappedObject2.WrappedObject.tests(),
                    "Style": _Style.Style.tests()
                }
            };

            var tester = new _Tester.Tester(this);
            return tester.runUnitTests(tests);
        }
    }, {
        key: 'api_version',
        get: function get() {
            return "1.1";
        }

        /**
         The context that the API was created in.
         This is the traditional context argument that is
         passed to all plugin scripts when they are run.
          In general you should use the API to access Sketch
         rather than interacting with the context directly.
          @return A context dictionary.
         */

    }, {
        key: 'context',
        get: function get() {
            return this._object;
        }

        /**
         The version of Sketch that is running.
          @return The version as a string, eg "3.6".
         */

    }, {
        key: 'version',
        get: function get() {
            return this._metadata['appVersion'];
        }

        /**
         The exact build of Sketch that is running.
          @return The build number as a string, eg "15352".
         */

    }, {
        key: 'build',
        get: function get() {
            return this._metadata['build'];
        }

        /**
         Returns the full version of Sketch that is running
          @return {string} Version and build number as a string, eg "3.6 (15352)".
         */

    }, {
        key: 'full_version',
        get: function get() {
            return this.version + " (" + this.build + ")";
        }
    }, {
        key: 'selectedDocument',
        get: function get() {
            return new _Document.Document(this._object.document, this);
        }
    }], [{
        key: 'tests',
        value: function tests() {
            return {
                /** @test {Application} */
                "tests": {
                    /** @test {Application#api_version} */
                    testAPIVersion: function testAPIVersion(tester) {
                        tester.assertEqual(tester.application.api_version, "1.1");
                    },


                    /** @test {Application#version} */
                    testApplicationVersion: function testApplicationVersion(tester) {
                        if (!MSApplicationMetadata.metadata().app.startsWith("com.bohemiancoding.sketch3")) {
                            // When invoked by the Objective-C unit tests, we know that the bundle's version will be
                            // set to 44 so it's ok to test it.
                            tester.assertEqual(tester.application.version, "44");
                        }
                    },


                    /** @test {Application#wrapObject} */
                    testWrapObject: function testWrapObject(tester) {
                        var classesToTest = [MSLayerGroup, MSPage, MSArtboardGroup, MSShapeGroup, MSBitmapLayer, MSTextLayer];
                        var mappings = tester.application.wrapperMappings();
                        for (var index in classesToTest) {
                            var classToTest = classesToTest[index];
                            var frame = NSMakeRect(0, 0, 100, 100);
                            var object = classToTest.alloc().initWithFrame(frame);
                            var mockDocument = {};
                            var wrapped = tester.application.wrapObject(object, mockDocument);
                            tester.assertEqual(wrapped._object, object);
                            tester.assertEqual(wrapped._document, mockDocument);
                            tester.assertEqual(wrapped.class, mappings[classToTest].class);
                        }
                    }
                }
            };
        }
    }]);

    return Application;
}(_WrappedObject2.WrappedObject);

exports.Application = Application;

},{"./Artboard.js":3,"./Document.js":4,"./Group.js":5,"./Image.js":6,"./Layer.js":7,"./Page.js":8,"./Rectangle.js":9,"./Selection.js":10,"./Shape.js":11,"./Style.js":12,"./Tester.js":13,"./Text.js":14,"./WrappedObject.js":15}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Artboard = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Group2 = require("./Group.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // ********************************
// # Artboard.js
// # Sketch Javascript API.
//
// All code (C) 2016 Bohemian Coding.
// ********************************

/**
    A Sketch artboard.
*/

var Artboard = exports.Artboard = function (_Group) {
    _inherits(Artboard, _Group);

    /**
        Make a new artboard.
         @param artboard {MSArtboardGroup} The underlying MSArtboardGroup model object from Sketch.
        @param document The document that the artboard belongs to.
    */

    function Artboard(artboard, document) {
        _classCallCheck(this, Artboard);

        return _possibleConstructorReturn(this, (Artboard.__proto__ || Object.getPrototypeOf(Artboard)).call(this, artboard, document));
    }

    /**
        Is this an artboard?
         All Layer objects respond to this method, but only Artboard objects return true.
         @return true for instances of Artboard, false for any other layer type.
    */

    _createClass(Artboard, [{
        key: "isArtboard",
        get: function get() {
            return true;
        }

        /**
         Return a list of tests to run for this class.
          @return {dictionary} A dictionary containing the tests to run. Each key is the name of a test, each value is a function which takes a Tester instance.
         */

    }], [{
        key: "tests",
        value: function tests() {
            return {
                "tests": {
                    "testIsArtboard": function testIsArtboard(tester) {
                        var document = tester.newTestDocument();
                        var page = document.selectedPage;
                        var artboard = page.newArtboard({ "name": "Test" });
                        tester.assertTrue(artboard.isArtboard);
                        tester.assertFalse(page.isArtboard);
                    }
                }
            };
        }
    }]);

    return Artboard;
}(_Group2.Group);

},{"./Group.js":5}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Document = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _WrappedObject2 = require('./WrappedObject.js');

var _Layer = require('./Layer.js');

var _Page = require('./Page.js');

var _Selection = require('./Selection.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // ********************************
// # Document.js
// # Sketch Javascript API.
//
// All code (C) 2016 Bohemian Coding.
// ********************************

/**
A Sketch document.
*/

var Document = exports.Document = function (_WrappedObject) {
  _inherits(Document, _WrappedObject);

  /**
  Make a new document object.
   @param {MSDocument} document The underlying MSDocument object.
  @param {Application} application The application object.
   Note that constructing one of these doesn't actually create
  a Sketch document. Instead you pass in the underlying MSDocument
  that this object represents.
   If you do want to create a new document, you can do so with Application#newDocument.
  */

  function Document(document, application) {
    _classCallCheck(this, Document);

    /**
    The application that this document belongs to.
     @type {Application}
    */

    var _this = _possibleConstructorReturn(this, (Document.__proto__ || Object.getPrototypeOf(Document)).call(this, document));

    _this._application = application;
    return _this;
  }

  /**
  Return a wrapped version of a Sketch object.
  We don't know about *all* Sketch object types, but
  for some we will return a special subclass.
  The fallback position is just to return an instance of WrappedObject.
   @param {object} sketchObject The underlying sketch object that we're wrapping.
  @return {WrappedObject} A javascript object (subclass of WrappedObject), which represents the Sketch object we were given.
  */

  _createClass(Document, [{
    key: 'wrapObject',
    value: function wrapObject(sketchObject) {
      return this._application.wrapObject(sketchObject, this);
    }

    /**
    The layers that the user has selected in the currently selected page.
     @return {Selection} A selection object representing the layers that the user has selected in the currently selected page.
    */

  }, {
    key: 'layerWithID',


    /**
    Find the first layer in this document which has the given id.
     @return {Layer} A layer object, if one was found.
    */

    value: function layerWithID(layer_id) {
      var layer = this._object.documentData().layerWithID_(layer_id);
      if (layer) return new _Layer.Layer(layer, this);
    }

    /**
    Find the first layer in this document which has the given name.
     @return {Layer} A layer object, if one was found.
    */

  }, {
    key: 'layerNamed',
    value: function layerNamed(layer_name) {
      // As it happens, layerWithID also matches names, so we can implement
      // this method in the same way as layerWithID.
      // That might not always be true though, which is why the JS API splits
      // them into separate functions.

      var layer = this._object.documentData().layerWithID_(layer_name);
      if (layer) return new _Layer.Layer(layer, this);
    }

    /**
        Iterate through a bunch of native Sketch layers, executing a block.
        Used internally by Group and Selection.
         @param {array} layers The layers to iterate over.
        @param {function(layer: Layer)} filter A filter function to call for each layer. If it returns false, the layer is skipped.
        @param {function(layer: Layer)} block The function to execute for each layer.
    */

  }, {
    key: 'iterateWithNativeLayers',
    value: function iterateWithNativeLayers(layers, filter, block) {
      // if we're given a string as a filter, treat it as a function
      // to call on the layer
      var loopBlock = block;
      if (typeof filter === 'string' || filter instanceof String) {
        loopBlock = function loopBlock(layer) {
          if (layer[filter]) {
            block(layer);
          }
        };
      } else if (filter) {
        loopBlock = function loopBlock(layer) {
          if (filter(layer)) {
            block(layer);
          }
        };
      }

      var loop = layers.objectEnumerator();
      var item;
      while (item = loop.nextObject()) {
        var layer = this.wrapObject(item);
        loopBlock(layer);
      }
    }

    /**
    Center the view of the document window on a given layer.
     @param {Layer} layer The layer to center on.
    */

  }, {
    key: 'centerOnLayer',
    value: function centerOnLayer(layer) {
      this._object.currentView().centerRect_(layer._object.rect());
    }

    /**
    Return a list of tests to run for this class.
     @return {dictionary} A dictionary containing the tests to run. Each key is the name of a test, each value is a function which takes a Tester instance.
    */

  }, {
    key: 'selectedLayers',
    get: function get() {
      return new _Selection.Selection(this.selectedPage);
    }

    /**
    The current page that the user has selected.
     @return {Page} A page object representing the page that the user is currently viewing.
    */

  }, {
    key: 'selectedPage',
    get: function get() {
      return new _Page.Page(this._object.currentPage(), this);
    }

    /**
    Returns a list of the pages in this document.
     @return {list} The pages.
    */

  }, {
    key: 'pages',
    get: function get() {
      var result = [];
      var loop = this._object.pages().objectEnumerator();
      var item;
      while (item = loop.nextObject()) {
        result.push(new _Page.Page(item, this));
      }
      return result;
    }
  }], [{
    key: 'tests',
    value: function tests() {
      return {
        "tests": {
          "testPages": function testPages(tester) {
            var document = tester.newTestDocument();
            var pages = document.pages;

            tester.assertEqual(pages.length, 1);
            tester.assertEqual(pages[0].sketchObject, document.selectedPage.sketchObject);
          },

          "testSelectedLayers": function testSelectedLayers(tester) {
            var document = tester.newTestDocument();
            var selection = document.selectedLayers;
            tester.assert(selection.isEmpty, "should have an empty selection");

            var page = document.selectedPage;
            var group = page.newGroup({ 'name': "Test" });
            group.select();

            tester.assert(!selection.isEmpty, "should no longer have an empty selection");
          },

          "testLayerWithID": function testLayerWithID(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var group = page.newGroup({ 'name': "Test" });
            var id = group.id;
            var found = document.layerWithID(id);
            tester.assertEqual(group.sketchObject, found.sketchObject);
          }

        }
      };
    }
  }]);

  return Document;
}(_WrappedObject2.WrappedObject);

},{"./Layer.js":7,"./Page.js":8,"./Selection.js":10,"./WrappedObject.js":15}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Group = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Layer2 = require('./Layer.js');

var _Rectangle = require('./Rectangle.js');

var _Style = require('./Style.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // ********************************
// # Group.js
// # Sketch Javascript API.
//
// All code (C) 2016 Bohemian Coding.
// ********************************

/**
Represents a group of layers.
*/

var Group = exports.Group = function (_Layer) {
  _inherits(Group, _Layer);

  /**
  Make a new group object.
   @param {MSLayerGroup} group  The underlying model object from Sketch.
  @param {Document} document The document that the group belongs to.
  */

  function Group(group, document) {
    _classCallCheck(this, Group);

    return _possibleConstructorReturn(this, (Group.__proto__ || Object.getPrototypeOf(Group)).call(this, group, document));
  }

  /**
  Is this an group?
   All Layer objects respond to this method, but only Groups or things that inherit from groups return true.
   @return {bool} true for instances of Group, false for any other layer type.
  */

  _createClass(Group, [{
    key: 'iterate',


    /**
    Return a list of tests to run for this class.
     @return {dictionary} A dictionary containing the tests to run. Each key is the name of a test, each value is a function which takes a Tester instance.
    */

    /**
    Perform a function for every sub-layer inside this one.
    The function will be passed a single argument each time it is
    invoked - which will be an object representing the sub-layer.
     @param {function(layer: Layer)} block The function to execute for each layer.
    */

    value: function iterate(block) {
      var layers = this._object.layers();
      this._document.iterateWithNativeLayers(layers, null, block);
    }

    /**
    Perform a function for every sub-layer inside this one that passes a filter.
    The function will be passed a single argument each time it is
    invoked - which will be an object representing the sub-layer.
     @param {function(layer: Layer)} filter Filter function called on each layer first to check whether it should be iterated.
    @param {function(layer: Layer)} block The function to execute for each layer.
    */

  }, {
    key: 'iterateWithFilter',
    value: function iterateWithFilter(filter, block) {
      var layers = this._object.layers();
      this._document.iterateWithNativeLayers(layers, filter, block);
    }

    /**
    Convert a rectangle in page coordinates to one relative to this container's coordinates.
     @param {Rectangle} rect The rectangle to convert.
    @return {Rectangle} The rectangle in local coordinates.
    */

  }, {
    key: 'pageRectToLocalRect',
    value: function pageRectToLocalRect(rect) {
      var origin = this._object.convertPoint_fromLayer_(NSMakePoint(rect.x, rect.y), null);
      return new _Rectangle.Rectangle(origin.x, origin.y, rect.width, rect.height);
    }

    /**
    Adjust the group to fit its children.
    */

  }, {
    key: 'adjustToFit',
    value: function adjustToFit() {
      this._object.resizeToFitChildrenWithOption_(0);
    }

    /**
    Add a new wrapped layer object to represent a Sketch layer.
    Apply any supplied properties to the wrapper (which will apply
    them in turn to the wrapped layer).
     @param {MSLayer} newLayer The underlying Sketch layer object.
    @param {dictionary} properties The properties to apply.
    @param {string} wrapper The name of wrapper class to use.
    @return {Layer} The wrapped layer object.
    */

  }, {
    key: '_addWrappedLayerWithProperties',
    value: function _addWrappedLayerWithProperties(newLayer, properties, wrapper) {
      if (newLayer) {
        // add the Sketch object to this layer
        var layer = this._object;
        layer.addLayers_(NSArray.arrayWithObject_(newLayer));

        // make a Javascript wrapper object for the new layer
        var wrapper = this._document.wrapObject(newLayer);

        // apply properties, via the wrapper
        for (var p in properties) {
          wrapper[p] = properties[p];
        }

        return wrapper;
      }
    }

    /**
    Extract the frame to use for a layer from some properties.
    If the frame wasn't supplied in the properties, we return a default value instead.
     @param {dictionary} properties The properties to use when looking for a frame value.
    @return {Rectangle} The frame rectangle to use.
    */

  }, {
    key: '_frameForLayerWithProperties',
    value: function _frameForLayerWithProperties(properties) {
      var frame = properties.frame;
      if (frame) {
        delete properties["frame"];
      } else {
        frame = new _Rectangle.Rectangle(0, 0, 100, 100);
      }
      return frame;
    }

    /**
    Extract the style to use for a layer from some properties.
    If the style wasn't supplied at all, we use the default one.
    */

  }, {
    key: '_styleForLayerWithProperties',
    value: function _styleForLayerWithProperties(properties) {
      var style = properties.style;
      if (!style) {
        style = new _Style.Style();
      }

      var fills = properties.fills;
      if (fills) {
        delete properties["fills"];
        style.fills = fills;
      }

      var borders = properties.borders;
      if (borders) {
        delete properties["borders"];
        style.borders = borders;
      }

      return style;
    }

    /**
    Returns a newly created shape, which has been added to this layer,
    and sets it up using the supplied properties.
     @param {dictionary} properties Properties to apply to the shape.
    @return {Shape} the new shape.
    */

  }, {
    key: 'newShape',
    value: function newShape() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var frame = this._frameForLayerWithProperties(properties);
      // TODO: Eventually we want to distinguish between different shape sub-types here depending
      //       on what is set in properties ('frame', 'path', 'radius', etc), and to construct the
      //       appropriate layer type accordingly. For now we only make rectangles.
      var newLayer = MSShapeGroup.shapeWithRect_(frame.asCGRect());
      properties["style"] = this._styleForLayerWithProperties(properties);

      return this._addWrappedLayerWithProperties(newLayer, properties, "Shape");
    }

    /**
    Returns a newly created text layer, which has been added to this layer,
    and sets it up using the supplied properties.
     @param {dictionary} properties Properties to apply to the text layer.
    @return {Text} the new text layer.
    */

  }, {
    key: 'newText',
    value: function newText() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var frame = this._frameForLayerWithProperties(properties);
      var newLayer = MSTextLayer.alloc().initWithFrame_(frame.asCGRect());
      newLayer.adjustFrameToFit();
      return this._addWrappedLayerWithProperties(newLayer, properties, "Text");
    }

    /**
    Returns a newly created group, which has been added to this layer,
    and sets it up using the supplied properties.
     @param {dictionary} properties Properties to apply to the group.
    @return {Group} the new group.
    */

  }, {
    key: 'newGroup',
    value: function newGroup() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var frame = this._frameForLayerWithProperties(properties);
      var newLayer = MSLayerGroup.alloc().initWithFrame_(frame.asCGRect());
      return this._addWrappedLayerWithProperties(newLayer, properties, "Group");
    }

    /**
    Returns a newly created image layer, which has been added to this layer,
    and sets it up using the supplied properties.
     @param {dictionary} properties Properties to apply to the layer.
    @return {Image} the new image layer.
    */

  }, {
    key: 'newImage',
    value: function newImage() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var frame = this._frameForLayerWithProperties(properties);
      var newLayer = MSBitmapLayer.alloc().initWithFrame_(frame.asCGRect());
      return this._addWrappedLayerWithProperties(newLayer, properties, "Image");
    }

    /**
    Return a list of tests to run for this class.
     @return {dictionary} A dictionary containing the tests to run. Each key is the name of a test, each value is a function which takes a Tester instance.
    */

  }, {
    key: 'isGroup',
    get: function get() {
      return true;
    }
  }], [{
    key: 'tests',
    value: function tests() {
      return {
        "tests": {
          "testIterate": function testIterate(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var group = page.newGroup();
            var text = page.newText();

            var iterations = 0;
            var groups = 0;
            page.iterate(function (layer) {
              iterations++;
              if (layer.sketchObject == group.sketchObject) groups++;
            });
            tester.assertEqual(iterations, 2);
            tester.assertEqual(groups, 1);
          },

          "testIterateWithFilter": function testIterateWithFilter(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var group = page.newGroup();
            var text = page.newText();

            var iterations = 0;
            var groups = 0;
            page.iterateWithFilter("isGroup", function (layer) {
              iterations++;
              if (layer.sketchObject == group.sketchObject) groups++;
            });
            tester.assertEqual(iterations, 1);
            tester.assertEqual(groups, 1);
          },

          "testPageToLocalRect": function testPageToLocalRect(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var group = page.newGroup({ "frame": new _Rectangle.Rectangle(100, 100, 100, 100) });
            var local = group.pageRectToLocalRect(new _Rectangle.Rectangle(125, 75, 50, 200));
            tester.assertEqual(local, new _Rectangle.Rectangle(25, -25, 50, 200));
          },

          "testAdjustToFit": function testAdjustToFit(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var group = page.newGroup({ "frame": new _Rectangle.Rectangle(100, 100, 100, 100) });
            var text = group.newShape({ "frame": new _Rectangle.Rectangle(50, 50, 50, 50) });
            group.adjustToFit();
            var frame = group.frame;
            tester.assertEqual(frame, new _Rectangle.Rectangle(150, 150, 50, 50));
          },

          "testIsGroup": function testIsGroup(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var group = page.newGroup();
            var text = page.newText();
            var artboard = page.newArtboard();
            tester.assertTrue(group.isGroup);
            tester.assertFalse(text.isGroup);
            tester.assertTrue(page.isGroup); // pages are also groups
            tester.assertTrue(artboard.isGroup); // artboards are also groups
          }

        }
      };
    }
  }]);

  return Group;
}(_Layer2.Layer);

},{"./Layer.js":7,"./Rectangle.js":9,"./Style.js":12}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Image = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Layer2 = require("./Layer.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // ********************************
// # Image.js
// # Sketch Javascript API.
//
// All code (C) 2016 Bohemian Coding.
// ********************************

/**
  Represents an image layer.
 */

var Image = exports.Image = function (_Layer) {
  _inherits(Image, _Layer);

  /**
    Make a new image layer object.
     @param {MSBitmapLayer} layer The underlying model object from Sketch.
    @param {Document} document The document that the bitmap layer belongs to.
  */

  function Image(layer, document) {
    _classCallCheck(this, Image);

    return _possibleConstructorReturn(this, (Image.__proto__ || Object.getPrototypeOf(Image)).call(this, layer, document));
  }

  /**
      Is this an image layer?
       All Layer objects respond to this method, but only image layers return true.
       @return {bool} true for instances of Image, false for any other layer type.
  */

  _createClass(Image, [{
    key: "isImage",
    get: function get() {
      return true;
    }

    /**
      Set the layer's image to the contents of the image file at a given URL.
       @param {NSURL} url The location of the image to use.
    */

  }, {
    key: "imageURL",
    set: function set(url) {
      var image = NSImage.alloc().initWithContentsOfURL_(url);
      var imageData = MSImageData.alloc().initWithImage_convertColorSpace_(image, true);
      this._object.setImage_(imageData);
    }

    /**
     Return a list of tests to run for this class.
      @return {dictionary} A dictionary containing the tests to run. Each key is the name of a test, each value is a function which takes a Tester instance.
     */

  }], [{
    key: "tests",
    value: function tests() {
      return {
        "tests": {
          "testIsImage": function testIsImage(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var image = page.newImage();
            tester.assertTrue(image.isImage);
            tester.assertFalse(page.isImage);
          }
        }
      };
    }
  }]);

  return Image;
}(_Layer2.Layer);

},{"./Layer.js":7}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Layer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _WrappedObject2 = require('./WrappedObject.js');

var _Rectangle = require('./Rectangle.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // ********************************
// # Layer.js
// # Sketch Javascript API.
//
// All code (C) 2016 Bohemian Coding.
// ********************************

/**
Represents a Sketch layer.
*/

var Layer = exports.Layer = function (_WrappedObject) {
  _inherits(Layer, _WrappedObject);

  /**
  Make a new layer object.
   @param {MSLayer} layer The underlying model object from Sketch.
  @param {Document} document The document that the layer belongs to.
  */

  function Layer(layer, document) {
    _classCallCheck(this, Layer);

    /** @type {Document} The document that this layer belongs to. */
    var _this = _possibleConstructorReturn(this, (Layer.__proto__ || Object.getPrototypeOf(Layer)).call(this, layer));

    _this._document = document;
    return _this;
  }

  /**
  The name of the layer.
   @return {string} The layer's name.
  */

  _createClass(Layer, [{
    key: 'duplicate',


    /**
    Duplicate this layer.
    A new identical layer will be inserted into the parent of this layer.
     @return {Layer} A new layer identical to this one.
    */

    value: function duplicate() {
      var object = this.sketchObject;
      var duplicate = object.copy();
      object.parentGroup().insertLayers_afterLayer_([duplicate], object);
      return this._document.wrapObject(duplicate);
    }

    /**
    Remove this layer from its parent.
    */

  }, {
    key: 'remove',
    value: function remove() {
      var parent = this._object.parentGroup();
      if (parent) {
        parent.removeLayer_(this._object);
      }
    }

    /**
    Select the layer.
    This will clear the previous selection. Use addToSelection() if you wish
    to preserve the existing selection.
    */

  }, {
    key: 'select',
    value: function select() {
      this._object.select_byExtendingSelection(true, false);
    }

    /**
    Deselect this layer.
    Any other layers that were previously selected will remain selected.
    */

  }, {
    key: 'deselect',
    value: function deselect() {
      this._object.select_byExtendingSelection(false, true);
    }

    /**
    Add this layer to the selected layers.
    Any other layers that were previously selected will remain selected.
    */

  }, {
    key: 'addToSelection',
    value: function addToSelection() {
      this._object.select_byExtendingSelection(true, true);
    }

    /**
    Return the parent container of this layer.
     @return {Group} The containing layer of this layer.
    */

  }, {
    key: 'moveToFront',


    /**
    Move this layer to the front of its container.
    */

    value: function moveToFront() {
      MSLayerMovement.moveToFront([this._object]);
    }

    /**
    Move this layer forward in its container.
    */

  }, {
    key: 'moveForward',
    value: function moveForward() {
      MSLayerMovement.moveForward([this._object]);
    }

    /**
    Move this layer to the back of its container.
    */

  }, {
    key: 'moveToBack',
    value: function moveToBack() {
      MSLayerMovement.moveToBack([this._object]);
    }

    /**
    Move this layer backwards in its container.
    */

  }, {
    key: 'moveBackward',
    value: function moveBackward() {
      MSLayerMovement.moveBackward([this._object]);
    }

    /**
    Convert a rectangle in the coordinates that this layer uses to absolute (page) coordinates.
     @param {Rectangle} rect The rectangle to convert.
    @return {Rectangle} The converted rectangle expressed in page coordinates.
    */

  }, {
    key: 'localRectToPageRect',
    value: function localRectToPageRect(rect) {
      var rect = this.sketchObject.convertRectToAbsoluteCoordinates(rect.asCGRect);
      return new _Rectangle.Rectangle(rect.x, rect.y, rect.width, rect.height);
    }

    /**
    Convert a rectangle in the coordinates that this layer uses to it's parent's coordinates.
     @param {Rectangle} rect The rectangle to convert.
    @return {Rectangle} The converted rectangle expressed in the coordinate system of the parent layer.
    */

  }, {
    key: 'localRectToParentRect',
    value: function localRectToParentRect(rect) {
      var frame = this.frame;
      return new _Rectangle.Rectangle(rect.x + frame.x, rect.y + frame.y, rect.width, rect.height);
    }

    /**
    Returns a list of export options with any missing ones replaced by default values.
    */

  }, {
    key: 'exportOptionsMergedWithDefaults',
    value: function exportOptionsMergedWithDefaults(options) {
      var defaults = {
        "compact": false,
        "include-namespaces": false,
        "compression": 1.0,
        "group-contents-only": false,
        "overwriting": false,
        "progressive": false,
        "save-for-web": false,
        "use-id-for-name": false,
        "trimmed": false,
        "output": "~/Documents/Sketch Exports"
      };

      var merged = defaults;
      for (var key in options) {
        merged[key] = options[key];
      }

      return merged;
    }

    /**
    Export this layer (and the ones below it), using the options supplied.
     @param {dictionary} options Options indicating which layers to export, which sizes and formats to use, etc.
    */

  }, {
    key: 'export',
    value: function _export(options) {
      var merged = this.exportOptionsMergedWithDefaults(options);
      var exporter = MSSelfContainedHighLevelExporter.alloc().initWithOptions(merged);
      exporter.exportLayers([this.sketchObject]);
    }

    /**
    Return a list of tests to run for this class.
     @return {dictionary} A dictionary containing the tests to run. Each key is the name of a test, each value is a function which takes a Tester instance.
    */

  }, {
    key: 'name',
    get: function get() {
      return this._object.name();
    }

    /**
    Set the name of the layer.
     @param {string} name The new name.
    */

    ,
    set: function set(value) {
      this._object.setName_(value);
    }

    /**
    The frame of the layer.
    This is given in coordinates that are local to the parent of the layer.
     @return {Rectangle} The layer's frame.
    */

  }, {
    key: 'frame',
    get: function get() {
      var f = this._object.frame();
      return new _Rectangle.Rectangle(f.x(), f.y(), f.width(), f.height());
    }

    /**
    Set the frame of the layer.
    This will move and/or resize the layer as appropriate.
    The new frame should be given in coordinates that are local to the parent of the layer.
     @param {Rectangle} frame - The new frame of the layer.
    */

    ,
    set: function set(value) {
      var f = this._object.frame();
      f.setRect_(NSMakeRect(value.x, value.y, value.width, value.height));
    }

    /**
    Is this a page?
     All Layer objects respond to this method, but only pages return true.
     @return {bool} true for instances of Group, false for any other layer type.
    */

  }, {
    key: 'isPage',
    get: function get() {
      return false;
    }

    /**
    Is this an artboard?
     All Layer objects respond to this method, but only Artboard objects return true.
     @return true for instances of Artboard, false for any other layer type.
    */

  }, {
    key: 'isArtboard',
    get: function get() {
      return false;
    }

    /**
    Is this a group?
     All Layer objects respond to this method, but only Groups or things that inherit from groups return true.
     @return {bool} true for instances of Group, false for any other layer type.
    */

  }, {
    key: 'isGroup',
    get: function get() {
      return false;
    }

    /**
    Is this a text layer?
     All Layer objects respond to this method, but only text layers return true.
     @return {bool} true for instances of Group, false for any other layer type.
    */

  }, {
    key: 'isText',
    get: function get() {
      return false;
    }

    /**
    Is this a shape layer?
     All Layer objects respond to this method, but only shape layers (rectangles, ovals, paths etc) return true.
     @return {bool} true for instances of Group, false for any other layer type.
    */

  }, {
    key: 'isShape',
    get: function get() {
      return false;
    }

    /**
    Is this an image layer?
     All Layer objects respond to this method, but only image layers return true.
     @return {bool} true for instances of Group, false for any other layer type.
    */

  }, {
    key: 'isImage',
    get: function get() {
      return false;
    }
  }, {
    key: 'container',
    get: function get() {
      return this._document.wrapObject(this._object.parentGroup());
    }

    /**
    Return the index of this layer in it's container.
    The layer at the back of the container (visualy) will be layer 0. The layer at the front will be layer n - 1 (if there are n layers).
     @return {number} The layer order.
    */

  }, {
    key: 'index',
    get: function get() {
      var ourLayer = this.sketchObject;
      return ourLayer.parentGroup().indexOfLayer_(ourLayer);
    }
  }], [{
    key: 'tests',
    value: function tests() {
      return {
        "tests": {
          "testName": function testName(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            page.name = "This is a page";
            tester.assertEqual(page.name, "This is a page");
            var group = page.newGroup({ "name": "blah" });
            tester.assertEqual(group.name, "blah");
            var group2 = page.newGroup();
            tester.assertEqual(group2.name, "Group");
          },

          "testFrame": function testFrame(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var frame = new _Rectangle.Rectangle(10, 10, 20, 20);
            var group = page.newGroup({ "frame": frame });
            tester.assertEqual(group.frame, frame);
          },

          "testDuplicate": function testDuplicate(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var group = page.newGroup();
            tester.assertEqual(page.sketchObject.layers().count(), 1);
            var group2 = group.duplicate();
            tester.assertEqual(page.sketchObject.layers().count(), 2);
          },

          "testRemove": function testRemove(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var group = page.newGroup();
            tester.assertEqual(page.sketchObject.layers().count(), 1);
            group.remove();
            tester.assertEqual(page.sketchObject.layers().count(), 0);
          },

          "testSelection": function testSelection(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var group = page.newGroup();

            // start with nothing selected
            tester.assertTrue(page.selectedLayers.isEmpty);

            // select a layer
            group.select();
            tester.assertFalse(page.selectedLayers.isEmpty);

            // deselect it - should go back to nothing selected
            group.deselect();
            tester.assertTrue(page.selectedLayers.isEmpty);

            // select one layer then another - only the last should be selected
            var group2 = page.newGroup();
            group.select();
            group2.select();
            tester.assertEqual(page.selectedLayers.length, 1);

            // add a second layer to the selection - both should be selected
            group.addToSelection();
            tester.assertEqual(page.selectedLayers.length, 2);
          },

          "testContainer": function testContainer(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var group = page.newGroup();
            tester.assertEqual(group.container.sketchObject, page.sketchObject);
          },

          "testOrdering": function testOrdering(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var group1 = page.newGroup();
            var group2 = page.newGroup();
            var group3 = page.newGroup();
            tester.assertEqual(group1.index, 0);
            tester.assertEqual(group2.index, 1);
            tester.assertEqual(group3.index, 2);

            group1.moveToFront();
            tester.assertEqual(group2.index, 0);
            tester.assertEqual(group3.index, 1);
            tester.assertEqual(group1.index, 2);

            group3.moveToBack();
            tester.assertEqual(group3.index, 0);
            tester.assertEqual(group2.index, 1);
            tester.assertEqual(group1.index, 2);

            group2.moveForward();
            tester.assertEqual(group3.index, 0);
            tester.assertEqual(group1.index, 1);
            tester.assertEqual(group2.index, 2);

            group1.moveBackward();
            tester.assertEqual(group1.index, 0);
            tester.assertEqual(group3.index, 1);
            tester.assertEqual(group2.index, 2);
          }

        }
      };
    }
  }]);

  return Layer;
}(_WrappedObject2.WrappedObject);

},{"./Rectangle.js":9,"./WrappedObject.js":15}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Page = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Group2 = require('./Group.js');

var _Selection = require('./Selection.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // ********************************
// # Page.js
// # Sketch Javascript API.
//
// All code (C) 2016 Bohemian Coding.
// ********************************

/**
Represents a Page in a Sketch document.
*/

var Page = exports.Page = function (_Group) {
  _inherits(Page, _Group);

  /**
  Make a new page object.
   @param {MSPage} page The underlying model object from Sketch.
  @param document The document that the page belongs to.
  */

  function Page(page, document) {
    _classCallCheck(this, Page);

    var _this = _possibleConstructorReturn(this, (Page.__proto__ || Object.getPrototypeOf(Page)).call(this, page));

    _this._document = document;
    return _this;
  }

  /**
  The layers that the user has selected.
   @return {Selection} A selection object representing the layers that the user has selected.
  */

  _createClass(Page, [{
    key: 'newArtboard',


    /**
    Returns a newly created artboard, which has been added to this page,
    and sets it up using the supplied properties.
     @param properties {dictionary} Properties to apply to the artboard.
    @return {Artboard} the new artboard.
    */

    value: function newArtboard() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var frame = this._frameForLayerWithProperties(properties);
      var newLayer = MSArtboardGroup.alloc().initWithFrame_(frame.asCGRect());
      return this._addWrappedLayerWithProperties(newLayer, properties, "Artboard");
    }

    /**
    Return a list of tests to run for this class.
     @return {dictionary} A dictionary containing the tests to run. Each key is the name of a test, each value is a function which takes a Tester instance.
    */

    /**
    Export this page, using the options supplied.
     @discussion
     You can specify a lot of different options for the exporting.
     ### General Options
     - use-id-for-name : normally the exported files are given the same names as the layers they represent, but if this options is true, then the layer ids are used instead; defaults to false.
    - output : this is the path of the folder where all exported files are placed; defaults to "~/Documents/Sketch Exports"
    - overwriting : if true, the exporter will overwrite any existing files with new ones; defaults to false.
    - trimmed: if true, any transparent space around the exported image will be trimmed; defaults to false.
    - scales: this should be a list of numbers; it will determine the sizes at which the layers are exported; defaults to "1"
    - formats: this should be a list of one or more of "png", "jpg", "svg", and "pdf"; defaults to "png" (see discussion below)
     ### SVG options
    - compact : if exporting as SVG, this option makes the output more compact; defaults to false.
    - include-namespaces : if exporting as SVG, this option includes extra attributes; defaults to false.
     ### PNG options
    - save-for-web : if exporting a PNG, this option removes metadata such as the colour profile from the exported file; defaults to false.
     ### JPG options
    - compression : if exporting a JPG, this option determines the level of compression, with 0 being the minimum, 1.0 the maximum; defaults to 1.0
    - progressive : if exporting a JPG, this option makes it progressive; defaults to false.
    - group-contents-only : false,
      @param {dictionary} options Options indicating which sizes and formats to use, etc.
    */

  }, {
    key: 'export',
    value: function _export(options) {
      var merged = this.exportOptionsMergedWithDefaults(options);
      var exporter = MSSelfContainedHighLevelExporter.alloc().initWithOptions(merged);
      exporter.exportPage(this.sketchObject);
    }

    /**
    Export this layer (and the ones below it), using the options supplied.
     @param {dictionary} options Options indicating which layers to export, which sizes and formats to use, etc.
    */

  }, {
    key: 'exportArtboards',
    value: function exportArtboards(options) {
      var merged = this.exportOptionsMergedWithDefaults(options);
      var exporter = MSSelfContainedHighLevelExporter.alloc().initWithOptions(merged);
      exporter.exportLayers(this.sketchObject.artboards());
    }
  }, {
    key: 'selectedLayers',


    /**
    The layers that the user has selected.
     @return {Selection} A selection object representing the layers that the user has selected.
    */

    get: function get() {
      return new _Selection.Selection(this);
    }
  }, {
    key: 'isPage',


    /**
    Is this a page?
     All Layer objects respond to this method, but only pages return true.
     @return {bool} true for instances of Group, false for any other layer type.
    */

    get: function get() {
      return true;
    }
  }], [{
    key: 'tests',
    value: function tests() {
      return {
        "tests": {
          "testSelectedLayers": function testSelectedLayers(tester) {
            var document = tester.newTestDocument();
            var selection = document.selectedLayers;
            tester.assert(selection.isEmpty, "should have an empty selection");

            var page = document.selectedPage;
            var group = page.newGroup({ 'name': "Test" });
            group.select();

            tester.assert(!selection.isEmpty, "should no longer have an empty selection");
          },

          "testLayerWithID": function testLayerWithID(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var group = page.newGroup({ 'name': "Test" });
            var id = group.id;
            var found = document.layerWithID(id);
            tester.assertEqual(group.sketchObject, found.sketchObject);
          },

          "testIsPage": function testIsPage(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var image = page.newImage();
            tester.assertTrue(page.isPage);
            tester.assertFalse(image.isPage);
          }

        }
      };
    }
  }]);

  return Page;
}(_Group2.Group);

},{"./Group.js":5,"./Selection.js":10}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// ********************************
// # Rectangle.js
// # Sketch Javascript API.
//
// All code (C) 2016 Bohemian Coding.
// ********************************

/**
  Represents a rectangle.
 */

var Rectangle = exports.Rectangle = function () {

  /**
    Return a new Rectangle object for a given x,y, width and height.
     @param {number} x The x coordinate of the top-left corner of the rectangle.
    @param {number} y The y coordinate of the top-left corner of the rectangle.
    @param {number} width The width of the rectangle.
    @param {number} height The height of the rectangle.
    @return The new Rectangle object.
  */

  function Rectangle(x, y, width, height) {
    _classCallCheck(this, Rectangle);

    /**
      The x coordinate of the top-left corner of the rectangle.
      @type {number}
    */

    this.x = x;

    /**
      The y coordinate of the top-left corner of the rectangle.
      @type {number}
    */

    this.y = y;

    /**
      The width of the rectangle.
      @type {number}
    */

    this.width = width;

    /**
      The height of the rectangle.
      @type {number}
    */

    this.height = height;
  }

  /**
    Adjust this rectangle by offsetting it.
     @param {number} x The x offset to apply.
    @param {number} y The y offset to apply.
    */

  _createClass(Rectangle, [{
    key: "offset",
    value: function offset(x, y) {
      this.x += x;
      this.y += y;
    }

    /**
      Return the Rectangle as a CGRect.
       @return {CGRect} The rectangle.
    */

  }, {
    key: "asCGRect",
    value: function asCGRect() {
      return CGRectMake(this.x, this.y, this.width, this.height);
    }

    /**
      Return a string description of the rectangle.
       @return {string} Description of the rectangle.
      */

  }, {
    key: "toString",
    value: function toString() {
      return "{" + this.x + ", " + this.y + ", " + this.width + ", " + this.height + "}";
    }

    /**
     Return a list of tests to run for this class.
      @return {dictionary} A dictionary containing the tests to run. Each key is the name of a test, each value is a function which takes a Tester instance.
     */

  }], [{
    key: "tests",
    value: function tests() {
      return {
        "tests": {
          "testConstructor": function testConstructor(tester) {
            var r = new Rectangle(1, 2, 3, 4);
            tester.assertEqual(r.x, 1);
            tester.assertEqual(r.y, 2);
            tester.assertEqual(r.width, 3);
            tester.assertEqual(r.height, 4);
          },

          "testOffset": function testOffset(tester) {
            var r = new Rectangle(1, 2, 3, 4);
            r.offset(10, 10);
            tester.assertEqual(r.x, 11);
            tester.assertEqual(r.y, 12);
            tester.assertEqual(r.width, 3);
            tester.assertEqual(r.height, 4);
          },

          "testCGRect": function testCGRect(tester) {
            var r = new Rectangle(1, 2, 3, 4);
            var c = r.asCGRect();
            tester.assertEqual(c.origin.x, 1);
            tester.assertEqual(c.origin.y, 2);
            tester.assertEqual(c.size.width, 3);
            tester.assertEqual(c.size.height, 4);
          }

        }
      };
    }
  }]);

  return Rectangle;
}();

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Selection = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _WrappedObject2 = require('./WrappedObject.js');

var _Layer = require('./Layer.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // ********************************
// # Selection.js
// # Sketch Javascript API.
//
// All code (C) 2016 Bohemian Coding.
// ********************************

/**
    Represents the layers that the user has selected.
*/

var Selection = exports.Selection = function (_WrappedObject) {
  _inherits(Selection, _WrappedObject);

  /**
    Make a new Selection object.
     @param {Page} page The page that the selection relates to.
  */

  function Selection(page) {
    _classCallCheck(this, Selection);

    var _this = _possibleConstructorReturn(this, (Selection.__proto__ || Object.getPrototypeOf(Selection)).call(this, page._object));

    _this._page = page;
    return _this;
  }

  /**
    Return the native Sketch layers in the selection.
     @return {array} The selected layers.
    */

  _createClass(Selection, [{
    key: 'iterateThenClear',


    /**
        Perform an action once for each layer in the selection, then clear it.
         @param {function(layer: Layer)} block The function to execute for each layer.
    */

    value: function iterateThenClear(block) {
      var layers = this.nativeLayers;
      this.clear();
      this._page._document.iterateWithNativeLayers(layers, null, block);
    }

    /**
        Perform an action once for each layer in the selection that passes a filter, then clear the selection.
         @param {function(layer: Layer)} filter Filter function called on each layer first to check whether it should be iterated.
        @param {function(layer: Layer)} block The function to execute for each layer.
    */

  }, {
    key: 'iterateWithFilterThenClear',
    value: function iterateWithFilterThenClear(filter, block) {
      var layers = this.nativeLayers;
      this.clear();
      this._page._document.iterateWithNativeLayers(layers, filter, block);
    }

    /**
        Perform an action once for each layer in the selection.
         @param {function(layer: Layer)} block The function to execute for each layer.
    */

  }, {
    key: 'iterate',
    value: function iterate(block) {
      this._page._document.iterateWithNativeLayers(this.nativeLayers, null, block);
    }

    /**
        Perform an action once for each layer in the selection that passes a filter.
         @param {function(layer: Layer)} filter Filter function called on each layer first to check whether it should be iterated.
        @param {function(layer: Layer)} block The function to execute for each layer.
    */

  }, {
    key: 'iterateWithFilter',
    value: function iterateWithFilter(filter, block) {
      this._page._document.iterateWithNativeLayers(this.nativeLayers, filter, block);
    }

    /**
        Clear the selection.
    */

  }, {
    key: 'clear',
    value: function clear() {
      this._page.sketchObject.changeSelectionBySelectingLayers(null);
    }

    /**
     Return a list of tests to run for this class.
      @return {dictionary} A dictionary containing the tests to run. Each key is the name of a test, each value is a function which takes a Tester instance.
     */

  }, {
    key: 'nativeLayers',
    get: function get() {
      var layers = this._object.selectedLayers().layers();
      return layers;
    }

    /**
      Return the number of selected layers.
       @return {number} The number of layers that are selected.
      */

  }, {
    key: 'length',
    get: function get() {
      return this.nativeLayers.count();
    }

    /**
        Does the selection contain any layers?
         @return {boolean} true if the selection is empty.
    */

  }, {
    key: 'isEmpty',
    get: function get() {
      return this.nativeLayers.count() == 0;
    }
  }], [{
    key: 'tests',
    value: function tests() {
      return {
        "tests": {
          "testEmpty": function testEmpty(tester) {
            var document = tester.newTestDocument();
            tester.assert(document.selectedLayers.isEmpty, "selection should be empty");
          },

          "testClear": function testClear(tester) {
            var document = tester.newTestDocument();
            var group = document.selectedPage.newGroup();
            group.select();
            var selection = document.selectedLayers;
            tester.assert(!selection.isEmpty, "selection should not be empty");
            selection.clear();
            tester.assert(selection.isEmpty, "selection should be empty");
          },

          "testIterate": function testIterate(tester) {
            var document = tester.newTestDocument();
            var group = document.selectedPage.newGroup();
            var text = document.selectedPage.newText();
            text.select();
            group.addToSelection();
            var selection = document.selectedLayers;

            var iterations = 0;
            var groups = 0;
            selection.iterate(function (layer) {
              iterations++;
              if (layer.sketchObject == group.sketchObject) groups++;
            });
            tester.assertEqual(iterations, 2);
            tester.assertEqual(groups, 1);
          },

          "testIterateWithFilter": function testIterateWithFilter(tester) {
            var document = tester.newTestDocument();
            var group = document.selectedPage.newGroup();
            var text = document.selectedPage.newText();
            text.select();
            group.addToSelection();
            var selection = document.selectedLayers;

            var iterations = 0;
            var groups = 0;
            selection.iterateWithFilter("isGroup", function (layer) {
              iterations++;
              if (layer.sketchObject == group.sketchObject) groups++;
            });
            tester.assertEqual(iterations, 1);
            tester.assertEqual(groups, 1);
          },

          "testIterateThenClear": function testIterateThenClear(tester) {
            var document = tester.newTestDocument();
            var group = document.selectedPage.newGroup();
            group.select();
            var selection = document.selectedLayers;

            var iterations = 0;
            tester.assert(!selection.isEmpty, "selection should not be empty");
            selection.iterateThenClear(function (layer) {
              iterations++;
            });
            tester.assertEqual(iterations, 1);
            tester.assert(selection.isEmpty, "selection should be empty");
          },

          "testIterateWithFilterThenClear": function testIterateWithFilterThenClear(tester) {
            var document = tester.newTestDocument();
            var group = document.selectedPage.newGroup();
            group.select();
            var selection = document.selectedLayers;

            var iterations = 0;
            tester.assert(!selection.isEmpty, "selection should not be empty");
            selection.iterateWithFilterThenClear("isText", function (layer) {
              iterations++;
            });
            tester.assertEqual(iterations, 0);
            tester.assert(selection.isEmpty, "selection should be empty");
          }
        }
      };
    }
  }]);

  return Selection;
}(_WrappedObject2.WrappedObject);

},{"./Layer.js":7,"./WrappedObject.js":15}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Shape = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Layer2 = require('./Layer.js');

var _Style = require('./Style.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // ********************************
// # Shape.js
// # Sketch Javascript API.
//
// All code (C) 2016 Bohemian Coding.
// ********************************

/**
  Represents a shape layer (a rectangle, oval, path, etc).
 */

var Shape = exports.Shape = function (_Layer) {
    _inherits(Shape, _Layer);

    /**
      Make a new shape object.
       @param {MSShapeGroup} shape The underlying model object from Sketch.
      @param {Document} document The document that the shape belongs to.
    */

    function Shape(shape, document) {
        _classCallCheck(this, Shape);

        return _possibleConstructorReturn(this, (Shape.__proto__ || Object.getPrototypeOf(Shape)).call(this, shape, document));
    }

    /**
        Is this a shape layer?
         All Layer objects respond to this method, but only shape layers (rectangles, ovals, paths etc) return true.
         @return {bool} true for instances of Group, false for any other layer type.
    */

    _createClass(Shape, [{
        key: 'isShape',
        get: function get() {
            return true;
        }

        /**
         Return the style of the layer.
          @return {Style} The style of the layer.
         */

    }, {
        key: 'style',
        get: function get() {
            return new _Style.Style(this.sketchObject.style());
        }

        /**
        Set the style of the layer.
         @param {Style} value The style settings to use for the layer.
        */

        ,
        set: function set(value) {
            this.sketchObject.style = value.sketchObject;
        }

        /**
         Return a list of tests to run for this class.
          @return {dictionary} A dictionary containing the tests to run. Each key is the name of a test, each value is a function which takes a Tester instance.
         */

    }], [{
        key: 'tests',
        value: function tests() {
            return {
                "tests": {
                    "testIsShape": function testIsShape(tester) {
                        var document = tester.newTestDocument();
                        var page = document.selectedPage;
                        var shape = page.newShape();
                        tester.assertTrue(shape.isShape);
                        tester.assertFalse(page.isShape);
                    }
                }
            };
        }
    }]);

    return Shape;
}(_Layer2.Layer);

},{"./Layer.js":7,"./Style.js":12}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Style = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _WrappedObject2 = require("./WrappedObject.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // ********************************
// # Style.js
// # Sketch Javascript API.
//
// All code (C) 2016 Bohemian Coding.
// ********************************

/// A solid fill/border.
var BCFillTypeColor = 0;

/// A gradient fill/border.
var BCFillTypeGradient = 1;

/// A pattern fill/border.
var BCFillTypePattern = 4;

/// A noise fill/border.
var BCFillTypeNoise = 5;

/**
  Represents a Sketch layer style.
 */

var Style = exports.Style = function (_WrappedObject) {
  _inherits(Style, _WrappedObject);

  /**
    Make a new style object.
     @param {MSStyle} style The underlying model object from Sketch.
  */

  function Style(style) {
    _classCallCheck(this, Style);

    if (!style) {
      style = MSDefaultStyle.defaultStyle();
    }

    return _possibleConstructorReturn(this, (Style.__proto__ || Object.getPrototypeOf(Style)).call(this, style));
  }

  /**
    Given a string description of a color, return an MSColor.
    */

  _createClass(Style, [{
    key: "colorFromString",
    value: function colorFromString(value) {
      var immutable = MSImmutableColor.colorWithSVGString_(value);
      return MSColor.alloc().initWithImmutableObject_(immutable);
    }

    /**
      Set the borders to use for this style.
       The value provided is a list of items, with each one representing a style.
       Currently these values can only be strings with css-style color specifications
      such as #ffee33 (alpha values are supported too, so #aabbccdd is valid).
       These strings are used to create simple borders.
       In the future the intention is to also support dictionaries allowing gradients
      and other more complex border parameters to be specified.
       @param {array} values A list of colors - each one representing a border to create.
     */

  }, {
    key: "borders",
    set: function set(value) {
      var objects = [];
      for (var b in value) {
        var color = this.colorFromString(value[b]);
        var border = MSStyleBorder.new();
        border.setColor_(color);
        border.setFillType_(BCFillTypeColor);
        border.enabled = true;

        objects.push(border);
      }
      this.sketchObject.setBorders_(objects);
    }

    /**
      Set the fills to use for this style.
       The value provided is a list of items, with each one representing a style.
       Currently these values can only be strings with css-style color specifications
      such as #ffee33 (alpha values are supported too, so #aabbccdd is valid).
       These strings are used to create simple fills.
       In the future the intention is to also support dictionaries allowing gradients
      and other more complex fill parameters to be specified.
       @param {array} values A list of colors - each one representing a fill to create.
     */

  }, {
    key: "fills",
    set: function set(value) {
      var objects = [];
      for (var b in value) {
        var color = this.colorFromString(value[b]);
        var fill = MSStyleFill.new();
        fill.setColor_(color);
        fill.setFillType_(BCFillTypeColor);
        fill.enabled = true;

        objects.push(fill);
      }
      this.sketchObject.setFills_(objects);
    }

    /**
     Return a list of tests to run for this class.
      @return {dictionary} A dictionary containing the tests to run. Each key is the name of a test, each value is a function which takes a Tester instance.
     */

  }], [{
    key: "tests",
    value: function tests() {
      return {
        "tests": {
          "testBorders": function testBorders(tester) {
            var style = new Style();
            style.borders = ["#11223344", "#1234"];
            tester.assertEqual(style.sketchObject.borders().count(), 2);
          },

          "testFills": function testFills(tester) {
            var style = new Style();
            style.borders = ["#11223344", "#1234"];
            tester.assertEqual(style.sketchObject.borders().count(), 2);
          }

        }
      };
    }
  }]);

  return Style;
}(_WrappedObject2.WrappedObject);

},{"./WrappedObject.js":15}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tester = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // ********************************
// # Tester.js
// # Sketch Javascript API.
//
// All code (C) 2016 Bohemian Coding.
// ********************************

var _Document = require('./Document.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
    Very simple unit testing utility.


    At some point we may switch to using Mocha or some other test framework, but for
    now we want to be able to invoke the tests from the Sketch side or from a plugin
    command, so it's simpler to use a simple test framework of our own devising.
*/

var Tester = exports.Tester = function () {

  /**
   Make a new tester.
    */

  function Tester(application) {
    _classCallCheck(this, Tester);

    /** @type {array} List of failures in the currently running test. */
    this._testFailures = [];

    /** @type {Application} The application that is running these tests. */
    this._application = application;

    /** @type {number} The number of tests we've run. */
    this._ran = 0;

    /** @type {array} The names of the tests that have passed. */
    this._passes = [];

    /** @type {array} Failure information for each test that has failed. */
    this._failures = [];
  }

  /**
   Assert that a condition is true.
   If the assertion fails, the failure is recorded for later reporting by the tester.
    @param {bool} condition The condition we're asserting.
   @param {string} description A description of the test.
   */

  _createClass(Tester, [{
    key: 'assert',
    value: function assert(condition, description) {
      if (!condition) {
        if (!description) description = "";
        this._testFailures.push(description);
      }
    }

    /**
     Assert that two values are equal.
     If the assertion fails, the failure is recorded for later reporting by the tester.
      @param v1 The first value to compare.
     @param v2 The second value to compare.
    */

  }, {
    key: 'assertEqual',
    value: function assertEqual(v1, v2) {
      var different = v1 != v2;

      // if we're comparing two objects, try matching them as strings
      // (crude, and not guaranteed, but it will cover some basic cases)
      if (different && (typeof v1 === 'undefined' ? 'undefined' : _typeof(v1)) === 'object' && (typeof v2 === 'undefined' ? 'undefined' : _typeof(v2)) === 'object') {
        if (v1.compare) {
          different = v1.compare(v2);
        } else {
          different = v1.toString() != v2.toString();
        }
      }

      if (different) {
        this._testFailures.push(v1 + " != " + v2);
      }
    }

    /**
     Assert that a value is true.
     If the assertion fails, the failure is recorded for later reporting by the tester.
      @param v The value to check.
    */

  }, {
    key: 'assertTrue',
    value: function assertTrue(v) {
      if (!v) {
        this._testFailures.push("expected true, got: " + v);
      }
    }

    /**
     Assert that a value is false.
     If the assertion fails, the failure is recorded for later reporting by the tester.
      @param v The value to check.
    */

  }, {
    key: 'assertFalse',
    value: function assertFalse(v) {
      if (v) {
        this._testFailures.push("expected false, got: " + v);
      }
    }

    /**
        The application instance that we're running the tests for.
        This is the instance associated with the script context that launched the tests.
         @return {Application} The application object.
     */

  }, {
    key: 'newTestDocument',


    /**
        Returns a new document to use in tests.
         @return {Document} Test document.
      */

    value: function newTestDocument() {
      var document = new _Document.Document(MSDocumentData.new(), this._application);
      return document;
    }

    /**
     Run a collection of tests.
      The method takes a dictionary describing the tests to run.
     The dictionary can contain two keys:
     - suites: this is a dictionary of sub-collections, each of which is recursively run by calling this method again.
     - tests: this is a dictionary of test functions, each of which is executed.
      The test functions are passed this tester object when they are executed, and should use the assertion methods on it
     to perform tests.
      @param {dictionary} specification A dictionary describing the tests to run. See discussion.
     @param {string} suiteName The name of the suite, if we're running a sub-collection. This will be null for the top level tests.
     @return {dictionary} Returns a dictionary indicating how many tests ran, and a list of the passed, failed, and crashed tests.
     */

  }, {
    key: 'runUnitTests',
    value: function runUnitTests(specification, suiteName) {
      var suites = specification.suites;
      for (var suite in suites) {
        this.runUnitTests(suites[suite], suite);
      }

      var tests = specification.tests;
      for (var name in tests) {
        var test = tests[name];
        this._ran++;
        this._testFailures = [];
        var result = test(this);
        var fullName = suiteName ? suiteName + " : " + name : name;
        if (this._testFailures.length > 0) {
          this._failures.push({ "name": fullName, "reasons": this._testFailures });
        } else {
          this._passes.push(fullName);
        }
      }

      return {
        "ran": this._ran,
        "crashes": [],
        "failures": this._failures,
        "passes": this._passes
      };
    }
  }, {
    key: 'application',
    get: function get() {
      return this._application;
    }
  }]);

  return Tester;
}();

},{"./Document.js":4}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Text = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Layer2 = require('./Layer.js');

var _Rectangle = require('./Rectangle.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // ********************************
// # Text.js
// # Sketch Javascript API.
//
// All code (C) 2016 Bohemian Coding.
// ********************************

/// Width is adjusted to fit the content.
var BCTextBehaviourFlexibleWidth = 0;

/// Width is fixed.
var BCTextBehaviourFixedWidth = 1;

/// Uses min & max line height on paragraph style
var BCTextLineSpacingBehaviourV2 = 1;

/// Uses MSConstantBaselineTypesetter for fixed line height
var BCTextLineSpacingBehaviourV3 = 2;

/// Mapping between text alignment names and values.
var NSTextAlignment = {
  /// Visually left aligned
  "left": 0,

  /// Visually right aligned
  "right": 1,

  /// Visually centered
  "center": 2,

  /// Fully-justified. The last line in a paragraph is natural-aligned.
  "justified": 3,

  /// Indicates the default alignment for script
  "natural": 4

  /**
  Represents a text layer.
  */

};
var Text = exports.Text = function (_Layer) {
  _inherits(Text, _Layer);

  /**
  Make a new text object.
   @param {MSTextLayer} text The underlying model object from Sketch.
  @param {Document} document The document that the text layer belongs to.
  */

  function Text(text, document) {
    _classCallCheck(this, Text);

    return _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this, text, document));
  }

  /**
  Is this a text layer?
   All Layer objects respond to this method, but only text layers return true.
   @return {bool} true for instances of Group, false for any other layer type.
  */

  _createClass(Text, [{
    key: 'adjustToFit',


    /**
    Adjust the frame of the layer to fit its contents.
    */

    value: function adjustToFit() {
      this._object.adjustFrameToFit();
    }

    /**
    Return a list of the text fragments for the text.
     @return {array} The line fragments. Each one is a dictionary containing a rectangle, and a baseline offset.
    */

  }, {
    key: 'isText',
    get: function get() {
      return true;
    }

    /**
    The text of the layer.
     @return {string} The layer text.
    */

  }, {
    key: 'text',
    get: function get() {
      return this._object.stringValue();
    }

    /**
    Set the text of the layer.
    If the layer hasn't explicitly been given a name, this will also change
    the layer's name to the text value.
     @param {string} value The text to use.
    */

    ,
    set: function set(value) {
      var object = this.sketchObject;
      object.stringValue = value;
      if (!object.nameIsFixed()) {
        object.name = value;
      }
    }

    /**
    Set the font of the layer to an NSFont object.
     @param {NSFont} value The font to use.
    */

  }, {
    key: 'font',
    set: function set(value) {
      this._object.font = value;
    }

    /**
    Set the font of the layer to the system font at a given size.
     @param {number} size The system font size to use.
    */

  }, {
    key: 'systemFontSize',
    set: function set(size) {
      this._object.font = NSFont.systemFontOfSize_(size);
    }

    /**
    The alignment of the layer.
    This will be one of the values: "left", "center", "right", "justified", "natural".
     @return {string} The alignment mode.
    */

  }, {
    key: 'alignment',
    get: function get() {
      var raw = this._object.textAlignment();
      var result = raw;
      for (var key in NSTextAlignment) {
        if (NSTextAlignment[key] === raw) {
          result = key;
          break;
        }
      }
      return result;
    }

    /**
    Set the alignment of the layer.
     The mode supplied can be a string or a number.
    If it's a string, it should be one of the values: "left", "center", "right", "justified", "natural".
     @param {string} mode The alignment mode to use.
    */

    ,
    set: function set(mode) {
      var translated = NSTextAlignment[mode];
      this._object.textAlignment = translated ? translated : mode;
    }

    /**
    Set the layer to be fixed width or variable width.
     @param {bool} value Whether the layer should be fixed width (true) or variable width (false).
    */

  }, {
    key: 'fixedWidth',
    set: function set(value) {
      if (value) {
        this._object.textBehaviour = BCTextBehaviourFixedWidth;
      } else {
        this._object.textBehaviour = BCTextBehaviourFlexibleWidth;
      }
    }
  }, {
    key: 'fragments',
    get: function get() {
      var textLayer = this.sketchObject;
      var storage = textLayer.immutableModelObject().createTextStorage();
      var layout = storage.layoutManagers().firstObject();
      var actualCharacterRangePtr = MOPointer.new();
      var charRange = NSMakeRange(0, storage.length());
      var drawingPoint = textLayer.drawingPointForText();

      layout.glyphRangeForCharacterRange_actualCharacterRange_(charRange, actualCharacterRangePtr);
      var glyphRange = actualCharacterRangePtr.value();

      var fragments = [];
      var currentLocation = 0;
      while (currentLocation < NSMaxRange(glyphRange)) {
        var effectiveRangePtr = MOPointer.new();
        var localRect = layout.lineFragmentRectForGlyphAtIndex_effectiveRange_(currentLocation, effectiveRangePtr);
        var rect = new _Rectangle.Rectangle(localRect.origin.x + drawingPoint.x, localRect.origin.y + drawingPoint.y, localRect.size.width, localRect.size.height);
        var effectiveRange = effectiveRangePtr.value();
        var baselineOffset = layout.typesetter().baselineOffsetInLayoutManager_glyphIndex_(layout, currentLocation);

        fragments.push({ "rect": rect, "baselineOffset": baselineOffset, range: effectiveRange });
        currentLocation = NSMaxRange(effectiveRange) + 1;
      }

      return fragments;
    }

    /**
    Set whether to use constant baseline line spacing mode.
     @param {bool} value If true, we use constant baseline spacing mode. This is the default for new text layers in Sketch. If false, we use the legacy line spacing mode.
    */

  }, {
    key: 'useConstantBaselines',
    set: function set(value) {
      var lineSpacingBehaviour = value ? BCTextLineSpacingBehaviourV3 : BCTextLineSpacingBehaviourV2;
      var textLayer = this.sketchObject;
      var initialBaselineOffset = textLayer.firstBaselineOffset();
      textLayer.lineSpacingBehaviour = lineSpacingBehaviour;
      var baselineOffset = textLayer.firstBaselineOffset();
      var rect = this.frame;
      rect.y -= baselineOffset - initialBaselineOffset;
      this.frame = rect;
    }

    /**
    Return a list of tests to run for this class.
     @return {dictionary} A dictionary containing the tests to run. Each key is the name of a test, each value is a function which takes a Tester instance.
    */

  }], [{
    key: 'tests',
    value: function tests() {
      return {
        "tests": {
          "testIsText": function testIsText(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var text = page.newText();
            tester.assertTrue(text.isText);
            tester.assertFalse(page.isText);
          },

          "testText": function testText(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var text = page.newText({ "text": "blah" });
            tester.assertEqual(text.text, "blah");
            text.text = "doodah";
            tester.assertEqual(text.text, "doodah");
          },

          "testAdjustToFit": function testAdjustToFit(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var text = page.newText({ "text": "blah", "frame": new _Rectangle.Rectangle(10, 10, 1000, 1000) });
            text.adjustToFit();
            tester.assertEqual(text.frame, new _Rectangle.Rectangle(10, 10, 23, 14));
          },

          "testAlignment": function testAlignment(tester) {
            var document = tester.newTestDocument();
            var page = document.selectedPage;
            var text = page.newText({ "text": "blah", "frame": new _Rectangle.Rectangle(10, 10, 1000, 1000) });
            for (var key in NSTextAlignment) {
              // test setting by name
              text.alignment = key;
              tester.assertEqual(text.alignment, key);

              // test setting by value
              text.alignment = NSTextAlignment[key];
              tester.assertEqual(text.alignment, key);
            }
          }

        }
      };
    }
  }]);

  return Text;
}(_Layer2.Layer);

},{"./Layer.js":7,"./Rectangle.js":9}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// ********************************
// # WrappedObject.js
// # Sketch Javascript API.
//
// All code (C) 2016 Bohemian Coding.
// ********************************

/**
  Base class for all objects that
  wrap Sketch classes.

*/

var WrappedObject = exports.WrappedObject = function () {

    /**
      Return a new wrapped object for a given Sketch model object.
       @param {Object} object - The Sketch model object to wrap.
    */

    function WrappedObject(object) {
        _classCallCheck(this, WrappedObject);

        /** @type {Object} The underlying Sketch model object that we are wrapping. */
        this._object = object;
    }

    /**
      Returns the wrapped Sketch object.
      */

    _createClass(WrappedObject, [{
        key: "sketchObject",
        get: function get() {
            return this._object;
        }

        /**
          Returns the object ID of the wrapped Sketch model object.
           @return {string} The id.
        */

    }, {
        key: "id",
        get: function get() {
            return this._object.objectID();
        }

        /**
         Return a list of tests to run for this class.
          @return {dictionary} A dictionary containing the tests to run. Each key is the name of a test, each value is a function which takes a Tester instance.
         */

    }], [{
        key: "tests",
        value: function tests() {
            return {
                "tests": {
                    "testSketchObject": function testSketchObject(tester) {
                        var object = MSLayer.new();
                        var wrapped = new WrappedObject(object);
                        tester.assertEqual(wrapped.sketchObject, object);
                    },

                    "testID": function testID(tester) {
                        var object = MSLayer.new();
                        var wrapped = new WrappedObject(object);
                        tester.assertEqual(wrapped.id, object.objectID());
                    }

                }
            };
        }
    }]);

    return WrappedObject;
}();

},{}]},{},[1]);
