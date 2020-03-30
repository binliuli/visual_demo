<template>
<div>
  <el-form-item :label="item.label" :label-width="labelWidth" v-for="item in detailFormConfig" :key="item.label" :prop="propPrefix + item.field" :rules="item.rules||[]">
    <!-- 单行输入框 -->
    <el-input :value="form[item.field]" :placeholder="item.placeholder" v-if="item.type==='text'" @input="setValue(item.field, $event)"></el-input>
    <!-- 搜索输入框 -->
    <el-select v-model="form[item.field]" @change="setValue(item.field, $event)" :multiple="item.multiple" :allow-create="item.create" filterable remote reserve-keyword :placeholder="item.placeholder" :remote-method="item.remote" v-if="item.type==='search'">
      <el-option v-for="op in item.data" :key="op.value" :label="op.label" :value="op.value">
      </el-option>
    </el-select>
    <el-button type="text" v-if="item.type==='search'" @click="setValue(item.field, item.multiple ? [] : '')" class="form-render-clear-btn">清空</el-button>
    <!-- 多行输入框 -->
    <el-input :value="form[item.field]" :rows="item.rows || 2" :placeholder="item.placeholder" v-if="item.type==='textarea'" type="textarea" @input="setValue(item.field, $event)"></el-input>
    <!-- 多项select -->
    <el-select class="select-item" @change="setValue(item.field, $event)" v-model="form[item.field]" :placeholder="item.placeholder" v-if="item.type==='select'" :multiple="item.multiple">
      <el-option v-for="op in item.data" :key="op.value" :value="op.value" :label="op.label"></el-option>
    </el-select>
    <!-- 树型输入框 -->
    <el-tree v-if="item.type==='tree'" show-checkbox class="filter-tree" :data="item.data" :ref="item.field" v-model="form[item.field]" node-key="id" @check-change="checkChange(item.field)">
    </el-tree>
    <!-- 上传组件 -->
    <image-upload v-if="item.type==='upload'" :value="form[item.field]" @change="setValue(item.field, $event)" :text="item.btnText || '上传图片'" />

    <slot v-if="item.type==='slot'" :name="item.field" :value="form[item.field]"></slot>
  </el-form-item>
</div>
</template>

<script>
import ImageUpload from './ImageUpload';
export default {
  components: {
    ImageUpload
  },
  props: {
    value: Object,
    detailFormConfig: Array,
    propPrefix: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      labelWidth: '',
      form: {}
    }
  },
  mounted() {
    if (this.value) {
      this.setValues(this.value, true);
    }
  },
  computed: {},
  methods: {
    setValues(res, setOnly) {
      Object.keys(res).forEach((field) => {
        this.detailFormConfig.forEach(item => {
          // 只赋值表单里有的字段
          if (item.field === field) {
            this.form[field] = res[field];
            // 处理树型控件
            if (item.type.match(/^(tree)$/)) {
              let checkedKeys;
              try {
                checkedKeys = JSON.parse(res[field] || '[]');
              } catch (e) {
                checkedKeys = [];
              }
              const tree = this.$refs[field][0];
              tree.setCheckedKeys(checkedKeys);
              const keys = tree.getHalfCheckedNodes();
            }
            if (item.type.match(/^(search)$/)) {
              item.remote('');
            }
          }
        })
      });
      this.$forceUpdate();
      if (!setOnly) {
        this.$emit('change', this.form);
      } else {
        return this.form;
      }
    },
    checkChange(field) {
      const tree = this.$refs[field][0];
      const value = tree.getCheckedKeys().filter(item => !!item);
      this.form[field] = JSON.stringify(value);
      this.$emit('change', this.form);
    },
    setValue(field, value) {
      console.log(field, value);
      this.$set(this.form, field, value);
      // this.$forceUpdate();
      this.$emit('change', this.form);
    }
  },
  watch: {
    value(val) {
      console.log('Setting New Val');
      this.setValues(val, true);
    }
  }
}
</script>

<style lang="less">
  .form-render-clear-btn {
    margin-left: 15px;
  }
</style>
