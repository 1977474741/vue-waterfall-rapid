<template>
    <div ref="main" class="main" id="main" :style="{height: maxH + 'px'}">
        <div class="item" :class="[moveMode,styleArr[i] && styleArr[i].showClass]" v-for="(item,i) in list" :style="styleArr[i]" :ref="'item'+i">
            <slot :state="(styleArr[i] && styleArr[i].state) || 'loading'" :data="item" :index="i"></slot>
        </div>
        <iframe v-if="autoResize" ref="autoExpand" class="autoExpand"></iframe>
    </div>
</template>
<script>
    let loaderCache = {};
    let loaderImg = new Map();
    let time = null;
    export default {
        props:{
            list:{
                type: Array,
                default: ()=>[]
            },
            imgKey:{
                type: String,
                default: 'src' 
            },
            // 列数
            col: {
                type: Number,
                default: 0
            },
            // 列宽，和列数只能生效其一，列数优先
            colWidth:{
                type: Number,
                default: 0
            },
            // 是否根据容器宽度变化重新计算
            autoResize: {
                type: Boolean,
                default: true
            },
            // 是否填充满容器
            fillBox: {
                type: Boolean,
                default: false
            },
            // 移动模式transform、convention
            moveMode: {
                type: String,
                default: 'transform' 
            },
            // 自动重绘时的过渡时间
            moveTransitionDuration:{
                type: Number,
                default: .4
            }
        },
        data(){
            return {
                styleArr: [],//数据对应的样式
                colW: 0,//列宽
                maxH: 1,//最高的列
                mainW: 0,//容器宽度
                _col: 0,//列缓存
                __col: 0,//内部维护列数
                batchCB: null,//批处理Promise
                onRender: null,//渲染完毕回调函数
            }
        },
        computed: {
            //窗口改变节流函数
            resizeDebounce(){
                return this.isTransition ? this.debounce(this.resize,100) : this.resize;
            },
            //默认过渡的条件规则
            isTransition(){
                return this.autoResize && this.col < 1;
            },
        },
        mounted(){
            this.mainW = this.getWidth();
            this.init();
            this.polling();
        },
        watch:{
            ['list.length']:{
                deep: false,
                async handler(newV,oldV){
                    if(newV > oldV){
                        await this.$nextTick();
                        this.batchCB = this.initItem(oldV);
                    }
                }
            },
            autoResize:{
                handler(newV){
                    newV && setTimeout(()=>{
                        this.$refs.autoExpand.contentWindow.onresize = (e)=>{
                            this.resizeDebounce();
                        }
                    })
                },
                immediate: true
            },
        },
        methods: {
            repaints(start = 0,duration){
                this.$nextTick(()=>{
                    this.mainW = this.getWidth();
                    this.calcCol();
                    this.calcXY(start,'repaints',duration);
                })
            },
            init(start = 0){
                this.calcCol();
                this.batchCB = this.initItem(start);
            },
            getWidth(){
                return (this.$refs.main.getBoundingClientRect() || {}).width || 0;
            },
            async resize(start = 0){
                if(!this.$refs.main) return;
                let width = this.getWidth();
                if(width == this.mainW) return;
                this.mainW = width;
                this.calcCol();
                if(this.autoResize){
                    if(this.fillBox || this.col || this.__col != this._col){
                        this.calcXY(start,'resize');
                    }
                }
            },
            calcCol(){
                let col = 3;
                if(this.col){
                    col = this.col;
                    this.colW = this.mainW / col;
                }else if(this.colWidth){
                    col = parseInt(this.mainW / this.colWidth) || 1
                    if(this.mainW % this.colWidth && this.fillBox){
                        this.colW = this.mainW / col;
                    }else{
                        this.colW = this.colWidth;
                    }
                }else{
                    this.colW = this.mainW / col;
                }
                this.__col = col;
                return col;
            },
            polling(){
                clearInterval(time);
                time = setInterval(()=>{
                    for(let item of loaderImg){
                        let key = item[0];
                            item = item[1];
                        if(item.img.height > 0 || item.img.complete){
                            item.cb(item.img);
                            loaderImg.delete(key);
                        }else{
                            return
                        }
                    }
                },300)
            },
            initItem(start = 0){
                return new Promise((reslove,reject)=>{
                    let list = this.list.slice(start);
                    let loadNum = 0;
                    list.forEach((e,i)=>{
                        let _i = i + start;
                        this.loader(e[this.imgKey],()=>{
                            loadNum ++;
                            if(!this.styleArr[_i]){
                                this.styleArr[_i] = {};
                            }
                            this.styleArr[_i].width = this.colW + 'px';
                            this.styleArr[_i].complete = true;
                            this.styleArr[_i].state = 'complete';
                            this.$set(this.styleArr,_i,this.styleArr[_i]);
                            if(loadNum != list.length)return;
                            this.waitRender(start);
                        },this.getColDom(_i).getElementsByClassName('waterfall-img')[0],i);
                    })
                })
            },
            waitRender(start){
                for (var i = 0; i < this.styleArr.length; i++) {
                    if(i < start){
                        if(!this.styleArr[i] || !this.styleArr[i].complete) return
                    }
                }
                this.calcXY(start);
            },
            calcXY(index = 0,cause = 'data',duration){
                let idx = index;
                this._col = this.__col;
                for(let i = index; i < this.styleArr.length; i++){
                    if(!this.styleArr[i]) continue;
                    this.styleArr[i].width = this.colW + 'px';
                    if(this.styleArr[i].showClass){
                        if(duration || this.isTransition){
                            this.styleArr[i]['transition-duration'] = `${duration || this.moveTransitionDuration}s`;
                        }else if(this.styleArr[i].showClass){
                            this.styleArr[i]['transition-duration'] = `0s`;
                        }
                    }
                }
                this.$nextTick(()=>{
                    for(let i = idx; i < this.styleArr.length; i++){
                        if(!this.styleArr[i]) return;
                        const e = this.getColDom(i);
                        if(!e) return;
                        // 获取当前元素高度
                        this.styleArr[i].height = e.offsetHeight;
                        let xy = this.getMinCol(i)
                        const curTop = xy.curTop,
                            curCol = xy.curCol,
                            curBT = curTop + this.styleArr[i].height,
                            maxH = xy.maxH > curBT ? xy.maxH : curBT;
                        if(this.moveMode == 'convention'){
                            this.styleArr[i].left = `${curCol * this.colW}px`;
                            this.styleArr[i].top = `${curTop}px`;
                        }else{
                            this.styleArr[i].transform = `translate3d(${curCol * this.colW}px, ${curTop}px ,0)`; 
                        }
                        this.maxH = maxH;
                        this.styleArr[i].bottomTop = curBT;
                        this.styleArr[i].col = curCol;
                        this.styleArr[i].showClass = 'show';
                        this.styleArr[i].state = 'show';
                    }
                    this.$forceUpdate();
                    this.$nextTick(()=>{
                        this.onRender && this.onRender({
                            cause: cause,
                            start: index
                        });
                    })
                })
            },
            getMinCol(curIndex){
                if(!curIndex){
                    return {
                        curCol: 0,
                        curTop: 0,
                        maxH: 0
                    };
                }
                let curCol = 0,
                    curTop = 0;
                let set = {};
                for (let index = curIndex - 1;index >= 0; index--) {
                    const item = this.styleArr[index];
                    if(item && !set[item.col]){
                        set[item.col] = item;
                    }
                    if(Object.keys(set).length == this.__col){
                        break;
                    }
                }
                let order = Object.values(set).sort((a,b)=>a.bottomTop - b.bottomTop);
                if(curIndex < this.__col){
                    curCol = curIndex;
                    curTop = 0;
                }else{
                    curCol = order[0].col;
                    curTop = order[0].bottomTop;
                }
                return {
                    curCol,
                    curTop,
                    maxH: order[order.length-1].bottomTop
                };
            },
            loader(src,cb,imgDom = {},i){
                if(imgDom.height > 0) {
                    return cb(img)
                };
                if(!src && !imgDom.src) return cb();
                if(imgDom.src){
                    src = imgDom.src;
                }
                let img = loaderCache[src] && loaderCache[src].img;
                if(img){
                    if(img.complete || img.height > 0) return cb(img);
                }else{
                    if(imgDom.src){
                        img = imgDom;
                    }else{
                        img = new Image();
                        img.src = src;
                    }
                    if(img.complete || img.height > 0) return cb(img);
                    loaderCache[src] = {
                        img: img,
                        cbs: [],
                        i
                    };
                    loaderImg.set(img.src,{
                        img,cb:()=>{
                            loaderCache[src].cbs.forEach(cb=>cb())
                            loaderCache[src].cbs.length = 0;
                        }
                    })
                }
                loaderCache[src].cbs.push(cb);
            },
            getColDom(i){
                return this.$refs['item'+i][0];
            },
            debounce(func, wait) {
                let timer;
                return function() {
                  let context = this;
                  let args = arguments;
                  if (timer) clearTimeout(timer);
                  timer = setTimeout(() => {
                    func.apply(this, args)
                  }, wait)
                }
            }
        },
    }
</script>

<style scoped>
.main{
    position: relative;
    width:100%;
    height: 100%;
    overflow: hidden;
    transition-property: height;
}
.main>.item{
    position: absolute;
    z-index: 1;
    opacity: 0;
    box-sizing: border-box;
    transform: translate3d(0,0,0);
}
.convention{
    transition-property: top,left;
}
.transform{
    transition-property: transform;
}
.show{
    opacity: 1!important;
}
.main>.col{
    float: left;
}
.col>.item{
    width:100%;
}
.autoExpand{
    opacity: 0;
    position:absolute;
    left:-100%;
    top:-100%;
    width:100%;
    height:100%;
    visibility:hidden;
    pointer-events:none;
}
</style>
