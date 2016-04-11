'use strict';
/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/

angular.module('dinoDateApp')

  .controller('MemberHomeCtrl', function (currentUser) {
    this.user = currentUser.getUser() || {};
    this.val = {};
    this.func = function() {};
  });
