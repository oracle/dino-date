'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'models/Member', 'ddData', 'ojs/ojdialog',
    'ojs/ojtoolbar', 'ojs/ojbutton', 'ojs/ojcomponents', 'ojs/ojmenu', 'ojs/ojmodel', 'ojs/ojselectcombobox'],
  function (oj, ko, $, Member, ddData) {
    function RegisterViewModel() {
      var self = this;

      self.newMember = ko.observable();

      self.species = ko.observableArray();
      self.speciesKeysVal = ko.observableArray();

      self.locations = ko.observableArray();
      self.locationKeysVal = ko.observableArray();

      // Used to initialize and reset the observable objects
      var init = function() {
        self.newMember({
          name: null,
          email: null,
          aboutYourself: null,
          trilobitcoinNumber: null
        });

        // Used for species options
        self.species(ddData.species);
        // Used for species value.  The value of an ojSelect is an array.
        self.speciesKeysVal([self.species()[0].dinosaurId]);

        // Used for location options
        self.locations(ddData.locations);
        // Used for location value.  The value of an ojSelect is an array.
        self.locationKeysVal([self.locations()[0].locationId]);
      };

      //initialize the data
      init();

      self.registerMember = function (data, event) {
        var member = new Member();
        
        member.attributes = self.newMember();
        //get the values of the observableArray objects
        member.attributes.dinosaurId = self.speciesKeysVal()[0];
        member.attributes.locationId = self.locationKeysVal()[0];

        member.save().then(function () {
          //Log in as the new user
          var retMember = member.attributes.member;
          var userToken = member.attributes.token || retMember.memberId;

          var rootViewModel = ko.dataFor(document.getElementById('mainContent'));

          rootViewModel.currentUser(retMember);

          sessionStorage.setItem("currentUser", JSON.stringify(retMember));
          sessionStorage.setItem("userToken", userToken);

          //reset the data
          init();

          rootViewModel.router.go('home');
          rootViewModel.setNavMenu();
        });


        return true;
      };
    }

    return new RegisterViewModel();
  }
);