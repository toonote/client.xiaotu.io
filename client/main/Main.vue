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
.mainContainer, .main{
    height: 100%;
}
.main{
    display: flex;
}
</style>
