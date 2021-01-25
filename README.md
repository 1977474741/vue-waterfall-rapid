# vue-waterfall-rapid
## 一款基于vue的瀑布流组件，支持各种使用场景，灵活度高，简单易用。
###### `1.支持没有图片高度 && 不影响渲染速度。`
###### `2.支持无图模式。`
###### `3.支持自由绑定动画。`
###### `4.支持根据容器自适应。`
demo：https://1977474741.github.io/vue-waterfall-rapid/demo/#/
<div align=center ><img width="230" height="230" src="https://pubser-res.zhenai.com/other/temp/202101/25/1616397889193.png"/></div>

## 使用
#### 1.安装
```javaScript
    npm i vue-waterfall-rapid
```
#### 2.示例
html
```html
<div class="main" @scroll="scroll">
    <waterfall :col="col" :autoResize="autoResize" :moveTransitionDuration="0.4" :fillBox="fillBox" :col-        width="colWidth" :list="list" ref="waterfall" imgKey="src">
        <!-- 有 指定图片的Key（ imgKey="src"） 和 在img标签上加class（ class="waterfall-img"） 两种绑定模式 -->
        <!-- img标签如果设置宽高会渲染的更快 -->
        <div class="waterfall-item" :class="{bounceIn:item.state == 'show'}" slot-scope="item">
            <img v-if="item.data.src" style="width: 100%" class="waterfall-img" :src="item.data.src">
            {{item.index}}-{{item.data.text}}
        </div>
    </waterfall>
</div>
```
javascript
```javascript
    import waterfall from '@/components/vue-waterfall-rapid.vue'
    export default {
        name: 'vue-waterfall-rapid',
        components: {
            waterfall
        },
        data(){
            return{
                //是否根据容器尺寸自动计算重绘
                autoResize:true,
                //是否始终填满容器
                fillBox: false,
                //列宽-有指定列数则此属性失效
                colWidth: window.innerWidth / 5,
                //列数
                col: 0,
                //图片数据
                list: []
            }
        },
        mounted(){
            this.$refs.waterfall.onRender = (res)=>{
                console.log('渲染完毕',res);
            }
        },
        methods:{
            scroll(e){
                // console.log(e)
            }
        }
    }
```
### 参数<font color=#C39178 size=2></font>
| 属性           | 类型   | 缺省值  | 描述  |
| ------------- |:------:|:------:|:-----:|
| list      | Array  | 无       |要渲染的数据|
| imgKey    | String | src      |指定图片在list里的key（或者在img标签上加 class="waterfall-img"）|
| col       | Number | 3        |列数，手动设置时会覆盖掉colWidth|
| colWidth  | Number | 0（px）  |列宽，和col冲突时，col优先|
| autoResize| Boolean | false   |是否随容器宽度变化重绘|
| fillBox   | Boolean | false   |是否填充满容器|
| moveMode  | String | transform |定位方式（transform、convention）|
| moveTransitionDuration| Number | 0.4（s）     |位置变化时的过渡时间|
### 函数
| 函数名         | 参数          | 返回值  |描述|
| ------------- |:------:   |:------:|:------:|
| repaints      |  start（开始的下标），duration（过渡时间 s）  |   无   |手动重绘|
### 事件
| 属性名         | 参数  | 回调内返回值  |描述|
| ------------- |:------:|:------:|:------:|
| onRender      |  callback  |   { cause（导致渲染的原因），start（开始渲染的下标） }   |渲染完毕事件|

如果有什么好的建议欢迎提issues或者提pr