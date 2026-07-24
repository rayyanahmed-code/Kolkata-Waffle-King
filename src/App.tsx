import React, { useState } from 'react';
import { OrderState } from './types';
import { restaurantConfig } from './config/restaurantConfig';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { ChatWindow } from './components/ChatWindow';

const INITIAL_ORDER_STATE: OrderState = {
  customerName: '',
  customerPhone: '',
  orderType: null,
  location: null,
  cart: [],
  specialInstructions: '',
};

export default function App() {
  const [order, setOrder] = useState<OrderState>(INITIAL_ORDER_STATE);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const totalSteps = order.orderType === 'pickup' ? 5 : 6;

  const totalCartCount = order.cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalCartAmount = order.cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  const handleResetOrder = () => {
    setOrder(INITIAL_ORDER_STATE);
    setCurrentStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStepName = () => {
    switch (currentStep) {
      case 1:
        return 'Customer Name';
      case 2:
        return 'Phone Verification';
      case 3:
        return 'Delivery or Pickup';
      case 4:
        return order.orderType === 'pickup' ? 'Menu Selection' : 'Delivery Location';
      case 5:
        return order.orderType === 'pickup' ? 'Order Summary' : 'Menu Selection';
      case 6:
        return 'Order Summary';
      default:
        return 'Welcome';
    }
  };

  return (
    <div className="min-h-screen bg-[#180E0A] text-[#FAF6F0] flex flex-col font-sans selection:bg-[#E5A93B] selection:text-[#180E0A]">
      {/* Top Brand Header */}
      <Header
        cartItemCount={totalCartCount}
        totalAmount={totalCartAmount}
        onOpenCart={() => {
          // If items added, user can quickly trigger cart review
        }}
        onResetOrder={handleResetOrder}
      />

      {/* Progress Bar (Visible once order starts) */}
      {currentStep > 0 && (
        <ProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepName={getStepName()}
        />
      )}

      {/* Main Conversational Ordering Interface */}
      <main className="flex-1 w-full bg-gradient-to-b from-[#180E0A] via-[#22130D] to-[#180E0A] flex flex-col justify-between">
        <ChatWindow
          order={order}
          setOrder={setOrder}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          totalSteps={totalSteps}
          onResetOrder={handleResetOrder}
        />
      </main>

      {/* Footer Branding Bar */}
      <footer className="bg-[#120B07] border-t border-[#2C1810] py-3 px-4 text-center text-[11px] text-[#FAF6F0]/50 space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span>🍫 {restaurantConfig.name}</span>
          <span>•</span>
          <span>WhatsApp: +{restaurantConfig.whatsappCountryCode} {restaurantConfig.whatsappNumber}</span>
        </div>
        <div className="text-[10px] text-[#FAF6F0]/30">
          Smart Ordering Assistant
        </div>
      </footer>
    </div>
  );
}
