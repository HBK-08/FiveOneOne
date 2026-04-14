import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import QuizPage from '@/pages/QuizPage.vue'
import ResultPage from '@/pages/ResultPage.vue'
import AdminPage from '@/pages/AdminPage.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/quiz', name: 'Quiz', component: QuizPage },
  { path: '/result', name: 'Result', component: ResultPage },
  { path: '/admin', name: 'Admin', component: AdminPage },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
