import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as Sub from '../utils/subscription';

/**
 * Reactive view over the subscription/quota state for screens that need to
 * render it (paywall, profile). Gate logic in the scanners calls the
 * `subscription` util functions directly (sync, like getProfileSync).
 */
export function useSubscription() {
  const read = () => ({
    subscribed: Sub.isSubscribed(),
    plan: Sub.getSubscriptionPlan(),
    dppRemaining: Sub.freeRemaining('dpp'),
    valueRemaining: Sub.freeRemaining('value'),
  });

  const [state, setState] = useState(read);

  const refresh = useCallback(() => setState(read()), []);

  // Re-read whenever the screen regains focus (e.g. after a scan elsewhere).
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const subscribe = useCallback(
    (plan: Sub.SubscriptionPlan) => {
      Sub.activateSubscription(plan);
      refresh();
    },
    [refresh]
  );

  const restore = useCallback(() => {
    const ok = Sub.restorePurchases();
    refresh();
    return ok;
  }, [refresh]);

  return { ...state, subscribe, restore, refresh };
}
