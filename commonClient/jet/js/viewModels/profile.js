'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'models/Member', 'viewModels/sendMessage',
    'ojs/ojknockout', 'ojs/ojdialog', 'ojs/ojbutton', 'ojs/ojmodel'],
  function (oj, ko, $, Member, SendMessageViewModel) {
    function ProfileViewModel() {
      var self = this;

      var rootViewModel = ko.dataFor(document.getElementById('mainContent'));

      self.currentMember = ko.observable({
        aboutYourself: null,
        city: null,
        country: null,
        id: null,
        locationName: null,
        name: null,
        postalCode: null,
        speciesName: null,
        state: null
      });

      self.getProfile = function (memberId) {
        self.member = new Member();

        self.member.urlRoot += '/' + memberId;

        self.member.fetch({
          success: function (model, response) {
            self.currentMember(model.attributes);
          }
        });
      };

      if (rootViewModel.currentUser()) {
        self.getProfile(rootViewModel.currentUser().id);
      }

      self.sendMessage = function () {
        $("#profileDialog").ojDialog("close");
        $("#sendDialog").ojDialog({
          "beforeOpen": function () {
            SendMessageViewModel.clearMessage;
            SendMessageViewModel.sendTo({
              id: self.currentMember().id,
              name: self.currentMember().name,
              messageType: 'single'
            });
          },
          "beforeClose": SendMessageViewModel.clearMessage
        });

        rootViewModel.viewProfileId(null);

        $("#sendDialog").ojDialog("open");

      };
    }

    return new ProfileViewModel();
  }
);