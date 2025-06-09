import type { Metadata } from 'next'
import { ThemeProvider } from "@/components/theme-provider";
import './globals.css'

export const metadata: Metadata = {
  title: 'Addidas Dashboard App',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
