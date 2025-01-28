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
import { signUp } from "@/app/admin/(common-modules)/admin-setting/action";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Please enter your name",
  }),
  email: z.string().min(3, {
    message: "Please enter a valid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }),
});

const roles = [
  { value: "Admin", label: "Admin" },
  // { value: "User", label: "User" },
];

const status = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const AddNewAdmin = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [modalShowPassword, setModalShowPassword] = useState(false);
  const [modalPassword, setModalPassword] = useState("");

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusValue, setStatusValue] = useState("");
  const [roleError, setRoleError] = useState("");
  const [statusError, setStatusError] = useState("");

  const [addAdminOpen, setAddAdminOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: modalPassword,
    },
  });

  const getAdminUserData = async () => {
    const { data, error } = await supabase.from("adminUserDetails").select("*");
    if (error) {
      console.log(error);
    } else {
      console.log(data);
    }
  };

  const handleSaveChanges = async () => {
    const { name, email, password } = form.getValues();
    let valid = true;

    // Role validation
    if (!value) {
      setRoleError("Role is required");
      valid = false;
    } else {
      setRoleError("");
    }

    // Status validation
    if (!statusValue) {
      setStatusError("Status is required");
      valid = false;
    } else {
      setStatusError("");
    }

    if (valid) {
      try {
        // Insert user details into the database
        const { data, error } = await supabase.from("adminUserDetails").insert([
          {
            name,
            email,
            password,
            role: roles.find((role) => role.value === value)?.label,
            status: status.find((s) => s.value === statusValue)?.label,
          },
        ]);

        if (error) {
          console.error("Database error:", error);
          return;
        }

        console.log("Data inserted:", data);
        // Sign up the user
        const roleId =
          roles.find((role) => role.value === value)?.label === "Admin" ? 2 : 3;
        const signUpResponse = await signUp(email, password, roleId);

        if (signUpResponse.error) {
          console.error("Sign up error:", signUpResponse.error);
        } else {
          // Reset form and close modal if sign up is successful
          form.reset();
          setAddAdminOpen(false);
        }

        // Fetch updated admin user data
        getAdminUserData();
      } catch (error) {
        console.error("An unexpected error occurred:", error);
      }
    }
  };

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    setModalPassword(password);
    form.setValue("password", password);
  };

  return (
    <>
      <Dialog open={addAdminOpen} onOpenChange={setAddAdminOpen}>
        <DialogTrigger asChild>
          <Button className="bg-primary_color text-white flex items-center gap-2">
            <CirclePlus size={20} />
            Add New Admin
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[592px]">
          <DialogHeader>
            <DialogTitle className="font-semibold text-2xl text-primary_color">
              Add New Admin
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSaveChanges)}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 items-baseline gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username / Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <div className="flex justify-between items-center">
                        <FormLabel>Password</FormLabel>
                        <p
                          className="w-fit bg-button_orange text-white px-1 rounded text-xs cursor-pointer"
                          onClick={generatePassword}
                        >
                          Generate
                        </p>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="**********"
                          type={modalShowPassword ? "text" : "password"}
                          {...field}
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            setModalPassword(e.target.value);
                          }}
                        />
                      </FormControl>
                      <span
                        className="absolute md:right-0 -right-0 top-6 cursor-pointer w-7 md:w-8 lg:w-11 flex items-center justify-center"
                        onClick={() => setModalShowPassword(!modalShowPassword)}
                      >
                        {modalShowPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </span>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                      >
                        {value
                          ? roles.find((role) => role.value === value)?.label
                          : "Select Role..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-full p-0"
                      style={{ width: "222%" }}
                    >
                      <Command>
                        <CommandInput placeholder="Search role..." />
                        <CommandEmpty>No role found.</CommandEmpty>
                        <CommandGroup>
                          <CommandList>
                            {roles.map((role) => (
                              <CommandItem
                                key={role.value}
                                value={role.value}
                                onSelect={(currentValue) => {
                                  setValue(
                                    currentValue === value ? "" : currentValue
                                  );
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    value === role.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {role.label}
                              </CommandItem>
                            ))}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {roleError && (
                    <p className="text-red-500 text-sm font-medium">
                      {roleError}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
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
                >
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddNewAdmin;
