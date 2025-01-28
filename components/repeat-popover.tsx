"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
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

interface RepeatProps {
  repeatValue: any;
  setRepeatValue: any;
  selectedRepeatId: any;
  setSelectedRepeatId: any;
  repeatOptions: any;
  width: any;
  selectWidth: any;
  defaultValue: any;
  placeholderValue: any;
  repeatSection: boolean | any;
  setRepeatSection: boolean | any;
  repeatUntilDate: boolean | any;
  setRepeatUntilDate: boolean | any;
  setRepeatEveryValue : any;
  setCustomRepeatValue : any;
  setRepeatDate : any;
  setRepeatEveryDay : any;
  notFoundMessage: any;
  // setErrors: any;
}

const RepeatPopover: React.FC<RepeatProps> = ({
  repeatValue,
  setRepeatValue,
  selectedRepeatId,
  setSelectedRepeatId,
  repeatOptions,
  width,
  selectWidth,
  defaultValue,
  placeholderValue,
  repeatSection,
  setRepeatSection,
  repeatUntilDate,
  setRepeatUntilDate,
  notFoundMessage,
  setRepeatEveryValue,
  setCustomRepeatValue,
  setRepeatDate,
  setRepeatEveryDay,
  // setErrors,
}) => {
  const [repeatOpen, setRepeatOpen] = useState(false);

  // useEffect(() => {
  //   if (repeatValue) {
  //     setRepeatValue(repeatValue);
  //     if(repeatValue === "Custom"){
  //       setRepeatSection(true);
  //     }
  //     else if (repeatValue === "Custom Date"){
  //       setRepeatUntilDate(true);
  //     }
  //     if( repeatValue !== "Custom"){
  //       setRepeatEveryValue('');
  //       setCustomRepeatValue('');
  //       setRepeatDate('');
  //       setRepeatEveryDay('');
  //     }
  //   }
  // }, [repeatValue]);

  useEffect(() => {
    if (selectedRepeatId) setSelectedRepeatId(selectedRepeatId);

    if (repeatValue === "Custom") {
      setRepeatSection(true);
    }
    if (repeatValue === "Custom Date") {
      setRepeatUntilDate(true);
    }
  }, [selectedRepeatId, repeatValue]);

  return (
    <>
      <Popover open={repeatOpen} onOpenChange={setRepeatOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={repeatOpen}
            className={`w-${selectWidth} justify-between`}
          >
            {repeatValue
              ? repeatOptions.find(
                  (playlist: any) => playlist.value === repeatValue
                )?.label
              : defaultValue}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <div className="relative">
          <PopoverContent className={`w-${width} p-0`}>
            <Command>
              <CommandInput placeholder={placeholderValue} />
              <CommandEmpty>{notFoundMessage}</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {repeatOptions.map((playlist: any) => (
                    <CommandItem
                      key={playlist.value}
                      value={playlist.value}
                      onSelect={(currentValue) => {
                        if (setRepeatValue) {
                          setRepeatValue(
                            currentValue === repeatValue ? null : currentValue
                          );
                        }
                        setRepeatOpen(false);
                        if (setSelectedRepeatId) {
                          setSelectedRepeatId(
                            currentValue === repeatValue ? null : currentValue
                          );
                        }
                        if (currentValue === "Custom") {
                          setRepeatSection(!repeatSection);
                        } else if (currentValue === "Custom Date" || currentValue === "Custom") {
                          setRepeatUntilDate(!repeatUntilDate);
                        } else {
                          setRepeatUntilDate(false);
                          if (currentValue !== "Custom" && currentValue !== "Forever" && (currentValue !== "Day" && currentValue !== "Month" && currentValue !== "Year" && currentValue !== "Week")) {
                            setRepeatSection(false);
                          }
                        }

                        // setErrors((prevErrors : any) => ({ ...prevErrors, repeat: undefined }));

                        console.log("currentValue repeat ", currentValue);
                        console.log("repeatValue", repeatValue);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          repeatValue === playlist.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {playlist.label}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </div>
      </Popover>
    </>
  );
};

export default RepeatPopover;
