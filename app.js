"use strict";

/*
 * Defining the Package
 */
var Module = require("meanio").Module;

var MessagesPackage = new Module("meanio-messages");

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
MessagesPackage.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  MessagesPackage.routes(app, auth, database);

  return MessagesPackage;
});
