import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site.config";
import { getFormattedDate } from "@/utils/date";
import { Resvg } from "@resvg/resvg-js";
import type { APIContext, InferGetStaticPropsType } from "astro";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";

async function loadGoogleFont(
	font: string,
	text: string,
	weight: number
  ): Promise<ArrayBuffer> {
	const API = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=${encodeURIComponent(text + 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890年月日周星期一二三四五六七')}`;
	
	try {
	  const css = await (
		await fetch(API, {
		  headers: {
			"User-Agent": "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
		  },
		})
	  ).text();
	
	  const resource = css.match(
		/src: url\((.+?)\) format\('(opentype|truetype)'\)/,
	  );
  
	  if (!resource) throw new Error("Failed to download dynamic font");
  
	  const res = await fetch(resource[1]);
  
	  if (!res.ok) {
		throw new Error("Failed to download dynamic font. Status: " + res.status);
	  }
  
	  return res.arrayBuffer();
	} catch (error) {
	  console.error("Font loading error:", error);
	  throw error;  // Re-throw the error after logging it
	}
  }

async function loadGoogleFonts(
  text: string
): Promise<
  Array<{ name: string; data: ArrayBuffer; weight: number; style: string }>
> {
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

  const fonts = await Promise.all(
    fontsConfig.map(async ({ name, font, weight, style }) => {
      const data = await loadGoogleFont(font, text, weight);
      return { name, data, weight, style };
    })
  );

  return fonts;
}

const markup = (title: string, pubDate: string) =>
  html`<div tw="flex flex-col w-full h-full bg-[#1d1f21] text-[#c9cacc]">
    <div tw="flex flex-col flex-1 w-full p-10 justify-center">
      <p tw="text-2xl mb-6">${pubDate}</p>
      <h1 tw="text-6xl font-bold leading-snug text-white">${title}</h1>
    </div>
  </div>`;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
  const { pubDate, title } = context.props as Props;

  const postDate = getFormattedDate(pubDate, {
    month: "long",
    weekday: "long",
  });

  // Load dynamic fonts
  const fonts = await loadGoogleFonts(title);
  const ogOptions: SatoriOptions = {
    fonts: fonts.map((font) => ({
      data: font.data,
      name: font.name,
      style: font.style,
      weight: font.weight,
    })),
    height: 630,
    width: 1200,
  };

  const svg = await satori(markup(title, postDate), ogOptions);
  const png = new Resvg(svg).render().asPng();
  
  return new Response(png, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/png",
    },
  });
}

export async function getStaticPaths() {
  const posts = await getAllPosts();
  return posts
    .filter(({ data }) => !data.ogImage)
    .map((post) => ({
      params: { slug: post.id },
      props: {
        pubDate: post.data.updatedDate ?? post.data.publishDate,
        title: post.data.title,
      },
    }));
}
