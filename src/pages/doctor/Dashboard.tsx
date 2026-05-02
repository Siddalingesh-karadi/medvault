import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, UserSearch, ShieldAlert, QrCode, X, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function DoctorDashboard() {
  const [patientId, setPatientId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientId.trim()) {
      navigate(`/doctor/patient/${patientId.trim()}`);
    }
  };

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (isScanning) {
      html5QrCode = new Html5Qrcode("reader");
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Success
          let targetId = decodedText;
          if (decodedText.includes('/doctor/patient/')) {
            targetId = decodedText.split('/doctor/patient/').pop() || decodedText;
          }
          setIsScanning(false);
          html5QrCode?.stop().then(() => {
            navigate(`/doctor/patient/${targetId}`);
          });
        },
        (errorMessage) => {
          // parse error, ignore
        }
      ).catch(err => {
        console.error("Camera access failed", err);
        setIsScanning(false);
      });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop();
      }
    };
  }, [isScanning, navigate]);

  return (
    <div className="flex flex-col gap-8 py-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-4"
      >
        <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-2xl mb-4">
          <UserSearch size={32} />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight mb-2">Doctor Portal</h2>
        <p className="text-gray-500 font-medium">Access patient medical records instantly</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-50/50 flex flex-col gap-8"
      >
        <form onSubmit={handleSearch} className="flex flex-col gap-6">
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Manual Access</label>
            <div className="relative group">
              <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter Patient ID..."
                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-gray-50 border border-transparent outline-none focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all font-mono text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={!patientId.trim()}
              className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3"
            >
              <UserSearch size={20} />
              Open Patient Profile
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-300 tracking-[0.2em] bg-white px-4">
            Direct Scan
          </div>
        </div>

        <button
          onClick={() => setIsScanning(true)}
          className="w-full py-6 border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-3xl font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all flex flex-col items-center gap-3 group"
        >
          <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-500 group-hover:scale-110 transition-transform">
            <Camera size={32} />
          </div>
          <span className="text-sm">Scan Patient QR Code</span>
        </button>
      </motion.div>

      <div className="flex items-start gap-4 p-6 bg-amber-50 rounded-3xl border border-amber-100 text-amber-800 shadow-sm shadow-amber-100/50">
        <ShieldAlert size={24} className="shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-sm mb-1 text-amber-900">Privacy Notice</h4>
          <p className="text-xs font-medium leading-relaxed opacity-80">
            Records are only accessible if the patient has enabled sharing. If disabled, you will see an "Access Denied" screen.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6"
          >
            <button
              onClick={() => setIsScanning(false)}
              className="absolute top-8 right-8 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="w-full max-w-sm aspect-square bg-black rounded-3xl overflow-hidden border-2 border-blue-500 relative shadow-2xl shadow-blue-500/20">
              <div id="reader" className="w-full h-full"></div>
              {/* Corner Accents */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
              <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
            </div>
            
            <div className="mt-12 text-center text-white">
              <h3 className="text-xl font-bold mb-2">Scanning QR Code</h3>
              <p className="text-white/60 text-sm">Position the patient's QR code within the frame</p>
            </div>
            
            <motion.div
              animate={{ y: [0, 200, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute top-[35%] w-[70%] h-1 bg-blue-500/50 blur-sm shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
