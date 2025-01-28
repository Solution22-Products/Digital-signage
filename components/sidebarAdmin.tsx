"use client";
import { Component, LayoutDashboard, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import DashboardPage from "@/app/admin/(common-modules)/dashboard/page";
import PlanSetting from "@/app/admin/(common-modules)/client/page";
import { useState, useTransition } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Sidebar = () => {
  const [isPending, startTransition] = useTransition();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [loadingMenu, setLoadingMenu] = useState<string | null>(null); // Track loading menu
  const router = useRouter();
  const pathname = usePathname();

  const allowedModules = ["/admin/dashboard", "/admin/client"];
  const navLinks = [
    {
      name: "dashboard",
      href: "/admin/dashboard",
      icons: <LayoutDashboard size={20} />,
      component: <DashboardPage />,
    },
    {
      name: "client",
      href: "/admin/client",
      icons: <Users size={20} />,
      Component: <PlanSetting />,
    },
  ];

  const handleNavigation = (href: string, menuName: string) => {
    console.log(href, menuName);
    if (!allowedModules.includes(href)) {
      setActiveMenu(null); // Inactivate the menu if it's not an allowed module
      return;
    }

    setLoadingMenu(menuName);
    startTransition(() => {
      router.push(href);
      setActiveMenu(menuName); // Update active menu only for allowed modules
      // if (menuName == "dashboard") {
      //   setActiveMenu("dashboard");
      // }
      setLoadingMenu(null);
    });
  };

  return (
    <>
      <div className="w-18 h-auto z-50 bg-zinc-50 border-r border-border_gray flex flex-col items-center">
        <aside className="p-4 fixed" style={{ height: "calc(100vh - 60px)" }}>
          <ul className="space-y-3">
            {navLinks.map((link, index) => {
              const isActive =
                allowedModules.includes(pathname) &&
                (pathname.startsWith(link.href) || activeMenu === link.name); // Activate only for allowed modules
              const isLoading = loadingMenu === link.name; // Check if this menu is loading
              return (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger>
                      <li
                        onClick={() => handleNavigation(link.href, link.name)}
                        className={
                          "py-2.5 px-3 border rounded border-border_gray relative cursor-pointer transition-all duration-300 ease-in-out hover:bg-button_orange hover:text-white w-[44px] h-[40px] mb-0" +
                          (isActive ? " bg-button_orange text-white" : "")
                        }
                      >
                        {isLoading ? (
                          <div className="w-full h-full bg-white flex justify-center items-center absolute top-0 left-0 rounded">
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
                          link.icons
                        )}
                      </li>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="mt-[-10px]">
                      <p>{link.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </ul>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
