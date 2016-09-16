'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojmodel'],
  function (oj, ko) {
    var rootViewModel = ko.dataFor(document.getElementById('mainContent'));

    var Message = oj.Model.extend({
      idAttribute: "messageId",
      //used to generate authentication and config headers
      customURL: rootViewModel.getHeaders,
      urlRoot: "api/v1/messages",
      parseSave: function (message) {
        return message;
      }
    });

    return Message;
  }
);