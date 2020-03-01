<template>
<section class="login">
	<img v-if="userData.avatarUrl" class="avatar" :src="userData.avatarUrl" @error="userData.avatarUrl=''" />
	<img v-else class="avatar" src="../images/avatar.png" />
	<div class="userInfo">
		<span v-if="userData.name">{{userData.name}}</span>
		<a v-else v-on:click="doLogin" href="#">点击登录</a>
	</div>
	<div class="levelWrapper">
		<!-- <div class="label">VIP</div> -->
		<div class="label" @click="encryptDialog.show=true">
			<span v-if="isEncrypted">已加密</span>
			<a v-else>未加密</a>
		</div>
	</div>

	<my-dialog v-show="encryptDialog.show" ref="encryptDialog">
		<form class="tn-form">
			<div class="tn-form-item">
				<label class="tn-form-label">加密方式</label>
				<input type="text" readonly :value="encryptDialog.form.alg" />
			</div>
			<div 
				class="tn-form-item" 
				v-for="(label, $index) in encryptDialog.form.keyLabel"
				:key="label"
				>
				<label class="tn-form-label">{{label}}</label>
				<input type="text" v-model="encryptDialog.form.keyValue[$index]" />
			</div>
			<div class="tn-form-item" v-show="!isEncrypted">
				<label class="tn-label">设置加密信息后将加密所有的笔记标题和内容。</label>
			</div>
			<div class="tn-form-item tn-btn-wrapper">
				<button type="submit" class="tn-btn" @click.prevent="setEncrypt">确定</button>
			</div>
		</form>
	</my-dialog>
</section>
</template>


<script>
import { getLocalInfo,getRemoteInfo } from '../../common/user';
import { getEncrypt, setEncrypt, setEncryptKey, decrypt, isKeyValid } from '../utils/crypto/main';
import MyDialog from './base/Dialog.vue';
import eventBus from '../utils/eventBus';
// const logger = debug('user:main');

export default {
	components: {
		MyDialog,
	},
	computed: {
		encrypt(){
			if(!this.userData.encrypt) return false;
			const encrypt = JSON.parse(this.userData.encrypt);
			return encrypt;
		},
		isEncrypted(){
			return this.encrypt && this.encrypt.alg;
		},
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
		async initEncryptKey(){
			if(!this.isEncrypted) return;
			const isValid = await isKeyValid();
			if(!isValid){
				this.encryptDialog.show = true;
			}
		},
		doLogin(){
			logger('doLogin');
		},
		async setEncrypt(){
			if(!this.isEncrypted){
				await setEncrypt({
					alg: this.encryptDialog.form.alg,
					key: this.encryptDialog.form.key,
					validateString: '',
				}, this.encryptDialog.form.keyValue);
				this.encryptDialog.show = false;
				this.encryptDialog.form.keyValue = [];
				eventBus.$emit('CRYPTO_ON');
				await this.initUser();
			}else{
				setEncryptKey(this.encryptDialog.form.keyValue);
				const isValid = await isKeyValid();
				if(isValid){
					this.encryptDialog.show = false;
					this.encryptDialog.form.keyValue = [];
					eventBus.$emit('CRYPTO_UPDATE_KEY');
				}else{
					alert('密钥验证失败。');
				}
			}
		},
	},
	data(){
		return {
			userData: {},
			encryptDialog: {
				show: false,
				form: {
					alg: 'AES-GCM',
					key: 'ID-4+MO-1+FS3',
					keyLabel: ['身份证后4位', '母亲姓名最后一个字全拼', '第1所学校第3个字全拼'],
					keyValue: [],
				},
			},
		};
	},
	mounted(){
		this.initUser();
		this.initEncryptKey();
		this.$refs.encryptDialog.$on('hide', () => {
			this.encryptDialog.show = false;
		});
	}

};
</script>
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
	cursor: pointer;
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
