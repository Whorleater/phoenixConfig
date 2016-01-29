'use strict';

var keys = [];
var controlAlt = ['ctrl', 'alt'];
var controlCommandAlt = [ 'ctrl', 'cmd', 'alt' ];
var controlAltShift = [ 'ctrl', 'alt', 'shift' ];
var margin = 0;
var increment = 0.1;
var centralMultiplier = .75;
/* Position */

var Position = {

    central: function (frame, window) {

        return {

            x: frame.x + ((frame.width - window.width) / 2),
            y: frame.y + ((frame.height - window.height) / 2)

        };
    },

    top: function (frame, window) {

        return {

            x: window.x,
            y: frame.y

        };
    },

    bottom: function (frame, window) {

        return {

            x: window.x,
            y: (frame.y + frame.height) - window.height

        };
    },

    left: function (frame, window) {

        return {

            x: frame.x,
            y: window.y

        };
    },

    right: function (frame, window) {

        return {

            x: (frame.x + frame.width) - window.width,
            y: window.y

        };
    },

    topLeft: function (frame, window, margin) {

        return {

            x: Position.left(frame, window).x + margin,
            y: Position.top(frame, window).y + margin

        };
    },

    topRight: function (frame, window, margin) {

        return {

            x: Position.right(frame, window).x - margin,
            y: Position.top(frame, window).y + margin

        };
    },

    bottomLeft: function (frame, window, margin) {

        return {

            x: Position.left(frame, window).x + margin,
            y: Position.bottom(frame, window).y - margin

        };
    },

    bottomRight: function (frame, window, margin) {

        return {

            x: Position.right(frame, window).x - margin,
            y: Position.bottom(frame, window).y - margin

        };
    }
};

/* Grid */

var Frame = {

    width: 1,
    height: 1,

    half: {

        width: 0.5,
        height: 0.5

    }
};

/* Window Functions */

Window.prototype.to = function (position) {

    this.setTopLeft(position(this.screen().visibleFrameInRectangle(), this.frame(), margin));
}

Window.prototype.grid = function (x, y, reverse) {

    var frame = this.screen().visibleFrameInRectangle();

    var newWindowFrame = _(this.frame()).extend({

        width: (frame.width * x) - (2 * margin),
        height: (frame.height * y) - (2 * margin)

    });

    var position = reverse ? Position.topRight(frame, newWindowFrame, margin) :
                             Position.topLeft(frame, newWindowFrame, margin);

    this.setFrame(_(newWindowFrame).extend(position));
}

Window.prototype.bottomGrid = function (x, y, reverse) {

    var frame = this.screen().visibleFrameInRectangle();

    var newWindowFrame = _(this.frame()).extend({

        width: (frame.width * x) - (2 * margin),
        height: (frame.height * y) - (2 * margin)

    });

    var position = reverse ? Position.bottomRight(frame, newWindowFrame, margin) :
                             Position.bottomLeft(frame, newWindowFrame, margin);

    this.setFrame(_(newWindowFrame).extend(position));
}

Window.prototype.centralGrid = function (x, y) {

    var frame = this.screen().visibleFrameInRectangle();

    var newWindowFrame = _(this.frame()).extend({
        width: (frame.width * x * centralMultiplier),
        height: (frame.height * y * centralMultiplier)

    });

    var position = Position.central(frame, newWindowFrame, margin);

    this.setFrame(_(newWindowFrame).extend(position));
}


Window.prototype.resize = function (multiplier) {

    var frame = this.screen().visibleFrameInRectangle();
    var newSize = this.size();

    if (multiplier.x) {
        newSize.width += frame.width * multiplier.x;
    }

    if (multiplier.y) {
        newSize.height += frame.height * multiplier.y;
    }

    this.setSize(newSize);
}


/**
 * Screen Functions
 */

function moveToScreen(window, screen) {
  if (!window) return;
  if (!screen) return;

  var frame = window.frame();
  var oldScreenRect = window.screen().visibleFrameInRectangle();
  var newScreenRect = screen.visibleFrameInRectangle();
  var xRatio = newScreenRect.width / oldScreenRect.width;
  var yRatio = newScreenRect.height / oldScreenRect.height;

  var mid_pos_x = frame.x + Math.round(0.5 * frame.width);
  var mid_pos_y = frame.y + Math.round(0.5 * frame.height);

  window.setFrame({
    x: (mid_pos_x - oldScreenRect.x) * xRatio + newScreenRect.x - 0.5 * frame.width,
    y: (mid_pos_y - oldScreenRect.y) * yRatio + newScreenRect.y - 0.5 * frame.height,
    width: frame.width,
    height: frame.height
  });
};

function windowsOnOtherScreen() {
  var start = new Date().getTime();
  var otherWindowsOnSameScreen = Window.focusedWindow().otherWindowsOnSameScreen();  // slow
  var otherWindowTitlesOnSameScreen = _.map(otherWindowsOnSameScreen , function(w) { return w.title(); });
  var return_value = _.chain(Window.focusedWindow().otherWindowsOnAllScreens())
    .filter(function(window) { return ! _.contains(otherWindowTitlesOnSameScreen, window.title()); })
    .value();
  return return_value;
};


// Move Current Window to Next Screen
keys.push(Phoenix.bind('right', controlAlt, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  if (window.screen() === window.screen().next()) return;
  if (window.screen().next().frameInRectangle().x < 0) {
    return;
  }
  moveToScreen(window, window.screen().next());
}));

// Move Current Window to Previous Screen
keys.push(Phoenix.bind('left', controlAlt, function() {
    var window = Window.focusedWindow();
    if (!window) return;
    if (window.screen() === window.screen().next()) return;
    if (window.screen().next().frameInRectangle().x < 0) {
      return;
    }
    moveToScreen(window, window.screen().next());
}));

/* Grid Bindings */
//Quarter Screen Actions
//upper left
keys.push(Phoenix.bind('left', controlAltShift, function () {
    Window.focusedWindow() && Window.focusedWindow().grid(Frame.half.width, Frame.half.height);
}));

//upper right
keys.push(Phoenix.bind('up', controlAltShift, function () {
    Window.focusedWindow() && Window.focusedWindow().grid(Frame.half.width, Frame.half.height, true);
}));
 
//lower left
keys.push(Phoenix.bind('down', controlAltShift, function () {
    Window.focusedWindow() && Window.focusedWindow().bottomGrid(Frame.half.width, Frame.half.height); 
}));

//lower right 
keys.push(Phoenix.bind('right', controlAltShift, function () {
    Window.focusedWindow() && Window.focusedWindow().bottomGrid(Frame.half.width, Frame.half.height, true); 
}));

//Split screen actions
//upper half
keys.push(Phoenix.bind('up', controlCommandAlt, function () {
    Window.focusedWindow() && Window.focusedWindow().grid(Frame.width, Frame.half.height);
}));
//bottom half
keys.push(Phoenix.bind('down', controlCommandAlt, function () {
    Window.focusedWindow() && Window.focusedWindow().bottomGrid(Frame.width, Frame.half.height);
}));

//left half
keys.push(Phoenix.bind('left', controlCommandAlt, function () {
    Window.focusedWindow() && Window.focusedWindow().grid(Frame.half.width, Frame.height);
}));

//right half <-- something is funky with this command
keys.push(Phoenix.bind('right', controlCommandAlt, function () {
    Window.focusedWindow() && Window.focusedWindow().grid(Frame.half.width, Frame.height, true);
}));

//maximize window
keys.push(Phoenix.bind('m', controlCommandAlt, function () {
    Window.focusedWindow() && Window.focusedWindow().grid(Frame.width, Frame.height);
}));


//centralize window
keys.push(Phoenix.bind('c', controlCommandAlt, function() {
    Window.focusedWindow() && Window.focusedWindow().centralGrid(Frame.width, Frame.height);
}));



//grids layout
var cmd = ['cmd'];

var grids = {
  '1 Up': {rows: 1, cols: 1},    
  '2 Up': {rows: 1, cols: 2},
  '3 Up': {rows: 1, cols: 3},
  '4 Up': {rows: 2, cols: 2},
  '6 Up': {rows: 2, cols: 3},
  '9 Up': {rows: 3, cols: 3},
};

function grid(name) {
  var rows = grids[name].rows;
  var cols = grids[name].cols;
  return function applyGrid() {
    var windows = Window.visibleWindowsInOrder();
    windows.splice(Math.min(windows.length, cols*rows));
    var pre = windows.length;
    var sFrame = Screen.mainScreen().visibleFrameInRectangle();
    var width = Math.round(sFrame.width / cols);
    var height = Math.round(sFrame.height / rows);

    var x = sFrame.x;
    var y = sFrame.y;
    _.times(cols, function(col) {
      _.times(rows, function(row) {
        var n = col + (row*cols);
        var rect = {x: x + (col*width), y: y + (row*height), width: width, height: height};
        if (windows.length > n) {
          windows[n].setFrame(rect);
        }
      });
    });
  };
}

keys.push(Phoenix.bind('1', cmd, grid('1 Up')));
keys.push(Phoenix.bind('2', cmd, grid('2 Up')));
keys.push(Phoenix.bind('3', cmd, grid('3 Up')));
keys.push(Phoenix.bind('4', cmd, grid('4 Up')));
keys.push(Phoenix.bind('6', cmd, grid('6 Up')));
keys.push(Phoenix.bind('9', cmd, grid('9 Up')));

function moveFocusFn(dir) {
  return function moveFocus() {
    var fnNames = {
      h: 'focusClosestWindowInWest',
      j: 'focusClosestWindowInSouth',
      k: 'focusClosestWindowInNorth',
      l: 'focusClosestWindowInEast'
    };
    Window.focusedWindow()[fnNames[dir]]();
  };
}

function showCenteredModal(message, offset) {
  var m = new Modal();
  m.duration = 0.5;
  m.message = message;

  var sFrame = Screen.mainScreen().visibleFrameInRectangle();
  var mFrame = m.frame();

  var mX = Math.round((sFrame.width / 2) - (mFrame.width / 2));
  var mY = Math.round((sFrame.height / 2) - (mFrame.height / 2));
  if (!offset) {
    offset = {x: 0, y: 0};
  }

  m.origin = {x: sFrame.x + mX + offset.x, y: sFrame.y + mY + offset.y};
  m.show();
}
