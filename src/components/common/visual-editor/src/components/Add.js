import zrender from 'zrender';
import _ from 'lodash';
import URL from 'url';
import color from 'color';

export default {
  methods: {
    setContent(dataSet, noLayout) {
      if (!this.data && !dataSet) {
        return;
      }
      const {
        nodes,
        links,
      } = _.cloneDeep(dataSet || this.data);
      if (!dataSet) {
        this.nodes = nodes;
      } else {
        this.nodes.forEach(() => {

        });
        nodes.forEach((n) => {
          n.newx = true;
        });
        this.nodes = nodes.concat(this.nodes);
      }
      this.nodes.forEach((n, i) => {
        let uniq = true;
        this.nodes.forEach((m, j) => {
          if (m.id === n.id && m !== n && i < j) {
            uniq = false;
          }
        });
        n.theme = this.theme;
        n.uniq = uniq;
      });

      this.nodes = this.nodes.filter(n => n.uniq);
      const hasNewNode = this.nodes.filter(n => n.newx).length;


      const lines = links.map((l) => {
        const source = _.find(this.nodes, n => n.id === l.source);
        const target = _.find(this.nodes, n => n.id === l.target);
        l.theme = this.theme;
        if (source && target) {
          return {
            ...l,
            source,
            target,
          };
        }
        return null;
      }).filter((l) => {
        if (!l) {
          return false;
        }
        let uniq = true;
        this.links.forEach((nl) => {
          if (nl.source === l.source && nl.target === l.target) {
            uniq = false;
          }
        });
        return uniq;
      });
      if (!dataSet) {
        this.links = lines;
      } else {
        this.links = this.links.concat(lines);
      }
      const groups = this.nodes.filter(n => n.type === 'group');
      this.nodes.filter(n => n.type !== 'group').forEach((n) => {
        groups.forEach((g) => {
          if (n.group === g.id) {
            n.group = g;
          }
        });
      });
      // ZR
      this.drawNode(this.nodes.filter(n => !n.type && !n.node));
      this.drawLink(this.links.filter(l => !l.line));
      this.drawGroup(groups.filter(g => !g.node));
      if (this.theme === 'qth') {
        this.drawComputeNodesV(this.nodes);
      } else {
        this.drawComputeNodes(this.nodes);
      }
      if (dataSet) {
        this.clearSelection();
        this.nodes.forEach((n) => {
          !noLayout && hasNewNode && n.newx && this.selectNode(n);
          delete n.newx;
        });
      } else {
        this.zoomFit();
      }
    },
    initDraw() {
      // canvas version

      const canvasWrapper = this.$refs.canvas;
      this.zr = zrender.init(canvasWrapper);
      this.viewGroup = new zrender.Group();
      this.nodesGroup = new zrender.Group();
      this.linksGroup = new zrender.Group();
      this.zr.add(this.viewGroup);
      this.viewGroup.add(this.linksGroup);
      this.viewGroup.add(this.nodesGroup);
    },
    getLineCrossNodePoint(l) {
      const getFormulaResult = (a, b, c) => {
        let x1;
        let
          x2;
        if (b * b - 4 * a * c < 0) {
          throw new Error('no result');
        } else {
          x1 = (-b - Math.pow(b * b - 4 * a * c, 1 / 2)) / (2 * a);
          x2 = (-b + Math.pow(b * b - 4 * a * c, 1 / 2)) / (2 * a);
        }
        return [x1, x2];
      };
      const computeLineController = (x1, y1, x2, y2, dis) => {
        const x0 = (x1 + x2) / 2;
        const y0 = (y1 + y2) / 2;
        const p = Math.sqrt(Math.pow(x2 - x0, 2) + Math.pow(y2 - y0, 2));
        if (y2 === y0) {
          const cx = x0;
          const cy1 = y0 + dis;
          const cy2 = y0 - dis;
          return [
            [cx, cy1],
            [cx, cy2],
          ];
        }
        const m = (x0 - x2) / (y2 - y0);
        const n = (p * p + y0 * y0 - y2 * y2 + x0 * x0 - x2 * x2) / (2 * y0 - 2 * y2);
        const [cx1, cx2] = getFormulaResult(1 + m * m, 2 * m * n - 2 * x0 - 2 * y0 * m,
          x0 * x0 + n * n - 2 * y0 * n + y0 * y0 - dis * dis);
        const cy1 = m * cx1 + n;
        const cy2 = m * cx2 + n;
        return [
          [cx1, cy1],
          [cx2, cy2],
        ];
      };
      const getLineShape = (source, target, dis = 10) => {
        const x1 = source.x;
        const y1 = source.y;
        const x2 = target.x;
        const y2 = target.y;
        const [index, total] = l.foldInfo || [0, 1];
        const arr = [];
        if (total % 2) {
          arr[0] = 0;
        }
        let k;
        for (k = 0; k < (total - 1) / 2; k += 1) {
          arr.push(dis * (k + 1));
        }
        let results = [];
        arr.forEach((d) => {
          if (d === 0) {
            results.push([(x1 + x2) / 2, (y1 + y2) / 2]);
            return;
          }
          results = results.concat(computeLineController(x1, y1, x2, y2, d));
        });
        return {
          cpx1: results[index][0],
          cpy1: results[index][1],
        };
      };
      const computePos = (source, target, cps) => {
        const x0 = source.x;
        const y0 = source.y;
        let x1 = cps.cpx1;
        let y1 = cps.cpy1;
        const x2 = target.x;
        const y2 = target.y;
        const mx = (x0 + x2) / 2;
        const my = (y0 + y2) / 2;
        x1 = (x1 - mx) * 1.5 + mx;
        y1 = (y1 - my) * 1.5 + my;
        const rectBox = target.node ? target.node.getBoundingRect() : {
          width: 10,
          height: 10,
        };
        const scale = (target.customStyle ? target.customStyle.scale || 1 : 1) * 1.3;
        const {
          width: w,
          height: h,
        } = rectBox;
        const rx1 = x2 - w * scale / 2;
        const rx2 = x2 + w * scale / 2;
        const ry1 = y2 - h * scale / 2;
        const ry2 = y2 + h * scale / 2;

        const isCrossX = y1 - y2 !== 0 ? Math.abs((x1 - x2) / (y1 - y2)) < w / h : false;
        const isCrossY = y1 - y2 !== 0 ? Math.abs((x1 - x2) / (y1 - y2)) >= w / h : true;
        const isCrossTop = isCrossX && y1 < ry1;
        const isCrossBottom = isCrossX && y1 > ry2;
        const isCrossLeft = isCrossY && x1 < rx1;
        const isCrossRight = isCrossY && x1 > rx2;
        let result = {
          x: x2,
          y: y2,
        };
        if (isCrossTop) {
          const y = ry1;
          const a = (y2 - y) / (y - y1);
          const x = (x2 + a * x1) / (a + 1);
          result = {
            x,
            y,
          };
        }
        if (isCrossBottom) {
          const y = ry2;
          const a = (y1 - y) / (y - y2);
          const x = (x1 + a * x2) / (a + 1);
          result = {
            x,
            y,
          };
        }
        if (isCrossLeft) {
          const x = rx1;
          const a = (x2 - x) / (x - x1);
          const y = (y2 + a * y1) / (a + 1);
          result = {
            x,
            y,
          };
        }
        if (isCrossRight) {
          const x = rx2;
          const a = (x1 - x) / (x - x2);
          const y = (y1 + a * y2) / (a + 1);
          result = {
            x,
            y,
          };
        }
        const {
          x,
          y,
        } = result;
        const ang = Math.asin((y1 - y2) / Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
        const up = ang + Math.PI / 6;
        const down = ang - Math.PI / 6;
        const size = 8;
        if (x1 > x2) {
          const upPoint = [x + Math.cos(up) * size, y + Math.sin(up) * size];
          const downPoint = [x + Math.cos(down) * size, y + Math.sin(down) * size];
          result.points = [upPoint, [x, y], downPoint];
        } else {
          const upPoint = [x - Math.cos(up) * size, y + Math.sin(up) * size];
          const downPoint = [x - Math.cos(down) * size, y + Math.sin(down) * size];
          result.points = [upPoint, [x, y], downPoint];
        }
        return result;
      };
      const lineShape = getLineShape(l.source, l.target, 30);
      const resultS = computePos(l.target, l.source, lineShape);
      const resultT = computePos(l.source, l.target, lineShape);


      resultT.shape = {
        points: [
          [resultS.x || lineShape.cpx1, resultS.y || lineShape.cpy1],
          [lineShape.cpx1, lineShape.cpy1],
          [resultT.x || lineShape.cpx1, resultT.y || lineShape.cpy1],
        ],
        x1: resultS.x,
        y1: resultS.y,
        x2: resultT.x,
        y2: resultT.y,
        ...lineShape,
      };
      const shape = resultT.shape;

      // 计算文本位置
      const {
        x1,
        x2,
        y1,
        y2,
        cpx1,
        cpy1,
      } = shape;
      const x0 = (x1 + x2) / 2;
      const y0 = (y1 + y2) / 2;
      const po = [cpx1 - x0, cpy1 - y0];
      // const po = [(cpx1 - x0) / d,  (cpy1 - y0) / d];
      // console.log(po);
      // const po = [0, 60];
      resultT.textOffset = po;
      // 新加点开始时会出现 NaN
      if (Number.isNaN(resultT.points[0][0])) {
        resultT.points[0] = resultT.points[1];
        resultT.points[2] = resultT.points[1];
      }

      return resultT;
    },
    setLinkPosition(lines) {
      if (!lines.forEach) {
        lines = [lines];
      }
      const addRelatedLine = (l) => {
        const result = [];
        const {
          source,
          target,
        } = l;
        const sourceId = source.id;
        const targetId = target.id;
        this.links.forEach((link) => {
          if (link.source.id === sourceId && link.target.id === targetId && link !== l) {
            result.push(link);
          }
        });
        return result;
      };
      lines.forEach((l) => {
        if (l.foldInfo && l.foldInfo[1] > 1) {
          lines = lines.concat(addRelatedLine(l));
        }
      });
      lines = _.uniq(lines);
      lines.forEach((l) => {
        const {
          points,
          shape,
          textOffset,
        } = this.getLineCrossNodePoint(l);
        l.line.lineElem.attr({
          shape: {
            ...shape,
          },
        });
        l.line.arrowElem && l.line.arrowElem.attr({
          shape: {
            points,
          },
        });
        l.line.textLine && l.line.textLine.attr({
          shape: {
            ...shape,
          },
          style: {
            textOffset,
          },
        });
      });
    },
    /**
     * 设置线的自定义样式
     * @function setCustomLinksStyle
     * @param {Object} - {links, style} 线和样式(lineWidth,lineColor,fontSize)
     */
    setCustomLinksStyle({
      links,
      style,
    }) {
      links.forEach((l) => {
        l.customStyle = style;
      });
      this.reload();
    },
    /**
     * 设置点的自定义样式
     * @function setCustomNodesStyle
     * @todo 支持点的背景色等更多属性
     * @param {Object} - {nodes, style} 点和样式(scale)
     */
    setCustomNodesStyle({
      nodes,
      style,
    }) {
      nodes.forEach((l) => {
        l.customStyle = style;
      });
      this.reload();
    },
    drawLink(lineDatas) {
      if (!lineDatas.forEach) {
        lineDatas = [lineDatas];
      }
      const COMMONCOLOR = 'rgba(0,0,0,0.2)';
      const STYLES = {
        NORMAL: {
          style: {
            // textBackgroundColor: "#ffffff",
            textPadding: 4,
            textFill: '#888',
            transformText: true,
            stroke: COMMONCOLOR,
            // 'fill': COMMONCOLOR,
            lineWidth: 2,
            fontSize: 12,
            opacity: 1,
            shadowBlur: 0,
            shadowColor: 'rgba(255, 180, 0, 0)',
          },
          zlevel: 0,
        },
        SELECTED: {
          style: {
            textPadding: 4,
            textFill: '#f60',
            transformText: true,
            stroke: '#f60',
            lineWidth: 2,
            fontSize: 12,
            shadowBlur: 8,
            shadowColor: 'rgb(255, 180, 0)',
          },
          zlevel: 1,
        },
        DARK: {
          style: {
            textBackgroundColor: "#121212",
            textPadding: 4,
            textFill: '#4167AF',
            transformText: true,
            stroke: '#4167AF',
            // fill: '#4167AF',
            lineWidth: 2,
            fontSize: 12,
            opacity: 1,
            shadowBlur: 0,
            shadowColor: 'rgba(255, 180, 0, 0)',
          },
          zlevel: 0,
        },
        QTH: {
          style: {
            textBackgroundColor: "rgba(1, 27, 39, 0.5)",
            textPadding: 4,
            textFill: '#2CE5FA',
            transformText: true,
            stroke: '#2CE5FA',
            // fill: '#4167AF',
            lineWidth: 2,
            fontSize: 12,
            opacity: 1,
            shadowBlur: 0,
            shadowColor: 'rgba(255, 180, 0, 0)',
          },
          zlevel: 0,
        },
        // QTHSELECTED: {
        //   style: {
        //     textBackgroundColor: "rgba(1, 27, 39, 0.5)",
        //     textPadding: 4,
        //     textFill: '#2CE5FA',
        //     transformText: true,
        //     stroke: '#2CE5FA',
        //     // fill: '#4167AF',
        //     lineWidth: 2,
        //     fontSize: 12,
        //     opacity: 1,
        //     shadowBlur: 0,
        //     shadowColor: 'rgba(255, 180, 0, 0)',
        //   },
        //   zlevel: 0,
        // },
        DARKSELECTED: {
          style: {
            // textBackgroundColor: "#4C5FAE",
            textBackgroundColor: "#121212",
            textPadding: 4,
            textFill: '#FAB900',
            transformText: true,
            stroke: '#FAB900',
            // 'fill': COMMONCOLOR,
            lineWidth: 2,
            fontSize: 12,
            opacity: 1,
            shadowBlur: 0,
            shadowColor: 'rgba(255, 180, 0, 0)',
          },
          zlevel: 0,
        },
        NOTHIGHLIGHT: {
          style: {
            opacity: 0.05,
          },
        },
      };

      const getCustomStyle = (l, base) => {
        const computedStyle = {};
        const customStyle = l.customStyle;
        if (customStyle) {
          const {
            lineWidth,
            lineColor,
            fontSize,
          } = customStyle;
          if (lineWidth) {
            computedStyle.lineWidth = lineWidth * base.style.lineWidth / STYLES.NORMAL.style.lineWidth;
          }
          if (lineColor) {
            const customColor = color(lineColor);
            const baseColor = color(base.style.stroke);
            const textColor = color(base.style.textFill);
            computedStyle.stroke = customColor.fade(0.7).mix(baseColor, 0.3);
            computedStyle.textFill = customColor.fade(0.2).mix(textColor, 0.2);
          }

          computedStyle.fontSize = base.style.fontSize;
          if (fontSize) {
            computedStyle.fontSize = fontSize * base.style.fontSize / STYLES.NORMAL.style.fontSize;
          }
        }
        return {
          ...base,
          style: {
            ...base.style,
            ...computedStyle,
            textRotation: Math.atan(-(l.target.y - l.source.y) / (l.target.x - l.source.x)),
          },
        };
      };

      lineDatas.forEach((l) => {
        const group = new zrender.Group({
          z: 1,
        });
        // const line = new zrender.BezierCurve({
        //   shape: {}
        // });
        const line = new zrender.Polyline({
          shape: {
            smooth: 0.5,
          },
        });

        group.add(line);
        let textLine;
        let arrow;
        if (!this.briefMode) {
          textLine = new zrender.Line({
            shape: {},
            style: {
              textBackgroundColor: '#ffffff',
              fill: 'rgba(255, 100, 0, 0.6)',
              stroke: 'rgba(0,0,0,0)',
              transformText: true,
              text: l.name || '',
            },
          });
          if (this.theme === 'dark') {
            textLine.attr({
              style: {
                textBackgroundColor: STYLES.DARK.style.textBackgroundColor,
              },
            });
          }
          if (this.theme === 'qth') {
            textLine.attr({
              style: {
                textBackgroundColor: STYLES.QTH.style.textBackgroundColor,
              },
            });
          }
          if (l.direction !== 0) {
            arrow = new zrender.Polyline({});
            group.add(arrow);
          }
          group.add(textLine);
        }


        let updateTriggered = false;
        let timeout;
        line.beforeUpdate = function () {
          if (updateTriggered) {
            return;
          }
          updateTriggered = true;
          if (timeout) {
            clearTimeout(timeout);
          }
          timeout = setTimeout(() => {
            updateTriggered = false;
            // line.beforeUpdate();
          }, 500);
          line.attr({
            ...getCustomStyle(l, STYLES.NORMAL),
          });

          arrow && arrow.attr({
            ...getCustomStyle(l, STYLES.NORMAL),
          });
          // console.log(getCustomStyle(l, STYLES.NORMAL).style.fontSize);
          textLine && textLine.attr({
            style: {
              textFill: getCustomStyle(l, STYLES.NORMAL).style.textFill,
              fontSize: getCustomStyle(l, STYLES.NORMAL).style.fontSize,
              textRotation: getCustomStyle(l, STYLES.NORMAL).style.textRotation,
            },
          });
          if (l.selected) {
            line.attr({
              ...getCustomStyle(l, STYLES.SELECTED),
            });
            arrow && arrow.attr({
              ...getCustomStyle(l, STYLES.SELECTED),
            });
            textLine && textLine.attr({
              style: {
                textFill: getCustomStyle(l, STYLES.SELECTED).style.textFill,
              },
            });
          }
          if (l.theme === 'dark') {
            line.attr({
              ...getCustomStyle(l, STYLES.DARK),
            });
            arrow && arrow.attr({
              ...getCustomStyle(l, STYLES.DARK),
            });
            textLine && textLine.attr({
              style: {
                textFill: getCustomStyle(l, STYLES.DARK).style.textFill,
              },
            });
          }
          if (l.theme === 'qth') {
            line.attr({
              ...getCustomStyle(l, STYLES.QTH),
            });
            arrow && arrow.attr({
              ...getCustomStyle(l, STYLES.QTH),
            });
            textLine && textLine.attr({
              style: {
                textFill: getCustomStyle(l, STYLES.QTH).style.textFill,
              },
            });
          }
          if (l.selected && l.theme === 'dark') {
            line.attr({
              ...getCustomStyle(l, STYLES.DARKSELECTED),
            });
            arrow && arrow.attr({
              ...getCustomStyle(l, STYLES.DARKSELECTED),
            });
            textLine && textLine.attr({
              style: {
                textFill: getCustomStyle(l, STYLES.DARKSELECTED).style.textFill,
              },
            });
          }
          if (l.highlight === false) {
            line.attr({
              ...STYLES.NOTHIGHLIGHT,
            });
          }
        };
        this.linksGroup.add(group);
        this.bindAnim(l);
        l.line = group;
        group.lineElem = line;
        group.arrowElem = arrow;
        group.textLine = textLine;
        this.bindLineEvent(l);
      });

      this.computeWeight();
      this.setLinkPosition(lineDatas);
    },
    setNodeStyle(node, style) {
      Object.keys(style).forEach((k) => {
        node.attr(k, style[k]);
      });
    },
    setNodePosition(nodes) {
      if (!nodes.forEach) {
        nodes = [nodes];
      }
      nodes.forEach((nd) => {
        nd.node.attr({
          position: [nd.x, nd.y],
        });
      });
    },
    getCenter() {
      const cx = this.zr.getWidth() / 2;
      const cy = this.zr.getHeight() / 2;
      const step = 50;
      const ang = Math.PI * 2 * Math.random();

      let center = [cx, cy];


      if (this.transform) {
        center = this.transform.invert(center);
      }

      this.nodes.forEach((n) => {
        const node = n.node;
        const rect = node && node.getBoundingRect();
        if (!rect) {
          return;
        }
        const {
          width,
          height,
        } = rect;
        const [x, y] = node.position || [0, 0];
        const [xx, yy] = center;
        const isContain = xx >= x - width * 0.5 && xx <= x + width * 0.5 && yy >= y - height
          * 0.5 && yy <= y + height * 0.5;
        if (isContain) {
          center[0] += step * Math.cos(ang);
          center[1] += step * Math.sin(ang);
        }
      });

      return center;
    },
    setIconImage(url, icon) {
      const img = new Image();
      img.setAttribute('crossOrigin', 'Anonymous');
      img.onload = () => {
        icon.attr({
          style: {
            image: img,
          },
        });
      };
      img.src = url;
      img.onerror = () => {
        img.src = url.match(/\?/) ? url.replace(/\?/, '?_=1&') : url += '?_=1';
        img.onerror = null;
      };
      return img;
    },
    drawNode(nodeDatas) {
      nodeDatas.forEach((n) => {
        const size = this.briefMode || this.theme === 'qth' ? 20 : 30;

        const STYLES = {
          NORMAL: {
            style: {
              // stroke: 'rgba()',
              lineWidth: '0',
              fill: 'rgba(0,0,0,0)',
              opacity: 1,
              textPosition: 'bottom',
              textFill: '#888',
              textBackgroundColor: 'transparent',
              textDistance: 2,
              fontSize: '12px',
              transformText: true,
            },
            scale: [1, 1],
          },
          DARK: {
            style: {
              // stroke: 'rgba()',
              lineWidth: '0',
              fill: '#4C5FAE',
              opacity: 1,
              textPosition: 'bottom',
              textFill: '#efefef',
              textBackgroundColor: 'transparent',
              textDistance: 10,
              fontSize: '12px',
              transformText: true,
            },
            scale: [1, 1],
          },
          QTH: {
            style: {
              // stroke: 'rgba()',
              lineWidth: '2',
              fill: '#0E4E64',
              stroke: '#2CE5FA',
              opacity: 1,
              textPosition: 'bottom',
              textFill: '#CFF2FF',
              textBackgroundColor: 'transparent',
              textDistance: 10,
              fontSize: '12px',
              transformText: true,
            },
            scale: [1, 1],
          },
          LOCKED: {
            style: {
              stroke: 'rgba(255, 0, 0, 0.2)',
              fill: 'rgba(255, 0, 0, 0.05)',
              lineWidth: '2',
            },
          },
        };

        const getCustomStyle = (n, g) => {
          const computedStyle = {};
          const customStyle = n.customStyle || {};
          computedStyle.z = customStyle.z && customStyle.z > g.z ? customStyle.z : g.z;
          let fill = 'rgba(0,0,0,0.2)';
          if (n.theme === 'dark') {
            fill = STYLES.DARK.style.fill;
          }
          if (n.theme === 'qth') {
            fill = STYLES.QTH.style.fill;
          }
          const fillColor = n.model && n.model.color;
          if (customStyle) {
            const {
              scale,
            } = customStyle;
            if (scale) {
              computedStyle.scale = [scale, scale];
            }
            if (customStyle.fill) {
              fill = customStyle.fill;
            }
          }
          computedStyle.style = {
            fill: fillColor || fill,
          };

          return {
            ...computedStyle,
          };
        };

        const props = {
          width: size,
          height: size,
          r: size * 1.6 / 2,
        };

        if (typeof n.x === 'undefined') {
          const [x, y] = this.getCenter();
          n.x = x;
          n.y = y;
        }

        const group = new zrender.Group({
          z: 1,
        });
        const node = new zrender.Rect({
          shape: {
            x: -props.r,
            y: -props.r,
            r: props.r,
            width: props.r * 2,
            height: props.r * 2,
          },
        });

        // const ding = new zrender.Image({
        //   style: {
        //     x: -props.r * 0.5,
        //     y: -props.r * 3,
        //     width: props.r * 2.4,
        //     height: props.r * 2.4,
        //   },
        // });

        // this.setIconImage(URL.resolve(location.href, '/icons/icon_ping.png'), ding);
        let updateTriggered = false;
        let timeout;
        group.beforeUpdate = function () {
          if (updateTriggered) {
            return;
          }
          updateTriggered = true;
          if (timeout) {
            clearTimeout(timeout);
          }
          timeout = setTimeout(() => {
            updateTriggered = false;
            // group.beforeUpdate();
          }, 500);
          const customSetting = getCustomStyle(n, group);
          if (n.group) {
            group.attr({
              ...customSetting,
              scale: [0.5, 0.5],
            });
            return;
          }
          group.attr({
            ...customSetting,
          });
          group.eachChild((n) => {
            n.attr('z', customSetting.z);
          });
          node.attr({
            ...STYLES.NORMAL,
            style: {
              ...STYLES.NORMAL.style,
              ...customSetting.style,
            },
          });
          if (n.theme === 'dark') {
            node.attr({
              ...STYLES.DARK,
              style: {
                ...STYLES.DARK.style,
                fill: STYLES.DARK.style.fill,
                ...customSetting.style,
              },
            });
          }
          if (n.theme === 'qth') {
            node.attr({
              ...STYLES.QTH,
              style: {
                ...STYLES.QTH.style,
                fill: STYLES.QTH.style.fill,
                ...customSetting.style,
              },
            });
          }
          if (n.locked) {
            node.attr(STYLES.LOCKED);
            // !ding.parent && group.add(ding);
          } else {
            // ding.parent && group.remove(ding);
          }

          if (n.hover) {
            node.attr({
              style: {
                stroke: 'rgba(255, 0, 0, 0.2)',
                lineWidth: '4',
              },
            });
            // !ding.parent && group.add(ding);
          } else {
            // ding.parent && group.remove(ding);
          }

          if (n.selected) {
            node.attr({
              style: {
                textFill: '#fff',
                textBackgroundColor: 'rgba(255,100,0,1)',
              },
            });
          }
          if (n.selected && n.theme === 'dark') {
            node.attr({
              style: {
                textFill: '#fff',
                textBackgroundColor: 'rgba(255,100,0,1)',
              },
            });
          }
          if (n.selected && n.theme === 'qth') {
            node.attr({
              style: {
                textFill: '#CFF2FF',
                // textBackgroundColor: 'rgba(255,100,0,1)',
              },
            });
          }
        };
        // 添加图标
        const hasIcon = n.model && n.model.icon;


        // 添加文字
        if (n.name && !this.briefMode) {
          node.attr({
            style: {
              text: n.name,
            },
          });
        }

        group.add(node);
        if (hasIcon && !this.briefMode) {
          const img = new zrender.Image({
            style: {
              x: -size / 2,
              y: -size / 2,
              width: props.width,
              height: props.height,
            },
          });
          this.setIconImage(URL.resolve(location.href, n.model.icon), img);
          group.add(img);
        }

        n.node = group;
        this.nodesGroup.add(group);
        this.bindNodeEvent(n);
      });
      this.setNodePosition(nodeDatas);
    },
    addLink(l) {
      const source = _.find(this.nodes, n => (n.id === l.source || n === l.source));
      const target = _.find(this.nodes, n => (n.id === l.target || n === l.target));
      let link;

      if (source && target) {
        link = {
          ...l,
          source,
          target,
        };
        link.theme = this.theme;
        const exist = _.find(this.links, n => n.source === source && n.target === target && n.name
          === l.name);
        if (!exist) {
          this.links.push(link);
          this.drawLink(link);
        }
      }
    },
    addPoint(node, source, withLine) {
      let buildNewNode = true;
      this.nodes.forEach((n) => {
        if (n.id === node.id) {
          buildNewNode = false;
          node = n;
        }
        node.theme = this.theme;
      });
      node.theme = this.theme;
      buildNewNode && this.nodes.push(node);
      if (withLine) {
        if (!node.x) {
          node.x = source.x;
          node.y = source.y;
        }
        const link = {
          source,
          target: node,
        };
        link.theme = this.theme;
        let buildNewLink = true;
        this.links.forEach((l) => {
          if (l.source === link.source && l.target === link.target && l.name === link.name) {
            buildNewLink = false;
          }
        });
        buildNewLink && this.links.push(link);
        buildNewLink && this.drawLink([link]);
      }
      buildNewNode && this.drawNode([node]);
      return node;
    },
    addPoints(nodes, source, withLine) {
      const newNodes = nodes.map(n => this.addPoint(n, source, withLine));
      this.clearSelection();
      newNodes.forEach((n) => {
        this.selectNode(n);
      });
      if (source) {
        this.layoutNodes('circle', source);
      } else {
        this.layoutNodes('grid');
      }
    },
    /**
     * 添加数据
     * @function addDataSet
     * @param {Object} dataSet - 要添加的数据集
     * @param {Array} [sources=[]] - 关联的起点
     * @param {Boolean} [noLayout=false] - 不需要自动布局
     */
    addDataSet(dataSet, sources = [], noLayout = false) {
      this.loadingLayout = true;

      this.$nextTick(() => {
        this.setContent(dataSet, noLayout);

        if (sources.length) {
          // const selectedLength = this.nodes.filter(n => n.selected).length;
          if (sources.length > 1 && !noLayout) {
            sources.forEach((s) => {
              if (s.locked) {
                return;
              }
              s.locked = 3;
            });
          }
        }
        if (noLayout) {
          this.loadingLayout = false;
        }
        !noLayout && this.layoutNodes('grid', null, () => {
          this.layoutNodes('force', null, () => {
            sources.forEach((s) => {
              if (s.locked === 3) {
                s.locked = null;
              }
            });
            this.reload();
          });
        }, 'noRender');
      });
    },

    /**
     * 删除图上所有点
     * @function deleteAll
     */
    deleteAll() {
      this.nodes = [];
      this.links = [];
      this.nodesGroup.removeAll();
      this.linksGroup.removeAll();
      this.reload();
    },
    /**
     * 添加数据
     * @function deleteNode
     * @param {Array} nodes - 要删除的点
     * @param {Array} lines - 要删除的线
     */
    deleteNode(nodes, lines) {
      if (!nodes) {
        nodes = this.nodes.filter(n => n.selected);
      }
      if (!lines) {
        lines = !nodes || !nodes.length ? this.links.filter(n => n.selected) : [];
      }
      if (!nodes.forEach) {
        nodes = [nodes];
      }
      if (!lines.forEach) {
        lines = [lines];
      }
      nodes.forEach((n) => {
        this.links.forEach((l) => {
          if (l.source === n || l.target === n) {
            l.line.parent && l.line.parent.remove(l.line);
            l.del = 1;
          }
        });
        this.links.forEach((l, i) => {
          l.del && this.links.splice(i, 1);
        });
        this.nodes.forEach((_n, i) => {
          if (_n === n) {
            n.node.parent.remove(n.node);
            this.nodes.splice(i, 1);
          }
        });
      });

      lines.forEach((l) => {
        l.del = 1;
        l.line.parent && l.line.parent.remove(l.line);
        this.links.forEach((l, i) => {
          l.del && this.links.splice(i, 1);
        });
      });

      if (nodes.length) {
        // 暴露删除的点
        this.$emit('deletenodes', {
          nodes,
        });
      }

      if (lines.length) {
        // 暴露删除的线
        this.$emit('deletelines', {
          lines,
        });
      }

      this.emitSelectChangeEvent();
    },
    /**
     * 重绘一下，一般是强制修改图上节点数据之后使用
     * @function reload
     */
    reload() {
      this.zr.refreshImmediately();
    },

    rePaint() {
      const dataSet = this.getData();
      this.deleteAll();
      this.addDataSet(dataSet, [], true);
    },
  },
};
