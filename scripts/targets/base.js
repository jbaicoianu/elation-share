elation.require(["ui.base"], function() {
  elation.component.add("share.targets.base", function() {
    this.init = function() {
      this.name = '';
      this.logo = '';
      this.types = [];
      this.uploads = [];
      this.finished = [];
      this.failed = [];
    }
    this.supportsType = function(type) {
      // TODO - need to support wildcards for real
      return (this.types.indexOf('*') != -1 || this.types.indexOf(type) != -1);
    }
    this.auth = function() {
      return false;
    }
    this.share = function(data, type) {
      return new Promise(elation.bind(this, function(resolve, reject) {
        // Base share type just rejects immediately
        reject();
      }));
    };
    this.getFileData = function(data) {
      var bindata = data.image;
      if (!bindata instanceof Uint8Array && data.encoding == 'base64') {
        var bindata = this.base64ToUint8Array(data.image);
      }
      return bindata;
    }
    this.stringToUint8Array = function(str) {
      var arr = new Uint8Array(str.length);
      for (var i = 0; i < str.length; i++) {
        arr[i] = str.charCodeAt(i);
      }
      return arr;
    }
    this.base64ToUint8Array = function(base64) {
      var binary_string =  window.atob(base64),
          len = binary_string.length,
          bytes = new Uint8Array(len),
          i;

      for (i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes;
    }
    this.Uint8ArrayToBlob = function(data, type) {
      return new Blob([data.buffer], {type: type});
    }
    this.Uint8ArrayToBinaryString = function(data) {
      var binary = '';
      var len = data.byteLength;
      for (var i = 0; i < len; i++) {
          binary += String.fromCharCode( data[ i ] );
      }
      return binary;
    }
    this.Uint8ArrayToBase64 = function(data) {
      return btoa(this.Uint8ArrayToBinaryString(data));
    }
  }, elation.ui.base);
});

