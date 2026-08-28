export const RetenzyLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 10, paddingLeft: 2 }}>
    <span
      style={{
        width: 30,
        height: 30,
        borderRadius: 9,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg,#2563eb,#f97316)',
        color: '#fff',
        fontWeight: 800,
        fontSize: 15,
      }}
    >
      R
    </span>
    <span
      style={{
        fontSize: 17,
        fontWeight: 800,
        color: '#0f172a',
        letterSpacing: '-0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      Retenzy
    </span>
  </div>
)