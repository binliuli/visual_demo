<template>
<div class="toolbar">
    <!-- <div class="toolbar-line">
        <div class="section layout margin26">
            <el-button @click="$emit('layout', 'force')" class="btn-img">
                <img src="~assets/images/visual/tanlibuju.png" class="tool-img" title="力布局">
                <span class="tool-text">弹性布局</span>
            </el-button>
            <el-button @click="$emit('layout', 'grid')" class="btn-img">
                <img src="~assets/images/visual/wangzhuangbuju.png" :disabled="grouped" class="tool-img" title="矩形布局">
                <span class="tool-text">矩形布局</span>
            </el-button>
            <el-button @click="$emit('layout', 'ring')" class="btn-img">
                <img src="~assets/images/visual/yuanxingbuju.png" :disabled="grouped" class="tool-img" title="圆形布局">
                <span class="tool-text">圆形布局</span>
            </el-button>
            <el-button @click="$emit('layout', 'tree')" class="btn-img">
                <img src="~assets/images/visual/shuxingbuju.png" :disabled="grouped" class="tool-img" title="树形布局">
                <span class="tool-text">树形布局</span>
            </el-button>
        </div>
        <div class="section margin26">
            <el-button @click="$emit('modechange','normal')" class="btn-img">
                <img src="~assets/images/visual/xuanzemoshig.png" class="tool-img" title="选择模式" v-if="mode=='normal'">
                <img src="~assets/images/visual/xuanzemoshi.png" class="tool-img" title="选择模式" v-else>
                <span class="tool-text">选择模式</span>
            </el-button>
            <el-button @click="$emit('modechange','move')" class="btn-img">
                <img src="~assets/images/visual/yidongmoshig.png" class="tool-img" title="移动模式" v-if="mode=='move'">
                <img src="~assets/images/visual/yidongmoshi.png" class="tool-img" title="移动模式" v-else>
                <span class="tool-text">移动模式</span>
            </el-button>
            <el-button @click="$emit('modechange','link')" :type="mode=='link'?'primary':''" class="btn-img">
                <img src="~assets/images/visual/tianjiaguanxig.png" class="tool-img" title="添加关系" v-if="mode=='link'">
                <img src="~assets/images/visual/tianjiaguanxi.png" class="tool-img" title="添加关系" v-else>
                <span class="tool-text">添加关系</span>
            </el-button>
        </div>
        <div class="section play">
            <el-button @click="$emit('play')" icon="icon-play1" class="btn-img-p">开始</el-button>
            <el-button @click="$emit('stop')" icon="icon-stop" class="btn-img-p">停止</el-button>
        </div>
        <div class="section float-right">
            <el-button @click="$emit('save')" type="success" class="btn-img">
                <img src="~assets/images/visual/baocun.png" class="tool-img" title="保存">
                <span class="tool-text">保存</span>
            </el-button>
            <el-button @click="$emit('add')" class="btn-img">
                <img src="~assets/images/visual/tianjiaduixiang.png" class="tool-img" title="添加对象">
                <span class="tool-text">添加对象</span>
            </el-button>
        </div>
    </div> -->
    <div class="toolbar-sub">
        <!-- <div class="section style">
        <span class="label">连线样式：</span>
        <el-color-picker
          v-model="lineStyle.lineColor"
          size="mini"
          :disabled="!linksSelected"
          @change="setLineStyle"
        ></el-color-picker>
        <el-select
          v-model="lineStyle.lineWidth"
          size="mini"
          style="width: 70px"
          placeholder="粗细"
          :disabled="!linksSelected"
          @change="setLineStyle"
        >
          <el-option v-for="[label, val] in lineSizes" :key="val" :value="val" :label="label"></el-option>
        </el-select>
        <el-select
          v-model="lineStyle.fontSize"
          size="mini"
          style="width: 70px"
          placeholder="字号"
          :disabled="!linksSelected"
          @change="setLineStyle"
        >
          <el-option v-for="[label, val] in fontSizes" :key="val" :value="val" :label="label"></el-option>
        </el-select>
      </div> -->
        <!-- <div class="section style">
        <span class="label">节点样式：</span>
        <el-select
          v-model="nodeStyle.scale"
          size="mini"
          style="width: 70px"
          placeholder="尺寸"
          :disabled="!nodesSelected"
          @change="setNodeStyle"
        >
          <el-option v-for="[label, val] in nodeSizes" :key="val" :value="val" :label="label"></el-option>
        </el-select>
      </div> -->

        <!-- <div class="section lock">
        <el-button size="mini" @click="$emit('lock')" :disabled="!nodesSelected" type="text">钉住</el-button>
        <el-button
          size="mini"
          @click="$emit('unlock')"
          :disabled="!nodesSelected || !locked"
          type="text"
        >解开</el-button>
      </div>

      <div class="section combine">
        <el-button size="mini" @click="$emit('group')" type="text" :disabled="!canGroup">组合</el-button>
        <el-button
          size="mini"
          @click="$emit('ungroup', groupData)"
          type="text"
          :disabled="!grouped"
        >解散</el-button>
      </div> -->

        <!-- <div class="section">
        <el-button size="mini" @click="$emit('delete')" :disabled="!canRemove" type="text">移除</el-button>
      </div>

      <div class="section selected">
        <div class="select-info" v-if="!selected">未选中节点</div>
        <div class="select-info" v-if="selected">选中{{selected}}个节点</div>
      </div> -->

        <div class="sectionFloat" >
            <!-- $emit('isCus') -->
            <div class="select-info is" :class="{isa: isCus}" @click="changeCus('cus')">
                <img src="~assets/images/visual/el-coutomRelation.png" class="toolRight-img">
                客户关系网络
            </div>
            <div class="select-info is" :class="{isa: isMon}" @click="changeCus('mon')">
                <img src="~assets/images/visual/el-moneyQuery.png" class="toolRight-img">
                资金交易网络
            </div>
            <!-- pay, cc, pc -->
        </div>
        <div class="sections lock">
            <div class="section select">
                <el-button class="selectBtn" size="mini" @click="$emit('select', {
                    type: 'all'
                  })" type="text">全选</el-button>
                <el-button class="selectBtn" size="mini" @click="$emit('select', {
                    type: 'reverse'
                  })" type="text">反选</el-button>
                <el-button class="selectBtn" size="mini" @click="$emit('select', {
                    type: 'leaf'
                  })" type="text">叶实体</el-button>
                <el-button size="mini" @click="$emit('select', {
                    type: 'insite'
                  })" type="text" :class="nodesSelected ? 'active' : 'noActive'">入站</el-button>
                <el-button size="mini" @click="$emit('select', {
                    type: 'outsite'
                  })" type="text" :class="nodesSelected ? 'active' : 'noActive'">出站</el-button>
                <el-button size="mini" @click="$emit('select', {
                    type: 'nodes'
                  })" type="text" :class="nodesSelected ? 'active' : 'noActive'">端点</el-button>
                <el-button size="mini" @click="$emit('select', {
                    type: 'lines'
                  })" type="text" :class="nodesSelected ? 'active' : 'noActive'">连线</el-button>
                <el-button size="mini" @click="$emit('select', {
                    type: 'l_n'
                  })" type="text" :class="nodesSelected ? 'active' : 'noActive'">连线和端点</el-button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import {
    mapState
} from "vuex";

export default {
    props: {
        mode: {
            default: "normal"
        },
        selected: {
            default: 0
        },
        selectedItems: {
            default () {
                return {
                    links: [],
                    nodes: []
                };
            }
        }
    },
    components: {},
    data() {
        return {
            lineSizes: [
                ["粗", 8],
                ["正常", 2],
                ["细", 1]
            ],
            nodeSizes: [
                ["超大", 2],
                ["大", 1.5],
                ["正常", 1],
                ["小", 0.7]
            ],
            fontSizes: [
                ["8", 8],
                ["12", 12],
                ["14", 14],
                ["16", 16],
                ["18", 18],
                ["20", 20]
            ],
            lineStyle: {},
            nodeStyle: {},
            isCus: false,
            isMon: false
        };
    },
    created() {},
    computed: {
        nodesSelected() {
            let scale;
            this.selectedItems.nodes.forEach((l, i) => {
                const style = l.customStyle || {};
                if (i === 0) {
                    scale = style.scale || 1;
                }

                if (scale != style.scale) {
                    scale = null;
                }
            });

            this.nodeStyle = {
                scale
            };
            return this.selectedItems.nodes.length;
        },
        linksSelected() {
            let fontSize, lineColor, lineWidth;
            this.selectedItems.links.forEach((l, i) => {
                const style = l.customStyle || {};
                if (i === 0) {
                    lineColor = style.lineColor;
                    fontSize = style.fontSize;
                    lineWidth = style.lineWidth;
                }

                if (lineColor != style.lineColor) {
                    lineColor = null;
                }

                if (fontSize != style.fontSize) {
                    fontSize = null;
                }

                if (lineWidth != style.lineWidth) {
                    lineWidth = null;
                }
            });

            this.lineStyle = {
                fontSize,
                lineColor,
                lineWidth
            };

            return this.selectedItems.links.length;
        },
        canRemove() {
            return this.selectedItems.nodes.length || this.selectedItems.links.length;
        },
        locked() {
            return this.selectedItems.nodes.filter(n => n.locked).length;
        },
        grouped() {
            return (
                this.selectedItems.nodes.filter(n => n.type === "group").length > 0
            );
        },
        canGroup() {
            return (
                !this.selectedItems.nodes.filter(n => n.group).length &&
                this.selectedItems.nodes.length > 1
            );
        },
        groupData() {
            return this.selectedItems.nodes.filter(n => n.type === "group");
        }
    },
    methods: {
        createEntity() {
            console.log("");
        },
        setLineStyle() {
            this.$emit("linkstylechange", {
                links: this.selectedItems.links,
                style: this.lineStyle
            });
        },
        setNodeStyle() {
            this.$emit("nodestylechange", {
                nodes: this.selectedItems.nodes,
                style: this.nodeStyle
            });
        },
        changeCus(type) {
            if (type === "cus") {
                this.isCus = !this.isCus;
            }
            if (type === "mon") {
                this.isMon = !this.isMon;
            }
            this.$emit("filterCus", {
                cus: this.isCus,
                mon: this.isMon
            });
        }
    }
};
</script>

<style lang="less">
@import "~assets/styles/mixins";
@import "~assets/styles/vars";

.toolbar {
    width: calc(100%-70px);
    margin-left: 70px;
    background: #2C3445;
    box-shadow: 0 2px 4px 0 rgba(209,209,209,0.50);
    border-radius: 2px;

    .section {
        // margin-right: 20px;
        display: inline-block;
        vertical-align: middle;
        height: 44px;
        line-height: 44px;

        // .el-button--success{
        //   border: none;
        //   background: none;
        // }
        // .el-button--small, .el-button--small.is-round{
        //   padding: 4px;
        // }
        .btn-img {
            border: none !important;
            background: none !important;
            padding: 0 10px 0 0 !important;
            margin-left: 0 !important;
            margin-top: 4px;
        }

        .btn-img-p {
            border: none !important;
            background: none !important;
            padding: 0 30px 0 0 !important;
            margin-left: 0 !important;
        }

        &.style {
            >* {
                display: inline-block;
                vertical-align: middle;
                margin-right: 10px;
            }

            .label {
                font-size: 12px;
                color: @gray;
            }
        }

        .el-button+.el-button {
            margin-left: 0px;
        }
    }

    .lock {
        margin-right: 15px;
    }

    .combine {
        margin-right: 15px;
    }

    .line {
        opacity: 0.29;
        background: #61707f;
        width: 1px;
        height: 25px;
        margin-right: 30px;
        display: inline-block;
        line-height: 30px;
    }

    .tool-img {
        width: 44px;
        height: 20px;
        margin-bottom: 4px;
        display: block;
        // margin-top: 4px;
    }
    .toolRight-img {
        width: 16px;
        height: 16px;
        margin-bottom: -3px;
    }

    .float-right {
        float: right;
    }

    .margin26 {
        margin-right: 26px !important;
    }

    .tool-text {
        font-family: PingFangSC-Regular;
        font-size: 11px;
        color: rgba(0, 0, 0, 0.6);
    }

    .toolbar-line {
        box-sizing: border-box;
        padding: 1px 20px 0px 30px;
        border-bottom: solid 1px @gray-light;
        // border-top: solid 1px @gray-light;
        background: @gray-lighter;
        height: 50px;

        i {
            font-size: 15px;

            &~span {
                position: relative;
                margin: 0px 0 0 5px;
                top: -1px;
                font-size: 13px;
            }
        }
    }

    .toolbar-sub {
        padding: 3px 30px;
        border-bottom: solid 1px @gray-light;

        .section {
            height: 30px;
            line-height: 30px;
        }

        .is {
            display: inline-block !important;
            line-height: 25px !important;
            padding: 0 5px;
            cursor: pointer;
        }

        .isa {
            border: 1px solid rgb(39, 125, 251);
            background: #D9DBE0;
            border-radius: 4px;
            border: 1px solid #ABABAB;
        }

        .select-info {
            margin-left: 20px;
            border: 1px solid #ABABAB;
            border-radius: 4px;
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: #FEFEFE;
            margin-top: 2px;
        }
    }

    .sectionFloat {
      float: right;
    }
   
    .section {
        height: 30px;
        line-height: 30px;

        button {
            margin-right: 5px;
        }

        &:first-of-type .select-info {
            margin-left: 0;
        }
        .selectBtn {
          color: #FEFEFE;
        }
        .noActive {
          color: #ABABAB
        }
        .active {
          color: #FEFEFE;
        }
    }
}
</style>
