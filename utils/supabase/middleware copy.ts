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
  // console.log("user ", userId);

  let profilePath;
  if (request.nextUrl.pathname.includes("/player")) {
    profilePath = request.nextUrl.pathname;
  }
  // console.log(request.nextUrl.pathname, "pathname")

  const publicRoutes = ["/sign-in", `${profilePath}`, "/sign-up"];

  if(user){
    const {data : userStatus} = await supabase
  .from("usersList")
  .select("status")
  .eq("email", user?.email)
  .single();
  if(userStatus?.status !==  "Active") {
    console.log("User is not active");
    logout();
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  // const {data} = await supabase
  // .from("adminUserDetails")
  // .select("status")
  // .eq("email", user?.email)
  // .single();
  // if(data?.status !== "Active"){
  //   console.log("User is not active");
  //   logout();
  //   return NextResponse.redirect(new URL("/sign-in", request.url)); 
  // }
  }

  if (user && request.nextUrl.pathname === "/user-profile") {
    const { data, error } = await supabase
      .from("userProfile")
      .select("accessVerified")
      .eq("userId", userId)
      .single();

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      if (data?.accessVerified === true) {
        // if (request.nextUrl.pathname === "/user-profile") {
          // console.log("User data: ", data.accessVerified);
          return NextResponse.redirect(new URL("/dashboard", request.url));
        // }
      }
    }
  }

  //   if (user &&
  //     (request.nextUrl.pathname === "/welcome1" ||
  //      request.nextUrl.pathname === "/welcome2" ||
  //      request.nextUrl.pathname === "/welcome3")) {

  //     const { data: userDetails, error: detailsError } = await supabase
  //     .from("clientScreenDetails")
  //     .select("screen_location, screen_counts")
  //     .eq("userId", userId)
  //     .single();

  //     if (detailsError) {
  //         console.error("Error fetching client screen details:", detailsError.message);
  //         return { error: detailsError.message };
  //     }

  //     if (userDetails?.screen_location !== null && userDetails?.screen_counts !== null) {
  //         return NextResponse.redirect(new URL("/dashboard", request.url));
  //     }
  // }

  if (
    (user && request.nextUrl.pathname === "/sign-in") ||
    (user && request.nextUrl.pathname === "/sign-up")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!user && !publicRoutes.includes(request.nextUrl.pathname)) {
    // console.log(publicRoutes, "routes");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Redirect to the home page if there is no slug
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
