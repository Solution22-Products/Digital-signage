"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
// import PlayerPage from "@/components/playerPage";

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
}

interface Props {
  params: {
    id: string;
  };
}

const PreviewSlider: React.FC<Props> = ({ params: { id } }) => {
  const [slides, setSlides] = useState<PlaylistImage[]>([]);
  const [layoutType, setLayoutType] = useState<string>("");
  const [layoutZone, setLayoutZone] = useState<string>("");
  const sliderRef = useRef<Slider>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [checkSchedule, setCheckSchedule] = useState(true);

  const fetchSlides = async () => {
    try {
      let { data, error } = await supabase
        .from("screenDetails")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching data from screenDetails:", error);
        ({ data, error } = await supabase
          .from("playlistDetails")
          .select("*")
          .eq("id", id)
          .single());

        if (error) {
          console.error("Error fetching data from playlistDetails:", error);
        } else {
          const slidesData = data?.playlistImages || [];
          setSlides(slidesData);
          console.log("slidesData- Playlist : ", slidesData);
        }
      } else {
        const slidesData = data?.playlistDetails?.playlistImages || [];
        setSlides(slidesData);
        // console.log("slidedata", slidesData);
        setLayoutType(data?.layoutType?.title || "");
        setLayoutZone(data?.layouts?.zones || "");
        // console.log("slidesData- Screen : ", slidesData);
      }
    } catch (err) {
      console.error("Unexpected error fetching slides:", err);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(currentSlideIndex);
    }
  }, [currentSlideIndex]);

  const handleBeforeChange = (oldIndex: number, newIndex: number) => {
    setCurrentSlideIndex(newIndex);
  };

  // const getScheduledData = async () => {
  //   const { data: scheduledData, error: scheduledError } = await supabase
  //     .from("scheduledContents")
  //     .select("*");

  //   if (scheduledError) {
  //     console.error(
  //       "Error fetching data from scheduledContents:",
  //       scheduledError
  //     );
  //     return;
  //   }

  //   let scheduleValid = true;
  //   const currentDate = new Date().toLocaleDateString("en-CA", {
  //     year: "numeric",
  //     month: "2-digit",
  //     day: "2-digit",
  //   });
  //   const currentTime = new Date().toLocaleTimeString("en-CA", {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //     hour12: false,
  //   });

  //   // Filter and prioritize schedules
  //   const validSchedules = scheduledData
  //     .filter((item) => {
  //       const screens = item.screens;
  //       if (!screens || !screens.includes(id) || screens.length === 0) {
  //         return false;
  //       }

  //       const scheduleStartDate = new Date(item.startDate);
  //       const repeatUntilDate =
  //         item.repeatUntilValue === "Custom Date"
  //           ? new Date(item.repeatUntilDate)
  //           : null;
  //       const hasValidEndDate = repeatUntilDate
  //         ? currentDate <= repeatUntilDate.toLocaleDateString("en-CA")
  //         : true;

  //       if (!hasValidEndDate) return false;

  //       // Check type TurnOff
  //       if (item.type === "TurnOff") {
  //         if (
  //           currentDate >= item.startDate &&
  //           currentDate <= item.endDate &&
  //           currentTime >= item.startTime &&
  //           currentTime <= item.endTime &&
  //           item.repeat === null
  //         ) {
  //           scheduleValid = false;
  //           return false;
  //         }

  //         // else if (item.repeat === "Custom") {
  //         //   console.log("inside custom");
  //         //   const repeatInterval = item.repeatValue;
  //         //   const repeatUntil = repeatUntilDate || new Date(9999, 11, 31); // Handle 'forever' as distant future date

  //         //   switch (item.repeatDays) {
  //         //     case "Day":
  //         //       while (scheduleStartDate <= repeatUntil) {
  //         //         // console.log("inside day");
  //         //         if (
  //         //           currentDate === scheduleStartDate.toLocaleDateString("en-CA")
  //         //         ) {
  //         //           scheduleValid = false;
  //         //           // console.log("inside day if");
  //         //           return false;
  //         //           // break;
  //         //         }
  //         //         // console.log("outside day if");
  //         //         scheduleStartDate.setDate(
  //         //           scheduleStartDate.getDate() + repeatInterval * 1 + 1
  //         //         );
  //         //       }
  //         //       break;
  //         //     case "Week":
  //         //       while (scheduleStartDate <= repeatUntil) {
  //         //         if (
  //         //           currentDate === scheduleStartDate.toLocaleDateString("en-CA")
  //         //         ) {
  //         //           scheduleValid = false;
  //         //           return false;
  //         //         }
  //         //         scheduleStartDate.setDate(
  //         //           scheduleStartDate.getDate() + repeatInterval * 1 + 1
  //         //         );
  //         //       }
  //         //       break;
  //         //     case "Month":
  //         //       while (scheduleStartDate <= repeatUntil) {
  //         //         if (
  //         //           currentDate === scheduleStartDate.toLocaleDateString("en-CA")
  //         //         ) {
  //         //           scheduleValid = false;
  //         //           return false;
  //         //         }
  //         //         scheduleStartDate.setMonth(
  //         //           scheduleStartDate.getMonth() + repeatInterval * 1 + 1
  //         //         );
  //         //       }
  //         //       break;
  //         //     case "Year":
  //         //       while (scheduleStartDate <= repeatUntil) {
  //         //         if (
  //         //           currentDate === scheduleStartDate.toLocaleDateString("en-CA")
  //         //         ) {
  //         //           scheduleValid = false;
  //         //           return false;
  //         //         }
  //         //         scheduleStartDate.setFullYear(
  //         //           scheduleStartDate.getFullYear() + repeatInterval * 1 + 1
  //         //         );
  //         //       }
  //         //       break;
  //         //     default:
  //         //       return false;
  //         //   }
  //         // }
  //         else {
  //           if (currentDate < item.startDate) {
  //             scheduleValid = true;
  //             return false;
  //           }
  //           // Check default repeat patterns
  //           const repeatPatterns = {
  //             "Daily (Mon-Sun)": true,
  //             "Every Weekend (Sat-Sun)": [0, 6].includes(new Date().getDay()),
  //             "Every Weekday (Mon-Fri)": [1, 2, 3, 4, 5].includes(
  //               new Date().getDay()
  //             ),
  //             Monthly: new Date().getDate() === scheduleStartDate.getDate(),
  //             Annually:
  //               new Date().getMonth() === scheduleStartDate.getMonth() &&
  //               new Date().getDate() === scheduleStartDate.getDate(),
  //           };

  //           if (
  //             repeatPatterns[item.repeat as keyof typeof repeatPatterns] &&
  //             currentTime >= item.startTime &&
  //             currentTime <= item.endTime
  //           ) {
  //             scheduleValid = false;
  //             return false;
  //           }
  //         }
  //       }

  //       // Continue processing for TurnOn type
  //       if (item.repeat === null) {
  //         if (currentDate < item.startDate || currentDate > item.endDate) {
  //           return false;
  //         }
  //       } else if (item.repeat === "Custom") {
  //         const repeatInterval = item.repeatValue;
  //         const repeatUntil = repeatUntilDate || new Date(9999, 11, 31); // Handle 'forever' as distant future date

  //         switch (item.repeatDays) {
  //           case "Day":
  //             while (scheduleStartDate <= repeatUntil) {
  //               if (
  //                 currentDate === scheduleStartDate.toLocaleDateString("en-CA")
  //               )
  //                 break;
  //               scheduleStartDate.setDate(
  //                 scheduleStartDate.getDate() + repeatInterval * 1 + 1
  //               );
  //             }
  //             break;
  //           case "Week":
  //             while (scheduleStartDate <= repeatUntil) {
  //               if (
  //                 currentDate === scheduleStartDate.toLocaleDateString("en-CA")
  //               )
  //                 break;
  //               scheduleStartDate.setDate(
  //                 scheduleStartDate.getDate() + repeatInterval * 1 + 1
  //               );
  //             }
  //             break;
  //           case "Month":
  //             while (scheduleStartDate <= repeatUntil) {
  //               if (
  //                 currentDate === scheduleStartDate.toLocaleDateString("en-CA")
  //               )
  //                 break;
  //               scheduleStartDate.setMonth(
  //                 scheduleStartDate.getMonth() + repeatInterval * 1 + 1
  //               );
  //             }
  //             break;
  //           case "Year":
  //             while (scheduleStartDate <= repeatUntil) {
  //               if (
  //                 currentDate === scheduleStartDate.toLocaleDateString("en-CA")
  //               )
  //                 break;
  //               scheduleStartDate.setFullYear(
  //                 scheduleStartDate.getFullYear() + repeatInterval * 1 + 1
  //               );
  //             }
  //             break;
  //           default:
  //             return false;
  //         }

  //         return (
  //           currentDate === scheduleStartDate.toLocaleDateString("en-CA") &&
  //           currentTime >= item.startTime &&
  //           currentTime <= item.endTime
  //         );
  //       } else {
  //         if (currentDate < item.startDate) {
  //           return false;
  //         }

  //         const repeatPatterns = {
  //           "Daily (Mon-Sun)": true,
  //           "Every Weekend (Sat-Sun)": [0, 6].includes(new Date().getDay()),
  //           "Every Weekday (Mon-Fri)": [1, 2, 3, 4, 5].includes(
  //             new Date().getDay()
  //           ),
  //           Monthly: new Date().getDate() === scheduleStartDate.getDate(),
  //           Annually:
  //             new Date().getMonth() === scheduleStartDate.getMonth() &&
  //             new Date().getDate() === scheduleStartDate.getDate(),
  //         };

  //         if (!repeatPatterns[item.repeat as keyof typeof repeatPatterns]) {
  //           return false;
  //         }
  //       }

  //       return currentTime >= item.startTime && currentTime <= item.endTime;
  //     })
  //     .sort((a, b) => {
  //       if (a.endTime === b.endTime) {
  //         return a.startTime.localeCompare(b.startTime); // Sort by startTime if endTime is the same
  //       }
  //       return a.endTime.localeCompare(b.endTime); // Sort by endTime
  //     });

  //   // Check if any valid schedule exists
  //   if (validSchedules.length > 0) {
  //     const selectedSchedule = validSchedules[0]; // Take the highest priority (earliest endTime and startTime)

  //     const { data: playlistData, error: playlistError } = await supabase
  //       .from("playlistDetails")
  //       .select("playlistImages")
  //       .eq("id", selectedSchedule.playlist)
  //       .single();

  //     if (playlistError) {
  //       console.error(
  //         "Error fetching data from playlistDetails:",
  //         playlistError
  //       );
  //     } else {
  //       setSlides(playlistData.playlistImages);
  //     }
  //   }

  //   setCheckSchedule(scheduleValid);
  //   console.log("scheduleValid", scheduleValid);
  //   console.log("checkSchedule", checkSchedule);
  // };

  useEffect(() => {
    // const intervalId = setInterval(getScheduledData, 1000);
    // getScheduledData();
    // return () => clearInterval(intervalId);
  }, [id]);

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

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: slides[currentSlideIndex]?.duration * 1000 || 5000,
    beforeChange: handleBeforeChange,
    pauseOnHover: false,
    fade: true,
    cssEase: "linear",
  };

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
    //   checkSchedule={true}
    //   setCheckSchedule={() => {}}
    //   id={id}
    // />
    <>
      <Box sx={{ width: "100%" }} ref={containerRef}>
        {checkSchedule ? (
          layoutType === "Landscape" && layoutZone === "2" ? (
            <Grid
              container
              rowSpacing={1}
              columnSpacing={{ xs: 1, sm: 2, md: 3 }}
              style={{ height: "100vh", margin: 0, width: "100%" }}
            >
              <Grid item xs={6} style={{ height: "50vh", padding: 0 }}>
                <div className="w-full h-screen relative overflow-hidden">
                  <Slider {...settings} ref={sliderRef}>
                    {slides.map((slide: any, index: number) => (
                      <div
                        key={index}
                        className="w-full h-full relative cursor-pointer"
                        onClick={handleSlideClick}
                      >
                        {slide.url.slice(-3).toLowerCase() === "jpg" ||
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
                        <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
                          <h2>{slide.title}</h2>
                          <p>{slide.description}</p>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              </Grid>
              <Grid item xs={6} style={{ height: "50vh", padding: 0 }}>
                <div className="w-full h-screen relative overflow-hidden">
                  <Slider {...settings} ref={sliderRef}>
                    {slides.map((slide: any, index: number) => (
                      <div
                        key={index}
                        className="w-full h-full relative cursor-pointer"
                        onClick={handleSlideClick}
                      >
                        {slide.url.slice(-3).toLowerCase() === "jpg" ||
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
                        <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
                          <h2>{slide.title}</h2>
                          <p>{slide.description}</p>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              </Grid>
              <Grid item xs={12} style={{ height: "50vh", padding: 0 }}>
                <div className="w-full h-screen relative overflow-hidden">
                  <Slider {...settings} ref={sliderRef}>
                    {slides.map((slide: any, index: number) => (
                      <div
                        key={index}
                        className="w-full h-full relative cursor-pointer"
                        onClick={handleSlideClick}
                      >
                        {slide.url.slice(-3).toLowerCase() === "jpg" ||
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
                        <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
                          <h2>{slide.title}</h2>
                          <p>{slide.description}</p>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              </Grid>
            </Grid>
          ) : (
            <Grid
              container
              rowSpacing={1}
              columnSpacing={{ xs: 1, sm: 2, md: 3 }}
              style={{ height: "100vh", margin: 0, width: "100%" }}
            >
              <Grid item xs={12} style={{ height: "50vh", padding: 0 }}>
                <div className="w-full h-screen relative overflow-hidden">
                  <Slider {...settings} ref={sliderRef}>
                    {slides.map((slide: any, index: number) => (
                      <div
                        key={index}
                        className="w-full h-full relative cursor-pointer"
                        onClick={handleSlideClick}
                      >
                        {slide.url.slice(-3).toLowerCase() === "jpg" ||
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
                        <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
                          <h2>{slide.title}</h2>
                          <p>{slide.description}</p>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              </Grid>
            </Grid>
          )
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              fontSize: "24px",
              color: "gray",
            }}
          >
            <h2>Schedule date and time exceeds.</h2>
          </Box>
        )}
      </Box>
    </>
  );
};

export default PreviewSlider;
