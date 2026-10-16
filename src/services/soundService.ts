/**
 * Audio Synthesizer and Vietnamese Text-to-Speech service for real-time ride alerts
 */

class SoundService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Synthesize audio chimes using Web Audio API oscillators
   */
  public playAlertSound(type: 'chime' | 'radar' | 'double_beep' | 'bell' = 'chime', volume: number = 0.8) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      gainNode.gain.setValueAtTime(Math.min(1, Math.max(0, volume)), now);

      if (type === 'chime') {
        // High harmonic chime
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(880, now); // A5
        osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
        osc2.frequency.setValueAtTime(587.33, now); // D5
        osc2.frequency.exponentialRampToValueAtTime(880, now + 0.15);

        gainNode.gain.setValueAtTime(volume * 0.7, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc1.connect(gainNode);
        osc2.connect(gainNode);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
      } else if (type === 'radar') {
        // Sonar ping
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);

        gainNode.gain.setValueAtTime(volume * 0.9, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'double_beep') {
        // Double alert beep for urgent trips
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(950, now);
        
        // Beep 1
        gainNode.gain.setValueAtTime(volume * 0.4, now);
        gainNode.gain.setValueAtTime(0.001, now + 0.08);
        // Beep 2
        gainNode.gain.setValueAtTime(volume * 0.4, now + 0.14);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        // Bell chime
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, now); // C6

        gainNode.gain.setValueAtTime(volume * 0.8, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.7);
      }
    } catch {
      // AudioContext could be blocked by browser autoplay policy before user interaction
    }
  }

  /**
   * Speak trip details in Vietnamese using Web Speech API
   */
  public speakVietnameseTrip(pickup: string, destination: string, priceText: string, rate: number = 1.0) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      // Cancel previous speech if still reading
      window.speechSynthesis.cancel();

      // Clean text for speech
      const cleanPickup = pickup.replace(/[^\p{L}\p{N}\s]/gu, '');
      const cleanDest = destination.replace(/[^\p{L}\p{N}\s]/gu, '');
      const phrase = `Cuốc mới: ${cleanPickup} về ${cleanDest}, ${priceText}`;

      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'vi-VN';
      utterance.rate = Math.min(1.5, Math.max(0.7, rate));

      // Attempt to pick Vietnamese voice if available
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.startsWith('vi') || v.lang.includes('VIE'));
      if (viVoice) {
        utterance.voice = viVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis error handling
    }
  }

  /**
   * Send system desktop notification if granted
   */
  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const res = await Notification.requestPermission();
      return res === 'granted';
    }
    return false;
  }

  public sendDesktopNotification(title: string, body: string) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'zalo-ride-alert',
        });
      } catch {
        // Notification could fail in certain iframe sandboxes
      }
    }
  }
}

export const soundService = new SoundService();
