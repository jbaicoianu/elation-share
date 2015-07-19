elation.requireCSS('share.share');

elation.require(["ui.window", "ui.grid", "ui.iframe", "ui.slider", "ui.label", "ui.image"], function() {
  elation.component.add("share.picker", function() {
    this.init = function() {
      this.addclass('share_picker');
      this.args.bottom = true;
      this.args.right = true;
      this.initUIWindow();
      this.targets = [];
      this.activetargets = {};
      this.refresh();
    }
    this.addShareTarget = function(sharetarget) {
      //elation.html.attach(this, sharetarget);
console.log('new share target', sharetarget);
      this.targets.push(sharetarget);
/*
      if (!this.activetarget) {
        this.activetarget = sharetarget;
        this.setcontent(sharetarget);
        elation.events.add(sharetarget, 'content_update', elation.bind(this, this.update_content));
        elation.events.add(sharetarget, 'content_hide', elation.bind(this, this.hide));
      }
*/
    }
    this.share = function(data) {
      this.show();
      var mimetype = data.type;
      this.getActiveTargetForType(mimetype).then(elation.bind(this, function(target) {
        this.setcontent(target);
        target.share(data);
        this.refresh();
      }));
    }
    this.getActiveTargetForType = function(type) {
      return new Promise(elation.bind(this, function(resolve, reject) {
        if (this.activetargets[type]) {
          resolve(this.activetargets[type]);
        } else {
          this.showTargetSelector(type).then(elation.bind(this, function(target) {
            this.setActiveTarget(type, target);
            resolve(target);
            this.refresh();
          }));
        }
      }));
    }
    this.setActiveTarget = function(type, target) {
      this.activetargets[type] = target;
      elation.events.add(target, 'content_update', elation.bind(this, this.update_content));
      elation.events.add(target, 'content_hide', elation.bind(this, this.hide));
    }
    this.getTargetsForType = function(type) {
      var targets = [];
      for (var i = 0; i < this.targets.length; i++) {
        if (this.targets[i].supportsType(type)) {
          targets.push(this.targets[i]);
        }
      }
      return targets;
    }
    this.showTargetSelector = function(type) {
      return new Promise(elation.bind(this, function(resolve, reject) {
        var targets = this.getTargetsForType(type);
        var panel = elation.ui.panel({orientation: 'vertical'});
        var label = elation.ui.label({
          append: panel,
          label: "You haven't picked a provider for " + type + " yet"
        });
        var list = elation.ui.grid({
          append: panel,
          items: targets,
          attrs: { itemcomponent: 'share.pickertargetlistitem' },
          events: { ui_list_select: function(ev) { resolve(ev.target.value); panel.hide(); } }
         });
        this.setcontent(panel);
      }));
    }
    this.update_content = function() {
      this.refresh();
    }
  }, elation.ui.window);
  elation.component.add("share.pickertargetlistitem", function() {
    this.init = function() {
      elation.share.pickertargetlistitem.extendclass.init.call(this);
      this.addclass('share_picker_target');
      this.img = elation.ui.image({append: this, src: this.args.logo, classname: 'share_picker_target_logo'});
    }
  }, elation.ui.base);
  elation.component.add("share.handler", function() {
    this.init = function() {
      this.accesstokens = [];
      var urlinfo = elation.utils.parseURL(document.location.toString());
      var target = elation.utils.any(urlinfo.hashargs.target, urlinfo.args.target);
      if (target && urlinfo.hashargs.access_token) {
        this.accesstokens[target] = urlinfo.hashargs.access_token;
        if (window.opener) {
          window.opener.elation.events.fire({element: window.opener, type: 'share_handler_token', data: { target: target, access_token: this.accesstokens[target] } });
          window.close();
        }
      }
    }
    this.getAccessToken = function(target) {
      return this.accesstokens[target];
    }
  });

  elation.component.add('share.upload', function() {
    this.init = function() {
      this.data = this.args.data;
      this.apidata = this.args.apidata;
      
      this.addclass('share_upload');
      this.panel = elation.ui.panel({append: this, orientation: 'horizontal'});
      var mimetype = this.data.type;
      var img = this.data.image;
      var imagesrc = 'about:blank';
      this.progressdata = [];
      this.progresscount = 0;
      
      if (img instanceof Blob) {
        imagesrc = URL.createObjectURL(img);
      } else if (img instanceof Uint8Array) {
        imagesrc = 'data:' + mimetype + ';base64,';// + btoa(String.fromCharCode.apply(null, this.data.image));
        var chunksize = 3000;
        var chunks = Math.ceil(this.data.image.length / chunksize);
        var img = this.data.image;
        for (var i = 0; i < chunks; i++) {
          imagesrc += btoa(String.fromCharCode.apply(null, img.subarray(i * chunksize, (i + 1) * chunksize)));
        }
      } else {
        imagesrc = 'data:' + mimetype + ';base64,' + this.data.image;
      }
      this.preview = elation.ui.image({append: this.panel, src: imagesrc, classname: 'share_upload_preview'});
      this.infopanel = elation.ui.panel({append: this.panel, orientation: 'vertical', classname: 'share_upload_info'});
      this.progressbar = elation.ui.progressbar({append: this.infopanel, classname: 'share_upload_progress'});
      this.status = elation.ui.label({append: this.infopanel, classname: 'share_upload_status'});

      this.progressbar.set(0);
      this.progressbar.show();
      this.status.setlabel("uploading...");

      elation.net.post(this.args.url, this.apidata, { 
        headers: this.args.headers, 
        onload: elation.bind(this, this.share_success),
        onprogress: elation.bind(this, this.share_progress),
        onerror: elation.bind(this, this.share_error)
      });
    }
    this.getAverageSpeed = function() {
      var sum = 0;
      for (var i = 1; i < this.progressdata.length; i++) {
        var prev = this.progressdata[i-1];
        var curr = this.progressdata[i];
        if (prev && curr) {
          var sizediff = curr.loaded - prev.loaded;
          var timediff = (curr.timeStamp - prev.timeStamp) / 1000;
          sum += sizediff / timediff;
        }
      }
      var speed = sum / (this.progressdata.length - 1);
      var unit = 'B';
      if (speed > 1024) {
        speed /= 1024;
        unit = 'K';
      } 
      if (speed > 1024) {
        speed /= 1024;
        unit = 'M';
      } 
      if (speed > 1024) {
        speed /= 1024;
        unit = 'G';
      } 
      if (speed) {
        return speed.toFixed(1) + ' ' + unit + '/s';
      }
      return '';
    }
    this.share_progress = function(ev) {
      var percent = ev.loaded / ev.total;
      this.progressdata.push(ev);
      if (this.progressdata.length > 5) this.progressdata.shift();

      if (percent < 1) {
        this.progressbar.set(percent);
        this.status.setlabel("uploading..." + this.getAverageSpeed());
      } else {
        this.progressbar.set(1);
        //this.progressbar.hide();
        this.status.setlabel('processing...');
      }
    }
    this.share_success = function(ev) {
      console.log('share success:', ev);
      // FIXME - sometimes we get a response but the JSON data indicates failure.  This needs per-target parsing
      var response = JSON.parse(ev.target.response);
      //this.status.setlabel('<a href="' + response.data.link + '" target="_blank">' + response.data.link + '</a>');
      this.status.setlabel('done');
      this.addclass('state_success');
      elation.events.fire({element: this, type: 'upload_complete'});
    }
    this.share_error = function(ev) {
      console.log('share error:', ev);
      this.addclass('state_failed');
      this.status.setlabel('ERROR');
      elation.events.fire({element: this, type: 'upload_failed'});
    }
  }, elation.ui.base);
});
