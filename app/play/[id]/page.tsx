"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// import PlayerPage from "@/components/playerPage";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Image from "next/image";

interface PlaylistImage {
  url: string;
  title: string;
  description: string;
  createdAt: string;
  duration: number;
}
interface ScreenDetails {
  id: string;
  playlistDetails: {
    playlistImages: PlaylistImage[];
  };
  status: string;
}
interface Props {
  params: {
    id: string;
  };
}

interface Layouts {
  name: string;
  image: string;
  zone1: string;
  zone2?: string;
  zone3?: string;
  zone1h: string | undefined;
  zone2h?: string | undefined;
  zone3h?: string | undefined;
  zone1w: string | undefined;
  zone2w?: string | undefined;
  zone3w?: string | undefined;
  zoneCount: number;
}

const DynamicSlider: React.FC<Props> = ({ params: { id } }) => {
  const [slides, setSlides] = useState<PlaylistImage[]>([]);
  const [zone1slides, setZone1slides] = useState<PlaylistImage[]>([]);
  const [zone2slides, setZone2slides] = useState<PlaylistImage[]>([]);
  const [zone3slides, setZone3slides] = useState<PlaylistImage[]>([]);
  const [layoutType, setLayoutType] = useState<string>("");
  const [layoutZone, setLayoutZone] = useState<Layouts | null>(null);
  const sliderRef1 = useRef<Slider>(null);
  const sliderRef2 = useRef<Slider>(null);
  const sliderRef3 = useRef<Slider>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlideIndex1, setCurrentSlideIndex1] = useState(0);
  const [currentSlideIndex2, setCurrentSlideIndex2] = useState(0);
  const [currentSlideIndex3, setCurrentSlideIndex3] = useState(0);
  const [checkSchedule, setCheckSchedule] = useState(false);

  const [zone1Id, setZone1Id] = useState<any>("");
  const [zone2Id, setZone2Id] = useState<any>("");
  const [zone3Id, setZone3Id] = useState<any>("");

  const [zone1Check, setZone1Check] = useState(true);
  const [zone2Check, setZone2Check] = useState(true);
  const [zone3Check, setZone3Check] = useState(true);

  const [screenStatus, setscreenStatus] = useState(true);
  const [screenStatusshedule, setscreenStatusshedule] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const [screenId, setScreenId] = useState<any>("");
  const [isPlaying, setIsPlaying] = useState(true);
  //const fullUrl = `${window.location.origin}/play/${id}`;
  const [fullUrl, setFullUrl] = useState<string>("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setFullUrl(`${window.location.origin}/play/${id}`);
    }
  }, [id]);

  // Function to generate short URL code
  const generateShortCode = () => {
    return Math.random().toString(36).substr(2, 6); // Random 6-character string
  };

  useEffect(() => {
    // Retrieve or generate the device ID
    let device_id = sessionStorage.getItem("device_id");
    if (!device_id) {
      device_id = generateShortCode();
      sessionStorage.setItem("device_id", device_id); // Store the device_id in sessionStorage
    }

    // Retrieve the playback state from sessionStorage
    const storedPlaybackState = sessionStorage.getItem("play_status");
    const initialPlaybackState = storedPlaybackState === "true";

    // This function only starts playback, avoids async in intervals
    const startPlayback = async () => {
      try {
        const { data: existingSession, error: fetchError } = await supabase
          .from("playback_sessions")
          .select("*")
          .eq("url", fullUrl)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error fetching session:", fetchError);
          return;
        }

        // if (existingSession && existingSession.is_playing === true) {
        //   console.log("This URL is already being played elsewhere.");
        //   return;
        // }

        const currentTime = new Date().toLocaleString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });

        if (existingSession) {
          const { error: updateError } = await supabase
            .from("playback_sessions")
            .update({
              is_playing: true,
              device_id: device_id,
              last_played: currentTime,
              screen_time: Number(existingSession.screen_time) + 1,
            })
            .eq("url", fullUrl);

          if (!updateError) {
            setIsPlaying(true);
            sessionStorage.setItem("play_status", "true");
            console.log(`Started playing ${fullUrl}`);
          } else {
            console.error("Error updating playback session:", updateError);
          }
        } else {
          const { error: insertError } = await supabase
            .from("playback_sessions")
            .insert({
              url: fullUrl,
              is_playing: true,
              device_id: device_id,
              last_played: currentTime,
              screen_time: 1,
            });

          if (!insertError) {
            setIsPlaying(true);
            sessionStorage.setItem("play_status", "true");
            console.log(`Started playing ${fullUrl}`);
          } else {
            console.error("Error starting playback:", insertError);
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    // Function to check the session periodically
    const checkSessionAndStartPlayback = () => {
      let curTime = new Date(); // Current date and time as a Date object

      supabase
        .from("playback_sessions")
        .select("*")
        .eq("url", fullUrl)
        .single()
        .then(({ data: existingSession, error: fetchErrors }) => {
          if (fetchErrors) {
            startPlayback();
            console.error("Error fetching existing session:", fetchErrors);
            return;
          }

          if (existingSession) {
            let lastPlayed = new Date(existingSession.last_played);
            let timeDifferenceInSeconds =
              (curTime.getTime() - lastPlayed.getTime()) / 1000;

            //console.log(timeDifferenceInSeconds);

            if (timeDifferenceInSeconds > 10) {
              startPlayback(); // Start playback if more than 40 seconds have passed
            } else if (existingSession.device_id != device_id) {
              setIsPlaying(false);
              sessionStorage.setItem("play_status", "false");
            } else {
              setIsPlaying(true);
              sessionStorage.setItem("play_status", "true");
            }
          } else {
            startPlayback();
          }
        });
    };

    const intervalId = setInterval(() => {
      supabase
        .from("playback_sessions")
        .select("*")
        .eq("url", fullUrl)
        .single()
        .then(({ data: existingSession, error: fetchErrors }) => {
          if (fetchErrors) {
            console.error("Error fetching existing session:", fetchErrors);
            return;
          }

          if (existingSession && existingSession.device_id === device_id) {
            supabase
              .from("playback_sessions")
              .update({
                is_playing: true,
                device_id: device_id,
                last_played: new Date().toLocaleString("en-CA", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                }),
                screen_time: Number(existingSession.screen_time) + 1,
              })
              .eq("url", fullUrl)
              .then();
          }
        });

      checkSessionAndStartPlayback(); // Only runs this synchronous function
    }, 1000); // Check every second

    return () => {
      clearInterval(intervalId); // Cleanup the interval when the component is unmounted
    };
  }, [fullUrl, isPlaying]);

  const fetchSlides = async () => {
    setscreenStatus(true);
    try {
      const { data: screenData, error: screenError } = await supabase
        .from("screenDetails")
        .select("*")
        .eq("short_url_code", id)
        .eq("status", "Active")
        .eq("is_deleted", 0)
        .single();

      if (screenError) {
        console.error("Error fetching data from screenDetails:", screenError);
        setscreenStatus(false);

        /*const { data: playlistData, error: playlistError } = await supabase
          .from("playlistDetails")
          .select("*")
          .eq("id", id)
          .eq("is_deleted", 0)
          .single();

        if (playlistError) {
          console.error(
            "Error fetching data from playlistDetails:",
            playlistError
          );
          return;
        } else {
          const slidesData = playlistData?.playlistImages || [];
          setSlides(slidesData);
          console.log("slidesData - Playlist:", slidesData);
        }*/
      } else {
        setScreenId(screenData?.id);
        const { data: orientData, error: orientError } = await supabase
          .from("layoutType")
          .select("*")
          .eq("id", screenData.orientation)
          .eq("is_deleted", 0)
          .single();

        if (orientError) {
          console.error("Error fetching data from layoutType:", orientError);
          return;
        }

        const { data: layoutData, error: layoutError } = await supabase
          .from("layouts")
          .select("*")
          .eq("id", screenData.layout)
          .eq("is_deleted", 0)
          .single();

        if (layoutError) {
          console.error("Error fetching data from layouts:", layoutError);
          return;
        }

        const zoneCount =
          typeof layoutData.zone3 === "string" && layoutData.zone3.trim() !== ""
            ? 3
            : typeof layoutData.zone2 === "string" &&
              layoutData.zone2.trim() !== ""
            ? 2
            : 1;

        // Safely split the dimensions if they exist, returning undefined instead of null
        const splitDimensions = (
          zone: string | undefined
        ): [string | undefined, string | undefined] => {
          if (!zone?.trim()) {
            return [undefined, undefined];
          }
          const [height, width] = zone.split("*");
          return [height, width];
        };

        const layouts: Layouts = {
          name: layoutData.name,
          image: layoutData.image,
          zone1: layoutData.zone1,
          zone2: layoutData.zone2,
          zone3: layoutData.zone3,
          zone1w: splitDimensions(layoutData.zone1)[0], // width
          zone1h: splitDimensions(layoutData.zone1)[1], // height
          zone2w: splitDimensions(layoutData.zone2)[0],
          zone2h: splitDimensions(layoutData.zone2)[1],
          zone3w: splitDimensions(layoutData.zone3)[0],
          zone3h: splitDimensions(layoutData.zone3)[1],
          zoneCount,
        };

        const { data: zone1Playlist, error: zone1Error } = await supabase
          .from("playlistDetails")
          .select("*")
          .eq("id", screenData.zone1_details[0].playlist)
          .eq("is_deleted", 0)
          .single();

        const { data: zone2Playlist, error: zone2Error } = await supabase
          .from("playlistDetails")
          .select("*")
          .eq("id", screenData.zone2_details[0].playlist)
          .eq("is_deleted", 0)
          .single();

        const { data: zone3Playlist, error: zone3Error } = await supabase
          .from("playlistDetails")
          .select("*")
          .eq("id", screenData.zone3_details[0].playlist)
          .eq("is_deleted", 0)
          .single();

        setZone1slides(zone1Playlist?.playlistImages || []);
        setZone2slides(zone2Playlist?.playlistImages || []);
        setZone3slides(zone3Playlist?.playlistImages || []);

        setZone1Id(zone1Playlist?.id);
        console.log("zone1Id:", zone1Playlist?.id, zone1Id.toString());
        setZone2Id(zone2Playlist?.id || "");
        setZone3Id(zone3Playlist?.id || "");

        setLayoutType(orientData.title || "");
        setLayoutZone(layouts);

        //console.log("slidesData - 1:", zone1Playlist?.playlistImages);
        //console.log("slidesData - 2:", zone2slides);
        //console.log("slidesData - 3:", zone3slides);
        //console.log("layoutType:", orientData.title);
        //console.log("layoutZone:", layouts);
      }
    } catch (err) {
      console.error("Unexpected error fetching slides:", err);
    }
  };

  const getScheduledData = async () => {
    try {
      const { data: screenData, error: screenError } = await supabase
        .from("screenDetails")
        .select("*")
        .eq("short_url_code", id)
        .eq("status", "Active")
        .eq("is_deleted", 0)
        .single();

      if (screenError) {
        console.error("Error fetching data from screenDetails:", screenError);
        setscreenStatus(false);
      } else {
        setScreenId(screenData?.id);
      }

      // Fetch scheduled contents
      const { data: scheduledData, error: scheduledError } = await supabase
        .from("scheduledContents")
        .select("*")
        .eq("screen", screenData?.id)
        .eq("is_deleted", 0);

      if (scheduledError) throw scheduledError;

      // Fetch screen details
      const { data: screenDetails, error: screenDetailsError } = await supabase
        .from("screenDetails")
        .select("*")
        .eq("short_url_code", id)
        .eq("is_deleted", 0)
        .single();
      if (screenDetailsError) throw screenDetailsError;

      //console.log("screenDetails - 1: ", screenDetails);
      const currentDate = new Date().toLocaleDateString("en-CA");
      const currentTime = new Date().toLocaleTimeString("en-CA", {
        hour12: false,
      });

      // Filter and prioritize schedules
      const validSchedules = scheduledData
        .filter((item) => {
          const scheduleStartDate = new Date(item.startDate);
          const repeatUntilDate =
            item.repeatUntilValue === "Custom Date"
              ? new Date(item.repeatUntilDate)
              : null;
          const hasValidEndDate = repeatUntilDate
            ? currentDate <= repeatUntilDate.toLocaleDateString("en-CA")
            : true;
          if (!hasValidEndDate) return false;

          // Process "TurnOn" type schedules
          if (
            item.repeat === "Daily (Mon-Sun)" ||
            item.repeat === "Every Weekend (Sat-Sun)" ||
            item.repeat === "Every Weekday (Mon-Fri)" ||
            item.repeat === "Monthly" ||
            item.repeat === "Annually"
          ) {
            return handleDefaultRepeat(
              item,
              currentDate,
              currentTime,
              scheduleStartDate
            );
          } else if (item.repeat === "Custom") {
            return handleCustomRepeat(
              item,
              currentDate,
              currentTime,
              scheduleStartDate,
              repeatUntilDate
            );
          } else {
            //return currentDate >= item.startDate && currentDate <= item.endDate;
            // Ensure both date and time are within the start and end ranges
            const isSameDay = currentDate === item.startDate;
            const isWithinTimeRange =
              currentTime >= item.startTime && currentTime <= item.endTime;
            // Return true only if the current day matches and current time is within the range
            return isSameDay && isWithinTimeRange;
          }
        })
        .sort((a, b) => {
          if (a.endTime === b.endTime) {
            return a.startTime.localeCompare(b.startTime);
          }
          return a.endTime.localeCompare(b.endTime);
        });

      // Load the playlist for the highest priority schedule
      // Load the playlist for the highest priority schedule
      if (validSchedules.length > 0) {
        const selectedSchedule = validSchedules[0];

        //console.log("Loading playlist for zone:", selectedSchedule.zone);
        //console.log("Selected playlist ID:", selectedSchedule.playlist);
        if (selectedSchedule?.type === "TurnOn") {
          await loadPlaylistForZone(
            selectedSchedule?.zone || "",
            selectedSchedule?.playlist || "",
            selectedSchedule?.type || ""
          );
          setscreenStatusshedule(false);
        } else {
          setscreenStatusshedule(true);
        }

        setCheckSchedule(true); // Set flag if a valid schedule was found
      } else {
        setscreenStatusshedule(false);
        fetchSlides();
        setCheckSchedule(false); // Reset flag if no valid schedule
      }

      //setCheckSchedule(validSchedules.length > 0 ? true : false);
      //console.log("scheduleValid", validSchedules.length > 0);
      console.log("checkSchedule", checkSchedule);
      console.log("Zone1 p", zone1slides);
      console.log("Zone2 p", zone2slides);
      console.log("Zone3 p", zone3slides);
    } catch (error) {
      console.error("Error in getScheduledData:", error);
    }
  };

  const handleCustomRepeat = (
    item: any,
    currentDate: string,
    currentTime: string,
    scheduleStartDate: Date,
    repeatUntilDate: Date | null
  ) => {
    const repeatInterval = item.repeatValue;
    const repeatUntil = repeatUntilDate || new Date(9999, 11, 31);

    while (scheduleStartDate <= repeatUntil) {
      if (currentDate === scheduleStartDate.toLocaleDateString("en-CA")) break;

      switch (item.repeatDays) {
        case "Day":
          scheduleStartDate.setDate(
            scheduleStartDate.getDate() + repeatInterval
          );
          break;
        case "Week":
          scheduleStartDate.setDate(
            scheduleStartDate.getDate() + repeatInterval * 7
          );
          break;
        case "Month":
          scheduleStartDate.setMonth(
            scheduleStartDate.getMonth() + repeatInterval
          );
          break;
        case "Year":
          scheduleStartDate.setFullYear(
            scheduleStartDate.getFullYear() + repeatInterval
          );
          break;
        default:
          return false;
      }
    }

    return (
      currentDate === scheduleStartDate.toLocaleDateString("en-CA") &&
      currentTime >= item.startTime &&
      currentTime <= item.endTime
    );
  };

  const handleDefaultRepeat = (
    item: { repeat: string; startTime: string; endTime: string },
    currentDate: string,
    currentTime: string,
    scheduleStartDate: Date
  ) => {
    const repeatPatterns: Record<string, boolean> = {
      "Daily (Mon-Sun)": true,
      "Every Weekend (Sat-Sun)": [0, 6].includes(new Date().getDay()),
      "Every Weekday (Mon-Fri)": [1, 2, 3, 4, 5].includes(new Date().getDay()),
      Monthly: new Date().getDate() === scheduleStartDate.getDate(),
      Annually:
        new Date().getMonth() === scheduleStartDate.getMonth() &&
        new Date().getDate() === scheduleStartDate.getDate(),
    };

    const isValidRepeat = repeatPatterns[item.repeat];

    return (
      isValidRepeat &&
      currentTime >= item.startTime &&
      currentTime <= item.endTime
    );
  };

  const loadPlaylistForZone = async (
    zone: any,
    playlistId: React.SetStateAction<string>,
    type: any
  ) => {
    try {
      if (type === "TurnOn") {
        const { data: playlist, error } = await supabase
          .from("playlistDetails")
          .select("*")
          .eq("id", playlistId)
          .eq("is_deleted", 0)
          .single();
        if (error) throw error;

        const newSlides = playlist?.playlistImages || [];

        console.log("slides test", newSlides);

        switch (zone) {
          case "zone1":
            if (zone1Id !== playlistId) {
              setZone1slides(newSlides);
              setZone1Id(playlistId);
            }
            break;
          case "zone2":
            if (zone2Id !== playlistId) {
              setZone2slides(newSlides);
              setZone2Id(playlistId);
              console.log("s test");
            }
            break;
          case "zone3":
            if (zone3Id !== playlistId) {
              setZone3slides(newSlides);
              setZone3Id(playlistId);
            }
            break;
          default:
            console.error(`Invalid zone: ${zone}`);
        }
      } else {
        /*const newSlides = [
          {
            url: "/images/A_black_image.jpg",
            title: "background:#000",
            description: "Screen off by schedule!",
            createdAt: new Date().toISOString(),
            duration: 10, // Assuming duration is in seconds or a string
          },
        ];

        switch (zone) {
          case "zone1":
            setZone1slides(newSlides);
            setZone1Id(playlistId);
            break;
          case "zone2":
            setZone2slides(newSlides);
            setZone2Id(playlistId);
            break;
          case "zone3":
            setZone3slides(newSlides);
            setZone3Id(playlistId);
            break;
          default:
            console.error(`Invalid zone: ${zone}`);
        }*/
      }
    } catch (error) {
      console.error(`Error fetching data for ${zone}:`, error);
    }
  };

  //useEffect(() => {}, [id, zone1Id, zone2Id, zone3Id, checkSchedule]);

  const handleRealTimeUpdates = () => {
    // Set up real-time listener for `screenDetails`
    const screenDetailsSubscription = supabase
      .channel("public:screenDetails")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "screenDetails" },
        (payload) => {
          console.log("Change received in screenDetails:", payload);
          fetchSlides(); // Re-fetch the slides when data is updated
        }
      )
      .subscribe();

    // Set up real-time listener for `playlistDetails`
    const playlistDetailsSubscription = supabase
      .channel("public:playlistDetails")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "playlistDetails" },
        (payload) => {
          console.log("Change received in playlistDetails:", payload);
          fetchSlides(); // Re-fetch the playlist when data is updated
        }
      )
      .subscribe();

    // Set up real-time listener for `scheduledContents`
    const scheduledContentsSubscription = supabase
      .channel("public:scheduledContents")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scheduledContents" },
        (payload) => {
          console.log("Change received in scheduledContents:", payload);
          // Re-fetch the schedule when data is updated
          fetchSlides();
          setTimeout(() => {
            getScheduledData();
          }, 1000);
        }
      )
      .subscribe();

    // Error handling: Check for 'errored' state
    if (
      screenDetailsSubscription.state === "errored" ||
      playlistDetailsSubscription.state === "errored" ||
      scheduledContentsSubscription.state === "errored"
    ) {
      console.error("Error subscribing to real-time channels.");
    }

    // Return a cleanup function to unsubscribe on component unmount
    return () => {
      console.log("Unsubscribing from real-time updates");
      supabase.removeChannel(screenDetailsSubscription);
      supabase.removeChannel(playlistDetailsSubscription);
      supabase.removeChannel(scheduledContentsSubscription);
    };
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      getScheduledData();
    }, 5000); // Check every second

    return () => {
      clearInterval(intervalId); // Cleanup the interval when the component is unmounted
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchSlides();
      await getScheduledData();
    };
    fetchData(); // Initial fetch

    /*
    // Start polling every minute
    const idd = setInterval(() => {
      getScheduledData();
    }, 5000); // Poll every 5 seconds

    setIntervalId(idd);

    // Cleanup on component unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
*/
    // Initialize real-time updates
    const cleanup = handleRealTimeUpdates();
    return cleanup; // Unsubscribe from real-time updates on component unmount
  }, [id]); //intervalId

  useEffect(() => {
    if (sliderRef1.current) {
      sliderRef1.current.slickGoTo(currentSlideIndex1);
    }
    if (sliderRef2.current) {
      sliderRef2.current.slickGoTo(currentSlideIndex2);
    }
    if (sliderRef3.current) {
      sliderRef3.current.slickGoTo(currentSlideIndex3);
    }
  }, []); //currentSlideIndex1, currentSlideIndex2, currentSlideIndex3

  const handleBeforeChange1 = (oldIndex1: number, newIndex1: number) => {
    setCurrentSlideIndex1(newIndex1);
  };
  const handleBeforeChange2 = (oldIndex2: number, newIndex2: number) => {
    setCurrentSlideIndex2(newIndex2);
  };
  const handleBeforeChange3 = (oldIndex3: number, newIndex3: number) => {
    setCurrentSlideIndex3(newIndex3);
  };

  const handleSlideClick = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error(`Failed to enable fullscreen mode: ${err.message}`);
        });
      }
    }
  };

  const settings1 = {
    dots: false,
    arrows: false, // Hide navigation arrows
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: zone1slides[currentSlideIndex1]?.duration * 1000 || 5000,
    beforeChange: handleBeforeChange1,
    pauseOnHover: false,
    fade: true, // Adds fade-in transition
    cssEase: "linear", // Specifies the easing function for the transition
  };

  const settings2 = {
    dots: false,
    arrows: false, // Hide navigation arrows
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: zone2slides[currentSlideIndex2]?.duration * 1000 || 5000,
    beforeChange: handleBeforeChange2,
    pauseOnHover: false,
    fade: true, // Adds fade-in transition
    cssEase: "linear", // Specifies the easing function for the transition
  };

  const settings3 = {
    dots: false,
    arrows: false, // Hide navigation arrows
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: zone3slides[currentSlideIndex3]?.duration * 1000 || 5000,
    beforeChange: handleBeforeChange3,
    pauseOnHover: false,
    fade: true, // Adds fade-in transition
    cssEase: "linear", // Specifies the easing function for the transition
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        enterFullScreen();
      }
    };
  });

  const [screenOrient, setscreenOrient] = useState<any>("");
  const [isPortrait, setIsPortrait] = useState(
    window.matchMedia("(orientation: portrait)").matches
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setIsPortrait(window.matchMedia("(orientation: portrait)").matches);
    };

    // Add event listeners
    window
      .matchMedia("(orientation: portrait)")
      .addEventListener("change", handleOrientationChange);
    window
      .matchMedia("(orientation: landscape)")
      .addEventListener("change", handleOrientationChange);

    // Cleanup event listeners on component unmount
    return () => {
      window
        .matchMedia("(orientation: portrait)")
        .removeEventListener("change", handleOrientationChange);
      window
        .matchMedia("(orientation: landscape)")
        .removeEventListener("change", handleOrientationChange);
    };
  }, []);

  const enterFullScreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  // console.log(screenDetails);

  let layoutContent;

  if (screenStatus === false) {
    layoutContent = (
      <div className="h-screen w-screen">
        <div className="w-[100%] h-screen bg-black-500 flex flex-col items-center justify-center text-2xl font-bold">
          <Image
            width={400}
            height={300}
            src="/images/inactive.png"
            alt="inactive"
          />
          <div className="text-center mb-6 mt-6">
            <h1 className="text-bold text-4xl">Service Unavailable</h1>
            <p className="text-xl text-secondary_color mt-2 text-center">
              Please turn on the Screen Status <br /> to continue the service.
            </p>
          </div>
          <p className="font-normal text-center text-lg text-[#232729]">
            For more details reach us @
          </p>
          <p className="text-2xl text-bold text-button_orange mt-1">
            03 8644 5240
          </p>
          <div className="flex justify-center items-center gap-1 mt-2 mb-3">
            <p className="font-medium text-center text-xs text-[#232729]">
              A Product from
            </p>
            <img src="/images/xs-logo.png" alt="logo" />
          </div>
          <p className="font-medium text-center text-xs text-[#232729]">
            All Rights Reserved © 2024
          </p>
        </div>
      </div>
    );
  } else if (screenStatusshedule === true) {
    layoutContent = (
      <div className="h-screen w-screen">
        <div className="w-[100%] bg-black-500 flex flex-col items-center justify-center text-2xl font-bold">
          {layoutType === "Portrait" ? (
            <Image
              width={1080}
              height={1920}
              src="/images/turn-off-schedule-portrait.png"
              alt="inactive portrait"
              className="w-full h-full object-cover"
              onClick={handleSlideClick}
            />
          ) : (
            <Image
              width={1920}
              height={1080}
              src="/images/turn-off-schedule-landscape.png"
              alt="inactive landscape"
              className="w-full h-full object-cover"
              onClick={handleSlideClick}
            />
          )}
        </div>
      </div>
    );
  } else if (isPlaying === false) {
    layoutContent = (
      <div className="h-screen w-screen">
        <div className="w-[100%] h-screen bg-black-500 flex flex-col items-center justify-center text-2xl font-bold">
          <Image
            width={400}
            height={300}
            src="/images/duplicate-screen.png"
            alt="inactive"
          />
          <div className="text-center mb-6 mt-6">
            <h1 className="text-bold text-4xl">Screen is already playing!</h1>
            <p className="text-xl text-secondary_color mt-2 text-center">
              Please turn off the screen that already playing <br /> to continue
              the service.
            </p>
          </div>
          <p className="font-normal text-center text-lg text-[#232729]">
            For more details reach us @
          </p>
          <p className="text-2xl text-bold text-button_orange mt-1">
            03 8644 5240
          </p>
          <div className="flex justify-center items-center gap-1 mt-2 mb-3">
            <p className="font-medium text-center text-xs text-[#232729]">
              A Product from
            </p>
            <img src="/images/xs-logo.png" alt="logo" />
          </div>
          <p className="font-medium text-center text-xs text-[#232729]">
            All Rights Reserved © 2024
          </p>
        </div>
      </div>
    );
  } else {
    // if (screenStatus === true && isPlaying === true) {
    if (
      layoutZone &&
      layoutZone.zoneCount === 1 &&
      layoutZone.name === "Portrait Layout 01"
    ) {
      layoutContent = (
        <div className="h-screen w-screen flex">
          <div className="h-[1920px] w-[1080px] overflow-hidden">
            <Slider {...settings1} ref={sliderRef1}>
              {zone1slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-full relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-4).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-full object-cover"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      );
    } else if (
      layoutZone &&
      layoutZone.zoneCount === 3 &&
      layoutZone.name === "Portrait Layout 02"
    ) {
      layoutContent = (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
          <div
            className={`${
              isPortrait
                ? "h-[56.25%] w-full overflow-visible"
                : "h-[56.25%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings1} ref={sliderRef1}>
              {zone1slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[56.25%] cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-4).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[56.6vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[56.6vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          <div
            className={`${
              isPortrait
                ? "h-[21.87%] w-full overflow-visible"
                : "h-[21.87%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings2} ref={sliderRef2}>
              {zone2slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[21.87%] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-3).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[22vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[22vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          <div
            className={`${
              isPortrait
                ? "h-[21.87%] w-full overflow-visible"
                : "h-[21.87%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings3} ref={sliderRef3}>
              {zone3slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[21.87%] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-4).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[22vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[22vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      );
    } else if (
      layoutZone &&
      layoutZone.zoneCount === 3 &&
      layoutZone.name === "Portrait Layout 03"
    ) {
      layoutContent = (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
          <div
            className={`${
              isPortrait
                ? "h-[56.25%] w-full overflow-visible"
                : "h-[56.25%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings1} ref={sliderRef1}>
              {zone1slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[56.25%] cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-4).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[56.6vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[56.6vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          <div
            className={`${
              isPortrait
                ? "h-[10.41%] w-full overflow-visible"
                : "h-[10.41%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings2} ref={sliderRef2}>
              {zone2slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[10.41%] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-3).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[10.5vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[10.5vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          <div
            className={`${
              isPortrait
                ? "h-[33.33%] w-full overflow-visible"
                : "h-[33.33%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings3} ref={sliderRef3}>
              {zone3slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[33.33%] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-4).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[33.33vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[33.33vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      );
    } else if (
      layoutZone &&
      layoutZone.zoneCount === 3 &&
      layoutZone.name === "Portrait Layout 04"
    ) {
      layoutContent = (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
          <div
            className={`${
              isPortrait
                ? "h-[10.41%] w-full overflow-visible"
                : "h-[10.41%] w-[1080px] overflow-visible"
            }`}
          >
            {zone1Check ? (
              <Slider {...settings1} ref={sliderRef1}>
                {zone1slides.map((slide, index) => (
                  <div
                    key={index}
                    className="w-full h-[10.41%] relative cursor-pointer outline-none"
                    onClick={handleSlideClick}
                  >
                    {slide.url.slice(-3).toLowerCase() === "jpg" ||
                    slide.url.slice(-3).toLowerCase() === "jpeg" ||
                    slide.url.slice(-3).toLowerCase() === "png" ? (
                      <img
                        src={slide.url}
                        alt={slide.title}
                        className="w-full h-[10.5vh] object-contain"
                      />
                    ) : (
                      <video
                        src={slide.url}
                        className="w-full h-[10.5vh] object-contain"
                        controls={false}
                        autoPlay
                        loop
                        muted
                        // typeof="video/mp4"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                      {/* <h2>{slide.title}</h2> */}
                      <p>{slide.description}</p>
                    </div>
                  </div>
                ))}
              </Slider>
            ) : (
              <p>No slides found</p>
            )}
          </div>
          <div
            className={`${
              isPortrait
                ? "h-[56.25%] w-full overflow-visible"
                : "h-[56.25%] w-[1080px] overflow-visible"
            }`}
          >
            {zone2Check ? (
              <Slider {...settings2} ref={sliderRef2}>
                {zone2slides.map((slide, index) => (
                  <div
                    key={index}
                    className="w-full h-[56.25%] relative cursor-pointer outline-none"
                    onClick={handleSlideClick}
                  >
                    {slide.url.slice(-3).toLowerCase() === "jpg" ||
                    slide.url.slice(-4).toLowerCase() === "jpeg" ||
                    slide.url.slice(-3).toLowerCase() === "png" ? (
                      <img
                        src={slide.url}
                        alt={slide.title}
                        className="w-full h-[56.6vh] object-contain"
                      />
                    ) : (
                      <video
                        src={slide.url}
                        className="w-full h-[56.6vh] object-contain"
                        controls={false}
                        autoPlay
                        loop
                        muted
                        // typeof="video/mp4"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                      {/* <h2>{slide.title}</h2> */}
                      <p>{slide.description}</p>
                    </div>
                  </div>
                ))}
              </Slider>
            ) : (
              <p>No slides found</p>
            )}
          </div>

          <div
            className={`${
              isPortrait
                ? "h-[33.33%] w-full overflow-visible"
                : "h-[33.33%] w-[1080px] overflow-visible"
            }`}
          >
            {zone3Check ? (
              <Slider {...settings3} ref={sliderRef3}>
                {zone3slides.map((slide, index) => (
                  <div
                    key={index}
                    className="w-full h-[33.33%] relative cursor-pointer outline-none"
                    onClick={handleSlideClick}
                  >
                    {slide.url.slice(-3).toLowerCase() === "jpg" ||
                    slide.url.slice(-4).toLowerCase() === "jpeg" ||
                    slide.url.slice(-3).toLowerCase() === "png" ? (
                      <img
                        src={slide.url}
                        alt={slide.title}
                        className="w-full h-[33.33vh] object-contain"
                      />
                    ) : (
                      <video
                        src={slide.url}
                        className="w-full h-[33.33vh] object-contain"
                        controls={false}
                        autoPlay
                        loop
                        muted
                        // typeof="video/mp4"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                      {/* <h2>{slide.title}</h2> */}
                      <p>{slide.description}</p>
                    </div>
                  </div>
                ))}
              </Slider>
            ) : (
              <p>No slides found</p>
            )}
          </div>
        </div>
      );
    } else if (
      layoutZone &&
      layoutZone.zoneCount === 3 &&
      layoutZone.name === "Portrait Layout 05"
    ) {
      layoutContent = (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
          <div
            className={`${
              isPortrait
                ? "h-[10.41%] w-full overflow-visible"
                : "h-[10.41%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings1} ref={sliderRef1}>
              {zone1slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[10.41%] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-3).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[10.5vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[10.5vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
          <div
            className={`${
              isPortrait
                ? "h-[33.33%] w-full overflow-visible"
                : "h-[33.33%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings2} ref={sliderRef2}>
              {zone2slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[33.33%] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-4).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[33.33vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[33.33vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
          <div
            className={`${
              isPortrait
                ? "h-[56.25%] w-full overflow-visible"
                : "h-[56.25%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings3} ref={sliderRef3}>
              {zone3slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[56.25%] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-4).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[56.6vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[56.6vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      );
    } else if (
      layoutZone &&
      layoutZone.zoneCount === 2 &&
      layoutZone.name === "Portrait Layout 06"
    ) {
      layoutContent = (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
          <div
            className={`${
              isPortrait
                ? "h-[66.665%] w-full overflow-visible"
                : "h-[66.665%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings1} ref={sliderRef1}>
              {zone1slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[66.665%] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-3).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[66.665vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[66.665vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
          <div
            className={`${
              isPortrait
                ? "h-[33.33%] w-full overflow-visible"
                : "h-[33.33%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings2} ref={sliderRef2}>
              {zone2slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[33.33%] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-4).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[33.33vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[33.33vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      );
    } else if (
      layoutZone &&
      layoutZone.zoneCount === 2 &&
      layoutZone.name === "Portrait Layout 07"
    ) {
      layoutContent = (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
          <div
            className={`${
              isPortrait
                ? "h-[33.33%] w-full overflow-visible"
                : "h-[33.33%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings1} ref={sliderRef1}>
              {zone1slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[33.33%] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-4).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[33.33vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[33.33vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
          <div
            className={`${
              isPortrait
                ? "h-[66.665%] w-full overflow-visible"
                : "h-[66.665%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings2} ref={sliderRef2}>
              {zone2slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[66.665%] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-3).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[66.665vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[66.665vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      );
    } else if (
      layoutZone &&
      layoutZone.zoneCount === 2 &&
      layoutZone.name === "Portrait Layout 08"
    ) {
      layoutContent = (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
          <div
            className={`${
              isPortrait
                ? "h-[89.584%] w-full overflow-visible"
                : "h-[89.584%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings1} ref={sliderRef1}>
              {zone1slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[89.584%] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-4).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[90vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[90vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
          <div
            className={`${
              isPortrait
                ? "h-[10.41%] w-full overflow-visible"
                : "h-[10.41%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings2} ref={sliderRef2}>
              {zone2slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[10.41%] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-3).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[10.5vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[10.5vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      );
    } else if (
      layoutZone &&
      layoutZone.zoneCount === 2 &&
      layoutZone.name === "Portrait Layout 09"
    ) {
      layoutContent = (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
          <div
            className={`${
              isPortrait
                ? "h-[10.41%] w-full overflow-visible"
                : "h-[10.41%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings1} ref={sliderRef1}>
              {zone1slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[10.41%] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-3).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[10.5vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[10.5vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
          <div
            className={`${
              isPortrait
                ? "h-[89.584%] w-full overflow-visible"
                : "h-[89.584%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings2} ref={sliderRef2}>
              {zone2slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[89.584%] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-4).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[90vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[90vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      );
    } else if (
      layoutZone &&
      layoutZone.zoneCount === 2 &&
      layoutZone.name === "Portrait Layout 10"
    ) {
      layoutContent = (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
          <div
            className={`${
              isPortrait
                ? "h-[50%] w-full overflow-visible"
                : "h-[50%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings1} ref={sliderRef1}>
              {zone1slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[50%] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-3).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[50vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[50vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
          <div
            className={`${
              isPortrait
                ? "h-[50%] w-full overflow-visible"
                : "h-[50%] w-[1080px] overflow-visible"
            }`}
          >
            <Slider {...settings2} ref={sliderRef2}>
              {zone2slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[50%] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-4).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-[50vh] object-contain"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-[50vh] object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      );
    } else if (
      layoutZone &&
      layoutZone.zoneCount === 1 &&
      layoutZone.name === "Landscape Layout 01"
    ) {
      layoutContent = (
        <div className="h-screen w-screen flex items-center justify-center bg-black">
          <div
            className={`${
              !isPortrait
                ? "h-full w-full overflow-visible"
                : "h-full w-[1080px] max-w-full overflow-visible"
            }`}
          >
            <Slider {...settings1} ref={sliderRef1}>
              {zone1slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full h-[100vh] relative cursor-pointer outline-none"
                  onClick={handleSlideClick}
                >
                  {slide.url.slice(-3).toLowerCase() === "jpg" ||
                  slide.url.slice(-4).toLowerCase() === "jpeg" ||
                  slide.url.slice(-3).toLowerCase() === "png" ? (
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-full object-contain absolute"
                    />
                  ) : (
                    <video
                      src={slide.url}
                      className="w-full h-full object-contain absolute"
                      controls={false}
                      autoPlay
                      loop
                      muted
                      // typeof="video/mp4"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                    {/* <h2>{slide.title}</h2> */}
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      );
    } else if (
      layoutZone &&
      layoutZone.zoneCount === 3 &&
      layoutZone.name === "Landscape Layout 02"
    ) {
      layoutContent = (
        <div className="h-screen w-screen flex flex-wrap bg-black">
          {isPortrait ? (
            <div className="w-full h-full flex items-center justify-center text-white">
              {/* <p className="text-white">Please rotate your device</p> */}
              <div className="flex flex-wrap w-full h-[505px]">
                <div className="w-[81.510%] h-[81.481%]">
                  <Slider
                    {...settings1}
                    ref={sliderRef1}
                    className="w-full h-full"
                  >
                    {zone1slides.map((slide, index) => (
                      <div
                        key={index}
                        className="w-full h-full relative cursor-pointer outline-none"
                        onClick={handleSlideClick}
                      >
                        {slide.url.slice(-3).toLowerCase() === "jpg" ||
                        slide.url.slice(-4).toLowerCase() === "jpeg" ||
                        slide.url.slice(-3).toLowerCase() === "png" ? (
                          <img
                            src={slide.url}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={slide.url}
                            className="w-full h-full object-cover"
                            controls={false}
                            autoPlay
                            loop
                            muted
                          />
                        )}
                      </div>
                    ))}
                  </Slider>
                </div>
                <div className="w-[18.489%] h-[81.481%]">
                  {zone2Check ? (
                    <Slider
                      {...settings2}
                      ref={sliderRef2}
                      className="w-full h-full"
                    >
                      {zone2slides.map((slide, index) => (
                        <div
                          key={index}
                          className="w-full h-full relative cursor-pointer outline-none"
                          onClick={handleSlideClick}
                        >
                          {slide.url.slice(-3).toLowerCase() === "jpg" ||
                          slide.url.slice(-3).toLowerCase() === "jpeg" ||
                          slide.url.slice(-3).toLowerCase() === "png" ? (
                            <img
                              src={slide.url}
                              alt={slide.title}
                              className="w-full h-full object-cover "
                            />
                          ) : (
                            <video
                              src={slide.url}
                              className="w-full h-full object-cover "
                              controls={false}
                              autoPlay
                              loop
                              muted
                            />
                          )}
                        </div>
                      ))}
                    </Slider>
                  ) : (
                    <p>No slides available</p>
                  )}
                </div>
                <div className="w-full h-[18.518%]">
                  {zone3Check ? (
                    <Slider
                      {...settings3}
                      ref={sliderRef3}
                      className="w-full h-full"
                    >
                      {zone3slides.map((slide, index) => (
                        <div
                          key={index}
                          className="w-full h-full relative cursor-pointer outline-none"
                          onClick={handleSlideClick}
                        >
                          {slide.url.slice(-3).toLowerCase() === "jpg" ||
                          slide.url.slice(-4).toLowerCase() === "jpeg" ||
                          slide.url.slice(-3).toLowerCase() === "png" ? (
                            <img
                              src={slide.url}
                              alt={slide.title}
                              className="w-full h-full object-cover "
                            />
                          ) : (
                            <video
                              src={slide.url}
                              className="w-full h-full object-cover"
                              controls={false}
                              autoPlay
                              loop
                              muted
                            />
                          )}
                        </div>
                      ))}
                    </Slider>
                  ) : (
                    <p>No slides available</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div
                // className={`${
                //   isPortrait
                //     ? "h-[81.481%] w-[1080px] overflow-hidden"
                //     : "w-[81.510%] h-[81.481%] flex overflow-hidden"
                // }`}
                className={`w-[81.510%] h-[81.481%] flex overflow-hidden`}
              >
                <Slider
                  {...settings1}
                  ref={sliderRef1}
                  className="w-full h-full"
                >
                  {zone1slides.map((slide, index) => (
                    <div
                      key={index}
                      className="w-full h-full relative cursor-pointer outline-none"
                      onClick={handleSlideClick}
                    >
                      {slide.url.slice(-3).toLowerCase() === "jpg" ||
                      slide.url.slice(-4).toLowerCase() === "jpeg" ||
                      slide.url.slice(-3).toLowerCase() === "png" ? (
                        <img
                          src={slide.url}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={slide.url}
                          className="w-full h-full object-cover"
                          controls={false}
                          autoPlay
                          loop
                          muted
                          // typeof="video/mp4"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                        {/* <h2>{slide.title}</h2> */}
                        <p>{slide.description}</p>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>

              <div className={`w-[18.489%] h-[81.481%] overflow-hidden`}>
                {zone2Check ? (
                  <Slider
                    {...settings2}
                    ref={sliderRef2}
                    className="w-full h-full"
                  >
                    {zone2slides.map((slide, index) => (
                      <div
                        key={index}
                        className="w-full h-full relative cursor-pointer outline-none"
                        onClick={handleSlideClick}
                      >
                        {slide.url.slice(-3).toLowerCase() === "jpg" ||
                        slide.url.slice(-3).toLowerCase() === "jpeg" ||
                        slide.url.slice(-3).toLowerCase() === "png" ? (
                          <img
                            src={slide.url}
                            alt={slide.title}
                            className="w-full h-full object-cover "
                          />
                        ) : (
                          <video
                            src={slide.url}
                            className="w-full h-full object-cover "
                            controls={false}
                            autoPlay
                            loop
                            muted
                            // typeof="video/mp4"
                          />
                        )}
                        <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                          {/* <h2>{slide.title}</h2> */}
                          <p>{slide.description}</p>
                        </div>
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <p>No slides available</p>
                )}
              </div>

              <div className={`w-full h-[18.518%] flex overflow-hidden`}>
                {zone3Check ? (
                  <Slider
                    {...settings3}
                    ref={sliderRef3}
                    className="w-full h-full"
                  >
                    {zone3slides.map((slide, index) => (
                      <div
                        key={index}
                        className="w-full h-full relative cursor-pointer outline-none"
                        onClick={handleSlideClick}
                      >
                        {slide.url.slice(-3).toLowerCase() === "jpg" ||
                        slide.url.slice(-4).toLowerCase() === "jpeg" ||
                        slide.url.slice(-3).toLowerCase() === "png" ? (
                          <img
                            src={slide.url}
                            alt={slide.title}
                            className="w-full h-full object-cover "
                          />
                        ) : (
                          <video
                            src={slide.url}
                            className="w-full h-full object-cover"
                            controls={false}
                            autoPlay
                            loop
                            muted
                            // typeof="video/mp4"
                          />
                        )}
                        <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                          {/* <h2>{slide.title}</h2> */}
                          <p>{slide.description}</p>
                        </div>
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <p>No slides available</p>
                )}
              </div>
            </>
          )}
        </div>
      );
    } else if (
      layoutZone &&
      layoutZone.zoneCount === 3 &&
      layoutZone.name === "Landscape Layout 03"
    ) {
      layoutContent = (
        <div
          className="h-screen w-screen flex flex-wrap"
          style={{ background: "#000" }}
        >
          {isPortrait ? (
            <div className="w-full h-full flex items-center justify-center text-white">
              {/* <p className="text-white">Please rotate your device</p> */}
              <div className="flex flex-wrap w-full h-[505px]">
                <div className="w-[18.489%] h-[81.481%]">
                  <Slider
                    {...settings1}
                    ref={sliderRef1}
                    className="w-full h-full"
                  >
                    {zone1slides.map((slide, index) => (
                      <div
                        key={index}
                        className="w-full h-full relative cursor-pointer outline-none"
                        onClick={handleSlideClick}
                      >
                        {slide.url.slice(-3).toLowerCase() === "jpg" ||
                        slide.url.slice(-3).toLowerCase() === "jpeg" ||
                        slide.url.slice(-3).toLowerCase() === "png" ? (
                          <img
                            src={slide.url}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={slide.url}
                            className="w-full h-full object-cover"
                            controls={false}
                            autoPlay
                            loop
                            muted
                            // typeof="video/mp4"
                          />
                        )}
                        <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                          {/* <h2>{slide.title}</h2> */}
                          <p>{slide.description}</p>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
                <div className="w-[81.510%] h-[81.481%]">
                  <Slider
                    {...settings2}
                    ref={sliderRef2}
                    className="w-full h-full"
                  >
                    {zone2slides.map((slide, index) => (
                      <div
                        key={index}
                        className="w-full h-full relative cursor-pointer outline-none"
                        onClick={handleSlideClick}
                      >
                        {slide.url.slice(-3).toLowerCase() === "jpg" ||
                        slide.url.slice(-4).toLowerCase() === "jpeg" ||
                        slide.url.slice(-3).toLowerCase() === "png" ? (
                          <img
                            src={slide.url}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={slide.url}
                            className="w-full h-full object-cover"
                            controls={false}
                            autoPlay
                            loop
                            muted
                            // typeof="video/mp4"
                          />
                        )}
                        <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                          {/* <h2>{slide.title}</h2> */}
                          <p>{slide.description}</p>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
                <div className="w-full h-[18.518%]">
                  <Slider
                    {...settings3}
                    ref={sliderRef3}
                    className="w-full h-full"
                  >
                    {zone3slides.map((slide, index) => (
                      <div
                        key={index}
                        className="w-full h-full relative cursor-pointer outline-none"
                        onClick={handleSlideClick}
                      >
                        {slide.url.slice(-3).toLowerCase() === "jpg" ||
                        slide.url.slice(-4).toLowerCase() === "jpeg" ||
                        slide.url.slice(-3).toLowerCase() === "png" ? (
                          <img
                            src={slide.url}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={slide.url}
                            className="w-full h-full object-cover"
                            controls={false}
                            autoPlay
                            loop
                            muted
                            // typeof="video/mp4"
                          />
                        )}
                        <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                          {/* <h2>{slide.title}</h2> */}
                          <p>{slide.description}</p>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={`w-[18.489%] h-[81.481%] flex overflow-hidden`}>
                <Slider
                  {...settings1}
                  ref={sliderRef1}
                  className="w-full h-full"
                >
                  {zone1slides.map((slide, index) => (
                    <div
                      key={index}
                      className="w-full h-full relative cursor-pointer outline-none"
                      onClick={handleSlideClick}
                    >
                      {slide.url.slice(-3).toLowerCase() === "jpg" ||
                      slide.url.slice(-3).toLowerCase() === "jpeg" ||
                      slide.url.slice(-3).toLowerCase() === "png" ? (
                        <img
                          src={slide.url}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={slide.url}
                          className="w-full h-full object-cover"
                          controls={false}
                          autoPlay
                          loop
                          muted
                          // typeof="video/mp4"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                        {/* <h2>{slide.title}</h2> */}
                        <p>{slide.description}</p>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>

              <div className={`w-[81.510%] h-[81.481%] flex overflow-hidden`}>
                <Slider
                  {...settings2}
                  ref={sliderRef2}
                  className="w-full h-full"
                >
                  {zone2slides.map((slide, index) => (
                    <div
                      key={index}
                      className="w-full h-full relative cursor-pointer outline-none"
                      onClick={handleSlideClick}
                    >
                      {slide.url.slice(-3).toLowerCase() === "jpg" ||
                      slide.url.slice(-4).toLowerCase() === "jpeg" ||
                      slide.url.slice(-3).toLowerCase() === "png" ? (
                        <img
                          src={slide.url}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={slide.url}
                          className="w-full h-full object-cover"
                          controls={false}
                          autoPlay
                          loop
                          muted
                          // typeof="video/mp4"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                        {/* <h2>{slide.title}</h2> */}
                        <p>{slide.description}</p>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>

              <div className={`w-full h-[18.518%] flex overflow-hidden`}>
                <Slider
                  {...settings3}
                  ref={sliderRef3}
                  className="w-full h-full"
                >
                  {zone3slides.map((slide, index) => (
                    <div
                      key={index}
                      className="w-full h-full relative cursor-pointer outline-none"
                      onClick={handleSlideClick}
                    >
                      {slide.url.slice(-3).toLowerCase() === "jpg" ||
                      slide.url.slice(-4).toLowerCase() === "jpeg" ||
                      slide.url.slice(-3).toLowerCase() === "png" ? (
                        <img
                          src={slide.url}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={slide.url}
                          className="w-full h-full object-cover"
                          controls={false}
                          autoPlay
                          loop
                          muted
                          // typeof="video/mp4"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                        {/* <h2>{slide.title}</h2> */}
                        <p>{slide.description}</p>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            </>
          )}
        </div>
      );
    } else if (
      layoutZone &&
      layoutZone.zoneCount === 2 &&
      layoutZone.name === "Landscape Layout 04"
    ) {
      layoutContent = (
        <div
          className="h-screen w-screen flex flex-wrap"
          style={{ background: "#000" }}
        >
          {isPortrait ? (
            <div className="w-full h-full flex items-center justify-center text-white">
              {/* <p className="text-white">Please rotate your device</p> */}
              <div className="flex flex-wrap w-full h-[505px]">
                <div className="w-[56.25%] h-full">
                  <Slider
                    {...settings1}
                    ref={sliderRef1}
                    className="w-full h-full"
                  >
                    {zone1slides.map((slide, index) => (
                      <div
                        key={index}
                        className="w-full h-full relative cursor-pointer outline-none"
                        onClick={handleSlideClick}
                      >
                        {slide.url.slice(-3).toLowerCase() === "jpg" ||
                        slide.url.slice(-3).toLowerCase() === "jpeg" ||
                        slide.url.slice(-3).toLowerCase() === "png" ? (
                          <img
                            src={slide.url}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={slide.url}
                            className="w-full h-full object-cover"
                            controls={false}
                            autoPlay
                            loop
                            muted
                            // typeof="video/mp4"
                          />
                        )}
                        <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                          {/* <h2>{slide.title}</h2> */}
                          <p>{slide.description}</p>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
                <div className="w-[43.75%] h-full">
                  <Slider
                    {...settings2}
                    ref={sliderRef2}
                    className="w-full h-full"
                  >
                    {zone2slides.map((slide, index) => (
                      <div
                        key={index}
                        className="w-full h-full relative cursor-pointer outline-none"
                        onClick={handleSlideClick}
                      >
                        {slide.url.slice(-3).toLowerCase() === "jpg" ||
                        slide.url.slice(-4).toLowerCase() === "jpeg" ||
                        slide.url.slice(-3).toLowerCase() === "png" ? (
                          <img
                            src={slide.url}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={slide.url}
                            className="w-full h-full object-cover"
                            controls={false}
                            autoPlay
                            loop
                            muted
                            // typeof="video/mp4"
                          />
                        )}
                        <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                          {/* <h2>{slide.title}</h2> */}
                          <p>{slide.description}</p>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={`w-[56.25%] h-full flex overflow-hidden`}>
                <Slider
                  {...settings1}
                  ref={sliderRef1}
                  className="w-full h-full"
                >
                  {zone1slides.map((slide, index) => (
                    <div
                      key={index}
                      className="w-full h-full relative cursor-pointer outline-none"
                      onClick={handleSlideClick}
                    >
                      {slide.url.slice(-3).toLowerCase() === "jpg" ||
                      slide.url.slice(-3).toLowerCase() === "jpeg" ||
                      slide.url.slice(-3).toLowerCase() === "png" ? (
                        <img
                          src={slide.url}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={slide.url}
                          className="w-full h-full object-cover"
                          controls={false}
                          autoPlay
                          loop
                          muted
                          // typeof="video/mp4"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                        {/* <h2>{slide.title}</h2> */}
                        <p>{slide.description}</p>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>

              <div className={`w-[43.75%] h-full flex overflow-hidden`}>
                <Slider
                  {...settings2}
                  ref={sliderRef2}
                  className="w-full h-full"
                >
                  {zone2slides.map((slide, index) => (
                    <div
                      key={index}
                      className="w-full h-full relative cursor-pointer outline-none"
                      onClick={handleSlideClick}
                    >
                      {slide.url.slice(-3).toLowerCase() === "jpg" ||
                      slide.url.slice(-4).toLowerCase() === "jpeg" ||
                      slide.url.slice(-3).toLowerCase() === "png" ? (
                        <img
                          src={slide.url}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={slide.url}
                          className="w-full h-full object-cover"
                          controls={false}
                          autoPlay
                          loop
                          muted
                          // typeof="video/mp4"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                        {/* <h2>{slide.title}</h2> */}
                        <p>{slide.description}</p>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            </>
          )}
        </div>
      );
    } else if (
      layoutZone &&
      layoutZone.zoneCount === 2 &&
      layoutZone.name === "Landscape Layout 05"
    ) {
      layoutContent = (
        <div
          className="h-screen w-screen flex flex-wrap"
          style={{ background: "#000" }}
        >
          {isPortrait ? (
            <div className="w-full h-full flex items-center justify-center text-white">
              {/* <p className="text-white">Please rotate your device</p> */}
              <div className="flex flex-wrap w-full h-[505px]">
                <div className="w-[43.75%] h-full">
                  <Slider
                    {...settings1}
                    ref={sliderRef1}
                    className="w-full h-full"
                  >
                    {zone1slides.map((slide, index) => (
                      <div
                        key={index}
                        className="w-full h-full relative cursor-pointer outline-none"
                        onClick={handleSlideClick}
                      >
                        {slide.url.slice(-3).toLowerCase() === "jpg" ||
                        slide.url.slice(-4).toLowerCase() === "jpeg" ||
                        slide.url.slice(-3).toLowerCase() === "png" ? (
                          <img
                            src={slide.url}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={slide.url}
                            className="w-full h-full object-cover"
                            controls={false}
                            autoPlay
                            loop
                            muted
                            // typeof="video/mp4"
                          />
                        )}
                        <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                          {/* <h2>{slide.title}</h2> */}
                          <p>{slide.description}</p>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
                <div className="w-[56.25%] h-full">
                  <Slider
                    {...settings2}
                    ref={sliderRef2}
                    className="w-full h-full"
                  >
                    {zone2slides.map((slide, index) => (
                      <div
                        key={index}
                        className="w-full h-full relative cursor-pointer outline-none"
                        onClick={handleSlideClick}
                      >
                        {slide.url.slice(-3).toLowerCase() === "jpg" ||
                        slide.url.slice(-3).toLowerCase() === "jpeg" ||
                        slide.url.slice(-3).toLowerCase() === "png" ? (
                          <img
                            src={slide.url}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={slide.url}
                            className="w-full h-full object-cover"
                            controls={false}
                            autoPlay
                            loop
                            muted
                            // typeof="video/mp4"
                          />
                        )}
                        <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                          {/* <h2>{slide.title}</h2> */}
                          <p>{slide.description}</p>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={`w-[43.75%] h-full flex overflow-hidden`}>
                <Slider
                  {...settings1}
                  ref={sliderRef1}
                  className="w-full h-full"
                >
                  {zone1slides.map((slide, index) => (
                    <div
                      key={index}
                      className="w-full h-full relative cursor-pointer outline-none"
                      onClick={handleSlideClick}
                    >
                      {slide.url.slice(-3).toLowerCase() === "jpg" ||
                      slide.url.slice(-4).toLowerCase() === "jpeg" ||
                      slide.url.slice(-3).toLowerCase() === "png" ? (
                        <img
                          src={slide.url}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={slide.url}
                          className="w-full h-full object-cover"
                          controls={false}
                          autoPlay
                          loop
                          muted
                          // typeof="video/mp4"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                        {/* <h2>{slide.title}</h2> */}
                        <p>{slide.description}</p>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
              <div className={`w-[56.25%] h-full flex overflow-hidden`}>
                <Slider
                  {...settings2}
                  ref={sliderRef2}
                  className="w-full h-full"
                >
                  {zone2slides.map((slide, index) => (
                    <div
                      key={index}
                      className="w-full h-full relative cursor-pointer outline-none"
                      onClick={handleSlideClick}
                    >
                      {slide.url.slice(-3).toLowerCase() === "jpg" ||
                      slide.url.slice(-3).toLowerCase() === "jpeg" ||
                      slide.url.slice(-3).toLowerCase() === "png" ? (
                        <img
                          src={slide.url}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={slide.url}
                          className="w-full h-full object-cover"
                          controls={false}
                          autoPlay
                          loop
                          muted
                          // typeof="video/mp4"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                        {/* <h2>{slide.title}</h2> */}
                        <p>{slide.description}</p>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            </>
          )}
        </div>
      );
    } else if (
      layoutZone &&
      layoutZone.zoneCount === 2 &&
      layoutZone.name === "Landscape Layout 06"
    ) {
      layoutContent = (
        <div
          className="h-screen w-screen flex flex-wrap"
          style={{ background: "#000" }}
        >
          {isPortrait ? (
            <>
              <div className="w-full h-full flex items-center justify-center text-white">
                {/* <p className="text-white">Please rotate your device</p> */}
                <div className="flex flex-wrap w-full h-[505px]">
                  <div className="w-[50%] h-full">
                    <Slider
                      {...settings1}
                      ref={sliderRef1}
                      className="w-full h-full"
                    >
                      {zone1slides.map((slide, index) => (
                        <div
                          key={index}
                          className="w-full h-full relative cursor-pointer outline-none"
                          onClick={handleSlideClick}
                        >
                          {slide.url.slice(-3).toLowerCase() === "jpg" ||
                          slide.url.slice(-4).toLowerCase() === "jpeg" ||
                          slide.url.slice(-3).toLowerCase() === "png" ? (
                            <img
                              src={slide.url}
                              alt={slide.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={slide.url}
                              className="w-full h-full object-cover"
                              controls={false}
                              autoPlay
                              loop
                              muted
                              // typeof="video/mp4"
                            />
                          )}
                          <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                            {/* <h2>{slide.title}</h2> */}
                            <p>{slide.description}</p>
                          </div>
                        </div>
                      ))}
                    </Slider>
                  </div>
                  <div className="w-[50%] h-full">
                    <Slider
                      {...settings2}
                      ref={sliderRef2}
                      className="w-full h-full"
                    >
                      {zone2slides.map((slide, index) => (
                        <div
                          key={index}
                          className="w-full h-full relative cursor-pointer outline-none"
                          onClick={handleSlideClick}
                        >
                          {slide.url.slice(-3).toLowerCase() === "jpg" ||
                          slide.url.slice(-3).toLowerCase() === "jpeg" ||
                          slide.url.slice(-3).toLowerCase() === "png" ? (
                            <img
                              src={slide.url}
                              alt={slide.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={slide.url}
                              className="w-full h-full object-cover"
                              controls={false}
                              autoPlay
                              loop
                              muted
                              // typeof="video/mp4"
                            />
                          )}
                          <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                            {/* <h2>{slide.title}</h2> */}
                            <p>{slide.description}</p>
                          </div>
                        </div>
                      ))}
                    </Slider>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={`w-[50%] h-full flex overflow-hidden`}>
                <Slider
                  {...settings1}
                  ref={sliderRef1}
                  className="w-full h-full"
                >
                  {zone1slides.map((slide, index) => (
                    <div
                      key={index}
                      className="w-full h-full relative cursor-pointer outline-none"
                      onClick={handleSlideClick}
                    >
                      {slide.url.slice(-3).toLowerCase() === "jpg" ||
                      slide.url.slice(-4).toLowerCase() === "jpeg" ||
                      slide.url.slice(-3).toLowerCase() === "png" ? (
                        <img
                          src={slide.url}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={slide.url}
                          className="w-full h-full object-cover"
                          controls={false}
                          autoPlay
                          loop
                          muted
                          // typeof="video/mp4"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                        {/* <h2>{slide.title}</h2> */}
                        <p>{slide.description}</p>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
              <div className={`w-[50%] h-full flex overflow-hidden`}>
                <Slider
                  {...settings2}
                  ref={sliderRef2}
                  className="w-full h-full"
                >
                  {zone2slides.map((slide, index) => (
                    <div
                      key={index}
                      className="w-full h-full relative cursor-pointer outline-none"
                      onClick={handleSlideClick}
                    >
                      {slide.url.slice(-3).toLowerCase() === "jpg" ||
                      slide.url.slice(-3).toLowerCase() === "jpeg" ||
                      slide.url.slice(-3).toLowerCase() === "png" ? (
                        <img
                          src={slide.url}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={slide.url}
                          className="w-full h-full object-cover"
                          controls={false}
                          autoPlay
                          loop
                          muted
                          // typeof="video/mp4"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 p-0 bg-black bg-opacity-50 text-white">
                        {/* <h2>{slide.title}</h2> */}
                        <p>{slide.description}</p>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            </>
          )}
        </div>
      );
    } else {
      layoutContent = (
        <div className="h-screen w-screen">
          <div className="w-[100%] bg-black-500 flex items-center justify-center"></div>
        </div>
      );
    }
    // }
  }

  return (
    // <PlayerPage
    //   layoutType={layoutType}
    //   layoutZone={layoutZone}
    //   slides={slides}
    //   setSlides={setSlides}
    //   sliderSettings={settings}
    //   sliderRef={sliderRef}
    //   containerRef={containerRef}
    //   handleSlideClick={handleSlideClick}
    //   currentSlideIndex={currentSlideIndex}
    //   handleBeforeChange={handleBeforeChange}
    //   checkSchedule={checkSchedule}
    //   setCheckSchedule={setCheckSchedule}
    //   id={id}
    // />
    <Box sx={{ width: "100%" }} ref={containerRef}>
      {/* {checkSchedule ? (
      layoutContent || <p>No layout available</p>  
      ) : (
        <p>No layout available</p>
      )} */}
      {layoutContent || <p>No layout available</p>}
    </Box>
  );
};

export default DynamicSlider;
