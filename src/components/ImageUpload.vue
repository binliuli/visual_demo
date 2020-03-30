<template>
<el-upload class="image-uploader" :show-file-list="false" :action="ossObject.host" :data="oss" accept="image/*" :on-success="handleSuccess" :before-upload="beforeUpload">
  <img v-if="uploadedImage" :src="uploadedImage" class="image">
  <el-button v-else icon="el-icon-plus">{{text}}</el-button>
</el-upload>
</template>

<script>
import {
  mapState,
  mapActions
} from 'vuex';
import md5 from 'md5';
export default {
  components: {},
  props: {
    detailFormConfig: Array,
    value: String,
    text: String,
  },
  data() {
    return {
      imageUrl: '',
    }
  },
  mounted() {},
  computed: {
    ...mapState('oss', {
      ossObject: state => state.signatureObject,
      oss: state => state.paramObject
    }),
    uploadedImage() {
      return this.imageUrl || this.value;
    }
  },
  methods: {
    beforeUpload(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const image = new Image();
          image.onload = () => {
            const width = this.width;
            const height = this.height;
            if (width > 600 || height > 760) {
              this.$message({
                message: '图片尺寸必须在600~760之间！',
                type: 'error',
                duration: 1500
              });
              reject();
            } else {
              const pIndex = file.name.lastIndexOf('.');
              const postfix = file.name.substring(pIndex, file.name.length);
              this.fileName = md5(new Date().getTime() + file.name.slice(0, pIndex)) + postfix;
              this.setNewKey(this.ossObject.dir + this.fileName);
            }
            resolve();
          };
          image.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    },
    handleSuccess() {
      this.imageUrl = `${this.oss.host}/${this.oss.key}`;
      this.$emit('change', this.imageUrl);
    },
    ...mapActions('oss', [
      'setNewKey'
    ])
  }
}
</script>

<style lang="less">
@import '~assets/styles/vars';
.image-uploader {
  .image {
    max-width: 50%;
    display: block;
    background: @gray-light;
  }
}
</style>
