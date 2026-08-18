import React, { useState } from 'react';
import {
  X,
  Navigation,
  MapPin,
  Clock,
  Car,
  ExternalLink,
  Copy,
  Check,
  Phone,
  ShieldCheck,
  Share2,
  Compass,
} from 'lucide-react';
import { Booking, Partner } from '../types';
import {
  formatFullAddress,
  getGoogleMapsDirectionsUrl,
  getAppleMapsDirectionsUrl,
  getWazeDirectionsUrl,
  getEstimatedRouteDetails,
} from '../utils/directionsHelper';

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  viewerRole?: 'PROVIDER' | 'CUSTOMER';
}

export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  isOpen,
  onClose,
  booking,
  viewerRole = 'PROVIDER',
}) => {
  if (!isOpen || !booking) return null;

  const [copied, setCopied] = useState(false);
  const [navApp, setNavApp] = useState<'google' | 'apple' | 'waze'>('google');

  const destinationAddress = booking.userAddress;
  const fullAddressString = formatFullAddress(destinationAddress);
  const routeDetails = getEstimatedRouteDetails(destinationAddress, destinationAddress.city || 'Bengaluru');

  const googleMapsUrl = getGoogleMapsDirectionsUrl(destinationAddress);
  const appleMapsUrl = getAppleMapsDirectionsUrl(destinationAddress);
  const wazeUrl = getWazeDirectionsUrl(destinationAddress);

  const activeUrl =
    navApp === 'google' ? googleMapsUrl : navApp === 'apple' ? appleMapsUrl : wazeUrl;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(fullAddressString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenNavigation = () => {
    window.open(activeUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div
        id="directions-modal-container"
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer"
            title="Close Directions"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3 h-3 stroke-[2.5]" />
              ONE-CLICK DIRECTIONS
            </span>
            <span className="text-xs text-blue-200 font-mono">Job #{booking.id}</span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white">
            Turn-by-Turn Route Navigation
          </h2>
          <p className="text-xs text-blue-200/90 mt-0.5">
            {viewerRole === 'PROVIDER'
              ? `Live directions to customer's home for ${booking.service.title}`
              : `Technician route & navigation to your address`}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Quick Metrics Bar: ETA, Distance, Traffic */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-0.5">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Est. Time</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-blue-950 font-mono">
                {routeDetails.durationMins}
              </p>
            </div>

            <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-indigo-600 mb-0.5">
                <Car className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Distance</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-indigo-950 font-mono">
                {routeDetails.distanceKm}
              </p>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-600 mb-0.5">
                <Navigation className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Traffic</span>
              </div>
              <p className="text-sm sm:text-base font-black text-emerald-800 mt-1">
                {routeDetails.trafficLevel} Flow
              </p>
            </div>
          </div>

          {/* Primary One-Click Open Navigation Button */}
          <div className="space-y-2">
            <button
              id="start-one-click-navigation-btn"
              onClick={handleOpenNavigation}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white py-3.5 px-5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <Navigation className="w-5 h-5 fill-white" />
              <span>Launch One-Click Directions in Maps</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
            </button>

            {/* Map App Selector Tabs */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500 font-medium">Open in:</span>
              <button
                onClick={() => setNavApp('google')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  navApp === 'google'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Google Maps
              </button>
              <button
                onClick={() => setNavApp('apple')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  navApp === 'apple'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Apple Maps
              </button>
              <button
                onClick={() => setNavApp('waze')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  navApp === 'waze'
                    ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Waze
              </button>
            </div>
          </div>

          {/* Destination Address Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Customer Destination Address
              </span>
              <button
                onClick={handleCopyAddress}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm font-extrabold text-slate-900 leading-snug">
              {destinationAddress.line1}
            </p>
            <p className="text-xs text-slate-600">
              {destinationAddress.locality}, {destinationAddress.city} - {destinationAddress.pincode}
            </p>
            {destinationAddress.landmark && (
              <p className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 inline-block">
                📍 Landmark: {destinationAddress.landmark}
              </p>
            )}
          </div>

          {/* Contact Contact Person */}
          <div className="bg-slate-100/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                {viewerRole === 'PROVIDER' ? (booking.userName?.[0] || 'C') : (booking.partner?.name?.[0] || 'P')}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  {viewerRole === 'PROVIDER' ? 'Customer Contact' : 'Assigned Professional'}
                </p>
                <p className="text-xs font-black text-slate-900">
                  {viewerRole === 'PROVIDER' ? booking.userName : (booking.partner?.name || 'Assigned Technician')}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {viewerRole === 'PROVIDER' ? booking.userPhone : (booking.partner?.phone || '+91 98765 43210')}
                </p>
              </div>
            </div>

            <a
              href={`tel:${viewerRole === 'PROVIDER' ? booking.userPhone : (booking.partner?.phone || '+919876543210')}`}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          </div>

          {/* Route Step Preview */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              Turn-by-Turn Route Preview
            </h4>
            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden text-xs">
              {routeDetails.steps.map((step, idx) => (
                <div key={idx} className="p-3 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-slate-800 font-medium">{step.instruction}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{step.distance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            Powered by Google Maps Real-Time Navigation API
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
