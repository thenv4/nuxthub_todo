<script setup lang="ts">
import { ref, computed } from 'vue'

const branches = ref<string[]>([])
const requests = ref<any[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const sourceSearchQuery = ref('')
const targetSearchQuery = ref('')
const filteredSourceBranches = ref<string[]>([])
const filteredTargetBranches = ref<string[]>([])

interface TreeNode {
  label: string
  value: string
  children?: TreeNode[]
  expanded?: boolean
  matched?: boolean
}

function buildBranchTree(branches: string[], searchQuery: string = ''): TreeNode[] {
  const tree: TreeNode[] = []
  const hasSearch = searchQuery.toLowerCase()
  const expandedNodes = new Set<string>()
  
  // Trước tiên tìm tất cả các node cần expand
  if (hasSearch) {
    branches.forEach(branch => {
      if (branch.toLowerCase().includes(hasSearch)) {
        // Thêm tất cả các parent paths vào set
        const parts = branch.split('/')
        let path = ''
        parts.forEach(part => {
          path = path ? `${path}/${part}` : part
          expandedNodes.add(path)
        })
      }
    })
  }
  
  branches.forEach(branch => {
    const parts = branch.split('/')
    let currentLevel = tree
    let currentPath = ''
    
    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part
      
      let node = currentLevel.find(n => n.label === part)
      if (!node) {
        const isMatched = hasSearch && currentPath.toLowerCase().includes(hasSearch)
        
        node = {
          label: part,
          value: currentPath,
          children: [],
          expanded: expandedNodes.has(currentPath),
          matched: isMatched
        }
        currentLevel.push(node)
      }
      
      if (index < parts.length - 1) {
        currentLevel = node.children!
      } else {
        // Nếu là node lá, kiểm tra match và xóa children
        node.matched = hasSearch && currentPath.toLowerCase().includes(hasSearch)
        delete node.children
      }
    })
  })
  
  return tree
}

const branchTree = computed(() => {
  return buildBranchTree(branches.value)
})

watch(sourceSearchQuery, (query) => {
  if (!query) {
    filteredSourceBranches.value = branches.value
    return
  }
  filteredSourceBranches.value = branches.value.filter(branch =>
    branch.toLowerCase().includes(query.toLowerCase())
  )
})

watch(targetSearchQuery, (query) => {
  if (!query) {
    filteredTargetBranches.value = branches.value
    return
  }
  filteredTargetBranches.value = branches.value.filter(branch =>
    branch.toLowerCase().includes(query.toLowerCase())
  )
})

const sourceBranchTree = computed(() => {
  return buildBranchTree(filteredSourceBranches.value || branches.value, sourceSearchQuery.value)
})

const targetBranchTree = computed(() => {
  return buildBranchTree(filteredTargetBranches.value || branches.value, targetSearchQuery.value)
})

const newRequest = ref({
  sourceBranch: '',
  targetBranch: '',
  title: '',
  description: ''
})

const branchOptions = computed(() => {
  const options = branches.value.map(branch => ({
    label: branch,
    value: branch
  }))
  return options
})

const statusColors = {
  pending: 'yellow',
  merged: 'green',
  rejected: 'red'
}

const statusLabels = {
  pending: 'Chờ merge',
  merged: 'Đã merge',
  rejected: 'Từ chối'
}

const { user } = useUserSession()
const isAdmin = computed(() => user.value?.email === 'thenv4@f88.vn')

async function loadData() {
  isLoading.value = true
  error.value = null
  try {
    const [branchesData, requestsData] = await Promise.all([
      $fetch('/api/merge-requests/branches'),
      $fetch('/api/merge-requests')
    ])
    branches.value = branchesData
    filteredSourceBranches.value = branchesData
    filteredTargetBranches.value = branchesData
    requests.value = requestsData
  } catch (error) {
    console.error('Failed to load data:', error)
    error.value = 'Không thể tải dữ liệu. Vui lòng thử lại sau.'
  } finally {
    isLoading.value = false
  }
}

async function createRequest() {
  try {
    const payload = {
      sourceBranch: newRequest.value.sourceBranch.value,
      targetBranch: newRequest.value.targetBranch.value,
      title: newRequest.value.title,
      description: newRequest.value.description
    }

    await $fetch('/api/merge-requests', {
      method: 'POST',
      body: payload
    })

    // Reset form
    newRequest.value = {
      sourceBranch: '',
      targetBranch: '',
      title: '',
      description: ''
    }
    
    await loadData()
  } catch (error) {
    console.error('Failed to create merge request:', error)
  }
}

async function deleteMergeRequest(id: number) {
  try {
    await $fetch(`/api/merge-requests/${id}`, {
      method: 'DELETE'
    })
    await loadData()
  } catch (error) {
    console.error('Failed to delete merge request:', error)
  }
}

async function updateMergeRequestStatus(id: number, status: 'pending' | 'merged' | 'rejected') {
  try {
    await $fetch(`/api/merge-requests/${id}`, {
      method: 'PATCH',
      body: { status }
    })
    await loadData()
  } catch (error) {
    console.error('Failed to update merge request status:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="max-w-full mx-auto px-4 py-8 space-y-8">
    <!-- Create new merge request -->
    <UCard>
      <template #header>
        <h3 class="text-xl font-semibold">Tạo yêu cầu merge mới</h3>
      </template>

      <form @submit.prevent="createRequest" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormGroup label="Nhánh nguồn" class="w-full">
            <div class="space-y-2">
              <UInput
                v-model="sourceSearchQuery"
                icon="i-heroicons-magnifying-glass-20-solid"
                placeholder="Tìm kiếm nhánh nguồn..."
                class="w-full"
              />
              <UTree
                v-model="newRequest.sourceBranch"
                :items="sourceBranchTree"
                :default-expanded="sourceSearchQuery ? true : undefined"
                class="max-h-60 overflow-auto border rounded-lg p-2"
              >
                <template #label="{ item }">
                  <span :class="{
                    'bg-primary-100 dark:bg-primary-800 px-1 rounded': item.matched,
                    'font-medium': item.matched
                  }">
                    {{ item.label }}
                  </span>
                </template>
              </UTree>
            </div>
          </UFormGroup>

          <UFormGroup label="Nhánh đích" class="w-full">
            <div class="space-y-2">
              <UInput
                v-model="targetSearchQuery"
                icon="i-heroicons-magnifying-glass-20-solid"
                placeholder="Tìm kiếm nhánh đích..."
                class="w-full"
              />
              <UTree
                v-model="newRequest.targetBranch"
                :items="targetBranchTree"
                :default-expanded="targetSearchQuery ? true : undefined"
                class="max-h-60 overflow-auto border rounded-lg p-2"
              >
                <template #label="{ item }">
                  <span :class="{
                    'bg-primary-100 dark:bg-primary-800 px-1 rounded': item.matched,
                    'font-medium': item.matched
                  }">
                    {{ item.label }}
                  </span>
                </template>
              </UTree>
            </div>
          </UFormGroup>
        </div>

        <UFormGroup label="Tiêu đề" class="w-full">
          <UInput
            v-model="newRequest.title"
            placeholder="Nhập tiêu đề"
            class="w-full"
            required
          />
        </UFormGroup>

        <UFormGroup label="Mô tả" class="w-full">
          <UTextarea
            v-model="newRequest.description"
            placeholder="Nhập mô tả"
            class="w-full"
            rows="4"
          />
        </UFormGroup>

        <div class="flex justify-end">
          <UButton type="submit" color="primary" size="lg">
            Tạo yêu cầu merge
          </UButton>
        </div>
      </form>
    </UCard>

    <!-- Error message -->
    <UAlert
      v-if="error"
      color="red"
      variant="soft"
      :title="error"
    />

    <!-- List of merge requests -->
    <UCard>
      <template #header>
        <h3 class="text-xl font-semibold">Danh sách yêu cầu merge</h3>
      </template>

      <UTable
        :data="requests"
        :loading="isLoading"
        loading-color="primary"
        loading-animation="carousel"
        :columns="[
          {
            id: 'id',
            accessorKey: 'id',
            header: 'ID'
          },
          {
            id: 'title',
            accessorKey: 'title',
            header: 'Tiêu đề'
          },
          {
            id: 'fullName',
            accessorKey: 'fullName',
            header: 'Người tạo'
          },
          {
            id: 'email',
            accessorKey: 'email',
            header: 'Email'
          },
          {
            id: 'sourceBranch',
            accessorKey: 'sourceBranch',
            header: 'Nhánh nguồn'
          },
          {
            id: 'targetBranch',
            accessorKey: 'targetBranch',
            header: 'Nhánh đích'
          },
          {
            id: 'status',
            accessorKey: 'status',
            header: 'Trạng thái'
          },
          {
            id: 'createdAt',
            accessorKey: 'createdAt',
            header: 'Ngày tạo'
          },
          ...(isAdmin.value ? [{
            id: 'actions',
            header: 'Thao tác'
          }] : [])
        ]"
        :empty-state="{
          icon: 'i-heroicons-inbox-20-solid',
          label: 'Chưa có yêu cầu merge nào'
        }"
        class="flex-1"
      >
        <template #sourceBranch-data="{ row }">
          <span class="font-mono text-sm">{{ row.sourceBranch }}</span>
        </template>

        <template #targetBranch-data="{ row }">
          <span class="font-mono text-sm">{{ row.targetBranch }}</span>
        </template>

        <template #status-data="{ row }">
          <UBadge
            :color="statusColors[row.status] || 'gray'"
            :variant="row.status === 'pending' ? 'soft' : 'solid'"
          >
            {{ statusLabels[row.status] || row.status }}
          </UBadge>
        </template>

        <template #createdAt-data="{ row }">
          {{ new Date(row.createdAt).toLocaleString('vi-VN') }}
        </template>

        <template #actions-data="{ row }">
          <div class="flex items-center gap-2">
            <UDropdown :items="[
              {
                label: 'Chờ merge',
                icon: 'i-heroicons-clock-20-solid',
                click: () => updateMergeRequestStatus(row.id, 'pending')
              },
              {
                label: 'Đã merge',
                icon: 'i-heroicons-check-circle-20-solid',
                click: () => updateMergeRequestStatus(row.id, 'merged')
              },
              {
                label: 'Từ chối',
                icon: 'i-heroicons-x-circle-20-solid',
                click: () => updateMergeRequestStatus(row.id, 'rejected')
              }
            ]">
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-pencil-square-20-solid"
              />
            </UDropdown>
            <UButton
              color="red"
              variant="ghost"
              icon="i-heroicons-trash-20-solid"
              @click="deleteMergeRequest(row.id)"
            />
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template> 