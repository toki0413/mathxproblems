// 双桥写路径门面（api/claims-write.ts）的单测：默认闭门 501、开门后的
// id/body 校验与审稿账本写入映射。依赖全部注入，不触真库、不读真目录。
import { describe, expect, it, vi } from "vitest";
import { createClaimsWriteApp, type ClaimsWriteDeps } from "./claims-write";

const KNOWN_ID = "mp-001";
const VALID_NOTE = "a sufficiently long reviewer-facing note body";

function makeDeps(overrides: Partial<ClaimsWriteDeps> = {}) {
  const insert = vi.fn<ClaimsWriteDeps["insert"]>(async () => {});
  const deps: ClaimsWriteDeps = {
    enabled: true,
    catalogHas: (id) => id === KNOWN_ID,
    insert,
    ...overrides,
  };
  return { deps, insert };
}

function post(app: ReturnType<typeof createClaimsWriteApp>, path: string, body?: unknown) {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("claims write facade gate", () => {
  it("returns 501 app_error for both endpoints when closed", async () => {
    const { deps, insert } = makeDeps({ enabled: false });
    const app = createClaimsWriteApp(deps);

    for (const path of [`/${KNOWN_ID}/narrow`, `/${KNOWN_ID}/formal`]) {
      const res = await post(app, path, {});
      expect(res.status).toBe(501);
      const body = (await res.json()) as { tag: string; status: number };
      expect(body.tag).toBe("app_error");
      expect(body.status).toBe(501);
    }
    expect(insert).not.toHaveBeenCalled();
  });
});

describe("claims write facade validation", () => {
  it("rejects malformed problem ids with 400 before touching the catalog", async () => {
    const { deps } = makeDeps();
    const app = createClaimsWriteApp(deps);
    const res = await post(app, "/!!!/narrow", { band: "x", note: VALID_NOTE });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { tag: string }).tag).toBe("app_error");
  });

  it("rejects unknown problem ids with 404", async () => {
    const { deps } = makeDeps();
    const app = createClaimsWriteApp(deps);
    const res = await post(app, "/zz-999/narrow", { band: "[1, 2]", note: VALID_NOTE });
    expect(res.status).toBe(404);
  });

  it("rejects invalid bodies with 400 and never writes", async () => {
    const { deps, insert } = makeDeps();
    const app = createClaimsWriteApp(deps);
    const res = await post(app, `/${KNOWN_ID}/formal`, { status: "provable", note: "short" });
    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });
});

describe("claims write facade ledger mapping", () => {
  it("maps narrow to a verification attempt carrying the tightened band", async () => {
    const { deps, insert } = makeDeps();
    const app = createClaimsWriteApp(deps);
    const res = await post(app, `/${KNOWN_ID}/narrow`, {
      band: "[1.52, 1.56]",
      note: VALID_NOTE,
      authorName: "bridge-agent",
    });
    expect(res.status).toBe(202);
    expect(((await res.json()) as { queued: string }).queued).toBe("pending_review");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        problemId: KNOWN_ID,
        kind: "verification",
        newBand: "[1.52, 1.56]",
        content: VALID_NOTE,
        authorName: "bridge-agent",
      }),
    );
  });

  it("maps formal to a formal attempt carrying status and provenance", async () => {
    const { deps, insert } = makeDeps();
    const app = createClaimsWriteApp(deps);
    const res = await post(app, `/${KNOWN_ID}/formal`, {
      status: "refuted",
      note: VALID_NOTE,
      via: "https://example.org/counterexample.pdf",
    });
    expect(res.status).toBe(202);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        problemId: KNOWN_ID,
        kind: "formal",
        formalStatus: "refuted",
      }),
    );
    const content = insert.mock.calls[0]?.[0]?.content ?? "";
    expect(content).toContain(VALID_NOTE);
    expect(content).toContain("via: https://example.org/counterexample.pdf");
  });

  it("surfaces ledger failures as 500 instead of a false 202", async () => {
    const { deps } = makeDeps({
      insert: vi.fn<ClaimsWriteDeps["insert"]>(async () => {
        throw new Error("db down");
      }),
    });
    const app = createClaimsWriteApp(deps);
    const res = await post(app, `/${KNOWN_ID}/narrow`, { band: "[1, 2]", note: VALID_NOTE });
    expect(res.status).toBe(500);
  });
});
