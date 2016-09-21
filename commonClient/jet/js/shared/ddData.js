'use strict';
/*
 Copyright (c) 2016, Oracle and/or its affiliates.
 All rights reserved.
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojmodel'],
  function (oj, ko, $) {
    function DdDataCache() {
      var self = this;

      self.species = ko.observableArray();
      self.locations = ko.observableArray();

      var species = new Species();

      species.fetch().then(function (res) {
        self.species(res.items);
      });

      var locations = new Locations();

      locations.fetch().then(function (res) {
        self.locations(res.items);
      });
    }

    var Species = oj.Collection.extend({
      url: "/api/v1/dinosaurs/species",
      model: oj.Model.extend({idAttribute: "speciesId"})
    });

    var Locations = oj.Collection.extend({
      url: "/api/v1/locations",
      model: oj.Model.extend({idAttribute: "locationId"})
    });

    return new DdDataCache();
  }
);