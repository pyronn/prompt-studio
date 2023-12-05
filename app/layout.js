import {Inter} from 'next/font/google'
import './globals.css'
import {Analytics} from '@vercel/analytics/react';
import StyledComponentsRegistry from "@/lib/AntdRegistry";

const inter = Inter({subsets: ['latin']})

export const metadata = {
    title: 'PromptStudio',
    description: 'Your MidJourney Prompt Repo and Generator',
}

export default function RootLayout({children}) {
    return (
        <html lang="en" data-theme={"emerald"}>
        <body className={inter.className}>
        <StyledComponentsRegistry>
            {children}
        </StyledComponentsRegistry>
        <Analytics/>
        </body>
        </html>
    )
}
