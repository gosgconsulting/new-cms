import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Image, Upload, Info, Globe, Languages, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import MediaModal from "./MediaModal";
import gosgLogo from "@/assets/go-sg-logo-official.png";
import LocationSection from "./LocationSection";
import LanguageSection from "./LanguageSection";
import { useAuth } from "../auth/AuthProvider";
import { fetchLanguageSettings, updateLanguageSettings } from "../../services/languageService";
import api from "../../utils/api";

// Countries list
const countries = [
  { code: 'SG', name: 'Singapore' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'TH', name: 'Thailand' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'IL', name: 'Israel' },
  { code: 'TR', name: 'Turkey' },
  { code: 'RU', name: 'Russia' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'GR', name: 'Greece' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LV', name: 'Latvia' },
  { code: 'EE', name: 'Estonia' }
].sort((a, b) => a.name.localeCompare(b.name));

// Languages list
const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: 'Chinese (Mandarin)' },
  { code: 'es', name: 'Spanish' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'de', name: 'German' },
  { code: 'jv', name: 'Javanese' },
  { code: 'wu', name: 'Wu Chinese' },
  { code: 'ms', name: 'Malay' },
  { code: 'te', name: 'Telugu' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'ko', name: 'Korean' },
  { code: 'fr', name: 'French' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'ur', name: 'Urdu' },
  { code: 'tr', name: 'Turkish' },
  { code: 'it', name: 'Italian' },
  { code: 'th', name: 'Thai' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'jin', name: 'Jin Chinese' },
  { code: 'min', name: 'Min Chinese' },
  { code: 'kn', name: 'Kannada' },
  { code: 'fa', name: 'Persian' },
  { code: 'bho', name: 'Bhojpuri' },
  { code: 'my', name: 'Burmese' },
  { code: 'hak', name: 'Hakka Chinese' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'bh', name: 'Bihari' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'hne', name: 'Chhattisgarhi' },
  { code: 'zu', name: 'Zulu' },
  { code: 'az', name: 'Azerbaijani' },
  { code: 'kk', name: 'Kazakh' },
  { code: 'zu', name: 'Zulu' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'pl', name: 'Polish' },
  { code: 'cs', name: 'Czech' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'el', name: 'Greek' },
  { code: 'he', name: 'Hebrew' },
  { code: 'ro', name: 'Romanian' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'hr', name: 'Croatian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'lv', name: 'Latvian' },
  { code: 'et', name: 'Estonian' }
].sort((a, b) => a.name.localeCompare(b.name));

// Timezones list
const timezones = [
  { code: 'UTC', name: 'UTC - Coordinated Universal Time', offset: '+00:00' },
  { code: 'GMT', name: 'GMT - Greenwich Mean Time', offset: '+00:00' },
  { code: 'EST', name: 'EST - Eastern Standard Time', offset: '-05:00' },
  { code: 'CST', name: 'CST - Central Standard Time', offset: '-06:00' },
  { code: 'MST', name: 'MST - Mountain Standard Time', offset: '-07:00' },
  { code: 'PST', name: 'PST - Pacific Standard Time', offset: '-08:00' },
  { code: 'EDT', name: 'EDT - Eastern Daylight Time', offset: '-04:00' },
  { code: 'CDT', name: 'CDT - Central Daylight Time', offset: '-05:00' },
  { code: 'MDT', name: 'MDT - Mountain Daylight Time', offset: '-06:00' },
  { code: 'PDT', name: 'PDT - Pacific Daylight Time', offset: '-07:00' },
  { code: 'BST', name: 'BST - British Summer Time', offset: '+01:00' },
  { code: 'CET', name: 'CET - Central European Time', offset: '+01:00' },
  { code: 'EET', name: 'EET - Eastern European Time', offset: '+02:00' },
  { code: 'MSK', name: 'MSK - Moscow Standard Time', offset: '+03:00' },
  { code: 'GST', name: 'GST - Gulf Standard Time', offset: '+04:00' },
  { code: 'PKT', name: 'PKT - Pakistan Standard Time', offset: '+05:00' },
  { code: 'IST', name: 'IST - India Standard Time', offset: '+05:30' },
  { code: 'NPT', name: 'NPT - Nepal Time', offset: '+05:45' },
  { code: 'BST_BD', name: 'BST - Bangladesh Standard Time', offset: '+06:00' },
  { code: 'MMT', name: 'MMT - Myanmar Time', offset: '+06:30' },
  { code: 'ICT', name: 'ICT - Indochina Time', offset: '+07:00' },
  { code: 'SGT', name: 'SGT - Singapore Standard Time', offset: '+08:00' },
  { code: 'HKT', name: 'HKT - Hong Kong Time', offset: '+08:00' },
  { code: 'CST_CN', name: 'CST - China Standard Time', offset: '+08:00' },
  { code: 'MYT', name: 'MYT - Malaysia Time', offset: '+08:00' },
  { code: 'PHT', name: 'PHT - Philippine Time', offset: '+08:00' },
  { code: 'WIT', name: 'WIT - Western Indonesian Time', offset: '+07:00' },
  { code: 'CIT', name: 'CIT - Central Indonesian Time', offset: '+08:00' },
  { code: 'EIT', name: 'EIT - Eastern Indonesian Time', offset: '+09:00' },
  { code: 'JST', name: 'JST - Japan Standard Time', offset: '+09:00' },
  { code: 'KST', name: 'KST - Korea Standard Time', offset: '+09:00' },
  { code: 'ACST', name: 'ACST - Australian Central Standard Time', offset: '+09:30' },
  { code: 'AEST', name: 'AEST - Australian Eastern Standard Time', offset: '+10:00' },
  { code: 'AWST', name: 'AWST - Australian Western Standard Time', offset: '+08:00' },
  { code: 'NZST', name: 'NZST - New Zealand Standard Time', offset: '+12:00' },
  { code: 'NZDT', name: 'NZDT - New Zealand Daylight Time', offset: '+13:00' },
  { code: 'FIJI', name: 'FJT - Fiji Time', offset: '+12:00' },
  { code: 'HST', name: 'HST - Hawaii Standard Time', offset: '-10:00' },
  { code: 'AKST', name: 'AKST - Alaska Standard Time', offset: '-09:00' },
  { code: 'AKDT', name: 'AKDT - Alaska Daylight Time', offset: '-08:00' },
  { code: 'CAT', name: 'CAT - Central Africa Time', offset: '+02:00' },
  { code: 'EAT', name: 'EAT - East Africa Time', offset: '+03:00' },
  { code: 'WAT', name: 'WAT - West Africa Time', offset: '+01:00' },
  { code: 'SAST', name: 'SAST - South Africa Standard Time', offset: '+02:00' },
  { code: 'ART', name: 'ART - Argentina Time', offset: '-03:00' },
  { code: 'BRT', name: 'BRT - Brasilia Time', offset: '-03:00' },
  { code: 'CLT', name: 'CLT - Chile Standard Time', offset: '-04:00' },
  { code: 'COT', name: 'COT - Colombia Time', offset: '-05:00' },
  { code: 'ECT', name: 'ECT - Ecuador Time', offset: '-05:00' },
  { code: 'PET', name: 'PET - Peru Time', offset: '-05:00' },
  { code: 'VET', name: 'VET - Venezuela Time', offset: '-04:00' },
  { code: 'AST', name: 'AST - Atlantic Standard Time', offset: '-04:00' },
  { code: 'ADT', name: 'ADT - Atlantic Daylight Time', offset: '-03:00' },
  { code: 'NST', name: 'NST - Newfoundland Standard Time', offset: '-03:30' },
  { code: 'NDT', name: 'NDT - Newfoundland Daylight Time', offset: '-02:30' },
  { code: 'AZOT', name: 'AZOT - Azores Time', offset: '-01:00' },
  { code: 'CVT', name: 'CVT - Cape Verde Time', offset: '-01:00' },
  { code: 'WET', name: 'WET - Western European Time', offset: '+00:00' },
  { code: 'WEST', name: 'WEST - Western European Summer Time', offset: '+01:00' },
  { code: 'CEST', name: 'CEST - Central European Summer Time', offset: '+02:00' },
  { code: 'EEST', name: 'EEST - Eastern European Summer Time', offset: '+03:00' },
  { code: 'TRT', name: 'TRT - Turkey Time', offset: '+03:00' },
  { code: 'AST_AR', name: 'AST - Arabia Standard Time', offset: '+03:00' },
  { code: 'IRST', name: 'IRST - Iran Standard Time', offset: '+03:30' },
  { code: 'IRDT', name: 'IRDT - Iran Daylight Time', offset: '+04:30' },
  { code: 'AFT', name: 'AFT - Afghanistan Time', offset: '+04:30' },
  { code: 'UZT', name: 'UZT - Uzbekistan Time', offset: '+05:00' },
  { code: 'YEKT', name: 'YEKT - Yekaterinburg Time', offset: '+05:00' },
  { code: 'OMST', name: 'OMST - Omsk Time', offset: '+06:00' },
  { code: 'KRAT', name: 'KRAT - Krasnoyarsk Time', offset: '+07:00' },
  { code: 'IRKT', name: 'IRKT - Irkutsk Time', offset: '+08:00' },
  { code: 'YAKT', name: 'YAKT - Yakutsk Time', offset: '+09:00' },
  { code: 'VLAT', name: 'VLAT - Vladivostok Time', offset: '+10:00' },
  { code: 'MAGT', name: 'MAGT - Magadan Time', offset: '+11:00' },
  { code: 'PETT', name: 'PETT - Kamchatka Time', offset: '+12:00' }
].sort((a, b) => a.name.localeCompare(b.name));

const BrandingSettingsPage: React.FC = () => {
  const { currentTenantId } = useAuth();
  const [brandingData, setBrandingData] = useState({
    site_name: '',
    site_tagline: '',
    site_description: '',
    site_logo: '',
    site_favicon: '',
    country: '',
    language: '',
    timezone: ''
  });
  const [languageSettings, setLanguageSettings] = useState({
    defaultLanguage: '',
    additionalLanguages: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLanguageLoading, setIsLanguageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [faviconModalOpen, setFaviconModalOpen] = useState(false);

  // Load branding settings from API
  useEffect(() => {
    const loadBrandingSettings = async () => {
      console.log(`[testing] Starting to load branding settings for tenant: ${currentTenantId || 'default'}`);
      try {
        setIsLoading(true);
        // Use the API utility with tenant ID
        console.log(`[testing] Fetching branding settings with tenant ID: ${currentTenantId || 'default'}`);
        const endpoint = currentTenantId 
          ? `/api/branding?tenantId=${encodeURIComponent(currentTenantId)}`
          : '/api/branding';
        
        console.log(`[testing] Making authenticated API call to: ${endpoint}`);
        const response = await api.get(endpoint);
        
        console.log(`[testing] API response status: ${response.status}`);
        if (response.ok) {
          const responseText = await response.text();
          console.log(`[testing] Raw API response text: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
          
          let settings;
          try {
            settings = JSON.parse(responseText);
          } catch (parseError) {
            console.error(`[testing] Error parsing JSON response: ${parseError.message}`);
            console.log(`[testing] Failed JSON content: ${responseText}`);
            throw new Error('Invalid JSON response from API');
          }
          
          console.log(`[testing] Loaded branding settings for tenant ${currentTenantId}:`, settings);
          
          // Map the database settings to component state
          console.log('[testing] Raw API response structure:', JSON.stringify(settings, null, 2));
          
          // Extract values from the appropriate categories
          const branding = settings.branding || {};
          const localization = settings.localization || {};
          const seo = settings.seo || {};
          
          console.log('[testing] Extracted categories:', { 
            branding, 
            localization, 
            seo 
          });
          
          const newBrandingData = {
            // Site Information section
            site_name: branding.site_name || '',
            site_tagline: branding.site_tagline || '',
            site_description: branding.site_description || '',
            
            // Logo and Favicon section
            site_logo: branding.site_logo || '',
            site_favicon: branding.site_favicon || '',
            
            // Location section
            country: localization.site_country || '',
            language: localization.site_language || '',
            timezone: localization.site_timezone || ''
          };
          
          console.log('[testing] New branding data to set:', newBrandingData);
          setBrandingData(newBrandingData);
          
          console.log('[testing] Updated brandingData state with values from API');
          
          // Also load language settings to ensure they're in sync
          loadLanguageSettings();
        } else {
          const errorText = await response.text();
          console.error(`[testing] Error loading branding settings for tenant ${currentTenantId}: ${response.status}`);
          console.error(`[testing] Error response body: ${errorText}`);
          toast({
            title: "Error",
            description: "Failed to load branding settings. Using default values.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error(`[testing] Error loading branding settings for tenant ${currentTenantId}:`, error);
        toast({
          title: "Error",
          description: "Failed to load branding settings. Using default values.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadBrandingSettings();
  }, [currentTenantId]);
  
  // Function to load language settings
  const loadLanguageSettings = async () => {
    console.log(`[testing] Starting to load language settings for tenant: ${currentTenantId || 'default'}`);
    try {
      setIsLanguageLoading(true);
      
      // Use the real API to fetch language settings with tenant ID
      console.log(`[testing] Calling fetchLanguageSettings with tenantId: ${currentTenantId}`);
      const settings = await fetchLanguageSettings(currentTenantId);
      
      console.log(`[testing] Loaded language settings from API for tenant ${currentTenantId}:`, settings);
      
      // Log the raw values for debugging
      console.log('[testing] Raw language settings values:', {
        defaultLanguage: String(settings.defaultLanguage),
        additionalLanguages: String(settings.additionalLanguages),
        typeofDefault: typeof settings.defaultLanguage,
        typeofAdditional: typeof settings.additionalLanguages,
        tenantId: currentTenantId
      });
      
      // Validate the received data
      if (settings && (settings.defaultLanguage !== undefined || settings.additionalLanguages !== undefined)) {
        console.log('[testing] Setting language settings state with valid data');
        setLanguageSettings({
          defaultLanguage: settings.defaultLanguage || 'en',
          additionalLanguages: settings.additionalLanguages || ''
        });
      } else {
        console.warn('[testing] Received incomplete language settings data:', settings);
        // Use default values for incomplete data
        setLanguageSettings({
          defaultLanguage: 'en',
          additionalLanguages: ''
        });
        toast({
          title: "Warning",
          description: "Incomplete language settings data received. Using default values.",
          variant: "warning",
        });
      }
    } catch (error) {
      console.error(`[testing] Error loading language settings for tenant ${currentTenantId}:`, error);
      // Use default values if API call fails
      setLanguageSettings({
        defaultLanguage: 'en',
        additionalLanguages: ''
      });
      toast({
        title: "Error",
        description: "Failed to load language settings. Using default values.",
        variant: "destructive",
      });
    } finally {
      setIsLanguageLoading(false);
    }
  };

  // Load language settings when tenant changes
  useEffect(() => {
    loadLanguageSettings();
  }, [currentTenantId]);

  const handleInputChange = (field: string, value: string) => {
    setBrandingData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Prepare settings for API
      const settingsToSave = {
        site_name: brandingData.site_name,
        site_tagline: brandingData.site_tagline,
        site_description: brandingData.site_description,
        site_logo: brandingData.site_logo,
        site_favicon: brandingData.site_favicon,
        site_country: brandingData.country,
        site_language: brandingData.language,
        site_timezone: brandingData.timezone
      };

      console.log(`[testing] Saving branding settings for tenant ${currentTenantId}:`, settingsToSave);
      
      // Use the API utility with tenant ID
      const endpoint = currentTenantId 
        ? `/api/branding?tenantId=${encodeURIComponent(currentTenantId)}`
        : '/api/branding';
      
      console.log(`[testing] Making authenticated API call to: ${endpoint}`);
      const response = await api.post(endpoint, settingsToSave);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[testing] Error response from API: ${errorText}`);
        throw new Error(`Failed to save branding settings for tenant ${currentTenantId}`);
      }
      
      const result = await response.json();
      console.log(`[testing] Branding settings saved for tenant ${currentTenantId}:`, result);

      toast({
        title: "Success",
        description: "Branding settings saved successfully!",
      });
    } catch (error) {
      console.error('[testing] Error saving branding settings:', error);
      toast({
        title: "Error",
        description: "Failed to save branding settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMigrateLogo = async () => {
    try {
      console.log(`[testing] Migrating logo for tenant ${currentTenantId}`);
      
      // Use the API utility with tenant ID
      const endpoint = currentTenantId 
        ? `/api/branding?tenantId=${encodeURIComponent(currentTenantId)}`
        : '/api/branding';
      
      // Update the logo in the database
      console.log(`[testing] Making authenticated API call to: ${endpoint}`);
      const response = await api.post(endpoint, {
        site_logo: gosgLogo
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[testing] Error response from API: ${errorText}`);
        throw new Error(`Failed to migrate logo for tenant ${currentTenantId}`);
      }
      
      // Update the logo in state with the imported logo
      setBrandingData(prev => ({
        ...prev,
        site_logo: gosgLogo
      }));

      toast({
        title: "Success",
        description: "Logo migrated successfully!",
      });
    } catch (error) {
      console.error(`[testing] Error migrating logo for tenant ${currentTenantId}:`, error);
      toast({
        title: "Error",
        description: "Failed to migrate logo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMigrateFavicon = async () => {
    try {
      console.log(`[testing] Migrating favicon for tenant ${currentTenantId}`);
      
      // Use the API utility with tenant ID
      const endpoint = currentTenantId 
        ? `/api/branding?tenantId=${encodeURIComponent(currentTenantId)}`
        : '/api/branding';
      
      // Update the favicon in the database
      console.log(`[testing] Making authenticated API call to: ${endpoint}`);
      const response = await api.post(endpoint, {
        site_favicon: '/favicon.png'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[testing] Error response from API: ${errorText}`);
        throw new Error(`Failed to migrate favicon for tenant ${currentTenantId}`);
      }
      
      // Update the favicon in state
      setBrandingData(prev => ({
        ...prev,
        site_favicon: '/favicon.png'
      }));

      toast({
        title: "Success",
        description: "Favicon migrated successfully!",
      });
    } catch (error) {
      console.error(`[testing] Error migrating favicon for tenant ${currentTenantId}:`, error);
      toast({
        title: "Error",
        description: "Failed to migrate favicon. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandPurple mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading branding settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Branding Settings</h3>
        <p className="text-muted-foreground">
          Customize your site's branding elements including name, tagline, logo, and favicon
        </p>
      </div>

      {/* Site Information */}
      <div className="space-y-8">
        <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 flex items-center gap-2">
          <Info className="h-5 w-5 text-brandPurple" />
          Site Information
        </h4>
        
        {/* Single Column Layout */}
        <div className="w-full space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
                <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
                <div className="h-24 bg-gray-100 animate-pulse rounded-md"></div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input 
                    id="site_name"
                    value={brandingData.site_name}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    placeholder="Your site name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site_tagline">Tagline</Label>
                  <Input 
                    id="site_tagline"
                    value={brandingData.site_tagline}
                    onChange={(e) => handleInputChange('site_tagline', e.target.value)}
                    placeholder="Your site's tagline"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site_description">Site Description</Label>
                  <Textarea 
                    id="site_description"
                    value={brandingData.site_description}
                    onChange={(e) => handleInputChange('site_description', e.target.value)}
                    placeholder="Brief description of your site"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">Used for SEO and social sharing</p>
                </div>
              </>
            )}
          </div>

          {/* Location Settings */}
          {isLoading ? (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 flex items-center gap-2">
                <Globe className="h-5 w-5 text-brandTeal" />
                Location
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
                <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
              </div>
            </div>
          ) : (
            <LocationSection 
              country={brandingData.country}
              timezone={brandingData.timezone}
              onCountryChange={(value) => handleInputChange('country', value)}
              onTimezoneChange={(value) => handleInputChange('timezone', value)}
            />
          )}

          {/* Language Settings */}
          {isLanguageLoading ? (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 flex items-center gap-2">
                <Languages className="h-5 w-5 text-brandPurple" />
                Languages
              </h4>
              <div className="space-y-4">
                <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
                <div className="h-24 bg-gray-100 animate-pulse rounded-md"></div>
              </div>
            </div>
          ) : (
            <LanguageSection 
              defaultLanguage={languageSettings.defaultLanguage}
              additionalLanguages={languageSettings.additionalLanguages}
              onSave={() => {
                console.log('[testing] Language settings saved callback, refreshing data');
                // Refresh the language settings from the database
                loadLanguageSettings();
              }}
            />
          )}

          {/* Logo Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-md font-medium text-foreground">Logo</h5>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleMigrateLogo}
                className="text-xs"
              >
                Migrate Current Logo
              </Button>
            </div>
            <div 
              className="bg-secondary/20 rounded-lg border border-dashed border-border p-8 text-center hover:bg-secondary/30 transition-colors cursor-pointer"
              onClick={() => setLogoModalOpen(true)}
            >
              {brandingData.site_logo ? (
                <div className="flex flex-col items-center">
                  <img 
                    src={brandingData.site_logo} 
                    alt="Site Logo" 
                    className="h-16 w-auto mb-4"
                  />
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setLogoModalOpen(true); }}>
                    Replace Logo
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-secondary/40 rounded-lg flex items-center justify-center mb-4">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-medium text-foreground">Upload Logo</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG or SVG (max 2MB)</p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Favicon Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-md font-medium text-foreground">Favicon</h5>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleMigrateFavicon}
                className="text-xs"
              >
                Migrate Current Favicon
              </Button>
            </div>
            <div 
              className="bg-secondary/20 rounded-lg border border-dashed border-border p-6 text-center hover:bg-secondary/30 transition-colors cursor-pointer"
              onClick={() => setFaviconModalOpen(true)}
            >
              {brandingData.site_favicon ? (
                <div className="flex flex-col items-center">
                  <img 
                    src={brandingData.site_favicon} 
                    alt="Favicon" 
                    className="h-10 w-10 mb-4"
                  />
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setFaviconModalOpen(true); }}>
                    Replace Favicon
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-secondary/40 rounded-md flex items-center justify-center mb-4">
                    <Image className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-medium text-foreground">Upload Favicon</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG or ICO (32x32px)</p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-foreground border-b border-border pb-2">Branding Preview</h4>
        
        <div className="bg-secondary/20 rounded-lg border border-border p-6">
          <div className="flex flex-col items-center space-y-4">
            {/* Logo - Use database value with fallback */}
            {brandingData.site_logo ? (
              <img 
                src={brandingData.site_logo} 
                alt="Site Logo" 
                className="h-16 w-auto"
                onError={(e) => {
                  console.error('Error loading logo from database, using fallback');
                  e.currentTarget.src = gosgLogo;
                }}
              />
            ) : (
              <img 
                src={gosgLogo} 
                alt="Default Site Logo" 
                className="h-16 w-auto opacity-60"
              />
            )}
            
            {/* Site Name and Tagline */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">
                {brandingData.site_name || 'Your Site Name'}
              </h2>
              <p className="text-muted-foreground">
                {brandingData.site_tagline || 'Your site tagline goes here'}
              </p>
            </div>
            
            {/* Site Description */}
            <div className="max-w-lg text-center mt-2">
              <p className="text-sm text-foreground">
                {brandingData.site_description || 'Your site description will appear here. Add a compelling description to engage your visitors.'}
              </p>
            </div>
            
            {/* Country, Language and Timezone Display */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border/50 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4 text-brandTeal" />
                <span>{brandingData.country || 'Country'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Languages className="h-4 w-4 text-brandPurple" />
                <span>{brandingData.language || 'Language'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-brandGold" />
                <span>{brandingData.timezone || 'Timezone'}</span>
              </div>
            </div>
            
            {/* Favicon preview */}
            {brandingData.site_favicon && (
              <div className="mt-2 flex items-center gap-2">
                <img 
                  src={brandingData.site_favicon} 
                  alt="Favicon" 
                  className="h-6 w-6"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-xs text-muted-foreground">Favicon preview</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4 border-t border-border">
        <Button 
          variant="default" 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-brandPurple hover:bg-brandPurple/90"
        >
          {isSaving ? 'Saving...' : 'Save Branding Settings'}
        </Button>
      </div>

      {/* Media Modals */}
      <MediaModal
        isOpen={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
        onSelect={(url) => handleInputChange('site_logo', url)}
        title="Select Logo"
        acceptedTypes={['image/*']}
        maxFileSize={2 * 1024 * 1024} // 2MB
      />

      <MediaModal
        isOpen={faviconModalOpen}
        onClose={() => setFaviconModalOpen(false)}
        onSelect={(url) => handleInputChange('site_favicon', url)}
        title="Select Favicon"
        acceptedTypes={['image/png', 'image/x-icon', 'image/vnd.microsoft.icon']}
        maxFileSize={1 * 1024 * 1024} // 1MB
      />
    </div>
  );
};

export default BrandingSettingsPage;

