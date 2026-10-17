export async function onRequestGet() {
  return Response.json({ status: "ok", service: "circularloop-functions" });
}
