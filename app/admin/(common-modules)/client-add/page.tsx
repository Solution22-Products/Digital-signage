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
import toast, { Toaster } from "react-hot-toast";
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
// import { getUserData } from "@/app/(sign-in)/sign-in/action";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import { createUser } from "@/app/admin/(common-modules)/client-add/action";

interface Plan {
  id: string;
  name: string;
}

interface Role {
  id: string;
  roleName: string;
}

const formSchema = z.object({
  picture: z.any(),
  // .refine(
  //   (file) => file?.length === 1,
  //   "*Supported image formats include JPEG, PNG"
  // )
  // .refine(
  //   (file) => file[0]?.type === "image/png" || file[0]?.type === "image/jpeg",
  //   "Must be a png or jpeg"
  // )
  // .refine((file) => file[0]?.size <= 5000000, "Max file size is 5MB."),
  companyName: z.string().min(2, {
    message: "Company name is not recognized. Please try again.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  mobile: z.string().min(10, {
    message: "Please enter a valid mobile number",
  }),
  address: z.string().min(0, {
    message: "Please enter a valid address",
  }),
  website: z.string().min(0, {
    message: "Please enter a valid website",
  }),
  state: z.string().min(0, {
    message: "Please enter a valid state",
  }),
  city: z.string().min(0, {
    message: "Please enter a valid city",
  }),
  // role: z.number().min(1, {
  //   message: "Please select the role",
  // }),
  zipcode: z.string().min(0, {
    message: "Please enter a valid zip code",
  }),
  country: z.string().min(0, {
    message: "Please enter a valid country",
  }),
  password: z.string().min(8, {
    message: "Please enter a valid password",
  }),
  // plan: z.number().min(1, {
  //   message: "Please select the plan",
  // }),
});

const notify = (message: string, success: boolean) =>
  toast[success ? "success" : "error"](message, {
    style: {
      borderRadius: "10px",
      background: "#fff",
      color: "#000",
    },
    position: "top-right",
    duration: 3000,
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
  const [saveLoader, setSaveLoader] = useState(false);
  const [cancelLoader, setCancelLoader] = useState(false);

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
      role: "",
      zipcode: "",
      country: "",
      password: "",
      plan: "",
    },
  });

  const onSubmit = async (formData: any) => {
    formData.plan = selectedPlan;
    formData.role = selectedRole;
    //console.log(formData);
    try {
      let uploadedUrl = null;
      setSaveLoader(true);

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
          setSaveLoader(false);
          throw new Error("Error uploading file: " + uploadedError.message);
        }

        const { data: publicURLData } = supabase.storage
          .from("profile")
          .getPublicUrl(uploadedFile.path);
        uploadedUrl = publicURLData.publicUrl;
      }

      const signUpResponse = await createUser(
        formData.email,
        formData.companyName,
        formData.mobile,
        formData.address,
        formData.website,
        formData.state,
        formData.city,
        formData.role || "3", //"3" || 3,
        formData.zipcode,
        formData.country,
        formData.password,
        formData.plan || "", //"be34dce8-8f81-4b42-94b4-53767464086c",
        uploadedUrl || "", // Set the uploaded image URL
        "Active"
      );

      if (signUpResponse?.data == null) {
        setSaveLoader(false);
        console.error("Sign up error:", signUpResponse);
      }

      const user = await getUserData();
      const userId = user?.id;
      if (!userId) {
        setSaveLoader(false);
        console.error("signedInUserId is invalid.");
        return;
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
        roleId: formData.role || "3", //"3" || 3,
        zipcode: formData.zipcode,
        country: formData.country,
        password: formData.password,
        plan: formData.plan || "", //"be34dce8-8f81-4b42-94b4-53767464086c",
        url: uploadedUrl, // Set the uploaded image URL
        status: "Active",
        created_by: userId || "",
        userId: signUpResponse?.data?.id || "",
        logs: [],
      });

      if (insertError) {
        setSaveLoader(false);
        notify("Error inserting user data: " + insertError.message, false);
        throw new Error("Error inserting user data: " + insertError.message);
      }

      notify("Client created successfully", true);
      form.reset();
      setSaveLoader(false);
      router.push("/admin/client");
    } catch (error: any) {
      console.error("Error in onSubmit:", error.message);
      setSaveLoader(false);
      // notify(error.message, false);
      notify("Entered email already exists.", false);
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
    const fetchRoles = async () => {
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("*")
        .eq("id", 3);
      if (roleError) {
        toast.error("Error fetching roles");
        return;
      }
      setRoles(roleData);
      // Set the default role to "User"
      const selectRole = roleData.find((role) => role.roleName === "User");
      if (selectRole) {
        setSelectedRole(selectRole.id);
        form.setValue("role", selectRole.id); // Set the default value in the form
      }
    };

    const fetchPlans = async () => {
      const { data: planData, error: planError } = await supabase
        .from("plans")
        .select("*")
        .eq("is_deleted", 0);
      if (planError) {
        toast.error("Error fetching plans");
        return;
      }
      setPlans(planData);
      // Set the default plan to "Basic"
      const selectPlan = planData.find((plan) => plan.name === "Basic");
      if (selectPlan) {
        setSelectedPlan(selectPlan.id);
        form.setValue("plan", selectPlan.id); // Set the default value in the form
      }
    };

    fetchPlans();
    fetchRoles();
  }, []);

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    setModalPassword(password);
    form.setValue("password", password);
  };

  return (
    // <Box sx={{ width: "100%" }}>
    <div
      className="w-full p-4 pt-6"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      <Toaster />
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
                <Button
                  type="submit"
                  className="hover:opacity-75 w-2/4"
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
                        className="opacity-100"
                        fill="#fff"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  type="button"
                  variant={"outline"}
                  className="w-2/4 bg-button_gray"
                  onClick={() => {
                    setCancelLoader(true);
                    setTimeout(() => {
                      router.back();
                      setCancelLoader(false);
                    }, 2000);
                  }}
                >
                  {cancelLoader ? (
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
                        stroke="#09090B"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-100"
                        fill="#09090B"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "Discard"
                  )}
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
                  <FormItem className="mb-2">
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
                  <FormItem className="mb-2">
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
                  <FormItem className="mb-2">
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
                  <FormItem className="mb-2">
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
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem className="mb-2">
                    <FormLabel>Plan</FormLabel>
                    <Popover open={openplan} onOpenChange={setOpenplan}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openplan}
                          className={cn(
                            "w-full justify-between",
                            !selectedPlan && "text-muted-foreground"
                          )}
                        >
                          {selectedPlan
                            ? plans.find((plan) => plan.id === selectedPlan)
                                ?.name
                            : "Select a plan"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search plan..." />
                          <CommandList>
                            <CommandEmpty>No plan found.</CommandEmpty>
                            <CommandGroup>
                              {plans.map((plan) => (
                                <CommandItem
                                  key={plan.id}
                                  onSelect={() => {
                                    setSelectedPlan(plan.id);
                                    field.onChange(plan.id); // This updates the form value
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
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="mb-2">
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
            </Grid>
            <Grid item xs={5} style={{ height: "50vh", padding: 10 }}>
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="mb-2">
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
                  <FormItem className="mb-2">
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
                  <FormItem className="mb-2">
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
                  <FormItem className="mb-2">
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
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Role</FormLabel>
                    <Popover open={openrole} onOpenChange={setOpenrole}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openrole}
                          className={cn(
                            "w-full justify-between",
                            !selectedRole && "text-muted-foreground"
                          )}
                        >
                          {selectedRole
                            ? roles.find((role) => role.id === selectedRole)
                                ?.roleName
                            : "Select a role"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search plan..." />
                          <CommandList>
                            <CommandEmpty>No role found.</CommandEmpty>
                            <CommandGroup>
                              {roles.map((role) => (
                                <CommandItem
                                  key={role.id}
                                  onSelect={() => {
                                    setSelectedRole(role.id);
                                    field.onChange(role.id); // This updates the form value
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
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="mb-2 relative">
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
    </div>
    // </Box>
  );
};

export default ClientDetails;
