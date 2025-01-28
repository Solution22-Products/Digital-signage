import { Filter } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useState } from "react";
import React from "react";
import Select from "react-select";
import { Button } from "./ui/button";

interface FilterProps {
  screenFilterValue: string;
  setScreenFilterValue: (value: string) => void;
  handleFilterScreen: () => void;
  screenStatusFilter: string;
  setScreenStatusFilter: (value: string) => void;
  screenData?: any;
  fetchScreenFolderData?: any;
  folderDataShow: boolean;
  screenDataShow?: boolean;
}

const orientationOptions = [
  {
    value: "Any",
    label: "Any",
  },
  {
    value: "Landscape",
    label: "Landscape",
  },
  {
    value: "Portrait",
    label: "Portrait",
  },
];

const statusOption = [
  {
    value: "Active",
    label: "Active",
  },
  {
    value: "Inactive",
    label: "Inactive",
  },
];

const FilterComponent: React.FC<FilterProps> = ({
  screenFilterValue,
  setScreenFilterValue,
  handleFilterScreen,
  screenStatusFilter,
  setScreenStatusFilter,
  screenData,
  fetchScreenFolderData,
  folderDataShow,
  screenDataShow,
}) => {
  const handleSelectChange = (selectedOption: any) => {
    setScreenFilterValue(selectedOption?.value || "");
  };

  const handleScreenStatus = (status: any) => {
    setScreenStatusFilter(status?.value || "");
  };

  const handleResetFilter = () => {
    fetchScreenFolderData();
  };
  const handleResetFilter1 = () => {
    screenData();
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <Sheet>
            <SheetTrigger asChild>
              <TooltipTrigger>
                <li className="py-2.5 px-3 border rounded border-border_gray cursor-pointer transition-all duration-300 ease-in-out w-[44px] h-[40px] mb-3 hover:bg-button_orange hover:text-white">
                  <Filter size={20} />
                </li>
              </TooltipTrigger>
            </SheetTrigger>
            <SheetContent className="pt-7">
              <SheetHeader>
                <SheetTitle className="text-base font-bold text-primary_color">
                  Filter Options
                </SheetTitle>
                <SheetDescription>
            {}
          </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col justify-between h-full">
                <div className="mt-2">
                  <div>
                    <label className="text-sm font-medium">Orientation</label>
                    <Select
                      className="w-full mt-1"
                      options={orientationOptions}
                      onChange={handleSelectChange}
                      value={orientationOptions.find(
                        (option) => option.value === screenFilterValue
                      )}
                      isClearable
                    />
                  </div>
                  <div className="mt-3">
                    <label className="text-sm font-medium">Screen Status</label>
                    <Select
                      className="w-full mt-1"
                      options={statusOption}
                      onChange={handleScreenStatus}
                      value={statusOption.find(
                        (option) => option.value === screenStatusFilter
                      )}
                      isClearable
                    />
                  </div>
                </div>

                <div className="mb-4 flex flex-col items-center gap-2">
                  <div className="w-full flex items-center gap-2">
                    <SheetClose asChild className=" w-1/2">
                      <Button variant={"outline"}>Cancel</Button>
                    </SheetClose>
                    <SheetClose asChild className=" w-1/2">
                      <Button
                        className="w-1/2 bg-button_orange text-white cursor-pointer hover:bg-button_orange"
                        onClick={handleFilterScreen}
                      >
                        Apply
                      </Button>
                    </SheetClose>
                  </div>
                  {folderDataShow && (
                    <SheetClose asChild className="w-full">
                      <Button variant={"outline"} onClick={handleResetFilter}>
                        Reset
                      </Button>
                    </SheetClose>
                  )}
                  {screenDataShow && (
                    <SheetClose asChild className="w-full">
                      <Button variant={"outline"} onClick={handleResetFilter1}>
                        Reset
                      </Button>
                    </SheetClose>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <TooltipContent side="bottom" className="-mt-3">
            <p>Filter</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};

export default FilterComponent;
