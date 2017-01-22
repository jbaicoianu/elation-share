elation.require(["ui.base"], function() {
  elation.component.add("share.targets.file", function() {
    this.init = function() {
      this.name = 'file';
      this.method = 'window';
      this.logo = 'file.png';
      this.types = ['*'];

      this.addclass('share_picker_file');
    }
    this.supportsType = function(type) {
      // TODO - need to support wildcards for real
      return (this.types.indexOf('*') != -1 || this.types.indexOf(type) != -1);
    }
    this.share = function(data, type) {
      return new Promise(elation.bind(this, function(resolve, reject) {
        console.log('share a file', data, type);
        var a = document.createElement('A');
        a.style.display = 'none';
        document.body.appendChild(a);

        var imgdata = data.image;
        if (imgdata instanceof Uint8Array) {
          imgdata = new Blob([imgdata.buffer], {type: data.type});
        }

        var url = window.URL.createObjectURL(imgdata);

        a.href = url;
        a.download = data.name;
        a.click();
        window.URL.revokeObjectURL(url);

        var upload = elation.share.upload({data: data, requests: false, append: this, target: this});

        setTimeout(elation.bind(this, function(upload) { upload.addclass('state_removing'); }, upload), 4000);
        setTimeout(elation.bind(this, function(upload) { upload.reparent(false); this.refresh(); elation.events.fire({element: this, type: 'content_hide'}); }, upload), 6000);

        resolve(upload);
      }));
    }
  }, elation.share.targets.base);
});

