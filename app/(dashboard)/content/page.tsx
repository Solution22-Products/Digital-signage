"use client";
import SearchBar from "@/components/searchbar";
import {
  ImageUp,
  ChevronsUpDown,
  Trash2,
  ListVideo,
  Folder,
  Check,
  Search,
  Pencil,
  ImageIcon,
  Video,
  LoaderCircle,
  CalendarDays,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import AddTag from "@/components/add-tag";
import { supabase } from "@/utils/supabase/supabaseClient";
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
import "./style.css";
import { url } from "inspector";
import { any, promise } from "zod";
import { Tag } from "emblor";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import DefaultSkeleton, {
  ContentSkeleton,
  FolderSkeleton,
} from "@/components/skeleton-ui";
import { toast, useToast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import ContentSearch from "./component/searchbar";

interface ImagePreview {
  name: string;
  url: string;
  id: string;
  folder_id: string;
  tag: string;
  selected_playlist_id: string;
  isChecked: boolean;
  userId?: string;
  time: string;
}

interface contentFolderData {
  id: string;
  name: string;
}

interface PlaylistItem {
  id: string;
  playlistName: string;
}

const ContentPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [folderOpen, setFolderOpen] = useState(true);
  const [file, setFile] = useState<File[] | null>(null);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImagePreview | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sidebar, setSidebar] = useState(true);

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [ContentFolderName, setContentFolderName] = useState<
    contentFolderData[]
  >([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [playlistOpen, setPlaylistOpen] = useState(false);

  const [PlaylistValue, setPlaylistValue] = useState<string | null>(null);
  const [playlistList, setPlaylistList] = useState<PlaylistItem[]>([]);
  const [contentValue, setContentValue] = useState<string | null>("");
  const [activeImage, setActiveImage] = useState<ImagePreview | null>(null);

  // const [contentPlaylisttags, setContentPlaylisttags] = useState<Tag[]>([]);
  const [multiselectContentTags, setMultiselectContentTags] = useState<Tag[]>(
    []
  );
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    ""
  );
  const [contentMove, setContentMove] = useState(false);
  const [contentMoveDetails, setContentMoveDetails] =
    useState<ImagePreview | null>(null);

  const [contentMoveFolder, setContentMoveFolder] = useState<string | null>("");
  const [contentMoveValue, setContentMoveValue] = useState<string | null>("");
  const [moveContentOpen, setMoveContentOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const [folderCheckedItems, setFolderCheckedItems] = useState<string[]>([]);
  const [folderChecked, setFolderChecked] = useState(false);

  const [checked, setChecked] = useState(false);
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
  const [uploading, setUploading] = useState(false);

  const [signedInUserId, setSignedInUserId] = useState<string | null>("");

  const [contentFolderLoading, setContentFolderLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [searchValue, setSearchValue] = useState<string | null>("");
  const [sortedValue, setSortedValue] = useState<string | null>("");
  const [selectAll, setSelectAll] = useState(false);

  const [deleteMultipleContentFolder, setDeleteMultipleContentFolder] =
    useState(false);
  const [deleteMultipleContentFolderOpen, setDeleteMultipleContentFolderOpen] =
    useState(false);
  const [folderSelectAll, setFolderSelectAll] = useState(false);
  const [
    multipleFolderContentMoveDetails,
    setMultipleFolderContentMoveDetails,
  ] = useState<any>([]);
  const [addLoader, setAddLoader] = useState(false);
  const [moveScreenLoader, setMoveScreenLoader] = useState(false);
  const [multiSaveLoader, setMultiSaveLoader] = useState(false);
  const [folderLoader, setFolderLoader] = useState<string[]>([]);
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState("");
  const [uploadErrorMessage, setUploadErrorMessage] = useState(false);
  const [listViewShow, setListViewShow] = useState(false);

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

  const router = useRouter();

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

  const handleFileChange = (event: any) => {
    const validExtensions = ["jpg", "jpeg", "png", "mp4"]; // Allowed file extensions
    const selectedFiles = Array.from(event.target.files || []);

    // Reset the error states initially
    setUploadError(false);
    setUploadErrorMessage(false);

    if (!selectedFiles.length) {
      setUploadError(true); // Set error if no file is selected
      setUploadErrorMessage(false); // Ensure no file type error message is shown
      setUploading(false);
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
      setUploading(false);
    } else {
      setUploadErrorMessage(false); // Clear error message if all files are valid
      setUploading(false);
    }

    // Update state with valid files
    setFile((prevFiles: any) => [...(prevFiles || []), ...validFiles]);
  };

  useEffect(() => {
    setSignedInUserId(localStorage.getItem("userId"));
  }, []);

  const handleRemoveFile = (index: number) => {
    setFile((prevFiles: any) =>
      prevFiles.filter((_: any, i: any) => i !== index)
    );
  };

  // const handleUploadClick = async () => {
  //   if (!file || file.length === 0) {
  //     setUploadError(true); // Set error for no file selected
  //     setUploadErrorMessage(false); // Clear file type error message
  //     return;
  //   }

  //   // Clear previous errors before uploading
  //   setUploadError(false);
  //   setUploadErrorMessage(false);
  //   setUploading(true);

  //   const uploadedFiles = [];

  //   for (const selectedfile of file as any[]) {
  //     const { data, error } = await supabase.storage
  //       .from("screen-images")
  //       .upload(selectedfile.name, selectedfile, {
  //         cacheControl: "3600",
  //         upsert: true,
  //       });

  //     if (error) {
  //       console.error("Upload error:", error);
  //       setUploadError(true); // Set generic error if upload fails
  //       setUploading(false);
  //       return;
  //     }

  //     const publicURL = supabase.storage
  //       .from("screen-images")
  //       .getPublicUrl(data?.path).data.publicUrl;

  //       console.log("file data", data);

  //     let duration = null;

  //     // Check if the file is a video
  //     if (selectedfile.type.startsWith("video")) {
  //       duration = await getVideoDuration(publicURL);
  //     }

  //     uploadedFiles.push({
  //       name: selectedfile.name,
  //       url: publicURL,
  //       duration: duration,
  //     });
  //   }

  //   const { data: contentData, error: contentError } = await supabase
  //     .from("content")
  //     .insert(
  //       uploadedFiles.map((file: any) => ({
  //         name: file.name,
  //         url: file.url,
  //         duration: file.duration || 10,
  //         folder_id: selectedFolderId || null,
  //         userId: signedInUserId || null,
  //       }))
  //     )
  //     .select();

  //   if (contentError) {
  //     console.error("Error uploading files:", contentError);
  //     setUploadError(true); // Set error if content insert fails
  //     setUploading(false);
  //     return;
  //   }

  //   // Success handling
  //   toast({
  //     title: "Updated Successfully!",
  //     description: "Content has been updated successfully!",
  //     action: <ToastAction altText="Ok">Ok</ToastAction>,
  //   });

  //   setImagePreviews(contentData as any);
  //   setFile([]);
  //   setUploadOpen(false);
  //   getContentImages();
  //   setSelectedFolderId('');
  //   setContentValue("");
  //   setUploading(false);
  // };

  const handleUploadClick = async () => {
    if (!file || file.length === 0) {
      setUploadError(true); // Set error for no file selected
      setUploadErrorMessage(false); // Clear file type error message
      return;
    }

    // Clear previous errors before uploading
    setUploadError(false);
    setUploadErrorMessage(false);
    setUploading(true);

    const uploadedFiles = [];

    for (const selectedFile of file as any[]) {
      // Generate thumbnail based on file type (image or video)
      let thumbnailUrl = null;
      let thumbnailFile = null;

      if (selectedFile.type.startsWith("image")) {
        thumbnailFile = await generateImageThumbnail(selectedFile);
      } else if (selectedFile.type.startsWith("video")) {
        thumbnailFile = await generateVideoThumbnail(selectedFile);
      }

      // Upload the original file
      const { data, error } = await supabase.storage
        .from("screen-images")
        .upload(selectedFile.name, selectedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        console.error("Upload error:", error);
        setUploadError(true); // Set generic error if upload fails
        setUploading(false);
        return;
      }

      const publicURL = supabase.storage
        .from("screen-images")
        .getPublicUrl(data?.path).data.publicUrl;

      // Upload the thumbnail (if available)
      if (thumbnailFile) {
        const thumbFileName =
          selectedFile.name.replace(/\.[^/.]+$/, "") + "-thumb"; // Appending -thumb to file name

        const { data: thumbData, error: thumbError } = await supabase.storage
          .from("screen-images")
          .upload(thumbFileName, thumbnailFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (thumbError) {
          console.error("Thumbnail upload error:", thumbError);
          setUploadError(true); // Set error for thumbnail upload
          setUploading(false);
          return;
        }

        thumbnailUrl = supabase.storage
          .from("screen-images")
          .getPublicUrl(thumbData?.path).data.publicUrl;
      }

      let duration = null;

      // Check if the file is a video
      if (selectedFile.type.startsWith("video")) {
        duration = await getVideoDuration(publicURL);
      }

      uploadedFiles.push({
        name: selectedFile.name,
        url: publicURL,
        thumbnail: thumbnailUrl || publicURL, // If no thumbnail, use original URL as a fallback
        duration: duration,
      });
    }

    const { data: contentData, error: contentError } = await supabase
      .from("content")
      .insert(
        uploadedFiles.map((file: any) => ({
          name: file.name,
          url: file.url,
          file_details: file.thumbnail, // Store thumbnail URL
          duration: file.duration || 10,
          folder_id: selectedFolderId || null,
          userId: signedInUserId || null,
        }))
      )
      .select();

    if (contentError) {
      console.error("Error uploading files:", contentError);
      setUploadError(true); // Set error if content insert fails
      setUploading(false);
      return;
    }

    // Success handling
    toast({
      title: "Updated Successfully!",
      description: "Content has been updated successfully!",
      action: <ToastAction altText="Ok">Ok</ToastAction>,
    });

    setImagePreviews(contentData as any);
    setFile([]);
    setUploadOpen(false);
    getContentImages();
    setSelectedFolderId("");
    setContentValue("");
    setUploading(false);
  };

  // Helper function to generate image thumbnail with clarity
  const generateImageThumbnail = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new (window as any).Image() as HTMLImageElement;
        img.src = event.target.result;

        img.onload = () => {
          const maxWidth = 300; // Set the maximum width for the thumbnail
          const maxHeight = 300; // Set the maximum height for the thumbnail

          let width = img.width;
          let height = img.height;

          // Calculate the scaling factor to maintain the aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.floor((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.floor((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");

          // Draw the image onto the canvas at the calculated size
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert the canvas to a Blob (to simulate a File object)
          canvas.toBlob((blob) => {
            if (blob) {
              const thumbnailFile = new File([blob], "thumbnail.png", {
                type: "image/png",
              });
              resolve(thumbnailFile);
            } else {
              reject(new Error("Failed to generate thumbnail"));
            }
          }, "image/png");
        };
      };

      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Helper function to generate a video thumbnail (or use the video as it is)
  const generateVideoThumbnail = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith("video")) {
        // Ensure the video is saved as an MP4
        const videoElement = document.createElement("video");
        videoElement.src = URL.createObjectURL(file);

        videoElement.onloadedmetadata = () => {
          // Create an MP4 file from the original video
          const videoFile = new File(
            [file],
            file.name.replace(/\.[^/.]+$/, ".mp4"), // Ensure MP4 extension
            {
              type: "video/mp4",
            }
          );
          resolve(videoFile);
        };

        videoElement.onerror = (error) =>
          reject(new Error("Failed to load video file"));
      } else {
        reject(new Error("File is not a video"));
      }
    });
  };

  const handleContentUploadCancel = () => {
    setFile([]);
    setUploadOpen(false);
    setContentValue("");
    setSelectedFolderId("");
    setContentMove(false);
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

  const handleCancel = () => {
    const details = document.getElementById("content_details");
    if (details) {
      // console.log("Before reset:", { contentPlaylisttags });
      details.style.display = "none";
      setActiveImage(null);
      setContentMove(false);
      setPlaylistValue("");
    }
    setSelectedImage(null);
  };

  const folderCancel = () => {
    const details = document.getElementById("folder_details");
    if (details) {
      handleCancel();
      details.style.display = "none";
    }
  };

  const handleMultipleSelectCancel = () => {
    const details = document.getElementById("multiple_select_content");
    if (details) {
      // console.log("Before reset:", { multiselectContentTags });
      details.style.display = "none";
      setCheckedItems([]);
      setContentMove(false);
      setMoveMultipleContent(false);
      setChecked(false);
      setMultiSelectPlaylistValue("");
      setMultiselectContentTags([]);
      setSelectAll(false);
      setSidebar(true);
      setActiveImage(null);
      // console.log("After reset:", { multiselectContentTags });
    }
  };

  const handleContentdetails = async (preview: ImagePreview) => {
    if (checked) {
      handleCancel();
      // console.log("checked ", checked);
    } else {
      // console.log("notchecked ", checked);
      const details = document.getElementById("content_details");
      if (details) {
        folderCancel();
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
          // console.log("playlist data:", data);
          setPlaylistValue(data ? data.playlistName || null : null);
        }
      }

      setSelectedImage(preview);
      setSelectedPlaylistId(preview.selected_playlist_id || null);
      setActiveImage(preview);
      setContentMove(true);
      setMoveMultipleContent(false);
      setContentMoveDetails({ ...preview });
      fetchPlaylist();
    }
  };

  const getContentImages = async () => {
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("is_deleted", 0)
      .eq("userId", signedInUserId);
    if (error) {
      console.error("Error fetching data:", error);
      setContentLoading(false);
    } else {
      setImagePreviews(data as any);
      setContentLoading(false);
    }
  };

  const getFolderData = async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("userId", signedInUserId)
      .eq("is_deleted", 0)
      .eq("folder_type", "content");
    if (error) {
      console.error("Error fetching data:", error);
      setContentFolderLoading(false);
    } else {
      setContentFolderName(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      setContentFolderLoading(false);
    }
  };

  const fetchPlaylist = async () => {
    const userId = localStorage.getItem("userId");
    const { data, error } = await supabase
      .from("playlistDetails")
      .select("*")
      .eq("is_deleted", 0)
      .eq("userId", userId);
    if (error) {
      console.error("Error fetching data p:", error);
    } else if (data) {
      setPlaylistList(data);
      setMultipleSelectPlaylistList(data);
    }
  };

  const handleFolderDetails = async (folder: any) => {
    if (checked) {
      return;
    }
    setFolderLoader((prev: any) => [...prev, folder.id]);
    (prev: any) => prev.filter((id: any) => id !== folder.id);
    router.push(`/content-folder-details/${folder.id}`);
  };

  const handleContentSave = async () => {
    if (!selectedImage) return;
    setMoveScreenLoader(true);

    // Update the content with the new name and playlist ID if provided
    const { data, error } = await supabase
      .from("content")
      .update({
        name: selectedImage.name,
        selected_playlist_id: selectedPlaylistId || null, // Update with null if no playlist is selected
      })
      .eq("id", selectedImage.id)
      .select("*");

    if (error) {
      console.error("Error saving content:", error);
      setMoveScreenLoader(false);
      return;
    }

    // Update the playlist if a playlist is selected
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

      if (playlistError) {
        console.error("Error saving playlist:", playlistError);
        setMoveScreenLoader(false);
        return;
      }
    } else if (!selectedPlaylistId && selectedImage.id) {
      // If no playlist is selected, update the playlist to clear content from the old playlist
      const updatedPlaylistList = playlistList.map((playlist: any) => {
        if (playlist.id === selectedImage.id) {
          return {
            ...playlist,
            playlistImages: playlist.playlistImages.filter(
              (image: any) => image.id !== selectedImage.id
            ),
          };
        }
        return playlist;
      });

      setPlaylistList(updatedPlaylistList);

      const { error: playlistError } = await supabase
        .from("playlistDetails")
        .update({
          playlistImages: updatedPlaylistList.find(
            (playlist) => playlist.id === selectedImage.id
          )?.playlistImages,
        })
        .eq("id", selectedImage.id);

      if (playlistError) {
        console.error("Error clearing playlist content:", playlistError);
        setMoveScreenLoader(false);
        return;
      }
    }

    toast({
      title: "Updated Successfully!",
      description: "Content has been updated successfully!",
      action: <ToastAction altText="Ok">Ok</ToastAction>,
    });

    setMoveScreenLoader(false);
    setSelectedPlaylistId(null);
    handleCancel();
    setPlaylistValue("");
    getContentImages();
  };

  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: string
  ) => {
    const isChecked = event.target.checked;

    // Update checked state
    setChecked(isChecked);

    // Update checkedItems state immediately
    setCheckedItems((prevCheckedItems) => {
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
          handleCancel();

          if (checkedItems.length > 2) {
            setContentMove(false);
            setMoveMultipleContent(true);
            handleCancel();
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
            handleCancel();
          } else {
            // setSelectAll(false);
            setSidebar(true);
            setContentMove(false);
            setMoveMultipleContent(false);
          }
        }
      }

      setMoveMultipleContentDetails(updatedCheckedItems as any);
      // console.log("updatedCheckedItems:", updatedCheckedItems);
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
    // const details1 = document.getElementById("folder-settings");
    // if (details1) {
    //   details1.style.display = "none";
    // }

    const details2 = document.getElementById("content_details");
    if (details2) {
      details2.style.display = "none";
    }
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
        setDeleteMultipleContentFolder(true);
        updatedCheckedItems = [...prevCheckedItems, index];
      } else {
        updatedCheckedItems = prevCheckedItems.filter((item) => item !== index);
      }

      setMultipleFolderContentMoveDetails(updatedCheckedItems as any);
      if (updatedCheckedItems.length <= 0) {
        setDeleteMultipleContentFolder(false);
        setFolderSelectAll(false);
      }

      return updatedCheckedItems;
    });
  };

  const handleMultipleSelectSave = async () => {
    setMultiSaveLoader(true);

    const sample: any[] = [];

    // Update content with selected playlist ID and tag
    for (const item of checkedItems) {
      const { data: updateData, error: updateError } = await supabase
        .from("content")
        .update({
          ...(multipleSelectedPlaylistId && {
            selected_playlist_id: multipleSelectedPlaylistId,
          }),
          tag: multiselectContentTags, // Update the tag
        })
        .eq("id", item)
        .select("*");

      if (updateError) {
        setMultiSaveLoader(false);
        console.error(`Error saving content for id ${item}:`, updateError);
      } else {
        sample.push(updateData[0]);
      }
    }

    // If playlist ID and playlist list are available, update the playlist details
    if (multipleSelectedPlaylistId && multipleSelectPlaylistList) {
      const fetchImageUrls = async (sample: any[]) => {
        // console.log("multi select images ", sample);
        return await Promise.all(
          sample.map(async (image: any) => {
            const { data, error } = await supabase
              .from("content")
              .select("url")
              .eq("id", image.id)
              .single();
            if (error) {
              setMultiSaveLoader(false);
              console.error("Error fetching data:", error);
            } else {
              // console.log("console data ", data);
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

      // console.log("multipleSelectedPlaylistId ", multipleSelectedPlaylistId);

      if (playlistError) {
        setMultiSaveLoader(false);
        console.error("Error saving playlist:", playlistError);
      }
    }
    handleMultipleSelectCancel();
    setMultiSaveLoader(false);
    //notify("Content updated successfully", true);
    toast({
      title: "Updated Successfully!.",
      description: "Content has updated successfully!",
      action: <ToastAction altText="Ok">Ok</ToastAction>,
    });
  };

  useEffect(() => {
    if (signedInUserId) {
      getContentImages();
      getFolderData();
      fetchPlaylist();
      // console.log("checkedItems ", checkedItems);
    }
  }, [signedInUserId]);

  useEffect(() => {
    if (ContentFolderName.length > 0) {
      setTimeout(() => {
        setContentFolderLoading(false);
      }, 500);
    }
    if (imagePreviews.length > 0) {
      setTimeout(() => {
        setContentLoading(false);
      }, 500);
    }
  }, [ContentFolderName, imagePreviews]);

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
    items: ImagePreview[], // Assuming FolderData is the type for folders
    sortOrder: string | null,
    key: "name" // Key to sort by: screenname for screens, name for folders
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

  const filteredContent = filterBySearchValue(
    imagePreviews,
    "url",
    searchValue as string
  );
  const filteredContentFolder = sortItems(
    filterBySearchValue(ContentFolderName, "name", searchValue as string),
    sortedValue,
    "name"
  );
  const handleSortOptionClick = (sortOrder: string) => {
    setSortedValue(sortOrder);
    // setSortDropdownOpen(false);
  };

  const handleSelectAll = () => {
    // console.log("selectAll ", selectAll);
    setSelectAll(!selectAll);

    const applicableContent = filteredContent
      .filter(
        (preview) =>
          preview.folder_id === null && preview.userId === signedInUserId
      )
      .map((preview) => preview.id);

    // console.log("applicableContent ", applicableContent);

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

    handleCancel();
  };

  const handleSelectAllFolder = () => {
    setFolderSelectAll(!folderSelectAll);

    const applicableContent = filteredContentFolder
      .filter((preview) => preview.userId === signedInUserId)
      .map((preview) => preview.id);
    if (!folderSelectAll && applicableContent.length > 0) {
      // Select all applicable content
      setFolderCheckedItems(applicableContent as any[]);
      setMultipleFolderContentMoveDetails(applicableContent as any[]);
      setDeleteMultipleContentFolder(true);
    } else {
      // Unselect all
      setFolderCheckedItems([]);
      setDeleteMultipleContentFolder(false);
      setMultipleFolderContentMoveDetails([]);
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
          displayplus={<ImageUp size={20} />}
          calendarIcon={<CalendarDays size={20} />}
          calendar={false}
          uploadFile={true}
          createContentFolder={true}
          selectedfile={file as any}
          setSelectedfile={handleContentUploadCancel}
          screenData={() => {}}
          handleRemoveFile={handleRemoveFile}
          handleUploadClick={handleUploadClick}
          handleFileChange={handleFileChange}
          uploadOpen={uploadOpen}
          setUploadOpen={setUploadOpen}
          uploadError={uploadError}
          uploadErrorMessage={uploadErrorMessage}
          createFolderOpen={createFolderOpen}
          setCreateFolderOpen={setCreateFolderOpen}
          getFolderData={getFolderData}
          selectedFolderId={selectedFolderId}
          setSelectedFolderId={setSelectedFolderId as any}
          contentValue={contentValue}
          setContentValue={setContentValue}

          contentMove={contentMove}
          setContentMove={setContentMove}
          contentMoveDetails={contentMoveDetails}
          contentMoveValue={contentMoveValue}
          setContentMoveValue={setContentMoveValue}
          contentMoveFolder={contentMoveFolder}
          setContentMoveFolder={setContentMoveFolder}
          moveContentOpen={moveContentOpen}
          setMoveContentOpen={setMoveContentOpen}
          getContentImages={getContentImages}
          handleCancel={() => handleCancel()}
          handleMultipleSelectCancel={() => handleMultipleSelectCancel()}
          moveMultipleContent={moveMultipleContent}
          moveMultipleContentOpen={moveMultipleContentOpen}
          setMoveMultipleContentOpen={setMoveMultipleContentOpen}
          moveMultipleContentDetails={moveMultipleContentDetails}
          setMoveMultipleContentDetails={setMoveMultipleContentDetails}
          moveMultipleContentValue={moveMultipleContentValue}
          setMoveMultipleContentValue={setMoveMultipleContentValue}
          moveMultipleContentFolder={moveMultipleContentFolder}
          setMoveMultipleContentFolder={setMoveMultipleContentFolder}
          uploading={uploading}
          setUploading={setUploading}
          searchValue={searchValue}
          setSearchValue={(value: string | null) => setSearchValue(value)}
          handleSortOptionClick={handleSortOptionClick as any}
          contentFolderSort={true}
          filterIcon={false}
          getScreenFolderDetails={() => getFolderData()}
          setFolderSelectAll={setFolderSelectAll}
          multipleFolderContentMoveDetails={multipleFolderContentMoveDetails}
          setMultipleFolderContentMoveDetails={
            setMultipleFolderContentMoveDetails
          }
          dashboardMoveButton={true}
          setFolderCheckedItems={setFolderCheckedItems}
        /> */}

        <ContentSearch
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          uploadOpen={uploadOpen}
          setUploadOpen={setUploadOpen}
          createContentFolder={true}
          ContentFolderName={ContentFolderName}
          getFolderData={() => getFolderData()}
          sortIcon={true}
          handleSortOptionClick={handleSortOptionClick as any}
          getContentFolderData={() => {}}
          selectedfile={file as any}
          setSelectedfile={handleContentUploadCancel}
          handleFileChange={handleFileChange}
          handleRemoveFile={handleRemoveFile}
          handleUploadClick={handleUploadClick}
          uploadError={uploadError}
          uploadErrorMessage={uploadErrorMessage}
          uploadContentInsideFolder={false}
          contentValue={contentValue}
          setContentValue={setContentValue}
          selectedFolderId={selectedFolderId}
          setSelectedFolderId={setSelectedFolderId as any}
          uploading={uploading}
          setUploading={setUploading}
          createFolderOpen={createFolderOpen}
          setCreateFolderOpen={setCreateFolderOpen}
          contentMove={contentMove}
          setContentMove={setContentMove}
          moveContentOpen={moveContentOpen}
          setMoveContentOpen={setMoveContentOpen}
          contentMoveValue={contentMoveValue}
          setContentMoveValue={setContentMoveValue}
          setContentMoveFolder={setContentMoveFolder}
          moveMultipleContentValue={moveMultipleContentValue}
          setMoveMultipleContentValue={setMoveMultipleContentValue}
          contentMoveDetails={contentMoveDetails}
          getContentImages={() => getContentImages()}
          handleCancel={() => handleCancel()}
          handleMultipleSelectCancel={() => handleMultipleSelectCancel()}
          dashboardMoveButton={true}
          moveMultipleContent={moveMultipleContent}
          moveMultipleContentOpen={moveMultipleContentOpen}
          setMoveMultipleContentOpen={setMoveMultipleContentOpen}
          setMoveMultipleContentFolder={setMoveMultipleContentFolder}
          moveMultipleContentDetails={moveMultipleContentDetails}
          deleteMultipleContentFolder={deleteMultipleContentFolder}
          setDeleteMultipleContentFolder={setDeleteMultipleContentFolder}
          deleteMultipleContentFolderOpen={deleteMultipleContentFolderOpen}
          setDeleteMultipleContentFolderOpen={
            setDeleteMultipleContentFolderOpen
          }
          multipleFolderContentMoveDetails={multipleFolderContentMoveDetails}
          setMultipleFolderContentMoveDetails={
            setMultipleFolderContentMoveDetails
          }
          setFolderSelectAll={setFolderSelectAll}
          setFolderCheckedItems={setFolderCheckedItems}
          checkedItems={checkedItems}
          setCheckedItems={setCheckedItems}
          setMoveMultipleContentDetails={setMoveMultipleContentDetails}
          handleMultiSelectCancelWithoutCheckedItems={() => {}}
          listViewShow={listViewShow}
          setListViewShow={setListViewShow}
          contentOnlyFn={true}
        />

        <div className="w-full p-4 pt-0">
          <div className="image-section">
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="w-full space-y-2"
            >
              <div className="flex items-center justify-between space-x-4">
                <h4 className="text-base font-bold text-primary_color">
                  Content
                </h4>
                {/* {
                  checkedItems.map((item, index) => (
                    <p key={index}>{item}</p>
                  ))

                } */}
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
                          filteredContent.filter(
                            (preview) => preview.folder_id === null
                          ).length === 0
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
              <CollapsibleContent className="px-0 py-0 flex flex-wrap gap-2">
                {listViewShow ? (
                  <table className="text-center border border-gray-300 w-full mt-2">
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
                        <th className="w-[25%] border border-gray-300">
                          {/* Added border */}
                          File Type
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContent.filter(
                        (preview) => preview.folder_id === null
                      ).length > 0 ? (
                        filteredContent.map(
                          (screenData: any) =>
                            screenData.folder_id === null && (
                              <tr
                                key={screenData.id}
                                className="border border-gray-300"
                                onClick={() => handleContentdetails(screenData)}
                              >
                                {/* Added border */}
                                <td className="w-[50%] border border-gray-300">
                                  {/* Added border */}
                                  <div className="image_wrapper_list">
                                    <Input
                                      type="checkbox"
                                      className="image_checkbox_content_list"
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
                                      key={screenData.id}
                                      className={`mt-[-5px] pb-[10px] bg-none cursor-pointer screen_wrapper flex items-center gap-1.5`}
                                    >
                                      <p className="text-sm font-medium pl-5 truncate overflow-hidden text-ellipsis">
                                        {screenData.name.length > 25
                                          ? `${screenData.name.slice(0, 28)}...`
                                          : screenData.name}
                                      </p>
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
                                  {/* Added border */}
                                  <p className="text-sm font-medium truncate uppercase">
                                    {screenData.url.slice(-3).toLowerCase()}
                                  </p>
                                </td>
                              </tr>
                            )
                        )
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center py-4">
                            <p className="text-base font-medium text-secondary_color">
                              No content found
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : contentLoading ? (
                  <ContentSkeleton />
                ) : (
                  <div className="w-full">
                    {filteredContent.filter(
                      (preview) => preview.folder_id === null
                    ).length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {filteredContent.map(
                          (preview, index) =>
                            preview.folder_id === null && (
                              <div
                                key={index}
                                className={`relative h-[103px] w-[103px] cursor-pointer image_wrapper ${
                                  activeImage?.id === preview.id
                                    ? "border-2 border-button_orange rounded"
                                    : "border-none"
                                }`}
                                onClick={() => handleContentdetails(preview)}
                              >
                                {preview.url.slice(-3).toLowerCase() ===
                                  "jpg" ||
                                preview.url.slice(-3).toLowerCase() ===
                                  "png" ? (
                                  <Image
                                    src={preview.url as string}
                                    // src={
                                    //   preview.file_details
                                    //     ? preview.file_details
                                    //     : ""
                                    // }
                                    layout="fill"
                                    className={`rounded content_image ${
                                      checkedItems.includes(preview.id)
                                        ? "checked_image"
                                        : ""
                                    }`}
                                    style={{ objectFit: "cover" }}
                                    alt={preview.name as string}
                                  />
                                ) : (
                                  <video
                                    src={preview.url}
                                    // src={
                                    //   preview.file_details
                                    //     ? preview.file_details
                                    //     : ""
                                    // }
                                    className={`w-full h-full object-cover rounded ${
                                      checkedItems.includes(preview.id)
                                        ? "checked_image"
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
                                    typeof="video/mp4"
                                    muted
                                  />
                                )}
                                <div
                                  className="image_overlay flex items-start justify-between"
                                  id="image_overlay"
                                >
                                  <p className="text-xs">
                                    {preview.url.slice(-3).toLowerCase() ===
                                    "jpg" ? (
                                      <ImageIcon size={16} />
                                    ) : preview.url.slice(-3).toLowerCase() ===
                                      "png" ? (
                                      <ImageIcon size={16} />
                                    ) : (
                                      <Video size={16} />
                                    )}
                                  </p>
                                  <Input
                                    type="checkbox"
                                    className="image_checkbox"
                                    value={preview.id}
                                    id={preview.id}
                                    onChange={(e) =>
                                      handleCheckboxChange(e, preview.id)
                                    }
                                    checked={checkedItems.includes(preview.id)}
                                  />
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    ) : (
                      <div className="w-full flex justify-center items-center">
                        <p className="text-base font-medium text-secondary_color mt-0">
                          No content found
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
                          filteredContentFolder.length === 0
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
                      {filteredContentFolder.length > 0 ? (
                        filteredContentFolder.map((screenData: any) => (
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
                              <div className="content_Folder_checkbox">
                                <Input
                                  type="checkbox"
                                  className="image_checkbox_listview_new"
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
                                  onClick={() =>
                                    handleFolderDetails(screenData)
                                  }
                                  key={screenData.id}
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
                  <div className="folder-section -mt-2">
                    {contentFolderLoading ? (
                      <div className="flex flex-wrap items-center mt-2">
                        <DefaultSkeleton />
                      </div>
                    ) : (
                      <div className="w-full">
                        {filteredContentFolder.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-6">
                            {filteredContentFolder.map((folder: any) => (
                              <div
                                key={folder.id}
                                className="content_Folder_checkbox relative -mt-4"
                              >
                                <Input
                                  type="checkbox"
                                  className="image_checkbox_new"
                                  value={folder.id}
                                  id={folder.id}
                                  onChange={(e) =>
                                    handleFolderCheckboxChange(e, folder.id)
                                  }
                                  checked={folderCheckedItems.includes(
                                    folder.id
                                  )}
                                />
                                <div
                                  onClick={() => handleFolderDetails(folder)}
                                  className={`h-14 w-56 bg-zinc-50 border border-border_gray rounded px-3 py-2 cursor-pointer flex items-center gap-1.5`}
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
                {/* <Dialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
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
                </Dialog> */}
              </div>
              <div className="w-full h-[140px] rounded mt-6 relative">
                {selectedImage.url.slice(-3).toLowerCase() === "jpg" ||
                selectedImage.url.slice(-3).toLowerCase() === "png" ? (
                  <Image
                    src={selectedImage.url}
                    layout="fill"
                    className="rounded"
                    style={{ objectFit: "contain" }}
                    alt={selectedImage.name}
                  />
                ) : (
                  <video
                    src={selectedImage.url}
                    className="w-full h-full object-contain rounded"
                    controls={false}
                    autoPlay
                    loop
                    typeof="video/mp4"
                    muted
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
                  initialTags={contentPlaylisttags}
                  onTagsChange={setContentPlaylisttags}
                  selectedTag={
                    typeof selectedImage?.tag === "string"
                      ? [{ id: "", text: selectedImage?.tag }]
                      : selectedImage?.tag || []
                  }
                  selectedId={selectedImage?.id}
                />
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
                                    // console.log(
                                    //   "Selected Playlist ID:",
                                    //   selectedValue
                                    // );
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
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-button_orange hover:bg-button_orange hover:opacity-75 w-2/4"
                    onClick={handleContentSave}
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
            </>
          )}
        </div>
      )}

      {checkedItems.length >= 0 && (
        <div
          className="w-[329px] border-l border-border_gray p-5 hidden"
          id="multiple_select_content"
        >
          <>
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-primary_color">
                Multiple Content Selection
              </h4>
              {/* <Dialog
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
              </Dialog> */}
            </div>

            <div className="mt-5">
              <div>
                <h4 className="text-sm font-medium text-primary_color mb-1.5">
                  Content Selected
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
                  initialTags={multiselectContentTags}
                  onTagsChange={setMultiselectContentTags}
                  selectedTag={
                    typeof selectedImage?.tag === "string"
                      ? [{ id: "", text: selectedImage?.tag }]
                      : selectedImage?.tag || []
                  }
                  selectedId={selectedImage?.id}
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
                            {FilteredMultipleSelectPlaylistList.map(
                              (framework) => (
                                <CommandItem
                                  key={framework.id}
                                  value={framework.id}
                                  onSelect={(currentValue) => {
                                    if (setMultiSelectPlaylistValue) {
                                      setMultiSelectPlaylistValue(
                                        currentValue ===
                                          multiSelectPlaylistValue
                                          ? null
                                          : currentValue
                                      );
                                    }
                                    setMultiSelectPlaylistOpen(false);
                                    if (setMultipleSelectedPlaylistId) {
                                      setMultipleSelectedPlaylistId(
                                        currentValue ===
                                          multiSelectPlaylistValue
                                          ? null
                                          : currentValue
                                      );
                                    }
                                    // console.log(
                                    //   "multipleSelectedPlaylistId ",
                                    //   multipleSelectedPlaylistId
                                    // );
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
                              )
                            )}
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
                  disabled={multiSaveLoader}
                >
                  {multiSaveLoader ? (
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

      {/* content details sidebar code ends here */}
    </div>
  );
};

export default ContentPage;
