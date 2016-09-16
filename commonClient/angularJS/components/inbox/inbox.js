'use strict';
/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/

angular.module('dinoDateApp')

    .controller('InboxCtrl', function (API_URL, $stateParams, $http, $location, currentUser) {
        //set initial values
        var self = this;
        if (!localStorage.hasOwnProperty('broadcastType')) {
            localStorage.setItem("broadcastType", 'plsql');
        }
        this.user = currentUser.getUser();

        this.messageType = ($location.path() === '/broadcast') ? 'broadcast' : 'single';

        this.getMessage = function () {
            $http.get(API_URL + 'messages/' + $stateParams.messageId)
                .then(function success(res) {
                    self.message = res.data;
                }, function error(res) {
                    alert('danger', 'Messages Fetch Failed', res.error);
                });
        };

        this.getMessages = function () {
            var id = parseInt(this.user.id);
            if (id > -1) {
                $http.get(API_URL + 'members/' + this.user.id + '/messages')
                    .then(function success(res) {
                        self.messages = res.data.items;
                    }, function error(res) {
                        alert('danger', 'Messages Fetch Failed', res.error);
                    });
            }
        };

        this.broadcastType = localStorage.getItem("broadcastType") || 'plsql';

        this.setBroadcastType = function (broadcastType) {
            this.broadcastType = broadcastType;
            localStorage.setItem("broadcastType", this.broadcastType);
        };

        this.sendMessage = function () {
            var message={
                "subject": this.subject,
                "messageContents": this.messageContents,
                "messageType": this.messageType
            };

            if (this.messageType === 'single') {
                message.toMemberId = $stateParams.toMemberId;
            }
          
            $http.post(API_URL + 'messages', message);

            $location.path('home');
        };

        this.getToMemberName = function () {
            if (this.messageType === 'broadcast') {
                this.toMember = {name: 'Everyone'};
            } else {
                $http.get(API_URL + 'members/' + $stateParams.toMemberId + '/name')
                    .then(function success(res) {
                        self.toMember = {id: $stateParams.toMemberId, name: res.data.name};
                    }, function error(res) {
                        alert('danger', 'Messages Fetch Failed', res.error);
                    });
            }
        };
    });
