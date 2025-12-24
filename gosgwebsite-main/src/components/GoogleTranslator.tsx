/**
 * Google Translator Component
 * Provides text translation with language selection and detection
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Languages, ArrowRight, Copy, Volume2, RotateCcw } from 'lucide-react';
import { googleAPIClient, type TranslationResult } from '@/integrations';

interface GoogleTranslatorProps {
  /** Default source text */
  defaultText?: string;
  /** Default source language */
  defaultSourceLang?: string;
  /** Default target language */
  defaultTargetLang?: string;
  /** Enable auto-detection of source language */
  enableAutoDetect?: boolean;
  /** Enable text-to-speech (requires additional setup) */
  enableSpeech?: boolean;
  /** Custom CSS classes */
  className?: string;
}

// Common languages with their codes and names
const COMMON_LANGUAGES = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'pl', name: 'Polish' },
  { code: 'cs', name: 'Czech' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'ro', name: 'Romanian' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'hr', name: 'Croatian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'et', name: 'Estonian' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'mt', name: 'Maltese' },
  { code: 'tr', name: 'Turkish' },
  { code: 'he', name: 'Hebrew' },
  { code: 'fa', name: 'Persian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'kn', name: 'Kannada' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ne', name: 'Nepali' },
  { code: 'si', name: 'Sinhala' },
  { code: 'my', name: 'Myanmar (Burmese)' },
  { code: 'km', name: 'Khmer' },
  { code: 'lo', name: 'Lao' },
  { code: 'ka', name: 'Georgian' },
  { code: 'am', name: 'Amharic' },
  { code: 'sw', name: 'Swahili' },
  { code: 'zu', name: 'Zulu' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'sq', name: 'Albanian' },
  { code: 'az', name: 'Azerbaijani' },
  { code: 'be', name: 'Belarusian' },
  { code: 'bs', name: 'Bosnian' },
  { code: 'eu', name: 'Basque' },
  { code: 'gl', name: 'Galician' },
  { code: 'is', name: 'Icelandic' },
  { code: 'ga', name: 'Irish' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'cy', name: 'Welsh' },
  { code: 'yi', name: 'Yiddish' },
];

export const GoogleTranslator: React.FC<GoogleTranslatorProps> = ({
  defaultText = '',
  defaultSourceLang = 'auto',
  defaultTargetLang = 'en',
  enableAutoDetect = true,
  enableSpeech = false,
  className = ''
}) => {
  const [sourceText, setSourceText] = useState(defaultText);
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState(defaultSourceLang);
  const [targetLang, setTargetLang] = useState(defaultTargetLang);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [supportedLanguages, setSupportedLanguages] = useState<Array<{
    language: string;
    name: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translationHistory, setTranslationHistory] = useState<Array<{
    source: string;
    target: string;
    sourceLang: string;
    targetLang: string;
    timestamp: Date;
  }>>([]);

  // Load supported languages on component mount
  useEffect(() => {
    const loadSupportedLanguages = async () => {
      try {
        console.log('[testing] Loading supported languages');
        const languages = await googleAPIClient.getSupportedLanguages();
        setSupportedLanguages(languages);
        console.log('[testing] Loaded supported languages:', languages.length);
      } catch (error) {
        console.error('[testing] Failed to load supported languages:', error);
        // Fallback to common languages if API call fails
        setSupportedLanguages(
          COMMON_LANGUAGES.slice(1).map((l) => ({ language: l.code, name: l.name }))
        ); // Exclude 'auto' and map to expected shape
      }
    };

    loadSupportedLanguages();
  }, []);

  // Translate text
  const translateText = async () => {
    if (!sourceText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    if (sourceLang === targetLang && sourceLang !== 'auto') {
      setError('Source and target languages cannot be the same');
      return;
    }

    setLoading(true);
    setError(null);
    setDetectedLang(null);

    try {
      console.log('[testing] Translating text:', { sourceText, sourceLang, targetLang });
      
      const result: TranslationResult = await googleAPIClient.translateText(
        sourceText,
        targetLang,
        sourceLang === 'auto' ? undefined : sourceLang
      );

      setTranslatedText(result.translatedText);
      
      if (result.detectedSourceLanguage) {
        setDetectedLang(result.detectedSourceLanguage);
        console.log('[testing] Detected source language:', result.detectedSourceLanguage);
      }

      // Add to translation history
      setTranslationHistory(prev => [{
        source: sourceText,
        target: result.translatedText,
        sourceLang: result.detectedSourceLanguage || sourceLang,
        targetLang,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]); // Keep last 10 translations

      console.log('[testing] Translation completed:', result);
    } catch (error) {
      console.error('[testing] Translation failed:', error);
      setError(error instanceof Error ? error.message : 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  // Swap languages
  const swapLanguages = () => {
    if (sourceLang === 'auto') return; // Cannot swap when auto-detect is enabled

    const newSourceLang = targetLang;
    const newTargetLang = sourceLang;
    const newSourceText = translatedText;
    const newTranslatedText = sourceText;

    setSourceLang(newSourceLang);
    setTargetLang(newTargetLang);
    setSourceText(newSourceText);
    setTranslatedText(newTranslatedText);
    setDetectedLang(null);
  };

  // Copy text to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('[testing] Text copied to clipboard');
    } catch (error) {
      console.error('[testing] Failed to copy text:', error);
    }
  };

  // Clear all fields
  const clearAll = () => {
    setSourceText('');
    setTranslatedText('');
    setDetectedLang(null);
    setError(null);
  };

  // Get language name from code
  const getLanguageName = (code: string) => {
    const lang = COMMON_LANGUAGES.find(l => l.code === code) ||
                supportedLanguages.find(l => l.language === code);
    return lang?.name || code;
  };

  // Handle Enter key for translation
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      translateText();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Translation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Google Translator
          </CardTitle>
          <CardDescription>
            Translate text between different languages using Google Translate API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <label className="text-sm font-medium mb-2 block">From</label>
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source language" />
                </SelectTrigger>
                <SelectContent>
                  {enableAutoDetect && (
                    <SelectItem value="auto">Auto Detect</SelectItem>
                  )}
                  {COMMON_LANGUAGES.slice(1).map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={swapLanguages}
                disabled={sourceLang === 'auto' || loading}
                className="rounded-full"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">To</label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_LANGUAGES.slice(1).map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Text Input and Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Source Text</label>
                <div className="flex items-center gap-2">
                  {detectedLang && (
                    <Badge variant="secondary" className="text-xs">
                      Detected: {getLanguageName(detectedLang)}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {sourceText.length} chars
                  </span>
                </div>
              </div>
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter text to translate..."
                rows={6}
                className="resize-none"
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Translation</label>
                <div className="flex items-center gap-2">
                  {translatedText && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(translatedText)}
                      className="h-6 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {translatedText.length} chars
                  </span>
                </div>
              </div>
              <Textarea
                value={translatedText}
                readOnly
                placeholder="Translation will appear here..."
                rows={6}
                className="resize-none bg-muted/50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button 
                onClick={translateText}
                disabled={loading || !sourceText.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Translate
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={clearAll}
                disabled={loading}
              >
                Clear
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Press Ctrl+Enter to translate
            </div>
          </div>

          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Translation History */}
      {translationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Translations</CardTitle>
            <CardDescription>
              Your last {translationHistory.length} translations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {translationHistory.map((item, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setSourceText(item.source);
                    setTranslatedText(item.target);
                    setSourceLang(item.sourceLang);
                    setTargetLang(item.targetLang);
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {getLanguageName(item.sourceLang)}
                    </Badge>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      {getLanguageName(item.targetLang)}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">
                      {item.source.length > 50 ? `${item.source.substring(0, 50)}...` : item.source}
                    </div>
                    <div>
                      {item.target.length > 50 ? `${item.target.substring(0, 50)}...` : item.target}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Translation Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Examples</CardTitle>
          <CardDescription>
            Click on any example to try it out
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { text: 'Hello, how are you?', from: 'en', to: 'es' },
              { text: 'Thank you very much', from: 'en', to: 'fr' },
              { text: 'Good morning', from: 'en', to: 'de' },
              { text: 'Where is the restaurant?', from: 'en', to: 'it' },
              { text: 'I love this place', from: 'en', to: 'pt' },
              { text: 'See you later', from: 'en', to: 'ja' },
            ].map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-auto p-2 text-left justify-start"
                onClick={() => {
                  setSourceText(example.text);
                  setSourceLang(example.from);
                  setTargetLang(example.to);
                  setTranslatedText('');
                  setDetectedLang(null);
                }}
              >
                <div>
                  <div className="text-xs text-muted-foreground">
                    {getLanguageName(example.from)} → {getLanguageName(example.to)}
                  </div>
                  <div className="text-sm">{example.text}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};