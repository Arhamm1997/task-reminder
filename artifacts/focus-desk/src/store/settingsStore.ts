import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  phone: string;
  apikey: string;
  setPhone: (phone: string) => void;
  setApikey: (apikey: string) => void;
  save: (phone: string, apikey: string) => void;
  isConfigured: () => boolean;
  sendWhatsApp: (message: string) => Promise<{ ok: boolean; error?: string }>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      phone: '',
      apikey: '',

      setPhone: (phone) => set({ phone }),
      setApikey: (apikey) => set({ apikey }),

      save: (phone, apikey) => set({ phone, apikey }),

      isConfigured: () => {
        const { phone, apikey } = get();
        return phone.trim().length > 0 && apikey.trim().length > 0;
      },

      sendWhatsApp: async (message) => {
        const { phone, apikey } = get();
        if (!phone || !apikey) {
          return { ok: false, error: 'WhatsApp not configured' };
        }
        try {
          const res = await fetch('/api/send-whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, apikey, message }),
          });
          const data = await res.json() as { ok: boolean; error?: string };
          return data;
        } catch {
          return { ok: false, error: 'Network error' };
        }
      },
    }),
    {
      name: 'focusdesk-settings',
    }
  )
);
