"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Check,
  ChevronsUpDown,
  CirclePlus,
  Eye,
  EyeOff,
  LogIn,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import toast from "react-hot-toast";
import { supabase } from "@/utils/supabase/supabaseClient";
import { Label } from "@/components/ui/label";
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

interface Plan {
  id: string;
  name: string;
}

interface Role {
  id: string;
  roleName: string;
}

const formSchema = z.object({
  picture: z
    .any()
    .refine(
      (file) => file?.length === 1,
      "*Supported image formats include JPEG, PNG"
    )
    .refine(
      (file) => file[0]?.type === "image/png" || file[0]?.type === "image/jpeg",
      "Must be a png or jpeg"
    )
    .refine((file) => file[0]?.size <= 5000000, "Max file size is 5MB."),
  companyName: z.string().min(2, {
    message: "Company name is not recognized. Please try again.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  mobile: z.string().min(10, {
    message: "Please enter a valid mobile number",
  }),
  address: z.string().min(1, {
    message: "Please enter a valid address",
  }),
  website: z.string().min(1, {
    message: "Please enter a valid website",
  }),
  state: z.string().min(1, {
    message: "Please enter a valid state",
  }),
  city: z.string().min(1, {
    message: "Please enter a valid city",
  }),
  role: z.number().min(1, {
    message: "Please select the role",
  }),
  zipcode: z.string().min(6, {
    message: "Please enter a valid zip code",
  }),
  country: z.string().min(3, {
    message: "Please enter a valid country",
  }),
  password: z.string().min(8, {
    message: "Please enter a valid password",
  }),
  plan: z.number().min(1, {
    message: "Please select the plan",
  }),
});

const notify = (message: string, success: boolean) =>
  toast[success ? "success" : "error"](message, {
    style: {
      borderRadius: "10px",
      background: "#fff",
      color: "#000",
    },
    position: "top-right",
    duration: 2000,
  });

const ClientDetails = () => {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [openplan, setOpenplan] = useState(false);

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [openrole, setOpenrole] = useState(false);

  const [modalShowPassword, setModalShowPassword] = useState(false);
  const [modalPassword, setModalPassword] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      picture: "",
      companyName: "",
      email: "",
      mobile: "",
      address: "",
      website: "",
      state: "",
      city: "",
      role: "3",
      zipcode: "",
      country: "",
      password: "",
      plan: "",
    },
  });

  const onSubmit = async (formData: any) => {
    try {
      let uploadedUrl = null;

      // Handle Image Upload
      if (formData.picture && formData.picture.length > 0) {
        const file = formData.picture[0];
        const { data: uploadedFile, error: uploadedError } =
          await supabase.storage
            .from("profile")
            .upload(`profiles/${file.name}`, file, {
              cacheControl: "3600",
              upsert: true,
            });

        if (uploadedError) {
          throw new Error("Error uploading file: " + uploadedError.message);
        }

        const { data: publicURLData } = supabase.storage
          .from("profile")
          .getPublicUrl(uploadedFile.path);
        uploadedUrl = publicURLData.publicUrl;
      }

      // Create User in Auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
        });

      if (authError) {
        throw new Error("Error creating user: " + authError.message);
      }

      // Insert User Data into Table
      const { error: insertError } = await supabase.from("usersList").insert({
        email: formData.email,
        name: formData.companyName,
        mobile: formData.mobile,
        address: formData.address,
        website: formData.website,
        state: formData.state,
        city: formData.city,
        role: formData.role,
        zipcode: formData.zipcode,
        country: formData.country,
        password: formData.password,
        plan: formData.plan,
        url: uploadedUrl, // Set the uploaded image URL
      });

      if (insertError) {
        throw new Error("Error inserting user data: " + insertError.message);
      }

      notify("Client created successfully", true);
      form.reset();
      router.push("/clients");
    } catch (error: any) {
      console.error("Error in onSubmit:", error.message);
      notify(error.message, false);
    }
  };

  const handleImageChange = (files: any) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase.from("plans").select("*");
      if (error) {
        toast.error("Error fetching plans");
        return;
      }
      setPlans(data);
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await supabase.from("roles").select("*");
      if (error) {
        toast.error("Error fetching plans");
        return;
      }
      setRoles(data);
    };
    fetchRoles();
  }, []);

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    setModalPassword(password);
    form.setValue("password", password);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <Grid
            container
            rowSpacing={1}
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            style={{ height: "auto", margin: 0, width: "100%" }}
          >
            <Grid item xs={10} style={{ height: "10vh", padding: 10 }}>
              <div className="flex items-center gap-2 mt-0">
                <h4
                  className="text-base font-medium text-primary_color cursor-pointer"
                  onClick={() => router.back()}
                >
                  Client List
                </h4>
                <ChevronRight />
                <h4 className="text-base font-medium text-primary_color">
                  Add New Client
                </h4>
              </div>
            </Grid>
            <Grid item xs={2} style={{ height: "10vh", padding: 10 }}>
              <div className="flex items-center gap-6 w-full">
                <Button className="hover:opacity-75 w-2/4">Save</Button>
                <Button variant={"outline"} className="w-2/4 bg-button_gray">
                  Discard
                </Button>
              </div>
            </Grid>

            <Grid item xs={2} style={{ height: "50vh", padding: 10 }}>
              <FormField
                control={form.control}
                name="picture"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-2">
                    <FormControl>
                      <div className="flex flex-col items-center justify-center mt-5 gap-2">
                        <div className="relative w-32 h-32 rounded-full border-2 border-border_gray">
                          <Input
                            type="file"
                            accept="image/png, image/jpeg"
                            placeholder="Upload Image"
                            className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                            onChange={(e) => {
                              field.onChange(e.target.files);
                              handleImageChange(e.target.files as FileList);
                            }}
                          />
                          <Image
                            src={imageUrl || ""}
                            alt="Profile Image"
                            layout="fill"
                            objectFit="cover"
                            className="rounded-full z-0 text-transparent"
                          />
                          <div className="text-black bg-white absolute right-1 bottom-2 p-1 border border-border_gray rounded-full w-8 h-8 flex justify-center items-center">
                            <Pencil size={16} className="cursor-pointer" />
                          </div>
                        </div>
                        {/* <p className="text-center text-sm font-medium text-placeholder">
                          Allowed Types: jpg, png, jpeg
                        </p> */}
                      </div>
                    </FormControl>
                    {/* <FormMessage className="text-center" /> */}
                  </FormItem>
                )}
              />
            </Grid>
            <Grid item xs={5} style={{ height: "50vh", padding: 10 }}>
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="Company Name"
                        {...field}
                      />
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
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="Email Address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="Mobile Number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="Address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Grid>
            <Grid item xs={5} style={{ height: "50vh", padding: 10 }}>
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="Website"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="City"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="State"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zipcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="Zip Code"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Grid>
            <Grid item xs={2} style={{ height: "50vh", padding: 10 }}></Grid>
            <Grid item xs={5} style={{ height: "50vh", padding: 10 }}>
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="Country"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="Plan"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan</FormLabel>
                    <Popover open={openplan} onOpenChange={setOpenplan}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openplan}
                          className="w-full justify-between"
                        >
                          {selectedPlan
                            ? plans.find((plan) => plan.id === selectedPlan)
                                ?.name
                            : "Select Plan..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search plan..." />
                          <CommandList>
                            {plans.map((plan) => (
                              <CommandItem
                                key={plan.id}
                                onSelect={() => {
                                  setSelectedPlan(plan.id);
                                  field.onChange(plan.id); // Update form value with selected plan
                                  setOpenplan(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedPlan === plan.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {plan.name}
                              </CommandItem>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Grid>
            <Grid item xs={5} style={{ height: "50vh", padding: 10 }}>
              {/* <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="Role"
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Popover open={openrole} onOpenChange={setOpenrole}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openrole}
                          className="w-full justify-between"
                        >
                          {selectedRole
                            ? roles.find((role) => role.id === selectedRole)
                                ?.roleName
                            : "Select Role..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search role..." />
                          <CommandList>
                            {roles.map((role) => (
                              <CommandItem
                                key={role.id}
                                onSelect={() => {
                                  setSelectedRole(role.id);
                                  field.onChange(role.id); // Update form value with selected plan
                                  setOpenrole(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedRole === role.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {role.roleName}
                              </CommandItem>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="bg-white"
                        placeholder="Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
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
            </Grid>
          </Grid>
        </form>
      </Form>
    </Box>
  );
};

export default ClientDetails;
