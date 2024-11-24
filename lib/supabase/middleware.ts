export default function middleware(req, ev) {
  console.log("Middleware triggered for:", req.url);
  return new Response("OK");
}
