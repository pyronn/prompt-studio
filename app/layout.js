import {Inter} from 'next/font/google'
import './globals.css'
import {Theme} from "@radix-ui/themes";
import {Analytics} from '@vercel/analytics/react';

const inter = Inter({subsets: ['latin']})

export const metadata = {
    title: 'PromptStudio',
    description: 'Your MidJourney Prompt Repo and Generator',
}

export default function RootLayout({children}) {
    return (
        <html lang="en" data-theme={"emerald"}>
        <body className={inter.className}>
        <Theme>
            {children}
        </Theme>
        <Analytics/>
        </body>
        </html>
    )
}
