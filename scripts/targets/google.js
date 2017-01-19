elation.require(["share.targets.oauth"], function() {
  elation.component.add("share.targets.google", function() {
    this.init = function() {
      elation.share.targets.google.extendclass.init.call(this);
      this.name = 'google';
      this.method = 'window';
      this.logo = 'google-drive.png';
      this.types = [ '*' ];
      this.addclass('share_picker_google');
    }
    this.getAPIAuthURL = function() {
      var authargs = {
        client_id: this.args.clientid,
        response_type: 'token',
        redirect_uri: 'https://' + document.location.host + '/share?target=google',
      };
      if (this.authscope) {
        authargs.scope = 'https://www.googleapis.com/auth/' + this.authscope;
      }
      return "https://accounts.google.com/o/oauth2/auth?" + elation.utils.encodeURLParams(authargs);
    }
    this.getAPIHeaders = function(data) {
      var headers = {
        Authorization: 'Bearer ' + this.token,
        Accept: '*'
      };
      return headers;
    }
  }, elation.share.targets.oauth);
});



