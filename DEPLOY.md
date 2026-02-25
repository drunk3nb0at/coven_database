# COVENS 部署指南 — 一步步来

## 你现在有什么

- ✅ GitHub repo: `cyber-hbliu/coven_database`
- ✅ Vercel: 已连接 GitHub，自动部署
- ✅ Supabase: `coven_sibyl` 数据库，状态 Healthy

## 需要做的 4 件事

---

### 第 1 步：在本地 clone 你的项目

```bash
cd ~/Desktop   # 或你喜欢的目录
git clone https://github.com/cyber-hbliu/coven_database.git
cd coven_database
```

---

### 第 2 步：安装 Supabase 依赖

```bash
npm install @supabase/supabase-js
```

---

### 第 3 步：替换/添加文件

把这个压缩包里的文件放到对应位置：

```
coven_database/           ← 你的项目根目录
├── app/
│   ├── globals.css       ← 替换（新的全局样式）
│   ├── layout.tsx        ← 替换（新的 metadata）
│   └── page.tsx          ← 替换（核心页面，最大的文件）
├── lib/
│   └── supabase.ts       ← 新建（Supabase 客户端）
├── scripts/
│   └── schema.sql        ← 参考用，不需要放进项目
└── .env.local            ← 新建（环境变量，不会上传 GitHub）
```

**创建 `.env.local` 文件**（在项目根目录）：

```
NEXT_PUBLIC_SUPABASE_URL=https://ncwxksnhwvwsdiorchzc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=在这里填你的anon-key
```

**找 anon key 的方法：**
1. 打开 https://supabase.com/dashboard
2. 选择 `coven_sibyl` 项目
3. 左侧菜单 → Settings → API
4. 找到 `anon` `public` 那一行，复制那个长字符串
   （注意：不是你给我的 `sb_publishable_` 那个，那个是 Supabase 新版的 publishable key）
5. 如果你在 API Settings 页面看到的是 `anon key`，就用那个

---

### 第 4 步：在 Supabase 运行数据库 SQL

1. 打开 https://supabase.com/dashboard
2. 选择 `coven_sibyl` 项目
3. 左侧菜单 → SQL Editor
4. 点击 "New query"
5. 把 `scripts/schema.sql` 的内容全部粘贴进去
6. 点击 "Run"（或按 Cmd+Enter）
7. 应该看到 "Success" —— 这会创建表 + 插入所有示例数据

验证：左侧菜单 → Table Editor → 你应该看到 `domains`（8行）和 `resources`（~30行）

---

### 第 5 步：本地测试

```bash
npm run dev
```

打开 http://localhost:3000 —— 应该能看到完整的 COVENS 界面。

---

### 第 6 步：推送到 GitHub → Vercel 自动部署

```bash
git add .
git commit -m "COVENS v1 — 阅读即抵抗"
git push
```

**重要：** 你还需要在 Vercel 设置环境变量！

1. 打开 https://vercel.com
2. 选择 `coven-database` 项目
3. Settings → Environment Variables
4. 添加两个变量：
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://ncwxksnhwvwsdiorchzc.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 你的 anon key
5. 点 Save
6. 回到 Deployments → 点最新的部署 → Redeploy

部署完成后，访问 https://coven-database.vercel.app 就能看到上线的 COVENS。

---

## 关于 `@/lib/supabase` 路径

如果运行时报错说找不到 `@/lib/supabase`，检查你的 `tsconfig.json` 里是否有：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

`create-next-app` 默认会加这个配置。如果没有，加上就好。

---

## 后续可以做的事

- 通过 Supabase Table Editor 直接添加新资源（像 Excel 一样）
- 用 Python 批量导入资源（你熟悉的方式）
- 添加更多议题域内容
- 开放 Sibyl 投稿功能
