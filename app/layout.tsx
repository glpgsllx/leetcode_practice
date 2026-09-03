import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '刷题轨迹 · LeetCode Hot 100',
  description: '随机抽题、专注计时，记录每一次 LeetCode Hot 100 练习。',
  openGraph: {
    title: '刷题轨迹 · LeetCode Hot 100',
    description: '随机抽题、专注计时，记录每一次练习与成长。',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: '刷题轨迹' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '刷题轨迹 · LeetCode Hot 100',
    description: '随机抽题、专注计时，记录每一次练习与成长。',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
