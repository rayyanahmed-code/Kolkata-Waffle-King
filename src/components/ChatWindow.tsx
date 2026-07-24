import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Phone, CheckCircle, ArrowRight, ShoppingBag, Sparkles, MapPin, Search } from 'lucide-react';
import { OrderState, StepId, ChatMessage, MenuItem, CustomerLocation } from '../types';
import { restaurantConfig } from '../config/restaurantConfig';
import { MENU_ITEMS, MENU_CATEGORIES } from '../data/menu';
import { generateWhatsAppLink } from '../utils/whatsapp';
import { MessageBubble } from './MessageBubble';
import { OptionButton } from './OptionButton';
import { LocationPicker } from './LocationPicker';
import { CategorySelector } from './CategorySelector';
import { MenuCard } from './MenuCard';
import { OrderSummary } from './OrderSummary';
import { CompletionModal } from './CompletionModal';

interface ChatWindowProps {
  order: OrderState;
  setOrder: React.Dispatch<React.SetStateAction<OrderState>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  totalSteps: number;
  onResetOrder: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  order,
  setOrder,
  currentStep,
  setCurrentStep,
  totalSteps,
  onResetOrder,
}) => {
  const [activeStepId, setActiveStepId] = useState<StepId>('welcome');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Form Inputs State
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [activeMenuCategory, setActiveMenuCategory] = useState<string>('waffles');
  const [searchQuery, setSearchQuery] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Helper to add assistant message with typing delay
  const addAssistantMessage = (text: string, delayMs = 600) => {
    setIsTyping(true);
    scrollToBottom();

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          sender: 'assistant',
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      scrollToBottom();
    }, delayMs);
  };

  // Helper to add user message immediately
  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    scrollToBottom();
  };

  // Initial Welcome Message
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (!hasInitializedRef.current && messages.length === 0) {
      hasInitializedRef.current = true;
      addAssistantMessage(
        `${restaurantConfig.assistant.greetingTitle}\n\n${restaurantConfig.assistant.greetingSubtitle}\n\n${restaurantConfig.assistant.greetingMessage}`,
        300
      );
    }
  }, []);

  // STEP TRANSITION HANDLERS

  // Start Order -> Move to Step 1 (Name)
  const handleStartOrder = () => {
    addUserMessage(restaurantConfig.assistant.startOrderBtnText);
    setActiveStepId('name');
    setCurrentStep(1);
    addAssistantMessage("Awesome! Let's get started. May I have your full name, please?", 500);
  };

  // Name Submission
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed.length < 2) {
      setNameError('Please enter a valid name (at least 2 letters).');
      return;
    }
    setNameError('');
    setOrder((prev) => ({ ...prev, customerName: trimmed }));
    addUserMessage(`My name is ${trimmed}`);

    setActiveStepId('phone');
    setCurrentStep(2);
    addAssistantMessage(
      `Nice to meet you, ${trimmed}! 👋\n\nWhat is your 10-digit WhatsApp phone number so we can confirm your order?`,
      600
    );
  };

  // Phone Submission
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneInput.trim().replace(/\s+/g, '').replace(/-/g, '');
    const indianPhoneRegex = /^(?:\+?91)?[6-9]\d{9}$/;

    if (!indianPhoneRegex.test(cleanPhone)) {
      setPhoneError('Please enter a valid 10-digit Indian phone number (e.g. 7449785471).');
      return;
    }

    setPhoneError('');
    // Format to 10 digits
    const formattedPhone = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;
    setOrder((prev) => ({ ...prev, customerPhone: formattedPhone }));
    addUserMessage(`📱 ${formattedPhone}`);

    setActiveStepId('order_type');
    setCurrentStep(3);
    addAssistantMessage('How would you like to receive your order today?', 500);
  };

  // Order Type Selection (Delivery or Pickup)
  const handleOrderTypeSelect = (type: 'delivery' | 'pickup') => {
    setOrder((prev) => ({ ...prev, orderType: type }));
    const label = type === 'delivery' ? '🚚 Delivery' : '🏃 Pickup';
    addUserMessage(label);

    if (type === 'pickup') {
      // Skip location, jump straight to menu (Step 5)
      setOrder((prev) => ({ ...prev, location: null }));
      setActiveStepId('menu');
      setCurrentStep(4); // Menu is step 4 in pickup flow (4 total steps)
      addAssistantMessage(
        `Great! Pickup order selected.\n\nNow, explore our delicious menu below and select your items 🧇`,
        500
      );
    } else {
      // Continue to location (Step 4 in 5-step delivery flow)
      setActiveStepId('location');
      setCurrentStep(4);
      addAssistantMessage('To deliver your order accurately, please share your delivery location.', 500);
    }
  };

  // Location Selection
  const handleLocationSelected = (location: CustomerLocation) => {
    setOrder((prev) => ({ ...prev, location }));
    const locText = location.type === 'geo' ? '📍 Shared Current Geolocation' : `🏠 ${location.address}`;
    addUserMessage(locText);

    setActiveStepId('menu');
    setCurrentStep(5);
    addAssistantMessage(
      'Location saved! 🎯\n\nNow, browse our freshly baked menu below and choose your favorite waffles, milkshakes & toppings.',
      600
    );
  };

  // Quantity change in Menu
  const handleUpdateQuantity = (item: MenuItem, quantity: number) => {
    setOrder((prev) => {
      const existingIndex = prev.cart.findIndex((c) => c.item.id === item.id);
      let updatedCart = [...prev.cart];

      if (quantity <= 0) {
        if (existingIndex > -1) {
          updatedCart.splice(existingIndex, 1);
        }
      } else {
        if (existingIndex > -1) {
          updatedCart[existingIndex] = { ...updatedCart[existingIndex], quantity };
        } else {
          updatedCart.push({ item, quantity });
        }
      }

      return { ...prev, cart: updatedCart };
    });
  };

  // Proceed from Menu to Summary
  const handleProceedToSummary = () => {
    if (order.cart.length === 0) return;

    const itemCount = order.cart.reduce((a, b) => a + b.quantity, 0);
    const summaryText = `Added ${itemCount} item(s) to order. Proceeding to Summary.`;
    addUserMessage(summaryText);

    setActiveStepId('summary');
    setCurrentStep(order.orderType === 'delivery' ? 6 : 5);
    addAssistantMessage(
      'Here is your order summary receipt. Please verify your details before placing the order via WhatsApp! 👇',
      500
    );
  };

  // Confirm Order & Redirect to WhatsApp
  const handleConfirmAndWhatsApp = () => {
    const waUrl = generateWhatsAppLink(order);
    
    // Open WhatsApp URL in new tab or direct window location
    window.open(waUrl, '_blank');

    setActiveStepId('completed');
  };

  // Calculate Cart Counts by Category
  const categoryCounts = MENU_CATEGORIES.reduce((acc, cat) => {
    const total = order.cart
      .filter((c) => c.item.category === cat.id)
      .reduce((sum, c) => sum + c.quantity, 0);
    acc[cat.id] = total;
    return acc;
  }, {} as Record<string, number>);

  const totalCartCount = order.cart.reduce((a, b) => a + b.quantity, 0);
  const totalCartAmount = order.cart.reduce((a, b) => a + b.item.price * b.quantity, 0);

  // Filter Menu Items
  const filteredMenuItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = item.category === activeMenuCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-md mx-auto min-h-[calc(100vh-120px)] flex flex-col justify-between p-4 pb-24">
      {/* Messages Feed */}
      <div className="flex-1 space-y-3">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            sender={msg.sender}
            text={msg.text}
            timestamp={msg.timestamp}
          />
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <MessageBubble sender="assistant" text="" isTyping={true} />
        )}

        {/* STEP-SPECIFIC ACTION CARDS */}

        {/* STEP 0: Welcome / Start Order */}
        {activeStepId === 'welcome' && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-3xl bg-[#2C1810] border border-[#543123] shadow-2xl text-center space-y-4"
          >
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-[#E5A93B] to-[#C78D24] text-[#2C1810] text-3xl shadow-lg">
              🧇
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-[#FAF6F0]">
                {restaurantConfig.name}
              </h2>
              <p className="text-xs text-[#E5A93B] font-medium mt-1">
                ⚡ Place your order in under 60 seconds
              </p>
            </div>

            <OptionButton
              label={restaurantConfig.assistant.startOrderBtnText}
              subtitle="Quick 5-step smart checkout"
              onClick={handleStartOrder}
              variant="gold"
            />
          </motion.div>
        )}

        {/* STEP 1: Name Input */}
        {activeStepId === 'name' && !isTyping && (
          <motion.form
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleNameSubmit}
            className="mt-3 p-4 rounded-2xl bg-[#FAF6F0] border border-[#E6D7C3] shadow-xl space-y-3 text-[#2C1810]"
          >
            <label className="block text-xs font-bold text-[#2C1810] flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#E5A93B]" />
              <span>Your Name</span>
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                if (nameError) setNameError('');
              }}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E6D7C3] rounded-xl text-[#2C1810] placeholder:text-[#2C1810]/40 focus:outline-none focus:ring-2 focus:ring-[#E5A93B]"
              autoFocus
            />
            {nameError && (
              <p className="text-[11px] text-red-600 font-semibold">{nameError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-[#E5A93B] hover:bg-[#F3BF59] text-[#180E0A] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>
        )}

        {/* STEP 2: Phone Input */}
        {activeStepId === 'phone' && !isTyping && (
          <motion.form
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handlePhoneSubmit}
            className="mt-3 p-4 rounded-2xl bg-[#FAF6F0] border border-[#E6D7C3] shadow-xl space-y-3 text-[#2C1810]"
          >
            <label className="block text-xs font-bold text-[#2C1810] flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-[#E5A93B]" />
              <span>10-Digit Phone Number</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-bold text-[#2C1810]/60">
                +91
              </span>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => {
                  setPhoneInput(e.target.value);
                  if (phoneError) setPhoneError('');
                }}
                placeholder="7449785471"
                maxLength={13}
                className="w-full pl-12 pr-3.5 py-2.5 text-sm bg-white border border-[#E6D7C3] rounded-xl text-[#2C1810] placeholder:text-[#2C1810]/40 focus:outline-none focus:ring-2 focus:ring-[#E5A93B]"
                autoFocus
              />
            </div>
            {phoneError && (
              <p className="text-[11px] text-red-600 font-semibold">{phoneError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-[#E5A93B] hover:bg-[#F3BF59] text-[#180E0A] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>
        )}

        {/* STEP 3: Delivery or Pickup */}
        {activeStepId === 'order_type' && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 space-y-2.5"
          >
            <OptionButton
              label="🚚 Delivery"
              subtitle="Delivered hot & crisp to your doorstep"
              onClick={() => handleOrderTypeSelect('delivery')}
              variant="gold"
            />
            <OptionButton
              label="🏃 Pickup"
              subtitle="Skip location & collect directly from outlet"
              onClick={() => handleOrderTypeSelect('pickup')}
              variant="secondary"
            />
          </motion.div>
        )}

        {/* STEP 4: Location (If Delivery) */}
        {activeStepId === 'location' && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <LocationPicker onLocationSelected={handleLocationSelected} />
          </motion.div>
        )}

        {/* STEP 5: Menu Selection */}
        {activeStepId === 'menu' && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 space-y-3"
          >
            {/* Category Pills & Search */}
            <div className="bg-[#2C1810] p-2.5 rounded-2xl border border-[#543123] shadow-lg space-y-2">
              <CategorySelector
                activeCategory={activeMenuCategory}
                onSelectCategory={setActiveMenuCategory}
                itemCounts={categoryCounts}
              />

              {/* Search Field */}
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-[#E5A93B] absolute left-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search waffles, milkshakes, toppings..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#180E0A] border border-[#3D2218] rounded-xl text-[#FAF6F0] placeholder:text-[#FAF6F0]/40 focus:outline-none focus:ring-1 focus:ring-[#E5A93B]"
                />
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
              {filteredMenuItems.map((item) => {
                const cartEntry = order.cart.find((c) => c.item.id === item.id);
                const qty = cartEntry ? cartEntry.quantity : 0;

                return (
                  <MenuCard
                    key={item.id}
                    item={item}
                    quantity={qty}
                    onUpdateQuantity={(newQty) => handleUpdateQuantity(item, newQty)}
                  />
                );
              })}
            </div>

            {/* Bottom Checkout Action Bar */}
            {totalCartCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="sticky bottom-2 z-30 p-3 rounded-2xl bg-gradient-to-r from-[#2C1810] to-[#3D2218] border border-[#E5A93B]/50 shadow-2xl flex items-center justify-between text-[#FAF6F0]"
              >
                <div>
                  <div className="text-[11px] text-[#E5A93B] font-bold">
                    {totalCartCount} Item{totalCartCount > 1 ? 's' : ''} Selected
                  </div>
                  <div className="text-base font-extrabold text-[#FAF6F0]">
                    ₹{totalCartAmount}
                  </div>
                </div>

                <button
                  onClick={handleProceedToSummary}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5A93B] to-[#F3BF59] text-[#180E0A] font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#E5A93B]/20 transition-all hover:brightness-110 active:scale-95"
                >
                  <span>Review Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* STEP 6: Order Summary */}
        {activeStepId === 'summary' && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <OrderSummary
              order={order}
              onUpdateInstructions={(inst) => setOrder((prev) => ({ ...prev, specialInstructions: inst }))}
              onConfirmOrder={handleConfirmAndWhatsApp}
              onEditItems={() => {
                setActiveStepId('menu');
                setCurrentStep(order.orderType === 'delivery' ? 5 : 4);
              }}
            />
          </motion.div>
        )}

        {/* STEP 7: Completed Screen */}
        {activeStepId === 'completed' && (
          <CompletionModal
            customerName={order.customerName}
            onReopenWhatsApp={() => {
              const waUrl = generateWhatsAppLink(order);
              window.open(waUrl, '_blank');
            }}
            onNewOrder={onResetOrder}
          />
        )}

        <div ref={chatEndRef} />
      </div>
    </div>
  );
};
