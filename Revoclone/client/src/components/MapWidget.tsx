import React, { useEffect, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

type Props = {
  lat?: number;
  lon?: number;
  address?: string;
  merchant?: string;
};

function Recenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 15, { animate: false });
  }, [lat, lon, map]);
  return null;
}

function openAppleMaps(lat: number, lon: number, q?: string) {
  const query = q ? encodeURIComponent(q) : `${lat},${lon}`;
  const url = `https://maps.apple.com/?ll=${lat},${lon}&q=${query}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export default function MapWidget({ lat, lon, address, merchant }: Props) {
  const hasCoords = typeof lat === 'number' && typeof lon === 'number';
  const placeTitle = useMemo(() => {
    if (!address) return merchant || 'Location';
    const parts = address.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) return merchant || 'Location';
    // drop country if present
    const coreParts = parts.length > 1 ? parts.slice(0, -1) : parts;
    let seg = coreParts[coreParts.length - 1] || parts[0];
    const withoutDigits = seg.replace(/\d+/g, '').trim();
    const tokens = withoutDigits.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return merchant || 'Location';
    const startsWithDigit = /^\d/.test(seg.trim());
    const candidate = startsWithDigit ? tokens[tokens.length - 1] : tokens[0];
    return candidate || (merchant || 'Location');
  }, [address, merchant]);

  return (
    <div className="rounded-2xl overflow-hidden bg-[#2C2C2E]">
      <div className="relative h-40">
        {hasCoords ? (
          <MapContainer
            center={[lat!, lon!]}
            zoom={15}
            zoomControl={false}
            attributionControl={false}
            style={{ height: '100%', width: '100%', filter: 'saturate(0.8) contrast(1.05) brightness(0.92) hue-rotate(-3deg) blur(0.25px)' }}
            dragging
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
              attribution="© OpenStreetMap contributors, © CARTO"
            />
            <Recenter lat={lat!} lon={lon!} />
          </MapContainer>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#4A7C99] to-[#2D4A6B]" />
        )}

        {/* Soft-light color wash and vignette for a more stylized, less photoreal look */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(120% 80% at 50% 20%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.55) 100%)',
            mixBlendMode: 'soft-light',
          }}
        />
        {/* Animated sheen to give a subtle 3D animated feel */}
        <div
          className="absolute inset-0 pointer-events-none map-anim"
          style={{
            background:
              'linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(16,185,129,0.04) 50%, rgba(147,51,234,0.06) 100%)',
            mixBlendMode: 'soft-light',
            animation: 'mapSheen 12s ease-in-out infinite',
          }}
        />
        <style>{`
          @keyframes mapSheen {
            0% { opacity: .25; transform: translate3d(-2%, -2%, 0) scale(1.01); }
            50% { opacity: .35; transform: translate3d(2%, 2%, 0) scale(1.015); }
            100% { opacity: .25; transform: translate3d(-2%, -2%, 0) scale(1.01); }
          }
          @media (prefers-reduced-motion: reduce) {
            .map-anim { animation: none !important; }
          }
        `}</style>

        {/* Centered place name overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <div
            className="text-white font-bold tracking-tight"
            style={{
              fontSize: '28px',
              lineHeight: 1,
              textShadow: '0 4px 12px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.8)',
              opacity: 0.8,
              letterSpacing: '-0.5px',
            }}
          >
            {placeTitle}
          </div>
        </div>

  {/* Bottom-left Apple Maps label */}
        <div className="absolute bottom-3 left-3 select-none pointer-events-none">
          <span className="text-white text-[12px] font-semibold align-middle"></span>
          <span className="ml-1 text-white text-[12px] font-medium align-middle">Maps</span>
        </div>
        {/* Bottom-right Legal */}
        <button
          type="button"
          onClick={() => hasCoords && openAppleMaps(lat!, lon!, merchant || address)}
          className="absolute bottom-3 right-3 text-white/70 text-[10px] underline-offset-2 hover:underline"
          title="Open in Apple Maps"
        >
          Legal
        </button>
      </div>

      {/* Address row with chevron */}
      <button
        type="button"
        onClick={() => hasCoords && openAppleMaps(lat!, lon!, merchant || address)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
  <div className="text-white text-[17px] leading-tight">
          {address || 'Unknown location'}
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" className="text-white/50">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      </button>
    </div>
  );
}
