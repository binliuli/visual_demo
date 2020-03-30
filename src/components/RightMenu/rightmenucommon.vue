<template>
  <div id="zr" ref="zr">

  </div>
</template>

<script>
/**
 * 传参
 *    menudata
 *    menupos
 * 事件
 *    rightmenuclick
 */

import zrender from 'zrender';
import URL from 'url';

const INNERRADIUS = 30;
const STEPWIDTH = 70;
const OUTERPADDING = 3;
const BTNPADDING = 10;

// 初始化参数
const initOpt = function(params) {
  const tempparams = {
    cx: params.cx, // 圆环圆心 x
    cy: params.cy, // 圆环圆心 y
    r: params.r, // 大圆半径
    r0: params.r0, // 内圆半径
    mcr: (() => { // 菜单按钮半径
      // 计算菜单半径，返回最大半径
      let tempr;
      const checkMenuR = function() {
        const d =
          Math.sin((params.end - params.start) / params.btnsCount / 2) *
          ((params.r - params.r0) / 2 + params.r0);
        return d;
      };
      // 计算菜单按钮半径，比最大值小 3
      if (checkMenuR() >= (params.r - params.r0) / 2) {
        tempr = (params.r - params.r0) / 2 - BTNPADDING;
      } else {
        tempr = checkMenuR() - BTNPADDING;
        // tempr = 15;
      }
      return tempr;
    })(),
    start: params.start,
    end: params.end,
    offset: (params.end - params.start) / params.btnsCount / 2, // 计算初始偏移量
    btnsCount: params.btnsCount,
    zr: params.zr,
    menudata: params.menudata
  };
  return tempparams;
};

// 画扇形菜单
const drawSector = function(params) {
  // 菜单扇形
  const sector = new zrender.Sector({
    shape: {
      cx: params.cx,
      cy: params.cy,
      r: params.r,
      r0: params.r0,
      startAngle: params.start,
      // endAngle: params.end
      endAngle: params.start // 动画初始值
    },
    style: {
      fill: 'rgba(28,38,57,0.86)',
      // textFill: '#000',
      // stroke: '#eee'
    }
  });

  if (params.flag) {
    sector.flag = params.flag;
  }
  sector.animateTo(
    {
      shape: {
        endAngle: params.end
      }
    },
    500,
    'quinticInOut'
  );
  params.zr.add(sector);

  return sector;
};

// 画菜单按钮
const drawMenubtn = function(params) {
  const objcache = [];
  // 遍历创建菜单按钮
  for (let i = 0; i < params.btnsCount; i++) {
    // 获取位置信息，x, y, radian
    const val = getMcAngle({
      ...params,
      flag: {
        ...params.flag,
        index: i
      }
    });
    /**
     * 图形初始化及绘制
     */
    // 按钮
    const circle = new zrender.Circle({
      shape: {
        cx: params.cx,
        cy: params.cy,
        r: params.mcr
      },
      style: {
        fill: params.menudata[i].fill,
        opacity: 0,
        // stroke: '#F00',
        // text: params.menudata[i].title,
        // blend: 'destination-over'
      }
    });

    // 按钮图片
    const img = new zrender.Image({
      silent: true,
      style: {
        image: (() => {
          const img = new Image();
          img.src = params.menudata[i].iconsrc;
          // img.src = require(`${params.menudata[i].iconsrc}`);
          return img;
        })(),
        x: params.cx,
        y: params.cy,
        opacity: 0,
        width: Math.sin(Math.PI / 2) * params.mcr * 4 / 5,
      }
    });

    // 按钮tip
    const tipWidth = params.menudata[i].title.length * 12 + 20;
    const tipHeight = 30;
    const tip = new zrender.Rect({
      silent: true,
      shape: {
        x: params.cx + val.x - tipWidth / 2,
        y: params.cy + val.y - params.mcr * 2 - 5,
        r: [3, 3, 3, 3],
        width: tipWidth,
        height: tipHeight,
      },
      style: {
        fill: 'rgba(0,0,0,0.7)',
        text: params.menudata[i].title,
        textFill: '#fff',
        opacity: 0
      },
      z: 300
    });

    // 菜单按钮动画
    circle.animateTo(
      {
        shape: {
          cx: params.cx + val.x,
          cy: params.cy + val.y
        },
        style: {
          opacity: 1,
        }
      },
      500,
      i * 20,
      'quinticInOut'
    );
    // 菜单按钮图片动画
    img
      .animate('style')
      .when(200, {
        x: params.cx + val.x / 2 - Math.sin(Math.PI / 2) * params.mcr * 2 / 3,
        y: params.cy + val.y / 2 - Math.sin(Math.PI / 2) * params.mcr * 2 / 3,
        opacity: 0
      })
      .when(500, {
        x: params.cx + val.x - Math.sin(Math.PI / 2) * params.mcr * 2 / 5,
        y: params.cy + val.y - Math.sin(Math.PI / 2) * params.mcr * 2 / 5,
        opacity: 1
      })
      .start('quinticInOut');
    // 绘图、缓存至画布元素数据组
    params.zr.add(circle);
    objcache.push(circle);

    params.zr.add(img);
    objcache.push(img);

    params.zr.add(tip);
    objcache.push(tip);

    /**
     * 数据挂载
     */
    // 把node节点数据挂在到menu数据源
    params.menudata[i].nodes = circle;
    // 把node节点位置数据（x, y, radian）挂载到menu数据源
    params.menudata[i].pos = val;
    // 把tip挂载到menu数据源
    params.menudata[i].tip = tip;
    // node节点对应的menu数据源索引信息挂在到node节点（包括索引、元素类型）
    if (params.flag) {
      circle.flag = {
        ...params.flag,
        index: i
      };
    }

  }
  return objcache;
};

/**
 *  计算菜单按钮圆心 mc 与圆环圆心 c 的连线与象限的夹角
    返回夹角弧度、菜单按钮圆心所在象限
    r 外环半径
    r0 内环半径
    accout 按钮个数
    index 第几个按钮(从 0 开始)
**/

const getMcAngle = function(params) {
  const PI = Math.PI;
  const sin = Math.sin;
  const cos = Math.cos;
  const start = params.start; // 菜单开始位置
  const end = params.end; // 菜单结束位置
  const offset = params.offset; // 第一个按钮的偏移量
  const cc = (params.r - params.r0) / 2 + params.r0; // 按钮圆心到圆环圆心的距离
  // 根据按钮个数，计算菜单区域每份弧度
  const perAngle = (end - start) / params.btnsCount;
  // ===

  const temp = start + offset + perAngle * params.flag.index;
  const val = temp;
  // if (start > 0) {
  //   val = offset + perAngle * params.index;
  // } else {
  //   val = offset + perAngle * params.index + start;
  // }

  let x;
  let y;
  if (temp > PI * 3 / 2 || temp <= 0) {
    // 第一象限
    // 弧度
    const a = PI * 2 - val;
    x = cos(a) * cc;
    y = -sin(a) * cc;
    // console.log('1x');
  } else if (temp > PI && temp <= PI * 3 / 2) {
    // 第二象限
    const a = PI * 3 / 2 - val;
    x = -sin(a) * cc;
    y = -cos(a) * cc;
    // console.log('2x');
  } else if (temp > PI / 2 && temp <= PI) {
    // 第三象限
    const a = PI - val;
    x = -cos(a) * cc;
    y = sin(a) * cc;
    // console.log('3x');
  } else if (temp > 0 && temp <= PI / 2) {
    // 第四象限
    const a = PI / 2 - val;
    x = sin(a) * cc;
    y = cos(a) * cc;
    // console.log('4x');
  }

  return { x, y, val };
};

// 清理所有元素
const removeEl = function(params) {
  zrender.dispose(params.zr);
  this.$emit('closeMenu');
};

// 清理子菜单
const removeSub = function(params) {};

// 某个 menubtn 数量对应的弧度
const getRadian = function(btnsCount) {
  return btnsCount / 10 * Math.PI * 2;
};

export default {
  name: 'rightmenucommon',
  /**
   * 数据格式
      menupos: {
        display: false,
        ev: {},
      }
      menudata: {
        origindata: {},
        displaydata: [
          {
            id: '0',
            title: '下钻',
            img: require('../../assets/images/dd-s.png'), // eslint-disable-line
            sub: [
              {
                id: '0-0',
                title: '111t',
                img: ''
              }
            ]
          }, 
          {
            id: '1',
            title: 'other',
            sub: []
          }
        ]
      }
   */
  props: ['menudata', 'menupos'],
  methods: {
    // handler(e) {
    //   e.preventDefault();
    //   // e.stopPropagation()
    //   console.log(
    //     e,
    //     '右键菜单组件 核心组件 绑定了右键监听，这是一个待考虑的绑定'
    //   );
    // },
    drawMenu(parentEv) {
      const vuethis = this;
      const PI = Math.PI;
      const sin = Math.sin;
      const cos = Math.cos;

      // 菜单数据
      const menuArr = this.menudata.displaydata;
      // 初始化画布
      const zr = zrender.init(document.getElementById('zr'));
      // 初始化菜单位置
      let X = parentEv.pageX;
      let Y = parentEv.pageY;
      if (parentEv.pageX < 120) {
        X = 130;
      }
      if (parentEv.pageY < 120) {
        Y = 130;
      }
      if (window.innerWidth - parentEv.pageX < 120) {
        X = window.innerWidth - 130;
      }
      if (window.innerHeight - parentEv.pageY < 120) {
        Y = window.innerHeight - 130;
      }

      // ===================================

      // 主菜单参数
      const opt = initOpt({
        cx: X, // 圆环圆心 x
        cy: Y, // 圆环圆心 y
        r: INNERRADIUS + STEPWIDTH, // 大圆半径
        r0: INNERRADIUS, // 内圆半径
        start: -PI * 2 / 3,
        end: PI * 4 / 3,
        btnsCount: menuArr.length,
        zr,
        menudata: menuArr
      });
      // 主菜单
      drawSector({
        ...opt,
        flag: {
          type: 'mainmenu-board'
        }
      });
      // 主菜单按钮
      drawMenubtn({
        ...opt,
        flag: {
          type: 'mainmenu-btn',
          index: ''
        }
      });

      let curmenu = [];
      zr.on('click', e => {
        e.event.stopPropagation();
        e.event.preventDefault();
        if (!e.target || !e.target.flag) {
          removeEl.call(vuethis, opt);
          return;
        }
        // 点击主菜单button
        if (e.target.flag.type === 'mainmenu-btn') {
          const sub = menuArr[e.target.flag.index].sub;

          if (sub.length === 0) {
            // 且没有子菜单
            this.$emit('rightmenuclick', {
              sendData: this.menudata,
              type: menuArr[e.target.flag.index].title
            });
            removeEl.call(vuethis, opt);
            return;
          } else if (sub.length > 0) {
            const node = menuArr[e.target.flag.index];

            curmenu.forEach(el => {
              zr.remove(el);
            });
            curmenu = [];
            // 子菜单
            const subopt = {
              cx: X, // 圆环圆心 x
              cy: Y, // 圆环圆心 y
              r: INNERRADIUS + STEPWIDTH * 2 + OUTERPADDING, // 大圆半径
              r0: INNERRADIUS + STEPWIDTH + OUTERPADDING, // 内圆半径
              zr
            };

            // 子菜单面板
            const subSector = drawSector({
              ...initOpt({
                ...subopt,
                start: node.pos.val - getRadian(node.sub.length) / 2,
                end: node.pos.val + getRadian(node.sub.length) / 2,
                btnsCount: node.sub.length,
                menudata: node.sub
              }),
              flag: {
                type: 'submenu-board'
              }
            });
            // 子菜单按钮
            const subMenubtn = drawMenubtn({
              ...initOpt({
                ...subopt,
                start: node.pos.val - getRadian(node.sub.length) / 2,
                end: node.pos.val + getRadian(node.sub.length) / 2,
                btnsCount: node.sub.length,
                menudata: node.sub
              }),
              flag: {
                type: 'submenu-btn',
                parentindex: e.target.flag.index,
                index: ''
              }
            });
            curmenu = [...subMenubtn, subSector];
          }
        } else if (e.target.flag.type === 'submenu-btn') {
          this.$emit('rightmenuclick', {
              sendData: this.menudata,
              type: menuArr[e.target.flag.parentindex].sub[e.target.flag.index].title
            });
          removeEl.call(vuethis, opt);
        }
      });

      zr.on('contextmenu', e => {
        e.event.stopPropagation();
        e.event.preventDefault();
        if (!e.target) {
          removeEl.call(vuethis, opt);
        }
      });

      zr.on('mouseover', e => {
        if(e.target && e.target.flag && e.target.flag.type === 'mainmenu-btn') {
          menuArr[e.target.flag.index].tip.animateTo({
            style: {
              opacity: 1
            }
          }, 300)
        }
        if(e.target && e.target.flag && e.target.flag.type === 'submenu-btn') {
          menuArr[e.target.flag.parentindex].sub[e.target.flag.index].tip.animateTo({
            style: {
              opacity: 1
            }
          }, 300)
        }
      });
      zr.on('mouseout', e => {
        if(e.target && e.target.flag && e.target.flag.type === 'mainmenu-btn') {
          menuArr[e.target.flag.index].tip.animateTo({
            style: {
              opacity: 0
            }
          }, 300)
        }
        if(e.target && e.target.flag && e.target.flag.type === 'submenu-btn') {
          menuArr[e.target.flag.parentindex].sub[e.target.flag.index].tip.animateTo({
            style: {
              opacity: 0
            }
          }, 300)
        }
      });
    }
  },
  watch: {
    'menupos.display'() {
      if (this.menupos.display) {
        // 触发绘制操作
        this.drawMenu(this.menupos.ev);
      }
    }
  },
  updated() {},
  mounted() {}
};
</script>

<style lang="less">
#zr {
  background-color: fadeout(#fff, 100);
  top: 0;
  left: 0;
  position: fixed;
  z-index: 9999;
  width: 100%;
  height: 100%;
}
</style>
