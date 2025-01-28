"use client";
import AddTag from "@/components/add-tag";
import SearchBar from "@/components/searchbar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/utils/supabase/supabaseClient";
import {
  CalendarDays,
  Check,
  ChevronRight,
  ChevronsUpDown,
  ImageIcon,
  ImageUp,
  LoaderCircle,
  Trash2,
  Video,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { useEffect, useState } from "react";
// import toast, { Toaster } from "react-hot-toast";
import "./style.css";
import { Tag } from "emblor";
import { any } from "zod";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import { ContentSkeleton } from "@/components/skeleton-ui";
import { toast, useToast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

interface Props {
  params: {
    id: string;
  };
}

interface ImagePreview {
  name: string;
  url: string;
  id: string;
  folder_id: string;
  tag: [Tag];
  selected_playlist_id: string;
  tag_name: [Tag];
  userId?: string;
}

interface PlaylistItem {
  id: string;
  playlistName: string;
}

const FolderDetails = (props: Props) => {
  const { id } = props.params;
  const router = useRouter();

  const [file, setFile] = useState<File[] | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  // const [selectedFolderId, setSelectedFolderId] = useState<string>("");

  const [folderName, setFolderName] = useState<string>("");
  const [folderTag, setFolderTag] = useState([]);
  const [folderId, setFolderId] = useState("");
  const [folderedImages, setFolderedImages] = useState<ImagePreview[]>([]);
  const [deleteFolderOpen, setDeleteFolderOpen] = useState(false);
  const [deleteImageDialogOpen, setDeleteImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImagePreview | null>(null);
  const [activeImage, setActiveImage] = useState<ImagePreview | null>(null);

  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [PlaylistValue, setPlaylistValue] = useState<string | null>("");
  const [playlistList, setPlaylistList] = useState<PlaylistItem[]>([]);

  const [folderPlaylistOpen, setFolderPlaylistOpen] = useState(false);
  const [folderPlaylistValue, setFolderPlaylistValue] = useState<string | null>(
    ""
  );
  const [folderPlaylistList, setFolderPlaylistList] = useState<PlaylistItem[]>(
    []
  );
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    ""
  );
  const [selectedFolderPlaylistId, setSelectedFolderPlaylistId] = useState<
    string | null
  >("");
  const [sidebar, setSidebar] = useState(true);

  const [contentMove, setContentMove] = useState(false);
  const [contentMoveDetails, setContentMoveDetails] =
    useState<ImagePreview | null>(null);

  const [contentMoveFolder, setContentMoveFolder] = useState<string | null>("");
  const [contentMoveValue, setContentMoveValue] = useState<string | null>("");
  const [moveContentOpen, setMoveContentOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const [moveMultipleContent, setMoveMultipleContent] = useState(false);
  const [moveMultipleContentOpen, setMoveMultipleContentOpen] = useState(false);
  const [moveMultipleContentDetails, setMoveMultipleContentDetails] = useState<
    ImagePreview[]
  >([]);
  const [moveMultipleContentFolder, setMoveMultipleContentFolder] = useState<
    string | null
  >("");
  const [moveMultipleContentValue, setMoveMultipleContentValue] = useState<
    string | null
  >("");

  const [multipleDeleteOpen, setMultipleDeleteOpen] = useState(false);
  const [multiSelectPlaylistOpen, setMultiSelectPlaylistOpen] = useState(false);
  const [multiSelectPlaylistValue, setMultiSelectPlaylistValue] = useState<
    string | null
  >("");
  const [multipleSelectedPlaylistId, setMultipleSelectedPlaylistId] = useState<
    string | null
  >("");
  const [multipleSelectPlaylistList, setMultipleSelectPlaylistList] = useState<
    PlaylistItem[]
  >([]);

  // const [folderContentPlaylisttags, setFolderContentPlaylisttags] = useState<
  //   Tag[]
  // >([]);
  const [folderTags, setFolderTags] = useState<Tag[]>([]);

  const [multipleSelectInsideFolderTags, setMultipleSelectInsideFolderTags] =
    useState<Tag[]>([]);
  const [multipleSelectCheckedTags, setMultipleSelectCheckedTags] = useState<
    Tag[]
  >([]);
  const [multipleSelectCheckedTagsId, setMultipleSelectCheckedTagsId] =
    useState("");

  const [signedInUserId, setSignedInUserId] = useState<string | null>("");

  const [contentLoading, setContentLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [searchValue, setSearchValue] = useState<string | null>("");
  const [selectAll, setSelectAll] = useState(false);
  const [addLoader, setAddLoader] = useState(false);
  const [moveScreenLoader, setMoveScreenLoader] = useState(false);
  const [saveLoader, setSaveLoader] = useState(false);

  const [playlistSearchQuery, setPlaylistSearchQuery] = useState("");

  const filteredFolderPlaylistList = folderPlaylistList.filter((playlist) =>
    playlist.playlistName
      .toLowerCase()
      .includes(playlistSearchQuery.toLowerCase())
  );

  const filteredPlaylist = playlistList.filter((playlist) =>
    playlist.playlistName
      .toLowerCase()
      .includes(playlistSearchQuery.toLowerCase())
  );

  const FilteredMultipleSelectPlaylistList = multipleSelectPlaylistList.filter(
    (playlist) =>
      playlist.playlistName
        .toLowerCase()
        .includes(playlistSearchQuery.toLowerCase())
  );

  // const notify = (message: string, success: boolean) =>
  //   toast[success ? "success" : "error"](message, {
  //     style: {
  //       borderRadius: "10px",
  //       background: "#fff",
  //       color: "#000",
  //     },
  //     position: "top-right",
  //     duration: 3000,
  //   });

  useEffect(() => {
    const userName = async () => {
      const user = await getUserData();
      setSignedInUserId(user?.id || null);
      console.log("user id ", user?.id || null);
      return user;
    };
    userName();
  }, []);

  const getFolderData = async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      console.log("Folder data:", data);
      setFolderName(data.name);
      setFolderTag(data.tag_name);
      setFolderId(data.id);
      const { data: images, error: imagesError } = await supabase
        .from("content")
        .select("*")
        .eq("is_deleted", 0)
        .eq("folder_id", id);
      if (imagesError) {
        console.error("Error fetching images:", imagesError);
        setContentLoading(false);
        setNotFound(false);
      } else {
        setFolderedImages(images);
      }
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

      const { error: deleteFolderError } = await supabase
        .from("folders")
        //.delete()
        .update({ is_deleted: 1 })
        .eq("id", id)
        .single();
      if (deleteFolderError) throw deleteFolderError;

      //notify("Folder deleted successfully", true);
      //router.push("/content");
      toast({
        title: "Deleted Successfully!.",
        description: "Folder has been deleted successfully!",
        action: (
          <ToastAction altText="Undo" onClick={() => handleFolderDeleteUndo()}>
            Undo
          </ToastAction>
        ),
      });
      setDeleteFolderOpen(false);
      setAddLoader(false);
      setTimeout(() => router.push("/content"), 4000);
    } catch (error) {
      console.error("Error deleting folder and related content:", error);
      setAddLoader(false);
    }
  };

  const handleFolderDeleteUndo = async () => {
    try {
      const { error: deleteContentError } = await supabase
        .from("content")
        .update({ is_deleted: 0 })
        .eq("folder_id", id);
      if (deleteContentError) throw deleteContentError;

      const { error: deleteFolderError } = await supabase
        .from("folders")
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

  // const getCheckedItemTags = async () => {
  //   const combineTag = []; // Initialize combineTag outside the loop
  //   console.log("checkedItems -1", checkedItems);
  //   for (let i = 0; i < checkedItems.length; i++) {
  //     const { data, error } = await supabase
  //       .from("content")
  //       .select("tag")
  //       .eq("id", checkedItems[i])
  //       .single();

  //     if (error) {
  //       console.error("Error fetching data:", error);
  //     } else {
  //       if (data) {
  //         console.log("tag data:", data);
  //         combineTag.push(data.tag); // Access the first item in the data array
  //         // console.log("data[0].tag ",data[0].tag)
  //       }
  //     }
  //   }
  //   console.log("combineTag 1", combineTag);
  //   // setMultipleSelectCheckedTags(combineTag);
  //   // console.log("destructure tag ", combineTag);
  // };

  const handleContentCancel = () => {
    const FolderDetails = document.getElementById("folder-settings");
    if (FolderDetails) {
      FolderDetails.style.display = "block";
    }
    const details = document.getElementById("content_details");
    if (details) {
      details.style.display = "none";
      setActiveImage(null);
      setContentMove(false);
      setPlaylistValue("");
      // setFolderContentPlaylisttags([]);
    }
  };

  const handleContentDetails = async (preview: ImagePreview) => {
    if (checked) {
      handleContentCancel();
      const FolderDetails = document.getElementById("folder-settings");
      if (FolderDetails) {
        FolderDetails.style.display = "none";
      }
    } else {
      const FolderDetails = document.getElementById("folder-settings");
      if (FolderDetails) {
        FolderDetails.style.display = "none";
      }
      const details = document.getElementById("content_details");
      if (details) {
        details.style.display = "block";
      }
      if (preview.selected_playlist_id != null) {
        const { data, error } = await supabase
          .from("playlistDetails")
          .select("*")
          .eq("is_deleted", 0)
          .eq("userId", signedInUserId)
          .eq("id", preview.selected_playlist_id)
          .single();

        if (error) {
          console.error("Error fetching data:", error);
        } else {
          console.log("playlist data:", data);
          setPlaylistValue(data ? data.playlistName || null : null);
        }
      }
      setSelectedImage(preview);
      setSelectedPlaylistId(preview.selected_playlist_id || null);
      setActiveImage(preview);
      setContentMove(true);
      setMoveMultipleContent(false);
      setContentMoveDetails({ ...preview });
    }
  };

  const handleImageDelete = async () => {
    try {
      setAddLoader(true);
      const { error } = await supabase
        .from("content")
        //.delete()
        .update({ is_deleted: 1 })
        .eq("id", activeImage?.id);
      if (error) throw error;
      getFolderData();
      setDeleteImageDialogOpen(false);
      setAddLoader(false);
      //notify("Image deleted successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Image has deleted successfully!",
        action: (
          <ToastAction altText="Undo" onClick={() => handleImageDeleteUndo()}>
            Undo
          </ToastAction>
        ),
      });
      handleContentCancel();
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleImageDeleteUndo = async () => {
    try {
      const { error } = await supabase
        .from("content")
        .update({ is_deleted: 0 })
        .eq("id", activeImage?.id);
      if (error) throw error;
      getFolderData();
      setDeleteImageDialogOpen(false);
      //notify("Image deleted successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Image has recovered successfully!",
        action: <ToastAction altText="Ok">Ok</ToastAction>,
      });
      handleContentCancel();
    } catch (error) {
      setAddLoader(false);
      console.error("Error deleting image:", error);
    }
  };

  const handleMultipleSelectCancel = () => {
    const details = document.getElementById("multiple_select_content");
    if (details) {
      details.style.display = "none";
      setCheckedItems([]);
      setContentMove(false);
      setMoveMultipleContent(false);
      setChecked(false);
      setMultiSelectPlaylistValue("");
      setSelectAll(false);
      setSidebar(true);
      setActiveImage(null);
      checkedItems.length = 0;
    }
    const FolderDetails = document.getElementById("folder-settings");
    if (FolderDetails) {
      FolderDetails.style.display = "block";
      setActiveImage(null);
      setContentMove(false);
    }
  };

  const handleMultipleDelete = async () => {
    if (checkedItems.length > 0) {
      setAddLoader(true);
      // handleCancel();
      const { data, error } = await supabase
        .from("content")
        //.delete()
        .update({ is_deleted: 1 })
        .in("id", checkedItems);

      if (error) {
        console.error("Error deleting files:", error);
        setAddLoader(false);
      } else {
        console.log("Files deleted successfully");
        getContentImages();
        getFolderData();
        setCheckedItems([]);
        handleContentCancel();
        handleMultipleSelectCancel();
        setMultipleDeleteOpen(false);
        setAddLoader(false);
        //notify("Contents deleted successfully", true);
        toast({
          title: "Updated Successfully!.",
          description: "Content has deleted successfully!",
          action: (
            <ToastAction
              altText="Undo"
              onClick={() => handleMultipleDeleteUndo()}
            >
              Undo
            </ToastAction>
          ),
        });
      }
    }
  };

  const handleMultipleDeleteUndo = async () => {
    if (checkedItems.length > 0) {
      // handleCancel();
      const { data, error } = await supabase
        .from("content")
        // .delete()
        .update({ is_deleted: 0 })
        .in("id", checkedItems);

      if (error) {
        console.error("Error deleting files:", error);
      } else {
        console.log("Files deleted successfully");
        getContentImages();
        getFolderData();
        setCheckedItems([]);
        handleContentCancel();
        handleMultipleSelectCancel();
        setMultipleDeleteOpen(false);
        //notify("Contents deleted successfully", true);
        toast({
          title: "Updated Successfully!.",
          description: "Contents has recovered successfully!",
          action: <ToastAction altText="Ok">Ok</ToastAction>,
        });
      }
    }
  };

  const handleContentSave = async () => {
    if (!selectedImage) return;
    setSaveLoader(true);
    // Update the content with the new name and potentially the playlist ID
    const { data, error } = await supabase
      .from("content")
      .update({
        name: selectedImage.name,
        ...(selectedPlaylistId && { selected_playlist_id: selectedPlaylistId }),
        // tag: folderContentPlaylisttags,
      })
      .eq("id", selectedImage.id)
      .select("*");

    if (error) {
      console.error("Error saving content:", error);
      setSaveLoader(false);
      return;
    }

    // Only update the playlist if a playlist is selected
    if (selectedPlaylistId && playlistList) {
      const updatedPlaylistList = playlistList.map((playlist: any) => {
        if (playlist.id === selectedPlaylistId) {
          return {
            ...playlist,
            playlistImages: [
              ...playlist.playlistImages,
              {
                name: selectedImage.name,
                id: selectedImage.id,
                url: selectedImage.url,
              },
            ],
          };
        }
        return playlist;
      });

      setPlaylistList(updatedPlaylistList);

      const { error: playlistError } = await supabase
        .from("playlistDetails")
        .update({
          playlistImages: updatedPlaylistList.find(
            (playlist) => playlist.id === selectedPlaylistId
          )?.playlistImages,
        })
        .eq("id", selectedPlaylistId);
      console.log("selectedPlaylistId ", selectedPlaylistId);

      if (playlistError) {
        console.error("Error saving playlist:", playlistError);
        setSaveLoader(false);
      }
    }
    setSelectedPlaylistId(null);
    setSaveLoader(false);
    handleContentCancel();
    getContentImages();
  };

  const getContentImages = async () => {
    const { data, error } = await supabase.from("content").select("*");
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      console.log(data as any);
      return data;
    }
  };

  const fetchPlaylist = async () => {
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
      setFolderPlaylistList(data);
      setMultipleSelectPlaylistList(data);
      console.log("Playlist data:", data);
      console.log("playlistList data: ", playlistList);
    }
  };

  const handleFolderUpdate = async () => {
    setMoveScreenLoader(true);
    const { data, error } = await supabase
      .from("folders")
      .update({
        name: folderName,
        // ...(folderTags && { tag_name: folderTags }),
        tag_name: folderTags,
      })
      .eq("id", id)
      .select();

    const { data: images, error: imagesError } = await supabase
      .from("content")
      .update({
        ...(selectedFolderPlaylistId && {
          selected_playlist_id: selectedFolderPlaylistId,
        }),
      })
      .eq("folder_id", id)
      .select("*");
    if (imagesError) {
      console.error("Error fetching images:", imagesError);
      setMoveScreenLoader(false);
    } else {
      // setFolderedImages(images);
      console.log("images: ", images);
    }

    if (selectedFolderPlaylistId && folderPlaylistList) {
      // Fetch URLs for all images in parallel
      const fetchImageUrls = async (images: any[]) => {
        return await Promise.all(
          images.map(async (image: any) => {
            const { data, error } = await supabase
              .from("content")
              .select("url")
              .eq("id", image.id)
              .single();
            if (error) {
              console.error("Error fetching data:", error);
              return null;
            }
            return { ...image, url: data.url };
          })
        );
      };
      console.log("folderedImages ", folderedImages);
      // Process each playlist and update images
      const updatedPlaylistList = await Promise.all(
        folderPlaylistList.map(async (playlist: any) => {
          if (playlist.id === selectedFolderPlaylistId) {
            const updatedImages = await fetchImageUrls(folderedImages);

            return {
              ...playlist,
              playlistImages: [
                ...playlist.playlistImages,
                ...(folderedImages &&
                  updatedImages.filter((image: any) => image !== null)),
              ],
            };
          }
          return playlist;
        })
      );

      // Update state with new playlist list
      setFolderPlaylistList(updatedPlaylistList);

      // Update database with new playlist images
      const { error: playlistError } = await supabase
        .from("playlistDetails")
        .update({
          playlistImages: updatedPlaylistList.find(
            (playlist) => playlist.id === selectedFolderPlaylistId
          )?.playlistImages,
        })
        .eq("id", selectedFolderPlaylistId);

      console.log("selectedFolderPlaylistId ", selectedFolderPlaylistId);
      if (playlistError) {
        console.error("Error saving playlist:", playlistError);
      }
    }

    console.log("selectedFolderPlaylistId ", selectedFolderPlaylistId);
    console.log("folderTags ", folderTags);
    if (error) throw error;
    //notify("Folder updated successfully", true);
    setMoveScreenLoader(false);
    toast({
      title: "Updated Successfully!.",
      description: "Folder has updated successfully!",
      action: <ToastAction altText="Ok">Ok</ToastAction>,
    });
  };

  const handleFileChange = (event: any) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles) return;
    // Combine new files with existing ones
    setFile((prevFiles: any) => [...(prevFiles || []), ...selectedFiles]);
    setUploadError(false);
  };

  const handleRemoveFile = (index: number) => {
    setFile((prevFiles: any) =>
      prevFiles.filter((_: any, i: any) => i !== index)
    );
  };

  const handleUploadClick = async () => {
    if (!file) {
      setUploadError(true);
      return;
    }

    setUploading(true);

    const uploadedFiles = [];
    for (const selectedfile of file as any[]) {
      const { data, error } = await supabase.storage
        .from("screen-images")
        .upload(selectedfile.name, selectedfile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        console.error("Upload error:", error);
        setUploadError(true);
        setUploading(false);
        return;
      }

      const publicURL = supabase.storage
        .from("screen-images")
        .getPublicUrl(data?.path).data.publicUrl;

      let duration = null;

      // Check if the file is a video
      if (selectedfile.type.startsWith("video")) {
        duration = await getVideoDuration(publicURL);
      }
      uploadedFiles.push({
        name: selectedfile.name,
        url: publicURL,
        duration: duration,
      });
      console.log("Public URL:", publicURL);
      setUploading(true);
    }
    const { data: contentData, error: contentError } = await supabase
      .from("content")
      .insert(
        uploadedFiles.map((file: any) => ({
          name: file.name,
          url: file.url,
          folder_id: id,
          userId: signedInUserId,
        }))
      )
      .select();

    if (contentError) {
      console.error("Error uploading file:", contentError);
      setUploadError(true);
      setUploading(false);
      return;
    }

    // setImagePreviews(contentData as any);
    //notify("Content uploaded successfully", true);
    toast({
      title: "Updated Successfully!.",
      description: "Content has updated successfully!",
      action: <ToastAction altText="Ok">Ok</ToastAction>,
    });
    setFile([]);
    setUploadOpen(false);
    getContentImages();
    getFolderData();
    setUploading(false);
    router.refresh();
    // handleFolderDetails({ name: folderName, time: folderTime });
    // console.log("selectedFolderId ", selectedFolderId);
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

  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: string
  ) => {
    const isChecked = event.target.checked;

    // Update checked state
    setChecked(isChecked);
    console.log("initial:", isChecked);
    console.log("checkedItems:", checkedItems);

    // Update checkedItems state immediately
    setCheckedItems((prevCheckedItems) => {
      console.log("prevCheckedItems:", prevCheckedItems);
      let updatedCheckedItems;
      if (isChecked) {
        setContentMove(false);
        setMoveMultipleContent(true);
        updatedCheckedItems = [...prevCheckedItems, index];
        const details = document.getElementById("multiple_select_content");
        if (details) {
          // Show the details if there are any checked items
          details.style.display =
            updatedCheckedItems.length >= 0 ? "block" : "none";
          if (updatedCheckedItems.length === 1) {
            setSidebar(false);
            setContentMove(true);
            setMoveMultipleContent(false);
            setActiveImage(null);
          } else if (updatedCheckedItems.length > 1) {
            setSidebar(false);
            setContentMove(false);
            setMoveMultipleContent(true);
            setActiveImage(null);
          }
        }
      } else {
        updatedCheckedItems = prevCheckedItems.filter((item) => item !== index);
        const details = document.getElementById("multiple_select_content");
        if (details) {
          // Show the details if there are any checked items
          details.style.display = checkedItems.length <= 1 ? "none" : "block";
          handleContentCancel();

          if (checkedItems.length > 2) {
            setContentMove(false);
            setMoveMultipleContent(true);
            handleContentCancel();
          }
          // else if(checkedItems.length === 1){
          //   setContentMove(true);
          //   setMoveMultipleContent(false);
          // }
          else if (checkedItems.length === 2) {
            // setSelectAll(false);
            setContentMove(true);
            setMoveMultipleContent(false);
            setActiveImage(null);
            handleContentCancel();
          } else {
            // setSelectAll(false);
            setSidebar(true);
            setContentMove(false);
            setMoveMultipleContent(false);
          }
        }
      }

      setMoveMultipleContentDetails(updatedCheckedItems as any);
      console.log("updatedCheckedItems:", updatedCheckedItems);
      if (updatedCheckedItems.length <= 0) {
        setContentMove(false);
        setMoveMultipleContent(false);
      }
      return updatedCheckedItems;
    });

    // Update the display of the multiple select content details
    const details = document.getElementById("multiple_select_content");
    if (details) {
      details.style.display = isChecked ? "block" : "none";
    }

    // Handle other content display settings
    const details1 = document.getElementById("folder-settings");
    if (details1) {
      details1.style.display = "none";
    }

    const details2 = document.getElementById("content_details");
    if (details2) {
      details2.style.display = "none";
    }
  };

  // useEffect(() => {
  //   getCheckedItemTags();
  // },[checkedItems]);

  const handleMultipleSelectSave = async () => {
    setSaveLoader(true);
    const sample: any[] = [];

    // Update content with selected playlist ID
    for (const item of checkedItems) {
      const { data: updateData, error: updateError } = await supabase
        .from("content")
        .update({
          ...(multipleSelectedPlaylistId && {
            selected_playlist_id: multipleSelectedPlaylistId,
            tag: multipleSelectInsideFolderTags,
          }),
        })
        .eq("folder_id", item)
        .select("*");

      if (updateError) {
        console.error(
          `Error saving content for folder_id ${item}:`,
          updateError
        );
        setSaveLoader(false);
      } else {
        console.log(`Data for folder_id ${item}:`, updateData);
        const { data: fetchData, error: fetchError } = await supabase
          .from("content")
          .update({
            ...(multipleSelectedPlaylistId && {
              selected_playlist_id: multipleSelectedPlaylistId,
              tag: multipleSelectInsideFolderTags,
            }),
          })
          .eq("id", item)
          .select("*")
          .single();
        if (fetchError) {
          console.error("Error fetching data:", fetchError);
          setSaveLoader(false);
        } else {
          console.log(fetchData);
          sample.push(fetchData);
        }
      }
    }

    console.log("pushed data ", sample);

    // If playlist ID and playlist list are available, update the playlist details
    if (multipleSelectedPlaylistId && multipleSelectPlaylistList) {
      const fetchImageUrls = async (sample: any[]) => {
        console.log("multi select images ", sample);
        return await Promise.all(
          sample.map(async (image: any) => {
            const { data, error } = await supabase
              .from("content")
              .select("url")
              .eq("id", image.id)
              .single();
            if (error) {
              console.error("Error fetching data:", error);
            } else {
              console.log("console data ", data);
              return { ...image, url: data.url };
            }
          })
        );
      };

      const updatedPlaylistList = await Promise.all(
        multipleSelectPlaylistList.map(async (playlist: any) => {
          if (playlist.id === multipleSelectedPlaylistId) {
            const updatedPlaylistImages = await fetchImageUrls(sample);
            return {
              ...playlist,
              playlistImages: [
                ...playlist.playlistImages,
                ...updatedPlaylistImages.filter(
                  (image: any) => image.url !== null
                ),
              ],
            };
          }
          return playlist;
        })
      );

      setMultipleSelectPlaylistList(updatedPlaylistList);

      const { error: playlistError } = await supabase
        .from("playlistDetails")
        .update({
          playlistImages: updatedPlaylistList.find(
            (playlist) => playlist.id === multipleSelectedPlaylistId
          )?.playlistImages,
        })
        .eq("id", multipleSelectedPlaylistId);

      console.log("multipleSelectedPlaylistId ", multipleSelectedPlaylistId);

      if (playlistError) {
        console.error("Error saving playlist:", playlistError);
      }
    }
    handleMultipleSelectCancel();
    setSaveLoader(false);
  };

  // const tagObjects = folderTag.map((imagePreview: ImagePreview) => ({
  //   id: imagePreview.id,
  //   text: imagePreview.name,
  //   // Add any other required properties for the Tag type here
  // }));

  useEffect(() => {
    getFolderData();
    getContentImages();
    fetchPlaylist();
  }, []);

  useEffect(() => {
    if (folderedImages.length > 0) {
      setTimeout(() => {
        setContentLoading(false);
      }, 3000);
    } else {
      setTimeout(() => {
        setContentLoading(false);
        setTimeout(() => {
          setNotFound(true);
        }, 0);
      }, 3000);
    }
  }, [folderedImages]);

  const filterFolderedContents = folderedImages.filter((screenData: any) =>
    screenData.url.toLowerCase().includes(searchValue?.toLowerCase() || "")
  );

  const handleSelectAll = () => {
    setSelectAll(!selectAll);

    const applicableContent = filterFolderedContents
      .filter(
        (preview: any) =>
          preview.folder_id === id && preview.userId === signedInUserId
      )
      .map((preview: any) => preview.id);

    if (!selectAll && applicableContent.length > 0) {
      // Select all applicable content
      setCheckedItems(applicableContent);
      setMoveMultipleContent(true);
      setMoveMultipleContentDetails(applicableContent);
      setContentMove(false);
      setSidebar(false);
    } else {
      // Unselect all
      setCheckedItems([]);
      setMoveMultipleContent(false);
      setContentMove(false);
      setMoveMultipleContentDetails([]);
      setSidebar(true);
      setActiveImage(null);
    }

    // Show or hide the details based on selectAll state
    const details = document.getElementById("multiple_select_content");
    if (details) {
      details.style.display = !selectAll ? "block" : "none";
    }

    // const details2 = document.getElementById("folder-settings");
    // if (details2) {
    //   details2.style.display = "none";
    // }

    handleContentCancel();
  };

  return (
    <div
      className="w-full p-0 flex"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      <Toaster />
      <div className="w-full pr-0">
        {/* <SearchBar
          displayplus={<ImageUp size={20} />}
          calendarIcon={<CalendarDays size={20} />}
          calendar={false}
          uploadFile={true}
          screenData={() => {}}
          createContentFolder={false}
          uploadContentInsideFolder={true}
          selectedfile={file as any}
          handleRemoveFile={handleRemoveFile}
          handleUploadClick={() => handleUploadClick()}
          handleFileChange={handleFileChange}
          uploadOpen={uploadOpen}
          setUploadOpen={setUploadOpen}
          uploadError={uploadError}
          handleCancel={() => handleContentCancel()}
          handleMultipleSelectCancel={() => handleMultipleSelectCancel()}
          contentMove={contentMove}
          setContentMove={setContentMove}
          contentMoveDetails={contentMoveDetails}
          contentMoveValue={contentMoveValue}
          setContentMoveValue={setContentMoveValue}
          contentMoveFolder={contentMoveFolder}
          setContentMoveFolder={setContentMoveFolder}
          moveContentOpen={moveContentOpen}
          setMoveContentOpen={setMoveContentOpen}
          uploading={uploading}
          setUploading={setUploading}
          moveMultipleContent={moveMultipleContent}
          moveMultipleContentOpen={moveMultipleContentOpen}
          setMoveMultipleContentOpen={setMoveMultipleContentOpen}
          moveMultipleContentDetails={moveMultipleContentDetails}
          setMoveMultipleContentDetails={setMoveMultipleContentDetails}
          moveMultipleContentValue={moveMultipleContentValue}
          setMoveMultipleContentValue={setMoveMultipleContentValue}
          moveMultipleContentFolder={moveMultipleContentFolder}
          setMoveMultipleContentFolder={setMoveMultipleContentFolder}
          searchValue={searchValue}
          setSearchValue={(value: string | null) => setSearchValue(value)}
          handleSortOptionClick={() => {}}
          contentFolderSort={false}
          filterIcon={false}
          getScreenFolderDetails={() => getFolderData()}
        /> */}
        <div className="w-full p-4 pt-0">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 mt-0">
              <h4
                className="text-base font-medium text-primary_color cursor-pointer"
                onClick={() => router.back()}
              >
                Folder
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
                  className={`text-sm font-medium outline-none border-none ml-2 cursor-pointer p-2 bg-primary_color rounded border text-white px-4`}
                  style={filterFolderedContents.length === 0 ? { pointerEvents: "none", opacity: 0.6 } : {}}
                >
                  {selectAll ? "Unselect All" : "Select All"}
                </label>
              </div>
            </div>
          </div>
          {contentLoading ? (
            <div className="flex flex-wrap items-center">
              <ContentSkeleton />
            </div>
          ) : (
            <div className="mt-3">
              {filterFolderedContents.length > 0 ? (
                <div className="flex flex-wrap gap-2 w-full mt-5">
                  {filterFolderedContents.map((image) => (
                    // image.userId === signedInUserId &&
                    <div
                      key={image.id}
                      className={`content_folder_parent_wrapper relative h-[103px] w-[103px] cursor-pointer image_wrapper1 ${
                        activeImage?.id === image.id
                          ? "border-2 border-button_orange rounded"
                          : "border-none"
                      }`}
                      onClick={() => handleContentDetails(image)}
                    >
                      {image.url.slice(-3).toLowerCase() === "jpg" ||
                      image.url.slice(-3).toLowerCase() === "png" ? (
                        <Image
                          src={image.url as string}
                          layout="fill"
                          className={`rounded content_image1 ${
                            checkedItems.includes(image.id)
                              ? "checked_image1"
                              : ""
                          }`}
                          style={{ objectFit: "cover" }}
                          alt={image.name as string}
                        />
                      ) : (
                        <video
                          src={image.url}
                          className={`w-full h-full object-cover rounded ${
                            checkedItems.includes(image.id)
                              ? "checked_image1"
                              : ""
                          }`}
                          style={{
                            position: "absolute",
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                            zIndex: "1",
                            color: "transparent",
                          }}
                          controls={false}
                          autoPlay
                          loop
                        />
                      )}
                      <div
                        className="image_overlay1 flex items-start justify-between"
                        id="image_overlay1"
                      >
                        <p className="text-xs">
                          {image.url.slice(-3).toLowerCase() === "jpg" ? (
                            <ImageIcon size={16} />
                          ) : image.url.slice(-3).toLowerCase() === "png" ? (
                            <ImageIcon size={16} />
                          ) : (
                            <Video size={16} />
                          )}
                        </p>
                        <Input
                          type="checkbox"
                          className="image_checkbox1"
                          value={image.id}
                          id={image.id}
                          onChange={(e) => handleCheckboxChange(e, image.id)}
                          checked={checkedItems.includes(image.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-base font-medium text-secondary_color mt-3 w-full h-[55vh] flex items-center justify-center">
                  No content found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* content details sidebar code starts here */}
      {sidebar === true && (
        <div
          className="w-[329px] border-l border-border_gray p-5 hidden"
          id="content_details"
        >
          {selectedImage && (
            <>
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-primary_color">
                  Content Setting
                </h4>
                <Dialog
                  open={deleteImageDialogOpen}
                  onOpenChange={setDeleteImageDialogOpen}
                >
                  <DialogTrigger asChild>
                    <div className="py-2.5 px-3 rounded text-white bg-delete_color cursor-pointer transition-all duration-300 ease-in-out hover:bg-delete_color hover:text-white w-[44px] h-[40px]">
                      <Trash2 size={20} />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[397px] sm:max-h-[342px]">
                    <DialogHeader className="flex flex-col space-y-0">
                      <DialogTitle className="text-2xl font-semibold">
                        Delete Content
                      </DialogTitle>
                      <DialogDescription className="m-0">
                        Are you sure want to delete the content
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
                        onClick={handleImageDelete}
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
              <div className="w-full h-[158px] rounded mt-6 relative">
                {selectedImage.url.slice(-3).toLowerCase() === "jpg" ||
                selectedImage.url.slice(-3).toLowerCase() === "png" ? (
                  <Image
                    src={selectedImage.url}
                    layout="fill"
                    className="rounded"
                    style={{ objectFit: "cover" }}
                    alt={selectedImage.name}
                  />
                ) : (
                  <video
                    src={selectedImage.url}
                    className="w-full h-full object-cover rounded"
                    controls={false}
                    autoPlay
                    loop
                  />
                )}
              </div>
              <div className="w-full mt-5">
                <div>
                  <h4 className="text-sm font-medium text-primary_color mb-1.5">
                    File name
                  </h4>
                  <Input
                    type="text"
                    placeholder="Summer sale"
                    value={selectedImage.name}
                    onChange={(e) =>
                      setSelectedImage({
                        ...selectedImage,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                {/* <div className="mt-4">
                <h4 className="text-sm font-medium text-primary_color mb-1.5">
                  Add Tag
                </h4>
                <AddTag
                  initialTags={folderContentPlaylisttags}
                  onTagsChange={setFolderContentPlaylisttags}
                  selectedTag={selectedImage?.tag}
                  selectedId={selectedImage?.id}
                />
                <p>{selectedImage?.tag.map((tag) => `${tag.text}`)}</p>
              </div> */}
                <div className="pt-3">
                  <h4 className="text-sm font-medium mb-2">Playlist</h4>
                  <Popover open={playlistOpen} onOpenChange={setPlaylistOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={playlistOpen}
                        className="w-full justify-between"
                      >
                        {PlaylistValue && selectedPlaylistId !== null
                          ? PlaylistValue
                          : "Select playlist"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className={`p-0`} style={{ width: "97%" }}>
                      <Command>
                        <Input
                          placeholder="Search playlist..."
                          value={playlistSearchQuery}
                          className="rounded-none"
                          onChange={(e: any) =>
                            setPlaylistSearchQuery(e.target.value)
                          }
                        />
                        <CommandList>
                          {filteredPlaylist.length === 0 ? (
                            <CommandEmpty className="max-h-[60px] h-[30px] flex justify-center pt-1">
                              No playlists found
                            </CommandEmpty>
                          ) : (
                            <CommandGroup>
                              {filteredPlaylist.map((framework) => (
                                <CommandItem
                                  key={framework.id}
                                  value={framework.id}
                                  onSelect={(currentValue) => {
                                    // Toggle playlist selection: deselect if already selected
                                    const selectedValue =
                                      currentValue === selectedPlaylistId
                                        ? null
                                        : currentValue;

                                    setPlaylistValue(
                                      selectedValue
                                        ? playlistList.find(
                                            (playlist) =>
                                              playlist.id === selectedValue
                                          )?.playlistName || "Select Playlist"
                                        : "Select Playlist"
                                    );

                                    setSelectedPlaylistId(selectedValue);
                                    setPlaylistOpen(false);
                                    console.log(
                                      "Selected Playlist ID:",
                                      selectedValue
                                    );
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedPlaylistId === framework.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {framework.playlistName}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="mt-6 flex items-center gap-6 w-full">
                  <Button
                    variant={"outline"}
                    className="w-2/4"
                    onClick={handleContentCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-button_orange hover:bg-button_orange hover:opacity-75 w-2/4"
                    onClick={handleContentSave}
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
            </>
          )}
        </div>
      )}

      {/* content details sidebar code ends here */}

      {/* folder details sidebar code starts here */}
      {sidebar === true && (
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
            <AddTag
              initialTags={folderTags}
              onTagsChange={setFolderTags}
              selectedTag={folderTag || []}
              selectedId={folderId}
            />
          </div> */}
            <div className="pt-3">
              <h4 className="text-sm font-medium mb-2">Playlist</h4>
              <Popover
                open={folderPlaylistOpen}
                onOpenChange={setFolderPlaylistOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={folderPlaylistOpen}
                    className="w-full justify-between"
                    // onClick={() => setPlaylistError(false)}
                  >
                    {folderPlaylistValue
                      ? folderPlaylistList.find(
                          (framework) => framework.id === folderPlaylistValue
                        )?.playlistName
                      : "Select Playlist"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className={` p-0`} style={{ width: "97%" }}>
                  <Command>
                    <Input
                      placeholder="Search playlist..."
                      value={playlistSearchQuery}
                      className="rounded-none"
                      onChange={(e: any) =>
                        setPlaylistSearchQuery(e.target.value)
                      }
                    />
                    <CommandList>
                      {filteredFolderPlaylistList.length === 0 ? (
                        <CommandEmpty className="max-h-[60px] h-[30px] flex justify-center pt-1">
                          No playlists found
                        </CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {filteredFolderPlaylistList.map((framework) => (
                            <CommandItem
                              key={framework.id}
                              value={framework.id}
                              onSelect={(currentValue) => {
                                if (setFolderPlaylistValue) {
                                  setFolderPlaylistValue(
                                    currentValue === folderPlaylistValue
                                      ? null
                                      : currentValue
                                  );
                                }
                                if (setSelectedFolderPlaylistId) {
                                  setSelectedFolderPlaylistId(
                                    currentValue === folderPlaylistValue
                                      ? null
                                      : currentValue
                                  );
                                }

                                setFolderPlaylistOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  folderPlaylistValue === framework.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {framework.playlistName}
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
          <div className="mt-6 flex items-center gap-6 w-full">
            <Button
              className="bg-button_orange hover:bg-button_orange hover:opacity-75 w-full"
              onClick={() => handleFolderUpdate()}
              disabled={moveScreenLoader}
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
                "Save"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* folder details sidebar code ends here */}

      {/* Multiple select sidebar code starts here */}
      {checkedItems.length >= 0 && (
        <div
          className="w-[329px] border-l border-border_gray p-5 hidden"
          id="multiple_select_content"
        >
          <>
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-primary_color">
                Multiple Selection
              </h4>
              <Dialog
                open={multipleDeleteOpen}
                onOpenChange={setMultipleDeleteOpen}
              >
                <DialogTrigger asChild>
                  <div className="py-2.5 px-3 rounded text-white bg-delete_color cursor-pointer transition-all duration-300 ease-in-out hover:bg-delete_color hover:text-white w-[44px] h-[40px]">
                    <Trash2 size={20} />
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[397px] sm:max-h-[342px]">
                  <DialogHeader className="flex flex-col space-y-0">
                    <DialogTitle className="text-2xl font-semibold">
                      Delete Content
                    </DialogTitle>
                    <DialogDescription className="m-0">
                      Are you sure want to delete the content
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
                      onClick={handleMultipleDelete}
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
                  Item Selected
                </h4>
                <Input
                  type="text"
                  placeholder="Summer sale"
                  value={checkedItems.length}
                  readOnly
                  // onChange={(e) =>
                  //   setSelectedImage({ ...selectedImage, name: e.target.value })
                  // }
                />
              </div>
              {/* <div className="mt-4">
                <h4 className="text-sm font-medium text-primary_color mb-1.5">
                  Add Tag
                </h4>
                <AddTag
                  initialTags={multipleSelectInsideFolderTags}
                  onTagsChange={setMultipleSelectInsideFolderTags}
                  selectedTag={multipleSelectCheckedTags}
                  selectedId={multipleSelectCheckedTagsId}
                />
              </div> */}
              <div className="pt-3">
                <h4 className="text-sm font-medium mb-2">Playlist</h4>
                <Popover
                  open={multiSelectPlaylistOpen}
                  onOpenChange={setMultiSelectPlaylistOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={multiSelectPlaylistOpen}
                      className="w-full justify-between"
                      // onClick={() => setPlaylistError(false)}
                    >
                      {multiSelectPlaylistValue
                        ? multipleSelectPlaylistList.find(
                            (framework) =>
                              framework.id === multiSelectPlaylistValue
                          )?.playlistName
                        : "Select Playlist"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className={` p-0`} style={{ width: "97%" }}>
                    <Command>
                      <Input
                        placeholder="Search playlist..."
                        value={playlistSearchQuery}
                        className="rounded-none"
                        onChange={(e: any) =>
                          setPlaylistSearchQuery(e.target.value)
                        }
                      />
                      <CommandList>
                        {FilteredMultipleSelectPlaylistList.length === 0 ? (
                          <CommandEmpty className="max-h-[60px] h-[30px] flex justify-center pt-1">
                            No folders found.
                          </CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {FilteredMultipleSelectPlaylistList.map((framework) => (
                              <CommandItem
                                key={framework.id}
                                value={framework.id}
                                onSelect={(currentValue) => {
                                  if (setMultiSelectPlaylistValue) {
                                    setMultiSelectPlaylistValue(
                                      currentValue === multiSelectPlaylistValue
                                        ? null
                                        : currentValue
                                    );
                                  }
                                  setMultiSelectPlaylistOpen(false);
                                  if (setMultipleSelectedPlaylistId) {
                                    setMultipleSelectedPlaylistId(
                                      currentValue === multiSelectPlaylistValue
                                        ? null
                                        : currentValue
                                    );
                                  }
                                  console.log(
                                    "multipleSelectedPlaylistId ",
                                    multipleSelectedPlaylistId
                                  );
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    multiSelectPlaylistValue === framework.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {framework.playlistName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="mt-6 flex items-center gap-6 w-full">
                <Button
                  variant={"outline"}
                  className="w-2/4"
                  onClick={handleMultipleSelectCancel}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-button_orange hover:bg-button_orange hover:opacity-75 w-2/4"
                  onClick={handleMultipleSelectSave}
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
          </>
        </div>
      )}
      {/* Multiple select sidebar code ends here */}
    </div>
  );
};

export default FolderDetails;
