'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates.
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'viewModels/profile', 'viewModels/oracleInfo', 'ojs/ojknockout', 'ojs/ojdialog',
    'ojs/ojtoolbar', 'ojs/ojbutton', 'ojs/ojmenu', 'ojs/ojmodel', 'ojs/ojnavigationlist'],
  function (oj, ko, $, Profile) {
    /**
     * The view model for the header module
     */
    function HeaderViewModel() {
      var self = this;
      var rootViewModel = ko.dataFor(document.getElementById('mainContent'));

      // Application Name used in Branding Area
      self.appName = ko.observable("DinoDate");

      self.loginButtonMenu = ko.computed(function () {
        return rootViewModel.currentUser() ? '#menu1' : false;
      }, self);

      self.userLogin = ko.computed(function () {
        return rootViewModel.currentUser() ? rootViewModel.currentUser().name : 'Sign In / Register';
      }, self);

      // Media Queries for repsonsive header
      var smQuery = oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
      self.smScreen = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);

      self.logInRegister = function (event, ui) {
        if (!rootViewModel.currentUser()) {

          $("#loginDialog").ojDialog("open");
        }
      };

      var logOut = function () {
        $('#navMenu').ojNavigationList({"currentItem": 'home'});
        
        // Clear stored user data
        rootViewModel.currentUser(null);
        sessionStorage.removeItem("userToken");
        sessionStorage.removeItem("currentUser");

        // reset menu
        rootViewModel.setNavMenu();
      };


      // Dropdown menu states
      self.menuItemSelect = function (event, ui) {
        switch (ui.item.attr("id")) {
          case "about":
            rootViewModel.router.go('about');
            break;
          case "profile":
            Profile.getProfile(rootViewModel.currentUser().id);
            $('#navMenu').ojNavigationList('option', 'selection', null);
            rootViewModel.router.go('profile');
            break;
          case "out":
            logOut();
            break;
          default:
        }
      };
    }

    return new HeaderViewModel();
  }
);
