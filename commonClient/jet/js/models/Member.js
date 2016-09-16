'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojmodel'],
  function (oj, ko) {
    // Object used to access RootViewModel in main.js
    var rootViewModel = ko.dataFor(document.getElementById('mainContent'));

    var Member = oj.Model.extend({
      idAttribute: "memberId",
      urlRoot: "api/v1/members",
      //used to generate authentication and config headers
      customURL: rootViewModel.getHeaders
    });

    return Member;
  }
);