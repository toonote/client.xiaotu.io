<template>
<section class="wrapper">
    <ul v-if="notebook">
        <li
            class="icon folder"
            draggable="true"
            v-for="category in notebook.categories"
            :key="category.id"
            :class="{active:isActive(category.id), 'folder-open':!isFold(category.id)}"
            @contextmenu.prevent.stop="showCategoryContextMenu($event, category.id)"
            @dragstart.stop="dragStart($event, 'category', category)"
            @dragover.stop="dragStart($event, 'category', category)"
            @click="switchFold(category.id)"
        >
            <span v-show="currentEditCategoryId!==category.id">{{category.title}}</span>
            <input
                class="titleInput categoryInput"
                v-show="currentEditCategoryId===category.id"
                :value="category.title"
                @keydown.enter="categoryRename(category.id, $event.target.value)"
                @keydown.esc="currentEditCategoryId=''"
                @click.stop
            />
            <transition-group
                name="note-list"
                tag="ul"
                v-show="!isFold(category.id)"
                @drop.native.prevent="drop"
                >
                <li
                    draggable="true"
                    class="icon note"
                    v-for="note in category.notes"
                    :key="note.id"
                    :class="{active:isActive(note.id), movingUp:movingOverClass(note, 'up'), movingDown:movingOverClass(note, 'down')}"
                    @contextmenu.prevent.stop="showNoteContextMenu($event, note.id)"
                    @click.stop="switchCurrentNote(note.id)"
                    @dragstart.stop="dragStart($event, 'note', note)"
                    @dragover.stop.prevent="dragOver($event, 'note', note)"
                >{{note.title}}</li>
            </transition-group>
        </li>
    </ul>
    <v-contextmenu @hide="hideCategoryContextMenu" ref="categoryContextMenu">
		<v-contextmenu-item @click="newNote('categoryMenu')">新建笔记</v-contextmenu-item>
		<v-contextmenu-item>重命名</v-contextmenu-item>
		<v-contextmenu-item @click="deleteCategory">删除</v-contextmenu-item>
	</v-contextmenu>
    <v-contextmenu @hide="hideNoteContextMenu" ref="noteContextMenu">
		<v-contextmenu-item @click="openNote">打开</v-contextmenu-item>
		<v-contextmenu-item @click="deleteNote">删除</v-contextmenu-item>
		<v-contextmenu-item>历史版本</v-contextmenu-item>
		<v-contextmenu-item @click="newNote('noteMenu')">新建笔记</v-contextmenu-item>
	</v-contextmenu>
</section>
</template>

<script>
import eventBus from '../utils/eventBus';
import restClient, {parseResponse} from '../utils/restClient';
import idGen from '../utils/idGen';
import { getEncrypt, encryptNote } from '../utils/crypto/main';

let movingOverDirection;

export default {
	computed: {
		currentNote(){
			let ret = null;
			if(!this.notebook || !this.notebook.categories) return ret;
			this.notebook.categories.forEach((category) => {
				category.notes.forEach((note) => {
					if(note.id === this.currentNoteId){
						ret = note;
					}
				});
			});
			return ret;
		}
	},
	watch: {
	},
	methods: {
		isActive(noteOrCategoryId){
			let ret = false;
			// 当前笔记
			if(this.currentNoteId && noteOrCategoryId === this.currentNoteId){
				ret = true;
			}
			// 当前右键笔记
			if(this.currentContextMenuNoteId === noteOrCategoryId){
				ret = true;
			}
			// 当前右键笔记
			if(this.currentContextMenuCategoryId === noteOrCategoryId){
				ret = true;
			}
			return ret;
		},
		isFold(categoryId){
			return this.foldMap[categoryId];
		},
		movingOverClass(note, direction){
			if(this.currentMovingNote){
				if(!this.currentMovingOverNote) return false;
				if(this.currentMovingOverNote.id !== note.id) return false;
				if(this.currentMovingNote.id === note.id) return false;
				// 必须是同一个分类
				if(this.currentMovingNote.category.id !== note.category.id){
					movingOverDirection = 'down';
					return movingOverDirection === direction;
				}

				let movingDirection = '';
				if(note.order < this.currentMovingNote.order){
					// 在上方
					// logger('在上方');
					movingDirection = 'up';
				}else{
					// 在下方
					// logger('在下方');
					movingDirection = 'down';
				}
				movingOverDirection = movingDirection;
				return movingDirection === direction;
			}else if(this.currentMovingCategory){
				let category = note.category;
				if(!this.currentMovingOverCategory) return false;
				if(this.currentMovingOverCategory.id !== category.id) return false;
				if(this.currentMovingCategory.id === category.id) return false;

				let movingDirection = '';
				if(category.order < this.currentMovingCategory.order){
					// 在上方
					// logger('在上方');
					movingDirection = 'up';
				}else{
					// 在下方
					// logger('在下方');
					movingDirection = 'down';
				}
				movingOverDirection = movingDirection;
				return false;
			}
		},
		switchFold(categoryId){
			this.foldMap = {
				...this.foldMap,
				[categoryId]: !this.foldMap[categoryId]
			};
		},
		switchCurrentNote(noteId){
			if(noteId === this.currentNoteId) return;
            eventBus.$emit('NOTE_SWITCH', noteId);
            this.currentNoteId = noteId;
            localStorage.setItem('TOONOTE-LAST-NOTE-ID', noteId);
		},
		exitNotebook(){
			exitNotebook();
		},
		categoryRename(categoryId, newTitle){
			if(!newTitle) return;
			this.currentEditCategoryId = '';
			categoryRename(categoryId, newTitle);
		},
		showCategoryContextMenu($event, categoryId){
			// console.log('contextmenu');
			// stat.ga('send', 'event', 'note', 'showCategoryContextMenu');
            this.currentContextMenuCategoryId = categoryId;
            this.$refs.categoryContextMenu.show({
                top: $event.pageY,
                left: $event.pageX,
            });
		},
        hideCategoryContextMenu(){
            this.currentContextMenuCategoryId = '';
        },
		showNoteContextMenu($event, noteId){
			// console.log('contextmenu');
			//stat.ga('send', 'event', 'note', 'showNoteContextMenu');
            this.currentContextMenuNoteId = noteId;
            this.$refs.noteContextMenu.show({
                top: $event.pageY,
                left: $event.pageX,
            });
        },
        hideNoteContextMenu(){
            this.currentContextMenuNoteId = '';
        },
		dragStart(e, type, noteOrCategory){
			if(this.currentMovingNote || this.currentMovingCategory) return;
			if(type === 'note'){
				this.currentMovingNote = noteOrCategory;
			}else{
				logger('currentMovingCategory', noteOrCategory.id);
				this.currentMovingCategory = noteOrCategory;
			}
			e.dataTransfer.effectAllowed = 'move';
			logger('onDragStart', type, noteOrCategory.id);
		},
		dragOver(e, type, noteOrCategory){
			if(this.currentMovingNote){
				this.currentMovingOverNote = noteOrCategory;
			}else if(this.currentMovingCategory){
				if(type === 'note'){
					logger('dragOver', noteOrCategory.category.id);
					this.currentMovingOverCategory = noteOrCategory.category;
				}else if(type === 'category'){
					logger('dragOver', noteOrCategory.id);
					this.currentMovingOverCategory = noteOrCategory;
				}
			}
		},
		drop(e){
			logger('onDrop');
			if(this.currentMovingNote){
				if(this.currentMovingOverNote.id !== this.currentMovingNote.id){
					// 需要更新分类
					if(this.currentMovingNote.category.id !== this.currentMovingOverNote.category.id){
						updateNoteCategory(this.currentMovingNote.id, this.currentMovingOverNote.category.id);
					}
					// 更新顺序
					updateNoteOrder(this.currentMovingNote.id, this.currentMovingOverNote.id, movingOverDirection);
				}
			}else if(this.currentMovingCategory){
				logger('todo:分类排序', movingOverDirection);
				// 需要更新顺序
				if(this.currentMovingOverCategory.id !== this.currentMovingCategory.id){
					updateCategoryOrder(this.currentMovingCategory.id, this.currentMovingOverCategory.id, movingOverDirection);
				}
			}
			this.currentMovingNote = null;
			this.currentMovingOverNote = null;
			this.currentMovingCategory = null;
			this.currentMovingOverCategory = null;

			// console.log('drop', e);
		},
		/*hideContextMenu(){
			// 会自动关闭，这里主要是将当前右键笔记置空
			this.$store.commit('switchContextMenuNote', 0);
        }*/
        openNote(){
            this.switchCurrentNote(this.currentContextMenuNoteId);
        },
        async newNote(from){
            let targetCategory;
            this.notebook.categories.forEach((category) => {
                if(from === 'categoryMenu'){
                    if(category.id === this.currentContextMenuCategoryId){
                        targetCategory = category;
                    }
                }else if(from === 'noteMenu'){
                    category.notes.forEach((note) => {
                        if(note.id === this.currentContextMenuNoteId){
                            targetCategory = category;
                        }
                    });
                }else{
                	targetCategory = category;
                }
            });
			if(!targetCategory) return;
			// todo:order
			const newNote = {
                title: '新笔记',
                content: '# ' + targetCategory.title + '\\新笔记',
                id: idGen(),
                categoryId: targetCategory.id,
				notebookId: this.notebook.id,
				isEncrypted: 0,
			};
			const encrypt = getEncrypt();
			if(encrypt && encrypt.alg){
				await encryptNote(newNote);
			}

            restClient.note.create(newNote).then(() => {
                eventBus.$emit('NOTEBOOK_REFRESH');
            });
        },
        deleteCategory(noteId){

        },
        deleteNote(){
            // todo:二次确认
            if(!confirm('确认删除？')) return;
            restClient.note.delete(this.currentContextMenuNoteId).then(() => {
                eventBus.$emit('NOTEBOOK_REFRESH');
            });
        },
    },
    props: {
        notebook: {
            default: {}
        },
        /*currentNote: {
            default: null
        }*/
    },
	data(){
		return {
            currentNoteId: '',
			currentContextMenuNoteId: '',
			currentContextMenuCategoryId: '',
			currentEditCategoryId: '',
			currentMovingNote: null,
			currentMovingOverNote: null,
			currentMovingCategory: null,
			currentMovingOverCategory: null,
			foldMap: {}
		};
	},
	components:{
	},
	mounted(){
		eventBus.$on('NOTE_TITLE_CHANGE', (title) => {
			if(!this.currentNote) return;
			this.currentNote.title = title;
		});

		eventBus.$on('NOTE_REQUEST_CREATE', () => {
			if(!this.notebook || !this.notebook.categories) return;
			this.newNote();
		});

		eventBus.$on('NOTE_REQUEST_SWITCH', (noteId) => {
			if(!this.notebook || !this.notebook.categories) return;
			this.switchCurrentNote(noteId);
		});
		// eventHub.on('categoryRename', (categoryId) => {
		// 	this.currentEditCategoryId = categoryId;
		// 	logger('categoryRename', categoryId);
		// });
	}
};
</script>
<style scoped>
.wrapper{
	line-height: 24px;
	/*padding-top: 10px;*/
}
.wrapper .notFound{
	font-size:12px;
	padding-left:15px;
	font-weight: normal;
}
.wrapper ul{
	list-style: none;
}
.wrapper li{
	font-size:13px;
	text-indent: 25px;
	/*padding-left:25px;*/
	cursor:default;
	white-space: nowrap;
	overflow: hidden;
}
.wrapper li li{
	text-indent: 44px;
	transition: padding-top .4s ease-in-out, padding-bottom .4s ease-in-out;
}
.wrapper li.active{
	background: var(--active-background-color);
}
.wrapper li.movingUp{
	padding-top: 24px;
}
.wrapper li.movingDown{
	padding-bottom: 24px;
}
.wrapper li.note::before{
	padding-right:3px;
	background-image: var(--icon-file-url);
}
.wrapper li.folder::before{
	padding-right:3px;
	background-image: var(--icon-folder-url);
}
.wrapper li.folder-open::before{
	padding-right:3px;
	background-image: var(--icon-folder-open-url);
}
.wrapper li .categoryInput{
	width: calc(100% - 70px);
}
/* .wrapper .note-list-move {
	transition: transform .4s;
} */

</style>
