/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/
var express = require('express');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '/../config.js');
var auth = require(__dirname + '/../services/auth.js');
var dinosaurs = require(__dirname + '/../data/dinosaurs.js');
var locations = require(__dirname + '/../data/locations.js');
var members = require(__dirname + '/../data/members.js');
var messages = require(__dirname + '/../data/messages.js');
var codeSamples = require(__dirname + '/../data/codeSamples.js');
var router;

var getTime = function () {
    return new Date();
};

router = express.Router();

router.post('/logins', function (req, res, next) {
    var credentials = {
        email: req.body.email.toLowerCase(),
        password: req.body.password
    };

    members.getMember({email: credentials.email}, function (err, member) {
        if (err) {
            next(err);

            return;
        }

        if (member === undefined) {
            res.status(401).send({message: 'Invalid email or password.'});
            return;
        }

        payload = {
            sub: member.email,
            memberId: member.id
        };

        delete member.password;
        member.email = credentials.email;

        res.status(200).json({
            member: member,
            token: jwt.sign(payload, config.jwtSecretKey)
        });
    });
});

router.delete('/logins', function (req, res, next) {
    res.status(200).json('place holder');
});

router.post('/members', function (req, res, next) {
    var member;
    var unhashedPassword;
    var registerCallback;

    member = {
        email: req.body.email.toLowerCase(),
        dinosaurId: req.body.dinosaurId,
        locationId: req.body.locationId,
        name: req.body.name,
        aboutYourself: req.body.aboutYourself,
        trilobitcoinNumber: req.body.trilobitcoinNumber,
        amount: req.body.amount,
        password: req.body.password
    };

    var startTime = getTime();

    registerCallback = function (err, member) {
        var payload;

        if (err) {
            if (err.message.indexOf('ORA-00001') > -1) {
                res.status(409).json({
                    error: 'dinoName must be unique'
                });

                return;
            }

            next(err);

            return;
        }

        payload = {
            sub: member.email,
            memberId: member.id
        };

        var endTime = getTime();

        res.status(200).json({
            member: member,
            token: jwt.sign(payload, config.jwtSecretKey),
            "executionTime": (endTime - startTime) / 1000
        });
    };

    if (req.headers['dd-process-type'] === 'thinDatabase') {
        members.registerMemberThinDatabase(
            member,
            registerCallback
        );
    } else if (req.headers['dd-process-type'] === 'thickDatabase') {
        members.registerMemberThickDatabase(
            member,
            registerCallback
        );
    } else {
        members.registerMemberAq(
            member,
            registerCallback
        );
    }
});


router.get('/members', auth(), function (req, res, next) {
    var params = {
        memberId: req.user.memberId,
        searchString: req.query.searchString
    };

    if (req.query.hasOwnProperty('maxDistance')) {
        params.maxDistance = req.query.maxDistance;
    }

    if (req.query.hasOwnProperty('limit')) {
        params.limit = req.query.limit;
    }

    if (req.query.hasOwnProperty('offset')) {
        params.offset = req.query.offset;
    }

    var startTime = getTime();

    var callback = function (err, members) {
        if (err) {
            next(err);

            return;
        }

        var endTime = getTime();

        res.status(200).json({
            "items": members,
            "executionTime": (endTime - startTime) / 1000
        });
    };

    if (req.headers['dd-process-type'] == 'like') {
        members.getMembersLike(params, callback)
    } else if (req.headers['dd-process-type'] === 'spatial') {
        members.getMembersSpatial(params, callback)
    } else {
        members.getMembersText(params, callback)
    }
});

router.get('/members/:id', auth(), function (req, res, next) {
    members.getMember({id: req.params.id}, function (err, member) {
        if (err) {
            next(err);

            return;
        }

        delete member.password;

        res.status(200).json(member);
    });
});

router.get('/members/:id/messages', auth(), function (req, res, next) {
    var params = {memberId: req.params.id};

    if (req.query.hasOwnProperty('limit')) {
        params.limit = req.query.limit;
    }

    if (req.query.hasOwnProperty('offset')) {
        params.offset = req.query.offset;
    }

    members.getMemberMessages(params, function (err, messages) {
        if (err) {
            next(err);

            return;
        }

        var retMessages = [];

        for (var i = 0; i < messages.length; i++) {
            retMessages.push({
                "messageId": messages[i][0],
                "fromMemberId": messages[i][1],
                "name": messages[i][2],
                "subject": messages[i][3],
                "messageContents": messages[i][4]
            });
        }

        res.status(200).json({"items": retMessages});
    });
});

router.get('/members/:id/name', auth(), function (req, res, next) {
    members.getMemberName({id: req.params.id}, function (err, name) {
        if (err) {
            next(err);

            return;
        }

        res.status(200).json({
            "memberId": name[0],
            "name": name[1]
        });
    });
});

router.get('/members/:id/status', auth(), function (req, res, next) {
    members.getMessage({id: req.params.id}, function (err, status) {
        if (err) {
            next(err);

            return;
        }

        res.status(200).json({
            "memberId": status[0],
            "status": status[1]
        });
    });
});

router.post('/members/generate', function (req, res, next) {
    var registerCallback,
        amount = req.body.amount;

    var startTime = getTime();

    registerCallback = function (err, newMembers) {
        if (err) {
            next(err);

            return;
        }

        var endTime = getTime();

        res.status(200).json({
            "newMembers": newMembers,
            "executionTime": (endTime - startTime) / 1000
        });
    };

    members.generateMembers(
        amount,
        registerCallback
    );
});

router.delete('/members/reset', function (req, res, next) {
    var registerCallback;

    var startTime = getTime();

    registerCallback = function (err, deletedMembers) {
        if (err) {
            next(err);

            return;
        }

        var endTime = getTime();

        res.status(200).json({
            "deletedMembers": deletedMembers,
            "executionTime": (endTime - startTime) / 1000
        });
    };

    members.resetMembers(
      registerCallback
    );
});

//Message Routes

router.get('/messages/:id', auth(), function (req, res, next) {
    messages.getMessageById({id: req.params.id, memberId: req.user.memberId}, function (err, message) {
        if (err) {
            next(err);

            return;
        }
        var ret_message;

        if (message.length > 0) {
            ret_message = {
                "fromMemberId": message[0], "name": message[1], "subject": message[2],
                "messageContents": message[3]
            };
        }
        res.status(200).json(ret_message);
    });
});

router.post('/messages', auth(), function (req, res, next) {
    var message = {
          fromMemberId: req.user.memberId,
          subject: req.body.subject,
          messageContents: req.body.messageContents
        },
      messageType = req.body.messageType;

    if (messageType === 'single') {
      message.toMemberId = req.body.toMemberId;

      registerCallback = function (err, messageId) {
        if (err) {
          next(err);

          return;
        }

        res.status(200).json({"messageId": messageId});
      };

      messages.sendMessage(message, registerCallback);
    } else if (messageType === 'broadcast') {

      var startTime = getTime();

      registerCallback = function (err, messageId) {
        if (err) {
          next(err);

          return;
        }

        var endTime = getTime();

        res.status(200).json({
          "messageCount": messageId,
          "executionTime": (endTime - startTime) / 1000
        });
      };

      if (req.headers['dd-process-type'] === 'thinDatabase') {
        messages.sendBroadcastThinDatabase(
          message,
          registerCallback
        );
      } else {
        messages.sendBroadcastThickDatabase(
          message,
          registerCallback
        );
      }
    }
});

//Dinosaur Routes
router.get('/dinosaurs/species', function (req, res, next) {
    dinosaurs.getDinosaurs(function (err, dinosaurs) {
        var response = {};

        if (err) {
            throw err;
        }

        response.items = dinosaurs;

        res.status(200).json(response);
    });
});

//Location Routes
router.get('/locations', function (req, res, next) {
    locations.getLocations(function (err, locations) {
        var response = {};

        if (err) {
            throw err;
        }

        response.items = locations;

        res.status(200).json(response);
    });
});

//Code Samples
router.get('/code/:page/:tag', function (req, res, next) {
    var file_names = {
        'registration': __dirname + '/../data/members.js',
        'search': __dirname + '/../data/members.js',
        'broadcast': __dirname + '/../data/messages.js'
    };

    codeSamples.getCodeSample(file_names[req.params.page], req.params.page + '_' + req.params.tag, function (err, codeSample) {
        if (err) {
            throw err;
        }

        res.status(200).json({code: codeSample});
    });
});


module.exports.router = router;