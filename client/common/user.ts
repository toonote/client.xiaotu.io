import axios from 'axios';
import config from './config';

export async function getRemoteInfo(token?:string|null){
    if(!token) token = localStorage.getItem('TOONOTE-TOKEN');
    if(!token){
        throw new Error('no token');
    }
    const response = await axios.get(`${config.BASE_URL}/user/info`, {
        headers: {
            'x-toonote-token': token
        }
    });
    localStorage.setItem('TOONOTE-USER', JSON.stringify(response.data));
    // 一天内有效
    localStorage.setItem('TOONOTE-USER-EXPIRES', (Date.now() + 24*3600*1000) + ''); 
    return response.data;
};

export function getLocalInfo(){
    const expires = localStorage.getItem('TOONOTE-USER-EXPIRES');
    if(!expires || +expires < Date.now()){
        return null;
    }
    return JSON.parse(localStorage.getItem('TOONOTE-USER') || 'null');
};
