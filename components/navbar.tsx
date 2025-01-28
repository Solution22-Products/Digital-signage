"use client";
import { logout } from "@/app/(signIn-setup)/logout/action";
import { BellDot, Bolt, LogOut, PieChart, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useTransition } from "react";

const Navbar = () => {
  const [user, setUser] = useState<string | null>("");
  const [userProfileName, setUserProfileName] = useState<string | null>("");
  const [userProfileImage, setUserProfileImage] = useState<string | null>("");
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [logo, setLogo] = useState<string>("");

  const userName = async () => {
    const user = localStorage.getItem("userEmail");
    setUser(user?.split("@")[0] || "Guest");
    // console.log("user ", user?.email);
    return user;
  };
  const router = useRouter();

  const userDetails = async () => {
    const userEmail = localStorage.getItem("userId");
    const { data, error } = await supabase
      .from("userProfile")
      .select("*")
      .eq("userId", userEmail)
      .single();
    if (error) {
      console.error("Error fetching data 1:", error);
    } else if (data) {
      setUserProfileName(data?.companyName);
      setUserProfileImage(data?.profileImage);
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
  };

  const handleNavigation = () => {
    startTransition(() => {
      router.push("/user-settings");
    });
  };

  const handleLogout = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoggingOut(true); // Show loader when logging out
    await logout();
    setIsLoggingOut(false); // Hide loader after logout completes
  };

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    userDetails();
    fetchLogo();
    userName();
  }, []);

  return (
    <>
      <header
        className="w-full py-2 px-4 border border-b-border_gray bg-zinc-50 sticky top-0"
        style={{ zIndex: 999 }}
      >
        <nav className="flex justify-between items-center">
          <Link href="/dashboard">
            {/* <Image
              src="/images/digital-signage-logo.png"
              width={106}
              height={36}
              alt="logo"
            /> */}
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
              {userProfileName ? userProfileName : user}
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
            </li>
            <li className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out hover:bg-button_orange hover:text-white w-[44px] h-[40px]">
              <UsersRound size={20} />
            </li> */}
            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <li className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out hover:bg-button_orange hover:text-white w-[44px] h-[40px]">
                    <BellDot size={20} />
                  </li>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notification</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider> */}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  {/* <Link href="/user-settings"> */}
                  <li
                    className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out hover:bg-button_orange  hover:text-white w-[44px] h-[40px] relative"
                    onClick={handleNavigation}
                    style={
                      isPending ? { pointerEvents: "none"} : {}
                    }
                  >
                    {isPending ? (
                      <div className="w-[42px] h-[38px] bg-white flex justify-center items-center absolute top-0 left-0 rounded">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="#FF7C44"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="#FF7C44"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    ) : (
                      <Bolt size={20} />
                    )}
                  </li>
                  {/* </Link> */}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

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
