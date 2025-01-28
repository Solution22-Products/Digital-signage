"use client";
import {
  CalendarCheck,
  ListVideo,
  MonitorPlay,
  PanelsLeftBottom,
  Wallpaper,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Importing all components
import ContentPage from "@/app/(dashboard)/content/page";
import Playlist from "@/app/(dashboard)/playlist/page";
import Schedule from "@/app/(dashboard)/schedule/page";
import LayoutPage from "@/app/(dashboard)/layout/page";

const Sidebar = () => {
  const [isPending, startTransition] = useTransition();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [loadingMenu, setLoadingMenu] = useState<string | null>(null); // Track loading menu
  const router = useRouter();
  const pathname = usePathname();

  // List of allowed paths/modules
  const allowedModules = [
    "/screen",
    "/content",
    "/playlist",
    "/schedule",
    "/layout",
  ];

  const navLinks = [
    {
      name: "screens",
      href: "/screen",
      icons: <MonitorPlay size={20} />,
      component: <div></div>,
    },
    {
      name: "contents",
      href: "/content",
      icons: <Wallpaper size={20} />,
      component: <ContentPage />,
    },
    {
      name: "playlists",
      href: "/playlist",
      icons: <ListVideo size={20} />,
      component: <Playlist />,
    },
    {
      name: "schedule",
      href: "/schedule",
      icons: <CalendarCheck size={20} />,
      component: <Schedule />,
    },
    {
      name: "layout",
      href: "/layout",
      icons: <PanelsLeftBottom size={20} />,
      component: <LayoutPage />,
    },
  ];

  const handleNavigation = (href: string, menuName: string) => {
    if (!allowedModules.includes(href)) {
      setActiveMenu(null); // Inactivate the menu if it's not an allowed module
      return;
    }

    setLoadingMenu(menuName);
    startTransition(() => {
      router.push(href);
      setActiveMenu(menuName); // Update active menu only for allowed modules
      setLoadingMenu(null);
    });
  };

  return (
    <>
      <div className="w-18 h-auto z-50 bg-zinc-50 border-r border-border_gray flex flex-col items-center">
        <aside className="p-4" style={{ height: "calc(100vh - 60px)" }}>
          <ul className="space-y-1.5">
            {navLinks.map((link, index) => {
              const isActive =
                allowedModules.includes(pathname) &&
                (pathname.startsWith(link.href) || activeMenu === link.name); // Activate only for allowed modules
              const isLoading = loadingMenu === link.name; // Check if this menu is loading
              return (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger>
                      {/* Navigation is handled via handleNavigation */}
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
