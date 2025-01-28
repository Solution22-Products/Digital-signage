"use client";
import React, { useEffect, useState } from "react";
import SearchBar from "@/components/searchbar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CalendarDays,
  ChevronsUpDown,
  CirclePlus,
  Folder,
  LoaderCircle,
  Monitor,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScreenData } from "@/interfaces";
// import { useScreenContext } from "@/context/ScreenContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import "./style.css";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import DefaultSkeleton from "@/components/skeleton-ui";
import { toast, useToast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface ScreenComponentProps {
  //screenData: ScreenData[];
  //folderData: ScreenData[];
}

// interface ScreenData {
//   id: string;
//   screenname: string;
//   url: string;
//   time: string;
//   folder_id: string;
// }

const ScreenComponent = (props:ScreenComponentProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const [showScreenData, setShowScreenData] = useState<ScreenData[]>([]);
  const [folderCollapse, setFolderCollapse] = useState(true);

  const [contentFolderModelOpen, setContentFolderModelOpen] = useState(false);
  const [screenFolderDetails, setScreenFolderDetails] = useState<ScreenData[]>([]);

  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const [folderCheckedItems, setFolderCheckedItems] = useState<string[]>([]);
  const [folderChecked, setFolderChecked] = useState(false);

  const [screenMove, setScreenMove] = useState(false);
  const [screenMoveOpen, setScreenMoveOpen] = useState(false);

  const [screenMoveValue, setScreenMoveValue] = useState<string | null>("");
  const [multipleScreenMoveFolder, setMultipleScreenMoveFolder] = useState<
    string | null
  >("");
  const [multipleScreenMoveDetails, setMultipleScreenMoveDetails] =
    useState<any>([]);

  const [deleteMultipleScreen, setDeleteMultipleScreen] = useState(false);
  const [deleteMultipleScreenOpen, setDeleteMultipleScreenOpen] =
    useState(false);
  const [signedInUserId, setSignedInUserId] = useState<string | null>(localStorage.getItem('userId') || null);

  const [screenLoading, setScreenLoading] = useState(false);
  const [screenFolderLoading, setScreenFolderLoading] = useState(false);

  const [searchValue, setSearchValue] = useState<string | null>("");
  const [sortedValue, setSortedValue] = useState<string | null>("");
  const [screenFilterValue, setScreenFilterValue] = useState<string | null>("");
  const [screenStatusFilter, setScreenStatusFilter] = useState<string | null>(
    ""
  );
  const [selectAll, setSelectAll] = useState(false);
  const [deleteMultipleScreenFolder, setDeleteMultipleScreenFolder] =
    useState(false);
  const [deleteMultipleScreenFolderOpen, setDeleteMultipleScreenFolderOpen] =
    useState(false);
  const [folderSelectAll, setFolderSelectAll] = useState(false);
  const [multipleFolderScreenMoveDetails, setMultipleFolderScreenMoveDetails] =
    useState<any>([]);

  const [addLoader, setAddLoader] = useState<string[]>([]);
  const [deleteLoader, setDeleteLoader] = useState(false);

  const handleScreenClick = (screenData: ScreenData) => {
    // if (checked) {
    //   return;
    // }
    setAddLoader((prev: any) => [...prev, screenData.id]);
    (prev: any) => prev.filter((id: any) => id !== screenData.id);

    router.push(`/screen-details/${screenData.id}`);
    // });
  };

  const getData = async () => {
    const { data, error } = await supabase
      .from("screenDetails")
      .select("*")
      .eq("userId", signedInUserId)
      .eq("is_deleted", 0);
    // .order("id", { ascending: false });
    if (error) {
      console.error("Error fetching data 1:", error);
      setScreenLoading(false);
    } else {
      // console.log("Data from Supabase: ", data);
      setShowScreenData(data);
      setScreenLoading(false);
    }
  };

  const screenFolderData = async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("userId", signedInUserId)
      .eq("is_deleted", 0)
      .eq("folder_type", "screen");
    if (error) {
      console.error("Error fetching data 1:", error);
    } else {
      // console.log("Data from Supabase: ", data);
      setScreenFolderDetails(data);
      setScreenFolderLoading(false);
    }
  };

  const handleScreenFolderDetails = async (folder: any) => {
    // if (checked) {
    //   return;
    // }
    setAddLoader((prev: any) => [...prev, folder.id]);
    (prev: any) => prev.filter((id: any) => id !== folder.id);
    router.push(`/screen-folder-details/${folder.id}`);
  };

  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: string
  ) => {
    const isChecked = event.target.checked;
    setChecked(isChecked);

    setCheckedItems((prevCheckedItems) => {
      let updatedCheckedItems;
      if (isChecked) {
        setScreenMove(true);
        setDeleteMultipleScreen(true);
        updatedCheckedItems = [...prevCheckedItems, index];
      } else {
        updatedCheckedItems = prevCheckedItems.filter((item) => item !== index);
      }
      setMultipleScreenMoveDetails(updatedCheckedItems as any);
      if (updatedCheckedItems.length <= 0) {
        setDeleteMultipleScreen(false);
        setScreenMove(false);
        setSelectAll(false);
      }
      return updatedCheckedItems;
    });
  };

  const handleFolderCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: string
  ) => {
    const isChecked = event.target.checked;
    setFolderChecked(isChecked);

    setFolderCheckedItems((prevCheckedItems) => {
      let updatedCheckedItems;
      if (isChecked) {
        setDeleteMultipleScreenFolder(true);
        updatedCheckedItems = [...prevCheckedItems, index];
      } else {
        updatedCheckedItems = prevCheckedItems.filter((item) => item !== index);
      }
      setMultipleFolderScreenMoveDetails(updatedCheckedItems as any);
      if (updatedCheckedItems.length <= 0) {
        setDeleteMultipleScreenFolder(false);
        setSelectAll(false);
      }
      return updatedCheckedItems;
    });
  };

  // useEffect(() => {
  //   const userName = async () => {
  //     const user = await getUserData();
  //     setSignedInUserId(user?.id || null);
  //     // console.log("user id ", user?.id || null);
  //     return user;
  //   };
  //   userName();
  // }, []);

  useEffect(() => {
    if (signedInUserId) {
      getData();
      screenFolderData();
    }
  }, [signedInUserId]);

  // useEffect(() => {
  //   console.log("showScreenData ", showScreenData);
  //   if (showScreenData.length > 0) {
  //     setTimeout(() => setScreenLoading(false), 3000);
  //   }
  //   if (screenFolderDetails.length > 0) {
  //     setTimeout(() => setScreenFolderLoading(false), 3000);
  //   }
  // }, [showScreenData, screenFolderDetails]);

  // const handleResetFilter = () => {
  //   if(screenFilterValue)
  //   setScreenFilterValue("");
  //   console.log("screenFilterValue:", screenFilterValue);
  // }

  const handleFilterScreen = async () => {
    console.log(screenStatusFilter, screenFilterValue);

    try {
      if (screenFilterValue === "Any" && screenStatusFilter === "") {
        // Fetch all data if both filters are empty or set to 'any'
        getData();
      } else {
        let query = supabase
          .from("screenDetails")
          .select("*")
          .eq("is_deleted", 0)
          .eq("userId", signedInUserId);

        if (screenFilterValue !== "Any" && screenFilterValue !== "") {
          const { data, error } = await supabase
            .from("layoutType")
            .select("id")
            .eq("is_deleted", 0)
            // .eq("userId", signedInUserId)
            .eq("title", screenFilterValue)
            .single(); // Use single() to directly fetch a single object

          if (error) {
            throw error;
          }

          console.log("layoutType ID:", data.id);
          query = query
            .eq("orientation", data.id)
            .eq("is_deleted", 0)
            .eq("userId", signedInUserId);
        }

        if (screenStatusFilter !== "") {
          query = query
            .eq("status", screenStatusFilter)
            .eq("is_deleted", 0)
            .eq("userId", signedInUserId);
        }

        const { data: filteredScreen, error: filterError } = await query.order(
          "id",
          { ascending: false }
        );

        if (filterError) {
          throw filterError;
        }

        console.log("Filtered Data from Supabase:", filteredScreen);

        if (filteredScreen && filteredScreen.length > 0) {
          setShowScreenData(filteredScreen);
          console.log("length ", filteredScreen.length);
        } else {
          toast({
            title: "No data found",
            description: "No data found for the selected filters.",
          });
          setShowScreenData([]);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const filterBySearchValue = (
    items: any[],
    key: string,
    searchValue: string
  ) => {
    const lowercasedSearchValue = searchValue.toLowerCase();
    return items.filter((item) =>
      item[key].toLowerCase().includes(lowercasedSearchValue)
    );
  };

  const parseDateTime = (dateTimeString: string) => {
    const [datePart, timePart] = dateTimeString.split(",");
    const [day, month, year] = datePart.split(".");
    return new Date(`${year}-${month}-${day}T${timePart}`);
  };

  const sortItems = (
    items: ScreenData[] | ScreenData[], // Assuming FolderData is the type for folders
    sortOrder: string | null,
    key: "screenname" | "name" // Key to sort by: screenname for screens, name for folders
  ) => {
    switch (sortOrder) {
      case "asc":
        return [...items].sort((a, b) => a[key].localeCompare(b[key]));
      case "desc":
        return [...items].sort((a, b) => b[key].localeCompare(a[key]));
      case "date-asc":
        return [...items].sort(
          (a, b) =>
            parseDateTime(a.time).getTime() - parseDateTime(b.time).getTime()
        );
      case "date-desc":
        return [...items].sort(
          (a, b) =>
            parseDateTime(b.time).getTime() - parseDateTime(a.time).getTime()
        );
      default:
        return items;
    }
  };

  const filteredScreens = sortItems(
    filterBySearchValue(showScreenData, "screenname", searchValue as string),
    sortedValue,
    "screenname"
  );

  const filteredScreenFolder = sortItems(
    filterBySearchValue(screenFolderDetails, "name", searchValue as string),
    sortedValue,
    "name"
  );

  const handleSortOptionClick = (sortOrder: string) => {
    setSortedValue(sortOrder);
    // setSortDropdownOpen(false);
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);

    const applicableContent = filteredScreens
      .filter(
        (preview) =>
          preview.folder_id === null && preview.userId === signedInUserId
      )
      .map((preview) => preview.id);

    if (!selectAll && applicableContent.length > 0) {
      // Select all applicable content
      setCheckedItems(applicableContent as any[]);
      setMultipleScreenMoveDetails(applicableContent as any[]);
      setScreenMove(true);
      setDeleteMultipleScreen(true);
    } else {
      // Unselect all
      setCheckedItems([]);
      setScreenMove(false);
      setDeleteMultipleScreen(false);
      setMultipleScreenMoveDetails([]);
    }
  };

  const handleSelectAllFolder = () => {
    setFolderSelectAll(!folderSelectAll);

    const applicableContent = filteredScreenFolder
      .filter((preview) => preview.userId === signedInUserId)
      .map((preview) => preview.id);
    if (!folderSelectAll && applicableContent.length > 0) {
      // Select all applicable content
      setFolderCheckedItems(applicableContent as any[]);
      setMultipleFolderScreenMoveDetails(applicableContent as any[]);
      setDeleteMultipleScreenFolder(true);
    } else {
      // Unselect all
      setFolderCheckedItems([]);
      setDeleteMultipleScreenFolder(false);
      setMultipleFolderScreenMoveDetails([]);
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
      console.log("Data deleted successfully");
      if (getData) {
        getData();
      }

      setScreenMoveOpen?.(false);
      setDeleteLoader(false);
      setScreenMove?.(false);
      setScreenMoveValue?.("");
      // setScreenSelectError(false);
      setDeleteMultipleScreenOpen?.(false);
      setDeleteMultipleScreen?.(false);
      getData();
      screenFolderData();
      setSelectAll?.(false);
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
      console.log("Data deleted successfully");
      if (getData) {
        getData();
      }

      setScreenMoveOpen?.(false);
      setScreenMove?.(false);
      setScreenMoveValue?.("");
      // setScreenSelectError(false);
      setDeleteMultipleScreenOpen?.(false);
      setDeleteMultipleScreen?.(false);
      getData();
      screenFolderData();
      setSelectAll?.(false);
      setCheckedItems([]);
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
      setDeleteMultipleScreenFolderOpen?.(false);
      setDeleteLoader(false);
      setFolderSelectAll?.(false);
      screenFolderData();
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
    console.log("multi folder details: ", multipleFolderScreenMoveDetails);
    console.log(
      "Deleting selected folders and their related screen details..."
    );

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
      setDeleteMultipleScreenFolderOpen?.(false);
      setFolderSelectAll?.(false);
      screenFolderData();
      setFolderCheckedItems([]);
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

  return (
    <>
      {/* <AnimatePresence> */}
      <SearchBar
        displayplus={<CirclePlus size={20} />}
        addscreen={true}
        createScreenFolder={true}
        handleCancel={() => {}}
        contentFolderModelOpen={contentFolderModelOpen}
        setContentFolderModelOpen={setContentFolderModelOpen}
        screenMove={screenMove}
        setScreenMove={setScreenMove}
        screenMoveOpen={screenMoveOpen}
        setScreenMoveOpen={setScreenMoveOpen}
        screenMoveValue={screenMoveValue}
        setScreenMoveValue={setScreenMoveValue}
        setMultipleScreenMoveFolder={setMultipleScreenMoveFolder}
        multipleScreenMoveDetails={multipleScreenMoveDetails}
        screenData={() => getData()}
        setDeleteMultipleScreen={setDeleteMultipleScreen}
        screenFolderData={screenFolderData}
        searchValue={searchValue}
        setSearchValue={(value: string | null) => setSearchValue(value)}
        handleSortOptionClick={handleSortOptionClick as any}
        filterIcon={true}
        screenFilterValue={screenFilterValue as any}
        setScreenFilterValue={setScreenFilterValue as any}
        handleFilterScreen={handleFilterScreen as any}
        screenStatusFilter={screenStatusFilter as any}
        setScreenStatusFilter={setScreenStatusFilter as any}
        screenDataShow={true}
        folderDataShow={false}
        getScreenFolderDetails={() => screenFolderData()}
        setSelectAll={setSelectAll}
        dashboardMoveButton={true}
        screenFolderDetails={screenFolderDetails}
        setScreenFolderDetails={setScreenFolderDetails}
      />
      <div
        className="w-full p-4 pt-0"
        // initial={{ opacity: 0 }}
        // animate={{ opacity: 1 }}
        // exit={{ opacity: 0 }}
        // transition={{ duration: 0.75, ease: "easeInOut" }}
        // style={{ minHeight: "calc(100vh - 60px)" }}
      >
        <Toaster />
        <div className="w-full">
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full space-y-2"
          >
            <div className="flex items-center justify-between space-x-4">
              <h4 className="text-base font-bold text-primary_color">Screen</h4>
              <div className="flex flex-row items-center align-middle">
                {deleteMultipleScreen && (
                  <TooltipProvider>
                    <Tooltip>
                      <Dialog
                        open={deleteMultipleScreenOpen}
                        onOpenChange={setDeleteMultipleScreenOpen}
                      >
                        <DialogTrigger asChild>
                          <TooltipTrigger>
                            <div className="py-2.5 mb-0 px-3 rounded text-white bg-delete_color cursor-pointer transition-all duration-300 ease-in-out hover:bg-delete_color hover:text-white w-[44px] h-[40px]">
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
                              onClick={handleDeleteScreen}
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
                        <p>Delete Screen</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <div className="flex flex-row justify-end items-center">
                  <div className="mt-2">
                    <Input
                      type="checkbox"
                      id="select-all"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="hidden"
                    />
                  </div>
                  <div className="mr-0">
                    <label
                      htmlFor="select-all"
                      className={`text-sm font-medium outline-none border-none ml-2 cursor-pointer py-2.5 bg-primary_color rounded border text-white px-4`}
                      style={
                        filteredScreens.length === 0
                          ? { pointerEvents: "none", opacity: 0.6 }
                          : {}
                      }
                    >
                      {selectAll ? "Unselect All" : "Select All"}
                    </label>
                  </div>
                </div>

                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
            <CollapsibleContent className="px-0 py-0 flex flex-wrap items-center gap-4">
              {screenLoading ? (
                <DefaultSkeleton />
              ) : (
                <div className="w-full mt-2">
                  {filteredScreens.filter(
                      (preview) => preview.folder_id === null
                    ).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {filteredScreens.map(
                        (screenData: any) =>
                          screenData.folder_id === null && (
                            <div
                              key={screenData.id}
                              className="screen_data_parent_wrapper -mt-4"
                            >
                              <Input
                                type="checkbox"
                                className="image_checkbox3"
                                value={screenData.id}
                                id={screenData.id}
                                onChange={(e) =>
                                  handleCheckboxChange(e, screenData.id)
                                }
                                checked={checkedItems.includes(screenData.id)}
                              />
                              <div
                                key={screenData.id}
                                className={`h-14 w-56 bg-zinc-50 border border-border_gray rounded px-3 py-2 cursor-pointer screen_wrapper flex items-center gap-1.5 ${
                                  checkedItems.includes(screenData.id)
                                    ? "border-[#FF7C44]"
                                    : ""
                                }`}
                                style={
                                  addLoader.includes(screenData.id)
                                    ? { pointerEvents: "none" }
                                    : {}
                                }
                                onClick={() => handleScreenClick(screenData)}
                              >
                                {addLoader.includes(screenData.id) ? (
                                  <svg
                                    className="animate-spin h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    key={screenData.id}
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
                                ) : (
                                  <Monitor size={20} />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-primary_color">
                                    {screenData.screenname.length > 12
                                      ? `${screenData.screenname.slice(
                                          0,
                                          18
                                        )}...`
                                      : screenData.screenname}
                                  </p>
                                  <p className="text-xs font-normal text-secondary_color mt-1 flex items-center gap-2">
                                    {screenData.time}
                                    {screenData.status === "Active" ? (
                                      <span className="w-1.5 h-1.5 bg-active rounded-full block"></span>
                                    ) : (
                                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full block"></span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  ) : (
                    <div className="w-full flex justify-center items-center">
                      <p className="text-base font-medium text-secondary_color mt-0">
                        No screen found
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="folder-section border-t border-border_gray mt-4">
          <Collapsible
            open={folderCollapse}
            onOpenChange={setFolderCollapse}
            className="w-full space-y-2"
          >
            <div className="flex items-center justify-between space-x-4 mt-2">
              <h4 className="text-base font-bold text-primary_color">
                Folders
              </h4>
              <div className="flex flex-row align-middle">
                <div className="flex flex-row justify-end items-center">
                  {deleteMultipleScreenFolder && (
                    <TooltipProvider>
                      <Tooltip>
                        <Dialog
                          open={deleteMultipleScreenFolderOpen}
                          onOpenChange={setDeleteMultipleScreenFolderOpen}
                        >
                          <DialogTrigger asChild>
                            <TooltipTrigger>
                              <div className="py-2.5 mb-0 px-3 rounded text-white bg-delete_color cursor-pointer transition-all duration-300 ease-in-out hover:bg-delete_color hover:text-white w-[44px] h-[40px]">
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
                                Delete Folder
                              </DialogTitle>
                              <DialogDescription className="m-0">
                                Are you sure want to delete the folder
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
                                onClick={handleDeleteScreenFolder}
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
                          <p>Delete Folder</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <div className="mt-2">
                    <Input
                      type="checkbox"
                      id="folder-select-all"
                      checked={folderSelectAll}
                      onChange={handleSelectAllFolder}
                      className="hidden"
                    />
                  </div>
                  <div className="mr-0">
                    <label
                      htmlFor="folder-select-all"
                      className={`text-sm font-medium outline-none border-none ml-2 cursor-pointer py-2.5 bg-primary_color rounded border text-white px-4`}
                      style={
                        filteredScreenFolder.length === 0
                          ? { pointerEvents: "none", opacity: 0.6 }
                          : {}
                      }
                    >
                      {folderSelectAll ? "Unselect All" : "Select All"}
                    </label>
                  </div>
                </div>

                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
            <CollapsibleContent className="px-0 py-0 gap-4">
              <div className="folder-section">
                {screenFolderLoading ? (
                  <div className="flex flex-wrap items-center">
                    <DefaultSkeleton />
                  </div>
                ) : (
                  <div className="w-full">
                    {filteredScreenFolder.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {filteredScreenFolder.map((folder: any) => (
                          // folder.userId === signedInUserId &&
                          // folder.is_deleted === 0 &&
                          <div
                            key={folder.id}
                            className="screen_data_parent_wrapper -mt-4"
                          >
                            <Input
                              type="checkbox"
                              className="image_checkbox3"
                              value={folder.id}
                              id={folder.id}
                              onChange={(e) =>
                                handleFolderCheckboxChange(e, folder.id)
                              }
                              checked={folderCheckedItems.includes(folder.id)}
                            />
                            <div
                              key={folder.id}
                              onClick={() => handleScreenFolderDetails(folder)}
                              className={`h-14 w-56 bg-zinc-50 border border-border_gray rounded px-3 py-2 cursor-pointer flex items-center gap-1.5`}
                              style={
                                addLoader.includes(folder.id)
                                  ? { pointerEvents: "none" }
                                  : {}
                              }
                            >
                              {addLoader.includes(folder.id) ? (
                                <svg
                                  className="animate-spin h-5 w-5"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  key={folder.id}
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
                              ) : (
                                <Folder size={20} />
                              )}

                              <div>
                                <p className={`text-sm font-medium`}>
                                  {folder.name.length > 12
                                    ? `${folder.name.slice(0, 18)}...`
                                    : folder.name}
                                </p>
                                <p
                                  className={`text-xs text-secondary_color font-normal mt-1 flex items-center gap-2`}
                                >
                                  {folder.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full flex justify-center items-center">
                        <p className="text-base text-center font-medium text-secondary_color mt-0">
                          No folder found
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
      {/* </AnimatePresence> */}
    </>
  );
};

export default ScreenComponent;