<template>
    <div class="container">
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
        };
    },
    methods: {
        async switchNotebook(notebookId: string){
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
        },
    },
    mounted(){
        eventBus.$on('NOTEBOOK_SWITCH', (notebookId) => {
            this.switchNotebook(notebookId);
        });
    }
};
</script>
