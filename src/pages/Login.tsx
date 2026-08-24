import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// 从后端拿一次性 CSRF state（后端同时把 nonce 写进 httpOnly cookie），
// 再带它跳转 Kimi 授权，回调时后端据此防重放/防劫持，而非客户端自造 state。
async function buildOAuthUrl(): Promise<string> {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;

  const init = await fetch(`${window.location.origin}/api/oauth/login`);
  if (!init.ok) throw new Error("failed to obtain oauth state");
  const { state } = (await init.json()) as { state: string };

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  const [busy, setBusy] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            size="lg"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                window.location.href = await buildOAuthUrl();
              } catch {
                setBusy(false);
              }
            }}
          >
            Sign in with Kimi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
