"use client";

import React, { useEffect, useState, useRef, use } from "react";
import {
  Check,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  Monitor,
  RefreshCcw,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import AddTag from "@/components/add-tag";
import dynamic from "next/dynamic";
import "./style.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PreviewBox from "@/components/previewbox";
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
import "./style.css";
import { supabase } from "@/utils/supabase/supabaseClient";
// import { useScreenContext } from "@/context/ScreenContext";
import { AnimatePresence, motion } from "framer-motion";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
// import toast, { Toaster } from "react-hot-toast";
import { toast, useToast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { Init } from "v8";
import Playlist from "../../playlist/page";
import Image from "next/image";

interface PlaylistItem {
  id: string;
  playlistName: string;
}

interface OrientationItem {
  value: string;
  label: string;
}

interface LayoutItem {
  zoneCount: number;
  value: string;
  label: string;
}

interface updatedOrientationItem {
  title: string;
}

interface Props {
  params: {
    id: string;
  };
}

type InitialScreen = {
  screenName: string;
  orientation: string;
  layoutType: string;
  screenStatus: string;
  zone1Name: string | null | undefined;
  zone2Name: string | null | undefined;
  zone3Name: string | null | undefined;
  Playlist1Name: string | null | undefined;
  Playlist2Name: string | null | undefined;
  Playlist3Name: string | null | undefined;
};

const ScreenDetails = (props: Props) => {
  const { id } = props.params;

  const [isOpen, setIsOpen] = useState(true);

  const [open, setOpen] = useState(false); // Popover is initially closed
  const [value, setValue] = useState("");
  const [playlistError, setPlaylistError] = useState(false);

  const [orientOpen, setOrientOpen] = useState(false); // Popover is initially closed
  const [orientValue, setOrientValue] = useState("");
  const [orientError, setOrientError] = useState(false); // State for orientation error

  const [layoutOpen, setLayoutOpen] = useState(false); // Popover is initially closed
  const [layoutValue, setLayoutValue] = useState("");
  const [layoutError, setLayoutError] = useState(false); // State for layout error

  const [zoneTabs, setZoneTabs] = useState<string[]>([]);
  const [layouts, setLayouts] = useState([]);

  const [status, setStatus] = useState<string>("");

  const [showPreview, setShowPreview] = useState(false); // State to control preview box
  const [zoomed, setZoomed] = useState(false); // State to control zoom

  const [screenName, setScreenName] = useState("");
  const [screenLink, setScreenLink] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [zoneError, setZoneError] = useState(false);
  const [tagName, setTagName] = useState("");
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);

  const [initialScreenName, setInitialScreenName] = useState("");
  const [openDelete, setOpenDelete] = useState(false);
  const [playlistList, setPlaylistList] = useState<PlaylistItem[]>([]);

  const linkRef = useRef<HTMLInputElement>(null);
  const screenNameRef = useRef<HTMLInputElement>(null);
  const zoneNameRef = useRef<HTMLInputElement>(null);
  const tagNameRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [orientationList, setOrientationList] = useState<OrientationItem[]>([]);
  const [layoutList, setLayoutList] = useState<LayoutItem[]>([]);

  const fullUrl = `${window.location.origin}/player/${id}`;
  const [signedInUserId, setSignedInUserId] = useState<string | null>("");

  const [saveLoader, setSaveLoader] = useState(false);
  const [cancelLoader, setCancelLoader] = useState(false);
  const [addLoader, setAddLoader] = useState(false);
  const [initialScreenValues, setInitialScreenValues] =
    useState<InitialScreen | null>(null);
  const [compareScreenValues, setCompareScreenValues] =
    useState<InitialScreen | null>(null);
  const [changeCheck, setChangeCheck] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [formFilled, setFormFilled] = useState(false);
  const [backLoader, setBackLoader] = useState(false);

  const [shortLink, setshortLink] = useState<string | null>("");
  const shortlinkRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>("");

  const router = useRouter();

  const handleCopy = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) {
      const originalBackgroundColor = ref.current.style.backgroundColor;
      ref.current.style.backgroundColor = "white";
      ref.current.select();
      document.execCommand("copy");
      ref.current.style.backgroundColor = originalBackgroundColor;
      toast({
        title: "Copied Successfully!.",
        description: "Link copied to clipboard!",
      });
    }
  };

  //const notify = (message: string, success: boolean) =>
  // toast[success ? "success" : "error"](message, {
  //   style: {
  //     borderRadius: "10px",
  //     background: "#fff",
  //     color: "#000",
  //   },
  //   position: "top-right",
  //   duration: 2000,
  // });

  const Orientations = async () => {
    try {
      const { data, error } = await supabase.from("layoutType").select("*");
      if (error) {
        throw error;
      }
      const orientations = data?.map((item: any) => ({
        value: item.title,
        label: item.title,
      }));

      setOrientationList(orientations || []);
      // console.log("layout Data from Supabase: ", data?.map((item) => item.title) as any);
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
    }
  };

  const Layouts = async (orientationId: string) => {
    try {
      const { data, error } = await supabase
        .from("layouts")
        .select("*") // Assuming `zone_count` is a column in your `layouts` table
        .eq("type", orientationId);

      if (error) {
        throw error;
      }

      const layouts = data?.map((item: any) => {
        let zoneCount = 1; // Default to 1 zone
        if (typeof item.zone3 === "string" && item.zone3.trim() !== "") {
          zoneCount = 3;
        } else if (typeof item.zone2 === "string" && item.zone2.trim() !== "") {
          zoneCount = 2;
        }

        return {
          value: item.id,
          label: item.name,
          zoneCount: zoneCount,
        };
      });

      // Sort the layouts based on the last two digits of the label
      const sortedLayouts = layouts?.sort((a, b) => {
        const lastTwoDigitsA = parseInt(a.label.slice(-2)) || 0; // Get last 2 digits or default to 0
        const lastTwoDigitsB = parseInt(b.label.slice(-2)) || 0; // Get last 2 digits or default to 0
        return lastTwoDigitsA - lastTwoDigitsB; // Ascending order
      });

      setLayoutList(sortedLayouts || []);
    } catch (error: any) {
      console.error("Error fetching layouts:", error.message);
    }
  };

  const handleSave = async () => {
    for (let i = 0; i < zoneTabs.length; i++) {
      if (zoneNames[i] === "") {
        toast({
          variant: "destructive",
          title: "Failed to update!.",
          description: "Zone names not updated correctly!",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
        return false; // Return false if a zone name is empty
      }

      if (
        selectedPlaylists[i] === undefined ||
        selectedPlaylists[i] === "" ||
        selectedPlaylists[i].length === 0
      ) {
        toast({
          variant: "destructive",
          title: "Failed to update!.",
          description: "Playlist not updated correctly for zones!",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
        return false; // Return false if a playlist is empty
      }
    }

    const isOrientError = !orientValue;
    const isLayoutError = !layoutValue;
    const isPlaylistError = !value;
    const isZoneError = !zoneName;
    if (selectedPlaylists.length === 0) {
      const isPlaylistError = !value;
      setPlaylistError(isPlaylistError);
      setAddLoader(false);
    }
    if (zoneNames.length === 0) {
      const isZoneError = !zoneName;
      setZoneError(isZoneError);
      setAddLoader(false);
    }

    setOrientError(isOrientError);
    setLayoutError(isLayoutError);

    if (!isOrientError && !isLayoutError) {
      setAddLoader(true);
      const screenName = screenNameRef.current?.value;
      const zoneName = zoneNameRef.current?.value;
      const screenLink = linkRef.current?.value;
      const tagName = tagNameRef.current?.value;

      setScreenName(screenName as string);
      setZoneName(zoneName as string);
      setScreenLink(screenLink as string);
      setTagName(tagName as string);

      // Playlist foreign key set code
      const { data: playlist, error: playlistError } = await supabase
        .from("playlistDetails")
        .select("*")
        .eq("playlistName", value);

      if (playlistError) {
        console.error("Error fetching data:", playlistError);
        setAddLoader(false);
      }
      setPlaylist(playlist?.map((item) => item.playlistName) as any);

      // Orientation foreign key set code
      const { data: orientation, error: orientationError } = await supabase
        .from("layoutType")
        .select("id, title")
        .eq("title", orientValue);

      if (orientationError) {
        console.error("Error fetching data:", orientationError);
        setAddLoader(false);
      }
      if (!orientation || orientation.length === 0) {
        console.error("No layout found with the specified title:", orientValue);
        setAddLoader(false);
        return;
      }
      const orientationId = orientation[0].id;

      // Layout foreign key set code

      const { data: layout, error: layoutError } = await supabase
        .from("layouts") //layoutDetails
        .select("id, name")
        .eq("id", layoutValue);

      if (layoutError) {
        console.error("Error fetching data:", layoutError);
        setAddLoader(false);
      }
      if (!layout || layout.length === 0) {
        console.error("No layout found with the specified title:", layoutValue);
        return;
      }
      const layoutId = layout[0].id;

      const { data, error } = await supabase
        .from("screenDetails")
        .update({
          screenname: screenName,
          screenlink: screenLink,
          //zonename: "", //zoneName,
          //playlist: "", //value,
          status: status,
          zone1_details: [
            { name: zoneNames[0], playlist: selectedPlaylists[0] },
          ],
          zone2_details: [
            { name: zoneNames[1], playlist: selectedPlaylists[1] },
          ],
          zone3_details: [
            { name: zoneNames[2], playlist: selectedPlaylists[2] },
          ],
          orientation: orientationId,
          layout: layoutId,
          tagname: tagName,
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating data:", error);
        setAddLoader(false);
      } else {
        setCompareScreenValues({
          screenName: screenName as string,
          orientation: orientationId,
          layoutType: layoutId,
          screenStatus: status as "",
          zone1Name: zoneNames[0],
          zone2Name: zoneNames[1],
          zone3Name: zoneNames[2],
          Playlist1Name: selectedPlaylists[0],
          Playlist2Name: selectedPlaylists[1],
          Playlist3Name: selectedPlaylists[2],
        });
        // console.log(
        //   "compareScreenValues ",
        //   screenName,
        //   orientationId,
        //   layoutValue,
        //   status,
        //   zoneNames[0],
        //   zoneNames[1],
        //   zoneNames[2],
        //   selectedPlaylists[0],
        //   selectedPlaylists[1],
        //   selectedPlaylists[2]
        // );
        //notify("Screen updated successfully", true);
        setAddLoader(false);
        toast({
          title: "Updated Successfully!.",
          description: "Screen has updated successfully!",
          action: <ToastAction altText="Ok">Ok</ToastAction>,
        });
        // router.push("/screen");
        // Optionally, you can handle success behavior here
      }
    }
  };

  const handleRefresh = () => {
    setValue("");
    setOrientValue("");
    setLayoutValue("");
    setOrientError(false);
    setLayoutError(false);
    setPlaylistError(false);
    setZoneError(false);

    if (screenNameRef.current) screenNameRef.current.value = "";
    if (zoneNameRef.current) zoneNameRef.current.value = "";
    if (linkRef.current) linkRef.current.value = "";
    if (tagNameRef.current) tagNameRef.current.value = "";
  };

  const getData = async () => {
    try {
      // Fetch screen details
      const { data: screenData, error: screenError } = await supabase
        .from("screenDetails")
        .select("*")
        .eq("id", id)
        // .eq("is_deleted", 0)
        // .eq("userId", signedInUserId)
        .single();

      if (screenError) throw screenError;

      setInitialScreenName(screenData.screenname);
      setshortLink(`${screenData.short_link}` || `${window.location.origin}`);
      setStatus(screenData.status as any);

      if (screenData) {
        if (screenNameRef.current)
          screenNameRef.current.value = screenData.screenname;
        if (linkRef.current) linkRef.current.value = screenData.screenlink;
        if (shortlinkRef.current)
          shortlinkRef.current.value = `${screenData.short_link}`;
        if (zoneNameRef.current)
          zoneNameRef.current.value = screenData.zonename;

        // Fetch orientation type
        const { data: orientData, error: orientError } = await supabase
          .from("layoutType")
          .select("*")
          .eq("id", screenData.orientation)
          .eq("is_deleted", 0)
          .single();

        if (orientError) throw orientError;

        // Fetch layouts based on orientation type
        const { data: layoutsData, error: layoutsError } = await supabase
          .from("layouts")
          .select("*")
          .eq("is_deleted", 0)
          .eq("type", orientData.title);

        if (layoutsError) throw layoutsError;

        // Set initial state values
        setOrientValue(orientData.title);
        setLayoutValue(screenData.layout);
        handleOrientation(orientData.title, screenData.layout);

        const layouts = layoutsData?.map((item: any) => {
          let zoneCount = 1; // Default to 1 zone
          if (typeof item.zone3 === "string" && item.zone3.trim() !== "") {
            zoneCount = 3;
          } else if (
            typeof item.zone2 === "string" &&
            item.zone2.trim() !== ""
          ) {
            zoneCount = 2;
          }

          return {
            value: item.id,
            label: item.name,
            zoneCount: zoneCount,
          };
        });

        if (screenData.layout) {
          const selectedLayout = layouts.find(
            (layout) => layout.value === screenData.layout
          );

          if (selectedLayout && selectedLayout.zoneCount) {
            // Create an array representing the zones
            const zones = Array.from(
              { length: selectedLayout.zoneCount },
              (_, index) => `Zone ${index + 1}`
            );
            setZoneTabs(zones); // Set the zone tabs
            zoneNames[0] = screenData.zone1_details[0].name
              ? screenData.zone1_details[0].name
              : "";
            zoneNames[1] = screenData.zone2_details[0].name
              ? screenData.zone2_details[0].name
              : "";
            zoneNames[2] = screenData.zone3_details[0].name
              ? screenData.zone3_details[0].name
              : "";

            selectedPlaylists[0] = screenData.zone1_details[0].playlist
              ? screenData.zone1_details[0].playlist
              : [];
            selectedPlaylists[1] = screenData.zone2_details[0].playlist
              ? screenData.zone2_details[0].playlist
              : [];
            selectedPlaylists[2] = screenData.zone3_details[0].playlist
              ? screenData.zone3_details[0].playlist
              : [];
          }
        } else {
          // Clear the zones if no layout is selected
          setZoneTabs([]);
        }
      }
      setInitialScreenValues({
        screenName: screenData.screenname,
        orientation: screenData.orientation,
        layoutType: screenData.layout,
        screenStatus: screenData.status,
        zone1Name: screenData.zone1_details[0].name,
        zone2Name: screenData.zone2_details[0].name,
        zone3Name: screenData.zone3_details[0].name,
        Playlist1Name: screenData.zone1_details[0].playlist,
        Playlist2Name: screenData.zone2_details[0].playlist,
        Playlist3Name: screenData.zone3_details[0].playlist,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDelete = async () => {
    setSaveLoader(true);
    const { data, error } = await supabase
      .from("screenDetails")
      .update({ is_deleted: 1 })
      .eq("id", id);
    if (error) {
      setSaveLoader(false);
      console.error("Error deleting data:", error);
    } else {
      setOpenDelete(false); // Close the dialog box
      toast({
        title: "Updated Successfully!.",
        description: "Screen has deleted successfully!",
        action: (
          <ToastAction altText="Undo" onClick={() => handleDeleteUndo()}>
            Undo
          </ToastAction>
        ),
      });
      setTimeout(() => {
        router.push("/screen"), setSaveLoader(false);
      }, 2000);
    }
  };

  const handleDeleteUndo = async () => {
    const { data, error } = await supabase
      .from("screenDetails")
      .update({ is_deleted: 0 })
      .eq("id", id);
    if (error) {
      console.error("Error deleting data:", error);
    } else {
      toast({
        title: "Updated Successfully!.",
        description: "Folder has recovered successfully!",
      });
    }
  };

  const fetchPlaylist = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("signedInUserId is invalid.");
      return;
    }
    const { data, error } = await supabase
      .from("playlistDetails")
      .select("*")
      .eq("is_deleted", 0)
      .order("playlistName", { ascending: true })
      .eq("userId", userId);
    // .single();
    if (error) {
      console.error("Error fetching data p:", error);
    } else if (data) {
      setPlaylistList(data);
      // console.log("Playlist data:", data);
      // console.log("playlistList data: ",playlistList);
    }
  };

  // console.log("playlistList data 1 : ",playlistList);

  useEffect(() => {
    getData();
  }, [id]);

  useEffect(() => {
    if (value) {
      handleCopy(linkRef);
    }
  }, [value]);

  useEffect(() => {
    fetchPlaylist();
  }, []);

  useEffect(() => {
    Orientations();
    //Layouts();
  }, []);
  useEffect(() => {
    setSignedInUserId(localStorage.getItem("userId") || null);
  }, []);

  useEffect(() => {
    if (orientValue) {
      // Fetch layouts based on the selected orientation
      const selectedOrientation = orientationList.find(
        (framework) => framework.value === orientValue
      );

      if (selectedOrientation) {
        const selectedOrientationId = selectedOrientation.value; // Assuming value is the ID
        Layouts(selectedOrientationId);
      }
    } else {
      // Clear the layouts if no orientation is selected
      setLayoutList([]);
    }
  }, [orientValue]);

  useEffect(() => {
    if (layoutValue) {
      const selectedLayout = layoutList.find(
        (layout) => layout.value === layoutValue
      );

      if (selectedLayout && selectedLayout.zoneCount) {
        // Create an array representing the zones
        const zones = Array.from(
          { length: selectedLayout.zoneCount },
          (_, index) => `Zone ${index + 1}`
        );
        setZoneTabs(zones); // Set the zone tabs
      }
    } else {
      // Clear the zones if no layout is selected
      setZoneTabs([]);
    }
  }, [layoutValue]);

  const [openStates, setOpenStates] = useState(
    new Array(zoneTabs.length).fill(true)
  );

  const handleToggle = (index: number) => {
    setOpenStates((prev) => {
      const newStates = [...prev];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  const [zoneNames, setZoneNames] = useState(
    new Array(zoneTabs.length).fill("")
  );

  const handleZoneNameChange = (index: number, value: string) => {
    const newZoneNames = [...zoneNames];
    newZoneNames[index] = value;
    setZoneNames(newZoneNames);
  };

  const [selectedPlaylists, setSelectedPlaylists] = useState(
    new Array(zoneTabs.length).fill("")
  );

  const [popoverOpenStates, setPopoverOpenStates] = useState(
    new Array(zoneTabs.length).fill(false)
  );

  const handlePopoverToggle = (index: number) => {
    setPopoverOpenStates((prev) => {
      const newStates = [...prev];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  const handlePlaylistSelect = (index: number, playlistId: any) => {
    // Update the selected playlists
    const newSelectedPlaylists = [...selectedPlaylists];
    newSelectedPlaylists[index] = playlistId;
    setSelectedPlaylists(newSelectedPlaylists);

    // Close the popover for the selected zone
    setPopoverOpenStates((prev) => {
      const newStates = [...prev];
      newStates[index] = false;
      return newStates;
    });
  };

  const handleStatusChange = async (checked: boolean) => {
    const newStatus = checked ? "Active" : "Inactive";
    setStatus(newStatus as any);

    // // Update status in the database
    // const { error } = await supabase
    //   .from("screenDetails")
    //   .update({ status: newStatus })
    //   .eq("id", data.id);

    // if (error) {
    //   console.error("Error updating status:", error);
    // }
  };

  const isFormChange = () => {
    return !(
      (
        initialScreenValues?.screenName === screenName &&
        // initialScreenValues?.layoutType === layoutValue &&
        initialScreenValues?.orientation === orientValue
      )
      // initialScreenValues?.zone1Name === zoneNames[0] &&
      // initialScreenValues?.zone2Name === zoneNames[1] &&
      // initialScreenValues?.zone3Name === zoneNames[2] &&
      // initialScreenValues?.Playlist1Name === selectedPlaylists[0] &&
      // initialScreenValues?.Playlist2Name === selectedPlaylists[1] &&
      // initialScreenValues?.Playlist3Name === selectedPlaylists[2] &&
      // initialScreenValues?.screenStatus === status
    );
  };

  const handleOrientation = async (OrientValue: any, LayoutValue: any) => {
    // Check if both OrientValue and LayoutValue are valid (non-null, non-undefined, and not empty)
    if (!OrientValue || !LayoutValue) {
      setPreviewImage(null);
      return;
    }
  
    try {
      // Fetch data only when both values are valid
      const { data, error } = await supabase
        .from("layouts")
        .select("*")
        .eq("id", LayoutValue)
        .eq("type", OrientValue)
        .single();
  
      if (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Select Valid Orientation and Layout",
          description: "Please select a valid orientation and layout.",
        })
        // Hide the preview image in case of fetch error
        setPreviewImage(null);
        return;
      }
      setPreviewImage(data?.image || null); // Set to null if no image exists
    } catch (err) {
      console.error("Error during fetch operation:", err);
      
      // Hide the preview image in case of any other error
      setPreviewImage(null);
    }
  };  

  // useEffect(() => {
  //   console.log()
  // })

  // useEffect(() => {
  //   console.log(isFormChange(), " isFormChange");
  //   console.log(initialScreenValues, " initialScreenValues");
  //   console.log({
  //     screenName,
  //     orientValue,
  //     layoutValue,
  //     zoneNames,
  //     selectedPlaylists
  //   })

  //   const formHasChanged = isFormChange();
  //   setFormFilled(formHasChanged); // Update formFilled based on the form changes

  //   if (formHasChanged) {
  //     console.log("Changes made");
  //     setChangeCheck(true); // Set to true if any form field changes
  //   } else {
  //     console.log("No changes made");
  //     setChangeCheck(false); // Set to false if no changes are detected
  //   }

  //   // const handleBeforeUnload = (e: any) => {
  //   //   if (formHasChanged) {
  //   //     e.preventDefault();
  //   //     e.returnValue = ""; // Required for showing confirmation dialog in some browsers
  //   //   }
  //   // };

  //   // window.addEventListener("beforeunload", handleBeforeUnload);

  //   // return () => {
  //   //   window.removeEventListener("beforeunload", handleBeforeUnload);
  //   // };
  // }, [
  //   screenName,
  //   // layoutValue,
  //   // orientValue,
  //   // zoneName,
  //   // selectedPlaylists,
  //   // status,
  // ]);

  return (
    // <AnimatePresence>

    <div
      // initial={{ opacity: 0 }}
      // animate={{ opacity: 1 }}
      // exit={{ opacity: 0 }}
      // transition={{ duration: 0.75, ease: "easeInOut" }}
      className="w-full p-4 pt-0 pb-0 pr-0 flex"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      <Toaster />
      <div className="pr-4 pb-4" style={{ width: "calc(100% - 329px)" }}>
        <div className="flex items-center gap-2 mt-7">
          <h4
            className="text-base font-medium text-primary_color cursor-pointer"
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
              "Screen"
            )}
          </h4>
          <ChevronRight />
          <h4 className="text-base font-medium text-primary_color">
            {initialScreenName}
          </h4>
        </div>

        {zoneTabs.map((zone, index) => (
          <div key={index} className="border border-border_gray mt-5 rounded">
            <Collapsible
              open={index === 0 || openStates[index]}
              onOpenChange={() => handleToggle(index)}
            >
              <div className="flex items-center justify-between space-x-4 bg-primary_color text-white p-2 rounded-t">
                <h4 className="text-base font-bold">{zone}</h4>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-9 p-0 hover:bg-transparent hover:text-white"
                  >
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="flex flex-wrap items-center gap-4">
                <div className="px-3 py-6 w-full">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Name</h4>
                    <Input
                      placeholder="Zone Name"
                      value={zoneNames[index]}
                      className={`zone-${index} ${
                        !zoneNames[index] ? "border-red-500" : ""
                      }`}
                      onChange={(e) =>
                        handleZoneNameChange(index, e.target.value)
                      }
                    />
                    {zoneError && (
                      <p className="text-red-500 text-xs mt-1">
                        Please enter zone name
                      </p>
                    )}
                  </div>
                  <div className="pt-5">
                    <h4 className="text-sm font-medium mb-2">Playlist</h4>
                    <Popover
                      open={popoverOpenStates[index]} // Control the open state of the popover
                      onOpenChange={() => handlePopoverToggle(index)} // Toggle popover open/closed
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={`w-full justify-between border ${
                            !selectedPlaylists[index]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`} // Apply border color conditionally
                        >
                          {selectedPlaylists[index]
                            ? playlistList.find(
                                (playlist) =>
                                  playlist.id === selectedPlaylists[index]
                              )?.playlistName
                            : "Select Playlist"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Command>
                          <CommandInput placeholder="Search playlist..." />
                          <CommandEmpty>No playlist found.</CommandEmpty>
                          <CommandGroup>
                            <CommandList>
                              {playlistList.map((playlist) => (
                                <CommandItem
                                  key={playlist.id}
                                  onSelect={() =>
                                    handlePlaylistSelect(index, playlist.id)
                                  } // Handle playlist selection
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedPlaylists[index] === playlist.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {playlist.playlistName}
                                </CommandItem>
                              ))}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {playlistError && (
                      <p className="text-red-500 text-xs mt-1">
                        Please select the playlist.
                      </p>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </div>
      <div className="w-[329px] border-l border-border_gray p-5">
        <div className="flex items-center gap-2">
          <h4 className="text-base font-bold text-primary_color">
            Screen Setting
          </h4>
          <div className="flex items-center gap-2">
            <div
              className={`py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out hover:bg-primary_color hover:text-white w-[44px] h-[40px] ${
                showPreview ? "bg-primary_color text-white" : ""
              }`}
              // onClick={handleTogglePreview}
              onClick={() => {
                window.open(`/player/${id}`, "_blank");
              }}
            >
              <Monitor size={20} />
            </div>
            <div
              className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out hover:bg-primary_color hover:text-white w-[44px] h-[40px]"
              onClick={handleRefresh}
            >
              <RefreshCcw size={20} />
            </div>
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
              <DialogTrigger asChild>
                <div className="py-2.5 px-3 rounded text-white bg-delete_color cursor-pointer transition-all duration-300 ease-in-out hover:bg-delete_color hover:text-white w-[44px] h-[40px]">
                  <Trash2 size={20} />
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[397px] sm:max-h-[342px]">
                <DialogHeader className="flex flex-col space-y-0">
                  <DialogTitle className="text-2xl font-semibold">
                    Delete Screen
                  </DialogTitle>
                  <DialogDescription className="m-0">
                    Are you sure want to delete the screen
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
                    onClick={handleDelete}
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
          </div>
        </div>
        <div className="mt-6">
          <h4 className="text-sm font-medium text-primary_color mb-1.5">
            Screen Name
          </h4>
          <Input
            placeholder="Screen Name"
            ref={screenNameRef}
            defaultValue={screenName}
            // onChange={(e) => setScreenName(e.target.value)}
          />
        </div>
        <div className="mt-6">
          <h4 className="text-sm font-medium text-primary_color mb-1.5">
            Screen Link
          </h4>
          <div className="relative">
            <div className="flex items-center mt-1.5 content_reduce">
              <Input
                id="link"
                // placeholder="https://s22digital.alpha#01.php"
                value={shortLink || ""}
                ref={shortlinkRef}
                readOnly
              />
              <Copy
                size={18}
                className="ml-2 cursor-pointer absolute right-[10px] bg-white"
                onClick={() => handleCopy(shortlinkRef)}
              />
            </div>
          </div>
        </div>
        {/* <div className="mt-6">
          <h4 className="text-sm font-medium text-primary_color mb-1.5">
            Add Tag{" "}
          </h4>
          <AddTag playlisttags={[]} setPlaylistTags={() => {}} />
        </div> */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-primary_color mb-1.5">
            Orientation
          </h4>
          <Popover open={orientOpen} onOpenChange={setOrientOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={orientOpen}
                className="w-full justify-between"
                onClick={() => setOrientError(false)} // Reset error on dropdown open
              >
                {orientValue
                  ? orientationList.find(
                      (framework) => framework.value === orientValue
                    )?.label
                  : "Select Orientation"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className={`p-0`} style={{ width: "118%" }}>
              <Command>
                <CommandInput placeholder="Search orientation..." />
                <CommandEmpty>No orientation found.</CommandEmpty>
                <CommandGroup>
                  <CommandList>
                    {orientationList.map((framework) => (
                      <CommandItem
                        key={framework.value}
                        value={framework.value}
                        onSelect={(currentValue) => {
                          setOrientValue(
                            currentValue === orientValue ? "" : currentValue
                          );
                          // console.log("current value", currentValue);
                          // console.log(orientValue, " orientValue");
                          handleOrientation(currentValue, orientValue);
                          setOrientOpen(false);
                          setOrientError(!currentValue); // Set error if value is empty
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            orientValue === framework.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {framework.label}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {orientError && (
            <p className="text-red-500 text-xs mt-1">
              Please select the orientation.
            </p>
          )}
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-medium text-primary_color mb-1.5">
            Layout
          </h4>
          <Popover open={layoutOpen} onOpenChange={setLayoutOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={layoutOpen}
                className="w-full justify-between"
                onClick={() => setLayoutError(false)}
              >
                {layoutValue
                  ? layoutList.find((layout) => layout.value === layoutValue)
                      ?.label
                  : "Select Layout"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className={`p-0`} style={{ width: "118%" }}>
              <Command>
                <CommandInput placeholder="Search layout..." />
                <CommandEmpty>No layout found.</CommandEmpty>
                <CommandGroup>
                  <CommandList>
                    {layoutList.map((layout) => (
                      <CommandItem
                        key={layout.value}
                        value={layout.value}
                        onSelect={() => {
                          setLayoutValue(layout.value); // Set layoutValue as the layout id (or value)
                          setLayoutOpen(false);
                          setLayoutError(false);
                          handleOrientation(orientValue, layout.value);
                          // console.log(layout.value, " setLayoutValue");
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            layoutValue === layout.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {layout.label}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {layoutError && (
            <p className="text-red-500 text-xs mt-1">
              Please select the layout.
            </p>
          )}
        </div>
        {previewImage ? (
          <>
          <h4 className="text-sm font-medium text-primary_color mb-0.5 mt-4">
          Preview Layout Image
        </h4>
        <div className="w-full mt-2 bg-[#808080e3] p-4 rounded">
            <Image
              src={previewImage}
              alt="preview"
              width={200}
              height={200}
              className="w-full h-[170px] object-contain"
            />
        </div>
        </>
        ) : null}
        <div className="mt-4">
          {/* <div className=""> */}
          <Label>Screen Status</Label>
          <Switch
            className="float-right"
            checked={status === "Active"}
            onCheckedChange={handleStatusChange}
          />
          {/* </div> */}
        </div>
        
        <div className="mt-6 flex items-center gap-6 w-full">
          {changeCheck === true ? (
            <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
              <DialogTrigger asChild>
                <Button className="w-[144px] h-[38px]" variant={"outline"}>
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
                    Data will be lost if you leave the page, are you sure?
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
            className="bg-button_orange hover:bg-button_orange hover:opacity-75 w-2/4"
            onClick={handleSave}
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
              "Save"
            )}
          </Button>
        </div>
      </div>
      {/* {showPreview && (
        <div className={`fixed inset-0  flex items-center justify-center z-50 `}>
            <PreviewBox handleTogglePreview={handleTogglePreview} handleZoom={handleZoom} refer = {previewRef} />
          </div>
      )} */}
    </div>
    // </AnimatePresence>
  );
};

export default dynamic(() => Promise.resolve(ScreenDetails), { ssr: false });
