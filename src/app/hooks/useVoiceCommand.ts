import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

type CommandCallback = () => void;

interface VoiceCommandConfig {
  [key: string]: CommandCallback;
}

export const useVoiceCommand = (commands: VoiceCommandConfig) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setIsSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Single command mode
      recognition.interimResults = false;
      recognition.lang = 'zh-CN'; // Default to Chinese

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript.trim();
        setTranscript(text);
        console.log(`[Voice] Heard: ${text}`);
        processCommand(text);
      };

      recognition.onerror = (event: any) => {
        console.error('[Voice] Error:', event.error);
        setIsListening(false);
        // toast.error('语音识别错误: ' + event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [commands]);

  const processCommand = (text: string) => {
    let matched = false;
    // Simple fuzzy matching
    Object.keys(commands).forEach(key => {
      // Create a regex from the command key (e.g. "锁定*风险" -> /锁定.*风险/)
      // If key contains spaces, treat as separate keywords
      const keywords = key.split(' ');
      const isMatch = keywords.every(k => text.includes(k));
      
      if (isMatch) {
        toast.success(`识别指令: "${text}"`, {
            description: `执行操作: ${key}`
        });
        commands[key]();
        matched = true;
      }
    });

    if (!matched) {
      toast.info(`未识别指令: "${text}"`, { duration: 2000 });
    }
  };

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        toast.info('正在聆听...', { description: '请说出指令 (如: "切换视图", "锁定风险")' });
      } catch (e) {
        console.error(e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  return { isListening, transcript, isSupported, toggleListening };
};
