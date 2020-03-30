<template>
  <div class="bar-main">
    <div class="layout-mode">
      <p>布局模式</p>
      <el-button @click="$emit('layout', 'force')" class="btn-img">
        <img src="~assets/images/visual/el-layoutForce.png" class="tool-img" title="力布局" />
        <span class="tool-text">弹性布局</span>
      </el-button>
      <el-button @click="$emit('modechange','normal')" class="btn-img">
        <img src="~assets/images/visual/el-selectMode.png" class="tool-img" :class="{active: mode=='normal'}" title="选择模式" />
        <span class="tool-text">选择模式</span>
      </el-button>
      <el-button @click="$emit('modechange','move')" class="btn-img">
        <img src="~assets/images/visual/el-moveMode.png" :class="{active: mode=='move'}" class="tool-img" title="移动模式" />
        <span class="tool-text">移动模式</span>
      </el-button>
    </div>
    <div class="zoom-mode">
      <p>图谱缩放</p>
      <el-button @click="$emit('zoomchange','big')" class="btn-img">
        <img src="~assets/images/visual/el-bigger.png" class="tool-img" title="放大" />
        <span class="tool-text">放大</span>
      </el-button>
      <el-button @click="$emit('zoomchange','small')" class="btn-img">
        <img src="~assets/images/visual/el-smaller.png" class="tool-img" title="缩小" />
        <span class="tool-text">缩小</span>
      </el-button>
      <el-button @click="$emit('zoomchange','normal')" class="btn-img">
        <img src="~assets/images/visual/el-normal.png" class="tool-img" title="还原" />
        <span class="tool-text">还原</span>
      </el-button>
    </div>
    <div class="base-mode">
      <p>基础功能</p>
      <!-- <el-button class="btn-img">
            <img src="~assets/images/visual/el-cut.png" class="tool-img" title="截图">
      </el-button>-->
      <el-button @click="$emit('savePic')" class="btn-img">
        <img src="~assets/images/visual/el-photo.png" class="tool-img" title="拍照" />
      </el-button>
      <el-button @click="$emit('play')" class="btn-img">
        <img src="~assets/images/visual/el-play.png" class="tool-img" title="播放" />
      </el-button>
      <el-button @click="$emit('stop')" class="btn-img">
        <img src="~assets/images/visual/el-stop.png" class="tool-img" title="停止" />
      </el-button>
      <el-button @click="$emit('add')" class="btn-img">
        <img src="~assets/images/visual/el-addNode.png" class="tool-img" title="添加实体" />
      </el-button>
      <el-button @click="$emit('modechange','link')" :type="mode=='link'?'primary':''" class="btn-img">
        <img src="~assets/images/visual/el-addLink.png" class="tool-img" title="添加关系" />
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    mode: {
      default: "normal"
    }
  }
};
</script>

<style lang="less" scoped>
.bar-main {
  width: 70px;
  background: #f7f8fa;

  p {
    font-family: PingFangSC-Regular;
    font-size: 12px;
    color: #191919;
    letter-spacing: 0;
    text-align: center;
    background: #edeff2;
    height: 28px;
    line-height: 28px;
  }

  .btn-img {
    border: none !important;
    background: none !important;
    padding: 0 0px 0 0 !important;
    // margin-left: 0 !important;
    margin-top: 4px;
    width: 70px;
    margin: 10px auto;
  }

  .tool-img {
    width: 18px;
    height: 18px;
    margin-bottom: 4px;
    display: block;
    margin-left: 25px;
  }
  .active {
    width: 48px;
    height: 28px;
    padding: 5px 15px;
    background: #d9dbe0;
    border-radius: 4px;
    margin-left: 10px;
  }

  .tool-text {
    font-family: PingFangSC-Regular;
    font-size: 11px;
    color: rgba(0, 0, 0, 0.6);
  }

  .layout-mode {
    width: 70px;
  }

  .zoom-mode {
    width: 70px;
  }

  .base-mode {
    width: 70px;
    height: 300px;
  }
}
</style>
