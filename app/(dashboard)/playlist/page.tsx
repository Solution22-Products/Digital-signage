"use client";
import React, { useEffect, useState } from "react";
import SearchBar from "@/components/searchbar";
import {
  CalendarDays,
  Folder,
  ListPlus,
  ListVideo,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaylistData } from "@/interfaces";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { Input } from "@/components/ui/input";
import "./style.css";
import DefaultSkeleton from "@/components/skeleton-ui";
import PlaylistSearch from "./component/searchbar";

interface playlistFolderData {
  id: string | null;
  name: string | null;
}

const Playlist = () => {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const [showPlaylistData, setShowPlaylistData] = useState<PlaylistData[]>([]);
  const [folderOpen, setFolderOpen] = useState(true);
  const [createPlaylistFolderOpen, setCreatePlaylistFolderOpen] =
    useState(false);
  const [playlistFolderName, setPlaylistFolderName] = useState<
    playlistFolderData[]
  >([]);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const [folderCheckedItems, setFolderCheckedItems] = useState<string[]>([]);
  const [folderChecked, setFolderChecked] = useState(false);

  const [playlistMove, setPlaylistMove] = useState(false);
  const [playlistMoveOpen, setPlaylistMoveOpen] = useState(false);
  const [playlistMoveValue, setPlaylistMoveValue] = useState<string | null>("");
  const [multiplePlaylistMoveDetails, setMultiplePlaylistMoveDetails] =
    useState<any>([]);
  const [multiplePlaylistMoveFolder, setMultiplePlaylistMoveFolder] = useState<
    string | null
  >("");
  const [deleteMultiplePlaylist, setDeleteMultiplePlaylist] = useState(false);
  const [deleteMultiplePlaylistOpen, setDeleteMultiplePlaylistOpen] =
    useState(false);

  const [signedInUserId, setSignedInUserId] = useState<string | null>("");

  const [playlistLoading, setPlaylistLoading] = useState(true);
  const [playlistFolderLoading, setPlaylistFolderLoading] = useState(true);
  const [searchValue, setSearchValue] = useState<string | null>("");
  const [sortedValue, setSortedValue] = useState<string | null>("");

  const [selectAll, setSelectAll] = useState(false);
  const [deleteMultiplePlaylistFolder, setDeleteMultiplePlaylistFolder] =
    useState(false);
  const [
    deleteMultiplePlaylistFolderOpen,
    setDeleteMultiplePlaylistFolderOpen,
  ] = useState(false);
  const [folderSelectAll, setFolderSelectAll] = useState(false);
  const [
    multipleFolderPlaylistMoveDetails,
    setMultipleFolderPlaylistMoveDetails,
  ] = useState<any>([]);
  const [playlistTypeFetch, setPlaylistTypeFetch] = useState<
    playlistFolderData[]
  >([]);
  const [addLoader, setAddLoader] = useState<string[]>([]);
  const [folderLoader, setFolderLoader] = useState<string[]>([]);
  const [listViewShow, setListViewShow] = useState(false);

  // const [notFound, setNotFound] = useState(false);
  // const [folderNotFound, setFolderNotFound] = useState(false);

  const handlePlaylistData = (playlistData: PlaylistData) => {
    // if (checked) {
    //   return; // Stop redirection if the checkbox is checked
    // }
    setAddLoader((prev: any) => [...prev, playlistData.id]);
    (prev: any) => prev.filter((id: any) => id !== playlistData.id);
    router.push(`playlist-edit/${playlistData.id}`);
  };

  const getData = async () => {
    const { data, error } = await supabase
      .from("playlistDetails")
      .select("*")
      .eq("userId", signedInUserId)
      .eq("is_deleted", 0)
      .order("id", { ascending: false });
    if (error) {
      console.error("Error fetching data:", error);
      setPlaylistLoading(false);
    } else {
      setShowPlaylistData(data.sort((a: any, b: any) => a.playlistName.localeCompare(b.playlistName)));
      setPlaylistLoading(false);
    }
  };

  const getPlaylistFolderData = async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("userId", signedInUserId)
      .eq("is_deleted", 0)
      .eq("folder_type", "playlist");
    if (error) {
      console.error("Error fetching data:", error);
      setPlaylistFolderLoading(false);
    } else {
      setPlaylistFolderName(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      setPlaylistFolderLoading(false);
      setPlaylistTypeFetch(data as any);
    }
  };

  const handleFolderDetails = async (folder: any) => {
    // if (checked) {
    //   return;
    // }
    setFolderLoader((prev: any) => [...prev, folder.id]);
    (prev: any) => prev.filter((id: any) => id !== folder.id);
    router.push(`/playlist-folder-details/${folder.id}`);
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
        setPlaylistMove(true);
        setDeleteMultiplePlaylist(true);
        updatedCheckedItems = [...prevCheckedItems, index];
      } else {
        updatedCheckedItems = prevCheckedItems.filter((item) => item !== index);
      }
      setMultiplePlaylistMoveDetails(updatedCheckedItems as any);
      if (updatedCheckedItems.length <= 0) {
        setPlaylistMove(false);
        setDeleteMultiplePlaylist(false);
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
        setDeleteMultiplePlaylistFolder(true);
        updatedCheckedItems = [...prevCheckedItems, index];
      } else {
        updatedCheckedItems = prevCheckedItems.filter((item) => item !== index);
      }

      setMultipleFolderPlaylistMoveDetails(updatedCheckedItems as any);
      if (updatedCheckedItems.length <= 0) {
        setDeleteMultiplePlaylistFolder(false);
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
    setSignedInUserId(localStorage.getItem("userId"));
  }, []);

  useEffect(() => {
    if (signedInUserId) {
      getData();
      getPlaylistFolderData();
    }
  }, [signedInUserId]);

  useEffect(() => {
    if (showPlaylistData.length > 0) {
      setPlaylistLoading(false);
    }

    if (playlistFolderName.length > 0) {
      setPlaylistFolderLoading(false);
    }
  }, [showPlaylistData, playlistFolderName]);

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
    items: PlaylistData[] | PlaylistData[], // Assuming FolderData is the type for folders
    sortOrder: string | null,
    key: "playlistName" | "name" // Key to sort by: screenname for screens, name for folders
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
  const filteredPlaylist = sortItems(
    filterBySearchValue(
      showPlaylistData,
      "playlistName",
      searchValue as string
    ),
    sortedValue,
    "playlistName"
  );
  const filteredPlaylistFolder = sortItems(
    filterBySearchValue(playlistFolderName, "name", searchValue as string),
    sortedValue,
    "name"
  );
  const handleSortOptionClick = (sortOrder: string) => {
    setSortedValue(sortOrder);
    // setSortDropdownOpen(false);
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);

    const applicableContent = filteredPlaylist
      .filter(
        (preview) =>
          preview.folder_name === null && preview.userId === signedInUserId
      )
      .map((preview) => preview.id);

    if (!selectAll && applicableContent.length > 0) {
      // Select all applicable content
      setCheckedItems(applicableContent as any[]);
      setMultiplePlaylistMoveDetails(applicableContent as any[]);
      setPlaylistMove(true);
      setDeleteMultiplePlaylist(true);
    } else {
      // Unselect all
      setCheckedItems([]);
      setPlaylistMove(false);
      setDeleteMultiplePlaylist(false);
      setMultiplePlaylistMoveDetails([]);
    }
  };

  const handleSelectAllFolder = () => {
    setFolderSelectAll(!folderSelectAll);

    const applicableContent = filteredPlaylistFolder
      .filter((preview) => preview.userId === signedInUserId)
      .map((preview) => preview.id);
    if (!folderSelectAll && applicableContent.length > 0) {
      // Select all applicable content
      setFolderCheckedItems(applicableContent as any[]);
      setMultipleFolderPlaylistMoveDetails(applicableContent as any[]);
      setDeleteMultiplePlaylistFolder(true);
    } else {
      // Unselect all
      setFolderCheckedItems([]);
      setDeleteMultiplePlaylistFolder(false);
      setMultipleFolderPlaylistMoveDetails([]);
    }
  };

  return (
    <>
      {/* <SearchBar
        displayplus={<ListPlus size={20} />}
        calendarIcon={<CalendarDays size={20} />}
        calendar={false}
        playlist={true}
        addPlaylist={true}
        screenData={() => {}}
        getScreenFolderDetails={() => getPlaylistFolderData()}
        createPlaylistFolderOpen={createPlaylistFolderOpen}
        setCreatePlaylistFolderOpen={setCreatePlaylistFolderOpen}
        getPlaylistFolderData={getPlaylistFolderData}
        playlistMove={playlistMove}
        setPlaylistMove={setPlaylistMove}
        playlistMoveOpen={playlistMoveOpen}
        setPlaylistMoveOpen={setPlaylistMoveOpen}
        playlistMoveValue={playlistMoveValue}
        handleCancel={() => {}}
        handleMultipleSelectCancel={() => {}}
        setPlaylistMoveValue={setPlaylistMoveValue}
        multiplePlaylistMoveDetails={multiplePlaylistMoveDetails}
        setMultiplePlaylistMoveDetails={setMultiplePlaylistMoveDetails}
        multiplePlaylistMoveFolder={multiplePlaylistMoveFolder}
        setMultiplePlaylistMoveFolder={setMultiplePlaylistMoveFolder}
        playlistData={getData}
        deleteMultiplePlaylist={deleteMultiplePlaylist}
        setDeleteMultiplePlaylist={setDeleteMultiplePlaylist}
        deleteMultiplePlaylistOpen={deleteMultiplePlaylistOpen}
        setDeleteMultiplePlaylistOpen={setDeleteMultiplePlaylistOpen}
        searchValue={searchValue}
        setSearchValue={(value: string | null) => setSearchValue(value)}
        handleSortOptionClick={handleSortOptionClick as any}
        contentFolderSort={true}
        filterIcon={false}
        setSelectAll={setSelectAll}
        deleteMultiplePlaylistFolder={deleteMultiplePlaylistFolder}
        setDeleteMultiplePlaylistFolder={setDeleteMultiplePlaylistFolder}
        deleteMultiplePlaylistFolderOpen={deleteMultiplePlaylistFolderOpen}
        setDeleteMultiplePlaylistFolderOpen={
          setDeleteMultiplePlaylistFolderOpen
        }
        setFolderSelectAll={setFolderSelectAll}
        multipleFolderPlaylistMoveDetails={multipleFolderPlaylistMoveDetails}
        setMultipleFolderPlaylistMoveDetails={
          setMultipleFolderPlaylistMoveDetails
        }
        dashboardMoveButton={true}
        setCheckedItems={setCheckedItems}
        setFolderCheckedItems={setFolderCheckedItems}
      /> */}

      <PlaylistSearch
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        createPlaylistFolderOpen={createPlaylistFolderOpen}
        setCreatePlaylistFolderOpen={setCreatePlaylistFolderOpen}
        getPlaylistFolderData={() => getPlaylistFolderData()}
        handleSortOptionClick={handleSortOptionClick as any}
        playlistFolderDetails={() => {}}
        playlistMove={playlistMove}
        setPlaylistMove={setPlaylistMove}
        playlistMoveOpen={playlistMoveOpen}
        setPlaylistMoveOpen={setPlaylistMoveOpen}
        playlistMoveValue={playlistMoveValue}
        setPlaylistMoveValue={setPlaylistMoveValue}
        multiplePlaylistMoveDetails={multiplePlaylistMoveDetails}
        setMultiplePlaylistMoveDetails={setMultiplePlaylistMoveDetails}
        multipleFolderPlaylistMoveDetails={multipleFolderPlaylistMoveDetails}
        setMultipleFolderPlaylistMoveDetails={
          setMultipleFolderPlaylistMoveDetails
        }
        setMultiplePlaylistMoveFolder={setMultiplePlaylistMoveFolder}
        playlistData={getData}
        setSelectAll={setSelectAll}
        setFolderSelectAll={setFolderSelectAll}
        deleteMultiplePlaylistFolder={deleteMultiplePlaylistFolder}
        setDeleteMultiplePlaylistFolder={setDeleteMultiplePlaylistFolder}
        dashboardMoveButton={true}
        playlistFolder={true}
        playlistTypeFetch={playlistTypeFetch}
        setPlaylistTypeFetch={setPlaylistTypeFetch}
        deleteMultiplePlaylist={deleteMultiplePlaylist}
        setDeleteMultiplePlaylist={setDeleteMultiplePlaylist}
        deleteMultiplePlaylistOpen={deleteMultiplePlaylistOpen}
        setDeleteMultiplePlaylistOpen={setDeleteMultiplePlaylistOpen}
        setCheckedItems={setCheckedItems}
        setFolderCheckedItems={setFolderCheckedItems}
        deleteMultiplePlaylistFolderOpen={deleteMultiplePlaylistFolderOpen}
        setDeleteMultiplePlaylistFolderOpen={
          setDeleteMultiplePlaylistFolderOpen
        }
        listViewShow={listViewShow}
        setListViewShow={setListViewShow}
        //  handleDeletePlaylist = {() => handleDeletePlaylist()}
        //  handleDeletePlaylistFolder = {() => handleDeletePlaylistFolder()}
      />

      <div className="w-full p-4 pt-0">
        <div className="w-full">
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full space-y-0"
          >
            <div className="flex items-center justify-between space-x-4">
              <h4 className="text-base font-bold text-primary_color">
                Playlist
              </h4>
              <div className="flex flex-row align-middle">
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
                        filteredPlaylist.length === 0
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
                <table className="text-center border border-gray-300 w-full mt-5">
                  {/* Added border class */}
                  <thead className="bg-gray-200 h-[45px]">
                    {/* Added background color */}
                    <tr>
                      <th className="w-[50%] text-left pl-5 border border-gray-300">
                        {/* Added border */}
                        Name
                      </th>
                      <th className="w-[25%] border border-gray-300">
                        {/* Added border */}
                        Created On
                      </th>
                      <th className="w-[25%] border border-gray-300"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlaylist.filter(
                      (preview) => preview.folder_name === null
                    ).length > 0 ? (
                      filteredPlaylist.map(
                        (screenData: any) =>
                          screenData.folder_name === null && (
                            <tr
                              key={screenData.id}
                              className="border border-gray-300"
                            >
                              {/* Added border */}
                              <td className="w-[50%] border border-gray-300">
                                {/* Added border */}
                                <div className="parent_wrapper">
                                  <Input
                                    type="checkbox"
                                    className="image_checkbox_playlist_listview"
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
                                      handlePlaylistData(screenData)
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
                                        {screenData.playlistName.length > 25
                                          ? `${screenData.playlistName.slice(
                                              0,
                                              28
                                            )}...`
                                          : screenData.playlistName}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="w-[25%] border border-gray-300">
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
                              <td className="w-[25%] border border-gray-300"></td>
                            </tr>
                          )
                      )
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-4">
                          <p className="text-base font-medium text-secondary_color">
                            No playlist found
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : playlistLoading ? (
                // <LoaderCircle
                //   size={20}
                //   className="text-button_orange animate-spin mt-3"
                // />
                <DefaultSkeleton />
              ) : (
                <div className="w-full mt-4">
                  {filteredPlaylist.filter(
                    (preview) => preview.folder_name === null
                  ).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {filteredPlaylist.map(
                        (playlistData: any) =>
                          playlistData.folder_name === null && (
                            <div
                              className="parent_wrapper -mt-4"
                              key={playlistData.id}
                            >
                              <Input
                                type="checkbox"
                                className="image_checkbox_playlist"
                                value={playlistData.id}
                                id={playlistData.id}
                                onChange={(e) =>
                                  handleCheckboxChange(e, playlistData.id)
                                }
                                checked={checkedItems.includes(playlistData.id)}
                              />
                              <div
                                key={playlistData.id}
                                className={`h-14 w-56 bg-zinc-50 border border-border_gray rounded px-3 py-2 cursor-pointer screen_wrapper ${
                                  checkedItems.includes(playlistData.id)
                                    ? "border-[#FF7C44]"
                                    : ""
                                }`}
                                style={
                                  addLoader.includes(playlistData.id)
                                    ? { pointerEvents: "none" }
                                    : {}
                                }
                                onClick={() => handlePlaylistData(playlistData)}
                              >
                                <div className="flex items-center gap-1">
                                  {addLoader.includes(playlistData.id) ? (
                                    <svg
                                      className="animate-spin h-5 w-5"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      key={playlistData.id}
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
                                    <ListVideo size={20} />
                                  )}

                                  <div>
                                    <p className="text-sm font-medium text-primary_color">
                                      {playlistData.playlistName.length > 12
                                        ? `${playlistData.playlistName.slice(
                                            0,
                                            18
                                          )}...`
                                        : playlistData.playlistName}
                                    </p>
                                    <p className="text-xs font-normal text-secondary_color mt-1 flex items-center gap-2">
                                      {playlistData.time}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  ) : (
                    <div className="w-full flex justify-center items-center">
                      <p className="text-base font-medium text-secondary_color mt-5">
                        No playlist found
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
            open={folderOpen}
            onOpenChange={setFolderOpen}
            className="w-full space-y-2"
          >
            <div className="flex items-center justify-between space-x-4 mt-2">
              <h4 className="text-base font-bold text-primary_color">
                Folders
              </h4>
              <div className="flex flex-row align-middle">
                <div className="flex flex-row justify-end items-center">
                  {/* {deleteMultiplePlaylistFolder && (
                    <TooltipProvider>
                      <Tooltip>
                        <Dialog
                          open={deleteMultiplePlaylistFolderOpen}
                          onOpenChange={setDeleteMultiplePlaylistFolderOpen}
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
                                onClick={handleDeletePlaylistFolder}
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
                  )} */}
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
                        filteredPlaylistFolder.length === 0
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
                <table className="text-center border border-gray-300 w-full mt-5">
                  {" "}
                  {/* Added border class */}
                  <thead className="bg-gray-200 h-[45px]">
                    {" "}
                    {/* Added background color */}
                    <tr>
                      <th className="w-[50%] text-left pl-5 border border-gray-300">
                        {" "}
                        {/* Added border */}
                        Name
                      </th>
                      <th className="w-[25%] border border-gray-300">
                        {" "}
                        {/* Added border */}
                        Created On
                      </th>
                      <th className="w-[25%] border border-gray-300">
                        {" "}
                        {/* Added border */}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlaylistFolder.length > 0 ? (
                      filteredPlaylistFolder.map((screenData: any) => (
                        // screenData.folder_id === null &&
                        <tr
                          key={screenData.id}
                          className="border border-gray-300"
                        >
                          {" "}
                          {/* Added border */}
                          <td className="w-[50%] border border-gray-300">
                            {" "}
                            {/* Added border */}
                            <div className="parent_wrapper">
                              <Input
                                type="checkbox"
                                className="image_checkbox_playlist_listview"
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
                                onClick={() => handleFolderDetails(screenData)}
                                className={`mt-[-5px] pb-[10px] bg-none cursor-pointer screen_wrapper flex items-center gap-1.5 
                                        
                                      `}
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
                                    {screenData.name.length > 25
                                      ? `${screenData.name.slice(0, 28)}...`
                                      : screenData.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="w-[25%] border border-gray-300">
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
                          <td className="w-[25%] border border-gray-300">
                            {" "}
                            {/* Added border */}
                            <p className="text-sm font-medium truncate">
                              {screenData.status}
                            </p>
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
                  {playlistFolderLoading ? (
                    // <LoaderCircle
                    //   size={20}
                    //   className="text-button_orange animate-spin mt-3"
                    // />
                    <div className="flex flex-wrap items-center">
                      <DefaultSkeleton />
                    </div>
                  ) : (
                    <div className="w-full">
                      {filteredPlaylistFolder.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {filteredPlaylistFolder.map((folder: any) => (
                            <div
                              key={folder.id}
                              className="parent_wrapper -mt-4"
                            >
                              <Input
                                type="checkbox"
                                className="image_checkbox_playlist"
                                value={folder.id}
                                id={folder.id}
                                onChange={(e) =>
                                  handleFolderCheckboxChange(e, folder.id)
                                }
                                checked={folderCheckedItems.includes(folder.id)}
                              />
                              <div
                                key={folder.id}
                                onClick={() => handleFolderDetails(folder)}
                                className={`h-14 w-56 bg-zinc-50  border border-border_gray rounded px-3 py-2 cursor-pointer flex items-center gap-1.5`}
                                style={
                                  folderLoader.includes(folder.id)
                                    ? { pointerEvents: "none" }
                                    : {}
                                }
                              >
                                {folderLoader.includes(folder.id) ? (
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
                                    className={`text-xs font-normal text-secondary_color mt-1 flex items-center gap-2`}
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
                          <p className="text-base font-medium text-secondary_color mt-0">
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
    </>
  );
};

export default Playlist;
