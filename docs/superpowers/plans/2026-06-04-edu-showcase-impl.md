# 教学成果奖展示网站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 Jekyll + Decap CMS 在 GitHub Pages 上构建教学成果奖材料展示网站，4个大模块、10个子分类，支持图片预览和文件下载，管理员通过 `/admin` 可视化界面上传材料。

**Architecture:** Jekyll 4.x 从 `_collections/` 下的 Markdown 文件生成静态 HTML。每个子分类对应一个 Jekyll Collection。Decap CMS 提供 `/admin` 界面，通过 GitHub OAuth PKCE 流程（无需代理服务器）直接 commit 内容到仓库。GitHub Actions 在每次 push 到 `main` 后自动构建并部署到 GitHub Pages。

**Tech Stack:** Jekyll 4.3、Decap CMS 3.x、GitHub Actions Pages deployment、原生 CSS（CSS 变量 + Flexbox/Grid）、原生 JS（无框架）

---

## 文件结构总览

| 文件 | 职责 |
|---|---|
| `Gemfile` | Ruby 依赖声明 |
| `_config.yml` | Jekyll 核心配置：collections、permalink、defaults |
| `.github/workflows/deploy.yml` | GitHub Actions：构建 + 部署 |
| `.gitignore` | 排除 `_site/`、`.jekyll-cache/`、`vendor/` |
| `_data/nav.yml` | 导航树结构（标签、URL、层级） |
| `_layouts/default.html` | 基础 HTML 壳：`<head>`、导航、footer |
| `_layouts/home.html` | 首页：4个模块卡片 + 统计数 |
| `_layouts/section.html` | 大模块页：子分类卡片列表 |
| `_layouts/category.html` | 子分类列表页：循环 collection 条目 |
| `_layouts/item.html` | 条目详情：标题、元字段、图片、文件 |
| `_includes/nav.html` | 顶部导航（支持下拉、汉堡菜单） |
| `_includes/breadcrumb.html` | 面包屑组件 |
| `_includes/item-row.html` | 列表行组件（序号、标题、年份、标签） |
| `_includes/file-card.html` | 文件卡片组件（图标、名称、下载按钮、PDF 预览） |
| `_includes/image-gallery.html` | 图片缩略图网格 |
| `assets/css/main.css` | 全部样式：变量、重置、布局、所有组件 |
| `assets/js/lightbox.js` | 图片 lightbox（P2） |
| `assets/js/year-filter.js` | 年份筛选器（P2） |
| `index.html` | 首页入口 |
| `student/index.html` | 学生培养模块页 |
| `student/papers/index.html` | 学生优秀论文列表页 |
| `student/awards/index.html` | 学生竞赛获奖列表页 |
| `student/startups/index.html` | 学生创业成果列表页 |
| `teacher/index.html` | 教师成果模块页 |
| `teacher/awards/index.html` | 教师获奖列表页 |
| `teacher/projects/index.html` | 人才培养项目立项列表页 |
| `teacher/publications/index.html` | 教材、专著出版列表页 |
| `domestic/index.html` | 国内影响力模块页 |
| `domestic/university/index.html` | 高校应用推广列表页 |
| `domestic/school/index.html` | 中小学应用推广列表页 |
| `domestic/xiaohuashi/index.html` | 小花狮产品列表页 |
| `international/index.html` | 国际影响力页（单页，无子分类） |
| `admin/index.html` | Decap CMS 入口 |
| `admin/config.yml` | Decap CMS collection 字段定义 |
| `_collections/_student_papers/` | 学生优秀论文内容文件 |
| `_collections/_student_awards/` | 学生竞赛获奖内容文件 |
| `_collections/_student_startups/` | 学生创业成果内容文件 |
| `_collections/_teacher_awards/` | 教师获奖内容文件 |
| `_collections/_teacher_projects/` | 人才培养项目立项内容文件 |
| `_collections/_teacher_publications/` | 教材、专著出版内容文件 |
| `_collections/_domestic_university/` | 高校推广内容文件 |
| `_collections/_domestic_school/` | 中小学推广内容文件 |
| `_collections/_xiaohuashi/` | 小花狮产品内容文件 |
| `_collections/_international/` | 国际影响力内容文件 |
| `assets/uploads/` | 所有上传文件（Decap CMS 自动管理） |

---

## Phase P0：骨架 + 首个分类全链路

### Task 1：项目初始化

**Files:**
- Create: `Gemfile`
- Create: `_config.yml`
- Create: `.github/workflows/deploy.yml`
- Create: `.gitignore`
- Create: `_collections/` 下 10 个子目录（各含 `.gitkeep`）
- Create: `assets/uploads/.gitkeep`

- [ ] **Step 1：创建 `Gemfile`**

```ruby
source "https://rubygems.org"

gem "jekyll", "~> 4.3"
gem "webrick"

group :jekyll_plugins do
  gem "jekyll-seo-tag"
end
```

- [ ] **Step 2：创建 `_config.yml`**

```yaml
title: 教学成果奖材料展示
description: 教学成果奖申报材料公开展示平台
lang: zh-CN

collections_dir: _collections

collections:
  student_papers:
    output: true
    permalink: /student/papers/:name/
  student_awards:
    output: true
    permalink: /student/awards/:name/
  student_startups:
    output: true
    permalink: /student/startups/:name/
  teacher_awards:
    output: true
    permalink: /teacher/awards/:name/
  teacher_projects:
    output: true
    permalink: /teacher/projects/:name/
  teacher_publications:
    output: true
    permalink: /teacher/publications/:name/
  domestic_university:
    output: true
    permalink: /domestic/university/:name/
  domestic_school:
    output: true
    permalink: /domestic/school/:name/
  xiaohuashi:
    output: true
    permalink: /domestic/xiaohuashi/:name/
  international:
    output: true
    permalink: /international/:name/

defaults:
  - scope: { path: "", type: "student_papers" }
    values: { layout: "item", section: "student", section_label: "学生培养", category: "papers", category_label: "学生优秀论文" }
  - scope: { path: "", type: "student_awards" }
    values: { layout: "item", section: "student", section_label: "学生培养", category: "awards", category_label: "学生竞赛获奖" }
  - scope: { path: "", type: "student_startups" }
    values: { layout: "item", section: "student", section_label: "学生培养", category: "startups", category_label: "学生创业成果" }
  - scope: { path: "", type: "teacher_awards" }
    values: { layout: "item", section: "teacher", section_label: "教师成果", category: "awards", category_label: "教师获奖" }
  - scope: { path: "", type: "teacher_projects" }
    values: { layout: "item", section: "teacher", section_label: "教师成果", category: "projects", category_label: "人才培养项目立项" }
  - scope: { path: "", type: "teacher_publications" }
    values: { layout: "item", section: "teacher", section_label: "教师成果", category: "publications", category_label: "教材、专著出版" }
  - scope: { path: "", type: "domestic_university" }
    values: { layout: "item", section: "domestic", section_label: "国内影响力", category: "university", category_label: "高校应用推广证明材料" }
  - scope: { path: "", type: "domestic_school" }
    values: { layout: "item", section: "domestic", section_label: "国内影响力", category: "school", category_label: "中小学应用推广证明材料" }
  - scope: { path: "", type: "xiaohuashi" }
    values: { layout: "item", section: "domestic", section_label: "国内影响力", category: "xiaohuashi", category_label: "小花狮系列产品应用" }
  - scope: { path: "", type: "international" }
    values: { layout: "item", section: "international", section_label: "国际影响力", category: "international", category_label: "国际影响力" }

exclude:
  - Gemfile
  - Gemfile.lock
  - vendor
  - docs/superpowers

markdown: kramdown
plugins:
  - jekyll-seo-tag
```

- [ ] **Step 3：创建 `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: "3.2"
          bundler-cache: true
      - uses: actions/configure-pages@v5
        id: pages
      - name: Build
        run: bundle exec jekyll build --baseurl "${{ steps.pages.outputs.base_path }}"
        env:
          JEKYLL_ENV: production
      - uses: actions/upload-pages-artifact@v3

  deploy:
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

- [ ] **Step 4：创建 `.gitignore`**

```
_site/
.jekyll-cache/
.jekyll-metadata
vendor/
.sass-cache/
```

- [ ] **Step 5：创建 collection 目录和 uploads 目录**

```bash
mkdir -p _collections/_student_papers _collections/_student_awards _collections/_student_startups
mkdir -p _collections/_teacher_awards _collections/_teacher_projects _collections/_teacher_publications
mkdir -p _collections/_domestic_university _collections/_domestic_school _collections/_xiaohuashi
mkdir -p _collections/_international
mkdir -p assets/uploads assets/css assets/js

touch _collections/_student_papers/.gitkeep _collections/_student_awards/.gitkeep _collections/_student_startups/.gitkeep
touch _collections/_teacher_awards/.gitkeep _collections/_teacher_projects/.gitkeep _collections/_teacher_publications/.gitkeep
touch _collections/_domestic_university/.gitkeep _collections/_domestic_school/.gitkeep _collections/_xiaohuashi/.gitkeep
touch _collections/_international/.gitkeep
touch assets/uploads/.gitkeep
```

- [ ] **Step 6：安装依赖并验证构建**

```bash
bundle install
bundle exec jekyll build
```

Expected: 命令退出码 0，`_site/` 目录被创建。

- [ ] **Step 7：Commit**

```bash
git add Gemfile Gemfile.lock _config.yml .github/workflows/deploy.yml .gitignore _collections/ assets/
git commit -m "chore: scaffold Jekyll project with 10 collections and GitHub Actions"
```

---

### Task 2：数据文件 + 基础布局 + CSS

**Files:**
- Create: `_data/nav.yml`
- Create: `_layouts/default.html`
- Create: `_includes/nav.html`
- Create: `_includes/breadcrumb.html`
- Create: `assets/css/main.css`

- [ ] **Step 1：创建 `_data/nav.yml`**

```yaml
- id: student
  label: "1 学生培养"
  url: /student/
  children:
    - label: "1-1 学生优秀论文"
      url: /student/papers/
    - label: "1-2 学生竞赛获奖"
      url: /student/awards/
    - label: "1-3 学生创业成果"
      url: /student/startups/
- id: teacher
  label: "2 教师成果"
  url: /teacher/
  children:
    - label: "2-1 教师获奖"
      url: /teacher/awards/
    - label: "2-2 人才培养项目立项"
      url: /teacher/projects/
    - label: "2-3 教材、专著出版"
      url: /teacher/publications/
- id: domestic
  label: "3 国内影响力"
  url: /domestic/
  children:
    - label: "3-1 高校应用推广证明材料"
      url: /domestic/university/
    - label: "3-2 中小学应用推广证明材料"
      url: /domestic/school/
    - label: "3-3 小花狮系列产品应用"
      url: /domestic/xiaohuashi/
- id: international
  label: "4 国际影响力"
  url: /international/
  children: []
```

- [ ] **Step 2：创建 `_includes/nav.html`**

```html
<nav class="site-nav">
  <div class="nav-inner container">
    <a class="nav-brand" href="{{ '/' | relative_url }}">{{ site.title }}</a>
    <button class="nav-toggle" aria-label="菜单" onclick="this.closest('nav').classList.toggle('nav-open')">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-menu">
      {% for item in site.data.nav %}
      <li class="nav-item{% if item.children.size > 0 %} has-dropdown{% endif %}">
        <a href="{{ item.url | relative_url }}">{{ item.label }}</a>
        {% if item.children.size > 0 %}
        <ul class="nav-dropdown">
          {% for child in item.children %}
          <li><a href="{{ child.url | relative_url }}">{{ child.label }}</a></li>
          {% endfor %}
        </ul>
        {% endif %}
      </li>
      {% endfor %}
    </ul>
  </div>
</nav>
```

- [ ] **Step 3：创建 `_includes/breadcrumb.html`**

```html
{% if include.crumbs %}
<nav class="breadcrumb" aria-label="面包屑导航">
  <a href="{{ '/' | relative_url }}">首页</a>
  {% for crumb in include.crumbs %}
  <span class="breadcrumb-sep">›</span>
  {% if forloop.last %}
  <span>{{ crumb.label }}</span>
  {% else %}
  <a href="{{ crumb.url | relative_url }}">{{ crumb.label }}</a>
  {% endif %}
  {% endfor %}
</nav>
{% endif %}
```

- [ ] **Step 4：创建 `_layouts/default.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% if page.title %}{{ page.title }} — {% endif %}{{ site.title }}</title>
  <meta name="description" content="{{ page.description | default: site.description }}">
  <link rel="stylesheet" href="{{ '/assets/css/main.css' | relative_url }}">
  {% seo %}
</head>
<body>
  {% include nav.html %}
  <main class="site-main">
    <div class="container">
      {{ content }}
    </div>
  </main>
  <footer class="site-footer">
    <div class="container">
      <p>© {{ site.time | date: "%Y" }} {{ site.title }}</p>
    </div>
  </footer>
  <script src="{{ '/assets/js/lightbox.js' | relative_url }}" defer></script>
  <script src="{{ '/assets/js/year-filter.js' | relative_url }}" defer></script>
</body>
</html>
```

- [ ] **Step 5：创建 `assets/css/main.css`**

```css
/* ===== Variables ===== */
:root {
  --color-primary: #1a3a5c;
  --color-accent: #2e6da4;
  --color-bg: #ffffff;
  --color-bg-subtle: #f5f6f8;
  --color-text: #2c3e50;
  --color-border: #dce3ea;
  --color-gold: #b8860b;
  --font-sans: "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif;
  --font-serif: Georgia, "Times New Roman", serif;
  --nav-height: 60px;
  --sidebar-width: 240px;
  --container-max: 1200px;
}

/* ===== Reset ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font-sans); color: var(--color-text); background: var(--color-bg); line-height: 1.6; }
a { color: var(--color-accent); text-decoration: none; }
a:hover { text-decoration: underline; }
img { max-width: 100%; height: auto; }
ul { list-style: none; }

/* ===== Layout ===== */
.container { max-width: var(--container-max); margin: 0 auto; padding: 0 24px; }
.site-main { min-height: calc(100vh - var(--nav-height) - 60px); padding: 32px 0; }
.site-footer { background: var(--color-primary); color: rgba(255,255,255,0.7); padding: 20px 0; text-align: center; font-size: 0.85rem; }

/* ===== Navigation ===== */
.site-nav { position: sticky; top: 0; z-index: 100; background: var(--color-primary); height: var(--nav-height); box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
.nav-inner { display: flex; align-items: center; height: 100%; gap: 16px; }
.nav-brand { color: #fff; font-size: 1rem; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
.nav-brand:hover { text-decoration: none; opacity: 0.9; }
.nav-menu { display: flex; gap: 2px; margin-left: auto; }
.nav-item { position: relative; }
.nav-item > a { display: block; padding: 8px 12px; color: #fff; border-radius: 4px; font-size: 0.875rem; transition: background 0.15s; }
.nav-item > a:hover { background: rgba(255,255,255,0.15); text-decoration: none; }
.nav-dropdown { display: none; position: absolute; top: 100%; left: 0; background: #fff; border: 1px solid var(--color-border); border-radius: 4px; min-width: 200px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
.nav-dropdown li a { display: block; padding: 10px 16px; color: var(--color-text); font-size: 0.875rem; border-bottom: 1px solid var(--color-border); }
.nav-dropdown li:last-child a { border-bottom: none; }
.nav-dropdown li a:hover { background: var(--color-bg-subtle); text-decoration: none; }
.has-dropdown:hover .nav-dropdown { display: block; }
.nav-toggle { display: none; background: none; border: none; cursor: pointer; padding: 8px; margin-left: auto; }
.nav-toggle span { display: block; width: 22px; height: 2px; background: #fff; margin: 4px 0; }

/* ===== Breadcrumb ===== */
.breadcrumb { font-size: 0.8rem; color: #888; margin-bottom: 12px; }
.breadcrumb a { color: var(--color-accent); }
.breadcrumb-sep { margin: 0 6px; color: #ccc; }

/* ===== Page Header ===== */
.page-header { margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid var(--color-primary); }
.page-header h1 { font-family: var(--font-serif); font-size: 1.75rem; color: var(--color-primary); }
.page-header .subtitle { color: #666; margin-top: 6px; font-size: 0.95rem; }

/* ===== Home: Section Cards ===== */
.section-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 24px; }
.section-card { background: var(--color-primary); color: #fff; border-radius: 8px; padding: 28px; text-decoration: none; transition: transform 0.15s, box-shadow 0.15s; display: block; }
.section-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(26,58,92,0.3); text-decoration: none; }
.section-card .card-number { font-size: 0.75rem; opacity: 0.65; margin-bottom: 8px; letter-spacing: 0.05em; }
.section-card .card-title { font-size: 1.35rem; font-weight: 600; margin-bottom: 10px; }
.section-card .card-desc { font-size: 0.85rem; opacity: 0.82; line-height: 1.55; }
.section-card .card-count { margin-top: 20px; font-size: 1.6rem; font-weight: 700; font-family: var(--font-serif); }
.section-card .card-count span { font-size: 0.8rem; font-weight: 400; opacity: 0.75; margin-left: 4px; }

/* ===== Section Page: Subcategory Cards ===== */
.subcategory-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 24px; }
.subcategory-card { border: 1px solid var(--color-border); border-radius: 6px; padding: 24px; text-decoration: none; background: var(--color-bg-subtle); transition: border-color 0.15s, box-shadow 0.15s; display: block; }
.subcategory-card:hover { border-color: var(--color-accent); box-shadow: 0 2px 12px rgba(46,109,164,0.12); text-decoration: none; }
.subcategory-card .sub-label { font-size: 0.75rem; color: #999; margin-bottom: 6px; }
.subcategory-card .sub-title { color: var(--color-primary); font-weight: 600; font-size: 1rem; margin-bottom: 10px; }
.subcategory-card .sub-count { color: var(--color-accent); font-size: 0.875rem; }

/* ===== Category: Layout with Sidebar ===== */
.category-layout { display: flex; gap: 32px; margin-top: 24px; }
.category-sidebar { width: var(--sidebar-width); flex-shrink: 0; }
.category-sidebar h3 { font-size: 0.75rem; color: #999; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px; }
.sidebar-nav a { display: block; padding: 8px 12px; border-radius: 4px; color: var(--color-text); font-size: 0.875rem; margin-bottom: 2px; }
.sidebar-nav a:hover { background: var(--color-bg-subtle); text-decoration: none; }
.sidebar-nav a.active { background: var(--color-accent); color: #fff; }
.category-content { flex: 1; min-width: 0; }

/* ===== Item List ===== */
.item-list { border: 1px solid var(--color-border); border-radius: 6px; overflow: hidden; }
.item-row { display: flex; align-items: center; gap: 12px; padding: 13px 18px; border-bottom: 1px solid var(--color-border); background: var(--color-bg); }
.item-row:last-child { border-bottom: none; }
.item-row:hover { background: var(--color-bg-subtle); }
.item-row .row-num { color: #bbb; font-size: 0.8rem; width: 24px; flex-shrink: 0; text-align: center; font-family: var(--font-serif); }
.item-row .row-title { flex: 1; font-size: 0.95rem; }
.item-row .row-title a { color: var(--color-text); }
.item-row .row-title a:hover { color: var(--color-accent); text-decoration: none; }
.item-row .row-year { color: #999; font-size: 0.8rem; width: 44px; text-align: right; flex-shrink: 0; font-family: var(--font-serif); }
.item-row .row-tags { display: flex; gap: 6px; flex-shrink: 0; }
.tag { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; }
.tag-level { background: rgba(184,134,11,0.08); color: var(--color-gold); border: 1px solid rgba(184,134,11,0.25); }
.tag-type { background: rgba(46,109,164,0.08); color: var(--color-accent); border: 1px solid rgba(46,109,164,0.25); }

/* ===== Item Detail ===== */
.item-detail { max-width: 820px; }
.item-meta { display: flex; flex-wrap: wrap; gap: 20px 32px; margin: 16px 0 28px; padding: 20px 24px; background: var(--color-bg-subtle); border-radius: 6px; border-left: 4px solid var(--color-primary); }
.meta-item .meta-label { font-size: 0.72rem; color: #999; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.04em; }
.meta-item .meta-value { font-size: 0.95rem; color: var(--color-text); }
.item-section-title { font-size: 1rem; font-weight: 600; color: var(--color-primary); margin: 28px 0 14px; padding-bottom: 8px; border-bottom: 1px solid var(--color-border); }
.item-description { line-height: 1.8; color: #444; }

/* ===== Image Gallery ===== */
.image-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.gallery-thumb { border-radius: 4px; overflow: hidden; cursor: pointer; aspect-ratio: 4/3; border: 1px solid var(--color-border); }
.gallery-thumb img { width: 100%; height: 100%; object-fit: cover; transition: opacity 0.15s; display: block; }
.gallery-thumb:hover img { opacity: 0.82; }

/* ===== Lightbox ===== */
.lightbox-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.88); z-index: 999; align-items: center; justify-content: center; }
.lightbox-overlay.open { display: flex; }
.lightbox-overlay img { max-width: 92vw; max-height: 90vh; border-radius: 4px; }
.lightbox-close { position: absolute; top: 20px; right: 24px; color: #fff; font-size: 2rem; cursor: pointer; line-height: 1; }

/* ===== File Cards ===== */
.file-list { display: flex; flex-direction: column; gap: 10px; }
.file-card { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border: 1px solid var(--color-border); border-radius: 6px; background: var(--color-bg-subtle); }
.file-icon { font-size: 1.4rem; flex-shrink: 0; }
.file-info { flex: 1; min-width: 0; }
.file-name { font-size: 0.875rem; color: var(--color-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-type { font-size: 0.72rem; color: #aaa; text-transform: uppercase; margin-top: 2px; }
.file-download { flex-shrink: 0; padding: 6px 14px; border: 1px solid var(--color-accent); border-radius: 4px; color: var(--color-accent); font-size: 0.8rem; transition: background 0.15s, color 0.15s; white-space: nowrap; }
.file-download:hover { background: var(--color-accent); color: #fff; text-decoration: none; }
.pdf-preview { margin-top: 10px; border: 1px solid var(--color-border); border-radius: 4px; overflow: hidden; }
.pdf-preview iframe { display: block; width: 100%; height: 600px; border: none; }

/* ===== Year Filter ===== */
.year-filter { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
.year-btn { padding: 5px 13px; border: 1px solid var(--color-border); border-radius: 4px; background: var(--color-bg); cursor: pointer; font-size: 0.85rem; color: var(--color-text); transition: all 0.15s; font-family: var(--font-serif); }
.year-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
.year-btn.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
.item-row.hidden { display: none; }

/* ===== Empty State ===== */
.empty-state { text-align: center; padding: 56px 24px; color: #bbb; font-size: 0.95rem; }

/* ===== Responsive ===== */
@media (max-width: 1200px) {
  .subcategory-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .category-sidebar { display: none; }
  .section-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .section-grid { grid-template-columns: 1fr; }
  .subcategory-grid { grid-template-columns: 1fr; }
  .image-gallery { grid-template-columns: repeat(2, 1fr); }
  .nav-menu { display: none; position: absolute; top: var(--nav-height); left: 0; right: 0; background: var(--color-primary); flex-direction: column; padding: 8px 0; gap: 0; }
  .nav-open .nav-menu { display: flex; }
  .nav-toggle { display: block; }
  .nav-item > a { border-radius: 0; }
  .nav-dropdown { position: static; box-shadow: none; border: none; background: rgba(0,0,0,0.15); display: block; }
  .nav-dropdown li a { color: rgba(255,255,255,0.85); border-color: rgba(255,255,255,0.1); padding-left: 28px; }
  .item-row { flex-wrap: wrap; }
  .item-row .row-tags { width: 100%; padding-left: 36px; }
}
```

- [ ] **Step 6：创建占位 JS 文件（P2 阶段再填充）**

```bash
echo "// lightbox: implemented in P2" > assets/js/lightbox.js
echo "// year-filter: implemented in P2" > assets/js/year-filter.js
```

- [ ] **Step 7：验证构建**

```bash
bundle exec jekyll build
ls _site/assets/css/main.css
```

Expected: 退出码 0，`_site/assets/css/main.css` 存在。

- [ ] **Step 8：Commit**

```bash
git add _data/nav.yml _layouts/default.html _includes/nav.html _includes/breadcrumb.html assets/css/main.css assets/js/
git commit -m "feat: add base layout, navigation, CSS design system"
```

---

### Task 3：首页 + 模板布局

**Files:**
- Create: `_layouts/home.html`
- Create: `_layouts/section.html`
- Create: `_layouts/category.html`
- Create: `_layouts/item.html`
- Create: `_includes/image-gallery.html`
- Create: `_includes/file-card.html`
- Create: `index.html`

- [ ] **Step 1：创建 `_layouts/home.html`**

```html
---
layout: default
---
<div class="page-header">
  <h1>{{ site.title }}</h1>
  <p class="subtitle">{{ site.description }}</p>
</div>

{% assign s_count = site.student_papers.size | plus: site.student_awards.size | plus: site.student_startups.size %}
{% assign t_count = site.teacher_awards.size | plus: site.teacher_projects.size | plus: site.teacher_publications.size %}
{% assign d_count = site.domestic_university.size | plus: site.domestic_school.size | plus: site.xiaohuashi.size %}
{% assign i_count = site.international.size %}

<div class="section-grid">
  <a class="section-card" href="{{ '/student/' | relative_url }}">
    <div class="card-number">01</div>
    <div class="card-title">学生培养</div>
    <div class="card-desc">学生优秀论文、竞赛获奖及创业成果展示</div>
    <div class="card-count">{{ s_count }}<span>项成果</span></div>
  </a>
  <a class="section-card" href="{{ '/teacher/' | relative_url }}">
    <div class="card-number">02</div>
    <div class="card-title">教师成果</div>
    <div class="card-desc">教师获奖、人才培养项目立项及教材专著出版</div>
    <div class="card-count">{{ t_count }}<span>项成果</span></div>
  </a>
  <a class="section-card" href="{{ '/domestic/' | relative_url }}">
    <div class="card-number">03</div>
    <div class="card-title">国内影响力</div>
    <div class="card-desc">高校及中小学应用推广、小花狮系列产品应用</div>
    <div class="card-count">{{ d_count }}<span>项成果</span></div>
  </a>
  <a class="section-card" href="{{ '/international/' | relative_url }}">
    <div class="card-number">04</div>
    <div class="card-title">国际影响力</div>
    <div class="card-desc">国际合作与推广应用成果</div>
    <div class="card-count">{{ i_count }}<span>项成果</span></div>
  </a>
</div>
```

- [ ] **Step 2：创建 `_layouts/section.html`**

```html
---
layout: default
---
{% include breadcrumb.html crumbs=page.breadcrumbs %}
<div class="page-header">
  <h1>{{ page.title }}</h1>
  {% if page.description %}<p class="subtitle">{{ page.description }}</p>{% endif %}
</div>
<div class="subcategory-grid">
  {% for sub in page.subcategories %}
  {% assign col = site[sub.collection] %}
  <a class="subcategory-card" href="{{ sub.url | relative_url }}">
    <div class="sub-label">{{ sub.number }}</div>
    <div class="sub-title">{{ sub.label }}</div>
    <div class="sub-count">{{ col.size }} 项材料</div>
  </a>
  {% endfor %}
</div>
```

- [ ] **Step 3：创建 `_layouts/category.html`**

在 category.html 中用 `site[page.collection_name]` 动态获取条目，`page.collection_name` 由各列表页的 front matter 设置。

```html
---
layout: default
---
{% assign items = site[page.collection_name] | sort: "year" | reverse %}
{% assign years = items | map: "year" | uniq %}

{% capture section_url %}/{{ page.section }}/{% endcapture %}
{% assign crumbs = "" | split: "" %}
{% assign c1 = "" | split: "" %}

{% include breadcrumb.html crumbs=page.breadcrumbs %}

<div class="category-layout">
  <aside class="category-sidebar">
    <h3>{{ page.section_label }}</h3>
    <nav class="sidebar-nav">
      {% for item in site.data.nav %}
      {% if item.id == page.section_id %}
      {% for child in item.children %}
      <a href="{{ child.url | relative_url }}"
         {% if page.url == child.url %}class="active"{% endif %}>{{ child.label }}</a>
      {% endfor %}
      {% endif %}
      {% endfor %}
    </nav>
  </aside>

  <div class="category-content">
    <div class="page-header">
      <h1>{{ page.title }}</h1>
    </div>

    {% if years.size > 0 %}
    <div class="year-filter" id="yearFilter">
      <button class="year-btn active" data-year="all">全部</button>
      {% for year in years %}
      <button class="year-btn" data-year="{{ year }}">{{ year }}</button>
      {% endfor %}
    </div>
    {% endif %}

    {% if items.size > 0 %}
    <div class="item-list" id="itemList">
      {% for item in items %}
      <div class="item-row" data-year="{{ item.year }}">
        <span class="row-num">{{ forloop.index }}</span>
        <div class="row-title">
          <a href="{{ item.url | relative_url }}">{{ item.title }}</a>
        </div>
        <span class="row-year">{{ item.year }}</span>
        <div class="row-tags">
          {% if item.level %}<span class="tag tag-level">{{ item.level }}</span>{% endif %}
          {% if item.award %}<span class="tag tag-level">{{ item.award }}</span>{% endif %}
          {% if item.project_type %}<span class="tag tag-type">{{ item.project_type }}</span>{% endif %}
          {% if item.stage %}<span class="tag tag-type">{{ item.stage }}</span>{% endif %}
        </div>
      </div>
      {% endfor %}
    </div>
    {% else %}
    <div class="empty-state">
      <p>暂无材料，请通过后台上传</p>
    </div>
    {% endif %}
  </div>
</div>
```

- [ ] **Step 4：创建 `_layouts/item.html`**

```html
---
layout: default
---
{% assign section_url = "/" | append: page.section | append: "/" %}
{% assign cat_url = "/" | append: page.section | append: "/" | append: page.category | append: "/" %}
{% assign crumbs = "" | split: "," %}

<nav class="breadcrumb">
  <a href="{{ '/' | relative_url }}">首页</a>
  <span class="breadcrumb-sep">›</span>
  <a href="{{ section_url | relative_url }}">{{ page.section_label }}</a>
  <span class="breadcrumb-sep">›</span>
  <a href="{{ cat_url | relative_url }}">{{ page.category_label }}</a>
  <span class="breadcrumb-sep">›</span>
  <span>{{ page.title }}</span>
</nav>

<div class="item-detail">
  <div class="page-header">
    <h1>{{ page.title }}</h1>
  </div>

  <div class="item-meta">
    {% if page.author %}<div class="meta-item"><div class="meta-label">作者/负责人</div><div class="meta-value">{{ page.author }}</div></div>{% endif %}
    {% if page.year %}<div class="meta-item"><div class="meta-label">年份</div><div class="meta-value">{{ page.year }}</div></div>{% endif %}
    {% if page.level %}<div class="meta-item"><div class="meta-label">级别</div><div class="meta-value"><span class="tag tag-level">{{ page.level }}</span></div></div>{% endif %}
    {% if page.journal %}<div class="meta-item"><div class="meta-label">期刊/会议</div><div class="meta-value">{{ page.journal }}</div></div>{% endif %}
    {% if page.competition %}<div class="meta-item"><div class="meta-label">竞赛名称</div><div class="meta-value">{{ page.competition }}</div></div>{% endif %}
    {% if page.award %}<div class="meta-item"><div class="meta-label">奖项等级</div><div class="meta-value"><span class="tag tag-level">{{ page.award }}</span></div></div>{% endif %}
    {% if page.award_name %}<div class="meta-item"><div class="meta-label">奖项名称</div><div class="meta-value">{{ page.award_name }}</div></div>{% endif %}
    {% if page.organization %}<div class="meta-item"><div class="meta-label">颁奖/合作单位</div><div class="meta-value">{{ page.organization }}</div></div>{% endif %}
    {% if page.publisher %}<div class="meta-item"><div class="meta-label">出版社</div><div class="meta-value">{{ page.publisher }}</div></div>{% endif %}
    {% if page.isbn %}<div class="meta-item"><div class="meta-label">ISBN</div><div class="meta-value">{{ page.isbn }}</div></div>{% endif %}
    {% if page.project_type %}<div class="meta-item"><div class="meta-label">项目类型</div><div class="meta-value">{{ page.project_type }}</div></div>{% endif %}
    {% if page.funding %}<div class="meta-item"><div class="meta-label">经费</div><div class="meta-value">{{ page.funding }}</div></div>{% endif %}
    {% if page.institution %}<div class="meta-item"><div class="meta-label">推广学校</div><div class="meta-value">{{ page.institution }}</div></div>{% endif %}
    {% if page.province %}<div class="meta-item"><div class="meta-label">省份</div><div class="meta-value">{{ page.province }}</div></div>{% endif %}
    {% if page.country %}<div class="meta-item"><div class="meta-label">国家/地区</div><div class="meta-value">{{ page.country }}</div></div>{% endif %}
    {% if page.product_name %}<div class="meta-item"><div class="meta-label">产品名称</div><div class="meta-value">{{ page.product_name }}</div></div>{% endif %}
    {% if page.usage_count %}<div class="meta-item"><div class="meta-label">应用数量</div><div class="meta-value">{{ page.usage_count }}</div></div>{% endif %}
  </div>

  {% if page.description %}
  <div class="item-section-title">说明</div>
  <div class="item-description">{{ page.description }}</div>
  {% endif %}

  {% if content != "" %}
  <div class="item-section-title">详细内容</div>
  <div class="item-description">{{ content }}</div>
  {% endif %}

  {% if page.images and page.images.size > 0 %}
  <div class="item-section-title">图片</div>
  {% include image-gallery.html images=page.images %}
  {% endif %}

  {% if page.files and page.files.size > 0 %}
  <div class="item-section-title">文件</div>
  {% include file-card.html files=page.files %}
  {% endif %}
</div>
```

- [ ] **Step 5：创建 `_includes/image-gallery.html`**

```html
{% if include.images and include.images.size > 0 %}
<div class="image-gallery">
  {% for img in include.images %}
  <div class="gallery-thumb" data-src="{{ img | relative_url }}">
    <img src="{{ img | relative_url }}" alt="图片 {{ forloop.index }}" loading="lazy">
  </div>
  {% endfor %}
</div>
<div class="lightbox-overlay" id="lightbox" onclick="closeLightbox()">
  <span class="lightbox-close">×</span>
  <img id="lightboxImg" src="" alt="预览">
</div>
{% endif %}
```

- [ ] **Step 6：创建 `_includes/file-card.html`**

```html
{% if include.files and include.files.size > 0 %}
<div class="file-list">
  {% for file in include.files %}
  {% assign ext = file | split: "." | last | downcase %}
  <div class="file-card">
    {% if ext == "pdf" %}
      <span class="file-icon">📄</span>
    {% elsif ext == "doc" or ext == "docx" %}
      <span class="file-icon">📝</span>
    {% elsif ext == "jpg" or ext == "jpeg" or ext == "png" or ext == "gif" %}
      <span class="file-icon">🖼️</span>
    {% elsif ext == "ppt" or ext == "pptx" %}
      <span class="file-icon">📊</span>
    {% else %}
      <span class="file-icon">📎</span>
    {% endif %}
    <div class="file-info">
      <div class="file-name">{{ file | split: "/" | last }}</div>
      <div class="file-type">{{ ext }}</div>
    </div>
    <a class="file-download" href="{{ file | relative_url }}" download>下载</a>
  </div>
  {% if ext == "pdf" %}
  <div class="pdf-preview">
    <iframe src="{{ file | relative_url }}" title="PDF 预览"></iframe>
  </div>
  {% endif %}
  {% endfor %}
</div>
{% endif %}
```

- [ ] **Step 7：创建 `index.html`**

```html
---
layout: home
title: 首页
---
```

- [ ] **Step 8：验证构建**

```bash
bundle exec jekyll build
ls _site/index.html
```

Expected: 退出码 0，`_site/index.html` 存在。

- [ ] **Step 9：Commit**

```bash
git add _layouts/ _includes/ index.html
git commit -m "feat: add all layouts and component includes"
```

---

### Task 4：第一个完整分类（学生优秀论文）

验证从内容文件到页面展示的完整链路。

**Files:**
- Create: `student/index.html`
- Create: `student/papers/index.html`
- Create: `_collections/_student_papers/paper-sample-2024.md`

- [ ] **Step 1：创建 `student/index.html`**

```html
---
layout: section
title: "1 学生培养"
description: "学生优秀论文、竞赛获奖及创业成果展示"
breadcrumbs:
  - label: "学生培养"
subcategories:
  - number: "1-1"
    label: "学生优秀论文"
    url: /student/papers/
    collection: student_papers
  - number: "1-2"
    label: "学生竞赛获奖"
    url: /student/awards/
    collection: student_awards
  - number: "1-3"
    label: "学生创业成果"
    url: /student/startups/
    collection: student_startups
permalink: /student/
---
```

- [ ] **Step 2：创建 `student/papers/index.html`**

```html
---
layout: category
title: "学生优秀论文"
section_id: student
section_label: "学生培养"
section: student
collection_name: student_papers
breadcrumbs:
  - label: "学生培养"
    url: /student/
  - label: "学生优秀论文"
permalink: /student/papers/
---
```

- [ ] **Step 3：创建示例内容文件 `_collections/_student_papers/paper-sample-2024.md`**

```markdown
---
title: "基于深度学习的个性化学习路径推荐系统研究"
author: "张伟"
year: 2024
journal: "计算机教育"
level: "国家级"
description: "本文提出了一种基于深度学习的个性化学习路径推荐算法，在真实教学数据上验证了方法的有效性。"
images: []
files: []
featured: true
---
```

- [ ] **Step 4：验证构建并检查生成页面**

```bash
bundle exec jekyll build
ls _site/student/index.html
ls _site/student/papers/index.html
ls _site/student/papers/paper-sample-2024/index.html
```

Expected: 三个文件均存在，退出码 0。

- [ ] **Step 5：本地预览（可选）**

```bash
bundle exec jekyll serve --open-url
```

Expected: 浏览器打开 `http://localhost:4000`，可以看到首页 → 学生培养 → 学生优秀论文列表 → 示例条目详情。

- [ ] **Step 6：Commit**

```bash
git add student/ _collections/_student_papers/
git commit -m "feat: add student section with papers category and sample content"
```

---

### Task 5：Decap CMS 接入

**Files:**
- Create: `admin/index.html`
- Create: `admin/config.yml`

**前置操作（手动，由用户完成）：**

1. 在 GitHub 进入 Settings → Developer settings → OAuth Apps → New OAuth App
2. 填写：
   - Application name: `edu_showcase CMS`
   - Homepage URL: `https://YOUR_GITHUB_USERNAME.github.io/edu_showcase`
   - Authorization callback URL: `https://YOUR_GITHUB_USERNAME.github.io/edu_showcase`
3. 点击 Register，记录 **Client ID**（不需要 Secret）

- [ ] **Step 1：创建 `admin/index.html`**

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>内容管理后台</title>
</head>
<body>
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
</body>
</html>
```

- [ ] **Step 2：创建 `admin/config.yml`**

将 `YOUR_GITHUB_USERNAME` 替换为实际 GitHub 用户名，`YOUR_OAUTH_APP_CLIENT_ID` 替换为上面记录的 Client ID。

```yaml
backend:
  name: github
  repo: YOUR_GITHUB_USERNAME/edu_showcase
  branch: main
  auth_type: pkce
  app_id: YOUR_OAUTH_APP_CLIENT_ID

media_folder: assets/uploads
public_folder: /assets/uploads

locale: zh_Hans

collections:
  - name: student_papers
    label: "1-1 学生优秀论文"
    folder: _collections/_student_papers
    create: true
    slug: "{{year}}-{{slug}}"
    fields:
      - { name: title, label: 标题, widget: string }
      - { name: year, label: 年份, widget: number, default: 2024 }
      - { name: author, label: 作者, widget: string }
      - { name: journal, label: 期刊/会议名称, widget: string, required: false }
      - name: level
        label: 级别
        widget: select
        options: ["校级", "省级", "国家级"]
        required: false
      - { name: description, label: 说明, widget: text, required: false }
      - name: images
        label: 图片
        widget: list
        required: false
        field: { name: image, label: 图片, widget: image }
      - name: files
        label: 文件
        widget: list
        required: false
        field: { name: file, label: 文件, widget: file }
      - { name: featured, label: 重点展示, widget: boolean, default: false }

  - name: student_awards
    label: "1-2 学生竞赛获奖"
    folder: _collections/_student_awards
    create: true
    slug: "{{year}}-{{slug}}"
    fields:
      - { name: title, label: 标题, widget: string }
      - { name: year, label: 年份, widget: number, default: 2024 }
      - { name: author, label: 学生姓名, widget: string }
      - { name: competition, label: 竞赛名称, widget: string }
      - name: award
        label: 奖项等级
        widget: select
        options: ["特等奖", "一等奖", "二等奖", "三等奖", "优秀奖"]
        required: false
      - { name: description, label: 说明, widget: text, required: false }
      - name: images
        label: 图片
        widget: list
        required: false
        field: { name: image, label: 图片, widget: image }
      - name: files
        label: 文件
        widget: list
        required: false
        field: { name: file, label: 文件, widget: file }
      - { name: featured, label: 重点展示, widget: boolean, default: false }

  - name: student_startups
    label: "1-3 学生创业成果"
    folder: _collections/_student_startups
    create: true
    slug: "{{year}}-{{slug}}"
    fields:
      - { name: title, label: 标题, widget: string }
      - { name: year, label: 年份, widget: number, default: 2024 }
      - { name: author, label: 负责人, widget: string }
      - { name: project_name, label: 项目名称, widget: string }
      - name: stage
        label: 阶段
        widget: select
        options: ["立项", "孵化", "落地"]
        required: false
      - { name: description, label: 说明, widget: text, required: false }
      - name: images
        label: 图片
        widget: list
        required: false
        field: { name: image, label: 图片, widget: image }
      - name: files
        label: 文件
        widget: list
        required: false
        field: { name: file, label: 文件, widget: file }
      - { name: featured, label: 重点展示, widget: boolean, default: false }

  - name: teacher_awards
    label: "2-1 教师获奖"
    folder: _collections/_teacher_awards
    create: true
    slug: "{{year}}-{{slug}}"
    fields:
      - { name: title, label: 标题, widget: string }
      - { name: year, label: 年份, widget: number, default: 2024 }
      - { name: author, label: 获奖教师, widget: string }
      - { name: award_name, label: 奖项名称, widget: string }
      - { name: organization, label: 颁奖单位, widget: string }
      - { name: description, label: 说明, widget: text, required: false }
      - name: images
        label: 图片
        widget: list
        required: false
        field: { name: image, label: 图片, widget: image }
      - name: files
        label: 文件
        widget: list
        required: false
        field: { name: file, label: 文件, widget: file }
      - { name: featured, label: 重点展示, widget: boolean, default: false }

  - name: teacher_projects
    label: "2-2 人才培养项目立项"
    folder: _collections/_teacher_projects
    create: true
    slug: "{{year}}-{{slug}}"
    fields:
      - { name: title, label: 项目名称, widget: string }
      - { name: year, label: 年份, widget: number, default: 2024 }
      - { name: author, label: 负责人, widget: string }
      - name: project_type
        label: 项目类型
        widget: select
        options: ["国家级", "省级", "校级"]
      - { name: funding, label: 经费（万元）, widget: string, required: false }
      - { name: description, label: 说明, widget: text, required: false }
      - name: images
        label: 图片
        widget: list
        required: false
        field: { name: image, label: 图片, widget: image }
      - name: files
        label: 文件
        widget: list
        required: false
        field: { name: file, label: 文件, widget: file }
      - { name: featured, label: 重点展示, widget: boolean, default: false }

  - name: teacher_publications
    label: "2-3 教材、专著出版"
    folder: _collections/_teacher_publications
    create: true
    slug: "{{year}}-{{slug}}"
    fields:
      - { name: title, label: 书名, widget: string }
      - { name: year, label: 出版年份, widget: number, default: 2024 }
      - { name: author, label: 作者, widget: string }
      - { name: publisher, label: 出版社, widget: string }
      - { name: isbn, label: ISBN, widget: string, required: false }
      - { name: description, label: 说明, widget: text, required: false }
      - name: images
        label: 封面图片
        widget: list
        required: false
        field: { name: image, label: 图片, widget: image }
      - name: files
        label: 文件
        widget: list
        required: false
        field: { name: file, label: 文件, widget: file }
      - { name: featured, label: 重点展示, widget: boolean, default: false }

  - name: domestic_university
    label: "3-1 高校应用推广证明材料"
    folder: _collections/_domestic_university
    create: true
    slug: "{{year}}-{{slug}}"
    fields:
      - { name: title, label: 标题, widget: string }
      - { name: year, label: 年份, widget: number, default: 2024 }
      - { name: institution, label: 学校名称, widget: string }
      - { name: province, label: 省份, widget: string, required: false }
      - { name: description, label: 说明, widget: text, required: false }
      - name: images
        label: 图片
        widget: list
        required: false
        field: { name: image, label: 图片, widget: image }
      - name: files
        label: 证明材料文件
        widget: list
        required: false
        field: { name: file, label: 文件, widget: file }
      - { name: featured, label: 重点展示, widget: boolean, default: false }

  - name: domestic_school
    label: "3-2 中小学应用推广证明材料"
    folder: _collections/_domestic_school
    create: true
    slug: "{{year}}-{{slug}}"
    fields:
      - { name: title, label: 标题, widget: string }
      - { name: year, label: 年份, widget: number, default: 2024 }
      - { name: school_name, label: 学校名称, widget: string }
      - { name: region, label: 地区, widget: string, required: false }
      - { name: description, label: 说明, widget: text, required: false }
      - name: images
        label: 图片
        widget: list
        required: false
        field: { name: image, label: 图片, widget: image }
      - name: files
        label: 证明材料文件
        widget: list
        required: false
        field: { name: file, label: 文件, widget: file }
      - { name: featured, label: 重点展示, widget: boolean, default: false }

  - name: xiaohuashi
    label: "3-3 小花狮系列产品应用"
    folder: _collections/_xiaohuashi
    create: true
    slug: "{{year}}-{{slug}}"
    fields:
      - { name: title, label: 标题, widget: string }
      - { name: year, label: 年份, widget: number, default: 2024 }
      - { name: product_name, label: 产品名称, widget: string }
      - { name: usage_count, label: 应用数量, widget: string, required: false }
      - { name: description, label: 说明, widget: text, required: false }
      - name: images
        label: 图片
        widget: list
        required: false
        field: { name: image, label: 图片, widget: image }
      - name: files
        label: 文件
        widget: list
        required: false
        field: { name: file, label: 文件, widget: file }
      - { name: featured, label: 重点展示, widget: boolean, default: false }

  - name: international
    label: "4 国际影响力"
    folder: _collections/_international
    create: true
    slug: "{{year}}-{{slug}}"
    fields:
      - { name: title, label: 标题, widget: string }
      - { name: year, label: 年份, widget: number, default: 2024 }
      - { name: author, label: 负责人, widget: string }
      - { name: country, label: 国家/地区, widget: string }
      - { name: organization, label: 合作机构, widget: string, required: false }
      - { name: description, label: 说明, widget: text, required: false }
      - name: images
        label: 图片
        widget: list
        required: false
        field: { name: image, label: 图片, widget: image }
      - name: files
        label: 文件
        widget: list
        required: false
        field: { name: file, label: 文件, widget: file }
      - { name: featured, label: 重点展示, widget: boolean, default: false }
```

- [ ] **Step 3：验证 admin 页面构建**

```bash
bundle exec jekyll build
ls _site/admin/index.html
ls _site/admin/config.yml
```

Expected: 两个文件均存在。

- [ ] **Step 4：Commit**

```bash
git add admin/
git commit -m "feat: add Decap CMS admin with all 10 collection definitions"
```

- [ ] **Step 5：在 GitHub 仓库设置 Pages 使用 GitHub Actions**

手动操作：进入仓库 → Settings → Pages → Source 选择 **GitHub Actions**。

- [ ] **Step 6：Push 到 GitHub 触发部署**

```bash
git push origin main
```

Expected: GitHub Actions 工作流成功运行，网站部署到 `https://YOUR_GITHUB_USERNAME.github.io/edu_showcase`。

---

## Phase P1：剩余页面 + 完整站点

### Task 6：补全所有分类页面

**Files:**
- Create: `student/awards/index.html`
- Create: `student/startups/index.html`
- Create: `teacher/index.html`
- Create: `teacher/awards/index.html`
- Create: `teacher/projects/index.html`
- Create: `teacher/publications/index.html`
- Create: `domestic/index.html`
- Create: `domestic/university/index.html`
- Create: `domestic/school/index.html`
- Create: `domestic/xiaohuashi/index.html`
- Create: `international/index.html`

- [ ] **Step 1：创建 `student/awards/index.html`**

```html
---
layout: category
title: "学生竞赛获奖"
section_id: student
section_label: "学生培养"
section: student
collection_name: student_awards
breadcrumbs:
  - label: "学生培养"
    url: /student/
  - label: "学生竞赛获奖"
permalink: /student/awards/
---
```

- [ ] **Step 2：创建 `student/startups/index.html`**

```html
---
layout: category
title: "学生创业成果"
section_id: student
section_label: "学生培养"
section: student
collection_name: student_startups
breadcrumbs:
  - label: "学生培养"
    url: /student/
  - label: "学生创业成果"
permalink: /student/startups/
---
```

- [ ] **Step 3：创建 `teacher/index.html`**

```html
---
layout: section
title: "2 教师成果"
description: "教师获奖、人才培养项目立项及教材专著出版"
breadcrumbs:
  - label: "教师成果"
subcategories:
  - number: "2-1"
    label: "教师获奖"
    url: /teacher/awards/
    collection: teacher_awards
  - number: "2-2"
    label: "人才培养项目立项"
    url: /teacher/projects/
    collection: teacher_projects
  - number: "2-3"
    label: "教材、专著出版"
    url: /teacher/publications/
    collection: teacher_publications
permalink: /teacher/
---
```

- [ ] **Step 4：创建 `teacher/awards/index.html`**

```html
---
layout: category
title: "教师获奖"
section_id: teacher
section_label: "教师成果"
section: teacher
collection_name: teacher_awards
breadcrumbs:
  - label: "教师成果"
    url: /teacher/
  - label: "教师获奖"
permalink: /teacher/awards/
---
```

- [ ] **Step 5：创建 `teacher/projects/index.html`**

```html
---
layout: category
title: "人才培养项目立项"
section_id: teacher
section_label: "教师成果"
section: teacher
collection_name: teacher_projects
breadcrumbs:
  - label: "教师成果"
    url: /teacher/
  - label: "人才培养项目立项"
permalink: /teacher/projects/
---
```

- [ ] **Step 6：创建 `teacher/publications/index.html`**

```html
---
layout: category
title: "教材、专著出版"
section_id: teacher
section_label: "教师成果"
section: teacher
collection_name: teacher_publications
breadcrumbs:
  - label: "教师成果"
    url: /teacher/
  - label: "教材、专著出版"
permalink: /teacher/publications/
---
```

- [ ] **Step 7：创建 `domestic/index.html`**

```html
---
layout: section
title: "3 国内影响力"
description: "高校及中小学应用推广、小花狮系列产品应用"
breadcrumbs:
  - label: "国内影响力"
subcategories:
  - number: "3-1"
    label: "高校应用推广证明材料"
    url: /domestic/university/
    collection: domestic_university
  - number: "3-2"
    label: "中小学应用推广证明材料"
    url: /domestic/school/
    collection: domestic_school
  - number: "3-3"
    label: "小花狮系列产品应用"
    url: /domestic/xiaohuashi/
    collection: xiaohuashi
permalink: /domestic/
---
```

- [ ] **Step 8：创建 `domestic/university/index.html`**

```html
---
layout: category
title: "高校应用推广证明材料"
section_id: domestic
section_label: "国内影响力"
section: domestic
collection_name: domestic_university
breadcrumbs:
  - label: "国内影响力"
    url: /domestic/
  - label: "高校应用推广证明材料"
permalink: /domestic/university/
---
```

- [ ] **Step 9：创建 `domestic/school/index.html`**

```html
---
layout: category
title: "中小学应用推广证明材料"
section_id: domestic
section_label: "国内影响力"
section: domestic
collection_name: domestic_school
breadcrumbs:
  - label: "国内影响力"
    url: /domestic/
  - label: "中小学应用推广证明材料"
permalink: /domestic/school/
---
```

- [ ] **Step 10：创建 `domestic/xiaohuashi/index.html`**

```html
---
layout: category
title: "小花狮系列产品应用"
section_id: domestic
section_label: "国内影响力"
section: domestic
collection_name: xiaohuashi
breadcrumbs:
  - label: "国内影响力"
    url: /domestic/
  - label: "小花狮系列产品应用"
permalink: /domestic/xiaohuashi/
---
```

- [ ] **Step 11：创建 `international/index.html`**

国际影响力是单页（无子分类），直接使用 category layout，section_id 设为 international，导航不展开下拉。

```html
---
layout: category
title: "4 国际影响力"
section_id: international
section_label: "国际影响力"
section: international
collection_name: international
breadcrumbs:
  - label: "国际影响力"
permalink: /international/
---
```

- [ ] **Step 12：验证全站构建**

```bash
bundle exec jekyll build
ls _site/student/awards/index.html
ls _site/student/startups/index.html
ls _site/teacher/index.html
ls _site/domestic/index.html
ls _site/international/index.html
```

Expected: 所有文件存在，退出码 0。

- [ ] **Step 13：Commit**

```bash
git add student/ teacher/ domestic/ international/
git commit -m "feat: add all section and category pages"
```

---

## Phase P2：体验增强

### Task 7：图片 Lightbox

**Files:**
- Modify: `assets/js/lightbox.js`

- [ ] **Step 1：实现 `assets/js/lightbox.js`**

```javascript
document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.getElementById('lightbox');
  if (!overlay) return;

  var img = document.getElementById('lightboxImg');

  document.querySelectorAll('.gallery-thumb').forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      img.src = this.dataset.src;
      overlay.classList.add('open');
    });
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay || e.target.classList.contains('lightbox-close')) {
      overlay.classList.remove('open');
      img.src = '';
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      overlay.classList.remove('open');
      img.src = '';
    }
  });
});
```

- [ ] **Step 2：验证构建**

```bash
bundle exec jekyll build
grep -l "lightbox" _site/assets/js/lightbox.js
```

Expected: 退出码 0，文件包含 lightbox 代码。

- [ ] **Step 3：Commit**

```bash
git add assets/js/lightbox.js
git commit -m "feat: add image lightbox with keyboard support"
```

---

### Task 8：年份筛选器

**Files:**
- Modify: `assets/js/year-filter.js`

- [ ] **Step 1：实现 `assets/js/year-filter.js`**

```javascript
document.addEventListener('DOMContentLoaded', function () {
  var filterBar = document.getElementById('yearFilter');
  var list = document.getElementById('itemList');
  if (!filterBar || !list) return;

  filterBar.addEventListener('click', function (e) {
    var btn = e.target.closest('.year-btn');
    if (!btn) return;

    filterBar.querySelectorAll('.year-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');

    var year = btn.dataset.year;
    list.querySelectorAll('.item-row').forEach(function (row) {
      if (year === 'all' || row.dataset.year === year) {
        row.classList.remove('hidden');
      } else {
        row.classList.add('hidden');
      }
    });
  });
});
```

- [ ] **Step 2：验证构建**

```bash
bundle exec jekyll build
grep -l "yearFilter" _site/assets/js/year-filter.js
```

Expected: 退出码 0，文件包含筛选器代码。

- [ ] **Step 3：Commit**

```bash
git add assets/js/year-filter.js
git commit -m "feat: add year filter for category list pages"
```

---

## 部署后配置检查清单

部署完成后，在浏览器中验证以下内容：

- [ ] `https://YOUR_USERNAME.github.io/edu_showcase/` — 首页显示 4 个模块卡片
- [ ] `/student/papers/` — 列表页显示示例条目
- [ ] `/student/papers/paper-sample-2024/` — 详情页显示元数据
- [ ] `/admin/` — Decap CMS 后台显示，点击 Login with GitHub 可以登录
- [ ] 登录后台 → 新建学生优秀论文 → 发布 → 约 2 分钟后在列表页看到新条目
- [ ] 上传 PDF → 条目详情页显示内嵌预览和下载按钮
- [ ] 上传图片 → 条目详情页显示缩略图，点击可放大（P2）
- [ ] 年份筛选器点击后过滤列表（P2）
