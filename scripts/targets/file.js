elation.require(["ui.base"], function() {
  elation.component.add("share.targets.file", function() {
    this.init = function() {
      this.name = 'file';
      this.method = 'window';
      this.logo = '/images/share/targets/file.png';
      this.types = ['*'];

      this.addclass('share_picker_file');
    }
    this.supportsType = function(type) {
      // TODO - need to support wildcards for real
      return (this.types.indexOf('*') != -1 || this.types.indexOf(type) != -1);
    }
    this.share = function(data, type) {
      console.log('share a file', data, type);
      var a = document.createElement('A');
      a.style.display = 'none';
      document.body.appendChild(a);
      var url = window.URL.createObjectURL(data.image);

      a.href = url;
      a.download = data.name;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }, elation.ui.base);
});
