function StatsCards({ stats }) {
  const cards = [
    {
      title: 'Total Applications',
      value: stats.total,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      iconBg: 'rgba(255,255,255,0.07)',
      iconColor: 'rgba(255,255,255,0.7)',
    },
    {
      title: '10th Standard',
      value: stats['10th'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      iconBg: 'rgba(96,165,250,0.12)',
      iconColor: 'rgba(147,197,253,0.8)',
    },
    {
      title: '11th Standard',
      value: stats['11th'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      iconBg: 'rgba(52,211,153,0.12)',
      iconColor: 'rgba(110,231,183,0.8)',
    },
    {
      title: '12th Standard',
      value: stats['12th'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
      iconBg: 'rgba(251,146,60,0.12)',
      iconColor: 'rgba(253,186,116,0.8)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="animate-fade-in-up rounded-xl p-5 cursor-default"
          style={{
            animationDelay: `${index * 70}ms`,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1), border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Icon */}
          <div
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg mb-4"
            style={{
              background: card.iconBg,
              color: card.iconColor,
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {card.icon}
          </div>

          {/* Label */}
          <p className="text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
            {card.title}
          </p>

          {/* Value */}
          <p className="text-3xl font-semibold text-white tracking-tight">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;
