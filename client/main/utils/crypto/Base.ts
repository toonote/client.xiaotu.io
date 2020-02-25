export default class Base{
    protected _iv:string = '';
    protected _password:string = '';
    protected _inited:boolean = false;
    protected iv:any;
    protected password:any;
    protected key:any;
    protected alg:any;
    constructor(password:string, iv:string){
        this._password = password;
        this._iv = iv;
    }
}
