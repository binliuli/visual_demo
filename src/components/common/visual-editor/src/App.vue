<template>
<div id="app">
  <h3>Display 模式</h3>
  <a @click="type1">出站</a>
  <a @click="addPoints">添加点</a>
  <a @click="zoomIn">放大</a>
  <a @click="exportImg" style="cursor:point;">导出图片</a>
  <a @click="doLayout('tree')" style="cursor:point;">树形布局</a>
  <a @click="doLayout('treeh')" style="cursor:point;">水平树形布局</a>
  <a @click="doLayout('treev')" style="cursor:point;">垂直树形布局</a>
  <a @click="doLayout('force')" style="cursor:point;">弹性布局</a>
  <input type="text">
  <div class="box">
    <draw ref="draw" brief-size="300" :showIconBrief="true" :showPopTip="true" :theme="theme" />
  </div>
</div>
</template>

<script>
import Draw from './components/index.vue';
import dataSet from './testData.json';
import bigData from './bigData.json';

export default {
  name: 'app',
  components: {
    Draw,
  },
  data() {
    return {
      dataSet,
      theme: 'qth',
    };
  },
  mounted() {
    dataSet.nodes.forEach((n) => {
      if (n.name.indexOf('反洗钱') > -1) {
        n.customStyle = {
          z: 200,
          scale: 4,
        };
      }
    });
    // const data1 = {
    //     nodes: [
    //       {
    //         id: "00f27132351533308f3bbaa25df2c9f6",
    //         name: '几点呀'
    //       },
    //       {
    //         id: "00f27132351533308f3bbaa25df2c9f1",
    //         name: '几点er'
    //       },
    //       {
    //         id: "00f27132351533308f3bbaa25df2c9f9",
    //         name: '几点oe'
    //       }
    //     ],
    //     links: [
    //       {
    //         name: '关系1',
    //         props: {},
    //         source: '00f27132351533308f3bbaa25df2c9f6',
    //         target: '00f27132351533308f3bbaa25df2c9f1'
    //       }
    //     ]
    //   };
    this.$refs.draw.setDisplayData(dataSet);
    // setTimeout(() => {
    //   this.$refs.draw.playAnim();
    //   this.$refs.draw.selectItems({ links: [this.$refs.draw.links[0]], nodes: [this.$refs.draw.nodes[0]] });
    //   setTimeout(() => {
    //     this.$refs.draw.selectItems({ nodes: this.$refs.draw.nodes.slice(2, 4) });
    //     // this.$refs.draw.selectLink(this.$refs.draw.links.slice(1, 4), true);
    //   }, 3000);
    // }, 1500);
  },
  methods: {
    zoomIn() {
      this.$refs.draw.zoomBy(0.4);
    },
    doLayout(type) {
      this.$refs.draw.layoutNodes(type);
    },
    addPoints() {
      this.$refs.draw.addDataSet(bigData.data, this.$refs.draw.nodes);
    },
    type1() {
      // this.$refs.draw.selectByCondition(node => node.selected);
      this.$refs.draw.selectLinksByCondition(link => link.source.selected);
    },
    exportImg() {
      const img = this.$refs.draw.getImage();
      this.img = img;
    },
  },
};
</script>

<style lang="less">
body,
html {
  padding: 0;
  margin: 0;
  position: relative;
  background: #f2f2f2;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 30px;
  background: #f2f2f2;
  > a {
    margin: 0 30px;
  }
  .box {
    width: 1000px;
    height: 800px;
    position: relative;
    // background: #fff;
    // background: #121212;
    background: rgba(1, 27, 39, 0.5);
  }
}
</style>
