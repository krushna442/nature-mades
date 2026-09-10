const ORDER_STEPS = [
  { key: 'confirmed', label: 'Confirmed', icon: '✓' },
  { key: 'processing', label: 'Processing', icon: '⚙' },
  { key: 'shipped', label: 'Shipped', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '📦' },
];

function getStepIndex(status: string): number {
  switch (status) {
    case 'processing': return 1;
    case 'shipped': return 2;
    case 'delivered': return 3;
    default: return 0;
  }
}

export function OrderStatusTracker({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
        <span className="text-red-400 text-sm">✕</span>
        <span className="text-xs text-red-400 font-medium">Order Cancelled</span>
      </div>
    );
  }

  const currentStep = getStepIndex(status);

  return (
    <div className="w-full py-3">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-white/[0.06]" />
        {/* Active line */}
        <div
          className="absolute top-4 left-6 h-0.5 bg-[#486838] transition-all duration-500"
          style={{ width: `calc(${(currentStep / (ORDER_STEPS.length - 1)) * 100}% - 48px)` }}
        />

        {ORDER_STEPS.map((step, i) => {
          const isCompleted = i <= currentStep;
          const isCurrent = i === currentStep;

          return (
            <div key={step.key} className="flex flex-col items-center z-10 relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#486838] text-[#F8F8E8] border-2 border-[#486838]'
                    : 'bg-[#0A0A0A] text-[#786848] border-2 border-white/[0.1]'
                } ${isCurrent ? 'shadow-[0_0_12px_rgba(72,104,56,0.5)]' : ''}`}
              >
                {step.icon}
              </div>
              <span
                className={`text-[10px] mt-1.5 font-medium ${
                  isCompleted ? 'text-[#F8F8E8]' : 'text-[#786848]/60'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
