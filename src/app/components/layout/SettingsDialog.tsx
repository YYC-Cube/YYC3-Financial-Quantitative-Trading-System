import React from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useSettings } from '@/app/contexts/SettingsContext';
import { useTranslation } from '@/app/i18n/mock';
import { Languages, Palette } from '@/app/components/SafeIcons';

export const SettingsDialog = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { language, setLanguage, colorScheme, setColorScheme } = useSettings();
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#0A192F] border-[#233554] text-[#CCD6F6]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            {t('settings.title')}
          </DialogTitle>
          <DialogDescription className="text-[#8892B0]">
            自定义您的量化交易系统偏好
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Language Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-[#CCD6F6]">
              <Languages className="w-4 h-4 text-[#38B2AC]" />
              {t('settings.language')}
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-[#112240] border-[#233554] text-[#CCD6F6]">
                <SelectValue placeholder="选择语言" />
              </SelectTrigger>
              <SelectContent className="bg-[#112240] border-[#233554] text-[#CCD6F6]">
                <SelectItem value="zh">简体中文</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Scheme Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-[#CCD6F6]">
              <Palette className="w-4 h-4 text-[#38B2AC]" />
              {t('settings.market_colors')}
            </div>
            <RadioGroup 
              value={colorScheme} 
              onValueChange={(val) => setColorScheme(val as any)}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2 rounded-md border border-[#233554] p-3 hover:bg-[#112240] transition-colors cursor-pointer">
                <RadioGroupItem value="china" id="china" className="border-[#38B2AC] text-[#38B2AC]" />
                <Label htmlFor="china" className="flex-1 cursor-pointer flex justify-between items-center">
                  <span>{t('settings.china')}</span>
                  <div className="flex gap-1">
                    <span className="w-3 h-3 rounded-full bg-[#F56565]"></span>
                    <span className="w-3 h-3 rounded-full bg-[#38B2AC]"></span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border border-[#233554] p-3 hover:bg-[#112240] transition-colors cursor-pointer">
                <RadioGroupItem value="standard" id="standard" className="border-[#38B2AC] text-[#38B2AC]" />
                <Label htmlFor="standard" className="flex-1 cursor-pointer flex justify-between items-center">
                  <span>{t('settings.standard')}</span>
                  <div className="flex gap-1">
                    <span className="w-3 h-3 rounded-full bg-[#38B2AC]"></span>
                    <span className="w-3 h-3 rounded-full bg-[#F56565]"></span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <button 
            onClick={onClose}
            className="w-full bg-[#4299E1] text-white py-2 rounded-md font-bold hover:brightness-110 transition-all"
          >
            {t('settings.save')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
