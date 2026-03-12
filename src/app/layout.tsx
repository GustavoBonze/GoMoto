import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GoMoto — Sistema de Gestão',
  description: 'Sistema de gestão para locadora de motos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
