import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const alt = 'Bravence Consulting';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #0a1f1a, #06100e)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '200px', 
            height: '200px', 
            borderRadius: '40px', 
            background: 'rgba(77, 174, 161, 0.1)', 
            border: '4px solid #4daea1', 
            marginBottom: '40px' 
          }}
        >
          <span 
            style={{ 
              fontSize: '130px', 
              fontWeight: 900, 
              color: '#c6fff7',
              fontFamily: 'system-ui',
            }}
          >
            B
          </span>
        </div>
        <div
          style={{
            fontSize: 72,
            fontStyle: 'normal',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.05em',
            marginTop: 30,
            padding: '0 120px',
            lineHeight: 1.1,
            whiteSpace: 'pre-wrap',
            textAlign: 'center',
            fontFamily: 'system-ui',
          }}
        >
          Bravence Consulting
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 400,
            color: '#4daea1',
            letterSpacing: '-0.02em',
            marginTop: 20,
            fontFamily: 'system-ui',
          }}
        >
          Estrategia Digital y Optimización de Ventas
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
