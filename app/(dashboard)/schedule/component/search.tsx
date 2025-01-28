import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CalendarDays,
  CalendarPlus2,
  Ellipsis,
  GalleryThumbnails,
  List,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
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
import { Button } from "@/components/ui/button";
import GlobalSearchBar from "@/components/global-searchbar";

interface SearchBarProps {
  searchValue: string | null;
  setSearchValue: (value: string) => void;
  handleSortOptionClick: (option: string) => void;
  screenData: any;
  multipleScheduleMoveDetails: any;
  deleteMultipleSchedule?: boolean;
  setDeleteMultipleSchedule?: (deleteSchedule: boolean) => void;
  deleteMultipleScheduleOpen?: boolean;
  setDeleteMultipleScheduleOpen?: (open: boolean) => void;
  setSelectAll?: (value: boolean) => void;
  setCheckedItems?: any;
  listViewShow?: boolean;
  setListViewShow?: any;
}

const ScheduleSearch: React.FC<SearchBarProps> = ({
  searchValue,
  setSearchValue,
  handleSortOptionClick,
  screenData,
  multipleScheduleMoveDetails,
  deleteMultipleSchedule,
  setDeleteMultipleSchedule,
  deleteMultipleScheduleOpen,
  setDeleteMultipleScheduleOpen,
  setSelectAll,
  setCheckedItems,
  listViewShow,
  setListViewShow,
}) => {
  const [moveScreenLoader, setMoveScreenLoader] = useState(false);
  const [saveLoader, setSaveLoader] = useState(false);
  const [addLoader, setAddLoader] = useState(false);

  const router = useRouter();

  const handleDeleteSchedule = async () => {
    try {
      setAddLoader(true);
      const { data, error } = await supabase
        .from("scheduledContents")
        .select("*")
        .in(
          "id",
          multipleScheduleMoveDetails.map((item: any) => item)
        );
      if (error) {
        setAddLoader(false);
        throw error;
      }
      const deletePromises = multipleScheduleMoveDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("scheduledContents")
            // .delete()
            .update({ is_deleted: 1 })
            .eq("id", item);
          if (error) {
            setAddLoader(false);
            throw error;
          }
          return data;
        }
      );
      await Promise.all(deletePromises);
      console.log("Data deleted successfully");
      //notify("Schedule deleted successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Schedule has deleted successfully!",
        action: (
          <ToastAction
            altText="Undo"
            onClick={() => handleDeleteScheduleUndo()}
          >
            Undo
          </ToastAction>
        ),
      });
      setDeleteMultipleScheduleOpen?.(false);
      setDeleteMultipleSchedule?.(false);
      setSelectAll?.(false);
      screenData();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteScheduleUndo = async () => {
    try {
      const { data, error } = await supabase
        .from("scheduledContents")
        .select("*")
        .in(
          "id",
          multipleScheduleMoveDetails.map((item: any) => item)
        );
      if (error) {
        throw error;
      }
      const deletePromises = multipleScheduleMoveDetails.map(
        async (item: any) => {
          const { data, error } = await supabase
            .from("scheduledContents")
            // .delete()
            .update({ is_deleted: 0 })
            .eq("id", item);
          if (error) {
            throw error;
          }
          return data;
        }
      );
      await Promise.all(deletePromises);
      console.log("Data deleted successfully");
      //notify("Schedule deleted successfully", true);
      toast({
        title: "Updated Successfully!.",
        description: "Schedule has recovered successfully!",
      });
      setDeleteMultipleScheduleOpen?.(false);
      setAddLoader(false);
      setDeleteMultipleSchedule?.(false);
      setSelectAll?.(false);
      setCheckedItems([]);
      screenData();
    } catch (error) {
      console.error("Error:", error);
      setAddLoader(false);
    }
  };

  return (
    <>
      <div className="w-full flex justify-between gap-2 p-4">
        <Toaster />
        <GlobalSearchBar
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
        <ul className="flex items-center gap-2">
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <li
                    className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out w-[44px] h-[40px] mb-3 hover:bg-button_orange hover:text-white"
                    onClick={() => {
                      setMoveScreenLoader(true);
                      setTimeout(() => {
                        router.push("/create-schedule");
                        setMoveScreenLoader(false);
                      }, 3000);
                    }}
                    style={moveScreenLoader ? { pointerEvents: "none" } : {}}
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
                      <CalendarPlus2 size={20} />
                    )}
                  </li>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="-mt-3">
                  <p>Add schedule</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <li
                  className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out w-[44px] h-[40px] mb-3 hover:bg-button_orange hover:text-white"
                  onClick={() => {
                    setSaveLoader(true);
                    setTimeout(() => {
                      router.push("/calendar");
                      setSaveLoader(false);
                    }, 3000);
                  }}
                  style={saveLoader ? { pointerEvents: "none" } : {}}
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
                    <CalendarDays size={20} />
                  )}
                </li>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="-mt-3 mr-1">
                <p>Calendar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className={`py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out w-[44px] h-[40px] mb-3 hover:bg-button_orange hover:text-white`}
                onClick={() => setListViewShow(!listViewShow)}
                >
                  {listViewShow ? <GalleryThumbnails size={20} /> : <List size={20} />}
                </div>
              </TooltipTrigger>

              <TooltipContent side="bottom" className="-mt-3 mr-1">
                {listViewShow ? <p>Grid View</p> : <p>List View</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {deleteMultipleSchedule && (
            <>
              {/* <Toaster /> */}
              <TooltipProvider>
                <Tooltip>
                  <Dialog
                    open={deleteMultipleScheduleOpen}
                    onOpenChange={setDeleteMultipleScheduleOpen}
                  >
                    <DialogTrigger asChild>
                      <TooltipTrigger>
                        <div className="py-2.5 mb-3 px-3 rounded text-white bg-delete_color cursor-pointer transition-all duration-300 ease-in-out hover:bg-delete_color hover:text-white w-[44px] h-[40px]">
                          <Trash2 size={20} />
                        </div>
                      </TooltipTrigger>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[397px] sm:max-h-[342px]">
                      <DialogHeader className="flex flex-col space-y-0">
                        <DialogTitle className="text-2xl font-semibold">
                          Delete Schedule
                        </DialogTitle>
                        <DialogDescription className="m-0">
                          Are you sure want to delete the schedule
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
                          onClick={handleDeleteSchedule}
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
                  <TooltipContent side="bottom" className="-mt-3 mr-1">
                    <p>Delete Schedule</p>
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

export default ScheduleSearch;
