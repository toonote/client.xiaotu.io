import { getLocalInfo, setRemoteInfo } from '../../../common/user';
import WebCrypto from '../crypto/WebCrypto';

let _user:any;

type Crypto = {
    iv: string,
    crypto: WebCrypto,
};

let crypto:Crypto;

type EncryptConfig = {
    // 算法
    alg: 'AES-GCM',
    // 密钥组成
    key: 'ID-4+MO-1+FS3',
};

export const getEncrypt = function():EncryptConfig{
    if(!_user){
        _user = getLocalInfo();
    }
    return JSON.parse(_user.encrypt || 'null');
};

export const getEncryptKey = function(){
    const keyArr = JSON.parse(localStorage.getItem('TOONOTE-ENCRYPT-KEY') || '[]');
    return keyArr.join('');
};

export const setEncrypt = async function(remoteEncrypt: EncryptConfig, key: string[]){
    await setRemoteInfo({encrypt: JSON.stringify(remoteEncrypt)});
    localStorage.setItem('TOONOTE-ENCRYPT-KEY', JSON.stringify(key));
};

export async function encrypt(id: string, str: string){
    let encrypt = getEncrypt();
    if(!encrypt || !encrypt.alg) return str;
    let encryptKey = getEncryptKey();

    if(!crypto || crypto.iv !== id){
        crypto = {
            iv: id,
            crypto: new WebCrypto(encryptKey, id),
        };
    }

    const encrypted = await crypto.crypto.encrypt(str);
    return encrypted;
};

export async function decrypt(id: string, str: string){
    let encrypt = getEncrypt();
    if(!encrypt || !encrypt.alg) return str;
    let encryptKey = getEncryptKey();

    if(!crypto || crypto.iv !== id){
        crypto = {
            iv: id,
            crypto: new WebCrypto(encryptKey, id),
        };
    }

    const decrypted = await crypto.crypto.decrypt(str);
    return decrypted;
};
