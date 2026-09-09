import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '../components/motion/ScrollReveal';

const TABS = ['Profile', 'Orders', 'Saved', 'Addresses'] as const;
type Tab = typeof TABS[number];

export function AccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Profile');

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h1
            className="text-3xl font-bold text-[#F5F0EB] mb-8"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            My Account
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Tabs */}
            <div className="flex border-b border-white/[0.06] overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'text-[#F5F0EB] border-b-2 border-[#4A7C59]'
                      : 'text-[#78716C] hover:text-[#A8A29E]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 lg:p-8">
              {activeTab === 'Profile' && (
                <div className="space-y-5">
                  <div>
                    <span className="text-xs text-[#78716C] uppercase tracking-wider">Name</span>
                    <p className="text-sm text-[#F5F0EB] mt-0.5">Guest User</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#78716C] uppercase tracking-wider">Email</span>
                    <p className="text-sm text-[#F5F0EB] mt-0.5">guest@naturemades.com</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#78716C] uppercase tracking-wider">Member since</span>
                    <p className="text-sm text-[#F5F0EB] mt-0.5">September 2026</p>
                  </div>
                </div>
              )}

              {activeTab === 'Orders' && (
                <EmptyState icon="📦" message="No orders yet" action="Start shopping" link="/shop" />
              )}

              {activeTab === 'Saved' && (
                <EmptyState icon="♡" message="No saved products" action="Browse products" link="/shop" />
              )}

              {activeTab === 'Addresses' && (
                <EmptyState icon="📍" message="No addresses saved" action="Add an address" />
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Logout */}
        <ScrollReveal delay={0.15}>
          <div className="mt-6 text-center">
            <button className="text-sm text-[#78716C] hover:text-red-400 transition-colors">
              Log Out
            </button>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

function EmptyState({ icon, message, action, link }: { icon: string; message: string; action: string; link?: string }) {
  return (
    <div className="text-center py-12">
      <span className="text-3xl mb-3 block opacity-40">{icon}</span>
      <p className="text-sm text-[#A8A29E] mb-4">{message}</p>
      {link ? (
        <Link
          to={link}
          className="inline-flex px-5 py-2 rounded-xl text-sm font-medium text-[#F5F0EB] border border-white/[0.1] hover:bg-white/[0.04] transition-colors"
        >
          {action}
        </Link>
      ) : (
        <button className="px-5 py-2 rounded-xl text-sm font-medium text-[#F5F0EB] border border-white/[0.1] hover:bg-white/[0.04] transition-colors">
          {action}
        </button>
      )}
    </div>
  );
}
