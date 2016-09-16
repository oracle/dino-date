'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'ojs/ojbutton'],
  function (oj, ko, $) {
    /**
     * The view model for the main content view template
     */
    function HomeContentViewModel() {
      var self = this;
      var rootViewModel = ko.dataFor(document.getElementById('mainContent'));

      self.getStarted = function (data, event) {
        console.log('in');
        if (rootViewModel.currentUser()) {
          rootViewModel.router.go('search');
        } else {
          rootViewModel.router.go('register');
        }
      };
    }

    return new HomeContentViewModel();
  });
