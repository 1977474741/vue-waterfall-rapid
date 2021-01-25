<template>
	<div class="home">
		<div class="header">
			<p class="switch-container">
				<button @click="modeFun">{{mode?'点击固定列宽':'点击固定三列'}}</button>
				<button class="repaints" @click="repaints">点击手动重绘</button>
				<button @click="add">添加元素</button>
			</p>
			<p class="range-container">
				容器宽：<input type="range" v-model="range" name="">
			</p>
			<p class="switch-container">
				<label>
					容器变化自动重绘 <input class="switch" v-model="autoResize" type="checkbox"/>
				</label>
				<label>
					始终填满容器 <input class="switch" v-model="fillBox" type="checkbox"/>
				</label>
			</p>
		</div>
		<div class="main" @scroll="scroll" :style="{width:width+'%'}">
			<waterfall :col="col" :autoResize="autoResize" :moveTransitionDuration="0.4" :fillBox="fillBox" :col-width="colWidth" :list="list" ref="waterfall" imgKey="src">
				<!-- 两种图片绑定模式
				1.指定图片的Key（ imgKey="src"）
				2.在img标签上加class（ class="waterfall-img"） -->
				<!-- img标签如果设置宽高会渲染的更快 -->
				<div class="waterfall-item" :class="{bounceIn:item.state == 'show'}" slot-scope="item">
					<img v-if="item.data.src" style="width: 100%" class="waterfall-img" :src="item.data.src">
					{{item.index}}-{{item.data.text}}
				</div>
			</waterfall>
		</div>
	</div>
</template>
<script type="text/javascript">
	import waterfall from '@/components/vue-waterfall-rapid.vue'
	import pics from '@/assets/js/pics.js'
	let pc = window.innerWidth > window.innerHeight;
	export default {
		name: 'vue-waterfall-rapid',
		components: {
			waterfall
		},
		data(){
			return{
				// 容器宽度百分比
				width: 100,
				// 滑轮值
				range: 100,
				//是否根据容器尺寸自动计算重绘
				autoResize:true,
				//列数
				col: 0,
				//是否始终填满容器
				fillBox: false,
				//列宽-有指定列数则此属性失效
				colWidth: (pc ? window.innerHeight : window.innerWidth) / 5.07,
				// 列数和列宽模式切换
				mode: 0,
				list: pics.slice(0,pc ? 24:18)
			}
		},
		watch:{
			range(newval){
				this.width = 30 + newval*0.7;
			},
			fillBox(){
				this.repaints(0,0.4);
			}
		},
		mounted(){
			this.$refs.waterfall.onRender = (res)=>{
				console.log('渲染完毕',res);
			}
			let i = 18;
			setTimeout(()=>{
				setInterval(()=>{
					i++;
					if(i > 51)return;
					console.log(i);
					let item = pics[i%pics.length];
					this.list.push(item)
				},50)
			},1000)
		},
		methods:{
			add(){
				let item = pics[parseInt(Math.random()*pics.length)];
				this.list.push(item)
			},
			modeFun(){
				this.mode = !this.mode;
				this.col = this.mode ? 3 : 0;
				this.repaints(0,0.4);
			},
			repaints(){
				this.$refs.waterfall.repaints(0,0.4);
			},
			scroll(e){
				// console.log(e)
			}
		}
	}
</script>
<style lang="scss">
*{
	-webkit-tap-highlight-color: rgba(0,0,0,0);
	-webkit-tap-highlight-color:transparent;
	-webkit-user-select:none;
}
.home{
	font-size: 18px;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	flex: 1;
	height: 100%;
	align-items: center;
	background:#000;
	/*按钮浮层开始*/
	.header{
		position: fixed;
		z-index: 99;
		left: 50%;
		transform: translate(-50%, 0);
		bottom: 5%;
		background: rgba(0,0,0,.7);
		color:white;
	    border-radius: 20px;

		.range-container{
			display:block;
			>input{
				width: 70%;
			}
		}

		.switch-container{
			display: flex;
			align-items: center;
			justify-content: space-evenly;
		}

		input{
			vertical-align: middle;
		}

		input[type="range"]{
		  -webkit-appearance: none;
		  height:10px;
		  outline : none;
		  margin: 10px auto;
		  background:#98c379; 
		}

		input[type="range"]::-webkit-slider-thumb{
		  -webkit-appearance: none;
		  position: relative;    
		  width:30px;
		  height:30px;
		  background:#98c379;
		  border-radius:50%;
		}

		button{
			appearance: none;
			height: 30px;
			border-color: #088ef0;
		    background: -webkit-gradient(linear, left top, left bottom, from(#34a5f8), to(#088ef0));
		    background: linear-gradient(#34a5f8, #088ef0);
		    color:white;
		    border-radius: 120px;
		    margin: 0 3%;
		}

		/*switch开关开始*/
		.switch{
			appearance: none;
			-moz-appearance:button;
			-webkit-appearance: none;
		}

		.switch {
			position: relative;
			margin: 0;
			width: 60px;
			height: 30px;
			border: 1PX solid #EBEBF9;
			outline: 0;
			border-radius: 100px;
			box-sizing: border-box;
			background-color: #EBEBF9;
			-webkit-transition: background-color 0.1s, border 0.1s;
			transition: background-color 0.1s, border 0.1s;
		}

		.switch:after {
			content: " ";
			position: absolute;
			top: 0;
			left: 1px;
			width: 28px;
			height: 28px;
			border-radius: 100px;
			background-color: #FFFFFF;
			-webkit-transition: -webkit-transform 0.35s cubic-bezier(0.4, 0.4, 0.25, 1.35);
			transition: -webkit-transform 0.35s cubic-bezier(0.4, 0.4, 0.25, 1.35);
			transition: transform 0.35s cubic-bezier(0.4, 0.4, 0.25, 1.35);
		}

		.switch:checked{
			background: #00D287;
			border: solid 1px #00D287;
		}

		.switch:checked:before{
			transform: scale(0);
		}

		.switch:checked:after{
			transform: translateX(29px);
		}
		/*switch开关结束*/
	}

	@media only screen and (min-aspect-ratio: 20/9) {
	    .header{
			width: 130vh;
		    font-size: 1.5vw;
	    }
	}

	@media only screen and (max-aspect-ratio: 20/9) {
	    .header{
			width: 95vw;
		    font-size: 1.8vh;
	    }
	}
	/*按钮浮层结束*/

	/*瀑布流对应布局开始*/
	>.main{
		background: #795548;
		height: max-height;
		flex: auto;
		overflow-y: auto;
		overflow-x: hidden;
		/*瀑布流对应布局开始*/
		.waterfall-item{
			background: white;
			box-sizing: border-box;
			font-size: 20px;
			margin: 2px;
		}
		.waterfall-item img{
			width: 100%;
			display: block;
		}
		.bounceIn{
		    animation-name: bounceIn;
		    animation-duration: .6s;
		    animation-timing-function: linear;
		    transform-origin: center center;
		}
		@keyframes bounceIn{
		    0% {
			    opacity: 0;
			    -webkit-transform: scale(.3);
			    -ms-transform: scale(.3);
			    transform: scale(.3);
			}
			50% {
			    opacity: 1;
			    -webkit-transform: scale(1.05);
			    -ms-transform: scale(1.05);
			    transform: scale(1.05);
			}
			70% {
			    -webkit-transform: scale(.9);
			    -ms-transform: scale(.9);
			    transform: scale(.9);
			}

			100% {
			    opacity: 1;
			    -webkit-transform: scale(1);
			    -ms-transform: scale(1);
			    transform: scale(1);
			}
		}
	}
	/*瀑布流对应布局结束*/
}
</style>