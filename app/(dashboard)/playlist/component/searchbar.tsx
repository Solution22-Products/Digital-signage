import GlobalSearchBar from "@/components/global-searchbar";
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
  Check,
  ChevronsUpDown,
  Ellipsis,
  FolderPlus,
  FolderSymlink,
  GalleryThumbnails,
  List,
  ListPlus,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface Props {
  searchValue: string | null;
  setSearchValue: (value: string) => void;
  createPlaylistFolderOpen?: boolean;
  setCreatePlaylistFolderOpen?: (open: boolean) => void;
  getPlaylistFolderData: () => void;
  handleSortOptionClick: (option: string) => void;
  playlistMove?: boolean;
  setPlaylistMove?: (move: boolean) => void;
  playlistMoveOpen?: boolean;
  setPlaylistMoveOpen?: (open: boolean) => void;
  playlistMoveValue?: string | null;
  setPlaylistMoveValue?: (value: string | null) => void;
  multiplePlaylistMoveDetails?: any;
  setMultiplePlaylistMoveDetails?: any;
  multipleFolderPlaylistMoveDetails?: any;
  setMultipleFolderPlaylistMoveDetails?: any;
  setMultiplePlaylistMoveFolder?: (folder: string | null) => void;
  playlistData?: any;
  setSelectAll?: (value: boolean) => void;
  setFolderSelectAll?: (value: boolean) => void;
  deleteMultiplePlaylistFolder?: boolean;
  setDeleteMultiplePlaylistFolder?: (deletePlaylistFolder: boolean) => void;
  dashboardMoveButton?: boolean;
  playlistFolder?: boolean;
  playlistTypeFetch: any;
  setPlaylistTypeFetch?: (value: any) => void;
  playlistFolderDetails: () => void;
  deleteMultiplePlaylist?: boolean;
  setDeleteMultiplePlaylist?: (deletePlaylist: boolean) => void;
  deleteMultiplePlaylistOpen?: boolean;
  setDeleteMultiplePlaylistOpen?: (open: boolean) => void;
  setCheckedItems: any;
  setFolderCheckedItems?: any;
  deleteMultiplePlaylistFolderOpen?: boolean;
  setDeleteMultiplePlaylistFolderOpen?: (open: boolean) => void;
  listViewShow?: boolean;
  setListViewShow?: any;
  // handleDeletePlaylist: () => void;
  // handleDeletePlaylistFolder: () => void;
}

interface contentItems {
  name: string;
  id: string;
}

const PlaylistSearch: React.FC<Props> = ({
  searchValue,
  setSearchValue,
  createPlaylistFolderOpen,
  setCreatePlaylistFolderOpen,
  getPlaylistFolderData,
  handleSortOptionClick,
  playlistMove,
  setPlaylistMove,
  playlistMoveOpen,
  setPlaylistMoveOpen,
  playlistMoveValue,
  setPlaylistMoveValue,
  multiplePlaylistMoveDetails,
  setMultiplePlaylistMoveDetails,
  multipleFolderPlaylistMoveDetails,
  setMultipleFolderPlaylistMoveDetails,
  setMultiplePlaylistMoveFolder,
  playlistData,
  setDeleteMultiplePlaylist,
  setSelectAll,
  setFolderSelectAll,
  deleteMultiplePlaylistFolder,
  setDeleteMultiplePlaylistFolder,
  dashboardMoveButton,
  playlistFolder,
  playlistTypeFetch,
  setPlaylistTypeFetch,
  playlistFolderDetails,
  deleteMultiplePlaylist,
  deleteMultiplePlaylistOpen,
  setDeleteMultiplePlaylistOpen,
  setCheckedItems,
  setFolderCheckedItems,
  deleteMultiplePlaylistFolderOpen,
  setDeleteMultiplePlaylistFolderOpen,
  listViewShow,
  setListViewShow,
  // handleDeletePlaylist,
  // handleDeletePlaylistFolder,
}) => {
  const [addLoader, setAddLoader] = useState(false);
  const [playlistLoader, setPlaylistLoader] = useState(false);
  const [folderError, setFolderError] = useState(false);
  const [playlistFolderNameInput, setPlaylistFolderNameInput] = useState("");
  const [signedInUserId, setSignedInUserId] = useState<string | null>("");
  const [playlistFolderError, setPlaylistFolderError] = useState(false);
  const [playlistSelectMoveOpen, setPlaylistSelectMoveOpen] = useState(false);
  const [playlistSelectError, setPlaylistSelectError] = useState(false);
  // const [playlistTypeFetch, setPlaylistTypeFetch] = useState<contentItems[]>(
  //   []
  // );
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState("");
  const [moveScreenLoader, setMoveScreenLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);

  const router = useRouter();

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

  const handleCreatePlaylistFolder = async () => {
    const newErrors = { name: !playlistFolderNameInput };
    setFolderError(newErrors.name);
    if (!newErrors.name) {
      setAddLoader(true);
      const currentTime = formatTime12Hour(new Date());
      const { data: existDatap, error: existErrorp } = await supabase
        .from("folders")
        .select("*")
        .eq("folder_type", "playlist")
        .eq("name", playlistFolderNameInput)
        .eq("is_deleted", 0)
        .eq("userId", signedInUserId)
        .single();
      if (existDatap) {
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
          name: playlistFolderNameInput,
          time: currentTime,
          folder_type: "playlist",
          userId: signedInUserId,
        })
        .select()
        .single();
      if (error) {
        console.error("Error creating folder:", error);
        setAddLoader(false);
      } else {
        //notify("Playlist Folder created successfully", true);
        toast({
          title: "Created Successfully!.",
          description: "Playlist Folder has created successfully!",
          action: <ToastAction altText="Ok">Ok</ToastAction>,
        });
        setPlaylistFolderNameInput("");
        setCreatePlaylistFolderOpen?.(false);
        setAddLoader(false);
        getPlaylistFolderData();
        playlistFolderDetails();
      }
    }
  };

  // const fetchPlaylistFolderData = async () => {
  //   const user = await getUserData();
  //   const userId = user?.id;
  //   if (!userId) {
  //     console.error("signedInUserId is invalid.");
  //     return;
  //   }
  //   const { data, error } = await supabase
  //     .from("folders")
  //     .select("*")
  //     .eq("is_deleted", 0)
  //     .eq("folder_type", "playlist")
  //     .eq("userId", userId);
  //   if (error) {
  //     console.error("Error fetching data:", error);
  //   } else {
  //     setPlaylistTypeFetch(data);
  //   }
  // };

  const filteredPlaylistFolder =
    playlistTypeFetch &&
    playlistTypeFetch.filter((playlist: any) =>
      playlist.name.toLowerCase().includes(playlistSearchQuery.toLowerCase())
    );

  const handlePlaylistMove = async () => {
    // Check if the playlistMoveValue is defined
    if (!playlistMoveValue) {
      setPlaylistSelectError(true);
      setAddLoader(false);
      return;
    }

    try {
      setAddLoader(true);
      // Fetch playlist details using the ids from multiplePlaylistMoveDetails
      const { data, error } = await supabase
        .from("playlistDetails")
        .select("*")
        .in(
          "id",
          multiplePlaylistMoveDetails.map((item: any) => item)
        ); // Use 'in' instead of 'eq' for multiple ids

      if (error) {
        setAddLoader(false);
        throw error;
      }

      // Create an array of promises to update each playlist's folder_id
      const updatePromises = multiplePlaylistMoveDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("playlistDetails")
            .update({ folder_name: playlistMoveValue })
            .eq("id", item);

          if (error) {
            setAddLoader(false);
            throw error;
          }
          return data;
        }
      );

      // Await the completion of all update promises
      await Promise.all(updatePromises);

      // Refresh the playlist data if the playlistData function is defined
      if (playlistData) {
        playlistData();
      }
      //notify("Playlist moved successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Playlist moved successfully!",
      });
      // Close the playlist move modal and reset relevant states
      setPlaylistMoveOpen?.(false);
      setPlaylistMove?.(false);
      setDeleteMultiplePlaylist?.(false);
      setSelectAll?.(false);
      setDeleteMultiplePlaylistFolder?.(false);
      setAddLoader(false);
      setPlaylistMoveValue?.("");
      setPlaylistSelectError(false);
      // Redirect to the playlist page
      router.push("/playlist");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleMovePlaylistToDashboard = async () => {
    try {
      setMoveScreenLoader(true);
      // Fetch playlist details using the ids from multiplePlaylistMoveDetails
      const { data, error } = await supabase
        .from("playlistDetails")
        .select("*")
        .in(
          "id",
          multiplePlaylistMoveDetails.map((item: any) => item)
        );

      if (error) {
        setMoveScreenLoader(false);
        throw error;
      }

      const updatePromises = multiplePlaylistMoveDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("playlistDetails")
            .update({ folder_name: null })
            .eq("id", item);

          if (error) {
            setMoveScreenLoader(false);
            throw error;
          }
          return data;
        }
      );

      // Await the completion of all update promises
      await Promise.all(updatePromises);

      // Refresh the playlist data if the playlistData function is defined
      if (playlistData) {
        playlistData();
      }
      //notify("Playlist moved to dashboard successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Playlist moved to dashboard successfully!",
      });
      getPlaylistFolderData();
      playlistFolderDetails();
      // Close the playlist move modal and reset relevant states
      setPlaylistMoveOpen?.(false);
      setPlaylistMove?.(false);
      setDeleteMultiplePlaylist?.(false);
      setSelectAll?.(false);
      setMoveScreenLoader(false);
      setPlaylistMoveValue?.("");
      setPlaylistSelectError(false);
    } catch (error) {
      console.error("Error:", error);
      setMoveScreenLoader(false);
    }
  };

  // useEffect(() => {
  //   fetchPlaylistFolderData();
  // }, []);

  const handleDeletePlaylistNew = async () => {
    try {
      setDeleteLoader(true);

      // Helper function to update 'is_deleted' for multiple entries
      const updateIsDeleted = async (
        table: string,
        column: string,
        values: any[]
      ) => {
        const { error } = await supabase
          .from(table)
          .update({ is_deleted: 1 })
          .in(column, values);

        if (error) throw error;
      };

      // Run delete operations for playlists and related entries simultaneously
      await Promise.all([
        // Update 'is_deleted' for playlist-related entries in 'screenDetails'
        updateIsDeleted(
          "screenDetails",
          "playlist",
          multiplePlaylistMoveDetails.map((item: any) => item)
        ),

        // Update 'is_deleted' for playlist-related entries in 'content'
        updateIsDeleted(
          "content",
          "selected_playlist_id",
          multiplePlaylistMoveDetails.map((item: any) => item)
        ),

        // Update 'is_deleted' for playlists in 'playlistDetails'
        updateIsDeleted(
          "playlistDetails",
          "id",
          multiplePlaylistMoveDetails.map((item: any) => item)
        ),

        // Update 'is_deleted' for playlist entries in 'playlistDetails' by folder
        updateIsDeleted(
          "playlistDetails",
          "folder_name",
          multipleFolderPlaylistMoveDetails.map((item: any) => item)
        ),

        // Update 'is_deleted' for folders in 'folders'
        updateIsDeleted(
          "folders",
          "id",
          multipleFolderPlaylistMoveDetails.map((item: any) => item)
        ),
      ]);

      // Refresh playlist and folder data if necessary
      playlistData?.();
      getPlaylistFolderData?.();

      // Notify success
      toast({
        title: "Updated Successfully!",
        description: "Playlist and folder have been deleted successfully!",
        action: (
          <ToastAction altText="Undo" onClick={() => CommonUndo()}>
            Undo
          </ToastAction>
        ),
      });

      // Reset states and close modals
      setDeleteMultiplePlaylistFolder?.(false);
      setDeleteMultiplePlaylistOpen?.(false);
      setFolderSelectAll?.(false);
      setMultiplePlaylistMoveDetails([]);
      setMultipleFolderPlaylistMoveDetails([]);
      setPlaylistMoveOpen?.(false);
      setPlaylistMoveValue?.("");
      setDeleteLoader(false);
      setSelectAll?.(false);
      setPlaylistMove?.(false);
    } catch (error) {
      console.error("Error:", error);
      setDeleteLoader(false); // Reset loader in case of error
    }
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
      if (playlistData) {
        playlistData();
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
      getPlaylistFolderData();
      playlistFolderDetails();
      setSelectAll?.(false);
      setPlaylistMove?.(false);
      setMultiplePlaylistMoveDetails([]);
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
      if (playlistData) {
        playlistData();
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
      getPlaylistFolderData();
      playlistFolderDetails();
      setSelectAll?.(false);
      setPlaylistMove?.(false);
      setCheckedItems([]);
      setMultiplePlaylistMoveDetails([]);
    } catch (error) {
      console.error("Error:", error);
      setDeleteLoader(false);
    }
  };

  const CommonUndo = async () => {
    try {
      // Create a reusable function to update `is_deleted` for multiple entries
      const updateIsDeleted = async (
        table: string,
        column: string,
        values: any[]
      ) => {
        const { error } = await supabase
          .from(table)
          .update({ is_deleted: 0 })
          .in(column, values);

        if (error) throw error;
      };

      // Run undo operations for playlists and folders simultaneously
      await Promise.all([
        // Undo `is_deleted` for `playlistDetails`
        updateIsDeleted("playlistDetails", "id", multiplePlaylistMoveDetails),

        // Undo `is_deleted` for `screenDetails` and `content` related to playlists
        updateIsDeleted(
          "screenDetails",
          "playlist",
          multiplePlaylistMoveDetails
        ),
        updateIsDeleted(
          "content",
          "selected_playlist_id",
          multiplePlaylistMoveDetails
        ),

        // Undo `is_deleted` for folders and playlists within folders
        updateIsDeleted(
          "playlistDetails",
          "folder_name",
          multipleFolderPlaylistMoveDetails
        ),
        updateIsDeleted("folders", "id", multipleFolderPlaylistMoveDetails),
      ]);

      // Refresh playlist and folder data if necessary
      playlistData?.();
      getPlaylistFolderData?.();

      // Notify success
      toast({
        title: "Updated Successfully!",
        description: "Playlist and folder have been recovered successfully!",
      });

      // Reset states and close modals
      setDeleteMultiplePlaylistFolder?.(false);
      setDeleteMultiplePlaylistOpen?.(false);
      setFolderSelectAll?.(false);
      setMultiplePlaylistMoveDetails([]);
      setMultipleFolderPlaylistMoveDetails([]);
      setFolderCheckedItems([]);
      setCheckedItems([]);
      setPlaylistMoveOpen?.(false);
      setPlaylistMoveValue?.("");
      setDeleteLoader(false);
      setSelectAll?.(false);
      setPlaylistMove?.(false);
    } catch (error) {
      console.error("Error during undo operation:", error);
      setDeleteLoader(false); // Reset the loader in case of error
    }
  };

  // const handleDeletePlaylistFolderNew = async () => {
  //   try {
  //     setDeleteLoader(true);
  //     const { data, error } = await supabase
  //       .from("folders")
  //       .select("*")
  //       .in(
  //         "id",
  //         multipleFolderPlaylistMoveDetails.map((item: any) => item)
  //       );

  //     if (error) {
  //       setDeleteLoader(false);
  //       throw error;
  //     }

  //     const deletePromises = multipleFolderPlaylistMoveDetails.map(
  //       async (item: any) => {
  //         const { data, error } = await supabase
  //           .from("playlistDetails")
  //           //.delete()
  //           .update({ is_deleted: 1 })
  //           .eq("folder_name", item);

  //         if (error) {
  //           setDeleteLoader(false);
  //           throw error;
  //         }
  //         return data;
  //       }
  //     );

  //     await Promise.all(deletePromises);

  //     const { error: folderDeleteError } = await supabase
  //       .from("folders")
  //       //.delete()
  //       .update({ is_deleted: 1 })
  //       .in(
  //         "id",
  //         multipleFolderPlaylistMoveDetails.map((item: any) => item)
  //       );

  //     if (folderDeleteError) {
  //       setDeleteLoader(false);
  //       throw folderDeleteError;
  //     }

  //     setDeleteMultiplePlaylistFolder?.(false);
  //     setDeleteMultiplePlaylistOpen?.(false);
  //     setDeleteLoader(false);
  //     setFolderSelectAll?.(false);
  //     getPlaylistFolderData();
  //     //notify("Folders deleted successfully", true);
  //     toast({
  //       title: "Updated Successfully!.",
  //       description: "Folders has deleted successfully!",
  //       action: (
  //         <ToastAction altText="Undo" onClick={() => CommonUndo()}>
  //           Undo
  //         </ToastAction>
  //       ),
  //     });
  //   } catch (error) {
  //     console.error("Error deleting folders and related content:", error);
  //     //notify("Failed to delete folders", false);
  //     toast({
  //       title: "Updated UnSuccessfully!.",
  //       description: "Failed to delete folders!",
  //     });
  //     setDeleteLoader(false);
  //   }
  // };

  const handleDeletePlaylistFolder = async () => {
    try {
      setDeleteLoader(true);
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .in(
          "id",
          multipleFolderPlaylistMoveDetails.map((item: any) => item)
        );

      if (error) {
        setDeleteLoader(false);
        throw error;
      }

      const deletePromises = multipleFolderPlaylistMoveDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("playlistDetails")
            //.delete()
            .update({ is_deleted: 1 })
            .eq("folder_name", item);

          if (error) {
            setDeleteLoader(false);
            throw error;
          }
          return data;
        }
      );

      await Promise.all(deletePromises);

      const { error: folderDeleteError } = await supabase
        .from("folders")
        //.delete()
        .update({ is_deleted: 1 })
        .in(
          "id",
          multipleFolderPlaylistMoveDetails.map((item: any) => item)
        );

      if (folderDeleteError) {
        setDeleteLoader(false);
        throw folderDeleteError;
      }

      setDeleteMultiplePlaylistFolder?.(false);
      setDeleteMultiplePlaylistOpen?.(false);
      setDeleteLoader(false);
      setFolderSelectAll?.(false);
      getPlaylistFolderData();
      //notify("Folders deleted successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Folders has deleted successfully!",
        action: (
          <ToastAction
            altText="Undo"
            onClick={() => handleDeletePlaylistFolderUndo()}
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
  const handleDeletePlaylistFolderUndo = async () => {
    try {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .in(
          "id",
          multipleFolderPlaylistMoveDetails.map((item: any) => item)
        );

      if (error) {
        throw error;
      }

      const deletePromises = multipleFolderPlaylistMoveDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("playlistDetails")
            //.delete()
            .update({ is_deleted: 0 })
            .eq("folder_name", item);

          if (error) {
            throw error;
          }
          return data;
        }
      );

      await Promise.all(deletePromises);

      const { error: folderDeleteError } = await supabase
        .from("folders")
        //.delete()
        .update({ is_deleted: 0 })
        .in(
          "id",
          multipleFolderPlaylistMoveDetails.map((item: any) => item)
        );

      if (folderDeleteError) {
        throw folderDeleteError;
      }

      setDeleteMultiplePlaylistFolder?.(false);
      setDeleteMultiplePlaylistOpen?.(false);
      setFolderSelectAll?.(false);
      getPlaylistFolderData();
      setMultipleFolderPlaylistMoveDetails([]);
      setFolderCheckedItems([]);
      //notify("Folders deleted successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Folder has recovered successfully!",
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

  const handleDeletePlaylist1 = () => {
    const caseValue = `${
      multipleFolderPlaylistMoveDetails.length > 0 ? "folder" : ""
    }${multiplePlaylistMoveDetails.length > 0 ? "content" : ""}`;

    switch (caseValue) {
      case "foldercontent": // Both folder and content
        handleDeletePlaylistNew();
        break;

      case "content": // Only content
        handleDeletePlaylist();
        break;

      case "folder": // Only folder
        handleDeletePlaylistFolder();
        break;

      default:
        console.log("No playlist or folder details to delete");
    }
  };

  useEffect(() => {
    const userName = async () => {
      const user = await getUserData();
      setSignedInUserId(user?.id || null);
      return user;
    };
    userName();
  }, [signedInUserId]);

  return (
    <>
      <div className="w-full flex justify-between gap-2 p-4">
        <Toaster />
        <GlobalSearchBar
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
        <ul className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <li
                  className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out w-[44px] h-[40px] mb-3 hover:bg-button_orange hover:text-white"
                  onClick={() => {
                    setPlaylistLoader(true);
                    setTimeout(() => {
                      router.push("/playlist-details");
                      setPlaylistLoader(false);
                    }, 1000);
                  }}
                  style={
                    playlistLoader
                      ? { pointerEvents: "none", opacity: 0.6 }
                      : {}
                  }
                >
                  {playlistLoader ? (
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
                        className="opacity-75"
                        fill="#FF7C44"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <ListPlus size={20} />
                  )}
                </li>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="-mt-3">
                <p>Add Playlist</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {playlistFolder && (
            <TooltipProvider>
              <Tooltip>
                <Dialog
                  open={createPlaylistFolderOpen}
                  onOpenChange={setCreatePlaylistFolderOpen}
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
                          value={playlistFolderNameInput}
                          onChange={(e) => {
                            setPlaylistFolderNameInput(e.target.value);
                            if (playlistFolderError) setFolderError(false);
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
                        onClick={handleCreatePlaylistFolder}
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
          )}

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

          {(deleteMultiplePlaylist || deleteMultiplePlaylistFolder) && (
            <TooltipProvider>
              <Tooltip>
                <Dialog
                  open={deleteMultiplePlaylistOpen}
                  onOpenChange={setDeleteMultiplePlaylistOpen}
                >
                  <DialogTrigger asChild>
                    <TooltipTrigger>
                      <div className="py-2.5 mt-[-12px] mb-0 px-3 rounded text-white bg-delete_color cursor-pointer transition-all duration-300 ease-in-out hover:bg-delete_color hover:text-white w-[44px] h-[40px]">
                        <Trash2 size={20} />
                      </div>
                    </TooltipTrigger>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[397px] sm:max-h-[342px]">
                    <DialogHeader className="flex flex-col space-y-0">
                      <DialogTitle className="text-2xl font-semibold">
                        {multipleFolderPlaylistMoveDetails.length > 0 &&
                        multiplePlaylistMoveDetails.length > 0
                          ? "Delete Playlist and Folder"
                          : multipleFolderPlaylistMoveDetails.length > 0
                          ? "Delete Folder"
                          : multiplePlaylistMoveDetails.length > 0
                          ? "Delete Playlist"
                          : null}
                      </DialogTitle>
                      <DialogDescription className="m-0">
                        {multipleFolderPlaylistMoveDetails.length > 0 &&
                        multiplePlaylistMoveDetails.length > 0
                          ? "Are you sure want to delete the playlist and Folder"
                          : multipleFolderPlaylistMoveDetails.length > 0
                          ? "Are you sure want to delete the Folder"
                          : multiplePlaylistMoveDetails.length > 0
                          ? "Are you sure want to delete the Playlist"
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
                        onClick={handleDeletePlaylist1}
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
                    {multipleFolderPlaylistMoveDetails.length > 0 &&
                    multiplePlaylistMoveDetails.length > 0
                      ? "Delete Playlist and Folder"
                      : multipleFolderPlaylistMoveDetails.length > 0
                      ? "Delete Folder"
                      : multiplePlaylistMoveDetails.length > 0
                      ? "Delete Playlist"
                      : null}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

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
                                onClick={handleDeletePlaylist1}
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

          {playlistMove && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <Dialog
                    open={playlistMoveOpen}
                    onOpenChange={setPlaylistMoveOpen}
                  >
                    <DialogTrigger asChild>
                      <TooltipTrigger>
                        <li
                          className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out w-[44px] h-[40px] mb-3 hover:bg-button_orange hover:text-white"
                          onClick={getPlaylistFolderData}
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
                          Move Playlist 1
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-3 pb-2">
                        <div>
                          <Label htmlFor="name" className="text-right mb-5">
                            Folder
                          </Label>
                          <Popover
                            open={playlistSelectMoveOpen}
                            onOpenChange={setPlaylistSelectMoveOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={playlistSelectMoveOpen}
                                className="w-full justify-between mt-1"
                              >
                                {playlistMoveValue
                                  ? playlistTypeFetch.find(
                                      (framework: any) =>
                                        framework.id === playlistMoveValue
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
                                  value={playlistSearchQuery}
                                  className="rounded-none"
                                  onChange={(e: any) =>
                                    setPlaylistSearchQuery(e.target.value)
                                  } // set search query
                                />
                                <CommandList className="max-h-[160px] h-[160px] overflow-y-auto">
                                  {filteredPlaylistFolder.length === 0 ? (
                                    <CommandEmpty className="max-h-[60px] h-[30px] flex justify-center pt-1">
                                      No folders found.
                                    </CommandEmpty>
                                  ) : (
                                    <CommandGroup>
                                      {filteredPlaylistFolder.map(
                                        (framework: any) => (
                                          <CommandItem
                                            key={framework.id}
                                            value={framework.id}
                                            onSelect={(currentValue) => {
                                              if (setPlaylistMoveValue) {
                                                setPlaylistMoveValue(
                                                  currentValue ===
                                                    playlistMoveValue
                                                    ? null
                                                    : currentValue
                                                );
                                              }
                                              setPlaylistSelectMoveOpen(false);
                                              setPlaylistSelectError(false);
                                              // setSelectedValue(currentValue);
                                              if (
                                                setMultiplePlaylistMoveFolder
                                              ) {
                                                setMultiplePlaylistMoveFolder(
                                                  currentValue ===
                                                    playlistMoveValue
                                                    ? null
                                                    : (currentValue as string)
                                                );
                                              }
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                playlistMoveValue ===
                                                  framework.id
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
                          {/* {playlistSelectError && (
                          <p className="text-delete_color text-xs mt-1">
                            Please select a folder
                          </p>
                        )} */}
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
                          onClick={handlePlaylistMove}
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
                        onClick={handleMovePlaylistToDashboard}
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
                          "Move to Playlist Dashboard"
                        )}
                      </Button>
                    </DialogContent>
                  </Dialog>
                  <TooltipContent side="bottom" className="-mt-3 mr-1">
                    <p>Move Playlist</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
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

export default PlaylistSearch;
