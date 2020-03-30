import _ from 'lodash';

const getDistance = (x1, y1, x2, y2) => {
  const a = x1 - x2;
  const b = y1 - y2;
  return Math.sqrt(a * a + b * b);
};
export default {
  data() {
    return {
      draggingNode: false,
      hoverNodeItem: null,
    };
  },
  methods: {
    initGlobalEvent() {
      const that = this;
      // 绑定右键
      that.zr.on('contextmenu', (e) => {
        e.event.preventDefault();
        that.$emit('contextmenu', {
          event: e,
          nodes: that.nodes.filter(n => n.selected),
          links: that.links.filter(n => n.selected),
        });
      });
    },
    bindLineEvent(data) {
      const { line } = data;
      const that = this;

      // 绑定点击事件
      line.on('click', () => {
        that.$emit('clickline', data);
        if (!data.selected) {
          this.selectLink(data, !that.hasKey('shift'));
        } else {
          data.selected = false;
        }
        that.reload();
        that.emitSelectChangeEvent();
      });
    },
    bindNodeEvent(data) {
      const that = this;
      const { node } = data;
      let eventObject;

      const getXY = (e) => {
        let x;
        let y;
        if (!this.transform) {
          x = e.offsetX;
          y = e.offsetY;
        } else {
          [x, y] = this.transform.invert([e.zrX, e.zrY]);
        }
        return {
          x,
          y,
        };
      };

      // 绑定鼠标经过
      node.on('mouseover', () => {
        if (that.hoverTimeout) {
          clearTimeout(that.hoverTimeout);
        }
        // console.log(data);
        that.hoverNodeItem = data;
        that.$emit('hoverenternode', data);
      });
      node.on('mouseout', () => {
        if (that.hoverTimeout) {
          clearTimeout(that.hoverTimeout);
        }
        that.hoverTimeout = setTimeout(() => {
          that.hoverNodeItem = null;
          that.$emit('hoverleavenode');
        }, 1500);
      });

      // 绑定双击
      node.on('dblclick', (e) => {
        that.$emit('dblclick', e);
      });


      // 绑定点击事件
      node.on('click', () => {
        that.$emit('click', data);
      });

      node.on('mousedown', function (e) {
        if (e.which !== 1) {
          if (!data.selected) {
            that.selectNode(data, true);
          }
          return;
        }
        if (data.selected) {
          // that.unselectNode(data);
        } else {
          that.selectNode(data, !that.hasKey('shift'));
        }
        eventObject = e.event;
        node.drag = true;
        dragstart.bind(this)(data, 'start');
      });
      const mouseup = (e) => {
        if (node.drag) {
          eventObject = e.event;
          node.drag = false;
          dragend.bind(this)(data, 'end');
        }
      };
      that.zr.on('mouseup', mouseup);
      that.zr.on('mouseout', function (e) {
        if (e.target) {
          return;
        }
        mouseup.bind(this)(e);
      });
      that.zr.on('mousemove', function (e) {
        if (node.drag) {
          eventObject = e.event;
          e.event.preventDefault();
          e.event.stopPropagation();
          dragged.bind(this)(data);
        }
      });

      // 绑定拖拽
      let offsetX; let offsetY; let
        originState;
      const bindNormalDrag = function (d, type) {
        const selectedNodes = that.nodes.filter(d => d.selected);
        const targetLinks = that.links.filter((l) => {
          let pass = false;
          selectedNodes.forEach((n) => {
            pass = pass || (l.source === n || l.target === n);
          });
          return pass;
        });

        if (d.type && d.type.match(/(output|input)/)) {
          return;
        }

        if (type === 'start') {
          originState = {
            endPoint: {
              x: d.x,
              y: d.y,
            },
            selectedNodes,
            targetLinks,
          };
          const pos = getXY(eventObject);
          offsetX = data.x - pos.x;
          offsetY = data.y - pos.y;
          that.draggingNode = true;
        }
        // 第一次执行操作
        const latestState = {
          endPoint: {
            ...getXY(eventObject),
          },
          selectedNodes,
          targetLinks,
        };
        const fn = (state) => {
          const {
            endPoint,
            selectedNodes,
            targetLinks,
          } = state;
          const mx = endPoint.x - data.x + offsetX;
          const my = endPoint.y - data.y + offsetY;
          // if(mx < 10 && my < 10) {
          //   return;
          // }
          selectedNodes.forEach((d) => {
            d.x += mx;
            d.y += my;
          });
          that.setNodePosition(selectedNodes);
          that.setLinkPosition(targetLinks);
        };

        fn(latestState);

        if (type === 'end') {
          that.undoInst.add({
            data: latestState,
            fn,
          }, {
            data: originState,
            fn,
          });
          that.draggingNode = false;
        }
      };


      /**
       * 连线模式下的拖拽动作
       */
      let tempLine; let
        tempTarget;
      const bindLinkDragStart = function (d) {
        if (d.type && d.type.match(/(group|input|compute)/)) {
          return;
        }
        tempTarget = {
          x: d.x,
          y: d.y,
        };
        tempLine = {
          source: d,
          target: tempTarget,
          theme: that.theme,
        };
        that.drawLink(tempLine);
      };
      const bindLinkDrag = function (d) {
        if (!tempTarget) {
          return;
        }
        const pos = getXY(eventObject);
        Object.assign(tempTarget, pos);
        that.setLinkPosition(tempLine);
        that.nodes.forEach((n) => {
          if (n.type !== 'group' && getDistance(n.x, n.y, pos.x, pos.y) < 30 && (!d.beforeDrop || d.beforeDrop(n))) {
            n.linkTarget = true;
          } else {
            n.linkTarget = null;
          }
        });
      };
      const bindLinkDragEnd = function (source) {
        if (!tempLine) {
          return;
        }
        that.linksGroup.remove(tempLine.line);


        that.nodes.forEach((n) => {
          if (n.linkTarget) {
            n.linkTarget = null;
            if (source === n) {
              return;
            }
            if (n.type && n.type.match(/(group|output|compute)/)) {
              return;
            }
            const newLink = {
              source,
              target: n,
              theme: that.theme,
            };
            const e = {
              prevent: 0,
              ...newLink,
            };
            that.$emit('beforelink', e);

            if (e.prevent) {
              return;
            }
            that.links.push(newLink);
            that.drawLink(newLink);
            that.clearSelection();
          }
        });
      };

      /**
       * 拖拽事件的通用绑定回调
       */

      const dragged = function (d) {
        // 绑定普通模式下点的拖拽事件
        if (that.mode === 'normal') {
          bindNormalDrag.bind(this)(d);
        }
        // 绑定连线模式下的拖拽
        if (that.mode === 'link' || d.type === 'output') {
          bindLinkDrag.bind(this)(d);
        }
      };

      const dragstart = function (d) {
        // 绑定普通模式下点的拖拽事件
        if (that.mode === 'normal') {
          bindNormalDrag.bind(this)(d, 'start');
        }
        // 绑定连线模式下的拖拽开始
        if (that.mode === 'link' || d.type === 'output') {
          bindLinkDragStart.bind(this)(d);
        }
      };

      const dragend = function (d) {
        // 绑定普通模式下点的拖拽事件
        if (that.mode === 'normal') {
          bindNormalDrag.bind(this)(d, 'end');
        }
        // 绑定连线模式下的拖拽结束
        if (that.mode === 'link' || d.type === 'output') {
          bindLinkDragEnd.bind(this)(d);
        }
      };
    },
  },
};
