'use strict';
/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/

angular.module('dinoDateApp')

  .controller('ProfileCtrl', function (API_URL, currentUser, $stateParams, $http ) {
      var self = this;

      this.getBio = function () {
        if ($stateParams.hasOwnProperty("memberId")) {
          var id = parseInt($stateParams.memberId);
          if (id > -1) {
            $http.get(API_URL + 'members/' + id)
                .then(function success(res) {
                  var data = res.data;

                  self.userBio = {
                    memberId: data.id,
                    name: data.name,
                    speciesName: data.speciesName,
                    locationName: data.locationName,
                    city: data.city,
                    state: data.state,
                    postalCode: data.postalCode,
                    country: data.country,
                    aboutYourself: data.aboutYourself
                  };
                }, function error(res) {
                  alert('danger', 'Member Fetch Failed', res.error);
                });
          }
        } else {
          this.userBio = currentUser.getUser();
        }
      };
  });
