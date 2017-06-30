(function() {
  'use strict';

  var L = require('leaflet');

  module.exports = L.Class.extend({
    options: {
      allowUTurn: false,
      original_index: null,
      type: null
    },
    initialize: function(latLng, name, options) {
      L.Util.setOptions(this, options);
      this.latLng = L.latLng(latLng);
      this.name = name;
    }
  });
})();