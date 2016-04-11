/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/
var oracledb = require('oracledb');
var config = require(__dirname + '/../config.js');
var async = require('async');

module.exports.getMessageById = getMessageById = function (message, callback) {
    oracledb.getConnection(
        config.database,
        function (err, connection) {
            if (err) {
                callback(err);

                return;
            }

            connection.execute('SELECT from_member_id, dino_name, subject, dbms_lob.substr(message_contents, 4000, 1 ) as message_contents ' +
                'FROM   dd_messages, dd_members ' +
                'WHERE  message_id = :messageId ' +
                'AND    :memberId in (0, to_member_id) ' +
                'AND    dd_messages.from_member_id = dd_members.member_id',
                {
                    messageId: message.id,
                    memberId: message.memberId
                },
                function (err, results) {
                    if (err) {
                        callback(err);

                        return;
                    }

                    callback(null, results.rows[0] || []);
                }
            );
        }
    );
};

//SampleTagStart broadcast_thinDatabase
module.exports.sendBroadcastThinDatabase = sendBroadcastThinDatabase = function (message, callback) {
    oracledb.getConnection(
        config.database,
        function (err, connection) {
            if (err) {
                callback(err);

                return;
            }

            connection.execute(
                'SELECT member_id ' +
                'FROM   dd_members',
                [],
                {
                    outFormat: oracledb.OBJECT
                },
                function (err, results) {
                    if (err) {
                        callback(err);

                        return;
                    }

                    var messageCount = 0,
                        sendIndividualMessage = function (member, asyncCallback) {
                            var userMessage = {
                                fromMemberId: message.fromMemberId,
                                toMemberId: member.MEMBER_ID,
                                subject: message.subject,
                                messageContents: message.messageContents
                            };

                            connection.execute('BEGIN dd_admin_pkg.send_message(:fromMemberId, :toMemberId, :subject, :messageContents); END;',
                                userMessage,
                                function (err) {
                                    if (err) {
                                        console.log('err', err);
                                        asyncCallback(err);

                                        return;
                                    }
                                    messageCount += 1;

                                    asyncCallback();
                                }
                            );
                        };

                    async.forEach(results.rows, sendIndividualMessage, function (err) {
                        if (err) {
                            callback(err);

                            return;
                        }

                        callback(null, messageCount);
                    });
                }
            );
        }
    );
};
//SampleTagEnd broadcast_thinDatabase

//SampleTagStart broadcast_thickDatabase
module.exports.sendBroadcastThickDatabase = sendBroadcastThickDatabase = function (message, callback) {
    oracledb.getConnection(
        config.database,
        function (err, connection) {
            if (err) {
                callback(err);

                return;
            }

            connection.execute('BEGIN dd_admin_pkg.broadcast_message(:fromMemberId, :subject, :messageContents); END;',
                message,
                function (err, results) {
                    if (err) {
                        callback(err);

                        return;
                    }

                    callback(null, null);
//TODO return message count
                }
            );
        }
    );
};
//SampleTagEnd broadcast_thickDatabase
