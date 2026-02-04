import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface VoiceCommandOptions {
  onCommand: (command: string, params?: string[]) => void;
}

export const useVoiceCommands = ({ onCommand }: VoiceCommandOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'zh-CN'; // Default to Chinese

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      
      rec.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript.trim().toLowerCase();
        setTranscript(text);
        
        console.log('Voice Command:', text);
        
        // Simple NLP / Command Matching
        if (text.includes('三维') || text.includes('3d')) {
          onCommand('SWITCH_VIEW', ['3d']);
        } else if (text.includes('二维') || text.includes('平面') || text.includes('2d')) {
          onCommand('SWITCH_VIEW', ['2d']);
        } else if (text.includes('锁定') || text.includes('分析')) {
          // Extract asset name (simple heuristic)
          const assets = ['btc', 'eth', 'sol', 'usdt'];
          const found = assets.find(a => text.toLowerCase().includes(a));
          if (found) {
            onCommand('SELECT_ASSET', [found.toUpperCase()]);
          }
        } else if (text.includes('全撤') || text.includes('撤单')) {
           onCommand('CANCEL_ALL');
        } else if (text.includes('回测') || text.includes('测试')) {
           onCommand('OPEN_BACKTEST');
        } else {
           toast.info(`未识别指令: "${text}"`);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [onCommand]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        toast.info('语音指令监听中...', { description: '试着说: "切换到三维视图" 或 "锁定 BTC"' });
      } catch (e) {
        console.error(e);
      }
    }
  }, [recognition, isListening]);

  return { isListening, transcript, isSupported, toggleListening };
};