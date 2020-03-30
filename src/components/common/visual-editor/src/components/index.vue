<template>
<div class="visual-editor-wrapper" :class="{loading: loadingLayout, hide: hideView}">
  <div class="drawer-canvas" ref="canvas" :class="{show: !hideOrigin}"></div>
  <div class="drawer-anim" ref="anim" :class="{show: playing && !zooming}"></div>
  <div class="add-ons-pop-tip" :class="{show: showPopTip && hoverNodeItem && !zooming && !draggingNode, addDark: theme === 'dark'}">
    <div class="wrapper" v-if="hoverNodeItem">
      <div class="name">
        {{hoverNodeItem.name}}
      </div>
      <div class="model" v-if="hoverNodeItem.model">
        <span class="label">类型:</span>{{hoverNodeItem.model.name}}
      </div>
      <div class="props">
        <div class="prop" v-for="(v, k) in hoverNodeItem.data" :key="k">
          <span class="label">{{k}}:</span>{{v}}
        </div>
      </div>
    </div>
  </div>
  <div class="add-ons-icon-brief" :class="{show: showIconBrief && !draggingNode, addDarkBrief: theme === 'dark'}">
    <div class="item" :title="item.name" v-for="item in briefModels" :key="item.id" @click="selectByBriefModel(item)" :class="{active: item.id === selectedModel.id}">
      <span class="icon" :style="item.style" v-if="isShowIcon(item.style)"></span>
      <span class="text">{{item.name}}</span>
    </div>
  </div>
  <div class="drawer-zoom" ref="zoom" :class="{show: zooming && briefMode}"></div>
  <div class="move-mask" ref="moveMask" :class="{'can-move': canMoveView}"></div>
</div>
</template>

<script>
import _ from "lodash";
// Class
import Undo from "./Undo";
// mixins
import Utils from "./Utils";
import Group from "./Group";
import AddOns from "./AddOns";
import ComputeNode from "./ComputeNode";
import ComputeNodeV from "./ComputeNodeV";
import Selection from "./Selection";
import Zoom from "./Zoom";
import Layout from "./Layout";
import Add from "./Add";
import Events from "./Events";
import Anim from "./Anim";

export default {
  // ['width', 'height', 'data', 'mode']
  props: {
    briefSize: {
      default: 100,
    },
    width: {
      default: "100%",
    },
    theme: {
      type: String,
      default: "white",
    },
    height: {
      default: "100%",
    },
    showIconBrief: {
      default: false,
    },
    showPopTip: {
      default: false,
    },
    mode: {
      type: String,
      default: "normal",
      validator(value) {
        // 这个值必须匹配下列字符串中的一个
        return ["normal", "link", "move", "display"].indexOf(value) !== -1;
      },
    },
  },
  data() {
    return {
      data: null,
      hideView: false,
      keyPressed: [],
      nodes: [],
      links: [],
      selectedModel: {},
      keyMap: {
        16: 'shift',
        91: 'cmd',
      },
    };
  },
  mixins: [Zoom, Add, Events, Layout, Selection, Utils, Group, Anim, ComputeNode, AddOns, ComputeNodeV],
  created() {
    // 这部分代码用于测试

    // this.$on("dblclick", e => {
    //   const pos = this.rescaleItem({
    //     x: e.offsetX,
    //     y: e.offsetY
    //   });
    //   this.addPoint({
    //     id: e.x * e.y,
    //     ...pos
    //   });
    // });

    // this.$on("contextmenu", d => {
    //   if (d.type === "group") {
    //     this.unGroup(d);
    //     return;
    //   }
    //   this.addPoints(
    //     d3.range(0, 50).map(i => {
    //       const id = parseInt(Math.random() * 100, 10);
    //       return {
    //         id
    //       };
    //     }),
    //     d,
    //     true
    //   );
    // });
  },
  mounted() {
    this.initDraw();
    this.initAnimCanvas();
    this.initUndo();
    this.initSelection();
    this.initGlobalEvent();
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeydown);
    window.addEventListener('keyup', this.handleKeyup);
  },
  destroyed() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('keyup', this.handleKeyup);
  },
  computed: {},
  methods: {
    handleKeydown(e) {
      const key = this.keyMap[e.keyCode];
      key && this.keyPressed.push(key);
      this.keyPressed.sort((a, b) => (a > b ? 1 : -1));
    },
    isShowIcon(style) {
      if (style.backgroundImage === "url('')") {
        return false;
      }
      return true;
    },
    handleKeyup(e) {
      const map = this.keyMap;
      const key = map[e.keyCode];
      const index = _.indexOf(this.keyPressed, key);
      this.keyPressed.splice(index, 1);
    },
    hasKey(k) {
      return _.indexOf(this.keyPressed, k) > -1;
    },
    handleResize() {
      this.zr.resize();
      this.animZR.resize();
    },
    setData(data) {
      this.data = data;
      this.setContent();
    },

    initUndo() {
      this.undoInst = new Undo();
    },

    unlock() {
      this.nodes.forEach((n) => {
        if (n.selected) {
          n.locked = false;
          n.fx = null;
          n.fy = null;
          this.unselectNode(n);
          setTimeout(() => {
            this.selectNode(n);
          }, 100);
        }
      });
    },

    lock() {
      this.nodes.forEach((n) => {
        if (n.selected) {
          n.locked = true;
          n.fx = n.x;
          n.fy = n.y;
          this.unselectNode(n);
          setTimeout(() => {
            this.selectNode(n);
          }, 100);
        }
      });
    },

    undo() {
      this.undoInst.undo();
    },
    redo() {
      this.undoInst.redo();
    },
    /**
     * 获取图上所有的点和线的数据
     * @function getData
     * @param {Object} [dataSet] 若有输入，则输出该输入清理过的数据
     * @returns {Object} 图上的点和线的集合
     */
    getData(dataSet) {
      const clearNode = (n) => {
        const node = {
          ...n,
        };
        node.x = Math.floor(node.x);
        node.y = Math.floor(node.y);
        if (node.group) {
          if (!node.group.id) {
            node.group.id = +new Date() + "" + Math.ceil(Math.random() * 1000);
          }
          node.group = node.group.id;
        }
        delete node.vx;
        delete node.vy;
        delete node.fx;
        delete node.fy;
        delete node.node;
        delete node.selected;
        delete node.hover;
        return node;
      };

      const links = dataSet ? dataSet.links : this.links;
      const nodes = dataSet ? dataSet.nodes : this.nodes;

      return {
        links: links.map((l) => {
          const line = {
            ...l,
          };
          delete line.line;
          delete line.anim;
          delete line.selected;
          line.source = line.source.id;
          line.target = line.target.id;
          return line;
        }),
        nodes: nodes.map(clearNode),
      };
    },

    /**
     * 获取当前绘图的Base64图片数据
     * @function getImage
     * @returns {Base64} Base64格式数据
     */
    getImage() {
      const canvas = this.zr.dom.getElementsByTagName('canvas')[0];
      return canvas.toDataURL('image/png', 1.0);
    },
    emitChange() {
      if (this.emitChangeTimeout) {
        clearTimeout(this.emitChangeTimeout);
      }
      this.emitChangeTimeout = setTimeout(() => {
        this.$emit('change', {
          nodes: this.nodes.filter(n => !n.group),
          links: this.links,
        });
        this.emitChangeTimeout = null;
      }, 100);
    },
    /**
     * 设置静态展示数据
     * @function setDisplayData
     * @param {Object} dataSet - 要展示的数据集
     * @param {Boolean} [noLayout] - 不需要重新布局，当数据中节点含位置信息时不使用
     */
    setDisplayData(dataSet, noLayout) {
      this.hideView = true;
      this.addDataSet(dataSet, [], true);
      if (noLayout) {
        return setTimeout(() => {
          this.zoomFit();
          this.hideView = false;
        }, 200);
      }
      return this.layoutNodes('grid', null, () => {
        this.layoutNodes('force', null, () => {
          setTimeout(() => {
            this.hideView = false;
          }, 200);
        }, true);
      }, true);
    },
  },
  watch: {
    nodes() {
      this.emitChange();
    },
    links() {
      this.emitChange();
    },
  },
};
</script>

<style lang="less">
.visual-editor-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  overflow: hidden;
  &.hide {
    opacity: 0;
  }

  &.loading:before {
    z-index: 100;
    position: absolute;
    top: 50%;
    left: 50%;
    content: '请稍候...';
    display: block;
    transform: translate(-50%, -50%);
    color: #ddd;
    font-size: 12px;
  }

  &.loading:after {
    z-index: 99;
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    content: '';
    background: #666;
  }

  .drawer-canvas,
  .drawer-anim,
  .drawer-zoom,
  .move-mask {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    overflow: hidden;
  }

  .drawer-anim,
  .drawer-canvas,
  .drawer-zoom {
    visibility: hidden;

    &.show {
      visibility: visible;
    }
  }

  .move-mask {
    visibility: hidden;
  }

  .move-mask.can-move {
    cursor: move;
    visibility: visible;
  }
  .add-ons-pop-tip {
    position: absolute;
    top:10px;
    right:10px;
    width: 170px;
    background: rgba(255,255,255,0.5);
    border: solid 1px rgba(0,0,0,0.1);
    border-radius: 4px;
    opacity: 0;
    visibility: hidden;
    &.show {
      visibility: visible;
      opacity: 1;
    }
    .wrapper {
      padding: 15px;
      font-size: 12px;
      color: #666;
      .name {
        font-size: 14px;
        font-weight: 500;
        color: #333;
        margin-bottom: 5px;
      }
      .model {
        margin-bottom: 7px;
        padding-bottom: 7px;
        border-bottom: solid 1px #eee;
      }
      .label {
        color: #aaa;
      }
      .prop {
        margin-bottom: 4px;
      }
    }
  }
  .addDark{
    // opacity: 0.5;
    background: rgba(16,28,51,0.9);
    border: 1px solid #2C75FF;
    border-radius: 0px;
    z-index: 1;
    .wrapper {
      padding: 13px 8px;
      font-size: 12px;
      width: 170px;
      font-family: PingFangSC-Regular;
      font-size: 12px;
      color: #efefef;
      letter-spacing: 0.34px;
      line-height: 22px;
      .name {
        font-family: SourceHanSansCN-Regular;
        font-size: 14px;
        color: #FFFFFF;
        letter-spacing: 0.43px;
        line-height: 21px;
      }
      .model {
        margin-bottom: 7px;
        padding-bottom: 7px;
        border-bottom: 1px solid #979797;
        width: 154px;
      }
      .label {
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: rgba(255,255,255,0.50);
        letter-spacing: 0.34px;
        line-height: 20px;
        margin-right: 3px;
      }
      .prop {
        margin-bottom: 4px;
      }
    }
  }

  .add-ons-icon-brief {
    position: absolute;
    top:10px;
    left:10px;
    background: rgba(255,255,255,0.5);
    border: solid 1px rgba(0,0,0,0.1);
    border-radius: 4px;
    white-space: nowrap;
    display: none;
    &.show {
      display: flex;
    }
    .item {
      padding: 8px;
      display: inline-block;
      font-size: 12px;
      color: #888;
      overflow: hidden;
      display: flex;
      &:hover {
        background: rgba(0,0,0,0.05);
        cursor: pointer;
      }
      span {
        display: inline-block;
      }
      .icon {
        width: 18px;
        height: 18px;
        background: no-repeat center center;
        background-size: contain;
      }
      .text {
        line-height: 18px;
        margin-left: 5px;
      }
    }
  }
  .addDarkBrief{
    position: absolute;
    top:10px;
    left:10px;
    background: #121212;
    opacity: 0.9;
    border-right: 1px solid #2C75FF;
    border-radius: 0 2px 2px 0;
    white-space: nowrap;
    display: none;
    &.show {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
    }
    .active{
      background: #2C75FF;
      color: #efefef;
      cursor: pointer;
    }
    .item {
      padding: 2px 13px;
      display: inline-block;
      font-size: 12px;
      color: #DFDFDF;
      overflow: hidden;
      cursor: pointer;
      @border:  1px solid #2C75FF;
      border: @border;
      border-right: none;
      // display: flex;
      text-align: center;
      flex-shrink: 0;
      width: 80px;
      text-overflow: ellipsis;
      justify-content: center;
      &:hover {
        background: #2C75FF;
        color: #efefef;
        cursor: pointer;
      }
      &:nth-last-of-type(1){
        border-right: @border;
      }
      span {
        display: inline-block;
      }
      .icon {
        width: 14px;
        height: 14px;
        background: no-repeat center center;
        background-size: contain;
        top: 1px;
        position: relative;
      }
      .text {
        line-height: 18px;
        margin-left: 5px;
      }
    }
  }
}
</style>
