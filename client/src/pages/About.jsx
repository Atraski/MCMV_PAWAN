import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const bannerRef = useRef(null);
  const secondBannerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          
          // Parallax for first banner - moves slower than scroll
          if (bannerRef.current) {
            const bannerTop = bannerRef.current.parentElement.offsetTop;
            const bannerHeight = bannerRef.current.parentElement.offsetHeight;
            const windowHeight = window.innerHeight;
            
            // Only apply parallax when banner is in view
            if (scrolled + windowHeight > bannerTop && scrolled < bannerTop + bannerHeight) {
              const rate = (scrolled - bannerTop) * 0.3;
              bannerRef.current.style.transform = `translateY(${rate}px)`;
            }
          }

          // Parallax for second banner - moves slower than scroll
          if (secondBannerRef.current) {
            const bannerTop = secondBannerRef.current.parentElement.offsetTop;
            const bannerHeight = secondBannerRef.current.parentElement.offsetHeight;
            const windowHeight = window.innerHeight;
            
            // Only apply parallax when banner is in view
            if (scrolled + windowHeight > bannerTop && scrolled < bannerTop + bannerHeight) {
              const rate = (scrolled - bannerTop) * 0.25;
              secondBannerRef.current.style.transform = `translateY(${rate}px)`;
            }
          }

          // Parallax for content section - subtle reverse effect
          if (contentRef.current) {
            const contentTop = contentRef.current.offsetTop;
            const contentHeight = contentRef.current.offsetHeight;
            const windowHeight = window.innerHeight;
            
            // Only apply parallax when content is in view
            if (scrolled + windowHeight > contentTop && scrolled < contentTop + contentHeight) {
              const rate = (scrolled - contentTop) * -0.15;
              contentRef.current.style.transform = `translateY(${rate}px)`;
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    // Check if device supports smooth scrolling (desktop typically)
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial call
    }

    return () => {
      if (!isMobile) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: 'What is My City My Voice',
      answer: 'My City My Voice is a community-driven open-mic platform that gives writers, poets, storytellers, comics, and musicians a stage to perform and grow. It runs regular chapters and events across Indian cities, helping emerging artists showcase their work and connect with audiences.'
    },
    {
      question: 'How can I participate in an event?',
      answer: 'Begin by creating an account on the My City My Voice website. Following this, visit the upcoming events page and select your preferred city and category. Once registered, you\'ll receive event details and performance confirmation.'
    },
    {
      question: 'Is membership required to perform?',
      answer: 'No, you don\'t need a membership to perform at My City My Voice. Anyone can register for an event and take the stage. But our members will receive early access to bookings, discounts, and special events.'
    },
    {
      question: 'How can I collaborate or sponsor an event?',
      answer: 'You can reach out to us at support@mycitymyvoice.in. Our team will connect with you to discuss partnership and sponsorship opportunities.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="pt-16 sm:pt-20">
        {/* Banner Section */}
        <section className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] via-[#FFE44D] to-[#FFF8DC] opacity-90 z-10"></div>
          <div ref={bannerRef} className="absolute inset-0 will-change-transform" style={{ transition: 'transform 0.1s ease-out' }}>
            <img
              src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763639448/DSC04576_ex4ytg.jpg"
              alt="My City My Voice Community"
              className="w-full h-full object-cover"
              style={{ minHeight: '120%', objectPosition: 'center' }}
            />
          </div>
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="text-center px-4 sm:px-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                About <span className="text-[#FFD700]">MyCityMyVoice</span>
              </h1>
              <p className="text-white text-sm sm:text-base md:text-lg max-w-3xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                Celebrating raw, real, and rising talent from every corner of the city
              </p>
            </div>
          </div>
        </section>

        {/* About MCMV Section */}
        <section ref={contentRef} className="bg-gradient-to-b from-white to-[#FFF8DC] py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 will-change-transform" style={{ transition: 'transform 0.1s ease-out' }}>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 lg:p-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                <span className="text-gray-800">About </span>
                <span className="text-[#FFD700]">MCMV</span>
              </h2>
              
              <div className="space-y-4 sm:space-y-5 md:space-y-6 text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                <p>
                  MyCityMyVoice is a growing community-driven platform that celebrates raw, real, and rising talent from every corner of the city. From open mics to curated showcases, we provide a stage for storytellers, poets, musicians, comedians, and performers of all kinds to express, connect, and thrive. Built on passion and purpose, mycitymyvoice brings together artists and audiences to share authentic experiences through the power of performance.
                </p>
                
                <p className="font-semibold text-gray-900">
                  With over <span className="text-[#FFD700]">140+ open mics</span> across <span className="text-[#FFD700]">30+ cities</span>, and roots in expression and culture, My City My Voice celebrates the soul of every individual it touches.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Second Banner Section (Optional) */}
        <section className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <style>{`
            @media (min-width: 768px) {
              .about-rahul-image {
                object-position: center 20% !important;
              }
            }
          `}</style>
          <div ref={secondBannerRef} className="absolute inset-0 will-change-transform" style={{ transition: 'transform 0.1s ease-out' }}>
            <img
              src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763640117/Rahul_hsdrn4.jpg"
              alt="My City My Voice Events"
              className="w-full h-full object-cover about-rahul-image"
              style={{ minHeight: '120%' }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 flex items-center justify-center">
            <div className="text-center px-4 sm:px-6">
              <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Join the Movement. Amplify Your Voice.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-gradient-to-b from-[#FFF8DC] to-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                <span className="text-gray-800">MCMV </span>
                <span className="text-[#FFD700]">Frequently Asked Questions</span>
              </h2>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg">
                Everything you need to know about My City My Voice
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-offset-2"
                  >
                    <span className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 pr-4">
                      {index + 1}. {faq.question}
                    </span>
                    <svg
                      className={`w-5 h-5 sm:w-6 sm:h-6 text-[#FFD700] flex-shrink-0 transition-transform duration-300 ${
                        openFAQ === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  
                  {openFAQ === index && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-5">
                      <div className="pt-2 sm:pt-3 border-t border-gray-200">
                        <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-8 sm:mt-12 text-center">
              <div className="bg-gradient-to-r from-[#FFD700] to-[#FFE44D] rounded-xl shadow-lg p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Still have questions?
                </h3>
                <p className="text-gray-800 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
                  Reach out to us at{' '}
                  <a
                    href="mailto:support@mycitymyvoice.in"
                    className="text-gray-900 font-semibold hover:underline"
                  >
                    support@mycitymyvoice.in
                  </a>
                </p>
                <a
                  href="/contact"
                  className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
