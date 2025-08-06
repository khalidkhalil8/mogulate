
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import PricingSection from './pricing/PricingSection';
import UpcomingFeaturesSection from './features/UpcomingFeaturesSection';
import { useAuth } from '@/context/AuthContext';
import Autoplay from "embla-carousel-autoplay";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleGetStarted = () => {
    if (user) {
      navigate('/project-setup?step=start');
    } else {
      navigate('/auth');
    }
  };

  const screenshots = [
    {
      title: "Start a Project",
      description: "Describe your business concept and let our AI understand your vision.",
      image: "/lovable-uploads/082d75ef-68e3-4996-83c4-2b4fd00c0218.png"
    },
    {
      title: "Market Analysis",
      description: "Analyze your competitive landscape and uncover your positioning.",
      image: "/lovable-uploads/42d3eef2-d185-4b91-9dd1-4e26502e50d5.png"
    },
    {
      title: "Identify Market Gaps",
      description: "Spot untapped opportunities your competitors may be missing.",
      image: "/lovable-uploads/ff868563-f26a-4d23-8231-72ecfd0e67ed.png"
    },
    {
      title: "Get Validation Plan",
      description: "Receive actionable steps to validate your idea and go to market.",
      image: "/lovable-uploads/5224b240-9e12-40b2-bf09-707f7eb979df.png"
    }
  ];

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container-width">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
              Mogulate
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a 
                href="#how-it-works" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Features
              </a>
              <a 
                href="#pricing" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={scrollToPricing}
              >
                Pricing
              </a>
            </nav>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="text-gray-600 hover:text-gray-900"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-spacing mobile-padding">
          <div className="container-width">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
                Have an Idea?<br />
                <span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
                  Let us Help
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Find your competitors, identify market gaps, and create a clear path for your ideas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  className="standard-button bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleGetStarted}
                >
                  Get Started for Free
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                No credit card required • Get results in under 5 minutes
              </p>
            </div>
          </div>
        </section>

        {/* Product Demo Section */}
        <section className="section-spacing bg-gray-50 mobile-padding">
          <div className="container-width">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                  See Mogulate in Action
                </h2>
                <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  From idea to market analysis in minutes. Here's how Mogulate helps you make informed business decisions.
                </p>
              </div>
              
              <div className="relative max-w-5xl mx-auto">
                <Carousel 
                  className="w-full" 
                  plugins={[plugin.current]}
                  onMouseEnter={plugin.current.stop}
                  onMouseLeave={plugin.current.reset}
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                >
                  <CarouselContent>
                    {screenshots.map((screenshot, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1">
                          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                              <img 
                                src={screenshot.image} 
                                alt={screenshot.title}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                            </div>
                            <div className="card-spacing text-center">
                              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                                {screenshot.title}
                              </h3>
                              <p className="text-lg text-gray-600 leading-relaxed">
                                {screenshot.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4 h-12 w-12 bg-white/90 hover:bg-white shadow-lg border-0" />
                  <CarouselNext className="right-4 h-12 w-12 bg-white/90 hover:bg-white shadow-lg border-0" />
                </Carousel>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="section-spacing mobile-padding">
          <div className="container-width">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                How It Works
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                  <span className="text-3xl font-bold text-teal-600">1</span>
                </div>
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Describe Your Idea</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Tell us about your business concept in your own words. Our AI will understand your vision and market focus.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                  <span className="text-3xl font-bold text-teal-600">2</span>
                </div>
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Discover Your Market</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Get instant insights on competitors, market size, and opportunities you might have missed.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                  <span className="text-3xl font-bold text-teal-600">3</span>
                </div>
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Get Your Action Plan</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Receive a clear roadmap with specific steps to validate and launch your business idea.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section id="why-entrepreneurs" className="section-spacing bg-gray-50 mobile-padding">
          <div className="container-width">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-12 text-gray-900">
                Why Entrepreneurs Choose Mogulate
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white card-spacing rounded-lg shadow-md">
                  <h3 className="text-2xl font-semibold mb-6 text-gray-900">Save Weeks of Research</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    What used to take weeks of manual research now happens in minutes. 
                    Get comprehensive market analysis instantly.
                  </p>
                </div>
                
                <div className="bg-white card-spacing rounded-lg shadow-md">
                  <h3 className="text-2xl font-semibold mb-6 text-gray-900">Make Data-Driven Decisions</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Stop relying on gut feelings. Get concrete data about your market, 
                    competitors, and opportunities.
                  </p>
                </div>
                
                <div className="bg-white card-spacing rounded-lg shadow-md">
                  <h3 className="text-2xl font-semibold mb-6 text-gray-900">Find Your Competitive Edge</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Identify gaps in the market that your competitors are missing. 
                    Position your business for success.
                  </p>
                </div>
                
                <div className="bg-white card-spacing rounded-lg shadow-md">
                  <h3 className="text-2xl font-semibold mb-6 text-gray-900">Validate Before You Build</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Get a clear validation roadmap before investing time and money. 
                    Reduce risk and increase your chances of success.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <div id="pricing">
          <PricingSection isHomePage={true} />
        </div>
      </main>
      
      <footer className="section-spacing border-t bg-white mobile-padding">
        <div className="container-width text-center text-gray-500">
          <p>© 2025 Mogulate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
