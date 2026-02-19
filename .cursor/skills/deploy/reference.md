# Deploy 坑点速查

## 坑点总表

| 坑点 | 现象 | 原因 | 解决方案 |
|------|------|------|----------|
| 提交信息乱码 | 中文显示为乱码（如 娣诲姞） | Windows PowerShell 编码与 Git 不一致 | **提交信息请使用英文**，从源头避免编码问题；若已产生乱码，用 `git commit -F <文件>` 修正，详见 [github-batch-commits](../github-batch-commits/reference.md#提交信息中文乱码windowspowershell) |
| AI 回复失败 | 显示「抱歉，我这边有点卡，稍后再试～」 | Vercel 未配置 LLM 环境变量 | 添加 VITE_LLM_PROVIDER 及对应 Key（VITE_DOUBAO_API_KEY 等），保存后 Redeploy |
| 豆包调用失败 | 同上 | Model ID 格式错误或 API 返回 4xx/5xx | 检查 VITE_DOUBAO_MODEL_ID 为 ep-xxx 或预置 ID；打开控制台查看 [PetConnect Doubao] 日志 |
| 注册成功登录失败 | 账密正确但登录报错 | Supabase 邮箱未验证 | 查 auth.users.email_confirmed_at 为 null；用户点邮件链接或 Supabase 关闭 Confirm email |
| Supabase 登录重定向失败 | 登录后白屏或 404 | Redirect URLs 未配置 | Supabase Auth → URL Configuration → Redirect URLs 添加 `https://<project>.vercel.app/` |
| 环境变量不生效 | 配置后仍报错 | 未重新部署 | Vite 在构建时注入，修改后必须 Deployments → Redeploy |
| PWA 注册慢 | 手机端注册卡顿 | 多轮网络请求 + 移动网络延迟 | 选择 Supabase 亚太区域；减少 signUp 后的 fetchProfile 等请求；资源打包减少外部 CDN |
| PWA 图标不显示 | 主屏幕图标空白 | 路径错误或尺寸缺失 | 确保 public/pets/pwa-192x192.png、pwa-512x512.png 存在；manifest 中 paths 为 /pets/xxx |

---

## 扩展说明

### 豆包 Model ID 格式

- **自定义推理接入点**：`ep-xxxxxxxx`（火山方舟控制台部署后获取）
- **预置模型**：如 `doubao-pro-32k-241215`（模型广场中复制）

### Supabase 邮箱验证

- 默认开启：用户需点击邮件中的验证链接才能登录
- 关闭方式：Supabase Dashboard → Authentication → Providers → Email → 取消勾选 Confirm email
- 开发/测试可关闭；生产环境建议保留

### Vercel 环境变量作用域

- Production、Preview、Development 可分别勾选
- 部署时使用对应环境的变量
