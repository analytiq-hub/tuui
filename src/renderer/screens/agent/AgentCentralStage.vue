<script setup>
import { useMcpStore } from '@/renderer/store/mcp'
import { useAgentStore } from '@/renderer/store/agent'
import { useI18n } from 'vue-i18n'
import { v4 as uuidv4 } from 'uuid'
import { ref, watch, onMounted, computed } from 'vue'
const mcpStore = useMcpStore()
const agentStore = useAgentStore()
const { t } = useI18n()

const allTools = ref([])
// const selectedTree = ref([])

const selectedTree = computed({
  get() {
    return agentStore.getRevised?.selectedNode
  },
  set(value) {
    console.log(value)
    if (agentStore.getRevised) {
      agentStore.getRevised.selectedNode = value
    }
  }
})

const items = ref([
  {
    id: 1,
    name: computed(() => t('agent.all')),
    children: []
  }
])

watch(allTools, (val) => {
  console.log('Tool list updated')
  const children = val.map((type) => ({
    id: type.server,
    name: type.server,
    children: type.tools.map((obj) => {
      return {
        id: agentStore.genId(type.server, obj.name),
        server: type.server,
        name: obj.name
      }
    })
  }))
  const rootObj = items.value[0]
  rootObj.children = children
  items.value = [rootObj]
})

onMounted(() => {
  load()
  console.log(selectedTree)
  console.log(items.value)
})

function load() {
  const mcpServers = mcpStore.getServers
  const mcpKeys = Object.keys(mcpServers)
  // Create an array of Promises
  const toolPromises = mcpKeys.map((key) => {
    const toolsListFunction = mcpServers[key]?.tools?.list
    if (typeof toolsListFunction === 'function') {
      // Ensure that toolsListFunction() returns a Promise
      return Promise.resolve(toolsListFunction()).then((tools) => ({
        server: key,
        ...tools
      }))
    } else {
      // If toolsListFunction is not a function, return an object with content as null
      return Promise.resolve({
        name: key,
        content: null
      })
    }
  })

  console.log(toolPromises)

  // Return a Promise that resolves when all toolPromises are resolved

  return Promise.all(toolPromises).then((data) => {
    allTools.value = data
  })
}

function onClickClose(selection) {
  selectedTree.value = selectedTree.value.filter((item) => item !== selection)
}

function handleNameUpdate() {
  if (!agentStore.getRevised.name) {
    agentStore.getRevised.name = `Agent ${uuidv4()}`
  }

  if (agentStore.getUnrevised.find((agent) => agent.name === agentStore.getRevised.name)) {
    agentStore.getRevised.name = `Agent ${uuidv4()}`
  }
}
</script>

<template>
  <v-div v-if="agentStore.getRevised" :key="agentStore.getRevised">
    <v-card :title="$t('agent.config')">
      <v-divider></v-divider>
      <v-text-field
        v-model="agentStore.getRevised.name"
        density="compact"
        variant="outlined"
        class="px-6 pt-5"
        :label="$t('setting.name')"
        @blur="handleNameUpdate"
      ></v-text-field>
    </v-card>

    <v-confirm-edit
      v-model="agentStore.getRevised.prompt"
      :cancel-text="$t('agent.cancel')"
      :ok-text="$t('agent.save')"
    >
      <template #default="{ model: proxyModel, actions, isPristine }">
        <v-card class="mt-4" :title="$t('agent.prompt')">
          <v-divider></v-divider>
          <template #text>
            <v-textarea
              v-model="proxyModel.value"
              class="mx-2 mt-2"
              auto-grow
              variant="solo-filled"
              :error-messages="isPristine ? 'Please save' : ''"
            ></v-textarea>
          </template>
          <template #actions>
            <v-spacer></v-spacer>
            <component :is="actions" color="primary"></component>
          </template>
        </v-card>
      </template>
    </v-confirm-edit>

    <v-card v-if="selectedTree" class="mt-4" :title="$t('agent.tools')">
      <v-row dense>
        <v-divider></v-divider>
        <v-treeview
          v-model:selected="selectedTree"
          :items="items"
          :load="load"
          class="flex-1-0"
          false-icon="mdi-bookmark-outline"
          indeterminate-icon="mdi-bookmark-minus"
          item-title="name"
          item-value="id"
          select-strategy="classic"
          true-icon="mdi-bookmark"
          selectable
        ></v-treeview>
      </v-row>

      <v-row dense>
        <v-divider></v-divider>
        <v-card-text>
          <div
            v-if="selectedTree.length === 0"
            class="text-h6 font-weight-light text-grey pa-4 text-center"
          >
            {{ $t('agent.selected') }}
          </div>
          <div class="d-flex flex-wrap ga-1">
            <v-scroll-x-transition group hide-on-leave>
              <v-chip
                v-for="selection in selectedTree"
                :key="selection"
                :text="agentStore.getId(selection).name"
                color="grey"
                size="small"
                border
                closable
                label
                @click:close="onClickClose(selection)"
              >
                <template #prepend>
                  <v-avatar
                    :text="agentStore.getAbbr(agentStore.getId(selection).server)"
                    :color="agentStore.getColor(selection)"
                    start
                    variant="plain"
                  >
                  </v-avatar>
                </template>
              </v-chip>
            </v-scroll-x-transition>
          </div>
        </v-card-text>
      </v-row>

      <!-- <v-divider></v-divider>

    <template v-slot:actions>
      <v-btn text="Reset" @click="selectedTree = []"></v-btn>

      <v-spacer></v-spacer>

      <v-btn append-icon="mdi-content-save" color="surface-light" text="Save" variant="flat" border></v-btn>
      <v-btn @click="console.log(agentStore.selected)"></v-btn>
    </template> -->
    </v-card>
  </v-div>
</template>
