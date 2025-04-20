import { defineStore } from 'pinia'

export type RoutePath = '/mcp' | '/chat' | '/agent' | '/setting'

const PATH_TO_SCREEN = {
  '/chat': 0,
  '/agent': 1,
  '/setting': 2,
  '/mcp': 3
} as Record<RoutePath, number>

type ScreenKey = keyof typeof PATH_TO_SCREEN
type ScreenValue = (typeof PATH_TO_SCREEN)[ScreenKey]

export const getScreenFromPath = (path: string): ScreenValue => {
  return PATH_TO_SCREEN[path as ScreenKey] ?? 0
}

export const useLayoutStore = defineStore('layoutStore', {
  state: () => ({
    sidebar: false,
    apiKeyShow: false,
    screen: 0 // The selected screen is a list: 0,1,2,...
  })
})
