import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/signup", "/signin", "/", "/home"]);

const isPublicApiRoute = createRouteMatcher(["/api/videos"]);

export default clerkMiddleware(async (auth, req) => {
  const user = await auth();
  const { userId } = user;

  const currentUrl = new URL(req?.url);

  const isAccessingDashboard = currentUrl.pathname === "/home";
  const isApiRequest = currentUrl.pathname.startsWith("/api");

  // logged in( pubkic api route hit kar rahe matlb login,signin mu band karke home pee ajao)
  if (userId && isPublicRoute(req) && !isAccessingDashboard) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // not logged in
  if (!userId) {
    // agar user logged in nahi hai  and try kar raha ki protected route access kare too naa meri jaan
    if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
    // looged in nahi and api request laga raha  protected api route to bhi signin page mai bhejo
    if (isApiRequest && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
