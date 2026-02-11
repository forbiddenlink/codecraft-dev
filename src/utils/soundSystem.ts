/**
 * Sound System for CodeCraft
 * Manages audio effects and ambient music for immersive experience
 */

export type SoundEffect = 
  | 'achievement_unlock'
  | 'challenge_complete'
  | 'code_error'
  | 'code_success'
  | 'building_place'
  | 'building_upgrade'
  | 'resource_collect'
  | 'ui_click'
  | 'ui_hover'
  | 'pixel_talk'
  | 'notification'
  | 'level_up'
  | 'unlock'
  | 'typing'
  | 'whoosh';

export type MusicTrack =
  | 'main_theme'
  | 'exploration'
  | 'coding_focus'
  | 'victory'
  | 'ambient_space';

interface SoundConfig {
  volume: number;
  loop?: boolean;
  fadeIn?: number;
  fadeOut?: number;
  playbackRate?: number;
}

export class SoundSystem {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundEffect, AudioBuffer> = new Map();
  private music: Map<MusicTrack, HTMLAudioElement> = new Map();
  private currentMusic: HTMLAudioElement | null = null;
  private masterVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.5;
  private enabled: boolean = true;
  private initialized: boolean = false;

  /**
   * Initialize the sound system
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create Audio Context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Generate procedural sounds
      await this.generateSounds();
      
      this.initialized = true;
      console.log('✅ Sound system initialized');
    } catch (error) {
      console.error('❌ Failed to initialize sound system:', error);
    }
  }

  /**
   * Generate procedural sound effects using Web Audio API
   */
  private async generateSounds(): Promise<void> {
    if (!this.audioContext) return;

    // Achievement unlock - triumphant chord
    this.sounds.set('achievement_unlock', this.createAchievementSound());
    
    // Challenge complete - success jingle
    this.sounds.set('challenge_complete', this.createSuccessSound());
    
    // Code error - gentle alert
    this.sounds.set('code_error', this.createErrorSound());
    
    // Code success - positive beep
    this.sounds.set('code_success', this.createCodeSuccessSound());
    
    // Building place - construction sound
    this.sounds.set('building_place', this.createBuildingSound());
    
    // Resource collect - coin/pickup sound
    this.sounds.set('resource_collect', this.createCollectSound());
    
    // UI click - subtle click
    this.sounds.set('ui_click', this.createClickSound());
    
    // UI hover - soft hover
    this.sounds.set('ui_hover', this.createHoverSound());
    
    // Pixel talk - robotic beep
    this.sounds.set('pixel_talk', this.createPixelSound());
    
    // Notification - attention sound
    this.sounds.set('notification', this.createNotificationSound());
    
    // Level up - fanfare
    this.sounds.set('level_up', this.createLevelUpSound());
    
    // Unlock - magical unlock
    this.sounds.set('unlock', this.createUnlockSound());
    
    // Typing - keyboard sound
    this.sounds.set('typing', this.createTypingSound());
    
    // Whoosh - transition sound
    this.sounds.set('whoosh', this.createWhooshSound());
  }

  /**
   * Create achievement unlock sound - triumphant chord
   */
  private createAchievementSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const duration = 1.5;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      // Major chord progression
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        let sample = 0;
        
        frequencies.forEach((freq, index) => {
          const envelope = Math.exp(-t * 2) * (1 - t / duration);
          sample += Math.sin(2 * Math.PI * freq * t) * envelope * 0.2;
        });
        
        data[i] = sample;
      }
    }

    return buffer;
  }

  /**
   * Create success sound - positive jingle
   */
  private createSuccessSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const duration = 0.8;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const freq = 800 + t * 400; // Rising frequency
        const envelope = Math.exp(-t * 5);
        data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
      }
    }

    return buffer;
  }

  /**
   * Create error sound - gentle alert
   */
  private createErrorSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const duration = 0.3;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const freq = 300 - t * 100; // Falling frequency
        const envelope = Math.exp(-t * 8);
        data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2;
      }
    }

    return buffer;
  }

  /**
   * Create code success sound
   */
  private createCodeSuccessSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const duration = 0.2;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 10);
        data[i] = Math.sin(2 * Math.PI * 1200 * t) * envelope * 0.15;
      }
    }

    return buffer;
  }

  /**
   * Create building placement sound
   */
  private createBuildingSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const duration = 0.5;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        // Construction-like sound with noise
        const noise = (Math.random() - 0.5) * 0.1;
        const tone = Math.sin(2 * Math.PI * 200 * t) * 0.2;
        const envelope = Math.exp(-t * 4);
        data[i] = (tone + noise) * envelope;
      }
    }

    return buffer;
  }

  /**
   * Create resource collection sound
   */
  private createCollectSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const duration = 0.3;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const freq = 600 + Math.sin(t * 50) * 200;
        const envelope = Math.exp(-t * 8);
        data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2;
      }
    }

    return buffer;
  }

  /**
   * Create UI click sound
   */
  private createClickSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const duration = 0.05;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 50);
        data[i] = Math.sin(2 * Math.PI * 1000 * t) * envelope * 0.1;
      }
    }

    return buffer;
  }

  /**
   * Create UI hover sound
   */
  private createHoverSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const duration = 0.03;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 80);
        data[i] = Math.sin(2 * Math.PI * 1500 * t) * envelope * 0.05;
      }
    }

    return buffer;
  }

  /**
   * Create Pixel talk sound
   */
  private createPixelSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const duration = 0.15;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        // Robotic beep with harmonics
        const fundamental = Math.sin(2 * Math.PI * 440 * t);
        const harmonic = Math.sin(2 * Math.PI * 880 * t) * 0.5;
        const envelope = Math.exp(-t * 10);
        data[i] = (fundamental + harmonic) * envelope * 0.15;
      }
    }

    return buffer;
  }

  /**
   * Create notification sound
   */
  private createNotificationSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const duration = 0.4;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        // Two-tone notification
        const freq = t < 0.2 ? 800 : 1000;
        const envelope = Math.exp(-t * 6);
        data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2;
      }
    }

    return buffer;
  }

  /**
   * Create level up sound
   */
  private createLevelUpSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const duration = 1.2;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      // Ascending arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const noteIndex = Math.floor(t / 0.3);
        const freq = notes[Math.min(noteIndex, notes.length - 1)];
        const envelope = Math.exp(-(t % 0.3) * 8);
        data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.25;
      }
    }

    return buffer;
  }

  /**
   * Create unlock sound
   */
  private createUnlockSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const duration = 0.6;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        // Magical shimmer effect
        const freq = 1000 + Math.sin(t * 20) * 500;
        const envelope = Math.exp(-t * 3);
        data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2;
      }
    }

    return buffer;
  }

  /**
   * Create typing sound
   */
  private createTypingSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const duration = 0.02;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        // Keyboard click
        const noise = (Math.random() - 0.5) * 0.3;
        const envelope = Math.exp(-t * 100);
        data[i] = noise * envelope;
      }
    }

    return buffer;
  }

  /**
   * Create whoosh sound
   */
  private createWhooshSound(): AudioBuffer {
    const ctx = this.audioContext!;
    const duration = 0.4;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        // Sweeping noise
        const noise = (Math.random() - 0.5);
        const freq = 2000 - t * 3000;
        const tone = Math.sin(2 * Math.PI * freq * t);
        const envelope = Math.exp(-t * 5);
        data[i] = (noise * 0.3 + tone * 0.1) * envelope;
      }
    }

    return buffer;
  }

  /**
   * Play a sound effect
   */
  playSFX(effect: SoundEffect, config: Partial<SoundConfig> = {}): void {
    if (!this.enabled || !this.audioContext || !this.initialized) return;

    const buffer = this.sounds.get(effect);
    if (!buffer) {
      console.warn(`Sound effect "${effect}" not found`);
      return;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.playbackRate.value = config.playbackRate || 1;
    
    gainNode.gain.value = (config.volume || 1) * this.sfxVolume * this.masterVolume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(0);
  }

  /**
   * Play background music
   */
  playMusic(track: MusicTrack, config: Partial<SoundConfig> = {}): void {
    if (!this.enabled) return;

    // Stop current music if playing
    if (this.currentMusic) {
      this.fadeOutMusic(this.currentMusic, config.fadeOut || 1);
    }

    // Note: In production, you would load actual music files
    // For now, we'll create a placeholder
    console.log(`🎵 Playing music: ${track}`);
    
    // This would be implemented with actual audio files:
    // const audio = new Audio(`/music/${track}.mp3`);
    // audio.loop = config.loop !== false;
    // audio.volume = (config.volume || 1) * this.musicVolume * this.masterVolume;
    // audio.play();
    // this.currentMusic = audio;
  }

  /**
   * Fade out music
   */
  private fadeOutMusic(audio: HTMLAudioElement, duration: number): void {
    const startVolume = audio.volume;
    const fadeStep = startVolume / (duration * 60); // 60fps

    const fadeInterval = setInterval(() => {
      if (audio.volume > fadeStep) {
        audio.volume -= fadeStep;
      } else {
        audio.pause();
        audio.volume = startVolume;
        clearInterval(fadeInterval);
      }
    }, 1000 / 60);
  }

  /**
   * Stop all music
   */
  stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    }
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set SFX volume
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume = this.musicVolume * this.masterVolume;
    }
  }

  /**
   * Enable/disable sound system
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stopMusic();
    }
  }

  /**
   * Get current settings
   */
  getSettings() {
    return {
      enabled: this.enabled,
      masterVolume: this.masterVolume,
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume
    };
  }
}

// Export singleton instance
export const soundSystem = new SoundSystem();

// Initialize on first user interaction
if (typeof window !== 'undefined') {
  const initOnInteraction = () => {
    soundSystem.init();
    document.removeEventListener('click', initOnInteraction);
    document.removeEventListener('keydown', initOnInteraction);
  };

  document.addEventListener('click', initOnInteraction);
  document.addEventListener('keydown', initOnInteraction);
}

// React hook for sound system
import { useEffect } from 'react';

export function useSoundSystem() {
  useEffect(() => {
    soundSystem.init();
  }, []);

  return {
    playSFX: (effect: SoundEffect, config?: Partial<SoundConfig>) => 
      soundSystem.playSFX(effect, config),
    playMusic: (track: MusicTrack, config?: Partial<SoundConfig>) => 
      soundSystem.playMusic(track, config),
    stopMusic: () => soundSystem.stopMusic(),
    setMasterVolume: (volume: number) => soundSystem.setMasterVolume(volume),
    setSFXVolume: (volume: number) => soundSystem.setSFXVolume(volume),
    setMusicVolume: (volume: number) => soundSystem.setMusicVolume(volume),
    setEnabled: (enabled: boolean) => soundSystem.setEnabled(enabled),
    settings: soundSystem.getSettings()
  };
}

