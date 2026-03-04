# Nuxt UI 迁移计划

本计划旨在将现有的 Naive UI 组件库替换为 Nuxt UI。

## 1. 准备工作

- [ ] 备份现有代码（确保所有更改都在 Git 版本控制下）。
- [ ] 确认所有 Naive UI 的依赖项。

## 2. 移除 Naive UI

- [ ] 从 `package.json` 中移除 `naive-ui`, `nuxtjs-naive-ui`, `@vicons/ionicons5`。
- [ ] 从 `nuxt.config.ts` 中移除 `nuxtjs-naive-ui` 模块配置。
- [ ] 移除 `app.vue` 或 `layouts` 中可能存在的 Naive UI 全局配置组件（如 `n-config-provider`, `n-message-provider` 等）。

## 3. 安装与配置 Nuxt UI

- [ ] 安装 `@nuxt/ui`：`bun add -d @nuxt/ui`。
- [ ] 在 `nuxt.config.ts` 中添加 `@nuxt/ui` 模块。
- [ ] 运行 `bun install` 确保依赖安装正确。

## 4. 逐步替换组件

### 4.1 布局文件 (Layouts)
- [ ] **`app/layouts/admin.vue`**:
    - 将 `n-layout`, `n-layout-sider`, `n-layout-header`, `n-layout-content` 替换为 Nuxt UI 的布局组件（如 `div` + Tailwind classes, 或者 `UContainer`）。
    - 将 `n-menu` 替换为 `UVerticalNavigation` 或自定义侧边栏组件。
    - 将 `n-icon` 替换为 `UIcon` (Nuxt UI 内置图标支持)。

### 4.2 页面文件 (Pages)

#### 4.2.1 登录页
- [ ] **`app/pages/login.vue`**:
    - 替换 `n-tabs`, `n-tab-pane` 为 `UTabs`。
    - 替换 `n-form`, `n-form-item`, `n-input` 为 `UForm`, `UFormField`, `UInput`。
    - 替换 `n-button` 为 `UButton`。
    - 替换 `useMessage` 为 Nuxt UI 的 `useToast`。

#### 4.2.2 管理后台首页
- [ ] **`app/pages/admin/index.vue`**:
    - 替换 `n-grid`, `n-gi` 为 Tailwind Grid 布局。
    - 替换 `n-card` 为 `UCard`。
    - 替换 `n-statistic` (如果有) 为自定义组件或 Tailwind 样式。

#### 4.2.3 用户管理
- [ ] **`app/pages/admin/users/index.vue`**:
    - 替换 `n-data-table` 为 `UTable`。注意列定义的差异。
    - 替换 `n-modal` 为 `UModal`。
    - 替换表单组件 (`n-form`, `n-input`, `n-switch` 等) 为 Nuxt UI 对应组件。
    - 替换 `useMessage`, `useDialog` 为 `useToast` 和自定义确认弹窗。

#### 4.2.4 其他管理页面
- [ ] **`app/pages/admin/sessions/index.vue`**: 替换表格和相关组件。
- [ ] **`app/pages/admin/accounts/index.vue`**: 替换表格和相关组件。
- [ ] **`app/pages/admin/wechat-miniprograms/index.vue`**: 替换表格和相关组件。

### 4.3 全局组件与工具
- [ ] 检查并替换任何使用 `useMessage`, `useDialog`, `useNotification`, `useLoadingBar` 的地方。
    - `useMessage` -> `useToast`
    - `useDialog` -> `UModal` (手动实现确认框) 或 `window.confirm` (简单场景)
    - `useLoadingBar` -> Nuxt 内置 `useLoadingIndicator`

## 5. 验证与测试

- [ ] 运行开发服务器 `bun dev`。
- [ ] 检查所有页面是否正常渲染，无样式错乱。
- [ ] 测试所有交互功能（登录、表单提交、弹窗、表格分页等）。
- [ ] 修复可能遗漏的样式问题。

## 6. 清理

- [ ] 移除未使用的 Naive UI 相关代码和样式。
- [ ] 提交更改。
