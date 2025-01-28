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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlignJustify,
  Check,
  CheckCircle,
  ChevronRight,
  ChevronsUpDown,
  CircleAlert,
  CirclePlus,
  CircleX,
  Folder,
  ScanEye,
  Search,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Tag } from "emblor";
import AddTag from "@/components/add-tag";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
// import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast, useToast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

interface Props {
  params: {
    id: string;
  };
}
interface contentItems {
  name: string;
  id: string;
}

const PlaylistEdit = (props: Props) => {
  const { id } = props.params;
  const router = useRouter();

  const [openDelete, setOpenDelete] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [existingPlaylist, setExistingPlaylist] = useState([]);
  const [newPlaylistImagesCheck, setNewPlaylistImagesCheck] = useState([]);
  const [changeCheck, setChangeCheck] = useState(false);

  const [contentOpen, setContentOpen] = useState(false);
  const [contentValue, setContentValue] = useState<string | null | "">("");
  const [contentList, setContentList] = useState<contentItems[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>("");

  const [signedInUserId, setSignedInUserId] = useState<string | null>("");
  const [fileManagerContent, setFileManagerContent] = useState<any[]>([]);
  const [fileManagerContentFolder, setFileManagerContentFolder] = useState<
    any[]
  >([]);
  const [fileManagerFolderedContent, setFileManagerFolderedContent] = useState<
    any[]
  >([]);
  const [checkedContents, setCheckedContents] = useState<Set<string>>(
    new Set()
  );
  const [searchValue, setSearchValue] = useState("");
  const [addLoader, setAddLoader] = useState(false);
  const [saveLoader, setSaveLoader] = useState(false);
  const [cancelLoader, setCancelLoader] = useState(false);
  const [folderSearchQuery, setFolderSearchQuery] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [backLoader, setBackLoader] = useState(false);

  const [videoTypes, setVideoTypes] = useState<any>({});
  const [fileManagerVideoTypes, setFileManagerVideoTypes] = useState<any>({});
  const [fetchedContentType, setFetchedContentType] = useState<any>([]);

  const filteredPlaylistFolders = contentList.filter((folder) => {
    return folder.name.toLowerCase().includes(folderSearchQuery.toLowerCase());
  });

  const handleCheck = (id: string, folderContents: string[] = []) => {
    setCheckedContents((prev) => {
      const updatedSet = new Set(prev);

      if (folderContents.length > 0) {
        // If all contents in the folder are checked, uncheck the folder (remove its contents)
        if (folderContents.every((contentId) => updatedSet.has(contentId))) {
          folderContents.forEach((contentId) => updatedSet.delete(contentId));
          updatedSet.delete(id); // Also uncheck the folder itself
        } else {
          // If not all contents are checked, check the folder (add its contents)
          folderContents.forEach((contentId) => updatedSet.add(contentId));
          updatedSet.add(id); // Also check the folder itself
        }
      } else {
        // For individual files
        if (updatedSet.has(id)) {
          updatedSet.delete(id);
        } else {
          updatedSet.add(id);
        }
      }

      return updatedSet;
    });
  };

  const isChecked = (id: string, folderContents: string[] = []) => {
    if (folderContents.length > 0) {
      // If all contents in the folder are checked, consider the folder as checked
      return folderContents.every((contentId) =>
        checkedContents.has(contentId)
      );
    }
    return checkedContents.has(id);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setExistingPlaylist((items: any) => {
        const oldIndex = items.findIndex((item: any) => item.id === active.id);
        const newIndex = items.findIndex((item: any) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

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

  function SortableItem(props: { id: any; children: React.ReactNode }) {
    const { id, children } = props;
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: isDragging ? "grabbing" : "pointer",
    };

    return (
      <TableRow ref={setNodeRef} style={style} {...attributes}>
        {children}
      </TableRow>
    );
  }

  function DragHandle(props: { id: any }) {
    const { listeners, setNodeRef } = useSortable({ id: props.id });

    return (
      <Button
        ref={setNodeRef}
        {...listeners}
        variant={"outline"}
        className="p-2 cursor-move"
      >
        <AlignJustify size={20} />
      </Button>
    );
  }

  const videoContentTypes = ["video/mp4", "video/avi", "video/mkv"];

  const getPlaylistData = async () => {
    const { data, error } = await supabase
      .from("playlistDetails")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching data from playlistDetails:", error);
      return;
    }

    // Set playlist name and existing playlist images
    setPlaylistName(data.playlistName);
    setExistingPlaylist(data.playlistImages || []);
    setNewPlaylistImagesCheck(data.playlistImages || []);

    // Prepare a map to track whether content is video
    const videoTypesMap: { [key: string]: boolean } = {};

    // Iterate over playlist images and determine if they are videos
    const updatedData = data.playlistImages.map((item: any) => {
      const isVideo =
        item.url.endsWith(".mp4") ||
        item.url.endsWith(".avi") ||
        item.url.endsWith(".mov") ||
        item.url.startsWith("video");

      videoTypesMap[item.id] = isVideo; // Store video type for each content
      return {
        ...item,
        isVideo, // Attach video type flag to each item
      };
    });

    // Update videoTypes state to manage disabled input fields for videos
    setFetchedContentType(videoTypesMap);

    return data.playlistImages.length;
  };

  const handleDelete = async () => {
    setAddLoader(true);
    const { data, error } = await supabase
      .from("content")
      // .delete()
      .update({ is_deleted: 1 })
      .eq("selected_playlist_id", id);
    if (error) {
      console.error("Error deleting playlist images:", error);
      setAddLoader(false);
      return;
    }
    const { data: playlistData, error: playlistError } = await supabase
      .from("playlistDetails")
      //.delete()
      .update({ is_deleted: 1 })
      .eq("id", id)
      .single();
    if (playlistError) {
      console.error("Error deleting playlist:", playlistError);
      setAddLoader(false);
    } else {
      setOpenDelete(false);
      setAddLoader(false);
      //router.push("/playlist");
      toast({
        title: "Updated Successfully!.",
        description: "Playlist has deleted successfully!",
        action: (
          <ToastAction altText="Undo" onClick={() => handleDeleteUndo()}>
            Undo
          </ToastAction>
        ),
      });
      setTimeout(() => router.push("/playlist"), 4000);
    }
  };

  const handleDeleteUndo = async () => {
    const { data, error } = await supabase
      .from("content")
      .update({ is_deleted: 0 })
      .eq("selected_playlist_id", id);
    if (error) {
      console.error("Error deleting playlist images:", error);
      return;
    }
    const { data: playlistData, error: playlistError } = await supabase
      .from("playlistDetails")
      .update({ is_deleted: 0 })
      .eq("id", id)
      .single();
    if (playlistError) {
      console.error("Error deleting playlist:", playlistError);
    } else {
      //router.push("/playlist");
      toast({
        title: "Updated Successfully!.",
        description: "Playlist has recovered successfully!",
      });
    }
  };

  const handlePreviewImages = () => {
    window.open(`/preview/${id}`, "_blank");
  };

  const handleFileChange = (event: any) => {
    const validExtensions = ["jpg", "jpeg", "png", "mp4"]; // Allowed file extensions
    const selectedFiles = Array.from(event.target.files || []);

    // Reset the error states initially
    setUploadError(false);
    setUploadErrorMessage(false);

    if (!selectedFiles.length) {
      setUploadError(true); // Set error if no file is selected
      setUploadErrorMessage(false); // Ensure no file type error message is shown
      return;
    }

    // Filter files based on allowed extensions
    const validFiles = selectedFiles.filter((file: any) => {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      return fileExtension && validExtensions.includes(fileExtension);
    });

    if (validFiles.length !== selectedFiles.length) {
      setUploadErrorMessage(true); // Show file type error
      setUploadError(false); // Ensure no file selected error is hidden
    } else {
      setUploadErrorMessage(false); // Clear error message if all files are valid
    }

    // Update state with valid files
    setFiles((prevFiles: any) => [...(prevFiles || []), ...validFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles: any) =>
      prevFiles.filter((_: any, i: any) => i !== index)
    );
  };

  const handleUpload = async () => {
    setUploading(true);
    // Convert checkedContents from Set to Array for Supabase query
    const contentIdsArray = Array.from(checkedContents);

    if (contentIdsArray.length === 0) {
      setUploading(false);
      return;
    }

    const { data, error } = await supabase
      .from("content")
      .select("*")
      .in("id", contentIdsArray);

    if (error) {
      console.error("Error fetching content:", error);
      setUploading(false);
      return;
    } else {
      const videoTypesMap: any = {};

      // Iterate through the fetched data and check for video types
      const updatedData = data.map((item) => {
        const isVideo =
          item.url.endsWith(".mp4") ||
          item.url.endsWith(".avi") ||
          item.url.endsWith(".mov") ||
          item.url.startsWith("video");

        videoTypesMap[item.id] = isVideo; // Store video type in map

        return {
          ...item,
          isVideo, // Attach video type to each content item
        };
      });

      // Update videoTypes state
      setFileManagerVideoTypes(videoTypesMap);

      const newImages = [...existingPlaylist, ...data];
      setExistingPlaylist(newImages as any);

      // setPlaylistImagesLength(newImages as any);
      setUploading(false);
      setUploadOpen(false);
      setTimeout(() => setCheckedContents(new Set()), 1000);
    }
  };

  const handleUploadClick = async () => {
    if (files.length > 0) {
      setUploading(true);
      setUploadError(false);
      setUploadErrorMessage(false);

      const uploadedFiles = [];
      const videoTypesMap: any = {};

      for (const file of files) {
        const { data, error } = await supabase.storage
          .from("screen-images")
          .upload(file.name, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) {
          console.error("Error uploading file:", error);
          setUploadError(true);
          setUploading(false);
          return;
        }

        const publicURL = supabase.storage
          .from("screen-images")
          .getPublicUrl(data?.path).data.publicUrl;

        let duration = 10;

        // Check if the file is a video
        const isVideo = file.type.startsWith("video");
        if (isVideo) {
          duration = await getVideoDuration(publicURL);
        }

        // Store whether the file is a video in the videoTypes map
        videoTypesMap[file.name] = isVideo;

        uploadedFiles.push({
          name: file.name,
          url: publicURL,
          duration: duration,
          isVideo,
        });
      }
      // Update the state with the video types of uploaded files
      setVideoTypes(videoTypesMap);

      const { data: updatedImages, error } = await supabase
        .from("content")
        .insert(
          uploadedFiles.map((file) => ({
            name: file.name,
            url: file.url,
            duration: file.duration,
            selected_playlist_id: id,
            userId: signedInUserId || null,
          }))
        )
        .select();
      if (error) {
        console.error("Error inserting to database:", error);
        setUploadError(true);
        setUploading(false);
        return;
      }

      const newImages = [...existingPlaylist, ...updatedImages];

      // setTimeout(async () => {
      //   try {
      //     const deletePromises = newImages.map(async (file) => {
      //       const { error } = await supabase
      //         .from("content")
      //         .delete()
      //         .match({ id: file.id });
      //       if (error) {
      //         throw error;
      //       }
      //     });
      //     await Promise.all(deletePromises);
      //     console.log("Successfully deleted images");
      //   } catch (error) {
      //     console.error("Error deleting images:", error);
      //   }
      // }, 10000);

      setExistingPlaylist(newImages as any);
      // setPlaylistImagesLength(newImages as any);
      setUploading(false);
      setUploadOpen(false);
      setFiles([]);
    } else {
      setUploadError(true);
      setUploadErrorMessage(false);
      setUploading(false);
    }
  };

  const handleContentUploadCancel = () => {
    setFiles([]);
    setUploadOpen(false);
    setUploading(false);
    setUploadError(false);
    setUploadErrorMessage(false);
  };

  // Function to get the duration of a video
  function getVideoDuration(url: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = url;

      video.onloadedmetadata = () => {
        resolve(video.duration);
      };

      video.onerror = (error) => {
        reject(`Error loading video: ${error}`);
      };
    });
  }

  const handlePlaylistDelete = async (id: number, index: number) => {
    const updatedPlaylists = existingPlaylist.filter(
      (playlist: any, i: number) => !(playlist.id === id && i === index)
    );
    setExistingPlaylist(updatedPlaylists as any);
  };

  const handleSavePlaylist = async () => {
    setSaveLoader(true);
    const { data, error } = await supabase
      .from("playlistDetails")
      .update({
        playlistName: playlistName,
        playlistImages: existingPlaylist,
        folder_name: selectedFolderId || null,
        // tagName : updatedTag,
      })
      .eq("id", id)
      .single();
    if (error) {
      console.error("Error deleting data:", error);
      setSaveLoader(false);
    } else {
      //notify("Playlist updated successfully", true);
      setSaveLoader(false);
      getPlaylistData();
      setChangeCheck(false);
      toast({
        title: "Updated Successfully!.",
        description: "Playlist has updated successfully!",
        action: <ToastAction altText="Ok">Ok</ToastAction>,
      });
      // setTimeout(() => router.push("/playlist"), 2000);
    }
  };

  const handleDurationChange = (id: any, newDuration: any) => {
    setExistingPlaylist((prev: any) =>
      prev.map((playlist: any) =>
        playlist.id === id ? { ...playlist, duration: newDuration } : playlist
      )
    );
  };

  const fetchContentData = async () => {
    const userId = localStorage.getItem("userId");
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("is_deleted", 0)
      .eq("userId", userId);
    // .eq("folder_id", selectedFolderId);
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      // setContentList(data);
      setFileManagerContent(data);
      // console.log("contentList data: ", data);
    }
  };

  const fetchContentFolder = async () => {
    const userId = localStorage.getItem("userId");

    // Fetch all folders for the user
    const { data: folders, error: foldersError } = await supabase
      .from("folders")
      .select("*")
      .eq("is_deleted", 0)
      .eq("userId", userId)
      .eq("folder_type", "content");

    if (foldersError) {
      console.error("Error fetching folders:", foldersError);
    } else {
      setFileManagerContentFolder(folders);
      if (folders.length > 0) {
        // Initialize an array to hold all contents from all folders
        let allFolderedContents: any[] = [];

        // Loop through each folder and fetch its contents
        for (const folder of folders) {
          const { data: contents, error: contentsError } = await supabase
            .from("content")
            .select("*")
            .eq("userId", userId)
            .eq("folder_id", folder.id);

          if (contentsError) {
            console.error(
              `Error fetching contents for folder ${folder.id}:`,
              contentsError
            );
          } else {
            // Append the fetched contents to the allFolderedContents array
            allFolderedContents = [...allFolderedContents, ...contents];
          }
        }

        // Set the fetched contents for all folders
        setFileManagerFolderedContent(allFolderedContents);
      }
    }
  };

  const fetchFolderData = async () => {
    const userId = localStorage.getItem("userId");
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("userId", userId)
      .eq("is_deleted", 0)
      .eq("folder_type", "playlist");
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setContentList(data);
    }
  };

  useEffect(() => {
    getPlaylistData();
    fetchFolderData();
    fetchContentData();
    fetchContentFolder();
  }, []);

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
    const isSamePlaylist =
      JSON.stringify(newPlaylistImagesCheck) ===
      JSON.stringify(existingPlaylist);
    if (!isSamePlaylist) {
      setChangeCheck(true);
    }

    const handleBeforeUnload = (e: any) => {
      const isSamePlaylist =
        JSON.stringify(newPlaylistImagesCheck) ===
        JSON.stringify(existingPlaylist);

      if (!isSamePlaylist) {
        // Notify user that changes have been made
        // alert("Playlist has been changed. Please save your changes.");
        e.preventDefault();
        e.returnValue = ""; // Required for most browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [newPlaylistImagesCheck, existingPlaylist]);

  return (
    <div
      className="w-full p-0 flex"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      <Toaster />
      <div className="w-full p-4">
        <div className="w-full flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            {changeCheck === true ? (
              <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <DialogTrigger asChild>
                  <h4 className="text-sm font-medium text-primary_color cursor-pointer">
                    Playlist
                  </h4>
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
                  "Playlist"
                )}
              </h4>
            )}
            <ChevronRight size={20} />
            <h4 className="text-sm font-medium text-primary_color">
              {playlistName}
            </h4>
            <ChevronRight size={20} />
            <h4 className="text-sm font-medium text-primary_color">
              Edit Playlist
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className=""
              variant={"outline"}
              onClick={handlePreviewImages}
            >
              <ScanEye size={20} />
            </Button>
            {changeCheck === true ? (
              <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <DialogTrigger asChild>
                  <Button className="w-[71px]" variant={"outline"}>
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
                className="w-[71px]"
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
              className="w-[57px]"
              onClick={handleSavePlaylist}
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
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
              <DialogTrigger asChild>
                <div className="py-2.5 px-3 rounded text-white bg-delete_color cursor-pointer transition-all duration-300 ease-in-out hover:bg-delete_color hover:text-white w-[44px] h-[40px]">
                  <Trash2 size={20} />
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[397px] sm:max-h-[342px]">
                <DialogHeader className="flex flex-col space-y-0">
                  <DialogTitle className="text-2xl font-semibold">
                    Delete Playlist
                  </DialogTitle>
                  <DialogDescription className="m-0">
                    Are you sure want to delete the playlist
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
        </div>

        <div className="w-full border rounded-lg border-slate-300 p-3">
          <h4 className="text-base font-bold text-primary_color border-b pb-4 border-black">
            Edit Playlist
          </h4>
          <div className="w-full flex items-start gap-4 mt-2.5">
            <div className="w-2/4">
              <h4 className="text-sm font-medium text-primary_color mb-2">
                Playlist Name
              </h4>
              <Input
                className="w-full"
                placeholder="playlist 01"
                value={playlistName}
                onChange={(e) => {
                  setPlaylistName(e.target.value);
                }}
              />
              {/* {playlistErrors.playlistName && (
                <p className="text-delete_color text-xs mt-2">
                  Playlist name is required.
                </p>
              )} */}
            </div>
            {/* <div className="w-2/4">
              <h4 className="text-sm font-medium text-primary_color mb-2">
                Add Schedule
              </h4>
              <Input
                className="w-full"
                placeholder="Weekend_summer_2024"
                // value={schedule}
                // onChange={(e) => setSchedule(e.target.value)}
              />
            </div> */}
            <div className="w-2/4">
              <h4 className="text-sm font-medium text-primary_color mb-2">
                Folder Name
              </h4>
              <div className="pt-0">
                <Popover open={contentOpen} onOpenChange={setContentOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={contentOpen}
                      className="w-full justify-between"
                    >
                      {contentValue
                        ? contentList.find(
                            (framework) => framework.id === contentValue
                          )?.name
                        : "Select Folder"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className={`w-full p-0`}
                    style={{ width: "146%" }}
                  >
                    <Command>
                      <Input
                        placeholder="Search folder..."
                        value={folderSearchQuery}
                        className="rounded-none"
                        onChange={(e: any) =>
                          setFolderSearchQuery(e.target.value)
                        }
                      />
                      <CommandList>
                        {filteredPlaylistFolders.length === 0 ? (
                          <CommandEmpty className="max-h-[60px] h-[30px] flex justify-center pt-1">
                            No folders found.
                          </CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {filteredPlaylistFolders.map((framework) => (
                              <CommandItem
                                key={framework.id}
                                value={framework.id}
                                onSelect={(currentValue) => {
                                  if (setContentValue) {
                                    setContentValue(
                                      currentValue === contentValue
                                        ? null
                                        : currentValue
                                    );
                                  }
                                  setContentOpen(false);
                                  // setSelectedValue(currentValue);
                                  if (setSelectedFolderId) {
                                    setSelectedFolderId(
                                      currentValue === contentValue
                                        ? null
                                        : (currentValue as string)
                                    );
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    contentValue === framework.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {framework.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {/* <div className="w-2/4">
              <h4 className="text-sm font-medium text-primary_color mb-2">
                Add Tag
              </h4>
              <AddTag
                initialTags={playlisttags}
                onTagsChange={setPlaylistTags as any}
                selectedTag={[]}
                selectedId={''}
              />
              {playlistErrors.playlisttags && (
                <p className="text-delete_color text-xs mt-0">
                  At least one tag is required.
                </p>
              )}
            </div> */}
          </div>
          <div className="flex justify-end">
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <div className="flex flex-col items-start gap-0">
                  <Button className="float-right w-[300px] mt-3.5">
                    Add Content
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent
                className="sm:max-w-[603px] sm:min-h-[370px]"
                style={{ zIndex: 999 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold mb-3">
                    Upload Content
                  </DialogTitle>
                  <Tabs defaultValue="system" className="w-full">
                    <div className="text-center">
                      <TabsList className="bg-zinc-100 rounded-l-lg rounded-r-none">
                        <TabsTrigger value="web">File Manager</TabsTrigger>
                      </TabsList>
                      <TabsList className="bg-zinc-100">
                        <TabsTrigger value="system">Upload File</TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="system" className="w-full">
                      {files && files.length > 0 ? (
                        <>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              Upload multiple files, at once.{" "}
                              <span className="text-gray-400">
                                {" "}
                                (.jpg, .png, .mp4)
                              </span>
                            </p>
                            <Button className="w-[130px] relative cursor-pointer">
                              <Input
                                type="file"
                                multiple
                                placeholder="Upload File 1"
                                className="w-full h-full border border-border_gray outline-none cursor-pointer py-0 opacity-0 absolute top-0 left-0 text-transparent"
                                onChange={handleFileChange}
                              />
                              <CirclePlus className="mr-2" size={20} /> Add More
                            </Button>
                          </div>
                          <div className="border border-border_gray w-full flex-col justify-center items-center text-sm mb-1 h-[230px] overflow-y-scroll py-0 z-50 mt-5 p-2.5">
                            {files.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-sm w-full px-2 py-2 my-2 bg-border_gray rounded"
                              >
                                <p>
                                  {file.name.length > 12
                                    ? `${file.name.slice(0, 18)}...`
                                    : file.name}
                                </p>
                                <button
                                  className="ml-2 text-red-500"
                                  onClick={() =>
                                    handleRemoveFile && handleRemoveFile(index)
                                  }
                                >
                                  <CircleX
                                    className="cursor-pointer text-primary_color"
                                    size={20}
                                  />
                                </button>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="w-full border-2 border-spacing-[7px] border-dashed border-border_gray relative overflow-hidden p-4 flex flex-col items-center justify-center h-[230px] mt-5">
                          {/* <p className="w-full flex justify-center items-center text-sm mb-1">
                            Drop your files here
                          </p> */}

                          <span className="bg-white w-full text-center cursor-pointer text-sm font-semibold text-secondary_color">
                            Drag your files here or{" "}
                            <span className="text-button_orange">browse</span>
                          </span>
                          <Input
                            type="file"
                            multiple
                            className="w-full h-full border-none outline-none cursor-pointer opacity-0 absolute top-0 left-0"
                            onChange={handleFileChange}
                          />
                        </div>
                      )}
                      {uploadError && (
                        <p className="text-delete_color text-sm mt-2">
                          Please select files
                        </p>
                      )}
                      {uploadErrorMessage && (
                        <p className="text-delete_color text-sm mt-2">
                          Please select valid files (jpg, png, mp4)
                        </p>
                      )}
                      <div className="w-full items-center flex gap-1 mt-4">
                        <CircleAlert size={20} />
                        <p className="text-xs font-normal">
                          Prior to uploading content, we recommend reviewing our{" "}
                          <span className="text-delete_color">size guide</span>{" "}
                          to ensure optimal results.
                        </p>
                      </div>
                      <DialogFooter className="mt-1 flex justify-between items-center gap-6">
                        <DialogClose asChild>
                          <Button
                            variant="outline"
                            className="w-2/4"
                            onClick={handleContentUploadCancel}
                          >
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          className="bg-button_orange hover:bg-button_orange hover:opacity-75 w-2/4"
                          onClick={handleUploadClick}
                          disabled={uploading}
                        >
                          {uploading ? (
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
                            "Upload"
                          )}
                        </Button>
                      </DialogFooter>
                    </TabsContent>
                    <TabsContent value="web" className="w-full h-full mt-5">
                      <div className="relative w-full">
                        <Input
                          type="text"
                          placeholder="Search"
                          className="pl-10"
                          onChange={handleSearch}
                        />
                        <Search
                          className="absolute left-3 top-[50%] -translate-y-1/2 text-secondary_color"
                          size={16}
                        />
                      </div>
                      <div className="border border-border_gray p-3 my-2 rounded max-h-[300px] overflow-y-scroll playlist-scroll">
                        {fileManagerContent.filter(
                          (preview) =>
                            preview.folder_id === null &&
                            preview.userId === signedInUserId &&
                            preview.name
                              .toLowerCase()
                              .includes(searchValue.toLowerCase())
                        ).length === 0 &&
                        fileManagerContentFolder.filter((folder) =>
                          folder.name
                            .toLowerCase()
                            .includes(searchValue.toLowerCase())
                        ).length === 0 ? (
                          <p className="text-sm font-normal text-center">
                            No results found
                          </p>
                        ) : (
                          <>
                            {fileManagerContent
                              .filter(
                                (preview) =>
                                  preview.folder_id === null &&
                                  preview.userId === signedInUserId &&
                                  preview.name
                                    .toLowerCase()
                                    .includes(searchValue.toLowerCase())
                              )
                              .map((preview, index) => (
                                <div
                                  key={index}
                                  className="relative h-[80px] w-[150px] cursor-pointer mb-2"
                                >
                                  {preview.url.slice(-3).toLowerCase() ===
                                    "jpg" ||
                                  preview.url.slice(-3).toLowerCase() ===
                                    "png" ? (
                                    <div className="w-full h-full flex items-center justify-between">
                                      <Image
                                        src={preview.url as string}
                                        layout="fill"
                                        className="rounded content_image"
                                        style={{ objectFit: "cover" }}
                                        alt={preview.name as string}
                                      />
                                      <div className="absolute left-[170px] top-[35%] w-full">
                                        <p className="w-[250px] text-sm font-normal whitespace-nowrap overflow-hidden text-ellipsis">
                                          {preview.name}
                                        </p>
                                      </div>

                                      <div
                                        className="absolute right-[-366px]"
                                        onClick={() => handleCheck(preview.id)}
                                      >
                                        {isChecked(preview.id) ? (
                                          <CheckCircle size={20} />
                                        ) : (
                                          <CirclePlus size={20} />
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-between">
                                      <video
                                        src={preview.url}
                                        className="w-full h-full object-cover rounded"
                                        controls={false}
                                        autoPlay
                                        loop
                                        typeof="video/mp4"
                                        muted
                                      />
                                      <div className="absolute left-[170px] top-[35%] w-full">
                                        <p className="w-[250px] text-sm font-normal whitespace-nowrap overflow-hidden text-ellipsis">
                                          {preview.name}
                                        </p>
                                      </div>
                                      <div
                                        className="absolute right-[-366px]"
                                        onClick={() => handleCheck(preview.id)}
                                      >
                                        {isChecked(preview.id) ? (
                                          <CheckCircle size={20} />
                                        ) : (
                                          <CirclePlus size={20} />
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}

                            {fileManagerContentFolder
                              .filter((folder) =>
                                folder.name
                                  .toLowerCase()
                                  .includes(searchValue.toLowerCase())
                              )
                              .map((folder, index) => {
                                const folderContents =
                                  fileManagerFolderedContent
                                    .filter(
                                      (content) =>
                                        content.folder_id === folder.id
                                    )
                                    .map((content) => content.id); // Get IDs of folder contents

                                return (
                                  <Collapsible
                                    key={index}
                                    className="relative bg-border_gray my-2 rounded-md"
                                  >
                                    <div
                                      className="absolute top-[10px] right-[10px] cursor-pointer"
                                      onClick={() =>
                                        handleCheck(folder.id, folderContents)
                                      }
                                    >
                                      {isChecked(folder.id) ? (
                                        <CheckCircle size={20} />
                                      ) : (
                                        <CirclePlus size={20} />
                                      )}
                                    </div>
                                    <CollapsibleTrigger className="w-full h-full flex items-center justify-between bg-zinc-100 pl-2">
                                      <div className="w-full h-full flex items-center gap-2 my-2">
                                        <Folder size={20} />
                                        {folder.name.length > 12
                                          ? `${folder.name.slice(0, 18)}...`
                                          : folder.name}
                                      </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="p-2 pr-0">
                                      {folderContents.length > 0 ? (
                                        folderContents.map(
                                          (previewId, contentIndex) => {
                                            const preview =
                                              fileManagerFolderedContent.find(
                                                (content) =>
                                                  content.id === previewId
                                              );

                                            return (
                                              <div
                                                key={contentIndex}
                                                className="relative h-[80px] w-[150px] cursor-pointer mb-2"
                                              >
                                                {preview?.url
                                                  .slice(-3)
                                                  .toLowerCase() === "jpg" ||
                                                preview?.url
                                                  .slice(-3)
                                                  .toLowerCase() === "png" ? (
                                                  <div className="w-full h-full flex items-center justify-between">
                                                    <Image
                                                      src={
                                                        preview?.url as string
                                                      }
                                                      layout="fill"
                                                      className="rounded content_image"
                                                      style={{
                                                        objectFit: "cover",
                                                      }}
                                                      alt={
                                                        preview?.name as string
                                                      }
                                                    />
                                                    <div className="absolute left-[170px] top-[35%] w-full">
                                                      <p className="w-[250px] text-sm font-normal whitespace-nowrap overflow-hidden text-ellipsis">
                                                        {preview?.name}
                                                      </p>
                                                    </div>
                                                    <div
                                                      className="absolute right-[-358px]"
                                                      onClick={() =>
                                                        handleCheck(preview?.id)
                                                      }
                                                    >
                                                      {isChecked(
                                                        preview?.id
                                                      ) ? (
                                                        <CheckCircle
                                                          size={20}
                                                        />
                                                      ) : (
                                                        <CirclePlus size={20} />
                                                      )}
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <div className="w-full h-full flex items-center justify-between">
                                                    <video
                                                      src={preview?.url}
                                                      className="w-full h-full object-cover rounded"
                                                      controls={false}
                                                      autoPlay
                                                      loop
                                                      typeof="video/mp4"
                                                      muted
                                                    />
                                                    <div className="absolute left-[170px] top-[35%] w-full">
                                                      <p className="w-[250px] text-sm font-normal whitespace-nowrap overflow-hidden text-ellipsis">
                                                        {preview?.name}
                                                      </p>
                                                    </div>
                                                    <div
                                                      className="absolute right-[-358px]"
                                                      onClick={() =>
                                                        handleCheck(preview?.id)
                                                      }
                                                    >
                                                      {isChecked(
                                                        preview?.id
                                                      ) ? (
                                                        <CheckCircle
                                                          size={20}
                                                        />
                                                      ) : (
                                                        <CirclePlus size={20} />
                                                      )}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          }
                                        )
                                      ) : (
                                        <p className="text-sm font-normal">
                                          No contents found
                                        </p>
                                      )}
                                    </CollapsibleContent>
                                  </Collapsible>
                                );
                              })}
                          </>
                        )}
                      </div>
                      <DialogFooter className="mt-5 flex justify-between items-center gap-6">
                        <DialogClose asChild>
                          <Button variant="outline" className="w-2/4">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          className="bg-button_orange hover:bg-button_orange hover:opacity-75 w-2/4"
                          onClick={handleUpload}
                          disabled={uploading}
                        >
                          {uploading ? (
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
                            "Upload"
                          )}
                        </Button>
                      </DialogFooter>
                    </TabsContent>
                  </Tabs>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
          <div>
            {existingPlaylist.length !== 0 && (
              <div className="w-full">
                <h4 className="text-sm font-medium text-primary_color my-4">
                  Add Content
                </h4>
                <div className="h-[350px] overflow-y-scroll playlist-scroll">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-y border-zinc-200">
                        <TableHead className="w-[300px]">Preview</TableHead>
                        <TableHead className="w-[1000px]">Title</TableHead>
                        <TableHead className="w-[135px]">
                          Duration (Sec)
                        </TableHead>
                        <TableHead className="text-right w-[100px]">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={existingPlaylist}
                          strategy={verticalListSortingStrategy}
                        >
                          {existingPlaylist.map((playlist: any, index) => (
                            <SortableItem key={index} id={playlist.id}>
                              <TableRow className="w-full contents" key={index}>
                                <TableCell className="font-medium flex items-center gap-4 w-[200px]">
                                  <DragHandle id={playlist.id} />
                                  {playlist.url.slice(-3).toLowerCase() ===
                                    "jpg" ||
                                  playlist.url.slice(-3).toLowerCase() ===
                                    "png" ? (
                                    <div
                                      className="relative h-[60px] w-[106px] rounded"
                                      style={{
                                        backgroundImage: `url(${playlist?.url})`,
                                        backgroundPosition: "top",
                                        backgroundSize: "cover",
                                        backgroundRepeat: "no-repeat",
                                        boxShadow: "rgba(0, 0, 0, 0.08)",
                                      }}
                                    ></div>
                                  ) : (
                                    <video
                                      src={playlist.url}
                                      className="rounded h-[60px] w-[106px]"
                                      controls={false}
                                      autoPlay
                                      muted
                                      loop
                                      typeof="video/mp4"
                                    />
                                  )}
                                </TableCell>
                                <TableCell className="w-[200px] font-medium">
                                  {playlist.name}
                                </TableCell>
                                <TableCell className="w-[130px]">
                                  <Input
                                    type="number"
                                    min={1}
                                    value={playlist.duration}
                                    onChange={(e) =>
                                      handleDurationChange(
                                        playlist.id,
                                        e.target.value
                                      )
                                    }
                                    onFocus={(e) => e.target.select()}
                                    onBlur={(e) => e.target.focus()} // Keeps focus until blur event
                                    className="w-20"
                                    disabled={
                                      videoTypes[playlist.name] ||
                                      fileManagerVideoTypes[playlist.id] ||
                                      fetchedContentType[playlist.id]
                                    }
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant={"outline"}
                                    className="rounded p-2 w-[36px] h-[36px]"
                                    onClick={() =>
                                      handlePlaylistDelete(playlist.id, index)
                                    }
                                  >
                                    <Trash2 size={20} />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            </SortableItem>
                          ))}
                        </SortableContext>
                      </DndContext>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistEdit;
