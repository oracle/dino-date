'use strict';
/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/

angular.module('dinoDateApp')

  .controller('LoginCtrl', function ($scope, alert, auth, currentUser) {
    $scope.user = {};

    $scope.showError = function(name) {
      var formField = $scope.loginForm[name];
      return ($scope.loginForm.submitted && formField.$invalid) || (formField.$dirty && formField.$invalid);
    };

    $scope.login = function() {
      if ($scope.loginForm.$valid) {
        auth.login($scope.user.email, $scope.user.password)
          .success(function(res) {
            alert('success', 'Login Succeeded', 'Welcome back ' + currentUser.getUser().name + '!');
          })
          .error(function(err) {
            alert('danger', 'Login Failed', err.message);
          });
      } else {
        $scope.loginForm.submitted = true;
      }
    };
  });
