elation.require(["share.targets.base"], function() {
  elation.component.add("share.targets.facebook", function() {
    this.init = function() {
      this.name = 'facebook';
      this.types = ['*'];
      this.logo = 'facebook.png';
      this.addclass('share_picker_facebook');
      this.clientid = this.args.clientid;
      this.initialized = false;
      this.authResponse = false;

      this.uploads = [];
      this.finished = [];
    }

    this.auth = function() {
      return new Promise(elation.bind(this, function(resolve, reject) {
        if (!this.initialized) {
          this.loadScript().then(elation.bind(this, function() {
            this.login().then(elation.bind(this, function() { resolve(this.authResponse); }));
          }));
        } else {
          this.login().then(elation.bind(this, function() { resolve(this.authResponse); }));
        }
      }));
    }
    this.login = function() {
      return new Promise(elation.bind(this, function(resolve, reject) {
        FB.login(elation.bind(this, function(response) {
          if (response.authResponse) {
            this.authResponse = response.authResponse;
            resolve(this.authResponse);
          } else {
            this.authResponse = false;
            reject();
          }
        }), {scope: 'public_profile,user_photos,publish_actions'});
      }));
    }
    this.share = function(data) {
      return new Promise(elation.bind(this, function(resolve, reject) {
        if (!this.authResponse) {
          this.auth().then(elation.bind(this, function() {
            this.uploadImage(data).then(resolve, reject);
          }));
        } else {
          this.uploadImage(data).then(resolve, reject);
        }
      }));
    }
    this.loadScript = function() {
      return new Promise(elation.bind(this, function(resolve, reject) {
        window.fbAsyncInit = elation.bind(this, function() {
          FB.init({
            appId      : this.clientid,
            xfbml      : false,
            version    : 'v2.8',
            status     : true
          });
          this.initialized = true;
          resolve();
        });

        (function(d, s, id){
           var js, fjs = d.getElementsByTagName(s)[0];
           if (d.getElementById(id)) {return;}
           js = d.createElement(s); js.id = id;
           js.src = "//connect.facebook.net/en_US/sdk.js";
           fjs.parentNode.insertBefore(js, fjs);
         }(document, 'script', 'facebook-jssdk'));
      }));
    }
    this.sharePage = function(data) {
      return new Promise(elation.bind(this, function(resolve, reject) {
        var url = document.location.href;
        FB.ui({method: 'share', href: url}, function(response) {
          resolve(response);
        })
      }));
    }
    this.getAPIData = function(data) {
      var datablob = this.Uint8ArrayToBlob(data.image, data.type);
      var formdata = new FormData();
      formdata.append("source", datablob);
      formdata.append("allow_spherical_photo", true);
      //formdata.append("caption", data.name); // Facebook says we're not actually allowed to use this parameter
      formdata.append("published", true);
      formdata.append("temporary", false);

      return formdata;
    }
    this.getAPIUploadURL = function(data) {
      var url = 'https://graph.facebook.com/me/photos?access_token=' + this.authResponse.accessToken;
      return url;
    }
    this.getAPIUploadRequests = function(data) {
      var posturl = this.getAPIUploadURL(data),
          apidata = this.getAPIData(data),
          headers = {}; //elation.utils.merge(this.getAPIHeaders(data), this.getAPIUploadHeaders(data));
      var requests = [
        { type: 'POST', url: posturl, data: apidata, headers: headers }
      ];
      return requests;
    }
    this.uploadImage = function(data) {
      return new Promise(elation.bind(this, function(resolve, reject) {

        var requests = this.getAPIUploadRequests(data);

        var upload = elation.share.upload({data: data, requests: requests, append: this, target: this});
        this.uploads.push(upload);
        elation.events.add(upload, 'upload_complete', elation.bind(this, function(ev) { var response = this.upload_complete(ev); resolve(upload, response); }));
        elation.events.add(upload, 'upload_failed', elation.bind(this, function(ev) { this.upload_failed(ev); reject(upload); }));
        this.refresh();
        upload.refresh();

/*
        elation.net.post('https://graph.facebook.com/me/photos?access_token=' + this.authResponse.accessToken, formdata, {
          callback: function(data) {
            // TODO - we need to create the proper objects and pass them here
            if (!data.error) {
              resolve(data);
            } else {
              reject(data);
            }
          }
        }); 
*/
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
    this.parseAPIResponse = function(data, file) {
      var json = JSON.parse(data);
      return new Promise(function(resolve, reject) {
        resolve(json);
      });
    }
  }, elation.share.targets.base);
});

