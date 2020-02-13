<template>
<section class="currentNote">
    <transition name="slide-flex">
        <editor
            v-show="layout.editor"
            v-model="content"
            @save-attachment="saveAttachment"
            @line-scroll="lineScroll"
            :tn-event="tnEvent"
        ></editor>
    </transition>
    <transition name="slide-flex">
        <preview 
            v-show="layout.preview" 
            ref="preview" 
            :content="content"
            :layout="layout"
        ></preview>
    </transition>
</section>
</template>
<script lang="ts">
import Preview from './Preview.vue';
// @ts-ignore
import Editor from '@toonote/md-editor';
import eventBus from '../utils/eventBus';
import restClient, {parseResponse} from '../utils/restClient';
import throttle from 'lodash/throttle';
import parseTitle from '../utils/parseTitle';

export default {
    components: {
        // Editor: import('@toonote/md-editor'),
        Editor,
        Preview,
    },
    props: ['layout'],
    data(){
        return {
            currentNote: null,
            content: '',
        }
    },
    watch:{
        content: throttle(function(content: string){
            if(content === this.currentNote.content) return;
            const {title} = parseTitle(content);
            restClient.note.update(this.currentNote.id, {
                title,
                content,
            }).then(() => {
                if(title !== this.currentNote.title){
                    eventBus.$emit('NOTE_TITLE_CHANGE', title);
                }
                this.currentNote.title = title;
                this.currentNote.content = content;
            });
        }, 1000, {leading: false}),
    },
    methods: {
        tnEvent(){},
        saveAttachment(){},
        lineScroll(line){
            eventBus.$emit('EDITOR_SCROLL', line);
        },
        async switchNote(noteId: string){
            const note = parseResponse(await restClient.note.find(noteId));
            this.currentNote = note;
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
    display: flex;
    flex: 1;
    overflow: hidden;
}
</style>
