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
  Circle,
  CirclePlus,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import DefaultSkeleton, { LayoutSkeleton } from "@/components/skeleton-ui";

interface ImagePreview {
  name: string;
  image: string;
  type: string;
  zone1: string;
  zone2: string;
  zone3: string;
  id: string;
}

const status = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const LayoutPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isOpenL, setIsOpenL] = useState(true);
  const [file, setFile] = useState<File[] | null>(null);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [imagePreviewsL, setImagePreviewsL] = useState<ImagePreview[]>([]);

  // const [layoutViewOpen, setLayoutViewOpen] = useState<ImagePreview[]>([]);
  const [IsLayoutviewModalOpen, setIsLayoutviewModalOpen] = useState(false);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusValue, setStatusValue] = useState("");
  const [statusError, setStatusError] = useState("");

  const [layoutzoneone, setLayoutzoneone] = useState<string | null>("");
  const [layoutzonetwo, setLayoutzonetwo] = useState<string | null>("");
  const [layoutzonethree, setLayoutzonethree] = useState<string | null>("");
  const [layoutname, setLayoutname] = useState<string | null>("");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImagePreview | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [contentValue, setContentValue] = useState<string | null>("");
  const [activeImage, setActiveImage] = useState<ImagePreview | null>(null);

  const [uploading, setUploading] = useState(false);

  const [contentLoading, setContentLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [searchValue, setSearchValue] = useState<string | null>("");

  const router = useRouter();

  const handleFileChange = (event: any) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setUploadError(false);
  };

  const handleUploadClicklayout = async () => {
    // const { name, price, storage, screen_count } = form.getValues();
    if (!file) {
      setUploadError(true);
      return;
    }
    setUploading(true);
    const uploadedFiles = [];
    const { data, error } = await supabase.storage
      .from("layouts")
      .upload(file[0].name, file[0], {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      setUploadError(true);
      setUploading(false);
      return;
    }

    const publicURL = supabase.storage.from("layouts").getPublicUrl(data?.path)
      .data.publicUrl;
    uploadedFiles.push({ name: file[0].name, url: publicURL });
    console.log("Public URL:", publicURL);

    console.log("Test", statusValue);

    const { data: contentData, error: contentError } = await supabase
      .from("layouts")
      .insert(
        uploadedFiles.map((file: any) => ({
          name: layoutname || null, //file.name,
          image: file.url,
          type: "potrait",
          zone1: layoutzoneone || null,
          zone2: layoutzonetwo || null,
          zone3: layoutzonethree || null,
        }))
      )
      .select();

    console.log(contentData);

    if (contentError) {
      console.error("Error uploading file:", contentError);
      setUploadError(true);
      setUploading(false);
      return;
    }

    setImagePreviews(contentData as any);
    setImagePreviewsL(contentData as any);
    setFile(null);
    setUploadOpen(false);
    getContentImages();
    getContentImagesL();
    setContentValue("");
    setLayoutzoneone("");
    setLayoutzonetwo("");
    setLayoutzonethree("");
    setLayoutname("");
    // setSelectedFolderId(null || "");
    setUploading(false);
  };

  const handleCancel = () => {
    const details = document.getElementById("content_details");
    if (details) {
      details.style.display = "none";
      setActiveImage(null);
    }
    setSelectedImage(null);
  };

  const handleContentdetails = async (preview: ImagePreview) => {
    const details = document.getElementById("content_details");
    if (details) {
      details.style.display = "block";
    }
    setSelectedImage(preview);
    setActiveImage(preview);
  };

  const getContentImages = async () => {
    const { data: portraitData, error: portraitError } = await supabase
      .from("layouts")
      .select("*")
      .eq("type", "Portrait");
    if (portraitError) {
      console.error("Error fetching data:", portraitError);
      setContentLoading(false);
      setNotFound(false);
    } else {
      setImagePreviews(portraitData as any);
    }
  };

  const getContentImagesL = async () => {
    const { data: landscapeData, error: landscapeError } = await supabase
      .from("layouts")
      .select("*")
      .eq("type", "Landscape");
    if (landscapeError) {
      console.error("Error fetching data:", landscapeError);
      setContentLoading(false);
    } else {
      setImagePreviewsL(landscapeData as any);
    }
  };

  const handleContentSave = async () => {
    if (!selectedImage) return;

    // getContentTags(selectedImage.id);
    // Update the content with the new name and potentially the playlist ID
    const { data, error } = await supabase
      .from("layouts")
      .update({
        name: selectedImage.name,
      })
      .eq("id", selectedImage.id)
      .select("*");

    if (error) {
      console.error("Error saving layout:", error);
      return;
    }

    handleCancel();
    getContentImages();
    getContentImagesL();
  };

  useEffect(() => {
    getContentImages();
    getContentImagesL();
  }, []);

  useEffect(() => {
    if (imagePreviews.length > 0) {
      // setTimeout(() => {
        setContentLoading(false);
      // }, 100);
    } else {
      // setTimeout(() => {
        setContentLoading(false);
        // setTimeout(() => {
          setNotFound(true);
        // }, 0);
      // }, 100);
    }
  }, [imagePreviews]);

  const handleImageClick = (image: ImagePreview) => {
    setSelectedImage(image);
    setIsLayoutviewModalOpen(true);
    //console.log(image);
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
  const filteredLayoutImages = filterBySearchValue(
    imagePreviews,
    "image",
    searchValue as string
  );
  const filteredLayoutImagesLandscape = filterBySearchValue(
    imagePreviewsL,
    "image",
    searchValue as string
  );

  return (
    <div
      className="w-full p-0 flex"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      <div className="w-full pr-0">
        {/* <SearchBar
          displayplus={null}
          calendarIcon={<CalendarDays size={20} />}
          calendar={false}
          uploadFilelayout={false}
          selectedfile={file}
          handleUploadClicklayout={handleUploadClicklayout}
          handleFileChange={handleFileChange}
          uploadOpen={uploadOpen}
          setUploadOpen={setUploadOpen}
          uploadError={uploadError}
          setUploadError={setUploadError}
          contentValue={contentValue}
          setContentValue={setContentValue}
          getContentImages={getContentImages}
          getContentImagesL={getContentImagesL}
          handleCancel={handleCancel}
          uploading={uploading}
          setUploading={setUploading}
          layoutzoneone={layoutzoneone}
          setLayoutzoneone={setLayoutzoneone as any}
          layoutzonetwo={layoutzonetwo}
          setLayoutzonetwo={setLayoutzonetwo as any}
          layoutzonethree={layoutzonethree}
          setLayoutzonethree={setLayoutzonethree as any}
          layoutname={layoutname}
          setLayoutname={setLayoutname as any}
          searchValue={searchValue}
          setSearchValue={(value: string | null) => setSearchValue(value)}
          handleSortOptionClick={() => {}}
          contentFolderSort={false}
          filterIcon={false}
          handleMultipleSelectCancel={() => {}}
          screenData={() => {}}
          getScreenFolderDetails={() => {}}
        /> */}
        <div className="w-full p-4 pt-4">
          <div className="image-section">
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="w-full space-y-2"
            >
              <div className="flex items-center justify-between space-x-4">
                <h4 className="text-base font-bold text-primary_color">
                  Potrait Layouts
                </h4>
                {/* {
                  checkedItems.map((item, index) => (
                    <p key={index}>{item}</p>
                  ))
                } */}
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="px-0 py-0 flex flex-wrap gap-2">
                {contentLoading ? (
                  <LayoutSkeleton height={150} width={100} />
                ) : (
                  <div className="w-full">
                    {filteredLayoutImages.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                      {filteredLayoutImages
                        .sort((a, b) => {
                          // Get the last two digits from the image name
                          const lastTwoDigitsA = a.image
                            .slice(-6, -4) // Adjusted to extract two digits
                            .match(/\d+/); // Extract numbers from the string
                          const lastTwoDigitsB = b.image
                            .slice(-6, -4) // Adjusted to extract two digits
                            .match(/\d+/);
                    
                          // Convert to numbers and sort in ascending order
                          return Number(lastTwoDigitsA) - Number(lastTwoDigitsB);
                        })
                        .map((preview, index) => (
                          <div
                            key={index}
                            className={`relative h-[150px] w-[230px] cursor-pointer image_wrapper border border-border_gray ${
                              activeImage?.id === preview.id
                                ? "border-2 border-button_orange rounded"
                                : ""
                            }`}
                            style={{ background: "#808080e3" }}
                            onClick={() => handleImageClick(preview)}
                          >
                            <Image
                              src={preview.image as string}
                              layout="fill"
                              className="rounded content_image p-[20px]"
                              style={{ objectFit: "contain" }}
                              alt={preview.image as string}
                            />
                            <div
                              className="image_overlay flex items-start justify-between"
                              id="image_overlay"
                            >
                              <p className="text-xs">
                                {preview.image.slice(-3).toLowerCase() === "jpg" ? (
                                  <ImageIcon size={16} />
                                ) : preview.image.slice(-3).toLowerCase() === "png" ? (
                                  <ImageIcon size={16} />
                                ) : (
                                  <Video size={16} />
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                    
                    ) : (
                      <div className="text-base font-medium text-secondary_color mt-3 w-full h-full text-center block">
                        <p> No images found</p>
                      </div>
                    )}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
          <div className="image-sectionl border-t border-border_gray mt-5">
            <Collapsible
              open={isOpenL}
              onOpenChange={setIsOpenL}
              className="w-full space-y-2"
            >
              <div className="flex items-center justify-between space-x-4">
                <h4 className="text-base font-bold text-primary_color">
                  Landscape Layouts
                </h4>
                {/* {
                  checkedItems.map((item, index) => (
                    <p key={index}>{item}</p>
                  ))
                } */}
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="px-0 py-0 flex flex-wrap gap-2">
                <div className="image-sectionl">
                  {contentLoading ? (
                    <LayoutSkeleton height={100} width={150} />
                  ) : (
                    <div className="w-full">
                      {filteredLayoutImagesLandscape.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {filteredLayoutImagesLandscape.map(
                            (preview, index) => (
                              <div
                                key={index}
                                className={`relative h-[150px] w-[230px] cursor-pointer image_wrapper border border-border_gray ${
                                  activeImage?.id === preview.id
                                    ? "border-2 border-button_orange rounded"
                                    : ""
                                }`}
                                style={{ background: "#808080e3" }}
                                onClick={() => handleImageClick(preview)}
                              >
                                <Image
                                  src={preview.image as string}
                                  layout="fill"
                                  className="rounded content_image p-[20px]"
                                  style={{ objectFit: "contain" }}
                                  alt={preview.image as string}
                                />
                                <div
                                  className="image_overlay flex items-start justify-between"
                                  id="image_overlay"
                                >
                                  <p className="text-xs">
                                    {preview.image.slice(-3).toLowerCase() ===
                                    "jpg" ? (
                                      <ImageIcon size={16} />
                                    ) : preview.image
                                        .slice(-3)
                                        .toLowerCase() === "png" ? (
                                      <ImageIcon size={16} />
                                    ) : (
                                      <Video size={16} />
                                    )}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-base font-medium text-secondary_color mt-3 w-full  text-center flex justify-center">
                          <p> No images found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          {IsLayoutviewModalOpen && selectedImage && (
            <Dialog
              open={IsLayoutviewModalOpen}
              onOpenChange={setIsLayoutviewModalOpen}
            >
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader className="flex items-start justify-between">
                  <DialogTitle className="font-semibold text-2xl text-primary_color">
                    Layout Details
                  </DialogTitle>
                  <DialogClose asChild>
                    <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 focus:outline-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </DialogClose>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-[65%_35%] gap-4 py-1">
                    <div
                      className="relative w-full h-64"
                      style={{ background: "#808080e3" }}
                    >
                      <Image
                        src={selectedImage.image as string}
                        layout="fill"
                        className="rounded"
                        style={{ objectFit: "contain" }}
                        alt={selectedImage.name as string}
                      />
                    </div>
                    <div>
                      <p style={{ fontSize: "14px" }}>
                        <b>{selectedImage.name}</b>
                      </p>

                      {/* Conditionally render Zone 01 */}
                      {selectedImage.zone1 && (
                        <div className="mt-4">
                          <p className="mt-4" style={{ fontSize: "12px" }}>
                            <b>Zone 01:</b>
                          </p>
                          <p className="mt-2" style={{ fontSize: "12px" }}>
                            {selectedImage.zone1} px
                          </p>
                          <p className="mt-2" style={{ fontSize: "12px" }}>
                            <b>Supported Format:</b>
                          </p>
                          <p className="mt-2" style={{ fontSize: "12px" }}>
                            .jpg, .png, .pdf, .mp4, .mov
                          </p>
                        </div>
                      )}

                      {/* Conditionally render Zone 02 */}
                      {selectedImage.zone2 && (
                        <div className="mt-4">
                          <p className="mt-2" style={{ fontSize: "12px" }}>
                            <b>Zone 02:</b>
                          </p>
                          <p className="mt-2" style={{ fontSize: "12px" }}>
                            {selectedImage.zone2} px
                          </p>
                          <p className="mt-2" style={{ fontSize: "12px" }}>
                            <b>Supported Format:</b>
                          </p>
                          <p className="mt-2" style={{ fontSize: "12px" }}>
                            .jpg, .png, .pdf, .mp4, .mov
                          </p>
                        </div>
                      )}
                      {/* Conditionally render Zone 03 */}
                      {selectedImage.zone3 && (
                        <div className="mt-4">
                          <p className="mt-2" style={{ fontSize: "12px" }}>
                            <b>Zone 03:</b>
                          </p>
                          <p className="mt-2" style={{ fontSize: "12px" }}>
                            {selectedImage.zone3} px
                          </p>
                          <p className="mt-2" style={{ fontSize: "12px" }}>
                            <b>Supported Format:</b>
                          </p>
                          <p className="mt-2" style={{ fontSize: "12px" }}>
                            .jpg, .png, .pdf, .mp4, .mov
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  {/* <DialogClose asChild>
                    <Button variant="outline" className="w-2/4">
                      Close
                    </Button>
                  </DialogClose> */}
                  {/* <Button className="w-2/4 bg-button_orange hover:bg-button_orange">
                  Ok
                </Button> */}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* content details sidebar code starts here */}
      <div
        className="w-[329px] border-l border-border_gray p-5 hidden"
        id="content_details"
      >
        {selectedImage && (
          <>
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-primary_color">
                Layout Setting
              </h4>
              <Dialog
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
                      Are you sure want to delete the layout
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mb-0 mt-1">
                    <DialogClose asChild>
                      <Button variant={"outline"} className="w-2/4">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button className="bg-button_orange hover:bg-button_orange hover:opacity-75 w-2/4">
                      Yes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="w-full h-[158px] rounded mt-6 relative">
              <Image
                src={selectedImage.image}
                layout="fill"
                className="rounded"
                style={{ objectFit: "cover" }}
                alt={selectedImage.name}
              />
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
                    setSelectedImage({ ...selectedImage, name: e.target.value })
                  }
                />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-primary_color mb-1.5">
                  Layout Name
                </h4>
              </div>
              <div className="pt-3">
                <h4 className="text-sm font-medium mb-2">
                  {selectedImage.zone1}
                </h4>
              </div>
              <div className="pt-3">
                <h4 className="text-sm font-medium mb-2">
                  {selectedImage.zone2}
                </h4>
              </div>
              <div className="pt-3">
                <h4 className="text-sm font-medium mb-2">
                  {selectedImage.zone3}
                </h4>
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
                >
                  Save
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* content details sidebar code ends here */}
    </div>
  );
};

export default LayoutPage;
