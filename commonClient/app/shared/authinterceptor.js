'use strict';
/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/

angular.module('dinoDateApp')
  .factory('authInterceptor', function ($q, $injector, alert) {
    return {
      request: function(config) {
        var token = $injector.get('currentUser').getToken();

        if (token) {
          config.headers.Authorization = 'Bearer ' + token;
        }

        return config;
      },
      response: function(response) {
        return response;
      },
      responseError: function(rejection) {
        if (rejection.data && rejection.data.message === 'Token Expired') {
          alert('danger', 'Session Expired', 'You must login again.', 0);
          $injector.get('$state').go('sessionExpired');
        }

        return $q.reject(rejection);
      }
    };
  });
