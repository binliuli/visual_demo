import {
  Rect,
} from 'zrender/lib/export';

class Selection {
  constructor({
    zr,
    vm,
  }) {
    this.zr = zr;
    this.vm = vm;
    this.brushing = false;
    this.rectBox = [];
    this.selection = [];
    this.brushend = this.brushend.bind(this);
    this.initBrush();
    return this;
  }

  setBox(e, start) {
    if (start) {
      this.rectBox[0] = [e.offsetX, e.offsetY];
    }
    this.rectBox[1] = [e.offsetX, e.offsetY];
    const [
      [x1, y1],
      [x2, y2],
    ] = this.rectBox;
    this.selection = [
      [Math.min(x1, x2), Math.min(y1, y2)],
      [Math.max(x1, x2), Math.max(y1, y2)],
    ];
    const width = Math.abs(x1 - x2);
    const height = Math.abs(y1 - y2);
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    this.brushBox.attr({
      shape: {
        x,
        y,
        width,
        height,
      },
    });
  }

  initBrush() {
    this.brushBox = new Rect({
      shape: {},
      style: {
        fill: 'rgba(154,202,131,0.1)',
        stroke: 'rgba(154,202,131,0.4)',
        z: 1000,
      },
    });
    this.zr.on('mousedown', (e) => {
      if (e.which === 1 && !e.target) {
        this.brushstart(e);
      }
    });
    this.zr.on('mousemove', (e) => {
      if (this.brushing) {
        this.brushed(e);
      }
    });
  }

  brushstart(e) {
    this.brushing = true;
    this.zr.add(this.brushBox);
    this.setBox(e, true);
    document.addEventListener('mouseup', this.brushend);
    this.vm.clearSelection();
  }

  brushed(e) {
    this.setBox(e);

    const [
      [x1, y1],
      [x2, y2],
    ] = this.selection;
    this.vm.nodes.forEach((d) => {
      if (d.group) {
        return;
      }
      const transform = this.vm.transform;
      const x = transform ? transform.applyX(d.x) : d.x;
      const y = transform ? transform.applyY(d.y) : d.y;
      const selected = x > x1 && x < x2 && y > y1 && y < y2;
      if (selected) {
        this.vm.selectNode(d);
      } else {
        this.vm.unselectNode(d);
      }
    });
    // this.brushedCallback(this.svg.selectAll('.node.selected'));
  }

  brushend() {
    if (this.brushing) {
      this.brushing = false;
      this.zr.remove(this.brushBox);
      document.removeEventListener('mouseup', this.brushend);
    }
  }

  setOffset(offset) {
    this.offset = offset;
  }

  onBurshed(fn) {
    this.brushedCallback = fn;
  }
}

export default {
  data() {
    return {
      selectChild: false,
    };
  },
  mounted() {
    document.addEventListener('keydown', this.selectionKeyDownHandler);
    document.addEventListener('keyup', this.selectionKeyUpHandler);
  },

  destroyed() {
    document.removeEventListener('keydown', this.selectionKeyDownHandler);
    document.removeEventListener('keyup', this.selectionKeyUpHandler);
  },
  watch: {},
  methods: {
    initSelection() {
      this.selection = new Selection({
        zr: this.zr,
        vm: this,
      });
      this.selection.onBurshed((nodes) => {
        this.$emit('brushed', nodes);
      });
    },
    selectionKeyDownHandler(e) {
      const isInputElem = e.target.tagName.toUpperCase().match(/INPUT|TEXTAREA/);
      if (e.keyCode === 32 && !isInputElem) {
        e.preventDefault();
        e.stopPropagation();
        this.selectChild = true;
      }
    },
    selectionKeyUpHandler() {
      this.selectChild = false;
    },
    updateLineSelection(highlight) {
      if (this.updateLineTimeout) {
        clearTimeout(this.updateLineTimeout);
      }
      const key = highlight ? 'highlight' : 'selected';
      this.updateLineTimeout = setTimeout(() => {
        this.links.forEach((l) => {
          l[key] = false;
          if (l.source[key] || l.target[key]) {
            l[key] = true;
          }
        });
        this.reload();
      }, 40);
    },
    emitSelectChangeEvent() {
      if (this.selectChangeTimeout) {
        clearTimeout(this.selectChangeTimeout);
      }
      this.selectChangeTimeout = setTimeout(() => {
        this.reload();
        this.$emit('selectchange', {
          nodes: this.nodes.filter(n => n.selected),
          links: this.links.filter(n => n.selected),
        });
      }, 100);
    },
    /**
     * 选中点和线
     * @function selectItems
     * @param {*} [inputData={nodes:[], links:[]}] 要选中的点和线
     */
    selectItems({
      links = [],
      nodes = [],
    }) {
      this.selectLink([], true);
      if (links.length) {
        this.selectLink(links, true);
      }
      this.nodes.forEach((n) => {
        this.unselectNode(n, true);
      });
      if (nodes.length) {
        nodes.forEach((n) => {
          this.selectNode(n, null, true);
        });
      }
      this.emitSelectChangeEvent();
    },
    selectLink(links, single) {
      if (!links) {
        return;
      }
      if (!links.forEach) {
        links = [links];
      }
      if (single) {
        this.links.forEach((l) => {
          l.selected = false;
        });
        this.nodes.forEach((n) => {
          if (n.selected) {
            this.unselectNode(n, true);
          }
        });
      }
      links.forEach((link) => {
        link.selected = true;
      });
      this.emitSelectChangeEvent();
    },
    unselectLink(links) {
      if (!links) {
        return;
      }
      if (!links.forEach) {
        links = [links];
      }
      links.forEach((link) => {
        link.selected = false;
      });
      this.emitSelectChangeEvent();
    },
    selectNode(data, single, nodeOnly, style = {
      shape: {
        r: 10,
      },
      style: {
        stroke: 'rgba(255,100,0,1)',
        fill: 'rgba(255,100,0,0)',
        lineWidth: 2,
        opacity: 0,
      },
      z: 100,
    }) {
      // this.setHighlight(null, true);
      const node = data.node;
      const rect = node.getBoundingRect();
      if (single) {
        this.nodes.forEach((n) => {
          if (n.selected && n !== data) {
            this.unselectNode(n);
          }
        });
        this.links.forEach((l) => {
          l.selected = null;
        });
      }
      style.shape = {
        ...style.shape,
        ...rect,
        r: Math.max(rect.width, rect.height) / 2,
      };
      if (data.selected) {
        return;
      }

      const disabledType = ['input', 'output'];
      if (disabledType.indexOf(data.type) > -1) {
        return;
      }

      // 以下类型的节点特殊处理，不走通用选中
      const types = ['compute'];
      if (types.indexOf(data.type) > -1) {
        data.selected = true;
      } else {
        data.selected = new Rect({
          ...style,
        });
        node.add(data.selected);
        data.selected.animateTo({
          style: {
            opacity: 0.7,
          },
          scale: [1.1, 1.1],
        }, 200);
        node.eachChild((n) => {
          n.attr('z', 100);
        });

        if (data.type === 'group') {
          this.nodes.filter(n => n.group === data).forEach((n) => {
            this.selectNode(n, false, nodeOnly, style = {
              shape: {
                r: 8,
              },
              style: {
                stroke: 'rgba(0,0,0,0)',
                fill: 'rgba(0,0,0,0)',
                lineWidth: 2,
                opacity: 0,
              },
              z: 100,
            }, true);
          });
        }
      }
      data.onSelect && data.onSelect(data);
      this.emitSelectChangeEvent();
    },
    unselectNode(data) {
      const node = data.node;
      if (!data.selected) {
        return;
      }
      const disabledType = ['input', 'output'];
      if (disabledType.indexOf(data.type) > -1) {
        return;
      }
      if (typeof data.selected === 'object') {
        node.remove(data.selected);
        node.eachChild((n) => {
          n.attr('z', null);
        });
      }
      data.selected = null;
      data.onUnSelect && data.onUnSelect(data);
      this.emitSelectChangeEvent();
    },
    clearSelection() {
      this.nodes.forEach((n) => {
        this.unselectNode(n);
      });
      this.links.forEach((l) => {
        l.selected = null;
      });
      this.emitSelectChangeEvent();
    },
    /**
     * 按条件选中点
     * @function selectByCondition
     * @param {} fn 用于判断是否要选中该点，传入node，需要选中的返回true
     */
    selectByCondition(fn) {
      this.nodes.forEach((n) => {
        if (fn(n)) {
          this.selectNode(n);
        } else {
          this.unselectNode(n);
        }
      });
    },
    /**
     * 按条件选中线
     * @function selectLinksByCondition
     * @param {} fn 用于判断是否要选中，传入link，需要选中的返回true
     */
    selectLinksByCondition(fn) {
      this.links.forEach((l) => {
        if (fn(l)) {
          this.selectLink(l);
        } else {
          this.unselectLink(l);
        }
      });
    },
    setHighlight(ids) {
      if (ids && ids.length) {
        this.clearSelection();
        ids.forEach((id) => {
          this.nodes.forEach((n) => {
            if (n.id === id) {
              this.selectNode(n);
            }
          });
        });
      } else {
        this.clearSelection();
        // this.nodes.forEach(n => {
        //   delete n.highlight;
        // });
        // this.links.forEach(n => {
        //   delete n.highlight;
        // });
        // if(!noReload) {
        //   this.reload();
        // }
      }

      // if(ids && ids.length) {
      //   this.nodes.forEach(n => {
      //       n.highlight = false;
      //   });
      //   ids.forEach(id => {
      //     this.nodes.forEach(n => {
      //       if(n.id === id) {
      //         n.highlight = true;
      //       }
      //     });
      //   });
      //   this.updateLineSelection(true);
      // } else {
      //   this.nodes.forEach(n => {
      //     delete n.highlight;
      //   });
      //   this.links.forEach(n => {
      //     delete n.highlight;
      //   });
      //   if(!noReload) {
      //     this.reload();
      //   }
      // }
    },
  },
};
