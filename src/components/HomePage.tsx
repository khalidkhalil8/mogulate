
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Header from './Header';
import PricingSection from './pricing/PricingSection';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="container-width">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Have an Idea?<br />Let Us Help You.
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8">
                Enter your idea and uncover competitors and market gaps in seconds
              </p>
              <Button 
                className="px-8 py-6 text-lg gradient-bg border-none hover:opacity-90 button-transition"
                onClick={() => navigate('/idea')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-gray-50 px-4">
          <div className="container-width">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-teal-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-center mb-4">Enter Your Idea</h3>
                <p className="text-gray-600 text-center">
                  Describe the concept of your idea in detail to help our AI understand your vision.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-teal-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-center mb-4">Find Competitors</h3>
                <p className="text-gray-600 text-center">
                  Our AI will help you find competition in your market and analyze their offerings.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-teal-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-center mb-4">Identify Market Gaps</h3>
                <p className="text-gray-600 text-center">
                  Our AI analysis will help you spot opportunities and gaps in your market to exploit.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Add Pricing Section */}
        <PricingSection isHomePage={true} />
      </main>
      
      <footer className="py-8 px-4 border-t">
        <div className="container-width text-center text-gray-500">
          <p>© 2025 TalonIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
