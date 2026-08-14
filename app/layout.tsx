import type { Metadata } from 'next';
import { Inter, Bricolage_Grotesque } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import PlayerBar from '@/components/PlayerBar';
import TopBar from '@/components/TopBar';
import { PlayerProvider } from '@/lib/player-context';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'groove.',
  description: 'Tu música, tus playlists.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${bricolage.variable} font-[family-name:var(--font-body)] bg-[#0B0B0D] text-[#F5F3EE] antialiased`}
      >
        <PlayerProvider>
          <div className="h-screen flex flex-col">
            <div className="flex flex-1 min-h-0">
              <Sidebar />
              <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
                <TopBar />
                <div className="flex-1 min-h-0 flex flex-col">{children}</div>
              </main>
            </div>
            <PlayerBar />
          </div>
        </PlayerProvider>
      </body>
    </html>
  );
}