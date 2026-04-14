import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, ImagePlus, Loader2, ChevronDown, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';

const LURE_TYPES = ['Soft Plastic', 'Hard Plastic', 'Bait'];

const LURE_SIZES = {
  'Soft Plastic': ['1 inch', '2 inch', '3 inch', '4 inch', '5 inch', '6 inch', '7 inch+'],
  'Hard Plastic': ['50mm', '60mm', '70mm', '80mm', '90mm', '100mm', '120mm+'],
  'Bait': ['Small', 'Medium', 'Large', 'Whole', 'Half', 'Strip'],
};

const HOOK_SIZES = ['#8', '#6', '#4', '#2', '#1', '1/0', '2/0', '3/0', '4/0', '5/0', '6/0', '7/0', '8/0'];

const LINE_WEIGHTS = [
  '2lb', '4lb', '6lb', '8lb', '10lb', '12lb', '15lb', '20lb',
  '25lb', '30lb', '40lb', '50lb', '60lb', '80lb', '100lb',
];

const LINE_TYPES = ['Mono', 'Braid', 'Fluorocarbon'];

function Dropdown({ value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between bg-[#2A2A2A] text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:border-[#CCFF00] outline-none"
      >
        <span className={value ? 'text-white' : 'text-gray-500'}>{value || placeholder}</span>
        <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#2A2A2A] border border-gray-700 rounded-xl overflow-auto max-h-52 shadow-xl">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#333] transition-colors flex items-center justify-between"
            >
              {opt}
              {value === opt && <Check className="w-3.5 h-3.5 text-[#CCFF00]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GearSection({ gear, onChange }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [uploadingLure, setUploadingLure] = useState(false);

  const set = (field, value) => onChange({ ...gear, [field]: value });

  const handleLurePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLure(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('lure_photo_url', file_url);
    setUploadingLure(false);
  };

  const lureSizes = gear.lure_type ? LURE_SIZES[gear.lure_type] : [];

  return (
    <div className="space-y-5">

      {/* LURE */}
      <div>
        <p className="text-[#CCFF00] text-xs font-bold uppercase tracking-widest mb-3">🎣 Lure</p>

        {/* Lure Type */}
        <div className="mb-3">
          <Label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Type</Label>
          <div className="flex gap-2">
            {LURE_TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('lure_type', t === gear.lure_type ? '' : t)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  gear.lure_type === t
                    ? 'bg-[#CCFF00]/15 border-[#CCFF00] text-[#CCFF00]'
                    : 'bg-[#2A2A2A] border-gray-700 text-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Brand + Size row */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <Label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Brand</Label>
            <input
              value={gear.lure_brand || ''}
              onChange={e => set('lure_brand', e.target.value)}
              placeholder="e.g. ZMan, Gulp"
              className="w-full bg-[#2A2A2A] text-white rounded-xl px-3 py-3 text-sm border border-gray-700 focus:border-[#CCFF00] outline-none"
            />
          </div>
          <div>
            <Label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Size</Label>
            {lureSizes.length > 0 ? (
              <Dropdown
                value={gear.lure_size}
                options={lureSizes}
                onChange={v => set('lure_size', v)}
                placeholder="Select..."
              />
            ) : (
              <input
                value={gear.lure_size || ''}
                onChange={e => set('lure_size', e.target.value)}
                placeholder="e.g. 3 inch"
                className="w-full bg-[#2A2A2A] text-white rounded-xl px-3 py-3 text-sm border border-gray-700 focus:border-[#CCFF00] outline-none"
              />
            )}
          </div>
        </div>

        {/* Hook size */}
        <div className="mb-3">
          <Label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Hook Size</Label>
          <Dropdown
            value={gear.lure_hook_size}
            options={HOOK_SIZES}
            onChange={v => set('lure_hook_size', v)}
            placeholder="Select hook size..."
          />
        </div>

        {/* Lure Photo */}
        <div>
          <Label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Lure Photo</Label>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLurePhoto} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleLurePhoto} />

          {gear.lure_photo_url ? (
            <div className="relative w-full h-32 rounded-xl overflow-hidden bg-[#2A2A2A]">
              <img src={gear.lure_photo_url} alt="lure" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg font-bold"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploadingLure}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#2A2A2A] border border-gray-700 text-gray-400 py-3 rounded-xl text-sm font-semibold hover:border-gray-500 transition-colors"
              >
                {uploadingLure ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                Camera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLure}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#2A2A2A] border border-gray-700 text-gray-400 py-3 rounded-xl text-sm font-semibold hover:border-gray-500 transition-colors"
              >
                <ImagePlus className="w-4 h-4" />
                Gallery
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LINE */}
      <div className="border-t border-gray-800 pt-4">
        <p className="text-[#CCFF00] text-xs font-bold uppercase tracking-widest mb-3">🧵 Line</p>

        {/* Line Type */}
        <div className="mb-3">
          <Label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Type</Label>
          <div className="flex gap-2">
            {LINE_TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('line_type', t === gear.line_type ? '' : t)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  gear.line_type === t
                    ? 'bg-[#CCFF00]/15 border-[#CCFF00] text-[#CCFF00]'
                    : 'bg-[#2A2A2A] border-gray-700 text-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Line Weight */}
        <div>
          <Label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Thickness / Pound</Label>
          <Dropdown
            value={gear.line_weight}
            options={LINE_WEIGHTS}
            onChange={v => set('line_weight', v)}
            placeholder="Select weight..."
          />
        </div>
      </div>
    </div>
  );
}