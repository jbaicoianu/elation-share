elation.require(["share.targets.oauth"], function() {
  elation.component.add("share.targets.dropbox", function() {
    this.init = function() {
      elation.share.targets.dropbox.extendclass.init.call(this);
      this.name = 'dropbox';
      this.method = 'window';
      this.logo = '/images/share/targets/dropbox.png';
      this.types = ['*'];
      this.addclass('share_picker_dropbox');
    }
    this.getAPIAuthURL = function() {
      var authargs = {
        client_id: this.clientid,
        response_type: 'token',
        redirect_uri: 'https://' + document.location.host + '/share?target=dropbox'
      };
      return "https://www.dropbox.com/1/oauth2/authorize?" + elation.utils.encodeURLParams(authargs);
    }
    this.getAPIUploadURL = function(data) {
      return 'https://api-content.dropbox.com/1/files_put/auto/' + data.name;
    }
    this.getAPIData = function(data) {
      return this.getFileData(data);
    }
  }, elation.share.targets.oauth);
});
