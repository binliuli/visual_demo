<template>
  <div class="visualmenu" v-if="menuOriginData.display">
    <rightmenucommon ref='menuchild'
       :menudata="menuDataResult"
       :menupos="menuPosResult"
       @closeMenu="closeMenu"
       @rightmenuclick="rightmenuclickhandler"></rightmenucommon>
  </div>
</template>

<script>
/**
 *  menuOriginData = {
 *    display: true,
 *    event: {},
 *    nodes: [],
 *  }
 */
import _ from 'lodash';
import rightmenucommon from './rightmenucommon.vue';


export default {
  name: 'visualmenu',
  components: {
    rightmenucommon
  },
  props: ['menuOriginData'],
  data() {
    return {
      menuDataResult: {
        displaydata: [],
        origindata: {}
      },
      menuPosResult: {}
    };
  },
  methods: {
    closeMenu() {
      this.menuOriginData.display = false;
    },
    rightmenuclickhandler(e) {
      this.$emit('rightMenuCallback', e)
    },
    initData() {
      if (!this.menuOriginData) {
        return;
      }
      if (this.menuOriginData.nodes.length == 0 && this.menuOriginData.links.length == 1) {
          //  this.menuDataResult = {
          //    displaydata: [
          //      {
          //       id: '10',
          //       title: '查看明细',
          //       fill: '#5B95F2',
          //       iconsrc: require('../../assets/images/yichu.png'),
          //       sub: []
          //     },
          //    ],
          //    origindata: this.menuOriginData
          //  }
          //  this.menuPosResult = {
          //     display: this.menuOriginData.display,
          //     ev: this.menuOriginData.event.event
          //   };
        this.menuDataResult = {
          displaydata: [
            {
              id: '5',
              title: '查看明细',
              fill: '#ffffff',
              iconsrc: require('../../assets/images/el-checkDetailMode.png'),
              sub: []
            },
            {
              id: '41',
              title: '选择',
              iconsrc: require('../../assets/images/xuanze.png'),
              fill: '#8077FF',
              sub: [
                {
                  id: '4-0',
                  title: '全选',
                  fill: '#6EB3FF',
                  iconsrc: require('../../assets/images/quanxuan.png'),
                },
                {
                  id: '4-1',
                  title: '反选',
                  fill: '#6E85FF',
                  iconsrc: require('../../assets/images/fanxuan.png'),
                },
                {
                  id: '4-2',
                  title: '取消选择',
                  fill: '#946EFF',
                  iconsrc: require('../../assets/images/quxiaoxuanze.png'),
                },
                {
                  id: '4-3',
                  title: '全部实体',
                  fill: '#EC6A7D',
                  iconsrc: require('../../assets/images/quanbushiti.png'),
                },
                {
                  id: '4-4',
                  title: '全部事件',
                  fill: '#BF78F7',
                  iconsrc: require('../../assets/images/quanbushijian.png'),
                }
              ]
            },
            
          ],
          origindata: this.menuOriginData
        };

        this.menuPosResult = {
          display: this.menuOriginData.display,
          ev: this.menuOriginData.event.event
        };

      
          
      }else {
        this.menuDataResult = {
          displaydata: [
            {
              id: '1',
              title: '关联查询',
              iconsrc: require('../../assets/images/guanlianchaxunt.png'),
              fill: '#ffffff',
              sub: [
                // {
                //   id: '1-0',
                //   title: '关联事件',
                //   fill: '#81D284',
                //   iconsrc: require('../../assets/images/visual/guanlianshijian.png'),
                // },
                // {
                //   id: '1-1',
                //   title: '关联对象',
                //   fill: '#60CFEF',
                //   iconsrc: require('../../assets/images/visual/guanlianshiti.png'),
                // },
                // {
                //   id: '1-2',
                //   title: '关联文档',
                //   fill: '#54ADFF',
                //   iconsrc: require('../../assets/images/visual/guanlianwendang.png'),
                // },
                // {
                //   id: '1-3',
                //   title: '关联附件',
                //   fill: '#EC6A7D',
                //   iconsrc: require('../../assets/images/visual/guanlianlujing.png'),
                // },
                // {
                //   id: '1-4',
                //   title: '环路查询',
                //   fill: '#c194d0',
                //   iconsrc: require('../../assets/images/visual/xunhuan.png')
                // }
              ]
            },
            {
              id: '0',
              title: '删除',
              fill: '#5B95F2',
              iconsrc: require('../../assets/images/yichu.png'),
              sub: []
            },
            {
              id: '41',
              title: '选择',
              iconsrc: require('../../assets/images/xuanze.png'),
              fill: '#8077FF',
              sub: [
                {
                  id: '4-0',
                  title: '全选',
                  fill: '#6EB3FF',
                  iconsrc: require('../../assets/images/quanxuan.png'),
                },
                {
                  id: '4-1',
                  title: '反选',
                  fill: '#6E85FF',
                  iconsrc: require('../../assets/images/fanxuan.png'),
                },
                {
                  id: '4-2',
                  title: '取消选择',
                  fill: '#946EFF',
                  iconsrc: require('../../assets/images/quxiaoxuanze.png'),
                },
                {
                  id: '4-3',
                  title: '全部实体',
                  fill: '#EC6A7D',
                  iconsrc: require('../../assets/images/quanbushiti.png'),
                },
                {
                  id: '4-4',
                  title: '全部事件',
                  fill: '#BF78F7',
                  iconsrc: require('../../assets/images/quanbushijian.png'),
                }
              ]
            },
            
          ],
          origindata: this.menuOriginData
        };

        this.menuPosResult = {
          display: this.menuOriginData.display,
          ev: this.menuOriginData.event.event
        };

        // 展开关系入口
        const isFoldedRelation = (link) => {
          const props = link.props;
          return props && props.count > 0 && props.name;
        };
        const showUnfoldRelationToNode = this.menuOriginData.links.length === 1 && isFoldedRelation(this.menuOriginData.links[0]);
        showUnfoldRelationToNode && this.menuDataResult.displaydata.push(
          {
            id: '2',
            fill: '#6C62FA',
            title: '展开关系',
            iconsrc: require('../../assets/images/zhankaiguanxi.png'),
            sub: []
          }
        );

        // 合并实体入口
        let dupNodeCount = 0;
        let foldedNodeCount = 0
        this.menuOriginData.nodes.forEach(n => {
          const type = _.get(n, 'model.type');
          if(type === 0) {
            dupNodeCount += 1;
          }
        });
        this.menuOriginData.nodes.forEach(n => {
          const type = _.get(n, 'model.type');
          if(type === -2) {
            foldedNodeCount += 1;
          }
        });

        dupNodeCount >= 2 && this.menuDataResult.displaydata.push(
          {
            id: '2',
            fill: '#41C394',
            title: '合并实体',
            iconsrc: require('../../assets/images/hebingshiti.png'),
            sub: []
          }
        );

        foldedNodeCount && this.menuDataResult.displaydata.push(
          {
            id: '2',
            fill: '#4F98F6',
            title: '展开实体',
            iconsrc: require('../../assets/images/zhankaishiti.png'),
            sub: []
          }
        );


        // 合并展开事件节点入口
        let eventNodeCount = 0;
        let foldedEventNodes = 0;
        this.menuOriginData.nodes.forEach(n => {
          const type = _.get(n, 'model.type');
          if(type === 1) {
            eventNodeCount += 1;
          }
        });

        this.menuOriginData.nodes.forEach(n => {
          const type = _.get(n, 'model.type');
          if(type === -1) {
            foldedEventNodes += 1;
          }
        });

        eventNodeCount && this.menuDataResult.displaydata.push(
          {
            id: '2',
            fill: '#F8BD59',
            title: '合并事件',
            iconsrc: require('../../assets/images/hebingshijian.png'),
            sub: []
          }
        );

        foldedEventNodes && this.menuDataResult.displaydata.push(
          {
            id: '2',
            fill: '#F56D85',
            title: '展开事件',
            iconsrc: require('../../assets/images/zhankaishijian.png'),
            sub: []
          }
        );

      } 
      // else if (this.menuOriginData.data.nodes.length === 0) {
        
      //   this.menuDataResult = {
      //     displaydata: [
      //       {
      //         id: '0',
      //         title: '空节点',
      //         iconsrc: require('../../assets/images/m-0.png'),
      //         sub: [],
      //       }
      //     ],
      //     origindata: this.menuOriginData
      //   };
      //   this.menuPosResult = {
      //     display: this.menuOriginData.display,
      //     ev: this.menuOriginData.event.event 
      //   };
      // }
    }
  },
  watch: {
    menuOriginData() {
      this.initData();

      this.$nextTick(() => {
        this.$refs.menuchild.drawMenu(this.menuPosResult.ev);
      });
    }
  },
  mounted() {
  }
};
</script>

<style>
.visualmenu {
  background-color: blue;
}
</style>
