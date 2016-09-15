/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
var oracledb = require('oracledb');

function getDinosaurs(cb) {
  oracledb.getConnection(
    function (err, connection) {
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

module.exports.getDinosaurs = getDinosaurs;