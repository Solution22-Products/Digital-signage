"use client";
import {
  Bolt,
  Check,
  ChevronsUpDown,
  CircleAlert,
  CirclePlus,
  CircleX,
  Ellipsis,
  Filter,
  FolderPlus,
  FolderSymlink,
  GalleryThumbnails,
  List,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@radix-ui/react-dialog";
import { Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { supabase } from "@/utils/supabase/supabaseClient";
import { revalidatePath } from "next/cache";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn } from "@/lib/utils";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import FilterComponent from "./filter";
// import toast, { Toaster } from "react-hot-toast";
import { toast, useToast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import Select from "react-select";
import { any } from "zod";
import { list } from "postcss";

interface SearchBarProps {
  displayplus: React.ReactNode;
  addscreen?: boolean;
  dashboardscreen?: boolean;
  screenFolderData?: () => void;
  handleCancel: () => void;
  createScreenFolder?: boolean;
  contentFolderModelOpen?: boolean;
  setContentFolderModelOpen?: (open: boolean) => void;
  screenFolderId?: string | null;
  screenMove?: boolean;
  setScreenMove?: (move: boolean) => void;
  screenMoveOpen?: boolean;
  setScreenMoveOpen?: (open: boolean) => void;
  screenMoveValue?: string | null;
  setScreenMoveValue?: (value: string | null) => void;
  setMultipleScreenMoveFolder?: (folder: string | null) => void;
  multipleScreenMoveDetails?: any;
  screenData: () => void;
  deleteMultipleScreen?: boolean;
  setDeleteMultipleScreen?: (deleteScreen: boolean) => void;
  deleteMultipleScreenOpen?: boolean;
  setDeleteMultipleScreenOpen?: (open: boolean) => void;
  searchValue?: string | null;
  setSearchValue?: (value: string | null) => void;
  handleSortOptionClick: (option: string) => void;
  filterIcon?: boolean;
  screenFilterValue?: string | null;
  setScreenFilterValue?: any;
  handleFilterScreen?: () => void;
  screenStatusFilter?: string | null;
  setScreenStatusFilter?: (value: string | null) => void;
  getScreenFolderDetails: () => void;
  screenDataShow?: boolean;
  folderDataShow?: boolean;
  setSelectAll?: (value: boolean) => void;
  dashboardMoveButton?: boolean;
  screenFolderDetails: any;
  setScreenFolderDetails?: (value: any) => void;
  // handleDeleteScreen?: () => void;
  // handleDeleteScreenFolder?: () => void;
  multipleFolderScreenMoveDetails?: any;
  setFolderSelectAll?: (value: boolean) => void;
  setCheckedItems?: (value: any) => void;
  setFolderCheckedItems?: (value: any) => void;
  deleteMultipleScreenFolder?: boolean;
  setDeleteMultipleScreenFolder?: (value: boolean) => void;
  setMultipleScreenMoveDetails?: any;
  setMultipleFolderScreenMoveDetails?: any;
  listViewShow?: boolean;
  setListViewShow?: any;
}

interface contentItems {
  name: string;
  id: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  displayplus,
  addscreen,
  dashboardscreen,
  screenFolderData,
  handleCancel,
  createScreenFolder,
  contentFolderModelOpen,
  setContentFolderModelOpen,
  screenFolderId,
  screenMove,
  setScreenMove,
  screenMoveOpen,
  setScreenMoveOpen,
  screenMoveValue,
  setScreenMoveValue,
  setMultipleScreenMoveFolder,
  multipleScreenMoveDetails,
  screenData,
  deleteMultipleScreen,
  setDeleteMultipleScreen,
  deleteMultipleScreenOpen,
  setDeleteMultipleScreenOpen,
  searchValue,
  setSearchValue,
  handleSortOptionClick,
  filterIcon,
  screenFilterValue,
  setScreenFilterValue,
  handleFilterScreen,
  screenStatusFilter,
  setScreenStatusFilter,
  getScreenFolderDetails,
  screenDataShow,
  folderDataShow,
  setSelectAll,
  dashboardMoveButton,
  screenFolderDetails,
  setScreenFolderDetails,
  // handleDeleteScreen,
  // handleDeleteScreenFolder,
  multipleFolderScreenMoveDetails,
  setFolderSelectAll,
  setCheckedItems,
  setFolderCheckedItems,
  deleteMultipleScreenFolder,
  setDeleteMultipleScreenFolder,
  setMultipleScreenMoveDetails,
  setMultipleFolderScreenMoveDetails,
  listViewShow,
  setListViewShow,
}) => {
  const [screenLink, setScreenLink] = useState("");
  const [screenName, setScreenName] = useState("");
  const [errors, setErrors] = useState({ name: false });
  const [folderError, setFolderError] = useState(false);
  const [open, setOpen] = useState(false);
  const [screenSelectMoveOpen, setScreenSelectMoveOpen] = useState(false);
  const [screenSelectError, setScreenSelectError] = useState(false);
  const [screenSearchQuery, setScreenSearchQuery] = useState("");
  const [screenFolderNameInput, setScreenFolderNameInput] = useState("");
  const [signedInUserId, setSignedInUserId] = useState<string | null>("");
  const [addLoader, setAddLoader] = useState(false);
  const [moveScreenLoader, setMoveScreenLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);

  const linkRef = useRef(null);
  const router = useRouter();

  // Function to generate short URL code
  const generateShortCode = () => {
    return Math.random().toString(36).substr(2, 6); // Random 6-character string
  };

  const formatTime12Hour = (date: Date): string => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Adding 1 because getMonth() returns zero-based month index
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

  const handleAddScreen = async () => {
    const newErrors = { name: !screenName };
    setErrors(newErrors);

    if (newErrors.name) return; // Stop if there is an error

    try {
      setAddLoader(true);
      const currentTime = formatTime12Hour(new Date());
      const user = await getUserData();
      const userId = user?.id || "";

      if (!userId) {
        setAddLoader(false);
        console.error("User ID is missing");
        return;
      }

      // Fetch screen data for the user
      const { data: screencData, error: screencError } = await supabase
        .from("screenDetails")
        .select("*")
        .eq("userId", userId);

      if (screencError) {
        setAddLoader(false);
        console.error("Error fetching screen data:", screencError);
        return;
      }

      // Fetch user data including the plan
      const { data: userData, error: userError } = await supabase
        .from("usersList")
        .select("*")
        .eq("userId", userId)
        .single();

      if (userError || !userData?.plan) {
        setAddLoader(false);
        console.error("Error fetching user data:", userError);
        return;
      }

      // Fetch plan details
      const { data: planData, error: planError } = await supabase
        .from("plans")
        .select("*")
        .eq("id", userData.plan)
        .single();

      if (planError) {
        console.error("Error fetching plan data:", planError);
        return;
      }

      // Check if the user has reached the screen limit
      // if (screencData && screencData.length >= planData.screen_count) {
      //   setAddLoader(false);
      //   console.error("Screen limit reached for the current plan");
      //   toast({
      //     title: "Created UnSuccessfull!.",
      //     description: "Screen limit reached for the current plan!",
      //     action: <ToastAction altText="Ok">Ok</ToastAction>,
      //   });
      //   return;
      // }

      const shortUrlCode = generateShortCode();
      const shortLink =
        `${window.location.origin}` + "/play/" + `${shortUrlCode}`;

      //console.log(shortUrlCode);

      // Insert the new screen data
      const { data, error } = await supabase
        .from("screenDetails")
        .insert({
          screenname: screenName,
          time: currentTime,
          folder_id: screenFolderId,
          userId: signedInUserId,
          status: "Active",
          short_url_code: shortUrlCode || "",
          short_link: shortLink || "",
        })
        .select()
        .single();

      if (error) {
        console.error("Error inserting data:", error);
      } else {
        setOpen(false);
        setScreenName("");
        setScreenLink("");
        setTimeout(() => router.push(`/screen-details/${data?.id}`), 0);
        toast({
          title: "Created Successfully!.",
          description: "Screen has created successfully!",
          action: <ToastAction altText="Ok">Ok</ToastAction>,
        });
        screenData();
        getScreenFolderDetails();
      }
      /*
      const shortUrlCode = generateShortCode();
      try {
        const { data: updatedData, error: updatedError } = await supabase
          .from("screenDetails")
          .update([{ short_url_code: shortUrlCode || "" }])
          .eq("id", data?.id);

        if (updatedError) throw error;
      } catch (err) {
        console.error(err);
      }*/

      // Clear form and close modal

      setScreenName("");
      setScreenLink("");
      setOpen(false);
      setSelectAll?.(false);
      screenData();
      setAddLoader(false);
    } catch (err) {
      console.error("An unexpected error occurred:", err);
      setAddLoader(false);
    }
  };

  const handleScreenCreateFolder = async () => {
    const newErrors = { name: !screenFolderNameInput };
    setFolderError(newErrors.name);
    if (!newErrors.name) {
      setAddLoader(true);
      const currentTime = formatTime12Hour(new Date());
      const { data: existDatas, error: existErrors } = await supabase
        .from("folders")
        .select("*")
        .eq("folder_type", "screen")
        .eq("name", screenFolderNameInput)
        .eq("userId", signedInUserId)
        .single();
      if (existDatas) {
        toast({
          variant: "destructive",
          title: "Failed to create!",
          description: "Folder name already exist!",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
        setAddLoader(false);
        return false; // Return false if the end date is not valid
      }
      const { data, error } = await supabase
        .from("folders")
        .insert({
          name: screenFolderNameInput,
          time: currentTime,
          folder_type: "screen",
          userId: signedInUserId,
        })
        .select()
        .single();
      if (error) {
        console.error("Error creating folder:", error);
        setAddLoader(false);
      } else {
        setScreenFolderNameInput("");
        setAddLoader(false);
        setContentFolderModelOpen?.(false);
        screenFolderData?.();
        //notify("Screen Folder created successfully", true);
        toast({
          title: "Created Successfully!.",
          description: "Screen Folder has created successfully!",
          action: <ToastAction altText="Ok">Ok</ToastAction>,
        });
      }
    }
  };

  const filteredScreenFolders = screenFolderDetails.filter((framework: any) =>
    framework.name.toLowerCase().includes(screenSearchQuery.toLowerCase())
  );

  const updatedScreenData = async () => {
    const { data, error } = await supabase.from("screenDetails").select("*");
    if (error) {
      throw error;
    }
    return data;
  };

  const handleMoveScreenToDashboard = async () => {
    setMoveScreenLoader(true);
    const { data, error } = await supabase
      .from("screenDetails")
      .select("*")
      .in(
        "id",
        multipleScreenMoveDetails.map((item: any) => item)
      );
    if (error) {
      throw error;
    }
    const updatePromises = multipleScreenMoveDetails.map(async (item: any) => {
      const { data, error } = await supabase
        .from("screenDetails")
        .update({ folder_id: null })
        .eq("id", item);
      if (error) {
        throw error;
      }
      return data;
    });
    await Promise.all(updatePromises);

    if (screenData) {
      screenData();
    }
    //notify("Screen moved to dashboard successfully", true);
    toast({
      title: "Updated Successfully!.",
      description: "Screen moved to dashboard successfully!",
    });
    setMoveScreenLoader(false);
    setScreenMoveOpen?.(false);
    handleCancel?.();
    setScreenMoveValue?.("");
    setScreenSelectError(false);
    setScreenMove?.(false);
    setDeleteMultipleScreen?.(false);
    getScreenFolderDetails();
  };

  const handleScreenMove = async () => {
    setAddLoader(true);
    if (!screenMoveValue) {
      setScreenSelectError(true);
      setAddLoader(false);
      return;
    }
    const { data, error } = await supabase
      .from("screenDetails")
      .select("*")
      .in(
        "id",
        multipleScreenMoveDetails.map((item: any) => item)
      );
    if (error) {
      throw error;
    }
    const updatePromises = multipleScreenMoveDetails.map(async (item: any) => {
      const { data, error } = await supabase
        .from("screenDetails")
        .update({ folder_id: screenMoveValue })
        .eq("id", item);
      if (error) {
        throw error;
      }
      return data;
    });
    await Promise.all(updatePromises);

    if (screenData) {
      screenData();
      getScreenFolderDetails();
    }
    setScreenMoveOpen?.(false);
    setAddLoader(false);
    handleCancel?.();
    setScreenMoveValue?.("");
    setScreenSelectError(false);
    setScreenMove?.(false);
    setDeleteMultipleScreen?.(false);
    setSelectAll?.(false);
    //notify("Screen moved successfully", true);
    toast({
      title: "Updated Successfully!.",
      description: "Screen moved successfully!",
    });
    // router.push("/screen");
  };

  const handleScreenSearch = (e: any) => {
    setSearchValue?.(e.target.value);
    // console.log("search value", e.target.value);
  };

  const CommonUndo = async () => {
    try {
      // Fetch screen details based on selected screen IDs
      const { error: screenError } = await supabase
        .from("screenDetails")
        .update({ is_deleted: 0 })
        .in(
          "id",
          multipleScreenMoveDetails.map((item: any) => item)
        );

      if (screenError) {
        throw screenError;
      }

      // Fetch folder details based on selected folder IDs
      const { error: folderError } = await supabase
        .from("folders")
        .update({ is_deleted: 0 })
        .in(
          "id",
          multipleFolderScreenMoveDetails.map((item: any) => item)
        );

      if (folderError) {
        throw folderError;
      }

      // Update related screenDetails for each folder
      const { error: screenFolderUpdateError } = await supabase
        .from("screenDetails")
        .update({ is_deleted: 0 })
        .in(
          "folder_id",
          multipleFolderScreenMoveDetails.map((folderId: any) => folderId)
        );

      if (screenFolderUpdateError) {
        throw screenFolderUpdateError;
      }

      // After undo operations are successful, update the UI state
      setScreenMoveOpen?.(false);
      setScreenMove?.(false);
      setScreenMoveValue?.("");
      setDeleteMultipleScreenOpen?.(false);
      setDeleteMultipleScreen?.(false);
      setSelectAll?.(false);
      setCheckedItems?.([]);
      setDeleteMultipleScreenFolder?.(false);
      setFolderSelectAll?.(false);
      setFolderCheckedItems?.([]);

      // Refresh the screen and folder data
      screenData();
      screenFolderData?.();

      // Show success toast notification
      toast({
        title: "Updated Successfully!",
        description: "Screen and folder have recovered successfully!",
      });
    } catch (error) {
      console.error("Error during undo operation:", error);
      // Handle any error with a notification or further error processing
    }
  };

  const ScreenAndFolderData = async () => {
    try {
      setDeleteLoader(true);

      // Delete screens and update 'is_deleted' in a single query
      const { error: screenDeleteError } = await supabase
        .from("screenDetails")
        .update({ is_deleted: 1 })
        .in(
          "id",
          multipleScreenMoveDetails.map((item: any) => item)
        );

      if (screenDeleteError) {
        setDeleteLoader(false);
        throw screenDeleteError;
      }

      // Delete folders and update 'is_deleted' in a single query
      const { error: folderDeleteError } = await supabase
        .from("folders")
        .update({ is_deleted: 1 })
        .in(
          "id",
          multipleFolderScreenMoveDetails.map((item: any) => item)
        );

      if (folderDeleteError) {
        setDeleteLoader(false);
        throw folderDeleteError;
      }

      // Update related screenDetails for each folder
      const { error: screenFolderDeleteError } = await supabase
        .from("screenDetails")
        .update({ is_deleted: 1 })
        .in(
          "folder_id",
          multipleFolderScreenMoveDetails.map((folderId: any) => folderId)
        );

      if (screenFolderDeleteError) {
        setDeleteLoader(false);
        throw screenFolderDeleteError;
      }

      // After all delete operations, update the UI state
      setDeleteMultipleScreenFolder?.(false);
      setFolderSelectAll?.(false);
      setScreenMoveOpen?.(false);
      setScreenMove?.(false);
      setScreenMoveValue?.("");
      setDeleteMultipleScreenOpen?.(false);
      setDeleteMultipleScreen?.(false);
      setSelectAll?.(false);
      setCheckedItems?.([]);
      setFolderCheckedItems?.([]);
      setMultipleScreenMoveDetails([]);
      setMultipleFolderScreenMoveDetails([]);

      // Refresh the screen and folder data
      screenData();
      screenFolderData?.();

      // Set loader off after operations
      setDeleteLoader(false);

      // Show success toast notification with undo option
      toast({
        title: "Updated Successfully!",
        description: "Screen and folder have been deleted successfully!",
        action: (
          <ToastAction altText="Undo" onClick={() => CommonUndo()}>
            Undo
          </ToastAction>
        ),
      });
    } catch (error) {
      console.error("Error during delete operation:", error);
      setDeleteLoader(false);
    }
  };

  const handleDeleteScreen = async () => {
    setDeleteLoader(true);
    try {
      const { data, error } = await supabase
        .from("screenDetails")
        .select("*")
        .in(
          "id",
          multipleScreenMoveDetails.map((item: any) => item)
        );
      if (error) {
        throw error;
      }

      const deletePromises = multipleScreenMoveDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("screenDetails")
            .update({ is_deleted: 1 })
            .eq("id", item);
          if (error) {
            throw error;
          }
          return data;
        }
      );

      await Promise.all(deletePromises);

      if (screenData) {
        screenData();
      }

      setScreenMoveOpen?.(false);
      setDeleteLoader(false);
      setScreenMove?.(false);
      setScreenMoveValue?.("");
      // setScreenSelectError(false);
      setDeleteMultipleScreenOpen?.(false);
      setDeleteMultipleScreen?.(false);
      screenData();
      screenFolderData?.();
      setSelectAll?.(false);
      setMultipleScreenMoveDetails([]);
      getScreenFolderDetails();
      //notify("Screen deleted successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Screen has deleted successfully!",
        action: (
          <ToastAction altText="Undo" onClick={() => handleDeleteScreenUndo()}>
            Undo
          </ToastAction>
        ),
      });
      // router.push("/screen");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteScreenUndo = async () => {
    try {
      const { data, error } = await supabase
        .from("screenDetails")
        .select("*")
        .in(
          "id",
          multipleScreenMoveDetails.map((item: any) => item)
        );
      if (error) {
        throw error;
      }

      const deletePromises = multipleScreenMoveDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("screenDetails")
            .update({ is_deleted: 0 })
            .eq("id", item);
          if (error) {
            throw error;
          }
          return data;
        }
      );

      await Promise.all(deletePromises);

      if (screenData) {
        screenData();
      }

      setScreenMoveOpen?.(false);
      setScreenMove?.(false);
      setScreenMoveValue?.("");
      // setScreenSelectError(false);
      setDeleteMultipleScreenOpen?.(false);
      setDeleteMultipleScreen?.(false);
      screenData();
      getScreenFolderDetails();
      screenFolderData?.();
      setSelectAll?.(false);
      setCheckedItems?.([]);
      //notify("Screen deleted successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Screen has recovered successfully!",
      });
      // router.push("/screen");
    } catch (error) {
      console.error("Error:", error);
      setDeleteLoader(false);
    }
  };

  const handleDeleteScreenFolder = async () => {
    setDeleteLoader(true);
    try {
      // First, fetch the selected folders using their IDs
      const { data: folderData, error: folderError } = await supabase
        .from("folders")
        .select("*")
        .in(
          "id",
          multipleFolderScreenMoveDetails.map((item: any) => item)
        );

      if (folderError) {
        throw folderError;
      }

      // If folders are found, proceed to delete related data in 'screenDetails' for each folder
      const deleteScreenDetailsPromises = multipleFolderScreenMoveDetails.map(
        async (folderId: any) => {
          const { data, error } = await supabase
            .from("screenDetails")
            .update({ is_deleted: 1 })
            .eq("folder_id", folderId);

          if (error) {
            throw error;
          }

          return data;
        }
      );

      // Execute all delete operations for related screen details
      await Promise.all(deleteScreenDetailsPromises);

      // const deleteScheduledScreen = multipleFolderScreenMoveDetails.map(
      //   async (folderId: any) => {
      //     const { data, error } = await supabase
      //       .from("scheduledContents")
      //       .delete()
      //       .eq("screen", folderId);

      //     if (error) {
      //       throw error;
      //     }

      //     return data;
      //   }
      // );

      // await Promise.all(deleteScheduledScreen);

      // After deleting related screen details, delete the folders themselves
      const { error: folderDeleteError } = await supabase
        .from("folders")
        .update({ is_deleted: 1 })
        .in(
          "id",
          multipleFolderScreenMoveDetails.map((item: any) => item)
        );

      if (folderDeleteError) {
        throw folderDeleteError;
      }

      setDeleteMultipleScreenFolder?.(false);
      setDeleteMultipleScreenOpen?.(false);
      // setDeleteMultipleScreenFolderOpen?.(false);
      setDeleteLoader(false);
      setFolderSelectAll?.(false);
      screenFolderData?.();
      setMultipleFolderScreenMoveDetails([]);
      //notify("Folders deleted successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Folders has deleted successfully!",
        action: (
          <ToastAction
            altText="Undo"
            onClick={() => handleDeleteScreenFolderUndo()}
          >
            Undo
          </ToastAction>
        ),
      });
    } catch (error) {
      console.error("Error deleting folders and related content:", error);
      //notify("Failed to delete folders", false);
      toast({
        title: "Updated UnSuccessfully!.",
        description: "Failed to delete folders!",
      });
      setDeleteLoader(false);
    }
  };

  const handleDeleteScreenFolderUndo = async () => {
    try {
      // First, fetch the selected folders using their IDs
      const { data: folderData, error: folderError } = await supabase
        .from("folders")
        .select("*")
        .in(
          "id",
          multipleFolderScreenMoveDetails.map((item: any) => item)
        );

      if (folderError) {
        throw folderError;
      }

      // If folders are found, proceed to delete related data in 'screenDetails' for each folder
      const deleteScreenDetailsPromises = multipleFolderScreenMoveDetails.map(
        async (folderId: any) => {
          const { data, error } = await supabase
            .from("screenDetails")
            .update({ is_deleted: 0 })
            .eq("folder_id", folderId);

          if (error) {
            throw error;
          }

          return data;
        }
      );

      // Execute all delete operations for related screen details
      await Promise.all(deleteScreenDetailsPromises);

      // After deleting related screen details, delete the folders themselves
      const { error: folderDeleteError } = await supabase
        .from("folders")
        .update({ is_deleted: 0 })
        .in(
          "id",
          multipleFolderScreenMoveDetails.map((item: any) => item)
        );

      if (folderDeleteError) {
        throw folderDeleteError;
      }

      setDeleteMultipleScreenFolder?.(false);
      setDeleteMultipleScreenOpen?.(false);
      // setDeleteMultipleScreenFolderOpen?.(false);
      setFolderSelectAll?.(false);
      screenFolderData?.();
      setFolderCheckedItems?.([]);
      setMultipleScreenMoveDetails([]);
      setMultipleFolderScreenMoveDetails([]);
      //notify("Folders deleted successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Folders has recovered successfully!",
      });
    } catch (error) {
      console.error("Error deleting folders and related content:", error);
      //notify("Failed to delete folders", false);
      toast({
        title: "Updated UnSuccessfully!.",
        description: "Failed to delete folders!",
      });
      setDeleteLoader(false);
    }
  };

  const NewDeleteFn = async () => {
    if (
      multipleScreenMoveDetails.length > 0 &&
      multipleFolderScreenMoveDetails.length > 0
    ) {
      ScreenAndFolderData();
    } else if (multipleScreenMoveDetails.length > 0) {
      handleDeleteScreen();
    } else if (multipleFolderScreenMoveDetails.length > 0) {
      handleDeleteScreenFolder();
    }
  };

  useEffect(() => {
    handleScreenMove();
  }, []);

  useEffect(() => {
    const userName = async () => {
      const user = localStorage.getItem("userId");
      setSignedInUserId(user || null);
      return user;
    };
    userName();
  }, [signedInUserId]);

  return (
    <>
      <div className="w-full flex justify-between gap-2 p-4">
        <Toaster />
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Search"
            className="pl-10"
            defaultValue={searchValue?.toString() ?? ""}
            onChange={handleScreenSearch}
          />
          <Search
            className="absolute left-3 top-[42%] -translate-y-1/2 text-secondary_color"
            size={16}
          />
        </div>
        <ul className="flex items-center gap-2">
          {(addscreen || dashboardscreen) && (
            <>
              {/* <Toaster /> */}
              <TooltipProvider>
                <Tooltip>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <TooltipTrigger>
                        <li className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out w-[44px] h-[40px] mb-3 hover:bg-button_orange hover:text-white">
                          {displayplus}
                        </li>
                      </TooltipTrigger>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[397px] sm:max-h-[342px]">
                      <DialogHeader className="flex flex-col space-y-0">
                        <DialogTitle className="text-2xl font-semibold">
                          Add New Screen
                        </DialogTitle>
                        <DialogDescription className="m-0">
                          Let's add screen details below!
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-3 py-2">
                        <div>
                          <Label htmlFor="name" className="text-right">
                            Screen Name
                          </Label>
                          <Input
                            id="name"
                            className={`col-span-3 mt-1.5 ${
                              errors.name ? "border-red-500" : ""
                            }`}
                            placeholder="Screen name here"
                            value={screenName}
                            onChange={(e) => setScreenName(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter className="mb-2">
                        <DialogClose asChild>
                          <Button variant={"outline"} className="w-2/4">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          className={`bg-button_orange hover:bg-button_orange hover:opacity-75 w-2/4`}
                          onClick={handleAddScreen}
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
                            "Add"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <TooltipContent side="bottom" className="-mt-3">
                    <p>Add screen</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          {createScreenFolder ? (
            <>
              {/* <Toaster /> */}
              <TooltipProvider>
                <Tooltip>
                  <Dialog
                    open={contentFolderModelOpen}
                    onOpenChange={setContentFolderModelOpen}
                  >
                    <DialogTrigger asChild>
                      <TooltipTrigger>
                        <li className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out w-[44px] h-[40px] mb-3 hover:bg-button_orange hover:text-white">
                          <FolderPlus size={20} />
                        </li>
                      </TooltipTrigger>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[397px] sm:max-h-[342px]">
                      <DialogHeader className="flex flex-col space-y-0">
                        <DialogTitle className="text-2xl font-semibold">
                          Create New Folder
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-3 pb-2">
                        <div>
                          <Label htmlFor="name" className="text-right">
                            Folder Name
                          </Label>
                          <Input
                            id="folderName"
                            className={`col-span-3 mt-1.5 ${
                              folderError
                                ? "border-red-500"
                                : "border-border_gray"
                            }`}
                            placeholder="Folder name here"
                            value={screenFolderNameInput}
                            onChange={(e) => {
                              setScreenFolderNameInput(e.target.value);
                              if (folderError) setFolderError(false);
                            }}
                          />
                        </div>
                      </div>
                      <DialogFooter className="mb-2">
                        <DialogClose asChild>
                          <Button variant={"outline"} className="w-2/4">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          className="bg-button_orange hover:bg-button_orange hover:opacity-75 w-2/4"
                          onClick={handleScreenCreateFolder}
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
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <TooltipContent side="bottom" className="-mt-3 mr-1">
                    <p>Create Folder</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          ) : null}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div
                  className={`py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out w-[44px] h-[40px] mb-3 hover:bg-button_orange hover:text-white`}
                  onClick={() => setListViewShow(!listViewShow)}
                >
                  {listViewShow ? (
                    <GalleryThumbnails size={20} />
                  ) : (
                    <List size={20} />
                  )}
                </div>
              </TooltipTrigger>

              <TooltipContent side="bottom" className="-mt-3 mr-1">
                {listViewShow ? <p>Grid View</p> : <p>List View</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {(deleteMultipleScreen || deleteMultipleScreenFolder) && (
            <TooltipProvider>
              <Tooltip>
                <Dialog
                  open={deleteMultipleScreenOpen}
                  onOpenChange={setDeleteMultipleScreenOpen}
                >
                  <DialogTrigger asChild>
                    <TooltipTrigger>
                      <div className="py-2.5 mb-0 mt-[-12px] px-3 rounded text-white bg-delete_color cursor-pointer transition-all duration-300 ease-in-out hover:bg-delete_color hover:text-white w-[44px] h-[40px]">
                        <Trash2 size={20} />
                      </div>
                    </TooltipTrigger>
                  </DialogTrigger>
                  <DialogContent
                    className="sm:max-w-[397px] sm:max-h-[342px]"
                    style={{ zIndex: 99999 }}
                  >
                    <DialogHeader className="flex flex-col space-y-0">
                      <DialogTitle className="text-2xl font-semibold">
                        {multipleScreenMoveDetails.length > 0 &&
                        multipleFolderScreenMoveDetails.length > 0
                          ? "Delete Screen and Folder"
                          : multipleFolderScreenMoveDetails.length > 0
                          ? "Delete Folder"
                          : multipleScreenMoveDetails.length > 0
                          ? "Delete Screen"
                          : null}
                      </DialogTitle>
                      <DialogDescription className="m-0">
                        {multipleScreenMoveDetails.length > 0 &&
                        multipleFolderScreenMoveDetails.length > 0
                          ? "Are you sure want to delete the Screen and Folder"
                          : multipleFolderScreenMoveDetails.length > 0
                          ? "Are you sure want to delete the Folder"
                          : multipleScreenMoveDetails.length > 0
                          ? "Are you sure want to delete the Screen"
                          : null}
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
                        onClick={NewDeleteFn}
                        disabled={deleteLoader}
                      >
                        {deleteLoader ? (
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
                <TooltipContent side="bottom" className="mt-0 mr-1">
                  <p>
                    {multipleScreenMoveDetails.length > 0 &&
                    multipleFolderScreenMoveDetails.length > 0
                      ? "Delete Screen and Folder"
                      : multipleFolderScreenMoveDetails.length > 0
                      ? "Delete Folder"
                      : multipleScreenMoveDetails.length > 0
                      ? "Delete Screen"
                      : null}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {screenMove && (
            <TooltipProvider>
              <Tooltip>
                <Dialog open={screenMoveOpen} onOpenChange={setScreenMoveOpen}>
                  <DialogTrigger asChild>
                    <TooltipTrigger>
                      <li
                        className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out w-[44px] h-[40px] mb-3 hover:bg-button_orange hover:text-white"
                        onClick={getScreenFolderDetails}
                      >
                        <FolderSymlink size={20} />
                      </li>
                    </TooltipTrigger>
                  </DialogTrigger>
                  <DialogContent
                    className="sm:max-w-[397px] h-[530px]"
                    style={{ zIndex: 99999 }}
                  >
                    <DialogHeader className="flex flex-col space-y-0">
                      <DialogTitle className="text-2xl font-semibold mb-2">
                        Move Screen
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 pb-2">
                      <div>
                        <Label htmlFor="name" className="text-right mb-5">
                          Folder
                        </Label>
                        <Popover
                          open={screenSelectMoveOpen}
                          onOpenChange={setScreenSelectMoveOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={screenSelectMoveOpen}
                              className="w-full justify-between mt-1"
                            >
                              {screenMoveValue
                                ? screenFolderDetails.find(
                                    (framework: any) =>
                                      framework.id === screenMoveValue
                                  )?.name
                                : "Select Folder"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
                            </Button>
                          </PopoverTrigger>
                          <div
                            className={`border border-border_gray mt-1 rounded p-0`}
                          >
                            <Command>
                              <Input
                                placeholder="Search folder..."
                                value={screenSearchQuery}
                                className="rounded-none"
                                onChange={(e: any) =>
                                  setScreenSearchQuery(e.target.value)
                                }
                              />
                              <CommandList className="max-h-[160px] h-[160px] overflow-y-auto">
                                {filteredScreenFolders.length === 0 ? (
                                  <CommandEmpty className="max-h-[60px] h-[30px] flex justify-center pt-1">
                                    No folders found.
                                  </CommandEmpty>
                                ) : (
                                  <CommandGroup>
                                    {filteredScreenFolders.map(
                                      (framework: any) => (
                                        <CommandItem
                                          key={framework.id}
                                          value={framework.id}
                                          onSelect={(currentValue) => {
                                            if (setScreenMoveValue) {
                                              setScreenMoveValue(
                                                currentValue === screenMoveValue
                                                  ? null
                                                  : currentValue
                                              );
                                            }
                                            setScreenSelectMoveOpen(false);
                                            setScreenSelectError(false);
                                            if (setMultipleScreenMoveFolder) {
                                              setMultipleScreenMoveFolder(
                                                currentValue === screenMoveValue
                                                  ? null
                                                  : (currentValue as string)
                                              );
                                            }
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              screenMoveValue === framework.id
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {framework.name}
                                        </CommandItem>
                                      )
                                    )}
                                  </CommandGroup>
                                )}
                              </CommandList>
                            </Command>
                          </div>
                        </Popover>
                      </div>
                    </div>
                    <DialogFooter className="mb-0">
                      <DialogClose asChild>
                        <Button
                          variant={"outline"}
                          className="w-2/4"
                          // onClick={() => handleClear()}
                        >
                          Cancel
                        </Button>
                      </DialogClose>

                      <Button
                        className="bg-button_orange hover:bg-button_orange hover:opacity-75 w-2/4"
                        onClick={handleScreenMove}
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
                          "Add"
                        )}
                      </Button>
                    </DialogFooter>
                    <Button
                      className="bg-button_orange hover:bg-button_orange hover:opacity-75"
                      onClick={handleMoveScreenToDashboard}
                      disabled={moveScreenLoader || dashboardMoveButton}
                    >
                      {moveScreenLoader ? (
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
                        "Move to Screen Dashboard"
                      )}
                    </Button>
                  </DialogContent>
                </Dialog>
                <TooltipContent side="bottom" className="-mt-3 mr-1">
                  <p>Move Screen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {filterIcon && (
            <FilterComponent
              screenFilterValue={screenFilterValue || "All"}
              setScreenFilterValue={setScreenFilterValue}
              handleFilterScreen={handleFilterScreen || (() => {})}
              screenStatusFilter={screenStatusFilter || "All"}
              setScreenStatusFilter={setScreenStatusFilter || (() => {})}
              screenData={screenData}
              fetchScreenFolderData={getScreenFolderDetails || (() => {})}
              folderDataShow={folderDataShow as any}
              screenDataShow={screenDataShow}
            />
          )}
          <TooltipProvider>
            <Tooltip>
              <Popover>
                <PopoverTrigger asChild>
                  <TooltipTrigger>
                    <li className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out w-[44px] h-[40px] mb-3 hover:bg-button_orange hover:text-white">
                      <Ellipsis size={20} />
                    </li>
                  </TooltipTrigger>
                </PopoverTrigger>
                <PopoverContent className="w-40">
                  <div className="grid gap-2">
                    <p
                      className="text-base cursor-pointer"
                      onClick={() => handleSortOptionClick?.("asc")}
                    >
                      A-Z
                    </p>
                    <p
                      className="text-base cursor-pointer"
                      onClick={() => handleSortOptionClick?.("desc")}
                    >
                      Z-A
                    </p>
                    <p
                      className="text-base cursor-pointer"
                      onClick={() => handleSortOptionClick?.("date-asc")}
                    >
                      A-Z (Date)
                    </p>
                    <p
                      className="text-base cursor-pointer"
                      onClick={() => handleSortOptionClick?.("date-desc")}
                    >
                      Z-A (Date)
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
              <TooltipContent side="bottom" className="-mt-3">
                <p>Sort</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </ul>
      </div>
    </>
  );
};

export default SearchBar;
