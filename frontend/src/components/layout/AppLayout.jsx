import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen sunlit-room-bg text-memora-espresso flex flex-col relative overflow-x-hidden">
      {/* Sunlight Beam Streaming from Window (as seen in Panel 2) */}
      <div className="sunbeam-overlay pointer-events-none" />

      {/* Top Navbar */}
      <Navbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1 relative z-10">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          closeSidebar={() => setIsSidebarOpen(false)}
        />

        {/* Main Application Page */}
        <main className="flex-1 lg:pl-64 min-w-0 transition-all duration-300">
          <div className="w-full min-w-0 p-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
