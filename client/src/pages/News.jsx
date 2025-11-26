import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const News = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navbar />
      <div className="flex-1 text-white p-8">
        <h1 className="text-4xl font-bold mb-4">News</h1>
        <p>News page content coming soon...</p>
      </div>
      <Footer />
    </div>
  );
};

export default News;




