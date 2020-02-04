<template>
<section class="login">
    <div class="wrapper">
        <div class="loginImage">
            <img v-if="showLoginImage" src="./images/banner_1.jpg" />
        </div>
        <div class="loginBody">
            <div class="qrCode">
                <img :src="loginQrCode" />
            </div>
        </div>
        <!-- <div class="footer">
            <p>
                <a href="https://api.xiaotu.io/oauth/redirect/github?client=mac">使用Github登录</a>
                <a href="https://github.com/TooNote/TooNote/issues/new" class="externalLink">无法登录？</a>
            </p>
        </div> -->
    </div>
</section>
</template>
<script lang="ts">
import axios from 'axios';

declare var process:any

export default {
    data(){
        return {
            showLoginImage: false,
            loginQrCode: '',
            BASE_URL: process.env.NODE_ENV === 'production' ?
                'https://api.xiaotu.io':
                'https://test-api.xiaotu.io',
        };
    },
    mounted(){
        this.initWxLogin();
    },
    methods:{
        validateLogin: async function(){
            const token = localStorage.getItem('TOONOTE-TOKEN');
            if(!token){
                return false;
            }
            try{
                const response = await axios.get(`${this.BASE_URL}/user/info`, {
                    headers: {
                        'x-toonote-token': token
                    }
                });
                console.log(response.data);
                localStorage.setItem('TOONOTE-USER', JSON.stringify(response.data));
                location.href = '/main.html';
            }catch(e){
                alert('登录失败：' + e.message);
                console.log(e);
                return false;
            }
            return true;
        },

        initWxLogin: async function(){

            const isLogin = await this.validateLogin();
            if(isLogin) return;
            
            // 显示登录图片
            this.showLoginImage = true;

            // step 1，获取场景值
            let response = await axios.get(`${this.BASE_URL}/user/getLoginScene?_=${Date.now()}`);
            if(+response.status !== 200){
                alert('服务器错误，暂时无法登录，请稍后再试');
                return;
            }
            let scene = response.data.scene;

            // step 2，显示二维码
            this.loginQrCode = `${this.BASE_URL}/user/weappLogin?scene=${scene}`;

            // step3，定时刷新
            let getResult = async () => {
                let response = await axios.get(`${this.BASE_URL}/user/getLoginStatus?scene=${scene}&_=${Date.now()}`);
                if(+response.status !== 200){
                    alert('服务器错误，暂时无法登录，请稍后再试');
                    return;
                }
                if(response.data.isLogin){
                    const token = response.data.token;
                    localStorage.setItem('TOONOTE-TOKEN', response.data.token);
                    await this.validateLogin();
                }else{
                    setTimeout(getResult, 2000);
                }
            };
            getResult();
        },
    }
};

</script>
<style>
.login{
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: white;
    z-index: 1000;
}
.login a:link{
	color: #999;
	text-decoration: none;
}
.login a:hover{
	color: #333;
}

.wrapper{
    display: flex;
    height: 100%;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
}


.login .loginImage{
    padding: 0 75px;
    flex: 7 1 auto;
}
.login .loginImage img{
    max-width: 100%;
    display: block;
}
.login .loginBody{
    padding: 0 75px;
    flex: 3 0 450px;
}
.login .loginBody .qrCode{
    width: 300px;
}
.login .loginBody .qrCode img{
    max-width: 100%;
}
</style>
