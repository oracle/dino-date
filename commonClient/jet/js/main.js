'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates.
 All rights reserved.
 */
requirejs.config({
  // Path mappings for the logical module names
  paths: 
 //injector:mainReleasePaths
  {
    'knockout': 'libs/knockout/knockout-3.4.0.debug',
    'jquery': 'libs/jquery/jquery-3.1.0',
    'jqueryui-amd': 'libs/jquery/jqueryui-amd-1.12.0',
    'promise': 'libs/es6-promise/es6-promise.min',
    'hammerjs': 'libs/hammer/hammer-2.0.8.min',
    'ojdnd': 'libs/dnd-polyfill/dnd-polyfill-1.0.0.min',
    'ojs': 'libs/oj/v2.1.0/debug',
    'ojL10n': 'libs/oj/v2.1.0/ojL10n',
    'ojtranslations': 'libs/oj/v2.1.0/resources',
    'signals': 'libs/js-signals/signals.min',
    'text': 'libs/require/text',
    'ddData': 'shared/ddData',
    'alert': 'shared/alert'
  }
  //endinjector
  ,
  // Shim configurations for modules that do not expose AMD
  shim: {
    'jquery': {
      exports: ['jQuery', '$']
    }
  },
  // This section configures the i18n plugin. It is merging the Oracle JET built-in translation
  // resources with a custom translation file.
  // Any resource file added, must be placed under a directory named "nls". You can use a path mapping or you can define
  // a path that is relative to the location of this main.js file.
  config: {
    ojL10n: {
      merge: {
        //'ojtranslations/nls/ojtranslations': 'resources/nls/menu'
      }
    }
  }
});

/**
 * A top-level require call executed by the Application.
 * Although 'ojcore' and 'knockout' would be loaded in any case (they are specified as dependencies
 * by the modules themselves), we are listing them explicitly to get the references to the 'oj' and 'ko'
 * objects in the callback
 */
require(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'ojs/ojrouter',
  'ojs/ojmodule', 'ojs/ojoffcanvas', 'ojs/ojnavigationlist',
        'ojs/ojtable', 'ojs/ojarraytabledatasource'],
  function (oj, ko, $) { // this callback gets executed when all required modules are loaded
    var isLoggedIn = function() {
      return (sessionStorage.getItem("currentUser") !== null)
    };

    var isAdmin = function() {
      return (isLoggedIn() && JSON.parse(sessionStorage.getItem("currentUser")).id === 0);
    };

    var router = oj.Router.rootInstance;
    router.configure({
      'home': {label: 'Home', isDefault: true},
      'inbox': {label: 'Inbox', value: 'inbox', canEnter: isLoggedIn},
      'search': {label: 'Search', canEnter: isLoggedIn},
      'broadcast': {label: 'Broadcast', value: 'sendMessage', canEnter: isAdmin},
      'controlPanel': {label: 'Control Panel', canEnter: isAdmin},
      'about': {label: 'About'},
      'profile': {label: 'Profile'},
      'register': {label: 'Register'}
    });

    function RootViewModel() {
      var self = this;
      self.router = router;
      
      self.currentUser = ko.observable(null);

      self.viewProfileId = ko.observable(null);

      // Load user from session storage
      if (sessionStorage.currentUser) {
        self.currentUser(JSON.parse(sessionStorage.getItem("currentUser")));
      } else {
        self.router.go('home');
      }

      // Build the navigation list according to user role
      self.setNavMenu = function(){
        var navData = [{
            name: 'Home',
            id: 'home'
          }];

        // Add menu items if user is logged on
        if (self.currentUser() !== null) {
          navData.push({
            name: 'Inbox',
            id: 'inbox'
          });

          navData.push({
            name: 'Search',
            id: 'search'
          });

          // Add menu items if user is admin (currently only one admin with id 0, not using roles)
          if (self.currentUser().id === 0) {
            navData.push({
              name: 'Broadcast',
              id: 'broadcast'
            });
            
            navData.push({
                name: 'Control Panel',
                id: 'controlPanel'
            });
          }
        }

        if (self.navDataSource){
          self.navDataSource.reset(navData, {idAttribute: 'id'});
          self.router.go('home');
        } else {
          self.navDataSource = new oj.ArrayTableDataSource(navData, {idAttribute: 'id'});
        }
      };

      // build the navigation list
      self.setNavMenu();

      //  Process data and functions
      //   Used to change processing paths for code demonstration sections
      self.cachedProcessTypes = {};

      //Set default Process Types
      if (!sessionStorage.hasOwnProperty('broadcastType')) {
        sessionStorage.setItem("broadcastType", 'thickDatabase');
      }

      if (!sessionStorage.hasOwnProperty('registerType')) {
        sessionStorage.setItem("registerType", 'aq');
      }

      if (!sessionStorage.hasOwnProperty('searchType')) {
        sessionStorage.setItem("searchType", 'text');
      }

      self.setProcessType = function (value, state) {
        self.cachedProcessTypes[state] = value;
        sessionStorage.setItem((state + 'Type'), value);
      };

      self.getProcessType = function (state) {
        if (!self.cachedProcessTypes[state]) {
          self.cachedProcessTypes[state] = sessionStorage.getItem(state + 'Type');
        }

        return self.cachedProcessTypes[state];
      };

      //  Generate authorization headers to inject into rest calls
      self.getHeaders = function(){
        var userToken = sessionStorage.getItem('userToken');
        var stateStr = self.router.stateId();

        var headers = {
          'Authorization': 'Bearer ' + userToken,
          'userToken': userToken || parseInt(self.currentUser()? self.currentUser().id : null)
        };

        if (stateStr === 'register' || stateStr === 'search' || stateStr === 'broadcast') {
          headers['DD-Process-Type'] = self.getProcessType(stateStr);
        }

        return {'headers': headers};
      };

      self.alerts = ko.observableArray();
      
      var smQuery = oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
      self.smScreen = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
      self.navChange = function(event, ui) {
        if (ui.option === 'selection' && ui.value !== self.router.stateId()) {
          // Only toggle navigation drawer when it's shown on small screens
          if (self.smScreen()) {
            self.toggleDrawer();
          }
          
          self.router.go(ui.value);
        }
      };
      self.drawerParams = {
        displayMode: 'push',
        selector: '#offcanvas',
      };
      // Called by navigation drawer toggle button and after selection of nav drawer item
      self.toggleDrawer = function() {
        return oj.OffcanvasUtils.toggle(self.drawerParams);
      };
      // Close the drawer for medium and up screen sizes
      var mdQuery = oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
      self.mdScreen = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);
      self.mdScreen.subscribe(function() {oj.OffcanvasUtils.close(self.drawerParams);});
    }

    oj.Router.defaults['urlAdapter'] = new oj.Router.urlParamAdapter();
    // oj.Router.defaults['urlAdapter'] = new oj.Router.urlPathAdapter();
    // oj.Router.defaults['baseUrl'] = '/#';

    oj.Router.sync().then(
      function () {
        // bind your ViewModel for the content of the whole page body.
        ko.applyBindings(new RootViewModel(), document.getElementById('globalBody'));
      },
      function (error) {
        oj.Logger.error('Error in root start: ' + error.message);
      }
    );
  }
);
