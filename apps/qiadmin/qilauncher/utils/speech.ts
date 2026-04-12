// apps/qilauncher/utils/speech.ts

const API_BASE = "http://localhost:7130";

interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
  lang?: string;
}

let currentAudio: HTMLAudioElement | null = null;

// Check if TTS is supported (always true now - we use ElevenLabs via API)
export function isTTSSupported(): boolean {
  return true;  // Always supported via ElevenLabs API
}

// Legacy browser TTS functions (kept for compatibility, but not used)
export function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  if (!window.speechSynthesis) return null;
  return window.speechSynthesis;
}

export function getVoices(): SpeechSynthesisVoice[] {
  const synth = getSpeechSynthesis();
  if (!synth) return [];
  return synth.getVoices();
}

/**
 * Speak text using ElevenLabs TTS via /gina/tts endpoint.
 * 
 * @param text - Text to speak
 * @param options - Optional voice settings (not used with ElevenLabs, kept for compatibility)
 * @returns Promise that resolves when audio finishes playing
 */
export function speak(
  text: string,
  options: SpeakOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Stop any currently playing audio
    stopSpeaking();

    // Basic length guard
    const textToSpeak = text.trim();
    if (!textToSpeak) {
      resolve();
      return;
    }

    // Limit text length to avoid very long audio
    const maxLength = 1000;
    const truncatedText = textToSpeak.length > maxLength 
      ? textToSpeak.substring(0, maxLength) + '...' 
      : textToSpeak;

    // Call ElevenLabs TTS endpoint
    (async () => {
      try {
        const response = await fetch(`${API_BASE}/gina/tts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: truncatedText }),
        });

        if (!response.ok) {
          let errorData: any = {};
          try {
            errorData = await response.json();
          } catch {
            errorData = { message: await response.text().catch(() => 'Unknown error') };
          }
          
          // Handle 401 (API key missing/invalid) gracefully
          if (response.status === 401) {
            console.warn("[GINA TTS] API key not configured. TTS disabled.");
            // Resolve silently instead of rejecting - don't break the chat
            resolve();
            return;
          }
          
          console.error("[GINA TTS] Error", response.status, errorData);
          reject(new Error(`TTS failed: ${response.status} ${errorData.message || JSON.stringify(errorData)}`));
          return;
        }

        // Get audio blob
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        
        // Create audio element and play
        const audio = new Audio(url);
        currentAudio = audio;

        audio.onended = () => {
          URL.revokeObjectURL(url);
          currentAudio = null;
          resolve();
        };

        audio.onerror = (error) => {
          URL.revokeObjectURL(url);
          currentAudio = null;
          console.error("[GINA TTS] play failed", error);
          reject(new Error("Failed to play audio"));
        };

        await audio.play();
      } catch (err) {
        console.error("[GINA TTS] exception", err);
        reject(err instanceof Error ? err : new Error("TTS request failed"));
      }
    })();
  });
}

export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  
  // Also stop browser TTS if it's running (legacy)
  const synth = getSpeechSynthesis();
  if (synth) {
    synth.cancel();
  }
}

export function isSpeaking(): boolean {
  // Check if ElevenLabs audio is playing
  if (currentAudio && !currentAudio.paused && currentAudio.currentTime > 0 && !currentAudio.ended) {
    return true;
  }
  
  // Also check browser TTS (legacy)
  const synth = getSpeechSynthesis();
  if (synth && synth.speaking) {
    return true;
  }
  
  return false;
}

