<template>
<my-dialog size="big" v-if="note" ref="historyDialog" @hide="note=null">
	<section class="wrapper">
		<section class="list">
			<ul>
				<li
					class="icon folder"
				>{{note.title}}
					<ul>
						<li
							class="icon note"
							:class="{active:isActive(history.id)}"
							v-for="history in historyList"
							:key="history.id"
							@click="switchActiveHistory(history)"
							@contextmenu="showContextMenu(history)"
						>[{{formatDate(history.createdAt)}}]{{history.title}}</li>
					</ul>
				</li>
			</ul>
		</section>
		<section class="content"><pre>{{activeHistoryContent}}</pre></section>
	</section>
</my-dialog>
</template>


<script>
import MyDialog from './base/Dialog.vue';
import eventBus from '../utils/eventBus';
import restClient, { parseResponse } from '../utils/restClient';
import {decrypt} from '../utils/crypto/main';

export default {
	components: {
		MyDialog,
	},
	computed: {
	},
	watch: {
		// 出现历史版本对话框的时候聚焦
		// 以便响应ESC按键
		/* 'versions.currentNote': function(){
			// console.log('versions.currentNote changed', this.versions.currentNote.id, this.$el);
			if(this.versions.currentNote){
				this.$nextTick(() => {
					this.$el.focus();
				});
			}
		} */
	},
	methods: {
		formatDate(dateStr){
			if(!dateStr) return '';
			const date = new Date(dateStr);
			let ts = date.getTime() - date.getTimezoneOffset()*60*1000;
			let s = new Date(ts).toISOString();

			// s.replace(/T.+$/,'');	// 2015-11-24
			// s.replace(/\-\d+T.+$/,''); // 2015-11
			// s.replace(/(^\d+\-|T.+$)/g,''); // 11-24
			// s.replace(/(^[0-9\-]+T|\.\d+Z$)/g,''); // 14:16:18
			// s.replace(/(^[0-9\-]+T|:\d+\.\d+Z$)/g,''); // 14:16
			// s.replace(/T/g,' ').replace(/\.\d+Z$/,''); // 2015-11-24 14:16:18
			// s.replace(/T/g,' ').replace(/:\d+\.\d+Z$/,''); // 2015-11-24 14:16
			return s.replace(/T/g,' ').replace(/^\d+\-/, '').replace(/:\d+\.\d+Z$/,''); // 11-24 14:16

		},
		isActive(historyId){
			const isActive = this.activeHistory && this.activeHistory.id === historyId;
			const isContextMenu = this.contextMenuHistory && this.contextMenuHistory.id === historyId;
			return isActive || isContextMenu;
		},
		switchActiveHistory(history){
			this.activeHistory = history;
			this.showHistoryContent(history.id);
		},
		async showHistoryContent(historyId){
			const history = parseResponse(await restClient.noteHistory.find(historyId));
			let content = history.content;
			if(history.isEncrypted){
				content = await decrypt(this.note.id, content);
			}
			this.activeHistoryContent = content;
		},
		/*hideVersions(){
			hideVersions();
			this.note = {};
		},*/
		/*showContextMenu(versionId){
			// console.log('contextmenu');
			this.contextMenuVersionId = versionId;
			// this.$store.commit('switchContextMenuVersion', versionId);
			// this.$nextTick(() => {
			setTimeout(() => {
				menu.showContextMenu([{
					title:'打开',
					event:'versionOpen'
				},{
					title:'恢复该版本',
					event:'versionRestore'
				}], {
					targetType: 'version',
					targetId: versionId,
				});
				setTimeout(()=>{
					this.contextMenuVersionId = '';
					// this.$store.commit('switchContextMenuVersion', 0);
				},30);
			},30);
		}*/

		async showHistory(note){
			const historyList = parseResponse(await restClient.noteHistory.all({
				where: {
					noteId: note.id,
				},
			}));
			this.historyList = historyList.sort((h1, h2) => h1.createdAt > h2.createdAt ? -1:1);
			for(let i=0; i<this.historyList.length; i++){
				if(+this.historyList[i].isEncrypted === 0) continue;
				this.historyList[i].title = await decrypt(note.id, this.historyList[i].title);
			}
		}
	},
	data(){
		return {
			historyList: [],
			contextMenuHistory: null,
			activeHistory: null,
			activeHistoryContent: '',
			note: null,
		};
	},
	mounted(){
		eventBus.$on('NOTE_HISTORY_SHOW', (note) => {
			this.contextMenuHistory = null;
			this.activeHistory = null;
			this.note = note;
			this.showHistory(note);
		});
	}
};
</script>

<style scoped>
.wrapper{
	display: flex;
	height: 400px;
}
.list{
	-webkit-user-select: none;
	user-select: none;
	width: 300px;
	background:#F6F6F6;
	border-right:1px solid #E0E0E0;
	line-height: 24px;
	padding: 10px 0;
	overflow: auto;
}
.list ul{
	list-style: none;
}
.list li{
	font-size:13px;
	text-indent: 15px;
	/*padding-left:25px;*/
	cursor:default;
	overflow: hidden;
    white-space: nowrap;
}
.list li li{
	text-indent: 34px;
}
.list li.active{
	background: #CECECE;
}
.list li.note::before{
	padding-right:3px;
	background-image:url(../images/icon-file.png);
}
.list li.folder::before{
	padding-right:3px;
	background-image:url(../images/icon-folder.png);
}
.list .note-list-move {
	transition: transform .4s;
}
.content{
	flex:1;
	padding:10px;
	overflow: auto;
}
.closeBtn{
	position: absolute;
	right:-15px;
	top:-15px;
	width:20px;
	height: 20px;
	line-height: 20px;
	text-align: center;
	font-size:14px;
    background: white;
    border: 5px solid rgba(128,128,128,.6);
    border-radius: 15px;
    cursor:pointer;
	transition: transform .8s;
}
.closeBtn:hover{
	transform: rotateZ(720deg);
}
</style>
