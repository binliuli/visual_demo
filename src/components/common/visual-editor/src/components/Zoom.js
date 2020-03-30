import * as d3 from 'd3';
import zrender from 'zrender';

export default {
  data() {
    return {
      canMoveView: false,
      transform: null,
      zooming: false,
      hideOrigin: false,
      briefMode: false,
    };
  },
  mounted() {
    document.addEventListener('keydown', this.zoomKeyDownHandler);
    document.addEventListener('keyup', this.zoomKeyUpHandler);
    this.initZoomCanvas();
    this.initZoom();
  },

  destroyed() {
    document.removeEventListener('keydown', this.zoomKeyDownHandler);
    document.removeEventListener('keyup', this.zoomKeyUpHandler);
  },
  watch: {
    mode(val) {
      if (val === 'move') {
        this.canMoveView = true;
      } else {
        this.canMoveView = false;
      }
    },
    zooming(val) {
      if (val && this.briefMode) {
        this.hidehideOriginTimeout = setTimeout(() => {
          this.hideOrigin = true;
        }, 20);
      } else {
        this.hidehideOriginTimeout && clearTimeout(this.hidehideOriginTimeout);
        this.hideOrigin = false;
      }
    },
  },
  methods: {
    initZoomCanvas() {
      const canvasWrapper = this.$refs.zoom;
      this.zoomZR = zrender.init(canvasWrapper);
      this.zoomViewImg = new zrender.Image();
      this.zoomZR.add(this.zoomViewImg);
    },
    zoomKeyDownHandler(e) {
      const isInputElem = e.target.tagName.toUpperCase().match(/INPUT|TEXTAREA/);
      if (e.keyCode === 32 && !isInputElem) {
        e.preventDefault();
        e.stopPropagation();
        this.canMoveView = true;
      }
    },
    zoomKeyUpHandler() {
      if (this.mode !== 'move') {
        this.canMoveView = false;
      }
    },
    rescaleItem({
      x,
      y,
    }) {
      if (!this.transform) {
        return {
          x,
          y,
        };
      }
      const [newX, newY] = this.transform.invert([x, y]);
      return {
        x: newX,
        y: newY,
      };
    },
    initZoom() {
      let zoomStart = false;
      let timeout;

      const zoomed = () => {
        this.transform = d3.event.transform;
        const transform = {
          position: [this.transform.x, this.transform.y],
          scale: [this.transform.k, this.transform.k],
        };

        if (!zoomStart) {
          zoomStart = true;
          this.zooming = true;
          const {
            x,
            y,
          } = this.rescaleItem({
            x: 0,
            y: 0,
          });
          const width = this.zr.getWidth() / this.transform.k;
          const height = this.zr.getHeight() / this.transform.k;
          this.zoomViewImg.attr({
            style: {
              x,
              y,
              width,
              height,
              image: this.getImage(),
            },
          });
        }
        if (this.briefMode) {
          this.zoomViewImg.attr(transform);
        } else {
          this.viewGroup.attr(transform);
        }

        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
          this.animViewGroup.attr(transform);
          this.viewGroup.attr(transform);
          zoomStart = false;
          this.zooming = false;
          this.setBriefMode();
          this.$emit('zoomend');
        }, 200);
      };
      this.zoom = d3.zoom()
        .scaleExtent([1 / 20, 8])
        .on("zoom", zoomed);
      d3.select(this.$refs.moveMask).call(this.zoom);
    },

    setBriefMode() {
      // const {
      //   x,
      //   y,
      // } = this.rescaleItem({
      //   x: 0,
      //   y: 0,
      // });
      // const width = this.zr.getWidth() / this.transform.k;
      // const height = this.zr.getHeight() / this.transform.k;
      // const viewRect = new zrender.BoundingRect(x, y, width, height);
      // let count = 0;
      // this.nodes.forEach(({ x = 0, y = 0 }) => {
      //   if (viewRect.contain(x, y)) {
      //     count += 1;
      //   }
      // });
      if (this.nodes.length > this.briefSize && this.briefMode === false) {
        this.briefMode = true;
        this.rePaint();
      } else if (this.briefMode === true && this.nodes.length <= this.briefSize) {
        this.briefMode = false;
        this.rePaint();
      }
    },

    getFitTransform(width, height, baseScale = 1) {
      const rect = this.viewGroup.getBoundingRect();
      const [zWidth, zHeight] = [rect.width, rect.height];
      const scaleBase = 0.9;
      // const adjustScale = (1 - scaleBase) / 2;
      const scale = Math.min(1, Math.min(width / zWidth, height / zHeight) * scaleBase);
      const t = d3.zoomIdentity.translate(
        -rect.x * scale + (width - zWidth * scale) / 2,
        -rect.y * scale + (height - zHeight * scale) / 2,
      ).scale(scale * baseScale);
      return t;
    },

    /**
     * 缩放
     * @function zoomBy
     * @param {Number} k 要缩放的倍数，大于1是放大，小于1是缩小，必须是正数
     */
    zoomBy(k) {
      this.zoom.scaleBy(d3.select(this.$refs.moveMask).transition().duration(500), k - 0);
    },

    zoomFit(baseScale = 1, fastFit) {
      if (!this.nodes.length) {
        return;
      }
      if (fastFit) {
        const width = this.zr.getWidth();
        const height = this.zr.getHeight();
        const t = this.getFitTransform(width, height, baseScale);
        // debugger
        this.zoom.transform(d3.select(this.$refs.moveMask), t);
        return;
      }
      if (this.fitTimeout) {
        clearTimeout(this.fitTimeout);
      }
      this.fitTimeout = setTimeout(() => {
        clearTimeout(this.fitTimeout);
        this.fitTimeout = null;
        const width = this.zr.getWidth();
        const height = this.zr.getHeight();
        const t = this.getFitTransform(width, height, baseScale);
        // debugger
        this.zoom.transform(d3.select(this.$refs.moveMask).transition().duration(500), t);
      }, 100);
    },
  },
};
