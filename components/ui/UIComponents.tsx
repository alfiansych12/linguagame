'use client';

import React from 'react';
import Link from 'next/link';

interface IconProps {
    name: string;
    className?: string;
    filled?: boolean;
    size?: number | string;
    mdSize?: number | string;
}

/**
 * Material Symbols Icon Component
 * Uses Google Material Symbols with weight and fill variations
 */
export const Icon: React.FC<IconProps> = ({
    name,
    className = '',
    filled = false,
    size,
    mdSize
}) => {
    const getSize = () => {
        if (!size && !mdSize) return {};
        const s = size ? (typeof size === 'number' ? `${size}px` : size) : undefined;
        const ms = mdSize ? (typeof mdSize === 'number' ? `${mdSize}px` : mdSize) : undefined;

        return {
            '--icon-size': s,
            '--icon-md-size': ms || s
        } as React.CSSProperties;
    };

    return (
        <span
            className={`notranslate material-symbols-outlined select-none inline-block align-middle transition-all ${filled ? 'fill-1' : ''} ${className}`}
            translate="no"
            style={{
                ...getSize(),
                fontSize: 'var(--icon-size)',
                fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
                display: 'inline-block',
                verticalAlign: 'middle'
            }}
        >
            {/* We'll use a CSS class to handle the responsive fontSize since style prop can't do Media Queries */}
            <style jsx>{`
                span {
                    font-size: var(--icon-size);
                }
                @media (min-width: 768px) {
                    span {
                        font-size: var(--icon-md-size);
                    }
                }
            `}</style>
            {name}
        </span>
    );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'error' | 'white';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    loading?: boolean;
    href?: string;
}

/**
 * Reusable Button Component with premium interactions
 */
export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'right',
    fullWidth = false,
    loading = false,
    className = '',
    disabled,
    href,
    ...props
}) => {
    const baseStyles = 'font-black rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:grayscale disabled:opacity-50';

    const variantStyles = {
        primary: 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20 hover:shadow-primary/40',
        secondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200',
        white: 'bg-white hover:bg-slate-50 text-slate-900 shadow-xl',
        ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400',
        success: 'bg-success hover:bg-success-dark text-white shadow-lg shadow-success/20',
        error: 'bg-error hover:bg-error-dark text-white shadow-lg shadow-error/20'
    };

    const sizeStyles = {
        sm: 'h-10 px-4 text-xs uppercase tracking-wider',
        md: 'h-12 px-8 text-sm uppercase tracking-wider',
        lg: 'h-14 px-10 text-base uppercase tracking-widest'
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    const content = (
        <>
            {loading ? (
                <Icon name="progress_activity" className="animate-spin" />
            ) : (
                <>
                    {icon && iconPosition === 'left' && <Icon name={icon} size={size === 'sm' ? 18 : 22} />}
                    {children}
                    {icon && iconPosition === 'right' && <Icon name={icon} size={size === 'sm' ? 18 : 22} />}
                </>
            )}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}>
                {content}
            </Link>
        );
    }

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {content}
        </button>
    );
};

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'streak' | 'xp' | 'primary' | 'success' | 'white' | 'diamond';
    icon?: string;
    className?: string;
}

/**
 * Badge component for stats - with mini-glow effects
 */
export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    icon,
    className = ''
}) => {
    const variantStyles = {
        streak: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
        xp: 'bg-primary/10 text-primary border border-primary/20',
        primary: 'bg-primary text-white shadow-sm',
        success: 'bg-success/10 text-success border border-success/20',
        white: 'bg-white/10 backdrop-blur-md text-white border border-white/20',
        diamond: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
    };

    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs tracking-tight ${variantStyles[variant]} ${className}`}>
            {icon && <Icon name={icon} filled size={18} />}
            <span>{children}</span>
        </div>
    );
};

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
    glass?: boolean;
}

/**
 * Premium Card with hover lifts and optional glass effect
 */
export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = false,
    onClick,
    glass = false
}) => {
    const baseStyles = 'rounded-3xl transition-all duration-300';
    const glassStyles = glass ? 'glass' : 'bg-white dark:bg-slate-900/40 shadow-card border border-slate-200/50 dark:border-slate-800/50';
    const hoverStyles = hover ? 'hover:shadow-floating hover:-translate-y-1.5 cursor-pointer active:scale-[0.98]' : '';

    return (
        <div
            className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

/**
 * Progress Bar component for game progress tracking
 */
export const ProgressBar: React.FC<{ progress: number; color?: string; className?: string }> = ({ progress, color = 'bg-primary', className = '' }) => {
    return (
        <div className={`w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${className}`}>
            <div
                className={`h-full ${color} transition-all duration-500 ease-out`}
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};
