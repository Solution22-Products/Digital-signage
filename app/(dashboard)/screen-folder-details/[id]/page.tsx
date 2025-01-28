"use client";
import SearchBar from "@/components/searchbar";
import { Button } from "@/components/ui/button";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { supabase } from "@/utils/supabase/supabaseClient";
import {
  CalendarDays,
  ChevronRight,
  CirclePlus,
  Copy,
  Folder,
  ListPlus,
  Loader,
  LoaderCircle,
  Monitor,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import { Toaster } from "react-hot-toast";
// import { Toaster } from "@/components/ui/sonner";
import "./style.css";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import { FolderSkeleton } from "@/components/skeleton-ui";
// import { toast } from "sonner";
import { toast, useToast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { ScreenData } from "@/interfaces";

interface Props {
  params: {
    id: string;
  };
}
interface screenItems {
  id: string;
  screenname: string;
  url: string;
  time: string;
  folder_id: string;
  userId: string;
}

const ScreenFolderDetails = (props: Props) => {
  const { id } = props.params;
  const [deleteFolderOpen, setDeleteFolderOpen] = useState(false);
  const router = useRouter();
  const [folderName, setFolderName] = useState<string>("");
  const [folderedScreens, setFolderedScreens] = useState<screenItems[]>([]);

  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
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

  const [folderedScreenLoading, setFolderedScreenLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [searchValue, setSearchValue] = useState<string | null>("");
  const [sortedValue, setSortedValue] = useState<string | null>("");
  const [screenFilterValue, setScreenFilterValue] = useState<string | null>("");
  const [screenStatusFilter, setScreenStatusFilter] = useState<string | null>(
    ""
  );
  const [signedInUserId, setSignedInUserId] = useState<string | null>("");
  const [selectAll, setSelectAll] = useState(false);
  const [addLoader, setAddLoader] = useState(false);
  const [folderLoader, setFolderLoader] = useState<string[]>([]);
  const [backLoader, setBackLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [screenFolderDetails, setScreenFolderDetails] = useState<ScreenData[]>(
    []
  );
  const [listViewShow, setListViewShow] = useState(false);

  //const notify = (message: string) =>
  // toast.success(message, {
  //   style: {
  //     borderRadius: "10px",
  //     background: "#fff",
  //     color: "#000",
  //   },
  //   position: "top-right",
  //   duration: 2000,
  // });
  // toast("Folder has been deleted", {
  //   description: "Sunday, December 03, 2023 at 9:00 AM",
  //   action: {
  //     label: "Undo",
  //     onClick: () => console.log("Undo"),
  //   },
  // });

  const getScreenFolderDetails = async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("name")
      .eq("id", id)
      .single();
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setFolderName(data.name);
      const { data: screens, error: screensError } = await supabase
        .from("screenDetails")
        .select("*")
        .eq("is_deleted", 0)
        .eq("folder_id", id);
      if (screensError) {
        setFolderedScreenLoading(false);
        setNotFound(false);
        console.error("Error fetching images:", screensError);
      } else {
        setFolderedScreens(screens);
      }
    }
  };

  const screenFolderData = async () => {
    const user = localStorage.getItem("userId");
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("userId", user)
      .eq("is_deleted", 0)
      .eq("folder_type", "screen");
    if (error) {
      console.error("Error fetching data 1:", error);
    } else {
      // console.log("Data from Supabase: ", data);
      setScreenFolderDetails(data);
    }
  };

  const handleScreenFolderUpdate = async () => {
    setAddLoader(true);
    const { data: existData, error: existError } = await supabase
      .from("folders")
      .select("*")
      .eq("folder_type", "screen")
      .eq("name", folderName)
      .neq("id", id)
      .eq("userId", signedInUserId)
      .single();
    if (existData) {
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
      .update({
        name: folderName,
      })
      .eq("id", id)
      .select();
    if (error) {
      console.error("Error updating data:", error);
      setAddLoader(false);
    } else {
      // notify("Folder updated successfully");
      setAddLoader(false);
      toast({
        title: "Updated Successfully!.",
        description: "Folder has updated successfully!",
        action: <ToastAction altText="Ok">Ok</ToastAction>,
      });
    }
  };

  const handleScreenDetails = async (data: any) => {
    if (checked) {
      return;
    }
    setFolderLoader((prev) => [...prev, data.id]);
    (prev: any) => prev.filter((id: any) => id !== data.id);
    router.push(`/screen-details/${data.id}`);
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

  const handleFolderDelete = async () => {
    setAddLoader(true);
    try {
      // const { data, error: deleteContentError } = await supabase
      //   .from("screenDetails")
      //   .update({ is_deleted: 1 })
      //   .eq("folder_id", id);
      const { error: deleteContentError } = await supabase
        .from("screenDetails")
        .update({ is_deleted: 1 })
        .eq("folder_id", id);
      if (deleteContentError) throw deleteContentError;

      // const { error: deleteFolderError } = await supabase
      //   .from("folders")
      //   .update({ is_deleted: 1 })
      //   .eq("id", id)
      //   .single();
      const { error: deleteFolderError } = await supabase
        .from("folders")
        .update({ is_deleted: 1 })
        .eq("id", id);
      if (deleteFolderError) throw deleteFolderError;

      setDeleteFolderOpen(false);
      setAddLoader(false);
      //notify("Folder deleted successfully");
      toast({
        title: "Updated Successfully!.",
        description: "Folder has deleted successfully!",
        action: (
          <ToastAction altText="Undo" onClick={() => handleFolderDeleteUndo()}>
            Undo
          </ToastAction>
        ),
      });
      setTimeout(() => router.push("/screen"), 4000);
    } catch (error) {
      console.error("Error deleting folder and related content:", error);
      setAddLoader(false);
    }
  };

  const handleFolderDeleteUndo = async () => {
    try {
      const { error: deleteContentError } = await supabase
        .from("screenDetails")
        .update({ is_deleted: 0 })
        .eq("folder_id", id);
      if (deleteContentError) throw deleteContentError;

      const { error: deleteFolderError } = await supabase
        .from("folders")
        .update({ is_deleted: 0 })
        .eq("id", id);
      if (deleteFolderError) throw deleteFolderError;

      toast({
        title: "Updated Successfully!.",
        description: "Folder has recovered successfully!",
      });
      //setTimeout(() => router.push("/screen"), 3000);
    } catch (error) {
      console.error("Error deleting folder and related content:", error);
    }
  };

  useEffect(() => {
    if (folderedScreens.length > 0) {
      setTimeout(() => {
        setFolderedScreenLoading(false);
      }, 500);
    } else {
      setTimeout(() => {
        setFolderedScreenLoading(false);
        setTimeout(() => {
          setNotFound(true);
        }, 0);
      }, 500);
    }
  }, [folderedScreens]);

  useEffect(() => {
    getScreenFolderDetails();
    screenFolderData();
  }, []);

  const handleFilterScreen = async () => {
    try {
      if (screenFilterValue === "Any" && screenStatusFilter === "") {
        // Fetch all data if both filters are empty or set to 'any'
        getScreenFolderDetails();
      } else {
        let query = supabase
          .from("screenDetails")
          .select("*")
          .eq("folder_id", id);

        if (screenFilterValue !== "Any" && screenFilterValue !== "") {
          const { data, error } = await supabase
            .from("layoutType")
            .select("id")
            .eq("title", screenFilterValue)
            .single(); // Use single() to directly fetch a single object

          if (error) {
            throw error;
          }
          query = query.eq("orientation", data.id).eq("userId", signedInUserId);
        }

        if (screenStatusFilter !== "") {
          query = query
            .eq("status", screenStatusFilter)
            .eq("userId", signedInUserId);
        }

        const { data: filteredScreen, error: filterError } = await query.order(
          "id",
          { ascending: false }
        );

        if (filterError) {
          throw filterError;
        }

        if (filteredScreen && filteredScreen) {
          setFolderedScreens(filteredScreen);
        } else {
          alert("No data found matching the filter conditions.");
          setFolderedScreens([]);
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
    items: screenItems[],
    sortOrder: string | null,
    key: "screenname"
  ) => {
    switch (sortOrder) {
      case "asc":
        return [...items].sort((a, b) =>
          a[key as keyof screenItems].localeCompare(b[key as keyof screenItems])
        );
      case "desc":
        return [...items].sort((a, b) =>
          b[key as keyof screenItems].localeCompare(a[key as keyof screenItems])
        );
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
  const filterFolderedScreens = sortItems(
    filterBySearchValue(folderedScreens, "screenname", searchValue as string),
    sortedValue,
    "screenname"
  );

  const handleSortOptionClick = (sortOrder: string) => {
    setSortedValue(sortOrder);
    // setSortDropdownOpen(false);
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);

    const applicableContent = filterFolderedScreens
      .filter(
        (preview) =>
          preview.folder_id === id && preview.userId === signedInUserId
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
      if (getScreenFolderDetails) {
        getScreenFolderDetails();
      }

      setScreenMoveOpen?.(false);
      setDeleteLoader(false);
      setScreenMove?.(false);
      setScreenMoveValue?.("");
      // setScreenSelectError(false);
      setDeleteMultipleScreenOpen?.(false);
      setDeleteMultipleScreen?.(false);
      getScreenFolderDetails();
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
      if (getScreenFolderDetails) {
        getScreenFolderDetails();
      }

      setScreenMoveOpen?.(false);
      setScreenMove?.(false);
      setScreenMoveValue?.("");
      // setScreenSelectError(false);
      setDeleteMultipleScreenOpen?.(false);
      setDeleteMultipleScreen?.(false);
      getScreenFolderDetails();
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

  useEffect(() => {
    setSignedInUserId(localStorage.getItem("userId")!);
  }, []);

  return (
    <>
      <div
        className="w-full p-0 flex"
        style={{ minHeight: "calc(100vh - 60px)" }}
      >
        <Toaster />
        <div className="w-full pr-0">
          <SearchBar
            addscreen={true}
            handleCancel={() => {}}
            displayplus={<CirclePlus size={20} />}
            screenData={() => {}}
            screenFolderId={id}
            screenMove={screenMove}
            setScreenMove={setScreenMove}
            screenMoveOpen={screenMoveOpen}
            setScreenMoveOpen={setScreenMoveOpen}
            screenMoveValue={screenMoveValue}
            setScreenMoveValue={setScreenMoveValue}
            setMultipleScreenMoveFolder={setMultipleScreenMoveFolder}
            multipleScreenMoveDetails={multipleScreenMoveDetails}
            deleteMultipleScreen={deleteMultipleScreen}
            setDeleteMultipleScreen={setDeleteMultipleScreen}
            deleteMultipleScreenOpen={deleteMultipleScreenOpen}
            setDeleteMultipleScreenOpen={setDeleteMultipleScreenOpen}
            multipleFolderScreenMoveDetails={""}
            setMultipleFolderScreenMoveDetails={""}
            searchValue={searchValue}
            setSearchValue={(value: string | null) => setSearchValue(value)}
            handleSortOptionClick={handleSortOptionClick as any}
            filterIcon={true}
            screenFilterValue={screenFilterValue as any}
            setScreenFilterValue={setScreenFilterValue as any}
            handleFilterScreen={handleFilterScreen as any}
            screenStatusFilter={screenStatusFilter as any}
            setScreenStatusFilter={setScreenStatusFilter as any}
            getScreenFolderDetails={() => getScreenFolderDetails()}
            screenDataShow={false}
            folderDataShow={true}
            setSelectAll={setSelectAll}
            screenFolderDetails={screenFolderDetails}
            setScreenFolderDetails={setScreenFolderDetails}
            setMultipleScreenMoveDetails={setMultipleScreenMoveDetails}
            setCheckedItems={setCheckedItems}
            listViewShow={listViewShow}
            setListViewShow={setListViewShow}
          />
          <div className="w-full p-4 pt-0">
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2 mt-0">
                {/* <h4
                  className="text-base font-medium text-primary_color cursor-pointer"
                  onClick={() => router.back()}
                >
                  Folder
                </h4> */}
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
                    "Folder"
                  )}
                </h4>
                <ChevronRight />
                <h4 className="text-base font-medium text-primary_color">
                  {folderName}
                </h4>
              </div>
              <div className="flex flex-row justify-end items-center">
                {/* {deleteMultipleScreen && (
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
                      <TooltipContent side="bottom" className="-mt-3 mr-1">
                        <p>Delete Screen</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )} */}
                <div className="mt-2">
                  <Input
                    type="checkbox"
                    id="select-all"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="hidden"
                  />
                </div>
                <div className="mr-4">
                  <label
                    htmlFor="select-all"
                    className={`text-sm font-medium outline-none border-none ml-2 cursor-pointer py-2.5 bg-primary_color rounded border text-white px-4`}
                    style={
                      filterFolderedScreens.length === 0
                        ? { pointerEvents: "none", opacity: 0.6 }
                        : {}
                    }
                  >
                    {selectAll ? "Unselect All" : "Select All"}
                  </label>
                </div>
              </div>
            </div>

            {listViewShow ? (
              <table className="text-center border border-gray-300 w-full mt-6">
                {/* Added border class */}
                <thead className="bg-gray-200 h-[45px]">
                  {/* Added background color */}
                  <tr>
                    <th className="w-[30%] text-left pl-5 border border-gray-300">
                      {/* Added border */}
                      Name
                    </th>
                    <th className="w-[15%] border border-gray-300">
                      {/* Added border */}
                      Created On
                    </th>
                    <th className="w-[15%] border border-gray-300">
                      {/* Added border */}
                      Status
                    </th>
                    <th className="w-[30%] border border-gray-300">
                        {/* Added border */}
                        Screen Link
                      </th>
                  </tr>
                </thead>
                <tbody>
                  {filterFolderedScreens.length > 0 ? (
                    filterFolderedScreens.map((screenData: any) => (
                      <tr
                        key={screenData.id}
                        className="border border-gray-300"
                      >
                        {/* Added border */}
                        <td className="w-[30%] border border-gray-300">
                          {/* Added border */}
                          <div className="parent_wrapper">
                            <Input
                              type="checkbox"
                              className="image_checkbox_folder_view"
                              value={screenData.id}
                              id={screenData.id}
                              onChange={(e) =>
                                handleCheckboxChange(e, screenData.id)
                              }
                              checked={checkedItems.includes(screenData.id)}
                            />
                            <div
                              key={screenData.id}
                              onClick={() => handleScreenDetails(screenData)}
                              className={`mt-[-5px] pb-[10px] bg-none cursor-pointer screen_wrapper flex items-center gap-1.5`}
                              style={
                                folderLoader.includes(screenData.id)
                                  ? { pointerEvents: "none" }
                                  : {}
                              }
                            >
                              {folderLoader.includes(screenData.id) ? (
                                  <svg
                                    className="animate-spin h-5 w-5 ml-5"
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
                                  <p className="text-sm font-medium pl-5 truncate overflow-hidden text-ellipsis">
                                {screenData.screenname.length > 25
                                  ? `${screenData.screenname.slice(0, 28)}...`
                                  : screenData.screenname}
                              </p>
                                )}
                              
                            </div>
                          </div>
                        </td>
                        <td className="w-[15%] border border-gray-300">
                          {/* Added border */}
                          <p className="text-sm font-medium truncate">
                            {new Date(screenData.created_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                            ,{" "}
                            {new Date(screenData.created_at).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </p>
                        </td>
                        <td className="w-[15%] border border-gray-300">
                          {/* Added border */}
                          <p className="text-sm font-medium truncate">
                            {screenData.status}
                          </p>
                        </td>
                        <td className="w-[30%] border border-gray-300">
                                <div className="flex items-center gap-1.5 justify-center">
                                  <p className="text-sm font-medium truncate">
                                    {screenData.short_link}
                                  </p>
                                  <Copy
                                    size={18}
                                    className="ml-2 cursor-pointer"
                                    onClick={() => {
                                      navigator.clipboard.writeText(screenData.short_link);
                                      toast({
                                        title: "Copied Successfully!",
                                        description: "Link copied to clipboard!",
                                      })
                                    }}
                                  />
                                </div>
                              </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-4">
                        <p className="text-base font-medium text-secondary_color">
                          No screen found
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : folderedScreenLoading ? (
              <div className="mt-2">
                <FolderSkeleton />
              </div>
            ) : (
              <div className="mt-0">
                {filterFolderedScreens.length > 0 ? (
                  <div className="flex flex-wrap items-start justify-start gap-2 w-full mt-5">
                    {filterFolderedScreens.map((item: any) =>
                      // item.is_deleted === 1 &&
                      {
                        const data = {
                          id: item.id,
                          screenName: item.screenname,
                          time: item.time,
                        };
                        return (
                          <div className="parent_wrapper -mt-3.5" key={item.id}>
                            <Input
                              type="checkbox"
                              className="image_checkbox5"
                              value={item.id}
                              id={item.id}
                              onChange={(e) => handleCheckboxChange(e, item.id)}
                              checked={checkedItems.includes(item.id)}
                            />
                            <div key={item.id} className="flex flex-wrap gap-2">
                              <div
                                key={item.id}
                                onClick={() => handleScreenDetails(data)}
                                className={`h-14 w-56  border border-border_gray rounded px-3 py-2 cursor-pointer flex items-center gap-1.5`}
                                style={
                                  folderLoader.includes(item.id)
                                    ? { pointerEvents: "none" }
                                    : {}
                                }
                              >
                                {folderLoader.includes(item.id) ? (
                                  <svg
                                    className="animate-spin h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    key={item.id}
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
                                  <p className={`text-sm font-medium`}>
                                    {item.screenname.length > 12
                                      ? `${item.screenname.slice(0, 18)}...`
                                      : item.screenname}
                                  </p>
                                  <p
                                    className={`text-xs font-normal mt-1 flex items-center gap-2`}
                                  >
                                    {item.time}
                                    {item.status === "Active" ? (
                                      <span className="w-1.5 h-1.5 bg-active rounded-full block"></span>
                                    ) : (
                                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full block"></span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="text-base font-medium text-secondary_color mt-3 w-full h-[55vh] flex items-center justify-center">
                    No screen found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* folder details sidebar code starts here */}
        <div
          className="w-[329px] border-l border-border_gray p-5"
          id="folder-settings"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-primary_color">
              Folder Settings
            </h4>
            <Dialog open={deleteFolderOpen} onOpenChange={setDeleteFolderOpen}>
              <DialogTrigger asChild>
                <div className="py-2.5 px-3 rounded text-white bg-delete_color cursor-pointer transition-all duration-300 ease-in-out hover:bg-delete_color hover:text-white w-[44px] h-[40px]">
                  <Trash2 size={20} />
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[397px] sm:max-h-[342px]">
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
                    onClick={() => handleFolderDelete()}
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
                      "Yes"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-5">
            <div>
              <h4 className="text-sm font-medium text-primary_color mb-1.5">
                Folder name
              </h4>
              <Input
                type="text"
                placeholder="Summer sale"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
            </div>
            {/* <div className="mt-4">
            <h4 className="text-sm font-medium text-primary_color mb-1.5">
              Add Tag
            </h4>
            <AddTag initialTags={folderTags} onTagsChange={setFolderTags} selectedTag={folderTag || []} selectedId={folderId} />
          </div> */}
          </div>
          <div className="mt-6 flex items-center gap-6 w-full">
            <Button
              className="bg-button_orange hover:bg-button_orange hover:opacity-75 w-full"
              onClick={() => handleScreenFolderUpdate()}
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
      </div>
    </>
  );
};

export default ScreenFolderDetails;
