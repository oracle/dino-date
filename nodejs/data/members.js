/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
var oracledb = require('oracledb');
var async = require('async');

//SampleTagStart registration_thinDatabase
module.exports.registerMemberThinDatabase = registerMemberThinDatabase = function (member, callback) {
  oracledb.getConnection(
    function (err, connection) {
      if (err) {
        callback(err);

        return;
      }

      async.series(
        [
          function (cb) {
            connection.execute(
              'insert into dd_members ( ' +
              '  email, ' +
              '  dinosaur_id, ' +
              '  location_id, ' +
              '  dino_name, ' +
              '  about_yourself, ' +
              '  subscription_status ' +
              ') values ( ' +
              '  :email, ' +
              '  :dinosaur_id, ' +
              '  :location_id, ' +
              '  :dino_name, ' +
              '  :about_yourself, ' +
              '  \'P\'' +
              ') returning member_id ' +
              'into :member_id',
              {
                email: member.email,
                dinosaur_id: member.dinosaurId,
                location_id: member.locationId,
                dino_name: member.name,
                about_yourself: member.aboutYourself,
                member_id: {
                  type: oracledb.NUMBER,
                  dir: oracledb.BIND_OUT
                }
              },
              {
                outFormat: oracledb.OBJECT
              },
              function (err, results) {
                if (err) {
                  cb(err);

                  return;
                }

                member.id = results.outBinds.member_id[0];

                cb(null);
              }
            );
          },
          function (cb) {
            connection.execute(
              'BEGIN dd_process_tbc_payment(:member_id, :dino_name, :trilobitcoin_number, :amount); END;',
              {
                member_id: member.id,
                dino_name: member.name,
                trilobitcoin_number: member.trilobitcoinNumber,
                amount: member.amount
              },
              function (err) {
                if (err) {
                  cb(err);

                  return;
                }

                cb(null);
              }
            );
          },
          function (cb) {
            connection.execute(
              'BEGIN dd_admin_pkg.send_message(:from_member_id, :to_member_id, :subject, :message_contents); END;',
              {
                from_member_id: 0,
                to_member_id: member.id,
                subject: 'Welcome to DinoDate',
                message_contents: 'When it comes to dinosaurs and love, DinoDate is the place to be!'
              },
              function (err) {
                if (err) {
                  cb(err);

                  return;
                }

                cb(null);
              }
            );
          }
        ],
        function (err) {
          connection.close(function (err) {
            if (err) {
              console.error(err.message);
            }
          });

          if (err) {
            callback(err);
          } else {
            getMember({id: member.id}, callback);
          }
        }
      );
    }
  );
};
//SampleTagEnd registration_thinDatabase

//SampleTagStart registration_thickDatabase
module.exports.registerMemberThickDatabase = registerMemberThickDatabase = function (member, callback) {
  oracledb.getConnection(
    function (err, connection) {
      if (err) {
        callback(err);

        return;
      }

      connection.execute(
        'BEGIN :member_id := dd_payment_pkg.process_registration(:email, :dino_name, :password, :dinosaur_id, :location_id, :about_yourself, :trilobitcoin_number, :amount); END;',
        {
          member_id: {
            type: oracledb.NUMBER,
            dir: oracledb.BIND_OUT
          },
          email: member.email,
          dino_name: member.name,
          password: member.password,
          dinosaur_id: member.dinosaurId,
          location_id: member.locationId,
          about_yourself: member.aboutYourself,
          trilobitcoin_number: member.trilobitcoinNumber,
          amount: member.amount
        },
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
            callback(err);
          } else {
            getMember({id: results.outBinds.member_id}, callback);
          }
        }
      );
    }
  );
};
//SampleTagEnd registration_thickDatabase

//SampleTagStart registration_aq
module.exports.registerMemberAq = registerMemberAq = function (member, callback) {
  oracledb.getConnection(
    function (err, connection) {
      if (err) {
        callback(err);

        return;
      }

      connection.execute(
        'BEGIN :member_id := dd_payment_pkg.process_registration_aq(:email, :dino_name, :password, :dinosaur_id, :location_id, :about_yourself, :trilobitcoin_number, :amount); END;',
        {
          member_id: {
            type: oracledb.NUMBER,
            dir: oracledb.BIND_OUT
          },
          email: member.email,
          dino_name: member.name,
          password: member.password,
          dinosaur_id: member.dinosaurId,
          location_id: member.locationId,
          about_yourself: member.aboutYourself,
          trilobitcoin_number: member.trilobitcoinNumber,
          amount: member.amount
        },
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
            callback(err);
          } else {
            getMember({id: results.outBinds.member_id}, callback);
          }
        }
      );
    }
  );
};
//SampleTagEnd registration_aq

module.exports.getMember = getMember = function (filter, callback) {
  var binds = {};
  var whereClause;

  if (filter.id) {
    binds.member_id = filter.id;
    whereClause = 'WHERE mem.member_id = :member_id';
  } else if (filter.email) {
    binds.email = filter.email;
    whereClause = 'WHERE mem.email = :email';
  } else {
    throw new Error('Invalid search filter');
  }

  oracledb.getConnection(
    function (err, connection) {
      if (err) {
        callback(err);

        return;
      }

      connection.execute(
        'SELECT member_id as "id", ' +
        '  dino_name as "name", ' +
        '  location_name as "locationName", ' +
        '  city as "city", ' +
        '  state as "state", ' +
        '  postal_code as "postalCode", ' +
        '  country as "country", ' +
        '  species_name as "speciesName", ' +
        '  dbms_lob.substr(about_yourself, 4000) as "aboutYourself" ' +
        'FROM dd_members mem ' +
        'JOIN dd_locations loc ' +
        '   ON mem.location_id = loc.location_id ' +
        'JOIN dd_dinosaurs din ' +
        '   ON mem.dinosaur_id = din.dinosaur_id ' +
        whereClause,
        binds,
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
            callback(err);

            return;
          }

          callback(null, results.rows[0]);
        }
      );
    }
  );
};

//SampleTagStart search_thinDatabase
module.exports.getMembersThinDatabase = getMembersThinDatabase = function (filter, callback) {
  var binds = {};

  if (filter.hasOwnProperty('limit')) {
    oracledb.maxRows = parseInt(filter.limit);
  }

  if (filter.hasOwnProperty('memberId')) {
    binds.memberId = filter.memberId;
  }

  if (filter.hasOwnProperty('searchString')) {
    binds.keywords = '%' + filter.searchString + '%';
  } else {
    throw new Error('Invalid search filter');
  }

  binds.offset = filter.offset || 0;
  binds.limit = filter.limit || 100;

  oracledb.getConnection(
    function (err, connection) {
      if (err) {
        callback(err);

        return;
      }

      connection.execute(
        'SELECT member_id as "memberId", dino_name as "name" ' +
        'FROM   dd_members ' +
        'WHERE  member_id != :memberId ' +
        'AND  about_yourself LIKE :keywords ' +
        'AND  member_id > 0 ' +
        'ORDER BY dino_name ' +
        'OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY',
        binds,
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
            callback(err);

            return;
          }

          callback(null, results.rows);
        }
      );
    }
  );
};
//SampleTagEnd search_thinDatabase

//SampleTagStart search_text
module.exports.getMembersText = getMembersText = function (filter, callback) {
  var binds = {};

  if (filter.hasOwnProperty('memberId')) {
    binds.memberId = filter.memberId;
  }

  if (filter.hasOwnProperty('searchString')) {
    binds.keywords = filter.searchString;
  } else {
    throw new Error('Invalid search filter');
  }

  binds.offset = filter.offset || 0;
  binds.limit = filter.limit || 100;

  oracledb.getConnection(
    function (err, connection) {
      if (err) {
        callback(err);

        return;
      }

      connection.execute(
        'SELECT member_id as "memberId", dino_name as "name" ' +
        'FROM  TABLE(dd_search_pkg.text_only(:memberId, :keywords)) ' +
        'ORDER BY dino_name ' +
        'OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY',
        binds,
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
            callback(err);

            return;
          }

          callback(null, results.rows);
        }
      );
    }
  );
};
//SampleTagEnd search_text

//SampleTagStart search_spatial
module.exports.getMembersSpatial = getMembersSpatial = function (filter, callback) {
  var binds = {};

  if (filter.hasOwnProperty('limit')) {
    oracledb.maxRows = parseInt(filter.limit);
  }

  if (filter.hasOwnProperty('memberId')) {
    binds.memberId = filter.memberId;
  }

  if (filter.hasOwnProperty('searchString')) {
    binds.keywords = filter.searchString;
  } else {
    throw new Error('Invalid search filter');
  }

  if (filter.hasOwnProperty('maxDistance')) {
    binds.maxDistance = filter.maxDistance;
  }

  binds.offset = filter.offset || 0;
  binds.limit = filter.limit || 100;

  oracledb.getConnection(
    function (err, connection) {
      if (err) {
        callback(err);

        return;
      }
      console.log(binds);
      connection.execute(
        'SELECT member_id as "memberId", dino_name as "name" ' +
        'FROM  TABLE(dd_search_pkg.text_and_spatial(:memberId, :keywords, :maxDistance)) ' +
        'ORDER BY dino_name ' +
        'OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY',
        binds,
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
            callback(err);

            return;
          }

          callback(null, results.rows);
        }
      );
    }
  );
};
//SampleTagEnd search_spatial

module.exports.processLogin = processLogin = function (username, password, callback) {
  oracledb.getConnection(
    function (err, connection) {
      if (err) {
        callback(err);

        return;
      }

      connection.execute(
        'SELECT member_id as "memberId", ' +
        '  dino_name as "dinoName", ' +
        '  location_name as "locationName", ' +
        '  city as "city", ' +
        '  state as "state", ' +
        '  postal_code as "postalCode", ' +
        '  country as "country", ' +
        '  species_name as "speciesName", ' +
        '  about_yourself as "aboutYourself" ' +
        'FROM dd_members mem' +
        'JOIN dd_locations loc' +
        '   ON mem.location_id = loc.location_id ' +
        'JOIN dd_dinosaurs din ' +
        '   ON mem.dinosaur_id = din.dinoasur_id' +
        'WHERE UPPER(mem.dino_name) = UPPER(:username)',
        {
          username: username
        },
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
            callback(err);

            return;
          }

          callback(null, results.rows[0]);
        }
      );
    }
  );
};

module.exports.getMemberMessages = getMemberMessages = function (filter, callback) {
  var binds = {
    toMemberId: filter.memberId,
    offset: filter.offset || 0,
    limit: filter.limit || 100
  };

  oracledb.getConnection(
    function (err, connection) {
      if (err) {
        callback(err);

        return;
      }

      connection.execute(
        'SELECT message_id, ' +
        'from_member_id, ' +
        'dino_name, ' +
        'subject, ' +
        'dbms_lob.substr(message_contents, 4000, 1 ) ' +
        'FROM   dd_messages, dd_members ' +
        'WHERE  to_member_id = :toMemberId ' +
        '  AND  dd_messages.from_member_id = dd_members.member_id ' +
        'ORDER BY message_id ' +
        'OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY',
        binds,
        function (err, results) {
          connection.close(function (err) {
            if (err) {
              console.error(err.message);
            }
          });

          if (err) {
            callback(err);

            return;
          }
          callback(null, results.rows);
        }
      );
    }
  );
};

module.exports.getMemberName = getMemberName = function (member, callback) {
  oracledb.getConnection(
    function (err, connection) {
      if (err) {
        callback(err);

        return;
      }

      connection.execute(
        'SELECT member_id, ' +
        'dino_name ' +
        'FROM   dd_members ' +
        'WHERE  member_id = :member_id',
        {
          member_id: member.id
        },
        function (err, results) {
          connection.close(function (err) {
            if (err) {
              console.error(err.message);
            }
          });

          if (err) {
            callback(err);

            return;
          }
          callback(null, results.rows[0]);
        }
      );
    }
  );
};

module.exports.getMessage = getMemberStatus = function (member, callback) {
  oracledb.getConnection(
    function (err, connection) {
      if (err) {
        callback(err);

        return;
      }

      connection.execute(
        "SELECT DECODE(subscription_status," +
        "'I', 'Invalid'," +
        "'V', 'Valid'," +
        "'P', 'Payment Pending'," +
        "'E', 'Expiring soon'," +
        "'Unknown') subscription_status " +
        "FROM   dd_members " +
        "WHERE  member_id = :member_id",
        {
          member_id: member.id
        },
        function (err, results) {
          connection.close(function (err) {
            if (err) {
              console.error(err.message);
            }
          });

          if (err) {
            callback(err);

            return;
          }
          callback(null, results.rows[0]);
        }
      );
    }
  );
};

module.exports.generateMembers = generateMembers = function (amount, callback) {
  oracledb.getConnection(
    function (err, connection) {
      if (err) {
        callback(err);

        return;
      }

      connection.execute(
        'BEGIN :newMembers := dd_admin_pkg.generate_members(:amount); END;',
        {
          newMembers: {
            type: oracledb.NUMBER,
            dir: oracledb.BIND_OUT
          },
          amount: parseInt(amount)
        },
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
            callback(err);
          } else {
            callback(null, results.outBinds.newMembers);
          }
        }
      );
    }
  );
};