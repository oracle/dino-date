/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
var oracledb = require('oracledb');

function getLocations(cb) {
  oracledb.getConnection(
    function (err, connection) {
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
        function (err, results) {
          connection.close(function (err) {
            if (err) {
              console.error(err.message);
            }
          });

          if (err) {
            cb(err);

            return;
          }

          cb(null, results.rows);
        }
      );
    }
  );
}

module.exports.getLocations = getLocations;