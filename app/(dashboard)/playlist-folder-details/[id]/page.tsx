"use client";
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
import { Input } from "@/components/ui/input";
import { supabase } from "@/utils/supabase/supabaseClient";
import {
  CalendarDays,
  ChevronRight,
  Folder,
  ListPlus,
  ListVideo,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import toast, { Toaster } from "react-hot-toast";
import "./style.css";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderSkeleton } from "@/components/skeleton-ui";
import { toast, useToast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import PlaylistSearch from "../../playlist/component/searchbar";

interface Props {
  params: {
    id: string;
  };
}

interface playlistFolderData {
  id: string | null;
  name: string | null;
}

interface PlaylistItem {
  id: string;
  playlistName: string;
  url: string;
  time: string;
  folder_name: string;
  userId: string;
}

const PlaylistFolderDetails = (props: Props) => {
  const [folderName, setFolderName] = useState<string>("");
  const [deleteFolderOpen, setDeleteFolderOpen] = useState(false);
  const [folderedPlaylist, setFolderedPlaylist] = useState<PlaylistItem[]>([]);

  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

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

  const [folderedPlaylistLoading, setFolderedPlaylistLoading] = useState(true);

  const [notFound, setNotFound] = useState(false);
  const [searchValue, setSearchValue] = useState<string | null>("");
  const [sortedValue, setSortedValue] = useState<string | null>("");

  const [selectAll, setSelectAll] = useState(false);
  const [addLoader, setAddLoader] = useState(false);
  const [saveLoader, setSaveLoader] = useState(false);
  const [backLoader, setBackLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [playlistLoader, setPlaylistLoader] = useState<string[]>([]);
  const [playlistTypeFetch, setPlaylistTypeFetch] = useState<
    playlistFolderData[]
  >([]);
  const [listViewShow, setListViewShow] = useState(false);

  const [signedInUserId, setSignedInUserId] = useState<string | null>("");

  const { id } = props.params;
  const router = useRouter();

  // const notify = (message: string) =>
  // toast.success(message, {
  //   style: {
  //     borderRadius: "10px",
  //     background: "#fff",
  //     color: "#000",
  //   },
  //   position: "top-right",
  //   duration: 2000,
  // });

  useEffect(() => {
    // const userName = async () => {
    //   const user = await getUserData();
    //   setSignedInUserId(user?.id || null);
    //   console.log("user id ", user?.id || null);
    //   return user;
    // };
    // userName();
    setSignedInUserId(localStorage.getItem("userId"));
  }, []);

  const getFolderDetails = async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setFolderName(data.name);
      const { data: playlist, error: playlistError } = await supabase
        .from("playlistDetails")
        .select("*")
        .eq("is_deleted", 0)
        .eq("folder_name", id);
      if (playlistError) {
        console.error("Error fetching images:", playlistError);
        setFolderedPlaylistLoading(false);
        setNotFound(false);
      } else {
        setFolderedPlaylist(playlist.sort((a: any, b: any) => a.playlistName.localeCompare(b.playlistName)));
        setFolderedPlaylistLoading(false);
      }
    }
  };

  const getPlaylistFolderData = async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      // .eq("userId", signedInUserId)
      .eq("is_deleted", 0)
      .eq("folder_type", "playlist");
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setPlaylistTypeFetch(data as any);
    }
  };

  const handleFolderUpdate = async () => {
    setSaveLoader(true);
    const { data: existData, error: existError } = await supabase
      .from("folders")
      .select("*")
      .eq("folder_type", "playlist")
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
      setSaveLoader(false);
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
      setSaveLoader(false);
    } else {
      setSaveLoader(false);

      //notify("Folder updated successfully");
      toast({
        title: "Updated Successfully!.",
        description: "Folder has updated successfully!",
        action: <ToastAction altText="Ok">Ok</ToastAction>,
      });
    }
  };

  const handleFolderDelete = async () => {
    try {
      setAddLoader(true);
      const { error: deleteContentError } = await supabase
        .from("content")
        //.delete()
        .update({ is_deleted: 1 })
        .eq("folder_id", id);
      if (deleteContentError) throw deleteContentError;

      const { error: deletePlaylistError } = await supabase
        .from("playlistDetails")
        //.delete()
        .update({ is_deleted: 1 })
        .eq("folder_name", id);
      if (deletePlaylistError) throw deletePlaylistError;

      const { error: deleteFolderError } = await supabase
        .from("folders")
        //.delete()
        .update({ is_deleted: 1 })
        .eq("id", id)
        .single();
      if (deleteFolderError) throw deleteFolderError;
      setDeleteFolderOpen(false);
      setAddLoader(false);
      //notify("Folder deleted successfully");
      //setTimeout(() => router.push("/playlist"), 2000);
      toast({
        title: "Updated Successfully!.",
        description: "Folder has deleted successfully!",
        action: (
          <ToastAction altText="Undo" onClick={() => handleFolderDeleteUndo()}>
            Undo
          </ToastAction>
        ),
      });
      setTimeout(() => router.push("/playlist"), 4000);
    } catch (error) {
      console.error("Error deleting folder and related content:", error);
      setAddLoader(false);
    }
  };

  const handleFolderDeleteUndo = async () => {
    try {
      const { error: deleteContentError } = await supabase
        .from("content")
        //.delete()
        .update({ is_deleted: 0 })
        .eq("folder_id", id);
      if (deleteContentError) throw deleteContentError;

      const { error: deletePlaylistError } = await supabase
        .from("playlistDetails")
        //.delete()
        .update({ is_deleted: 0 })
        .eq("folder_name", id);
      if (deletePlaylistError) throw deletePlaylistError;

      const { error: deleteFolderError } = await supabase
        .from("folders")
        //.delete()
        .update({ is_deleted: 0 })
        .eq("id", id)
        .single();
      if (deleteFolderError) throw deleteFolderError;

      toast({
        title: "Updated Successfully!.",
        description: "Folder has recovered successfully!",
      });
    } catch (error) {
      console.error("Error deleting folder and related content:", error);
    }
  };

  const handlePlaylistData = (playlistData: PlaylistItem) => {
    if (checked) {
      return; // Stop redirection if the checkbox is checked
    }
    setPlaylistLoader((prev: any) => [...prev, playlistData.id]);
    (prev: any) => prev.filter((id: any) => id !== playlistData.id);

    router.push(`/playlist-edit/${playlistData.id}`);
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

  useEffect(() => {
    if (folderedPlaylist.length > 0) {
      // setTimeout(() => {
      setFolderedPlaylistLoading(false);
      // }, 1000);
    } else {
      // setTimeout(() => {
      setFolderedPlaylistLoading(false);
      // setTimeout(() => {
      // setNotFound(true);
      // }, 0);
      // }, 1000);
    }
  }, [folderedPlaylist]);

  useEffect(() => {
    getFolderDetails();
    getPlaylistFolderData();
  }, []);

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
    items: PlaylistItem[],
    sortOrder: string | null,
    key: "playlistName"
  ) => {
    switch (sortOrder) {
      case "asc":
        return [...items].sort((a, b) =>
          a[key as keyof PlaylistItem].localeCompare(
            b[key as keyof PlaylistItem]
          )
        );
      case "desc":
        return [...items].sort((a, b) =>
          b[key as keyof PlaylistItem].localeCompare(
            a[key as keyof PlaylistItem]
          )
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
  const filterFolderedContents = sortItems(
    filterBySearchValue(
      folderedPlaylist,
      "playlistName",
      searchValue as string
    ),
    sortedValue,
    "playlistName"
  );

  const handleSelectAll = () => {
    setSelectAll(!selectAll);

    const applicableContent = filterFolderedContents
      .filter((preview) => preview.folder_name === id)
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

  const handleSortOptionClick = (sortOrder: string) => {
    setSortedValue(sortOrder);
    // setSortDropdownOpen(false);
  };

  const handleDeletePlaylist = async () => {
    try {
      setDeleteLoader(true);
      // Fetch playlist details using the ids from multiplePlaylistMoveDetails
      const { data: playlists, error: fetchError } = await supabase
        .from("playlistDetails")
        .select("*")
        .in(
          "id",
          multiplePlaylistMoveDetails.map((item: any) => item)
        ); // Use 'in' instead of 'eq' for multiple ids

      if (fetchError) {
        setDeleteLoader(false);
        throw fetchError;
      }

      // Create an array of promises to delete related entries in screenDetails
      const deleteScreenDetailsPromises = multiplePlaylistMoveDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("screenDetails")
            // .delete()
            .update({ is_deleted: 1 })
            .eq("playlist", item);

          if (error) {
            setDeleteLoader(false);
            throw error;
          }
          return data;
        }
      );

      // Await the completion of all delete screenDetails promises
      await Promise.all(deleteScreenDetailsPromises);

      const deleteContentPlaylistPromises = multiplePlaylistMoveDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("content")
            // .delete()
            .update({ is_deleted: 1 })
            .eq("selected_playlist_id", item);
          if (error) {
            setDeleteLoader(false);
            throw error;
          }
          return data;
        }
      );

      await Promise.all(deleteContentPlaylistPromises);

      // Create an array of promises to delete each playlist
      const deletePlaylistPromises = multiplePlaylistMoveDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("playlistDetails")
            // .delete()
            .update({ is_deleted: 1 })
            .eq("id", item);

          if (error) {
            setDeleteLoader(false);
            throw error;
          }
          return data;
        }
      );

      // Await the completion of all delete playlist promises
      await Promise.all(deletePlaylistPromises);

      // Refresh the playlist data if the playlistData function is defined
      if (getFolderDetails) {
        getFolderDetails();
      }

      //notify("Playlist deleted successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Playlist has deleted successfully!",
        action: (
          <ToastAction
            altText="Undo"
            onClick={() => handleDeletePlaylistUndo()}
          >
            Undo
          </ToastAction>
        ),
      });
      // Close the playlist move modal and reset relevant states
      setPlaylistMoveOpen?.(false);
      setPlaylistMoveValue?.("");
      setDeleteMultiplePlaylistOpen?.(false);
      setDeleteLoader(false);
      setDeleteMultiplePlaylist?.(false);
      getFolderDetails();
      setSelectAll?.(false);
      setPlaylistMove?.(false);
    } catch (error) {
      console.error("Error:", error);
      setDeleteLoader(false);
    }
  };

  const handleDeletePlaylistUndo = async () => {
    try {
      // Fetch playlist details using the ids from multiplePlaylistMoveDetails
      const { data: playlists, error: fetchError } = await supabase
        .from("playlistDetails")
        .select("*")
        .in(
          "id",
          multiplePlaylistMoveDetails.map((item: any) => item)
        ); // Use 'in' instead of 'eq' for multiple ids

      if (fetchError) {
        throw fetchError;
      }

      // Create an array of promises to delete related entries in screenDetails
      const deleteScreenDetailsPromises = multiplePlaylistMoveDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("screenDetails")
            // .delete()
            .update({ is_deleted: 0 })
            .eq("playlist", item);

          if (error) {
            throw error;
          }
          return data;
        }
      );

      // Await the completion of all delete screenDetails promises
      await Promise.all(deleteScreenDetailsPromises);

      const deleteContentPlaylistPromises = multiplePlaylistMoveDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("content")
            // .delete()
            .update({ is_deleted: 0 })
            .eq("selected_playlist_id", item);
          if (error) {
            throw error;
          }
          return data;
        }
      );

      await Promise.all(deleteContentPlaylistPromises);

      // Create an array of promises to delete each playlist
      const deletePlaylistPromises = multiplePlaylistMoveDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("playlistDetails")
            // .delete()
            .update({ is_deleted: 0 })
            .eq("id", item);

          if (error) {
            throw error;
          }
          return data;
        }
      );

      // Await the completion of all delete playlist promises
      await Promise.all(deletePlaylistPromises);

      // Refresh the playlist data if the playlistData function is defined
      if (getFolderDetails) {
        getFolderDetails();
      }

      //notify("Playlist deleted successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Playlist has recovered successfully!",
      });
      // Close the playlist move modal and reset relevant states
      setPlaylistMoveOpen?.(false);
      setPlaylistMoveValue?.("");
      setDeleteMultiplePlaylistOpen?.(false);
      setDeleteLoader(false);
      setDeleteMultiplePlaylist?.(false);
      getFolderDetails();
      setSelectAll?.(false);
      setPlaylistMove?.(false);
      setCheckedItems([]);
    } catch (error) {
      console.error("Error:", error);
      setDeleteLoader(false);
    }
  };

  return (
    <div
      className="w-full p-0 flex"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      <Toaster />
      <div className="w-full pr-0">
        {/* <SearchBar
          displayplus={<ListPlus size={20} />}
          calendarIcon={<CalendarDays size={20} />}
          calendar={false}
          playlist={true}
          screenData={() => {}}
          handleCancel={() => {}}
          handleMultipleSelectCancel={() => {}}
          playlistMove={playlistMove}
          setPlaylistMove={setPlaylistMove}
          playlistMoveOpen={playlistMoveOpen}
          setPlaylistMoveOpen={setPlaylistMoveOpen}
          playlistMoveValue={playlistMoveValue}
          setSelectAll={setSelectAll}
          setPlaylistMoveValue={setPlaylistMoveValue}
          multiplePlaylistMoveDetails={multiplePlaylistMoveDetails}
          setMultiplePlaylistMoveDetails={setMultiplePlaylistMoveDetails}
          multiplePlaylistMoveFolder={multiplePlaylistMoveFolder}
          setMultiplePlaylistMoveFolder={setMultiplePlaylistMoveFolder}
          deleteMultiplePlaylist={deleteMultiplePlaylist}
          setDeleteMultiplePlaylist={setDeleteMultiplePlaylist}
          deleteMultiplePlaylistOpen={deleteMultiplePlaylistOpen}
          setDeleteMultiplePlaylistOpen={setDeleteMultiplePlaylistOpen}
          searchValue={searchValue}
          setSearchValue={(value: string | null) => setSearchValue(value)}
          handleSortOptionClick={handleSortOptionClick as any}
          contentFolderSort={true}
          filterIcon={false}
          getScreenFolderDetails={() => getFolderDetails()}
          setCheckedItems={setCheckedItems}
        /> */}

        <PlaylistSearch
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          getPlaylistFolderData={() => getPlaylistFolderData()}
          playlistFolderDetails={() => getFolderDetails()}
          handleSortOptionClick={handleSortOptionClick as any}
          playlistMove={playlistMove}
          setPlaylistMove={setPlaylistMove}
          playlistMoveOpen={playlistMoveOpen}
          setPlaylistMoveOpen={setPlaylistMoveOpen}
          playlistMoveValue={playlistMoveValue}
          setPlaylistMoveValue={setPlaylistMoveValue}
          multiplePlaylistMoveDetails={multiplePlaylistMoveDetails}
          setMultiplePlaylistMoveDetails={setMultiplePlaylistMoveDetails}
          multipleFolderPlaylistMoveDetails={""}
          setMultipleFolderPlaylistMoveDetails={""}
          setMultiplePlaylistMoveFolder={setMultiplePlaylistMoveFolder}
          setSelectAll={setSelectAll}
          playlistFolder={false}
          playlistTypeFetch={playlistTypeFetch}
          setPlaylistTypeFetch={setPlaylistTypeFetch}
          deleteMultiplePlaylist={deleteMultiplePlaylist}
          setDeleteMultiplePlaylist={setDeleteMultiplePlaylist}
          deleteMultiplePlaylistOpen={deleteMultiplePlaylistOpen}
          setDeleteMultiplePlaylistOpen={setDeleteMultiplePlaylistOpen}
          setCheckedItems={setCheckedItems}
          listViewShow={listViewShow}
          setListViewShow={setListViewShow}
        />

        <div className="w-full p-4 pt-0">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 mt-0">
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
                    filterFolderedContents.length === 0
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
                {filterFolderedContents.length > 0 ? (
                  filterFolderedContents.map((screenData: any) => (
                    <tr key={screenData.id} className="border border-gray-300">
                      {/* Added border */}
                      <td className="w-[50%] border border-gray-300">
                        {/* Added border */}
                        <div className="parent_wrapper">
                          <Input
                            type="checkbox"
                            className="image_checkbox2_listview"
                            value={screenData.id}
                            id={screenData.id}
                            onChange={(e) =>
                              handleCheckboxChange(e, screenData.id)
                            }
                            checked={checkedItems.includes(screenData.id)}
                          />
                          <div
                            key={screenData.id}
                            onClick={() => handlePlaylistData(screenData)}
                            className={`mt-[-5px] pb-[10px] bg-none cursor-pointer screen_wrapper flex items-center gap-1.5`}
                            style={
                              playlistLoader.includes(screenData.id)
                                ? { pointerEvents: "none" }
                                : {}
                            }
                          >
                            {playlistLoader.includes(screenData.id) ? (
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
                                  ? `${screenData.playlistName.slice(0, 28)}...`
                                  : screenData.playlistName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="w-[25%] border border-gray-300">
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
                      <td className="w-[25%] border border-gray-300"></td>
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
          ) : folderedPlaylistLoading ? (
            <FolderSkeleton />
          ) : (
            <div className="mt-0">
              {filterFolderedContents.length > 0 ? (
                <div className="flex items-center flex-wrap gap-2 w-full mt-2">
                  {filterFolderedContents.map((item) => {
                    const data = {
                      id: item.id,
                      playlistName: item.playlistName,
                      time: item.time,
                    };
                    return (
                      <div className="parent_wrapper -mt-0.5" key={item.id}>
                        <Input
                          type="checkbox"
                          className="image_checkbox2"
                          value={item.id}
                          id={item.id}
                          onChange={(e) => handleCheckboxChange(e, item.id)}
                          checked={checkedItems.includes(item.id)}
                        />
                        <div
                          key={item.id}
                          className={`h-14 w-56 bg-zinc-50 border border-border_gray rounded px-3 py-2 cursor-pointer screen_wrapper ${
                            checkedItems.includes(item.id)
                              ? "border-[#FF7C44]"
                              : ""
                          }`}
                          style={
                            playlistLoader.includes(item.id)
                              ? { pointerEvents: "none" }
                              : {}
                          }
                          onClick={() => handlePlaylistData(item)}
                        >
                          <div className="flex items-center gap-1">
                            {playlistLoader.includes(item.id) ? (
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
                              <ListVideo size={20} />
                            )}

                            <div>
                              <p className="text-sm font-medium text-primary_color">
                                {item.playlistName.length > 12
                                  ? `${item.playlistName.slice(0, 18)}...`
                                  : item.playlistName}
                              </p>
                              <p className="text-xs font-normal text-secondary_color mt-1 flex items-center gap-2">
                                {item.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-base font-medium text-secondary_color mt-3 w-full h-[55vh] flex items-center justify-center">
                  No playlist found
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
            onClick={() => handleFolderUpdate()}
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
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistFolderDetails;
