(function (window, undefined) {

  var loc = window.location;
  var history = window.history;
  var hash;
  var hashData = {};

  function HashControl() {

    var formatter = Formatter.init();
    hash = loc.search;
    hashData = formatter.parseHashToObj(hash);

    this.set = function (dataObj) {
      var hashString = formatter.formatToHash(dataObj);
      console.log(hashString);
      history.replaceState({}, null, '#'+hashString);
    },
    this.read = function () {
      hash = loc.hash;
      hashData = formatter.parseHashToObj(hash);
      return hashData;
    },
    this.readValue = function (key) {
      return hashData[key];
    },
    this.editValue = function (key, value) {
      hashData[key] = value;
      this.setHash(hashData)
    },
     this.add = function (key, value) {
      hashData[key] = value;

    }
  };

  var Formatter = {
    init: function() {
      return this
    },
    parseHashToObj: function (rawHash) {
      var dObj = {};

      if (this.isEmpty(rawHash)) {
        return null;
      } else {
        var hashVal = rawHash.replace('#','');
        var valArrs = hashVal.split('&');

        for(var val in valArrs) {
          var keyAndValue = valArrs[val].split('=');
          dObj[keyAndValue[0]] = keyAndValue[1]
        }

        return dObj;
      }
    },
    isEmpty: function(str) {
      if (!str || 0 === str.length) return true;
      else return false;
    },

    formatToHash: function (obj) {
      var str = [];
      for (var p in obj) {
        // Nulls or undefined is just empty string
        if (obj[p] === null || typeof obj[p] === 'undefined') {
          obj[p] = '';
        }

        if (obj.hasOwnProperty(p)) {
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
        }
      }
      return str.join('&');
    }
  };


  window.HashControl = HashControl;

})(window);