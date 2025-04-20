import { defineStore } from 'pinia'

export type RoutePath = '/mcp' | '/chat' | '/agent' | '/setting'

const PATH_TO_SCREEN = {
  '/mcp': 0,
  '/chat': 1,
  '/agent': 2,
  '/setting': 3
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
