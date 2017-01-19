elation.require(["share.targets.oauth"], function() {
  elation.component.add("share.targets.imgur", function() {
    this.init = function() {
      elation.share.targets.imgur.extendclass.init.call(this);
      this.name = 'imgur';
      this.method = 'window';
      this.logo = '/images/share/targets/imgur.png';
      this.types = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'application/pdf', 'image/tiff'];
      this.addclass('share_picker_imgur');
    }
    this.getAPIAuthURL = function() {
      var authargs = {
        client_id: this.clientid,
        response_type: 'token',
      };
      return document.location.protocol + "//api.imgur.com/oauth2/authorize?" + elation.utils.encodeURLParams(authargs);
    }
    this.getAPIUploadURL = function(data) {
      return 'https://api.imgur.com/3/image';
    }
    this.getAPIData = function(data) {
      var imgdata = data.image;
      var img = false;
      var type = 'file';
      if (imgdata instanceof Blob) {
        img = imgdata;
      } else if (imgdata instanceof Uint8Array) {
        img = new Blob([imgdata.buffer], { type: data.type });
      } else if (elation.utils.isString(imgdata)) {
        img = imgdata;
        type = 'base64';
      }
      return {
        image: img,
        type: type,
        name: data.name,
        animated: data.animated || false
      };
    }
  }, elation.share.targets.oauth);
});
