<template>
<section tabindex="1" class="mainContainer" @keydown="hotkey" ref="main">
    <div class="main" :class="{withSidebar:layout.sidebar}">
		<transition
            name="slide-flex"
            @after-enter="layoutChange"
            @after-leave="layoutChange"
        >
			<sidebar v-show="layout.sidebar"></sidebar>
		</transition>
        <current-note :layout="layout"></current-note>
	</div>
	<notebook-select v-show="!currentNotebook"></notebook-select>
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
        hotkey($event){
            switch($event.which){
                // meta+1
                case 49:
                    if(!$event.metaKey) break;
                    this.layout.sidebar = !this.layout.sidebar;
                    $event.preventDefault();
                    break;
                // meta+2
                case 50:
                    if(!$event.metaKey) break;
                    this.layout.editor = !this.layout.editor;
                    $event.preventDefault();
                    break;
                // meta+3
                case 51:
                    if(!$event.metaKey) break;
                    this.layout.preview = !this.layout.preview;
                    $event.preventDefault();
                    break;
                // meta+s
                case 83:
                    if(!$event.metaKey) break;
                    $event.preventDefault();
                    break;
                case 78:
                    if(!$event.metaKey) break;
                    eventBus.$emit('NOTE_REQUEST_CREATE');
                    $event.preventDefault();
                    break;
            }
        },
        layoutChange(){
            eventBus.$emit('LAYOUT_CHANGE_AFTER');
            this.$refs.main.focus();
        },
    }
};

</script>
<style>
@import "../common/theme/default.css";
@import "./styles/global.css";
</style>
