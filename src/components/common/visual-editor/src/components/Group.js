import _ from 'lodash';
import zrender from 'zrender';

export default {
  data() {
    return {
      groups: [],
    };
  },
  methods: {
    computeGridLayout() {

    },
    getLinkedLines() {

    },
    bindGroupEvent() {
    },
    drawGroup(groups) {
      if (!groups) {
        return;
      }
      groups = groups.forEach ? groups : [groups];
      groups.forEach((group) => {
        const groupSize = group.size;
        const groupElem = new zrender.Group().add(
          new zrender.Rect({
            style: {
              stroke: 'rgba(156, 185, 210, 1)',
              lineWidth: 2,
              lineDash: [2],
              fill: 'rgba(156, 185, 210, 0.05)',
            },
            shape: {
              x: -groupSize / 2,
              y: -groupSize / 2,
              width: groupSize,
              height: groupSize,
              r: 8,
            },
            z: 1000,
          }),
        );
        this.viewGroup.add(groupElem);
        group.node = groupElem;
        this.bindNodeEvent(group);
      });
      this.setNodePosition(groups);
    },
    computeWeight() {
      if (!this.nodes.length) {
        return;
      }
      // 计算每个点的连接数
      this.nodes.forEach((nd) => {
        nd.weight = 1;
      });
      const countResult = {};
      this.links.forEach((_n) => {
        const key = [_n.source.id, _n.target.id].sort().join('_');
        countResult[key] ? countResult[key].push(_n) : countResult[key] = [_n];

        this.nodes.forEach((nd) => {
          nd.weight = nd.weight || 1;
          if (_n.source === nd || _n.target === nd) {
            nd.weight += 1;
          }
        });
      });
      _.each(countResult, (v) => {
        v.forEach((l, i) => {
          l.foldInfo = [i, v.length];
        });
      });
      const max = _.maxBy(this.nodes, n => n.weight).weight;
      this.nodes.forEach((nd) => {
        nd.autoscale = Math.max(nd.weight * 1.4 / max, 0.3);
      });
    },
    doGroup() {
      let selectedNodes = this.nodes.filter(n => n.selected && !n.group && n.type !== 'group');
      const count = selectedNodes.length;
      const size = Math.ceil(Math.sqrt(count));
      if (count < 2) {
        alert('请选择两个以上节点');
        return;
      }

      // 选中的点按链接数排序
      selectedNodes = selectedNodes.sort((a, b) => b.weight - a.weight);

      const gridSize = 0.5 * Math.max(...selectedNodes.map((n) => {
        const {
          width,
          height,
        } = n.node.getBoundingRect();
        return Math.max(width, height);
      }));

      const centerX = _.minBy(selectedNodes, n => n.x).x;
      const centerY = _.minBy(selectedNodes, n => n.y).y;
      const groupSize = gridSize * size;
      const groupX = centerX;
      const groupY = centerY;
      const groupNode = {
        x: groupX + groupSize / 2 - gridSize / 2,
        y: groupY + groupSize / 2 - gridSize / 2,
        size: groupSize,
        type: 'group',
      };
      this.nodes.push(groupNode);
      selectedNodes.forEach((n, i) => {
        const row = Math.floor(i / size);
        const col = i % size;
        const nodeX = col * gridSize + groupX;
        const nodeY = row * gridSize + groupY;
        n.x = nodeX;
        n.y = nodeY;
        n.group = groupNode;
        this.unselectNode(n);
      });

      const animArgs = [400, 0, 'quadraticInOut', () => {
        // this.zoomFit();
      }];
      setTimeout(() => {
        this.drawGroup(groupNode);
      }, 500);
      const render = () => {
        this.links.forEach((d) => {
          const pos = {};
          let run = false;
          selectedNodes.forEach((nd) => {
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
          run && d.line.lineElem.animateTo({
            shape: pos,
          }, ...animArgs);
        });
        selectedNodes.forEach((d) => {
          d.node.animateTo({
            position: [
              d.x,
              d.y,
            ],
          }, ...animArgs);
        });
      };

      render();
    },
    unGroup(group) {
      this.viewGroup.remove(group.node);
      let groupIndex;

      this.nodes.forEach((n, i) => {
        if (n.group === group) {
          delete n.group;
          this.selectNode(n);
        }
        if (n === group) {
          groupIndex = i;
        }
      });
      this.nodes.splice(groupIndex, 1);
      this.layoutNodes('grid');
      setTimeout(() => {
        this.clearSelection();
      }, 0);
    },
  },
};
