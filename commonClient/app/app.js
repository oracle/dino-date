'use strict';
/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/

// Declare app level module which depends on views, and components
angular.module('dinoDateApp',  [
    'ui.router',
    'ngResource',
    'ngSanitize',
    'ngMessages'
  ]
)

  .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'components/home/home.html'
    });

    $stateProvider.state('registration', {
      url: '/register',
      templateUrl: 'components/registration/registration.html',
      controller: 'RegistrationCtrl as RegistrationCtrl',
      resolve: {
        'species': function($http) {
          return $http.get('/api/v1/dinosaurs/species')
            .then(function(results) {
              return results.data.items;
            });
        },
        'locations': function($http) {
          return $http.get('/api/v1/locations')
            .then(function(results) {
              return results.data.items;
            });
        }
      }
    });

    $stateProvider.state('controlPanel', {
      url: '/admin/controlPanel',
      templateUrl: 'components/admin/panel.html',
      controller: 'PanelCtrl as PanelCtrl'
    });

    $stateProvider.state('login', {
      url: '/login',
      templateUrl: 'components/login/login.html',
      controller: 'LoginCtrl as LoginCtrl'
    });

    $stateProvider.state('logout', {
      url: '/logout',
      controller: 'LogoutCtrl as LogoutCtrl'
    });

    $stateProvider.state('sessionExpired', {
      url: '/sessionExpired',
      controller: 'SessionExpiredCtrl as SessionExpiredCtrl'
    });

    $stateProvider.state('memberHome', {
      url: '/home',
      templateUrl: 'components/member-home/member-home.html',
      controller: 'MemberHomeCtrl as MemberHomeCtrl'
    });

      $stateProvider.state('inbox', {
        url: '/inbox',
        templateUrl: 'components/inbox/inbox.html',
        controller: 'InboxCtrl as InboxCtrl'
      });

      $stateProvider.state('message', {
        url: '/inbox/:messageId',
        templateUrl: 'components/inbox/message.html',
        controller: 'InboxCtrl as InboxCtrl'
      });

      $stateProvider.state('compose', {
        url: '/compose/:toMemberId',
        templateUrl: 'components/inbox/compose.html',
        controller: 'InboxCtrl as InboxCtrl'
      });

      $stateProvider.state('broadcast', {
        url: '/broadcast',
        templateUrl: 'components/inbox/compose.html',
        controller: 'InboxCtrl as InboxCtrl'
      });

    $stateProvider.state('search', {
      url: '/search',
      templateUrl: 'components/search/search.html',
      controller: 'SearchCtrl as SearchCtrl'
    });

      $stateProvider.state('selfProfile', {
        url: '/profile',
        templateUrl: 'components/profile/profile.html',
        controller: 'ProfileCtrl as ProfileCtrl'
      });

      $stateProvider.state('profile', {
        url: '/profile/:memberId',
        templateUrl: 'components/profile/profile.html',
        controller: 'ProfileCtrl as ProfileCtrl'
      });

      $stateProvider.state('about', {
        url: '/about',
        templateUrl: 'components/about/about.html',
        controller: 'AboutCtrl as AboutCtrl'
      });

    $urlRouterProvider.otherwise('/');

    $httpProvider.interceptors.push('authInterceptor');
    $httpProvider.interceptors.push('oracleInfoInterceptor');
  })

  .controller('AppCtrl', function ($scope, currentUser) {


  })

  .controller('LogoutCtrl', function (currentUser, $state, alert) {
    currentUser.clear();
    alert('success', 'Logout Successful', 'Come back again soon!');
    $state.go('home');
  })

  .controller('SessionExpiredCtrl', function (currentUser, $state, alert) {
    currentUser.clear();
    alert('error', 'Session Expired', 'You must login again.');
    $state.go('login');
  })

  .constant('API_URL', '/api/v1/')

;
