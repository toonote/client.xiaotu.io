import 'v-contextmenu/dist/index.css';

import Vue from 'vue';
import Main from './main/Main.vue';
import ContextMenu from 'v-contextmenu';
import './common/directives/autoFocus';

Vue.use(ContextMenu);

new Vue({
    el: '#app',
    render: (h) => h(Main)
});
