'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates. 
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'models/Members', 'viewModels/profile',
    'ojs/ojknockout', 'ojs/ojtable', 'ojs/ojcollectiontabledatasource',
    'ojs/ojpagingcontrol', 'ojs/ojpagingtabledatasource', 'ojs/ojdialog',
    'ojs/ojcomponents', 'ojs/ojselectcombobox'],
  function (oj, ko, $, Members, Profile) {
    function SearchViewModel() {
      var self = this;

      // Object used to access RootViewModel in main.js
      var rootViewModel = ko.dataFor(document.getElementById('mainContent'));

      self.keywords = ko.observable();
      self.maxDistance = ko.observable(1000);

      // Create a new members collection from the ../models/Members Collection object
      self.membersColl = new Members();

      // Data source for ojTable and ojPagingControl controls.
      self.members = new oj.PagingTableDataSource(new oj.CollectionTableDataSource(self.membersColl));

      // The ojPagingControl currently triggers a fetch when the page is ready
      //   Using this as the data source for the paging control
      //   then setting it to self.members after a successful fetch prevents
      //   a failed initial fetch.
      self.pagingData = ko.observable();

      self.search = function (event, ui) {
        // verify the search criteria has been entered
        if (self.keywords() && self.maxDistance()) {
          // Process type feature not yet added
          // Manually set the process type to preform a spatial search
          // Remove when feature is added
          rootViewModel.setProcessType('spatial', 'search');

          //Re-build the url to include the search criteria
          self.membersColl.url = self.membersColl.url.split('?')[0] +
            '?searchString=' + self.keywords() +
            '&maxDistance=' + self.maxDistance();

          //The ojPaging control fetches multiple times.
          //  Doing it this way to try and prevent extra fetches.
          //////////////
          // self.membersColl.fetch().then(function () {
            // As mentioned in the above workaround for the ojPagingControl
            // Set the pagingData to the fetched records.
            self.pagingData(self.members);
          // });
        }
      };

      // Used to store the data for the member selected from the search results.
      self.currentMember = ko.observable({
        name: null,
        id: null
      });

      // Triggered by selecting a row from the ojTable
      // This function is called twice when a row is selected
      // A new selection will call the function once with data.option === 'currentRow'
      //  and once with data.option === 'selection'
      // Selecting the current selected row again will call
      //  the function twice with data.option === 'selection' both times
      self.showMember = function (event, data) {
        // In the first call set self.currentMember
        if (data.option === 'currentRow' && data.value) {
          var newCurrentRow = data.value;

          //Use the value from self.members to set the current member
          self.members.at(newCurrentRow['rowIndex']).then(function (rowObj) {
            self.currentMember(rowObj['data']);
          });
        }

        // A second click on a row would normally un-select it
        // A third click would be required to open the same item again
        // This section will un-select the record on the first pass to allow
        //   this click to function as a select and re-open the same member
        //   with the second click while keeping it highlighted

        // If the selected row is the same as the current selection
        //  data.option will be 'selection' and self.currentMember should already be set.
        if (data.option === 'selection' && self.currentMember()) {
          // The first time this is called data.value will be null
          // Set the row to no be selected.
          if (data.value === null) {
            var rowIndx = data.previousValue[0].startIndex.row;

            $("#membersTable").ojTable("option", "selection", [{
              startIndex: {"row": rowIndx},
              endIndex: {"row": rowIndx}
            }]);
          // The second call in both cases will have data.value set and we can
          //  use the Profile object to fetch the selected user profile from the server
          } else {
            Profile.getProfile(self.currentMember().memberId);

            // Open the dialog box to display the selected member's profile.
            $("#profileDialog").ojDialog("open");
          }
        }
      };
    }

    return new SearchViewModel();
  });
