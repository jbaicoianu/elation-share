elation.require(["ui.base"], function() {
  elation.component.add("share.targets.oauth", function() {
    this.init = function() {
      this.name = '';
      this.logo = '';
      this.method = 'window';
      this.types = [];
      this.uploads = [];
      this.finished = [];
      this.failed = [];
      this.clientid = this.args.clientid;
      this.token = false;
    }
    this.supportsType = function(type) {
      // TODO - need to support wildcards for real
      return (this.types.indexOf('*') != -1 || this.types.indexOf(type) != -1);
    }
    this.handleIframeLoad = function(ev) {
console.log('load happened', ev, this);
      if (this.iframe.contentWindow) {
        var authed = false;
        try {
          var sharehandler = this.iframe.contentWindow.elation.share.handler(0);
          if (sharehandler) {
            var token = sharehandler.access_token;
            authed = true;
            this.token = token;
            elation.events.fire({element: this, type: 'token_update', data: token});
            this.iframe.hide();
          }
        } catch (e) {
        }
        if (!authed) {
          this.iframe.show();
          this.refresh();
        }
      }
    }
    this.getAPIAuthURL = function() {
      return false;
    }
    this.getAPIUploadURL = function(data) {
      return false;
    }
    this.getAPIHeaders = function(data) {
      var headers = {
        Authorization: 'Bearer ' + this.token,
        Accept: 'application/json'
      };
      return headers;
    }
    this.getAPIUploadHeaders = function(data) {
      return {};
    }
    this.getAPIData = function(data) {
      return data;
    }
    this.auth = function() {
      var authurl = this.getAPIAuthURL();
      console.log('auth at', authurl);
      if (authurl) {
        if (this.method == 'iframe') {
          if (!this.iframe) {
            this.iframe = elation.ui.iframe({append: this});
          }
          this.iframe.src = authurl;
          elation.events.add(this.iframe, 'load', elation.bind(this, this.handleIframeLoad));
          this.iframe.hide();
        } else if (this.method == 'window') {
          elation.events.add(window, 'share_handler_token', elation.bind(this, this.handle_new_token));
          window.open(authurl, 'authwindow_' + this.name, 'menubar=no,toolbar=no,location=yes,width=500,height=600');
        }
        this.refresh();
      }
    }
    this.share = function(data, type) {
      if (!this.token) {
        console.log('tried to share the data but not authed yet', data);
        this.auth();
        elation.events.add(this, 'token_update', elation.bind(this, this.share, data));
      } else {
        var posturl = this.getAPIUploadURL(data),
            apidata = this.getAPIData(data),
            headers = elation.utils.merge(this.getAPIHeaders(data), this.getAPIUploadHeaders(data));
        if (posturl) {
          var upload = elation.share.upload({data: data, apidata: apidata, url: posturl, headers: headers, append: this});
          this.uploads.push(upload);
          elation.events.add(upload, 'upload_complete', elation.bind(this, this.upload_complete));
          elation.events.add(upload, 'upload_failed', elation.bind(this, this.upload_failed));
          this.refresh();
        }
      }
    } 
    this.upload_complete = function(ev) {
      var upload = ev.target;
      var idx = this.uploads.indexOf(upload);
      if (idx != -1) {
        this.uploads.splice(idx, 1);
        this.finished.push(upload);

        setTimeout(elation.bind(this, function(upload) { upload.addclass('state_removing'); }, upload), 4000);
        setTimeout(elation.bind(this, function(upload) { upload.reparent(false); this.refresh(); if (this.uploads.length == 0) elation.events.fire({element: this, type: 'content_hide'}); }, upload), 6000);
      }
    }
    this.upload_failed = function(ev) {
      var upload = ev.target;
      var idx = this.uploads.indexOf(upload);
      if (idx != -1) {
        this.uploads.splice(idx, 1);
        this.failed.push(upload);
      }
    }
    this.handle_new_token = function(ev) {
      if (ev.data.target == this.name) {
        this.token = ev.data.access_token;
        elation.events.fire({element: this, type: 'token_update', data: this.token});
      }
    }
    this.refresh = function() {
      elation.events.fire({element: this, type: 'content_update'});
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
  }, elation.ui.base);
});
