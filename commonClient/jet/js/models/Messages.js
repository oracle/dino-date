'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'models/Message', 'ojs/ojmodel'],
  function (oj, ko, Message) {
    var rootViewModel = ko.dataFor(document.getElementById('mainContent'));

    var Messages = oj.Collection.extend({
      //used to generate authentication and config headers
      customURL: rootViewModel.getHeaders,
      url: "api/v1/members/" + rootViewModel.currentUser().id + "/messages",
      // fetchSize: 10,
      model: Message
    });

    return Messages;
  }
);