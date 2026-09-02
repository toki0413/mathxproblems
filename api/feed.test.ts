import { test, expect } from "vitest";
import { buildFeedXml } from "./boot";
import { buildCatalog } from "./catalog.json";

test("feed.xml is well-formed RSS 2.0 with latest entries", () => {
  const xml = buildFeedXml(buildCatalog());
  expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  expect(xml).toContain('<rss version="2.0"');
  expect(xml).toContain("<channel>");
  expect(xml).toContain("<title>MathX Problems — New entries</title>");
  // every item links back to a real problem detail page
  const links = [...xml.matchAll(/<link>https:\/\/mathx-bridge\.pages\.dev\/problems\/([a-z0-9-]+)<\/link>/g)].map(
    (m) => m[1],
  );
  expect(links.length).toBeGreaterThan(0);
  expect(links.length).toBeLessThanOrEqual(20);
  for (const id of links) {
    expect(buildCatalog().some((p) => p.id === id)).toBe(true);
  }
});

test("feed escapes XML-special characters in titles", () => {
  // 用合成条目确定性验证转义：标题含 & < > " ' 时不能以裸字符出现在 XML 里。
  const fake = [
    {
      id: "x-esc",
      title: 'A & B < "quoted" > done',
      domain: "test",
      status: "open",
      provenance: "AI-drafted",
      date_added: "2026-08-22",
    },
  ] as unknown as ReturnType<typeof buildCatalog>;
  const xml = buildFeedXml(fake);
  expect(xml).toContain("A &amp; B &lt; &quot;quoted&quot; &gt; done");
  expect(xml).not.toMatch(/<title>[^<]*&(?!amp;|lt;|gt;|quot;|apos;)[^<]*<\/title>/);
});
