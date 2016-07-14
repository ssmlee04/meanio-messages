/*jshint -W079 */
"use strict";

var Promise = require("bluebird");
var path = require("path");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var config = require("meanio").loadConfig();
var utils = require(path.join(config.root, "/config/utils"));

var MessageSchema = new Schema({
  message_id: { 
    type: Schema.Types.ObjectId, 
    required: true
  },
  message: { 
    type: String, 
    required: true
  },
  createdAt: {
    type: Date, 
    default: Date.now
  }, 
  updatedAt: {
    type: Date, 
    default: Date.now
  },
  read: {
    type: Boolean
  }
}, {_id : false});

var MessageSchema = new Schema({
  user_id : { 
    type: Schema.Types.ObjectId, 
    ref: "User" 
  },
  target_id: { 
    type: Schema.Types.ObjectId, 
    ref: "User" 
  },
  messages : [MessageSchema]
}, {
  timestamps: true,
  collection: "oc_messages"
});

MessageSchema.index({user_id: 1, target_id: 1}, {unique: true});

MessageSchema.statics.load = function(id) {
  return Promise.cast(this.findOne({_id: id}).exec());
};

MessageSchema.statics.all = function(userId) {
  return Promise.cast(this.find({user_id: userId}).exec());
};

MessageSchema.statics.__insert = function(userId, targetId) {
  var that = this;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return Promise.reject("not a valid user id");
  }

  return Promise.resolve()
  .then(function() {
    return Promise.cast(that.findOne({user_id: userId, target_id: targetId}).exec())
    .then(function(d) {
      if (!d) {
        return Promise.cast(that.create({user_id: userId, target_id: targetId, messages: []}));
      }
    });
  }).then(function() {
    return Promise.cast(that.findOne({user_id: targetId, target_id: userId}).exec())
    .then(function(d) {
      if (!d) {
        return Promise.cast(that.create({user_id: targetId, target_id: userId, messages: []}));
      }
    });
  })
};

MessageSchema.statics.read = function(userId, targetId, messageId) {
  var that = this;

  return Promise.resolve()
  .then(function() {
    return that.__insert(userId, targetId);
  }).then(function() {
    return Promise.cast(that.update({user_id: targetId, target_id:userId, "messages.message_id" : messageId}, {"messages.$.read" : 1}).exec());
  }).then(function() {
    return Promise.cast(that.update({user_id: userId, target_id:targetId, "messages.message_id" : messageId}, {"messages.$.read" : 1}).exec());
  })
};

MessageSchema.statics.add = function(userId, targetId, info) {
  var that = this;
  var messageId = utils.getRandomString(24)
  info.message_id = messageId

  return Promise.resolve()
  .then(function() {
    return that.__insert(userId, targetId);
  }).then(function() {
    return Promise.cast(that.update({user_id: targetId, target_id: userId}, {$push: {messages: {$each: [info], $position: 0}}}).exec());
  }).then(function() {
    return Promise.cast(that.update({user_id: userId, target_id: targetId}, {$push: {messages: {$each: [info], $position: 0}}}).exec());
  })
};

MessageSchema.statics.remove = function(userId, targetId, messageId) {
  console.log(userId, targetId, messageId);
  var that = this;
  return Promise.resolve()
  .then(function() {
    return Promise.cast(that.update({user_id: userId, target_id: targetId, "messages.message_id": messageId}, {$pop: {"messages": {message_id: messageId}}}).exec());
  }).then(function() {
    return Promise.cast(that.update({user_id: targetId, target_id: userId, "messages.message_id": messageId}, {$pop: {"messages": {message_id: messageId}}}).exec());
  })
};

MessageSchema.statics.edit = function(userId, targetId, messageId, info) {
  var that = this;
  info.message_id = messageId

  return Promise.resolve()
  .then(function() {
    return Promise.cast(that.update({user_id: targetId, target_id: userId, "messages.message_id": messageId}, {"messages.$": info}).exec());
  }).then(function() {
    return Promise.cast(that.update({user_id: userId, target_id: targetId, "messages.message_id": messageId}, {"messages.$": info}).exec());
  })
};

mongoose.model("Message", MessageSchema);

