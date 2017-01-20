elation.require(["share.targets.oauth"], function() {
  elation.component.add("share.targets.dropbox", function() {
    this.init = function() {
      elation.share.targets.dropbox.extendclass.init.call(this);
      this.name = 'dropbox';
      this.method = 'window';
      this.logo = 'dropbox.png';
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
    this.parseAPIResponse = function(data, file) {
      var json = JSON.parse(data);
      return new Promise(elation.bind(this, function(Resolve, reject) {
        var response = {
          name: json.path.replace(/^\//, ''),
          //link: json.link,
          type: json.mime_type,
          size: json.bytes,
          timestamp: Date.parse(json.modified) / 1000,
        };
        /*
        this.getTemporaryLink(json.path).then(function(link) {
          response.link = link;
          resolve(response);
        });
        */
      }));
    }
    this.getTemporaryLink = function(path) {
      return new Promise(elation.bind(this, function(resolve, reject) {
        var apiurl = "https://www.dropbox.com/2/files/get_temporary_link";
        var postdata = { path: path };
        elation.net.post(apiurl, postdata, {
          headers: this.getAPIHeaders(),
          callback: function(data) {
            console.log(data);
            var json = JSON.parse(data); 
            resolve(json.link);
          }
        });
      })); 
    }
  }, elation.share.targets.oauth);
});
