import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, MessageCircle, Send, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useTaskStore } from '@/store/taskStore';
import { useNoteStore } from '@/store/noteStore';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { phone, apikey, save, sendWhatsApp, isConfigured } = useSettingsStore();
  const { toast } = useToast();

  const [localPhone, setLocalPhone] = useState(phone || '+92');
  const [localApikey, setLocalApikey] = useState(apikey);
  const [showApikey, setShowApikey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  const configured = isConfigured();

  const handlePhoneChange = (v: string) => {
    if (!v.startsWith('+')) {
      setLocalPhone('+92' + v.replace(/^\+?92?/, ''));
    } else {
      setLocalPhone(v);
    }
  };

  const handleSave = () => {
    const trimmedPhone = localPhone.trim();
    const trimmedKey = localApikey.trim();
    if (!trimmedPhone || !trimmedKey) {
      toast({ title: 'Both fields are required', variant: 'destructive' });
      return;
    }
    save(trimmedPhone, trimmedKey);
    toast({ title: 'Settings saved', description: 'WhatsApp reminders are now active.' });
  };

  const handleTest = async () => {
    const trimmedPhone = localPhone.trim();
    const trimmedKey = localApikey.trim();
    if (!trimmedPhone || !trimmedKey) {
      toast({ title: 'Please save your settings first', variant: 'destructive' });
      return;
    }
    save(trimmedPhone, trimmedKey);
    setTestStatus('loading');
    try {
      const res = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: trimmedPhone,
          apikey: trimmedKey,
          message: '✅ FocusDesk connected! Reminders are active.',
        }),
      });
      const data = await res.json() as { ok: boolean };
      if (data.ok) {
        setTestStatus('ok');
        toast({ title: 'Test message sent!', description: 'Check your WhatsApp.' });
      } else {
        setTestStatus('error');
        toast({ title: 'Failed to send', description: 'Check your phone number and API key.', variant: 'destructive' });
      }
    } catch {
      setTestStatus('error');
      toast({ title: 'Network error', variant: 'destructive' });
    }
    setTimeout(() => setTestStatus('idle'), 4000);
  };

  const handleClearData = () => {
    if (!window.confirm('This will delete ALL your tasks and notes. Are you sure?')) return;
    useTaskStore.setState({ tasks: [], seeded: false });
    useNoteStore.setState({ notes: [] });
    toast({ title: 'All data cleared' });
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-xl font-semibold mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure WhatsApp reminders and manage your data.</p>
      </motion.div>

      {/* WhatsApp Reminders */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-card border border-border rounded-xl p-5 mb-4"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">WhatsApp Reminders</h2>
            <p className="text-xs text-muted-foreground">via CallMeBot API (free)</p>
          </div>
          {configured && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-500 font-medium">
              <CheckCircle className="h-3.5 w-3.5" />
              Active
            </span>
          )}
        </div>

        {/* Setup instructions */}
        <div className="bg-muted/50 rounded-lg p-3 mb-4 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">How to get your API key:</p>
          <ol className="list-decimal list-inside space-y-0.5 ml-1">
            <li>Save this number on WhatsApp: <span className="font-mono text-foreground">+34 644 59 74 97</span></li>
            <li>Send the message: <span className="font-mono text-foreground">I allow callmebot to send me messages</span></li>
            <li>You'll receive your API key within a minute</li>
          </ol>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="wa-phone" data-testid="settings-phone-label">WhatsApp Number</Label>
            <Input
              id="wa-phone"
              data-testid="settings-phone-input"
              type="tel"
              placeholder="+923XXXXXXXXX"
              value={localPhone}
              onChange={e => handlePhoneChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Pakistan format: +923001234567</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wa-apikey" data-testid="settings-apikey-label">CallMeBot API Key</Label>
            <div className="relative">
              <Input
                id="wa-apikey"
                data-testid="settings-apikey-input"
                type={showApikey ? 'text' : 'password'}
                placeholder="Your API key"
                value={localApikey}
                onChange={e => setLocalApikey(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                data-testid="toggle-apikey-visibility"
                onClick={() => setShowApikey(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showApikey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              data-testid="save-settings"
              onClick={handleSave}
              className="flex-1"
            >
              Save Settings
            </Button>
            <Button
              variant="outline"
              data-testid="test-whatsapp"
              onClick={handleTest}
              disabled={testStatus === 'loading'}
              className={cn(
                'flex items-center gap-2 flex-1',
                testStatus === 'ok' && 'border-green-500 text-green-500',
                testStatus === 'error' && 'border-destructive text-destructive'
              )}
            >
              {testStatus === 'loading' ? (
                <>
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
                  Sending...
                </>
              ) : testStatus === 'ok' ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5" />
                  Sent!
                </>
              ) : testStatus === 'error' ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5" />
                  Failed
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send Test
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Data management */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-5"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-destructive/15 flex items-center justify-center">
            <Trash2 className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Data Management</h2>
            <p className="text-xs text-muted-foreground">All data stored locally in your browser</p>
          </div>
        </div>
        <Button
          variant="destructive"
          data-testid="clear-all-data"
          onClick={handleClearData}
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All Tasks &amp; Notes
        </Button>
      </motion.section>
    </div>
  );
}
