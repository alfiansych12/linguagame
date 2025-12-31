'use client';

import { create } from 'zustand';

export type AlertType = 'success' | 'error' | 'info' | 'warning' | 'crystal' | 'xp';

interface AlertState {
    isOpen: boolean;
    title: string;
    message: string;
    type: AlertType;
    confirmLabel?: string;
    onConfirm?: () => void;
    cancelLabel?: string;
    onCancel?: () => void;

    // Quantity logic (for shop)
    showQuantitySelector?: boolean;
    quantity: number;
    pricePerItem?: number;
    setQuantity: (val: number) => void;

    showAlert: (config: {
        title: string;
        message: string;
        type?: AlertType;
        confirmLabel?: string;
        onConfirm?: () => void;
        cancelLabel?: string;
        onCancel?: () => void;
        showQuantitySelector?: boolean;
        pricePerItem?: number;
        autoClose?: number;
    }) => void;

    closeAlert: () => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmLabel: 'Oke Gas!',
    onConfirm: undefined,
    cancelLabel: undefined,
    onCancel: undefined,
    showQuantitySelector: false,
    quantity: 1,
    pricePerItem: 0,

    setQuantity: (val) => set({ quantity: Math.max(1, val) }),

    showAlert: (config) => {
        set({
            isOpen: true,
            title: config.title,
            message: config.message,
            type: config.type || 'info',
            confirmLabel: config.confirmLabel || 'Oke Gas!',
            onConfirm: config.onConfirm,
            cancelLabel: config.cancelLabel,
            onCancel: config.onCancel,
            showQuantitySelector: config.showQuantitySelector || false,
            pricePerItem: config.pricePerItem || 0,
            quantity: 1, // Reset to 1 every time alert shows
        });

        if (config.autoClose) {
            setTimeout(() => {
                get().closeAlert();
            }, config.autoClose);
        }
    },

    closeAlert: () => set({ isOpen: false }),
}));
