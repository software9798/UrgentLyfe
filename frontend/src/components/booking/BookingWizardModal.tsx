import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Zap,
  CreditCard,
  Tag,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Award,
  Star,
} from 'lucide-react';
import { ServiceItem, AIDiagnosis, Booking, City, ProviderTier, Partner } from '../../types';
import { api } from '../../api/client';
import { PARTNERS } from '../../data/mockData';
import { ProviderTierSelector, PROVIDER_TIERS } from '../services/ProviderTierSelector';

interface BookingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  isUrgentDefault?: boolean;
  aiDiagnosis?: AIDiagnosis | null;
  selectedCity: City;
  selectedLocality: string;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingWizardModal: React.FC<BookingWizardModalProps> = ({
  isOpen,
  onClose,
  service,
  isUrgentDefault = false,
  aiDiagnosis = null,
  selectedCity,
  selectedLocality,
  onBookingSuccess,
}) => {
  if (!isOpen || !service) return null;

  const [step, setStep] = useState<number>(1);
  const [selectedProviderTier, setSelectedProviderTier] = useState<ProviderTier>('INTERMEDIATE');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isUrgent, setIsUrgent] = useState<boolean>(isUrgentDefault);
  const [scheduledDate, setScheduledDate] = useState<string>('Tomorrow');
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState<string>('10:00 AM - 11:00 AM');

  // Address State
  const [addressLine1, setAddressLine1] = useState<string>('Flat 402, Sunshine Apartments');
  const [locality, setLocality] = useState<string>(selectedLocality);
  const [pincode, setPincode] = useState<string>('560038');
  const [landmark, setLandmark] = useState<string>('Near Metro Station Gate 2');

  // Coupon & Payment
  const [couponCode, setCouponCode] = useState<string>('URGENT20');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState<string>('20% OFF Applied');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH' | 'WALLET'>('CASH');
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Price calculations based on selected provider rating tier
  const tierInfo = PROVIDER_TIERS.find((t) => t.id === selectedProviderTier) || PROVIDER_TIERS[1];
  const subtotal = Math.round(service.price * tierInfo.priceMultiplier);
  const urgentFee = isUrgent ? service.urgentFee : 0;
  const discountAmount = appliedDiscount || (couponCode ? Math.min(subtotal * 0.2, 200) : 0);
  const taxable = Math.max(0, subtotal + urgentFee - discountAmount);
  const gstTax = Math.round(taxable * 0.18);
  const totalAmount = Math.round(taxable + gstTax);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await api.validateCoupon(couponCode, subtotal);
      setAppliedDiscount(res.discountAmount);
      setCouponMsg(`Coupon Applied: ₹${res.discountAmount} OFF!`);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Invalid coupon code');
      setAppliedDiscount(0);
    }
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        serviceId: service.id,
        quantity: 1,
        isUrgent,
        scheduledDate,
        scheduledTimeSlot,
        providerTier: selectedProviderTier,
        providerTierTitle: tierInfo.title,
        partnerId: selectedPartner?.id,
        partner: selectedPartner || undefined,
        userAddress: {
          line1: addressLine1,
          locality,
          city: selectedCity.name,
          pincode,
          landmark,
        },
        paymentMethod,
        notes,
        aiDiagnosis: aiDiagnosis || undefined,
        couponCode,
      };

      const createdBooking = await api.createBooking(bookingData);
      setLoading(false);
      onBookingSuccess(createdBooking);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to create booking. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase">
                Step {step} of 3
              </span>
              <span className="text-xs text-slate-300 font-semibold">{service.title}</span>
            </div>
            <h2 className="text-base font-black text-white mt-1">
              {step === 1 && 'Service Address & Location'}
              {step === 2 && 'Rating Tier & Technician Selection'}
              {step === 3 && 'Payment & Order Summary'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Address Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Flat / House No. & Building Name *
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="e.g. Flat 402, Sunshine Apts"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Locality / Sector
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Landmark / Instructions for Technician
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite City Hospital Gate 2"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Technician Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Bring extra ladder and copper tape"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Rating Tier & Technician Selection */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Provider Rating Tier Selector */}
              <ProviderTierSelector
                service={service}
                selectedTier={selectedProviderTier}
                onSelectTier={setSelectedProviderTier}
                availablePartners={PARTNERS}
                selectedPartnerId={selectedPartner?.id}
                onSelectPartner={(partner) => setSelectedPartner(partner)}
                selectedCityName={selectedCity?.name}
              />

              {/* Emergency SOS Toggle */}
              {service.isUrgentAvailable && (
                <div
                  onClick={() => setIsUrgent(!isUrgent)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isUrgent
                      ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                      <Zap className="w-5 h-5 fill-slate-950" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">
                        Emergency 30-Min Express SOS Dispatch
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Immediate priority partner allocation & fast arrival (+₹{service.urgentFee})
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                </div>
              )}

              {!isUrgent && (
                <div className="pt-2 border-t border-slate-100 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Select Date
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Today', 'Tomorrow', 'In 2 Days'].map((d) => (
                        <button
                          key={d}
                          onClick={() => setScheduledDate(d)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            scheduledDate === d
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Select Arrival Time Slot
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        '09:00 AM - 10:00 AM',
                        '11:00 AM - 12:00 PM',
                        '02:00 PM - 03:00 PM',
                        '05:00 PM - 06:00 PM',
                      ].map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setScheduledTimeSlot(slot)}
                          className={`p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                            scheduledTimeSlot === slot
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-500 font-bold'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Payment & Summary */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Selected Tier Confirmation Summary */}
              <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="font-bold text-white text-xs">{tierInfo.title} ({tierInfo.ratingBadge})</p>
                    <p className="text-[10px] text-slate-300">{tierInfo.experienceText} • {tierInfo.badgeTag}</p>
                  </div>
                </div>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  {selectedProviderTier} TIER
                </span>
              </div>

              {/* Coupon Code Input */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Apply Discount Coupon
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="URGENT20 / FIRST50"
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs uppercase font-bold text-slate-800"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponMsg && <p className="text-[10px] text-emerald-600 font-semibold mt-1">{couponMsg}</p>}
              </div>

              {/* Payment Mode Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Payment Method
                  </label>
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
                    COD Active (Pay After Work)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'CASH', label: '💵 Cash On Service (COD)', desc: 'Pay technician directly after service' },
                    { id: 'UPI', label: '📱 UPI / QR Code', desc: 'Pay via UPI handle after job' },
                    { id: 'WALLET', label: '💳 UrgentLyfe Wallet', desc: 'Use wallet balance' },
                    { id: 'CARD', label: '💳 Card On Arrival', desc: 'POS card payment on arrival' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                        paymentMethod === pm.id
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-500 ring-2 ring-emerald-500/20 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <p className="font-extrabold">{pm.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-normal">{pm.desc}</p>
                    </button>
                  ))}
                </div>
                {paymentMethod === 'CASH' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
                    <span className="text-base leading-none">💡</span>
                    <p className="text-[11px] leading-relaxed">
                      <strong>Cash on Delivery:</strong> No advance payment required today. Hand cash to the technician after the job is completed. Your <strong>GST Tax Invoice</strong> will be generated immediately upon cash settlement.
                    </p>
                  </div>
                )}
              </div>

              {/* Order Calculation Breakdown */}
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Payment Summary
                </h4>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{service.title} ({tierInfo.title})</span>
                  <span>₹{subtotal}</span>
                </div>
                {isUrgent && (
                  <div className="flex justify-between text-xs text-amber-300">
                    <span>Emergency SOS Dispatch Fee</span>
                    <span>₹{urgentFee}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400">
                    <span>Coupon Discount</span>
                    <span>-₹{Math.round(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-400">
                  <span>GST Tax (18%)</span>
                  <span>₹{gstTax}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-black text-white">
                  <span>Total Payable</span>
                  <span className="text-amber-400 text-base">₹{totalAmount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1 shadow-sm cursor-pointer ml-auto"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="confirm-booking-final-btn"
              onClick={handleConfirmBooking}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 ml-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {paymentMethod === 'CASH'
                      ? `Confirm COD Order (₹${totalAmount})`
                      : `Confirm & Pay ₹${totalAmount}`}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
