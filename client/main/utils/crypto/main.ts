import { getLocalInfo } from '../../../common/user';
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
    key: 'ID-4+MO-1+LS3',
};

const getEncrypt = function():EncryptConfig{
    if(!_user){
        _user = getLocalInfo();
    }
    return JSON.parse(_user.encrypt);
};

const getEncryptKey = function(){
    return localStorage.getItem('TOONOTE-ENCRYPT-KEY') || '';
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
