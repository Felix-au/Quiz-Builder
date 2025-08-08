import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import { AnimatePresence, motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const videos = [
  {
    src: "/manual copy.mp4",
    title: "How to Use PrashnaSetu (Demo)",
    thumb: "/logo2.png"
  },
  {
    src: "/manual copy.mp4",
    title: "How to Use PrashnaSetu (Demo)",
    thumb: "/logo23.png"
  },
  ...Array.from({ length: 9 }).map((_, i) => ({
    src: "",
    title: `Sample Video ${i + 2}`,
    thumb: "/logo2.png"
  }))
];



export default function VideoGallery() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<null | typeof videos[0]>(null);
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef<Slider>(null);

  const openModal = (video: typeof videos[0]) => {
    if (video.src) {
      setActiveVideo(video);
      setModalOpen(true);
    }
  };
  const closeModal = () => {
    setModalOpen(false);
    setActiveVideo(null);
  };

  const settings = {
    infinite: true,
    centerMode: true,
    centerPadding: "0px",
    slidesToShow: 3,
    slidesToScroll: 1,
    speed: 600,
    autoplay: true,
    autoplaySpeed: 1800,
    arrows: false,
    focusOnSelect: true,
    beforeChange: (_: number, next: number) => setCurrent(next),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: false,
        }
      }
    ]
  };

  useEffect(() => {
    // Add custom CSS for carousel styling
    const style = document.createElement('style');
    style.textContent = `
      .video-carousel .slick-slide {
        padding: 0 20px;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        z-index: 1;
      }
      .video-carousel .slick-slide.slick-center {
        transform: scale(1.2) translateY(0px);
        opacity: 1;
        z-index: 50;
      }
      .video-carousel .slick-slide:not(.slick-center) {
        transform: scale(0.7) translateY(40px);
        opacity: 0.5;
        filter: blur(1px);
        z-index: 30;
      }
      .video-carousel .slick-arrow {
        z-index: 20;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(99, 102, 241, 0.1) !important;
        border: 2px solid rgba(99, 102, 241, 0.3) !important;
      }
      .video-carousel .slick-arrow:hover {
        background: rgba(99, 102, 241, 0.2) !important;
        border-color: rgba(99, 102, 241, 0.5) !important;
      }
      .video-carousel .slick-arrow:before {
        color: #6366f1 !important;
        font-size: 18px !important;
      }
      .video-carousel .slick-prev {
        left: 20px !important;
      }
      .video-carousel .slick-next {
        right: 20px !important;
      }
      .video-carousel .slick-dots {
        bottom: -50px !important;
      }
      .video-carousel .slick-dots li button:before {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div className="relative w-full">
      <div className="w-full select-none video-carousel">
        <Slider ref={sliderRef} {...settings}>
          {videos.map((video, idx) => (
            <div key={video.title + idx} className="px-2">
              <div
                className="flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105"
                style={{ background: "none", boxShadow: "none", border: "none" }}
                onClick={() => openModal(video)}
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
                  <img
                    src={video.thumb}
                    alt={video.title}
                    className="w-80 h-44 md:w-96 md:h-54 object-contain mb-6 rounded-xl shadow-lg aspect-video"
                    style={{ border: "none", background: "rgba(255,255,255,0.05)" }}
                  />
                  <span className="text-base md:text-lg text-black font-bold text-center block leading-tight">
                    {video.title}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
      {/* Custom Dot Navigation */}
      <div className="flex justify-center mt-6 mb-8">
        {videos.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrent(idx);
              sliderRef.current?.slickGoTo(idx);
            }}
            className={`w-4 h-4 rounded-full mx-1 transition-all duration-300 ${idx === current ? 'bg-black scale-125' : 'bg-gray-400 hover:bg-gray-600 border-2 border-gray-600'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
      {/* Modal */}
      <AnimatePresence>
        {modalOpen && activeVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <button
              className="absolute top-4 right-4 text-3xl text-white hover:text-red-500 font-bold z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
              onClick={closeModal}
              aria-label="Close"
            >
              ×
            </button>
            <motion.div
              className="bg-white rounded-xl shadow-xl p-4 relative flex flex-col items-center"
              style={{ width: "80vw", maxWidth: 900, height: "80vh", maxHeight: 600 }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            >
              <video
                src={activeVideo.src}
                controls
                autoPlay
                className="w-full h-full rounded-lg"
                style={{ maxHeight: "calc(80vh - 60px)" }}
              />
              <div className="text-lg font-semibold text-indigo-700 mt-2 text-center">
                {activeVideo.title}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
