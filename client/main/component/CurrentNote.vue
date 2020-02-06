<template>
<section class="currentNote">
    <transition name="slide-flex">
        <editor
            v-show="layout.editor"
            v-model="content"
            @content-change="contentChange"
            @save-attachment="saveAttachment"
            @line-scroll="lineScroll"
            :tn-event="tnEvent"
        ></editor>
    </transition>
    <transition name="slide-flex">
        <!-- <preview v-show="layout.data.preview" ref="preview"></preview> -->
    </transition>
</section>
</template>
<script lang="ts">
import Preview from './Preview.vue';
// @ts-ignore
import Editor from '@toonote/md-editor';
import eventBus from '../utils/eventBus';
import restClient, {parseResponse} from '../utils/restClient';

export default {
    components: {
        // Editor: import('@toonote/md-editor'),
        Editor,
        // Preview 
    },
    props: ['layout'],
    data(){
        return {
            currentNote: null,
            content: '',
        }
    },
    methods: {
        contentChange(){},
        tnEvent(){},
        saveAttachment(){},
        lineScroll(){},
        async switchNote(noteId: string){
            const note = parseResponse(await restClient.note.find(noteId));
            this.content = note.content;
        }
    },
    mounted(){
        eventBus.$on('NOTE_SWITCH', (noteId: string) => {
            this.switchNote(noteId);
        });
    }
}
</script>
<style scoped>
.currentNote{
    flex: 1;
}
</style>
