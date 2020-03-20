<template>
<section
    tabindex="1"
    class="mask"
    @keydown.esc="hideDialog"
    @click="hideDialog"
    v-show="show"
    ref="dialog"
>
    <section class="dialog" :class="size" @click.stop>
        <div class="closeBtn" @click="hideDialog">✖︎</div>
        <section class="content">
            <slot></slot>
        </section>
    </section>
</section>
</template>
<script lang="ts">
export default {
    props: {
        show: {
            type: Boolean,
            default: true,
        },
        size: {
            type: String,
            default: 'normal',
        },
    },
    methods: {
        hideDialog(){
            this.$emit('hide');
        },
    },
    mounted(){
        document.body.appendChild(this.$refs.dialog);
    },
};
</script>

<style scoped>
.dialog{
	position: absolute;
	z-index: 2;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	background:white;
	border:5px solid #bbb;
	color:#585858;
	display: flex;
}
.dialog.small{
    width: 250px;
    /* height: 160px; */
}
.dialog.normal{
    width: 400px;
    /* height: 300px; */
}
.dialog.big{
    width: 800px;
	/* height: 450px; */
}
.dialog .content{
    width: 100%;
}
.closeBtn{
	position: absolute;
	right:-15px;
	top:-15px;
	width:20px;
	height: 20px;
	line-height: 20px;
	text-align: center;
	font-size:14px;
    background: white;
    border: 5px solid rgba(128,128,128,.6);
    border-radius: 15px;
    cursor:pointer;
	transition: transform .8s;
}
.closeBtn:hover{
	transform: rotateZ(720deg);
}
</style>
