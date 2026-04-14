import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { useNavigation } from '@/components/NavigationContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ArrowLeft, Fish, MapPin, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ShareSheet from '@/components/ShareSheet';

// Fix default marker icons for leaflet in vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const customIcon = L.divIcon({
  html: `<div style="
    background: #CCFF00;
    width: 28px;
    height: 28px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 2px solid #121212;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
  className: '',
});

export default function CatchMap() {
  const { goBack, navigate } = useNavigation();
  const [showShare, setShowShare] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: catches = [], isLoading } = useQuery({
    queryKey: ['catches', currentUser?.email],
    queryFn: () => base44.entities.Catch.filter({ created_by: currentUser.email }, '-created_date'),
    enabled: !!currentUser,
  });

  const mappableCatches = catches.filter(c => c.location_lat && c.location_lng);

  // Default center: Gold Coast, Australia
  const defaultCenter = [-28.0, 153.4];
  const center = mappableCatches.length > 0
    ? [mappableCatches[0].location_lat, mappableCatches[0].location_lng]
    : defaultCenter;

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-[1000] bg-[#121212]/90 backdrop-blur-xl border-b border-gray-800/50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => goBack()}
            className="w-10 h-10 rounded-xl bg-[#1E1E1E] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
              <h1 className="text-white text-lg font-bold tracking-tight">CATCH MAP</h1>
              <p className="text-gray-500 text-xs uppercase tracking-widest">
                {mappableCatches.length} of {catches.length} catches plotted
              </p>
            </div>
            <button
              onClick={() => setShowShare(true)}
              className="w-10 h-10 rounded-xl bg-[#1E1E1E] flex items-center justify-center border border-gray-700 hover:border-[#CCFF00] transition-colors"
            >
              <Share2 className="w-5 h-5 text-[#CCFF00]" />
            </button>
          </div>
          </header>

          <ShareSheet
          isOpen={showShare}
          onClose={() => setShowShare(false)}
          title="My Catch Map — FLICK-META"
          text={`I've logged ${catches.length} catches on TACKLE TALLY! 🎣🗺️`}
          url={window.location.href}
          />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 relative" style={{ minHeight: 'calc(100vh - 72px)' }}>
          <MapContainer
            center={center}
            zoom={mappableCatches.length > 0 ? 12 : 10}
            style={{ height: '100%', width: '100%', minHeight: 'calc(100vh - 72px)', background: '#1a1a1a' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mappableCatches.map(c => (
              <Marker
                key={c.id}
                position={[c.location_lat, c.location_lng]}
                icon={customIcon}
              >
                <Popup>
                  <div style={{ background: '#1E1E1E', borderRadius: 12, padding: 12, minWidth: 180, color: 'white', fontFamily: 'Inter, sans-serif' }}>
                    {c.photo_url && (
                      <img
                        src={c.photo_url}
                        alt={c.fish_type}
                        style={{ width: '100%', height: 96, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                      />
                    )}
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{c.fish_type || 'Unknown'}</div>
                    {c.length && (
                      <div style={{ color: '#CCFF00', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{c.length} cm</div>
                    )}
                    {c.timestamp && (
                      <div style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>
                        {format(new Date(c.timestamp), 'MMM d, yyyy · h:mm a')}
                      </div>
                    )}
                    {c.location_name && (
                      <div style={{ color: '#666', fontSize: 11, marginBottom: 8 }}>📍 {c.location_name}</div>
                    )}
                    {c.session_id && (
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); navigate('SessionDetail', { id: c.session_id }); }}
                        style={{
                          display: 'block',
                          background: '#CCFF00',
                          color: '#121212',
                          fontWeight: 700,
                          fontSize: 12,
                          textAlign: 'center',
                          padding: '6px 0',
                          borderRadius: 8,
                          textDecoration: 'none',
                        }}
                      >
                        View Session →
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* No GPS catches notice */}
          {catches.length > 0 && mappableCatches.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="bg-[#1E1E1E]/90 rounded-2xl border border-gray-700 p-6 text-center mx-6">
                <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-white font-semibold mb-1">No GPS Data</p>
                <p className="text-gray-500 text-sm">Your catches don't have GPS coordinates yet. Enable location access when logging catches.</p>
              </div>
            </div>
          )}

          {catches.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="bg-[#1E1E1E]/90 rounded-2xl border border-gray-700 p-6 text-center mx-6">
                <Fish className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-white font-semibold mb-1">No Catches Yet</p>
                <p className="text-gray-500 text-sm">Start logging catches to see them on the map.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}