// AboutPage.js
import { 
  FaArrowLeft, FaQrcode, FaUsers, FaChartBar, 
  FaShieldAlt, FaUtensils, FaMapMarkerAlt, FaCheckCircle, FaLinkedin, FaTimes, FaMailBulk, FaGlobe, FaGithub
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import imageURL1 from '../assets/about-image.png';
import imageURL2 from '../assets/Generate Token.png';
import imageURL3 from '../assets/Menu Management.png';
import imageURL4 from '../assets/Token List.png';
import imageURL5 from '../assets/Employees.png';

const AboutPage = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null); //  modal state

  const projectImages = [
    { src: imageURL1, title: "Home Dashboard", desc: "Overview of restaurant operations, orders, and analytics in one place." },
    { src: imageURL2, title: "Generate Bill", desc: "Admins can create Generate Bill for table ordering." },
    { src: imageURL3, title: "Menu Management", desc: "Admins can add, edit, and update menu items in real time." },
    { src: imageURL4, title: "Token List", desc: "Admins can view and manage all generated tokens." },
    { src: imageURL5, title: "Employees", desc: "Admins can add, edit, and update employee information." }
  ];

  const features = [
    { icon: <FaQrcode />, title: "Food Bill", desc: "Generate and manage food bills effortlessly." },
    { icon: <FaUtensils />, title: "Menu Control", desc: "Easily manage and update your restaurant menu." },
    { icon: <FaChartBar />, title: "Analytics", desc: "Track sales, performance, and customer preferences." },
    { icon: <FaUsers />, title: "Team Management", desc: "Manage staff roles and assignments effortlessly." },
    { icon: <FaShieldAlt />, title: "Secure", desc: "Your data stays encrypted and protected." },
    { icon: <FaMapMarkerAlt />, title: "Order Tracking", desc: "Monitor order status in real-time." }
  ];

  //  Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header Section */}
      <div className="bg-[#035397] text-white py-16 px-4 text-center relative">
        <button 
          onClick={() => navigate(-1)}
          className="absolute left-6 top-6 text-white/80 hover:text-white flex items-center gap-1"
        >
          <FaArrowLeft /> Back
        </button>

        <h1 className="text-4xl font-bold mb-4">About</h1>
        <p className="text-lg max-w-2xl mx-auto">
          Food Track is a modern restaurant management platform that simplifies operations and enhances the dining experience.
        </p>
      </div>

      {/* Project Screenshots */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold text-center mb-6">Project Highlights</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectImages.map((img, i) => (
            <div 
              key={i} 
              className="bg-gray-50 border rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedImage(img.src)} //  Open modal
            >
              <img src={img.src} alt={img.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{img.title}</h3>
                <p className="text-sm text-gray-600">{img.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-center mb-8">Core Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white border rounded-xl p-6 text-center hover:shadow-md transition">
                <div className="text-[#035397] text-3xl mb-3 flex justify-center">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold text-center mb-8">Why Choose Food Track?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-xl p-6 bg-white">
            <h3 className="font-semibold text-lg mb-4">For Restaurants</h3>
            <ul className="space-y-3 text-sm">
              {[
                "Manage your restaurant digitally from anywhere.",
                "Get live order updates in real-time.",
                "Easily modify your menu anytime.",
                "Reduce manual work and boost efficiency."
              ].map((point, i) => (
                <li key={i} className="flex items-start">
                  <FaCheckCircle className="text-[#035397] mt-1 mr-2" /> {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="border rounded-xl p-6 bg-white">
            <h3 className="font-semibold text-lg mb-4">For Customers</h3>
            <ul className="space-y-3 text-sm">
              {[
                "Browse the menu digitally at your table.",
                "Place orders directly from your phone.",
                "Track order status easily.",
                "Enjoy a smooth, contactless experience."
              ].map((point, i) => (
                <li key={i} className="flex items-start">
                  <FaCheckCircle className="text-[#035397] mt-1 mr-2" /> {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
         <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 py-6">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Left Section */}
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} <span className="text-white font-semibold">Food Track</span>. All rights reserved.
        </p>

        {/* Center Section */}
        <div className="flex items-center gap-5">
          <a 
            href="https://www.linkedin.com/in/hrushikesh-kapse/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white transition-colors duration-300"
          >
            <FaLinkedin className="text-blue-400 text-lg" />
            <span className="hidden sm:inline">LinkedIn</span>
          </a>

          <a 
            href="mailto:hrushikesh.kapse@example.com"
            className="flex items-center gap-2 hover:text-white transition-colors duration-300"
          >
            <FaMailBulk className="text-red-400 text-lg" />
            <span className="hidden sm:inline">Email</span>
          </a>

          <a 
            href="https://github.com/Hrushi-00" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white transition-colors duration-300"
          >
            <FaGithub className="text-gray-400 text-lg" />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <a 
            href="https://hrushikesh.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white transition-colors duration-300"
          >
            <FaGlobe className="text-green-400 text-lg" />
            <span className="hidden sm:inline">Website</span>
          </a>
        </div>

      </div>
    </footer>

      {/*  Full Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative">
            <img 
              src={selectedImage} 
              alt="Full View" 
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
            />
            <button 
              className="absolute top-3 right-3 text-white bg-black/60 rounded-full p-2 hover:bg-black/80"
              onClick={() => setSelectedImage(null)}
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutPage;
