declare var process:any;

export default {
    BASE_URL: process.env.NODE_ENV === 'production' ?
        'https://api.xiaotu.io':
        'https://test-api.xiaotu.io',
};
