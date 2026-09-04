import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Extract first name for personal greeting
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Valli';

  return (
    <div className="space-y-10 animate-fadeIn relative">
      {/* Top Header & Wall Atmosphere (Sunlit Memory Room Scene) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Greeting */}
        <div className="lg:col-span-8 space-y-2 pt-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#2c1810] flex items-center gap-2.5 drop-shadow-xs">
            Good Evening, {firstName}! <span className="text-[#c86d74] font-serif font-normal">♡</span>
          </h1>
          <p className="text-sm sm:text-base text-[#705645] font-serif italic">
            "A better you is always a work in progress."
          </p>
        </div>

        {/* Right Wall Decor (Pinned Photos & Kraft Note - Exactly matching Panel 2) */}
        <div className="hidden lg:flex lg:col-span-4 justify-end items-start gap-4">
          {/* Stack of Wall Pinned Photos */}
          <div className="flex flex-col gap-2.5 items-center">
            {/* Top Pinned Photo */}
            <div className="relative w-14 h-16 bg-white p-1 pb-3 shadow-md rounded-xs transform -rotate-3 hover:rotate-0 transition duration-300 border border-[#e5d8c5]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#826e57] absolute -top-1 left-1/2 -translate-x-1/2 shadow-xs" />
              <div className="w-full h-full bg-[#805035] rounded-xs overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=120&auto=format&fit=crop&q=60"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Bottom Polaroid */}
            <div className="relative w-14 h-16 bg-white p-1 pb-3 shadow-md rounded-xs transform rotate-6 hover:rotate-0 transition duration-300 border border-[#e5d8c5]">
              <div className="w-4 h-1.5 bg-[#e89da2]/50 absolute -top-1 left-1/2 -translate-x-1/2 transform rotate-3" />
              <div className="w-full h-full bg-[#4a3542] rounded-xs overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&auto=format&fit=crop&q=60"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Pinned Note on Wall: "You are enough just as you are ♡" */}
          <div className="relative w-36 p-3.5 bg-[#f3e7d4] text-[#3d2417] border border-[#d9c4a8] rounded shadow-paper transform rotate-2 hover:rotate-0 transition duration-300 text-center space-y-1">
            <div className="w-3 h-5 border-2 border-[#7a644f] rounded-full mx-auto -mt-5 mb-1 shadow-xs" />
            <p className="font-handwriting text-sm leading-tight text-[#422614] font-semibold">
              You are enough <br />
              just as you are
            </p>
            <span className="text-xs text-[#c86d74] block">♡</span>
          </div>
        </div>
      </div>

      {/* Physical Memory Action Objects */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 sm:gap-5 pt-2">
        {/* OBJECT 1: Keep Memories */}
        <div
          onClick={() => navigate('/memories')}
          className="parchment-plaque p-5 rounded-2xl flex flex-col items-center justify-between text-center min-h-[175px] cursor-pointer group"
        >
          {/* Physical Polaroid Camera & Print Illustration */}
          <div className="w-16 h-14 relative flex items-center justify-center group-hover:scale-105 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#faf3e8] border border-[#d9c4a8] shadow-xs flex items-center justify-center text-2xl select-none relative">
              <span>📸</span>
              <span className="absolute -top-1 -right-1 text-xs text-[#c86d74]">✨</span>
            </div>
          </div>

          <div className="space-y-1 mt-2">
            <h3 className="text-xs sm:text-sm font-serif font-bold text-[#2c1810] group-hover:text-[#c86d74] transition">
              Our Memories
            </h3>
            <span className="text-xs text-[#c86d74] font-bold group-hover:translate-x-1 transition inline-block">
              →
            </span>
          </div>
        </div>

        {/* OBJECT 2: Write in your Diary */}
        <div
          onClick={() => navigate('/diary')}
          className="parchment-plaque p-5 rounded-2xl flex flex-col items-center justify-between text-center min-h-[175px] cursor-pointer group"
        >
          {/* Physical Open Journal Illustration */}
          <div className="w-16 h-14 relative flex items-center justify-center group-hover:scale-105 transition duration-300">
            {/* Book Base / Cover */}
            <div className="w-14 h-11 bg-[#54341e] rounded-sm shadow-md relative flex items-center justify-center overflow-hidden">
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-[#2b170c] z-10" />
              <div className="w-6 h-9 bg-[#fdfaf3] border-r border-[#ebdcc8] shadow-inner rounded-l-xs flex flex-col justify-around p-1">
                <div className="w-full h-0.5 bg-[#d4c3af] rounded-full" />
                <div className="w-3/4 h-0.5 bg-[#d4c3af] rounded-full" />
                <div className="w-full h-0.5 bg-[#d4c3af] rounded-full" />
              </div>
              <div className="w-6 h-9 bg-[#faf5ea] border-l border-[#ebdcc8] shadow-inner rounded-r-xs flex flex-col justify-around p-1">
                <div className="w-full h-0.5 bg-[#d4c3af] rounded-full" />
                <div className="w-full h-0.5 bg-[#d4c3af] rounded-full" />
                <div className="w-1/2 h-0.5 bg-[#c86d74] rounded-full" />
              </div>
              <div className="absolute -top-1 right-3 w-1.5 h-6 bg-[#c86d74] rounded-xs shadow-xs transform rotate-6 z-20" />
            </div>
          </div>

          <div className="space-y-1 mt-2">
            <h3 className="text-xs sm:text-sm font-serif font-bold text-[#2c1810] group-hover:text-[#c86d74] transition">
              Write in Diary
            </h3>
            <span className="text-xs text-[#c86d74] font-bold group-hover:translate-x-1 transition inline-block">
              →
            </span>
          </div>
        </div>

        {/* OBJECT 3: Compose a Letter */}
        <div
          onClick={() => navigate('/letters')}
          className="parchment-plaque p-5 rounded-2xl flex flex-col items-center justify-between text-center min-h-[175px] cursor-pointer group"
        >
          {/* Physical Parchment Letter with Quill */}
          <div className="w-16 h-14 relative flex items-center justify-center group-hover:scale-105 transition duration-300">
            <div className="w-11 h-13 bg-[#f5ecdd] border border-[#d6c2a8] rounded-xs shadow-md p-1.5 flex flex-col justify-around transform -rotate-3">
              <div className="w-full h-0.5 bg-[#bfa993] rounded-full" />
              <div className="w-full h-0.5 bg-[#bfa993] rounded-full" />
              <div className="w-2/3 h-0.5 bg-[#bfa993] rounded-full" />
              <div className="w-full h-0.5 bg-[#bfa993] rounded-full" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#a82a38] self-end shadow-xs" />
            </div>
            <div className="absolute -right-1 -top-1 text-2xl transform rotate-45 select-none pointer-events-none drop-shadow-sm">
              🪶
            </div>
          </div>

          <div className="space-y-1 mt-2">
            <h3 className="text-xs sm:text-sm font-serif font-bold text-[#2c1810] group-hover:text-[#c86d74] transition">
              Compose Letter
            </h3>
            <span className="text-xs text-[#c86d74] font-bold group-hover:translate-x-1 transition inline-block">
              →
            </span>
          </div>
        </div>

        {/* OBJECT 4: Make a Commitment */}
        <div
          onClick={() => navigate('/commitments')}
          className="parchment-plaque p-5 rounded-2xl flex flex-col items-center justify-between text-center min-h-[175px] cursor-pointer group"
        >
          <div className="w-16 h-14 relative flex items-center justify-center group-hover:scale-105 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#fdf2f4] border border-[#f4cfd3] shadow-xs flex items-center justify-center relative">
              <span className="text-2xl select-none">🤝</span>
              <span className="absolute -top-1 -right-1 text-xs text-[#c86d74] animate-pulse">
                ♡
              </span>
            </div>
          </div>

          <div className="space-y-1 mt-2">
            <h3 className="text-xs sm:text-sm font-serif font-bold text-[#2c1810] group-hover:text-[#c86d74] transition">
              Commitments
            </h3>
            <span className="text-xs text-[#c86d74] font-bold group-hover:translate-x-1 transition inline-block">
              →
            </span>
          </div>
        </div>

        {/* OBJECT 5: View your Timeline */}
        <div
          onClick={() => navigate('/timeline')}
          className="parchment-plaque p-5 rounded-2xl flex flex-col items-center justify-between text-center min-h-[175px] cursor-pointer group"
        >
          <div className="w-16 h-14 relative flex items-center justify-center group-hover:scale-105 transition duration-300">
            <div className="w-11 h-13 bg-white p-1 pb-3 shadow-md rounded-xs border border-[#ded1be] transform rotate-2">
              <div className="w-full h-8 bg-gradient-to-tr from-[#9c5132] via-[#e28c5a] to-[#f7cb88] rounded-xs overflow-hidden flex items-center justify-center">
                <span className="text-xs">🌅</span>
              </div>
            </div>
          </div>

          <div className="space-y-1 mt-2">
            <h3 className="text-xs sm:text-sm font-serif font-bold text-[#2c1810] group-hover:text-[#c86d74] transition">
              Our Timeline
            </h3>
            <span className="text-xs text-[#c86d74] font-bold group-hover:translate-x-1 transition inline-block">
              →
            </span>
          </div>
        </div>

        {/* OBJECT 6: Shared Spaces */}
        <div
          onClick={() => navigate('/spaces')}
          className="parchment-plaque p-5 rounded-2xl flex flex-col items-center justify-between text-center min-h-[175px] cursor-pointer group"
        >
          <div className="w-16 h-14 relative flex items-center justify-center group-hover:scale-105 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#faf3e8] border border-[#e8dfd1] shadow-xs flex items-center justify-center text-2xl select-none">
              <span>🏡</span>
            </div>
          </div>

          <div className="space-y-1 mt-2">
            <h3 className="text-xs sm:text-sm font-serif font-bold text-[#2c1810] group-hover:text-[#c86d74] transition">
              Shared Spaces
            </h3>
            <span className="text-xs text-[#c86d74] font-bold group-hover:translate-x-1 transition inline-block">
              →
            </span>
          </div>
        </div>

        {/* OBJECT 7: Play some Games */}
        <div
          onClick={() => navigate('/games')}
          className="parchment-plaque p-5 rounded-2xl flex flex-col items-center justify-between text-center min-h-[175px] cursor-pointer group"
        >
          <div className="w-16 h-14 relative flex items-center justify-center group-hover:scale-105 transition duration-300">
            <div className="w-12 h-11 bg-[#faf4ec] border border-[#e2d5c3] rounded-xl shadow-md flex items-center justify-center text-xl select-none">
              <span className="text-[#a85058]">🎮</span>
            </div>
          </div>

          <div className="space-y-1 mt-2">
            <h3 className="text-xs sm:text-sm font-serif font-bold text-[#2c1810] group-hover:text-[#c86d74] transition">
              Play Games
            </h3>
            <span className="text-xs text-[#c86d74] font-bold group-hover:translate-x-1 transition inline-block">
              →
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Reminder Card with Dried Flower & Kraft Sticky Note (Panel 2) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
        {/* Left: "A little reminder ♡" Card with Real Dried Flower Sprig (7 Cols) */}
        <div className="md:col-span-7 parchment-plaque p-6 sm:p-8 rounded-3xl min-h-[170px] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#2c1810]">
            <span>A little reminder</span>
            <span className="text-[#c86d74]">♡</span>
          </div>

          <div className="my-auto py-3">
            <p className="font-serif italic text-lg sm:text-2xl text-[#3d2417] leading-relaxed">
              "You're doing better than you think."
            </p>
          </div>

          {/* Delicate Botanical Dried Pressed Wildflower Branch (Exact match to Panel 2) */}
          <div className="absolute right-6 bottom-3 flex items-center pointer-events-none select-none">
            <svg
              className="w-16 h-20 text-[#a85058] opacity-80"
              viewBox="0 0 64 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M32 75 C32 50, 30 30, 38 15"
                stroke="#826651"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M34 50 C26 46, 20 40, 24 34 C28 34, 32 40, 34 50 Z"
                fill="#8f7863"
                opacity="0.75"
              />
              <path
                d="M33 35 C42 32, 48 28, 44 22 C40 22, 36 28, 33 35 Z"
                fill="#8f7863"
                opacity="0.75"
              />
              {/* Petals */}
              <circle cx="38" cy="15" r="7" fill="#e89da2" opacity="0.9" />
              <circle cx="33" cy="11" r="5.5" fill="#f2b6bb" opacity="0.85" />
              <circle cx="43" cy="12" r="5.5" fill="#f2b6bb" opacity="0.85" />
              <circle cx="38" cy="8" r="5" fill="#d97f87" opacity="0.9" />
              <circle cx="38" cy="14" r="3" fill="#633924" />
            </svg>
          </div>
        </div>

        {/* Right: Kraft Paper Sticky Note with Drop Shadow (5 Cols) */}
        <div className="md:col-span-5 flex justify-center md:justify-end">
          <div className="sticky-note p-6 sm:p-7 w-full max-w-sm transform rotate-2 hover:rotate-0 transition duration-300 relative shadow-paper">
            {/* Washi Tape at Top Center */}
            <div className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2" />

            <div className="space-y-1.5 text-center pt-2 font-handwriting text-[#3d2417]">
              <p className="text-xl sm:text-2xl font-semibold leading-snug">
                Today is a new page. <br />
                Write something beautiful.
              </p>
              <div className="text-2xl text-[#c86d74] pt-1">♡</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
