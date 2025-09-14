import { NextResponse, NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({
            name,
            value,
            ...options,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/", // Changed to site-wide scope
          });
        },
        remove(name, options) {
          res.cookies.set({
            name,
            value: "",
            ...options,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          });
        },
      },
    }
  );

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();

    const isDemo = req.cookies.get("demo-session")?.value === "true";
    const isAuth = !!user || (sessionData.session?.access_token && !sessionData.session?.expired && !isDemo) || isDemo;
    console.log("Middleware: isAuth:", isAuth, "isDemo:", isDemo, "user:", user, "sessionData:", sessionData);

    const isLoginPage = req.nextUrl.pathname.startsWith("/login");
    const isCallbackPage = req.nextUrl.pathname.startsWith("/auth/callback");

    if (!isAuth && !isLoginPage && !isCallbackPage) {
      console.log("Middleware: Redirecting to /login due to !isAuth");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (isAuth && isLoginPage) {
      console.log("Middleware: Redirecting to /buyers due to isAuth");
      return NextResponse.redirect(new URL("/buyers", req.url));
    }
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/login", req.url)); // Fallback on error
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};