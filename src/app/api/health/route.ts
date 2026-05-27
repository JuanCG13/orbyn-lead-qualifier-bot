export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    ok: true,
    service: "orbyn-lead-qualifier-bot",
    timestamp: new Date().toISOString(),
  });
}
