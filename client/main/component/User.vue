<style scoped>
.login{
	padding:10px;
	margin:0 auto;
    border-bottom: 1px solid #e0e0e0;
    position: relative;
}
.login .avatar{
	width:40px;
	height:40px;
	border-radius: 40px;
	float:left;
}
.login .userInfo{
	margin-left:50px;
	height:40px;
	line-height: 40px;
	font-size:14px;
}
.login .userInfo a{
	color: #585858;
	text-decoration: none;
}
.login .levelWrapper{
	position: absolute;
	top:10px;
	right:10px;
	line-height: 14px;
}
.login .levelWrapper .label{
	font-size:10px;
	padding:2px 4px;
	border-radius:2px;
    background: #718c00;
    display: inline-block;
    color: white;
}
.login .taskIndicator{
	position: absolute;
	right:0;
	top:0;
	padding: 10px;
	width: 40px;
	height: 40px;
}
.login .taskIndicator .taskCount{
	width: 100%;
	height: 100%;
	line-height: 40px;
	text-align: center;
	border-radius: 50%;
	background: #718c00;
	color: white;
}
</style>

<template>
<section class="login">
	<img v-if="userData.avatarUrl" class="avatar" :src="userData.avatarUrl" @error="userData.avatarUrl=''" />
	<img v-else class="avatar" src="../images/avatar.png" />
	<div class="userInfo">
		<span v-if="userData.name">{{userData.name}}</span>
		<a v-else v-on:click="doLogin" href="#">点击登录</a>
	</div>
	<!-- <div class="levelWrapper">
		<div class="label">VIP</div>
	</div> -->
</section>
</template>


<script>
import { getLocalInfo,getRemoteInfo } from '../../common/user';

// const logger = debug('user:main');

export default {
	computed: {
	},
	watch: {
	},
	methods: {
		async initUser(){
			let user = getLocalInfo();
			console.log('get user from local');
			if(!user){
				console.log('no local user');
				user = await getRemoteInfo();
				console.log('get user from remote');
				if(!user){
					console.log('no remote user');
					location.href = '/login.html';
					return;
				}
			}
			this.userData = user;
		},
		setupTimer(){
			// 5分钟尝试更新一次用户信息
			setTimeout(() => {
				this.initUser();
			}, 5*60*1000);
		},
		doLogin(){
			logger('doLogin');
		}
	},
	data(){
		return {
			userData: {} 
		};
	},
	mounted(){
		this.initUser();
	}

};
</script>
