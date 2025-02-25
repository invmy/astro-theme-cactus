---
title: Astro Cactus主题配合无头CMS decap配置
publishDate: 2025-02-25T12:14:42.827Z
description: 网页中流畅的CMS体验
tags:
  - 折腾
---
## 项目
https://github.com/i40west/netlify-cms-cloudflare-pages

## 准备

Cloudflare 账号
Github 账号

## 创建Github OAuth

https://github.com/settings/developers

创建一个Oauth，所有Url均填写你的网站链接

列如https://0.123456.xyz

保存页面的两个数据备用，Client ID和Client secrets

## CMS程序
下载项目文件

admin放到公开目录，比如astro的public
functions 放到根目录 /

## 编辑config.yml
编辑配置以适配你的md文档格式。具体询问chatgpt或者抄别人的。

按需修改，name不要动。主要修改域名
```
backend:
  name: github
  repo: user/astro-theme-cactus
  branch: main # Branch to update (optional; defaults to master)
  site_domain: https://0.123456.xyz
  base_url: https://0.123456.xyz
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
      preview: false
    fields:
      - { label: '标题', name: 'title', widget: 'string' ,required: true}
      - { label: '发布日期', name: 'publishDate', widget: 'datetime', date_format: "YYYY-MM-DD", required: true}
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
      preview: false
    fields:
      - { label: '标题', name: 'title', widget: 'string' ,required: true}
      - { label: '发布日期', name: 'publishDate', widget: 'datetime', date_format: "YYYY-MM-DD", required: true}
      - { label: '正文', name: 'body', preview: true, widget: 'markdown' }

```

## 部署到cloudflare Pages
确保你的程序再次之前能正常编译。

创建时添加上方提到的两个变量。
```
GITHUB_CLIENT_ID = Client ID
GITHUB_CLIENT_SECRET = Client secrets
```

这时访问你的网站/admin

例如https://0.123456.xyz/admin

## 无法验证OA
检测是否填错网址
