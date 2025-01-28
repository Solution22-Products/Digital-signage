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
import AddNewAdmin from "@/components/addNewAdminDialog";
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

export type Payment = {
  id: string;
  password: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  action: string;
  original: any;
};

interface Row {
  getValue(key: string): any;
  original: {
  id: string;
  status: string;
    // other properties of the row
  };
}


const AdminSetting = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const [data, setData] = useState<Payment[]>([]); // State to manage data
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [cancelLoader, setCancelLoader] = useState(false);
  
  const PasswordCell = ({ row }: { row: Row }) => {
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);
  
    return (
      <div className="flex items-center">
        <p>{showPassword ? row.getValue("password") : "*********"}</p>
        <Button
          variant="ghost"
          onClick={togglePasswordVisibility}
          className="ml-2 p-1"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </Button>
      </div>
    );
  };

  const StatusCell = ({ row }: { row: Row }) => {
    const [status, setStatus] = useState<string>(
      row.original.status as string
    );
  
    const handleStatusChange = async (checked: boolean) => {
      const newStatus = checked ? "Active" : "Inactive";
      setStatus(newStatus as any);
  
      // Update status in the database
      const { error } = await supabase
        .from("adminUserDetails")
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
  
  const PaymentCell = ({ row }: { row: Row }) => {
    const payment = row.original as Payment;
    const [adminEditOpen, setAdminEditOpen] = useState(false);
    const [adminDeleteOpen, setAdminDeleteOpen] = useState(false);

    const [updatedName, setUpdatedName] = useState(payment.name);
    const [updatedEmail, setUpdatedEmail] = useState(payment.email);
    const [updatedPassword, setUpdatedPassword] = useState(payment.password);
    const [updatedRole, setUpdatedRole] = useState(payment.role);
    const [updatedStatus, setUpdatedStatus] = useState(payment.status);
    const [modalPassword, setModalPassword] = useState("");
    const [editRoleOpen, setEditRoleOpen] = useState(false);
    const [editStatusOpen, setEditStatusOpen] = useState(false);

    const [modalShowPassword, setModalShowPassword] = useState(false);

    const handleEditSave = async () => {
      const { error } = await supabase
        .from("adminUserDetails")
        .update({
          name: updatedName,
          email: updatedEmail,
          password: updatedPassword,
          role: updatedRole,
          status: updatedStatus,
        })
        .eq("id", payment.id);

      if (error) {
        console.error("Error updating user:", error);
      } else {
        setAdminEditOpen(false);
        setData((prevData: any) =>
          prevData.map((user: any) =>
            user.id === payment.id ? { ...user, name: updatedName } : user
          )
        );
        getAdminUserData();
      }
    };

    const handleDelete = async () => {
      const { error } = await supabase
        .from("adminUserDetails")
        .delete()
        .eq("id", payment.id);

      if (error) {
        console.error("Error deleting user:", error);
      } else {
        setAdminDeleteOpen(false);
        setData((prevData: any) =>
          prevData.filter((user: any) => user.id !== payment.id)
        );
      }
    };

    const handleStatusChange = async (row : any, newStatus : any) => {
      setUpdatedStatus(newStatus);
      const { error } = await supabase
        .from("adminUserDetails")
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

    const generatePassword = () => {
      const password = Math.random().toString(36).slice(-8);
      setModalPassword(password);
      setUpdatedPassword(password);
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
            <DropdownMenuItem onClick={() => setAdminEditOpen(true)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAdminDeleteOpen(true)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog open={adminDeleteOpen} onOpenChange={setAdminDeleteOpen}>
          <DialogContent className="sm:max-w-[397px]">
            <DialogHeader>
              <DialogTitle className="font-semibold text-2xl text-primary_color">
                Delete Admin
              </DialogTitle>
              <DialogDescription>
                Are you sure want to delete the admin?
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
                >
                  Yes
                </Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={adminEditOpen} onOpenChange={setAdminEditOpen}>
          <DialogContent className="sm:max-w-[592px]">
            <DialogHeader>
              <DialogTitle className="font-semibold text-2xl text-primary_color">
                Edit Admin
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 items-center gap-2">
                <Label htmlFor="name" className="">
                  Name
                </Label>
                <Input
                  id="name"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 items-center gap-2">
                  <Label>Username / Email</Label>
                  <Input
                    id="email"
                    value={updatedEmail}
                    onChange={(e) => setUpdatedEmail(e.target.value)}
                    className="col-span-3"
                  />
              </div>
              <div className="grid grid-cols-1 items-center gap-2 relative">
                  <Label>Password</Label>
                  <p
                      className="w-fit bg-button_orange text-white px-1 rounded text-xs cursor-pointer"
                      onClick={generatePassword}
                    >
                      Generate
                    </p>
                  <Input
                    id="password"
                    type={modalShowPassword ? "text" : "password"}
                    value={updatedPassword}
                    onChange={(e) => setUpdatedPassword(e.target.value)}
                    className="col-span-3"
                  />
                  <span
                    className="absolute md:right-0 right-0 top-8 cursor-pointer w-7 md:w-8 lg:w-11 flex items-center justify-center"
                    onClick={() => setModalShowPassword(!modalShowPassword)}
                  >
                    {modalShowPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </span>
              </div>
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="role" className="">
                  Role
                </Label>
                <div className="col-span-3">
                  <Popover open={editRoleOpen} onOpenChange={setEditRoleOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline"
                       role="combobox" 
                       aria-expanded={open}
                       className="w-full justify-between">
                        {updatedRole}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" style={{ width: "222%" }}>
                      <Command>
                        <CommandInput placeholder="Search roles..." />
                        <CommandList>
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => {
                                setUpdatedRole("Admin")
                                setEditRoleOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  updatedRole === "Admin" ? "opacity-100" : "opacity-0"
                                )}
                              />
                              Admin
                            </CommandItem>
                            {/* <CommandItem
                              onSelect={() => {
                                setUpdatedRole("User")
                                setEditRoleOpen(false)
                              }
                                
                              }
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  updatedRole === "User" ? "opacity-100" : "opacity-0"
                                )}
                              />
                              User
                            </CommandItem> */}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="status" className="">
                  Status
                </Label>
                <div className="col-span-3">
                  <Popover open={editStatusOpen} onOpenChange={setEditStatusOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {updatedStatus}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" style={{ width: "222%" }}>
                      <Command>
                        <CommandInput placeholder="Search status..." />
                        <CommandList>
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => {
                                setUpdatedStatus("Active")
                                setEditStatusOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  updatedStatus === "Active" ? "opacity-100" : "opacity-0"
                                )}
                              />
                              Active
                            </CommandItem>
                            <CommandItem
                              onSelect={() => {
                                setUpdatedStatus("Inactive")
                                setEditStatusOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  updatedStatus === "Inactive" ? "opacity-100" : "opacity-0"
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
                >
                  Save
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0"
        >
          Name
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "password",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0"
        >
          Password
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: PasswordCell,
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
        <div className="lowercase">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0"
        >
          Role
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const role = row.getValue("role");
        const roleColor = role === "Admin" ? "bg-admin_bg" : "bg-gray-100";

        return (
          <div className={`${roleColor} p-2 rounded w-fit font-medium text-sm`}>
            {role === "Admin" ? "Admin" : "User"}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: StatusCell,
    },
    {
      id: "actions",
      enableHiding: false,
      header: "Actions",
      cell: PaymentCell,
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

  const getAdminUserData = async () => {
    const { data, error } = await supabase.from("adminUserDetails").select("*");
    if (error) {
      console.log(error);
    } else {
      setData(data);
    }
  };

  useEffect(() => {
    getAdminUserData();
  }, []);

  return (
    <div
      className="w-full p-4 pt-6"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      <div className="flex items-center gap-4">
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
        <h4 className="text-sm font-medium text-primary_color">
          Admin Setting
        </h4>
      </div>
      <div className="w-full mt-6">
        <div className="flex items-center gap-2 mt-3">
          <Users size={16} />
          <h4 className="text-base font-bold">Admin List</h4>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between my-3">
            <div className="relative w-[336px]">
              <Input
                placeholder="Filter emails..."
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

            {/* Add new admin popup component */}
            <AddNewAdmin />
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

export default AdminSetting;
