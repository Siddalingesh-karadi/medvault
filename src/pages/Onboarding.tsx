import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { User, Stethoscope, ArrowRight } from 'lucide-react';

export default function Onboarding() {
  const { user, userData, loading } = useAuth();
  const location = useLocation();
  const [role, setRole] = useState<'patient' | 'doctor' | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If a role was selected at login, skip step 1
    const preferredRole = location.state?.preferredRole as 'patient' | 'doctor';
    if (preferredRole) {
      setRole(preferredRole);
      setStep(2);
    }
  }, [location.state]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (userData?.onboardingComplete) {
    return <Navigate to={userData.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const profileData = {
        ...formData,
        role,
        name: formData.name || user.displayName || 'Vault User',
        email: user.email,
        onboardingComplete: true,
        isSharingEnabled: role === 'patient' ? true : true, // Defaulting sharing to true for convenience
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', user.uid), profileData);
      navigate(role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormData = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="py-8">
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-6"
        >
          <h2 className="text-3xl font-bold tracking-tight">Select your role</h2>
          <div className="grid gap-4">
            <button
              onClick={() => { setRole('patient'); setStep(2); }}
              className={`p-6 rounded-3xl border-2 text-left transition-all flex items-center justify-between group ${
                role === 'patient' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${role === 'patient' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <User size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Patient</h3>
                  <p className="text-sm text-gray-500">I want to manage my health records</p>
                </div>
              </div>
              <ArrowRight className={`text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity`} />
            </button>

            <button
              onClick={() => { setRole('doctor'); setStep(2); }}
              className={`p-6 rounded-3xl border-2 text-left transition-all flex items-center justify-between group ${
                role === 'doctor' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${role === 'doctor' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <Stethoscope size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Doctor</h3>
                  <p className="text-sm text-gray-500">I want to view patient records</p>
                </div>
              </div>
              <ArrowRight className={`text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity`} />
            </button>
          </div>
        </motion.div>
      )}

      {step === 2 && role && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl border border-gray-100"
        >
          <h2 className="text-2xl font-bold mb-6">Complete your profile</h2>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                defaultValue={user.displayName || ''}
                onChange={(e) => updateFormData('name', e.target.value)}
                className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                placeholder="John Doe"
              />
            </div>

            {role === 'patient' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Age</label>
                    <input
                      type="number"
                      required
                      onChange={(e) => updateFormData('age', e.target.value)}
                      className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gender</label>
                    <select
                      required
                      onChange={(e) => updateFormData('gender', e.target.value)}
                      className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Blood Group</label>
                  <input
                    type="text"
                    required
                    onChange={(e) => updateFormData('bloodGroup', e.target.value)}
                    className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                    placeholder="O+"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Medical Degree</label>
                  <input
                    type="text"
                    required
                    onChange={(e) => updateFormData('degree', e.target.value)}
                    className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                    placeholder="MD, MBBS"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Address</label>
              <textarea
                required
                onChange={(e) => updateFormData('address', e.target.value)}
                className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none h-24 resize-none"
                placeholder="123 Health St..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? 'Saving...' : 'Finish Onboarding'}
              {!submitting && <ArrowRight size={20} />}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
            >
              Back to role selection
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
