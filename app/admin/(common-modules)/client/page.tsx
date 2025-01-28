"use client";
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Eye,
  EyeOff,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  CellContext,
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
import { Checkbox } from "@/components/ui/checkbox";
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
// import AddNewPlan from "@/components/addNewPlanDialog";
import { supabase } from "@/utils/supabase/supabaseClient";
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
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { any } from "zod";
import { toast, useToast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { updateMetadata } from "./action";

export type Plan = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  plan: string;
  created_at: string;
  status: "Active" | "Inactive";
  action: string;
  getValue(key: string): any;
};

interface Row {
  getValue(key: string): any;
  original: {
    id: string;
    status: string;
    // other properties of the row
  };
}

const PlanSetting = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const [data, setData] = useState<Plan[]>([]); // State to manage data
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [saveLoader, setSaveLoader] = useState(false);

  const RowCell1 = ({ row }: { row: Row }) => {
    const [status, setStatus] = useState<string>(
      row.getValue("status") as string
    );

    const handleStatusChange = async (checked: boolean) => {
      const newStatus = checked ? "Active" : "Inactive";
      setStatus(newStatus as any);
      updateMetadata(newStatus, row.original.id);
      // Update status in the database
      const { error } = await supabase
        .from("usersList")
        .update({ status: newStatus })
        .eq("id", row.original.id);

      // console.log(row.original.id)

      if (error) {
        console.error("Error updating status:", error);
      }
      toast({
        description: `Status updated to ${newStatus}`,
        title: `Status updated successfully`,
      });
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

  const RowCell3 = ({ row }: { row: Row }) => {
    const [screenCounta, setScreenCounta] = useState<number | null>(null);
    const [screenCounti, setScreenCounti] = useState<number | null>(null);

    useEffect(() => {
      const fetchScreenCounts = async () => {
        try {
          // Fetch user data to get the userId first
          const { data: userData, error: userError } = await supabase
            .from("usersList")
            .select("*")
            .eq("id", row.original.id)
            .single();

          if (userError) {
            console.error("Error fetching user ID:", userError);
            setScreenCounta(0);
            setScreenCounti(0);
            return;
          }

          const userId = userData?.userId;
          // console.log(userId, " userId admin");
          // console.log(userId.length, " userId length");
          // Fetch both active and inactive screen counts using the userId in parallel
          const [
            { data: screenDataa, error: screenErrora },
            { data: screenDatai, error: screenErrori },
          ] = await Promise.all([
            supabase
              .from("screenDetails")
              .select("*")
              .eq("is_deleted", 0)
              .eq("userId", userId) // Fetch active screens for this user
              .eq("status", "Active"),

            supabase
              .from("screenDetails")
              .select("*")
              .eq("is_deleted", 0)
              .eq("userId", userId) // Fetch inactive screens for this user
              .eq("status", "Inactive"),
          ]);

          // Handle errors and set counts for active/inactive screens
          if (screenErrora) {
            console.error("Error fetching active screens:", screenErrora);
            setScreenCounta(0);
          } else {
            setScreenCounta(screenDataa?.length || 0);
          }

          if (screenErrori) {
            console.error("Error fetching inactive screens:", screenErrori);
            setScreenCounti(0);
          } else {
            setScreenCounti(screenDatai?.length || 0);
          }
        } catch (error) {
          console.error("Error fetching screen counts:", error);
          setScreenCounta(0);
          setScreenCounti(0);
        }
      };

      fetchScreenCounts();
    }, []);

    return (
      <div className="flex items-center">
        <span className="text-green-500">
          {screenCounta !== null ? screenCounta : "Loading..."}
        </span>
        &nbsp;|&nbsp;
        <span className="text-red-500">
          {screenCounti !== null ? screenCounti : "Loading..."}
        </span>
      </div>
    );
  };

  const RowCell4 = ({ row }: { row: Row }) => {
    const [planName, setPlanName] = useState<string | null>(null);

    const fetchPlanName = async () => {
      // Adjust based on how plan ID is retrieved

      const { data: userData, error: userError } = await supabase
        .from("usersList")
        .select("*")
        .eq("id", row.original.id)
        .single();

      const planId = userData?.plan || "";

      const { data: planData, error } = await supabase
        .from("plans")
        .select("name")
        .eq("id", planId)
        .single();

      if (error) {
        console.error("Error fetching plan:", error);
        setPlanName("");
      } else {
        setPlanName(planData?.name || "");
      }
    };

    fetchPlanName();

    // return <div>{planName}</div>;
    return <div>{planName !== null ? planName : "Loading..."}</div>;
  };

  const RowCell2 = ({ row }: { row: Row }) => {
    const client = row.original;
    const [clientEditOpen, setClientEditOpen] = useState(false);
    const [clientDeleteOpen, setClientDeleteOpen] = useState(false);

    const [updatedStatus, setUpdatedStatus] = useState(client.status);
    const [editStatusOpen, setEditStatusOpen] = useState(false);
    const [deleteLoader, setDeleteLoader] = useState(false);

    const handleDelete = async () => {
      setDeleteLoader(true);
      const { error } = await supabase
        .from("usersList")
        // .delete()
        .update({ is_deleted: 1 })
        .eq("id", client.id);

      if (error) {
        console.error("Error deleting client:", error);
        setDeleteLoader(false);
      } else {
        setClientDeleteOpen(false);

        toast({
          title: "Client deleted Successfully!.",
          description: "Client has deleted successfully!",
          action: (
            <ToastAction altText="Undo" onClick={() => handleDeleteUndo()}>
              Undo
            </ToastAction>
          ),
        });
        setData((prevData: any) =>
          prevData.filter((user: any) => user.id !== client.id)
        );
        setDeleteLoader(false);
      }
    };

    const handleDeleteUndo = async () => {
      const { data, error } = await supabase
        .from("usersList")
        .update({ is_deleted: 0 })
        .eq("id", client.id);
      if (error) {
        console.error("Error deleting data:", error);
      } else {
        toast({
          title: "Client recovered Successfully!.",
          description: "Client has recovered successfully!",
        });
      }
    };

    const handleStatusChange = async (row: any, newStatus: any) => {
      setUpdatedStatus(newStatus);
      const { error } = await supabase
        .from("usersList")
        .update({ status: newStatus })
        .eq("id", row.original.id);

      if (error) {
        console.error("Error updating status:", error);
      } else {
        setData((prevData) =>
          prevData.map((user) =>
            user.id === row.original.id ? { ...user, status: newStatus } : user
          )
        );
      }
    };

    // return (
    //   <>
    //     <DropdownMenu>
    //       <DropdownMenuTrigger asChild>
    //         <Button
    //           variant="outline"
    //           className="h-8 w-8 p-0 bg-zinc-100 rotate-90"
    //         >
    //           <span className="sr-only">Open menu</span>
    //           <MoreHorizontal className="h-4 w-4" />
    //         </Button>
    //       </DropdownMenuTrigger>
    //       <DropdownMenuContent align="end">
    //         <DropdownMenuItem onClick={() => handleEditPage()}>
    //           View
    //         </DropdownMenuItem>
    //         <DropdownMenuItem onClick={() => setClientDeleteOpen(true)}>
    //           Delete
    //         </DropdownMenuItem>
    //       </DropdownMenuContent>
    //     </DropdownMenu>
    //     <Dialog open={clientDeleteOpen} onOpenChange={setClientDeleteOpen}>
    //       <DialogContent className="sm:max-w-[397px]">
    //         <DialogHeader>
    //           <DialogTitle className="font-semibold text-2xl text-primary_color">
    //             Delete Client
    //           </DialogTitle>
    //           <DialogDescription>
    //             Are you sure want to delete the client?
    //           </DialogDescription>
    //         </DialogHeader>
    //         <DialogFooter>
    //           <DialogClose asChild>
    //             <Button variant="outline" className="w-2/4">
    //               No
    //             </Button>
    //           </DialogClose>
    //           <Button
    //             className="w-2/4 bg-button_orange hover:bg-button_orange"
    //             type="submit"
    //             onClick={handleDelete}
    //             disabled={deleteLoader}
    //           >
    //             {deleteLoader ? (
    //               <svg
    //                 className="animate-spin h-5 w-5"
    //                 xmlns="http://www.w3.org/2000/svg"
    //                 fill="none"
    //                 viewBox="0 0 24 24"
    //               >
    //                 <circle
    //                   className="opacity-25"
    //                   cx="12"
    //                   cy="12"
    //                   r="10"
    //                   stroke="#fff"
    //                   strokeWidth="4"
    //                 ></circle>
    //                 <path
    //                   className="opacity-75"
    //                   fill="#fff"
    //                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    //                 ></path>
    //               </svg>
    //             ) : (
    //               "Yes"
    //             )}
    //           </Button>
    //         </DialogFooter>
    //       </DialogContent>
    //     </Dialog>
    //   </>
    // );
  };

  const columns: ColumnDef<Plan>[] = [
    // {
    //   id: "select",
    //   header: ({ table }) => (
    //     <Checkbox
    //       checked={
    //         table.getIsAllPageRowsSelected() ||
    //         (table.getIsSomePageRowsSelected() && "indeterminate")
    //       }
    //       onCheckedChange={(value: boolean) =>
    //         table.toggleAllPageRowsSelected(!!value)
    //       }
    //       aria-label="Select all"
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       checked={row.getIsSelected()}
    //       onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
    //       aria-label="Select row"
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0"
        >
          Client Name
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div
          className="cursor-pointer"
          onClick={() => handleEditPage(row.original.id)}
        >
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0"
        >
          Email
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div
          className="cursor-pointer"
          onClick={() => handleEditPage(row.original.id)}
        >
          {row.getValue("email")}
        </div>
      ),
    },
    {
      accessorKey: "mobile",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0"
        >
          Mobile
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("mobile")}</div>
      ),
    },
    {
      accessorKey: "address",
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
      cell: RowCell3, // Ensure RowCell3 is typed correctly
    },
    {
      accessorKey: "plan",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0"
        >
          Plan
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: RowCell4, // Ensure RowCell4 is typed correctly
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0"
        >
          Created On
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="lowercase">
          {format(row.getValue("created_at"), "d MMM yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: RowCell1, // Ensure RowCell1 is typed correctly
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

  const getClientData = async () => {
    const { data, error } = await supabase
      .from("usersList")
      .select("*")
      .eq("roleId", 3)
      .eq("is_deleted", 0);
    if (error) {
      console.log(error);
    } else {
      setData(data);
    }
  };

  const handleEditPage = (id: any) => {
    // Navigate to the next page, e.g., "/next-page"
    router.push(`/admin/client-view/${id}`);
  };

  useEffect(() => {
    getClientData();
  }, []);

  return (
    <div
      className="w-full p-4 pt-6"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      <Toaster />
      {/* <div className="flex items-center gap-4">
        <h4
          className="text-sm font-medium text-primary_color cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          Setting
        </h4>
        <ChevronRight size={20} />
        <h4 className="text-sm font-medium text-primary_color">Plan Setting</h4>
      </div> */}
      <div className="w-full mt-6">
        <div className="flex items-center gap-2 mt-3">
          {/* <Users size={16} /> */}
          <h4 className="text-base font-bold">Client List</h4>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between my-3">
            <div className="relative w-[336px]">
              <Input
                placeholder="Filter email..."
                value={
                  (table.getColumn("email")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("email")?.setFilterValue(event.target.value)
                }
                className="max-w-sm pl-10"
              />
              <Search
                className="absolute left-3 top-[50%] -translate-y-1/2 text-secondary_color"
                size={16}
              />
            </div>
            <div className="relative w-[100px]">
              {/* <Link href="/admin/client-add"> */}
              <Button
                className="text-white w-[128px] h-[40px] bg-button_orange hover:bg-button_orange hover:opacity-75 text-sm font-medium absolute top-[-20px] right-[16px]"
                type="button"
                onClick={() => {
                  setSaveLoader(true);
                  setTimeout(() => {
                    router.push("/admin/client-add");
                    setSaveLoader(false);
                  }, 2000);
                }}
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
                  "Create client"
                )}
              </Button>
              {/* </Link> */}
            </div>

            {/* Add new admin popup component */}
            {/* <AddNewPlan /> */}
          </div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSetting;
