"use client";
import PlaylistPopover from "@/components/playlist-popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { format, isBefore, isEqual, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon,
  Trash2,
  Check,
  ChevronsUpDown,
  TriangleAlert,
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
import { useRouter } from "next/navigation";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast, useToast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

interface ContentItems {
  id: string;
  playlistName: string;
}

type InitialSchedule = {
  scheduleName: string;
  playlist: string;
  userId: string;
  screen: string;
  zone: string;
  startDate: string | null | undefined;
  endDate: string | null | undefined;
  startTime: string | null | undefined;
  endTime: string | null | undefined;
  repeat: string;
  repeatValue: string;
  repeatDays: string;
  repeatUntilValue: string;
  repeatUntilDate: string | null | undefined;
};

const turnOffRepeatOptions = [
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
];

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
    label: "Zone 1",
  },
  {
    value: "zone2",
    label: "Zone 2",
  },
  {
    value: "zone3",
    label: "Zone 3",
  },
];

interface Props {
  params: {
    id: string;
  };
}

const ModifySchedule = (props: Props) => {
  const { id } = props.params;
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

  const [allScheduledValues, setAllScheduledValues] = useState<any>("");
  const [deleteFolderOpen, setDeleteFolderOpen] = useState(false);

  const [selectedScreenValues, setSelectedScreenValues] = useState<
    string | null
  >("");
  const [screenList, setScreenList] = useState<any[]>([]);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>("");
  const [screenOpen, setScreenOpen] = useState(false);
  const [zoneValue, setZoneValue] = useState<string | null>("");
  const [addLoader, setAddLoader] = useState(false);
  const [cancelLoader, setCancelLoader] = useState(false);
  const [saveLoader, setSaveLoader] = useState(false);

  const [screenSearchQuery, setScreenSearchQuery] = useState("");
  const [initialSchedule, setInitialSchedule] =
    useState<InitialSchedule | null>(null);
  const [compareSchedule, setCompareSchedule] =
    useState<InitialSchedule | null>(null);
  const [changeCheck, setChangeCheck] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [formFilled, setFormFilled] = useState(false);

  const [scheduleType, setScheduleType] = useState<string>("");
  const [zoneObjects, setZoneObjects] = useState<any[]>([]);
  const [filteredZones, setFilteredZones] = useState<any[]>([]);

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

  const getScheduledData = async () => {
    const { data, error } = await supabase
      .from("scheduledContents")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.log(error);
    } else if (data) {
      setAllScheduledValues(data.type);
      setScheduleName(data.scheduleName);
      setSelectedPlaylistId(data.playlist);
      setStartDate(data.startDate);
      setEndDate(data.endDate);
      // const formattedStartTime = data.startTime.split(" ")[0];
      setStartTime(data.startTime);
      // const formattedEndTime = data.endTime.split(" ")[0];
      setEndTime(data.endTime);
      setSelectedScreenValues(data.screen);
      setZoneValue(data.zone);
      setRepeatDate(data.repeatUntilDate);
      setRepeatValue(data.repeat);
      setRepeatEveryValue(data.repeatValue);
      setRepeatEveryDay(data.repeatDays);
      setCustomRepeatValue(data.repeatUntilValue);
      setScheduleType(data.type);
      setSelectedScreenId(data.screen);

      setInitialSchedule({
        scheduleName: data.scheduleName,
        playlist: data.playlist,
        userId: data.userId,
        screen: data.screen,
        zone: data.zone,
        startDate: data.startDate,
        endDate: data.endDate,
        startTime: data.startTime,
        endTime: data.endTime,
        repeat: data.repeat,
        repeatValue: data.repeatValue,
        repeatDays: data.repeatDays,
        repeatUntilValue: data.repeatUntilValue,
        repeatUntilDate: data.repeatUntilDate,
      });
    }
  };

  const handleUpdateSchedule = async () => {
    setAddLoader(true);
    const formattedStartDate = startDate
      ? format(startDate, "yyyy-MM-dd")
      : null;
    const formattedEndDate = endDate ? format(endDate, "yyyy-MM-dd") : null;
    const formattedCustomDate = repeatDate
      ? format(repeatDate, "yyyy-MM-dd")
      : null;

    // Compare the actual Date objects
    if (
      startDate &&
      endDate &&
      (isBefore(endDate, startDate) || isEqual(endDate, startDate))
    ) {
      toast({
        variant: "destructive",
        title: "Failed to update!",
        description: "End date should not be a past date!",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      setAddLoader(false);
      return false; // Return false if the end date is not valid
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

    const user = await getUserData();
    const userId = user?.id || null;

    // Fetch the existing schedule data
    const { data: existingSchedule, error: fetchError } = await supabase
      .from("scheduledContents")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching schedule:", fetchError);
      setAddLoader(false);
      return;
    }

    let ZoneScheduled = "";
    if (scheduleType?.toLowerCase() === "turnon") {
      ZoneScheduled = zoneValue || existingSchedule.zone || null;
    }

    const updatedSchedule = {
      scheduleName: scheduleName || existingSchedule.scheduleName,
      playlist: selectedPlaylistId || existingSchedule.playlist,
      userId: userId || existingSchedule.userId,
      screen: selectedScreenValues || existingSchedule.screen || null,
      zone: ZoneScheduled, //zoneValue || existingSchedule.zone || null,
      startDate: formattedStartDate || existingSchedule.startDate,
      endDate: formattedEndDate || existingSchedule.endDate,
      startTime: startTime || existingSchedule.startTime,
      endTime: endTime || existingSchedule.endTime,
      repeat: repeatValue || null,
      repeatValue: repeatEveryValue || existingSchedule.repeatValue || null,
      repeatDays: repeatEveryDay || existingSchedule.repeatDays || null,
      repeatUntilValue:
        customRepeatValue || existingSchedule.repeatUntilValue || null,
      repeatUntilDate:
        formattedCustomDate || existingSchedule.repeatUntilDate || null,
    };

    setCompareSchedule({
      scheduleName: scheduleName,
      playlist: selectedPlaylistId ?? "",
      userId: userId ?? "",
      screen: selectedScreenValues ?? "",
      zone: zoneValue ?? "",
      startDate: formattedStartDate ?? "",
      endDate: formattedEndDate ?? "",
      startTime:
        startTime instanceof Date ? startTime.toString() : startTime ?? "",
      endTime: endTime instanceof Date ? endTime.toString() : endTime ?? "",
      repeat: repeatValue ?? "",
      repeatValue: repeatEveryValue ?? "",
      repeatDays: repeatEveryDay ?? "",
      repeatUntilValue: customRepeatValue ?? "",
      repeatUntilDate: formattedCustomDate ?? "",
    });

    const { error } = await supabase
      .from("scheduledContents")
      .update(updatedSchedule)
      .eq("id", id);

    if (error) {
      console.error("Error updating schedule:", error);
      setAddLoader(false);
    } else {
      setChangeCheck(false);
      //notify("Schedule updated successfully", true);
      setAddLoader(false);
      console.log(updatedSchedule, " updatedSchedule");
      console.log(compareSchedule, " compareSchedule");
      toast({
        title: "Updated Successfully!.",
        description: "Schedule has updated successfully!",
        action: <ToastAction altText="Ok">Ok</ToastAction>,
      });
    }
  };

  const fetchPlaylistData = async () => {
    const user = await getUserData();
    const userId = user?.id || null;
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
    const user = await getUserData();
    const userId = user?.id || null;
    const { data, error } = await supabase
      .from("screenDetails")
      .select("*")
      .eq("is_deleted", 0)
      .eq("userId", userId);
    if (error) {
      console.error("Error fetching data s:", error);
    } else if (data) {
      setScreenList(data);
      console.log("Screen data:", data);
    }
  };

  const handleChange = (e: any) => {
    let value = Number(e.target.value);
    if (value > 31) {
      //notify("Please enter a value less than 31", false);
      toast({
        title: "Please enter a value less than 31",
        action: <ToastAction altText="Ok">Ok</ToastAction>,
      });
      value = 31;
    } else if (value < 1 || isNaN(value) || value === 0) {
      //notify("Please enter a value greater than 0", false);
      toast({
        title: "Please enter a value greater than 0",
        action: <ToastAction altText="Ok">Ok</ToastAction>,
      });
      value = 1;
    }
    setRepeatEveryValue(value as any);
    console.log(value);
  };

  const handleDeleteSchedule = async (id: any) => {
    setSaveLoader(true);
    const { error } = await supabase
      .from("scheduledContents")
      //.delete()
      .update({ is_deleted: 1 })
      .eq("id", id);
    if (error) {
      console.error("Error deleting schedule:", error);
      setSaveLoader(false);
    } else {
      setDeleteFolderOpen(false);
      setSaveLoader(false);
      //notify("Schedule deleted successfully", true);
      //setTimeout(() => router.push("/schedule"), 2000);
      toast({
        title: "Updated Successfully!.",
        description: "Schedule has deleted successfully!",
        action: (
          <ToastAction
            altText="Undo"
            onClick={() => handleDeleteScheduleUndo(id)}
          >
            Undo
          </ToastAction>
        ),
      });
      setTimeout(() => router.push("/schedule"), 4000);
    }
  };

  const handleDeleteScheduleUndo = async (id: any) => {
    const { error } = await supabase
      .from("scheduledContents")
      //.delete()
      .update({ is_deleted: 0 })
      .eq("id", id);
    if (error) {
      console.error("Error deleting schedule:", error);
    } else {
      toast({
        title: "Updated Successfully!.",
        description: "Schedule has recovered successfully!",
      });
    }
  };

  const handleGetScreenDetails = async (selectedValue: any) => {
    const { data, error } = await supabase
      .from("screenDetails")
      .select("*")
      .eq("id", selectedValue)
      .single();

    if (error) {
      console.error("Error fetching data:", error);
    } else if (data) {
      console.log(
        "Screen data:",
        data.zone1_details,
        data.zone2_details,
        data.zone3_details
      );

      // Filter the zones based on the availability of details
      const filteredZoneOptions = zoneOptions.filter((zone) => {
        if (zone.value === "zone1" && data.zone1_details) return true;
        if (zone.value === "zone2" && data.zone2_details) return true;
        if (zone.value === "zone3" && data.zone3_details) return true;
        return false;
      });

      // Set the filtered zones in state or wherever needed
      setFilteredZones(filteredZoneOptions);
    }
  };

  useEffect(() => {
    fetchPlaylistData();
    getScheduledData();
    fetchScreenData();
    //fetchZoneData();
  }, []); //selectedScreenId

  const isFormChange = () => {
    return !(
      initialSchedule?.scheduleName === scheduleName &&
      initialSchedule?.playlist === selectedPlaylistId &&
      initialSchedule?.screen === selectedScreenValues &&
      initialSchedule?.startDate === startDate &&
      initialSchedule?.endDate === endDate &&
      initialSchedule?.startTime === startTime &&
      initialSchedule?.endTime === endTime &&
      initialSchedule?.zone === zoneValue &&
      initialSchedule?.repeat === repeatValue &&
      initialSchedule?.repeatValue === repeatEveryValue &&
      initialSchedule?.repeatDays === repeatEveryDay &&
      initialSchedule?.repeatUntilValue === customRepeatValue &&
      initialSchedule?.repeatUntilDate === repeatDate
    );
  };

  useEffect(() => {
    console.log(isFormChange(), " isFormChange");
    const formHasChanged = isFormChange();
    setFormFilled(formHasChanged); // Update formFilled based on the form changes

    if (formHasChanged) {
      console.log("Changes made");
      setChangeCheck(true); // Set to true if any form field changes
    } else {
      console.log("No changes made");
      setChangeCheck(false); // Set to false if no changes are detected
    }

    const handleBeforeUnload = (e: any) => {
      if (formHasChanged) {
        e.preventDefault();
        e.returnValue = ""; // Required for showing confirmation dialog in some browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [
    scheduleName,
    selectedPlaylistId,
    selectedScreenValues,
    startDate,
    endDate,
    startTime,
    endTime,
    zoneValue,
    repeatValue,
    repeatEveryValue,
    repeatEveryDay,
    customRepeatValue,
    repeatDate,
  ]);

  return (
    <div className="w-full p-4">
      <Toaster />
      <div className="w-full p-3 border border-border_gray rounded">
        <div className="w-full flex justify-between items-center border-b border-primary_color pb-2">
          <h2 className="text-2xl font-semibold text-primary_color">
            Modify Schedule
          </h2>
        </div>
        {/* <div className="w-full flex items-center gap-2 py-3">
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
        </div> */}

        <div className="w-full flex flex-col items-start gap-2">
          <div className="w-full content mt-4">
            {selectedValue === "schedule-content" && (
              <div className="main-wrapper">
                <div>
                  <Label>Schedule Name</Label>
                  <Input
                    type="text"
                    className="w-full mt-1"
                    placeholder="Schedule Name"
                    defaultValue={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                  />
                </div>
                {/* --------------------------------- Playlist Section --------------------------------------  */}
                {allScheduledValues === "TurnOn" && (
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
                    </div>
                  </div>
                )}

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
                        defaultValue={startTime as any}
                        onChange={(e) => setStartTime(e.target.value as any)}
                      />
                    </div>
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
                        defaultValue={endTime as any}
                        onChange={(e) => setEndTime(e.target.value as any)}
                      />
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------- Repeat section ----------------------------------------- */}
                {allScheduledValues === "TurnOn" ? (
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
                          notFoundMessage={"No repeat found"}
                        />
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
                                defaultValue={repeatEveryValue as any}
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
                                  notFoundMessage={"No repeat found"}
                                  //   setErrors={setErrors}
                                />
                              </div>
                            </div>
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
                              notFoundMessage={"No repeat found"}
                            />
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
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
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
                          repeatOptions={turnOffRepeatOptions}
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
                          notFoundMessage={"No repeat found"}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------- Screen section ----------------------------------------- */}
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div
                    className={` ${
                      scheduleType?.toLowerCase() === "turnon"
                        ? "w-1/2"
                        : "w-full"
                    }`}
                  >
                    <Label className="text-sm font-medium text-primary_color block mb-1">
                      Select Screen
                    </Label>
                    <div className="w-full">
                      {/* <MultiSelectPopover
                        selectedScreenValues={selectedScreenValues}
                        setSelectedScreenValues={setSelectedScreenValues}
                        handleSelect={handleSelect}
                        width={"[90vw]"}
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
                                          handleGetScreenDetails(selectedValue);
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
                      {/* {errors.screen && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.screen}
                        </p>
                      )} */}
                    </div>
                  </div>
                  {/* Conditionally Render Select Zone */}
                  {scheduleType?.toLowerCase() === "turnon" && (
                    <div className="w-1/2">
                      <Label className="text-sm font-medium text-primary_color block mb-1">
                        Select Zone
                      </Label>
                      <div className="w-full">
                        <RepeatPopover
                          repeatValue={zoneValue}
                          setRepeatValue={setZoneValue}
                          selectedRepeatId={() => {}}
                          setSelectedRepeatId={() => {}}
                          repeatOptions={filteredZones} // Use the filtered zones here
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
                          notFoundMessage={"No zone found"}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-full flex items-center justify-center gap-2 mt-5 mx-auto">
                  <Dialog
                    open={deleteFolderOpen}
                    onOpenChange={setDeleteFolderOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="w-[144px] h-[38px] text-white bg-delete_color cursor-pointer transition-all duration-300 ease-in-out hover:bg-delete_color hover:text-white">
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[397px] sm:max-h-[342px]">
                      <DialogHeader className="flex flex-col space-y-0">
                        <DialogTitle className="text-2xl font-semibold">
                          Delete Schedule
                        </DialogTitle>
                        <DialogDescription className="m-0">
                          Are you sure want to delete the Schedule
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="mb-0 mt-1">
                        <DialogClose asChild>
                          <Button variant={"outline"} className="w-2/4">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          className="w-[144px] h-[38px] bg-button_orange hover:bg-button_orange hover:opacity-75"
                          onClick={() => handleDeleteSchedule(id)}
                          disabled={saveLoader}
                        >
                          {saveLoader ? (
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
                            "Yes"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
                    onClick={handleUpdateSchedule}
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
                      "Update"
                    )}
                  </Button>
                </div>
              </div>
            )}
            {/* {selectedValue === "turn-off-screen" && (
              // <div></div>
              <TurnOffScreen />
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifySchedule;
