import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion } from 'motion/react';
import { 
  LogOut, Shield, Settings, Bell, 
  HelpCircle, ChevronRight, User, 
  Mail, Key, Database, Smartphone 
} from 'lucide-react';

export default function Profile() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const menuItems = [
    { icon: <Bell size={20} />, label: 'Notifications', color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: <Shield size={20} />, label: 'Privacy & Security', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: <Database size={20} />, label: 'Storage Usage', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: <HelpCircle size={20} />, label: 'Support Center', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* Header Profile */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mt-4"
      >
        <div className="relative mb-4">
          <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-blue-200">
            {userData?.name?.charAt(0) || 'U'}
          </div>
          <div className="absolute bottom-1 right-1 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-blue-600">
            <Smartphone size={18} />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{userData?.name || 'MedVault User'}</h2>
        <p className="text-gray-400 font-medium text-sm mt-1">{user?.email}</p>
        
        <div className="mt-4 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
          Verified {userData?.role || 'User'} Profile
        </div>
      </motion.div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm flex flex-col gap-2">
          <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl w-fit">
            <Mail size={18} />
          </div>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Email Status</span>
          <span className="text-xs font-bold text-green-600">Confirmed</span>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm flex flex-col gap-2 text-indigo-600">
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl w-fit">
            <Key size={18} />
          </div>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Auth type</span>
          <span className="text-xs font-bold">Secure ID</span>
        </div>
      </div>

      {/* Settings List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="font-extrabold text-sm uppercase tracking-widest text-gray-400">Application Settings</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${item.bg} ${item.color}`}>
                  {item.icon}
                </div>
                <span className="font-bold text-gray-700 text-sm">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleSignOut}
        className="mx-4 p-5 bg-red-50 text-red-600 rounded-[2rem] font-bold flex items-center justify-center gap-3 hover:bg-red-100 transition-all active:scale-95 shadow-sm shadow-red-100"
      >
        <LogOut size={20} />
        Log Out from MedVault
      </button>

      <div className="text-center">
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">MedVault v1.0.4.Beta</p>
      </div>
    </div>
  );
}
