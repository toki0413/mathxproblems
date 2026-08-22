#!/usr/bin/env python3
"""
MathX Problems 每周自动核验脚本
用法：python3 scripts/verify.py
输出：public/monitor.json（前端读取并展示"实时动态"）

每周一由 GitHub Actions 触发：
  1. 对每道题用其标签在 OpenAlex 检索最近 7 天新论文
  2. 对每道题用其标签在 arXiv Atom API 检索最近提交的预印本
     （arXiv 是数学/物理领域首发渠道，大量成果先上 arXiv、数月后才被 OpenAlex 收录）
  3. 检测任何"可能已解决"的信号（标题含 solved/proved/resolved 等）
  4. 将结果写入 public/monitor.json，提交即触发重新部署
零成本：OpenAlex 与 arXiv API 均无需 key，GitHub Actions 对公开仓库免费。
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


def openalex_search(query, days=7, per_page=5):
    since = (datetime.now(timezone.utc) - timedelta(days=days)).date().isoformat()
    params = urllib.parse.urlencode(
        {
            "search": query,
            "filter": f"from_publication_date:{since}",
            "per_page": per_page,
            "sort": "publication_date:desc",
            "select": "id,display_name,publication_date,doi,primary_location",
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


def arxiv_search(query, days=7, max_results=5):
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
        # 用前两个标签 + 领域关键词构造检索式，保持 URL 简短
        q = " ".join(t.replace("-", " ") for t in p["tags"][:2])
        entry = {"id": p["id"], "title": p["title"], "query": q, "new_works": [], "alerts": []}
        seen_titles = set()
        # OpenAlex（期刊+预印本索引，覆盖面广）
        try:
            data = openalex_search(q)
            for w in data.get("results", []):
                title = w.get("display_name", "")
                key = title.lower().strip()
                if key in seen_titles:
                    continue
                seen_titles.add(key)
                entry["new_works"].append(
                    {
                        "title": title,
                        "date": w.get("publication_date"),
                        "url": (w.get("primary_location") or {}).get("landing_page_url") or w.get("doi"),
                        "source": "openalex",
                    }
                )
        except Exception as e:
            entry["alerts"].append({"type": "fetch_error", "message": f"openalex: {e}"})
        time.sleep(1.0)
        # arXiv（数学/物理首发渠道）
        try:
            for w in arxiv_search(q):
                key = w["title"].lower().strip()
                if key in seen_titles:
                    continue
                seen_titles.add(key)
                entry["new_works"].append(w)
        except Exception as e:
            entry["alerts"].append({"type": "fetch_error", "message": f"arxiv: {e}"})
        # 解决信号检测
        for w in entry["new_works"]:
            if SOLVED_HINTS.search(w["title"]):
                entry["alerts"].append({"type": "possible_resolution", "work": w})
        report["problems"].append(entry)
        time.sleep(3.5)  # arXiv 要求 ≤1 请求/3秒

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    n_alerts = sum(len(p["alerts"]) for p in report["problems"])
    print(f"核验完成：{len(problems)} 题，{n_alerts} 条警报 → {OUT}")


if __name__ == "__main__":
    main()
