# 教学成果奖材料展示网站 — 设计文档

**日期：** 2026-06-04  
**技术栈：** Jekyll + Decap CMS + GitHub Pages  
**托管：** GitHub Pages（静态，免费，push 后自动构建）

---

## 一、项目目标

为教学成果奖申报建立一个公开展示网站，供评审专家和学校领导浏览。网站按四大模块、十个子分类组织材料，支持图片预览和文件（PDF / Word）下载。管理员通过 `/admin` 可视化后台上传材料，无需本地开发环境。

---

## 二、整体架构

### 技术选型

| 层级 | 技术 | 说明 |
|---|---|---|
| 托管 | GitHub Pages | 原生支持 Jekyll，push 后自动构建，约 1-2 分钟生效 |
| 静态生成 | Jekyll | GitHub Pages 内置，无需额外 CI/CD |
| 内容管理 | Decap CMS | 提供 `/admin` 可视化后台，通过 GitHub OAuth 登录 |
| 认证 | GitHub OAuth | 仅有仓库权限的 GitHub 账号可登录后台 |
| 文件存储 | 仓库内 `assets/uploads/` | 所有上传文件随仓库存储，无需外部存储服务 |

### 数据流

```
管理员访问 /admin
  → GitHub OAuth 登录
  → 填写表单、上传文件
  → Decap CMS 自动 commit 到 GitHub 仓库
  → GitHub Pages 触发 Jekyll 构建
  → 访客访问更新后的静态页面
```

### 目录结构

```
edu_showcase/
├── _collections/
│   ├── _student_papers/        # 1-1 学生优秀论文
│   ├── _student_awards/        # 1-2 学生竞赛获奖
│   ├── _student_startups/      # 1-3 学生创业成果
│   ├── _teacher_awards/        # 2-1 教师获奖
│   ├── _teacher_projects/      # 2-2 人才培养项目立项
│   ├── _teacher_publications/  # 2-3 教材、专著出版
│   ├── _domestic_university/   # 3-1 高校应用推广证明材料
│   ├── _domestic_school/       # 3-2 中小学应用推广证明材料
│   ├── _xiaohuashi/            # 3-3 小花狮系列产品应用
│   └── _international/         # 4   国际影响力
├── assets/
│   ├── uploads/                # 所有上传文件（图片/PDF/Word）
│   └── css/
│       └── main.css
├── _layouts/
│   ├── default.html            # 基础布局（导航 + footer）
│   ├── category.html           # 分类列表页布局
│   └── item.html               # 条目详情页布局
├── _includes/
│   ├── nav.html                # 顶部导航
│   ├── breadcrumb.html         # 面包屑
│   ├── file-card.html          # 文件下载卡片组件
│   └── image-gallery.html      # 图片预览组件
├── admin/
│   ├── index.html              # Decap CMS 入口
│   └── config.yml              # CMS 字段配置
├── _config.yml                 # Jekyll 配置
├── index.md                    # 首页
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-06-04-edu-showcase-design.md
```

---

## 三、内容结构

### 网站层级

```
首页
├── 1 学生培养
│   ├── 1-1 学生优秀论文
│   ├── 1-2 学生竞赛获奖
│   └── 1-3 学生创业成果
├── 2 教师成果
│   ├── 2-1 教师获奖
│   ├── 2-2 人才培养项目立项
│   └── 2-3 教材、专著出版
├── 3 国内影响力
│   ├── 3-1 高校应用推广证明材料
│   ├── 3-2 中小学应用推广证明材料
│   └── 3-3 小花狮系列产品应用
└── 4 国际影响力（单页，暂无子分类，可后续扩展）
```

### 条目数据模型

每条材料对应一个 `.md` 文件，front matter 存储结构化字段：

**通用字段（所有子分类共用）：**

```yaml
---
title: ""          # 标题（必填）
year: 2024         # 年份（用于筛选）
author: ""         # 学生姓名 / 负责教师
description: ""    # 简要说明（可选）
images: []         # 图片路径列表
files: []          # 文件路径列表
featured: false    # 是否在首页重点展示
---
```

**各子分类特有字段：**

| 子分类 | 额外字段 |
|---|---|
| 1-1 学生优秀论文 | `journal`（期刊/会议名）、`level`（校/省/国家级） |
| 1-2 学生竞赛获奖 | `competition`（竞赛名称）、`award`（奖项等级） |
| 1-3 学生创业成果 | `project_name`（项目名）、`stage`（阶段：立项/孵化/落地） |
| 2-1 教师获奖 | `award_name`（奖项名称）、`organization`（颁奖单位） |
| 2-2 人才培养项目立项 | `project_type`（类型：国家级/省级/校级）、`funding`（经费） |
| 2-3 教材、专著出版 | `publisher`（出版社）、`isbn`（ISBN 号） |
| 3-1 高校推广 | `institution`（学校名称）、`province`（省份） |
| 3-2 中小学推广 | `school_name`（学校名称）、`region`（地区） |
| 3-3 小花狮产品 | `product_name`（产品名）、`usage_count`（应用数量） |
| 4 国际影响力 | `country`（国家/地区）、`organization`（机构名称） |

---

## 四、页面设计

### 页面类型

| 页面 | URL 示例 | 功能 |
|---|---|---|
| 首页 | `/` | 四大模块入口卡片 + 全站统计数字 |
| 一级分类页 | `/student/` | 三个子分类入口 + 简介 |
| 子分类列表页 | `/student/papers/` | 条目列表，支持按年份筛选 |
| 条目详情页 | `/student/papers/paper-2024-01/` | 标题、字段信息、图片预览、文件下载 |
| 国际影响力页 | `/international/` | 单页条目列表 + 文件下载 |
| 后台 | `/admin/` | Decap CMS 管理界面 |

### 导航结构

- **顶部固定导航**：网站标题 + 四个一级菜单（hover 展开二级子分类）
- **面包屑**：首页 > 学生培养 > 学生优秀论文（位于页面标题上方）
- **侧边栏**（列表页）：当前大类下子分类快速切换

### 文件展示规则

| 文件类型 | 展示方式 |
|---|---|
| 图片（jpg / png） | 缩略图网格，点击后 lightbox 全屏查看 |
| PDF | 内嵌 `<iframe>` 预览（高度 600px）+ 下载按钮 |
| Word / 其他 | 文件名 + 文件类型图标 + 下载按钮（不内嵌预览） |

---

## 五、视觉设计规范

### 配色

| 用途 | 颜色值 |
|---|---|
| 主色（导航/标题/主按钮） | `#1a3a5c`（深海蓝） |
| 辅助色（链接/高亮） | `#2e6da4`（学院蓝） |
| 页面背景 | `#ffffff` |
| 卡片/区块背景 | `#f5f6f8`（浅灰） |
| 正文文字 | `#2c3e50` |
| 边框/分割线 | `#dce3ea` |
| 奖项等级徽章 | `#b8860b`（暗金） |

### 字体

- 中文：系统字体栈（微软雅黑 / PingFang SC / sans-serif）
- 数字 / 英文：Georgia（衬线，增强学术感）

### 核心 UI 组件

| 组件 | 说明 |
|---|---|
| 首页模块卡片 | 深蓝背景，白色图标 + 模块名 + 条目数量统计 |
| 列表条目行 | 序号、标题（可点击）、年份、级别标签 |
| 年份筛选器 | 列表页顶部横向标签栏，点击过滤 |
| 文件下载卡片 | 文件图标 + 类型标注 + 文件名 + 下载按钮 |
| 图片预览网格 | 3列缩略图，点击 lightbox 放大 |
| 面包屑 | 小号灰色文字，位于 `<h1>` 上方 |

### 响应式断点

| 断点 | 布局 |
|---|---|
| > 1200px | 左侧边栏（240px）+ 右侧内容区 |
| 768px – 1200px | 折叠侧边栏，顶部导航 |
| < 768px | 单栏，汉堡菜单 |

---

## 六、Decap CMS 配置要点

```yaml
# admin/config.yml 核心结构

backend:
  name: github
  repo: 你的用户名/edu_showcase
  branch: main

media_folder: assets/uploads
public_folder: /assets/uploads

collections:
  - name: student_papers
    label: 学生优秀论文
    folder: _collections/_student_papers
    create: true
    fields:
      - { name: title, label: 标题, widget: string }
      - { name: year, label: 年份, widget: number }
      - { name: author, label: 作者, widget: string }
      - { name: journal, label: 期刊/会议, widget: string, required: false }
      - { name: level, label: 级别, widget: select,
          options: [校级, 省级, 国家级] }
      - { name: description, label: 说明, widget: text, required: false }
      - { name: images, label: 图片, widget: list,
          field: { name: image, widget: image } }
      - { name: files, label: 文件, widget: list,
          field: { name: file, widget: file } }
      - { name: featured, label: 重点展示, widget: boolean, default: false }
  # 其余9个分类结构类似，字段按第三节特有字段扩展
```

---

## 七、后续扩展预留

- **国际影响力子分类**：在 `_config.yml` 新增 collection 即可，无需改动模板
- **搜索功能**：可集成 lunr.js 客户端全文搜索，构建时生成搜索索引 JSON
- **多语言**：Jekyll 支持 `jekyll-multiple-languages-plugin`，有需要时可接入
- **统计图表**：首页可用 Chart.js 读取 Jekyll 生成的 JSON 数据绘制柱状图

---

## 八、实施优先级

| 阶段 | 内容 | 说明 |
|---|---|---|
| P0 | Jekyll 基础结构 + 首页 + 导航 | 可访问的骨架 |
| P0 | Decap CMS 接入 + 1个分类完整跑通 | 验证上传→展示全链路 |
| P1 | 其余9个子分类 | 批量复用模板 |
| P1 | 视觉样式完善 | 配色、字体、响应式 |
| P2 | 图片 lightbox + PDF 内嵌预览 | 体验增强 |
| P2 | 年份筛选器 | 交互增强 |
