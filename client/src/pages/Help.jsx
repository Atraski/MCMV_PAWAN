import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Help = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8DC] to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Need Help?</h1>
        <div className="bg-white rounded-xl shadow-md p-12">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Frequently Asked Questions</h2>
              <p className="text-gray-600">Find answers to common questions about MyCityMyVoice.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Support</h2>
              <p className="text-gray-600">Email us at support@mycitymyvoice.com</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Help;












