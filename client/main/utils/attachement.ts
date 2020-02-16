import apiClient from './apiClient';
import idGen from './idGen';
import Cos from 'cos-js-sdk-v5';

var cos = new Cos({
    // 必选参数
    getAuthorization: function (options, callback) {
        apiClient.get('/api/v2/uploadCredential', {
            params: {
                uploadKey: options.Key 
            },
        }).then((data) => {
            const credentials = data.credentials;
            callback({
                TmpSecretId: credentials.tmpSecretId,
                TmpSecretKey: credentials.tmpSecretKey,
                XCosSecurityToken: credentials.sessionToken,
                // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
                StartTime: data.startTime, // 单位是秒
                ExpiredTime: data.expiredTime,
                ScopeLimit: true, // 细粒度控制权限需要设为 true，会限制密钥只在相同请求时重复使用 
            });
        });
    }
});

export async function upload(file:File){

    const id = idGen();
    let ext = file.name.split('.').pop();
    let uploadKey = id + '.' + ext;
    if(file.name.indexOf('.') === -1){
        ext = '';
        uploadKey = id;
    }

    const result = await new Promise((resolve, reject) => {
        cos.putObject({
            Bucket: 'xiaotu-attach-1251002590',
            Region: 'ap-guangzhou',
            Key: 'attachments/' + uploadKey,
            StorageClass: 'STANDARD',
            Body: file, // 上传文件对象
            onProgress: function(progressData) {
                console.log(JSON.stringify(progressData));
            }
        }, (err, data) => {
            if(err) return reject(err);
            resolve({
                id,
                ext,
                filename: file.name,
                size: file.size,
                url: data.Location.replace(/^.+\.myqcloud\.com/, 'https://attach.xiaotu.io'),
            });
        });
    });

    return result;

}
