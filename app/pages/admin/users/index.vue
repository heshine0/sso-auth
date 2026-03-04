<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">User Management</h1>
      <UButton color="primary" @click="showCreateModal = true">
        Create User
      </UButton>
    </div>

    <div class="flex gap-2">
      <UInput
        v-model.trim="searchQuery"
        placeholder="Search by name, email or phone"
        icon="i-heroicons-magnifying-glass"
        @keyup.enter="handleSearch"
        class="w-full max-w-sm"
      />
      <UButton @click="handleSearch">Search</UButton>
    </div>

    <UCard>
      <UTable
        :data="users"
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
    <UModal v-model:open="showCreateModal" title="Create User">
      <template #body>
        <UForm :validate="validateCreate" :state="createModel" class="space-y-4" @submit="handleCreate">
          <UFormField label="Name" name="name">
            <UInput v-model="createModel.name" placeholder="Name" />
          </UFormField>
          <UFormField label="Email" name="email">
            <UInput v-model="createModel.email" placeholder="Email" />
          </UFormField>
          <UFormField label="Password" name="password">
            <UInput
              v-model="createModel.password"
              type="password"
              placeholder="Password"
            />
          </UFormField>
          <UFormField label="Phone" name="phoneNumber">
            <UInput v-model="createModel.phoneNumber" placeholder="Phone Number" />
          </UFormField>
          
          <div class="flex justify-end gap-2 mt-4">
            <UButton color="warning" variant="ghost" @click="showCreateModal = false">Cancel</UButton>
            <UButton type="submit" color="primary" :loading="creating">Create</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Edit Modal -->
    <UModal v-model:open="showEditModal" title="Edit User">
      <template #body>
        <UForm :validate="validateEdit" :state="editModel" class="space-y-4" @submit="handleUpdate">
          <UFormField label="Name" name="name">
            <UInput v-model="editModel.name" placeholder="Name" />
          </UFormField>
          <UFormField label="Email" name="email">
            <UInput v-model="editModel.email" placeholder="Email" />
          </UFormField>
          <UFormField label="Phone" name="phoneNumber">
            <UInput v-model="editModel.phoneNumber" placeholder="Phone Number" />
          </UFormField>
          <div class="flex justify-between items-center">
             <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Email Verified</label>
             <USwitch v-model="editModel.emailVerified" />
          </div>
           <div class="flex justify-between items-center">
             <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Phone Verified</label>
             <USwitch v-model="editModel.phoneNumberVerified" />
          </div>

          <div class="flex justify-end gap-2 mt-4">
            <UButton color="warning" variant="ghost" @click="showEditModal = false">Cancel</UButton>
            <UButton type="submit" color="primary" :loading="updating">Update</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="showDeleteModal" title="Confirm Delete">
      <template #body>
        <p>Are you sure you want to delete user {{ userToDelete?.name }}?</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
           <UButton color="warning" variant="ghost" @click="showDeleteModal = false">Cancel</UButton>
           <UButton color="error" @click="handleDelete" :loading="deleting">Delete</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { ref, reactive, computed } from "vue";

definePageMeta({
  layout: "admin",
});

const toast = useToast();

// Data Fetching
const page = ref(1);
const pageSize = ref(10);
const searchQuery = ref("");

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  createdAt: string | Date;
  [key: string]: any;
}

// Assuming the API returns { users: [], total: number }
const { data, pending, refresh, error } = await useFetch<{ users: User[], total: number }>("/api/admin/users", {
  query: {
    page,
    pageSize,
    search: searchQuery,
  },
  watch: [page, pageSize],
});

if (error.value?.statusCode === 401) {
  await navigateTo('/login');
} else if (error.value) {
  toast.add({ 
    title: 'Error', 
    description: error.value.statusMessage || 'Failed to load users', 
    color: 'error' 
  });
}

function handleSearch() {
  page.value = 1;
  refresh();
}

const users = computed(() => data.value?.users || []);
const total = computed(() => data.value?.total || 0);

const columns: TableColumn<User>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phoneNumber", header: "Phone" },
  { accessorKey: "createdAt", header: "Created At" },
  { id: "actions", header: "Actions" },
];

// Create
const showCreateModal = ref(false);
const creating = ref(false);
const createModel = reactive({
  name: "",
  email: "",
  password: "",
  phoneNumber: "",
});

const validateCreate = (state: any) => {
  const errors = [];
  if (!state.name) errors.push({ path: 'name', message: 'Required' });
  if (!state.email) errors.push({ path: 'email', message: 'Required' });
  if (!state.password) errors.push({ path: 'password', message: 'Required' });
  return errors;
};

async function handleCreate() {
  creating.value = true;
  try {
    await $fetch("/api/admin/users", {
      method: "POST",
      body: createModel,
    });
    toast.add({ title: "Success", description: "User created" });
    showCreateModal.value = false;
    refresh();
    // Reset form
    createModel.name = "";
    createModel.email = "";
    createModel.password = "";
    createModel.phoneNumber = "";
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
  email: "",
  phoneNumber: "",
  emailVerified: false,
  phoneNumberVerified: false,
});

const validateEdit = (state: any) => {
  const errors = [];
  if (!state.name) errors.push({ path: 'name', message: 'Required' });
  if (!state.email) errors.push({ path: 'email', message: 'Required' });
  return errors;
};

function openEditModal(row: any) {
  editModel.id = row.id;
  editModel.name = row.name;
  editModel.email = row.email;
  editModel.phoneNumber = row.phoneNumber || "";
  editModel.emailVerified = row.emailVerified;
  editModel.phoneNumberVerified = row.phoneNumberVerified || false;
  showEditModal.value = true;
}

async function handleUpdate() {
  updating.value = true;
  try {
    await $fetch(`/api/admin/users/${editModel.id}`, {
      method: "PUT",
      body: editModel,
    });
    toast.add({ title: "Success", description: "User updated" });
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
const userToDelete = ref<any>(null);

function confirmDelete(row: any) {
  userToDelete.value = row;
  showDeleteModal.value = true;
}

async function handleDelete() {
  if (!userToDelete.value) return;
  
  deleting.value = true;
  try {
    await $fetch(`/api/admin/users/${userToDelete.value.id}`, {
      method: "DELETE",
    });
    toast.add({ title: "Success", description: "User deleted" });
    refresh();
    showDeleteModal.value = false;
  } catch (e: any) {
    toast.add({ title: "Error", description: e.message || "Failed to delete", color: 'error' });
  } finally {
    deleting.value = false;
    userToDelete.value = null;
  }
}
</script>
