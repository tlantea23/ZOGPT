import './globals.css'

export const metadata = {
  title: 'ZOGPT',
  description: 'Gemini powered chatbot',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
