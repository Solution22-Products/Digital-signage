import GlobalSearchBar from "@/components/global-searchbar";
import { toast, useToast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
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
  Check,
  ChevronsUpDown,
  CircleAlert,
  CirclePlus,
  CircleX,
  Ellipsis,
  FolderPlus,
  FolderSymlink,
  GalleryThumbnails,
  ImageUp,
  List,
  Trash2,
} from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from "react-select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
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
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface Props {
  searchValue: string | null;
  setSearchValue: (value: string) => void;
  uploadOpen?: boolean;
  setUploadOpen?: (open: boolean) => void;
  createContentFolder?: boolean;
  ContentFolderName?: any;
  getFolderData: () => void;
  handleSortOptionClick: (option: string) => void;
  getContentFolderData: () => void;
  selectedfile?: File[] | null;
  setSelectedfile?: () => void;
  handleFileChange?: (event: any) => void;
  handleRemoveFile?: (index: number) => void;
  handleUploadClick?: () => void;
  uploadError?: boolean;
  uploadErrorMessage?: boolean;
  uploadContentInsideFolder?: boolean;
  contentValue?: string | null;
  setContentValue?: (value: string | null) => void;
  selectedFolderId?: string | null;
  setSelectedFolderId?: (folderId: string | null) => void;
  uploading?: boolean;
  setUploading?: (uploading: boolean) => void;
  createFolderOpen?: boolean;
  setCreateFolderOpen?: (open: boolean) => void;
  contentMove?: boolean;
  setContentMove?: (move: boolean) => void;
  moveContentOpen?: boolean;
  setMoveContentOpen?: (open: boolean) => void;
  contentMoveValue?: string | null;
  setContentMoveValue?: (value: string | null) => void;
  setContentMoveFolder?: (folder: string | null) => void;
  moveMultipleContentValue?: string | null;
  setMoveMultipleContentValue?: (value: string | null) => void;
  contentMoveDetails?: any;
  getContentImages: () => void;
  getContentImagesL?: () => void;
  handleCancel: () => void;
  handleMultipleSelectCancel: () => void;
  handleMultiSelectCancelWithoutCheckedItems: () => void;
  dashboardMoveButton?: boolean;
  moveMultipleContent?: boolean;
  moveMultipleContentOpen?: boolean;
  setMoveMultipleContentOpen?: (open: boolean) => void;
  setMoveMultipleContentFolder?: (folder: string | null) => void;
  moveMultipleContentDetails?: any;
  deleteMultipleContentFolder?: boolean;
  setDeleteMultipleContentFolder?: (open: boolean) => void;
  deleteMultipleContentFolderOpen?: boolean;
  setDeleteMultipleContentFolderOpen?: (open: boolean) => void;
  multipleFolderContentMoveDetails?: any;
  setMultipleFolderContentMoveDetails?: any;
  setFolderSelectAll?: (open: boolean) => void;
  setFolderCheckedItems?: any;
  checkedItems?: any;
  setCheckedItems?: any;
  setMoveMultipleContentDetails?: any;
  sortIcon?: boolean;
  listViewShow?: boolean;
  setListViewShow?: any;
  contentOnlyFn?: boolean;
}

const ContentSearch: React.FC<Props> = ({
  searchValue,
  setSearchValue,
  uploadOpen,
  setUploadOpen,
  createContentFolder,
  ContentFolderName,
  getFolderData,
  handleSortOptionClick,
  getContentFolderData,
  selectedfile,
  setSelectedfile,
  handleFileChange,
  handleRemoveFile,
  handleUploadClick,
  uploadError,
  uploadErrorMessage,
  uploadContentInsideFolder,
  contentValue,
  setContentValue,
  selectedFolderId,
  setSelectedFolderId,
  uploading,
  setUploading,
  createFolderOpen,
  setCreateFolderOpen,
  contentMove,
  setContentMove,
  moveContentOpen,
  setMoveContentOpen,
  contentMoveValue,
  setContentMoveValue,
  setContentMoveFolder,
  moveMultipleContentValue,
  setMoveMultipleContentValue,
  contentMoveDetails,
  getContentImages,
  getContentImagesL,
  handleCancel,
  handleMultipleSelectCancel,
  handleMultiSelectCancelWithoutCheckedItems,
  dashboardMoveButton,
  moveMultipleContent,
  moveMultipleContentOpen,
  setMoveMultipleContentOpen,
  setMoveMultipleContentFolder,
  moveMultipleContentDetails,
  deleteMultipleContentFolder,
  setDeleteMultipleContentFolder,
  deleteMultipleContentFolderOpen,
  setDeleteMultipleContentFolderOpen,
  multipleFolderContentMoveDetails,
  setMultipleFolderContentMoveDetails,
  setFolderSelectAll,
  setFolderCheckedItems,
  checkedItems,
  setCheckedItems,
  setMoveMultipleContentDetails,
  sortIcon,
  listViewShow,
  setListViewShow,
  contentOnlyFn,
}) => {
  const [folderError, setFolderError] = useState(false);
  const [folderNameInput, setFolderNameInput] = useState("");
  const [addLoader, setAddLoader] = useState(false);
  const [signedInUserId, setSignedInUserId] = useState<string | null>("");
  const [ContentMoveOpen, setContentMoveOpen] = useState(false);
  const [contentSearchQuery, setContentSearchQuery] = useState("");
  const [moveContentError, setMoveContentError] = useState(false);
  const [moveScreenLoader, setMoveScreenLoader] = useState(false);
  const [multipleContentMoveOpen, setMultipleContentMoveOpen] = useState(false);

  const filteredContentFolders = ContentFolderName.filter((folder: any) => {
    return folder.name.toLowerCase().includes(contentSearchQuery.toLowerCase());
  });

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

  const customStyles = {
    menu: (provided: any) => ({
      ...provided,
      maxHeight: 200, // Set a max height for the dropdown menu
      overflowY: "auto", // Enable vertical scrolling
    }),
  };

  const contentOptions = ContentFolderName.map((framework: any) => ({
    value: framework.id,
    label: framework.name,
  }));

  const handleSelectChange = (selectedOption: any) => {
    const selectedId = selectedOption ? selectedOption.value : null;

    // Update content value and selected folder
    if (setContentValue) {
      setContentValue(selectedId);
    }

    if (setSelectedFolderId) {
      setSelectedFolderId(selectedId);
    }
  };

  const handleContentCreateFolder = async () => {
    const newErrors = { name: !folderNameInput };
    setFolderError(newErrors.name);
    if (!newErrors.name) {
      setAddLoader(true);
      const currentTime = formatTime12Hour(new Date());
      const { data: existDatac, error: existErrorc } = await supabase
        .from("folders")
        .select("*")
        .eq("folder_type", "content")
        .eq("name", folderNameInput)
        .eq("userId", signedInUserId)
        .single();
      if (existDatac) {
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
          name: folderNameInput,
          time: currentTime,
          folder_type: "content",
          userId: signedInUserId,
        })
        .select()
        .single();
      if (error) {
        console.error("Error creating folder:", error);
        setAddLoader(false);
      } else {
        //notify("Content Folder created successfully", true);
        toast({
          title: "Created Successfully!.",
          description: "Content Folder has created successfully!",
          action: <ToastAction altText="Ok">Ok</ToastAction>,
        });
        setFolderNameInput("");
        setAddLoader(false);
        setCreateFolderOpen?.(false);
        getFolderData?.();
      }
    }
  };
  const handleClear = () => {
    setMoveContentError(false);
    setContentMoveValue?.("");
    setMoveMultipleContentValue?.("");
  };

  const handleContentMove = async () => {
    if (!contentMoveValue) {
      setMoveContentError(true);
      return;
    }
    setMoveContentError(false);
    setAddLoader(true);
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("id", contentMoveDetails.id);
    if (error) {
      console.error("Error fetching data:", error);
      setMoveContentError(true);
      setAddLoader(false);
    } else {
      const { data, error } = await supabase
        .from("content")
        .update({
          folder_id: contentMoveValue,
        })
        .eq("id", contentMoveDetails.id);
      if (error) {
        console.error("Error updating data:", error);
        setAddLoader(false);
      }
      // else {
      //   console.log("Data updated successfully:", data);
      // }

      if (getContentImages) {
        getContentImages();
      }
      if (getContentImagesL) {
        getContentImagesL();
      }
      setMoveContentOpen?.(false);
      setAddLoader(false);
      handleCancel?.();
      handleMultipleSelectCancel();
      setContentMoveValue?.("");
      setMoveContentError(false);
      getFolderData();
      getContentFolderData();
      //notify("Content moved successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Content moved successfully!",
      });
    }
  };

  const handleMoveContentToDashboard = async () => {
    setMoveScreenLoader(true);
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("id", contentMoveDetails.id);
    if (error) {
      console.error("Error fetching data:", error);
      setMoveContentError(true);
      setMoveScreenLoader(false);
    } else {
      const { data, error } = await supabase
        .from("content")
        .update({
          folder_id: null,
        })
        .eq("id", contentMoveDetails.id);
      if (error) {
        console.error("Error updating data:", error);
        setMoveScreenLoader(false);
      }
      // else {
      //   console.log("Data updated successfully:", data);
      // }

      if (getContentImages) {
        getContentImages();
      }
      if (getContentImagesL) {
        getContentImagesL();
      }
      setMoveContentOpen?.(false);
      setMoveScreenLoader(false);
      handleCancel();
      setContentMoveValue?.("");
      setMoveContentError(false);
      getFolderData();
      getContentFolderData();
      //notify("Content moved to dashboard successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Content moved to dashboard successfully!",
      });
      // router.push("/content");
    }
  };

  const handleMultipleContentMove = async () => {
    if (!moveMultipleContentValue) {
      setMoveContentError(true);
      return;
    }
    setMoveContentError(false);
    setAddLoader(true);
    try {
      // Fetch the data for each content item based on its ID
      const { data: contentData, error: fetchError } = await supabase
        .from("content")
        .select("*")
        .in(
          "id",
          moveMultipleContentDetails.map((item: any) => item)
        );

      if (fetchError) {
        setAddLoader(false);
        throw fetchError;
      }

      // Update each content item separately with the new folder ID
      const updatePromises = moveMultipleContentDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("content")
            .update({ folder_id: moveMultipleContentValue })
            .eq("id", item);
          if (error) {
            setAddLoader(false);
            throw error;
          }
          return data;
        }
      );

      // Wait for all updates to complete
      await Promise.all(updatePromises);

      if (getContentImages) {
        getContentImages();
      }

      if (getContentImagesL) {
        getContentImagesL();
      }

      setMoveMultipleContentOpen?.(false);
      setAddLoader(false);
      handleMultipleSelectCancel();
      setMoveMultipleContentValue?.("");
      setMoveContentError(false);
      getFolderData();
      getContentFolderData();
      //notify("Contents moved successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Contents moved successfully!",
      });
    } catch (error) {
      console.error("Error:", error);
      setAddLoader(false);
    }
  };

  const handleMoveMultipleContentToDashboard = async () => {
    setMoveScreenLoader(true);
    try {
      // Fetch the data for each content item based on its ID
      const { data: contentData, error: fetchError } = await supabase
        .from("content")
        .select("*")
        .in(
          "id",
          moveMultipleContentDetails.map((item: any) => item)
        );

      if (fetchError) {
        setMoveScreenLoader(false);
        throw fetchError;
      }

      // Update each content item separately to remove the folder ID
      const updatePromises = moveMultipleContentDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("content")
            .update({ folder_id: null }) // Set folder_id to null
            .eq("id", item);
          if (error) {
            setMoveScreenLoader(false);
            throw error;
          }
          return data;
        }
      );

      // Wait for all updates to complete
      await Promise.all(updatePromises);

      if (getContentImages) {
        getContentImages();
      }

      if (getContentImagesL) {
        getContentImagesL();
      }

      setMoveMultipleContentOpen?.(false);
      setMoveScreenLoader(false);
      handleMultipleSelectCancel();
      setMoveMultipleContentValue?.("");
      setMoveContentError(false);
      getFolderData();
      getContentFolderData();
      //notify("Content moved to dashboard successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Content moved to dashboard successfully!",
      });
    } catch (error) {
      console.error("Error:", error);
      setMoveScreenLoader(false);
    }
  };

  const handleDeleteBothContentAndFolder = async () => {
    try {
      setAddLoader(true);

      // Merge content and folder ids into one list of operations
      const folderIds = multipleFolderContentMoveDetails.map(
        (item: any) => item
      );

      // Create an array of promises for deleting both content and folders
      const deletePromises = [];

      // Delete content based on selected items
      if (checkedItems.length > 0) {
        const deleteContent = supabase
          .from("content")
          .update({ is_deleted: 1 })
          .in("id", checkedItems);

        deletePromises.push(deleteContent);
      }

      // Delete contents inside selected folders
      if (folderIds.length > 0) {
        const deleteFolderContents = supabase
          .from("content")
          .update({ is_deleted: 1 })
          .in("folder_id", folderIds);

        const deleteFolders = supabase
          .from("folders")
          .update({ is_deleted: 1 })
          .in("id", folderIds);

        // Push both folder and folder content delete operations
        deletePromises.push(deleteFolderContents, deleteFolders);
      }

      // Execute all delete operations in parallel
      const results = await Promise.all(deletePromises);

      // Check for any errors in the results
      const errors = results.filter((result) => result.error);

      if (errors.length > 0) {
        throw new Error("Some delete operations failed");
      }

      // Display success message with undo option
      toast({
        title: "Deleted Successfully!",
        description: "Contents and folders have been deleted successfully!",
        action: (
          <ToastAction
            altText="Undo"
            onClick={() => handleUndoBothContentAndFolder()}
          >
            Undo
          </ToastAction>
        ),
      });

      // Refresh data and reset states after deletion
      if (checkedItems.length > 0) {
        getContentImages();
        setCheckedItems([]);
        setMoveMultipleContentDetails([]);
        handleCancel();
        handleMultipleSelectCancel();
      }

      if (folderIds.length > 0) {
        getFolderData();
        setDeleteMultipleContentFolder?.(false);
        setDeleteMultipleContentFolderOpen?.(false);
        setFolderSelectAll?.(false);
        setFolderCheckedItems([]);
        setMultipleFolderContentMoveDetails([]);
      }
    } catch (error) {
      console.error("Error deleting content and folders:", error);
      toast({
        title: "Update Unsuccessful!",
        description: "Failed to delete content or folders.",
      });
    } finally {
      setAddLoader(false);
    }
  };

  const handleUndoBothContentAndFolder = async () => {
    try {
      // Merge content and folder ids into one list of operations
      const folderIds = multipleFolderContentMoveDetails.map(
        (item: any) => item
      );

      // Create an array of promises for undoing both content and folder deletions
      const undoPromises = [];

      // Undo content deletion (for specific checked items)
      if (checkedItems.length > 0) {
        const undoContent = supabase
          .from("content")
          .update({ is_deleted: 0 })
          .in("id", checkedItems);

        undoPromises.push(undoContent);
      }

      // Undo folder contents deletion (for contents inside selected folders)
      if (folderIds.length > 0) {
        const undoFolderContents = supabase
          .from("content")
          .update({ is_deleted: 0 })
          .in("folder_id", folderIds);

        const undoFolders = supabase
          .from("folders")
          .update({ is_deleted: 0 })
          .in("id", folderIds);

        // Push folder undo operations
        undoPromises.push(undoFolderContents, undoFolders);
      }

      // Execute all undo operations in parallel
      const results = await Promise.all(undoPromises);

      // Check for any errors in the results
      const errors = results.filter((result) => result.error);

      if (errors.length > 0) {
        throw new Error("Some undo operations failed");
      }

      // Display success message and reset states
      toast({
        title: "Updated Successfully!",
        description: "Content and folders have been recovered successfully!",
      });

      // Refresh data and reset states
      if (checkedItems.length > 0) {
        getContentImages();
        setCheckedItems([]);
        setMoveMultipleContentDetails([]);
        handleCancel();
        handleMultipleSelectCancel();
      }

      if (folderIds.length > 0) {
        getFolderData();
        setDeleteMultipleContentFolder?.(false);
        setDeleteMultipleContentFolderOpen?.(false);
        setFolderSelectAll?.(false);
        setMultipleFolderContentMoveDetails([]);
        setFolderCheckedItems([]);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Update Unsuccessful!",
        description: "Failed to recover content or folders.",
      });
    } finally {
      setAddLoader(false);
    }
  };

  const handleMultipleDelete = async () => {
    setAddLoader(true);
    if (checkedItems.length > 0) {
      // handleCancel();
      const { data, error } = await supabase
        .from("content")
        // .delete()
        .update({ is_deleted: 1 })
        .in("id", checkedItems);

      if (error) {
        console.error("Error deleting files:", error);
        setAddLoader(false);
      } else {
        //notify("Contents deleted successfully", true);

        getContentImages();
        getFolderData();
        setCheckedItems([]);
        setMoveMultipleContentDetails([]);
        handleCancel();
        setDeleteMultipleContentFolderOpen?.(false);
        contentOnlyFn && handleMultipleSelectCancel();
        handleMultiSelectCancelWithoutCheckedItems();
        toast({
          title: "Updated Successfully!.",
          description: "Contents has deleted successfully!",
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
      // setMultipleDeleteOpen(false);
      setAddLoader(false);
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
        getContentImages();
        getFolderData();
        setCheckedItems([]);
        setMoveMultipleContentDetails([]);
        handleCancel();
        handleMultipleSelectCancel();
        toast({
          title: "Updated Successfully!.",
          description: "Contents has recovered successfully!",
        });
      }
    }
  };

  const handleDeleteContentFolder = async () => {
    try {
      setAddLoader(true);
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .in(
          "id",
          multipleFolderContentMoveDetails.map((item: any) => item)
        );

      if (error) {
        setAddLoader(false);
        throw error;
      }

      const deletePromises = multipleFolderContentMoveDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("content")
            //.delete()
            .update({ is_deleted: 1 })
            .eq("folder_id", item);

          if (error) {
            setAddLoader(false);
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
          multipleFolderContentMoveDetails.map((item: any) => item)
        );

      if (folderDeleteError) {
        setAddLoader(false);
        throw folderDeleteError;
      }

      setDeleteMultipleContentFolder?.(false);
      setDeleteMultipleContentFolderOpen?.(false);
      setAddLoader(false);
      setFolderSelectAll?.(false);
      setMultipleFolderContentMoveDetails([]);
      getFolderData();
      //notify("Folders deleted successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Folders has deleted successfully!",
        action: (
          <ToastAction
            altText="Undo"
            onClick={() => handleDeleteContentFolderUndo()}
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
      setAddLoader(false);
    }
  };

  const handleDeleteContentFolderUndo = async () => {
    try {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .in(
          "id",
          multipleFolderContentMoveDetails.map((item: any) => item)
        );

      if (error) {
        throw error;
      }

      const deletePromises = multipleFolderContentMoveDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("content")
            // .delete()
            .update({ is_deleted: 0 })
            .eq("folder_id", item);

          if (error) {
            throw error;
          }
          return data;
        }
      );

      await Promise.all(deletePromises);

      const { error: folderDeleteError } = await supabase
        .from("folders")
        // .delete()
        .update({ is_deleted: 0 })
        .in(
          "id",
          multipleFolderContentMoveDetails.map((item: any) => item)
        );

      if (folderDeleteError) {
        throw folderDeleteError;
      }

      setDeleteMultipleContentFolder?.(false);
      setDeleteMultipleContentFolderOpen?.(false);
      setFolderSelectAll?.(false);
      getFolderData();
      setFolderCheckedItems([]);
      setMultipleFolderContentMoveDetails([]);
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
      setAddLoader(false);
    }
  };

  const handleDeleteContentAndFolder = async () => {
    if (
      multipleFolderContentMoveDetails.length > 0 &&
      moveMultipleContentDetails.length > 0
    ) {
      handleDeleteBothContentAndFolder();
    } else if (multipleFolderContentMoveDetails.length > 0) {
      handleDeleteContentFolder();
    } else {
      handleMultipleDelete();
    }
  };

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
        <GlobalSearchBar
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
        <ul className="flex items-center gap-2">
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <li
                className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out w-[44px] h-[40px] mb-3 hover:bg-button_orange hover:text-white"
                onClick={getFolderData}
              >
                <ImageUp size={20} />
              </li>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[550px] sm:min-h-[370px]"
              style={{ zIndex: 999 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold mb-3">
                  Upload Content
                </DialogTitle>
                <Tabs defaultValue="system" className="w-full">
                  <TabsContent value="system" className="w-full">
                    {selectedfile && selectedfile.length > 0 ? (
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
                          {selectedfile.map((file, index) => (
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
                        <span className="bg-white w-full text-center cursor-pointer text-sm font-semibold text-secondary_color">
                          Drag your file here or{" "}
                          <span className="text-button_orange">browse</span>
                        </span>
                        <Input
                          type="file"
                          multiple
                          placeholder="Upload File"
                          className="w-full h-full border-none outline-none cursor-pointer opacity-0 absolute top-0 left-0 py-0"
                          onChange={handleFileChange}
                        />
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-delete_color text-sm mt-2">
                        Please select a file
                      </p>
                    )}
                    {uploadErrorMessage && (
                      <p className="text-delete_color text-sm mt-2">
                        Please select a valid file (png, jpg, mp4)
                      </p>
                    )}
                    <div className="w-full items-center flex gap-1 mt-4">
                      <CircleAlert size={20} />
                      <p className="text-xs font-normal">
                        Prior to uploading content, we recommend reviewing our{" "}
                        <span className="text-delete_color">size guide</span> to
                        ensure optimal results.
                      </p>
                    </div>
                    {!uploadContentInsideFolder && (
                      <div className="pt-5">
                        <h4 className="text-sm font-medium mb-2">Folder</h4>
                        <Select
                          className="w-full basic-single"
                          options={contentOptions}
                          onChange={handleSelectChange}
                          value={contentOptions.find(
                            (option: any) => option.value === contentValue
                          )}
                          placeholder="Select Folder"
                          isClearable
                          styles={customStyles}
                          menuPlacement="auto"
                          menuShouldScrollIntoView={true}
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </DialogHeader>
              <DialogFooter className="mt-1 flex justify-between items-center gap-6">
                <DialogClose asChild>
                  <Button
                    variant={"outline"}
                    className="w-2/4"
                    onClick={setSelectedfile}
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
            </DialogContent>
          </Dialog>

          {createContentFolder ? (
            <TooltipProvider>
              <Tooltip>
                <Dialog
                  open={createFolderOpen}
                  onOpenChange={setCreateFolderOpen}
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
                          value={folderNameInput}
                          onChange={(e) => {
                            setFolderNameInput(e.target.value);
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
                        onClick={handleContentCreateFolder}
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

          {(deleteMultipleContentFolder || checkedItems.length > 0) && (
            <TooltipProvider>
              <Tooltip>
                <Dialog
                  open={deleteMultipleContentFolderOpen}
                  onOpenChange={setDeleteMultipleContentFolderOpen}
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
                        {moveMultipleContentDetails.length > 0 &&
                        multipleFolderContentMoveDetails.length > 0
                          ? "Delete Content and Folder"
                          : multipleFolderContentMoveDetails.length > 0
                          ? "Delete Folder"
                          : moveMultipleContentDetails.length > 0
                          ? "Delete Content"
                          : null}
                      </DialogTitle>
                      <DialogDescription className="m-0">
                        {moveMultipleContentDetails.length > 0 &&
                        multipleFolderContentMoveDetails.length > 0
                          ? "Are you sure want to delete content and folder"
                          : multipleFolderContentMoveDetails.length > 0
                          ? "Are you sure want to delete folder"
                          : moveMultipleContentDetails.length > 0
                          ? "Are you sure want to delete content"
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
                        onClick={handleDeleteContentAndFolder}
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
                <TooltipContent side="bottom" className="mt-0 mr-1">
                  <p>
                    {moveMultipleContentDetails.length > 0 &&
                    multipleFolderContentMoveDetails.length > 0
                      ? "Delete Content and Folder"
                      : multipleFolderContentMoveDetails.length > 0
                      ? "Delete Folder"
                      : moveMultipleContentDetails.length > 0
                      ? "Delete Content"
                      : null}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {contentMove && (
            <TooltipProvider>
              <Tooltip>
                <Dialog
                  open={moveContentOpen}
                  onOpenChange={setMoveContentOpen}
                >
                  <DialogTrigger asChild>
                    <TooltipTrigger>
                      <li
                        className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out w-[44px] h-[40px] mb-3 hover:bg-button_orange hover:text-white"
                        onClick={getFolderData}
                      >
                        <FolderSymlink size={20} />
                      </li>
                    </TooltipTrigger>
                  </DialogTrigger>
                  <DialogContent
                    className="sm:max-w-[397px] max-h-[530px]"
                    style={{ zIndex: 999 }}
                  >
                    <DialogHeader className="flex flex-col space-y-0">
                      <DialogTitle className="text-2xl font-semibold mb-2">
                        Move Content
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 pb-2">
                      <div>
                        <Label htmlFor="name" className="text-right mb-5">
                          Folder
                        </Label>
                        <Popover
                          open={ContentMoveOpen}
                          onOpenChange={setContentMoveOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={ContentMoveOpen}
                              className="w-full justify-between mt-1"
                            >
                              {contentMoveValue
                                ? ContentFolderName.find(
                                    (framework: any) =>
                                      framework.id === contentMoveValue
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
                                value={contentSearchQuery}
                                className="rounded-none"
                                onChange={(e: any) =>
                                  setContentSearchQuery(e.target.value)
                                } // set search query
                              />
                              <CommandList className="h-[160px] max-h-[160px] overflow-y-auto">
                                {filteredContentFolders.length === 0 ? (
                                  <CommandEmpty className="max-h-[60px] h-[30px] flex justify-center pt-1">
                                    No folders found.
                                  </CommandEmpty>
                                ) : (
                                  <CommandGroup>
                                    {filteredContentFolders.map(
                                      (framework: any) => (
                                        <CommandItem
                                          key={framework.id}
                                          value={framework.id}
                                          onSelect={(currentValue) => {
                                            if (setContentMoveValue) {
                                              setContentMoveValue(
                                                currentValue ===
                                                  contentMoveValue
                                                  ? null
                                                  : currentValue
                                              );
                                            }
                                            setContentMoveOpen(false);
                                            setMoveContentError(false);
                                            // setSelectedValue(currentValue);
                                            if (setContentMoveFolder) {
                                              setContentMoveFolder(
                                                currentValue ===
                                                  contentMoveValue
                                                  ? null
                                                  : (currentValue as string)
                                              );
                                            }
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              contentMoveValue === framework.id
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
                        {/* {moveContentError && (
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
                          onClick={() => handleClear()}
                        >
                          Cancel
                        </Button>
                      </DialogClose>

                      <Button
                        className="bg-button_orange hover:bg-button_orange hover:opacity-75 w-2/4"
                        onClick={handleContentMove}
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
                      onClick={handleMoveContentToDashboard}
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
                        "Move to Content Dashboard"
                      )}
                    </Button>
                  </DialogContent>
                </Dialog>
                <TooltipContent side="bottom" className="-mt-3 mr-1">
                  <p>Move Content</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {moveMultipleContent && (
            <TooltipProvider>
              <Tooltip>
                <Dialog
                  open={moveMultipleContentOpen}
                  onOpenChange={setMoveMultipleContentOpen}
                >
                  <DialogTrigger asChild>
                    <TooltipTrigger>
                      <li
                        className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out w-[44px] h-[40px] mb-3 hover:bg-button_orange hover:text-white"
                        onClick={getFolderData}
                      >
                        <FolderSymlink size={20} />
                      </li>
                    </TooltipTrigger>
                  </DialogTrigger>
                  <DialogContent
                    className="sm:max-w-[397px] h-[530px]"
                    style={{ zIndex: 999 }}
                  >
                    <DialogHeader className="flex flex-col space-y-0">
                      <DialogTitle className="text-2xl font-semibold mb-2">
                        Move Multiple Contents
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 pb-2">
                      <div>
                        <Label htmlFor="name" className="text-right mb-5">
                          Folder
                        </Label>
                        <Popover
                          open={multipleContentMoveOpen}
                          onOpenChange={setMultipleContentMoveOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={multipleContentMoveOpen}
                              className="w-full justify-between mt-1"
                            >
                              {moveMultipleContentValue
                                ? ContentFolderName.find(
                                    (framework: any) =>
                                      framework.id === moveMultipleContentValue
                                  )?.name
                                : "Select Folder"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
                            </Button>
                          </PopoverTrigger>
                          <div
                            className={`border border-border_gray mt-1 rounded p-0`}
                            // style={{ width: "100%"}}
                          >
                            <Command>
                              <Input
                                placeholder="Search folder..."
                                value={contentSearchQuery}
                                className="rounded-none"
                                onChange={(e: any) =>
                                  setContentSearchQuery(e.target.value)
                                } // set search query
                              />

                              <CommandList className="max-h-[160px] h-[160px] overflow-y-auto">
                                {filteredContentFolders.length === 0 ? (
                                  <CommandEmpty className="max-h-[60px] h-[30px] flex justify-center pt-1">
                                    No folders found.
                                  </CommandEmpty>
                                ) : (
                                  <CommandGroup>
                                    {filteredContentFolders.map(
                                      (framework: any) => (
                                        <CommandItem
                                          key={framework.id}
                                          value={framework.id}
                                          onSelect={(currentValue) => {
                                            if (setMoveMultipleContentValue) {
                                              setMoveMultipleContentValue(
                                                currentValue ===
                                                  moveMultipleContentValue
                                                  ? null
                                                  : currentValue
                                              );
                                            }
                                            setMultipleContentMoveOpen(false);
                                            setMoveContentError(false);
                                            // setSelectedValue(currentValue);
                                            if (setMoveMultipleContentFolder) {
                                              setMoveMultipleContentFolder(
                                                currentValue ===
                                                  moveMultipleContentValue
                                                  ? null
                                                  : (currentValue as string)
                                              );
                                            }
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              moveMultipleContentValue ===
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
                        {/* {moveContentError && (
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
                          onClick={() => handleClear()}
                        >
                          Cancel
                        </Button>
                      </DialogClose>

                      <Button
                        className="bg-button_orange hover:bg-button_orange hover:opacity-75 w-2/4"
                        onClick={handleMultipleContentMove}
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
                      onClick={handleMoveMultipleContentToDashboard}
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
                        "Move to Content Dashboard"
                      )}
                    </Button>
                  </DialogContent>
                </Dialog>
                <TooltipContent side="bottom" className="-mt-3 mr-1">
                  <p>Move Multiple Contents</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {sortIcon && (
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
          )}
        </ul>
      </div>
    </>
  );
};

export default ContentSearch;
