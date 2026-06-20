import { ImageResponse } from 'next/og';
import { SKILL_SLUGS, getSkillDoc } from '@/lib/docs';

export const alt = 'A Cairn skill';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return SKILL_SLUGS.map((skill) => ({ skill }));
}

export default function Image({ params }: { params: { skill: string } }) {
  const doc = getSkillDoc(params.skill);
  const title = doc?.title ?? 'Cairn skill';
  const name = doc?.name ?? params.skill;
  const monogram = title.charAt(0).toUpperCase();
  const accent = doc?.accent ?? '#15803d';
  const tagline = doc?.tagline ?? '';

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
        backgroundImage: `radial-gradient(900px 600px at 92% -12%, ${accent}1f, transparent 60%)`,
        fontFamily: 'Georgia, serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #16a34a, #0f766e)',
              color: '#f7faf3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="26" height="22" viewBox="0 0 26 22" aria-hidden="true">
              <polygon points="13,3 24,20 2,20" fill="#f7faf3" />
            </svg>
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, color: '#1c1b17' }}>Cairn</div>
        </div>
        <div
          style={{
            fontSize: 22,
            fontFamily: 'monospace',
            color: '#6b6a5d',
            border: '1px solid rgba(28,27,20,0.18)',
            borderRadius: 999,
            padding: '8px 20px',
          }}
        >
          skill
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 32,
            backgroundColor: `${accent}24`,
            color: accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 76,
            fontWeight: 600,
          }}
        >
          {monogram}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#1c1b17',
              lineHeight: 1.0,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 28, fontFamily: 'monospace', color: accent }}>{name}</div>
        </div>
      </div>

      <div style={{ fontSize: 30, color: '#57534e', maxWidth: 1000, lineHeight: 1.35 }}>
        {tagline}
      </div>
    </div>,
    { ...size },
  );
}
