import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, Clock, Share2, User, Droplets, MapPin, 
  Plus, Bell, Trash2, CheckCircle2, ChevronRight, Activity, 
  Heart, Calendar, QrCode as QrIcon, X
} from 'lucide-react';

interface Reminder {
  id: string;
  title: string;
  time: string;
  isDone: boolean;
}

export default function PatientDashboard() {
  const { user, userData } = useAuth();
  const [showQR, setShowQR] = useState(false);
  const [sharing, setSharing] = useState(userData?.isSharingEnabled ?? true);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [showAddReminder, setShowAddReminder] = useState(false);

  useEffect(() => {
    if (userData) {
      setSharing(userData.isSharingEnabled ?? true);
    }
  }, [userData]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'reminders'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReminders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder)));
    });
    return () => unsubscribe();
  }, [user]);

  const toggleSharing = async () => {
    if (!user) return;
    const newState = !sharing;
    setSharing(newState);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isSharingEnabled: newState
      });
    } catch (err) {
      console.error(err);
      setSharing(!newState);
    }
  };

  const addReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newReminder.trim()) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'reminders'), {
        title: newReminder,
        time: reminderTime,
        isDone: false,
        createdAt: serverTimestamp()
      });
      setNewReminder('');
      setReminderTime('09:00');
      setShowAddReminder(false);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReminder = async (id: string, currentStatus: boolean) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'reminders', id), {
        isDone: !currentStatus
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReminder = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'reminders', id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!userData) return null;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Welcome */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Hello, {userData.name.split(' ')[0]}</h2>
          <p className="text-gray-400 font-medium">Have a healthy day! ✨</p>
        </div>
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
          <Activity size={24} />
        </div>
      </div>

      {/* Main Profile Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-100/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div className="flex items-center gap-5 mb-8 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-xl shadow-blue-200">
            {userData.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">{userData.name}</h3>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-0.5">Patient ID: {user?.uid.slice(0, 8)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 relative z-10">
          <div className="p-4 bg-gray-50/80 rounded-2xl border border-white flex flex-col items-center gap-1">
            <Heart size={16} className="text-red-500" />
            <span className="text-[10px] font-bold text-gray-400 lowercase tracking-widest">Type</span>
            <span className="text-xs font-bold uppercase">{userData.bloodGroup}</span>
          </div>
          <div className="p-4 bg-gray-50/80 rounded-2xl border border-white flex flex-col items-center gap-1">
            <User size={16} className="text-blue-500" />
            <span className="text-[10px] font-bold text-gray-400 lowercase tracking-widest">Age</span>
            <span className="text-xs font-bold">{userData.age}y</span>
          </div>
          <div className="p-4 bg-gray-50/80 rounded-2xl border border-white flex flex-col items-center gap-1">
            <MapPin size={16} className="text-green-500" />
            <span className="text-[10px] font-bold text-gray-400 lowercase tracking-widest">Lives</span>
            <span className="text-[10px] font-bold truncate w-full text-center">{userData.address.split(',')[0]}</span>
          </div>
        </div>
      </motion.div>

      {/* Health Stats Accent */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 rounded-[2rem] text-white shadow-xl shadow-rose-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
          <Heart size={20} className="mb-2 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Heart Rate</p>
          <p className="text-2xl font-black">72 <span className="text-sm font-normal opacity-60">bpm</span></p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
          <Activity size={20} className="mb-2" />
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Health Score</p>
          <p className="text-2xl font-black">94<span className="text-sm font-normal opacity-60">%</span></p>
        </div>
      </div>

      {/* Daily Health Insights - Horizontal Scroller */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-sm font-extrabold uppercase tracking-widest text-gray-400">Insights</h4>
          <span className="text-[10px] font-bold text-blue-600">Daily Tip ✨</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
          <div className="min-w-[280px] bg-white p-6 rounded-3xl border border-gray-50 shadow-sm flex gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl h-fit">
              <Droplets size={24} />
            </div>
            <div>
              <h5 className="font-bold text-sm mb-1">Stay Hydrated</h5>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">Drinking 3L of water daily significantly improves focus.</p>
            </div>
          </div>
          <div className="min-w-[280px] bg-gradient-to-br from-green-50 to-white p-6 rounded-3xl border border-gray-50 shadow-sm flex gap-4 text-green-800">
            <div className="p-3 bg-green-100 text-green-600 rounded-2xl h-fit">
              <Calendar size={24} />
            </div>
            <div>
              <h5 className="font-bold text-sm mb-1">Meditation</h5>
              <p className="text-xs text-green-600/70 leading-relaxed font-medium">10 mins of morning breathing reduces cortisol by 15%.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/patient/upload"
          className="bg-blue-600 p-6 rounded-[2rem] text-white flex flex-col gap-4 shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
          <div className="bg-white/20 p-3 rounded-2xl self-start group-hover:bg-white/30 transition-colors">
            <Upload size={22} />
          </div>
          <span className="font-bold text-lg leading-tight">Upload<br/>Report</span>
        </Link>
        <Link
          to="/patient/timeline"
          className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col gap-4 shadow-lg shadow-gray-100/50 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
        >
          <div className="bg-blue-50 p-3 rounded-2xl self-start group-hover:bg-blue-100 transition-colors text-blue-600">
            <Clock size={22} />
          </div>
          <span className="font-bold text-lg leading-tight text-gray-900">Medical<br/>Timeline</span>
        </Link>
      </div>

      {/* Sharing Controls Card */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${sharing ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <Share2 size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm">Patient Share</h4>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${sharing ? 'text-green-600' : 'text-red-500'}`}>
                {sharing ? 'Public Access ON' : 'Private Mode'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleSharing}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              sharing ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${sharing ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <button
          onClick={() => setShowQR(!showQR)}
          className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl font-bold text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all flex items-center justify-center gap-3"
        >
          <QrIcon size={18} />
          {showQR ? 'Hide Sharing QR' : 'Show Sharing QR'}
        </button>

        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden flex flex-col items-center gap-4 mt-6"
            >
              <div className="p-4 bg-white border border-gray-100 rounded-3xl shadow-2xl">
                <QRCodeSVG value={`${window.location.origin}/doctor/patient/${user?.uid}`} size={180} />
              </div>
              <p className="text-center text-[10px] uppercase font-bold text-gray-400 tracking-widest px-4">
                SCAN TO VIEW RECORDS
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reminders Section */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Bell size={20} />
            </div>
            <h4 className="font-bold text-sm">Health Reminders</h4>
          </div>
          <button 
            onClick={() => setShowAddReminder(!showAddReminder)}
            className="p-3 bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all"
          >
            {showAddReminder ? <X size={20} /> : <Plus size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {showAddReminder && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={addReminder}
              className="overflow-hidden space-y-3 mb-6"
            >
              <input
                type="text"
                value={newReminder}
                onChange={(e) => setNewReminder(e.target.value)}
                placeholder="What to remind?"
                className="w-full p-4 rounded-xl bg-gray-50 border border-transparent outline-none focus:bg-white focus:border-blue-100 transition-all font-medium text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="p-4 rounded-xl bg-gray-50 border border-transparent outline-none focus:bg-white focus:border-blue-100 transition-all font-medium text-sm"
                />
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                >
                  Save Reminder
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {reminders.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No reminders set</p>
            </div>
          ) : (
            reminders.map((rem) => (
              <motion.div
                key={rem.id}
                layout
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                  rem.isDone ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-gray-50 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleReminder(rem.id, rem.isDone)}
                    className={`p-2 rounded-lg transition-colors ${rem.isDone ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-500'}`}
                  >
                    <CheckCircle2 size={18} />
                  </button>
                  <div>
                    <h5 className={`font-bold text-sm ${rem.isDone ? 'line-through text-gray-400' : 'text-gray-700'}`}>{rem.title}</h5>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                      <Calendar size={10} />
                      <span>{rem.time}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteReminder(rem.id)}
                  className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
