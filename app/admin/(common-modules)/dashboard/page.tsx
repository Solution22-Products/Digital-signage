"use client";
import {
  BadgeDollarSign,
  Download,
  MonitorPlay,
  Users,
  ImageDown,
  FileDown,
} from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { supabase } from "@/utils/supabase/supabaseClient";
import { format, startOfMonth, endOfMonth } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useRef } from "react";
import { display } from "html2canvas/dist/types/css/property-descriptors/display";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChartData {
  month: string;
  screen: number;
  client: number;
}

interface ChartDatascreen {
  month: string;
  screen: number;
}

interface ChartDataclient {
  month: string;
  client: number;
}

const chartConfig = {
  screen: {
    label: "Screen",
    color: "#000000",
  },
  client: {
    label: "Client",
    color: "#5E5E5E",
  },
} satisfies ChartConfig;

const DashboardPage = () => {
  const [date, setDate] = useState<Date>();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [totalScreens, setTotalScreens] = useState<number>(0);
  const [activeScreens, setActiveScreens] = useState(0);
  const [InactiveScreens, setInactiveScreens] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [activeClients, setActiveClients] = useState(0);
  const [InactiveClients, setInactiveClients] = useState(0);
  const [newyear, setNewyear] = useState(new Date().getFullYear());
  const [playlistNewyear, setPlaylistNewyear] = useState(
    new Date().getFullYear()
  );
  const [debouncedYear, setDebouncedYear] = useState(newyear);
  const [PlaylistdebouncedYear, setPlaylistDebouncedYear] =
    useState(playlistNewyear);

  const [chartDatascreen, setChartDatascreen] = useState<ChartDatascreen[]>([]);
  const [chartDataclient, setChartDataclient] = useState<ChartDataclient[]>([]);

  const fetchDataForAllMonths = async () => {
    // console.log("inside fetchDataForAllMonths ", newyear);
    const startMonth = 0; // January (0 index)
    const endMonth = 11; // December (11 index)

    const screenDataByMonth: any[] = [];
    const clientDataByMonth: any[] = [];

    // Create an array of months (from 0 for January to 11 for December)
    const months = Array.from(
      { length: endMonth - startMonth + 1 },
      (_, i) => startMonth + i
    );

    // Prepare queries for all months at once
    const fetchDataByMonth = months.map(async (month) => {
      const startDate = format(
        startOfMonth(new Date(newyear, month)),
        "yyyy-MM-dd"
      );
      const endDate = format(
        endOfMonth(new Date(newyear, month)),
        "yyyy-MM-dd"
      );

      const playlistStartDate = format(
        startOfMonth(new Date(playlistNewyear, month)),
        "yyyy-MM-dd"
      );

      const playlistEndDate = format(
        endOfMonth(new Date(playlistNewyear, month)),
        "yyyy-MM-dd"
      );

      // Fetch screenDetails and playlistDetails data in parallel
      const [screenResponse, clientResponse] = await Promise.all([
        supabase
          .from("screenDetails")
          .select("*")
          .eq("is_deleted", 0)
          .gte("created_at", startDate)
          .lte("created_at", endDate),

        supabase
          .from("usersList")
          .select("*")
          .eq("roleId", 3)
          .eq("is_deleted", 0)
          .gte("created_at", playlistStartDate)
          .lte("created_at", playlistEndDate),
      ]);

      const { data: screenData, error: screenError } = screenResponse;
      const { data: clientData, error: clientError } = clientResponse;

      if (screenError) {
        console.error(
          `Error fetching screen data for month ${month + 1}:`,
          screenError
        );
      } else {
        screenDataByMonth.push({
          month: format(new Date(newyear, month), "MMMM"), // Full month name
          screen: screenData.length,
        });
      }

      if (clientError) {
        console.error(
          `Error fetching client data for month ${month + 1}:`,
          clientError
        );
      } else {
        clientDataByMonth.push({
          month: format(new Date(playlistNewyear, month), "MMMM"), // Full month name
          playlist: clientData.length,
        });
      }
    });

    // Await all parallel fetch operations
    await Promise.all(fetchDataByMonth);

    // Sort the data by month order (January to December)
    const monthOrder = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Process chart data ensuring it's ordered by month
    const newChartData = screenDataByMonth
      .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month))
      .map((screenData, index) => ({
        month: screenData.month,
        screen: screenData.screen,
        client: clientDataByMonth[index]?.playlist || 0, // Default to 0 if not found
      }));

    const newChartDatascreen = screenDataByMonth
      .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month))
      .map((screenData) => ({
        month: screenData.month,
        screen: screenData.screen,
      }));

    const newChartDataclient = clientDataByMonth
      .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month))
      .map((clientData: any) => ({
        month: clientData.month,
        client: clientData.playlist,
      }));

    // Update chart data state
    setChartData(newChartData);
    setChartDatascreen(newChartDatascreen);
    setChartDataclient(newChartDataclient);
  };

  const fetchScreenData = async () => {
    const { data, error } = await supabase
      .from("screenDetails")
      .select("*")
      .eq("is_deleted", 0)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    const activeCount =
      data?.filter((screen) => screen.status === "Active").length ?? 0;
    const inactiveCount =
      data?.filter((screen) => screen.status === "Inactive").length ?? 0;

    setTotalScreens(data?.length ?? 0);
    setActiveScreens(activeCount);
    setInactiveScreens(inactiveCount);
  };

  const fetchClientData = async () => {
    const { data, error } = await supabase
      .from("usersList")
      .select("*")
      .eq("is_deleted", 0)
      .order("created_at", { ascending: false });
    if (error) {
      console.log(error);
      return;
    }
    const activeCount =
      data?.filter((screen) => screen.status === "Active").length ?? 0;
    const inactiveCount =
      data?.filter((screen) => screen.status === "Inactive").length ?? 0;
    setActiveClients(activeCount);
    setInactiveClients(inactiveCount);
    setTotalClients(data?.length ?? 0);
  };

  useEffect(() => {
    fetchDataForAllMonths();
    fetchScreenData();
    fetchClientData();
  }, [date]);

  // Use HTMLDivElement instead of HTMLElement
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const currentDate = format(new Date(), "dd-MM-yyyy"); //new Date().toLocaleDateString();

  const downloadAsImage = () => {
    if (sectionRef.current) {
      const elementsToShow = document.querySelectorAll(".print-only");
      elementsToShow.forEach((el) => {
        (el as HTMLElement).style.display = "block";
      });
      html2canvas(sectionRef.current).then((canvas: any) => {
        elementsToShow.forEach((el) => {
          (el as HTMLElement).style.display = "none";
        });
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "Dashboard-report-image.png";
        link.click();
      });
    } else {
      console.error("Section reference is null.");
    }
  };

  const downloadAsPDF = () => {
    if (sectionRef.current) {
      const elementsToShow = document.querySelectorAll(".print-only");
      elementsToShow.forEach((el) => {
        (el as HTMLElement).style.display = "block";
      });

      html2canvas(sectionRef.current).then((canvas) => {
        elementsToShow.forEach((el) => {
          (el as HTMLElement).style.display = "none";
        });
        const imgData = canvas.toDataURL("image/png");

        // Define the pdf format
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: [canvas.width, canvas.height],
        });

        // Scaling the image to fit the PDF page if needed
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if the content fits on one page, otherwise split
        if (imgHeight > pdf.internal.pageSize.getHeight()) {
          const totalPages = Math.ceil(
            imgHeight / pdf.internal.pageSize.getHeight()
          );

          for (let i = 0; i < totalPages; i++) {
            pdf.addImage(
              imgData,
              "PNG",
              0,
              -i * pdf.internal.pageSize.getHeight(),
              imgWidth,
              imgHeight
            );
            if (i < totalPages - 1) {
              pdf.addPage();
            }
          }
        } else {
          pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        }

        pdf.save("Dashboard-report-pdffile.pdf");
      });
    } else {
      console.error("Section reference is null.");
    }
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = event.target.value;
    setNewyear(newYear as any);
    fetchDataForAllMonths();
  };

  const handlePlaylistYearChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newYear = event.target.value;
    setPlaylistNewyear(newYear as any);
    fetchDataForAllMonths();
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedYear(newyear);
    }, 300); // Debounce delay in milliseconds

    const playlistHandler = setTimeout(() => {
      setPlaylistDebouncedYear(playlistNewyear);
    }, 300); // Debounce delay in milliseconds

    return () => {
      clearTimeout(handler);
      clearTimeout(playlistHandler);
    };
  }, [newyear, playlistNewyear]);

  useEffect(() => {
    fetchDataForAllMonths(); // This will trigger with the debounced year value
  }, [debouncedYear, PlaylistdebouncedYear]);

  // useEffect(() => {
  //   const userRole = localStorage.getItem("userRolename");
  //   console.log("testtt", userRole);
  //   if (userRole !== "1") {
  //     router.push("/unauthorized");
  //     window.location.href = "/unauthorized";
  //   }
  // });

  return (
    <>
      {/* <ProtectedRoute> */}
      <div className="w-full p-4" style={{ minHeight: "calc(10vh - 60px)" }}>
        <div className="w-full mt-1 flex items-center justify-between export-none ">
          <h1 className="text-2xl font-normal">
            Welcome to <span className="text-2xl font-bold ">S22 Digital</span>
          </h1>
          <div className="flex items-center gap-2">
            <div className="mt-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="outline-none">
                    <Download size={20} /> &nbsp; Download Report
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem onClick={downloadAsImage}>
                    <span>Download as Image</span>
                    <DropdownMenuShortcut>
                      <ImageDown size={15} />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadAsPDF}>
                    <span>Download as PDF</span>
                    <DropdownMenuShortcut>
                      <FileDown size={15} />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      <div
        ref={sectionRef}
        className="w-full p-4"
        style={{ minHeight: "calc(100vh - 60px)" }}
      >
        <div className="w-full flex items-center justify-between">
          <h1
            className="text-2xl font-normal mb-10 print-only"
            style={{ display: "none" }}
          >
            <span className="text-2xl font-bold ">S22 Digital</span> - Report
            {/* <span className="text-2xl font-bold float-right">
              Date: ({currentDate})
            </span> */}
          </h1>
          <div>
            <h1
              className="text-md font-normal mb-10 print-only"
              style={{ display: "none" }}
            >
              <span className="text-md font-bold">Date:</span> ({currentDate})
            </h1>
            {/* <h1
            className="text-md font-normal mb-0 print-only"
            style={{ display: "none" }}
          >
            Screen report for the year - {newyear}
          </h1>
          <h1
            className="text-md font-normal mb-10 print-only"
            style={{ display: "none" }}
          >
            Playlist report for the year - {playlistNewyear}
          </h1> */}
          </div>
        </div>
        <div className="w-full flex items-center justify-center gap-5 mt-3">
          <div className="w-2/4 h-[156px] p-6 bg-client_color border border-border_gray rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-primary_color">
                Total Screens
              </p>
              <MonitorPlay size={16} />
            </div>
            <h4 className="text-primary_color font-semibold text-2xl mt-3">
              {totalScreens}
            </h4>
            {/* <p className="text-xs text-secondary_color text-normal">
              +200.1% from last month
            </p> */}
            <p className="text-sm text-secondary_color text-medium mt-3">
              <span className="text-active">Active : {activeScreens}</span>{" "}
              <span className="text-delete_color ml-2">
                Inactive : {InactiveScreens}
              </span>
            </p>
          </div>
          <div className="w-2/4 h-[156px] p-6 bg-screen_color border border-border_gray rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-primary_color">
                Total Clients
              </p>
              <Users size={16} />
            </div>
            <h4 className="text-primary_color font-semibold text-2xl mt-3">
              {totalClients}
            </h4>
            {/* <p className="text-xs text-secondary_color text-normal">
              +200.1% from last month
            </p> */}
            <p className="text-sm text-secondary_color text-medium mt-3">
              <span className="text-active">Active : {activeClients}</span>{" "}
              <span className="text-delete_color ml-2">
                Inactive : {InactiveClients}
              </span>
            </p>
          </div>
        </div>
        {/*--------------------- Chart section starts here --------------------------------*/}
        <div className="flex items-center justify-between gap-5 chart_wrapper mt-5">
          <div className="w-[50%] border border-border_gray rounded-lg p-3">
            <div className="flex items-center justify-between">
              <h6 className="font-bold text-sm">Screen Overview</h6>
              <div className="border border-gray-300 rounded-[6px] px-3">
                <select
                  id="year"
                  value={newyear}
                  onChange={handleYearChange}
                  className="h-10 border-gray-300 rounded-[6px] text-sm focus-visible:outline-none"
                >
                  {Array.from({ length: 1 }, (_, i) => (
                    <option key={i} value={new Date().getFullYear() - i}>
                      {new Date().getFullYear() - i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="w-full mt-1 ml-[-43px] pl-0 pt-4 pf-4 pb-4">
              <ChartContainer
                config={chartConfig}
                className="min-h-[200px] w-full"
              >
                <BarChart data={chartDatascreen}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value: any) => value.slice(0, 3)}
                  />
                  <YAxis
                    tickCount={30} // Control how many ticks appear on the Y-axis
                    domain={[0, "auto"]} // Adjust the domain if necessary
                    allowDecimals={false} // Prevent decimal numbers in the ticks
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="screen" fill="var(--color-screen)" radius={4}>
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={14}
                    />
                  </Bar>
                  {/* <Bar dataKey="client" fill="var(--color-client)" radius={4} /> */}
                </BarChart>
              </ChartContainer>
            </div>
          </div>
          <div className="w-[50%] border border-border_gray rounded-lg p-3">
            <div className="flex items-center justify-between">
              <h6 className="font-bold text-sm">Client Overview</h6>
              <div className="border border-gray-300 rounded-[6px] px-3">
                <select
                  id="year"
                  value={playlistNewyear}
                  onChange={handlePlaylistYearChange}
                  className="h-10 border-gray-300 rounded-[6px] text-sm focus-visible:outline-none"
                >
                  {Array.from({ length: 1 }, (_, i) => (
                    <option key={i} value={new Date().getFullYear() - i}>
                      {new Date().getFullYear() - i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="w-full mt-1 ml-[-43px] pl-0 pt-4 pf-4 pb-4">
              <ChartContainer
                config={chartConfig}
                className="min-h-[200px] w-full"
              >
                <BarChart data={chartDataclient}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value: any) => value.slice(0, 3)}
                  />
                  <YAxis
                    tickCount={30} // Control how many ticks appear on the Y-axis
                    domain={[0, "auto"]} // Adjust the domain if necessary
                    allowDecimals={false} // Prevent decimal numbers in the ticks
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="client" fill="var(--color-screen)" radius={4}>
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={14}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>
        {/*--------------------- Chart section ends here --------------------------------*/}
      </div>
      {/* </ProtectedRoute> */}
    </>
  );
};

export default DashboardPage;
