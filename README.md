<div align="center">

# 🐾 PetConnect

**连接每一颗爱心，为每一只宠物找到温暖的家**

[![React](https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CDN-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5a0fc8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[简介](#简介) · [功能特性](#-核心功能) · [技术栈](#-技术栈) · [快速开始](#-快速开始) · [创新路线图](#-创新功能路线图) · [项目结构](#-项目结构) · [开发指南](#️-开发指南) · [部署](#-部署) · [常见问题](#-常见问题)

</div>

---

## 简介

PetConnect 是一款基于 Web 的智能宠物平台，通过 AI 赋能打通宠物救助、领养、健康管理的完整链路。平台融合了失踪宠物应急广播、AI 领养匹配、可信领养流程、协同救助任务、健康日记分析等创新功能，为送养人、领养人、救助志愿者提供一站式数字化解决方案。

### 🌟 项目亮点

- 🧠 **AI 驱动**：智能匹配、健康分析、险种推荐与自动回复，提升用户体验
- 💼 **金融闭环**：积分抵扣保费、在线理赔、保险推荐增强用户粘性
- 🔒 **安全可信**：Row Level Security + 实名认证 + 多阶段里程碑管理
- 🚀 **渐进式 PWA**：支持离线缓存、桌面安装，弱网可用
- 📍 **位置智能**：基于经纬度的半径级广播，快速扩散求助信息
- 🎨 **设计优雅**：Material Design 3 + 亮/暗主题，移动端优先
- 🔧 **易于部署**：零配置部署到 Vercel/Netlify，环境变量即插即用

---

## ✨ 核心功能

### 🏠 领养主链路
| 功能模块 | 描述 |
| --- | --- |
| 🔍 **浏览 & 筛选** | 按宠物类型（狗 / 猫 / 兔 / 鸟等）、所在城市多维度筛选，支持发布/认领切换 |
| ❤️ **收藏管理** | 一键收藏心仪宠物，随时查看收藏列表 |
| 📋 **领养申请** | 填写姓名、年龄、职业、住房情况、养宠经验等，提交正式申请；防重提交保护 |
| 🧾 **求领养发布** | 发布求领养需求（类型、年龄偏好、城市、联系方式），公开匹配待领养宠物 |
| 🤖 **AI 匹配评分** | 基于 AI 模型分析领养申请与宠物需求的匹配度，自动生成评分与建议 |
| 🎯 **领养里程碑** | 可信领养流程追踪：申请提交 → 初步审核 → 家访验证 → 试养期 → 正式通过，防止纠纷 |
| 💬 **私信沟通** | 与送养人实时私信，支持消息记录持久化与 AI 智能回复 |
| 📆 **领养进度追踪** | 查看所有领养申请的当前状态与历史记录 |

### 🏠 我的宠物
| 功能模块 | 描述 |
| --- | --- |
| 📝 **宠物成长日志** | 领养人可发布图文日志，时间轴形式展示宠物成长历程，支持编辑 / 删除 |
| 🗓 **领养回访任务** | 自动生成 7 天 / 30 天回访提醒，支持任务筛选（待办 / 逾期 / 已完成）及反馈记录 |
| 💊 **AI 健康日记** | 记录宠物每日健康状态，AI 自动分析健康趋势、识别异常并提供喂养建议 |

### 🆘 救助协作
| 功能模块 | 描述 |
| --- | --- |
| 📢 **失踪宠物广播** | 发布失踪宠物信息（照片、特征、最后地点），基于经纬度半径广播求助 |
| 🔎 **失踪宠物搜索** | 按城市、宠物类型筛选失踪信息，一键拨打联系电话协助寻找 |
| 🚑 **救助任务板** | 发布救助任务（流浪救助、医疗转运、临时寄养），志愿者认领后协同完成 |
| 📍 **任务状态管理** | 支持任务筛选（待认领 / 进行中 / 已完成），完成后提交反馈与图片证明 |

### 🔐 安全与信任
| 功能模块 | 描述 |
| --- | --- |
| 🚨 **举报 & 屏蔽** | 举报违规内容（宠物 / 用户 / 消息），屏蔽不良用户 |
| 🆔 **实名认证** | 提交真实身份信息，提升平台可信度 |
| 🗑️ **回收站** | 已删除内容可在 30 天内恢复，防止误操作 |

### 👤 个人中心
| 功能模块 | 描述 |
| --- | --- |
| 👤 **个人资料** | 完善头像、昵称、联系方式等个人信息 |
| 🌙 **主题设置** | 支持明 / 暗主题切换，跟随系统 |
| 📣 **意见反馈** | 一键提交应用体验反馈 |
| 🔔 **通知设置** | 自定义消息推送偏好 |
| 🔒 **隐私设置** | 数据可见性与账号安全管理 |

### 🎁 积分体系
| 功能模块 | 描述 |
| --- | --- |
| 🧮 **积分账户** | 查看积分余额与等级进度，关联个人成长记录 |
| 🛍️ **积分兑换** | 积分商城兑换权益（领养优先券、健康报告券、公益抽奖等） |
| 🤝 **积分公益捐赠** | 积分转化为公益支持，记录捐赠流向 |
| 📜 **积分流水** | 兑换/捐赠/奖励的明细追踪，支持审计 |

### 💼 宠物险与健康保障
| 功能模块 | 描述 |
| --- | --- |
| 🎯 **险种推荐** | 根据宠物年龄与健康日记、就诊记录推送秒杀险种 |
| 📱 **在线理赔** | 上传病历照片、凭证，支持即时审核与状态追踪 |
| 🪙 **积分抵扣保费** | 使用积分直接抵扣险种价格形成金融闭环 |
| 📊 **日记联动风控** | 健康日记数据用于理赔风控与未来趋势分析 |
| 📈 **健康趋势预测** | AI 分析长期日记，精准推荐适配险种 |

---

## 🛠 技术栈

| 层级 | 技术选型 |
| --- | --- |
| **前端框架** | React 19.2.4 + TypeScript 5.8 |
| **构建工具** | Vite 6.2 |
| **路由** | React Router 7.13（HashRouter） |
| **样式** | Tailwind CSS（CDN）+ Material Icons Round |
| **后端 / 数据库** | Supabase（Auth + PostgreSQL + Storage + RLS） |
| **AI 能力** | 多模型支持：DeepSeek / 豆包 / Gemini，用于智能回复、匹配评分、健康分析 |
| **PWA** | vite-plugin-pwa（离线缓存、桌面安装） |

---

## 🚀 快速开始

### 前置要求

- **Node.js** ≥ 18
- **npm** ≥ 9
- 一个 [Supabase](https://supabase.com) 项目

### 安装步骤

**1. 克隆仓库**

```bash
git clone https://github.com/your-username/petconnect-app.git
cd petconnect-app
```

**2. 安装依赖**

```bash
npm install
```

**3. 配置环境变量**

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`，填入你的配置：

```env
# Supabase 配置（必填）
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI 模型配置（可选，不配置时 AI 功能会显示友好提示）
VITE_LLM_PROVIDER=deepseek  # 或 doubao / gemini

# DeepSeek（推荐，性价比高）
VITE_DEEPSEEK_API_KEY=sk-xxxxxxxxxxxx

# 豆包（字节跳动）
# VITE_DOUBAO_API_KEY=your_doubao_api_key
# VITE_DOUBAO_MODEL_ID=doubao-pro-32k-241215

# Gemini（Google）
# VITE_GEMINI_API_KEY=your_gemini_api_key
```

> 💡 **提示**：未配置 AI 时，平台的非 AI 功能（浏览、申请、消息等）仍可正常使用。  
> 详细说明见 [环境变量](#-环境变量) 章节。

**4. 初始化数据库**

在 [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor 中执行以下方案之一：

**方案 A（推荐）：按阶段执行**

```sql
-- 第一步：创建基础表结构、RLS 策略、触发器
\i supabase/schema.sql

-- 第二步：插入示例数据（需要先有 auth 用户）
\i supabase/seed.sql
```

**方案 B（全量快照）：一键重建**

```sql
-- master.sql 为全量快照（最后更新 2026-02-20）
\i supabase/master.sql
```

然后依次执行以下**增量迁移脚本**（`supabase/migrations/` 目录，建议按顺序执行）：

| 文件 | 说明 | 所属 Phase |
| --- | --- | --- |
| `add_pet_logs.sql` | 宠物成长日志表 + RLS 策略 | 基础功能 |
| `add_pet_logs_update_policy.sql` | 日志编辑权限 | 基础功能 |
| `add_follow_up_tasks.sql` | 领养回访任务表 + RLS 策略 | 基础功能 |
| `add_follow_up_template_key.sql` | 回访任务模板键（防重复自动生成） | 基础功能 |
| `add_reports_blocks.sql` | 举报 & 屏蔽表 + RLS 策略 | 基础功能 |
| `add_pets_user_publish.sql` | 宠物表用户发布功能增强 | 基础功能 |
| `add_more_pet_categories_and_seed_data.sql` | 扩展宠物类别与种子数据 | 基础功能 |
| `add_pet_filters_indexes.sql` | 筛选性能优化索引 | 基础功能 |
| `upgrade_messages_model.sql` | 消息表功能增强（AI 能力） | 基础功能 |
| `upgrade_verifications_privacy.sql` | 认证表隐私字段升级 | 基础功能 |
| `20240901_add_agent_type_to_conversations.sql` | 会话 Agent 类型字段 | 基础功能 |
| `20240902_add_deleted_at_to_chat_messages.sql` | 消息软删除字段 | 基础功能 |
| `add_lost_pet_alerts.sql` | 失踪宠物广播表 + 位置索引 | **Phase 1** |
| `add_adoption_match_scores.sql` | AI 领养匹配评分表 | **Phase 2** |
| `add_adoption_milestones.sql` | 领养里程碑流程管理 | **Phase 3** |
| `add_rescue_tasks.sql` | 救助协作任务表 + RLS 策略 | **Phase 4** |
| `add_pet_health_diary.sql` | 健康日记 + AI 洞察表 | **Phase 5** |
| `add_health_diary_storage.sql` | 健康日记图片 Storage 配置 | **Phase 5** |
| `2026-02-21-add-adopt-requests.sql` | 求领养需求表 | **Phase 7** |
| `2026-02-21-add-structured-location.sql` | 省市区结构化位置字段 | **Phase 7** |
| `2026-02-21-add-points-mall.sql` | 积分账户与兑换流水 | **Phase 7** |
| `2026-02-22-add-award-points.sql` | 积分发放函数 | **Phase 7** |
| `2026-02-23-add-points-donations.sql` | 积分公益捐赠 | **Phase 7** |
| `update_barnaby_image.sql` | 更新示例数据宠物图片（可选） | 数据修正 |

> 💡 **Phase 6（PWA 离线救助包）** 不需要数据库迁移，仅需前端代码更新。  
> 💡 **Phase 7（积分体系）** 已包含积分账户、兑换与捐赠数据结构，推荐执行完整迁移。

> 💡 **提示**：如果是全新项目，建议按上述顺序完整执行所有脚本；如果是从旧版本迁移，只执行缺失的脚本即可。

**5. 配置 Storage Bucket**

1. 进入 Supabase Dashboard → Storage → Buckets
2. 新建名为 `avatars` 的 **Public Bucket**
3. 在 SQL Editor 中执行 `supabase/storage_policies.sql` 配置上传策略

**6. 启动开发服务器**

```bash
npm run dev
# → http://localhost:3000
```

---

## 🔑 环境变量

| 变量名 | 必填 | 说明 | 获取方式 |
| --- | :---: | --- | --- |
| `VITE_SUPABASE_URL` | ✅ | Supabase 项目 URL | Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase 公开密钥 | Dashboard → Settings → API |
| `VITE_LLM_PROVIDER` | ❌ | AI 模型供应商：`deepseek`（默认）/ `doubao` / `gemini` | - |
| `VITE_DEEPSEEK_API_KEY` | deepseek 时 | DeepSeek API 密钥 | [platform.deepseek.com](https://platform.deepseek.com) |
| `VITE_DOUBAO_API_KEY` | doubao 时 | 豆包（字节跳动）API 密钥 | [火山方舟控制台](https://console.volcengine.com/ark) |
| `VITE_DOUBAO_MODEL_ID` | doubao 时 | 豆包模型 endpoint ID（如 `doubao-pro-32k-241215`） | 方舟控制台部署后获取 |
| `VITE_GEMINI_API_KEY` | gemini 时 | Google Gemini API 密钥 | [Google AI Studio](https://aistudio.google.com/apikey) |

> 💡 **AI 功能说明**：
> - 未配置 LLM 相关环境变量时，AI 功能会显示友好的错误提示，不影响非 AI 功能正常使用
> - 建议优先使用 DeepSeek（性价比高、中文理解能力强）

完整示例见 [`.env.local.example`](.env.local.example)。

---

## 🚀 创新功能路线图

PetConnect 采用分阶段交付策略，逐步实现差异化功能。当前已完成 **Phase 1-7**：

| 阶段 | 功能名称 | 状态 | 核心价值 |
|---|---|:---:|---|
| **Phase 1** | 失踪宠物应急广播 | ✅ 已完成 | 基于经纬度的半径级广播，快速扩散求助信息 |
| **Phase 2** | AI 领养匹配评分 | ✅ 已完成 | 自动分析领养申请与宠物需求的匹配度，提高领养成功率 |
| **Phase 3** | 可信领养里程碑 | ✅ 已完成 | 标准化流程（申请→审核→家访→试养→通过），减少纠纷 |
| **Phase 4** | 救助协作任务板 | ✅ 已完成 | 多人协同救助任务（流浪救助、医疗转运、临时寄养） |
| **Phase 5** | AI 健康日记 | ✅ 已完成 | 健康趋势分析、异常预警、智能喂养建议 |
| **Phase 6** | PWA 离线救助包 | ✅ 已完成 | 弱网环境下的应急功能可用性提升 |
| **Phase 7** | 积分体系与兑换 | ✅ 已完成 | 积分账户、兑换商城、公益捐赠与激励体系 |
| **Phase 8** | 宠物险与健康保障中心 | 🚧 进行中 | 险种推荐、在线理赔、积分抵扣与风控联动 |

详细设计文档见 [`docs/demand/petconnect-innovation/`](docs/demand/petconnect-innovation/)。

---

## 📁 项目结构

```
petconnect-app/
├── components/              # 公共 UI 组件
│   ├── BottomNav.tsx        # 底部导航栏
│   ├── PetLogTimeline.tsx   # 宠物成长日志时间轴
│   ├── AdoptionProgressTimeline.tsx  # 领养进度时间轴
│   └── LocationPicker.tsx   # 省市区三级联动选择器
├── contexts/                # React Context
│   ├── AuthContext.tsx      # 全局认证状态（user + profile）
│   ├── ThemeContext.tsx     # 主题切换（light / dark / system）
│   └── ToastContext.tsx     # 全局 Toast 提示
├── lib/                     # 业务逻辑与工具
│   ├── api/                 # Supabase 数据访问层（按模块拆分）
│   │   ├── pets.ts          # 宠物列表、详情、发布、编辑
│   │   ├── petLogs.ts       # 宠物成长日志 CRUD
│   │   ├── adoption.ts      # 领养申请（防重提交）
│   │   ├── adoptionMatch.ts # AI 领养匹配评分
│   │   ├── adoptionMilestones.ts  # 领养里程碑状态管理
|   │   ├── adoptRequests.ts # 求领养需求
│   │   ├── followUps.ts     # 领养回访任务 + 自动生成
│   │   ├── lostAlerts.ts    # 失踪宠物发布 & 搜索
│   │   ├── rescueTasks.ts   # 救助任务发布、认领、完成
│   │   ├── healthDiary.ts   # 健康日记记录
│   │   ├── healthInsights.ts # AI 健康分析与趋势预测
│   │   ├── favorites.ts     # 收藏管理
│   │   ├── insurance.ts     # 宠物险产品、投保与理赔 API
│   │   ├── messages.ts      # 消息 & 私信（支持 AI 回复）
│   │   ├── reports.ts       # 举报 & 屏蔽
│   │   ├── feedback.ts      # 意见反馈
│   │   ├── profile.ts       # 用户资料 CRUD
│   │   ├── verification.ts  # 实名认证
│   │   ├── llm.ts           # 统一 LLM 调用入口（多 provider）
│   │   ├── gemini.ts        # Gemini 专用接口（待整合）
│   │   └── llmProviders/    # 各 AI 供应商适配器
│   ├── config/
│   │   └── aiAgents.ts      # AI Agent 配置（角色定义、Prompt）
│   ├── data/
│   │   └── regions.ts       # 省市区数据
│   ├── utils/
│   │   ├── aiGuard.ts       # AI 响应安全过滤
│   │   ├── autoReply.ts     # 自动回复模板
│   │   ├── date.ts          # 日期格式化工具
│   │   └── storage.ts       # Supabase Storage 上传
|   ├── offline/
|   │   ├── cache.ts         # 离线缓存与 TTL 管理
|   │   └── syncQueue.ts     # 离线队列与重试同步
│   └── supabase.ts          # Supabase 客户端初始化
├── pages/                   # 页面级组件（与路由一一对应）
│   ├── Home.tsx             # 首页（宠物列表 + 筛选 + 发布/认领切换）
│   ├── PetDetail.tsx        # 宠物详情 + 成长日志展示
│   ├── PublishPet.tsx       # 发布宠物
|   ├── PublishAdoptRequest.tsx # 发布求领养
│   ├── AdoptionForm.tsx     # 领养申请表单
│   ├── AdoptionProgress.tsx # 我的领养申请进度
│   ├── MyPets.tsx           # 我的宠物（已领养 + 已发布）
│   ├── PetHealthDiary.tsx   # 宠物健康日记（记录 + AI 分析）
│   ├── InsuranceCenter.tsx # 保险首页（险种列表与推荐）
│   ├── InsuranceProductDetail.tsx # 险种详情
│   ├── InsuranceClaim.tsx  # 理赔申请与状态追踪
│   ├── LostAlerts.tsx       # 失踪宠物列表（附近搜索）
│   ├── LostAlertDetail.tsx  # 失踪宠物详情
│   ├── PublishLostAlert.tsx # 发布失踪求助
│   ├── RescueBoard.tsx      # 救助任务板（发布 + 认领）
│   ├── RescueTaskDetail.tsx # 救助任务详情 + 完成反馈
│   ├── Favorites.tsx        # 收藏列表
│   ├── Messages.tsx         # 消息列表（会话 + 系统通知）
│   ├── ChatDetail.tsx       # 私信对话（支持 AI 智能回复）
│   ├── Points.tsx           # 积分中心
│   ├── RedeemAdoptionPriority.tsx # 领养优先券兑换
│   ├── RedeemCommunityPass.tsx    # 社群优先卡兑换
│   ├── RedeemHealthReport.tsx     # AI 健康报告兑换
│   ├── RedeemHospitalCheckup.tsx  # 医院体检券兑换
│   ├── RedeemLuckyDraw.tsx        # 公益抽奖券兑换
│   ├── RedeemMerchPack.tsx        # 周边礼包兑换
│   ├── Profile.tsx          # 个人资料
│   ├── Verification.tsx     # 实名认证
│   ├── Settings.tsx         # 设置中心
│   ├── ThemeSettings.tsx    # 主题设置
│   ├── NotificationSettings.tsx  # 通知设置
│   ├── PrivacySettings.tsx  # 隐私设置
│   ├── RecycleBin.tsx       # 回收站
│   ├── Feedback.tsx         # 意见反馈
│   ├── ChangePassword.tsx   # 修改密码
│   ├── BindPhone.tsx        # 绑定手机
│   ├── SocialAccount.tsx    # 第三方账号绑定
│   ├── AboutUs.tsx          # 关于我们
│   ├── UserAgreement.tsx    # 用户协议
│   ├── PrivacyPolicy.tsx    # 隐私政策
│   └── Login.tsx            # 登录 / 注册
├── supabase/                # 数据库脚本
│   ├── master.sql           # 全库一键重建快照
│   ├── schema.sql           # 基础表结构 + RLS 策略 + 触发器
│   ├── seed.sql             # 示例数据（宠物、用户等）
│   ├── storage_policies.sql # Storage Bucket 上传策略
│   └── migrations/          # 增量迁移脚本（按 Phase 顺序执行）
│       ├── add_pet_logs.sql              # 宠物成长日志
│       ├── add_pet_logs_update_policy.sql
│       ├── add_follow_up_tasks.sql       # 领养回访任务
│       ├── add_follow_up_template_key.sql
│       ├── add_reports_blocks.sql        # 举报 & 屏蔽
│       ├── 20240901_add_agent_type_to_conversations.sql
│       ├── 20240902_add_deleted_at_to_chat_messages.sql
│       ├── add_lost_pet_alerts.sql       # 失踪宠物（Phase 1）
│       ├── add_adoption_match_scores.sql # AI 匹配评分（Phase 2）
│       ├── add_adoption_milestones.sql   # 领养里程碑（Phase 3）
│       ├── add_rescue_tasks.sql          # 救助任务（Phase 4）
│       ├── add_pet_health_diary.sql      # 健康日记（Phase 5）
│       ├── add_health_diary_storage.sql  # 健康日记图片
│       ├── 2026-02-21-add-adopt-requests.sql
│       ├── 2026-02-21-add-structured-location.sql
│       ├── 2026-02-21-add-points-mall.sql
│       ├── 2026-02-22-add-award-points.sql
│       ├── 2026-02-23-add-points-donations.sql
│       ├── add_more_pet_categories_and_seed_data.sql
│       ├── add_pet_filters_indexes.sql   # 性能优化索引
│       ├── upgrade_messages_model.sql    # 消息表增强
│       └── upgrade_verifications_privacy.sql
├── types.ts                 # 全局 TypeScript 类型定义
├── App.tsx                  # 根组件 + 路由配置
└── index.html               # HTML 入口
```

---

## 📦 可用脚本

```bash
npm run dev      # 启动本地开发服务器（默认端口 3000）
npm run build    # 构建生产版本，输出至 dist/
npm run preview  # 在本地预览生产构建结果
```

---

## 🛠️ 开发指南

### 代码规范

项目遵循严格的代码规范，详见 [`.github/copilot-instructions.md`](.github/copilot-instructions.md)，核心要点：

- **组件**：函数式组件 + Hooks，禁止类组件
- **类型**：TypeScript 严格模式，禁止 `any`
- **样式**：Tailwind CSS 原子类，禁止内联 style
- **数据访问**：UI 层禁止直接调用 supabase，必须通过 `lib/api/*.ts`
- **API 层**：函数命名动词 + 名词，snake_case → camelCase 手动映射
- **错误处理**：`if (error) throw new Error(error.message)`

### 文件命名约定

- **组件/页面**：PascalCase（如 `PetDetail.tsx`）
- **API 文件**：camelCase（如 `lostAlerts.ts`）
- **工具函数**：camelCase（如 `date.ts`）
- **迁移脚本**：snake_case + 语义化（如 `add_pet_logs.sql`）

### 提交前检查

```bash
# 1. TypeScript 类型检查
npx tsc --noEmit

# 2. 构建测试
npm run build

# 3. 本地预览
npm run preview
```

### 核心架构

```
用户交互层（pages/）
      ↓
 状态管理（contexts/）
      ↓
 数据访问层（lib/api/）
      ↓
Supabase（Auth + DB + Storage + RLS）
```

- **前端路由**：Hash 路由（适配静态托管）
- **认证流程**：Supabase Auth → AuthContext → 全局 user/profile
- **数据隔离**：Row Level Security（RLS）确保多租户数据安全
- **AI 能力**：统一通过 `lib/api/llm.ts` 调用，支持多 provider 切换
- **图片上传**：`lib/utils/storage.ts` → Supabase Storage Bucket

---

## 🎯 工程化体系

项目已集成**完整的开发工程化体系**，支持 AI Agent（Cursor / GitHub Copilot / Claude）高效协作。

### ⚡ 核心工作流（5 步完成一个功能）

> **一句话**：从输入功能名到 git push，整个流程自动化、无感知！

```bash
# 1️⃣ 初始化项目（首次）
npm run bootstrap:ai

# 2️⃣ 输入功能主题 + 需求
npm run task:decompose
# 输入: "AI 宠物匹配" + 需求细节
# 输出: 自动生成 3-5 个 subtasks，一个主文件夹

# 3️⃣ Agent 开发各 subtask（types → api → ui → pages）
# Cursor IDE 自动加载 .ai/rules/ 规范
# npm run build 验证每步

# 4️⃣ 验收完后让 AI 标记完成
npm run task:mark-done -- tasks/2026-02-21-feature/subtasks/01-types --auto-check
# 默认不打钩，只有明确 --auto-check 才会标记✓

# 5️⃣ 所有 subtask 完成后分批提交
npm run task:commit-batch -- tasks/2026-02-21-feature
# 自动拆分 4 个 commit：types → api → components → pages
# git push
```

**✨ 亮点**：
- 🤖 **LLM 智能拆解** — 不需要手动创建文件夹，AI 自动分析需求
- 📁 **层级清晰** — 一个功能一个主文件夹 + N 个 subtasks
- ✅ **进度可视** — `npm run task:list` 显示完成% + 更新时间
- 🔍 **规范自动生效** — Cursor 打开时自动加载 .ai/rules/
- 📦 **分批提交** — 按功能阶段（types→api→ui→pages）自动分组
- 🛡️ **验收保护** — 默认不打钩，人工审核后才标记完成

### 快速初始化

```bash
# 首次打开项目
npm run bootstrap:ai

# 检查系统健康状态
npm run doctor:ai

# 如需刷新规则（编改 .ai/rules/* 后）
npm run sync:ai
```

### 如何复制 boilerplate 到新项目

如果你想在新仓库/新项目中使用本套 boilerplate，可按以下简短步骤操作：

- 方法 A（本地复制，推荐）：

```bash
# 进入目标项目根目录（或新建目录）
cd /path/to/my-new-project
# 从当前仓库复制 boilerplate 下的内容到目标项目
cp -r ../petconnect-app/boilerplate/.ai ./
cp -r ../petconnect-app/boilerplate/scripts ./
cp -r ../petconnect-app/boilerplate/docs ./
cp -r ../petconnect-app/boilerplate/tasks ./
cp ../petconnect-app/boilerplate/package.json ./ || true
```

- 方法 B（作为模板仓库使用）：

```bash
# 克隆 boilerplate 仓库（假设已推到远端独立仓库）
git clone https://github.com/yourname/boilerplate.git my-new-project
cd my-new-project
```

复制后，进入目标项目，安装依赖并运行初始化命令：

```bash
npm install
# 填写 .ai/rules/ 中的 TODO 内容，按需调整 package.json
npm run bootstrap:ai
npm run task:list
```

这会把核心规则、脚本与任务模板引入你的新项目，之后即可按常规流程开始开发。


### 工程化文档

| 文档 | 用途 |
| --- | --- |
| [docs/AI-TASK-SYSTEM.md](docs/AI-TASK-SYSTEM.md) | 🤖 **LLM 智能拆解系统**（推荐首先阅读！） |
| [boilerplate/docs/BOILERPLATE.md](boilerplate/docs/BOILERPLATE.md) | 📦 **新项目初始化模版**（为下一个项目做准备） |
| [docs/WORKFLOW.md](docs/WORKFLOW.md) | 完整工作流程与 Agent 执行指南（深度） |
| [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) | 快速参考卡（可打印） |
| [.ai/rules/](/.ai/rules/) | 5 个分层规则（global / frontend / backend / db / security） |
| `.cursor/rules/PROJECT_RULES.md` | Cursor IDE 自动加载的统一规则（自动生成） |

### 任务管理 - 核心命令

#### 🤖 方式 A：AI 自动拆解（推荐）

```bash
# 交互式创建任务（LLM 智能分析）
npm run task:decompose

# 输入示例：
# 🎯 功能主题: AI 宠物匹配推荐
# 📝 具体需求:
# > 基于用户偏好和宠物特征计算兼容度
# > UI 展示匹配分数 + AI 推荐理由
# > 后台定期重新计算
# >
# ✅ 自动生成：tasks/2026-02-21-adoption-match/
#   ├── parent-spec.md
#   └── subtasks/
#      ├── 01-types-definitions/
#      ├── 02-api-implementation/
#      ├── 03-ui-components/
#      ├── 04-pages-integration/
#      └── 05-testing-validation/
```

#### 📋 方式 B：从 phase 文档创建

```bash
# 创建单个任务（基于现有 phase 文档）
npm run task:new -- docs/demand/petconnect-innovation/phase-2-ai-adoption-match.md adoption-match-ui

# 输出：tasks/2026-02-21-phase2-adoption-match-ui/
#   ├── spec.md       # 验收标准 & API/DB 声明
#   └── done.md       # 完成记录模板
```

#### 🔍 查看待做任务

```bash
npm run task:list

# 输出：
# 📋 待做任务列表
# 1. 🟡 2026-02-21-adoption-match
#    📂 tasks/2026-02-21-adoption-match
#    📊 进度: [████████░░░░░░░░░░░░] 40%
#    ⏰ 最后更新: 2h 前
```

#### ✅ 标记任务完成

```bash
# 完成一个 subtask 后
npm run task:mark-done -- tasks/2026-02-21-adoption-match/subtasks/01-types-definitions

# 可选：允许 AI 自动打钩
npm run task:mark-done -- tasks/.../01-types --auto-check

# 自动：验证 npm run build 通过，生成 done.md
```

#### 📦 分批提交代码

```bash
# 所有 subtasks 完成后，按功能阶段分批提交
npm run task:commit-batch -- tasks/2026-02-21-adoption-match

# 输出 4 个 commit：
# ✅ feat(types): 类型定义
# ✅ feat(api): API 实现
# ✅ feat(components): UI 组件
# ✅ feat(pages): 页面集成
```

---

## 💡 实战示例：开发"AI 领养匹配"功能

这个示例展示 AI Agent（如 Cursor）从需求到部署的完整流程。

### Step 1: 初始化 & 理解需求

```bash
# Agent 首次打开项目
npm install
npm run bootstrap:ai  # ← 规则、技能自动加载

# 查看当前任务
cat tasks/2026-02-21-phase2-adoption-match-ui/spec.md
```

**spec.md 内容示例**：
```markdown
## Goal
- 基于 AI 为领养人推荐最匹配的宠物

## Acceptance Criteria
- [ ] 用户进入首页看到 "为你推荐" 卡片
- [ ] 点击卡片显示匹配分数 + AI 推荐理由
- [ ] 调用 LLM 生成匹配评分（1-100）
- [ ] 非登录用户显示友好提示

## API/DB Touch
- API 变更：lib/api/adoptionMatch.ts（新增）
- DB 变更：adoption_match_scores 表（已存在）
- 权限变更：RLS policy（用户只能看自己的推荐）

## Linked Demand Doc
- docs/demand/petconnect-innovation/phase-2-ai-adoption-match.md
```

### Step 2: 制定 Plan（大任务时）

Agent 读取 spec.md，自动推导执行计划：

```markdown
# Plan
## Part A: API 层（1-2h）
- [ ] 在 types.ts 增加 AdoptionMatch interface
- [ ] 新建 lib/api/adoptionMatch.ts
  - calculateMatchScore(petId, userId): Promise<{score, reason}>
  - 调用 generateMatchAnalysis() 从 LLM 获取评分
- [ ] 测试 API 返回格式正确

## Part B: UI 层（1-2h）
- [ ] 修改 pages/Home.tsx
  - 新增 "为你推荐" 卡片区
  - 调用 adoptionMatch API
- [ ] 新建 components/AdoptionMatchCard.tsx
  - 显示得分、推荐理由、CTA 按钮
  - 处理加载态和错误态

## Part C: 验收（30min）
- [ ] npm run build 通过
- [ ] E2E 验证：首页能看到卡片
- [ ] Preview 链接测试
```

### Step 3: 分阶段实施 & 提交代码

#### Part A: API 层

```bash
# 拆解为小步骤，每次 3-5 个文件改动

# Step A1: 更新类型定义
# 修改 types.ts
# ↓ 立即 commit
git add types.ts
git commit -m "feat(types/adoption): add AdoptionMatch interface"

# Step A2: 新建 API 模块
# 新建 lib/api/adoptionMatch.ts
# 调用 lib/api/llm.ts 获取 AI 评分
# ↓ 立即 commit  
git add lib/api/adoptionMatch.ts
git commit -m "feat(api/adoption): implement calculateMatchScore"

# Step A3: 验证
npm run build  # ← 必须通过
```

#### Part B: UI 层

```bash
# 等待 Part A merge 后再开始

# Step B1: 新建展示组件
# 新建 components/AdoptionMatchCard.tsx
git add components/AdoptionMatchCard.tsx
git commit -m "feat(components): add AdoptionMatchCard component"

# Step B2: 集成到首页
# 修改 pages/Home.tsx
# 导入 AdoptionMatchCard，添加到合适位置
git add pages/Home.tsx
git commit -m "feat(pages/home): add AI adoption recommendations section"

# Step B3: 验证
npm run build
```

### Step 4: 提交规范

**Conventional Commits 格式**：

```
feat(scope): subject

Optional body explaining why.

Closes #issue-number
```

**示例**：
```
feat(api/adoption): implement AI-powered match scoring
- Calculate compatibility between adopter and pet
- Call Gemini API for intelligent analysis
- Cache results for 24 hours

feat(components): add match score display card
- Show score (1-100) with color-coded feedback
- Display AI-generated recommendations
- Handle loading and error states

feat(pages/home): integrate adoption recommendations
- Add "Tailored for You" section
- Fetch recommendations on page load
- Non-authenticated users see prompt to login
```

### Step 5: 验收与标记

```bash
# 对照 spec.md 的 Acceptance Criteria 逐项核验
✅ 用户进入首页看到 "为你推荐" 卡片
✅ 点击卡片显示匹配分数 + AI 推荐理由
✅ 调用 LLM 生成匹配评分（1-100）
✅ 非登录用户显示友好提示

# 填写任务完成记录
cat > tasks/2026-02-21-phase2-adoption-match-ui/done.md << 'EOF'
# Done

## What changed
- API：新增 calculateMatchScore() 实现 AI 匹配评分
- 组件：新增 AdoptionMatchCard 展示推荐
- 页面：Home 增加 "为你推荐" 卡片区

## Files touched
- types.ts
- lib/api/adoptionMatch.ts
- components/AdoptionMatchCard.tsx
- pages/Home.tsx

## Test checklist
- [x] npm run build 无错误
- [x] 本地功能验证（登录→首页→看到卡片）
- [x] AI 调用正常（console logs 确认）
- [x] 非登录用户提示正确

## Build result
✅ 无警告，gzip size 增加 3.2kB（可接受）

## Preview/Prod links
- Preview: https://petconnect-feat.vercel.app
- Production: （待合并后）
EOF
```

---

## 🔄 工具切换提示词

当你在 **Cursor / VS Code / GitHub Copilot / Claude 等工具间切换**时，告诉 AI 当前上下文，避免重复理解。

### 模板 1: 继续当前任务（从一个工具切换到另一个）

```markdown
我在用 [当前工具] 开发 PetConnect 的一个功能。

**任务**：tasks/2026-02-21-[phaseX]-[功能]/spec.md

**当前进度**：
- [x] 已完成：xxx
- [ ] 进行中：yyy（已提交 commit abc123）
- [ ] 待做：zzz

**项目规范**：
- 所有规则见 .ai/rules/ 和 .cursor/rules/PROJECT_RULES.md
- Conventional Commits: feat(api/adoption): description
- 禁止直连 supabase（改用 lib/api/*.ts）
- TypeScript 无 any，Tailwind 无内联 style

**下一步**：请继续帮我完成 [yyy 待做项]
```

**示例**：
```markdown
我在用 Cursor 开发 PetConnect 的 AI 领养匹配功能。

**任务**：tasks/2026-02-21-phase2-adoption-match-ui/spec.md

**当前进度**：
- [x] 已完成：types.ts 新增 AdoptionMatch interface
- [x] 已完成：lib/api/adoptionMatch.ts 实现 calculateMatchScore
- [ ] 进行中：components/AdoptionMatchCard.tsx（已新建，待补充 UI 逻辑）
- [ ] 待做：pages/Home.tsx 集成卡片

**关键约束**：
- 调用 LLM 必须通过 lib/api/llm.ts（已支持 Gemini/DeepSeek/豆包）
- RLS policy 已在 adoption_match_scores 表配置
- Tailwind 主色调：dark:bg-zinc-800 / text-primary

**下一步**：请继续帮我完成 AdoptionMatchCard 的 UI 逻辑（显示分数、理由、CTA）
```

### 模板 2: 从 Cursor 切换到 Claude（需要 AI 深度重构或方案设计）

```markdown
项目背景：PetConnect 宠物领养平台，基于 React 18 + TypeScript + Supabase + TailwindCSS

**工程化体系**：
- 项目规范：docs/WORKFLOW.md（478行）和 docs/QUICK_REFERENCE.md
- 规则文件：.ai/rules/ 中 5 个分层规则（global/frontend/backend/db/security）
- 任务系统：tasks/YYYY-MM-DD-phaseX-*/{spec.md, done.md}
- npm 命令：npm run bootstrap:ai / sync:ai / build / doctor:ai

**当前任务**：tasks/2026-02-21-phase3-trusted-adoption-milestones/spec.md

**需求**：实现"可信领养流程"——用户可查看领养申请的完整进度（申请→初审→家访→试养→通过）

**设计问题**：
1. 如何在前端展示多阶段流程的状态变更？依赖 DB 的状态字段吗？
2. adoption_milestones 表结构如何设计（考虑 RLS）？
3. 是否需要 Edge Function 自动推进流程状态？

**期望**：请给我方案设计（架构图 + DB Schema + API 接口清单 + 前端交互流程）
```

### 模板 3: 从开发工具切换到 GitHub 提交 PR

```markdown
**任务**：tasks/2026-02-21-phase2-adoption-match-ui/

**PR 标题**：feat(adoption-match): implement AI-powered pet-person matching

**变更清单**：
1. types.ts: 新增 AdoptionMatch interface
2. lib/api/adoptionMatch.ts: calculateMatchScore() 通过 LLM 评分
3. components/AdoptionMatchCard.tsx: 新组件展示匹配卡片
4. pages/Home.tsx: 集成推荐卡片到首页

**验收检查**：
- [x] npm run build 通过
- [x] 本地功能验证（已截图）
- [x] 对标 spec.md 4 条 Acceptance Criteria
- [x] 提交规范遵循 Conventional Commits
- [x] 无硬编码 key、无 console.log、无 any 类型

**预览链接**：https://petconnect-feat-adoption.vercel.app

**关联文档**：
- 需求：docs/demand/petconnect-innovation/phase-2-ai-adoption-match.md
- 完成记录：tasks/2026-02-21-phase2-adoption-match-ui/done.md
```

### 模板 4: 快速同步规则（有人更新了 .ai/rules/）

```markdown
项目规范已更新。

**运行**：
```bash
npm run bootstrap:ai   # 自动刷新所有规则、技能、MCP 配置
npm run doctor:ai      # 验证系统状态
```

**新增约束**：[简述改动]

**对我当前任务的影响**：[如无影响，可跳过]
```

---

---

## 🌐 部署

PetConnect 是纯静态前端应用，支持一键部署到多种静态托管平台。

### Vercel / Netlify（推荐）

1. 将仓库连接到 Vercel 或 Netlify
2. 设置构建命令：`npm run build`
3. 设置输出目录：`dist`
4. 在平台的环境变量面板中配置：
   - `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`（**必填**）
   - AI 智能体相关：`VITE_LLM_PROVIDER` + 对应 provider 的 API Key（可选，见上方环境变量表）
   - 未配置 AI 时，相关功能会显示友好错误提示，不影响其他功能

> ⚠️ **重要提示**：
> - 以 `VITE_` 为前缀的变量会在构建时注入客户端，**请勿存放敏感密钥**
> - **环境变量修改后必须重新部署**（Redeploy）才能生效
> - 推荐先配置好 Supabase 环境变量，再逐步添加 AI 能力

### AI 调用失败排查

若配置了 LLM 环境变量后 AI 功能仍显示错误：

1. **确认已重新部署**：在 Vercel/Netlify Deployments 页点击 Redeploy
2. **检查 API Key 格式**：无多余空格、换行符
3. **豆包专属**：`VITE_DOUBAO_MODEL_ID` 应为「推理接入点 ID」（如 `ep-xxxx` 或 `doubao-pro-32k-241215`）
4. **打开浏览器控制台**：查看 `[PetConnect]` 开头的日志，确认 API 返回信息

### PWA 离线能力（开发中）

项目已集成 `vite-plugin-pwa`，Phase 6 完成后将支持：
- 本地离线缓存
- 桌面/主屏安装
- 弱网环境下的应急功能

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！在提交 PR 前，请确保：

1. ✅ 代码通过 TypeScript 类型检查（`npx tsc --noEmit`）
2. ✅ 成功完成构建（`npm run build`）
3. ✅ 遵循项目编码规范（见 [`.github/copilot-instructions.md`](.github/copilot-instructions.md)）
4. ✅ 新增功能需同步更新类型定义（`types.ts`）
5. ✅ 数据库变更需提供迁移脚本（`supabase/migrations/*.sql`）
6. ✅ PR 描述清楚变更目的、影响范围、测试方式

### 提交 Issue

- Bug 报告：提供复现步骤、环境信息、控制台错误
- 功能建议：说明使用场景、预期效果、参考案例

### 开发分支策略

- `main`：生产环境稳定版本
- `develop`：开发主分支，功能合并点
- `feature/*`：新功能开发分支
- `fix/*`：Bug 修复分支

---

## ❓ 常见问题

<details>
<summary><strong>Q1: 为什么使用 Hash 路由而不是 History 模式？</strong></summary>

Hash 路由无需服务端配置，能直接部署到任意静态托管平台（如 Vercel、Netlify、GitHub Pages）。History 模式需要服务端配置 fallback 规则，增加部署复杂度。
</details>

<details>
<summary><strong>Q2: AI 功能不可用怎么办？</strong></summary>

- 未配置 LLM 环境变量时，AI 功能会显示友好错误提示，不影响其他功能
- 确认环境变量配置无误后，记得重新部署（Redeploy）
- 检查浏览器控制台中的 `[PetConnect]` 日志，查看具体错误信息
</details>

<details>
<summary><strong>Q3: 如何切换 AI 模型？</strong></summary>

修改环境变量 `VITE_LLM_PROVIDER`：
- `deepseek`（默认）：性价比高，中文理解能力强
- `doubao`：字节跳动豆包，需配置 `VITE_DOUBAO_API_KEY` + `VITE_DOUBAO_MODEL_ID`
- `gemini`：Google Gemini，需配置 `VITE_GEMINI_API_KEY`

切换后重新部署即可生效。
</details>

<details>
<summary><strong>Q4: 数据库迁移脚本执行顺序重要吗？</strong></summary>

是的！建议按 README 中列出的顺序执行。某些迁移脚本依赖前置表结构或字段，顺序错误可能导致执行失败。对于全新项目，可以一次性执行所有脚本。
</details>

<details>
<summary><strong>Q5: 本地开发时图片上传失败？</strong></summary>

检查以下事项：
1. Supabase Storage 中是否创建了 `avatars` Bucket（需设为 Public）
2. 是否执行了 `supabase/storage_policies.sql` 配置上传权限
3. `.env.local` 中的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是否正确
</details>

<details>
<summary><strong>Q6: 如何贡献新的 AI Agent 配置？</strong></summary>

编辑 [`lib/config/aiAgents.ts`](lib/config/aiAgents.ts)，添加新的 Agent 角色定义，包括 `name`、`systemPrompt`、`description`。示例可参考现有的 `adoption_recommender`、`health_advisor` 等配置。
</details>

---

## 📞 技术支持

- **文档**：[docs/demand/petconnect-innovation/](docs/demand/petconnect-innovation/)
- **Issues**：[GitHub Issues](../../issues)（请先搜索是否有相同问题）
- **讨论**：[GitHub Discussions](../../discussions)

---

## 📊 项目统计

- **代码库**：35+ 页面组件 + 20+ API 模块
- **数据库**：20+ 迁移脚本，涵盖积分体系与求领养能力
- **AI 能力**：支持 3 种主流 LLM 提供商
- **开发周期**：分 7 个 Phase 迭代交付

---

## 📝 更新日志

### 🎉 v0.5.0 - 积分体系与求领养增强（2026-02-23）

本次更新完善积分体系与求领养流程，补齐积分发放、兑换与公益捐赠闭环。

#### ✨ 新增功能

- **积分商城与兑换**：新增积分中心与多种兑换场景（优先券、健康报告、公益抽奖、周边礼包等）
- **积分发放与捐赠**：支持积分奖励与公益捐赠记录，统一流水可追踪
- **求领养发布**：新增求领养发布与公开展示，匹配更多领养机会
- **结构化地址**：统一省市区字段，提升筛选与检索准确度

#### 🗄️ 数据库迁移

- `2026-02-21-add-adopt-requests.sql`
- `2026-02-21-add-structured-location.sql`
- `2026-02-21-add-points-mall.sql`
- `2026-02-22-add-award-points.sql`
- `2026-02-23-add-points-donations.sql`

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

## 🙏 致谢

- [Supabase](https://supabase.com) - 强大的开源 BaaS 平台
- [Vite](https://vitejs.dev) - 极速的前端构建工具
- [React](https://react.dev) - 声明式 UI 框架
- [Tailwind CSS](https://tailwindcss.com) - 实用优先的 CSS 框架
- [Material Icons](https://fonts.google.com/icons) - 优质的图标库
- [DeepSeek](https://www.deepseek.com) / [豆包](https://www.volcengine.com/product/doubao) / [Gemini](https://ai.google.dev) - AI 能力支持
- 所有贡献者和 Star 支持者 ❤️

---

<div align="center">

**如果这个项目对你有帮助，欢迎 Star ⭐️**

Made with ❤️ by PetConnect Team

</div>