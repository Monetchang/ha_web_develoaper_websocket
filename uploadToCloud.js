var qiniu = require("qiniu");
var accessKey = "CCiqyycPWKDiaUSSTtElR8lh6aJZttRXrXknwe9B";
var secretKey = "-_7t5uLMP000XQwSx1cJiBLEMGaqYxxEvY0MS3yz";
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
var bucket = "lww_test";
var options = {
  scope: bucket
};
var putPolicy = new qiniu.rs.PutPolicy(options);
var uploadToken = putPolicy.uploadToken(mac);

var config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z0;
var formUploader = new qiniu.form_up.FormUploader(config);
var putExtra = new qiniu.form_up.PutExtra();
var bucketManager = new qiniu.rs.BucketManager(mac, config);
var publicBucketDomain = "http://build-download.nostackdeveloper.com";


module.exports = function uploadToCloud(key, localFile, needlink) {
  formUploader.putFile(
    uploadToken,
    key,
    localFile,
    putExtra,
    function (respErr, respBody, respInfo) {
      if (respErr) {
        console.log(`Android 打包失败, Error: ${respErr}`)
        global._ws.send(`Android 打包失败, Error: ${respErr}`)
      }
      if (respInfo.statusCode == 200) {
        console.log("打包完成，开始上传")
        global._ws.send("打包完成，开始上传")
        if (needlink) {
          var publicDownloadUrl = bucketManager.publicDownloadUrl(publicBucketDomain, respBody.key);
          console.log("apk上传七牛完毕，下载链接如下" + publicDownloadUrl)
          global._ws.send(`apk上传完毕，Download URL: ${publicDownloadUrl}`)
          global._ws.send("Finished~~")
        }
      } else {
        console.log('----->', respInfo.statusCode);
        console.log(respBody);
      }
    });
}