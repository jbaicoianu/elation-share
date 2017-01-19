elation.require(["share.targets.google"], function() {
  elation.component.add("share.targets.youtube", function() {
    this.init = function() {
      elation.share.targets.youtube.extendclass.init.call(this);
      this.name = 'youtube';
      this.method = 'window';
      this.logo = 'youtube.png';
      this.types = [ 'video/mp4' ];
      this.authscope = 'youtube';
      this.addclass('share_picker_youtube');
    }
    this.getAPIUploadURL = function(data) {
      return 'https://www.googleapis.com/upload/youtube/v3/videos?part=snippet&uploadType=resumable';//&key=' + this.clientid;
    }
    this.getAPIData = function(data) {
      var filedata = this.getFileData(data);
      var metadata = {
        snippet: {
          title: data.name
        }
      };

      return {
        metadata: new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
        media: filedata
      };
    }
    this.getAPIUploadHeaders = function(data) {
console.log(data.type, data.image);
      return {
        'X-Upload-Content-Type': data.type,
        'X-Upload-Content-Length': data.image.size,
      };
    }
    this.getAPIUploadRequests = function(data) {
      var posturl = this.getAPIUploadURL(data),
          apidata = this.getAPIData(data),
          headers = elation.utils.merge(this.getAPIHeaders(data), this.getAPIUploadHeaders(data));

console.log(posturl, apidata);
      var requests = [
        { type: 'POST', url: posturl, data: apidata.metadata, headers: headers },
        { type: 'PUT', url: posturl, data: apidata.media, headers: headers }
      ];
      return requests;
    }
  }, elation.share.targets.google);
});


