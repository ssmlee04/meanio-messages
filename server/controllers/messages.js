/*jshint -W079 */
"use strict";

/*
 * Module dependencies.
 */
var mongoose = require("mongoose");
var Promise = require("bluebird");
var Message = mongoose.model("Message");

/*
 * Get other user matrics
 */
exports.add = function(req, res) {
  if (!req.user || !req.user._id) {
    return res.json(500, {error: "text-error-user"});
  }
  var message = req.body.message;
  var targetUserId = req.body.targetUserId;
  var userId = req.user._id.toString();
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return res.json(500, {error: "text-error-other-user"});
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.json(500, {error: "text-error-user-id"});
  }
  if (!message) {
    return res.json(500, {error: "message is wrong..."});
  }

  var info = {
    message: message
  }

  return Promise.resolve()
  .then(function() {
    return Message.add(userId, targetUserId, info)
  }).then(function() {
    res.json({status: "success adding "});
  }).catch(function(err) {
    console.log(err)
    res.json(500, {error: err.toString()})
  })
};

exports.remove = function(req, res) {
  if (!req.user || !req.user._id) {
    return res.json(500, {error: "text-error-user"});
  }
  var messageId = req.params.messageId;
  var targetUserId = req.body.targetUserId;
  var userId = req.user._id.toString();
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return res.json(500, {error: "text-error-other-user"});
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.json(500, {error: "text-error-fd-user-id"});
  }
  if (!messageId) {
    return res.json(500, {error: "messageId is wrong..."});
  }

  return Promise.resolve()
  .then(function() {
    return Message.remove(userId, targetUserId, messageId)
  }).then(function() {
    res.json({status: "success"});
  }).catch(function(err) {
    console.log(err)
    res.json(500, {error: err.toString()})
  })
};

exports.edit = function(req, res) {
  if (!req.user || !req.user._id) {
    return res.json(500, {error: "text-error-user"});
  }
  var targetUserId = req.body.targetUserId;
  var message = req.body.message;
  var messageId = req.params.messageId;
  var userId = req.user._id.toString();
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return res.json(500, {error: "text-error-other-user"});
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.json(500, {error: "text-error-fd-user-id"});
  }
  if (!message) {
    return res.json(500, {error: "message is wrong..."});
  }
  if (!messageId) {
    return res.json(500, {error: "messageId is wrong..."});
  }

  var info = {
    message: message
  }

  return Promise.resolve()
  .then(function() {
    return Message.edit(userId, targetUserId, messageId, info)
  }).then(function() {
    res.json({status: "success"});
  }).catch(function(err) {
    console.log(err)
    res.json(500, {error: err.toString()})
  })
};

exports.read = function(req, res) {
  if (!req.user || !req.user._id) {
    return res.json(500, {error: "text-error-user"});
  }
  var targetUserId = req.body.targetUserId;
  var messageId = req.params.messageId;
  var userId = req.user._id.toString();

  return Promise.resolve()
  .then(function() {
    return Message.read(userId, targetUserId, messageId)
  }).then(function() {
    res.json({status: "success reading this message"});
  }).catch(function(err) {
    console.log(err)
    res.json(500, {error: err.toString()})
  })
}

exports.all = function(req, res) {
  if (!req.user || !req.user._id) {
    return res.json(500, {error: "text-error-user"});
  }
  var userId = req.user._id.toString();

  return Message.all(userId)
  .then(function(d) {
    return res.json(d || []);
  }).catch(function(err) {
    res.json(500, {error: "error fetching list of messages.."})
  })
};
