"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronsUpDown,
  CirclePlus,
  Eye,
  EyeOff,
  LogIn,
  Trash2,
  Pencil,
  ChevronLeft,
  MoreHorizontal,
  NotebookPen,
  CheckIcon,
} from "lucide-react";
import { ChevronRight } from "lucide-react";
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
// import toast, { Toaster } from "react-hot-toast";
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
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import { getUserData } from "@/app/(sign-in)/sign-in/action";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import { updateUser } from "@/app/admin/(common-modules)/client-add/action";
import { toast, useToast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import Select from "react-select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Timeline } from "rsuite";
import "rsuite/dist/rsuite-no-reset.min.css";
import "./style.css";

interface Props {
  params: {
    id: string;
  };
}

interface Plan {
  id: string;
  name: string;
  price: string;
  // storage: string;
  screen_count: string;
  status: "Active" | "Inactive";
  action: string;
  client_id: string;
}

interface Row {
  getValue(key: string): any;
  original: {
    id: string;
    status: string;
    // other properties of the row
  };
}

interface Role {
  id: string;
  roleName: string;
}

const planList = [
  {
    value: "Basic",
    label: "Basic",
    clientId: "69f49efa-e447-4cf4-ba78-33daf698abc4",
  },
  {
    value: "Premium",
    label: "Premium",
    clientId: "69f49efa-e447-4cf4-ba78-33daf698abc4",
  },
];

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
  mobile: z
    .string()
    .min(9, {
      message: "Please enter a valid mobile number with at least 9 digits",
    })
    .max(11, {
      message: "Please enter a valid mobile number with no more than 11 digits",
    })
    .regex(/^[0-9]+$/, {
      message: "Please enter a valid mobile number with no special characters",
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

// const notify = (message: string, success: boolean) =>
//   toast[success ? "success" : "error"](message, {
//     style: {
//       borderRadius: "10px",
//       background: "#fff",
//       color: "#000",
//     },
//     position: "top-right",
//     duration: 2000,
//   });

const ClientDetails = (props: Props) => {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [planname, setPlanname] = useState<string | null>(null);

  const [initialClientName, setInitialClientName] = useState("");
  const [selecteduserId, setSelecteduserId] = useState<string>("");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [openplan, setOpenplan] = useState(false);

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [openrole, setOpenrole] = useState(false);

  const [modalShowPassword, setModalShowPassword] = useState(false);
  const [modalPassword, setModalPassword] = useState("");
  const [userPlan, setUserPlan] = useState<number | null>();

  const [data, setData] = useState<any[]>([]); // State to manage data
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [clientDeleteOpen, setClientDeleteOpen] = useState(false);
  const [saveLoader, setSaveLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);

  const [screenA, setscreenA] = useState<number | null>();
  const [screenI, setscreenI] = useState<number | null>();
  const [signInLoading, setSigninLoading] = useState(false);
  const [logs, setLogs] = useState({});
  const [oldLogs, setOldLogs] = useState<
    { timestamp: string; changes: string }[]
  >([]);
  const [finalLogs, setFinalLogs] = useState<
    { timestamp: string; changes: string }[]
  >([]);

  const { id } = props.params;

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
      password: modalPassword,
      plan: "",
    },
  });

  const getClientData = async () => {
    const { data, error } = await supabase
      .from("usersList")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching data from usersList:", error);
    } else {
      const { data: screenAData, error: screenAError } = await supabase
        .from("screenDetails")
        .select("*")
        .eq("userId", id)
        .eq("is_deleted", 0)
        .eq("status", "Active");

      const { data: screenIData, error: screenIError } = await supabase
        .from("screenDetails")
        .select("*")
        .eq("userId", id)
        .eq("is_deleted", 0)
        .eq("status", "Inactive");

      setscreenA(screenAData ? screenAData.length : 0);
      setscreenI(screenIData ? screenIData.length : 0);

      const clientData = {
        name: data?.name || "",
        email: data?.email || "",
        mobile: data?.mobile || "",
        address: data?.address || "",
        website: data?.website || "",
        state: data?.state || "",
        city: data?.city || "",
        role: data?.roleId || "",
        zipcode: data?.zipcode || "",
        country: data?.country || "",
        password: data?.password || "",
        url: data?.url || "",
        plan: data?.plan || "",
      };
      setLogs(clientData);
      setOldLogs(data.logs);

      // Optionally, update form values as well
      form.setValue("companyName", data?.name || "");
      form.setValue("email", data?.email || "");
      form.setValue("mobile", data?.mobile || "");
      form.setValue("address", data?.address || "");
      form.setValue("website", data?.website || "");
      form.setValue("state", data?.state || "");
      form.setValue("city", data?.city || "");
      form.setValue("role", data?.role || "");
      form.setValue("zipcode", data?.zipcode || "");
      form.setValue("country", data?.country || "");
      form.setValue("password", data?.password || "");
      form.setValue("picture", data?.url || "");
      setImageUrl(data?.url || "");
      setSelectedPlan(data?.plan);
      setSelectedRole(data?.roleId);
      setInitialClientName(data?.name);
      setSelecteduserId(data?.userId);
    }
  };

  const RowCell1 = ({ row }: { row: Row }) => {
    const [status, setStatus] = useState<string>(
      row.getValue("status") as string
    );

    const handleStatusChange = async (checked: boolean) => {
      const newStatus = checked ? "Active" : "Inactive";
      setStatus(newStatus as any);
      const user = await getUserData();
      const userId = user?.id || "";

      // Update status in the database
      const { error } = await supabase
        .from("usersList")
        .update({ plan_status: newStatus, updated_by: userId })
        .eq("id", id);

      if (error) {
        console.error("Error updating status:", error);
      }
    };

    return (
      <div className="flex items-center">
        <Switch
          checked={status === "Active"}
          onCheckedChange={handleStatusChange}
        />
      </div>
    );
  };

  const RowCell2 = ({ row }: { row: Row }) => {
    const plan = row.original;
    const [planEditOpen, setPlanEditOpen] = useState(false);
    const [planListOpen, setPlanListOpen] = useState(false);
    const [planValue, setPlanValue] = useState<string | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>("");
    const [updateLoader, setUpdateLoader] = useState(false);

    const handleAddPlan = async () => {
      setUpdateLoader(true);
      const { data: planData, error: planDataError } = await supabase
        .from("plans")
        .select("*")
        .eq("id", selectedPlanId)
        .single();
      if (planDataError) {
        setUpdateLoader(false);
      }

      const user = await getUserData();
      const userId = user?.id || "";

      const { error } = await supabase
        .from("usersList")
        .update({ plan: planData.id, updated_by: userId })
        .eq("id", id);
      if (error) {
        setUpdateLoader(false);
        console.error("Error updating plan:", error);
      }
      setUpdateLoader(false);
      getClientData();
    };

    const contentOptions = plans.map((framework: any) => ({
      value: framework.id,
      label: framework.name,
    }));

    const customStyles = {
      menu: (provided: any) => ({
        ...provided,
        maxHeight: 200, // Set a max height for the dropdown menu
        overflowY: "auto", // Enable vertical scrolling
      }),
    };

    const handleSelectChange = (selectedOption: any) => {
      const selectedId = selectedOption ? selectedOption.value : null;

      // Update content value and selected folder
      if (setPlanValue) {
        setPlanValue(selectedId);
      }

      if (setSelectedPlanId) {
        setSelectedPlanId(selectedId);
      }
      // setPlanEditOpen(false);
      // Additional logic if needed
    };

    return (
      <>
        <Button
          variant="outline"
          className="h-8 w-content p-2 bg-zinc-100"
          onClick={() => setPlanEditOpen(true)}
        >
          Upgrade
        </Button>

        <Dialog open={planEditOpen} onOpenChange={setPlanEditOpen}>
          <DialogContent className="sm:max-w-[592px] h-[200px]">
            <DialogHeader>
              <DialogTitle className="font-semibold text-2xl text-primary_color">
                Choose Plan
              </DialogTitle>
            </DialogHeader>
            <DialogDescription>
              <Select
                className="w-full basic-single"
                options={contentOptions}
                onChange={handleSelectChange}
                value={contentOptions.find(
                  (option: any) => option.value === planValue
                )}
                placeholder="Select Folder"
                isClearable
                styles={customStyles}
                menuPlacement="auto"
                menuShouldScrollIntoView={true}
              />
            </DialogDescription>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="w-2/4">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="w-2/4 bg-button_orange hover:bg-button_orange"
                type="submit"
                onClick={handleAddPlan}
                disabled={updateLoader}
              >
                {updateLoader ? (
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
                  "Update"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  const columns: ColumnDef<Plan>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0"
        >
          Plan Name
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0"
        >
          Price
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("price")}</div>,
    },
    // {
    //   accessorKey: "storage",
    //   header: ({ column }) => (
    //     <Button
    //       variant="ghost"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //       className="pl-0"
    //     >
    //       Storage
    //       <ChevronsUpDown className="ml-2 h-4 w-4" />
    //     </Button>
    //   ),
    //   cell: ({ row }) => <div className="">{row.getValue("storage")} GB</div>,
    // },
    {
      accessorKey: "screen_count",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0"
        >
          Screens
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("screen_count")}</div>
      ),
    },
    // {
    //   accessorKey: "users",
    //   header: ({ column }) => (
    //     <Button
    //       variant="ghost"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //       className="pl-0"
    //     >
    //       Users
    //       <ChevronsUpDown className="ml-2 h-4 w-4" />
    //     </Button>
    //   ),
    //   cell: ({ row }) => (
    //     <div className="lowercase">{row.getValue("screen_count")}</div>
    //   ),
    // },
    // {
    //   accessorKey: "status",
    //   header: "Status",
    //   cell: RowCell1,
    // },
    {
      id: "actions",
      enableHiding: false,
      header: "Actions",
      cell: RowCell2,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  function getAllChanges(
    newClient: any,
    originalClient: any
  ): Array<{ timestamp: string; changes: string }> {
    const changesList: Array<{ timestamp: string; changes: string }> = [];

    // Helper function to capitalize the first letter and make the rest lowercase
    function capitalizeFullKey(key: string): string {
      const lowercased = key.toLowerCase().replace(/_/g, " ");
      return lowercased.charAt(0).toUpperCase() + lowercased.slice(1);
    }

    // Helper function for deep comparison
    function compareNestedObjects(newObj: any, oldObj: any, parentKey: any) {
      for (let key in newObj) {
        // Skip processing for 'roleId'
        if (key === "roleId") {
          continue; // Skip 'roleId' and move on to the next key
        }

        let fullKey = parentKey
          ? `${decodeURIComponent(parentKey)} ${key}`
          : key;

        // Capitalize the full key
        fullKey = capitalizeFullKey(fullKey);

        if (
          typeof newObj[key] === "object" &&
          newObj[key] !== null &&
          !Array.isArray(newObj[key])
        ) {
          compareNestedObjects(newObj[key], oldObj[key], fullKey);
        } else if (
          JSON.stringify(newObj[key]) !== JSON.stringify(oldObj?.[key])
        ) {
          const timestamp = new Date().toLocaleString("en-GB", {
            hour12: true,
          });
          const formattedKey =
            key === "enabled"
              ? fullKey.replace("enabled", "service")
              : key === "show"
              ? fullKey.replace("show", "service")
              : fullKey;
          changesList.push({
            timestamp,
            changes: `${formattedKey} ${
              key === "show" ? "has been" : "has changed from"
            } "${
              key === "show"
                ? newObj?.[key] === true
                  ? "added"
                  : newObj?.[key] === false
                  ? "deleted"
                  : newObj?.[key]
                : oldObj?.[key] !== undefined
                ? oldObj[key] === true
                  ? "enabled"
                  : oldObj[key] === false
                  ? "disabled"
                  : oldObj[key]
                : ""
            }" 
                      ${
                        key !== "show"
                          ? `to "${
                              newObj[key] !== undefined
                                ? newObj[key] === true
                                  ? "enabled"
                                  : newObj[key] === false
                                  ? "disabled"
                                  : newObj[key]
                                : newObj[key]
                            }"`
                          : ""
                      }.`,
          });
        }
      }
    }

    compareNestedObjects(newClient, originalClient, "");
    return changesList;
  }

  const onSubmit = async (formData: any) => {
    formData.plan = selectedPlan;
    formData.role = selectedRole;
    try {
      setSaveLoader(true);
      let uploadedUrl = imageUrl;

      // Handle Image Upload
      if (formData.picture && formData.picture.length > 0) {
        const file = formData.picture[0];
        if (file.name != undefined || file.name != null) {
          const { data: uploadedFile, error: uploadedError } =
            await supabase.storage
              .from("profile")
              .upload(`${file.name}`, file, {
                cacheControl: "3600",
                upsert: true,
              });

          if (uploadedError) {
            setSaveLoader(false);
            console.error("Upload error:", uploadedError);
            // notify("Upload error", false);
            toast({
              title: "Upload error.",
              description: `Upload error:` + { uploadedError },
            });
            return;
          }

          const { data: publicURLData } = supabase.storage
            .from("profile")
            .getPublicUrl(`${uploadedFile.path}`);
          uploadedUrl = publicURLData.publicUrl;
        }
      }

      // if (signUpResponse?.data == null) {
      //   setSaveLoader(false);
      //   console.error("Sign up error:", signUpResponse);
      // }

      const user = await getUserData();
      const userId = user?.id;
      if (!userId) {
        setSaveLoader(false);
        console.error("signedInUserId is invalid.");
        return;
      }

      // Insert User Data into Table
      const { error: insertError } = await supabase
        .from("usersList")
        .update({
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
          // userId: selecteduserId || "",
        })
        .eq("id", id)
        .select();

      if (insertError) {
        setSaveLoader(false);
        throw new Error("Error updating3 user data: " + insertError.message);
      }
      const updateLog = {
        email: formData.email,
        name: formData.companyName,
        mobile: formData.mobile,
        address: formData.address,
        website: formData.website,
        state: formData.state,
        city: formData.city,
        roleId: formData.role || "3", // Default to "3" if no role is provided
        zipcode: formData.zipcode,
        country: formData.country,
        password: formData.password,
        plan: formData.plan || "", // Default to empty string if no plan is provided
        url: uploadedUrl, // Set the uploaded image URL
      };
      // Only update if there are changes
      const allChanges = getAllChanges(updateLog, logs);
      const mergedLogs = [...oldLogs, ...allChanges];
      setFinalLogs(mergedLogs);

      try {
        const { error: updateError } = await supabase
          .from("usersList")
          .update({ logs: mergedLogs }) // Update the merged logs in Supabase
          .eq("id", id)
          .select();

        if (updateError) {
          setSaveLoader(false);
          throw new Error("Error updating user data: " + updateError.message);
        }
      } catch (error) {
        console.error("Error:", error);
      }

      //notify("Client updated successfully", true);
      getClientData();
      updateUser(formData.password, selecteduserId);
      setSaveLoader(false);
      toast({
        title: "Data updated successfully!.",
        description: "Client updated successfully!",
      });
      //form.reset();
      //router.push("/client");
    } catch (error: any) {
      console.error("Error in onSubmit:", error.message);
      setSaveLoader(false);
      // notify(error.message, false);
      toast({
        title: "Client updated Unsuccessfull!.",
        description: `"Error in onSubmit "+ ${error.message}`,
      });
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
      const { data: planData, error: planError } = await supabase
        .from("plans")
        .select("*")
        .eq("is_deleted", 0);
      if (planError) {
        // toast.error("Error fetching plans");
        toast({
          title: "Data Fetching UnSuccessfull!.",
          description: "Error fetching plans!",
        });
        return;
      }
      setPlans(planData);
    };
    fetchPlans();
    const fetchRoles = async () => {
      const { data: roleDta, error: roleError } = await supabase
        .from("roles")
        .select("*")
        .eq("id", 3);
      if (roleError) {
        // toast.error("Error fetching roles");
        toast({
          title: "Data Fetching UnSuccessfull!.",
          description: "Error fetching roles!",
        });
        return;
      }
      setRoles(roleDta);
    };
    fetchRoles();
    getClientData();
  }, []);

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    setModalPassword(password);
    form.setValue("password", password);
  };

  const getPlanData = async () => {
    const { data, error } = await supabase
      .from("usersList")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("Error fetching data from playlistDetails:", error);
    } else {
      const { data: planData, error: planDataError } = await supabase
        .from("plans")
        .select("*")
        .eq("id", data.plan);
      // .single();
      if (error) {
        console.log(error);
      }
      setData(planData as any[]);
    }
  };

  const handleDelete = async () => {
    setDeleteLoader(true);
    const { data, error } = await supabase
      .from("usersList")
      .update({ is_deleted: 1 })
      .eq("id", id);
    if (error) {
      console.error("Error deleting data:", error);
      setDeleteLoader(false);
    } else {
      setClientDeleteOpen(false); // Close the dialog box
      toast({
        title: "Deleted Successfully!.",
        description: "Client has deleted successfully!",
        action: (
          <ToastAction altText="Undo" onClick={() => handleDeleteUndo()}>
            Undo
          </ToastAction>
        ),
      });
      setTimeout(() => {
        router.push("/client");
        setDeleteLoader(false);
      }, 2000);
    }
  };

  const handleDeleteUndo = async () => {
    const { data, error } = await supabase
      .from("usersList")
      .update({ is_deleted: 0 })
      .eq("id", id);
    if (error) {
      console.error("Error deleting data:", error);
    } else {
      toast({
        title: "Recovered Successfully!.",
        description: "Client has recovered successfully!",
      });
    }
  };

  const handleUserLogin = async (email: string, password: string) => {
    setSigninLoading(true);

    try {
      // Construct the URL without encoding the query parameters
      const signInUrl = `https://digital-signage-one.vercel.app/auto-login?email=${email}&password=${password}&id=${selecteduserId}`;
      // const signInUrl = `http://localhost:3001/auto-login?email=${email}&password=${password}&id=${selecteduserId}`;

      // Open a new tab with the sign-in URL
      window.open(signInUrl, "_blank");

      // Stop loading after opening the new tab
      setSigninLoading(false);

      toast({
        title: "Sign in successful!",
        description: `Sign in process for user ${email} completed successfully!`,
      });
    } catch (error: any) {
      setSigninLoading(false);
      toast({
        title: "Sign in failed!",
        description: `Sign in process failed: ${error.message}`,
      });
    }
  };

  const parseDateTime = (timestamp: string) => new Date(timestamp);

  useEffect(() => {
    getPlanData();
  }, []);

  return (
    // <Box sx={{ width: "100%" }}>
    <div
      className="w-full p-4 pt-6"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      <Dialog open={clientDeleteOpen} onOpenChange={setClientDeleteOpen}>
        <DialogContent className="sm:max-w-[397px]">
          <DialogHeader>
            <DialogTitle className="font-semibold text-2xl text-primary_color">
              Delete Client
            </DialogTitle>
            <DialogDescription>
              Are you sure want to delete the client?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="w-2/4">
                No
              </Button>
            </DialogClose>
            <Button
              className="w-2/4 bg-button_orange hover:bg-button_orange"
              type="submit"
              onClick={handleDelete}
              disabled={deleteLoader}
            >
              {deleteLoader ? (
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
                "Yes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <Grid
            container
            rowSpacing={1}
            columnSpacing={{ xs: 1, sm: 3, md: 4 }}
            style={{ height: "auto", margin: 0, width: "100%" }}
          >
            <Grid item xs={9} style={{ height: "10vh", padding: 10 }}>
              <div className="flex items-center gap-2 mt-0">
                <h4
                  className="text-base font-medium text-primary_color cursor-pointer"
                  onClick={() => router.back()}
                >
                  Client List
                </h4>
                <ChevronRight />
                <h4 className="text-base font-medium text-primary_color">
                  {initialClientName}
                </h4>
              </div>
            </Grid>
            <Grid item xs={3} style={{ height: "10vh", padding: 10 }}>
              <div className="flex items-center gap-2 w-full">
                {/* <Button className="hover:opacity-75 w-2/4">Save</Button> */}
                <Sheet>
                  <SheetTrigger className="border rounded flex items-center h-10 px-4 text-sm font-medium border-border_gray bg-white hover:bg-[#EBF1F6] fade">
                    <NotebookPen size={18} className="text-primary_color" />{" "}
                    <span className="text-primary_color ml-1">Logs</span>
                  </SheetTrigger>
                  <SheetContent style={{ zIndex: 9999 }}>
                    <SheetHeader className="pb-4">
                      <SheetTitle className="-mb-2">Logs </SheetTitle>
                      <p className="text-sm text-gray-500">
                        Timeline of the changes for this client
                      </p>
                    </SheetHeader>
                    <div className="w-full h-full overflow-y-scroll hide-scrollbar flex justify-center ">
                      {oldLogs.length === 0 ? (
                        <div className="h-full w-full flex justify-center items-center relative">
                          <p className="text-center text-md text-gray-500 mt-4 w-full absolute top-[40%] left-[50%]">
                            No logs found
                          </p>
                        </div>
                      ) : null}
                      <Timeline
                        key={oldLogs.length}
                        isItemActive={Timeline.ACTIVE_FIRST}
                        className="custom-timeline w-[96%] "
                      >
                        {oldLogs
                          .sort(
                            (a, b) =>
                              parseDateTime(b.timestamp).getTime() -
                              parseDateTime(a.timestamp).getTime()
                          )
                          .map((log, index) =>
                            index === 0 ? (
                              <Timeline.Item
                                key={index}
                                dot={
                                  <div className="p-[2px] bg-[#d9d9d9] -mt-1 -ml-[7px] rounded-full">
                                    <div className="bg-[#FF8500] rounded-full p-1">
                                      <CheckIcon
                                        style={{
                                          color: "#fff",
                                          borderRadius: "50%",
                                        }}
                                        size={12}
                                        strokeWidth={4}
                                        className="font-extrabold"
                                      />
                                    </div>
                                  </div>
                                }
                              >
                                <p className="text-xs text-primary_color mb-1">
                                  {log.timestamp.toUpperCase()}
                                </p>
                                <p className="text-sm text-bold">
                                  {log.changes}
                                </p>
                              </Timeline.Item>
                            ) : index === oldLogs.length - 1 ? (
                              <Timeline.Item
                                key={index}
                                dot={
                                  <div className="p-[2px] bg-[#d9d9d9] -mt-1 -ml-[7px] rounded-full">
                                    <div className="bg-[#FF8500] rounded-full p-1">
                                      <CheckIcon
                                        style={{
                                          color: "#fff",
                                          borderRadius: "50%",
                                        }}
                                        size={12}
                                        strokeWidth={4}
                                        className="font-extrabold"
                                      />
                                    </div>
                                  </div>
                                }
                              >
                                <p className="text-xs text-primary_color mb-1">
                                  {log.timestamp.toUpperCase()}
                                </p>
                                <p className="text-sm text-bold">
                                  {log.changes}
                                </p>
                                <p className="mt-[40px] text-white bg-white">
                                  TimeLine Ended
                                </p>
                              </Timeline.Item>
                            ) : (
                              <Timeline.Item>
                                <p className="text-xs text-primary_color mb-1">
                                  {log.timestamp.toUpperCase()}
                                </p>
                                <p className="text-sm text-bold">
                                  {log.changes}
                                </p>
                              </Timeline.Item>
                            )
                          )}
                      </Timeline>
                    </div>
                  </SheetContent>
                </Sheet>
                <Button
                  type="button"
                  variant={"outline"}
                  className="w-2/4 bg-button_gray"
                  // onClick={() =>
                  //   window.open(
                  //     "https://digital-signage-one.vercel.app/sign-in",
                  //     "_blank"
                  //   )
                  // }
                  onClick={() =>
                    handleUserLogin(
                      form.getValues("email"),
                      form.getValues("password")
                    )
                  }
                >
                  {signInLoading ? (
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
                    <>
                      <LogIn size={20} className="mr-2" />
                      Login
                    </>
                  )}
                </Button>
                <Button
                  type="submit" // Submit button for form submission
                  variant={"outline"}
                  className="w-2/4 bg-button_gray"
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
                    "Update info"
                  )}
                </Button>
                <Button
                  onClick={() => setClientDeleteOpen(true)}
                  type="button" // Corrected here
                  className="py-2.5 px-3 rounded bg-delete_color text-white cursor-pointer w-[44px] h-[40px] hover:bg-delete_color"
                >
                  <Trash2 size={20} />
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
                            accept="image/png, image/jpeg, image/jpg"
                            placeholder="Upload Image"
                            className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                            onChange={(e) => {
                              field.onChange(e.target.files);
                              handleImageChange(e.target.files as FileList);
                            }}
                            aria-label="Upload Profile Image"
                          />
                          <Image
                            src={imageUrl !== null ? imageUrl : ""}
                            alt="Profile Image"
                            layout="fill"
                            objectFit="cover"
                            className="rounded-full z-0 text-transparent"
                          />
                          <div className="text-black bg-white absolute right-1 bottom-2 p-1 border border-border_gray rounded-full w-8 h-8 flex justify-center items-center">
                            <Pencil size={16} className="cursor-pointer" />
                          </div>
                        </div>
                        <p className="text-center text-sm font-medium text-placeholder">
                          Allowed Types: jpg, png, jpeg
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />
              <div
                style={{
                  textAlign: "center",
                  paddingTop: 50,
                  paddingBottom: 50,
                }}
              >
                {/* <p style={{ fontWeight: "bold", fontSize: 13 }}>
                  Active Screen
                </p>
                <p style={{ fontWeight: "bold", fontSize: 32 }}>{screenA}</p>{" "}
                <br></br>
                <p style={{ fontWeight: "bold", fontSize: 13 }}>
                  Inactive Screen
                </p>
                <p style={{ fontWeight: "bold", fontSize: 32 }}>{screenI}</p> */}
              </div>
            </Grid>
            <Grid item xs={5} style={{ height: "50vh", padding: 10 }}>
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-2">
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
                  <FormItem className="mt-0 pb-2">
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="Email Address"
                        disabled
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
                  <FormItem className="mt-0 pb-2">
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
                  <FormItem className="mt-0 pb-2">
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
                name="country"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-2">
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
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-2">
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
                  </FormItem>
                )}
              />
            </Grid>
            <Grid item xs={5} style={{ height: "50vh", padding: 10 }}>
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-2">
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="Website"
                        {...field}
                      />
                    </FormControl>
                    {/* <FormMessage /> */}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-2">
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
                  <FormItem className="mt-0 pb-2">
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
                  <FormItem className="mt-0 pb-2">
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
                  <FormItem className="mt-0 pb-4">
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
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="relative mt-0 pb-2">
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

      <div className="w-full mt-[150px]">
        {userPlan === 1 ? (
          <div className="w-full">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length}>
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length}>
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight />
                </Button>
              </div>
            </div> */}
          </div>
        )}
      </div>
    </div>
    // </Box>
  );
};

export default ClientDetails;
