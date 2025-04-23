<script setup lang="ts">
import { useMcpStore } from '@/renderer/store/mcp'
const mcpStore = useMcpStore()

// Add config option to the mcp store if not already available
if (!mcpStore.selectedChips.config) {
  mcpStore.selectedChips.config = 0
}
</script>

<template>
  <v-list v-model:selected="mcpStore.selected" nav mandatory>
    <!-- Enhanced Config button -->
    <v-list-item
      value="config"
      link
      :ripple="true"
      :active="mcpStore.selected[0] === 'config'"
      class="config-button mb-2"
    >
      <v-list-item-title> MCP Server Config </v-list-item-title>
    </v-list-item>

    <v-divider class="mb-2"></v-divider>

    <!-- Existing items -->
    <v-list-item
      v-for="(item, key) in mcpStore.getServers"
      :key="key"
      two-line
      :value="key"
      link
      :ripple="false"
    >
      <v-list-item-content>
        <v-list-item-title class="ma-1">{{ key }}</v-list-item-title>
        <v-chip-group
          v-model="mcpStore.selectedChips[key]"
          :direction="mcpStore.selected[0] === key ? 'vertical' : undefined"
          selected-class="text-primary"
          mandatory
        >
          <v-chip
            v-for="(_primitive, name) in item"
            :key="`${key}-${name}`"
            class="mr-1 my-1"
            label
            color="primary"
            size="small"
            @click="console.log(key, name)"
          >
            {{ name }}
          </v-chip>
        </v-chip-group>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<style scoped>
.config-button {
  border: 1px solid rgba(var(--v-theme-primary), 0.5);
  border-radius: 8px;
  margin: 0 4px;
  transition: all 0.3s ease;
}

.config-button:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.config-button:active {
  transform: translateY(0);
}

.config-title {
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: 0.5px;
}

/* When selected, make it even more obvious */
.v-list-item--active.config-button {
  background-color: rgba(var(--v-theme-primary), 0.15) !important;
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.4);
}
</style>
