# Supabase MCP 参考

## MCP 工具参数

### list_projects
无参数。用于验证 Supabase 连接、获取项目列表。

### list_tables
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| project_id | string | 是 | `mjyjrdwmcvrmbovbxgtr` |
| schemas | string[] | 是 | 默认 `["public"]` |

### execute_sql
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| project_id | string | 是 | `mjyjrdwmcvrmbovbxgtr` |
| query | string | 是 | SQL 查询（DML/SELECT） |

DDL 请用 `apply_migration`。

### apply_migration
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| project_id | string | 是 | `mjyjrdwmcvrmbovbxgtr` |
| name | string | 是 | 迁移名，snake_case |
| query | string | 是 | 完整 DDL SQL |

### list_migrations
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| project_id | string | 是 | `mjyjrdwmcvrmbovbxgtr` |

### generate_typescript_types
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| project_id | string | 是 | `mjyjrdwmcvrmbovbxgtr` |

---

## 表结构速查（public）

| 表名 | RLS | 行数 | 主键 | 说明 |
|------|-----|------|------|------|
| profiles | 是 | 2 | id | 用户资料，关联 auth.users |
| pets | 是 | 6 | id | 宠物信息 |
| favorites | 是 | 4 | id | 收藏，user_id + pet_id |
| adoption_applications | 是 | 6 | id | 领养申请 |
| conversations | 是 | 4 | id | 会话列表 |
| chat_messages | 是 | 26 | id | 聊天消息，含 deleted_at 软删除 |
| verifications | 是 | 1 | id | 实名认证 |
| feedback | 是 | 6 | id | 反馈 |

### 关键字段

**profiles**: id, nickname, avatar_url, bio, city, following_count, applying_count, adopted_count

**pets**: id, name, breed, age_text, gender, image_url, category, status (available|adopted|pending), is_urgent

**chat_messages**: conversation_id, content, is_self, deleted_at（软删除）

**conversations**: user_id, other_user_name, other_user_avatar, last_message, last_message_time, is_system
