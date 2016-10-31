/*jshint -W079 */
"use strict";

/**
 * Module dependencies.
 */
var _ = require("lodash");
var Promise = require("bluebird");
var should = require("should");
var path = require("path");
// var moment = require("moment");
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Message = mongoose.model("Message");
var Usermessage = mongoose.model("Usermessage");
var config = require("meanio").loadConfig();
var testutils = require(path.join(config.root, "/config/testutils"));
var randomstring = require("randomstring");

/**
 * Globals
 */

var numUsers = 2;
var users = [];
var savedusers = [];


/**
 * Test Suites
 */
describe("<Unit Test>", function() {
  
  this.timeout(10000);
  describe("Model messages:", function() {
    beforeEach(function(done) {
      return Promise.resolve()
      .then(function() {
        return Promise.cast(User.remove().exec());
      }).then(function() {
        return Promise.cast(Usermessage.remove().exec());
      }).then(function() {
        return Promise.resolve(_.range(numUsers))
      }).map(function(d) {
        users[d] = testutils.genUser();
        return User.insert(users[d]).then(function(dd) {
          savedusers[d] = JSON.parse(JSON.stringify(dd)); 
        });
      }).then(function() {
        done();
      })
    });

    describe("Method insert", function() {
      it("should be able to insert a general message (insert)", function(done) {
        var userId = savedusers[0]._id;
        var targetId = savedusers[1]._id;
        var message = {
          title: "title",
          body: "body"
        };
        var messageId; 
        return Promise.resolve()
        .then(function() {
          return Message.send(userId, targetId, message)
        }).then(function() {
          return Promise.cast(Usermessage.findOne({user_id: userId}).exec())
          .then(function(d) {
            d = JSON.parse(JSON.stringify(d));
            var foundMessage = d.messages.reduce(function(t, d) {
              if (d.title === message.title && d.body === message.body) {
                messageId = d.message_id
                return true;
              } else {
                return t;
              }
            }, false)
            foundMessage.should.equal(true);
          })
        }).then(function() {
          return Promise.cast(Usermessage.findOne({user_id: targetId}).exec())
          .then(function(d) {
            d = JSON.parse(JSON.stringify(d));
            var foundMessage = d.messages.reduce(function(t, d) {
              if (d.title === message.title && d.body === message.body && d.message_id === messageId) {
                return true;
              } else {
                return t;
              }
            }, false)
            foundMessage.should.equal(true);
          })
        }).then(function() {
          return Promise.cast(User.findOne({_id: userId}).exec())
          .then(function(d) {
            d = JSON.parse(JSON.stringify(d));
            var foundMessage = d.messages.reduce(function(t, d) {
              if (d.title === message.title && d.body === message.body) {
                return true;
              } else {
                return t;
              }
            }, false)
            foundMessage.should.equal(false);
          })
        }).then(function() {
          return Promise.cast(User.findOne({_id: targetId}).exec())
          .then(function(d) {
            d = JSON.parse(JSON.stringify(d));
            var foundMessage = d.messages.reduce(function(t, d) {
              if (d.message.indexOf("you have received a message from") > -1) {
                return true;
              } else {
                return t;
              }
            }, false)
            foundMessage.should.equal(true);
          })
        }).then(function() {
          done();
        })
      });

      it("should fail to send a message when userId is incorrect (send)", function(done) {
        var userId = randomstring.generate(16);
        var targetId = savedusers[1]._id;
        var message = {
          title: "title",
          body: "body"
        };
        return Promise.resolve()
        .then(function() {
          return Message.send(userId, targetId, message)
        }).catch(function(err) {
          should.exist(err);
          done();
        })
      });

      it("should fail to send a message when targetId is incorrect (send)", function(done) {
        var userId = savedusers[0]._id;
        var targetId = randomstring.generate(16);
        var message = {
          title: "title",
          body: "body"
        };
        return Promise.resolve()
        .then(function() {
          return Message.send(userId, targetId, message)
        }).catch(function(err) {
          should.exist(err);
          done();
        })
      });

      it("should fail to send a message without title (send)", function(done) {
        var userId = savedusers[0]._id;
        var targetId = savedusers[1]._id;
        var message = {
          body: "body"
        };
        return Promise.resolve()
        .then(function() {
          return Message.send(userId, targetId, message)
        }).catch(function(err) {
          should.exist(err);
          done();
        })
      });   

      it("should fail to send message on without body (send)", function(done) {
        var userId = savedusers[0]._id;
        var targetId = savedusers[1]._id;
        var message = {
          title: "title"
        };
        return Promise.resolve()
        .then(function() {
          return Message.send(userId, targetId, message)
        }).catch(function(err) {
          should.exist(err);
          done();
        });
      });

      it("should read a message (read)", function(done) {
        var userId = savedusers[0]._id;
        var targetId = savedusers[1]._id;
        var message = "message ya";
        var messageId;
        return Promise.resolve()
        .then(function() {
          return Message.send(userId, targetId, message)
        }).then(function() {
          return Promise.cast(Usermessage.findOne({user_id: targetId}).exec())
          .then(function(d) {
            d = JSON.parse(JSON.stringify(d));
            var foundMessage = d.messages.reduce(function(t, d) {
              if (d.title === message && d.body === message) {
                messageId = d.message_id;
                should(d.read).not.equal(true);
                return true;
              } else {
                return t;
              }
            }, false)
            foundMessage.should.equal(true);
          })
        }).then(function() {
          return Usermessage.read(targetId, messageId)
        }).then(function() {
          return Promise.cast(Usermessage.findOne({user_id: targetId}).exec())
          .then(function(d) {
            d = JSON.parse(JSON.stringify(d));
            var foundMessage = d.messages.reduce(function(t, d) {
              if (d.title === message && d.body === message) {
                messageId = d.message_id;
                should(d.read).equal(true);
                return true;
              } else {
                return t;
              }
            }, false)
            foundMessage.should.equal(true);
          })
        }).then(function() {
          done();
        }).catch(function(err) {
          should.not.exist(err);
          done();
        });
      });

    });

    afterEach(function(done) {
      return Promise.resolve(savedusers).map(function(d) {
        return Promise.cast(User.find({_id: d._id}).remove().exec())
      }).then(function() {
        return Promise.cast(User.find({}).exec())
        .then(function(d) { 
          d.should.have.length(0);
        })
      }).then(function() {
        users = [];
        savedusers = [];
        done();
      }).catch(function(err) {
        should.not.exist(err);
        done();
      });
    });
  });
});
