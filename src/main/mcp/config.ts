import { McpServersConfig } from './types'
import { readFileSync, existsSync, copyFileSync } from 'fs'

export function ensureConfigExists(configPath: string, templatePath: string): boolean {
  try {
    if (!existsSync(configPath)) {
      console.log(`Config file not found at ${configPath}, copying from template...`)
      copyFileSync(templatePath, configPath)
      console.log('Config file created successfully from template')
    }
    return true
  } catch (error) {
    console.error('Error ensuring config file exists:', error)
    return false
  }
}

export function readConfig(configPath: string): McpServersConfig | null {
  try {
    const config = readFileSync(configPath, 'utf8')
    return JSON.parse(config)
  } catch (error) {
    console.error('Error reading config file:', error)
    return null
  }
}
