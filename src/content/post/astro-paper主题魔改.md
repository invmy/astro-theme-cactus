---
title: Astro-Paper主题魔改
description: 本站修改Paper主题记录 最小程度修改
publishDate: 2025-03-16T18:56:00.000Z
tags:
  - Astro
---
抛弃花里胡哨特效、专注文章内容

这是我使用astro-paper的修改



## 目录

未修改代码，

需要添加目录的文章添加 `` 会自动生成并折叠

```ts
astro.config.ts

remarkPlugins: [remarkToc, [remarkCollapse, { test: "Table of contents" }]],
修改到
remarkPlugins: [remarkToc, [remarkCollapse, { test: "TOC" }]],
```

## 字体

貌似是BUG，除了英文其他字体根本没生效！中文全部都是宋体。修复代码只需要加入font-sans

```css
src\styles\global.css

  body {
    @apply flex min-h-svh flex-col bg-background font-mono text-foreground selection:bg-accent/75 selection:text-background;
  }

修改后

  body {
    @apply flex min-h-svh flex-col bg-background font-mono font-sans text-foreground selection:bg-accent/75 selection:text-background;
  }
```

## OGimage

修复中文生成错误

```ts
src\utils\loadGoogleFont.ts

  const fontsConfig = [
    {
      name: "Noto Sans SC",
      font: "Noto+Sans+SC",
      weight: 100,
      style: "thin",
    },
    {
      name: "Noto Sans SC",
      font: "Noto+Sans+SC",
      weight: 700,
      style: "bold",
    },
  ];
```
## 顶部菜单 高亮

decoration-solid <span style="text-decoration: solid underline;">普通实线</span>  

decoration-double <span style="text-decoration: double underline;">双线</span>  

decoration-dashed <span style="text-decoration: dashed underline;">虚线</span>  

decoration-dotted <span style="text-decoration: dotted underline;">点状线</span>  

decoration-wavy <span style="text-decoration: wavy underline;">波浪线</span>  

`src\styles\global.css`
```
修改你要的样式

.active-nav {
  @apply underline decoration-solid decoration-2 underline-offset-4;
}
```

## 底栏 导航

需要注释掉 ShareLinks

src\layouts\PostDetails.astro

```html
<!-- Previous / Back to Top / Next Buttons -->
<div
  data-pagefind-ignore
  class="flex items-center justify-between gap-4"
>
  <!-- 上一篇文章 -->
  <div class="flex w-full max-w-[33%] justify-start items-center">
    {
      prevPost && (
        <a
          href={`/posts/${prevPost.slug}`}
          class="flex items-center gap-1 hover:opacity-75"
        >
          <IconChevronLeft class="inline-block flex-none self-center" />
          <div class="text-lg text-accent/85">{prevPost.title}</div>
        </a>
      )
    }
  </div>

  <!-- Back to Top（始终居中） -->
  <div class="flex w-full max-w-[33%] justify-center items-center">
    <button
      id="back-to-top"
      class="focus-outline py-1 whitespace-nowrap hover:opacity-75 flex items-center"
      onclick="window.scrollTo({ top: 0, behavior: 'smooth' })"
    >
      <IconChevronLeft class="inline-block rotate-90 self-center" />
      <!-- <span>Back to Top</span> -->
    </button>
  </div>

  <!-- 下一篇文章 -->
  <div class="flex w-full max-w-[33%] justify-end items-center">
    {
      nextPost && (
        <a
          href={`/posts/${nextPost.slug}`}
          class="flex items-center gap-1 hover:opacity-75"
        >
          <div class="text-lg text-accent/85">{nextPost.title}</div>
          <IconChevronRight class="inline-block flex-none self-center" />
        </a>
      )
    }
  </div>
</div>

```

## 配色

Chatgpt可以生成配色

`src\styles\global.css`

```css
1. Apple 风格（极简科技感） 🍏
适合极简、高端、优雅的 UI 设计。


html[data-theme="light"] {
  --background: #f5f5f7;
  --foreground: #1d1d1f;
  --accent: #0071e3;
  --muted: #e8e8ed;
  --border: #d2d2d7;
}

html[data-theme="dark"] {
  --background: #121212;
  --foreground: #f5f5f7;
  --accent: #2997ff;
  --muted: #1e1e1e;
  --border: #3a3a3c;
}

2. Google 风格（多彩现代感） 🎨
适合现代、开放、用户友好的 UI 设计。


html[data-theme="light"] {
  --background: #ffffff;
  --foreground: #202124;
  --accent: #4285f4;
  --muted: #f8f9fa;
  --border: #dadce0;
}

html[data-theme="dark"] {
  --background: #202124;
  --foreground: #e8eaed;
  --accent: #8ab4f8;
  --muted: #303134;
  --border: #5f6368;
}

3. Microsoft 风格（沉稳商务风） 🏢
适合正式、商务、生产力工具类的 UI 设计。


html[data-theme="light"] {
  --background: #f3f3f3;
  --foreground: #262626;
  --accent: #0067b8;
  --muted: #e1e1e1;
  --border: #c8c8c8;
}

html[data-theme="dark"] {
  --background: #1b1b1b;
  --foreground: #f3f3f3;
  --accent: #0078d4;
  --muted: #292929;
  --border: #3f3f3f;
}

4. Tesla 风格（未来工业感） 🚗
适合高科技、极简、未来主义 UI 设计。


html[data-theme="light"] {
  --background: #fdfdfd;
  --foreground: #171a20;
  --accent: #cc0000;
  --muted: #ebebeb;
  --border: #d6d6d6;
}

html[data-theme="dark"] {
  --background: #171a20;
  --foreground: #fdfdfd;
  --accent: #e82127;
  --muted: #22252b;
  --border: #3a3d42;
}

5. Meta 风格（社交蓝色调） 🔵
适合社交、科技、社区类的 UI 设计。


html[data-theme="light"] {
  --background: #ffffff;
  --foreground: #1c1e21;
  --accent: #1877f2;
  --muted: #e4e6eb;
  --border: #ccd0d5;
}

html[data-theme="dark"] {
  --background: #18191a;
  --foreground: #e4e6eb;
  --accent: #2e89ff;
  --muted: #242526;
  --border: #3a3b3c;
}
```

## 菜单 自定义

`src\components\Header.astro`

```astro
<li class="col-span-2">
  <a href="/posts" class:list={{ "active-nav": isActive("/posts") }}>
    Posts
  </a>
</li>
<li class="col-span-2">
  <a href="/tags" class:list={{ "active-nav": isActive("/tags") }}>
    Tags
  </a>
</li>
<li class="col-span-2">
  <a href="/about" class:list={{ "active-nav": isActive("/about") }}>
    About
  </a>
</li>

修改为

{SITE.menu.map((item) => (
  <li class="col-span-2">
    <a href={item.path} class:list={{ "active-nav": isActive(item.path) }}>
      {item.title}
    </a>
  </li>
))}
```

`src\config.ts`
```ts
底部添加

......
  menu: [
    { title: "Home", path: "/" },
    { title: "Posts", path: "/posts" },
    { title: "Tags", path: "/tags" },
    { title: "About", path: "/about" },
    { title: "Link", path: "/link" },
  ],
} as const;

```

## 更多页面

不止About，还能添加更多单独页面

修改`src\content.config.ts`定义内容合集，添加pages

```ts
........

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/data" }),
});


export const collections = { blog, pages };
```

删除`src\layouts\AboutLayout.astro`

删除`src\pages\about.md`

添加`src\pages\[...slug].astro`

```astro
---
import { render, type CollectionEntry, getCollection } from "astro:content";
import Layout from "@/layouts/Layout.astro";
import Header from "@/components/Header.astro";
import Footer from "@/components/Footer.astro";
import Breadcrumb from "@/components/Breadcrumb.astro";
import { SITE } from "@/config";

export interface Props {
  page: CollectionEntry<"pages">;
}

export async function getStaticPaths() {
  const pages = await getCollection("pages");

  return pages.map(page => ({
    params: { slug: page.id },
    props: { page },
  }));
}

const { page } = Astro.props;
const { Content } = await render(page);
---

<Layout title={`${page.id} | ${SITE.title}`}>
  <Header />
  <Breadcrumb />
  <main id="main-content">
    <section id={page.id} class="prose mb-28 max-w-3xl prose-img:border-0">
    <h1 class="text-3xl tracking-wider sm:text-3xl">{page.id}</h1>
      <article>
        <Content />
      </article>
    </section>
  </main>
  <Footer />
</Layout>

```

如何添加页面？

假如添加about

则添加`src\data\about.md`

内容 直接输入正文即可

```
我是正文开头

## 自豪地使用 `AstroPaper`

我是正文结尾
```

## Disqus 评论

参考 https://github.com/ziteh/astro-paper-s/blob/main/src/components/Disqus.astro

将文件保存至 `src\components\Disqus.astro` 并修改 `SHORTNAME`



修改`src\layouts\PostDetails.astro`
```astro

添加引用
import Disqus from "@/components/Disqus.astro";



添加到底部

......
    <Disqus slug={slugifyStr(title)} title={title} />
  </main>
  <Footer />
</Layout>
```

## 文章封面cover

主要修改三处，内容合集、文章卡片、文章内

### 内容合集

 `src\content.config.ts` 内加入
```ts
......
z.object({
  cover: image().or(z.string()).optional(),
......
```

### 文章卡片

修改较多 `src\components\Card.astro` 样式自己可以修改
````astro
---
import { slugifyStr } from "@/utils/slugify";
import type { CollectionEntry } from "astro:content";
import Datetime from "./Datetime.astro";
import Tag from "@/components/Tag.astro";

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"];
  secHeading?: boolean;
}

const { href, frontmatter, secHeading = true } = Astro.props;

const { title, publishDate, modDatetime, description,tags,cover} = frontmatter;

const headerProps = {
  style: { viewTransitionName: slugifyStr(title) },
  class: "text-lg font-medium decoration-dashed hover:underline",
};
---
<li class="my-6 flex items-center gap-4">
<!-- <li class="my-6 flex items-center gap-4"> -->
  <div class="flex-1">
    <a
      href={href}
      class="block text-lg font-medium text-accent decoration-dashed underline-offset-4 
            focus-visible:no-underline focus-visible:underline-offset-0 focus-visible:ring-2 focus-visible:ring-accent"
    >
      {secHeading ? (
        <h2 {...headerProps}>{title}</h2>
      ) : (
        <h3 {...headerProps}>{title}</h3>
      )}
    </a>

    <div class="flex flex-wrap items-center gap-x-2 mt-2">
      <Datetime publishDate={publishDate} modDatetime={modDatetime} />
      <ul class="flex flex-wrap gap-1">
        {tags.map(tag => <Tag tag={slugifyStr(tag)} tagName={tag} />)}
      </ul>
    </div>
  </div>

  {cover && (
    <img 
      src={typeof cover === "string" ? cover : cover?.src} 
      alt={title ? title : "文章封面"}
      class="hidden sm:block sm:w-70 aspect-video object-cover rounded-xl"
    />
  )}
</li>
````

### 文章内

修改`src\layouts\PostDetails.astro` 添加cover定义

```ts
引用定义cover 主要添加 cover,

const {
.....
  editPost,
  cover,
} = post.data;

.......

const layoutProps = {
......
  ogImage,
  scrollSmooth: true,
  cover,
};
```

下方代码 粘贴到你想出现的位置，我放的是标题开头

```ts
{cover && (
  <img 
    src={typeof cover === "string" ? cover : cover?.src} 
    alt={title} 
    class="w-full"
  />
  <div class="my-8 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
)}
```

