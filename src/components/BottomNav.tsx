import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Clock, 
  PlusSquare, 
  Search, 
  UserCircle,
  QrCode
} from 'lucide-react';

export default function BottomNav() {
  const { user, userData } = useAuth();

  if (!user || !userData?.onboardingComplete) return null;

  const isPatient = userData.role === 'patient';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-6 py-3 flex items-center justify-between z-40 pb-safe shadow-[0_-1px_20px_rgba(0,0,0,0.02)]">
      {isPatient ? (
        <>
          <NavLink 
            to="/patient/dashboard" 
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-blue-600' : 'text-gray-300'}`}
          >
            <LayoutDashboard size={22} className="transition-transform group-active:scale-95" />
            <span className="text-[9px] font-black uppercase tracking-[0.1em]">Home</span>
          </NavLink>
          
          <NavLink 
            to="/patient/upload" 
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-blue-600' : 'text-gray-300'}`}
          >
            <PlusSquare size={22} />
            <span className="text-[9px] font-black uppercase tracking-[0.1em]">Upload</span>
          </NavLink>

          <NavLink 
            to="/patient/timeline" 
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-blue-600' : 'text-gray-300'}`}
          >
            <Clock size={22} />
            <span className="text-[9px] font-black uppercase tracking-[0.1em]">Records</span>
          </NavLink>
        </>
      ) : (
        <>
          <NavLink 
            to="/doctor/dashboard" 
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-blue-600' : 'text-gray-300'}`}
          >
            <QrCode size={22} />
            <span className="text-[9px] font-black uppercase tracking-[0.1em]">Scan</span>
          </NavLink>
          
          <div className="flex flex-col items-center gap-1 text-gray-200">
            <Search size={22} />
            <span className="text-[9px] font-black uppercase tracking-[0.1em]">Patients</span>
          </div>
        </>
      )}

      <NavLink 
        to="/profile" 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-blue-600' : 'text-gray-300'}`}
      >
        <UserCircle size={22} />
        <span className="text-[9px] font-black uppercase tracking-[0.1em]">Me</span>
      </NavLink>
    </div>
  );
}
