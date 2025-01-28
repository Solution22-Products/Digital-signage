import { Check, ChevronsUpDown, CirclePlus, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/utils/supabase/supabaseClient";
import { revalidatePath } from "next/cache";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Please enter your name",
  }),
  price: z.string().min(1, {
    message: "Please enter the price",
  }),
  // storage: z.string().min(1, {
  //   message: "Please enter the storage",
  // }),
  screen_count: z.string().min(1, {
    message: "Please enter the screens count",
  }),
});

const status = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const AddNewPlan = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusValue, setStatusValue] = useState("");
  const [statusError, setStatusError] = useState("");

  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [saveLoader, setSaveLoader] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "",
      // storage: "",
      screen_count: "",
    },
  });

  const getPlanData = async () => {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("is_deleted", 0);
    if (error) {
      console.log(error);
    } else {
      console.log(data);
    }
  };

  const handleSaveChanges = async () => {
    const { name, price, screen_count } = form.getValues(); //,storage
    let valid = true;
    setSaveLoader(true);

    // Status validation
    if (!statusValue) {
      setStatusError("Status is required");
      valid = false;
    } else {
      setStatusError("");
    }

    if (valid) {
      try {
        // Insert plan details into the database
        const { data, error } = await supabase.from("plans").insert([
          {
            name,
            price,
            // storage,
            screen_count,
            status: status.find((s) => s.value === statusValue)?.label,
          },
        ]);

        if (error) {
          console.error("Database error:", error);
          setSaveLoader(false);
          return;
        } else {
          // Reset form and close modal if insert is successful
          form.reset();
          setAddPlanOpen(false);
          setSaveLoader(false);
          console.log("Data inserted:", data);
          getPlanData();
        }
        // Fetch updated plan data
      } catch (error) {
        setSaveLoader(false);
        console.error("An unexpected error occurred:", error);
      }
    } else {
      setSaveLoader(false);
    }
  };

  return (
    <>
      <Dialog open={addPlanOpen} onOpenChange={setAddPlanOpen}>
        <DialogTrigger asChild>
          <Button className="bg-primary_color text-white flex items-center gap-2">
            <CirclePlus size={20} />
            Add New Plan
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[592px]">
          <DialogHeader>
            <DialogTitle className="font-semibold text-2xl text-primary_color">
              Add New Plan
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSaveChanges)}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 items-baseline gap-4 py-1">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 items-baseline gap-4 py-1">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="Price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <FormField
                  control={form.control}
                  name="storage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage</FormLabel>
                      <FormControl>
                        <Input placeholder="Storage" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                <FormField
                  control={form.control}
                  name="screen_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Screen Count</FormLabel>
                      <FormControl>
                        <Input placeholder="Screen Count" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 items-baseline gap-4 py-1">
                <Label htmlFor="status">Status</Label>
                <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={statusOpen}
                      className="w-full justify-between"
                    >
                      {statusValue
                        ? status.find((s) => s.value === statusValue)?.label
                        : "Select Status..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-full p-0"
                    style={{ width: "222%" }}
                  >
                    <Command>
                      <CommandInput placeholder="Search status..." />
                      <CommandEmpty>No status found.</CommandEmpty>
                      <CommandGroup>
                        <CommandList>
                          {status.map((s) => (
                            <CommandItem
                              className="cursor-pointer z-40"
                              key={s.value}
                              value={s.value}
                              onSelect={(currentValue) => {
                                setStatusValue(
                                  currentValue === statusValue
                                    ? ""
                                    : currentValue
                                );
                                setStatusOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  statusValue === s.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {s.label}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {statusError && (
                  <p className="text-red-500 text-sm font-medium">
                    {statusError}
                  </p>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="w-2/4">
                    Discard
                  </Button>
                </DialogClose>
                <Button
                  className="w-2/4 bg-button_orange hover:bg-button_orange"
                  type="submit"
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
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddNewPlan;
