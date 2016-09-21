'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates.
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'jquery'],
  function (oj, ko, $) {
    return function (type, title, message, timeout) {
      var self = this;
      var rootViewModel = ko.dataFor(document.getElementById('mainContent'));

      var newIndex = rootViewModel.alerts.push({
          hasBeenShown: ko.observable(false),
          show: ko.observable(true),
          type: 'alert animated alert-' + type,
          message: message,
          title: title
        }) - 1;

      clearTimeout(rootViewModel.alerts()[newIndex].alertTimeout);

      rootViewModel.alerts()[newIndex].alertTimeout = setTimeout(function () {
        rootViewModel.alerts()[newIndex].show(false);
        setTimeout(function () {
          rootViewModel.alerts()[newIndex].hasBeenShown(true);
        }, 1000);
      }, timeout || 3000);
    };
  }
);