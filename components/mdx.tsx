import Link from 'next/link';
import { ReactNode } from 'react';

export function Card({ title, href, children }: { title: string, href: string, children: ReactNode }) {
  return (
    <article className="category-card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
      <Link href={href} style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--ink)' }}>
        {title}
      </Link>
      <p style={{ marginTop: '8px' }}>{children}</p>
    </article>
  );
}

export function Cards({ children }: { children: ReactNode }) {
  return (
    <div className="category-grid" style={{ marginTop: '24px', marginBottom: '24px' }}>
      {children}
    </div>
  );
}

export function Callout({ type, children }: { type?: string, children: ReactNode }) {
  return (
    <div style={{
      padding: '16px',
      backgroundColor: type === 'info' ? 'var(--sky)' : 'var(--soft)',
      borderLeft: '4px solid var(--ink)',
      borderRadius: 'var(--radius)',
      margin: '24px 0'
    }}>
      {children}
    </div>
  );
}

export const mdxComponents = {
  Card,
  Cards,
  Callout,
  a: ({ href, children, ...props }: any) => {
    if (href?.startsWith('/')) {
      return <Link href={href} {...props} style={{ color: 'var(--rose-dark)', textDecoration: 'underline' }}>{children}</Link>;
    }
    return <a href={href} {...props} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--rose-dark)', textDecoration: 'underline' }}>{children}</a>;
  },
  h1: (props: any) => <h1 style={{ marginTop: '32px', marginBottom: '16px', fontSize: '32px' }} {...props} />,
  h2: (props: any) => <h2 style={{ marginTop: '32px', marginBottom: '16px', fontSize: '24px' }} {...props} />,
  h3: (props: any) => <h3 style={{ marginTop: '24px', marginBottom: '16px', fontSize: '20px' }} {...props} />,
  p: (props: any) => <p style={{ marginBottom: '16px', lineHeight: 1.6 }} {...props} />,
  ul: (props: any) => <ul style={{ marginBottom: '16px', paddingLeft: '24px', lineHeight: 1.6 }} {...props} />,
  ol: (props: any) => <ol style={{ marginBottom: '16px', paddingLeft: '24px', lineHeight: 1.6 }} {...props} />,
  li: (props: any) => <li style={{ marginBottom: '8px' }} {...props} />,
  table: (props: any) => (
    <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }} {...props} />
    </div>
  ),
  th: (props: any) => <th style={{ borderBottom: '2px solid var(--line)', padding: '12px 8px' }} {...props} />,
  td: (props: any) => <td style={{ borderBottom: '1px solid var(--line)', padding: '12px 8px' }} {...props} />,
};
