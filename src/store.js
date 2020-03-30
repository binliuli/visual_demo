import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isLogin: ""
  },
  mutations: {
    login(state, info) {
      let login = info;
      localStorage.setItem("isLogin", JSON.stringify(login));
      state.isLogin = login;
    }
  },
  actions: {

  }
})
