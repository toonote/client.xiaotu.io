import RestClient from 'axios-rest-client';
import config from '../../common/config';

declare var TOONOTE_VERSION:any;

export function getClient(){
    const client = new RestClient({
        baseUrl: config.BASE_URL + '/api/v2' 
    });
    
    client._axios.interceptors.request.use((config: any) => {
        config.headers['X-TOONOTE-VERSION'] = TOONOTE_VERSION;
        config.headers['X-TOONOTE-TOKEN'] = localStorage.getItem('TOONOTE-TOKEN');
        return config;
    }, (error:Error) => {
        console.log('error', error);
        throw error;
    });
    return client;
};

export function parseResponse(response: any){
    if(response.status !== 200){
        throw new Error('request error, status ' + response.status);
    }
    if(!response.data){
        throw new Error('request data error, data:' + response.data);
    }
    if(response.data.code !== 0){
        throw new Error('request error, code:' + response.data.code);
    }
    return response.data.data;
};

export default getClient();
