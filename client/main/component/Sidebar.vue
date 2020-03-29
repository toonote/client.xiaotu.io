<template>
<section class="sidebar">
	<!-- <task></task> -->
	<user></user>
	<!-- 笔记列表展示 -->
	<current-notebook></current-notebook>
</section>
</template>

<script>
import User from './User.vue';
import CurrentNotebook from './CurrentNotebook';
import {throttle} from 'lodash';

export default {
	computed: {
	},

	methods: {
		exitNotebook(){
			exitNotebook();
		},
	},
	data(){
		return {
			currentNotebook: {},
			currentNote: null,
		};
	},
	components:{
		User,
		CurrentNotebook,
	},
	mounted(){
	}
};
</script>

<style scoped>
.sidebar{
	-webkit-user-select: none;
	user-select:none;
	background: var(--second-background-color);
	border-right:1px solid var(--border-color);
	color: var(--second-text-color);
	min-height:100%;
	width:250px;
	flex: 250px 0 0;
	overflow-y: auto;
}
h2 .operate{
	float: right;
	color:#585858;
	text-decoration: none;
	opacity: 0;
	transition: opacity .4s;
	padding-right: 10px;
}
h2:hover .operate{
	opacity: 1;
}
</style>
