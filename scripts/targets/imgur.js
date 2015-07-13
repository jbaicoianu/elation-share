elation.require(["share.targets.oauth"], function() {
  elation.component.add("share.targets.imgur", function() {
    this.init = function() {
      elation.share.targets.imgur.extendclass.init.call(this);
      this.name = 'imgur';
      this.method = 'iframe';
      this.logo = '/images/share/targets/imgur.png';
      this.types = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'application/pdf', 'image/tiff'];
      this.addclass('share_picker_imgur');
    }
    this.getAPIAuthURL = function() {
      var authargs = {
        client_id: this.clientid,
        response_type: 'token',
      };
      return "https://api.imgur.com/oauth2/authorize?" + elation.utils.encodeURLParams(authargs);
    }
    this.getAPIUploadURL = function(data) {
      return 'https://api.imgur.com/3/image';
    }
    this.getAPIData = function(data) {
      return {
        image: new Blob([this.base64ToUint8Array(data.image).buffer], { type: 'image/png' }),
        type: 'file',
        name: data.name
      };
    }
  }, elation.share.targets.oauth);
});
