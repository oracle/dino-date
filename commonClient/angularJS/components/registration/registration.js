'use strict';
/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/

angular.module('dinoDateApp')

  .controller('RegistrationCtrl', function($scope, $state, alert, auth, currentUser, species, locations) {
    var RegistrationCtrl = this;

    if (currentUser.isAuthenticated()) {
      $state.go('memberHome');
      alert('success', 'Already Registered', 'You\'ve already registered!');
    }

    this.user = {};
    this.species = species;
    this.locations = locations;

    this.showError = function(name) {
      var formField = $scope.registrationForm[name];

      return ($scope.registrationForm.submitted && formField.$invalid) || (formField.$dirty && formField.$invalid);
    };

    this.register = function() {
      var startTime = Date.now();

      if ($scope.registrationForm.$valid) {
        auth.register({
          email: RegistrationCtrl.user.email,
          name: RegistrationCtrl.user.name,
          password: RegistrationCtrl.user.password,
          dinosaurId: RegistrationCtrl.user.species.dinosaurId,
          locationId: RegistrationCtrl.user.location.locationId,
          aboutYourself: RegistrationCtrl.user.aboutYourself,
          trilobitcoinNumber: RegistrationCtrl.user.trilobitcoinNumber,
          amount: 100
        })
          .success(function(res) {
            alert('success', 'Registration Succeeded', 'Welcome to the community ' + currentUser.getUser().name + '!');
          })
          .error(function(err) {
            alert('danger', 'Registration Failed', err.error);
          });
      } else {
        $scope.registrationForm.submitted = true;
      }
    };
  })

;