import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, Mail, HeartHandshake, Milestone, Heart } from 'lucide-react';
import Button from '../components/common/Button';
import heroBg from '../assets/01_hero_bg.png';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen text-[#f7f2ea] flex flex-col relative overflow-hidden font-sans"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#1c120c'
      }}
    >
      {/* Warm Ambient Lamp Glows */}
      <div className="absolute top-1/4 left-1/3 w-[36rem] h-[36rem] bg-[#e6a85c]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-[28rem] h-[28rem] bg-[#e89da2]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 sm:px-12 h-24 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-serif font-bold tracking-wider text-white">
            MEMORA
          </span>
          <span className="text-xl text-[#e89da2] font-serif">♡</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-[#d4c3b3]">
          <a href="#home" className="hover:text-white transition">Home</a>
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#about" className="hover:text-white transition">About</a>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/login"
            className="px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-[#d4c3b3] hover:text-white transition"
          >
            Login
          </Link>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/signup')}
            className="rounded-full shadow-lg"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 sm:px-12 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Heading & Text */}
        <div className="lg:col-span-5 space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight tracking-tight">
            A place for <br />
            your most honest <br />
            moments <span className="text-[#e89da2] font-serif font-normal">♡</span>
          </h1>

          <div className="space-y-2 text-[#d4c3b3] font-serif text-sm sm:text-base leading-relaxed">
            <p className="font-semibold text-[#f0e4d8]">Write. Feel. Remember.</p>
            <p className="text-xs sm:text-sm text-[#b8a494]">
              A private world for you and the people who matter.
            </p>
          </div>

          <div className="pt-4">
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/signup')}
              className="rounded-full shadow-lg px-8 py-3.5 text-sm sm:text-base font-semibold group"
            >
              Start Your Journey <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
            </Button>
          </div>
        </div>

        {/* Right Column: Physical Cozy Desk Scene (Recreated visually in CSS/HTML matching reference) */}
        <div className="lg:col-span-7 relative flex items-center justify-center p-4">
          {/* Desk Surface Canvas */}
          <div className="relative w-full max-w-lg sm:max-w-xl aspect-[4/3] rounded-3xl bg-gradient-to-br from-[#2a1b12] via-[#22150e] to-[#170e08] border border-[#3d2719] shadow-2xl p-6 sm:p-8 overflow-hidden flex flex-col justify-between">
            {/* Ambient lamp glow */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#f4b870]/15 rounded-full blur-2xl pointer-events-none" />

            {/* Top row of desk props */}
            <div className="flex justify-between items-start z-10">
              {/* Paperclip note: Same People Different Stories */}
              <div className="relative transform -rotate-6 bg-[#d9c5ab] text-[#3d2516] p-3 rounded shadow-md border border-[#c4af94] w-28 text-center font-handwriting text-xs font-bold leading-tight">
                <div className="w-3 h-5 border border-[#8a7258] rounded-full mx-auto -mt-4 mb-1" />
                Same People <br /> Different Stories ♡
              </div>

              {/* Coffee mug with text */}
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#f7f2ea] to-[#e8ded0] border-4 border-[#d8cdbc] shadow-xl flex items-center justify-center p-2 text-center transform rotate-3">
                <div className="w-16 h-16 rounded-full bg-[#3d2417] border-2 border-[#543322] shadow-inner flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#2a170d] opacity-90" />
                </div>
                <div className="absolute -bottom-2 -left-2 bg-[#fdfbf7] px-2 py-0.5 rounded shadow text-[9px] font-handwriting font-bold text-[#5c371f] border border-[#e3d7c5] whitespace-nowrap">
                  Good Things Take Time ♡
                </div>
              </div>
            </div>

            {/* Middle: Leather Bound Diary with Gold Lettering */}
            <div className="relative mx-auto my-auto w-64 sm:w-72 h-40 sm:h-44 rounded-r-2xl rounded-l-md bg-gradient-to-r from-[#211309] via-[#3a2012] to-[#4d2c19] border-2 border-[#59351e] shadow-2xl flex items-center justify-center p-4 transform -rotate-3 hover:rotate-0 transition duration-500">
              {/* Spine texture & gold embossed trim */}
              <div className="absolute left-0 top-0 bottom-0 w-5 bg-[#170c06] rounded-l-md border-r border-[#693e24]" />
              <div className="absolute top-2 bottom-2 left-7 right-2 border border-[#9b7244]/40 rounded-r-xl pointer-events-none" />
              
              {/* Gold Ribbon Marker */}
              <div className="absolute -top-3 left-16 w-3 h-14 bg-[#c86d74] shadow-md transform -rotate-6" />

              {/* Gold script text: Memora */}
              <div className="text-center space-y-1 pl-4">
                <span className="block font-signature text-3xl sm:text-4xl text-[#edd3a4] tracking-wider drop-shadow-md">
                  Memora
                </span>
                <span className="text-xs text-[#c9a76d] font-serif">♡</span>
              </div>
            </div>

            {/* Bottom Row: Polaroids & Desk Note */}
            <div className="flex justify-between items-end z-10 pt-2">
              {/* Pinned Desk Quote Note */}
              <div className="bg-[#ede1ce] text-[#331c0e] p-3 rounded-md shadow-lg border border-[#dac7ad] max-w-[210px] transform -rotate-2 font-handwriting text-xs leading-snug">
                "Memories aren't just about the past, they're about the people we never want to forget."
              </div>

              {/* Scattered Polaroids */}
              <div className="relative">
                <div className="polaroid-frame w-20 h-24 transform rotate-6 absolute -top-4 -right-2">
                  <div className="w-full h-14 bg-[#784e36] rounded-xs flex items-center justify-center text-[8px] text-white">
                    🌅 Sunset
                  </div>
                </div>
                <div className="polaroid-frame w-20 h-24 transform -rotate-6">
                  <div className="w-full h-14 bg-[#543b4d] rounded-xs flex items-center justify-center text-[8px] text-white">
                    ☕ Us
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Footer Quote */}
      <footer className="relative z-10 py-6 border-t border-[#3d2719]/40 text-center text-xs text-[#8a725e] font-serif">
        MEMORA ♡ · An intimate physical memory sanctuary in a digital world.
      </footer>
    </div>
  );
};

export default LandingPage;
