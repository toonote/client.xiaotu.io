<template>
<section class="sidebar">
	<!-- <task></task> -->
	<user></user>
	<section class="searchWrapper">
		<input type="search" v-model.trim="searchKeyword" placeholder="搜索..." />
	</section>
	<!-- 搜索结果展示 -->
	<note-tree 
		v-show="searchKeyword"
		:notebook="currentNotebook" 
		:current-note="currentNote"
	></note-tree>
	<!-- 笔记列表展示 -->
	<current-notebook
		v-show="!searchKeyword"
	></current-notebook>
</section>
</template>


<script>
// import debug from '../modules/util/debug';
/* import {
	uiData,
	switchCurrentNote,
	updateNoteOrder,
	updateNoteCategory,
	updateCategoryOrder,
	exitNotebook,
	categoryRename,
	search
} from '../modules/controller'; */
import User from './User.vue';
import CurrentNotebook from './CurrentNotebook';
import NoteTree from './NoteTree';
// import Task from './Task.vue';
// import Menu from '../modules/menu/electron';
// import stat from '../modules/util/stat';
// import eventHub from '../modules/util/eventHub';
import {throttle} from 'lodash';
// import env from '../modules/util/env';
// const logger = debug('sidebar');

// const menu = new Menu();

export default {
	computed: {
	},
	watch: {
		searchKeyword(){
			if(this.searchKeyword){
				stat.ga('send', 'event', 'note', 'searchStarted');
				search(this.searchKeyword);
			}
		}
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
			searchKeyword: '',
			searchNoteList: [],
		};
	},
	components:{
		User,
		// Task,
		NoteTree,
		CurrentNotebook,
	},
	mounted(){
		// eventHub.on('categoryRename', (categoryId) => {
		// 	this.currentEditCategoryId = categoryId;
		// 	logger('categoryRename', categoryId);
		// });
	}
};
</script>

<style scoped>
.sidebar{
	-webkit-user-select: none;
	user-select:none;
	background:#F6F6F6;
	border-right:1px solid #E0E0E0;
	color:#585858;
	font-family: "PingFang SC";
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
.searchWrapper input{
	-webkit-appearance: textfield;
	display: block;
    border: 0 none;
    width: 100%;
    height: 28px;
    border-bottom: 1px solid #e0e0e0;
    background: transparent;
	padding: 0 10px;
}
.searchWrapper input:focus{
	background: white;
	outline: 0 none;
}
</style>
