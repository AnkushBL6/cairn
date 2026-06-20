import { ImageResponse } from 'next/og';

export const alt = 'Cairn — your AI never starts from zero';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Warm editorial brand card, matching the site's paper/ink/acid palette.
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        backgroundColor: '#f4f1e9',
        backgroundImage:
          'radial-gradient(900px 600px at 90% -10%, rgba(21,128,61,0.10), transparent 60%), radial-gradient(700px 500px at 0% 100%, rgba(180,83,10,0.07), transparent 60%)',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #16a34a, #0f766e)',
            color: '#f7faf3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="30" height="26" viewBox="0 0 30 26" aria-hidden="true">
            <polygon points="15,3 28,24 2,24" fill="#f7faf3" />
          </svg>
        </div>
        <div style={{ fontSize: 34, fontWeight: 600, color: '#1c1b17' }}>Cairn</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            fontSize: 84,
            fontWeight: 600,
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            color: '#1c1b17',
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          Your AI never starts from&nbsp;<span style={{ color: '#15803d' }}>zero.</span>
        </div>
        <div style={{ fontSize: 30, color: '#57534e', maxWidth: 880, lineHeight: 1.35 }}>
          The skillpack that gives your agent continuity — a brainstorm becomes a knowledge graph
          your project carries forever.
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontSize: 26,
          fontFamily: 'monospace',
          color: '#1c1b17',
        }}
      >
        <span style={{ color: '#16a34a' }}>$</span>
        npx skills add AnkushBL6/cairn
      </div>
    </div>,
    { ...size },
  );
}
