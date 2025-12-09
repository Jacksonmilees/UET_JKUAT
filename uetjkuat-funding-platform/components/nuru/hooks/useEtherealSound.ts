import { useRef, useEffect } from 'react';

export const useEtherealSound = (isPlaying: boolean) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const layerTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      startSound();
    } else {
      stopSound();
    }
    return () => stopSound();
  }, [isPlaying]);

  const startSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    // Master Gain for Fade In/Out
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 5); // Very quiet, fade in over 5s
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    // Frequencies for a heavenly A Major / F# Minor wash
    // Base layer (Pad)
    const freqs = [
      110.00, // A2
      164.81, // E3
      220.00, // A3
      277.18, // C#4
    ];

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle'; // Mix sine and triangle for warmth
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Slight detune for chorus effect
      osc.detune.setValueAtTime(Math.random() * 10 - 5, ctx.currentTime);

      // Individual gain for balance
      const oscGain = ctx.createGain();
      oscGain.gain.value = 1 / freqs.length; 
      
      // Lowpass filter to make it "muffled" and distant (Ethereal)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 600;

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      oscillatorsRef.current.push(osc);
    });

    // Schedule the "Deep Layer" to enter after 45 seconds
    // This adds higher "shimmer" frequencies
    layerTimeoutRef.current = window.setTimeout(() => {
      const shimmerFreqs = [554.37, 659.25]; // C#5, E5
      shimmerFreqs.forEach(freq => {
         const osc = ctx.createOscillator();
         osc.type = 'sine';
         osc.frequency.setValueAtTime(freq, ctx.currentTime);
         const oscGain = ctx.createGain();
         oscGain.gain.setValueAtTime(0, ctx.currentTime);
         oscGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 10); // Fade in slowly
         
         osc.connect(oscGain);
         oscGain.connect(masterGain);
         osc.start();
         oscillatorsRef.current.push(osc);
      });
    }, 45000); 
  };

  const stopSound = () => {
    if (gainNodeRef.current && audioContextRef.current) {
      // Fade out
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 3);
      setTimeout(() => {
        oscillatorsRef.current.forEach(osc => osc.stop());
        oscillatorsRef.current = [];
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
      }, 3100);
    }
    if (layerTimeoutRef.current) {
        clearTimeout(layerTimeoutRef.current);
        layerTimeoutRef.current = null;
    }
  };
};
