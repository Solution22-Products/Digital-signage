"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import "./style.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<any | null>(null);

  useEffect(() => {
    // Retrieve the role from localStorage
    const storedRole = localStorage.getItem("userRole"); // Example key
    setRole(storedRole || "");
  }, []);

  return (
    <div className="h-full w-full bg-white text-black">
      <main className="w-full">
        <Navbar />
        <div className="w-full flex">
          <Sidebar />
          <div className="w-full custom-scroll">{children}</div>
        </div>
      </main>
    </div>
  );
}
