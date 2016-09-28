'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates.
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'alert', 'ojs/ojdialog',
    'ojs/ojbutton', 'ojs/ojselectcombobox'],
  function (oj, ko, $, alert) {
    function OracleInfoViewModel() {
      var self = this;

      var rootViewModel = ko.dataFor(document.getElementById('mainContent'));

      self.processTypes = {
        register: [
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

      var getProcessByValue = function (type, value) {
        var retProcess;

        if (self.processTypes.hasOwnProperty(type)) {
          self.processTypes[type].forEach(function (process) {
            if (value === process.value) {
              retProcess = process;
            }
          });
        } else {
          retProcess = {
            name: null,
            subText: null,
            value: null,
            description: null
          };
        }

        return retProcess;
      };

      self.stateStr = ko.computed(function () {
        return rootViewModel.router.stateId();
      });

      self.listVals = ko.observable();

      // self.currentProcess = ko.observable(getProcessByValue(self.stateStr(), rootViewModel.getProcessType(self.stateStr())));
      self.currentProcess = ko.observable(getProcessByValue(self.stateStr(), rootViewModel.getProcessType(self.stateStr())));

      self.show = ko.computed(function () {
        var showPanel = (self.stateStr() === 'register' || self.stateStr() === 'search' || self.stateStr() === 'broadcast');
        if (showPanel){
          self.currentProcess(getProcessByValue(self.stateStr(), rootViewModel.getProcessType(self.stateStr())));
          self.listVals(self.processTypes[self.stateStr()]);
          $( "#processTypeMenu" ).ojMenu( "refresh" );
        }
        return showPanel;
      });

      self.exampleCode = ko.observable();

      var getExampleCode = function () {
        self.exampleCode(null);
        //TODO refactor register to be registration
        var pType = (self.stateStr()==='register')?'registration': self.stateStr();
        $.get('api/v1/code/' + pType + '/' + self.currentProcess().value)
          .then(function success(res) {
            self.exampleCode(res.code);
          }, function error(res) {
            alert('danger', 'Code Fetch Failed', res.error);
          });
      };

      self.setProcessType = function (event, ui) {
        var pType = self.stateStr();
        self.currentProcess(self.processTypes[pType][ui.item.attr("index")]);
        rootViewModel.setProcessType(self.currentProcess().value, pType);
        getExampleCode();
      };

      self.showDescription = function (event, ui) {
        $("#processDialog").ojDialog("open");
      };


      self.showCode = function (event, ui) {
        if (!self.exampleCode()){
          getExampleCode();
        }
        $("#codeDialog").ojDialog("open");
      };

      // self.getExampleCode = function (pType, index) {
      //   var processType = self.processTypes[pType][index];
      //   $http.get(API_URL + 'code/' + pType + '/' + processType.value)
      //     .then(function success(res) {
      //       processType.code = res.data.code;
      //     }, function error(res) {
      //       alert('danger', 'Code Fetch Failed', res.error);
      //     });
      // };
      //
      // self.init = function (stateStr) {
      //   if (stateStr === 'register' || stateStr === 'search' || stateStr === 'broadcast') {
      //
      //     for (var pType in self.processTypes) {
      //       if (self.processTypes.hasOwnProperty(pType)) {
      //         for (var j = 0; j < self.processTypes[pType].length; j++) {
      //           self.getExampleCode(pType, j);
      //         }
      //       }
      //     }
      //
      //     self.currentTypes = self.processTypes[stateStr];
      //     self.currentType = self.currentTypes[0];
      //     var savedType = rootViewModel.getProcessType(stateStr);
      //     if (savedType) {
      //       for (var i = 0; i < self.currentTypes.length; i++) {
      //         if (savedType === self.currentTypes[i].value) {
      //           self.currentType = self.currentTypes[i];
      //         }
      //       }
      //     } else {
      //       rootViewModel.setProcessType(self.currentType.value, stateStr);
      //     }
      //     self.currentStateStr = stateStr;
      //   }
      // };


    }

    return new OracleInfoViewModel();
  }
);