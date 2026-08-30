#!/usr/bin/env python3
"""
MathX Problems 每周自动核验脚本
用法：python3 scripts/verify.py
输出：public/monitor.json（前端读取并展示"实时动态"）

每周一由 GitHub Actions 触发：
  1. 对每道题用其标题的区分性关键词在 OpenAlex 检索最近 7 天新论文
  2. 对每道题在 arXiv Atom API 检索最近提交的预印本
     （arXiv 是数学/物理领域首发渠道，大量成果先上 arXiv、数月后才被 OpenAlex 收录）
  3. 对命中做相关性门控（标题词重叠），再检测"可能已解决"信号
  4. 将结果写入 public/monitor.json，提交即触发重新部署
零成本：OpenAlex 与 arXiv API 均无需 key，GitHub Actions 对公开仓库免费。

2026-08-31 修订（对照一次 scholar 全量文献审计 docs/audits/2026-08-31-literature-audit.md）：
- 检索式从「前两个标签」改为「标题区分性关键词」：标签是领域级词汇
  （如 spectral-theory），检索噪声大；标题词才是问题级指纹。
- 新增相关性门控：命中标题须与问题标题共享 ≥25% 区分性词才入列，
  阻断领域相邻但问题无关的论文刷屏。
- 解决信号（solved/proved/...）只在通过门控的命中上触发，并携带
  引用数与相关性分，供人工分级——自动核验只报警、不改状态，
  状态迁移仍走 problem_attempts 审稿闭环。
"""
import json
import re
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROBLEMS_TS = ROOT / "src" / "data" / "problems.ts"
OUT = ROOT / "public" / "monitor.json"

SOLVED_HINTS = re.compile(
    r"\b(solv(e|ed|es|ing)|proof of|we prove|resolv(e|ed|es)|answer(s)? (the )?(conjecture|question)|"
    r"settle(s|d)?|disprov(e|ed|es))\b",
    re.IGNORECASE,
)

# 标题停用词：构造检索式与相关性门控共用。刻意短名单，宁可多留词。
TITLE_STOP = set(
    "the of for at in on with and all to a an from via by its is are be as or no not between over under".split()
)

# 相关性门控阈值：命中标题与问题标题的区分性词交集占比下限。
# 0.25 按 2026-08-31 审计数据校准：真实相关命中普遍 ≥0.3，领域噪声多在 0.2 以下。
RELEVANCE_THRESHOLD = 0.25


def distinctive_words(text):
    """标题的区分性词：去 LaTeX/标点/停用词，保留长度 ≥4 的词。"""
    t = re.sub(r"\$[^$]*\$", " ", text)
    t = re.sub(r"[^A-Za-z0-9\s-]", " ", t)
    return [w for w in t.split() if w.lower() not in TITLE_STOP and len(w) > 3]


def title_query(title, tags):
    """问题级检索式：标题区分性词优先（≤6 个），不足时用标签补齐。"""
    words = distinctive_words(title)
    if len(words) < 3:
        words += [t.replace("-", " ") for t in tags[:2]]
    return " ".join(words[:6])


def relevance(hit_title, problem_title):
    """命中标题与问题标题的区分性词重叠率（相对问题侧）。"""
    pw = {w.lower() for w in distinctive_words(problem_title)}
    if not pw:
        return 0.0
    hw = {w.lower() for w in distinctive_words(hit_title)}
    return len(hw & pw) / len(pw)


def load_problems():
    """从 problems.ts 按对象块提取 id、title、tags。"""
    text = PROBLEMS_TS.read_text(encoding="utf-8")
    problems = []
    for block in re.findall(r"\{\s*\n\s*id:\s*'[a-z]{2}-\d{3}'.*?\n  \},", text, re.DOTALL):
        pid = re.search(r"id:\s*'([a-z]{2}-\d{3})'", block).group(1)
        title = re.search(r"title:\s*'([^']+)'", block).group(1)
        tags_m = re.search(r"tags:\s*\[([^\]]*)\]", block)
        tag_list = [t.strip().strip("'\"") for t in tags_m.group(1).split(",")] if tags_m else []
        problems.append({"id": pid, "title": title, "tags": tag_list})
    return problems


def openalex_search(query, days=7, per_page=8):
    since = (datetime.now(timezone.utc) - timedelta(days=days)).date().isoformat()
    params = urllib.parse.urlencode(
        {
            "search": query,
            "filter": f"from_publication_date:{since}",
            "per_page": per_page,
            "sort": "publication_date:desc",
            "select": "id,display_name,publication_date,doi,cited_by_count,primary_location",
        }
    )
    url = f"https://api.openalex.org/works?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "MathXProblems/1.0 (mailto:admin@mathxproblems.com)"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 2:
                time.sleep(8 * (attempt + 1))
            else:
                raise


ARXIV_NS = {"a": "http://www.w3.org/2005/Atom"}


def arxiv_search(query, days=7, max_results=8):
    """查询 arXiv Atom API，返回最近提交的匹配预印本。"""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    terms = " AND ".join(f'all:"{t}"' for t in query.split()[:3])
    params = urllib.parse.urlencode(
        {
            "search_query": terms,
            "sortBy": "submittedDate",
            "sortOrder": "descending",
            "max_results": max_results,
        }
    )
    url = f"http://export.arxiv.org/api/query?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "MathXProblems/1.0"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=40) as resp:
                root = ET.fromstring(resp.read())
            break
        except Exception:
            if attempt < 2:
                time.sleep(6 * (attempt + 1))
            else:
                raise
    works = []
    for entry in root.findall("a:entry", ARXIV_NS):
        published = entry.findtext("a:published", default="", namespaces=ARXIV_NS)
        try:
            dt = datetime.fromisoformat(published.replace("Z", "+00:00"))
        except ValueError:
            continue
        if dt < since:
            continue
        title = " ".join(entry.findtext("a:title", default="", namespaces=ARXIV_NS).split())
        link = entry.findtext("a:id", default="", namespaces=ARXIV_NS)
        works.append({"title": title, "date": dt.date().isoformat(), "url": link, "source": "arxiv"})
    return works


def main():
    problems = load_problems()
    since = (datetime.now(timezone.utc) - timedelta(days=7)).date().isoformat()
    report = {"generated_at": datetime.now(timezone.utc).isoformat(), "since": since, "problems": []}

    for p in problems:
        # 问题级检索式：标题区分性关键词（不足时标签补齐）
        q = title_query(p["title"], p["tags"])
        entry = {"id": p["id"], "title": p["title"], "query": q, "new_works": [], "alerts": []}
        seen_titles = set()

        def consider(work):
            """相关性门控 + 去重后入列；解决信号只在通过门控的命中上触发。"""
            key = work["title"].lower().strip()
            if key in seen_titles:
                return
            rel = relevance(work["title"], p["title"])
            if rel < RELEVANCE_THRESHOLD:
                return
            seen_titles.add(key)
            work["relevance"] = round(rel, 3)
            entry["new_works"].append(work)
            if SOLVED_HINTS.search(work["title"]):
                entry["alerts"].append({"type": "possible_resolution", "work": work})

        # OpenAlex（期刊+预印本索引，覆盖面广）
        try:
            data = openalex_search(q)
            for w in data.get("results", []):
                consider(
                    {
                        "title": w.get("display_name", ""),
                        "date": w.get("publication_date"),
                        "url": (w.get("primary_location") or {}).get("landing_page_url") or w.get("doi"),
                        "citations": w.get("cited_by_count"),
                        "source": "openalex",
                    }
                )
        except Exception as e:
            entry["alerts"].append({"type": "fetch_error", "message": f"openalex: {e}"})
        time.sleep(1.0)
        # arXiv（数学/物理首发渠道）
        try:
            for w in arxiv_search(q):
                consider(w)
        except Exception as e:
            entry["alerts"].append({"type": "fetch_error", "message": f"arxiv: {e}"})
        report["problems"].append(entry)
        time.sleep(3.5)  # arXiv 要求 ≤1 请求/3秒

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    n_alerts = sum(len(p["alerts"]) for p in report["problems"])
    n_works = sum(len(p["new_works"]) for p in report["problems"])
    print(f"核验完成：{len(problems)} 题，{n_works} 条相关命中，{n_alerts} 条警报 → {OUT}")


if __name__ == "__main__":
    main()
