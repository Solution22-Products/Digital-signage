"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

interface PlaylistImage {
  url: string;
  title: string;
  description: string;
  createdAt: string; // Assume there's a createdAt field
  duration: number; // Add duration field
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
  const sliderRef = useRef<Slider>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const fetchSlides = async () => {
    try {
      const { data: screenData, error: screenError } = await supabase
        .from("screenDetails")
        .select("*")
        .eq("id", id)
        .single();

      if (screenError) {
        console.error("Error fetching data from screenDetails:", screenError);

        const { data: playlistData, error: playlistError } = await supabase
          .from("playlistDetails")
          .select("*")
          .eq("id", id)
          .single();

        if (playlistError) {
          console.error(
            "Error fetching data from playlistDetails:",
            playlistError
          );
        } else {
          const slidesData = playlistData?.playlistImages || [];
          setSlides(slidesData);
          console.log("slidesData - Playlist:", slidesData);
        }
      } else {
        const { data: orientData, error: orientError } = await supabase
          .from("layoutType")
          .select("*")
          .eq("id", screenData.orientation)
          .single();

        if (orientError) {
          console.error("Error fetching data from layoutType:", orientError);
          return;
        }

        const { data: layoutData, error: layoutError } = await supabase
          .from("layouts")
          .select("*")
          .eq("id", screenData.layout)
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
          zone1h: splitDimensions(layoutData.zone1)[0], // height
          zone1w: splitDimensions(layoutData.zone1)[1], // width
          zone2h: splitDimensions(layoutData.zone2)[0],
          zone2w: splitDimensions(layoutData.zone2)[1],
          zone3h: splitDimensions(layoutData.zone3)[0],
          zone3w: splitDimensions(layoutData.zone3)[1],
          zoneCount,
        };

        const { data: zone1Playlist, error: zone1Error } = await supabase
          .from("playlistDetails")
          .select("*")
          .eq("id", screenData.zone1_details[0].playlist)
          .single();

        const { data: zone2Playlist, error: zone2Error } = await supabase
          .from("playlistDetails")
          .select("*")
          .eq("id", screenData.zone2_details[0].playlist)
          .single();

        const { data: zone3Playlist, error: zone3Error } = await supabase
          .from("playlistDetails")
          .select("*")
          .eq("id", screenData.zone3_details[0].playlist)
          .single();

        setZone1slides(zone1Playlist?.playlistImages || []);
        setZone2slides(zone2Playlist?.playlistImages || []);
        setZone3slides(zone3Playlist?.playlistImages || []);

        setLayoutType(orientData.title || "");
        setLayoutZone(layouts);

        console.log("slidesData - 1:", zone1Playlist?.playlistImages);
        console.log("slidesData - 2:", zone2slides);
        console.log("slidesData - 3:", zone3slides);
        console.log("layoutType:", orientData.title);
        console.log("layoutZone:", layouts);
      }
    } catch (err) {
      console.error("Unexpected error fetching slides:", err);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, [id]);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(currentSlideIndex);
    }
  }, [currentSlideIndex]);

  const handleBeforeChange = (oldIndex: number, newIndex: number) => {
    setCurrentSlideIndex(newIndex);
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
    autoplaySpeed: zone1slides[currentSlideIndex]?.duration * 1000 || 5000,
    beforeChange: handleBeforeChange,
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
    autoplaySpeed: zone2slides[currentSlideIndex]?.duration * 1000 || 5000,
    beforeChange: handleBeforeChange,
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
    autoplaySpeed: zone3slides[currentSlideIndex]?.duration * 1000 || 5000,
    beforeChange: handleBeforeChange,
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

  const enterFullScreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  let layoutContent;

  if (
    layoutZone &&
    layoutZone.zoneCount === 1 &&
    layoutZone.name === "Portrait Layout 01"
  ) {
    layoutContent = (
      <div className="h-screen w-screen flex flex-wrap">
        <div className="h-[1920px] w-[1080px] flex overflow-hidden">
          <Slider {...settings1} ref={sliderRef}>
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 3 &&
    layoutZone.name === "Portrait Layout 02"
  ) {
    layoutContent = (
      <div className="h-screen w-screen flex flex-wrap">
        <div className={`w-[76%] h-[76%] flex overflow-hidden`}>
          <Slider {...settings1} ref={sliderRef} className="w-full h-full">
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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

        <div className={`w-[24%] h-[76%] flex overflow-hidden`}>
          <Slider {...settings2} ref={sliderRef} className="w-full h-full">
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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

        <div className={`w-full h-[24%] flex overflow-hidden`}>
          <Slider {...settings3} ref={sliderRef} className="w-full h-full">
            {zone3slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
      </div>
    );
    // layoutContent = (
    //   <div className="h-screen w-screen flex flex-wrap">
    //     <div className={`w-[76%] h-[76%] flex`}>
    //       <Slider {...settings1} ref={sliderRef} className="w-full h-full">
    //         {zone1slides.map((slide, index) => (
    //           <div
    //             key={index}
    //             className="w-full h-full relative cursor-pointer"
    //             onClick={handleSlideClick}
    //           >
    //             {slide.url.slice(-3).toLowerCase() === "jpg" ||
    //             slide.url.slice(-4).toLowerCase() === "jpeg" ||
    //             slide.url.slice(-3).toLowerCase() === "png" ? (
    //               <img
    //                 src={slide.url}
    //                 alt={slide.title}
    //                 className="w-full h-full object-contain"
    //               />
    //             ) : (
    //               <video
    //                 src={slide.url}
    //                 className="w-full h-full object-contain"
    //                 controls={false}
    //                 autoPlay
    //                 loop
    //               />
    //             )}
    //             <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
    //               <h2>{slide.title}</h2>
    //               <p>{slide.description}</p>
    //             </div>
    //           </div>
    //         ))}
    //       </Slider>
    //     </div>

    //     <div className={`w-[24%] h-[76%] flex`}>
    //       <Slider {...settings2} ref={sliderRef} className="w-full h-full">
    //         {zone2slides.map((slide, index) => (
    //           <div
    //             key={index}
    //             className="w-full h-full relative cursor-pointer"
    //             onClick={handleSlideClick}
    //           >
    //             {slide.url.slice(-3).toLowerCase() === "jpg" ||
    //             slide.url.slice(-3).toLowerCase() === "jpeg" ||
    //             slide.url.slice(-3).toLowerCase() === "png" ? (
    //               <img
    //                 src={slide.url}
    //                 alt={slide.title}
    //                 className="w-full h-full object-contain"
    //               />
    //             ) : (
    //               <video
    //                 src={slide.url}
    //                 className="w-full h-full object-contain"
    //                 controls={false}
    //                 autoPlay
    //                 loop
    //               />
    //             )}
    //             <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
    //               <h2>{slide.title}</h2>
    //               <p>{slide.description}</p>
    //             </div>
    //           </div>
    //         ))}
    //       </Slider>
    //     </div>

    //     <div className={`w-[100%] h-[24%] flex`}>
    //       <Slider {...settings3} ref={sliderRef} className="w-full h-full">
    //         {zone3slides.map((slide, index) => (
    //           <div
    //             key={index}
    //             className="w-full h-full relative cursor-pointer"
    //             onClick={handleSlideClick}
    //           >
    //             {slide.url.slice(-3).toLowerCase() === "jpg" ||
    //             slide.url.slice(-4).toLowerCase() === "jpeg" ||
    //             slide.url.slice(-3).toLowerCase() === "png" ? (
    //               <img
    //                 src={slide.url}
    //                 alt={slide.title}
    //                 className="w-full h-full object-contain"
    //               />
    //             ) : (
    //               <video
    //                 src={slide.url}
    //                 className="w-full h-full object-contain"
    //                 controls={false}
    //                 autoPlay
    //                 loop
    //               />
    //             )}
    //             <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white">
    //               <h2>{slide.title}</h2>
    //               <p>{slide.description}</p>
    //             </div>
    //           </div>
    //         ))}
    //       </Slider>
    //     </div>
    //   </div>
    // );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 3 &&
    layoutZone.name === "Portrait Layout 03"
  ) {
    layoutContent = (
      <div className="h-screen w-screen flex flex-wrap">
        {/* Zone 1 */}
        <div className="w-full h-[24%] flex overflow-hidden">
          <Slider {...settings1} ref={sliderRef} className="w-full h-full">
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
                onClick={handleSlideClick}
              >
                {slide.url.slice(-3).toLowerCase() === "jpg" ||
                slide.url.slice(-4).toLowerCase() === "jpeg" ||
                slide.url.slice(-3).toLowerCase() === "png" ? (
                  <img
                    src={slide.url}
                    alt={slide.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={slide.url}
                    className="w-full h-full object-contain"
                    controls={false}
                    autoPlay
                    loop
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

        {/* Zone 2 */}
        <div className="w-[76%] h-[76%] flex overflow-hidden">
          <Slider {...settings2} ref={sliderRef} className="w-full h-full">
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
                onClick={handleSlideClick}
              >
                {slide.url.slice(-3).toLowerCase() === "jpg" ||
                slide.url.slice(-4).toLowerCase() === "jpeg" ||
                slide.url.slice(-3).toLowerCase() === "png" ? (
                  <img
                    src={slide.url}
                    alt={slide.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={slide.url}
                    className="w-full h-full object-contain"
                    controls={false}
                    autoPlay
                    loop
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

        {/* Zone 3 */}
        <div className="w-[24%] h-[76%] flex overflow-hidden">
          <Slider {...settings3} ref={sliderRef} className="w-full h-full">
            {zone3slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
                onClick={handleSlideClick}
              >
                {slide.url.slice(-3).toLowerCase() === "jpg" ||
                slide.url.slice(-4).toLowerCase() === "jpeg" ||
                slide.url.slice(-3).toLowerCase() === "png" ? (
                  <img
                    src={slide.url}
                    alt={slide.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={slide.url}
                    className="w-full h-full object-contain"
                    controls={false}
                    autoPlay
                    loop
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 3 &&
    layoutZone.name === "Portrait Layout 04"
  ) {
    layoutContent = (
      <div className="h-screen w-screen flex flex-wrap">
        {/* Zone 1 */}
        <div className="w-[24%] h-[76%] flex overflow-hidden">
          <Slider {...settings1} ref={sliderRef} className="w-full h-full">
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
                onClick={handleSlideClick}
              >
                {slide.url.slice(-3).toLowerCase() === "jpg" ||
                slide.url.slice(-4).toLowerCase() === "jpeg" ||
                slide.url.slice(-3).toLowerCase() === "png" ? (
                  <img
                    src={slide.url}
                    alt={slide.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={slide.url}
                    className="w-full h-full object-contain"
                    controls={false}
                    autoPlay
                    loop
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
        {/* Zone 2 */}
        <div className="w-[76%] h-[76%] flex overflow-hidden">
          <Slider {...settings2} ref={sliderRef} className="w-full h-full">
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
                onClick={handleSlideClick}
              >
                {slide.url.slice(-3).toLowerCase() === "jpg" ||
                slide.url.slice(-4).toLowerCase() === "jpeg" ||
                slide.url.slice(-3).toLowerCase() === "png" ? (
                  <img
                    src={slide.url}
                    alt={slide.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={slide.url}
                    className="w-full h-full object-contain"
                    controls={false}
                    autoPlay
                    loop
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
        {/* Zone 3 */}
        <div className="w-full h-[24%] flex overflow-hidden">
          <Slider {...settings3} ref={sliderRef} className="w-full h-full">
            {zone3slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
                onClick={handleSlideClick}
              >
                {slide.url.slice(-3).toLowerCase() === "jpg" ||
                slide.url.slice(-4).toLowerCase() === "jpeg" ||
                slide.url.slice(-3).toLowerCase() === "png" ? (
                  <img
                    src={slide.url}
                    alt={slide.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={slide.url}
                    className="w-full h-full object-contain"
                    controls={false}
                    autoPlay
                    loop
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 3 &&
    layoutZone.name === "Portrait Layout 05"
  ) {
    layoutContent = (
      <div className="h-screen w-screen flex flex-wrap">
        {/* Zone 1 */}
        <div className="w-full h-[24%] flex overflow-hidden">
          <Slider {...settings1} ref={sliderRef} className="w-full h-full">
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
                onClick={handleSlideClick}
              >
                {slide.url.slice(-3).toLowerCase() === "jpg" ||
                slide.url.slice(-4).toLowerCase() === "jpeg" ||
                slide.url.slice(-3).toLowerCase() === "png" ? (
                  <img
                    src={slide.url}
                    alt={slide.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={slide.url}
                    className="w-full h-full object-contain"
                    controls={false}
                    autoPlay
                    loop
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

        {/* Zone 2 */}
        <div className="w-[24%] h-[76%] flex overflow-hidden">
          <Slider {...settings2} ref={sliderRef} className="w-full h-full">
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
                onClick={handleSlideClick}
              >
                {slide.url.slice(-3).toLowerCase() === "jpg" ||
                slide.url.slice(-4).toLowerCase() === "jpeg" ||
                slide.url.slice(-3).toLowerCase() === "png" ? (
                  <img
                    src={slide.url}
                    alt={slide.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={slide.url}
                    className="w-full h-full object-contain"
                    controls={false}
                    autoPlay
                    loop
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

        {/* Zone 3 */}
        <div className="w-[76%] h-[76%] flex overflow-hidden">
          <Slider {...settings3} ref={sliderRef} className="w-full h-full">
            {zone3slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
                onClick={handleSlideClick}
              >
                {slide.url.slice(-3).toLowerCase() === "jpg" ||
                slide.url.slice(-4).toLowerCase() === "jpeg" ||
                slide.url.slice(-3).toLowerCase() === "png" ? (
                  <img
                    src={slide.url}
                    alt={slide.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={slide.url}
                    className="w-full h-full object-contain"
                    controls={false}
                    autoPlay
                    loop
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 3 &&
    layoutZone.name === "Portrait Layout 06"
  ) {
    layoutContent = (
      <div className="h-screen w-screen flex flex-wrap">
        <div className={`h-[56.25%] w-full overflow-hidden`}>
          <Slider {...settings1} ref={sliderRef}>
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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

        <div className={`h-[21.8%] w-full overflow-hidden`}>
          <Slider {...settings2} ref={sliderRef}>
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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

        <div className={`h-[21.8%] w-full overflow-hidden`}>
          <Slider {...settings3} ref={sliderRef}>
            {zone3slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 3 &&
    layoutZone.name === "Portrait Layout 07"
  ) {
    layoutContent = (
      <div className="h-screen w-screen flex flex-wrap">
        <div className={`h-[56.25%] w-full overflow-hidden`}>
          <Slider {...settings1} ref={sliderRef}>
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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

        <div className={`h-[10.4%] w-full overflow-hidden`}>
          <Slider {...settings2} ref={sliderRef}>
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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

        <div className={`h-[33.3%] w-full overflow-hidden`}>
          <Slider {...settings3} ref={sliderRef}>
            {zone3slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 3 &&
    layoutZone.name === "Portrait Layout 08"
  ) {
    layoutContent = (
      <div className="h-screen w-screen">
        <div className={`h-[10.4%] w-full overflow-hidden`}>
          <Slider {...settings1} ref={sliderRef}>
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
        <div className={`h-[56.25%] w-full overflow-hidden`}>
          <Slider {...settings2} ref={sliderRef}>
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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

        <div className={`h-[33.3%] w-full overflow-hidden`}>
          <Slider {...settings3} ref={sliderRef}>
            {zone3slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 3 &&
    layoutZone.name === "Portrait Layout 09"
  ) {
    layoutContent = (
      <div className="h-screen w-screen">
        <div className={`h-[10.4%] w-full overflow-hidden`}>
          <Slider {...settings1} ref={sliderRef}>
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
        <div className={`h-[33.3%] w-full overflow-hidden`}>
          <Slider {...settings2} ref={sliderRef}>
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
        <div className={`h-[56.25%] w-full overflow-hidden`}>
          <Slider {...settings3} ref={sliderRef}>
            {zone3slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 2 &&
    layoutZone.name === "Portrait Layout 10"
  ) {
    layoutContent = (
      <div className="h-screen w-screen">
        <div className={`h-[66.6%] w-full overflow-hidden`}>
          <Slider {...settings1} ref={sliderRef}>
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
        <div className={`h-[33.3%] w-full overflow-hidden`}>
          <Slider {...settings2} ref={sliderRef}>
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 2 &&
    layoutZone.name === "Portrait Layout 11"
  ) {
    layoutContent = (
      <div className="h-screen w-screen">
        <div className={`h-[33.3%] w-full overflow-hidden`}>
          <Slider {...settings1} ref={sliderRef}>
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
        <div className={`h-[66.6%] w-full overflow-hidden`}>
          <Slider {...settings2} ref={sliderRef}>
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 2 &&
    layoutZone.name === "Portrait Layout 12"
  ) {
    layoutContent = (
      <div className="h-screen w-screen">
        <div className={`h-[89.5%] w-full overflow-hidden`}>
          <Slider {...settings1} ref={sliderRef}>
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
        <div className={`h-[10.4%] w-full overflow-hidden`}>
          <Slider {...settings2} ref={sliderRef}>
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 2 &&
    layoutZone.name === "Portrait Layout 13"
  ) {
    layoutContent = (
      <div className="h-screen w-screen">
        <div className={`h-[10.4%] w-full overflow-hidden`}>
          <Slider {...settings1} ref={sliderRef}>
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
        <div className={`h-[89.5%] w-full overflow-hidden`}>
          <Slider {...settings2} ref={sliderRef}>
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 2 &&
    layoutZone.name === "Portrait Layout 14"
  ) {
    layoutContent = (
      <div className="h-screen w-screen">
        <div className={`h-[50%] w-full overflow-hidden`}>
          <Slider {...settings1} ref={sliderRef}>
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
        <div className={`h-[50%] w-full overflow-hidden`}>
          <Slider {...settings2} ref={sliderRef}>
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 1 &&
    layoutZone.name === "Landscape Layout 01"
  ) {
    layoutContent = (
      <div className="h-screen w-screen flex flex-wrap">
        <div className="h-[1080px] w-[1920px] flex overflow-hidden">
          <Slider {...settings1} ref={sliderRef}>
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 3 &&
    layoutZone.name === "Landscape Layout 02"
  ) {
    layoutContent = (
      <div className="h-screen w-screen flex flex-wrap">
        <div className={`w-[81.5%] h-[81.5%] flex overflow-hidden`}>
          <Slider {...settings1} ref={sliderRef} className="w-full h-full">
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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

        <div className={`w-[18.5%] h-[81.5%] flex overflow-hidden`}>
          <Slider {...settings2} ref={sliderRef} className="w-full h-full">
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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

        <div className={`w-full h-[18.5%] flex overflow-hidden`}>
          <Slider {...settings3} ref={sliderRef} className="w-full h-full">
            {zone3slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 3 &&
    layoutZone.name === "Landscape Layout 03"
  ) {
    layoutContent = (
      <div className="h-screen w-screen flex flex-wrap">
        <div className={`w-[18.5%] h-[81.5%] flex overflow-hidden`}>
          <Slider {...settings1} ref={sliderRef} className="w-full h-full">
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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

        <div className={`w-[81.5%] h-[81.5%] flex overflow-hidden`}>
          <Slider {...settings2} ref={sliderRef} className="w-full h-full">
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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

        <div className={`w-full h-[18.5%] flex overflow-hidden`}>
          <Slider {...settings3} ref={sliderRef} className="w-full h-full">
            {zone3slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 2 &&
    layoutZone.name === "Landscape Layout 04"
  ) {
    layoutContent = (
      <div className="h-screen w-screen flex flex-wrap">
        <div className={`w-[56.25%] h-full flex overflow-hidden`}>
          <Slider {...settings1} ref={sliderRef} className="w-full h-full">
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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

        <div className={`w-[43.75%] h-full flex overflow-hidden`}>
          <Slider {...settings2} ref={sliderRef} className="w-full h-full">
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 2 &&
    layoutZone.name === "Landscape Layout 05"
  ) {
    layoutContent = (
      <div className="h-screen w-screen flex flex-wrap">
        <div className={`w-[43.75%] h-full flex overflow-hidden`}>
          <Slider {...settings1} ref={sliderRef} className="w-full h-full">
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
        <div className={`w-[56.25%] h-full flex overflow-hidden`}>
          <Slider {...settings2} ref={sliderRef} className="w-full h-full">
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
      </div>
    );
  } else if (
    layoutZone &&
    layoutZone.zoneCount === 2 &&
    layoutZone.name === "Landscape Layout 06"
  ) {
    layoutContent = (
      <div className="h-screen w-screen flex flex-wrap">
        <div className={`w-[50%] h-full flex overflow-hidden`}>
          <Slider {...settings1} ref={sliderRef} className="w-full h-full">
            {zone1slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
        <div className={`w-[50%] h-full flex overflow-hidden`}>
          <Slider {...settings2} ref={sliderRef} className="w-full h-full">
            {zone2slides.map((slide, index) => (
              <div
                key={index}
                className="w-full h-full relative cursor-pointer"
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
      </div>
    );
  } else {
    layoutContent = (
      <div className="h-screen w-screen">
        <div className="w-[100%] bg-black-500 flex items-center justify-center"></div>
      </div>
    );
  }
  return (
    <Box sx={{ width: "100%" }} ref={containerRef}>
      {layoutContent || <p>No layout available</p>}
    </Box>
  );
};

export default DynamicSlider;
