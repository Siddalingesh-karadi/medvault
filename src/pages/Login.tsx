import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { User, Stethoscope, Mail, Lock, LogIn, UserPlus, Info, ShieldAlert } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/onboarding', { state: { preferredRole: role } });
    } catch (err: any) {
      console.error(err.code, err.message);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email signups are currently disabled in the Firebase Console. Please enable "Email/Password" in the Authentication -> Sign-in Method tab.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/onboarding', { state: { preferredRole: role } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-100/30 border border-gray-100 relative overflow-hidden"
      >
        {/* Subtle gradient accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>

        <div className="flex bg-gray-50/80 p-1.5 rounded-2xl mb-8 border border-gray-100">
          <button
            onClick={() => setRole('patient')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm ${
              role === 'patient' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'
            }`}
          >
            <User size={18} />
            Patient
          </button>
          <button
            onClick={() => setRole('doctor')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm ${
              role === 'doctor' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'
            }`}
          >
            <Stethoscope size={18} />
            Doctor
          </button>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{isLogin ? 'Welcome Back' : 'Join the Vault'}</h2>
          <p className="text-gray-400 text-sm mt-2 font-medium">Accessing as <span className="text-blue-600 font-bold capitalize">{role}</span> profile</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-6 rounded-3xl text-sm flex flex-col gap-3 ${
              error.includes('disabled') 
                ? 'bg-amber-50 border border-amber-100 text-amber-900' 
                : 'bg-red-50 border border-red-100 text-red-600'
            }`}
          >
            <div className="flex items-center gap-3">
              {error.includes('disabled') ? <ShieldAlert size={24} className="text-amber-500" /> : <Info size={24} />}
              <p className="font-extrabold leading-tight">
                {error.includes('disabled') ? 'Action Required: Enable Email Login' : 'Auth Error'}
              </p>
            </div>
            <p className="text-xs font-medium opacity-80 leading-relaxed">
              {error}
            </p>
            {error.includes('disabled') && (
              <div className="mt-2 p-3 bg-white/50 rounded-xl text-[10px] font-bold uppercase tracking-widest space-y-1">
                <p>1. Go to Firebase Console</p>
                <p>2. Auth → Sign-in Method</p>
                <p>3. Enable "Email/Password"</p>
              </div>
            )}
          </motion.div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none transition-all text-sm font-medium"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="password"
                required
                placeholder="Secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white/30 border-b-white rounded-full" />
            ) : (
              <>
                {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                {isLogin ? 'Sign In Now' : 'Create My Account'}
              </>
            )}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] bg-white px-4 font-bold text-gray-300 uppercase tracking-[0.2em]">
            One-Tap Access
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-4.5 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-gray-700 text-sm shadow-sm"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="text-center mt-10 text-sm text-gray-400 font-medium">
          {isLogin ? "New to MedVault?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
          >
            {isLogin ? 'Join now' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
