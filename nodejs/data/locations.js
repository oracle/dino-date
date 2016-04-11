/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/
var oracledb = require('oracledb');
var config = require(__dirname + '/../config.js');

function getLocations(cb) {
    oracledb.getConnection(
        config.database,
        function(err, connection){
            if (err) {
                cb(err);

                return;
            }

            connection.execute(
                'select location_id as "locationId", ' +
                '   location_name as "locationName" ' +
                'from dd_locations ' +
                'order by location_name',
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

module.exports.getLocations = getLocations;