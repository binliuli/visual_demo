<template>
<el-dialog :title="title" :visible.sync="dialogVisible" width="500px" @close=closePop>
  <div class="select-object-wrapper">
    <div class="input-wrapper">
      <el-form ref="form" :model="form" label-width="80px" @submit.native.prevent="submitForm">
        <el-form-item label="实体名称" v-if="!modifyMode">
          <el-input @input="querySearch" placeholder="" v-model="form.name" :disabled="isDisabled"></el-input>
        </el-form-item>
        <div class="props-form" v-if="createMode && !modifyMode">
          <el-form-item label="实体类型">
            <el-select v-model="form.model_id" placeholder="请选择实体类型" @change="setModelProps">
              <el-option v-for="item in modelTypes" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="propm.name" v-for="propm in currentProps" v-if="form.model_id" :key="propm.name">
            <el-input v-model="form.data[`${propm.name}`]" :placeholder="`请输入${propm.name}`" />
          </el-form-item>
          <el-form-item label="">
            <el-button type="primary" native-type="submit" :disabled="!form.model_id || !currentProps">创建实体</el-button>
            <el-button type="" @click="switchCreateMode">返回</el-button>
          </el-form-item>
        </div>
        <div class="props-form" v-if="modifyMode">
          <el-form-item :label="i" v-for="(item, i) in formModify" :key="i" v-if="notShowName.indexOf(i) === -1">
            <el-input placeholder="" v-model="formModify[i]" disabled></el-input>
          </el-form-item>
          <el-form-item label="">
            <!-- <el-button type="primary" native-type="submit">确认修改</el-button> -->
            <el-button type="" @click="closePop">关闭</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
    <div class="result-list" v-if="!createMode && !modifyMode">
      <div class="empty" v-if="!objectName">无数据</div>
      <div class="new-item item" v-if="!!objectName">
        <div class="desc">新建名称为"{{objectName}}"的实体</div>
        <el-button type="success" icon="el-icon-plus" class="btn" @click="switchCreateMode"> 新建</el-button>
      </div>
      <div class="result-item item" v-for="item in resultList" :key="item.id">
        <div class="desc">
          <div class="name">名称：{{item.name}}</div>
          <div class="type">类型：{{item.model_name}}</div>
        </div>
        <el-button type="" icon="el-icon-plus" class="btn" @click="addObject(item)"> 添加</el-button>
      </div>
    </div>

  </div>
</el-dialog>
</template>

<script>
import {
  mapState,
  mapActions
} from 'vuex';
import _ from 'lodash';
import FormRender from './FormRender';

export default {
  components: {
    FormRender
  },
  props: {
    obName: String,
    objData: {
      default () {
        return {};
      }
    },
    modifyData: String // 修改属性用
  },
  data() {
    return {
      notShowName: ['is_del', '@version', '@timestamp', 'data', 'update_time', 'user_id', 'aggregation', 'create_time', 'label'],
      dialogVisible: false,
      modifyMode: false,
      loaded: false,
      selected: {},
      resultList: [],
      modelTypes: [],
      currentProps: [],
      objectName: '',
      createMode: false,
      form: {
        id: '',
        name: '',
        model_id: '',
        data: {},
        model_name: '',
      },
      formModify: {
        id: '',
        name: '',
        model_id: '',
        model_name: '',
      }
    }
  },
  async mounted() {
    this.modelTypes = []
    // this.modelTypes = await this.getModels();
    // this.$set(this.form, 'model', this.modelTypes[0]);
    // console.log(this.form);
  },
  watch: {
    obName(val) {
      if (val !== this.form.name) {
        this.form.name = val;
        this.querySearch(val);
      }
    },
    objData(val) {
      if (val.id && val.id !== this.formModify.id) {
        this.modifyMode = true;
        this.formModify = val;
        this.formModify.id = val.id;
        this.formModify.name = val.name;
        this.formModify.model = val.model;
        this.formModify.model_name = val.model_name;
      }
    }
  },
  computed: {
    title() {
      return this.modifyMode ? '查看属性' : '添加实体';
    },
    isDisabled() {
      if (this.createMode) {
        return true;
      }
      return false;
    }
  },
  methods: {
    ...mapActions('object', [
      'getModels',
      'getProp',
      'saveSingleData'
    ]),
    async setModelProps(modelId) {
      this.currentProps = await this.getProp(modelId);
      this.currentProps.forEach(el => {
        if (el && el.name && !this.form.data[el.name]) {
          this.form.data[el.name] = "";
        }
      });
    },
    show() {
      if (this.objData.id && this.formModify.id && this.objData.id === this.formModify.id) {
        this.modifyMode = true;
        this.formModify.id = this.objData.id;
        this.formModify.name = this.objData.name;
        this.formModify.model = this.objData.model;
      }
      this.dialogVisible = true;
    },
    switchCreateMode() {
      this.createMode = !this.createMode;
    },
    async addObject(node) {
      console.log(node, 'node');
      const isModify = this.objData && this.objData.id ? true : false;
      await this.$emit('add', node, isModify);
      this.closePop();
    },
    closePop() {
      this.resetData();
      this.dialogVisible = false;
    },
    resetData() {
      Object.assign(this, {
        modifyMode: false,
        dialogVisible: false,
        loaded: false,
        selected: {},
        resultList: [],
        currentProps: [],
        objectName: '',
        createMode: false,
      });
      this.$set(this, 'form', {
        id: '',
        model_id: '',
        name: '',
        data: {}
      });
      this.$set(this, 'formModify', {
        id: '',
        name: '',
        model_id: {}
      });
    },
    async querySearch(key) {
      this.objectName = key;
      if (!key) {
        this.resultList = [];
        return;
      }
      const modelData = await this.$axios.$get('/search/', {
        params: {
          keyword: key,
          perPage: 10
        }
      });
      let resultdata = [];
      if (modelData && modelData.result && modelData.result.hits.length > 0) {
        resultdata = modelData.result.hits.map(item => {
          return item._source;
        });
        // resultdata = resultdata.map(item => {
        //   return item;
        // })
      }
      this.resultList = resultdata;
      // this.resultList = [{
      //   id: 1,
      //   name: '中国人民大学信息学院',
      //   model: {
      //     id: 12,
      //     icon: 'https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png',
      //     name: '嫌疑犯'
      //   }
      // }, {
      //   id: 2,
      //   name: '高新科技企业',
      //   model: {
      //     id: 12,
      //     icon: 'https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png',
      //     name: '常住人口'
      //   }
      // }]
    },
    async submitForm() {
      const res = await this.saveSingleData(this.form);
      if (res.id) {
        const model = _.find(this.modelTypes, m => m.id === this.form.model_id);
        this.addObject({
          data: {
            ...this.form.data
          },
          name: this.form.name,
          model,
          model_id: this.form.model_id,
          model_name: model.name,
          id: res.id,
        });
      } else {
        this.$message.error('创建对象出错');
        return false;
      }
      
    },
    async handleSelect(selected) {

    }
  }
}
</script>

<style lang="less">
@import "~assets/styles/vars";

.object-autocomplete li {
  line-height: normal;
  padding: 7px;

  .name {
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 14px;
  }

  .type {
    font-size: 12px;
    color: #b4b4b4;
  }

  .highlighted .type {
    color: #ddd;
  }
}

.select-object-wrapper {
  .input-label {
    position: relative;
    top: 4px;
  }

  .result-list {
    min-height: 200px;
    max-height: 400px;
    border: solid 1px @gray-lighter;
    border-radius: 4px;
    margin-top: 20px;
    overflow: auto;

    .empty {
      text-align: center;
      height: 200px;
      line-height: 200px;
      color: @gray-light;
      font-size: 14px;
    }

    .item {
      padding: 10px;
      position: relative;
      border-bottom: solid 1px @gray-lighter;

      .desc {
        margin-right: 60px;
        min-height: 50px;
      }

      .btn {
        position: absolute;
        top: 50%;
        right: 15px;
        transform: translate(0%, -50%);
      }

      &:last-of-type {
        border: 0;
      }

      &.new-item {
        background: @gray-lightest;

        .desc {
          line-height: 50px;
          margin: 0;
        }
      }

      &.result-item {
        .type {
          margin-top: 10px;
          font-size: 12px;
          // color: @gray-light;
        }
      }
    }
  }
}
</style>
