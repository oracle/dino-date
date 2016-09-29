'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'models/Message', 'alert',
    'ojs/ojknockout', 'ojs/ojbutton', 'ojs/ojinputtext'],
  function (oj, ko, $, Message, alert) {
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
            var messageCount = newMessage.attributes.messageCount;
            var exTime = Math.round(newMessage.attributes.executionTime * 1000) / 1000;
            var seconds = (exTime) % 60;
            var minutes = parseInt(seconds / 60, 10);

            alert('info',
              'Code Execution Time',
              (((minutes > 0) ? (minutes) + ' Min ' : '') + seconds + ' Sec'),
              5000);

            if (messageCount) {
              alert('info',
                'Messages Sent',
                messageCount,
                5000);
            }

            rootViewModel.router.go('home');
          }
          self.clearMessage();
        });
        return true;
      };
    }

    return new SendMessageViewModel();
  });
