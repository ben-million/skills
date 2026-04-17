import { useCallback, useRef } from "react";
import type { SoundAsset } from "@/lib/sound-types";

type SoundOptions = { volume?: number };

export function useSound(
  src: string | SoundAsset,
  options: SoundOptions = {},
): [() => void, { stop: () => void }] {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    try {
      const uri = typeof src === "string" ? src : src.dataUri;
      const audio = new Audio(uri);
      audio.volume = options.volume ?? 1;
      audioRef.current = audio;
      audio.play().catch(() => {});
    } catch {}
  }, [src, options.volume]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return [play, { stop }];
}
