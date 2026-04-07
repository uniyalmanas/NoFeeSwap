import { Providers } from './providers';

export const metadata = {
  title: 'NoFeeSwap dApp',
  description: 'Frontend for NoFeeSwap protocol',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}