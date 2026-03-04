# 管理界面实现计划

本计划旨在为 User, Session, Account, WechatMiniprogram 四个表添加增删查改（CRUD）的管理界面。

## 1. 后端 API 开发

我们需要为每个模型创建 CRUD 接口。

### 1.1 User 管理 API
- `GET /api/admin/users`: 分页获取用户列表
- `POST /api/admin/users`: 创建用户
- `PUT /api/admin/users/:id`: 更新用户信息
- `DELETE /api/admin/users/:id`: 删除用户

### 1.2 Session 管理 API
- `GET /api/admin/sessions`: 分页获取会话列表
- `DELETE /api/admin/sessions/:id`: 删除会话（强制下线）

### 1.3 Account 管理 API
- `GET /api/admin/accounts`: 分页获取账号关联列表
- `DELETE /api/admin/accounts/:id`: 解绑账号

### 1.4 WechatMiniprogram 管理 API
- `GET /api/admin/wechat-miniprograms`: 获取小程序配置列表
- `POST /api/admin/wechat-miniprograms`: 添加小程序配置
- `PUT /api/admin/wechat-miniprograms/:id`: 更新小程序配置
- `DELETE /api/admin/wechat-miniprograms/:id`: 删除小程序配置

## 2. 前端页面开发

使用 Naive UI 构建管理界面。

### 2.1 布局
- 创建 `layouts/admin.vue`: 包含侧边栏导航（Users, Sessions, Accounts, WeChat MiniPrograms）。

### 2.2 页面
- `pages/admin/users/index.vue`: 用户列表，包含搜索、分页、编辑/删除按钮。
- `pages/admin/sessions/index.vue`: 会话列表，包含删除按钮。
- `pages/admin/accounts/index.vue`: 账号列表，包含删除按钮。
- `pages/admin/wechat-miniprograms/index.vue`: 小程序配置列表，包含添加/编辑/删除功能。

## 3. 权限控制 (管理员验证)

**方案**: 在 `server/middleware` 中添加管理员检查。
1.  **定义管理员列表**: 在环境变量 `ADMIN_EMAILS` 或代码常量中定义允许访问的邮箱列表。
2.  **中间件实现**:
    - 拦截 `/api/admin/**` 请求。
    - 获取当前 Session。
    - 检查 `session.user.email` 是否在管理员列表中。
    - 如果不在，返回 403 Forbidden。

## 4. 具体步骤

1.  **实现权限中间件**: `server/middleware/admin-auth.ts`。
2.  **创建 API 目录结构**: `server/api/admin/...`。
3.  **实现 User CRUD**: 编写 API 和前端页面。
4.  **实现 Session List/Delete**: 编写 API 和前端页面。
5.  **实现 Account List/Delete**: 编写 API 和前端页面。
6.  **实现 WechatMiniprogram CRUD**: 编写 API 和前端页面。
7.  **添加导航**: 在 `layouts/admin.vue` 中添加菜单。

## 5. 依赖
- 确保已安装 `naive-ui` (项目中似乎已有，需确认)。
- 确保 `unocss` 配置正常。
