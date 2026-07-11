'use client';

import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { waLink } from '@/lib/whatsapp';
import { siteConfig } from '@/config/siteConfig';

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-neutral-300 text-sm outline-none focus:border-accent-500';

// Contact is WhatsApp-first (no backend needed): composes a pre-filled message.
export function ContactForm() {
    const [form, setForm] = useState({ name: '', phone: '', message: '' });
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const submit = (e) => {
        e.preventDefault();
        const lines = [
            `Hello ${siteConfig.brand.name} 👋`,
            form.name ? `Name: ${form.name}` : '',
            form.phone ? `Phone: ${form.phone}` : '',
            '',
            form.message || 'I have a question about spare parts.',
        ].filter(Boolean);
        window.open(waLink(lines.join('\n')), '_blank', 'noopener');
    };

    return (
        <form onSubmit={submit} className="card p-6 space-y-3">
            <h2 className="font-display font-bold text-lg">Send us a message</h2>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your name" className={inputCls} />
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Your phone" className={inputCls} />
            <textarea rows={4} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="How can we help? (part name, part number, or vehicle)" className={inputCls} />
            <button type="submit" className="btn btn-wa w-full py-3"><FaWhatsapp className="w-5 h-5" /> Continue on WhatsApp</button>
            <p className="text-xs text-neutral-500 text-center">We reply fastest on WhatsApp — usually within a few hours.</p>
        </form>
    );
}
