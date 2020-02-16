import axios from 'axios';

const BASE_URL = process.env.NODE_ENV === 'production' ?
    'https://api.xiaotu.io':
    'https://test-api.xiaotu.io';

const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'X-TOONOTE-VERSION': TOONOTE_VERSION,
        'X-TOONOTE-TOKEN': localStorage.getItem('TOONOTE-TOKEN'),
    },
});

instance.interceptors.response.use((response: any) => {
    if(response.status !== 200){
        throw new Error('request error, status ' + response.status);
    }
    if(!response.data){
        throw new Error('request data error, data:' + response.data);
    }
    if(response.data.code !== 0){
        throw new Error('request error, code:' + response.data.code);
    }
    console.log(response.data.data);
    return response.data.data;
}, (error:Error) => {
    console.log('error', error);
    throw error;
});

export default instance;
