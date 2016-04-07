'use strict';

process.on('uncaughtException', function(error) {
  if (error == null){
    error = {};
  }
  if (error.message != null){
    console.log(error.message);
  }
  if (error.stack != null){
    console.log(error.stack);
  }
});

const electron = require('electron');
const app = electron.app;
const path = require('path');
const yargs = require('yargs');
console.log = require('nslog');

function start(){
  var args = parseCommandLine();

  app.on('ready', function(){
    app.dock.hide();
    var braintrust = require(path.join(args.resourcePath, 'src', 'scripts', 'braintrust'));
    console.log(braintrust.app);
    braintrust.gatherMinds(args);
    console.log(braintrust.app);
  });
}

function writeVersion(){
  process.stdout.write("BrainTrust: " + app.getVersion() + "\n" +
                       "Electron  : " + process.versions.electron + "\n" +
                       "Chrome    : " + process.versions.chrome + "\n" +
                       "Node      : " + process.versions.node + "\n");
}

function normalizeDriveLetterName(filePath) {
  if (process.platform === 'win32'){
    return filePath.replace(/^([a-z]):/, function(arg) {
      var driveLetter;
      driveLetter = arg[0];
      return driveLetter.toUpperCase() + ":";
    });
  }
  else {
    return filePath;
  }
};

function parseCommandLine(){
  var version = app.getVersion();
  var options = yargs(process.argv.slice(1));

  options.usage(
    "BrainTrust v" + version + "\n" +
    "Usage: braintrust [options]"
  );

  options.alias('h', 'help').boolean('h').describe('h', 'Print this usage message.');
  options.alias('v', 'version').boolean('v').describe('v', 'Print the version information.');
  options.alias('d', 'dev').boolean('d').describe('d', 'Run in development mode.');

  var args = options.argv;

  if (args.help){
    process.stdout.write(options.help());
    process.exit(0);
  }

  if (args.version){
    writeVersion();
    process.exit(0);
  }

  var devMode = args['dev'];
  var resourcePath = path.dirname(path.dirname(__dirname));
  resourcePath = normalizeDriveLetterName(resourcePath);

  return {
    version: version,
    devMode: devMode,
    resourcePath: resourcePath
  };
}

start();
