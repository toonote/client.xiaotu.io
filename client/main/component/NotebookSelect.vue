<template>
<section class="notebookSelect" v-on:click.stop v-if="!currentNotebook">
	<transition-group name="notebookList" tag="ul">
		<li
			class="nootbook"
			v-for="notebook in notebookList"
			v-show="!newNotebook.isCreating"
			:key="notebook.id"
			@click="switchCurrentNotebook(notebook.id)"
		>{{notebook.title}}</li>
		<li
			class="nootbook createNotebook"
			:class="{creating:newNotebook.isCreating, placeholder:!newNotebook.isCreating}"
			:key="'newNotebook'"
			@click="enterCreateNotebook()"
		>
			<span v-show="!newNotebook.isCreating">新建笔记本</span>
			<input
				class="titleInput notebookTitleInput"
				v-show="newNotebook.isCreating"
				placeholder="新建笔记本"
				@keydown.enter="createNotebook($event.target.value)"
				@keydown.esc="newNotebook.isCreating=false"
				@click.stop
			/>
		</li>
	</transition-group>
	<a class="transfer" href="#" @click.prevent="transferData">数据迁移</a>
</section>
</template>

<script lang="ts">
import restClient, {parseResponse} from '../utils/restClient';
import idGen from '../utils/idGen';
import eventBus from '../utils/eventBus';

export default {
	data(){
		return {
			currentNotebook: null,
			notebookList: [],
			newNotebook: {
				isCreating: false
			}
		};
	},
	computed: {
		maxOrder(){
			return this.notebookList.reduce((prev, curr) => {
				return curr.order >= prev ? curr.order:prev;
			}, 0);
		},
	},
	watch: {
	},
	methods: {
		transferData(){
			const message = '确认迁移吗？\n\n1. 迁移将清除现有1.0.0数据，并从0.3.x数据生成新的数据\n2. 迁移完成后新旧版数据是独立的，互不影响';
			if(!confirm(message)) return;
			restClient.transfer.create().then(() => {
				alert('迁移完成');
				this.getNotebookList();
			});
		},
		switchCurrentNotebook(notebookId){
			if(!notebookId) return;
			localStorage.setItem('TOONOTE-LAST-NOTEBOOK-ID', notebookId);
			eventBus.$emit('NOTEBOOK_SWITCH', notebookId);
		},
		enterCreateNotebook(){
			this.newNotebook.isCreating = true;
		},
		async createNotebook(title){
			await restClient.notebook.create({
				id: idGen(),
				title,
				order: this.maxOrder + 1,
			});
			this.newNotebook.isCreating = false;
			await this.getNotebookList();
		},
		async getNotebookList(){
			const notebookList = parseResponse(await restClient.notebook.all());
			notebookList.sort((n1, n2) => n1.order - n2.order);
			this.notebookList = notebookList;
		}
	},
	async mounted(){
		this.getNotebookList();
		eventBus.$on('NOTEBOOK_SWITCH', (notebookId: string) => {
			if(!notebookId){
				this.currentNotebook = null;
				localStorage.setItem('TOONOTE-LAST-NOTEBOOK-ID', '');
			}
		});
	}
};
</script>
<style scoped>
.transfer{
	position: absolute;
	bottom: 100px;
	left: 50%;
	transform:translateX(-50%);
}
.notebookSelect{
	position: absolute;
	z-index: 9999;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background: #f0f0f0;
	font-family: "PingFang SC";
}
.notebookSelect ul{
	display: flex;
	align-items: center;
	width: 100%;
	height: 100%;
	justify-content: center;
	box-sizing: border-box;
	list-style: none;
}
.notebookSelect ul > li{
	position: relative;
	cursor: pointer;
	box-sizing: border-box;
	text-align: center;
	margin-left: 20px;
	margin-right: 20px;
	padding-top: 160px;
	width: 140px;
	height: 200px;
	background: linear-gradient(to bottom, #728B18, #728B18) no-repeat;
	background-size: 100% 140px;
	border-radius: 5px;
	box-shadow: 0 0 8px rgba(0,0,0,.2);
	text-shadow: 0 0 2px rgba(0,0,0,0.2);
	color: #333;
	overflow: hidden;
	white-space: nowrap;
	transition: box-shadow .4s;
}
.notebookSelect ul > li:hover{
	box-shadow: 0 0 15px rgba(0,0,0,.3);
}
.notebookSelect ul > li::after{
	content: ' ';
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 140px;
	background: url(../images/notebook-logo.png) no-repeat;
	background-position: center center;
	background-size: 70px 70px;
}
.notebookSelect ul > li.createNotebook.placeholder{
	background: linear-gradient(to bottom, #999, #999) no-repeat;
	background-size: 100% 140px;
}
.notebookSelect ul > li.createNotebook.creating{

}
.notebookSelect ul > li.createNotebook.placeholder::after{
	content: '+';
	background: none;
	font-size: 100px;
    line-height: 120px;
    color: #CCC;
    /* text-shadow: 0 0 1px rgba(0,0,0,.3); */
}
.notebookSelect ul > li.notebookList-enter-active,
.notebookSelect ul > li.notebookList-leave-active{
	transition: all .4s ease-in-out;
}
.notebookSelect ul > li.notebookList-enter,
.notebookSelect ul > li.notebookList-leave-to{
	opacity: 0;
	width: 0;
	margin: 0;
}
.notebookSelect ul > li.notebookList-enter-to,
.notebookSelect ul > li.notebookList-leave{
	opacity: 1;
}

.notebookTitleInput{
	display: block;
	margin: 0 auto;
	width: 110px;
}
</style>
