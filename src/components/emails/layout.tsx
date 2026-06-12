import { Body, Container, Head, Html, Preview, Section, Text, Heading, Hr, Link } from '@react-email/components';

const BRAND = '#1A6B3C';
const ROSE = '#e11d48';

const TONE_COLORS: Record<string, { bg: string; text: string }> = {
  green: { bg: '#d1fae5', text: '#047857' },
  amber: { bg: '#fef3c7', text: '#b45309' },
  red: { bg: '#ffe4e6', text: '#be123c' },
};

export interface EmailRow {
  label: string;
  value: string;
}

interface EmailLayoutProps {
  previewText: string;
  accent?: 'brand' | 'rose';
  badge?: string;
  badgeTone?: 'green' | 'amber' | 'red';
  heading: string;
  lead: string;
  rows?: EmailRow[];
  list?: string[];
  listTitle?: string;
  cta?: { label: string; url: string };
  footnote?: string;
}

export function EmailLayout({ previewText, accent = 'brand', badge, badgeTone = 'green', heading, lead, rows, list, listTitle, cta, footnote }: EmailLayoutProps) {
  const accentColor = accent === 'rose' ? ROSE : BRAND;
  const tone = TONE_COLORS[badgeTone] || TONE_COLORS.green;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: '#F6F8F7', fontFamily: 'Inter, Helvetica, Arial, sans-serif', margin: 0, padding: '24px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', maxWidth: 480, margin: '0 auto', border: '1px solid #e2e8f0' }}>
          <Section style={{ backgroundColor: accentColor, padding: '20px 24px' }}>
            <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', margin: 0 }}>VitalWatch</Text>
          </Section>
          <Section style={{ padding: '24px' }}>
            {badge && (
              <Text style={{ display: 'inline-block', backgroundColor: tone.bg, color: tone.text, fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '4px 12px', margin: '0 0 12px' }}>
                {badge}
              </Text>
            )}
            <Heading style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.01em' }}>{heading}</Heading>
            <Text style={{ fontSize: 15, lineHeight: '24px', color: '#475569', margin: '0 0 16px' }}>{lead}</Text>

            {rows && rows.length > 0 && (
              <Section style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', margin: '0 0 16px' }}>
                {rows.map((row, i) => (
                  <Section key={i} style={{ padding: '10px 16px', borderTop: i > 0 ? '1px solid #f1f5f9' : undefined }}>
                    <table width="100%" cellPadding={0} cellSpacing={0}>
                      <tbody>
                        <tr>
                          <td style={{ fontSize: 14, color: '#64748b' }}>{row.label}</td>
                          <td style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', textAlign: 'right' }}>{row.value}</td>
                        </tr>
                      </tbody>
                    </table>
                  </Section>
                ))}
              </Section>
            )}

            {list && list.length > 0 && (
              <Section style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', margin: '0 0 16px' }}>
                {listTitle && (
                  <Text style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 6px' }}>{listTitle}</Text>
                )}
                {list.map((item, i) => (
                  <Text key={i} style={{ fontSize: 14, lineHeight: '22px', color: '#475569', margin: '4px 0' }}>• {item}</Text>
                ))}
              </Section>
            )}

            {cta && (
              <Link
                href={cta.url}
                style={{
                  display: 'inline-block',
                  backgroundColor: accentColor,
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 600,
                  borderRadius: 12,
                  padding: '12px 24px',
                  textDecoration: 'none',
                  margin: '8px 0 0',
                }}
              >
                {cta.label}
              </Link>
            )}

            {footnote && (
              <>
                <Hr style={{ borderColor: '#f1f5f9', margin: '20px 0 16px' }} />
                <Text style={{ fontSize: 13, lineHeight: '20px', color: '#94a3b8', margin: 0 }}>{footnote}</Text>
              </>
            )}
          </Section>
          <Section style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', padding: '14px 24px' }}>
            <Text style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>VitalWatch · Remote patient monitoring · This is an automated message.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
