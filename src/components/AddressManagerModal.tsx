import React, { useState } from 'react';
import { X, MapPin, Plus, Trash2, CheckCircle2, Home, Briefcase, Building2, Compass, AlertCircle } from 'lucide-react';
import { Address, User } from '../types';
import { api } from '../api/client';

interface AddressManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onAddressesUpdated: (updatedUser: User) => void;
}

export const AddressManagerModal: React.FC<AddressManagerModalProps> = ({
  isOpen,
  onClose,
  user,
  onAddressesUpdated,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [line1, setLine1] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState(user?.city || 'Bengaluru');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const newAddress = await api.addAddress({
        label,
        line1,
        locality,
        city,
        pincode,
        landmark,
        isDefault,
      });

      const updatedAddresses = isDefault
        ? user.addresses.map((a) => ({ ...a, isDefault: false })).concat(newAddress)
        : [...user.addresses, newAddress];

      onAddressesUpdated({
        ...user,
        addresses: updatedAddresses,
      });

      // Reset form
      setLine1('');
      setLocality('');
      setPincode('');
      setLandmark('');
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save address.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      await api.deleteAddress(addressId);
      const updated = user.addresses.filter((a) => a.id !== addressId);
      onAddressesUpdated({
        ...user,
        addresses: updated,
      });
    } catch (err: any) {
      alert(err.message || 'Could not delete address');
    }
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await api.updateAddress(address.id, { isDefault: true });
      const updated = user.addresses.map((a) => ({
        ...a,
        isDefault: a.id === address.id,
      }));
      onAddressesUpdated({
        ...user,
        addresses: updated,
      });
    } catch (err: any) {
      alert(err.message || 'Could not set default address');
    }
  };

  const getIcon = (lbl: string) => {
    if (lbl === 'Home') return <Home className="w-4 h-4 text-blue-600" />;
    if (lbl === 'Work') return <Briefcase className="w-4 h-4 text-indigo-600" />;
    return <Building2 className="w-4 h-4 text-purple-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl md:rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide uppercase mb-3 w-fit">
            <MapPin className="w-3.5 h-3.5" />
            Address Management
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Saved Addresses</h2>
          <p className="text-blue-100 text-sm mt-1">
            Manage home, work & family delivery locations for 30-min express SOS arrival.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* List of saved addresses */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your Address Book ({user.addresses.length})
              </h3>
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add New Location
                </button>
              )}
            </div>

            {user.addresses.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-3xl p-6">
                <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No saved addresses found</p>
                <p className="text-xs text-slate-500 mt-0.5">Add an address for quick SOS dispatch.</p>
              </div>
            ) : (
              user.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    addr.isDefault
                      ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white shadow-xs border border-slate-100">
                        {getIcon(addr.label)}
                      </div>
                      <span className="text-xs font-extrabold text-slate-900">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-1">{addr.line1}</p>
                    <p className="text-xs text-slate-500">
                      {addr.locality}, {addr.city} - {addr.pincode}{' '}
                      {addr.landmark ? `(Near ${addr.landmark})` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Address Form Drawer */}
          {showAddForm && (
            <form onSubmit={handleAddAddress} className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="text-sm font-bold text-slate-900">Add New Location</h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
                >
                  Cancel
                </button>
              </div>

              {/* Tag selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 mr-1">Save As:</span>
                {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setLabel(lbl)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      label === lbl
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Flat / House / Building Name
                </label>
                <input
                  type="text"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="e.g. Flat 402, Sunshine Apartments"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Locality / Area
                  </label>
                  <input
                    type="text"
                    required
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Indiranagar"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 560038"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Metro Gate 2"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="text-xs font-medium text-slate-700">
                  Set as my primary default address
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Saving Address...' : 'Save Address to Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
