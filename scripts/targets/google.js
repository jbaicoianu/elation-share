elation.require(["share.targets.oauth"], function() {
  elation.component.add("share.targets.google", function() {
    this.init = function() {
      elation.share.targets.flickr.extendclass.init.call(this);
      this.name = 'google';
      this.method = 'window';
      this.logo = '/images/share/targets/google-drive.png';
      this.types = [ '*' ];
      this.addclass('share_picker_google');
    }
    this.getAPIAuthURL = function() {
      var authargs = {
        client_id: this.args.clientid,
        response_type: 'token',
        scope: 'https://www.googleapis.com/auth/drive.file',
        redirect_uri: 'https://' + document.location.host + '/share?target=google',
      };
      return "https://accounts.google.com/o/oauth2/auth?" + elation.utils.encodeURLParams(authargs);
    }
    this.getAPIHeaders = function(data) {
      var headers = {
        Authorization: 'Bearer ' + this.token,
        Accept: '*'
      };
      return headers;
    }
    this.getAPIUploadURL = function(data) {
      return 'https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart';
    }
    this.getAPIData = function(data) {
      return {
        metadata: new Blob([JSON.stringify({title: data.name})], { type: 'application/json' }),
        media: new Blob([this.base64ToUint8Array(data.image).buffer], { type: 'image/png' }),
      };
    }
  }, elation.share.targets.oauth);
});



