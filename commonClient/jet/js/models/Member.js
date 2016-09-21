'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'alert', 'ojs/ojmodel'],
  function (oj, ko, alert) {
    // Object used to access RootViewModel in main.js
    var rootViewModel = ko.dataFor(document.getElementById('mainContent'));

    var Member = oj.Model.extend({
      idAttribute: "memberId",
      urlRoot: "api/v1/members",
      //used to generate authentication and config headers
      customURL: rootViewModel.getHeaders,
      // The object returned from the server includes both the member record in the members.items array
      //  and the time the middle tier function took to execute,
      //  including any database calls, stored in members.executionTime.
      // The parse function modifes the returned object, extracting and returning the members array and
      //  logging the exection time to the console.
      parse: function (member) {
        if (member.hasOwnProperty('executionTime')) {
          var exTime = Math.round(member.executionTime * 1000) / 1000;
          var seconds = (exTime) % 60;
          var minutes = parseInt(seconds / 60, 10);
          alert('info', 'Code Execution Time', (((minutes > 0) ? (minutes) + ' Min ' : '') + seconds + ' Sec'), 3000);
        }

        return member;
      }
    });

    return Member;
  }
);