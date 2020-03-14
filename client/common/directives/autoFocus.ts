import Vue from 'vue';

// 注册一个全局自定义指令 `v-auto-focus`
Vue.directive('autoFocus', {
	componentUpdated(el){
		// 聚焦元素
		setTimeout(() => {
			el.focus();
		});
	}
});
