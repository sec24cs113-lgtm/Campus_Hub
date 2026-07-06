'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlaySquare, FileText, BookOpen, Upload, X, Check, ChevronRight,
  Image as ImageIcon, FileUp, Loader2, ArrowLeft, Tag, DollarSign,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

const rawClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ResourceType = 'video' | 'qp' | 'book';

const categories: { type: ResourceType; label: string; icon: typeof PlaySquare; color: string; desc: string }[] = [
  { type: 'video', label: 'Video Course', icon: PlaySquare, color: '#3b82f6', desc: 'Lectures, tutorials, recorded sessions' },
  { type: 'qp', label: 'Question Paper', icon: FileText, color: '#10b981', desc: 'Past papers, mock tests, solutions' },
  { type: 'book', label: 'Textbook / Book', icon: BookOpen, color: '#8b5cf6', desc: 'Textbooks, notes, reference material' },
];

const subjects = ['Computer Science', 'Physics', 'Mathematics', 'Economics', 'Chemistry', 'Law', 'Biology'];

const steps = ['Category', 'Details', 'Upload', 'Pricing'];

export default function UploadPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [type, setType] = useState<ResourceType | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [subject, setSubject] = useState(subjects[0]);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [badge, setBadge] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canProceed = () => {
    if (step === 0) return type !== null;
    if (step === 1) return title.trim() !== '' && author.trim() !== '';
    if (step === 2) return file !== null;
    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverImage(f);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be signed in to upload.');
      return;
    }
    if (!type || !file) {
      setError('Missing category or file.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: upErr } = await supabase.storage
        .from('resource-files')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw new Error(upErr.message);

      let imageUrl: string | null = null;
      if (coverImage) {
        const imgExt = coverImage.name.split('.').pop();
        const imgPath = `${user.id}/covers/${Date.now()}.${imgExt}`;
        const { error: imgErr } = await supabase.storage
          .from('resource-files')
          .upload(imgPath, coverImage, { cacheControl: '3600', upsert: false });
        if (!imgErr) {
          const { data: pub } = supabase.storage.from('resource-files').getPublicUrl(imgPath);
          imageUrl = pub.publicUrl;
        }
      }

      const { error: insErr } = await rawClient.from('resources').insert({
        title: title.trim(),
        author: author.trim(),
        subject,
        type,
        description: description.trim() || null,
        price: parseFloat(price) || 0,
        badge: badge.trim() || null,
        image_url: imageUrl,
        file_url: filePath,
        file_name: file.name,
        user_id: user.id,
        verified: false,
      });
      if (insErr) throw new Error(insErr.message);

      toast({ title: 'Upload successful!', description: 'Your resource is now live in the marketplace.' });
      router.push(type === 'video' ? '/videos' : type === 'qp' ? '/qp' : '/books');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bold text-2xl mb-1" style={{ color: '#1e293b' }}>Upload a Resource</h1>
        <p className="text-sm" style={{ color: '#94a3b8' }}>Share your academic materials with the CollegeHub community.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                style={{
                  backgroundColor: i < step ? '#10b981' : i === step ? '#3b82f6' : '#e2e8f0',
                  color: i <= step ? '#ffffff' : '#94a3b8',
                }}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className="text-xs font-medium mt-1.5"
                style={{ color: i === step ? '#1e293b' : '#94a3b8' }}
              >
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2 -mt-5 rounded-full transition-all"
                style={{ backgroundColor: i < step ? '#10b981' : '#e2e8f0' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #e8edf5' }}>
        {/* Step 0: Category */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-lg mb-1" style={{ color: '#1e293b' }}>Choose a category</h2>
              <p className="text-sm" style={{ color: '#94a3b8' }}>Select what kind of resource you're uploading.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {categories.map(({ type: t, label, icon: Icon, color, desc }) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className="flex items-center gap-4 p-5 rounded-xl text-left transition-all"
                  style={{
                    border: `2px solid ${type === t ? color : '#e2e8f0'}`,
                    backgroundColor: type === t ? `${color}0d` : '#ffffff',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base" style={{ color: '#1e293b' }}>{label}</p>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>{desc}</p>
                  </div>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      border: `2px solid ${type === t ? color : '#cbd5e1'}`,
                      backgroundColor: type === t ? color : 'transparent',
                    }}
                  >
                    {type === t && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-lg mb-1" style={{ color: '#1e293b' }}>Resource details</h2>
              <p className="text-sm" style={{ color: '#94a3b8' }}>Tell students what your resource is about.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced Calculus — Complete Lecture Series"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid #e2e8f0', color: '#1e293b' }}
                onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #3b82f6')}
                onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #e2e8f0')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>Author / Instructor</label>
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ border: '1.5px solid #e2e8f0', color: '#1e293b' }}
                  onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #3b82f6')}
                  onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #e2e8f0')}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ border: '1.5px solid #e2e8f0', color: '#1e293b', backgroundColor: '#fff' }}
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what students will learn..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
                style={{ border: '1.5px solid #e2e8f0', color: '#1e293b' }}
                onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #3b82f6')}
                onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #e2e8f0')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>Badge (optional)</label>
              <input
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Bestseller, New, Featured"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid #e2e8f0', color: '#1e293b' }}
                onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #3b82f6')}
                onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #e2e8f0')}
              />
            </div>
          </div>
        )}

        {/* Step 2: File upload */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-lg mb-1" style={{ color: '#1e293b' }}>Upload your file</h2>
              <p className="text-sm" style={{ color: '#94a3b8' }}>
                {type === 'video' ? 'MP4, MOV, or WebM video file' : type === 'qp' ? 'PDF document of the question paper' : 'PDF or EPUB book file'}
              </p>
            </div>

            {/* File dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl p-8 text-center cursor-pointer transition-all"
              style={{
                border: `2px dashed ${file ? '#10b981' : '#cbd5e1'}`,
                backgroundColor: file ? '#10b9810d' : '#f8fafc',
              }}
            >
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
                    <Check className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-semibold text-sm" style={{ color: '#1e293b' }}>{file.name}</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#e2e8f0' }}>
                    <FileUp className="w-7 h-7" style={{ color: '#64748b' }} />
                  </div>
                  <p className="font-semibold text-sm" style={{ color: '#475569' }}>Click to select a file</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Max 50MB</p>
                </div>
              )}
            </div>

            {/* Cover image */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>Cover image (optional)</label>
              <div className="flex items-center gap-4">
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl flex items-center justify-center cursor-pointer transition-all flex-shrink-0 overflow-hidden"
                  style={{ border: '1.5px dashed #cbd5e1', backgroundColor: '#f8fafc' }}
                >
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6" style={{ color: '#94a3b8' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#475569' }}>
                    {coverImage ? coverImage.name : 'No cover image selected'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>A thumbnail shown in the marketplace card.</p>
                </div>
                {coverImage && (
                  <button
                    onClick={() => { setCoverImage(null); setImagePreview(null); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#fee2e2' }}
                  >
                    <X className="w-4 h-4" style={{ color: '#ef4444' }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-lg mb-1" style={{ color: '#1e293b' }}>Set your price</h2>
              <p className="text-sm" style={{ color: '#94a3b8' }}>Choose how much students will pay for your resource.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>Price (USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ border: '1.5px solid #e2e8f0', color: '#1e293b' }}
                  onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #3b82f6')}
                  onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #e2e8f0')}
                />
              </div>
              <p className="text-xs mt-1.5" style={{ color: '#94a3b8' }}>Enter 0 to offer this resource for free.</p>
            </div>

            {/* Summary */}
            <div className="rounded-xl p-5" style={{ backgroundColor: '#f8fafc', border: '1px solid #e8edf5' }}>
              <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#94a3b8' }}>SUMMARY</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between"><span style={{ color: '#64748b' }}>Category</span><span className="font-semibold capitalize" style={{ color: '#1e293b' }}>{type}</span></div>
                <div className="flex justify-between"><span style={{ color: '#64748b' }}>Title</span><span className="font-semibold" style={{ color: '#1e293b' }}>{title}</span></div>
                <div className="flex justify-between"><span style={{ color: '#64748b' }}>Subject</span><span className="font-semibold" style={{ color: '#1e293b' }}>{subject}</span></div>
                <div className="flex justify-between"><span style={{ color: '#64748b' }}>File</span><span className="font-semibold" style={{ color: '#1e293b' }}>{file?.name}</span></div>
                <div className="flex justify-between"><span style={{ color: '#64748b' }}>Price</span><span className="font-semibold" style={{ color: '#1e293b' }}>${parseFloat(price) || 0}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-5 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
            {error}
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid #e8edf5' }}>
          <button
            onClick={() => (step === 0 ? router.back() : setStep(step - 1))}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ color: '#475569' }}
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < 3 ? (
            <button
              onClick={() => canProceed() && setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: canProceed() ? '#3b82f6' : '#e2e8f0',
                color: canProceed() ? '#ffffff' : '#94a3b8',
              }}
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: submitting ? '#94a3b8' : '#10b981',
                color: '#ffffff',
              }}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {submitting ? 'Publishing...' : 'Publish Resource'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
