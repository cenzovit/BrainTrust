'use strict';

const electron = require('electron');
const app = electron.app;
const path = require('path');
const BrowserWindow = electron.BrowserWindow;
const EventEmitter = require('events').EventEmitter;
const Menu = electron.Menu;
const Tray = electron.Tray;

let instance = null;

class BrainTrust extends EventEmitter {

  constructor(options){
    if (!instance){
      // EventEmitter Constructor
      super();

      // Set variables
      this.devMode = options.devMode;
      this.resourcePath = options.resourcePath;
      this.windows = {};
      this._assistants = {};
      this.tray = null;
      this.annyang = require('annyang');

      // Initialize Application
      this.initTray();
      this.initAnnyang();
      this.handleEvents();

      instance = this;
    }

    return instance;
  };

  /**
    Initializes the BrainTrust menubar
  **/
  initTray(){
    if (!this.tray){
      this.tray = new Tray(this.resourcePath + '/src/assets/iconTemplate.png');
      var contextMenu = Menu.buildFromTemplate([
        {
          label: 'Toggle BrainTrust',
          type: 'normal',
          click: (function(_this){
            return function(){
              _this.emit("braintrust:activate");
            };
          })(this)
        },
        { type: 'separator' },
        {
          label: 'Manage Assistants',
          type: 'normal',
          click: (function(_this){
            return function(){
              _this.emit("braintrust:open-assistants");
            };
          })(this)
        },
        {
          label: 'Settings',
          type: 'normal',
          click: (function(_this){
            return function(){
              _this.emit("braintrust:open-settings");
            };
          })(this)
        },
        { type: 'separator' },
        {
          label: 'Quit',
          type: 'normal',
          click: app.quit
        }
      ]);
      this.tray.setToolTip(BrainTrust.name);
      this.tray.setContextMenu(contextMenu);
    }
  };

  /**
    Simple function to see if the provided object has the necessary methods to be an assistant
  **/
  isAssistant(obj){
    var returnType = {'getAssistantName':'string', 'getListeningCommands':'object'};
    for (var func in returnType){
      if(typeof obj[func] != 'function' && typeof obj[func]() != returnType[func]) {
        return false;
      }
    }
    // It quacks like an assistant...
    return true;
  }


  /**
    Add Assistant to BrainTrust
  **/
  addAssistant(src){
    process.stdout.write("addAssistant");
  }

  /**
    Initialize Annyang module.
  **/
  initAnnyang(){
    process.stdout.write("initAnnyang");
  }

  getAnnyang(){
    return this.annyang;
  }

  /**
    Load the provided url into the mainWindow. If the mainWindow does not exist, create it.
  **/
  openWindowTo(url){
    if (!this.windows.mainWindow){
      var mainWindow = new BrowserWindow({width: 800, height: 600, darkTheme: true});
      mainWindow.on('close', (function(_this){
        return function(){
          _this.emit("braintrust:close-main-window");
        };
      })(this));

      this.windows.mainWindow = mainWindow;

      if(this.devMode){
        this.windows.mainWindow.webContents.openDevTools();
      }
    }
    else {
      this.windows.mainWindow.show();
    }

    this.windows.mainWindow.loadURL(url);
    app.dock.show();
  };

  /**
    Trigger the braintrust listener
  **/
  activateBrainTrust(){
    if (!this.windows.btWindow){
      var btWindow = new BrowserWindow({width: 500, height: 120, /* y: 130, */ resizable: false, frame: false});
      btWindow.on('blur', (function(_this){
        return function(){
          _this.emit("braintrust:close-braintrust-window");
        };
      })(this));

      this.windows.btWindow = btWindow;
    }

    this.windows.btWindow.loadURL('file://' + this.resourcePath + '/src/views/btWindow.html');
    this.windows.btWindow.show();
  }

  handleEvents(){
    this.on('braintrust:activate', this.activateBrainTrust);
    this.on('braintrust:open-index', function(){
      this.openWindowTo('file://' + this.resourcePath + '/src/views/index.html');
    });
    this.on('braintrust:open-assistants', function(){
      this.openWindowTo('file://' + this.resourcePath + '/src/views/assistants.html');
    });
    this.on('braintrust:open-settings', function(){
      this.openWindowTo('file://' + this.resourcePath + '/src/views/settings.html');
    });

    this.on('braintrust:close-braintrust-window', function(){
      if(this.windows.btWindow){
        this.windows.btWindow.close();
      }
      this.windows.btWindow = null;
    });

    this.on('braintrust:close-main-window', function(){
      app.dock.hide();
      this.windows.mainWindow = null;
    });

    app.on('window-all-closed', function() {
      app.dock.hide();
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', (function(_this){
      return function(){
        _this.emit("braintrust:open-index");
      };
    })(this));
  };

};

module.exports = {
  initialize: function(opts){
    module.exports["app"] = new BrainTrust(opts);
  },
  gatherMinds: function(opts){
    this.initialize(opts);
  }
}
