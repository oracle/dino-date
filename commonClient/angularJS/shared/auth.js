'use strict';
/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/

angular.module('dinoDateApp')
  .factory('auth', function ($http, $state, API_URL, currentUser) {
    var authSuccessful = function(res) {
      currentUser.set(res.member, res.token);

      $state.go('memberHome');
    };

    return {
      login: function (email, password) {
        return $http.post(API_URL + 'logins', {
          email: email,
          password: password
        })
          .success(authSuccessful);
      },
      register: function (user) {
        return $http.post(API_URL + 'members', user)
          .success(authSuccessful);
      }
    };
  });
