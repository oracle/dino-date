/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/
var jwt = require('jsonwebtoken');
var config = require(__dirname + '/../config.js');

function auth(role) {
    return function(req, res, next) {
        var token;
        var payload;

        if (!req.headers.authorization) {
            return res.status(401).send({message: 'You are not authorized'});
        }

        token = req.headers.authorization.split(' ')[1];

        try {
            payload = jwt.verify(token, config.jwtSecretKey);
        } catch (e) {
            if (e.name === 'TokenExpiredError') {
                res.status(401).send({message: 'Token Expired'});
            } else {
                res.status(401).send({message: 'Authentication failed'});
            }

            return;
        }

        if (!role || role === payload.role) {
            //pass some user details through in case they are needed
            req.user = {
                email: payload.sub,
                memberId: payload.memberId
            };

            next();
        } else {
            res.status(401).send({message: 'You are not authorized'});
        }
    }
}

module.exports = auth;