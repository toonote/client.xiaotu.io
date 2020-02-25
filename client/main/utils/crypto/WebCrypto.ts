import Base from './Base';

const crypto = window.crypto.subtle;

export default class WebCrypto extends Base{
    private async init(){
        if(this._inited) return;
        this.iv = new Uint8Array(await this.sha256(this._iv));
        this.password = await this.sha256(this._password);
        this.alg = {
            name: 'AES-GCM',
            iv: this.iv,
        };
        this.key = await crypto.importKey(
            'raw', 
            this.password,
            this.alg,
            false,
            ['encrypt', 'decrypt'],
        );
        this._inited = true;
    }
    /**
     * sha256 
     */
    public async sha256(str: string) {
        return crypto.digest('SHA-256', this.str2bin(str));
    }
    public str2bin(str: string): ArrayBuffer {
        return new TextEncoder().encode(str);
    }
    public bin2str(bin: ArrayBuffer): string {
        return new TextDecoder().decode(bin);   
    }
    public base64(bin: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(bin);
        for (var len = bytes.byteLength, i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
    public debase64(str: string): ArrayBuffer{
        const binary = window.atob(str);
        const bytes = new Uint8Array(binary.split('').map((c) => c.charCodeAt(0)));
        return bytes.buffer;
    }
    public async encrypt(str: string): string {
        await this.init();
        const result = await crypto.encrypt(this.alg, this.key, this.str2bin(str));
        return this.base64(result); 
    }
    public async decrypt(str: string): string {
        await this.init();
        const result = await crypto.decrypt(this.alg, this.key, this.debase64(str));
        return this.bin2str(result);
    }
}

/* var iv=new Uint8Array([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]);

var alg={name:'AES-GCM', iv:iv}
var key;
var text = '你好hello';
var password = '123';
function transformBytesToBase64 (bytes) {
    var binary = '';
    for (var len = bytes.byteLength, i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    console.log(binary);
    return window.btoa(binary);
}
window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)).then((psd) => {
    console.log(psd);
    return window.crypto.subtle.importKey('raw', psd, alg, false, ['encrypt', 'decrypt']).then((importKey) => {
        key = importKey;
        return;
    });
}).then(() => {
    return window.crypto.subtle.encrypt(alg, key, new TextEncoder().encode(text))
}).then((encrypted) => {
    console.log(encrypted,encrypted.toString());
    console.log(new TextDecoder().decode(encrypted));
    console.log(transformBytesToBase64(new Uint8Array(encrypted)));
    return encrypted;
}).then((encrypted) => {
    return window.crypto.subtle.decrypt(alg, key, encrypted);
}).then((decrypted) => {
    console.log(decrypted, new TextDecoder().decode(decrypted));
}); */
