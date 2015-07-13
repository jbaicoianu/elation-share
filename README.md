# elation-share
Elation component to simplify sharing of binary data to cloud services

## Example Usage
### Get a base64-encoded PNG from a <canvas> and share it

```javascript
var sharepicker = elation.share.picker({append: document.body});
sharepicker.addShareTarget(elation.share.targets.imgur({clientid: '...'}));
sharepicker.addShareTarget(elation.share.targets.dropbox({clientid: '...'}));
sharepicker.addShareTarget(elation.share.targets.google({clientid: '...'}));

var imagedata = canvas.toDataURL('image/png').replace(/.*,/, ''); // trim the header info
sharepicker.share('image/png', {
  image: imagedata,
  encoding: 'base64',
  name: 'screenshot.png'
});
```
