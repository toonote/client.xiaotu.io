<template>
<section class="currentNote">
    <transition name="slide-flex">
        <editor
            v-show="layout.editor"
            v-model="content"
            ref="editor"
            @attachment="onAttachment"
            @line-scroll="onLineScroll"
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
import {upload} from '../utils/attachement';
import {encrypt, decrypt} from '../utils/crypto/main';

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
        content: throttle(async function(content: string){
            if(content === this.currentNote.content) return;
            const {title} = parseTitle(content);
            restClient.note.update(this.currentNote.id, {
                title: await encrypt(this.currentNote.id ,title),
                content: await encrypt(this.currentNote.id, content),
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
        async onAttachment(file){
            console.log('on saveAttachment', arguments);
            for(let i = 0; i < file.files.length; i++){
                const result = await upload(file.files[i]);
                await restClient.attachment.create({
                    id: result.id,
                    noteId: this.currentNote.id,
                    filename: result.filename,
                    size: result.size,
                    ext: result.ext,
                    storage: 'QCLOUD',
                    publicUrl: result.url,
                });
                this.$refs.editor.insertAttachment({
                    filename: result.filename,
                    url: result.url.replace('https://attach.xiaotu.io/attachments/', 'tnattach://'),
                });
                console.log('upload success', result);
            }
        },
        onLineScroll(line){
            eventBus.$emit('EDITOR_SCROLL', line);
        },
        async switchNote(noteId: string){
            const note = parseResponse(await restClient.note.find(noteId));
            try{
                note.title = await decrypt(note.id, note.title);
                note.content= await decrypt(note.id, note.content);
            }catch(e){
                console.log('decrypt failed, maybe not encrypted:' + e.message);    
            }
            console.log(note);
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
