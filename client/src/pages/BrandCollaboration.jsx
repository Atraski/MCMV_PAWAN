import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BrandCollaboration = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8DC] to-[#FFFEF0]">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="pt-20 sm:pt-24">
        <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Area */}
            <div className="text-center mb-12 sm:mb-16">
              {/* Briefcase Icon */}
              <div className="flex justify-center mb-6">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              {/* Main Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 sm:mb-8">
                Brand Collaboration & Sponsorships
              </h2>
              
              {/* Subtitle */}
              <p className="text-gray-700 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
                Partner with <span className="text-[#FFD700] font-bold">My City My Voice</span> — where creativity meets visibility. Collaborate with us to grow your brand, engage audiences, and make an impact.
              </p>
            </div>

            {/* Central Call-to-Action Card */}
            <div className="bg-[#FFD700] rounded-2xl p-8 sm:p-10 md:p-12 shadow-lg mb-12 sm:mb-16">
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Earn Recognition with Us
                </h3>
                <p className="text-gray-800 text-sm sm:text-base md:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto">
                  Collaborate with our platform for exclusive sponsorships, featured promotions, and event branding opportunities.
                </p>
                <button className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-8 sm:px-10 rounded-lg text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto">
                  Partner With Us
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Collaborations Section */}
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-8 sm:mb-12">
                Our Past & Current Collaborations
              </h3>
              
              {/* Logos Scrolling Container */}
              <div className="overflow-hidden max-w-full">
                <div className="flex animate-scroll-logos gap-6 sm:gap-8">
                  {/* First set of logos */}
                  <div className="flex gap-6 sm:gap-8 flex-shrink-0">
                    {/* Defence Bakery Logo */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex items-center justify-center flex-shrink-0 w-48 sm:w-56 h-32 sm:h-40">
                      <img 
                        src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763633390/defence_bakery_logo_snzaai.jpg" 
                        alt="Defence Bakery" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* Gaur City Mall Logo */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex items-center justify-center flex-shrink-0 w-48 sm:w-56 h-32 sm:h-40">
                      <img 
                        src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763633433/gaur-city-mall_g7od72.jpg" 
                        alt="Gaur City Mall" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* GoStops Logo */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex items-center justify-center flex-shrink-0 w-48 sm:w-56 h-32 sm:h-40">
                      <img 
                        src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763633459/goStops_logo_700x400_pjlnbj.png" 
                        alt="GoStops" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* Kunzum Logo */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex items-center justify-center flex-shrink-0 w-48 sm:w-56 h-32 sm:h-40">
                      <img 
                        src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763633478/kunzum_logo_jpg_iuyutb.png" 
                        alt="Kunzum" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* Oxford Bookstore Logo */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex items-center justify-center flex-shrink-0 w-48 sm:w-56 h-32 sm:h-40">
                      <img 
                        src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763633548/oxford_bookstore_logo_kofxas.jpg" 
                        alt="Oxford Bookstore" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* Third Wave Coffee Logo */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex items-center justify-center flex-shrink-0 w-48 sm:w-56 h-32 sm:h-40">
                      <img 
                        src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763633568/third_wave_coffee_yh97rt.png" 
                        alt="Third Wave Coffee" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* Tong Garden Logo */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex items-center justify-center flex-shrink-0 w-48 sm:w-56 h-32 sm:h-40">
                      <img 
                        src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763633584/tong_garden_logo_eu8lce.png" 
                        alt="Tong Garden" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Duplicate set for seamless loop */}
                  <div className="flex gap-6 sm:gap-8 flex-shrink-0">
                    {/* Defence Bakery Logo */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex items-center justify-center flex-shrink-0 w-48 sm:w-56 h-32 sm:h-40">
                      <img 
                        src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763633390/defence_bakery_logo_snzaai.jpg" 
                        alt="Defence Bakery" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* Gaur City Mall Logo */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex items-center justify-center flex-shrink-0 w-48 sm:w-56 h-32 sm:h-40">
                      <img 
                        src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763633433/gaur-city-mall_g7od72.jpg" 
                        alt="Gaur City Mall" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* GoStops Logo */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex items-center justify-center flex-shrink-0 w-48 sm:w-56 h-32 sm:h-40">
                      <img 
                        src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763633459/goStops_logo_700x400_pjlnbj.png" 
                        alt="GoStops" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* Kunzum Logo */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex items-center justify-center flex-shrink-0 w-48 sm:w-56 h-32 sm:h-40">
                      <img 
                        src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763633478/kunzum_logo_jpg_iuyutb.png" 
                        alt="Kunzum" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* Oxford Bookstore Logo */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex items-center justify-center flex-shrink-0 w-48 sm:w-56 h-32 sm:h-40">
                      <img 
                        src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763633548/oxford_bookstore_logo_kofxas.jpg" 
                        alt="Oxford Bookstore" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* Third Wave Coffee Logo */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex items-center justify-center flex-shrink-0 w-48 sm:w-56 h-32 sm:h-40">
                      <img 
                        src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763633568/third_wave_coffee_yh97rt.png" 
                        alt="Third Wave Coffee" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* Tong Garden Logo */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex items-center justify-center flex-shrink-0 w-48 sm:w-56 h-32 sm:h-40">
                      <img 
                        src="https://res.cloudinary.com/dfb2esugz/image/upload/v1763633584/tong_garden_logo_eu8lce.png" 
                        alt="Tong Garden" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
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

export default BrandCollaboration;




