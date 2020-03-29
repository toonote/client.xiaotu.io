<template>
    <div class="container">
        <!-- 搜索框开始 -->
        <section class="searchWrapper">
            <input type="search" v-model.trim="searchKeyword" placeholder="搜索..." />
        </section>
        <!-- 搜索框结束 -->
        <!-- 笔记本标题 -->
        <h2 v-if="notebook && !searchKeyword">{{notebook.title}} <a class="operate" href="#" @click.prevent="exitNotebook">切换</a></h2>
        <!-- 笔记列表展示 -->
        <note-tree
            v-show="!searchKeyword"
            :notebook="notebook"
            :current-note="currentNote"
        ></note-tree>
        <!-- 搜索结果展示 -->
        <h2 v-if="searchKeyword">
            <span v-show="searchNoteList.length">搜索结果</span>
            <span v-show="!searchNoteList.length">搜的什么鬼？一条都没有！</span>
        </h2>
        <note-tree
            v-show="searchKeyword"
            :notebook="searchNotebook"
            :current-note="currentNote"
        ></note-tree>
        <note-history></note-history>
    </div>
</template>
<script lang="ts">
import NoteTree from './NoteTree.vue';
import NoteHistory from './NoteHistory.vue';
import eventBus from '../utils/eventBus';
import restClient, {parseResponse} from '../utils/restClient';
import { decryptNoteList } from '../utils/crypto/main';
import idGen from '../utils/idGen';

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
        NoteHistory,
    },
    data(){
        return {
            notebook: {},
            currentNote: null,
            noteList: [],
            searchKeyword: '',
            searchNotebook: {},
            searchNoteList: [],
        };
    },
    watch: {
        searchKeyword(){
            if(this.searchKeyword){
                this.search(this.searchKeyword);
            }else{
                this.searchNotebook = {};
            }
        }
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
            let categories = parseResponse(await restClient.category.all({
                where: JSON.stringify({notebookId: notebook.id})
            })).sort((c1, c2) => c1.order - c2.order);

            // 如果没有分类，新建一个
            if(!categories.length){
                await restClient.category.create({
                    id: idGen(),
                    notebookId: notebook.id,
                    title: '未分类',
                    order: 1,
                });
                categories = parseResponse(await restClient.category.all({
                    where: JSON.stringify({notebookId: notebook.id})
                })).sort((c1, c2) => c1.order - c2.order);
            }

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

            // 恢复前一次使用的笔记
            const lastNoteId = localStorage.getItem('TOONOTE-LAST-NOTE-ID');
            if(lastNoteId && this.noteList.some((note) => note.id === lastNoteId)){
                eventBus.$emit('NOTE_REQUEST_SWITCH', lastNoteId);
            }

            // 如果没有笔记，新建一个
            if(!this.noteList.length){
                eventBus.$emit('NOTE_REQUEST_CREATE');
            }
        },
        exitNotebook(){
            eventBus.$emit('NOTEBOOK_SWITCH', '');
        },
        search(keyword){
            this.searchNoteList = [];
            this.searchNotebook = {};
            this.notebook.categories.forEach((category) => {
                const searchCategory = {
                    id: category.id,
                    title: category.title,
                    order: category.order,
                    notes: [],
                };
                searchCategory.notes = category.notes.filter((note) => {
                    const find = note.title.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
                    if(find){
                        this.searchNoteList.push(note);
                    }
                    return find;
                });
                if(searchCategory.notes.length){
                    if(!this.searchNotebook.categories){
                        this.searchNotebook.categories = [];
                    }
                    this.searchNotebook.categories.push(searchCategory);
                }
            });
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
    /*margin-top: 10px;*/
}

.searchWrapper input{
    -webkit-appearance: textfield;
    display: block;
    border: 0 none;
    width: 100%;
    height: 28px;
    border-bottom: 1px solid var(--border-color);
    background: transparent;
    padding: 0 10px;
    color: var(--second-text-color);
}
.searchWrapper input:focus{
    background: var(--background-color);
    outline: 0 none;
}

h2{
    margin-top: 10px;
    font-size:13px;
    padding-left:15px;
    font-weight: normal;
    line-height: 1.5em;
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
