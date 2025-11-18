import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Languages, Search, Plus, X, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useCMSSettings, Language } from '../../context/CMSSettingsContext';
import { updateLanguageSettings, addLanguage } from '../../services/languageService';
import { useAuth } from '../auth/AuthProvider';

// Complete list of languages supported by Google Translate
const availableLanguages = [
  { code: 'af', name: 'Afrikaans' },
  { code: 'sq', name: 'Albanian' },
  { code: 'am', name: 'Amharic' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hy', name: 'Armenian' },
  { code: 'as', name: 'Assamese' },
  { code: 'ay', name: 'Aymara' },
  { code: 'az', name: 'Azerbaijani' },
  { code: 'bm', name: 'Bambara' },
  { code: 'eu', name: 'Basque' },
  { code: 'be', name: 'Belarusian' },
  { code: 'bn', name: 'Bengali' },
  { code: 'bho', name: 'Bhojpuri' },
  { code: 'bs', name: 'Bosnian' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'ca', name: 'Catalan' },
  { code: 'ceb', name: 'Cebuano' },
  { code: 'ny', name: 'Chichewa' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'co', name: 'Corsican' },
  { code: 'hr', name: 'Croatian' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'dv', name: 'Dhivehi' },
  { code: 'doi', name: 'Dogri' },
  { code: 'nl', name: 'Dutch' },
  { code: 'en', name: 'English' },
  { code: 'eo', name: 'Esperanto' },
  { code: 'et', name: 'Estonian' },
  { code: 'ee', name: 'Ewe' },
  { code: 'tl', name: 'Filipino' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'fy', name: 'Frisian' },
  { code: 'gl', name: 'Galician' },
  { code: 'ka', name: 'Georgian' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'gn', name: 'Guarani' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'ht', name: 'Haitian Creole' },
  { code: 'ha', name: 'Hausa' },
  { code: 'haw', name: 'Hawaiian' },
  { code: 'iw', name: 'Hebrew' },
  { code: 'hi', name: 'Hindi' },
  { code: 'hmn', name: 'Hmong' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'is', name: 'Icelandic' },
  { code: 'ig', name: 'Igbo' },
  { code: 'ilo', name: 'Ilocano' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ga', name: 'Irish' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'jw', name: 'Javanese' },
  { code: 'kn', name: 'Kannada' },
  { code: 'kk', name: 'Kazakh' },
  { code: 'km', name: 'Khmer' },
  { code: 'rw', name: 'Kinyarwanda' },
  { code: 'ko', name: 'Korean' },
  { code: 'kri', name: 'Krio' },
  { code: 'ku', name: 'Kurdish (Kurmanji)' },
  { code: 'ckb', name: 'Kurdish (Sorani)' },
  { code: 'ky', name: 'Kyrgyz' },
  { code: 'lo', name: 'Lao' },
  { code: 'la', name: 'Latin' },
  { code: 'lv', name: 'Latvian' },
  { code: 'ln', name: 'Lingala' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'lg', name: 'Luganda' },
  { code: 'lb', name: 'Luxembourgish' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'mai', name: 'Maithili' },
  { code: 'mg', name: 'Malagasy' },
  { code: 'ms', name: 'Malay' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mt', name: 'Maltese' },
  { code: 'mi', name: 'Maori' },
  { code: 'mr', name: 'Marathi' },
  { code: 'mni-Mtei', name: 'Meiteilon (Manipuri)' },
  { code: 'lus', name: 'Mizo' },
  { code: 'mn', name: 'Mongolian' },
  { code: 'my', name: 'Myanmar (Burmese)' },
  { code: 'ne', name: 'Nepali' },
  { code: 'no', name: 'Norwegian' },
  { code: 'or', name: 'Odia (Oriya)' },
  { code: 'om', name: 'Oromo' },
  { code: 'ps', name: 'Pashto' },
  { code: 'fa', name: 'Persian' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'qu', name: 'Quechua' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sm', name: 'Samoan' },
  { code: 'sa', name: 'Sanskrit' },
  { code: 'gd', name: 'Scots Gaelic' },
  { code: 'nso', name: 'Sepedi' },
  { code: 'sr', name: 'Serbian' },
  { code: 'st', name: 'Sesotho' },
  { code: 'sn', name: 'Shona' },
  { code: 'sd', name: 'Sindhi' },
  { code: 'si', name: 'Sinhala' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'so', name: 'Somali' },
  { code: 'es', name: 'Spanish' },
  { code: 'su', name: 'Sundanese' },
  { code: 'sw', name: 'Swahili' },
  { code: 'sv', name: 'Swedish' },
  { code: 'tg', name: 'Tajik' },
  { code: 'ta', name: 'Tamil' },
  { code: 'tt', name: 'Tatar' },
  { code: 'te', name: 'Telugu' },
  { code: 'th', name: 'Thai' },
  { code: 'ti', name: 'Tigrinya' },
  { code: 'ts', name: 'Tsonga' },
  { code: 'tr', name: 'Turkish' },
  { code: 'tk', name: 'Turkmen' },
  { code: 'ak', name: 'Twi' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'ug', name: 'Uyghur' },
  { code: 'uz', name: 'Uzbek' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'cy', name: 'Welsh' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'yi', name: 'Yiddish' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'zu', name: 'Zulu' }
].sort((a, b) => a.name.localeCompare(b.name));

interface LanguageSectionProps {
  onSave?: () => void;
  defaultLanguage?: string;
  additionalLanguages?: string;
}

const LanguageSection: React.FC<LanguageSectionProps> = ({ 
  onSave,
  defaultLanguage: defaultLangFromProps,
  additionalLanguages: additionalLangsFromProps
}) => {
  const { currentTenantId } = useAuth();
  
  const { settings, updateLanguage } = useCMSSettings();
  
  const [isLoading, setIsLoading] = useState(false);
  // Always prioritize props over context
  const [defaultLanguage, setDefaultLanguage] = useState<Language>(
    defaultLangFromProps !== undefined
      ? getLanguageByCodeOrName(defaultLangFromProps) 
      : settings.language.defaultLanguage
  );
  const [additionalLanguages, setAdditionalLanguages] = useState<Language[]>(
    additionalLangsFromProps !== undefined
      ? parseAdditionalLanguages(additionalLangsFromProps, defaultLangFromProps) 
      : settings.language.additionalLanguages
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddLanguageModalOpen, setIsAddLanguageModalOpen] = useState(false);
  const [isChangeDefaultModalOpen, setIsChangeDefaultModalOpen] = useState(false);

  // Helper function to get language by code or name
  function getLanguageByCodeOrName(codeOrName: string): Language {
    
    if (!codeOrName) {
      return { code: 'en', name: 'English' };
    }
    
    // First try to find by exact code match
    const foundByCode = availableLanguages.find(lang => 
      lang.code.toLowerCase() === codeOrName.toLowerCase()
    );
    if (foundByCode) {
      return foundByCode;
    }
    
    // Then try to find by name
    const foundByName = availableLanguages.find(lang => 
      lang.name.toLowerCase() === codeOrName.toLowerCase()
    );
    if (foundByName) {
      return foundByName;
    }
    
    // Try to find by partial code match (for codes like 'zh-CN' that might be stored as 'zh')
    const foundByPartialCode = availableLanguages.find(lang => 
      codeOrName.toLowerCase().startsWith(lang.code.toLowerCase())
    );
    if (foundByPartialCode) {
      // Use the original code but the matched name
      return { code: codeOrName, name: foundByPartialCode.name };
    }
    
    // If not found, return a default object with the given code and a formatted name
    // Convert code to title case for better display (e.g., "ko" -> "Ko")
    const formattedName = codeOrName.charAt(0).toUpperCase() + codeOrName.slice(1).toLowerCase();
    return { code: codeOrName, name: formattedName };
  }

  // Helper function to parse comma-separated language codes
  function parseAdditionalLanguages(langString: string, defaultLang?: string): Language[] {
    
    if (!langString) {

      return [];
    }
    
    const splitCodes = langString.split(',');
    
    const trimmedCodes = splitCodes.map(code => code.trim());
    
    const filteredCodes = trimmedCodes.filter(code => {
      // Keep the code if:
      // 1. It's not empty
      // 2. It's not the same as the default language
      const shouldKeep = Boolean(code) && (
        !defaultLang || code.toLowerCase() !== defaultLang.toLowerCase()
      );
      return shouldKeep;
    });
    
    const mappedLanguages = filteredCodes.map(code => {
      const lang = getLanguageByCodeOrName(code);
      return lang;
    });
    
    return mappedLanguages;
  }

  // Update local state when context settings change
  useEffect(() => {
    console.log('[testing] useEffect triggered with:', {
      defaultLangFromProps,
      additionalLangsFromProps,
      contextLanguage: settings.language
    });
    
    // Only use context if props are not provided
    if (defaultLangFromProps === undefined && additionalLangsFromProps === undefined) {
      setDefaultLanguage(settings.language.defaultLanguage);
      setAdditionalLanguages(settings.language.additionalLanguages);
    } else {
      // If props are provided, use them
      if (defaultLangFromProps !== undefined) {
        setDefaultLanguage(getLanguageByCodeOrName(defaultLangFromProps));
      }
      if (additionalLangsFromProps !== undefined) {
        setAdditionalLanguages(parseAdditionalLanguages(additionalLangsFromProps, defaultLangFromProps));
      }
    }
  }, [settings.language, defaultLangFromProps, additionalLangsFromProps]);

  const handleAddLanguage = async (language: Language) => {
    // Check if language is already added
    if (additionalLanguages.some(lang => lang.code === language.code)) {
      toast({
        title: "Warning",
        description: `${language.name} is already added.`,
        variant: "destructive",
      });
      return;
    }
    
    // Check if language is the default
    if (defaultLanguage.code === language.code) {
      toast({
        title: "Warning",
        description: `${language.name} is already set as default language.`,
        variant: "destructive",
      });
      return;
    }
    
    const newAdditionalLanguages = [...additionalLanguages, language];
    setAdditionalLanguages(newAdditionalLanguages);
    
    // Update context
    updateLanguage({
      additionalLanguages: newAdditionalLanguages
    });
    
    setIsAddLanguageModalOpen(false);
    setSearchQuery('');
    
    // Save to database
    try {
      // Use addLanguage instead of updateLanguageSettings to ensure page translations are created
      console.log('[testing] Adding language to database:', language.code);
      
      // Call the addLanguage function which will create page translations
      const result = await addLanguage(language.code, currentTenantId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `${language.name} has been added.`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('[testing] Error adding language:', error);
      toast({
        title: "Error",
        description: "Failed to add language. Please try again.",
        variant: "destructive",
      });
    }
    
    if (onSave) onSave();
  };

  const handleRemoveLanguage = async (code: string) => {
    const newAdditionalLanguages = additionalLanguages.filter(lang => lang.code !== code);
    setAdditionalLanguages(newAdditionalLanguages);
    
    // Update context
    updateLanguage({
      additionalLanguages: newAdditionalLanguages
    });
    
    // Save to database
    try {
      // Convert additionalLanguages to comma-separated string
      const additionalLangCodes = newAdditionalLanguages.map(lang => lang.code).join(',');
      
      // Save to the database
      console.log('[testing] Saving language settings to database:', {
        defaultLanguage: defaultLanguage.code,
        additionalLanguages: additionalLangCodes
      });
      
      // Save to the database
      await updateLanguageSettings(defaultLanguage.code, additionalLangCodes, currentTenantId);
      
      toast({
        title: "Success",
        description: "Language has been removed.",
      });
    } catch (error) {
      console.error('[testing] Error saving language settings:', error);
      toast({
        title: "Error",
        description: "Failed to save language settings. Please try again.",
        variant: "destructive",
      });
    }
    
    if (onSave) onSave();
  };

  const handleSetDefaultLanguage = async (language: Language) => {
    // Store the old default language before changing it
    const oldDefaultLanguage = defaultLanguage;
    
    // Start with current additional languages
    let newAdditionalLanguages = [...additionalLanguages];
    
    // Add the old default language to additional languages if it's different from the new default
    // and not already in the additional languages list
    if (oldDefaultLanguage.code !== language.code) {
      const isOldDefaultInAdditional = newAdditionalLanguages.some(
        lang => lang.code === oldDefaultLanguage.code
      );
      
      if (!isOldDefaultInAdditional) {
        // Add the old default language to additional languages
        newAdditionalLanguages.push(oldDefaultLanguage);
      }
    }
    
    // Remove the new default language from additional languages if it exists there
    newAdditionalLanguages = newAdditionalLanguages.filter(
      lang => lang.code !== language.code
    );
    
    // Update state
    setDefaultLanguage(language);
    setAdditionalLanguages(newAdditionalLanguages);
    
    // Update context
    updateLanguage({
      defaultLanguage: language,
      additionalLanguages: newAdditionalLanguages
    });
    
    setIsChangeDefaultModalOpen(false);
    setSearchQuery('');
    
    // Save to database
    try {
      // Convert additionalLanguages to comma-separated string
      const additionalLangCodes = newAdditionalLanguages.map(lang => lang.code).join(',');
      
      // Save to the database
      console.log('[testing] Saving language settings to database:', {
        defaultLanguage: language.code,
        additionalLanguages: additionalLangCodes,
        oldDefaultLanguage: oldDefaultLanguage.code
      });
      
      // Save to the database
      await updateLanguageSettings(language.code, additionalLangCodes, currentTenantId);
      
      toast({
        title: "Success",
        description: `${language.name} has been set as default language.`,
      });
    } catch (error) {
      console.error('[testing] Error saving language settings:', error);
      toast({
        title: "Error",
        description: "Failed to save language settings. Please try again.",
        variant: "destructive",
      });
    }
    
    if (onSave) onSave();
  };

  const filteredLanguages = availableLanguages.filter(language =>
    language.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    language.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandPurple mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading language settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 flex items-center gap-2">
        <Languages className="h-5 w-5 text-brandPurple" />
        Language
      </h4>
      
      {/* Default Language Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-md font-medium text-foreground">Default Language</h5>
          <Button 
            onClick={() => setIsChangeDefaultModalOpen(true)} 
            size="sm"
            variant="outline"
          >
            <Edit className="h-4 w-4 mr-1" />
            Change Default
          </Button>
        </div>
        <div className="bg-secondary/20 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-md border border-border shadow-sm">
                <Languages className="h-5 w-5 text-brandPurple" />
              </div>
              <div>
                <p className="font-medium">{defaultLanguage.name}</p>
                <p className="text-sm text-muted-foreground">Code: {defaultLanguage.code}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Default
            </Button>
          </div>
        </div>
      </div>

      {/* Additional Languages Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-md font-medium text-foreground">Additional Languages</h5>
          <Button 
            onClick={() => setIsAddLanguageModalOpen(true)} 
            size="sm"
            className="bg-brandPurple hover:bg-brandPurple/90"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Language
          </Button>
        </div>
        
        <div className="space-y-3">
          {additionalLanguages.length > 0 ? (
            additionalLanguages.map((language) => (
              <div 
                key={language.code} 
                className="flex items-center justify-between bg-secondary/10 rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-md border border-border shadow-sm">
                    <Languages className="h-4 w-4 text-brandTeal" />
                  </div>
                  <div>
                    <p className="font-medium">{language.name}</p>
                    <p className="text-sm text-muted-foreground">Code: {language.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSetDefaultLanguage(language)}
                  >
                    Set as Default
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveLanguage(language.code)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-secondary/10 rounded-lg border border-dashed border-border p-6 text-center">
              <Languages className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">No additional languages configured</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAddLanguageModalOpen(true)}
                className="mt-3"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Language
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Language Modal */}
      <Dialog open={isAddLanguageModalOpen} onOpenChange={setIsAddLanguageModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Language</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            <ScrollArea className="h-72">
              <div className="space-y-1">
                {filteredLanguages.map((language) => {
                  const isAlreadyAdded = additionalLanguages.some(lang => lang.code === language.code);
                  const isDefault = defaultLanguage.code === language.code;
                  
                  return (
                    <Button
                      key={language.code}
                      variant="ghost"
                      className={`w-full justify-between text-left font-normal h-auto py-2 ${
                        isAlreadyAdded || isDefault ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => {
                        if (!isAlreadyAdded && !isDefault) {
                          handleAddLanguage(language);
                        }
                      }}
                      disabled={isAlreadyAdded || isDefault}
                    >
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-brandTeal" />
                        <div className="flex flex-col items-start">
                          <span className="text-sm">{language.name}</span>
                          <span className="text-xs text-muted-foreground">{language.code}</span>
                        </div>
                      </div>
                      {isAlreadyAdded && <span className="text-xs text-muted-foreground">Already added</span>}
                      {isDefault && <span className="text-xs text-muted-foreground">Default</span>}
                      {!isAlreadyAdded && !isDefault && <Plus className="h-4 w-4" />}
                    </Button>
                  );
                })}
                {filteredLanguages.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No languages found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Default Language Modal */}
      <Dialog open={isChangeDefaultModalOpen} onOpenChange={setIsChangeDefaultModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Default Language</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            <ScrollArea className="h-72">
              <div className="space-y-1">
                {filteredLanguages.map((language) => {
                  const isCurrentDefault = defaultLanguage.code === language.code;
                  
                  return (
                    <Button
                      key={language.code}
                      variant="ghost"
                      className={`w-full justify-between text-left font-normal h-auto py-2 ${
                        isCurrentDefault ? 'bg-secondary/30' : ''
                      }`}
                      onClick={() => {
                        if (!isCurrentDefault) {
                          handleSetDefaultLanguage(language);
                        }
                      }}
                      disabled={isCurrentDefault}
                    >
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-brandPurple" />
                        <div className="flex flex-col items-start">
                          <span className="text-sm">{language.name}</span>
                          <span className="text-xs text-muted-foreground">{language.code}</span>
                        </div>
                      </div>
                      {isCurrentDefault && <span className="text-xs text-muted-foreground">Current Default</span>}
                    </Button>
                  );
                })}
                {filteredLanguages.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No languages found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LanguageSection;