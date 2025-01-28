"use client";
import PlaylistPopover from "@/components/playlist-popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { format, isBefore, isEqual, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  TriangleAlert,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import { supabase } from "@/utils/supabase/supabaseClient";
// import toast, { Toaster } from "react-hot-toast";
import RepeatPopover from "@/components/repeat-popover";
import MultiSelectPopover from "@/components/multi-select-popover";
import TurnOffScreen from "@/components/turnoff-screen-page";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast, useToast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

interface ContentItems {
  id: string;
  playlistName: string;
}

const repeatOptions = [
  {
    value: "Daily (Mon-Sun)",
    label: "Daily (Mon-Sun)",
  },
  {
    value: "Every Weekday (Mon-Fri)",
    label: "Every Weekday (Mon-Fri)",
  },
  {
    value: "Every Weekend (Sat-Sun)",
    label: "Every Weekend (Sat-Sun)",
  },
  {
    value: "Monthly",
    label: "Monthly",
  },
  {
    value: "Annually",
    label: "Annually",
  },
  {
    value: "Custom",
    label: "Custom",
  },
];

const repeatEveryOptions = [
  {
    value: "Day",
    label: "Day",
  },
  {
    value: "Week",
    label: "Week",
  },
  {
    value: "Month",
    label: "Month",
  },
  {
    value: "Year",
    label: "Year",
  },
];

const customRepeatOptions = [
  {
    value: "Forever",
    label: "Forever",
  },
  {
    value: "Custom Date",
    label: "Custom Date",
  },
];

const zoneOptions = [
  {
    value: "zone1",
    label: "zone1",
  },
  {
    value: "zone2",
    label: "zone2",
  },
  {
    value: "zone3",
    label: "zone3",
  },
];

const CreateSchedule = () => {
  const router = useRouter();
  const [selectedValue, setSelectedValue] = useState("schedule-content");
  const [scheduleName, setScheduleName] = useState<string>("");
  const [PlaylistValue, setPlaylistValue] = useState<string | null>("");
  const [playlistList, setPlaylistList] = useState<ContentItems[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    ""
  );
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [repeatDate, setRepeatDate] = useState<Date>();

  const [startTime, setStartTime] = useState<Date>();
  const [endTime, setEndTime] = useState<Date>();

  const [repeatSection, setRepeatSection] = useState(false);
  const [repeatUntilDate, setRepeatUntilDate] = useState(false);
  const [repeatValue, setRepeatValue] = useState<string | null>("");
  const [selectedRepeatId, setSelectedRepeatId] = useState<string | null>("");

  const [repeatEveryValue, setRepeatEveryValue] = useState<string | null>(""); // Repeat Input value
  const [repeatEveryDay, setRepeatEveryDay] = useState<string | null>(""); // Repeat select value
  const [selectedRepeatEveryId, setSelectedRepeatEveryId] = useState<
    string | null
  >("");

  const [customRepeatValue, setCustomRepeatValue] = useState<string | null>("");
  const [selectCustomRepeatId, setSelectCustomRepeatId] = useState<
    string | null
  >("");

  const [selectedScreenValues, setSelectedScreenValues] = useState<
    string | null
  >("");
  const [screenList, setScreenList] = useState<any[]>([]);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>("");
  const [screenOpen, setScreenOpen] = useState(false);
  const [zoneValue, setZoneValue] = useState<string | null>("");

  const [errors, setErrors] = useState<any>({});
  const [addLoader, setAddLoader] = useState(false);
  const [cancelLoader, setCancelLoader] = useState(false);

  const [screenSearchQuery, setScreenSearchQuery] = useState("");
  const [changeCheck, setChangeCheck] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const [formFilled, setFormFilled] = useState(false);
  const [backLoader, setBackLoader] = useState(false);
  const [zoneObjects, setZoneObjects] = useState<any[]>([]);

  const filteredScreens = screenList.filter((playlist: any) => {
    return playlist.screenname
      .toLowerCase()
      .includes(screenSearchQuery.toLowerCase());
  });

  const handleRadioChange = (event: any) => {
    setSelectedValue(event.target.value);
  };

  // const handleSelect = (currentValue: string | number) => {
  //   console.log("currentValue", currentValue);
  //   if (selectedScreenValues.includes(currentValue as string)) {
  //     setSelectedScreenValues(
  //       selectedScreenValues.filter(
  //         (value: string | number) => value !== currentValue
  //       )
  //     );
  //     console.log("selectedScreenValues", selectedScreenValues);
  //   } else {
  //     setSelectedScreenValues([
  //       ...selectedScreenValues,
  //       currentValue.toString(),
  //     ]);
  //   }
  // };

  // const notify = (message: string, success: boolean) =>
  //   toast[success ? "success" : "error"](message, {
  //     style: {
  //       borderRadius: "10px",
  //       background: "#fff",
  //       color: "#000",
  //     },
  //     position: "top-right",
  //     duration: 2000,
  //   });

  const formatTime12Hour = (date: Date): string => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const hours = date.getHours();
    const minutes = date.getMinutes();

    const strDay = day < 10 ? "0" + day : day.toString();
    const strMonth = month < 10 ? "0" + month : month.toString();
    const strYear = year.toString();

    const strHours = hours < 10 ? "0" + hours : hours.toString();
    const strMinutes = minutes < 10 ? "0" + minutes : minutes.toString();

    return `${strDay}.${strMonth}.${strYear},${strHours}:${strMinutes}`;
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!scheduleName) newErrors.scheduleName = "Schedule Name is required";
    if (!selectedPlaylistId) newErrors.playlist = "Playlist is required";
    if (!startDate) newErrors.startDate = "Start Date is required";
    if (!startTime) newErrors.startTime = "Start Time is required";
    if (!endDate) newErrors.endDate = "End Date is required";
    if (!endTime) newErrors.endTime = "End Time is required";
    if (repeatUntilDate && !repeatDate)
      newErrors.repeatDate = "Repeat Date is required";
    // if (!repeatValue) newErrors.repeat = "Repeat is required";
    if (repeatSection && !repeatEveryValue && !repeatEveryDay)
      newErrors.repeatEvery = "Repeat Every Value is required";
    if (repeatSection && !customRepeatValue)
      newErrors.repeatUntil = "Repeat Until is required";
    if (!selectedScreenValues) newErrors.screen = "Screen is required";
    if (!zoneValue) newErrors.zone = "Zone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to check if the form is filled
  const isFormFilled = () => {
    return (
      !!scheduleName ||
      !!selectedPlaylistId ||
      !!startDate ||
      !!startTime ||
      !!endDate ||
      !!endTime ||
      !!repeatUntilDate ||
      !!repeatDate ||
      !!repeatEveryValue ||
      !!repeatEveryDay ||
      !!customRepeatValue ||
      !!selectedScreenValues ||
      !!zoneValue
    );
  };

  useEffect(() => {
    // Reset errors on mount
    setErrors({});

    // Check if any form field is filled
    const formFilled = isFormFilled();
    setFormFilled(formFilled); // Assuming setFormFilled is your state setter for formFilled
    if (formFilled) {
      setChangeCheck(true);
    } else {
      setChangeCheck(false);
    }

    // Handle the beforeunload event
    const handleBeforeUnload = (e: any) => {
      if (formFilled) {
        e.preventDefault();
        e.returnValue = ""; // This is required to show the confirmation dialog in some browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [
    scheduleName,
    selectedPlaylistId,
    startDate,
    startTime,
    endDate,
    endTime,
    repeatUntilDate,
    repeatDate,
    repeatEveryValue,
    repeatEveryDay,
    customRepeatValue,
    selectedScreenValues,
    zoneValue,
  ]);

  const handleCreateSchedule = async () => {
    if (!validateForm()) return;

    setAddLoader(true);
    const formattedStartDate = startDate
      ? format(startDate, "yyyy-MM-dd")
      : null;
    const formattedEndDate = endDate ? format(endDate, "yyyy-MM-dd") : null;
    const formattedCustomDate = repeatDate
      ? format(repeatDate, "yyyy-MM-dd")
      : null;
    const currentDate = parseISO(new Date().toISOString().split("T")[0]);
    // Compare the actual Date objects
    if (startDate && endDate) {
      if (isBefore(endDate, startDate)) {
        // Handle invalid end date (before start date or equal)
        toast({
          variant: "destructive",
          title: "Failed to update!",
          description: "End date should not be before the start date!",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
        setAddLoader(false);
        return false;
      }

      if (isBefore(startDate, currentDate)) {
        // Handle start date being a past date
        toast({
          variant: "destructive",
          title: "Failed to update!",
          description: "Start date should not be a past date!",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
        setAddLoader(false);
        return false;
      }
    }

    if (startTime && endTime) {
      if (endTime <= startTime) {
        toast({
          variant: "destructive",
          title: "Failed to update!",
          description: "End time should not be a past time!",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
        setAddLoader(false);
        return false; // Return false if the end time is not valid
      }
    }
    const userId = localStorage.getItem("userId");

    const { error } = await supabase
      .from("scheduledContents")
      .insert({
        scheduleName,
        playlist: selectedPlaylistId,
        userId,
        time: formatTime12Hour(new Date()),
        screen: selectedScreenValues,
        zone: zoneValue,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        startTime: startTime,
        endTime: endTime,
        repeat: repeatValue || null,
        repeatValue: repeatEveryValue || null,
        repeatDays: repeatEveryDay || null,
        repeatUntilValue: customRepeatValue || null,
        repeatUntilDate: formattedCustomDate || null,
        type: "TurnOn",
      })
      .select();

    if (error) {
      console.error("Error creating schedule:", error);
      setAddLoader(false);
    } else {
      //notify("Schedule created successfully", true);
      toast({
        title: "Created Successfully!.",
        description: "Schedule has created successfully!",
        action: <ToastAction altText="Ok">Ok</ToastAction>,
      });
      setTimeout(() => {
        router.push("/schedule");
        setAddLoader(false);
      }, 3000);
    }
  };

  const fetchPlaylistData = async () => {
    const userId = localStorage.getItem("userId");
    const { data, error } = await supabase
      .from("playlistDetails")
      .select("*")
      .eq("is_deleted", 0)
      .eq("userId", userId);
    if (error) {
      console.error("Error fetching data p:", error);
    } else if (data) {
      setPlaylistList(data);
    }
  };

  const fetchScreenData = async () => {
    const userId = localStorage.getItem("userId");
    const { data, error } = await supabase
      .from("screenDetails")
      .select("*")
      .eq("is_deleted", 0)
      .eq("userId", userId);
    if (error) {
      console.error("Error fetching data s:", error);
    } else if (data) {
      setScreenList(data);
    }
  };

  const handleScreenSelect = (currentValue: string | null) => {
    // Reset the zone value whenever the screen changes
    setZoneValue(null); // Reset the zone value

    // Create an array to hold zone objects
    let zonesForScreen: { value: string; label: string }[] = [];

    // Ensure you use selectedValue in the query to fetch new screen data
    supabase
      .from("screenDetails")
      .select("*")
      .eq("is_deleted", 0)
      .eq("id", currentValue) // Use selectedValue instead of selectedScreenId
      .single()
      .then(({ data: screenData, error: screenError }) => {
        if (screenError) {
          console.error("Error fetching existing session:", screenError);
          return;
        }
        if (screenData) {
          supabase
            .from("layouts")
            .select("*")
            .eq("id", screenData?.layout)
            .single()
            .then(({ data: layoutData, error: layoutError }) => {
              if (layoutError) {
                console.error("Error fetching existing session:", layoutError);
                return;
              }
              if (layoutData) {
                // Check each zone and push to the array if not empty
                if (layoutData.zone1) {
                  zonesForScreen.push({
                    value: "zone1",
                    label: "Zone 1",
                  });
                }
                if (layoutData.zone2) {
                  zonesForScreen.push({
                    value: "zone2",
                    label: "Zone 2",
                  });
                }
                if (layoutData.zone3) {
                  zonesForScreen.push({
                    value: "zone3",
                    label: "Zone 3",
                  });
                }

                // Update the state with the accumulated zone objects
                setZoneObjects(zonesForScreen);
              }
            });
        }
      });
  };

  const handleChange = (e: any) => {
    let value = Number(e.target.value);
    if (value > 31) {
      //notify("Please enter a value less than 31", false);
      toast({
        title: "Input Error!.",
        description: "Please enter a value less than 31!",
      });
      value = 31;
    } else if (value < 1 || isNaN(value) || value === 0) {
      //notify("Please enter a value greater than 0", false);
      toast({
        title: "Input Error!.",
        description: "Please enter a value less than 31!",
      });
      value = 1;
    }
    setRepeatEveryValue(value as any);
    console.log(value);
  };

  useEffect(() => {
    fetchPlaylistData();
    fetchScreenData();
  }, []);

  return (
    <div className="w-full p-4">
      <Toaster />

      {
        <div className="w-full p-4 pl-0">
          <div className="w-full flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <h4
                className="text-sm font-medium text-primary_color cursor-pointer"
                onClick={() => {
                  setBackLoader(true);
                  setTimeout(() => {
                    router.back();
                    setBackLoader(false);
                  }, 3000);
                }}
                style={backLoader ? { pointerEvents: "none" } : {}}
              >
               {backLoader ? (
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
                      className="opacity-100"
                      fill="#FF7C44"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Schedule"
                )}
              </h4>
              <ChevronRight size={20} />
              <h4 className="text-sm font-medium text-primary_color">
                Create Schedule
              </h4>
            </div>
          </div>
        </div>
      }
      <div className="w-full p-3 border border-border_gray rounded">
        <div className="w-full flex justify-between items-center border-b border-primary_color pb-2">
          <h2 className="text-2xl font-semibold text-primary_color">
            Create Schedule
          </h2>
        </div>
        <div className="w-full flex items-center gap-2 py-3">
          <div>
            <p className="w-[80px] text-sm font-medium text-primary_color">
              Event Type
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              value="schedule-content"
              id="schedule-content"
              checked={selectedValue === "schedule-content"}
              onChange={handleRadioChange}
              className="radio cursor-pointer"
            />
            <Label htmlFor="schedule-content" className="label cursor-pointer">
              Schedule Content
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              value="turn-off-screen"
              id="turn-off-screen"
              checked={selectedValue === "turn-off-screen"}
              onChange={handleRadioChange}
              className="radio cursor-pointer"
            />
            <Label htmlFor="turn-off-screen" className="label cursor-pointer">
              Turn Off Screen
            </Label>
          </div>
        </div>
        <div className="w-full flex flex-col items-start gap-2">
          <div className="w-full content mt-4">
            {selectedValue === "schedule-content" && (
              <div className="main-wrapper">
                <div>
                  <Label>Schedule Name</Label>
                  <Input
                    type="text"
                    className="w-full mt-1"
                    placeholder="Schedule 01"
                    onChange={(e) => setScheduleName(e.target.value)}
                  />
                  {errors.scheduleName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.scheduleName}
                    </p>
                  )}
                </div>
                <div className="mt-1.5">
                  <Label className="text-sm font-medium text-primary_color">
                    Playlist
                  </Label>
                  <div className="pt-0 mt-1">
                    <PlaylistPopover
                      PlaylistValue={PlaylistValue as any}
                      setPlaylistValue={setPlaylistValue}
                      playlistList={playlistList}
                      selectedPlaylistId={selectedPlaylistId}
                      setSelectedPlaylistId={setSelectedPlaylistId}
                    />
                    {errors.playlist && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.playlist}
                      </p>
                    )}
                  </div>
                </div>
                {/* ------------------------------------------------- Start date time & End date time section ----------------------------------------- */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-1/2">
                    <Label className="text-sm font-medium text-primary_color block mb-1">
                      Start Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full flex-row-reverse justify-between text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? (
                            format(startDate, "yyyy-MM-dd")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.startDate}
                      </p>
                    )}
                  </div>
                  <div className="w-1/2">
                    <Label className="text-sm font-medium text-primary_color block mb-1">
                      Start Time
                    </Label>
                    <div className="relative">
                      <Input
                        type="time"
                        className="w-full mt-1 items-center justify-between block"
                        placeholder="09:00"
                        onChange={(e) => setStartTime(e.target.value as any)}
                      />
                    </div>
                    {errors.startTime && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.startTime}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-1/2">
                    <Label className="text-sm font-medium text-primary_color block mb-1">
                      End Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full flex-row-reverse justify-between text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? (
                            format(endDate, "yyyy-MM-dd")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.endDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                  <div className="w-1/2">
                    <Label className="text-sm font-medium text-primary_color block mb-1">
                      End Time
                    </Label>
                    <div className="relative">
                      <Input
                        type="time"
                        className="w-full mt-1 items-center justify-between block"
                        placeholder="09:00"
                        onChange={(e) => setEndTime(e.target.value as any)}
                      />
                    </div>
                    {errors.endTime && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.endTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* ------------------------------------------------- Repeat section ----------------------------------------- */}
                <div className="mt-1.5">
                  <Label className="text-sm font-medium text-primary_color">
                    Repeat
                  </Label>
                  <div className="pt-0 mt-1">
                    <div className="w-full">
                      <RepeatPopover
                        repeatValue={repeatValue}
                        setRepeatValue={setRepeatValue}
                        selectedRepeatId={selectedRepeatId}
                        setSelectedRepeatId={setSelectedRepeatId}
                        repeatOptions={repeatOptions}
                        width={"[90vw]"}
                        selectWidth={"full"}
                        defaultValue="Select Repeat"
                        placeholderValue="Select Repeat..."
                        repeatSection={repeatSection}
                        setRepeatSection={setRepeatSection}
                        repeatUntilDate={repeatUntilDate}
                        setRepeatUntilDate={setRepeatUntilDate}
                        setRepeatEveryValue={setRepeatEveryValue}
                        setRepeatEveryDay={setRepeatEveryDay}
                        setCustomRepeatValue={setCustomRepeatValue}
                        setRepeatDate={setRepeatDate}
                        notFoundMessage="No repeat found"
                      />
                      {errors.repeat && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.repeat}
                        </p>
                      )}
                    </div>
                  </div>
                  {repeatSection && (
                    <>
                      <div className="mt-2.5 flex items-center justify-between">
                        <Label className="text-sm font-medium text-primary_color block mb-1">
                          Repeat Every
                        </Label>
                        <div>
                          <div className="flex justify-end items-center">
                            <Input
                              type="number"
                              min={1}
                              max={31}
                              onChange={handleChange}
                              className="w-[93px] flex items-center justify-between mr-3"
                              // placeholder="1"
                            />
                            <div className="w-[221px]">
                              <RepeatPopover
                                repeatValue={repeatEveryDay}
                                setRepeatValue={setRepeatEveryDay}
                                selectedRepeatId={selectedRepeatEveryId}
                                setSelectedRepeatId={setSelectedRepeatEveryId}
                                repeatOptions={repeatEveryOptions}
                                width={"[221px]"}
                                selectWidth={"full"}
                                defaultValue="Select Repeat"
                                placeholderValue="Select Repeat..."
                                repeatSection={repeatSection}
                                setRepeatSection={setRepeatSection}
                                repeatUntilDate={repeatUntilDate}
                                setRepeatUntilDate={setRepeatUntilDate}
                                setRepeatEveryValue={setRepeatEveryValue}
                                setRepeatEveryDay={setRepeatEveryDay}
                                setCustomRepeatValue={setCustomRepeatValue}
                                setRepeatDate={setRepeatDate}
                                notFoundMessage="No repeat found"
                                //   setErrors={setErrors}
                              />
                            </div>
                          </div>
                          {errors.repeatEvery && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.repeatEvery}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between">
                        <Label className="text-sm font-medium text-primary_color block mb-1">
                          Repeat Until
                        </Label>
                        <div className="w-[326px]">
                          <RepeatPopover
                            repeatValue={customRepeatValue}
                            setRepeatValue={setCustomRepeatValue}
                            selectedRepeatId={selectedRepeatEveryId}
                            setSelectedRepeatId={setSelectedRepeatEveryId}
                            repeatOptions={customRepeatOptions}
                            width={"[326px]"}
                            selectWidth={"full"}
                            defaultValue="Select Repeat"
                            placeholderValue="Select Repeat..."
                            repeatSection={repeatSection}
                            setRepeatSection={setRepeatSection}
                            repeatUntilDate={repeatUntilDate}
                            setRepeatUntilDate={setRepeatUntilDate}
                            setRepeatEveryValue={setRepeatEveryValue}
                            setRepeatEveryDay={setRepeatEveryDay}
                            setCustomRepeatValue={setCustomRepeatValue}
                            setRepeatDate={setRepeatDate}
                            notFoundMessage="No repeat found"
                          />
                          {errors.repeatUntil && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.repeatUntil}
                            </p>
                          )}
                        </div>
                      </div>
                      {repeatUntilDate && (
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <div className="w-1/2">
                            <Label className="text-sm font-medium text-primary_color block mb-1">
                              Date
                            </Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full flex-row-reverse justify-between text-left font-normal",
                                    !repeatDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {repeatDate ? (
                                    format(repeatDate, "yyyy-MM-dd")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={repeatDate}
                                  onSelect={setRepeatDate}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            {errors.repeatDate && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.repeatDate}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* ------------------------------------------------- Screen section ----------------------------------------- */}
                <div className="flex items-center justify-between gap-2">
                  <div className="mt-2 w-1/2">
                    <Label className="text-sm font-medium text-primary_color block mb-1">
                      Select Screen
                    </Label>
                    <div className="w-full">
                      {/* <MultiSelectPopover
                        selectedScreenValues={selectedScreenValues}
                        setSelectedScreenValues={setSelectedScreenValues}
                        handleSelect={handleSelect}
                        width={"[60vw]"}
                        selectWidth={"full"}
                        defaultValue="Select Screen"
                        placeholderValue="Select Screen..."
                      /> */}
                      <Popover open={screenOpen} onOpenChange={setScreenOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={screenOpen}
                            className="w-full justify-between"
                          >
                            {selectedScreenValues
                              ? screenList.find(
                                  (screen: any) =>
                                    screen.id === selectedScreenValues
                                )?.screenname
                              : "Select Screen"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
                          </Button>
                        </PopoverTrigger>
                        <div className="relative" style={{ width: "auto" }}>
                          <PopoverContent className={`w-[90vw] mx-auto p-0`}>
                            <Command>
                              <Input
                                placeholder="Search screen..."
                                value={screenSearchQuery}
                                className="rounded-none"
                                onChange={(e: any) =>
                                  setScreenSearchQuery(e.target.value)
                                }
                              />
                              <CommandList>
                                {filteredScreens.length === 0 ? (
                                  <CommandEmpty className="max-h-[60px] h-[30px] flex justify-center pt-1">
                                    No screen found
                                  </CommandEmpty>
                                ) : (
                                  <CommandGroup>
                                    {filteredScreens.map((screen: any) => (
                                      <CommandItem
                                        key={screen.id}
                                        value={screen.id}
                                        onSelect={(currentValue) => {
                                          const selectedValue =
                                            currentValue ===
                                            selectedScreenValues
                                              ? null
                                              : currentValue;
                                          setSelectedScreenValues(
                                            selectedValue
                                          );
                                          setSelectedScreenId(selectedValue);
                                          setScreenOpen(false);
                                          console.log(
                                            "selectedValue",
                                            selectedValue
                                          );
                                          handleScreenSelect(selectedValue);
                                        }}
                                        className={cn(
                                          "flex items-center justify-between",
                                          selectedScreenValues === screen.id &&
                                            "bg-gray-200"
                                        )}
                                      >
                                        <div className="flex items-center">
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              selectedScreenValues === screen.id
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {screen.screenname}
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                )}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </div>
                      </Popover>
                      {errors.screen && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.screen}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 w-1/2">
                    <Label className="text-sm font-medium text-primary_color block mb-1">
                      Select Zone
                    </Label>
                    <div className="w-full">
                      <RepeatPopover
                        repeatValue={zoneValue}
                        setRepeatValue={setZoneValue}
                        selectedRepeatId={() => {}}
                        setSelectedRepeatId={() => {}}
                        repeatOptions={zoneObjects}
                        width={"[221px]"}
                        selectWidth={"full"}
                        defaultValue="Select zone"
                        placeholderValue="Select zone..."
                        repeatSection={() => {}}
                        setRepeatSection={() => {}}
                        repeatUntilDate={() => {}}
                        setRepeatUntilDate={() => {}}
                        setRepeatEveryValue={() => {}}
                        setRepeatEveryDay={() => {}}
                        setCustomRepeatValue={() => {}}
                        setRepeatDate={() => {}}
                        notFoundMessage="No zone found"
                        //   setErrors={setErrors}
                      />
                      {errors.zone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.zone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full flex items-center justify-center gap-2 mt-5 mx-auto">
                  {changeCheck === true ? (
                    <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-[144px] h-[38px]"
                          variant={"outline"}
                        >
                          Cancel
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[397px] sm:max-h-[342px]">
                        <DialogHeader className="flex flex-col space-y-0">
                          <DialogTitle className="text-2xl font-semibold flex items-center gap-1">
                            <TriangleAlert size={20} className="text-red-500" />{" "}
                            Warning!
                          </DialogTitle>
                          <DialogDescription className="m-0">
                            Data will be lost if you leave the page, are you
                            sure?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mb-0 mt-1">
                          <DialogClose asChild>
                            <Button variant={"outline"} className="w-2/4">
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button
                            className="bg-button_orange hover:bg-button_orange hover:opacity-75 w-2/4"
                            onClick={() => {
                              setCancelLoader(true);
                              setCancelOpen(false);
                              setTimeout(() => {
                                router.back();
                                setCancelLoader(false);
                              }, 1000);
                            }}
                            disabled={cancelLoader}
                          >
                            {cancelLoader ? (
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
                                  stroke="#fff"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-100"
                                  fill="#fff"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            ) : (
                              "Yes"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button
                      className="w-[144px] h-[38px]"
                      variant={"outline"}
                      onClick={() => {
                        setCancelLoader(true);
                        setTimeout(() => {
                          router.back();
                          setCancelLoader(false);
                        }, 1000);
                      }}
                      disabled={cancelLoader}
                    >
                      {cancelLoader ? (
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
                            stroke="#09090B"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-100"
                            fill="#09090B"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        "Cancel"
                      )}
                    </Button>
                  )}

                  <Button
                    className="w-[144px] h-[38px]"
                    onClick={handleCreateSchedule}
                    disabled={addLoader}
                  >
                    {addLoader ? (
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
                          stroke="#fff"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="#fff"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      "Create"
                    )}
                  </Button>
                </div>
              </div>
            )}
            {selectedValue === "turn-off-screen" && (
              // <div></div>
              <TurnOffScreen />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSchedule;
