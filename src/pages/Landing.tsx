import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Activity, ShieldCheck, QrCode, Sparkles, HeartPulse } from 'lucide-react';

export default function Landing() {
  const { user, userData } = useAuth();

  if (user && userData?.onboardingComplete) {
    return <Navigate to={userData.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'} />;
  }

  return (
    <div className="flex flex-col items-center py-6 px-4">
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/20 rounded-full blur-[120px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col items-center text-center"
      >
        <div className="mb-10 relative group">
          <div className="absolute inset-0 bg-blue-400 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative p-8 bg-white border border-gray-50 rounded-[2.50rem] shadow-2xl shadow-blue-100/50">
            <HeartPulse size={64} className="text-blue-600 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 bg-green-500 text-white rounded-full border-4 border-gray-50 shadow-lg animate-bounce">
            <Sparkles size={16} />
          </div>
        </div>
        
        <h1 className="text-5xl font-extrabold mb-4 tracking-tighter text-gray-900 leading-[1.1]">
          Med<span className="text-blue-600">Vault</span>
        </h1>
        <p className="text-gray-500 mb-12 text-lg font-medium leading-relaxed px-4">
          The ultimate portable health record system. <br/>
          <span className="text-gray-400 text-sm italic font-normal">Secure • Instant • Decentralized Vibe</span>
        </p>

        <div className="grid gap-4 w-full px-2">
          <Link
            to="/login"
            className="group relative bg-blue-600 text-white font-bold py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            Start Your Vault
            <ShieldCheck size={20} />
          </Link>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
            Join 10k+ users managing their health
          </p>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-6 w-full">
          {[
            { icon: <Activity className="text-blue-500" />, label: 'Dynamic' },
            { icon: <QrCode className="text-indigo-500" />, label: 'QR Scan' },
            { icon: <ShieldCheck className="text-green-500" />, label: 'Private' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                {item.icon}
              </div>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
