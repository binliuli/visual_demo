import Vue from 'vue'
import 'element-ui/lib/theme-chalk/index.css';
import './assets/common/reset.css'
// import 'elens-theme/lib/index.css'
// import './assets/common/elens-theme.css'
import ElementUI from 'element-ui';
import App from './App.vue'
import router from './router'
import store from './store'
import GLOBALCONFIG from './config/config';
import axios from "axios"
// 引入阿里矢量图标
import './assets/iconfont/iconfont.css'
import Print from 'vue-print-nb'

// import "./components/common/visual-editor/lib/visualEditor.css"

const Base64 = require('js-base64').Base64;
import moment from "vue-moment"

// // 引入Echarts
// import Echarts from 'echarts'
// Vue.prototype.echarts = Echarts
// Vue.use(Echarts)

// axios.interceptors.response.use((response) => {
//   return response.data;
// }, function (error) {
//   console.log(error)
// });

router.beforeEach((to, from, next) => {

  //进去的页面路由=》登录后的页面
  if (to.path != "/") {
    const isLogin = localStorage.getItem("isLogin");
    // 判断是否登录 已经登录正常跳转，否则跳转登录页面
    if (isLogin) {
      next()
    } else {
      next({ path: '/' })
    }

  } else {
    next()
  }
})

Vue.use(moment);//moment.js 处理时间
Vue.use(ElementUI);
Vue.use(Print);//打印
Vue.config.productionTip = false
Vue.prototype.$GLOBALCONFIG = GLOBALCONFIG;//接口ip
Vue.prototype.$axios = axios;
Vue.prototype.$Base64 = Base64;//加密

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
