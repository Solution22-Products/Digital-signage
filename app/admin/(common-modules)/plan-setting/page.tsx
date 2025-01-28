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
import AddNewPlan from "@/components/addNewPlanDialog";
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

export type Plan = {
  id: string;
  name: string;
  price: string;
  storage: string;
  screen_count: string;
  status: "Active" | "Inactive";
  action: string;
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
  const [cancelLoader, setCancelLoader] = useState(false);

  const RowCell1 = ({ row }: { row: Row }) => {
    const [status, setStatus] = useState<string>(
      row.getValue("status") as string
    );

    const handleStatusChange = async (checked: boolean) => {
      const newStatus = checked ? "Active" : "Inactive";
      setStatus(newStatus as any);

      // Update status in the database
      const { error } = await supabase
        .from("plans")
        .update({ status: newStatus })
        .eq("id", row.original.id);

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
    const plan = row.original as Plan;
    const [planEditOpen, setPlanEditOpen] = useState(false);
    const [planDeleteOpen, setPlanDeleteOpen] = useState(false);

    const [updatedName, setUpdatedName] = useState(plan.name);
    const [updatedPrice, setUpdatedPrice] = useState(plan.price);
    const [updatedStorage, setUpdatedStorage] = useState(plan.storage);
    const [updatedScreen, setUpdatedScreen] = useState(plan.screen_count);
    const [updatedStatus, setUpdatedStatus] = useState(plan.status);
    const [editStatusOpen, setEditStatusOpen] = useState(false);
    const [saveLoader, setSaveLoader] = useState(false);
    const [deleteLoader, setDeleteLoader] = useState(false);

    const handleEditSave = async () => {
      setSaveLoader(true);
      const { error } = await supabase
        .from("plans")
        .update({
          name: updatedName,
          price: updatedPrice,
          // storage: updatedStorage,
          screen_count: updatedScreen,
          status: updatedStatus,
        })
        .eq("id", plan.id);

      if (error) {
        console.error("Error updating plan:", error);
        setSaveLoader(false);
      } else {
        setPlanEditOpen(false);
        setSaveLoader(false);
        setData((prevData: any) =>
          prevData.map((user: any) =>
            user.id === plan.id ? { ...user, name: updatedName } : user
          )
        );
        getPlanData();
      }
    };

    const handleDelete = async () => {
      setDeleteLoader(true);
      const { error } = await supabase
        .from("plans")
        .update({ is_deleted: 1 })
        .eq("id", plan.id);

      if (error) {
        console.error("Error deleting plan:", error);
        setDeleteLoader(false);
      } else {
        setPlanDeleteOpen(false);
        setDeleteLoader(false);
        setData((prevData: any) =>
          prevData.filter((user: any) => user.id !== plan.id)
        );
      }
    };

    const handleStatusChange = async (row: any, newStatus: any) => {
      setUpdatedStatus(newStatus);
      const { error } = await supabase
        .from("plans")
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

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 bg-zinc-100 rotate-90"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setPlanEditOpen(true)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPlanDeleteOpen(true)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog open={planDeleteOpen} onOpenChange={setPlanDeleteOpen}>
          <DialogContent className="sm:max-w-[397px]">
            <DialogHeader>
              <DialogTitle className="font-semibold text-2xl text-primary_color">
                Delete Plan
              </DialogTitle>
              <DialogDescription>
                Are you sure want to delete the plan?
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
        <Dialog open={planEditOpen} onOpenChange={setPlanEditOpen}>
          <DialogContent className="sm:max-w-[592px]">
            <DialogHeader>
              <DialogTitle className="font-semibold text-2xl text-primary_color">
                Edit Plan
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 items-baseline gap-4 py-1">
                <Label htmlFor="name" className="">
                  Plan Name
                </Label>
                <Input
                  id="name"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-2 items-baseline gap-4 py-1">
                <div>
                  <Label>Price</Label>
                  <Input
                    id="price"
                    value={updatedPrice}
                    onChange={(e) => setUpdatedPrice(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                {/* <div>
                  <Label>Storage</Label>
                  <Input
                    id="storage"
                    value={updatedStorage}
                    onChange={(e) => setUpdatedStorage(e.target.value)}
                    className="col-span-3"
                  />
                </div> */}
                <div>
                  <Label>Screens</Label>
                  <Input
                    id="screen_count"
                    value={updatedScreen}
                    onChange={(e) => setUpdatedScreen(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 items-baseline gap-4 py-1">
                <Label htmlFor="status" className="">
                  Status
                </Label>
                <div className="col-span-3">
                  <Popover
                    open={editStatusOpen}
                    onOpenChange={setEditStatusOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {updatedStatus}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-full p-0"
                      style={{ width: "222%" }}
                    >
                      <Command>
                        <CommandInput placeholder="Search status..." />
                        <CommandList>
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => {
                                setUpdatedStatus("Active");
                                setEditStatusOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  updatedStatus === "Active"
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              Active
                            </CommandItem>
                            <CommandItem
                              onSelect={() => {
                                setUpdatedStatus("Inactive");
                                setEditStatusOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  updatedStatus === "Inactive"
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              Inactive
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
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
                onClick={handleEditSave}
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
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  const RowCell4 = ({ row }: { row: Row }) => {
    const [userCounta, setUserCounta] = useState<number | null>(null);
    const [userCounti, setUserCounti] = useState<number | null>(null);

    // console.log(row.original.id);

    useEffect(() => {
      const fetchUserCounta = async () => {
        const { data: userDataa, error: userErrora } = await supabase
          .from("usersList")
          .select("*")
          .eq("plan", row.original.id)
          .eq("is_deleted", 0)
          .eq("status", "Active");

        if (userErrora) {
          console.error("Error getting data:", userErrora);
          setUserCounta(0); // You can set this to 0 or handle it as you like
        } else {
          setUserCounta(userDataa?.length || 0); // Ensure it's a valid number
        }
      };

      const fetchUserCounti = async () => {
        const { data: userDatai, error: userErrori } = await supabase
          .from("usersList")
          .select("*")
          .eq("plan", row.original.id)
          .eq("is_deleted", 0)
          .eq("status", "Inactive");

        if (userErrori) {
          console.error("Error getting data:", userErrori);
          setUserCounti(0); // You can set this to 0 or handle it as you like
        } else {
          setUserCounti(userDatai?.length || 0); // Ensure it's a valid number
        }
      };

      fetchUserCounta();
      fetchUserCounti();
    }, [row.original.id]);

    return (
      <div className="flex items-center">
        <span className="text-green-500">{userCounta}</span>&nbsp;|&nbsp;
        <span className="text-red-500">{userCounti}</span>
      </div>
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
    //   cell: ({ row }) => (
    //     <div className="lowercase">{row.getValue("storage")} GB</div>
    //   ),
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
    {
      accessorKey: "users",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0"
        >
          Users
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      // cell: ({ row }) => (
      //   <div className="lowercase">{row.getValue("screen_count")}</div>
      // ),
      cell: RowCell4,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: RowCell1,
    },
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

  const getPlanData = async () => {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("is_deleted", 0);
    if (error) {
      console.log(error);
    } else {
      setData(data);
    }
  };

  useEffect(() => {
    getPlanData();
  }, []);

  return (
    <div
      className="w-full p-4 pt-6"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      {/* <div className="flex items-center gap-4">
        <h4
          className="text-sm font-medium text-primary_color cursor-pointer"
          onClick={() => {
            setCancelLoader(true);
            setTimeout(() => {
              router.back();
              setCancelLoader(false);
            }, 1000);
          }}
          style={cancelLoader ? { pointerEvents: "none" } : {}}
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
                stroke="#FF7C44"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-100"
                fill="#FF7C44"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Setting"
          )}
        </h4>
        <ChevronRight size={20} />
        <h4 className="text-sm font-medium text-primary_color">Plan Setting</h4>
      </div> */}
      <div className="w-full mt-6">
        <div className="flex items-center gap-2 mt-3">
          <Users size={16} />
          <h4 className="text-base font-bold">Plan List</h4>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between my-3">
            <div className="relative w-[336px]">
              <Input
                placeholder="Filter name..."
                value={
                  (table.getColumn("name")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="max-w-sm pl-10"
              />
              <Search
                className="absolute left-3 top-[50%] -translate-y-1/2 text-secondary_color"
                size={16}
              />
            </div>

            {/* Add new admin popup component */}
            <AddNewPlan />
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
