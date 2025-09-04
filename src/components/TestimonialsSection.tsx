import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const testimonials = [
  {
    name: "Dr. Arun Kumar Poonia",
    role: "Assistant Professor",
    institution: "School of Engineering & Technology",
    image: "/profiles/Arun-Kumar-Poonia-1-scaled.jpg",
    quote:
      "An Impactful green initiative - user friendly! Makes online quizzes more secure and ethical by incorporating anti -cheating mechanisms befitting Gen Z students!",
  },
  {
    name: "Dr. Reena Kumari",
    role: "Assistant Professor",
    institution: "School of Management",
    image: "/profiles/reenakumari.jpg",
    quote:
      "PrashnaSetu software has made the Quiz evaluations very fast and transparent process. It has successfully eradicated all unfair practices during Quiz Evaluations. It's user friendly for both the students and the faculties. I have personally used this for my Quiz evaluations. It has turned to be the best experience for me and as well as for my students.",
  },
  {
    name: "Suresh Kumar",
    role: "Assessment Coordinator",
    institution: "GG",
    image: "/profiles/profile2.jpg",
    quote: "PrashnaSetu's multi-role access control and performance analytics have streamlined our entire assessment workflow.",
  },
  {
    name: "James Wilson",
    role: "IT Administrator",
    institution: "GG",
    image: "/profiles/profile2.jpg",
    quote: "Implementation was seamless, and the proctoring features ensure academic integrity. Our faculty loves the user-friendly design.",
  },
  {
    name: "Dr. Palak Goel",
    role: "Assistant Professor",
    institution: "School of Engineering & Technology",
    image: "/profiles/palakgoel.png",
    quote: "I used Prashnasetu for conducting a Mathematics quiz, and it was a smooth and efficient experience, an excellent tool for academic assessments. Thanks to Dr. Kiran Sharma and the team for their efforts.",
  }
];

export default function TestimonialsSection({ onDark = false }: { onDark?: boolean }) {
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef<Slider>(null);

  const settings = {
    infinite: true,
    centerMode: true,
    centerPadding: "0px",
    slidesToShow: 3,
    slidesToScroll: 1,
    speed: 600,
    autoplay: true,
    autoplaySpeed: 2500,
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
    // Add custom CSS for testimonials carousel styling
    const style = document.createElement('style');
    style.textContent = `
      .testimonials-carousel .slick-slide {
        padding: 0 15px;
        transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        z-index: 1;
      }
      .testimonials-carousel .slick-slide.slick-center {
        transform: scale(1.1) translateY(-10px);
        opacity: 1;
        z-index: 50;
      }
      .testimonials-carousel .slick-slide:not(.slick-center) {
        transform: scale(0.85) translateY(20px);
        opacity: 0.6;
        filter: blur(0.5px);
        z-index: 30;
      }
      .testimonials-carousel .slick-track {
        display: flex;
        align-items: center;
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
    <div className="relative w-full py-8">
      <div className="w-full select-none testimonials-carousel">
        <Slider ref={sliderRef} {...settings}>
          {testimonials.map((testimonial, idx) => (
            <div key={testimonial.name + idx} className="px-3">
              <motion.div
                className="flex flex-col items-center justify-center transition-all duration-500"
                whileHover={{ scale: 1.02 }}
              >
                <div className={`${onDark ? 'bg-white/10 border-white/20' : 'bg-white/90 border-gray-200'} backdrop-blur-lg rounded-3xl p-8 border shadow-2xl max-w-sm mx-auto`}>
                  {/* Profile Image */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-gradient-to-r from-blue-400 to-purple-500 shadow-lg"
                      />
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="text-center mb-6">
                    <p className={`${onDark ? 'text-white/90' : 'text-gray-700'} text-sm leading-relaxed`}>
                      {testimonial.quote}
                    </p>
                  </div>

                  {/* Name and Role */}
                  <div className="text-center">
                    <h4 className={`${onDark ? 'text-white' : 'text-gray-900'} font-bold text-lg`}>
                      {testimonial.name}
                    </h4>
                    <p className={`${onDark ? 'text-blue-300' : 'text-blue-600'} font-semibold text-sm mt-1`}>
                      {testimonial.role}
                    </p>
                    <p className={`${onDark ? 'text-white/70' : 'text-gray-600'} text-xs mt-1`}>
                      {testimonial.institution}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Custom Dot Navigation */}
      <div className="flex justify-center mt-8 mb-4">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrent(idx);
              sliderRef.current?.slickGoTo(idx);
            }}
            className={`w-3 h-3 rounded-full mx-1.5 transition-all duration-300 ${
              idx === current 
                ? `${onDark ? 'bg-blue-400' : 'bg-blue-600'} scale-125 shadow-lg` 
                : `${onDark ? 'bg-white/30 hover:bg-white/50' : 'bg-gray-400 hover:bg-gray-600'} border-2 ${onDark ? 'border-white/40' : 'border-gray-600'}`
            }`}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>

      {/* Decorative Elements */}
      <div className={`absolute top-10 left-10 w-32 h-32 ${onDark ? 'bg-blue-500/10' : 'bg-blue-200/30'} rounded-full blur-3xl -z-10`}></div>
      <div className={`absolute bottom-10 right-10 w-40 h-40 ${onDark ? 'bg-purple-500/10' : 'bg-purple-200/30'} rounded-full blur-3xl -z-10`}></div>
    </div>
  );
}
