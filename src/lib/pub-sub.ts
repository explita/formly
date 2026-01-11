import { ChannelEvent } from "../types/pub-sub";

export type Callback<T> = (payload: T) => void;

export function createChannel<T = any>() {
  const listeners = new Set<Callback<any>>();

  return {
    emit<T>(payload: T) {
      listeners.forEach((cb) => cb(payload));
    },
    subscribe(cb: Callback<T>) {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    clear() {
      listeners.clear();
    },
  };
}

export function createFormBus<T>() {
  const channels = new Map<string, ReturnType<typeof createChannel>>();

  // The hybrid callable-object
  const channel = (name: ChannelEvent<T>) => {
    if (!name) throw new Error("Channel name required");
    if (!channels.has(name)) channels.set(name, createChannel<T>());
    return channels.get(name)! as ReturnType<typeof createChannel<T>>;
  };

  // Attach helper methods directly to the function
  channel.clearAll = () => {
    channels.forEach((c) => c.clear());
    channels.clear();
  };

  return { channel };
}
