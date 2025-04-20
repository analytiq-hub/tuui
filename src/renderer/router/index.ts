import { McpScreen, ChatScreen, AgentScreen, SettingScreen } from '@/renderer/screens'
import { createRouter, createWebHashHistory } from 'vue-router'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/mcp',
      components: McpScreen,
      meta: {
        titleKey: 'title.main'
      }
    },
    {
      path: '/chat',
      components: ChatScreen,
      meta: {
        titleKey: 'title.chat'
      }
    },
    {
      path: '/agent',
      components: AgentScreen,
      meta: {
        titleKey: 'title.agent'
      }
    },
    {
      path: '/setting',
      components: SettingScreen,
      meta: {
        titleKey: 'title.setting'
      }
    },
    {
      path: '/error',
      component: () => import('@/renderer/screens/ErrorScreen.vue'),
      meta: {
        titleKey: 'title.error'
      }
    },
    {
      path: '/',
      redirect: '/chat'
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/chat'
    }
  ]
})
