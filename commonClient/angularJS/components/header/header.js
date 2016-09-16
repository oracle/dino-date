'use strict';
/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/

angular.module('dinoDateApp')

    .controller('HeaderCtrl', function (currentUser) {
        this.getUser = currentUser.getUser;
        this.isAuthenticated = currentUser.isAuthenticated;
        this.isAdmin = function () {
            var user = this.getUser();
            return !!(user && user.id === 0);
        };
    })

    .directive('ddHeader', function () {
        return {
            restrict: 'E',
            templateUrl: 'components/header/header.html',
            controller: 'HeaderCtrl as HeaderCtrl'
        };
    })

;
