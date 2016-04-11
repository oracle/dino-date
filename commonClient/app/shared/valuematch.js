'use strict';
/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/

angular.module('dinoDateApp')

  .directive('valueMatch', function () {
    return {
      require: 'ngModel',
      scope: {
        otherModelValue: '=valueMatch'
      },
      link: function(scope, element, attrs, ngModelCtrl) {
        ngModelCtrl.$validators.valueMatch = function(modelValue) {
          if (ngModelCtrl.$isEmpty(modelValue)) {
            return true;
          }

          return modelValue === scope.otherModelValue;
        };

        scope.$watch('otherModelValue', function(val) {
          ngModelCtrl.$validate();
        });
      }
    };
  });
