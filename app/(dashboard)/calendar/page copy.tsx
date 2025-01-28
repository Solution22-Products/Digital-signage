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
  allDay: boolean;
  id: number;
  backgroundColor?: string;
  type?: string;
}

const CalendarPage = () => {
  const router = useRouter();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState(allEvents);
  const [backLoader, setBackLoader] = useState(false);
  const [saveLoader, setSaveLoader] = useState(false);

  const filteredEvents = allEvents.filter((event) =>
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

  const getScheduledEvents = async () => {
    const user = await getUserData();
    const userId = user?.id || null;
    const { data, error } = await supabase
      .from("scheduledContents")
      .select("*")
      .eq("is_deleted", 0)
      .eq("userId", userId);

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      const formattedEvents = data.map((item: any) => {
        const startDateTime = `${item.startDate}T${convertTo24HourFormat(
          item.startTime
        )}`;
        const endDateTime = `${item.endDate}T${convertTo24HourFormat(
          item.endTime
        )}`;

        if (item.repeat === "Daily (Mon-Sun)") {
          console.log("inside daily");
          return {
            title: item.scheduleName || "Untitled",
            start: startDateTime,
            end: endDateTime,
            allDay: true,
            id: item.id,
            backgroundColor:
              item.type === "TurnOff" ? "#808080" : generateRandomColor(0.3),
            type: item.type,
          };
        } else {
          return {
            title: item.scheduleName || "Untitled",
            start: startDateTime,
            end: endDateTime,
            allDay: false,
            id: item.id,
            backgroundColor:
              item.type === "TurnOff" ? "#808080" : generateRandomColor(0.3),
            type: item.type,
          };
        }
      });
      setAllEvents(formattedEvents);
    }
  };

  useEffect(() => {
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
    router.push(`schedule-details/${item.id}`);
  };

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent({
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      allDay: clickInfo.event.allDay,
      id: clickInfo.event.id,
    });
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
      <div className="main-calendar w-full p-4 overflow-y-scroll scroll-smooth">
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
              router.push("/create-schedule");
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
                          <strong className="mr-2">Schedule Name:</strong>{" "}
                          {selectedEvent.title}
                        </p>
                        <p className="mb-2">
                          <strong className="mr-[53px]">Start Date:</strong>{" "}
                          {new Date(selectedEvent.start).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <p className="mb-2">
                          <strong className="mr-[50px]">Start Time:</strong>{" "}
                          {new Date(selectedEvent.start).toLocaleTimeString(
                            "en-US",
                            { hour: "numeric", minute: "numeric", hour12: true }
                          )}
                        </p>
                        <p className="mb-2">
                          <strong className="mr-[62px]">End Date:</strong>{" "}
                          {new Date(selectedEvent.end).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <p className="mb-2">
                          <strong className="mr-[58px]">End Time:</strong>{" "}
                          {new Date(selectedEvent.end).toLocaleTimeString(
                            "en-US",
                            { hour: "numeric", minute: "numeric", hour12: true }
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
