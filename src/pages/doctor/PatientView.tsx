import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Calendar, ArrowLeft, ShieldAlert, Heart, 
  User, Droplets, MapPin, ExternalLink, Activity, 
  Clock, CheckCircle2, AlertCircle, ChevronLeft
} from 'lucide-react';

interface PatientData {
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  address: string;
  isSharingEnabled: boolean;
  role: string;
}

interface Record {
  id: string;
  fileName: string;
  fileURL: string;
  type: 'prescription' | 'report';
  createdAt: any;
}

export default function PatientView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const patientDoc = await getDoc(doc(db, 'users', id));
        if (patientDoc.exists()) {
          const data = patientDoc.data() as PatientData;
          if (data.role !== 'patient') {
            setError('This ID does not belong to a patient.');
          } else if (!data.isSharingEnabled) {
            setError('Access Denied: Patient has disabled sharing.');
          } else {
            setPatient(data);
            const q = query(
              collection(db, 'records'),
              where('patientId', '==', id),
              orderBy('createdAt', 'desc')
            );
            const snap = await getDocs(q);
            setRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Record)));
          }
        } else {
          setError('Patient not found.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load patient records.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <Activity size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" />
      </div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Verifying Vault Access...</p>
    </div>
  );

  if (error || !patient) return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-12 rounded-[2.5rem] border border-red-50 text-center shadow-xl shadow-red-50/50"
    >
      <div className="inline-flex p-5 bg-red-50 text-red-500 rounded-3xl mb-6">
        <ShieldAlert size={48} />
      </div>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Access Restricted</h2>
      <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto">{error}</p>
      <button
        onClick={() => navigate('/doctor/dashboard')}
        className="px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-3 mx-auto"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>
    </motion.div>
  );

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="p-3 bg-white text-gray-400 hover:text-blue-600 rounded-2xl border border-gray-100 shadow-sm transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-2xl font-extrabold tracking-tight">Vault Access</h2>
      </div>

      {/* Patient Profile Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-100/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div className="flex items-center gap-5 mb-8 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-green-100 text-center leading-none">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{patient.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-green-100 whitespace-nowrap">Verified Patient</span>
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest whitespace-nowrap">ID: {id?.slice(0, 8)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 relative z-10">
          <div className="p-4 bg-gray-50/80 rounded-2xl border border-white flex flex-col items-center gap-1">
            <Heart size={16} className="text-red-500" />
            <span className="text-[10px] font-bold text-gray-400 lowercase tracking-widest">Type</span>
            <span className="text-xs font-bold uppercase">{patient.bloodGroup}</span>
          </div>
          <div className="p-4 bg-gray-50/80 rounded-2xl border border-white flex flex-col items-center gap-1">
            <User size={16} className="text-blue-500" />
            <span className="text-[10px] font-bold text-gray-400 lowercase tracking-widest">Age / Sex</span>
            <span className="text-xs font-bold">{patient.age}y / {patient.gender.charAt(0)}</span>
          </div>
          <div className="p-4 bg-gray-50/80 rounded-2xl border border-white flex flex-col items-center gap-1">
            <MapPin size={16} className="text-amber-500" />
            <span className="text-[10px] font-bold text-gray-400 lowercase tracking-widest">Region</span>
            <span className="text-[10px] font-bold truncate w-full text-center">{patient.address.split(',')[0]}</span>
          </div>
        </div>
      </motion.div>

      {/* Record Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Medical History ({records.length})</h4>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
            <CheckCircle2 size={12} />
            EHR Secure
          </div>
        </div>

        <div className="grid gap-4">
          {records.length === 0 ? (
            <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-gray-100 flex flex-col items-center justify-center text-center gap-4">
              <div className="p-4 bg-gray-50 text-gray-300 rounded-full">
                <AlertCircle size={32} />
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Vault is empty</p>
            </div>
          ) : (
            records.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${
                    record.type === 'prescription' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{record.fileName}</h5>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                        record.type === 'prescription' ? 'bg-indigo-50/50 border-indigo-100 text-indigo-500' : 'bg-rose-50/50 border-rose-100 text-rose-500'
                      }`}>
                        {record.type}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                        <Calendar size={12} />
                        {record.createdAt?.toDate().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
                <a
                  href={record.fileURL}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  <ExternalLink size={20} />
                </a>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
