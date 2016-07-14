"use strict";

var messages = require("../controllers/messages");

module.exports = function(Friends, app, auth) {

  app.route("/apis/v1/messages")
    .get(messages.all)
    .post(auth.requiresLogin, messages.add)

  app.route("/apis/v1/messages/:messageId")
    .put(auth.requiresLogin, messages.edit)
    .post(auth.requiresLogin, messages.read)
    .delete(auth.requiresLogin, messages.remove);
};

