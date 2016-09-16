'use strict';
/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/

angular.module('dinoDateApp')

    .controller('SearchCtrl', function ($http, API_URL, currentUser, alert) {
        var self = this;
        var isAuthenticated = currentUser.isAuthenticated;

        this.maxDistance = 2000;

        this.getMembers = function (searchString, maxDistance) {
            if (isAuthenticated()) {
                var configObj = {
                    params: {
                        "searchString": searchString,
                        "limit": 100000
                    }
                };

                if (localStorage.getItem("searchType") === 'spatial') {
                    configObj.params.maxDistance = maxDistance;
                }

                $http.get(API_URL + 'members', configObj)
                    .then(function success(res) {
                        self.members = res.data.items;
                    }, function error(res) {
                        alert('danger', 'Member Fetch Failed', res.error);
                    });
            }


        };
    });
