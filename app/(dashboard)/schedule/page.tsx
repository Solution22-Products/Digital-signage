"use client";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { supabase } from "@/utils/supabase/supabaseClient";
import {
  CalendarCheck,
  CalendarDays,
  CalendarPlus2,
  ChevronsUpDown,
  LoaderCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./style.css";
import DefaultSkeleton from "@/components/skeleton-ui";
import ScheduleSearch from "./component/search";

interface scheduleProps {
  scheduleName: string;
  time: string;
  id: string;
  userId?: string;
  folder_id?: string;
}

const Schedule = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduledContents, setScheduledContents] = useState<scheduleProps[]>(
    []
  );
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [deleteMultipleSchedule, setDeleteMultipleSchedule] = useState(false);
  const [deleteMultipleScheduleOpen, setDeleteMultipleScheduleOpen] =
    useState(false);
  const [multipleScheduleMoveDetails, setMultipleScheduleMoveDetails] =
    useState<any>([]);

  const [signedInUserId, setSignedInUserId] = useState<string | null>("");
  const [notFound, setNotFound] = useState(false);
  const [searchValue, setSearchValue] = useState<string | null>("");
  const [sortedValue, setSortedValue] = useState<string | null>("");

  const [selectAll, setSelectAll] = useState(false);
  const [addLoader, setAddLoader] = useState<string[]>([]);
  const [listViewShow, setListViewShow] = useState(false);

  const getScheduledData = async () => {
    const { data, error } = await supabase
      .from("scheduledContents")
      .select("*")
      .eq("userId", signedInUserId)
      .eq("is_deleted", 0)
      .order("id", { ascending: false });
    if (error) {
      console.error("Error fetching data:", error);
      setScheduleLoading(false);
      setNotFound(false);
    } else {
      setScheduledContents(data.sort((a: any, b: any) => a.scheduleName.localeCompare(b.scheduleName)));
      setNotFound(false);
      setScheduleLoading(false);
    }
  };

  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: string
  ) => {
    const isChecked = event.target.checked;
    setChecked(isChecked);

    setCheckedItems((prevCheckedItems) => {
      let updatedCheckedItems;
      if (isChecked) {
        setDeleteMultipleSchedule(true);
        updatedCheckedItems = [...prevCheckedItems, index];
      } else {
        updatedCheckedItems = prevCheckedItems.filter((item) => item !== index);
      }

      setMultipleScheduleMoveDetails(updatedCheckedItems as any);

      // Hide delete button if checkedItems length is <= 0
      if (updatedCheckedItems.length <= 0) {
        setDeleteMultipleSchedule(false);
        setSelectAll(false);
      }

      return updatedCheckedItems;
    });
  };

  const handleScheduledData = async (item: any) => {
    if (checked) {
      return; // Stop redirection if the checkbox is checked
    }
    setAddLoader((prev: any) => [...prev, item.id]);
    (prev: any) => prev.filter((id: any) => id !== item.id);
    router.push(`schedule-details/${item.id}`);
  };

  useEffect(() => {
    // const userName = async () => {
    //   const user = await getUserData();
    //   setSignedInUserId(user?.id || null);
    //   // console.log("user id ", user?.id || null);
    //   return user;
    // };
    // userName();
    setSignedInUserId(localStorage.getItem("userId"));
  }, []);

  useEffect(() => {
    if (signedInUserId) {
      getScheduledData();
    }
  }, [signedInUserId]);

  // useEffect(() => {
  //   if (scheduledContents.length > 0) {
  //     setTimeout(() => setScheduleLoading(false), 3000);
  //   } else {
  //     setTimeout(() => {
  //       setScheduleLoading(false);
  //       setTimeout(() => {
  //         setNotFound(true);
  //       }, 0);
  //     }, 3000);
  //   }
  // }, [scheduledContents]);

  const filterBySearchValue = (
    items: any[],
    key: string,
    searchValue: string
  ) => {
    const lowercasedSearchValue = searchValue.toLowerCase();
    return items.filter((item) =>
      item[key].toLowerCase().includes(lowercasedSearchValue)
    );
  };
  const parseDateTime = (dateTimeString: string) => {
    const [datePart, timePart] = dateTimeString.split(",");
    const [day, month, year] = datePart.split(".");
    return new Date(`${year}-${month}-${day}T${timePart}`);
  };

  const sortItems = (
    items: scheduleProps[] | scheduleProps[], // Assuming FolderData is the type for folders
    sortOrder: string | null,
    key: "scheduleName" // Key to sort by: screenname for screens, name for folders
  ) => {
    switch (sortOrder) {
      case "asc":
        return [...items].sort((a, b) => a[key].localeCompare(b[key]));
      case "desc":
        return [...items].sort((a, b) => b[key].localeCompare(a[key]));
      case "date-asc":
        return [...items].sort(
          (a, b) =>
            parseDateTime(a.time).getTime() - parseDateTime(b.time).getTime()
        );
      case "date-desc":
        return [...items].sort(
          (a, b) =>
            parseDateTime(b.time).getTime() - parseDateTime(a.time).getTime()
        );
      default:
        return items;
    }
  };
  const filteredSchedule = sortItems(
    filterBySearchValue(
      scheduledContents,
      "scheduleName",
      searchValue as string
    ),
    sortedValue,
    "scheduleName"
  );
  // const filteredPlaylistFolder = sortItems(
  //   filterBySearchValue(playlistFolderName, "name", searchValue as string),
  //   sortedValue,
  //   "name"
  // );
  const handleSortOptionClick = (sortOrder: string) => {
    setSortedValue(sortOrder);
    // setSortDropdownOpen(false);
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);

    const applicableContent = filteredSchedule
      .filter((preview) => preview.userId === signedInUserId)
      .map((preview) => preview.id);

    if (!selectAll && applicableContent.length > 0) {
      // Select all applicable content
      setCheckedItems(applicableContent as any[]);
      setMultipleScheduleMoveDetails(applicableContent as any[]);
      setDeleteMultipleSchedule(true);
    } else {
      // Unselect all
      setCheckedItems([]);
      setDeleteMultipleSchedule(false);
      setMultipleScheduleMoveDetails([]);
    }
  };

  return (
    <div
      className="w-full p-0 flex"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      <div className="w-full pr-0">
        {/* <SearchBar
          displayplus={<CalendarPlus2 size={20} />}
          calendarIcon={<CalendarDays size={20} />}
          schedulescreen={true}
          calendar={true}
          handleCancel={() => {}}
          handleMultipleSelectCancel={() => {}}
          searchValue={searchValue}
          screenData={() => getScheduledData()}
          setSearchValue={(value: string | null) => setSearchValue(value)}
          handleSortOptionClick={handleSortOptionClick as any}
          contentFolderSort={true}
          filterIcon={false}
          getScreenFolderDetails={() => {}}
          deleteMultipleSchedule={deleteMultipleSchedule}
          setDeleteMultipleSchedule={setDeleteMultipleSchedule}
          deleteMultipleScheduleOpen={deleteMultipleScheduleOpen}
          setDeleteMultipleScheduleOpen={setDeleteMultipleScheduleOpen}
          multipleScheduleMoveDetails={multipleScheduleMoveDetails}
          setMultipleScheduleMoveDetails={setMultipleScheduleMoveDetails}
          setSelectAll={setSelectAll}
          setCheckedItems={setCheckedItems}
        /> */}
        <ScheduleSearch
          searchValue={searchValue}
          setSearchValue={(value: string | null) => setSearchValue(value)}
          handleSortOptionClick={handleSortOptionClick as any}
          screenData={() => getScheduledData()}
          multipleScheduleMoveDetails={multipleScheduleMoveDetails}
          deleteMultipleSchedule={deleteMultipleSchedule}
          setDeleteMultipleSchedule={setDeleteMultipleSchedule}
          setDeleteMultipleScheduleOpen={setDeleteMultipleScheduleOpen}
          setSelectAll={setSelectAll}
          setCheckedItems={setCheckedItems}
          listViewShow={listViewShow}
          setListViewShow={setListViewShow}
        />
        <div className="w-full p-4 pt-0">
          <div>
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="w-full space-y-2"
            >
              <div className="flex items-center justify-between space-x-4">
                <h4 className="text-base font-bold text-primary_color">
                  Schedule
                </h4>
                <div className="flex flex-row align-middle">
                  <div className="flex flex-row justify-end items-center">
                    <div className="mt-2">
                      <Input
                        type="checkbox"
                        id="select-all"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="hidden"
                      />
                    </div>
                    <div className="mr-0">
                      <label
                        htmlFor="select-all"
                        className={`text-sm font-medium outline-none border-none ml-2 cursor-pointer py-2.5 bg-primary_color rounded border text-white px-4`}
                        style={
                          filteredSchedule.length === 0
                            ? { pointerEvents: "none", opacity: 0.6 }
                            : {}
                        }
                      >
                        {selectAll ? "Unselect All" : "Select All"}
                      </label>
                    </div>
                  </div>

                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                      <ChevronsUpDown className="h-4 w-4" />
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
              <CollapsibleContent className="px-0 py-0 flex flex-wrap gap-2">
                {listViewShow ? (
                  <table className="text-center border border-gray-300 w-full mt-4">
                    {/* Added border class */}
                    <thead className="bg-gray-200 h-[45px]">
                      {/* Added background color */}
                      <tr>
                        <th className="w-[50%] text-left pl-5 border border-gray-300">
                          {/* Added border */}
                          Name
                        </th>
                        <th className="w-[25%] border border-gray-300">
                          {/* Added border */}
                          Created On
                        </th>
                        <th className="w-[25%] border border-gray-300">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchedule.length > 0 ? (
                        filteredSchedule.map((screenData: any) => (
                          <tr
                            key={screenData.id}
                            className="border border-gray-300"
                          >
                            {/* Added border */}
                            <td className="w-[50%] border border-gray-300">
                              {/* Added border */}
                              <div className="schedule_parent_wrapper">
                                <Input
                                  type="checkbox"
                                  className="image_checkbox_schedule_listview"
                                  value={screenData.id}
                                  id={screenData.id}
                                  onChange={(e) =>
                                    handleCheckboxChange(e, screenData.id)
                                  }
                                  checked={checkedItems.includes(screenData.id)}
                                />
                                <div
                                  onClick={() =>
                                    handleScheduledData(screenData)
                                  }
                                  key={screenData.id}
                                  className={`mt-[-5px] pb-[10px] bg-none cursor-pointer screen_wrapper flex items-center gap-1.5`}
                                  style={
                                    addLoader.includes(screenData.id)
                                      ? { pointerEvents: "none" }
                                      : {}
                                  }
                                >
                                  {addLoader.includes(screenData.id) ? (
                                    <svg
                                      className="animate-spin h-5 w-5 ml-5"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      key={screenData.id}
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
                                    <p className="text-sm font-medium pl-5 truncate overflow-hidden text-ellipsis">
                                      {screenData.scheduleName.length > 25
                                        ? `${screenData.scheduleName.slice(
                                            0,
                                            28
                                          )}...`
                                        : screenData.scheduleName}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="w-[25%] border border-gray-300">
                              {/* Added border */}
                              <p className="text-sm font-medium truncate">
                                {new Date(
                                  screenData.created_at
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                                ,{" "}
                                {new Date(
                                  screenData.created_at
                                ).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </p>
                            </td>
                            <td className="w-[25%] border border-gray-300">
                              {/* Added border */}
                              <p className="text-sm font-medium truncate">
                                {screenData.type}
                              </p>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center py-4">
                            <p className="text-base font-medium text-secondary_color">
                              No playlist found
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : scheduleLoading ? (
                  <DefaultSkeleton />
                ) : (
                  <div className="w-full">
                    {filteredSchedule.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {filteredSchedule.map((item) => (
                          // item.folder_name === null &&
                          <div
                            className="schedule_parent_wrapper -mt-2"
                            key={item.id}
                          >
                            <Input
                              type="checkbox"
                              className="image_checkbox_schedule"
                              value={item.id}
                              id={item.id}
                              onChange={(e) => handleCheckboxChange(e, item.id)}
                              checked={checkedItems.includes(item.id)}
                            />
                            <div
                              key={item.id}
                              className={`h-14 w-56 bg-zinc-50 border border-border_gray rounded px-3 py-2 cursor-pointer screen_wrapper ${
                                checkedItems.includes(item.id)
                                  ? "border-[#FF7C44]"
                                  : ""
                              }`}
                              style={
                                addLoader.includes(item.id)
                                  ? { pointerEvents: "none" }
                                  : {}
                              }
                              onClick={() => handleScheduledData(item)}
                            >
                              <div className="flex items-center gap-1">
                                {addLoader.includes(item.id) ? (
                                  <svg
                                    className="animate-spin h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    key={item.id}
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
                                  <CalendarCheck size={20} />
                                )}

                                <div>
                                  <p className="text-sm font-medium text-primary_color">
                                    {item.scheduleName.length > 12
                                      ? `${item.scheduleName.slice(0, 18)}...`
                                      : item.scheduleName}
                                  </p>
                                  <p className="text-xs font-normal text-secondary_color mt-1 flex items-center gap-2">
                                    {item.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full flex justify-center items-center">
                        <p className="text-base font-medium text-secondary_color mt-5">
                          No schedule found
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
