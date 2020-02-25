import forge from 'node-forge';
import Base from './Base';

export default class Forge extends Base{
    private _cipher:any;
    private async init(){
        if(this._inited) return;
        const ivHash = await this.sha256(this._iv);
        this.iv = forge.util.createBuffer(ivHash);
        this.key = await this.sha256(this._password);
        this._cipher = forge.cipher.createCipher('AES-GCM', this.key);
    }
    /**
     * sha256 
     */
    public async sha256(str: string) {
        const hash = forge.md.sha256.create();
        hash.update(str);
        return hash.digest();
    }
    public base64(bytes: any): string {
        return btoa(bytes);
    }
    public async encrypt(str: string): string {
        await this.init();
        this._cipher.start({iv: this.iv});
        this._cipher.update(forge.util.createBuffer(str, 'utf8'));
        this._cipher.finish();
        const bytes = this._cipher.output.getBytes() + this._cipher.mode.tag.getBytes();
        return this.base64(bytes);
    }
}

/*function transformBytesToBase64 (bytes) {
    return window.btoa(bytes);
}

var md = forge.md.sha256.create();
var password = '123';
var text = '你好hello';
md.update(password);

var ivCode = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
var ivStr = ivCode.map((n) => String.fromCharCode(n)).join('');
var iv = forge.util.createBuffer(ivStr);
var key = md.digest();

var cipher = forge.cipher.createCipher('AES-GCM', key);
cipher.start({iv: iv});
cipher.update(forge.util.createBuffer(text, 'utf8'));
console.log(iv,key,forge.util.createBuffer(text, 'utf8'));
var result = cipher.finish(); // check 'result' for true/false
console.log(cipher.output,cipher.output.toHex(),cipher.mode.tag,cipher.mode.tag.toHex());
var bytes = cipher.output.getBytes() + cipher.mode.tag.getBytes();
console.log(bytes, transformBytesToBase64(bytes));
*/
