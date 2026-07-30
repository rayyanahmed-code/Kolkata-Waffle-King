import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, MapPin, Phone, User, MessageSquare, ArrowRight, ArrowLeft, ShieldCheck, Truck, Store, ExternalLink } from 'lucide-react';
import { OrderState } from '../types';
import { restaurantConfig } from '../config/restaurantConfig';
import { calculateDeliveryFee, getOrderDeliveryDistance, calculateParcelCharge, getNonBeverageItemCount } from '../utils/delivery';
import { WhatsAppButton } from './WhatsAppButton';

interface OrderSummaryProps {
  order: OrderState;
  onUpdateInstructions: (instructions: string) => void;
  onConfirmOrder: () => void;
  onEditItems: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  order,
  onUpdateInstructions,
  onConfirmOrder,
  onEditItems,
}) => {
  const { customerName, customerPhone, orderType, location, cart, specialInstructions } = order;

  const subtotal = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
  const parcelCharge = calculateParcelCharge(cart);
  const nonBeverageCount = getNonBeverageItemCount(cart);
  const distanceKm = orderType === 'delivery' ? getOrderDeliveryDistance(location?.latitude, location?.longitude) : null;
  const deliveryFee = orderType === 'delivery' ? calculateDeliveryFee(distanceKm, subtotal) : 0;
  const totalAmount = subtotal + parcelCharge + deliveryFee;

  return (
    <div className="w-full space-y-4 my-2">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onEditItems}
          className="text-[11px] font-semibold text-[#FAF6F0]/80 hover:text-[#E5A93B] flex items-center gap-1 transition-colors py-1 px-2.5 bg-[#2C1810] border border-[#543123] rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#E5A93B]" />
          <span>Back to Menu</span>
        </button>
      </div>

      {/* Receipt Card */}
      <div className="bg-[#FAF6F0] rounded-2xl border border-[#E6D7C3] p-4 shadow-xl space-y-4 text-[#2C1810]">
        {/* Receipt Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E6D7C3]">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#C78D24] uppercase">
              Order Receipt
            </span>
            <h3 className="font-serif font-extrabold text-base text-[#2C1810]">
              {restaurantConfig.name}
            </h3>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
            orderType === 'delivery' 
              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
          }`}>
            {orderType === 'delivery' ? <Truck className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
            {orderType === 'delivery' ? 'Delivery' : 'Pickup'}
          </span>
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-white/70 p-2.5 rounded-xl border border-[#E6D7C3]">
          <div className="flex items-center gap-1.5 text-[#2C1810]/80">
            <User className="w-3.5 h-3.5 text-[#E5A93B]" />
            <span className="font-semibold text-[#2C1810] truncate">{customerName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#2C1810]/80 justify-end">
            <Phone className="w-3.5 h-3.5 text-[#E5A93B]" />
            <span className="font-semibold text-[#2C1810]">{customerPhone}</span>
          </div>

          {orderType === 'delivery' && location && (
            <div className="col-span-2 pt-1 border-t border-[#E6D7C3]/50 flex items-start gap-1.5 text-[11px] text-[#2C1810]/80">
              <MapPin className="w-3.5 h-3.5 text-[#E5A93B] mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">
                {location.type === 'geo' ? (location.mapsUrl || 'Google Maps Location Shared') : location.address}
              </span>
            </div>
          )}

          {orderType === 'pickup' && (
            <div className="col-span-2 pt-1.5 border-t border-[#E6D7C3]/50 space-y-1.5 text-[11px] text-[#2C1810]">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-1.5">
                  <Store className="w-3.5 h-3.5 text-[#E5A93B] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-[#2C1810] block">Pickup Location:</span>
                    <span className="text-[#2C1810]/80 leading-tight block">{restaurantConfig.address}</span>
                  </div>
                </div>
                {restaurantConfig.googleMapsUrl && (
                  <a
                    href={restaurantConfig.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#E5A93B] hover:bg-[#F3BF59] text-[#180E0A] font-bold text-[10px] shadow-sm transition-all active:scale-95"
                  >
                    <span>Open Maps</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Selected Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#2C1810]">
            <span className="flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-[#E5A93B]" />
              <span>Items Ordered ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
            </span>
            <button
              onClick={onEditItems}
              className="text-[#C78D24] underline hover:text-[#2C1810] text-[11px] font-semibold"
            >
              Modify Items
            </button>
          </div>

          <div className="divide-y divide-[#E6D7C3]/60 bg-white rounded-xl border border-[#E6D7C3] p-2.5 max-h-48 overflow-y-auto">
            {cart.map(({ item, quantity }) => (
              <div key={item.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#2C1810] text-[#E5A93B] font-extrabold text-[10px] flex items-center justify-center">
                    {quantity}x
                  </span>
                  <div>
                    <div className="font-semibold text-[#2C1810]">{item.name}</div>
                    <div className="text-[10px] text-[#2C1810]/60">₹{item.price} each</div>
                  </div>
                </div>
                <span className="font-bold text-[#2C1810]">
                  ₹{item.price * quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Special Instructions Field */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#2C1810]">
            <MessageSquare className="w-3.5 h-3.5 text-[#E5A93B]" />
            <span>Special Instructions (Optional)</span>
          </label>
          <input
            type="text"
            value={specialInstructions}
            onChange={(e) => onUpdateInstructions(e.target.value)}
            placeholder="e.g., Less sugar, extra crispy waffle, call before arrival"
            className="w-full px-3 py-2 text-xs bg-white border border-[#E6D7C3] rounded-xl text-[#2C1810] placeholder:text-[#2C1810]/40 focus:outline-none focus:ring-2 focus:ring-[#E5A93B]"
          />
        </div>

        {/* Bill Breakdown */}
        <div className="bg-[#2C1810] text-[#FAF6F0] p-3 rounded-xl space-y-1.5 text-xs font-medium">
          <div className="flex justify-between text-[#FAF6F0]/80">
            <span>Item Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="flex justify-between text-[#FAF6F0]/80">
            <span className="flex items-center gap-1">
              <span>Parcel Box</span>
              {nonBeverageCount > 0 && (
                <span className="text-[10px] text-[#FAF6F0]/60">({nonBeverageCount} × ₹5)</span>
              )}
            </span>
            <span>₹{parcelCharge}</span>
          </div>

          {orderType === 'delivery' && (
            <div className="flex justify-between text-[#FAF6F0]/80">
              <span>Delivery Fee {distanceKm !== null ? `(${distanceKm.toFixed(2)} km)` : ''}</span>
              <span>{deliveryFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `₹${deliveryFee}`}</span>
            </div>
          )}

          <div className="pt-2 border-t border-[#3D2218] space-y-1">
            <div className="flex justify-between items-center text-sm font-bold text-[#FAF6F0]">
              <span>Grand Total</span>
              <span className="text-base font-extrabold text-[#FAF6F0]">₹{totalAmount}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-[#E5A93B] pt-1 border-t border-[#3D2218]/80">
              <span className="flex items-center gap-1">
                <span>Pay 50% Advance Now</span>
              </span>
              <span className="text-sm font-extrabold">₹{Math.ceil(totalAmount * 0.5)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#FAF6F0]/60">
              <span>Remaining at {orderType === 'delivery' ? 'Delivery' : 'Pickup'}:</span>
              <span>₹{totalAmount - Math.ceil(totalAmount * 0.5)}</span>
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#2C1810]/80 font-semibold bg-amber-500/10 py-2 rounded-xl border border-amber-500/20">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>50% Advance Payment Required via UPI</span>
        </div>
      </div>

      {/* Proceed Button */}
      <WhatsAppButton 
        onClick={onConfirmOrder} 
        label="Proceed to 50% Advance Payment"
      />
    </div>
  );
};
