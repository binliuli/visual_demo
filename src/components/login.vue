<template>
  <div class="visual">
    <right-menu :menuOriginData="menuOriginData" @rightMenuCallback="rightMenuCallback"></right-menu>
    <!-- <div class="toolbar-wrapper">
      <tool-bar :selected="selectedNodesCount" :selectedItems="selectedItems" :mode="mode" @lock="lock" @unlock="unlock" @undo="undo" @redo="redo" @save="saveVersion" @modechange="changeMode" @add="addPoint" @delete="deleteNodes" @layout="setLayout" @group="doGroup" @ungroup="doUnGroup" @play="playAnim" @stop="stopAnim" @highlight="highlight" @unhighlight="unhighlight" @linkstylechange="setLinksStyle" @nodestylechange="setNodesStyle" @filterCus="filterCus" @select="handleSelectActions"></tool-bar>
    </div>-->
    <div class="tool-left">
      <ToolBarLeft :mode="mode" @modechange="changeMode" @zoomchange="zoomchange" @add="addPoint" @layout="setLayout" @play="playAnim" @stop="stopAnim" @savePic="savePicMethod" />
    </div>
    <div class="right">
      <draw class="draw-view" :data="graphData" ref="draw" @contextmenu="drawContextMenuHandler" @selectchange="drawSelectChangeHandler" @beforelink="beforeLinkHandler" @change="drawChangeHandler" :mode="mode" />
    </div>
    <save-graph-temp ref="savegraphic"></save-graph-temp>
    <add-object @add="addPointToDraw" ref="addPointDialog" />
  </div>
</template>

<script>
import _ from "lodash";
import Draw from "./common/visual-editor/src/components/index";
import ToolBarLeft from "./ToolBarLeft";
import RightMenu from "./RightMenu/VisualMenu.vue";
import ToolBar from "./ToolBarNew";
import SaveGraphTemp from "./SaveGraphTemp";
import AddObject from "./AddObject";

export default {
  components: {
    Draw,
    ToolBarLeft,
    RightMenu,
    ToolBar,
    SaveGraphTemp,
    AddObject
  },
  data() {
    return {
      graphData: {
        links: [],
        nodes: [],
        groups: []
      },
      menuOriginData: {},
      mode: "normal",
      selectedNodesCount: 0,
      AllStatisticsData: {
        // 全局统计
        title: "全局统计",
        data: []
      },
      selectedItems: {
        nodes: [],
        links: []
      },
      PositionStatisticsData: {
        // 定位统计
        title: "定位统计",
        data: [
          {
            title: "实体个数",
            data: [
              {
                name: "人员",
                value: 0
              }
            ]
          },
          {
            title: "资金统计",
            data: [
              {
                name: "交易总额",
                value: "0"
              }
            ]
          }
        ]
      }
    };
  },
  mounted() {
    // 弹性布局
    // setTimeout(() => {
    //   this.setLayout("force");
    // }, 1500);
    // let dataAll = {
    //   code: 200,
    //   message: "成功",
    //   data: {
    //     nodes: [
    //       {
    //         model: {
    //           id: 7,
    //           name: "对私客户",
    //           icon: "/icons/ower.png",
    //           type: 0,
    //           key: null
    //         },
    //         id: 55494,
    //         properties: {
    //           occupation: "1F",
    //           organization_id: "00001",
    //           name: "小赵",
    //           id_card: "130229197701296639",
    //           customer_id: "001157451966",
    //           id_card_type: "11",
    //           country_id: "CHN",
    //           id_card_expiry_date: "20201020"
    //         },
    //         labels: ["对私客户", "关系人", "Customer"]
    //       },
    //       {
    //         model: {
    //           id: 6,
    //           name: "对私账户",
    //           icon: "/icons/bank.png",
    //           type: 0,
    //           key: null
    //         },
    //         id: 2482,
    //         properties: {
    //           name: "小李",
    //           account_type: "6100",
    //           customer_id: "001157451966",
    //           account: "6229180005780020912"
    //         },
    //         labels: ["对私账户", "CustomerAccount", "Account"]
    //       },
    //       {
    //         model: {
    //           id: 6,
    //           name: "对私账户",
    //           icon: "/icons/bank.png",
    //           type: 0,
    //           key: null
    //         },
    //         id: 2678,
    //         properties: {
    //           name: "小王",
    //           account_type: "6100",
    //           customer_id: "001157451966",
    //           account: "7236111219000005772"
    //         },
    //         labels: ["对私账户", "CustomerAccount", "Account"]
    //       },
    //       {
    //         model: {
    //           id: 1,
    //           name: "他行账户",
    //           icon: "/icons/bankArr.png",
    //           type: 0,
    //           key: null
    //         },
    //         id: 412853,
    //         properties: {
    //           pairing_customer_type: "",
    //           name: "小华",
    //           pairing_id_card_type: "",
    //           pairing_id_card: "",
    //           pairing_account: "6222080403006123395",
    //           pairing_account_type: ""
    //         },
    //         labels: ["他行账户", "OutAccount", "Account"]
    //       },
    //       {
    //         model: {
    //           id: 1,
    //           name: "他行账户",
    //           icon: "/icons/bankArr.png",
    //           type: 0,
    //           key: null
    //         },
    //         id: 412854,
    //         properties: {
    //           pairing_customer_type: "",
    //           name: "吕振华",
    //           pairing_id_card_type: "",
    //           pairing_id_card: "",
    //           pairing_account: "6222080403006236353",
    //           pairing_account_type: ""
    //         },
    //         labels: ["他行账户", "OutAccount", "Account"]
    //       }
    //     ],
    //     links: [
    //       {
    //         name: "账户",
    //         id: 517,
    //         source: 55494,
    //         properties: {},
    //         target: 2482
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 259366,
    //         source: 2678,
    //         properties: {
    //           amount: "3000.000",
    //           trade_date: "20180611",
    //           num: "30"
    //         },
    //         target: 412853
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 275805,
    //         source: 2678,
    //         properties: {
    //           amount: "2300.000",
    //           trade_date: "20180601",
    //           num: "23"
    //         },
    //         target: 412853
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 296824,
    //         source: 2678,
    //         properties: {
    //           amount: "3300.000",
    //           trade_date: "20180614",
    //           num: "33"
    //         },
    //         target: 412853
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 297062,
    //         source: 2678,
    //         properties: { amount: "100.000", trade_date: "20180531", num: "1" },
    //         target: 412853
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 299884,
    //         source: 2678,
    //         properties: {
    //           amount: "3000.000",
    //           trade_date: "20180607",
    //           num: "30"
    //         },
    //         target: 412853
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 306313,
    //         source: 2678,
    //         properties: {
    //           amount: "2800.000",
    //           trade_date: "20180528",
    //           num: "28"
    //         },
    //         target: 412853
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 317115,
    //         source: 2678,
    //         properties: {
    //           amount: "1800.000",
    //           trade_date: "20180606",
    //           num: "18"
    //         },
    //         target: 412853
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 317769,
    //         source: 2678,
    //         properties: {
    //           amount: "2700.000",
    //           trade_date: "20180615",
    //           num: "27"
    //         },
    //         target: 412853
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 318206,
    //         source: 2678,
    //         properties: { amount: "100.000", trade_date: "20180608", num: "1" },
    //         target: 412854
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 326601,
    //         source: 2678,
    //         properties: {
    //           amount: "2100.000",
    //           trade_date: "20180529",
    //           num: "21"
    //         },
    //         target: 412853
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 329337,
    //         source: 412854,
    //         properties: {
    //           amount: "1500.000",
    //           trade_date: "20180604",
    //           num: "15"
    //         },
    //         target: 2678
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 330904,
    //         source: 412853,
    //         properties: { amount: "200.000", trade_date: "20180607", num: "2" },
    //         target: 2678
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 332926,
    //         source: 412854,
    //         properties: {
    //           amount: "1500.000",
    //           trade_date: "20180613",
    //           num: "15"
    //         },
    //         target: 2678
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 344730,
    //         source: 412853,
    //         properties: { amount: "100.000", trade_date: "20180611", num: "1" },
    //         target: 2678
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 345634,
    //         source: 2678,
    //         properties: { amount: "100.000", trade_date: "20180524", num: "1" },
    //         target: 412854
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 368602,
    //         source: 2678,
    //         properties: {
    //           amount: "2300.000",
    //           trade_date: "20180604",
    //           num: "23"
    //         },
    //         target: 412853
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 375833,
    //         source: 2678,
    //         properties: {
    //           amount: "3000.000",
    //           trade_date: "20180530",
    //           num: "30"
    //         },
    //         target: 412853
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 378531,
    //         source: 2678,
    //         properties: { amount: "100.000", trade_date: "20180528", num: "1" },
    //         target: 412854
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 394277,
    //         source: 2678,
    //         properties: {
    //           amount: "2000.000",
    //           trade_date: "20180608",
    //           num: "20"
    //         },
    //         target: 412853
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 397743,
    //         source: 2678,
    //         properties: { amount: "100.000", trade_date: "20180615", num: "1" },
    //         target: 412854
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 397912,
    //         source: 2678,
    //         properties: { amount: "100.000", trade_date: "20180529", num: "1" },
    //         target: 412854
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 401157,
    //         source: 412854,
    //         properties: {
    //           amount: "1700.000",
    //           trade_date: "20180615",
    //           num: "17"
    //         },
    //         target: 2678
    //       },
    //       {
    //         name: "账户",
    //         id: 713,
    //         source: 55494,
    //         properties: {},
    //         target: 2678
    //       },
    //       {
    //         name: "转账",
    //         id: 401894,
    //         source: 412854,
    //         properties: {
    //           amount: "1200.000",
    //           trade_date: "20180529",
    //           num: "12"
    //         },
    //         target: 2678
    //       }
    //     ]
    //   }
    // };

    let dataAll = {
      code: 200,
      message: "成功",
      data: {
        nodes: [
          {
            icon: "/icons/ower.png",
            name: "小赵",
            id: 55494
          },
          {
            icon: "/icons/bank.png",
            id: 2482,
            name: "小李"
          },
          {
            icon: "/icons/bank.png",
            id: 2678,
            name: "小王"
          },
          {
            icon: "/icons/bankArr.png",
            id: 412853,
            name: "小华"
          },
          {
            icon: "/icons/bankArr.png",
            id: 412854,
            name: "吕振华"
          }
        ],
        links: [
          {
            name: "账户",
            id: 517,
            source: 55494,
            properties: {},
            target: 2482
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 259366,
            source: 2678,
            properties: {
              amount: "3000.000",
              trade_date: "20180611",
              num: "30"
            },
            target: 412853
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 275805,
            source: 2678,
            properties: {
              amount: "2300.000",
              trade_date: "20180601",
              num: "23"
            },
            target: 412853
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 296824,
            source: 2678,
            properties: {
              amount: "3300.000",
              trade_date: "20180614",
              num: "33"
            },
            target: 412853
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 297062,
            source: 2678,
            properties: { amount: "100.000", trade_date: "20180531", num: "1" },
            target: 412853
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 299884,
            source: 2678,
            properties: {
              amount: "3000.000",
              trade_date: "20180607",
              num: "30"
            },
            target: 412853
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 306313,
            source: 2678,
            properties: {
              amount: "2800.000",
              trade_date: "20180528",
              num: "28"
            },
            target: 412853
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 317115,
            source: 2678,
            properties: {
              amount: "1800.000",
              trade_date: "20180606",
              num: "18"
            },
            target: 412853
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 317769,
            source: 2678,
            properties: {
              amount: "2700.000",
              trade_date: "20180615",
              num: "27"
            },
            target: 412853
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 318206,
            source: 2678,
            properties: { amount: "100.000", trade_date: "20180608", num: "1" },
            target: 412854
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 326601,
            source: 2678,
            properties: {
              amount: "2100.000",
              trade_date: "20180529",
              num: "21"
            },
            target: 412853
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 329337,
            source: 412854,
            properties: {
              amount: "1500.000",
              trade_date: "20180604",
              num: "15"
            },
            target: 2678
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 330904,
            source: 412853,
            properties: { amount: "200.000", trade_date: "20180607", num: "2" },
            target: 2678
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 332926,
            source: 412854,
            properties: {
              amount: "1500.000",
              trade_date: "20180613",
              num: "15"
            },
            target: 2678
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 344730,
            source: 412853,
            properties: { amount: "100.000", trade_date: "20180611", num: "1" },
            target: 2678
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 345634,
            source: 2678,
            properties: { amount: "100.000", trade_date: "20180524", num: "1" },
            target: 412854
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 368602,
            source: 2678,
            properties: {
              amount: "2300.000",
              trade_date: "20180604",
              num: "23"
            },
            target: 412853
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 375833,
            source: 2678,
            properties: {
              amount: "3000.000",
              trade_date: "20180530",
              num: "30"
            },
            target: 412853
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 378531,
            source: 2678,
            properties: { amount: "100.000", trade_date: "20180528", num: "1" },
            target: 412854
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 394277,
            source: 2678,
            properties: {
              amount: "2000.000",
              trade_date: "20180608",
              num: "20"
            },
            target: 412853
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 397743,
            source: 2678,
            properties: { amount: "100.000", trade_date: "20180615", num: "1" },
            target: 412854
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 397912,
            source: 2678,
            properties: { amount: "100.000", trade_date: "20180529", num: "1" },
            target: 412854
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 401157,
            source: 412854,
            properties: {
              amount: "1700.000",
              trade_date: "20180615",
              num: "17"
            },
            target: 2678
          },
          {
            name: "账户",
            id: 713,
            source: 55494,
            properties: {},
            target: 2678
          },
          {
            name: "转账",
            id: 401894,
            source: 412854,
            properties: {
              amount: "1200.000",
              trade_date: "20180529",
              num: "12"
            },
            target: 2678
          }
        ]
      }
    };

    const visualdata = dataAll.data;
    this.graphData = this.nomalVisualDataFunc(visualdata);
    console.log(this.graphData, "666666");
    if (this.graphData) {
      // this.$refs.draw.setData(this.graphData);
      // 深圳招商 箭头问题
      this.$refs.draw.setDisplayData(this.graphData);
    }
  },
  methods: {
    async addPointToDraw(n) {
      let node = n;
      if (!n.data || !n.model) {
        node = await this.getObject(n.id);
      }
      this.$refs.draw.addPoint(_.cloneDeep(node));
    },
    deleteNodes() {
      this.$refs.draw.deleteNode();
    },
    async saveVersion() {
      const data = this.$refs.draw.getData();
      const image = this.$refs.draw.getImage();
      this.graphicListData.unshift({
        snapshot: image,
        saving: 1
      });
      this.bottomPanelTabsValue = "1";
      !this.showBottomPanel && this.toggleBottomPanel();
      await this.saveGraph({ data, image });
      this.graphicListData = await this.getGraph();
    },
    undo() {
      this.$refs.draw.undo();
    },
    redo() {
      this.$refs.draw.redo();
    },
    lock() {
      this.$refs.draw.lock();
    },
    unlock() {
      this.$refs.draw.unlock();
    },
    async rightMenuCallback(e) {
      this.$refs.draw.loadingLayout = true;
      if (e.type === "查看明细") {
        this.$refs.checkView.showView();
        // console.log(this.selectedItems.links)
      }
      if (e.type === "关联查询") {
        console.log("关联查询", this.selectedIdsArray);
        // const relatedData = await this.$axios.post(
        //   this.$api.tool_api + "http://192.168.1.174:8083/neofj/nodes/path",
        //   {
        //     nodes: this.selectedIdsArray
        //   }
        // );
        const relatedData = {
          code: 200,
          message: "成功",
          data: {
            nodes: [
              {
                icon: "/icons/ower.png",
                id: 1234,
                name: "三哥"
              }
            ],
            links: [
              {
                name: "账户",
                id: 4576,
                source: 2482,
                properties: {},
                target: 1234
              }
            ]
          }
        };
        const newrelatedData = this.nomalVisualDataFunc(relatedData.data);
        const nodes = _.get(e, "sendData.origindata.nodes") || [];
        this.$refs.draw.addDataSet(newrelatedData, nodes);
      }
      if (e.type === "删除") {
        this.$refs.draw.deleteNode();
      }
      if (e.type === "关联对象") {
        const nodes = _.get(e, "sendData.origindata.nodes") || [];
        console.log("23232323232323");
        console.log(nodes);
        const ids = nodes.map(n => n.id);
        const dataSet = await this.getRelatedItem({
          ids,
          type: 0
        });
        this.$refs.draw.addDataSet(dataSet, nodes);
      }
      if (e.type === "关联事件") {
        const nodes = _.get(e, "sendData.origindata.nodes") || [];
        const ids = nodes.map(n => n.id);
        const dataSet = await this.getRelatedItem({
          ids,
          type: 1
        });
        this.$refs.draw.addDataSet(dataSet, nodes);
      }
      if (e.type === "关联文档") {
        const nodes = _.get(e, "sendData.origindata.nodes") || [];
        const ids = nodes.map(n => n.id);
        const dataSet = await this.getRelatedItem({
          ids,
          type: 2
        });
        this.$refs.draw.addDataSet(dataSet, nodes);
      }
      if (e.type === "关联附件") {
        const nodes = _.get(e, "sendData.origindata.nodes") || [];
        const ids = nodes.map(n => n.id);
        const dataSet = await this.getRelatedItem({
          ids,
          type: 3
        });
        this.$refs.draw.addDataSet(dataSet, nodes);
      }
      if (e.type === "环路查询") {
        const nodes = _.get(e, "sendData.origindata.nodes") || [];
        if (nodes.length === 1) {
          const result = await this.$store.dispatch("visual/searchLoop", {
            id: nodes[0].id,
            path: 3
          });
          // debugger;
          this.$refs.draw.addDataSet(result, this.$refs.draw.nodes);
          // const ids = result.nodes.map(m => {
          //   return m.id;
          // })
          // this.$refs.draw.selectByCondition(node => {
          //   return _.indexOf(ids, node.id) > -1;
          // })
        }
      }
      if (e.type === "展开关系") {
        const links = _.get(e, "sendData.origindata.links") || [];
        this.doUnfoldRelationToEvent(links, this.$refs.draw);
      }
      if (e.type === "合并事件") {
        const nodes = _.get(e, "sendData.origindata.nodes") || [];
        this.doCombineEventToRelation(nodes, this.$refs.draw);
      }
      if (e.type === "展开事件") {
        const nodes = _.get(e, "sendData.origindata.nodes") || [];
        this.doUnfoldEventToRelation(nodes, this.$refs.draw);
      }
      if (e.type === "合并实体") {
        const nodes = _.get(e, "sendData.origindata.nodes") || [];
        this.doCombineNodes(nodes, this.$refs.draw);
      }
      if (e.type === "展开实体") {
        const nodes = _.get(e, "sendData.origindata.nodes") || [];
        this.doUnfoldNodes(nodes, this.$refs.draw);
      }
      if (e.type === "全选") {
        this.$refs.draw.selectByCondition(node => {
          return true;
        });
      }
      if (e.type === "反选") {
        this.$refs.draw.selectByCondition(node => {
          return !node.selected;
        });
      }
      if (e.type === "取消选择") {
        this.$refs.draw.selectByCondition(node => {
          return false;
        });
      }
      if (e.type === "全部实体") {
        this.$refs.draw.selectByCondition(node => {
          return (
            node.model && (node.model.type === 0 || node.model.type === -2)
          );
        });
      }
      if (e.type === "全部事件") {
        this.$refs.draw.selectByCondition(node => {
          return (
            node.model && (node.model.type === 1 || node.model.type === -1)
          );
        });
      }
      this.$refs.draw.loadingLayout = false;
    },
    doGroup() {
      this.$refs.draw.doGroup();
    },
    doUnGroup(groups) {
      groups.forEach(g => {
        this.$refs.draw.unGroup(g);
      });
    },
    highlight() {},
    unhighlight() {
      this.$refs.draw.setHighlight();
    },
    setLinksStyle({ links, style }) {
      this.$refs.draw.setCustomLinksStyle({
        links,
        style
      });
    },
    handleSelectActions({ type }) {
      if (type === "all") {
        this.$refs.draw.selectByCondition(node => {
          return true;
        });
        this.$refs.draw.selectLinksByCondition(l => {
          return true;
        });
      }

      if (type === "reverse") {
        this.$refs.draw.selectByCondition(node => {
          return !node.selected;
        });
        this.$refs.draw.selectLinksByCondition(l => {
          return !l.selected;
        });
      }

      if (type === "leaf") {
        this.$refs.draw.selectByCondition(node => {
          let count = 0;
          this.$refs.draw.links.forEach(l => {
            if (l.source === node || l.target === node) {
              count += 1;
            }
          });
          return count <= 1;
        });
      }

      if (type === "nodes") {
        this.$refs.draw.selectByCondition(node => {
          let count = 0;
          this.$refs.draw.links.forEach(l => {
            if ((l.source === node || l.target === node) && l.selected) {
              count += 1;
            }
          });
          return count >= 1;
        });
      }

      if (type === "lines") {
        this.$refs.draw.selectLinksByCondition(l => {
          let count = 0;
          this.$refs.draw.nodes.forEach(node => {
            if ((l.source === node || l.target === node) && node.selected) {
              count += 1;
            }
          });
          return count >= 1;
        });
      }

      if (type === "l_n") {
        this.$refs.draw.selectLinksByCondition(l => {
          let count = 0;
          this.$refs.draw.nodes.forEach(node => {
            if ((l.source === node || l.target === node) && node.selected) {
              count += 1;
            }
          });
          return count >= 1;
        });
        this.$refs.draw.selectByCondition(node => {
          let count = 0;
          this.$refs.draw.links.forEach(l => {
            if ((l.source === node || l.target === node) && l.selected) {
              count += 1;
            }
          });
          return count >= 1;
        });
      }

      if (type === "insite") {
        this.$refs.draw.selectLinksByCondition(l => {
          let count = 0;
          this.$refs.draw.nodes.forEach(node => {
            if (l.target === node && node.selected) {
              count += 1;
            }
          });
          return count >= 1;
        });
      }

      if (type === "outsite") {
        this.$refs.draw.selectLinksByCondition(l => {
          let count = 0;
          this.$refs.draw.nodes.forEach(node => {
            if (l.source === node && node.selected) {
              count += 1;
            }
          });
          return count >= 1;
        });
      }
    },
    setNodesStyle({ nodes, style }) {
      this.$refs.draw.setCustomNodesStyle({
        nodes,
        style
      });
    },
    async filterCus(data) {
      if (data.cus) {
        this.$refs.draw.selectItems(this.cusData);
      }
      if (data.mon) {
        this.$refs.draw.selectItems(this.monData);
      }
      if (data.mon && data.cus) {
        this.$refs.draw.selectItems({
          nodes: this.monData.nodes.concat(this.cusData.nodes),
          links: this.monData.links.concat(this.cusData.links)
        });
      }
      if (!data.cus && !data.mon) {
        this.$refs.draw.setHighlight([]);
      }
    },
    setLayout(type) {
      console.log(type, 888);
      this.$refs.draw.layoutNodes(type);
    },
    savePicMethod() {
      const image = this.$refs.draw.getImage();
      const savedata = {
        image: image
      };
      this.$refs.savegraphic.show(savedata);
    },
    stopAnim() {
      this.$refs.draw.stopAnim();
    },
    playAnim() {
      this.$refs.draw.playAnim();
    },
    changeMode(m) {
      this.mode = m;
    },
    zoomchange(m) {
      if (m == "big") {
        this.$refs.draw.zoomBy(1.1);
      } else if (m == "small") {
        this.$refs.draw.zoomBy(0.8);
      } else if (m == "normal") {
        this.$refs.draw.layoutNodes("force");
      }
    },
    async addPoint() {
      this.$refs.addPointDialog.show();
    },
    nomalVisualDataFunc(visualdata) {
      const normalgraphData = {
        nodes: [],
        links: []
      };
      // this.AllStatisticsData.data = [];
      // var personNum = 0; // 实体类型-人员
      // var companyNum = 0; // 实体类型-公司
      // var accountNum = 0; // 实体类型-账户
      // var transferNUm = 0; // 资金总额-人民币
      // var bankCustom = 0; // 本行客户
      // var firstEntityNum = 0; // 定位统计-实体个数（统计一级关系内实体个数）
      // visualdata.nodes.forEach(el => {
      //   const type = el.labels[0];
      //   var iconUrl = "";
      //   const sigleNode = {
      //     id: el.id,
      //     name: el.properties.name,
      //     labels: el.labels,
      //     properties: el.properties,
      //     model: {
      //       label: el.labels[0],
      //       icon: el.model.icon
      //     },
      //     isSelected: false
      //   };
      //   normalgraphData.nodes.push(sigleNode);
      // });
      // normalgraphData.links = visualdata.links;

      visualdata.nodes.forEach(el => {
        // const type = el.labels[0];
        var iconUrl = "";
        const sigleNode = {
          id: el.id,
          name: el.name,
          // labels: el.labels,
          // properties: el.properties,
          model: {
            // label: el.labels[0],
            icon: el.icon
          },
          isSelected: false
        };
        normalgraphData.nodes.push(sigleNode);
      });
      normalgraphData.links = visualdata.links;

      // visualdata.links.forEach(el => {
      //   const amountNum =
      //     Math.floor(parseFloat(el.properties.amount) * 100) / 100;
      //   if (el.name == "转账") {
      //     transferNUm += amountNum;
      //   }
      // });

      // const globalSingle = {
      //   // 全局统计--实体类型
      //   title: "实体类型",
      //   data: [
      //     {
      //       name: "人员",
      //       value: personNum
      //     },
      //     {
      //       name: "公司",
      //       value: companyNum
      //     },
      //     {
      //       name: "账户",
      //       value: accountNum
      //     }
      //   ]
      // };
      // const moneySingle = {
      //   // 全局统计--交易笔数
      //   title: "交易笔数",
      //   data: [
      //     {
      //       name: "笔数",
      //       value: normalgraphData.links.length
      //     }
      //   ]
      // };
      // const transferSingle = {
      //   // 全局统计--资金总额
      //   title: "资金总额",
      //   data: [
      //     {
      //       name: "人民币",
      //       value: transferNUm + "¥"
      //     },
      //     {
      //       name: "美元",
      //       value: Math.floor((transferNUm / 7.0398) * 100) / 100 + "$"
      //     }
      //   ]
      // };
      // const bankSingle = {
      //   // 全局统计--本行客户
      //   title: "本行客户",
      //   data: [
      //     {
      //       name: "数量",
      //       value: bankCustom
      //     }
      //   ]
      // };
      // this.AllStatisticsData.data.push(
      //   globalSingle,
      //   moneySingle,
      //   transferSingle,
      //   bankSingle
      // );

      console.log(normalgraphData, "normalgraphData");
      return normalgraphData;
    },
    async drawContextMenuHandler(e) {
      this.menuOriginData = {
        display: true,
        nodes: e.nodes,
        links: e.links,
        event: e.event
      };
    },
    async drawSelectChangeHandler({ nodes }) {
      this.selectedNodesCount = nodes.length;
      this.selectedItems = {
        nodes: this.$refs.draw.nodes.filter(n => n.selected),
        links: this.$refs.draw.links.filter(l => l.selected)
      };
      console.log(
        nodes,
        this.selectedItems,
        "this.selectedItemsthis.selectedItems"
      );
      this.PositionStatisticsData.data = [];
      const entitySingle = {
        // 定位统计--实体个数
        title: "实体个数",
        data: [
          {
            name: "个数",
            value: nodes.length
          }
        ]
      };
      this.PositionStatisticsData.data.push(entitySingle);

      const selectAccountIds = []; // 当前选中的所有实体id
      var positionMoeny = 0;
      nodes.forEach(el => {
        if (
          el.model.label == "对公账户" ||
          el.model.label == "对私账户" ||
          el.model.label == "他行账户"
        ) {
          selectAccountIds.push(el.id);
        }
      });

      for (let index = 0; index < selectAccountIds.length; index++) {
        const element = selectAccountIds[index];
        this.graphData.links.forEach(el => {
          if (el.name == "转账" && element == el.source) {
            positionMoeny +=
              Math.floor(parseFloat(el.properties.amount) * 100) / 100;
          }
        });
      }
      const moneySingle = {
        // 定位统计--资金总额
        title: "资金统计",
        data: [
          {
            name: "交易总额",
            value: positionMoeny
          }
        ]
      };
      this.PositionStatisticsData.data.push(moneySingle);

      this.selectedIdsArray = [];
      if (nodes && nodes.length > 0) {
        // this.getSelectedId(nodes[0]);
        nodes.forEach(el => {
          this.selectedIdsArray.push(el.id);
        });
        if (this.selectedIdsArray) {
          this.selectedRowID = this.selectedIdsArray[0];
        }
      }
      const root = [];
      // nodes.forEach(el => {
      //   if (root.indexOf(el.labels[0]) === -1) {
      //     root.push(el.labels[0]);
      //   }
      // });
      const resultdata = [];
      root.forEach((el, i) => {
        resultdata.push({
          titleName: el,
          moreInfo: [],
          count: ""
        });
        nodes.forEach((elc, ic) => {
          this.$set(elc, "isSelected", false);
          if (elc.labels[0] === el) {
            resultdata[i].moreInfo.push(elc);
          }
        });
        resultdata[0].moreInfo[0].isSelected = true;
        resultdata[i].count = resultdata[i].moreInfo.length;
        resultdata[i].titleName =
          resultdata[i].titleName + " (" + resultdata[i].count + ")";
      });
      this.selectedData = resultdata;
      console.log(
        this.selectedData,
        "this.selectedDatathis.selectedDatathis.selectedData"
      );
    },
    beforeLinkHandler(e) {
      e.prevent = 1;
      this.objLinkData = [e.source, e.target];
      this.$refs.addLinkDialog.show();
    },
    async drawChangeHandler(data) {
      console.log(data, "datadata");
    }
  }
};
</script>
<style lang="less" scoped>
.visual {
  overflow: hidden;
  .tool-left {
    width: 100px;
    float: left;
  }
  .right {
    .draw-view {
      float: right;
      width: calc(100% - 100px);
      margin-left: 100px;
      margin-top: 40px;
    }
  }
}
</style>
