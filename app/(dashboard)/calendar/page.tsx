"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { EventSourceInput } from "@fullcalendar/core/index.js";
import {
  CheckIcon,
  ChevronRight,
  Pencil,
  Search,
  TriangleAlert,
  Repeat,
} from "lucide-react";
import { useRouter } from "next/navigation";
import "./style.css";
import { supabase } from "@/utils/supabase/supabaseClient";
import { getUserData } from "@/app/(signIn-setup)/sign-in/action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { DragDropContext, Droppable, Draggable as BeautifulDraggable } from 'react-beautiful-dnd';

interface Event {
  title: string;
  start: Date | string;
  end: Date | string;
  cdate: Date | string;
  allDay: boolean;
  id: number;
  ids: string;
  backgroundColor?: string;
  type?: string;
}

const CalendarPage = () => {
  const router = useRouter();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [allEvent, setAllEvent] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState(allEvents);
  const [backLoader, setBackLoader] = useState(false);
  const [saveLoader, setSaveLoader] = useState(false);

  const [startDateCheck, setStartDateCheck] = useState("");

  const filteredEvents = allEvent.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // useEffect(() => {
  //   let draggableEl = document.getElementById("draggable-el");
  //   if (draggableEl) {
  //     new Draggable(draggableEl, {
  //       itemSelector: ".fc-event",
  //       eventData: function (eventEl) {
  //         let title = eventEl.getAttribute("title");
  //         let id = eventEl.getAttribute("data");
  //         let start = eventEl.getAttribute("start");
  //         return { title, id, start };
  //       },
  //     });
  //   }
  // }, []);

  const removeDuplicates = (array: any[]) => {
    const uniqueMap = new Map();
    array.forEach((item) => {
      uniqueMap.set(item.ids, item); // Set the item with ID as the key
    });
    return Array.from(uniqueMap.values()); // Convert back to array
  };

  const getScheduledEvents = async () => {
    const userId = localStorage.getItem("userId");
    const { data, error } = await supabase
      .from("scheduledContents")
      .select("*")
      .eq("is_deleted", 0)
      .eq("userId", userId);

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      const formattedEvents: Event[] = [];

      data.forEach((item: any) => {
        const startDateTime = `${item.startDate}T${convertTo24HourFormat(
          item.startTime
        )}`;
        const endDateTime = `${item.endDate}T${convertTo24HourFormat(
          item.endTime
        )}`;
        let randColor = "#6dcef5"; //generateRandomColor(0.3);
        let repeatIcon = "🔄"; //`${(<Repeat />)}`;

        if (item.repeat === null) {
          formattedEvents.push({
            title: item.scheduleName || "Untitled",
            start: startDateTime,
            end: new Date(
              new Date(endDateTime).setDate(new Date(endDateTime).getDate())
            ).toISOString(),
            allDay: false,
            id: item.id,
            ids: item.id,
            backgroundColor: randColor, //item.type === "TurnOff" ? "#383838FF" : randColor,
            type: item.type,
            cdate: "",
          });
        } else if (item.repeat === "Daily (Mon-Sun)") {
          const currentStartDate = new Date(item.startDate);
          const limitDays = 60; // Set how many days you want the event to span

          // Function to format the date as 'YYYY-MM-DD' without timezone shift
          const formatDateToLocal = (date: Date) => {
            return `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          };

          // Calculate the end date by adding limitDays to the start date
          const eventEndDate = new Date(currentStartDate);
          eventEndDate.setDate(currentStartDate.getDate() + limitDays);

          // Push a single continuous event that spans across the defined range
          formattedEvents.push({
            title: `${repeatIcon} ${item.scheduleName || "Untitled"}`,
            start: `${formatDateToLocal(
              currentStartDate
            )}T${convertTo24HourFormat(item.startTime)}`, // Start time at the beginning
            end: `${formatDateToLocal(eventEndDate)}T${convertTo24HourFormat(
              item.endTime
            )}`, // End time at the end of the entire period
            allDay: true,
            id: item.id + currentStartDate, // Unique ID for this continuous event
            ids: item.id,
            backgroundColor: randColor,
            type: item.type,
            cdate: "",
          });
        }
        // If the event is set to repeat Monday to Friday
        else if (item.repeat === "Every Weekday (Mon-Fri)") {
          const currentStartDate = new Date(item.startDate);
          const limitWeeks = 20; // Set how many weeks you want to generate the events for

          // Function to format the date as 'YYYY-MM-DD' without timezone shift
          const formatDateToLocal = (date: Date) => {
            return `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          };

          // Loop for the desired number of days
          for (let i = 0; i < limitWeeks * 7; i++) {
            const eventDate = new Date(currentStartDate);
            eventDate.setDate(currentStartDate.getDate() + i); // Increment the date by 'i' days

            const dayOfWeek = eventDate.getDay(); // Get the day of the week (0 = Sunday, 6 = Saturday)

            // Only include Monday (1) to Friday (5)
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
              formattedEvents.push({
                title: `${repeatIcon} ${item.scheduleName || "Untitled"}`,
                start: `${formatDateToLocal(eventDate)}T${convertTo24HourFormat(
                  item.startTime
                )}`, // Set start time
                end: `${formatDateToLocal(eventDate)}T${convertTo24HourFormat(
                  item.endTime
                )}`, // Set end time
                allDay: true, // Set allDay property to true
                id: item.id + eventDate, // Generate a unique ID for each weekday
                ids: item.id,
                backgroundColor: randColor, // Make sure randColor is defined
                type: item.type,
                cdate: "",
              });
            }
          }
        }

        // If the event is set to repeat only on weekends
        else if (item.repeat === "Every Weekend (Sat-Sun)") {
          const currentStartDate = new Date(item.startDate);
          const limitWeeks = 20; // Specify how many weeks to generate events for (change as needed)

          // Function to format the date as 'YYYY-MM-DD' without timezone shift
          const formatDateToLocal = (date: Date) => {
            return `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          };

          // Calculate the first Saturday and Sunday from the start date
          const firstSaturday = new Date(currentStartDate);
          const firstSunday = new Date(currentStartDate);

          // Adjust the first Saturday and Sunday
          if (firstSaturday.getDay() !== 6) {
            firstSaturday.setDate(
              firstSaturday.getDate() + (6 - firstSaturday.getDay())
            ); // Move to next Saturday
          }

          if (firstSunday.getDay() !== 0) {
            firstSunday.setDate(
              firstSunday.getDate() + (7 - firstSunday.getDay())
            ); // Move to next Sunday
          }

          // Loop through the specified number of weeks to add events
          for (let i = 0; i < limitWeeks; i++) {
            const currentSaturday = new Date(firstSaturday);
            const currentSunday = new Date(firstSunday);

            // Move to the current week for Saturday and Sunday
            currentSaturday.setDate(firstSaturday.getDate() + i * 7); // Saturday for this week
            currentSunday.setDate(firstSunday.getDate() + i * 7); // Sunday for this week

            // Create event for Saturday
            formattedEvents.push({
              title: repeatIcon + " " + item.scheduleName || "Untitled",
              start: `${formatDateToLocal(
                currentSaturday
              )}T${convertTo24HourFormat(item.startTime)}`, // Set start time
              end: `${formatDateToLocal(
                currentSaturday
              )}T${convertTo24HourFormat(item.endTime)}`, // Set end time
              allDay: true, // Set allDay property to true
              id: item.id + currentSaturday, // Generate a unique ID for Saturday
              ids: item.id,
              backgroundColor: randColor,
              // item.type === "TurnOff" ? "#383838FF" : randColor,
              type: item.type,
              cdate: "",
            });

            // Create event for Sunday
            formattedEvents.push({
              title: repeatIcon + " " + item.scheduleName || "Untitled",
              start: `${formatDateToLocal(
                currentSunday
              )}T${convertTo24HourFormat(item.startTime)}`, // Set start time
              end: `${formatDateToLocal(currentSunday)}T${convertTo24HourFormat(
                item.endTime
              )}`, // Set end time
              allDay: true, // Set allDay property to true
              id: item.id + currentSunday, // Generate a unique ID for Sunday
              ids: item.id,
              backgroundColor: randColor,
              // item.type === "TurnOff" ? "#383838FF" : randColor,
              type: item.type,
              cdate: "",
            });
          }
        }
        // If the event is set to repeat only on weekends
        else if (item.repeat === "Monthly") {
          const currentStartDate = new Date(item.startDate);
          const currentEndDate = new Date(item.endDate);
          const eventDay = currentStartDate.getDate(); // Get the day of the month from the start date
          const limitMonths = 12; // For example, create events for the next 12 months

          // Function to format the date as 'YYYY-MM-DD' without timezone shift
          const formatDateToLocal = (date: Date) => {
            return `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          };

          // Loop through each month, up to the limit
          for (
            let i = 0, d = new Date(currentStartDate);
            i < limitMonths;
            i++, d.setMonth(d.getMonth() + 1)
          ) {
            // Set the event to occur on the same day of each month
            const eventDate = new Date(d.getFullYear(), d.getMonth(), eventDay);
            formattedEvents.push({
              title: repeatIcon + " " + item.scheduleName || "Untitled",
              start: `${formatDateToLocal(eventDate)}T${convertTo24HourFormat(
                item.startTime
              )}`, // Set start time
              end: `${formatDateToLocal(eventDate)}T${convertTo24HourFormat(
                item.endTime
              )}`, // Set end time (same day)
              allDay: true, // Set allDay property to true
              id: item.id + d,
              ids: item.id,
              backgroundColor: randColor,
              // item.type === "TurnOff" ? "#383838FF" : randColor,
              type: item.type,
              cdate: "",
            });
          }
        }
        // If the event is set to repeat only on weekends
        else if (item.repeat === "Annually") {
          const currentStartDate = new Date(item.startDate);
          const currentEndDate = new Date(item.endDate);
          const eventDay = currentStartDate.getDate(); // Get the day of the month from the start date
          const eventMonth = currentStartDate.getMonth(); // Get the month from the start date
          const limitYears = 10;

          // Function to format the date as 'YYYY-MM-DD' without timezone shift
          const formatDateToLocal = (date: Date) => {
            return `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          };

          // Loop through each year, up to the limit
          for (let i = 0; i < limitYears; i++) {
            // Set the event to occur on the same day and month each year
            const eventYear = currentStartDate.getFullYear() + i; // Move year forward by i
            const eventDate = new Date(eventYear, eventMonth, eventDay);
            // Ensure it starts from the start date
            formattedEvents.push({
              title: repeatIcon + " " + item.scheduleName || "Untitled",
              start: `${formatDateToLocal(eventDate)}T${convertTo24HourFormat(
                item.startTime
              )}`, // Start time
              end: `${formatDateToLocal(eventDate)}T${convertTo24HourFormat(
                item.endTime
              )}`, // End time (same day)
              allDay: false, // Not an all-day event, as we have specific start and end times
              id: item.id + i,
              ids: item.id,
              backgroundColor: randColor,
              // item.type === "TurnOff" ? "#383838FF" : randColor,
              type: item.type,
              cdate: "",
            });
          }
        } else if (item.repeat === "Custom") {
          const currentStartDate = new Date(item.startDate);
          const repeatValue = 50; // Default repeat value
          let repeatUntil = null;
          if (item.repeatUntilValue === "Custom Date") {
            repeatUntil = item.repeatUntilDate
              ? new Date(item.repeatUntilDate)
              : null; // Check if repeatUntilDate is present
          }

          // Helper functions
          const formatDateToLocal = (date: Date) => {
            return `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          };

          const getRepeatInterval = (
            repeatDays: string,
            repeatValue: string
          ) => {
            const parsedRepeatValue = parseInt(repeatValue, 10);
            if (repeatDays === "Day")
              return !isNaN(parsedRepeatValue) ? parsedRepeatValue + 1 : 2;
            if (repeatDays === "Week")
              return !isNaN(parsedRepeatValue) ? parsedRepeatValue * 7 + 1 : 2;
            if (repeatDays === "Month")
              return !isNaN(parsedRepeatValue) ? parsedRepeatValue + 1 : 2;
            if (repeatDays === "Year")
              // return !isNaN(parsedRepeatValue) ? parsedRepeatValue * 12 + 1 : 2;
              return !isNaN(parsedRepeatValue) ? parsedRepeatValue + 1 : 2;
            return 2;
          };

          let interval = getRepeatInterval(item.repeatDays, item.repeatValue);

          // Daily or Weekly repetition
          if (item.repeatDays === "Day" || item.repeatDays === "Week") {
            for (let i = 0; i < repeatValue; i++) {
              const eventDate = new Date(currentStartDate);
              eventDate.setDate(currentStartDate.getDate() + i * interval);

              // Stop if eventDate exceeds repeatUntil date
              if (repeatUntil && eventDate > repeatUntil) break;

              formattedEvents.push({
                title: repeatIcon + " " + (item.scheduleName || "Untitled"),
                start: `${formatDateToLocal(eventDate)}T${convertTo24HourFormat(
                  item.startTime
                )}`,
                end: `${formatDateToLocal(eventDate)}T${convertTo24HourFormat(
                  item.endTime
                )}`,
                allDay: item.allDay !== undefined ? item.allDay : true,
                id: item.id + i,
                ids: item.id,
                backgroundColor: randColor,
                type: item.type,
                cdate: "",
              });
            }
          } else if (item.repeatDays === "Month") {
            for (let i = 0; i < repeatValue; i++) {
              const eventDate = new Date(currentStartDate);
              eventDate.setMonth(currentStartDate.getMonth() + i * interval);

              // Stop if eventDate exceeds repeatUntil date
              if (repeatUntil && eventDate > repeatUntil) break;

              formattedEvents.push({
                title: repeatIcon + " " + (item.scheduleName || "Untitled"),
                start: `${formatDateToLocal(eventDate)}T${convertTo24HourFormat(
                  item.startTime
                )}`,
                end: `${formatDateToLocal(eventDate)}T${convertTo24HourFormat(
                  item.endTime
                )}`,
                allDay: item.allDay !== undefined ? item.allDay : true,
                id: item.id + i,
                ids: item.id,
                backgroundColor: randColor,
                type: item.type,
                cdate: "",
              });
            }
          } else if (item.repeatDays === "Year") {
            for (let i = 0; i < repeatValue; i++) {
              const eventDate = new Date(currentStartDate);
              eventDate.setFullYear(
                currentStartDate.getFullYear() + i * interval
              ); // Increment by the dynamic interval

              // Stop if eventDate exceeds repeatUntil date
              if (repeatUntil && eventDate > repeatUntil) break;

              formattedEvents.push({
                title: repeatIcon + " " + (item.scheduleName || "Untitled"),
                start: `${formatDateToLocal(eventDate)}T${convertTo24HourFormat(
                  item.startTime
                )}`,
                end: `${formatDateToLocal(eventDate)}T${convertTo24HourFormat(
                  item.endTime
                )}`,
                allDay: item.allDay !== undefined ? item.allDay : true,
                id: item.id + i,
                ids: item.id,
                backgroundColor: randColor,
                type: item.type,
                cdate: "",
              });
            }
          }
        }
      });

      // Make sure the events are updated correctly in the state
      setAllEvents(formattedEvents);
      setAllEvent(removeDuplicates(formattedEvents));
    }
  };

  useEffect(() => {
    // const fetchEvents = async () => {
    //   await getScheduledEvents(); // Ensure this only runs once when the component mounts
    // };

    // fetchEvents();
    getScheduledEvents();
  }, []);

  function generateRandomColor(opacity: number = 1) {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    const alpha = Math.floor(opacity * 255)
      .toString(16)
      .padStart(2, "0");
    return color + alpha;
  }

  function convertTo24HourFormat(time: string) {
    const [hourMin, period] = time.split(" ");
    let [hour, minute] = hourMin.split(":").map(Number);

    if (period === "PM" && hour !== 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  }

  const handleEditSchedule = async (item: any) => {
    router.push(`schedule-details/${item.ids}`);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    const eventData = allEvents.filter(
      (item) => item.ids === event.extendedProps.ids
    );
    const Sdatetime = eventData[0].start;
    const Edatetime = eventData[0].start;

    setSelectedEvent({
      title: eventData[0].title,
      start: eventData[0].start, //`${Sdatetime.toString().split("T")[1]}`,  // Use startStr to get the date string directly
      end: eventData[0].end, //`${Edatetime.toString().split("T")[1]}`,  // Use endStr to get the date string directly
      allDay: eventData[0].allDay,
      id: eventData[0].id,
      ids: eventData[0].ids,
      cdate: event.startStr,
      // etime: `${Edatetime.toString().split("T")[1]}`,
      // stime: `${Sdatetime.toString().split("T")[1]}`,
    });
    // setSelectedEvent({
    //   title: clickInfo.event.title,
    //   start: clickInfo.event.start,
    //   end: clickInfo.event.end,
    //   allDay: clickInfo.event.allDay,
    //   id: clickInfo.event.id,
    //   ids: clickInfo.event.ids,
    // });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // const handleOnDragEnd = (result : any) => {
  //   if (!result.destination) return;

  //   const reorderedEvents = Array.from(events);
  //   const [movedEvent] = reorderedEvents.splice(result.source.index, 1);
  //   reorderedEvents.splice(result.destination.index, 0, movedEvent);

  //   setEvents(reorderedEvents);
  // };

  return (
    <div className="main-calendar-wrapper w-full flex">
      <div className="main-calendar w-full p-4 pb-[15px] h-[92vh] overflow-y-scroll scroll-smooth">
        {/* h-[90vh]  */}
        <div className="flex items-center gap-2 mt-2 my-7">
          {/* <h4
            className="text-sm font-medium text-primary_color cursor-pointer"
            onClick={() => router.push("/schedule")}
          >
            Schedule
          </h4> */}
          <h4
            className="text-sm font-medium text-primary_color cursor-pointer"
            onClick={() => {
              setBackLoader(true);
              setTimeout(() => {
                router.push("/schedule");
                setBackLoader(false);
              }, 3000);
            }}
            style={backLoader ? { pointerEvents: "none" } : {}}
          >
            {backLoader ? (
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
              "Schedule"
            )}
          </h4>
          <ChevronRight />
          <h4 className="text-sm font-medium text-primary_color">
            Calendar View
          </h4>
        </div>
        <div className="grid grid-cols-12">
          <div className="col-span-12">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
              headerToolbar={{
                left: "title",
                right: "prev,today,next, dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={allEvents as EventSourceInput}
              nowIndicator={true}
              editable={true}
              droppable={true}
              selectable={true}
              selectMirror={true}
              eventClick={handleEventClick} // Handle event click to open modal
            />
          </div>
        </div>
      </div>
      <div className="schedule-list w-[329px] border-l border-gray-300 p-3">
        <h2 className="text-base font-bold text-primary_color">
          Schedule List
        </h2>
        <div className="">
          <div className="relative w-full mt-4 mb-3">
            <Input
              type="text"
              placeholder="Search"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              className="absolute left-3 top-[52%] -translate-y-1/2 text-secondary_color"
              size={16}
            />
          </div>
          <div className="overflow-y-scroll scroll-smooth h-[70vh] main-calendar">
            {filteredEvents.map((event) => (
              <div
                className="border border-gray-300 rounded-md h-[40px] flex justify-between items-center p-2.5 mb-1.5"
                key={event.id}
                style={{ backgroundColor: event.backgroundColor }}
              >
                <div>
                  <p className="text-primary_color text-sm font-medium">
                    {event.title}
                  </p>
                </div>
                {event.type === "TurnOff" ? (
                  <Pencil
                    size={16}
                    className="text-black cursor-pointer"
                    onClick={() => handleEditSchedule(event)}
                  />
                ) : (
                  <Pencil
                    size={16}
                    className="text-secondary_color cursor-pointer"
                    onClick={() => handleEditSchedule(event)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <Button
          className="bg-button_orange hover:bg-button_orange hover:opacity-75 w-full"
          onClick={() => {
            setSaveLoader(true);
            setTimeout(() => {
              // router.push(`/schedule-details/${selectedEvent?.id}`);
              router.push(`/create-schedule`);
              setSaveLoader(false);
            }, 3000);
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
                className="opacity-75"
                fill="#fff"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "New Schedule"
          )}
        </Button>
      </div>
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold leading-6 text-gray-900"
                  >
                    Scheduled Details
                  </Dialog.Title>
                  <div className="mt-4">
                    {selectedEvent && (
                      <div>
                        <p className="mb-2">
                          <strong className="mr-2">Schedule Name:</strong>
                          {selectedEvent.title}
                        </p>
                        <p>{startDateCheck}</p>
                        <p className="mb-2">
                          <strong className="mr-[17px]">Schedule Date:</strong>
                          {new Date(selectedEvent.cdate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <p className="mb-2">
                          <strong className="mr-[50px]">Start Time:</strong>
                          {new Date(selectedEvent.start).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "numeric",
                              hour12: true,
                            }
                          )}
                        </p>
                        {/* <p className="mb-2">
                          <strong className="mr-[62px]">End Date:</strong>
                          {new Date(selectedEvent.end).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </p> */}
                        <p className="mb-2">
                          <strong className="mr-[58px]">End Time:</strong>
                          {new Date(selectedEvent.end).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "numeric",
                              hour12: true,
                            }
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Button
                      className="bg-button_orange hover:bg-button_orange hover:opacity-75 w-1/2"
                      onClick={closeModal}
                    >
                      Close
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default CalendarPage;
