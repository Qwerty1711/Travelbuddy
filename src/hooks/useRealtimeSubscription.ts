import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeSubscription(
  table: string,
  filter: string | null,
  callback: () => void
) {
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = () => {
      const channelName = `${table}_${filter || 'all'}_${Date.now()}`;

      channel = supabase.channel(channelName);

      if (filter) {
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: filter,
          },
          () => {
            callback();
          }
        );
      } else {
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
          },
          () => {
            callback();
          }
        );
      }

      channel.subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, filter, callback]);
}
