import {Inter} from 'next/font/google'
import './globals.css'
import {Analytics} from '@vercel/analytics/react';
import StyledComponentsRegistry from "@/lib/AntdRegistry";
import {GA_TRACKING_ID} from "@/lib/ga";
import Script from "next/script";

const inter = Inter({subsets: ['latin']})

export const metadata = {
    title: 'PromptStudio | MidJourney 提示词编辑器 | MidJourney提示词库 | 可视化提示词工作室| prompt-studio.xyz',
    description: 'Your MidJourney Prompt Repo and Generator',
}

export default function RootLayout({children}) {
    return (
        <html lang="en" data-theme={"emerald"}>
        <body className={inter.className}>
        {GA_TRACKING_ID && (
            <>
                <Script
                    strategy="afterInteractive"
                    src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
                />
                <Script
                    strategy="afterInteractive"
                    id="google-analytics-script"
                >
                    {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
            `}
                </Script>
            </>
        )}


        <StyledComponentsRegistry>
            {children}
        </StyledComponentsRegistry>
        <Analytics/>
        </body>
        </html>
    )
}
