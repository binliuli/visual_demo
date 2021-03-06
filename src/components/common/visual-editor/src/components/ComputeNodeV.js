/* eslint-disable */
import zrender from 'zrender';

const NODEWIDTH = 120;
const NODEHEIGHT = 32;
const MAINBORDERCOLOR = '#ddd';
const MAINBORDERCOLORDARK = 'rgba(255,255,255,.9)';
const MAINBORDERCOLORQTH = '#2CE5FA';
const MAINBGCOLOR = '#fff';
const MAINBGCOLORDARK = '#121212';
const MAINBGCOLORQTH = '#011B27';
const SUCCESSCOLOR = '#91C53B';
const PENDINGCOLOR = '#91C53B';
const ERRORCOLOR = '#C26060';
const INPUTBGCOLOR = '#ddd';
const OUTPUTBGCOLOR = '#ddd';
const INPUTBGCOLORQTH = '#fff';
const INPUTBGCOLORQTH1 = '#2CE5FA';
const CONNECTORSIZE = 6;
const COMMONSTYLE = {
  stroke: '#f60',
  lineWidth: '1',
  fill: '#ffffff',
  opacity: 1,
  shadowBlur: 0,
  shadowColor: 'transparent',
};
const COMMONSTYLEDARK = {
  stroke: '#ffffff',
  lineWidth: '1',
  fill: '#121212',
  opacity: 1,
  shadowBlur: 0,
  shadowColor: 'transparent',
};
const COMMONSTYLEQTH = {
  stroke: '#2CE5FA',
  lineWidth: '1',
  fill: '#011B27',
  opacity: 1,
  shadowBlur: 0,
  textFill: '#CFF2FF',
  shadowColor: 'transparent',
};
const COMMONSTYLEQTH3 = {
  stroke: '#2CE5FA',
  lineWidth: '1',
  fill: '#011B27',
  opacity: 0,
  shadowBlur: 0,
  textFill: '#CFF2FF',
  shadowColor: 'transparent',
};
const COMMONSTYLEQTH4 = {
  stroke: '#2CE5FA',
  lineWidth: '1',
  fill: '#011B27',
  opacity: 1,
  shadowBlur: 0,
  textFill: '#CFF2FF',
  shadowColor: 'transparent',
};
const COMMONSELECTED = {
  stroke: '#409EF9',
  fill: '#fff',
  lineWidth: '2',
};
const COMMONSELECTEDDARK = {
  stroke: '#2C75FF',
  fill: '#121212',
  lineWidth: '2',
};
const COMMONSELECTEDQTH = {
  stroke: '#2CE5FA',
  fill: '#2CE5FA',
  lineWidth: '1',
  textFill: '#011B27'
};
const COMMONSELECTEDQTH1 = {
  stroke: '#2CE5FA',
  fill: '#fff',
  lineWidth: '1',
  textFill: '#011B27',
  opacity: 1,
}
const COMMONSELECTEDDARKLINE = {
  stroke: '#fff',
  fill: '#fff',
  lineWidth: '2',
};
const COMMONSUCCESS = {
  stroke: SUCCESSCOLOR,
  fill: '#fff',
  lineWidth: '2',
  opacity: 1,
};
const COMMONSUCCESSDARK = {
  stroke: SUCCESSCOLOR,
  fill: '#121212',
  lineWidth: '2',
};
const COMMONSUCCESSQTH = {
  stroke: SUCCESSCOLOR,
  fill: '#011B27',
  lineWidth: '1',
  textFill: '#CFF2FF',
  opacity: 1,
};
const COMMONPENDING = {
  stroke: PENDINGCOLOR,
  fill: '#fff',
  lineWidth: '2',
};
const COMMONPENDINGDARK = {
  stroke: MAINBORDERCOLORDARK,
  fill: '#121212',
  lineWidth: '2',
};
const COMMONPENDINGQTH = {
  stroke: MAINBORDERCOLORQTH,
  fill: '#121212',
  lineWidth: '1',
  opacity: 1,
};
const COMMONPENDINGQTH2 = {
  stroke: '#2CE5FA',
  fill: '#fff',
  opacity: 1,
  lineWidth: '1',
};
const COMMONERROR = {
  stroke: ERRORCOLOR,
  fill: '#fff',
  lineWidth: '2',
  opacity: 1,
};
const COMMONERRORDARK = {
  stroke: ERRORCOLOR,
  fill: '#121212',
  lineWidth: '2',
};
const COMMONERRORQTH = {
  stroke: ERRORCOLOR,
  fill: '#011B27',
  lineWidth: '1',
};
export default {
  mounted() {
    this.$on('beforelink', (e) => {
      const {
        target
      } = e;
      if (target.type === 'input' && !target.multi) {
        this.links.forEach((l) => {
          if (l.target === target) {
            e.prevent = 1;
          }
        });
      }
    });
    setTimeout(() => {
      // this.addComputeNodesV({
      //   id: 'xxxx',
      //   name: '节点名称2',
      //   icon: '/icons/img_icon00001.png',

      //   inputs: [{
      //     name: '节点名称',
      //     multi: false,
      //   }, {
      //     name: '节点名称',
      //     multi: true,
      //   }],
      //   outputs: [{
      //     name: '节点名称',
      //   }],
      // });
      // this.addComputeNodesV({
      //   id: 'xxxxa',
      //   name: '节点名称1',
      //   type: '筛选',
      //   icon: '/icons/img_icon00001.png',
      //   inputs: [{
      //     name: '节点名称',
      //     multi: false,
      //   }, {
      //     name: '节点名称',
      //     multi: true,
      //   }],
      //   outputs: [{
      //     name: '节点名称',
      //   }],
      // });
      // this.setComputeStatusV('xxxx', 'hover');
      // this.setComputeStatusV('xxxx', 'error');
      // this.setComputeStatusV('xxxxa', 'pending');
    }, 1000);
  },
  data() {
    return {};
  },
  methods: {
    setOutputsData(id, resultData) {
      this.nodes.forEach((n) => {
        if (n.id === id) {
          n.resultData = resultData;
        }
      });
      this.reload();
    },
    setComputeStatusV(id, status) {
      this.nodes.forEach((n) => {
        if (n.id === id) {
          n.status = status;
        }
        if (n.compute === id) {
          n.status = status;
        }
      });
      this.reload();
    },
    addComputeNodesV(nodes) {
      if (!nodes.forEach) {
        nodes = [nodes];
      }
      let addedNodes = [];
      nodes.forEach((node) => {
        const computeNode = node;
        node.theme = this.theme;
        const inputNodes = node.inputs.map((n, i) => ({
          id: [node.id, 'input', i].join('_'),
          ...n,
          type: 'input',
          compute: node.id,
          theme: node.theme,
        }));
        const outputNodes = node.outputs.map((n, i) => ({
          id: [node.id, 'output', i].join('_'),
          ...n,
          type: 'output',
          compute: node.id,
          theme: node.theme,
        }));
        node.type = 'compute';
        computeNode.inputs = inputNodes.map(n => n.id);
        computeNode.outputs = outputNodes.map(n => n.id);
        addedNodes.push(node);
        addedNodes = addedNodes.concat(inputNodes);
        addedNodes = addedNodes.concat(outputNodes);
      });
      this.nodes = this.nodes.concat(addedNodes);
      this.drawComputeNodesV(addedNodes);
    },
    filterComputeNodesV(nodes) {
      if (!nodes.forEach) {
        nodes = [nodes];
      }
      return nodes.filter(n => n.type && n.type.match(/(input|output|compute)/));
    },
    drawComputeNodesV(nodes) {
      nodes = this.filterComputeNodesV(nodes);
      nodes.filter(n => n.type === 'compute').forEach((node) => {
        this.drawComputeMainNodeV(node);
      });
      nodes.filter(n => n.type === 'input').forEach((node) => {
        this.drawComputeInputNodeV(node);
      });
      nodes.filter(n => n.type === 'output').forEach((node) => {
        this.drawComputeOutputNodeV(node);
      }); 
    },
    drawComputeMainNodeV(n) {
      if (typeof n.x === 'undefined') {
        const [x, y] = this.getCenter();
        n.x = x; 
        n.y = y;
      }
      const STYLES = {
        NORMAL: {
          style: this.theme === 'dark' ? {
            ...COMMONSTYLEDARK,
            stroke: MAINBORDERCOLORDARK,
            lineWidth: '2',
            fill: MAINBGCOLORDARK,
          } : this.theme === 'qth' ? {
            ...COMMONSTYLEQTH,
            stroke: MAINBORDERCOLORQTH,
            lineWidth: '1',
            fill: MAINBGCOLORQTH,
          } : {
            ...COMMONSTYLE,
            stroke: MAINBORDERCOLOR,
            lineWidth: '2',
            fill: MAINBGCOLOR,
          },
          scale: [1, 1],
        },
        SELECTED: {
          style: this.theme === 'dark' ? {
            ...COMMONSELECTEDDARK,
          } : this.theme === 'qth' ? {
            ...COMMONSELECTEDQTH,
          } : {
            ...COMMONSELECTED,
          },
        },
      };
      const width = NODEWIDTH;
      const height = NODEHEIGHT;
      const iconSize = NODEHEIGHT - 14;
      const iconX = -(width - 14) / 2;
      const iconY = -(height - 14) / 2; 
      const loadingSize = NODEHEIGHT - 14;
      const loadingX = (width - 14 - loadingSize) / 2;
      const loadingY = (height - 14 - loadingSize) / 2;
      const group = new zrender.Group({
        z: 1,
      });
      const node = new zrender.Rect({
        shape: {
          x: -width / 2,
          y: -height / 2,
          r: height / 10,
          width,
          height,
        },
        style: {
          textPadding: 4,
          textFill: this.theme === 'dark' ? '#fff' : this.theme === 'qth' ? '#CFF2FF' : '#888',
          transformText: true,
          truncate: {
            outerWidth: width * 0.63,
          },
          fontSize: this.theme === 'qth' ? 14 : 12,
          text: n.name,
        },
      });
      const iconBg = new zrender.Rect({
        shape: {
          x: iconX,
          y: iconY,
          r: iconSize / 6,
          width: iconSize,
          height: iconSize,
        },
        style: {
          lineWidth: '0',
          fill: this.theme === 'dark' ? '#121212' : this.theme === 'qth' ? '' : '#B9C278',
          opacity: 1,
        },
      });


      const icon = new zrender.Image({
        style: {
          x: iconX + iconSize * 0.15,
          y: iconY + iconSize * 0.15,
          width: iconSize * 0.7,
          height: iconSize * 0.7,
        },
      });

      this.setIconImage(n.icon, icon);

      const loading = new zrender.Sector({
        shape: {
          cx: loadingX,
          cy: loadingY,
          r: loadingSize / 2,
          r0: (loadingSize - 8) / 2,
          startAngle: -Math.PI / 2,
          endAngle: -Math.PI / 2,
        },
        style: {
          fill: '#eee',
          opacity: 0,
        },
      });
      const loadingAnim = loading.animate('shape', true).when(800, {
        endAngle: Math.PI * 1.5
      }).when(1500, {
        startAngle: Math.PI * 1.5,
        endAngle: Math.PI * 1.6
      });
      let loadingStarted = false;
      // loadingAnim.start();
      group.beforeUpdate = function () {
        node.attr(STYLES.NORMAL);
        if (n.status === 'success') {
          node.attr({
            style: n.theme === 'dark' ? COMMONSUCCESSDARK : n.theme === 'qth' ? COMMONSUCCESSQTH : COMMONSUCCESS,
          });
        }
        if (n.status === 'pending') {
          node.attr({
            style: n.theme === 'dark' ? COMMONPENDINGDARK : n.theme === 'qth' ? COMMONPENDINGQTH : COMMONPENDING,
          });
          if (!loadingStarted) {
            loading.attr({
              style: {
                opacity: 1,
              },
            });
            loadingAnim.start();
            loadingStarted = true;
          }
        } else if (loadingStarted === true) {
          loadingStarted = false;
          loading.attr({
            style: {
              opacity: 0,
            },
          });
          loadingAnim.stop();
        }
        if (n.status === 'error') {
          node.attr({
            style: n.theme === 'dark' ? COMMONERRORDARK : n.theme === 'qth' ? COMMONERRORQTH : COMMONERROR,
          });
        }
        if (n.selected) {
          node.attr(STYLES.SELECTED);
        }
      };
      group.add(node);
      group.add(iconBg);
      group.add(icon);
      group.add(loading);

      n.node = group;
      this.nodesGroup.add(group);
      n.onSelect = () => {
        n.inputs.forEach((id) => {
          this.nodes.forEach((item) => {
            if (item.id === id) {
              item.selected = true;
            }
          });
        });
        n.outputs.forEach((id) => {
          this.nodes.forEach((item) => {
            if (item.id === id) {
              item.selected = true;
            }
          });
        });
      };

      n.onUnSelect = () => {
        n.inputs.forEach((id) => {
          this.nodes.forEach((item) => {
            if (item.id === id) {
              item.selected = null;
            }
          });
        });
        n.outputs.forEach((id) => {
          this.nodes.forEach((item) => {
            if (item.id === id) {
              item.selected = null;
            }
          });
        });
      };

      group.on('mouseover', (e) => {
        this.$emit('computemouseover', {
          event: e,
          node: n,
        });
        this.setComputeStatusV(n.id, 'hover');
      });
      group.on('mouseout', (e) => {
        this.$emit('computemouseout', {
          event: e,
          node: n,
        });
        this.setComputeStatusV(n.id, 'out');
      });

      group.on('click', (e) => {
        this.$emit('computeclick', {
          event: e,
          node: n,
        });
      });

      this.setNodePosition(n);
      this.bindNodeEvent(n);
    },
    drawComputeInputNodeV(node) {
      console.log(node);
      let pos = 0;
      const root = this.nodes.filter((n) => {
        if (n.type !== 'compute') {
          return false;
        }
        const index = n.inputs.indexOf(node.id);
        if (index > -1) {
          pos = index;
          return true;
        }
        return false;
      })[0];
      const count = root.inputs.length + 1;
      const gap = NODEHEIGHT / count;
      const top = gap * (pos + 1);

      node.x = root.x - NODEWIDTH / 2;
      node.y = root.y - NODEHEIGHT / 2 + top;

      const STYLES = {
        NORMAL: {
          style: this.theme === 'dark' ? {
            ...COMMONSTYLEDARK,
            stroke: INPUTBGCOLOR,
            lineWidth: '0',
            fill: INPUTBGCOLOR,
          } : this.theme === 'qth' ? {
            ...COMMONSTYLEQTH3,
            stroke: INPUTBGCOLORQTH1,
            lineWidth: '0',
            fill: INPUTBGCOLORQTH,
          } : {
            ...COMMONSTYLE,
            stroke: INPUTBGCOLOR,
            lineWidth: '0',
            fill: INPUTBGCOLOR,
          },
          scale: [1, 1],
        },
        SELECTED: {
          style: this.theme === 'dark' ? {
            ...COMMONSELECTEDDARK,
          } : this.theme === 'qth' ? {
            ...COMMONSELECTEDQTH1,
          } : {
            ...COMMONSELECTED,
          },
        },
        LINKTARGET: {
          style: this.theme === 'dark' ? {
            ...COMMONSELECTEDDARKLINE,
          } : {
            ...COMMONSELECTED,
          },
        },
      };
      const width = CONNECTORSIZE;
      const height = CONNECTORSIZE;
      const group = new zrender.Group({
        z: 1,
      });
      const connector = new zrender.Rect({
        shape: {
          x: -width / 2,
          y: -height / 2,
          r: height / 2,
          width,
          height,
        },
      });


      group.beforeUpdate = function () {
        connector.attr(STYLES.NORMAL);
        if (node.status === 'success') {
          connector.attr({
            style: node.theme === 'dark' ? COMMONSUCCESSDARK : COMMONSUCCESS,
          });
        }
        if (node.status === 'pending') {
          connector.attr({
            style: node.theme === 'dark' ? COMMONPENDINGDARK : node.theme === 'qth' ? COMMONPENDINGQTH2 : COMMONPENDING,
          });
        }
        if (node.status === 'error') {
          connector.attr({
            style: node.theme === 'dark' ? COMMONERRORDARK : COMMONERROR,
          });
        }
        if (node.status === 'hover') {
          connector.attr({
            style: node.theme === 'dark' ? COMMONPENDINGDARK : node.theme === 'qth' ? COMMONSTYLEQTH4 : COMMONPENDING,
            // style: node.theme === 'dark' ? COMMONPENDINGDARK : COMMONPENDING,
          });
        }
        if (node.selected) {
          connector.attr(STYLES.SELECTED);
        }
        if (node.linkTarget) {
          connector.attr(STYLES.LINKTARGET);
        }
      };

      group.add(connector);
      group.on('mouseover', (e) => {
        this.zr.addHover(connector, this.theme === 'dark' ? {
          ...COMMONSELECTEDDARK,
        } : {
          ...COMMONSELECTED,
        });
        this.$emit('inputmouseover', {
          event: e,
          node,
        });
        this.setComputeStatusV(node.id, 'hover');
      });
      group.on('mouseout', (e) => {
        this.zr.removeHover(connector);
        this.$emit('inputmouseout', {
          event: e,
          node,
        });
        this.setComputeStatusV(node.id, 'out');
      });
      group.on('click', (e) => {
        this.$emit('inputclick', {
          event: e,
          node,
        });
      });
      node.node = group;
      this.nodesGroup.add(group);
      this.setNodePosition(node);
      this.bindNodeEvent(node);
    },
    drawComputeOutputNodeV(node) {
      let pos = 0;
      const root = this.nodes.filter((n) => {
        if (n.type !== 'compute') {
          return false;
        }
        const index = n.outputs.indexOf(node.id);
        if (index > -1) {
          pos = index;
          return true;
        }
        return false;
      })[0];
      const count = root.outputs.length + 1;
      const gap = NODEHEIGHT / count;
      const top = gap * (pos + 1);

      node.x = root.x + NODEWIDTH / 2;
      node.y = root.y - NODEHEIGHT / 2 + top;

      const STYLES = {
        NORMAL: {
          style: this.theme === 'dark' ? {
            ...COMMONSTYLEDARK,
            stroke: OUTPUTBGCOLOR,
            lineWidth: '0',
            fill: OUTPUTBGCOLOR,
          } : this.theme === 'qth' ? {
            ...COMMONSTYLEQTH3,
            stroke: INPUTBGCOLORQTH1,
            lineWidth: '0',
            fill: INPUTBGCOLORQTH,
          } : {
            ...COMMONSTYLE,
            stroke: OUTPUTBGCOLOR,
            lineWidth: '0',
            fill: OUTPUTBGCOLOR,
          },
          scale: [1, 1],
        },
        SELECTED: {
          style: this.theme === 'dark' ? {
            ...COMMONSELECTEDDARK,
          } : this.theme === 'qth' ? {
            ...COMMONSELECTEDQTH1,
          } : {
            ...COMMONSELECTED,
          },
        },
      };
      const width = CONNECTORSIZE;
      const height = CONNECTORSIZE;
      const group = new zrender.Group({
        z: 1,
      });
      const connector = new zrender.Rect({
        shape: {
          x: -width / 2,
          y: -height / 2,
          r: height / 2,
          width,
          height,
        },
      });

      group.beforeUpdate = function () {
        connector.attr(STYLES.NORMAL);
        if (node.status === 'success') {
          connector.attr({
            style: node.theme === 'dark' ? COMMONSUCCESSDARK : COMMONSUCCESS,
          });
        }
        if (node.status === 'pending') {
          connector.attr({
            style: node.theme === 'dark' ? COMMONPENDINGDARK : node.theme === 'qth' ? COMMONPENDINGQTH2 : COMMONPENDING,
            // style: node.theme === 'dark' ? COMMONPENDINGDARK : COMMONPENDING,
          });
        }
        if (node.status === 'hover') {
          connector.attr({
            style: node.theme === 'dark' ? COMMONPENDINGDARK : node.theme === 'qth' ? COMMONSTYLEQTH4 : COMMONPENDING,
            // style: node.theme === 'dark' ? COMMONPENDINGDARK : COMMONPENDING,
          });
        }
        if (node.status === 'error') {
          connector.attr({
            style: node.theme === 'dark' ? COMMONERRORDARK : COMMONERROR,
          });
        }
        if (node.selected) {
          connector.attr(STYLES.SELECTED);
        }
      };

      group.add(connector);
      node.node = group;
      node.beforeDrop = d => node.compute !== d.compute;
      group.on('mouseover', (e) => {
        this.zr.addHover(connector, this.theme === 'dark' ? {
          ...COMMONSELECTEDDARK,
        } : {
          ...COMMONSELECTED,
        });
        this.$emit('outputmouseover', {
          event: e,
          node,
        });
        this.setComputeStatusV(node.id, 'hover');
      });
      group.on('mouseout', (e) => {
        this.zr.removeHover(connector);
        this.$emit('outputmouseout', {
          event: e,
          node,
        });
        this.setComputeStatusV(node.id, 'out');
      });

      group.on('click', (e) => {
        this.$emit('outputclick', {
          event: e,
          node,
        });
      });

      this.nodesGroup.add(group);
      this.setNodePosition(node);
      this.bindNodeEvent(node);
    },
  },
};
/**
 * 未完成：
 * 删除节点：顺着把后面的节点全删了
 */
/**
 * 节点全部打平，计算节点属性记在group上
 * 暴露事件 mouseover mouseout click  => event node
 * 节点的状态 normal pending success error
 * 新增节点类型 input output compute
 * input 只能作为连线的终点 有单线限制（设置后可以接多个）
 * output 只能作为连接的起点 无单线限制，可以输出到多个单元
 * compute 包含名称，图标，状态等元素
{
    id: 'xxxx',
    name: '节点名称',
    type: '筛选',
    icon: '图标',
    inputs: [{ // in 类型节点只能接收连接
      name: '节点名称',
      multi: false,
      ... // 其它业务属性
    }],
    outputs: []
  }
 */
