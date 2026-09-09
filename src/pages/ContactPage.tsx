import { useState } from 'react';
import { sendContactMessage } from '../services/contactService';
import { ScrollReveal } from '../components/motion/ScrollReveal';

const CONTACT_INFO = [
  { label: 'Email', value: 'hello@naturemades.com' },
  { label: 'Phone', value: '+1 (555) 123-4567' },
  { label: 'Location', value: 'Portland, Oregon' },
  { label: 'Hours', value: 'Mon–Fri, 9am–6pm PST' },
];

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSending, setIsSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const res = await sendContactMessage(formData);
      setSubmitted(true);
      setFeedbackMsg(res.message || 'Thank you! Your message has been received.');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(120, 104, 72, 0.25)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  };

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-[#486838] uppercase tracking-widest">Contact</span>
            <h1
              className="text-3xl sm:text-4xl font-bold text-[#F8F8E8] mt-3 mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Get in Touch
            </h1>
            <p className="text-[#786848] max-w-md mx-auto">
              Have a question or want to work with us? We'd love to hear from you.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {/* Contact Form */}
          <ScrollReveal className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl p-6 lg:p-8"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(120, 104, 72, 0.2)',
              }}
            >
              {feedbackMsg && submitted && (
                <div className="mb-5 p-3.5 rounded-xl bg-[#486838]/15 border border-[#486838]/30 text-xs text-[#486838] flex items-center gap-2">
                  <span>✓</span>
                  <span>{feedbackMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label htmlFor="name" className="block text-sm text-[#786848] mb-1.5 font-medium">Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[#F8F8E8] placeholder:text-[#786848] outline-none focus:ring-1 focus:ring-[#486838] transition-all"
                    style={inputStyle}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm text-[#786848] mb-1.5 font-medium">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[#F8F8E8] placeholder:text-[#786848] outline-none focus:ring-1 focus:ring-[#486838] transition-all"
                    style={inputStyle}
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label htmlFor="phone" className="block text-sm text-[#786848] mb-1.5 font-medium">Phone (optional)</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-sm text-[#F8F8E8] placeholder:text-[#786848] outline-none focus:ring-1 focus:ring-[#486838] transition-all"
                  style={inputStyle}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-sm text-[#786848] mb-1.5 font-medium">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-sm text-[#F8F8E8] placeholder:text-[#786848] outline-none focus:ring-1 focus:ring-[#486838] transition-all resize-none"
                  style={inputStyle}
                  placeholder="Tell us what's on your mind..."
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#486838]/25"
                style={{ background: '#486838', color: '#F8F8E8' }}
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#F8F8E8] border-t-transparent rounded-full animate-spin" />
                    <span>Sending Message...</span>
                  </>
                ) : submitted ? (
                  '✓ Message Sent!'
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </ScrollReveal>

          {/* Contact Info */}
          <ScrollReveal delay={0.15} className="lg:col-span-2">
            <div
              className="rounded-2xl p-6 lg:p-8 h-fit"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(120, 104, 72, 0.2)',
              }}
            >
              <h2 className="text-lg font-semibold text-[#F8F8E8] mb-6">Contact Information</h2>
              <div className="space-y-5">
                {CONTACT_INFO.map((info) => (
                  <div key={info.label}>
                    <span className="text-xs text-[#786848] uppercase tracking-wider">{info.label}</span>
                    <p className="text-sm text-[#F8F8E8] mt-0.5">{info.value}</p>
                  </div>
                ))}
              </div>

              <div className="h-px bg-[#786848]/20 my-6" />

              <h3 className="text-sm font-medium text-[#786848] mb-3">Follow Us</h3>
              <div className="flex gap-2">
                {['Instagram', 'Twitter', 'Pinterest'].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-xs text-[#786848] hover:text-[#F8F8E8] hover:bg-[#486838]/20 border border-[#786848]/20 transition-colors"
                    aria-label={s}
                  >
                    {s[0]}
                  </a>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
