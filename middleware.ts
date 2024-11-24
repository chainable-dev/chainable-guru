import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
	console.log("Middleware triggered for:", req.url);
	// Custom logic can be added here
	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
