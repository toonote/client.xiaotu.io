<template>
<section class="mainContainer">
    <div class="main" :class="{withSidebar:layout.sidebar}">
		<transition name="slide">
			<sidebar v-show="layout.sidebar"></sidebar>
		</transition>
        <current-note :layout="layout"></current-note>
	</div>
	<notebook-select v-show="!currentNotebook"></notebook-select>
	<!-- <version></version> -->
</section>
</template>
<script lang="ts">
import Sidebar from './component/Sidebar.vue';
import NotebookSelect from './component/NotebookSelect.vue';
import CurrentNote from './component/CurrentNote.vue';
import eventBus from './utils/eventBus';
import axios from 'axios';

declare var process:any

export default {
    data(){
        return {
            layout: {
                sidebar: true,
                editor: true,
                preview: true,
            },
            currentNotebook: '',
            showLoginImage: false,
            loginQrCode: '',
            BASE_URL: process.env.NODE_ENV === 'production' ?
                'https://api.xiaotu.io':
                'https://test-api.xiaotu.io',
        };
    },
    components: {
        Sidebar,
        NotebookSelect,
        CurrentNote,
    },
    mounted(){
        eventBus.$on('NOTEBOOK_SWITCH', (notebookId) => {
            this.currentNotebook = notebookId;
        });
    },
    methods:{
    }
};

</script>
<style>
*{
    margin:0;
    padding:0;
}
html,body{
    height: 100%;
}
.icon::before{
	content:' ';
	display: inline-block;
	width:16px;
	height:16px;
	vertical-align: sub;
	background-size:16px 16px;
	background-repeat:no-repeat;
}
.mask{
	position: absolute;
	left:0;
	top:0;
	/*windows下如果小于6，下方的滚动条会显示出来*/
	z-index: 6;
	width:100%;
	height:100%;
	background:rgba(128,128,128,.4);
}
.mainContainer, .main{
    height: 100%;
}
.main{
    display: flex;
}
/* 表单 */
.tn-form{
    padding: 20px;
    font-size: 14px;
    width: 100%;
    box-sizing: border-box;
}
.tn-form .tn-form-item{
    margin-bottom: 20px;
    display: flex;
}
.tn-form .tn-form-item .tn-form-label{
    flex: 1;
    padding: 0 10px;
    text-align: right;
}
.tn-form .tn-form-item input[type=text]{
    flex: 1;
    outline: 0 none;
    padding: 3px 5px;
    border: 1px solid #ccc; 
}
.tn-form .tn-form-item input[readonly]{
    background: #f0f0f0;
    border-color: #ccc!important;
}
.tn-form .tn-form-item input[type=text]:focus{
    border-color: #718c00;
}
.tn-form .tn-form-item.tn-btn-wrapper{
    text-align: center;
    margin-bottom: 0;
}
.tn-form .tn-form-item.tn-btn-wrapper .tn-btn{
    flex: 1;
    padding: 10px;
    background: #718c00;
    color: white;
    border: 0 none;
    font-size: 16px;
    cursor: pointer;
    letter-spacing: 1em;
    text-indent: 1em;
}
.tn-form .tn-form-item.tn-btn-wrapper .tn-btn:hover{
    background: #8aab01;
}
.tn-label{
    width: 100%;
    padding: 10px;
    border: 1px solid #8aab01;
    background: #cddf88 
}
</style>
