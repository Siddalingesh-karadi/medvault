import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../../lib/firebase';
import { motion } from 'motion/react';
import { ChevronLeft, FileText, Upload, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function PatientUpload() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'prescription' | 'report'>('prescription');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setStatus('uploading');
    setError(null);

    try {
      // 1. Upload to Storage
      const fileRef = ref(storage, `records/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const fileURL = await getDownloadURL(snapshot.ref);

      // 2. Save metadata to Firestore
      await addDoc(collection(db, 'records'), {
        patientId: user.uid,
        fileURL,
        fileName: file.name,
        type,
        createdAt: serverTimestamp(),
      });

      setStatus('success');
      setTimeout(() => navigate('/patient/timeline'), 1500);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setError(err.message || 'Failed to upload record');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-500 shadow-sm">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold tracking-tight">Upload Record</h2>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleUpload}
        className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-8"
      >
        {/* Type Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setType('prescription')}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
              type === 'prescription' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'
            }`}
          >
            <FileText size={28} />
            <span className="text-xs font-bold uppercase tracking-wider">Prescription</span>
          </button>
          <button
            type="button"
            onClick={() => setType('report')}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
              type === 'report' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'
            }`}
          >
            <Upload size={28} />
            <span className="text-xs font-bold uppercase tracking-wider">Medical Report</span>
          </button>
        </div>

        {/* File Input */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Select File (PDF or Image)</label>
          <label className={`w-full border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
            file ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-gray-50 hover:border-blue-200'
          }`}>
            <input type="file" onChange={handleFileChange} className="hidden" accept=".pdf,image/*" />
            {file ? (
              <>
                <CheckCircle2 size={48} className="text-green-500" />
                <div className="text-center">
                  <p className="font-bold text-green-700 line-clamp-1">{file.name}</p>
                  <p className="text-xs text-green-600 font-medium capitalize">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-500">
                  <Upload size={32} />
                </div>
                <p className="text-gray-400 font-medium">Tap to browse files</p>
              </>
            )}
          </label>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm">
            <AlertCircle size={20} />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || status === 'uploading' || status === 'success'}
          className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
            status === 'success'
              ? 'bg-green-500 text-white shadow-lg shadow-green-100'
              : 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700'
          } disabled:opacity-50 disabled:shadow-none`}
        >
          {status === 'uploading' && <Loader2 size={24} className="animate-spin" />}
          {status === 'success' && <CheckCircle2 size={24} />}
          {status === 'idle' && 'Upload to Vault'}
          {status === 'uploading' && 'Uploading Record...'}
          {status === 'success' && 'Ready in Timeline!'}
          {status === 'error' && 'Try Again'}
        </button>
      </motion.form>
    </div>
  );
}
