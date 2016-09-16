'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'ojs/ojselectcombobox',
    'ojs/ojbutton', 'ojs/ojmodel', 'ojs/ojdialog'],
  function (oj, ko, $) {
    function ControlPanelViewModel() {
      var self = this;

      self.generateAmount = ko.observableArray(["0"]);

      // Used to lock processes until the current one is finished
      self.working = ko.observable(false);

      self.clickCss = ko.computed(function () {
        var retCss = "fa fa-2x fa-magic";
        if (self.working()) {
          retCss += " fa-spin";
        }
        return retCss;
      });

      self.headerText = ko.observable();
      self.bodyText = ko.observable();

      self.generateMembers = function (data, event) {

        if (!self.working() && self.generateAmount()[0] > 0) {
          self.working(true);

          var Generator = oj.Model.extend({
            customURL: rootViewModel.getHeaders,
            urlRoot: "api/v1/members/generate",
            parseSave: function (stuff) {
              return stuff;
            }
          });

          var generator = new Generator();

          generator.save({"amount": self.generateAmount()[0]}, {
            success: function (myModel, res, options) {
              if (res.newMembers > 0) {
                self.headerText('Members Generated');
                self.bodyText(res.newMembers + ((res.newMembers < self.generateAmount()[0]) ? " (Maximum members reached)" : " "));
              } else {
                self.headerText('No Members Generated');
                self.bodyText('You may already have the maximum members.');
              }

              $("#generatResults").ojDialog("open");

            },
            error: function (jqXHR, textStatus, errorThrown) {
              self.headerText('Generation Failed');
              self.bodyText(textStatus);
            }
          }).then(function () {
            self.generateAmount(["0"]);
            self.working(false);
          });

          return true;
        }
      };

      self.resetMembers = function (data, event) {

        if (!self.working()) {
          self.working(true);

          // Above we used a standard model approach
          // Here we are using jquery to delete all members
          // Backbone deletes by id, without an id it wont send the delete command
          // When deleting records it's proper to use the DELETE verb.
          $.ajax({
            type: "DELETE",
            url: "api/v1/members/reset",
            success: function (res) {
              if (res.deletedMembers > 0) {
                self.headerText('Members Deleted');
                self.bodyText(res.deletedMembers);
              } else {
                self.headerText('No Members Deleted');
              }

              $("#generatResults").ojDialog("open");

            },
            failure: function (jqXHR, textStatus, errorThrown) {
              self.headerText('Deletion Failed');
              self.bodyText(textStatus);
            }
          }).then(function () {
            self.working(false);
          });

          return true;
        }
      };
    }

    var rootViewModel = ko.dataFor(document.getElementById('mainContent'));

    return new ControlPanelViewModel();
  }
);