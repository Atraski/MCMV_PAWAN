import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroCarousel, { HeroContent } from '../components/HeroCarousel';
import mapImage from '../assets/map.jpeg';
import { uploadAPI } from '../services/api';

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [carouselImages, setCarouselImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch banners from backend
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await uploadAPI.getBanners('hero');
      
      // Primary hero image from Cloudinary
      const primaryImage = {
        id: 'primary-hero',
        url: 'https://res.cloudinary.com/dfb2esugz/image/upload/v1763639448/DSC04576_ex4ytg.jpg',
        alt: 'My City My Voice Hero',
        title: 'My City My Voice',
      };
      
      if (response.success && response.banners.length > 0) {
        // Transform banners to carousel format and prepend primary image
        const images = response.banners.map((banner, index) => ({
          id: banner._id,
          url: banner.imageUrl,
          alt: banner.alt || banner.title,
          title: banner.title,
        }));
        // Add primary image at the beginning
        setCarouselImages([primaryImage, ...images]);
      } else {
        // Fallback to default images with primary image first
        setCarouselImages([
          primaryImage,
          {
            id: 'rahul-hero',
            url: 'https://res.cloudinary.com/dfb2esugz/image/upload/v1763640117/Rahul_hsdrn4.jpg',
            alt: 'Rahul',
          },
          {
            id: 1,
            url: 'https://res.cloudinary.com/dfb2esugz/image/upload/v1764764373/pune_website_picture_fpepvh.png',
            alt: 'Pune',
          },
          {
            id: 2,
            url: 'https://res.cloudinary.com/dfb2esugz/image/upload/v1764764774/mumbai_website_picture_i09j88.png',
            alt: 'Mumbai',
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      // Fallback to default images on error with primary image first
      setCarouselImages([
        {
          id: 'primary-hero',
          url: 'https://res.cloudinary.com/dfb2esugz/image/upload/v1763639448/DSC04576_ex4ytg.jpg',
          alt: 'My City My Voice Hero',
          title: 'My City My Voice',
        },
        {
          id: 'rahul-hero',
          url: 'https://res.cloudinary.com/dfb2esugz/image/upload/v1763640117/Rahul_hsdrn4.jpg',
          alt: 'Rahul',
        },
        {
          id: 1,
          url: 'https://res.cloudinary.com/dfb2esugz/image/upload/v1764764373/pune_website_picture_fpepvh.png',
          alt: 'Pune',
        },
        {
          id: 2,
          url: 'https://res.cloudinary.com/dfb2esugz/image/upload/v1764764774/mumbai_website_picture_i09j88.png',
          alt: 'Mumbai',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="relative">
      {/* Navbar - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      
      {/* Hero Section - Fixed and Static (background only) */}
      <HeroCarousel currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} isAutoPlaying={isAutoPlaying} setIsAutoPlaying={setIsAutoPlaying} carouselImages={carouselImages} />
      
      {/* Hero Content - Scrolls with page */}
      <div className="relative z-10" style={{ marginTop: '0' }}>
        <HeroContent currentIndex={currentIndex} goToSlide={goToSlide} carouselImages={carouselImages} />
      </div>
      
      {/* Content Sections - Scroll over hero section */}
      <div className="relative z-10 bg-white">
        {/* About Section */}
      <section className="bg-gradient-to-b from-[#FFF8DC] to-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10">
            <span className="text-gray-800">About </span>
            <span className="text-[#FFD700]">MyCityMyVoice</span>
          </h2>
          
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 space-y-4 sm:space-y-5">
            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
              <span className="font-bold text-gray-900">MyCityMyVoice</span> is a citizen-driven platform designed to empower people to share their opinions, ideas, and civic issues directly with local authorities. It's a digital bridge between citizens and government, making urban governance more transparent and effective.
            </p>
            
            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
              Our goal is to make every citizen's voice heard and valued — creating smarter, cleaner, and more connected cities for the future. Through technology, collaboration, and participation, we bring communities together for real change.
            </p>
            
            <div className="flex justify-center pt-4">
              <Link
                to="/about"
                className="bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 font-semibold py-2.5 px-6 sm:px-8 rounded-full text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Know More
              </Link>
            </div>
          </div>
        </div>
      </section>

        {/* Core Features Section */}
        <section className="bg-gradient-to-b from-white to-[#FFF8DC] py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-10">
              <span className="text-gray-900">Discover Our </span>
              <span className="text-[#FFD700]">Core Features</span>
            </h2>
            
            <p className="text-gray-700 text-xs sm:text-sm md:text-base text-center mb-10 sm:mb-12 md:mb-16 max-w-4xl mx-auto leading-relaxed">
              <span className="text-[#FFD700] font-semibold">My City My Voice</span> empowers every citizen to express, connect, and collaborate — transforming everyday creativity into extraordinary experiences.
            </p>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 md:gap-8">
              {/* Feature Card 1: Raise Your Voice */}
              <div className="bg-white rounded-lg shadow-lg p-6 sm:p-7 md:p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-10 md:h-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Raise Your Voice</h3>
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                  Speak your mind and share stories that matter. Your opinions can inspire real change across your city.
                </p>
              </div>

              {/* Feature Card 2: Community Connect */}
              <div className="bg-white rounded-lg shadow-lg p-6 sm:p-7 md:p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-10 md:h-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Community Connect</h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  Collaborate with like-minded citizens, artists, and creators — grow together in a vibrant network of voices.
                </p>
              </div>

              {/* Feature Card 3: Citywide Events */}
              <div className="bg-white rounded-lg shadow-lg p-6 sm:p-7 md:p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-10 md:h-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Citywide Events</h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  Discover live shows, open mics, and cultural events near you — experience your city like never before.
                </p>
              </div>

              {/* Feature Card 4: Podcast Studio */}
              <div className="bg-white rounded-lg shadow-lg p-6 sm:p-7 md:p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-10 md:h-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Podcast Studio</h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  Record, host, and share your thoughts with the world. Create your own digital space to express freely.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-12 sm:mb-16 md:mb-20">
              How we bridge our mission with vision?
            </h2>
            
            {/* MISSION Card - Parent Container */}
            <div className="bg-gradient-to-r from-[#FFD700] to-[#FFF8DC] rounded-2xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
                {/* Left Section - Text Content */}
                <div className="p-8 sm:p-10 md:p-12 lg:p-14 xl:p-16 flex flex-col">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-5 sm:mb-6 md:mb-7" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    MISSION
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl italic text-gray-900 mb-6 sm:mb-7 md:mb-8 font-medium leading-relaxed">
                    Imbibe the proficiency in your voice from your very own city!
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-900 leading-relaxed">
                    My City My Voice is a platform committed to blowing wind beneath the wings of aspiring writers and budding stand-up speakers to project their art across the nation. Laying out the best of the maestros from the core of the country, we provide the opportunity for you to portray your competence and abide by the saying — "ability is nothing without opportunity", so resolve to seize it!
                  </p>
                </div>

                {/* Right Section - Image inside MISSION card */}
                <div className="lg:rounded-r-2xl rounded-b-2xl lg:rounded-b-none overflow-hidden h-full flex">
                  <img 
                    src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763726584/IMG_20250511_191149_816_dzvp7l.jpg" 
                    alt="My City My Voice Mission" 
                    className="w-full h-full object-cover min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Budding Wings Section */}
        <section className="bg-[#1A1A2E] py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                <span className="text-white">Budding Wings of </span>
                <span className="text-[#FFD700]">MCMV</span>
              </h2>
              <p className="text-white text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
                Showcasing the creative wings that make My City My Voice soar — where imagination meets expression.
              </p>
            </div>
            
            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
              {/* Card 1 - Yellow */}
              <div className="bg-[#FFD700] rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 ease-in-out hover:-translate-y-3 hover:scale-105 cursor-pointer transform group">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center transition-transform duration-500 group-hover:scale-110">
                  Live From Couch
                </h3>
              </div>

              {/* Card 2 - White */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 ease-in-out hover:-translate-y-3 hover:scale-105 cursor-pointer transform group">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center transition-transform duration-500 group-hover:scale-110">
                  MCMV Bookstore
                </h3>
              </div>

              {/* Card 3 - Yellow */}
              <div className="bg-[#FFD700] rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 ease-in-out hover:-translate-y-3 hover:scale-105 cursor-pointer transform group">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center transition-transform duration-500 group-hover:scale-110">
                  The Voice Fest
                </h3>
              </div>

              {/* Card 4 - White */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 ease-in-out hover:-translate-y-3 hover:scale-105 cursor-pointer transform group">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center transition-transform duration-500 group-hover:scale-110">
                  Talk About
                </h3>
              </div>

              {/* Card 5 - Yellow */}
              <div className="bg-[#FFD700] rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 ease-in-out hover:-translate-y-3 hover:scale-105 cursor-pointer transform group">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center transition-transform duration-500 group-hover:scale-110">
                  MCMV Media
                </h3>
              </div>
            </div>
          </div>
        </section>

        {/* Note from the Founder Section */}
        <section className="bg-white py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                <span className="text-gray-900">Note from the </span>
                <span className="text-[#FFD700]">Founder</span>
              </h2>
            </div>
            
            <div className="bg-gradient-to-br from-[#FFF8DC] to-white rounded-2xl shadow-lg p-8 sm:p-10 md:p-12 lg:p-16">
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
                {/* Founder Image */}
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  <div className="w-64 h-32 sm:w-40 sm:h-52 md:w-48 md:h-64 rounded-3xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-1.5 sm:p-2 shadow-lg">
                    <div className="w-full h-full rounded-3xl bg-gray-200 flex items-center justify-center overflow-hidden">
                      <img
                        src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763728045/WhatsApp_Image_2025-11-21_at_17.51.27_fzqg0t.jpg"
                        alt="Anish Dhar - Founder"
                        className="w-full h-full object-cover rounded-3xl"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Note Content */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Anish Dhar
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                    Founder & Creative Director
                  </p>
                  <div className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed space-y-4">
                    <p>
                      Welcome to My City My Voice, a platform born from the belief that every voice matters and every story deserves to be heard. As we continue to grow and expand across India, our mission remains simple yet powerful: to create a digital space where citizens can express themselves freely, connect with their communities, and drive real change.
                    </p>
                    <p>
                      Through technology, creativity, and collaboration, we're building bridges between people and their cities, transforming everyday conversations into extraordinary movements. Thank you for being part of this journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reach Section */}
        <section className="bg-gradient-to-br from-[#FFF8DC] via-[#FFFEF0] to-[#FFE4B5] py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-[#FFD700] rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#FFA500] rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#FFD700] rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Header */}
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                <span className="text-gray-900">Reach of </span>
                <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
                  My City My Voice
                </span>
              </h2>
              <p className="text-gray-700 text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
                Connecting voices across India, one city at a time
              </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
              {/* Stat Card 1 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#FFD700] mb-2">
                  50+
                </div>
                <div className="text-xs sm:text-sm text-gray-700 font-medium">
                  Cities
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#FFD700] mb-2">
                  10K+
                </div>
                <div className="text-xs sm:text-sm text-gray-700 font-medium">
                  Active Users
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#FFD700] mb-2">
                  500+
                </div>
                <div className="text-xs sm:text-sm text-gray-700 font-medium">
                  Events
                </div>
              </div>

              {/* Stat Card 4 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#FFD700] mb-2">
                  25+
                </div>
                <div className="text-xs sm:text-sm text-gray-700 font-medium">
                  States
                </div>
              </div>
            </div>

            {/* Key Cities Showcase */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-10">
                Our Presence Across India
              </h3>
              
              {/* Cities Scrolling Marquee */}
              <div className="relative overflow-hidden py-4">
                <style>{`
                  @keyframes scroll {
                    0% {
                      transform: translateX(0);
                    }
                    100% {
                      transform: translateX(-50%);
                    }
                  }
                  .animate-scroll {
                    animation: scroll 20s linear infinite;
                    display: flex;
                    will-change: transform;
                  }
                  .animate-scroll:hover {
                    animation-play-state: paused;
                  }
                `}</style>
                <div className="flex animate-scroll gap-4 sm:gap-6">
                  {/* First set of cities */}
                  {['Kolkata', 'Thane', 'Bangalore', 'Noida', 'Hyderabad', 'Lucknow', 'Mumbai', 'Pune', 'Delhi', 'Chandigarh', 'Ahmedabad'].map((city, index) => (
                    <div 
                      key={`first-${index}`}
                      className="flex-shrink-0 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-lg p-3 sm:p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group w-[140px] sm:w-[160px]"
                    >
                      <div className="text-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-white transition-colors">
                          {city}
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Duplicate set for seamless loop */}
                  {['Kolkata', 'Thane', 'Bangalore', 'Noida', 'Hyderabad', 'Lucknow', 'Mumbai', 'Pune', 'Delhi', 'Chandigarh', 'Ahmedabad'].map((city, index) => (
                    <div 
                      key={`second-${index}`}
                      className="flex-shrink-0 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-lg p-3 sm:p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group w-[140px] sm:w-[160px]"
                    >
                      <div className="text-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-white transition-colors">
                          {city}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Growth Indicator */}
              <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <div className="text-2xl sm:text-3xl font-bold text-[#FFD700] mb-1">
                      Growing Every Day
                    </div>
                    <p className="text-sm sm:text-base text-gray-600">
                      Expanding to new cities and communities
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div 
                          key={i}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] border-2 border-white shadow-md"
                        ></div>
                      ))}
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-gray-900">
                      11 Cities
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-8 sm:mt-10">
              <p className="text-gray-700 text-sm sm:text-base mb-4">
                Want to bring My City My Voice to your city?
              </p>
              <Link
                to="/contact"
                className="inline-block bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 font-semibold py-2.5 px-6 sm:px-8 rounded-lg text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get In Touch
              </Link>
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer - Outside content div to ensure visibility */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Home;

