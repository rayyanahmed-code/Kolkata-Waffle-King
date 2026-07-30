import React, { useState } from 'react';
import { MapPin, Navigation, Edit3, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { CustomerLocation } from '../types';
import { OptionButton } from './OptionButton';
import { restaurantConfig } from '../config/restaurantConfig';
import { fetchRoadDistanceKm } from '../utils/delivery';
import { geocodeKolkataAddress } from '../utils/geocoding';

interface LocationPickerProps {
  onLocationSelected: (location: CustomerLocation) => void;
  onBack?: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelected,
  onBack,
}) => {
  const [mode, setMode] = useState<'select' | 'manual'>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState('');

  const handleShareLocation = () => {
    setIsLoading(true);
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser. Please enter address manually.');
      setIsLoading(false);
      setMode('manual');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const distanceKm = await fetchRoadDistanceKm(
          restaurantConfig.location.latitude,
          restaurantConfig.location.longitude,
          latitude,
          longitude
        );
        
        setIsLoading(false);
        onLocationSelected({
          type: 'geo',
          latitude,
          longitude,
          mapsUrl,
          address: `GPS Pin (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          distanceKm,
        });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setIsLoading(false);
        setErrorMsg('Location permission was denied or unavailable. Please type your delivery address below.');
        setMode('manual');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddress = manualAddress.trim();
    if (!cleanAddress) {
      setErrorMsg('Please enter a valid street or building address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    // Geocode the entered address strictly without resorting to phone GPS
    const coords = await geocodeKolkataAddress(cleanAddress);

    let distanceKm: number | undefined;
    if (coords) {
      distanceKm = await fetchRoadDistanceKm(
        restaurantConfig.location.latitude,
        restaurantConfig.location.longitude,
        coords.latitude,
        coords.longitude
      );
    } else {
      // If geocoding returns null for an obscure address string, inform the user or estimate
      console.warn('Could not pinpoint exact geocode for address:', cleanAddress);
    }

    setIsLoading(false);

    onLocationSelected({
      type: 'manual',
      address: cleanAddress,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      distanceKm,
    });
  };

  return (
    <div className="w-full space-y-3 my-2">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {mode === 'select' ? (
        <div className="space-y-2.5">
          {onBack && (
            <div className="flex items-center justify-start">
              <button
                type="button"
                onClick={onBack}
                className="text-[11px] font-semibold text-[#FAF6F0]/80 hover:text-[#E5A93B] flex items-center gap-1 transition-colors py-1 px-2.5 bg-[#2C1810] border border-[#543123] rounded-xl"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#E5A93B]" />
                <span>Back to Order Type</span>
              </button>
            </div>
          )}

          <OptionButton
            label={isLoading ? 'Getting Location...' : 'Share Current Location'}
            subtitle="GPS Pin for accurate 30-min delivery"
            icon={isLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#E5A93B]" /> : "📍"}
            onClick={handleShareLocation}
            variant="gold"
            disabled={isLoading}
          />

          <OptionButton
            label="Enter Address Manually"
            subtitle="Building name, landmark, flat no., etc."
            icon="✍️"
            onClick={() => setMode('manual')}
            variant="secondary"
            disabled={isLoading}
          />
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-3 bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#E6D7C3]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2C1810]">
            <MapPin className="w-4 h-4 text-[#E5A93B]" />
            <span>Enter Delivery Address</span>
          </div>

          <textarea
            value={manualAddress}
            onChange={(e) => {
              setManualAddress(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="House/Flat No., Apartment Name, Street, Landmark, Area (e.g. Flat 3B, Park Heights, Park Street, Kolkata)"
            rows={3}
            className="w-full px-3 py-2 text-sm bg-white border border-[#E6D7C3] rounded-xl text-[#2C1810] placeholder:text-[#2C1810]/40 focus:outline-none focus:ring-2 focus:ring-[#E5A93B] focus:border-transparent transition-all"
            autoFocus
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('select')}
              className="px-3 py-2 text-xs font-medium text-[#2C1810]/70 hover:text-[#2C1810] transition-colors"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-[#E5A93B] hover:bg-[#F3BF59] text-[#180E0A] font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Calculating Distance...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Confirm Location</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
