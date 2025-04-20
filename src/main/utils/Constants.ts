import { join, dirname } from 'path'
import { name, version, debug } from '../../../package.json'
import { fileURLToPath } from 'url'
import { app } from 'electron'

const __dirname = dirname(fileURLToPath(import.meta.url))

export interface TrayOptions {
  enabled: boolean
  trayWindow: boolean
  menu: boolean
  tooltip: string
  margin: { x: number; y: number }
  showAtStartup: boolean
}

export interface AssetsPaths {
  icon: string
  config: string
  configTemplate: string
}

export default class Constants {
  // Display app name (uppercase first letter)
  static APP_NAME = name.charAt(0).toUpperCase() + name.slice(1)

  static APP_VERSION = version

  static IS_DEV_ENV = process.env.NODE_ENV === 'development'

  // To show devtools at startup. It requires IS_DEV_ENV=true.
  // Note: For debugging purpose, window won't be closed if click elsewhere, if devtools is open.
  static IS_DEVTOOLS = true

  static IS_MAC = process.platform === 'darwin'

  static DEFAULT_WEB_PREFERENCES = {
    nodeIntegration: false,
    contextIsolation: true,
    enableRemoteModule: false,
    preload: join(__dirname, '../preload/index.js')
  }

  static DEFAULT_TRAY_OPTIONS: TrayOptions = {
    enabled: false,
    trayWindow: false,
    menu: false,
    tooltip: 'TUUI App',
    margin: { x: 0, y: 0 },
    showAtStartup: false
  }

  static APP_INDEX_URL_DEV = `${debug.env.VITE_DEV_SERVER_URL}/index.html`
  static APP_INDEX_URL_PROD = join(__dirname, '../index.html')

  private static _buildAssetsPath(relativePath: string) {
    const basePath = app.isPackaged ? process.resourcesPath : 'src/main'
    return join(basePath, 'assets', relativePath)
  }

  static ASSETS_PATH: AssetsPaths = {
    icon: Constants._buildAssetsPath('icon16.png'),
    config: Constants._buildAssetsPath('config.json'),
    configTemplate: Constants._buildAssetsPath('config_template.json')
  }
}
