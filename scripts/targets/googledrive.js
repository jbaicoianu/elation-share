elation.require(["share.targets.google"], function() {
  elation.component.add("share.targets.googledrive", function() {
    this.init = function() {
      elation.share.targets.googledrive.extendclass.init.call(this);
      this.name = 'googledrive';
      this.method = 'window';
      this.logo = '/images/share/targets/google-drive.png';
      this.types = [ '*' ];
      this.authscope = 'drive.file';
      this.addclass('share_picker_googledrive');
    }
    this.getAPIUploadURL = function(data) {
      return 'https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart';
    }
    this.getAPIData = function(data) {
      var filedata = this.getFileData(data);
console.log('file data', filedata);
      return {
        metadata: new Blob([JSON.stringify({title: data.name})], { type: 'application/json' }),
        media: filedata
      };
    }
  }, elation.share.targets.google);
});

