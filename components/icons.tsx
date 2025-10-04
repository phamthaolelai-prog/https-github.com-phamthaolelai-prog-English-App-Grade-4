
import React from 'react';

export const VolumeIcon: React.FC = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 9v6h4l5 4V5L9 9H5z" stroke="currentColor" strokeWidth="1.8" fill="none"/>
        <path d="M16.5 8.5a4 4 0 010 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
);

export const MicIcon: React.FC = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="9" y="3" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
);

export const PrevIcon: React.FC = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
);

export const NextIcon: React.FC = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
);
