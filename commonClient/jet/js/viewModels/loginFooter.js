'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout'],
  function (oj, ko) {
    /**
     * The view model for the footer module
     */
    function FooterViewModel() {
      var self = this;

      self.goRegistration = function () {
        var rootViewModel = ko.dataFor(document.getElementById('mainContent'));

        rootViewModel.router.go('registration');

        $("#loginDialog").ojDialog("close");
      };
    }

    return new FooterViewModel();
  }
);
