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

export default {
    components: {
        NoteTree,
    },
    props: {
        notebook: {
            default: () => {}
        },
        currentNote: {
            default: null
        }
    }
};
</script>
