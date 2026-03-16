<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">WeChat MiniPrograms</h1>
      <UButton color="primary" @click="showCreateModal = true">
        Add Config
      </UButton>
    </div>

    <div class="flex gap-2">
      <UInput
        v-model="searchInput"
        placeholder="Search by name or AppID"
        icon="i-heroicons-magnifying-glass"
        @keyup.enter="handleSearch"
        class="w-full max-w-sm"
      />
      <UButton @click="handleSearch">Search</UButton>
    </div>

    <UCard>
      <UTable
        :data="items"
        :columns="columns"
        :loading="pending"
      >
        <template #createdAt-cell="{ row }">
          {{ new Date(row.original.createdAt).toLocaleString() }}
        </template>
        
        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton size="xs" color="primary" variant="ghost" icon="i-heroicons-pencil-square" @click="openEditModal(row.original)" />
            <UButton size="xs" color="error" variant="ghost" icon="i-heroicons-trash" @click="confirmDelete(row.original)" />
          </div>
        </template>
      </UTable>
      
      <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
        <UPagination v-model:page="page" :items-per-page="pageSize" :total="total" />
      </div>
    </UCard>

    <!-- Create Modal -->
    <UModal v-model:open="showCreateModal" title="Add Config">
      <template #body>
        <UForm :validate="validateForm" :state="createModel" class="space-y-4" @submit="handleCreate">
          <UFormField label="Name" name="name">
            <UInput v-model="createModel.name" placeholder="Name" />
          </UFormField>
          <UFormField label="AppID" name="appId">
            <UInput v-model="createModel.appId" placeholder="AppID" />
          </UFormField>
          <UFormField label="AppSecret" name="appSecret">
            <UInput v-model="createModel.appSecret" placeholder="AppSecret" />
          </UFormField>
          <UFormField label="Description" name="description">
            <UTextarea v-model="createModel.description" placeholder="Description" />
          </UFormField>
          
          <div class="flex justify-end gap-2 mt-4">
            <UButton color="neutral" variant="ghost" @click="showCreateModal = false">Cancel</UButton>
            <UButton type="submit" color="primary" :loading="creating">Create</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Edit Modal -->
    <UModal v-model:open="showEditModal" title="Edit Config">
      <template #body>
        <UForm :validate="validateForm" :state="editModel" class="space-y-4" @submit="handleUpdate">
          <UFormField label="Name" name="name">
            <UInput v-model="editModel.name" placeholder="Name" />
          </UFormField>
          <UFormField label="AppID" name="appId">
            <UInput v-model="editModel.appId" placeholder="AppID" />
          </UFormField>
          <UFormField label="AppSecret" name="appSecret">
            <UInput v-model="editModel.appSecret" placeholder="AppSecret" />
          </UFormField>
          <UFormField label="Description" name="description">
            <UTextarea v-model="editModel.description" placeholder="Description" />
          </UFormField>
          
          <div class="flex justify-end gap-2 mt-4">
            <UButton color="neutral" variant="ghost" @click="showEditModal = false">Cancel</UButton>
            <UButton type="submit" color="primary" :loading="updating">Update</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="showDeleteModal" title="Confirm Delete">
      <template #body>
        <p>Are you sure you want to delete config {{ configToDelete?.name }}?</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="showDeleteModal = false">Cancel</UButton>
          <UButton color="error" @click="handleDelete" :loading="deleting">Delete</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});

const toast = useToast();

// Data Fetching
const page = ref(1);
const pageSize = ref(10);
const searchInput = ref("");
const searchQuery = ref("");

const { data, pending, refresh } = await useFetch("/api/admin/wechat-miniprograms", {
  query: computed(() => ({
    page: page.value,
    pageSize: pageSize.value,
    search: searchQuery.value || undefined,
  })),
});

function handleSearch() {
  page.value = 1;
  searchQuery.value = searchInput.value;
}

const items = computed(() => data.value?.items || []);
const total = computed(() => data.value?.total || 0);

const columns: TableColumn<any>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "appId", header: "AppID" },
  { accessorKey: "appSecret", header: "AppSecret", meta: { class: { td: "truncate max-w-[150px]" } } },
  { accessorKey: "description", header: "Description", meta: { class: { td: "truncate max-w-[200px]" } } },
  { accessorKey: "createdAt", header: "Created At" },
  { id: "actions", header: "Actions" },
];

const validateForm = (state: any) => {
  const errors = [];
  if (!state.name) errors.push({ path: 'name', message: 'Required' });
  if (!state.appId) errors.push({ path: 'appId', message: 'Required' });
  if (!state.appSecret) errors.push({ path: 'appSecret', message: 'Required' });
  return errors;
};

// Create
const showCreateModal = ref(false);
const creating = ref(false);
const createModel = reactive({
  name: "",
  appId: "",
  appSecret: "",
  description: "",
});

async function handleCreate() {
  creating.value = true;
  try {
    await $fetch("/api/admin/wechat-miniprograms", {
      method: "POST",
      body: createModel,
    });
    toast.add({ title: "Success", description: "Config created" });
    showCreateModal.value = false;
    refresh();
    // Reset
    createModel.name = "";
    createModel.appId = "";
    createModel.appSecret = "";
    createModel.description = "";
  } catch (e: any) {
    toast.add({ title: "Error", description: e.message || "Failed to create", color: 'error' });
  } finally {
    creating.value = false;
  }
}

// Edit
const showEditModal = ref(false);
const updating = ref(false);
const editModel = reactive({
  id: "",
  name: "",
  appId: "",
  appSecret: "",
  description: "",
});

function openEditModal(row: any) {
  editModel.id = row.id;
  editModel.name = row.name;
  editModel.appId = row.appId;
  editModel.appSecret = row.appSecret;
  editModel.description = row.description || "";
  showEditModal.value = true;
}

async function handleUpdate() {
  updating.value = true;
  try {
    await $fetch(`/api/admin/wechat-miniprograms/${editModel.id}`, {
      method: "PUT",
      body: editModel,
    });
    toast.add({ title: "Success", description: "Config updated" });
    showEditModal.value = false;
    refresh();
  } catch (e: any) {
    toast.add({ title: "Error", description: e.message || "Failed to update", color: 'error' });
  } finally {
    updating.value = false;
  }
}

// Delete
const showDeleteModal = ref(false);
const deleting = ref(false);
const configToDelete = ref<any>(null);

function confirmDelete(row: any) {
  configToDelete.value = row;
  showDeleteModal.value = true;
}

async function handleDelete() {
  if (!configToDelete.value) return;
  
  deleting.value = true;
  try {
    await $fetch(`/api/admin/wechat-miniprograms/${configToDelete.value.id}`, {
      method: "DELETE",
    });
    toast.add({ title: "Success", description: "Config deleted" });
    refresh();
    showDeleteModal.value = false;
  } catch (e: any) {
    toast.add({ title: "Error", description: e.message || "Failed to delete", color: 'error' });
  } finally {
    deleting.value = false;
    configToDelete.value = null;
  }
}
</script>
