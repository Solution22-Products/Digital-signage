"use client";
import { useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "./ui/button";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import { supabase } from "@/utils/supabase/supabaseClient";

interface MultiSelectPopoverProps {
  selectedScreenValues: string[];
  setSelectedScreenValues: React.Dispatch<React.SetStateAction<string[]>>;
  handleSelect: (currentValue: string | number) => void;
  width: any;
  selectWidth: any;
  defaultValue: any;
  placeholderValue: any;
}

const MultiSelectPopover : React.FC<MultiSelectPopoverProps> = ({
    setSelectedScreenValues, 
    selectedScreenValues, 
    handleSelect,
    width,
    selectWidth,
    defaultValue,
    placeholderValue
}) => {
    const [open, setOpen] = useState(false);
    const [screens, setScreens] = useState<any[]>([]);

  const getScreenData = async () => {
    const user = await getUserData();
    const userId = user?.id || null;
    const { data, error } = await supabase
      .from("screenDetails")
      .select("*")
      .eq("userId", userId);
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setScreens(data);
    }
  };

  useEffect(() => {
    getScreenData();
    if(selectedScreenValues) {
      setSelectedScreenValues(selectedScreenValues);
    }
  }, [selectedScreenValues]);

  return (
    <>
      {/* <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-${selectWidth} justify-between`}
          >
            {selectedScreenValues.length > 0
              ? selectedScreenValues
                  .map(
                    (value) =>
                      screens.find((framework) => framework.id === value)
                        ?.screenname
                  )
                  .join(", ")
              : defaultValue}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={`w-${width} p-0`}>
          <Command>
            <CommandInput placeholder={placeholderValue} />
            <CommandList>
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {screens.map((framework) => (
                  <CommandItem
                    key={framework.id}
                    value={framework.id}
                    onSelect={() => handleSelect(framework.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedScreenValues.includes(framework.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {framework.screenname}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover> */}
    </>
  );
};

export default MultiSelectPopover;
