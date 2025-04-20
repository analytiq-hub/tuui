import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ComponentName } from '@/renderer/screens'

export function useRouteFeatures() {
  const route = useRoute()

  const hasComponent = (componentName: ComponentName) => {
    return computed(() =>
      route.matched.some((record) => Boolean(record.components?.[componentName]))
    )
  }

  const titleKey = computed(() => {
    return route.meta?.titleKey || 'title.chat'
  })

  return { hasComponent, titleKey }
}
