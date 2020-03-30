import _ from 'lodash';
import * as d3 from 'd3';

export default {
  props: {
    workerBase: {
      default: '',
    },
  },
  data() {
    return {
      loadingLayout: false,
    };
  },
  mounted() {
    this.worker = new Worker(`${this.workerBase}/worker.js`);
  },
  methods: {
    clearNodeForClone(n) {
      const cn = _.clone(n);

      if (cn.selected) {
        cn.selected = true;
      }
      if (cn.group) {
        cn.group = true;
      }
      delete cn.node;
      return cn;
    },
    clearLinkForClone(n) {
      const cn = _.clone(n);
      cn.source = _.clone(cn.source);
      cn.target = _.clone(cn.target);
      delete cn.anim;
      delete cn.source.node;
      delete cn.source.selected;
      delete cn.source.group;
      delete cn.target.node;
      delete cn.target.selected;
      delete cn.target.group;
      delete cn.line;
      return cn;
    },

    renderLayout(nodes, fastFit) {
      const animArgs = [400, 0, 'quadraticInOut', () => {
        this.zoomFit();
      }];
      this.links.forEach((d) => {
        const pos = {};
        let run = false;
        nodes.forEach((nd) => {
          if (nd === d.source) {
            run = true;
            Object.assign(pos, {
              x1: nd.x,
              y1: nd.y,
            });
          }
          if (nd === d.target) {
            run = true;
            Object.assign(pos, {
              x2: nd.x,
              y2: nd.y,
            });
          }
        });
        const {
          points,
          shape,
          textOffset,
        } = this.getLineCrossNodePoint(d);
        if (fastFit) {
          run && d.line.lineElem.attr({
            shape,
          });
          run && d.line.arrowElem && d.line.arrowElem.attr({
            shape: {
              points,
            },
          });
          run && d.line.textLine && d.line.textLine.attr({
            shape: {
              ...shape,
            },
            style: {
              // stroke: 'rgba(0, 0, 0, 0)',
              textOffset,
            },
          });
          return;
        }
        // console.log(i, d, shape)
        run && d.line.lineElem.animateTo({
          shape,
        }, ...animArgs);
        run && d.line.arrowElem && d.line.arrowElem.animateTo({
          shape: {
            points,
          },
        }, ...animArgs);
        run && d.line.textLine && d.line.textLine.animateTo({
          shape: {
            ...shape,
          },
          style: {
            // stroke: 'rgba(0, 0, 0, 0)',
            textOffset,
          },
        }, ...animArgs);
      });
      nodes.forEach((d) => {
        if (fastFit) {
          d.node.attr({
            position: [
              d.x,
              d.y,
            ],
          });
          return;
        }
        d.node.animateTo({
          position: [
            d.x,
            d.y,
          ],
        }, ...animArgs);
      });

      if (fastFit) {
        this.zoomFit(1, true);
      }
    },
    // 水平布局的树形结构
    treeHorizontalLayoutNodes() {
      const cloneNodes = this.nodes.map((n, i) => {
        n.index = i;
        return this.clearNodeForClone(n);
      });

      const selectedNodes = cloneNodes.filter(n => n.selected);

      const vNode = {
        id: -1,
      };

      selectedNodes.forEach((n) => {
        n.parentNode = vNode;
      });

      const nodeById = (id) => {
        const n = _.find(cloneNodes, n => n.id === id);
        return n;
      };

      const setTreeParent = (nextLevelNodes) => {
        const tmpNextLevel = [];
        nextLevelNodes.forEach((n) => {
          // 从关系中找到下一层
          this.links.forEach((l) => {
            const sourceId = l.source.id;
            const targetId = l.target.id;
            let node;
            if (sourceId === n.id) {
              node = nodeById(targetId);
            }
            if (targetId === n.id) {
              node = nodeById(sourceId);
            }
            if (!node) {
              return;
            }
            if (!node.parentNode) {
              node.parentNode = n;
              tmpNextLevel.push(node);
            }
          });
        });
        if (tmpNextLevel.length) {
          setTreeParent(tmpNextLevel);
        }
      };

      setTreeParent(selectedNodes);

      const data = d3.hierarchy(vNode, d => cloneNodes.filter(n => n.parentNode && n.parentNode
        .id === d.id));

      d3.tree().nodeSize([60, 200])(data);

      const depthArr = [];

      const setNodePos = (root) => {
        if (root.children) {
          root.children.forEach((r) => {
            setNodePos(r);
          });
        }
        const id = root.data.id;
        depthArr[root.depth] = depthArr[root.depth] || [];
        this.nodes.forEach((n) => {
          if (n.id === id) {
            depthArr[root.depth].push(n);
            n.x = root.y;
            n.y = root.x;
          }
        });
      };
      setNodePos(data);
      // depthArr.forEach((items, level) => {
      //   if (level === 0) {
      //     return;
      //   }
      //   if (items.length === 1) {
      //     items.forEach((d) => {
      //       d.x = 0;
      //     });
      //     return;
      //   }
      //   const left = _.minBy(items, o => o.x).x;
      //   const right = _.maxBy(items, o => o.x).x;
      //   const width = right - left;
      //   const offset = width / 2 - right;
      //   items.forEach((d) => {
      //     d.x += offset;
      //   });
      // });
      this.renderLayout(this.nodes);
    },
    // 垂直布局的树形结构
    treeVerticalityLayoutNodes() {
      const cloneNodes = this.nodes.map((n, i) => {
        n.index = i;
        return this.clearNodeForClone(n);
      });

      const selectedNodes = cloneNodes.filter(n => n.selected);

      const vNode = {
        id: -1,
      };

      selectedNodes.forEach((n) => {
        n.parentNode = vNode;
      });

      const nodeById = (id) => {
        const n = _.find(cloneNodes, n => n.id === id);
        return n;
      };

      const setTreeParent = (nextLevelNodes) => {
        const tmpNextLevel = [];
        nextLevelNodes.forEach((n) => {
          // 从关系中找到下一层
          this.links.forEach((l) => {
            const sourceId = l.source.id;
            const targetId = l.target.id;
            let node;
            if (sourceId === n.id) {
              node = nodeById(targetId);
            }
            if (targetId === n.id) {
              node = nodeById(sourceId);
            }
            if (!node) {
              return;
            }
            if (!node.parentNode) {
              node.parentNode = n;
              tmpNextLevel.push(node);
            }
          });
        });
        if (tmpNextLevel.length) {
          setTreeParent(tmpNextLevel);
        }
      };

      setTreeParent(selectedNodes);

      const data = d3.hierarchy(vNode, d => cloneNodes.filter(n => n.parentNode && n.parentNode
        .id === d.id));

      d3.tree().nodeSize([60, 200])(data);

      const depthArr = [];

      const setNodePos = (root) => {
        if (root.children) {
          root.children.forEach((r) => {
            setNodePos(r);
          });
        }
        const id = root.data.id;
        depthArr[root.depth] = depthArr[root.depth] || [];
        this.nodes.forEach((n) => {
          if (n.id === id) {
            depthArr[root.depth].push(n);
            n.x = root.x;
            n.y = root.y;
          }
        });
      };
      setNodePos(data);
      depthArr.forEach((items, level) => {
        if (level === 0) {
          return;
        }
        if (items.length === 1) {
          items.forEach((d) => {
            d.x = 0;
          });
          return;
        }
        const left = _.minBy(items, o => o.x).x;
        const right = _.maxBy(items, o => o.x).x;
        const width = right - left;
        const offset = width / 2 - right;
        items.forEach((d) => {
          d.x += offset;
        });
      });
      this.renderLayout(this.nodes, false, 'treev');
    },
    treeLayoutNodes() {
      const cloneNodes = this.nodes.map((n, i) => {
        n.index = i;
        return this.clearNodeForClone(n);
      });

      const selectedNodes = cloneNodes.filter(n => n.selected);

      const vNode = {
        id: -1,
      };

      selectedNodes.forEach((n) => {
        n.parentNode = vNode;
      });

      const nodeById = (id) => {
        const n = _.find(cloneNodes, n => n.id === id);
        return n;
      };

      const setTreeParent = (nextLevelNodes) => {
        const tmpNextLevel = [];
        nextLevelNodes.forEach((n) => {
          // 从关系中找到下一层
          this.links.forEach((l) => {
            const sourceId = l.source.id;
            const targetId = l.target.id;
            let node;
            if (sourceId === n.id) {
              node = nodeById(targetId);
            }
            if (targetId === n.id) {
              node = nodeById(sourceId);
            }
            if (!node) {
              return;
            }
            if (!node.parentNode) {
              node.parentNode = n;
              tmpNextLevel.push(node);
            }
          });
        });
        if (tmpNextLevel.length) {
          setTreeParent(tmpNextLevel);
        }
      };

      setTreeParent(selectedNodes);

      const data = d3.hierarchy(vNode, d => cloneNodes.filter(n => n.parentNode && n.parentNode
        .id === d.id));

      d3.tree().nodeSize([30, 100])(data);

      const depthArr = [];

      const setNodePos = (root) => {
        if (root.children) {
          root.children.forEach((r) => {
            setNodePos(r);
          });
        }
        const id = root.data.id;
        depthArr[root.depth] = depthArr[root.depth] || [];
        this.nodes.forEach((n) => {
          if (n.id === id) {
            depthArr[root.depth].push(n);
            n.x = root.x;
            n.y = root.y;
          }
        });
      };
      setNodePos(data);
      depthArr.forEach((items, level) => {
        if (level === 0) {
          return;
        }
        if (items.length === 1) {
          items.forEach((d) => {
            d.x = 0;
          });
          return;
        }
        const left = _.minBy(items, o => o.x).x;
        const right = _.maxBy(items, o => o.x).x;
        const width = right - left;
        const offset = width / 2 - right;
        items.forEach((d) => {
          d.x += offset;
        });
      });
      this.renderLayout(this.nodes);
    },

    async getLayoutData(center, nodes, type, cx, cy) {
      return new Promise((resolve) => {
        const centerNode = center || {};
        const msgBody = {
          nodes,
          links: this.links.map(n => this.clearLinkForClone(n)),
          type,
          center: {
            x: centerNode.x,
            y: centerNode.y,
          },
          cx,
          cy,
        };
        this.worker.postMessage(msgBody);
        const ended = (data) => {
          const ns = data.nodes;
          ns.forEach((cn) => {
            delete cn.selected;
            delete cn.group;
            delete cn.fx;
            delete cn.fy;
          });
          resolve(ns);
        };
        this.worker.onmessage = function (event) {
          switch (event.data.type) {
            case 'end':
              ended(event.data);
              break;
            default:
              break;
          }
        };
      });
    },

    async layoutNodes(...args) {
      const [type, center, beforeRender, fastFit] = args;
      if (type === 'tree') {
        this.treeLayoutNodes();
        return;
      }
      // 水平树
      if (type === 'treeh') {
        this.treeHorizontalLayoutNodes();
        return;
      }
      // 垂直树
      if (type === 'treev') {
        this.treeVerticalityLayoutNodes();
        return;
      }
      const selectedNodes = this.nodes.filter(n => n.selected);
      const nodes = selectedNodes.length > 1 ? selectedNodes : this.nodes;


      const render = this.renderLayout;
      const [cx, cy] = this.getCenter();

      if (center) {
        center.locked = true;
      }

      const cloneNodes = nodes.map((n, i) => {
        n.index = i;
        return this.clearNodeForClone(n);
      });

      this.loadingLayout = true;

      const layoutNodes = await this.getLayoutData(center, cloneNodes, type, cx, cy);
      nodes.forEach((n) => {
        layoutNodes.forEach((cn) => {
          if (cn.index === n.index) {
            delete cn.selected;
            delete cn.group;
            delete cn.fx;
            delete cn.fy;
            Object.assign(n, cn);
          }
        });
      });
      beforeRender && beforeRender();
      if (fastFit === 'noRender') {
        return;
      }
      render(nodes, fastFit);

      if (center) {
        center.locked = false;
      }
      this.loadingLayout = false;
    },
  },
};
