import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

type CommandCallback = () => void;

interface VoiceCommands {
  [key: string]: CommandCallback;
}

export const useVoiceControl = (commands: VoiceCommands) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false; // Stop after one command for safety
      recognitionInstance.lang = 'zh-CN'; // Default to Chinese as per user context
      recognitionInstance.interimResults = false;
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onstart = () => {
        setIsListening(true);
        toast.info("语音指令系统已激活", {
          description: "正在聆听... (试着说: '切换视图', '锁定风险')",
          position: 'top-center'
        });
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript.trim();
        setTranscript(text);
        
        console.log(`[Voice] Heard: ${text}`);
        
        // Simple fuzzy matching
        let matched = false;
        Object.keys(commands).forEach(cmdKey => {
          if (text.includes(cmdKey)) {
            commands[cmdKey]();
            matched = true;
            toast.success(`执行指令: ${cmdKey}`, { position: 'top-center' });
          }
        });

        if (!matched) {
             toast.error(`未识别指令: ${text}`, { position: 'top-center' });
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
            toast.error("语音服务错误: " + event.error);
        }
      };

      setRecognition(recognitionInstance);
    }
  }, [commands]);

  const toggleListening = useCallback(() => {
    if (!isSupported) {
        toast.error("当前浏览器不支持 Web Speech API");
        return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (e) {
        // Sometimes it throws if already started
        console.warn(e);
      }
    }
  }, [isListening, recognition, isSupported]);

  return { isListening, transcript, toggleListening, isSupported };
};
