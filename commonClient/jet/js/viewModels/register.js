'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'ojs/ojdialog',
    'ojs/ojtoolbar', 'ojs/ojbutton', 'ojs/ojmenu', 'ojs/ojmodel'],
  function (oj, ko, $) {
    function RegisterViewModel() {
      var self = this;

      self.newMember = ko.observable({
        name: null,
        email: null,
        dinosaurId: null,
        locationId: null,
        aboutYourself: null
      });
      self.buttonClick = function (data, event) {
        self.clickedButton(event.currentTarget.id);
        register.attributes = {
          email: document.getElementById('email').value,
          password: document.getElementById('password').value
        };

        register.save().then(function () {
          var member = register.attributes.member;
          var userToken = register.attributes.token || member.id;

          var rootViewModel = ko.dataFor(document.getElementById('mainContent'));

          rootViewModel.currentUser(member);

          sessionStorage.setItem("currentUser", JSON.stringify(member));
          sessionStorage.setItem("userToken", userToken);

          rootViewModel.setNavMenu();

          $("#registerDialog").ojDialog("close");
        });

        register.attributes = {};
        return true;
      };
    }

    var Register = oj.Model.extend({
      urlRoot: "/api/v1/registers"
    });

    var register = new Register();

    return new RegisterViewModel();
  }
);