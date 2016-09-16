'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'models/Message',
        'ojs/ojknockout', 'ojs/ojbutton', 'ojs/ojinputtext'],
  function (oj, ko, $, Message) {
    function SendMessageViewModel() {
      var self = this;
      var rootViewModel = ko.dataFor(document.getElementById('mainContent'));

      self.sendTo = ko.observable();
      self.subject = ko.observable();
      self.messageText = ko.observable();

      self.clearMessage = function (data, event) {
        self.sendTo({id: null, name: 'All', messageType: 'broadcast'});
        self.subject(null);
        self.messageText(null);
      };

      self.clearMessage();

      self.send = function (data, event) {
        var message = {
          "fromMemberId": rootViewModel.currentUser().id,
          "toMemberId": self.sendTo().id,
          "subject": self.subject(),
          "messageContents": self.messageText(),
          "messageType": self.sendTo().messageType
        };

        var newMessage = new Message(message);

        newMessage.save().then(function () {
          //This module is used in multiple places, handle the post message action based on message type
          if (self.sendTo().messageType === 'single') {
            $('#sendDialog').ojDialog("close");
          } else if (self.sendTo().messageType === 'broadcast') {
            rootViewModel.router.go('home');
          }
        });
        return true;
      };
    }

    return new SendMessageViewModel();
  });
