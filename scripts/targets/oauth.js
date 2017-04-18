elation.require(["share.targets.base"], function() {
  elation.component.add("share.targets.oauth", function() {
    this.init = function() {
      elation.share.targets.oauth.extendclass.init.call(this);

      this.method = 'window';
      this.clientid = this.args.clientid;
      this.token = false;
    }
    this.handleIframeLoad = function(ev) {
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
    this.getAPIUploadRequests = function(data) {
      var posturl = this.getAPIUploadURL(data),
          apidata = this.getAPIData(data),
          headers = elation.utils.merge(this.getAPIHeaders(data), this.getAPIUploadHeaders(data));
      var requests = [
        { type: 'POST', url: posturl, data: apidata, headers: headers }
      ];
      return requests;
    }
    this.parseAPIResponse = function(data, file) {
      var json = JSON.parse(data);
      return new Promise(function(resolve, reject) {
        resolve(json);
      });
    }
    this.auth = function() {
      var authurl = this.getAPIAuthURL();
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
      return new Promise(elation.bind(this, function(resolve, reject) {
        if (!this.token) {
          //console.log('tried to share the data but not authed yet', data, this);
          this.auth();
          elation.events.add(this, 'token_update', elation.bind(this, this.share, data));
        } else {
          var requests = this.getAPIUploadRequests(data);
          //console.log('SHARE IT', requests);
          var upload = elation.share.upload({data: data, requests: requests, append: this, target: this});
          this.uploads.push(upload);
          elation.events.add(upload, 'upload_complete', elation.bind(this, function(ev) { var response = this.upload_complete(ev); resolve(upload, response); }));
          elation.events.add(upload, 'upload_failed', elation.bind(this, function(ev) { this.upload_failed(ev); reject(upload); }));
          this.refresh();
        }
      }));
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
      //if (ev.data.target == this.name) {
        this.token = ev.data.access_token;
        elation.events.fire({element: this, type: 'token_update', data: this.token});
      //}
    }
    this.refresh = function() {
      elation.events.fire({element: this, type: 'content_update'});
    }
  }, elation.share.targets.base);
});
