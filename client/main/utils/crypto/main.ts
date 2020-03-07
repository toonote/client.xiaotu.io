import { getLocalInfo, setRemoteInfo } from '../../../common/user';
import WebCrypto from '../crypto/WebCrypto';

type Crypto = {
    iv: string,
    crypto: WebCrypto,
};

let crypto:Crypto|null;

type EncryptConfig = {
    // 算法
    alg: 'AES-GCM',
    // 密钥组成
    key: 'ID-4+MO-1+FS3',
    // 用于验证解密是否成功的字符串
    validateString: string,
};

export const getEncrypt = function():EncryptConfig{
    const user = getLocalInfo();
    return JSON.parse(user.encrypt || 'null');
};

export const getEncryptKey = function(){
    const keyArr = JSON.parse(localStorage.getItem('TOONOTE-ENCRYPT-KEY') || '[]');
    return keyArr.join('').toLowerCase();
};

export const setEncryptKey = function(key: string[]){
    localStorage.setItem('TOONOTE-ENCRYPT-KEY', JSON.stringify(key));
    crypto = null;
};

export const isKeyValid = async function(){
    const encrypt = getEncrypt();
    let validateId = '';
    const user = getLocalInfo();
    try{
        validateId = await decrypt(user.id, encrypt.validateString);
    }catch(e){

    }
    return +validateId === user.id;
};

export const setEncrypt = async function(remoteEncrypt: EncryptConfig, key: string[]){
    const user = getLocalInfo();
    setEncryptKey(key);
    const validateString = await encrypt(user.id, user.id, true);
    remoteEncrypt.validateString = validateString;
    await setRemoteInfo({encrypt: JSON.stringify(remoteEncrypt)});
};

export async function encrypt(id: string, str: string, force:boolean = false){
    let encrypt = getEncrypt();
    if((!encrypt || !encrypt.alg) && !force) return str;
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

export async function decryptNoteList(noteList: any[]){
    // notes标题解密
    if(!isKeyValid()) return;
    for(let i=0; i<noteList.length; i++){
        let note = noteList[i];
        if(+note.isEncrypted !== 1){
            continue;
        }
        try{
            note.title = await decrypt(note.id, note.title);
        }catch(e){
                    
        }
    }
};

export async function decryptNote(note: any){
    if(!isKeyValid()) return;
    if(+note.isEncrypted !== 1){
        return;
    }
    try{
        note.title = await decrypt(note.id, note.title);
        note.content= await decrypt(note.id, note.content);
    }catch(e){
        console.log('decrypt failed, maybe not encrypted:' + e.message);    
    }
    console.log(note);
};

export async function encryptNote(note: any){
    if(!isKeyValid()) return;
    try{
        note.title = await encrypt(note.id, note.title);
        note.content= await encrypt(note.id, note.content);
        note.isEncrypted = 1;
    }catch(e){
        console.log('decrypt failed, maybe not encrypted:' + e.message);    
    }
    console.log(note); 
}
