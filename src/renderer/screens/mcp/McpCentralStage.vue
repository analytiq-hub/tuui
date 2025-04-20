<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useMcpStore } from '@/renderer/store/mcp'
import { openExternal } from '@/renderer/utils'
import McpResourcePage from '@/renderer/components/pages/McpResourcePage.vue'
import McpPromptPage from '@/renderer/components/pages/McpPromptPage.vue'

const mcpStore = useMcpStore()
const configContent = ref('')
const isLoading = ref(false)
const saveStatus = ref('')

const mcpNews = [
  {
    title: 'MCP Introduction',
    description: 'Get started with the Model Context Protocol (MCP)',
    link: 'https://modelcontextprotocol.io'
  },
  {
    title: 'MCP Servers',
    description:
      'A collection of reference and third-party servers for the Model Context Protocol (MCP)',
    link: 'https://github.com/modelcontextprotocol/servers'
  },
  {
    title: 'MCP Specification',
    description: 'MCP specification details',
    link: 'https://spec.modelcontextprotocol.io'
  }
]

const handleOpenLink = async (link: string): Promise<void> => {
  await openExternal(link)
}

// Config editor functions
const loadConfig = async () => {
  isLoading.value = true
  try {
    const config = await window.configFileApi.getConfig()
    configContent.value = config
    // Format JSON for better readability
    try {
      const parsed = JSON.parse(config)
      configContent.value = JSON.stringify(parsed, null, 2)
    } catch (e) {
      // If parsing fails, keep the original content
      console.error('Error parsing JSON:', e)
    }
  } catch (error) {
    console.error('Failed to load config file:', error)
    configContent.value = '{\n  "error": "Failed to load configuration"\n}'
  } finally {
    isLoading.value = false
  }
}

const saveConfig = async () => {
  try {
    // Validate JSON
    JSON.parse(configContent.value)

    saveStatus.value = 'Saving...'
    const result = await window.configFileApi.updateConfig(configContent.value)

    if (result.success) {
      saveStatus.value = 'Config saved, reloading MCP servers...'

      try {
        // First call a new IPC method to reload the MCP servers
        const reloadResult = await window.configFileApi.reloadMcpServers()

        if (reloadResult.success) {
          saveStatus.value = 'Config saved and MCP servers reloaded successfully!'

          // Wait a moment to show the success message before reloading
          setTimeout(() => {
            // Force reload the window to reflect changes in mcpServers
            window.location.reload()
          }, 1500)
        } else {
          saveStatus.value = `Config saved but failed to reload MCP servers: ${reloadResult.error || 'Unknown error'}`
          setTimeout(() => {
            saveStatus.value = ''
          }, 5000)
        }
      } catch (error) {
        console.error('Failed to reload MCP servers:', error)
        saveStatus.value = 'Config saved but failed to reload MCP servers. Try restarting the app.'
        setTimeout(() => {
          saveStatus.value = ''
        }, 5000)
      }
    } else {
      saveStatus.value = `Error: ${result.error || 'Unknown error'}`
      setTimeout(() => {
        saveStatus.value = ''
      }, 5000)
    }
  } catch (error) {
    saveStatus.value = `Invalid JSON: ${error}. Please fix syntax errors before saving.`
    setTimeout(() => {
      saveStatus.value = ''
    }, 5000)
  }
}

// Set the selected value to 'config' by default when component is mounted
onMounted(() => {
  // Set selection to config
  mcpStore.selected = ['config']

  // Load the config
  loadConfig()
})

// Watch for changes to the selected item and load config when 'config' is selected
watch(() => mcpStore.selected, (newSelected) => {
  if (newSelected[0] === 'config') {
    loadConfig()
  }
}, { deep: true })
</script>

<template>
  <!-- Config Editor Section -->
  <div v-if="mcpStore.selected[0] === 'config'">
    <v-card class="fill-height">
      <v-card-title>
        MCP Server Configuration
        <v-chip v-if="saveStatus" class="ml-2" :color="saveStatus.includes('Error') ? 'error' : 'success'" size="small">
          {{ saveStatus }}
        </v-chip>
      </v-card-title>
      <v-card-subtitle>
        Edit the configuration file and click Save to apply changes. Restart the application for changes to take effect.
      </v-card-subtitle>
      <v-card-text>
        <div v-if="isLoading" class="d-flex justify-center align-center my-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <div v-else>
          <v-textarea
            v-model="configContent"
            :rows="15"
            auto-grow
            class="font-monospace"
            bg-color="grey-darken-4"
            color="primary"
            variant="outlined"
            hint="This is JSON format. Be careful with syntax."
          ></v-textarea>
          <div class="d-flex justify-end mt-3">
            <v-btn color="primary" class="mr-2" @click="loadConfig">Reload</v-btn>
            <v-btn color="success" @click="saveConfig">Save Configuration</v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>

  <!-- Original Content (only shown if config is not selected) -->
  <div v-else-if="mcpStore.getSelected">
    <div v-if="mcpStore.getSelected.primitive === 'tools'">
      <v-data-table
        :key="mcpStore.getSelected"
        hide-default-footer
        hide-default-header
        hide-no-data
        disable-sort
        :items-per-page="-1"
        :items="mcpStore.serverTools"
        :loading="mcpStore.loading"
        @update:options="mcpStore.loadServerTools"
      ></v-data-table>
    </div>
    <div v-else-if="mcpStore.getSelected.primitive === 'resources'">
      <McpResourcePage :key="mcpStore.getSelected"></McpResourcePage>
    </div>

    <div
      v-else-if="
        typeof mcpStore.getSelected.primitive === 'string' &&
        mcpStore.getSelected.primitive.length > 0
      "
    >
      <McpPromptPage :key="mcpStore.getSelected"></McpPromptPage>
    </div>
  </div>
  <div v-else>
    <v-card
      v-for="news in mcpNews"
      :key="news.title"
      class="ma-1 mb-5"
      :title="news.title"
      :subtitle="news.description"
      @click="handleOpenLink(news.link)"
    >
    </v-card>
  </div>
</template>

<style>
.font-monospace {
  font-family: "Courier New", monospace;
}
</style>
