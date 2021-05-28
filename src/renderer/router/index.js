import Vue from 'vue'
import Router from 'vue-router'

import Recorder from '@/views/Recorder'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'menu',
      component: require('@/components/Menu').default
    },
    {
      path: '/recorder',
      name: 'recorder',
      component: Recorder
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
