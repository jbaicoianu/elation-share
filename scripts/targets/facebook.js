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
    this.uploadImage = function(data) {
      return new Promise(elation.bind(this, function(resolve, reject) {
        var datablob = this.Uint8ArrayToBlob(data.image, data.type);
        var formdata = new FormData();
        //formdata.append("access_token", this.authResponse.accessToken);
        formdata.append("source", datablob);
        formdata.append("caption",data.name);
        formdata.append("published",true);
        formdata.append("temporary",false);
        formdata.append("no_story",true);

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
      }));
        
    }
  }, elation.share.targets.base);
});

