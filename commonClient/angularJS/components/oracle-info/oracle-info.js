'use strict';
/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/

angular.module('dinoDateApp')

    .controller('OracleInfoCtrl', function ($state, $http, API_URL, oracleInfo) {
        var self = this;

        this.oracleInfo = oracleInfo;
        this.showCode = false;
        this.codeBtnLabel = 'Show';

        this.toggleCode = function(){
            self.showCode = !self.showCode;
            self.codeBtnLabel = (self.showCode)? 'Hide' : 'Show';
        };

        this.processTypes = {
            registration: [
                {
                    name: 'Middle Tier',
                    value: 'thinDatabase',
                    description: '<p>With Middle Tier processing, registrations are processed via ' +
                    'the following steps which are executed in sequence:</p>' +
                    '<ol>' +
                    '<li>A record is inserted into the users table</li>' +
                    '<li>The trilobitcoin payment is processed</li>' +
                    '<li>A welcome email is sent to the new user</li>' +
                    '</ol>' +
                    '<p>Each step requires a network round-trip from the application server to ' +
                    'the database.</p>'
                },
                {
                    name: 'Database',
                    value: 'thickDatabase',
                    description: '<p>Database processing improves performance by moving the steps necessary ' +
                    'to complete a registration to a stored procedure in the database. This makes it so that ' +
                    'only one round trip from the application server is required.</p>'
                },
                {
                    name: 'Database',
                    subText: ' using Advanced Queueing',
                    value: 'aq',
                    description: '<p>Advanced Queueing optimizes registrations even further by allowing steps that ' +
                    'require a lot of time to be done asynchronously via queues.</p>'
                }
            ],
            search: [
                {
                    name: 'Database',
                    subText: ' using Text Search',
                    value: 'text',
                    description: '<p>This search is preformed by a Database procedure inside the Database.</p>' +
                    '<p>This search takes advantage of <a href="http://docs.oracle.com/cd/B28359_01/text.111/b28303/query.htm" target="_blank">Oracle Text querying</a></p>' +
                    '<p>The query uses a CONTAINS operator against a CONTEXT index.' +
                    '<p>Notice that if you search for \'eat\', this type of search will return records containing the word \'eat\' but not records where eat is part of the word.</p>' +
                    '<p>For example Brandy\'s record contains \'eater\' but not \'eat\', so it will not be returned.'
                },
                {
                    name: 'Database',
                    subText: ' using Spatial',
                    value: 'spatial',
                    description: '<p>This search is preformed by a Database procedure inside the Database.</p>' +
                    '<p>This search takes advantage of <a href="http://docs.oracle.com/cd/B28359_01/text.111/b28303/query.htm" target="_blank">Oracle Text querying</a> and ' +
                    ' <a href="http://docs.oracle.com/cd/B28359_01/appdev.111/b28400/sdo_intro.htm" target="_blank">Spatial Concepts</a></p>' +
                    '<p>The query uses a CONTAINS operator against a CONTEXT index.' +
                    '<p>Notice that if you search for \'eat\' within a distance of 3000 Kilometers, the same records will be returned as with the Text search.' +
                    '<p>However, if you step the within distance down to 2000 Kilometers, Lina and Weili are not returned.'
                },
                {
                    name: 'Middle Tier',
                    value: 'thinDatabase',
                    description: '<p>This search is preformed at the application level.</p>' +
                    '<ol>' +
                    '<li>The first keyword is extracted.</li>' +
                    '<li>This keyword is wrapped with % wildcards.</li>' +
                    '<li>The about_yourself column is then seached using the LIKE operator with the keyword.</li>' +
                    '</ol>' +
                    '<p>Notice that if you search for \'eat\', this type of search will return not just records containing the word \'eat\' but also any record where eat is part of the word.</p>' +
                    '<p>For example Bob\'s record contains \'features\' but not \'eat\'.'
                }],
            broadcast: [
                {
                    name: 'Middle Tier',
                    value: 'thinDatabase',
                    description: '<p>With Middle Tier processing, the broadcast message steps are all processed in the application via ' +
                    'the following steps which are executed in sequence:</p>' +
                    '<ol>' +
                    '<li>The id is selected for all members</li>' +
                    '<li>The id collection is looped through and a message is sent to each member one at a time</li>' +
                    '</ol>' +
                    '<p>The query and each message sent requires a network round-trip from the application server to ' +
                    'the database.</p>'
                },
                {
                    name: 'Database',
                    value: 'thickDatabase',
                    description: '<p>The Database process preforms a bulk collect of the members, then loops through each member and inserts a message into their inbox.</p>' +
                    '<p>This could be sped up even more with an insert select statement.</p>'
                }]
        };

        this.getExampleCode = function (pType, index) {
            var processType = self.processTypes[pType][index];
            $http.get(API_URL + 'code/' + pType + '/' + processType.value)
                .then(function success(res) {
                    processType.code = res.data.code;
                }, function error(res) {
                    alert('danger', 'Code Fetch Failed', res.error);
                });
        };

        this.init = function (stateStr) {
            if (stateStr === 'registration' || stateStr === 'search' || stateStr === 'broadcast') {

                for (var pType in self.processTypes) {
                    if (self.processTypes.hasOwnProperty(pType)) {
                        for (var j = 0; j < self.processTypes[pType].length; j++) {
                            self.getExampleCode(pType, j);
                        }
                    }
                }

                self.currentTypes = self.processTypes[stateStr];
                self.currentType = self.currentTypes[0];
                var savedType = oracleInfo.getType(stateStr);
                if (savedType) {
                    for (var i = 0; i < self.currentTypes.length; i++) {
                        if (savedType === self.currentTypes[i].value) {
                            self.currentType = self.currentTypes[i];
                        }
                    }
                } else {
                    oracleInfo.setRegisterType(self.currentType.value, stateStr);
                }
                self.currentStateStr = stateStr;
            }
        };

        this.show = function () {
            var stateStr = $state.$current.toString();

            if (stateStr === 'registration' || stateStr === 'search' || stateStr === 'broadcast') {
                return true;
            } else {
                return false;
            }
        };
    })

    .factory('oracleInfo', function ($window) {
        var storage = $window.localStorage;
        var cachedTypes = {};
        var setRegisterType;
        var getType;

        setRegisterType = function (value, state) {
            cachedTypes[state] = value;
            storage.setItem((state + 'Type'), value);
        };

        getType = function (state) {
            if (!cachedTypes[state]) {
                cachedTypes[state] = storage.getItem(state + 'Type');
            }

            return cachedTypes[state];
        };

        return {
            setRegisterType: setRegisterType,
            getType: getType
        };
    })

    .factory('oracleInfoInterceptor', function ($window, $injector, oracleInfo, alert) {
        return {
            request: function (config) {
                var storage = $window.localStorage;
                var stateStr = $injector.get('$state').$current.toString();
                var userToken = storage.getItem('userToken');

                if (userToken) {
                    config.headers['userToken'] = userToken;
                }


                if (stateStr === 'registration' || stateStr === 'search' || stateStr === 'broadcast') {
                    config.headers['DD-Process-Type'] = oracleInfo.getType(stateStr);
                }

                return config;
            },
            response: function (response) {
                if (response.data.hasOwnProperty('executionTime')){
                  var exTime = Math.round(response.data.executionTime*1000)/1000;
                  var seconds = (exTime)%60;
                  var minutes = parseInt(seconds/60, 10);
                  alert('info', 'Code Execution Time', ((minutes > 0)?(minutes) + ' Min ':'') + seconds + ' Sec', 10000);
                }
                return response;
            }
        };
    })

    .directive('ddOracleInfo', function ($state) {
        var linker,
            elementMap;

        linker = function (scope, element, attrs) {
            scope.$watch(function () {
                    return $state.$current.toString();
                },
                function (newValue, oldValue) {
                    scope.OracleInfoCtrl.init(newValue);
                }
            );

            /*elementMap = {
             $windowWrapped: angular.element($window)
             };

             scope.$watch('formDesignerService.workingArea', function(value) {
             var tab = _.find(scope.tabs, {title: value});

             if (tab) {
             tab.active = true;
             }
             });*/
        };

        return {
            restrict: 'EA',
            link: linker,
            templateUrl: 'components/oracle-info/oracle-info.html',
            controller: 'OracleInfoCtrl as OracleInfoCtrl'
        };
    })

;
