<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Session Management</h1>
      <UButton color="primary" @click="showCreateModal = true">
        Create Session
      </UButton>
    </div>

    <div class="flex gap-2">
      <UInput
        v-model="searchUserId"
        placeholder="Filter by User ID"
        icon="i-heroicons-magnifying-glass"
        @keyup.enter="refresh"
        class="w-full max-w-sm"
      />
      <UButton @click="refresh()">Filter</UButton>
    </div>

    <UCard>
      <UTable
        :data="sessions"
        :columns="columns"
        :loading="pending"
      >
        <template #createdAt-cell="{ row }">
          {{ new Date(row.original.createdAt).toLocaleString() }}
        </template>
        <template #expiresAt-cell="{ row }">
          {{ new Date(row.original.expiresAt).toLocaleString() }}
        </template>
        
        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton size="xs" color="primary" variant="ghost" icon="i-heroicons-pencil-square" @click="openEditModal(row.original)" />
            <UButton size="xs" color="error" variant="ghost" icon="i-heroicons-trash" @click="confirmDelete(row.original)" />
          </div>
        </template>
      </UTable>
      
      <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
        <UPagination v-model="page" :page-count="pageSize" :total="total" />
      </div>
    </UCard>

    <!-- Create Modal -->
    <UModal v-model:open="showCreateModal" title="Create Session">
      <template #body>
        <UForm :validate="validateCreate" :state="createModel" class="space-y-4" @submit="handleCreate">
          <UFormField label="User ID" name="userId">
            <UInput v-model="createModel.userId" placeholder="User ID" />
          </UFormField>
          <UFormField label="Expires At" name="expiresAt">
            <UInput v-model="createModel.expiresAt" type="datetime-local" />
          </UFormField>
          <UFormField label="IP Address" name="ipAddress">
            <UInput v-model="createModel.ipAddress" placeholder="IP Address" />
          </UFormField>
          <UFormField label="User Agent" name="userAgent">
            <UInput v-model="createModel.userAgent" placeholder="User Agent" />
          </UFormField>
          
          <div class="flex justify-end gap-2 mt-4">
            <UButton color="neutral" variant="ghost" @click="showCreateModal = false">Cancel</UButton>
            <UButton type="submit" color="primary" :loading="creating">Create</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Edit Modal -->
    <UModal v-model:open="showEditModal" title="Edit Session">
      <template #body>
        <UForm :validate="validateEdit" :state="editModel" class="space-y-4" @submit="handleUpdate">
          <UFormField label="Expires At" name="expiresAt">
            <UInput v-model="editModel.expiresAt" type="datetime-local" />
          </UFormField>
          <UFormField label="IP Address" name="ipAddress">
            <UInput v-model="editModel.ipAddress" placeholder="IP Address" />
          </UFormField>
          <UFormField label="User Agent" name="userAgent">
            <UInput v-model="editModel.userAgent" placeholder="User Agent" />
          </UFormField>
          
          <div class="flex justify-end gap-2 mt-4">
            <UButton color="neutral" variant="ghost" @click="showEditModal = false">Cancel</UButton>
            <UButton type="submit" color="primary" :loading="updating">Update</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Revoke Confirmation Modal -->
    <UModal v-model:open="showDeleteModal" title="Confirm Revoke">
      <template #body>
        <p>Are you sure you want to revoke this session?</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
           <UButton color="neutral" variant="ghost" @click="showDeleteModal = false">Cancel</UButton>
           <UButton color="error" @click="handleDelete" :loading="deleting">Revoke</UButton>
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
});

const toast = useToast();

// Data Fetching
const page = ref(1);
const pageSize = ref(10);
const searchUserId = ref("");

const { data, pending, refresh } = await useFetch("/api/admin/sessions", {
  query: {
    page,
    pageSize,
    userId: searchUserId,
  },
  watch: [page, pageSize],
});

const sessions = computed(() => data.value?.sessions || []);
const total = computed(() => data.value?.total || 0);

const columns: TableColumn<any>[] = [
  { accessorKey: "id", header: "ID", meta: { class: { td: "truncate max-w-[100px]" } } },
  { accessorKey: "user.name", header: "User Name" },
  { accessorKey: "user.email", header: "User Email" },
  { accessorKey: "ipAddress", header: "IP Address" },
  { accessorKey: "userAgent", header: "User Agent", meta: { class: { td: "truncate max-w-[150px]" } } },
  { accessorKey: "createdAt", header: "Created At" },
  { accessorKey: "expiresAt", header: "Expires At" },
  { id: "actions", header: "Actions" },
];

// Create
const showCreateModal = ref(false);
const creating = ref(false);
const createModel = reactive({
  userId: "",
  expiresAt: "",
  ipAddress: "",
  userAgent: "",
});

const validateCreate = (state: any) => {
  const errors = [];
  if (!state.userId) errors.push({ path: 'userId', message: 'Required' });
  if (!state.expiresAt) errors.push({ path: 'expiresAt', message: 'Required' });
  return errors;
};

async function handleCreate() {
  creating.value = true;
  try {
    await $fetch("/api/admin/sessions", {
      method: "POST",
      body: createModel,
    });
    toast.add({ title: "Success", description: "Session created" });
    showCreateModal.value = false;
    refresh();
    // Reset
    createModel.userId = "";
    createModel.expiresAt = "";
    createModel.ipAddress = "";
    createModel.userAgent = "";
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
  expiresAt: "",
  ipAddress: "",
  userAgent: "",
});

const validateEdit = (state: any) => {
  const errors = [];
  if (!state.expiresAt) errors.push({ path: 'expiresAt', message: 'Required' });
  return errors;
};

function formatDateForInput(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
}

function openEditModal(row: any) {
  editModel.id = row.id;
  editModel.expiresAt = formatDateForInput(row.expiresAt);
  editModel.ipAddress = row.ipAddress || "";
  editModel.userAgent = row.userAgent || "";
  showEditModal.value = true;
}

async function handleUpdate() {
  updating.value = true;
  try {
    await $fetch(`/api/admin/sessions/${editModel.id}`, {
      method: "PUT",
      body: editModel,
    });
    toast.add({ title: "Success", description: "Session updated" });
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
const sessionToDelete = ref<any>(null);

function confirmDelete(row: any) {
  sessionToDelete.value = row;
  showDeleteModal.value = true;
}

async function handleDelete() {
  if (!sessionToDelete.value) return;
  
  deleting.value = true;
  try {
    await $fetch(`/api/admin/sessions/${sessionToDelete.value.id}`, {
      method: "DELETE",
    });
    toast.add({ title: "Success", description: "Session revoked" });
    refresh();
    showDeleteModal.value = false;
  } catch (e: any) {
    toast.add({ title: "Error", description: e.message || "Failed to revoke session", color: 'error' });
  } finally {
    deleting.value = false;
    sessionToDelete.value = null;
  }
}
</script>
