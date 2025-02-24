"use client";
import { BellDot, Bolt, LogOut, PieChart, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { logout } from "@/app/(signIn-setup)/logout/action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { getUserData } from "@/app/admin/(common-modules)/admin-setting/action";
import { supabase } from "@/utils/supabase/supabaseClient";

const Navbar = () => {
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const router = useRouter();

  const [notification, setNotification] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [logo, setLogo] = useState<string>("");
  const [userProfileName, setUserProfileName] = useState<string | null>("");
  const [userProfileImage, setUserProfileImage] = useState<string | null>("");

  const username = async () => {
    const user = await getUserData();
    setUserName(user?.email?.split("@")[0] || "Guest");
    return user;
  };

  const userDetails = async () => {
    const user = await getUserData();
    const userEmail = user?.id;
    const { data, error } = await supabase
      .from("usersList")
      .select("*")
      .eq("userId", userEmail)
      .single();
    if (error) {
      console.error("Error fetching data 1:", error);
    } else if (data) {
      setUserProfileName(data?.name);
      setUserProfileImage(data?.url);
      // console.log("User data:", data);
    }
  };

  const fetchLogo = async () => {
    const { data, error } = await supabase
      .from("generalSettings")
      .select("logo")
      .single();
    if (error) {
      console.log("Error", error.message);
    }
    setLogo(data?.logo as any);
    console.log("Logo ", data?.logo);
  };

  const handleLogout = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoggingOut(true); // Show loader when logging out
    await logout();
    setIsLoggingOut(false); // Hide loader after logout completes
  };

  useEffect(() => {
    setNotification([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    userDetails();
    fetchLogo();
    username();
  }, []);

  return (
    <>
      <header
        className="w-full py-2 px-4 border border-b-border_gray bg-zinc-50 sticky top-0"
        style={{ zIndex: 99 }}
      >
        <nav className="flex justify-between items-center">
          <Link href="/admin/dashboard">
            {/* <div className="relative w-[106px] h-[40px] border-2 border-border_gray rounded">
            <Image
              src={logo}
              width={110}
              height={40}
              alt="logo"
              className="absolute top-0 left-0 w-full h-full object-cover p-0"
            />
          </div> */}
            <div
              className="relative h-[45px] w-[106px] rounded border-2 border-border_gray sizing-border"
              style={{
                backgroundImage: `url(${logo})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            ></div>
          </Link>
          <ul className="flex items-center space-x-2">
            <li className="py-1.5 px-1.5 border rounded border-border_gray flex items-center gap-1 text-sm font-medium cursor-pointer">
              {userProfileName ? userProfileName : userName}
              <div
                className="w-[28px] h-[28px] rounded-full overflow-hidden"
                style={{
                  backgroundImage: `url(${
                    userProfileImage
                      ? userProfileImage
                      : "/images/cropped-favicon-180x180.png"
                  })`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              ></div>
            </li>
            {/* <li className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out hover:bg-button_orange hover:text-white w-[44px] h-[40px]">
              <PieChart size={20} />
            </li> */}
            {/* <Sheet>
              <SheetTrigger asChild>
                <li className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out hover:bg-button_orange hover:text-white w-[44px] h-[40px]">
                  <BellDot size={20} />
                </li>
              </SheetTrigger>
              <SheetContent className="pt-20">
                <SheetHeader>
                  <SheetDescription>
                    <div>
                      <p className="text-sm text-right">
                        {notification.length} notifications
                      </p>
                    </div>
                    {notification.map((notification) => (
                      <div key={notification}>
                        <p className="border-b border-primary_color pb-2 mt-2 text-primary_color">
                          {notification}
                        </p>
                      </div>
                    ))}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-2">
                  <p
                    className="text-xs font-normal underline cursor-pointer"
                    onClick={() => setNotification([])}
                  >
                    Clear all
                  </p>
                </div>
              </SheetContent>
            </Sheet> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <li className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out hover:bg-button_orange  hover:text-white w-[44px] h-[40px]">
                  <Bolt size={20} />
                </li>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="fixed top-1.5 right-0 w-[186px]">
                <Link href="/admin/profile-setting">
                  <DropdownMenuItem>Profile Setting</DropdownMenuItem>
                </Link>
                <Link href="/admin/general-setting">
                  <DropdownMenuItem>General Setting</DropdownMenuItem>
                </Link>
                {/* <Link href="/admin-setting">
                  <DropdownMenuItem>Admin Setting</DropdownMenuItem>
                </Link> */}
                <Link href="/admin/plan-setting">
                  <DropdownMenuItem>Plan Setting</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
            <form onSubmit={handleLogout} className="flex">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      typeof="submit"
                      className="py-2.5 px-3 rounded bg-button_orange text-white cursor-pointer w-[44px] h-[40px] hover:bg-button_orange relative"
                      style={
                        isLoggingOut
                          ? { pointerEvents: "none", opacity: 0.6 }
                          : {}
                      }
                    >
                      {isLoggingOut ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        </div>
                      ) : (
                        <LogOut size={20} />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Logout</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </form>
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
