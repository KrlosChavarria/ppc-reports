import { getByShareToken } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const data = await getByShareToken(params.token);
  if (!data) return Response.json({ error: "No encontrado" }, { status: 404 });
  return Response.json(data);
}
