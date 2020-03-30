import _ from 'lodash';

export default {
  data() {
    return {
    };
  },
  mounted() {
  },
  methods: {
    selectByBriefModel(m) {
      this.selectedModel = m;
      this.selectByCondition(n => _.get(n, 'model.id') === m.id);
    },
  },
  computed: {
    briefModels() {
      // console.log(this.nodes);
      const models = _.unionBy(this.nodes || [], n => _.get(n, 'model.id')).map((n) => {
        const m = _.clone(n.model || {});
        m.style = {
          backgroundImage: `url('${m.icon}')`,
        };
        return m;
      }).filter(n => n.id);
      // console.log(models);
      return models;
    },
  },
};
