'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'models/Member', 'alert', 'ojs/ojmodel'],
  function (oj, ko, Member, alert) {
    var rootViewModel = ko.dataFor(document.getElementById('mainContent'));

    var Members = oj.Collection.extend({
      url: "api/v1/members",
      model: Member,
      fetchSize: 100,
      //used to generate authentication and config headers
      customURL: rootViewModel.getHeaders,
      // The object returned from the server includes both the member records in the members.items array
      //  and the time the middle tier function took to execute,
      //  including any database calls, stored in members.executionTime.
      // The parse function modifes the returned object, extracting and returning the members array and
      //  logging the exection time to the console.
      parse: function (members) {
        var exTime = Math.round(members.executionTime * 1000) / 1000;
        var seconds = (exTime) % 60;
        var minutes = parseInt(seconds / 60, 10);
        alert('info', 'Code Execution Time', (((minutes > 0) ? (minutes) + ' Min ' : '') + seconds + ' Sec'), 3000);

        return members.items;
      }
    });

    return Members;
  }
);