'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */

define(['ojs/ojcore', 'knockout', 'jquery', 'models/Messages', 'viewModels/sendMessage',
    'ojs/ojknockout', 'promise', 'ojs/ojtable', 'ojs/ojarraytabledatasource', 'ojs/ojcollectiontabledatasource',
    'ojs/ojpagingcontrol', 'ojs/ojpagingtabledatasource', 'ojs/ojdialog'],
  function (oj, ko, $, Messages, SendMessageViewModel) {
    function InboxViewModel() {
      var self = this;

      // Initializing object to null in order to prevent errors in the HTML layer
      self.currentMessage = ko.observable({
        subject: null,
        name: null,
        fromMemberId: null,
        messageId: null,
        messageContents: null
      });

      var inboxMessagesColl = new Messages();

      var inboxMessagesCollectionDataSource = new oj.CollectionTableDataSource(inboxMessagesColl);


      self.inboxMessages = new oj.PagingTableDataSource(inboxMessagesCollectionDataSource);

      //See self.selectionListener in search.js for detailed explanation
      self.selectionListener = function (event, data) {
        if (data.option === 'currentRow' && data.value) {
          var newCurrentRow = data.value;

          self.inboxMessages.at(newCurrentRow['rowIndex']).then(function (rowObj) {
            self.currentMessage(rowObj['data']);
          });
        }

        if (data.option === 'selection' && self.currentMessage()) {
          // Second click on a row will un-select it
          // overriding the unselect to allow the user to re-open the same message
          // while keeping it highlighted
          if (data.value === null) {
            var rowIndx = data.previousValue[0].startIndex.row;

            $("#messagesTable").ojTable("option", "selection", [{
              startIndex: {"row": rowIndx},
              endIndex: {"row": rowIndx}
            }]);
          } else {
            $("#messageDialog").ojDialog("open");
          }
        }
      };

      self.reply = function () {
        $("#messageDialog").ojDialog("close");
        $("#sendDialog").ojDialog({
          "beforeOpen": function () {
            SendMessageViewModel.clearMessage;
            SendMessageViewModel.sendTo({
              id: self.currentMessage().fromMemberId,
              name: self.currentMessage().name,
              messageType: 'single'
            });
          },
          "beforeClose": SendMessageViewModel.clearMessage
        });
        $("#sendDialog").ojDialog("open");
      }
    }

    return new InboxViewModel();
  });
