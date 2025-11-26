import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AppDownload = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8DC] to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Get the MyCityMyVoice App</h1>
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">Download our mobile app for the best experience!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Download for iOS
            </button>
            <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Download for Android
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AppDownload;












