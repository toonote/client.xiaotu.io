<template>
    <div class="container">
        <h2 v-if="notebook">{{notebook.title}} <a class="operate" href="#" @click.prevent="exitNotebook">切换</a></h2>
        <!-- 笔记列表展示 -->
        <note-tree
            :notebook="notebook"
            :current-note="currentNote"
        ></note-tree>
    </div>
</template>
<script lang="ts">
import NoteTree from './NoteTree.vue';
import eventBus from '../utils/eventBus';
import restClient, {parseResponse} from '../utils/restClient';
import { decryptNoteList } from '../utils/crypto/main';

type Note = {
    title: string,
    id: string,
    order: number,
};

type Category = {
    title: string,
    id: string,
    order: number,
    notes: Note[],
};

type Notebook = {
    title: string,
    id: string,
    order: number,
    categories: Category[],
};


export default {
    components: {
        NoteTree,
    },
    data(){
        return {
            notebook: {},
            currentNote: null,
            noteList: [],
        };
    },
    methods: {
        async switchNotebook(notebookId: string){
            if(!notebookId){
                this.notebook = null;
                this.noteList = [];
                return;
            }
            let renderNotebook: Notebook;
            const notebook = parseResponse(await restClient.notebook.find(notebookId));
            renderNotebook = {
                title: notebook.title,
                id: notebook.id,
                order: notebook.order,
                categories: [],
            };
            const categories = parseResponse(await restClient.category.all({
                where: JSON.stringify({notebookId: notebook.id})
            })).sort((c1, c2) => c1.order - c2.order);
            const notes = parseResponse(await restClient.note.all({
                where: JSON.stringify({notebookId: notebook.id})
            })).sort((n1, n2) => n1.order - n2.order);
            renderNotebook.categories = categories.map((category) => {
                const notesInCategory = notes.filter((note) => note.categoryId === category.id);
                return {
                    title: category.title,
                    id: category.id,
                    order: category.order,
                    notes: notesInCategory,
                };
            });
            this.notebook = renderNotebook;
            this.noteList = notes;
            await decryptNoteList(notes);
        },
        exitNotebook(){
            eventBus.$emit('NOTEBOOK_SWITCH', '');
        },
    },
    mounted(){
        eventBus.$on('NOTEBOOK_SWITCH', (notebookId) => {
            this.switchNotebook(notebookId);
        });
        eventBus.$on('NOTEBOOK_REFRESH', () => {
            this.switchNotebook(this.notebook.id);
        });
        // 输入了新的key时，重新解密笔记列表
        eventBus.$on('CRYPTO_UPDATE_KEY', () => {
            decryptNoteList(this.noteList);
        });
    }
};
</script>

<style scoped>
.container{
    margin-top: 10px;
}
h2{
    font-size:12px;
    padding-left:15px;
    font-weight: normal;
}
h2 .operate{
    float: right;
    color: var(--second-text-color);
    text-decoration: none;
    opacity: 0;
    transition: opacity .4s;
    padding-right: 10px;
}
h2:hover .operate{
    opacity: 1;
}
</style>
