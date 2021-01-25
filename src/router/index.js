import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes:[
		{
			path: '/',
			name: 'Home',
			component: Home
		}
	]
})

export default router
