import {Inter} from 'next/font/google'
import './globals.css'
import {Theme} from "@radix-ui/themes";

const inter = Inter({subsets: ['latin']})

export const metadata = {
    title: 'PromptRepo',
    description: 'Your MidJourney Prompt Repo and Generator',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <Theme>
          {children}
      </Theme>

      </body>
    </html>
  )
}
