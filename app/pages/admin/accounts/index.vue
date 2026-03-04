<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Account Management</h1>
      <UButton color="primary" @click="showCreateModal = true">
        Link Account
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
        :data="accounts"
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
        <UPagination v-model="page" :page-count="pageSize" :total="total" />
      </div>
    </UCard>

    <!-- Create Modal -->
    <UModal v-model:open="showCreateModal" title="Link Account">
      <template #body>
        <UForm :validate="validateCreate" :state="createModel" class="space-y-4" @submit="handleCreate">
          <UFormField label="User ID" name="userId">
            <UInput v-model="createModel.userId" placeholder="User ID" />
          </UFormField>
          <UFormField label="Provider ID" name="providerId">
            <UInput v-model="createModel.providerId" placeholder="Provider ID (e.g. google, github)" />
          </UFormField>
          <UFormField label="Account ID" name="accountId">
            <UInput v-model="createModel.accountId" placeholder="Account ID from Provider" />
          </UFormField>
          
          <div class="flex justify-end gap-2 mt-4">
            <UButton color="neutral" variant="ghost" @click="showCreateModal = false">Cancel</UButton>
            <UButton type="submit" color="primary" :loading="creating">Link</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Edit Modal -->
    <UModal v-model:open="showEditModal" title="Edit Account">
      <template #body>
        <UForm :validate="validateEdit" :state="editModel" class="space-y-4" @submit="handleUpdate">
          <UFormField label="Provider ID" name="providerId">
            <UInput v-model="editModel.providerId" placeholder="Provider ID" />
          </UFormField>
          <UFormField label="Account ID" name="accountId">
            <UInput v-model="editModel.accountId" placeholder="Account ID" />
          </UFormField>
          <UFormField label="Access Token" name="accessToken">
            <UTextarea v-model="editModel.accessToken" placeholder="Access Token" />
          </UFormField>
          <UFormField label="Refresh Token" name="refreshToken">
            <UTextarea v-model="editModel.refreshToken" placeholder="Refresh Token" />
          </UFormField>
          
          <div class="flex justify-end gap-2 mt-4">
            <UButton color="neutral" variant="ghost" @click="showEditModal = false">Cancel</UButton>
            <UButton type="submit" color="primary" :loading="updating">Update</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Unlink Confirmation Modal -->
    <UModal v-model:open="showDeleteModal" title="Confirm Unlink">
      <template #body>
        <p>Are you sure you want to unlink this account?</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
           <UButton color="neutral" variant="ghost" @click="showDeleteModal = false">Cancel</UButton>
           <UButton color="error" @click="handleDelete" :loading="deleting">Unlink</UButton>
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

const { data, pending, refresh } = await useFetch("/api/admin/accounts", {
  query: {
    page,
    pageSize,
    userId: searchUserId,
  },
  watch: [page, pageSize],
});

const accounts = computed(() => data.value?.accounts || []);
const total = computed(() => data.value?.total || 0);

const columns: TableColumn<any>[] = [
  { accessorKey: "id", header: "ID", meta: { class: { td: "truncate max-w-[100px]" } } },
  { accessorKey: "providerId", header: "Provider" },
  { accessorKey: "accountId", header: "Account ID" },
  { accessorKey: "user.name", header: "User Name" },
  { accessorKey: "user.email", header: "User Email" },
  { accessorKey: "createdAt", header: "Created At" },
  { id: "actions", header: "Actions" },
];

// Create
const showCreateModal = ref(false);
const creating = ref(false);
const createModel = reactive({
  userId: "",
  providerId: "",
  accountId: "",
});

const validateCreate = (state: any) => {
  const errors = [];
  if (!state.userId) errors.push({ path: 'userId', message: 'Required' });
  if (!state.providerId) errors.push({ path: 'providerId', message: 'Required' });
  if (!state.accountId) errors.push({ path: 'accountId', message: 'Required' });
  return errors;
};

async function handleCreate() {
  creating.value = true;
  try {
    await $fetch("/api/admin/accounts", {
      method: "POST",
      body: createModel,
    });
    toast.add({ title: "Success", description: "Account linked" });
    showCreateModal.value = false;
    refresh();
    // Reset
    createModel.userId = "";
    createModel.providerId = "";
    createModel.accountId = "";
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
  providerId: "",
  accountId: "",
  accessToken: "",
  refreshToken: "",
});

const validateEdit = (state: any) => {
  const errors = [];
  if (!state.providerId) errors.push({ path: 'providerId', message: 'Required' });
  if (!state.accountId) errors.push({ path: 'accountId', message: 'Required' });
  return errors;
};

function openEditModal(row: any) {
  editModel.id = row.id;
  editModel.providerId = row.providerId;
  editModel.accountId = row.accountId;
  editModel.accessToken = row.accessToken || "";
  editModel.refreshToken = row.refreshToken || "";
  showEditModal.value = true;
}

async function handleUpdate() {
  updating.value = true;
  try {
    await $fetch(`/api/admin/accounts/${editModel.id}`, {
      method: "PUT",
      body: editModel,
    });
    toast.add({ title: "Success", description: "Account updated" });
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
const accountToDelete = ref<any>(null);

function confirmDelete(row: any) {
  accountToDelete.value = row;
  showDeleteModal.value = true;
}

async function handleDelete() {
  if (!accountToDelete.value) return;
  
  deleting.value = true;
  try {
    await $fetch(`/api/admin/accounts/${accountToDelete.value.id}`, {
      method: "DELETE",
    });
    toast.add({ title: "Success", description: "Account unlinked" });
    refresh();
    showDeleteModal.value = false;
  } catch (e: any) {
    toast.add({ title: "Error", description: e.message || "Failed to unlink account", color: 'error' });
  } finally {
    deleting.value = false;
    accountToDelete.value = null;
  }
}
</script>
