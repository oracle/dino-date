'use strict';
/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/

angular.module('dinoDateApp')

  .factory('currentUser', function ($window, $http, API_URL, alert) {
    var storage = $window.localStorage;
    var userTokenKey = 'userToken';
    var memberIdKey = 'memberId';
    var cachedUser;
    var cachedToken;
    var set;
    var getUser;
    var getToken;
    var isAuthenticated;
    var clear;
    var init;

    set = function(user, token) {
      cachedUser = user;
      storage.setItem(memberIdKey, user.id);

      cachedToken = token;
      storage.setItem(userTokenKey, token);
    };

    getUser = function() {
      return cachedUser;
    };

    getToken = function() {
      if (!cachedToken) {
        cachedToken = storage.getItem(userTokenKey);
      }

      return cachedToken;
    };

    isAuthenticated = function() {
      return !!getToken();
    };

    clear = function() {
      cachedUser = null;
      storage.removeItem(memberIdKey);

      cachedToken = null;
      storage.removeItem(userTokenKey);
    };

    init = function() {
      var memberId;

      if (isAuthenticated()) {
        memberId = storage.getItem(memberIdKey);

        $http.get(API_URL + 'members/' + memberId)
          .then(function success(res) {
            cachedUser = res.data;
          }, function error(res) {
            alert('danger', 'Member Fetch Failed', res.error);
          });
      }
    };

    init();

    return {
      set: set,
      getUser: getUser,
      getToken: getToken,
      isAuthenticated: isAuthenticated,
      clear: clear
    };
  })

;