import zrender from 'zrender';
import smoothBezier from 'zrender/lib/graphic/helper/smoothBezier';
import curve from 'zrender/lib/core/curve';
import _ from 'lodash';

export default {
  data() {
    return {
      playing: false,
      animZR: null,
    };
  },
  mounted() {
    this.$on('selectchange', () => {
      if (this.playing) {
        this.playAnim();
      }
    });
  },

  destroyed() {},
  watch: {

  },
  methods: {
    initAnimCanvas() {
      const canvasWrapper = this.$refs.anim;
      this.animZR = zrender.init(canvasWrapper);
      this.animViewGroup = new zrender.Group();
      this.animZR.add(this.animViewGroup);
      this.animZR.on('click', () => {
        this.stopAnim();
      });
    },
    bindAnim(link) {
      // const {
      //   source,
      //   target,
      // } = link;
      // // const hasAnim = _.get(source, 'model.type') === 1 || _.get(target, 'model.type') === 1;
      // // if (!hasAnim) {
      // //   return;
      // // }

      link.anim = true;

      // this.animViewGroup.add(anim);
    },
    buildAnims() {
      // link 的 highlight 或 selected 为 false 的不放动画
      this.animViewGroup.removeAll();
      let hasSelections = false;
      this.links.forEach((l) => {
        if (l.selected || l.highlight) {
          hasSelections = true;
        }
      });
      const animLinks = this.links.filter(l => l.anim && (!hasSelections || l.selected !== false));
      animLinks.forEach((link) => {
        const color = new zrender.RadialGradient(0.5, 0.5, 0.3, [{
          offset: 0,
          color: 'rgba(255, 76, 0, 1)',
        }, {
          offset: 1,
          color: 'rgba(255, 76, 0, 0)',
        }]);
        const anim = new zrender.Circle({
          shape: {
            r: 10,
          },
          style: {
            fill: color,
          },
        });
        link.anim = anim;
        link.anim.attr({
          shape: {
            ax: link.source.x,
            ay: link.source.y,
            cx: link.source.x,
            cy: link.source.y,
          },
        });
        const shape = _.get(link, 'line.lineElem.shape');
        if (shape.points) {
          const [p1, p2, p3, p4] = smoothBezier(shape.points, shape.smooth);

          link.anim.animate('shape', true).when(2000, {
            ax: link.target.x,
            ay: link.target.y,
          }).during((values, percent) => {
            const cx = curve.cubicAt(p1[0], p2[0], p3[0], p4[0], percent);
            const cy = curve.cubicAt(p1[1], p2[1], p3[1], p4[1], percent);
            link.anim.attr({
              shape: {
                cx, cy,
              },
            });
          }).start();
        }

        // link.anim.animate('shape', true).when(400, {
        //   r: 20
        // }).when(800, {
        //   r: 13
        // }).start();
        this.animViewGroup.add(link.anim);
      });
    },
    stopPlayAnim() {
      this.animZR.clearAnimation();
      this.animViewGroup.removeAll();
      this.animZR.refreshImmediately();
    },
    /**
     * 开始动画
     * @function playAnim
     */
    playAnim() {
      this.playing = true;
      this.buildAnims();
    },
    /**
     * 停止动画
     * @function stopAnim
     */
    stopAnim() {
      this.playing = false;
      this.stopPlayAnim();
    },
  },
};
