"use client";
import React, {
  createContext,
  useRef,
  useState,
  FC,
  ChangeEvent,
  useEffect,
} from "react";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  CirclePlus,
  Copy,
  Download,
  FileDown,
  ImageDown,
  ListVideo,
  Loader2,
  MonitorPlay,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import toast, { Toaster } from "react-hot-toast";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/utils/supabase/supabaseClient";
import { format, startOfMonth, endOfMonth } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./style.css";

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
    label: "Playlist",
    color: "#5E5E5E",
  },
} satisfies ChartConfig;

const Dashboard: FC = () => {
  const [date, setDate] = useState<Date>();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [totalScreens, setTotalScreens] = useState<number>(0);
  const [activeScreens, setActiveScreens] = useState(0);
  const [InactiveScreens, setInactiveScreens] = useState(0);
  const [totalPlaylists, setTotalPlaylists] = useState(0);
  const [signedInUserId, setSignedInUserId] = useState<string | null>("");
  const [newyear, setNewyear] = useState(new Date().getFullYear());
  const [playlistNewyear, setPlaylistNewyear] = useState(
    new Date().getFullYear()
  );
  const [debouncedYear, setDebouncedYear] = useState(newyear);
  const [PlaylistdebouncedYear, setPlaylistDebouncedYear] =
    useState(playlistNewyear);
  // const [PlaylistdebouncedYear, setPlaylistDebouncedYear] =
  //   useState(playlistNewyear);

  const [chartDatascreen, setChartDatascreen] = useState<ChartDatascreen[]>([]);
  const [chartDataclient, setChartDataclient] = useState<ChartDataclient[]>([]);

  const fetchScreenData = async () => {
    try {
      // console.log("inside screenData function");
      //const user = await getUserData();
      //const userId = user?.id || null;
      const { data, error } = await supabase
        .from("screenDetails")
        .select("*")
        .eq("userId", signedInUserId) // Ensure signedInUserId is set correctly
        .eq("is_deleted", 0);

      if (error) {
        throw error; // This will catch the error in the catch block
      }
      // Calculate the count of active and inactive screens
      const activeCount = data.filter(
        (screen) => screen.status === "Active"
      ).length;
      const inactiveCount = data.filter(
        (screen) => screen.status === "Inactive"
      ).length;

      // Optionally, update the state with these counts (assuming you're using state management)
      setTotalScreens(data.length);
      setActiveScreens(activeCount);
      setInactiveScreens(inactiveCount);
    } catch (error: any) {
      console.error("Error fetching screen data:", error.message);
    }
  };

  const fetchPlaylistData = async () => {
    //const user = await getUserData();
    //const userId = user?.id || null;

    // Fetch all playlists for the user
    const { data, error } = await supabase
      .from("playlistDetails")
      .select("*")
      .eq("is_deleted", 0)
      .eq("userId", signedInUserId)
      .order("created_at", { ascending: false });

    // Handle error
    if (error) {
      console.log(error);
      return;
    }

    // Set total playlists count for the current year
    setTotalPlaylists(data.length);
  };

  const fetchDataForAllMonths = async () => {
    const user = await getUserData();
    const userId = user?.id || null;


    const startDate = format(new Date(newyear, 0, 1), "yyyy-MM-dd"); // January 1st
    const endDate = format(new Date(newyear, 11, 31), "yyyy-MM-dd"); // December 31st
    const playlistStartDate = format(
      new Date(playlistNewyear, 0, 1),
      "yyyy-MM-dd"
    );
    const playlistEndDate = format(
      new Date(playlistNewyear, 11, 31),
      "yyyy-MM-dd"
    );

    // const playlistStartDate = format(
    //   new Date(playlistNewyear, 0, 1),
    //   "yyyy-MM-dd"
    // );
    // const playlistEndDate = format(
    //   new Date(playlistNewyear, 11, 31),
    //   "yyyy-MM-dd"
    // );

    // Fetch all screenDetails and playlistDetails data at once
    const [screenResponse, clientResponse] = await Promise.all([
      supabase
        .from("screenDetails")
        .select("*")
        .eq("userId", userId)
        .eq("is_deleted", 0)
        .gte("created_at", startDate)
        .lte("created_at", endDate),


      supabase
        .from("playlistDetails")
        .select("*")
        .eq("userId", userId)
        .eq("is_deleted", 0)
        .gte("created_at", playlistStartDate)
        .lte("created_at", playlistEndDate),
    ]);


    const { data: screenData, error: screenError } = screenResponse;
    const { data: clientData, error: clientError } = clientResponse;


    if (screenError) {
      console.error("Error fetching screen data:", screenError);
      return; // Exit early if there's an error
    }


    if (clientError) {
      console.error("Error fetching client data:", clientError);
      return; // Exit early if there's an error
    }


    // Initialize monthly data arrays
    const screenDataByMonth: { month: string; screen: number }[] = Array(12)
      .fill(0)
      .map((_, index) => ({
        month: format(new Date(newyear, index), "MMMM"),
        screen: 0,
      }));
    // const screenDataByMonth: { month: string; screen: number }[] = Array(12)
    //   .fill(0)
    //   .map((_, index) => ({
    //     month: format(new Date(newyear, index), "MMMM"),
    //     screen: 0,
    //   }));

    // const clientDataByMonth: { month: string; client: number }[] = Array(12)
    //   .fill(0)
    //   .map((_, index) => ({
    //     month: format(new Date(playlistNewyear, index), "MMMM"),
    //     client: 0, // Ensure this property matches your ChartDataclient interface
    //   }));
    const clientDataByMonth: { month: string; client: number }[] = Array(12)
      .fill(0)
      .map((_, index) => ({
        month: format(new Date(playlistNewyear, index), "MMMM"),
        client: 0, // Ensure this property matches your ChartDataclient interface
      }));

    // Process screenData to populate screenDataByMonth
    // screenData.forEach((item) => {
    screenData.forEach((item) => {
      const createdMonth = new Date(item.created_at).getMonth(); // Get month index
      screenDataByMonth[createdMonth].screen += 1; // Increment the count for the month
    });

    // Process clientData to populate clientDataByMonth
    // clientData.forEach((item) => {
    clientData.forEach((item) => {
      const createdMonth = new Date(item.created_at).getMonth(); // Get month index
      clientDataByMonth[createdMonth].client += 1; // Increment the count for the month
    });

    // Combine screenDataByMonth and clientDataByMonth into newChartData
    const newChartData = screenDataByMonth.map((screenData, index) => ({
      month: screenData.month,
      screen: screenData.screen,
      client: clientDataByMonth[index]?.client || 0, // Default to 0 if not found
    }));

    // Update chart data state
    setChartData(newChartData);
    setChartDatascreen(screenDataByMonth);
    setChartDataclient(clientDataByMonth); // Ensure this uses client
  };

  useEffect(() => {
    if (signedInUserId) {
      fetchDataForAllMonths();
      fetchScreenData();
      fetchPlaylistData();
    }
  }, [date, newyear, playlistNewyear, signedInUserId]);

  useEffect(() => {
    // const userName = async () => {
    // const user = await getUserData();
    // setSignedInUserId(user?.id || null);
    // // localStorage.setItem('userId', user?.id!);
    // // localStorage.setItem('userEmail', user?.email!);
    // console.log("user id ", user?.id || null);
    // return user;
    // };
    // userName();
    setSignedInUserId(localStorage.getItem('userId') || null);
  }, []);

  // Use HTMLDivElement instead of HTMLElement
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const currentDate = format(new Date(), "dd-MM-yyyy"); //format(new Date().toISOString(), "dd-MM-yyyy"); //new Date().toLocaleDateString();

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

      html2canvas(sectionRef.current).then((canvas: any) => {
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
    //fetchDataForAllMonths();
  };

  const handlePlaylistYearChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newYear = event.target.value;
    setPlaylistNewyear(newYear as any);
    //fetchDataForAllMonths();
  };

  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     setDebouncedYear(newyear);
  //   }, 300); // Debounce delay in milliseconds

  //   const handlerPlaylist = setTimeout(() => {
  //     setPlaylistDebouncedYear(playlistNewyear);
  //   }, 300);

  //   return () => {
  //     clearTimeout(handler);
  //     clearTimeout(handlerPlaylist);
  //   };
  // }, [newyear, playlistNewyear]);

  // useEffect(() => {
  //   fetchDataForAllMonths(); // This will trigger with the debounced year value
  // }, [debouncedYear, PlaylistdebouncedYear]);

  return (
    <>
      <div className="w-full p-4" style={{ minHeight: "calc(10vh - 60px)" }}>
        <div className="w-full mt-1 flex items-center justify-between export-none ">
          <h1 className="text-2xl font-normal">
            Welcome to <span className="text-2xl font-bold ">S22 Digital</span>
          </h1>
          {/* <div className="mt-0">
            <button
              onClick={downloadAsPDF}
              className="bg-primary float-right text-white px-4 py-2 rounded mr-2 flex items-center"
            ><Download size={20} /> &nbsp; Download Report</button>
          </div> */}
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
            <span className="text-2xl font-bold float-left">S22 Digital</span> -
            Report
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
                Total Playlists
              </p>
              <ListVideo size={16} />
            </div>
            <h4 className="text-primary_color font-semibold text-2xl mt-3">
              {totalPlaylists}
            </h4>
          </div>
        </div>
        {/*--------------------- Chart section starts here --------------------------------*/}
        <div className="flex items-center justify-between gap-5 chart_wrapper mt-5">
          <div className="w-[50%] border border-border_gray rounded-lg p-3">
            <div className="w-full flex items-center justify-between">
              <h6 className="font-bold text-sm">Screen Overview</h6>
              <div className="border border-gray-300 rounded-[6px] px-3 no-print">
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
              {/* p-4 */}
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
                    tickCount={20} // Control how many ticks appear on the Y-axis
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
            <div className="w-full flex items-center justify-between">
              <h6 className="font-bold text-sm">Playlist Overview</h6>
              <div className="border border-gray-300 rounded-[6px] px-3 no-print">
                <select
                  id="year1"
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
    </>
  );
};

export default Dashboard;
