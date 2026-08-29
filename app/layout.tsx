import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '가장 낮은 별 · 발매 프로젝트',
  description: '2026 싱글 앨범과 뮤직비디오 제작을 위한 예산 및 실행 계획',
  openGraph: {
    title: '가장 낮은 별 · 발매 프로젝트',
    description: '싱글과 뮤직비디오를 11주 안에 완성하기 위한 예산 및 실행 계획',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '가장 낮은 별 · 발매 프로젝트',
    description: '싱글과 뮤직비디오를 11주 안에 완성하기 위한 예산 및 실행 계획',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
