'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'ojs/ojdialog',
    'ojs/ojtoolbar', 'ojs/ojbutton', 'ojs/ojmenu', 'ojs/ojmodel'],
  function (oj, ko, $) {
    function LoginViewModel() {
      var self = this;

      self.signIn = function (data, event) {
        login.attributes = {
          email: document.getElementById('email').value,
          password: document.getElementById('password').value
        };

        login.save().then(function () {
          var member = login.attributes.member;
          var userToken = login.attributes.token || member.id;

          var rootViewModel = ko.dataFor(document.getElementById('mainContent'));

          rootViewModel.currentUser(member);

          sessionStorage.setItem("currentUser", JSON.stringify(member));
          sessionStorage.setItem("userToken", userToken);

          rootViewModel.setNavMenu();

          $("#loginDialog").ojDialog("close");
        });

        login.attributes = {};
        return true;
      };
    }

    var Login = oj.Model.extend({
      urlRoot: "/api/v1/logins"
    });

    var login = new Login();

    return new LoginViewModel();
  }
);