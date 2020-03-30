const Node_Env = process.env.VUE_APP_CURRENTMODE;
console.log(Node_Env, 11)
const IS_PROD = ["testing"].includes(Node_Env);

const plugins = [];
if (IS_PROD) {
  plugins.push("transform-remove-console");
}

module.exports = {
  presets: [
    '@vue/app'
  ],
  plugins
}
