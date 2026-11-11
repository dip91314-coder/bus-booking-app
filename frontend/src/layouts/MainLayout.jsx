import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ScrollToTop from '../components/common/ScrollToTop';
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFD] text-gray-900 font-sans antialiased">
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#071A4D',
            color: '#FFFFFF',
            fontSize: '13px',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF'
            }
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF'
            }
          }
        }}
      />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
