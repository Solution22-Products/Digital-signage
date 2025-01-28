// "use client";

// import React, { useEffect } from "react";
// import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import Grid from "@mui/material/Grid";
// import Box from "@mui/material/Box";
// import { supabase } from "@/utils/supabase/supabaseClient";

// interface Slide {
//   id: any;
//   layoutType: any;
//   layoutZone: string | null; // Updated type
//   checkSchedule: boolean;
//   setCheckSchedule: any;
//   slides: any;
//   setSlides: any;
//   zone1slides: any;
//   setZone1slides: any;
//   zone2slides: any;
//   setZone2slides: any;
//   zone3slides: any;
//   setZone3slides: any;
//   handleSlideClick: () => void;
//   sliderRef: any;
//   containerRef: any;
//   sliderSettings1: any;
//   sliderSettings2: any;
//   sliderSettings3: any;
//   currentSlideIndex: number;
//   handleBeforeChange: (oldIndex: number, newIndex: number) => void;
// }

// const PlayerPage: React.FC<Slide> = ({
//   id,
//   layoutType,
//   layoutZone,
//   checkSchedule,
//   setCheckSchedule,
//   zone1slides,
//   setZone1slides,
//   zone2slides,
//   setZone2slides,
//   zone3slides,
//   setZone3slides,
//   slides,
//   setSlides,
//   handleSlideClick,
//   sliderRef,
//   containerRef,
//   sliderSettings1,
//   sliderSettings2,
//   sliderSettings3,
// }) => {
//   const getScheduledData = async () => {
//     const { data: scheduledData, error: scheduledError } = await supabase
//       .from("scheduledContents")
//       .select("*");

//     if (scheduledError) {
//       console.error(
//         "Error fetching data from scheduledContents:",
//         scheduledError
//       );
//       return;
//     }

//     let scheduleValid = true;
//     const currentDate = new Date().toLocaleDateString("en-CA", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     });
//     const currentTime = new Date().toLocaleTimeString("en-CA", {
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//       hour12: false,
//     });

//     // Filter and prioritize schedules
//     const validSchedules = scheduledData
//       .filter((item) => {
//         const screens = item.screens;
//         if (!screens || !screens.includes(id) || screens.length === 0) {
//           return false;
//         }

//         const scheduleStartDate = new Date(item.startDate);
//         const repeatUntilDate =
//           item.repeatUntilValue === "Custom Date"
//             ? new Date(item.repeatUntilDate)
//             : null;
//         const hasValidEndDate = repeatUntilDate
//           ? currentDate <= repeatUntilDate.toLocaleDateString("en-CA")
//           : true;

//         if (!hasValidEndDate) return false;

//         // Check type TurnOff
//         if (item.type === "TurnOff") {
//           if (
//             currentDate >= item.startDate &&
//             currentDate <= item.endDate &&
//             currentTime >= item.startTime &&
//             currentTime <= item.endTime &&
//             item.repeat === null
//           ) {
//             scheduleValid = false;
//             return false;
//           }

//           // else if (item.repeat === "Custom") {
//           //   console.log("inside custom");
//           //   const repeatInterval = item.repeatValue;
//           //   const repeatUntil = repeatUntilDate || new Date(9999, 11, 31); // Handle 'forever' as distant future date

//           //   switch (item.repeatDays) {
//           //     case "Day":
//           //       while (scheduleStartDate <= repeatUntil) {
//           //         // console.log("inside day");
//           //         if (
//           //           currentDate === scheduleStartDate.toLocaleDateString("en-CA")
//           //         ) {
//           //           scheduleValid = false;
//           //           // console.log("inside day if");
//           //           return false;
//           //           // break;
//           //         }
//           //         // console.log("outside day if");
//           //         scheduleStartDate.setDate(
//           //           scheduleStartDate.getDate() + repeatInterval * 1 + 1
//           //         );
//           //       }
//           //       break;
//           //     case "Week":
//           //       while (scheduleStartDate <= repeatUntil) {
//           //         if (
//           //           currentDate === scheduleStartDate.toLocaleDateString("en-CA")
//           //         ) {
//           //           scheduleValid = false;
//           //           return false;
//           //         }
//           //         scheduleStartDate.setDate(
//           //           scheduleStartDate.getDate() + repeatInterval * 1 + 1
//           //         );
//           //       }
//           //       break;
//           //     case "Month":
//           //       while (scheduleStartDate <= repeatUntil) {
//           //         if (
//           //           currentDate === scheduleStartDate.toLocaleDateString("en-CA")
//           //         ) {
//           //           scheduleValid = false;
//           //           return false;
//           //         }
//           //         scheduleStartDate.setMonth(
//           //           scheduleStartDate.getMonth() + repeatInterval * 1 + 1
//           //         );
//           //       }
//           //       break;
//           //     case "Year":
//           //       while (scheduleStartDate <= repeatUntil) {
//           //         if (
//           //           currentDate === scheduleStartDate.toLocaleDateString("en-CA")
//           //         ) {
//           //           scheduleValid = false;
//           //           return false;
//           //         }
//           //         scheduleStartDate.setFullYear(
//           //           scheduleStartDate.getFullYear() + repeatInterval * 1 + 1
//           //         );
//           //       }
//           //       break;
//           //     default:
//           //       return false;
//           //   }
//           // }
//           else {
//             if (currentDate < item.startDate) {
//               scheduleValid = true;
//               return false;
//             }
//             // Check default repeat patterns
//             const repeatPatterns = {
//               "Daily (Mon-Sun)": true,
//               "Every Weekend (Sat-Sun)": [0, 6].includes(new Date().getDay()),
//               "Every Weekday (Mon-Fri)": [1, 2, 3, 4, 5].includes(
//                 new Date().getDay()
//               ),
//               Monthly: new Date().getDate() === scheduleStartDate.getDate(),
//               Annually:
//                 new Date().getMonth() === scheduleStartDate.getMonth() &&
//                 new Date().getDate() === scheduleStartDate.getDate(),
//             };

//             if (
//               repeatPatterns[item.repeat as keyof typeof repeatPatterns] &&
//               currentTime >= item.startTime &&
//               currentTime <= item.endTime
//             ) {
//               scheduleValid = false;
//               return false;
//             }
//           }
//         }

//         // Continue processing for TurnOn type
//         if (item.repeat === null) {
//           if (currentDate < item.startDate || currentDate > item.endDate) {
//             return false;
//           }
//         } else if (item.repeat === "Custom") {
//           const repeatInterval = item.repeatValue;
//           const repeatUntil = repeatUntilDate || new Date(9999, 11, 31); // Handle 'forever' as distant future date

//           switch (item.repeatDays) {
//             case "Day":
//               while (scheduleStartDate <= repeatUntil) {
//                 if (
//                   currentDate === scheduleStartDate.toLocaleDateString("en-CA")
//                 )
//                   break;
//                 scheduleStartDate.setDate(
//                   scheduleStartDate.getDate() + repeatInterval * 1 + 1
//                 );
//               }
//               break;
//             case "Week":
//               while (scheduleStartDate <= repeatUntil) {
//                 if (
//                   currentDate === scheduleStartDate.toLocaleDateString("en-CA")
//                 )
//                   break;
//                 scheduleStartDate.setDate(
//                   scheduleStartDate.getDate() + repeatInterval * 1 + 1
//                 );
//               }
//               break;
//             case "Month":
//               while (scheduleStartDate <= repeatUntil) {
//                 if (
//                   currentDate === scheduleStartDate.toLocaleDateString("en-CA")
//                 )
//                   break;
//                 scheduleStartDate.setMonth(
//                   scheduleStartDate.getMonth() + repeatInterval * 1 + 1
//                 );
//               }
//               break;
//             case "Year":
//               while (scheduleStartDate <= repeatUntil) {
//                 if (
//                   currentDate === scheduleStartDate.toLocaleDateString("en-CA")
//                 )
//                   break;
//                 scheduleStartDate.setFullYear(
//                   scheduleStartDate.getFullYear() + repeatInterval * 1 + 1
//                 );
//               }
//               break;
//             default:
//               return false;
//           }

//           return (
//             currentDate === scheduleStartDate.toLocaleDateString("en-CA") &&
//             currentTime >= item.startTime &&
//             currentTime <= item.endTime
//           );
//         } else {
//           if (currentDate < item.startDate) {
//             return false;
//           }

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

//           if (!repeatPatterns[item.repeat as keyof typeof repeatPatterns]) {
//             return false;
//           }
//         }

//         return currentTime >= item.startTime && currentTime <= item.endTime;
//       })
//       .sort((a, b) => {
//         if (a.endTime === b.endTime) {
//           return a.startTime.localeCompare(b.startTime); // Sort by startTime if endTime is the same
//         }
//         return a.endTime.localeCompare(b.endTime); // Sort by endTime
//       });

//     // Check if any valid schedule exists
//     if (validSchedules.length > 0) {
//       const selectedSchedule = validSchedules[0]; // Take the highest priority (earliest endTime and startTime)

//       const { data: playlistData, error: playlistError } = await supabase
//         .from("playlistDetails")
//         .select("playlistImages")
//         .eq("id", selectedSchedule.playlist)
//         .single();

//       if (playlistError) {
//         console.error(
//           "Error fetching data from playlistDetails:",
//           playlistError
//         );
//       } else {
//         setSlides(playlistData.playlistImages);
//       }
//     }

//     setCheckSchedule(scheduleValid);
//     console.log("scheduleValid", scheduleValid);
//     console.log("checkSchedule", checkSchedule);
//   };

//   useEffect(() => {
//     // const intervalId = setInterval(getScheduledData, 1000);

//     getScheduledData();

//     // return () => clearInterval(intervalId);
//   }, [id]);

//   console.log(layoutZone);

//   let layoutContent;

//   if (
//     layoutZone &&
//     layoutZone.zoneCount === 1 &&
//     layoutZone.name === "Portrait Layout 01"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen flex flex-wrap">
//         <div className="h-[1920px] w-[1080px] flex overflow-hidden">
//           <Slider {...settings1} ref={sliderRef}>
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 3 &&
//     layoutZone.name === "Portrait Layout 02"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen flex flex-wrap">
//         <div className={`w-[76%] h-[76%] flex overflow-hidden`}>
//           <Slider {...settings1} ref={sliderRef} className="w-full h-full">
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>

//         <div className={`w-[24%] h-[76%] flex overflow-hidden`}>
//           <Slider {...settings2} ref={sliderRef} className="w-full h-full">
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-3).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>

//         <div className={`w-full h-[24%] flex overflow-hidden`}>
//           <Slider {...settings3} ref={sliderRef} className="w-full h-full">
//             {zone3slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//     // layoutContent = (
//     //   <div className="h-screen w-screen flex flex-wrap">
//     //     <div className={`w-[76%] h-[76%] flex`}>
//     //       <Slider {...settings1} ref={sliderRef} className="w-full h-full">
//     //         {zone1slides.map((slide, index) => (
//     //           <div
//     //             key={index}
//     //             className="w-full h-full relative cursor-pointer"
//     //             onClick={handleSlideClick}
//     //           >
//     //             {slide.url.slice(-3).toLowerCase() === "jpg" ||
//     //             slide.url.slice(-4).toLowerCase() === "jpeg" ||
//     //             slide.url.slice(-3).toLowerCase() === "png" ? (
//     //               <img
//     //                 src={slide.url}
//     //                 alt={slide.title}
//     //                 className="w-full h-full object-contain"
//     //               />
//     //             ) : (
//     //               <video
//     //                 src={slide.url}
//     //                 className="w-full h-full object-contain"
//     //                 controls={false}
//     //                 autoPlay
//     //                 loop
//     //               />
//     //             )}
//     //             <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//     //               <h2>{slide.title}</h2>
//     //               <p>{slide.description}</p>
//     //             </div>
//     //           </div>
//     //         ))}
//     //       </Slider>
//     //     </div>

//     //     <div className={`w-[24%] h-[76%] flex`}>
//     //       <Slider {...settings2} ref={sliderRef} className="w-full h-full">
//     //         {zone2slides.map((slide, index) => (
//     //           <div
//     //             key={index}
//     //             className="w-full h-full relative cursor-pointer"
//     //             onClick={handleSlideClick}
//     //           >
//     //             {slide.url.slice(-3).toLowerCase() === "jpg" ||
//     //             slide.url.slice(-3).toLowerCase() === "jpeg" ||
//     //             slide.url.slice(-3).toLowerCase() === "png" ? (
//     //               <img
//     //                 src={slide.url}
//     //                 alt={slide.title}
//     //                 className="w-full h-full object-contain"
//     //               />
//     //             ) : (
//     //               <video
//     //                 src={slide.url}
//     //                 className="w-full h-full object-contain"
//     //                 controls={false}
//     //                 autoPlay
//     //                 loop
//     //               />
//     //             )}
//     //             <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//     //               <h2>{slide.title}</h2>
//     //               <p>{slide.description}</p>
//     //             </div>
//     //           </div>
//     //         ))}
//     //       </Slider>
//     //     </div>

//     //     <div className={`w-[100%] h-[24%] flex`}>
//     //       <Slider {...settings3} ref={sliderRef} className="w-full h-full">
//     //         {zone3slides.map((slide, index) => (
//     //           <div
//     //             key={index}
//     //             className="w-full h-full relative cursor-pointer"
//     //             onClick={handleSlideClick}
//     //           >
//     //             {slide.url.slice(-3).toLowerCase() === "jpg" ||
//     //             slide.url.slice(-4).toLowerCase() === "jpeg" ||
//     //             slide.url.slice(-3).toLowerCase() === "png" ? (
//     //               <img
//     //                 src={slide.url}
//     //                 alt={slide.title}
//     //                 className="w-full h-full object-contain"
//     //               />
//     //             ) : (
//     //               <video
//     //                 src={slide.url}
//     //                 className="w-full h-full object-contain"
//     //                 controls={false}
//     //                 autoPlay
//     //                 loop
//     //               />
//     //             )}
//     //             <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//     //               <h2>{slide.title}</h2>
//     //               <p>{slide.description}</p>
//     //             </div>
//     //           </div>
//     //         ))}
//     //       </Slider>
//     //     </div>
//     //   </div>
//     // );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 3 &&
//     layoutZone.name === "Portrait Layout 03"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen flex flex-wrap">
//         {/* Zone 1 */}
//         <div className="w-full h-[24%] flex overflow-hidden">
//           <Slider {...settings1} ref={sliderRef} className="w-full h-full">
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-contain"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-contain"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>

//         {/* Zone 2 */}
//         <div className="w-[76%] h-[76%] flex overflow-hidden">
//           <Slider {...settings2} ref={sliderRef} className="w-full h-full">
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-contain"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-contain"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>

//         {/* Zone 3 */}
//         <div className="w-[24%] h-[76%] flex overflow-hidden">
//           <Slider {...settings3} ref={sliderRef} className="w-full h-full">
//             {zone3slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-contain"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-contain"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 3 &&
//     layoutZone.name === "Portrait Layout 04"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen flex flex-wrap">
//         {/* Zone 1 */}
//         <div className="w-[24%] h-[76%] flex overflow-hidden">
//           <Slider {...settings1} ref={sliderRef} className="w-full h-full">
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-contain"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-contain"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//         {/* Zone 2 */}
//         <div className="w-[76%] h-[76%] flex overflow-hidden">
//           <Slider {...settings2} ref={sliderRef} className="w-full h-full">
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-contain"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-contain"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//         {/* Zone 3 */}
//         <div className="w-full h-[24%] flex overflow-hidden">
//           <Slider {...settings3} ref={sliderRef} className="w-full h-full">
//             {zone3slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-contain"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-contain"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 3 &&
//     layoutZone.name === "Portrait Layout 05"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen flex flex-wrap">
//         {/* Zone 1 */}
//         <div className="w-full h-[24%] flex overflow-hidden">
//           <Slider {...settings1} ref={sliderRef} className="w-full h-full">
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-contain"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-contain"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>

//         {/* Zone 2 */}
//         <div className="w-[24%] h-[76%] flex overflow-hidden">
//           <Slider {...settings2} ref={sliderRef} className="w-full h-full">
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-contain"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-contain"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>

//         {/* Zone 3 */}
//         <div className="w-[76%] h-[76%] flex overflow-hidden">
//           <Slider {...settings3} ref={sliderRef} className="w-full h-full">
//             {zone3slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-contain"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-contain"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 3 &&
//     layoutZone.name === "Portrait Layout 06"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen flex flex-wrap">
//         <div className={`h-[56.25%] w-full overflow-hidden`}>
//           <Slider {...settings1} ref={sliderRef}>
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>

//         <div className={`h-[21.8%] w-full overflow-hidden`}>
//           <Slider {...settings2} ref={sliderRef}>
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-3).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>

//         <div className={`h-[21.8%] w-full overflow-hidden`}>
//           <Slider {...settings3} ref={sliderRef}>
//             {zone3slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 3 &&
//     layoutZone.name === "Portrait Layout 07"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen flex flex-wrap">
//         <div className={`h-[56.25%] w-full overflow-hidden`}>
//           <Slider {...settings1} ref={sliderRef}>
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>

//         <div className={`h-[10.4%] w-full overflow-hidden`}>
//           <Slider {...settings2} ref={sliderRef}>
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-3).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>

//         <div className={`h-[33.3%] w-full overflow-hidden`}>
//           <Slider {...settings3} ref={sliderRef}>
//             {zone3slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 3 &&
//     layoutZone.name === "Portrait Layout 08"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen">
//         <div className={`h-[10.4%] w-full overflow-hidden`}>
//           <Slider {...settings1} ref={sliderRef}>
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-3).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//         <div className={`h-[56.25%] w-full overflow-hidden`}>
//           <Slider {...settings2} ref={sliderRef}>
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>

//         <div className={`h-[33.3%] w-full overflow-hidden`}>
//           <Slider {...settings3} ref={sliderRef}>
//             {zone3slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 3 &&
//     layoutZone.name === "Portrait Layout 09"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen">
//         <div className={`h-[10.4%] w-full overflow-hidden`}>
//           <Slider {...settings1} ref={sliderRef}>
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-3).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//         <div className={`h-[33.3%] w-full overflow-hidden`}>
//           <Slider {...settings2} ref={sliderRef}>
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//         <div className={`h-[56.25%] w-full overflow-hidden`}>
//           <Slider {...settings3} ref={sliderRef}>
//             {zone3slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 2 &&
//     layoutZone.name === "Portrait Layout 10"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen">
//         <div className={`h-[66.6%] w-full overflow-hidden`}>
//           <Slider {...settings1} ref={sliderRef}>
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-3).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//         <div className={`h-[33.3%] w-full overflow-hidden`}>
//           <Slider {...settings2} ref={sliderRef}>
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 2 &&
//     layoutZone.name === "Portrait Layout 11"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen">
//         <div className={`h-[33.3%] w-full overflow-hidden`}>
//           <Slider {...settings1} ref={sliderRef}>
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//         <div className={`h-[66.6%] w-full overflow-hidden`}>
//           <Slider {...settings2} ref={sliderRef}>
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-3).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 2 &&
//     layoutZone.name === "Portrait Layout 12"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen">
//         <div className={`h-[89.5%] w-full overflow-hidden`}>
//           <Slider {...settings1} ref={sliderRef}>
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//         <div className={`h-[10.4%] w-full overflow-hidden`}>
//           <Slider {...settings2} ref={sliderRef}>
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-3).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 2 &&
//     layoutZone.name === "Portrait Layout 13"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen">
//         <div className={`h-[10.4%] w-full overflow-hidden`}>
//           <Slider {...settings1} ref={sliderRef}>
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-3).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//         <div className={`h-[89.5%] w-full overflow-hidden`}>
//           <Slider {...settings2} ref={sliderRef}>
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 2 &&
//     layoutZone.name === "Portrait Layout 14"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen">
//         <div className={`h-[50%] w-full overflow-hidden`}>
//           <Slider {...settings1} ref={sliderRef}>
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-3).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//         <div className={`h-[50%] w-full overflow-hidden`}>
//           <Slider {...settings2} ref={sliderRef}>
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 1 &&
//     layoutZone.name === "Landscape Layout 01"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen flex flex-wrap">
//         <div className="h-[1080px] w-[1920px] flex overflow-hidden">
//           <Slider {...settings1} ref={sliderRef}>
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 3 &&
//     layoutZone.name === "Landscape Layout 02"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen flex flex-wrap">
//         <div className={`w-[81.5%] h-[81.5%] flex overflow-hidden`}>
//           <Slider {...settings1} ref={sliderRef} className="w-full h-full">
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>

//         <div className={`w-[18.5%] h-[81.5%] flex overflow-hidden`}>
//           <Slider {...settings2} ref={sliderRef} className="w-full h-full">
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-3).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>

//         <div className={`w-full h-[18.5%] flex overflow-hidden`}>
//           <Slider {...settings3} ref={sliderRef} className="w-full h-full">
//             {zone3slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 3 &&
//     layoutZone.name === "Landscape Layout 03"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen flex flex-wrap">
//         <div className={`w-[18.5%] h-[81.5%] flex overflow-hidden`}>
//           <Slider {...settings1} ref={sliderRef} className="w-full h-full">
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-3).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>

//         <div className={`w-[81.5%] h-[81.5%] flex overflow-hidden`}>
//           <Slider {...settings2} ref={sliderRef} className="w-full h-full">
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>

//         <div className={`w-full h-[18.5%] flex overflow-hidden`}>
//           <Slider {...settings3} ref={sliderRef} className="w-full h-full">
//             {zone3slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 2 &&
//     layoutZone.name === "Landscape Layout 04"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen flex flex-wrap">
//         <div className={`w-[56.25%] h-full flex overflow-hidden`}>
//           <Slider {...settings1} ref={sliderRef} className="w-full h-full">
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-3).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>

//         <div className={`w-[43.75%] h-full flex overflow-hidden`}>
//           <Slider {...settings2} ref={sliderRef} className="w-full h-full">
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 2 &&
//     layoutZone.name === "Landscape Layout 05"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen flex flex-wrap">
//         <div className={`w-[43.75%] h-full flex overflow-hidden`}>
//           <Slider {...settings1} ref={sliderRef} className="w-full h-full">
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//         <div className={`w-[56.25%] h-full flex overflow-hidden`}>
//           <Slider {...settings2} ref={sliderRef} className="w-full h-full">
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-3).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else if (
//     layoutZone &&
//     layoutZone.zoneCount === 2 &&
//     layoutZone.name === "Landscape Layout 06"
//   ) {
//     layoutContent = (
//       <div className="h-screen w-screen flex flex-wrap">
//         <div className={`w-[50%] h-full flex overflow-hidden`}>
//           <Slider {...settings1} ref={sliderRef} className="w-full h-full">
//             {zone1slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-4).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//         <div className={`w-[50%] h-full flex overflow-hidden`}>
//           <Slider {...settings2} ref={sliderRef} className="w-full h-full">
//             {zone2slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className="w-full h-full relative cursor-pointer"
//                 onClick={handleSlideClick}
//               >
//                 {slide.url.slice(-3).toLowerCase() === "jpg" ||
//                 slide.url.slice(-3).toLowerCase() === "jpeg" ||
//                 slide.url.slice(-3).toLowerCase() === "png" ? (
//                   <img
//                     src={slide.url}
//                     alt={slide.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={slide.url}
//                     className="w-full h-full object-cover"
//                     controls={false}
//                     autoPlay
//                     loop
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
//                   <h2>{slide.title}</h2>
//                   <p>{slide.description}</p>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     );
//   } else {
//     layoutContent = (
//       <div className="h-screen w-screen">
//         <div className="w-[100%] bg-black-500 flex items-center justify-center"></div>
//       </div>
//     );
//   }
//   return (
//     <Box sx={{ width: "100%" }} ref={containerRef}>
//       {layoutContent || <p>No layout available</p>}
//     </Box>
//   );
// };

// export default PlayerPage;
