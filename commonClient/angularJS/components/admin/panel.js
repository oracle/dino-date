'use strict';
/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/

angular.module('dinoDateApp')

  .controller('PanelCtrl', function($http, $state, API_URL, alert, auth, currentUser) {
    var self = this;
    this.generateAmount = "0";

    this.user = {};

    // this.showError = function(name) {
    //   var formField = self.registrationForm[name];
    //
    //   return (self.registrationForm.submitted && formField.$invalid) || (formField.$dirty && formField.$invalid);
    // };

    this.generating = false;

    this.generateMembers = function() {
      if (!self.generating && self.generateAmount > 0) {
        self.generating = true;
        $http.post(API_URL + 'members/generate', {"amount": self.generateAmount})
          .success(function(res) {
            if (res.newMembers > 0){
              alert('success', 'Members Generated', ': ' + res.newMembers + ((res.newMembers < self.generateAmount)? " (Maximum members reached)" : " "), 10000);
            } else {
              alert('info', 'No Members Generated', 'You may already have the maximum members.', 10000);
            }
            self.generating = false;
          })
          .error(function(err) {
            alert('danger', 'Member Generation Failed', err.error);
          });
      // } else {
      //   self.registrationForm.submitted = true;
      }
    };
  })

;
