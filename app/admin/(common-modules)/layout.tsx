import Navbar from "@/components/navbarAdmin";
import Sidebar from "@/components/sidebarAdmin";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
