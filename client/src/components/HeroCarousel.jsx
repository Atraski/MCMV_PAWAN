import { useState, useEffect } from 'react';

const HeroCarousel = ({ currentIndex = 0, setCurrentIndex, isAutoPlaying = true, setIsAutoPlaying, carouselImages = [] }) => {
  // Use props if provided, otherwise use local state
  const [localIndex, setLocalIndex] = useState(0);
  const [localAutoPlay, setLocalAutoPlay] = useState(true);
  
  const activeIndex = setCurrentIndex ? currentIndex : localIndex;
  const activeAutoPlay = setIsAutoPlaying ? isAutoPlaying : localAutoPlay;
  
  const updateIndex = (newIndex) => {
    if (setCurrentIndex) {
      setCurrentIndex(newIndex);
    } else {
      setLocalIndex(newIndex);
    }
  };
  
  const updateAutoPlay = (value) => {
    if (setIsAutoPlaying) {
      setIsAutoPlaying(value);
    } else {
      setLocalAutoPlay(value);
    }
  };

  // Auto-play carousel
  useEffect(() => {
    if (!activeAutoPlay || carouselImages.length === 0) return;

    const interval = setInterval(() => {
      updateIndex((activeIndex + 1) % carouselImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAutoPlay, activeIndex, carouselImages.length]);

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          .rahul-hero-image {
            object-position: center 20% !important;
          }
        }
      `}</style>
      <div 
        className="fixed top-0 left-0 right-0 w-full overflow-hidden z-0"
        style={{ height: '100vh', top: 0 }}
      >
        {/* Yellow Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFD700] z-50"></div>

        {/* Carousel Images - Static (no parallax) */}
        <div className="relative h-full w-full">
          {carouselImages.map((image, index) => {
            // Special positioning for Rahul image to show head on desktop
            const isRahulImage = image.id === 'rahul-hero' || image.alt?.toLowerCase().includes('rahul');
            
            return (
              <div
                key={image.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === activeIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className={`w-full h-full object-cover ${isRahulImage ? 'rahul-hero-image' : ''}`}
                />
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
            );
          })}
        </div>

      </div>
    </>
  );
};

// Export Hero Content as separate component for scrolling
export const HeroContent = ({ currentIndex, goToSlide, carouselImages }) => {
  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative z-10 min-h-screen flex items-center sm:items-end justify-center pb-12 sm:pb-16 md:pb-20 lg:pb-24 pt-12 sm:pt-32 md:pt-40 lg:pt-48">
      <div className="text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full mt-8 sm:mt-0">
        {/* Main Headline - Yellow, Professional Font */}
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 tracking-tight">
          <span className="text-[#FFD700] text-shadow font-heading drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Amplify Your Voice</span>
          <br />
          <span className="text-[#FFD700] text-shadow font-heading drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Join the Movement</span>
        </h1>

        {/* Sub-headline - White, Professional Font */}
        <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg mb-4 sm:mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-2">
          Discover live events, stand-up shows, and podcasts from voices that matter.
          <br className="hidden sm:block" />
          <span className="font-medium"> Be part of the change. Be part of MyCityMyVoice.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center items-center mb-6 sm:mb-8 md:mb-10">
          {/* Explore Events Button - Yellow */}
          <button className="bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 font-semibold py-2.5 sm:py-3 px-5 sm:px-6 md:px-8 rounded-full text-xs sm:text-sm md:text-base transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg w-full sm:w-auto min-w-[140px] sm:min-w-0 justify-center">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            <span>Explore Events</span>
          </button>

          {/* Start Podcast Button - Maroon */}
          <button className="bg-[#800020] hover:bg-[#900025] text-white font-semibold py-2.5 sm:py-3 px-5 sm:px-6 md:px-8 rounded-full text-xs sm:text-sm md:text-base transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg w-full sm:w-auto min-w-[140px] sm:min-w-0 justify-center">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <span>Start Podcast</span>
          </button>
        </div>

        {/* Scroll Indicator and Pagination Dots - Scrolls with content */}
        <div className="mt-4 sm:mt-6 md:mt-8 flex flex-col items-center justify-center w-full gap-3 sm:gap-4">
          {/* Carousel Indicators - Navigation Dots */}
          <div className="flex gap-2 sm:gap-3 items-center justify-center">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 sm:h-3 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentIndex
                    ? 'w-8 sm:w-12 bg-[#FFD700]'
                    : 'w-2 sm:w-3 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Scroll Indicator - Simple Yellow Text with Animation */}
          <button
            onClick={handleScrollDown}
            className="text-[#FFD700] text-xs sm:text-sm md:text-base font-medium flex items-center justify-center gap-2 animate-smooth-bounce text-center cursor-pointer hover:opacity-80 transition-opacity duration-200 bg-transparent border-none outline-none focus:outline-none"
            aria-label="Scroll down"
          >
            <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">↓</span>
            <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Scroll Down</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;

