import { logout } from "@/app/(signIn-setup)/logout/action";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set(name, "", { ...options, maxAge: -1 });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  let playerPath;
  if(request.nextUrl.pathname.includes("/play")) {
    playerPath = request.nextUrl.pathname;
  }

  const publicRoutes = ["/sign-in", "/sign-up", '/forget-password', `${playerPath}`, '/auto-login'];

  // Handle user session status
  if (user && user.user_metadata.status !== "Active") {
    console.log("User is not active");
    await logout();  // Ensure session is cleared
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (user && user.user_metadata.status === "Active") {
    // Fetch user role from the database
    const { data: userData, error: userError } = await supabase
      .from("usersList")
      .select("roleId")
      .eq("userId", userId)
      .single();
  
    if (userError || !userData) {
      console.error("Error fetching user data:", userError);
      return NextResponse.redirect(new URL("/sign-in", request.url)); // Handle error fetching user data
    }
  
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("roleName")
      .eq("id", userData?.roleId)
      .single();
  
    //console.log("path", request.nextUrl.pathname);
    //console.log("role", roleData?.roleName);
  
    // Restrict routes containing 'admin' to admin role only
    const currentPath = request.nextUrl.pathname;
    const isAccessDeniedPage = currentPath.includes("/access-denied");
    const isAutoLoginRoute = currentPath.includes("auto-login");
  
    if (user && currentPath.includes("admin") && roleData?.roleName !== "Super Admin" && !isAccessDeniedPage && !isAutoLoginRoute) {
      console.log(`Access denied: ${roleData?.roleName} cannot access admin routes`);
      return NextResponse.redirect(new URL("/access-denied", request.url));
    }
  
    if (user && !currentPath.includes("admin") && roleData?.roleName === "Super Admin" && !isAccessDeniedPage && !isAutoLoginRoute) {
      console.log(`Access denied: ${roleData?.roleName} cannot access non-admin routes`);
      return NextResponse.redirect(new URL("/access-denied", request.url));
    }
  }
  
  // Redirect based on user profile verification
  if (user && request.nextUrl.pathname === "/user-profile") {
    const { data, error } = await supabase
      .from("userProfile")
      .select("accessVerified")
      .eq("userId", userId)
      .single();

    if (error) {
      console.error("Error fetching data:", error);
    } else if (data?.accessVerified === true) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Redirect authenticated users away from sign-in/sign-up pages
  if (user && (request.nextUrl.pathname === "/sign-in" || request.nextUrl.pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Ensure unauthenticated users are redirected to sign-in
  if (!user && !publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Redirect home page to dashboard
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Handle fallback redirection for specific routes
  if (!user && !publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/auto-login', request.url));
  }

  return response;
}
