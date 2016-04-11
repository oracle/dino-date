/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/
var oracledb = require('oracledb');
var config = require(__dirname + '/../config.js');

function getDinosaurs(cb) {
    oracledb.getConnection(
        config.database,
        function(err, connection){
            if (err) {
                cb(err);

                return;
            }

            connection.execute(
                'select dinosaur_id as "dinosaurId", ' +
                '   species_name as "speciesName" ' +
                'from dd_dinosaurs ' +
                'order by species_name',
                {},//no binds
                {
                    outFormat: oracledb.OBJECT
                },
                function(err, results){
                    if (err) {
                        connection.release(function(err) {
                            if (err) {
                                console.error(err.message);
                            }
                        });

                        cb(err);

                        return;
                    }

                    cb(null, results.rows);

                    connection.release(function(err) {
                        if (err) {
                            console.error(err.message);
                        }
                    });
                }
            );
        }
    );
}

module.exports.getDinosaurs = getDinosaurs;