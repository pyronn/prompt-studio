// app/lib/ga.js

// 替换 'YOUR_TRACKING_ID' 为你的 Google Analytics 跟踪 ID
export const GA_TRACKING_ID = process.env.GA_TRACK_ID;

export const pageview = (url) => {
    if (!GA_TRACKING_ID) return;
    window.gtag('config', GA_TRACKING_ID, {
        page_path: url,
    });
};

export const event = ({ action, category, label, value }) => {
    if (!GA_TRACKING_ID) return;
    window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
    });
};