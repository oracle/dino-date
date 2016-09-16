'use strict';
/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/

angular.module('dinoDateApp')
  .service('alert', function ($rootScope, $timeout) {
    var alertTimeout;

    return function(type, title, message, timeout) {
      $rootScope.alerts = $rootScope.alerts || [];

      var newIndex = $rootScope.alerts.push({
        hasBeenShown: false,
        show: true,
        type: type,
        message: message,
        title: title
      }) - 1;

      $timeout.cancel($rootScope.alerts[newIndex].alertTimeout);

      $rootScope.alerts[newIndex].alertTimeout = $timeout(function() {
              $rootScope.alerts[newIndex].show = false;
              $timeout(function() {
                      $rootScope.alerts[newIndex].hasBeenShown = true;
              }, 1000);
            }, timeout || 3000);
    };
  });
