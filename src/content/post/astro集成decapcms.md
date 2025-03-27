---
title: Astro集成DecapCMS
description: 在Astro上使用Decap无头CMS来网页编辑文章，任意地点网页都可以快速写文章，畅快的Blog书写节奏，部署在Cloudflare，使用GitHub
  Oauth验证
publishDate: 2025-03-16T18:37:00.000Z
tags:
  - 无头CMS
---
静态站点很好，就是更新文章有点麻烦。无头CMS很好解决痛点。写文章登录就开干，



## 条件

- Github 用作身份验证
- Cloudflare 部署CMS

## 创建Github OAuth

https://github.com/settings/developers

创建一个Oauth，所有Url均填写你的网站链接，列如https://0.123456.xyz

保存页面的两个数据备用

`Client ID`和`Client secrets`

## CMS
下载项目文件 https://github.com/i40west/netlify-cms-cloudflare-pages 

`admin` 放至 `/public/admin`

`functions` 放至 `/`

## 最重要 Config.yaml

定义了文章结构、网关验证、媒体资源，设定错误根本用不了

提供几个主题的模板，自行修改。

### Astro-paper

```yaml

 backend:
  name: github
  repo: user/astro-paper
  branch: main # Branch to update (optional; defaults to master)
  site_domain: https://blog.com
  base_url: https://blog.com
  auth_endpoint: /api/auth

media_folder: src/assets/images
public_folder: "@/assets/images"

collections:
  - name: 'blog'
    label: 'blog'
    folder: 'src/data/blog'
    create: true
    editor:
      preview: true
      frame: true
    sortable_fields: ["publishDate","modDatetime"]
    fields:
      - { label: '标题', name: 'title', widget: 'string' ,required: true}
      - { label: '描述', name: 'description', widget: 'string',required: true}
      - { label: '发布日期', name: 'publishDate', widget: 'datetime',required: true}
      - { label: '更新日期', name: 'modDatetime', widget: 'datetime',required: false}
      - { label: "标签", name: "tags", widget: "list",required: false, hint: "输入标签使用英文逗号分割，无限制数量。列如：标签1,标签2,标签3" }
      - { label: '正文', name: 'body', widget: 'markdown',required: true}

```

### Astro Cactus

```yaml
backend:
  name: github
  repo: user/astro-theme-cactus
  branch: main # Branch to update (optional; defaults to master)
  site_domain: https://blog.com
  base_url: https://blog.com
  auth_endpoint: /api/auth

media_folder: src/assets/images
public_folder: /assets/images

collections:
  # Post collection
  - name: 'post'
    label: 'POST'
    folder: 'src/content/post'
    create: true
    slug: '{{slug}}'
    editor:
      preview: true
      frame: true
    fields:
      - { label: '标题', name: 'title', widget: 'string' ,required: true}
      - { label: '发布日期', name: 'published', widget: 'datetime', date_format: "YYYY-MM-DD",required: true}
      - { label: '描述', name: 'description', widget: 'string' ,required: true}
      - { label: "标签", name: "tags", widget: "list" }
      - { label: '正文', name: 'body', widget: 'markdown' }

  # Note collection
  - name: 'note'
    label: 'NOTE'
    folder: 'src/content/note'
    create: true
    slug: '{{slug}}'
    editor:
      preview: true
      frame: true
    fields:
      - { label: '标题', name: 'title', widget: 'string' ,required: true}
      - { label: '发布日期', name: 'published', widget: 'string',pattern: ['^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$', "请使用 ISO 8601 格式，例如 2024-03-04T14:30:00Z"],required: true}
      - { label: '正文', name: 'body', widget: 'markdown' }
```

### Astro fuwari

```yaml
backend:
  name: github
  repo: user/fuwari
  branch: main # Branch to update (optional; defaults to master)
  site_domain: https://blog.com
  base_url: https://blog.com
  auth_endpoint: /api/auth

media_folder: public/images
public_folder: /images

collections:
  - name: 'posts'
    label: 'posts'
    folder: 'src/content/posts'
    create: true
    editor:
      preview: true
      frame: true
    sortable_fields: ["published","updated"]
    summary: "{{published}} {{title}}"
    fields:
      - { label: "封面",name: "image",widget: "image",required: false, choose_url: true,hint: "可以上传也可以插入链接",}
      - { label: '标题', name: 'title', widget: 'string' ,required: true}
      - { label: '发布日期', name: 'published', widget: 'datetime',required: true , date_format: "YYYY-MM-DD"}
      - { label: '更新日期', name: 'updated', widget: 'datetime',required: false,  date_format: "YYYY-MM-DD"}
      - { label: '描述', name: 'description', widget: 'string',required: false}
      - { label: "分类", name: "category", widget: "string",required: false, hint: "输入一个分类名，不可多个分类名"}
      - { label: "标签", name: "tags", widget: "list",required: false, hint: "输入标签使用英文逗号分割，无限制数量。列如：标签1,标签2,标签3" }
      - { label: '正文', name: 'body', widget: 'markdown'}

  - name: 'spec'
    label: 'spec'
    folder: 'src/content/spec'
    create: true
    editor:
      preview: true
      frame: true
    summary: "{{filename}}"
    sortable_fields: [""]
    fields:
      - { label: '路径', name: "title", widget: "string",required: true, hint: "使用小写英文路径 , 仅创建时有效。创建完不支持修改，必须手动修改src/content/spec/下的文件名" }
      - { label: '正文', name: 'body',widget: 'markdown'}
```

## 部署到cloudflare Pages

创建时添加上方提到的两个变量。
```
GITHUB_CLIENT_ID = Client ID
GITHUB_CLIENT_SECRET = Client secrets
```

这时访问你的网站 `/admin`

例如`https://blog.com/admin`

授权Github 登陆即可访问后台


## 给资源套CDN

这适合github

修改config
```
media_folder: public/images
public_folder: "https://cdn.jsdelivr.net/gh/user/repo@main/public/images"
```

是的，支持自定义前缀

## 编译失败

这可能出现大部分主题，可能的问题是 CMS被当作需要编译的文件了。这需要忽略掉

修改文件 `tsconfig.json` 

```
"exclude": ["dist", "public/pagefind","functions","public/admin"],
```
