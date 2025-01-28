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
  Copy,
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

const Screen = (props: ScreenComponentProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const [showScreenData, setShowScreenData] = useState<ScreenData[]>([]);
  const [folderCollapse, setFolderCollapse] = useState(true);

  const [contentFolderModelOpen, setContentFolderModelOpen] = useState(false);
  const [screenFolderDetails, setScreenFolderDetails] = useState<ScreenData[]>(
    []
  );

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
  const [signedInUserId, setSignedInUserId] = useState<string | null>(null);

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
  const [listViewShow, setListViewShow] = useState(false);

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
      setShowScreenData(
        data.sort((a: any, b: any) => a.screenname.localeCompare(b.screenname))
      );
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
      setScreenFolderDetails(
        data.sort((a: any, b: any) => a.name.localeCompare(b.name))
      );
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
        setFolderSelectAll(false);
      }
      return updatedCheckedItems;
    });
  };

  useEffect(() => {
    // const userName = async () => {
    //   const user = await getUserData();
    //   setSignedInUserId(user?.id || null);
    //   // console.log("user id ", user?.id || null);
    //   return user;
    // };
    // userName();
    setSignedInUserId(localStorage.getItem("userId") || null);
  }, []);

  useEffect(() => {
    if (signedInUserId) {
      getData();
      screenFolderData();
    }
  }, [signedInUserId]);

  useEffect(() => {
    // console.log("showScreenData ", showScreenData);
    if (showScreenData.length > 0) {
      // setTimeout(() =>
      setScreenLoading(false);
      // , 500);
    }
    if (screenFolderDetails.length > 0) {
      // setTimeout(() =>
      setScreenFolderLoading(false);
      // 500);
    }
  }, [showScreenData, screenFolderDetails]);

  const handleFilterScreen = async () => {
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

        if (filteredScreen && filteredScreen.length > 0) {
          setShowScreenData(filteredScreen);
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
        deleteMultipleScreen={deleteMultipleScreen}
        setDeleteMultipleScreen={setDeleteMultipleScreen}
        deleteMultipleScreenFolder={deleteMultipleScreenFolder}
        setDeleteMultipleScreenFolder={setDeleteMultipleScreenFolder}
        deleteMultipleScreenOpen={deleteMultipleScreenOpen}
        setDeleteMultipleScreenOpen={setDeleteMultipleScreenOpen}
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
        // multipleScreenMoveDetails={multipleScreenMoveDetails}
        setMultipleScreenMoveDetails={setMultipleScreenMoveDetails}
        multipleFolderScreenMoveDetails={multipleFolderScreenMoveDetails}
        setFolderSelectAll={setFolderSelectAll}
        setCheckedItems={setCheckedItems}
        setFolderCheckedItems={setFolderCheckedItems}
        setMultipleFolderScreenMoveDetails={setMultipleFolderScreenMoveDetails}
        listViewShow={listViewShow}
        setListViewShow={setListViewShow}
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
              {listViewShow ? (
                <table className="text-center border border-gray-300 w-full mt-2">
                  {/* Added border class */}
                  <thead className="bg-gray-200 h-[45px]">
                    {/* Added background color */}
                    <tr>
                      <th className="w-[40%] text-left pl-5 border border-gray-300">
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
                    {filteredScreens.filter(
                      (preview) => preview.folder_id === null
                    ).length > 0 ? (
                      filteredScreens.map(
                        (screenData: any) =>
                          screenData.folder_id === null && (
                            <tr
                              key={screenData.id}
                              className="border border-gray-300"
                            >
                              {/* Added border */}
                              <td className="w-[40%] border border-gray-300">
                                {/* Added border */}
                                <div className="screen_data_parent_wrapper">
                                  <Input
                                    type="checkbox"
                                    className="image_checkbox_view"
                                    value={screenData.id}
                                    id={screenData.id}
                                    onChange={(e) =>
                                      handleCheckboxChange(e, screenData.id)
                                    }
                                    checked={checkedItems.includes(
                                      screenData.id
                                    )}
                                  />
                                  <div
                                    onClick={() =>
                                      handleScreenClick(screenData)
                                    }
                                    key={screenData.id}
                                    className={`mt-[-5px] pb-[10px] bg-none cursor-pointer screen_wrapper flex items-center gap-1.5`}
                                    style={
                                      addLoader.includes(screenData.id)
                                        ? { pointerEvents: "none" }
                                        : {}
                                    }
                                  >
                                    {addLoader.includes(screenData.id) ? (
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
                                          ? `${screenData.screenname.slice(
                                              0,
                                              28
                                            )}...`
                                          : screenData.screenname}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="w-[15%] border border-gray-300">
                                {/* Added border */}
                                <p className="text-sm font-medium truncate">
                                  {new Date(
                                    screenData.created_at
                                  ).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                  ,{" "}
                                  {new Date(
                                    screenData.created_at
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
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
                          )
                      )
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
              ) : screenLoading ? (
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
              {listViewShow ? (
                <table className="text-center border border-gray-300 w-full mt-4">
                  {" "}
                  {/* Added border class */}
                  <thead className="bg-gray-200 h-[45px]">
                    {" "}
                    {/* Added background color */}
                    <tr>
                      <th className="w-[40%] text-left pl-5 border border-gray-300">
                        {" "}
                        {/* Added border */}
                        Name
                      </th>
                      <th className="w-[15%] border border-gray-300">
                        {" "}
                        {/* Added border */}
                        Created On
                      </th>
                      <th className="w-[15%] border border-gray-300">
                        {" "}
                        {/* Added border */}
                      </th>
                      <th className="w-[30%] border border-gray-300">
                        {" "}
                        {/* Added border */}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScreenFolder.length > 0 ? (
                      filteredScreenFolder.map((screenData: any) => (
                        // screenData.folder_id === null &&
                        <tr
                          key={screenData.id}
                          className="border border-gray-300"
                          style={
                            addLoader.includes(screenData.id)
                              ? { pointerEvents: "none" }
                              : {}
                          }
                        >
                          {" "}
                          {/* Added border */}
                          <td className="w-[40%] border border-gray-300">
                            {" "}
                            {/* Added border */}
                            <div className="screen_data_parent_wrapper">
                              <Input
                                type="checkbox"
                                className="image_checkbox_view"
                                value={screenData.id}
                                id={screenData.id}
                                onChange={(e) =>
                                  handleFolderCheckboxChange(e, screenData.id)
                                }
                                checked={folderCheckedItems.includes(
                                  screenData.id
                                )}
                              />
                              <div
                                key={screenData.id}
                                onClick={() =>
                                  handleScreenFolderDetails(screenData)
                                }
                                className={`mt-[-5px] pb-[10px] bg-none cursor-pointer screen_wrapper flex items-center gap-1.5 
                                        
                                      `}
                                style={
                                  addLoader.includes(screenData.id)
                                    ? { pointerEvents: "none" }
                                    : {}
                                }
                              >
                                {addLoader.includes(screenData.id) ? (
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
                                    {screenData.name.length > 25
                                      ? `${screenData.name.slice(0, 28)}...`
                                      : screenData.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="w-[15%] border border-gray-300">
                            {/* Added border */}
                            <p className="text-sm font-medium truncate">
                              {new Date(
                                screenData.created_at
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                              ,{" "}
                              {new Date(
                                screenData.created_at
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </p>
                          </td>
                          <td className="w-[15%] border border-gray-300">
                            {" "}
                          </td>
                          <td className="w-[305%] border border-gray-300">
                            {" "}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-4">
                          <p className="text-base font-medium text-secondary_color">
                            No folder found
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
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
                                onClick={() =>
                                  handleScreenFolderDetails(folder)
                                }
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
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
      {/* </AnimatePresence> */}
    </>
  );
};

export default Screen;
