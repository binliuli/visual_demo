<template>
<el-dialog :title="title" :visible.sync="dialogVisible" width="500px" @close=closePop>
  <div class="save-graoh-wrapper">
    <el-form ref="graphForm" :model="graphForm" label-width="4px" @submit.native.prevent="sureClick">
      <el-form-item >
        <div class="cover" :style="{
          backgroundImage: `url('${savedata.image}')`
        }"></div>
      </el-form-item>
    </el-form>
  </div>
  <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="sure" :loading="settingStatus" size="medium">保 存</el-button>
    <el-button @click="cancelClick" size="medium">取 消</el-button>
  </span>
</el-dialog>
</template>

<script>

export default {
  props: [ 'saveStatus'],
  data() {
    return {
      title: '保存快照',
      dialogVisible: false,
      graphForm: {
        stats_data: '',
        title: '',
        des: '',
        snapshot: '',
      },
      settingStatus: false,
      savedata: {}
    }
  },
  async mounted() {
    // this.graphForm.stats_data = this.savedata.stats_data;
  },
  methods: {
 
    show(savedata) {
      this.savedata = Object.assign({}, savedata);
      console.log(this.savedata, '999')
      this.graphForm = Object.assign({}, {
        stats_data: '',
        title: this.savedata.title || '',
        des: this.savedata.des || '',
        snapshot: '',
      });
      this.dialogVisible = true;
    },
    closePop() {
      this.dialogVisible = false;
      this.resetForm();
      if (this.savedata.type === '1' && this.saveStatus === 'save') {
        this.$parent.graphicListData.shift();
      }
    },
    cancelClick() {
      this.dialogVisible = false;
    },
    resetForm() {
      this.$refs.graphForm.resetFields();
    },
    async sure() {
      const dataImage = this.savedata.image
      var day = new Date();
      day.setTime(day.getTime());
      var s = day.getFullYear()+"-" + (day.getMonth()+1) + "-" + day.getDate() + " " + day.getHours() + ":" + day.getMinutes() + ":" + day.getSeconds() ;
      this.downloadFile(dataImage, s);
      this.dialogVisible = false;
    },
    dataURItoBlob(base64Data) {
        var byteString;
        if(base64Data.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(base64Data.split(',')[1]);//base64 解码
        else{
            byteString = unescape(base64Data.split(',')[1]);
        }
        var mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];//mime类型 -- image/png

        // var arrayBuffer = new ArrayBuffer(byteString.length); //创建缓冲数组
        // var ia = new Uint8Array(arrayBuffer);//创建视图
        var ia = new Uint8Array(byteString.length);//创建视图
        for(var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        var blob = new Blob([ia], {
            type: mimeString
        });
        return blob;
    },

    downloadFile(content, fileName) { //下载base64图片
      var base64ToBlob = ((code) =>{
          let parts = code.split(';base64,');
          let contentType = parts[0].split(':')[1];
          let raw = window.atob(parts[1]);
          let rawLength = raw.length;
          let uInt8Array = new Uint8Array(rawLength);
          for(let i = 0; i < rawLength; ++i) {
              uInt8Array[i] = raw.charCodeAt(i);
          }
          return new Blob([uInt8Array], {
              type: contentType
          });
      })

      let aLink = document.createElement('a');
      let blob = base64ToBlob(content); //new Blob([content]);
      let evt = document.createEvent("HTMLEvents");
      evt.initEvent("click", true, true); //initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
      aLink.download = fileName;
      aLink.href = URL.createObjectURL(blob);
      aLink.click();
    }
  }
}
</script>

<style lang="less" scoped>

.save-graoh-wrapper {
  border: 1px solid #D9DBE0;
  border-radius: 4px;
  .cover {
    height: 140px;
    background: no-repeat center center;
    background-size: contain;
  }

}
</style>
