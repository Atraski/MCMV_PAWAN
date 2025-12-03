import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MeetTheTeam = () => {
  const [selectedRole, setSelectedRole] = useState('north');

  const teamMembers = {
    north: {
      role: 'North Regional Head',
      previousExperience: 'Previous Experience',
      name: 'NAME',
      description: 'Bio/Description will go here for the North Regional Head.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
    },
    south: {
      role: 'South Regional Head',
      previousExperience: 'Previous Experience',
      name: 'NAME',
      description: 'Bio/Description will go here for the South Regional Head.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
    },
    east: {
      role: 'East Regional Head',
      previousExperience: 'Previous Experience',
      name: 'NAME',
      description: 'Bio/Description will go here for the East Regional Head.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
    },
    west: {
      role: 'West Regional Head',
      previousExperience: 'Poet, Lyricist & Spoken Word Artist',
      name: 'Nehal Bhanushali',
      description: 'Nehal Bhanushali is a poet, lyricist, and spoken word artist whose words effortlessly connect with diverse audiences. With 250+ performances since 2017 and notable appearances alongside artists like Helly Shah and Priya Malik, she has built a strong presence in the spoken word circuit. As the Western Region Head of MCMV, she is dedicated to nurturing creative communities and amplifying authentic voices across the region.',
      image: 'https://res.cloudinary.com/dfb2esugz/image/upload/v1764765775/west_regional_head_ph1uhm.jpg'
    }
  };

  const roles = [
    { id: 'north', label: 'NORTH REGIONAL HEAD' },
    { id: 'south', label: 'SOUTH REGIONAL HEAD' },
    { id: 'east', label: 'EAST REGIONAL HEAD' },
    { id: 'west', label: 'WEST REGIONAL HEAD' }
  ];

  const currentMember = teamMembers[selectedRole];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="pt-20 sm:pt-24">
        {/* Top Section - Header */}
        <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 text-center mb-8 sm:mb-12">
              MEET THE TEAM
            </h1>

            {/* Role Navigation Tabs */}
            <div className="overflow-x-auto mb-8 sm:mb-12 scrollbar-hide">
              <div className="flex flex-nowrap justify-center gap-4 sm:gap-6 md:gap-8 min-w-max px-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`text-xs sm:text-sm md:text-base font-medium transition-all duration-300 pb-2 whitespace-nowrap ${
                      selectedRole === role.id
                        ? 'text-gray-900 border-b-2 border-[#FFD700]'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Section - Profile Display */}
        <section className="bg-white py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white border border-gray-200 shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-0">
                {/* Left Side - Profile Picture (2 parts out of 6) */}
                <div className="lg:col-span-2 bg-white flex items-center justify-center  h-full">
                  <div className="w-full h-full">
                    <img
                      src={currentMember.image}
                      alt={currentMember.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Right Side - Profile Details (4 parts out of 6) */}
                <div className="lg:col-span-4 bg-[#1A1A2E] p-8 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-center h-full">
                  <div className="text-white space-y-4 sm:space-y-5 md:space-y-6">
                    {/* Previous Experience */}
                    <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-normal">
                      {currentMember.previousExperience}
                    </p>

                    {/* Name */}
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white uppercase leading-tight">
                      {currentMember.name}
                    </h2>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-gray-300 leading-relaxed pr-4">
                      {currentMember.description}
                    </p>
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

export default MeetTheTeam;
