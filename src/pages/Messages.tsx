import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

type Message = {
  id: string;
  fromMe: boolean;
  text: string;
  timestamp: number;
};

const DEMO_NOW = Date.now();

const Messages = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useParams();

  const targetUserId = userId as Id<'users'> | undefined;
  const profile = useQuery(
    api.users.getProfileByIdOrMe,
    targetUserId ? { userId: targetUserId } : 'skip'
  );

  const [draft, setDraft] = useState('');

  const demoMessages: Message[] = useMemo(
    () => [
      {
        id: 'm1',
        fromMe: false,
        text: 'Hey — I saw your case. Is transport to the clinic still needed?',
        timestamp: DEMO_NOW - 1000 * 60 * 42,
      },
      {
        id: 'm2',
        fromMe: true,
        text: 'Yes please. We’re at the corner of the park entrance.',
        timestamp: DEMO_NOW - 1000 * 60 * 38,
      },
      {
        id: 'm3',
        fromMe: false,
        text: 'On my way. ETA 10 minutes. Keep them warm and safe.',
        timestamp: DEMO_NOW - 1000 * 60 * 35,
      },
    ],
    []
  );

  const title = profile?.displayName || t('messages.title', 'Messages');

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-16 bg-background">
      {/* Header */}
      <header className="sticky top-0 md:top-14 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
            aria-label={t('common.back')}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
            <p className="text-xs text-muted-foreground truncate">
              {t('messages.previewHint', 'Preview — messaging ships after MVP')}
            </p>
          </div>
        </div>
      </header>

      {/* Thread */}
      <main className="container mx-auto px-4 py-4">
        <div className="max-w-lg mx-auto space-y-2">
          {demoMessages.map((m) => (
            <div
              key={m.id}
              className={cn('flex', m.fromMe ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                  m.fromMe
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Composer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border pb-safe">
        <div className="container mx-auto px-4 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDraft('');
            }}
            className="max-w-lg mx-auto flex items-center gap-2"
          >
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t('messages.placeholder', 'Write a message…')}
              className="h-10"
            />
            <Button type="submit" size="icon" className="h-10 w-10" disabled={!draft.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messages;
