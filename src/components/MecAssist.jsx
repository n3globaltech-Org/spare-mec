'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiExternalLink, FiPackage, FiSearch, FiSend, FiTool, FiX } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { waLink } from '@/lib/whatsapp';
import { trackOrder } from '@/lib/orders';
import { statusLabel } from '@/lib/orderStatus';

const customerServiceIcon = '/assets/customer-service.png';
const QUICK_BRANDS = ['BMW', 'Mercedes', 'Porsche', 'Audi', 'Land Rover', 'Toyota', 'Nissan'];

const HELLO = [
    { id: 1, sender: 'ai', text: 'Hello! Welcome to Spare Mec 👋. I am your personal parts assistant.' },
    { id: 2, sender: 'ai', text: 'I can help you find a spare part or check the live status of an existing order. What would you like to do?' },
];

// MecAssist provides two focused flows: a scripted parts enquiry that hands off to WhatsApp, and
// a live Order ID lookup through the same PII-safe public endpoint used by the tracking page.
export function MecAssist() {
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [mode, setMode] = useState('menu'); // menu | parts | tracking
    const [currentStep, setCurrentStep] = useState(0); // 0 Brand → 5 Notes → 6 Summary
    const [data, setData] = useState({ brand: '', model: '', year: '', part: '', phone: '', notes: '' });
    const [trackedOrder, setTrackedOrder] = useState(null);
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [messages, setMessages] = useState(HELLO);
    const messagesEndRef = useRef(null);

    // Auto-open once per session after a short delay.
    useEffect(() => {
        try {
            if (!sessionStorage.getItem('hasOpenedChatbot')) {
                const t = setTimeout(() => { setIsOpen(true); sessionStorage.setItem('hasOpenedChatbot', 'true'); }, 6500);
                return () => clearTimeout(t);
            }
        } catch { /* ignore */ }
    }, []);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

    const addMessage = (sender, text) => setMessages((prev) => [...prev, { id: Date.now() + Math.floor(performance.now()), sender, text }]);

    const chooseParts = () => {
        addMessage('user', 'Find a spare part');
        addMessage('ai', "Let's find the right part. What is your car's brand?");
        setMode('parts');
        setCurrentStep(0);
        setInputValue('');
    };

    const chooseTracking = () => {
        addMessage('user', 'Track my order');
        addMessage('ai', 'Please enter your Order ID. It looks like ORD-000001-AB12CD34 and is shown on your confirmation screen or WhatsApp message.');
        setMode('tracking');
        setTrackedOrder(null);
        setInputValue('');
    };

    const handleTrackOrder = async (value) => {
        const orderNumber = value.trim().toUpperCase();
        if (!orderNumber) return;
        addMessage('user', orderNumber);
        setInputValue('');
        setTrackedOrder(null);
        setIsLookingUp(true);
        setIsTyping(true);
        try {
            const order = await trackOrder(orderNumber);
            setTrackedOrder(order);
            addMessage('ai', `I found your order. Its current status is “${statusLabel(order.status)}”.`);
        } catch (requestError) {
            const status = requestError?.response?.status;
            addMessage(
                'ai',
                status === 404
                    ? 'I could not find an order with that ID. Please check every letter and number, then try again.'
                    : 'I could not reach order tracking right now. Please try again in a moment or contact us on WhatsApp.'
            );
        } finally {
            setIsLookingUp(false);
            setIsTyping(false);
        }
    };

    const handleNextStep = (userInput) => {
        if (!userInput.trim()) return;
        addMessage('user', userInput);
        const nextStep = currentStep + 1;
        const updated = { ...data };
        if (currentStep === 0) updated.brand = userInput;
        else if (currentStep === 1) updated.model = userInput;
        else if (currentStep === 2) updated.year = userInput;
        else if (currentStep === 3) updated.part = userInput;
        else if (currentStep === 4) updated.phone = userInput;
        else if (currentStep === 5) updated.notes = userInput;
        setData(updated);
        setInputValue('');
        setCurrentStep(nextStep);
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            if (nextStep === 1) addMessage('ai', `Got it, ${updated.brand}! What is the car model? (e.g. X5, C-Class, Cayenne...)`);
            else if (nextStep === 2) addMessage('ai', `Perfect. What is the manufacturing year of your ${updated.brand} ${updated.model}?`);
            else if (nextStep === 3) addMessage('ai', 'Excellent. Now, what spare part do you need? (e.g. Front Brake Pads, Radiator, Alternator...)');
            else if (nextStep === 4) addMessage('ai', 'Almost there! Please enter your WhatsApp number (with country code) so our team can send you the price and availability quote instantly.');
            else if (nextStep === 5) addMessage('ai', "Do you have any additional details or specific requirements (e.g. VIN number, OEM vs Aftermarket preferences, Chassis No)? Type them below, or type 'No' to skip.");
            else if (nextStep === 6) {
                addMessage('ai', "Outstanding! I've summarized your inquiry below.");
                addMessage('ai', 'Click the button below to send this request to our team via WhatsApp and get your instant quote!');
            }
        }, 1200);
    };

    const handleSkipNotes = () => {
        if (currentStep !== 5) return;
        addMessage('user', 'No specific details');
        setData((d) => ({ ...d, notes: 'None' }));
        setCurrentStep(6);
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            addMessage('ai', "Outstanding! I've summarized your inquiry below.");
            addMessage('ai', 'Click the button below to send this request to our team via WhatsApp and get your instant quote!');
        }, 1000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLookingUp) return;
        if (mode === 'tracking') handleTrackOrder(inputValue);
        else if (mode === 'parts') handleNextStep(inputValue);
    };
    const handleQuickSelect = (brand) => { if (currentStep === 0) handleNextStep(brand); };

    const handleResetChat = () => {
        setMessages(HELLO);
        setData({ brand: '', model: '', year: '', part: '', phone: '', notes: '' });
        setMode('menu'); setTrackedOrder(null); setIsLookingUp(false);
        setCurrentStep(0); setInputValue(''); setIsTyping(false);
    };

    const handleOpenWhatsApp = () => {
        const lines = [
            "Hello Spare Mec 👋, I'd like to get a quote for a spare part:", '',
            `• *Vehicle Brand:* ${data.brand}`,
            `• *Model:* ${data.model}`,
            `• *Year:* ${data.year}`,
            `• *Part Required:* ${data.part}`,
            `• *WhatsApp Number:* ${data.phone}`,
            data.notes && data.notes !== 'None' ? `• *Additional Details:* ${data.notes}` : '', '',
            'Could you please confirm availability and pricing? Thank you!',
        ].filter(Boolean);
        window.open(waLink(lines.join('\n')), '_blank', 'noopener,noreferrer');
    };

    const placeholder = mode === 'tracking'
        ? 'Enter your Order ID...'
        : (['Enter vehicle brand...', 'Enter model...', 'Enter manufacturing year...', 'Enter required part name...', 'Enter WhatsApp number...', 'Enter details (VIN, OEM...)'][currentStep] || '');

    return (
        <>
            {/* Trigger — sits just above the WhatsApp float */}
            <div className="fixed bottom-20 right-4 z-[105] group flex items-center justify-end">
                <span className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 hidden md:inline-flex items-center gap-1.5 bg-white border border-neutral-200 text-neutral-700 text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    MecAssist • Parts & order tracking
                </span>
                <button onClick={() => setIsOpen((v) => !v)} aria-label="Open chat assistant" className="flex h-14 w-14 items-center justify-center rounded-full bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 shrink-0">
                    <span className="relative flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={customerServiceIcon} alt="" className="w-7 h-7 object-contain" />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white" />
                    </span>
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed top-[72px] bottom-24 right-4 z-[105] w-[360px] sm:w-[400px] max-w-[90vw] flex flex-col justify-end pointer-events-none"
                    >
                        <div className="pointer-events-auto w-full max-h-full bg-white border border-neutral-200 rounded-[20px] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden text-neutral-900">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={customerServiceIcon} alt="" className="w-5 h-5 object-contain" />
                                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-neutral-50" />
                                    </div>
                                    <div className="flex flex-col text-left gap-0.5">
                                        <span className="font-display text-[13.5px] font-semibold text-neutral-900 tracking-tight flex items-center gap-1.5">
                                            MecAssist
                                            <span className="text-[10px] font-medium text-neutral-500 bg-neutral-200/70 px-1.5 py-[1px] rounded-md">Parts & orders</span>
                                        </span>
                                        <span className="text-[11px] text-neutral-500">Usually replies instantly</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {mode === 'tracking' && (
                                        <button onClick={handleResetChat} className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 px-2.5 py-1.5 rounded-lg hover:bg-neutral-200/60 transition-colors font-medium">
                                            <FiArrowLeft size={12} /> Back
                                        </button>
                                    )}
                                    {mode === 'parts' && (
                                        <button onClick={handleResetChat} className="text-[11px] text-neutral-500 hover:text-neutral-900 px-2.5 py-1.5 rounded-lg hover:bg-neutral-200/60 transition-colors font-medium">Start over</button>
                                    )}
                                    <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-200/60 text-neutral-500 hover:text-neutral-900 transition-colors"><FiX size={17} /></button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3.5">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] px-4 py-3 text-[13px] leading-relaxed ${msg.sender === 'user' ? 'bg-neutral-900 text-white font-medium rounded-2xl rounded-br-md' : 'bg-neutral-100 text-neutral-700 rounded-2xl rounded-bl-md text-left'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}

                                {mode === 'menu' && !isTyping && (
                                    <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                                        <button onClick={chooseParts} className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white p-3 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50">
                                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-neutral-950 text-white"><FiTool size={15} /></span>
                                            <span><span className="block text-[12px] font-semibold text-neutral-900">Find a part</span><span className="block text-[10px] text-neutral-500">Get a quick quote</span></span>
                                        </button>
                                        <button onClick={chooseTracking} className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white p-3 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50">
                                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-500 text-neutral-950"><FiPackage size={15} /></span>
                                            <span><span className="block text-[12px] font-semibold text-neutral-900">Track order</span><span className="block text-[10px] text-neutral-500">Check live status</span></span>
                                        </button>
                                    </div>
                                )}

                                {mode === 'parts' && currentStep === 0 && !isTyping && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {QUICK_BRANDS.map((brand) => (
                                            <button key={brand} onClick={() => handleQuickSelect(brand)} className="text-[12px] font-medium bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300 px-3 py-1.5 rounded-lg transition-colors duration-150">{brand}</button>
                                        ))}
                                    </div>
                                )}

                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-neutral-100 rounded-2xl rounded-bl-md px-4 py-3.5 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}

                                {mode === 'parts' && currentStep === 6 && !isTyping && (
                                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-3.5 text-left">
                                        <div className="border-b border-neutral-200 pb-2.5 flex items-center justify-between">
                                            <span className="text-[12px] font-semibold text-neutral-800">Your request</span>
                                            <span className="text-[10px] font-medium text-neutral-500 bg-neutral-200/70 px-1.5 py-[1px] rounded-md">Ready</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                                            {[['Brand', data.brand], ['Model', data.model], ['Year', data.year], ['Part needed', data.part]].map(([label, value]) => (
                                                <div key={label} className="bg-white border border-neutral-200 p-2.5 rounded-lg">
                                                    <span className="text-[10px] text-neutral-500 block font-medium mb-0.5">{label}</span>
                                                    <span className="font-semibold text-neutral-900 text-[13px]">{value}</span>
                                                </div>
                                            ))}
                                            <div className="col-span-2 bg-white border border-neutral-200 p-2.5 rounded-lg">
                                                <span className="text-[10px] text-neutral-500 block font-medium mb-0.5">WhatsApp contact</span>
                                                <span className="font-semibold text-neutral-900 text-[13px]">{data.phone}</span>
                                            </div>
                                            {data.notes && data.notes !== 'None' && (
                                                <div className="col-span-2 bg-white border border-neutral-200 p-2.5 rounded-lg">
                                                    <span className="text-[10px] text-neutral-500 block font-medium mb-0.5">Additional details</span>
                                                    <span className="font-medium text-neutral-600 text-[12px] leading-relaxed">{data.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={handleOpenWhatsApp} className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5c] text-white font-semibold py-3 px-4 rounded-xl text-[13px] transition-colors duration-150 mt-1">
                                            <FaWhatsapp size={15} /> Send quote request
                                        </button>
                                    </motion.div>
                                )}

                                {mode === 'tracking' && trackedOrder && !isTyping && (
                                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left">
                                        <div className="flex items-start justify-between gap-3 border-b border-neutral-200 pb-3">
                                            <div className="min-w-0">
                                                <span className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Order ID</span>
                                                <span className="mt-0.5 block truncate font-mono text-[13px] font-bold text-neutral-950">{trackedOrder.orderNumber}</span>
                                            </div>
                                            <span className="shrink-0 rounded-full bg-accent-500/15 px-2.5 py-1 text-[10px] font-bold text-accent-600">{statusLabel(trackedOrder.status)}</span>
                                        </div>
                                        <div className="mt-3 space-y-2">
                                            {(trackedOrder.items || []).slice(0, 3).map((item, index) => (
                                                <div key={`${item.partNumber || item.name}-${index}`} className="flex items-start justify-between gap-2 text-[11px]">
                                                    <span className="min-w-0 text-neutral-700"><span className="line-clamp-1 font-medium">{item.name}</span>{item.partNumber && <span className="text-[9px] text-neutral-400">Part No: {item.partNumber}</span>}</span>
                                                    <span className="shrink-0 font-semibold text-neutral-500">×{item.quantity}</span>
                                                </div>
                                            ))}
                                            {(trackedOrder.items || []).length > 3 && <p className="text-[10px] text-neutral-400">+{trackedOrder.items.length - 3} more item(s)</p>}
                                        </div>
                                        <Link href={`/track?order=${encodeURIComponent(trackedOrder.orderNumber)}`} onClick={() => setIsOpen(false)} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-neutral-950 px-3 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-neutral-800">
                                            View full tracking <FiExternalLink size={13} />
                                        </Link>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            {((mode === 'parts' && currentStep < 6) || mode === 'tracking') && (
                                <div className="p-4 bg-neutral-50 border-t border-neutral-200">
                                    <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                                        {mode === 'tracking' && <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />}
                                        <input type={mode === 'parts' && currentStep === 4 ? 'tel' : 'text'} value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={placeholder} disabled={isLookingUp} autoCapitalize={mode === 'tracking' ? 'characters' : undefined} className={`w-full rounded-xl bg-white border border-neutral-200 pr-11 text-base sm:text-[13px] text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors h-[42px] disabled:bg-neutral-100 ${mode === 'tracking' ? 'pl-9' : 'px-4'}`} />
                                        {mode === 'parts' && currentStep === 5 && (
                                            <button type="button" onClick={handleSkipNotes} className="absolute right-11 top-1/2 -translate-y-1/2 text-[11px] text-neutral-500 hover:text-neutral-900 bg-transparent hover:bg-neutral-200/60 px-2.5 py-1.5 rounded-lg transition-colors font-medium">Skip</button>
                                        )}
                                        <button type="submit" disabled={!inputValue.trim() || isLookingUp} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-[30px] h-[30px] inline-flex items-center justify-center rounded-lg bg-neutral-900 disabled:bg-neutral-200 text-white disabled:text-neutral-400 transition-colors duration-150 active:scale-95" aria-label={mode === 'tracking' ? 'Track order' : 'Send message'}><FiSend size={13} /></button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
