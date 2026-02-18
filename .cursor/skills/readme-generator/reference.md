# README 主流规范参考

本文档整合 standard-readme、Best-README-Template、Google styleguide、GitHub 官方建议，供 README 生成时参考。

---

## 一、standard-readme（RichardLitt）

面向开源库的规范，强调章节顺序与必选内容。

**必选章节**：Title、Short Description、Install、Usage、License、Contributing

**可选章节**：Banner、Badges、Long Description、Table of Contents、Security、Background、API、Maintainers、Thanks

**关键要求**：
- Short Description ≤ 120 字符，与 package.json description 一致
- 无断链
- 代码示例与项目 lint 风格一致

---

## 二、Best-README-Template（othneildrew）

GitHub 高星模板，适合通用项目。

**章节结构**：
1. About The Project（项目介绍、截图）
2. Built With（技术栈）
3. Getting Started（Prerequisites、Installation）
4. Usage（使用示例）
5. Roadmap（计划、已知问题）
6. Contributing（贡献流程）
7. License
8. Contact
9. Acknowledgments

**特色**：徽章、可折叠目录、Back-to-top 链接、参考式 Markdown 链接。

---

## 三、Google styleguide

**最低要求**：
1. 文档链接
2. 使用方式（示例代码、可复制命令）
3. 项目状态（deprecated、未正式发布等）
4. 联系方式
5. 包/库用途说明

**文件规范**：`README.md`，位于代码根目录。

---

## 四、GitHub 官方建议

**README 应回答**：
- 谁维护、谁贡献
- 项目有什么用、解决什么问题
- 如何开始使用
- 哪里获取帮助
- 相关文档与联系方式

**配套文件**：LICENSE、SECURITY.md、CONTRIBUTING.md、CODE_OF_CONDUCT.md

**限制**：内容 < 500 KiB，避免 GitHub 截断。

---

## 五、整合后的推荐顺序

| 顺序 | 章节 | 来源 | 必选 |
|------|------|------|:----:|
| 1 | Title | 全部 | ✅ |
| 2 | Short Description | standard-readme | ✅ |
| 3 | Banner（可选） | Best-README-Template | |
| 4 | Badges（可选） | Best-README-Template | |
| 5 | Table of Contents（>100 行时） | standard-readme | |
| 6 | 功能特性 / About | 全部 | ✅ |
| 7 | 技术栈 / Built With | Best-README-Template | ✅ |
| 8 | 快速开始 / Install | 全部 | ✅ |
| 9 | Usage | 全部 | ✅ |
| 10 | 项目结构（可选） | - | |
| 11 | 部署（可选） | - | |
| 12 | API（库项目） | standard-readme | |
| 13 | Roadmap（可选） | Best-README-Template | |
| 14 | Contributing | standard-readme, GitHub | ✅ |
| 15 | Maintainers / Contact（可选） | Google, Best-README-Template | |
| 16 | Thanks / Acknowledgments（可选） | Best-README-Template | |
| 17 | License | 全部 | ✅ |

---

## 六、徽章常用模板（shields.io）

```markdown
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
```

---

## 七、个性化风格示例

**简洁风格**：无 emoji，纯文本，章节精简，适合库/CLI。

**专业风格**：表格多、徽章全、结构清晰，适合企业/开源项目。

**创意风格**：居中标题、章节 emoji、快速导航、表格内图标，适合个人项目/作品集。
