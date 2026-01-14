import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import BasicInfoStep from './ProductWizardSteps/BasicInfoStep';
import AttributesStep from './ProductWizardSteps/AttributesStep';
import VariationsStep from './ProductWizardSteps/VariationsStep';
import PricingStep from './ProductWizardSteps/PricingStep';
import ImagesStep from './ProductWizardSteps/ImagesStep';
import CategoriesStep from './ProductWizardSteps/CategoriesStep';
import AdditionalInfoStep from './ProductWizardSteps/AdditionalInfoStep';
import ReviewStep from './ProductWizardSteps/ReviewStep';

export interface ProductAttribute {
  id: string;
  name: string;
  values: string[];
  usedForVariations: boolean;
}

export interface ProductVariation {
  id: string;
  attributes: Record<string, string>;
  sku?: string;
  price: string;
  compareAtPrice?: string;
  stockQuantity: number;
  image?: string;
  enabled: boolean;
}

export interface ProductWizardData {
  // Step 1: Basic Info
  name: string;
  shortDescription: string;
  description: string;
  productType: 'simple' | 'variable';
  
  // Step 2: Attributes (variable only)
  attributes: ProductAttribute[];
  
  // Step 3: Variations (variable only)
  variations: ProductVariation[];
  
  // Step 4: Pricing
  regularPrice: string;
  salePrice: string;
  sku: string;
  manageStock: boolean;
  stockQuantity: number;
  backorders: 'no' | 'notify' | 'yes';
  
  // Step 5: Images
  mainImage: string;
  galleryImages: string[];
  variationImages: Record<string, string>; // variationId -> imageUrl
  
  // Step 6: Categories & Tags
  categories: number[];
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  
  // Step 7: Additional Info
  weight: string;
  length: string;
  width: string;
  height: string;
  shippingClass: string;
  status: 'draft' | 'publish';
  featured: boolean;
}

interface ProductCreationWizardProps {
  currentTenantId: string;
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<ProductWizardData>;
}

const TOTAL_STEPS = 8;

export default function ProductCreationWizard({
  currentTenantId,
  onSuccess,
  onCancel,
  initialData,
}: ProductCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  
  // Load draft from localStorage if available
  const loadDraft = (): Partial<ProductWizardData> | null => {
    try {
      const draftKey = `product_draft_${currentTenantId}`;
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        return JSON.parse(draft);
      }
    } catch (error) {
      console.warn('[testing] Could not load draft:', error);
    }
    return null;
  };

  const savedDraft = initialData || loadDraft();

  const [wizardData, setWizardData] = useState<ProductWizardData>({
    name: savedDraft?.name || '',
    shortDescription: savedDraft?.shortDescription || '',
    description: savedDraft?.description || '',
    productType: savedDraft?.productType || 'simple',
    attributes: savedDraft?.attributes || [],
    variations: savedDraft?.variations || [],
    regularPrice: savedDraft?.regularPrice || '',
    salePrice: savedDraft?.salePrice || '',
    sku: savedDraft?.sku || '',
    manageStock: savedDraft?.manageStock ?? false,
    stockQuantity: savedDraft?.stockQuantity ?? 0,
    backorders: savedDraft?.backorders || 'no',
    mainImage: savedDraft?.mainImage || '',
    galleryImages: savedDraft?.galleryImages || [],
    variationImages: savedDraft?.variationImages || {},
    categories: savedDraft?.categories || [],
    tags: savedDraft?.tags || [],
    metaTitle: savedDraft?.metaTitle || '',
    metaDescription: savedDraft?.metaDescription || '',
    weight: savedDraft?.weight || '',
    length: savedDraft?.length || '',
    width: savedDraft?.width || '',
    height: savedDraft?.height || '',
    shippingClass: savedDraft?.shippingClass || '',
    status: savedDraft?.status || 'draft',
    featured: savedDraft?.featured ?? false,
  });

  const updateWizardData = useCallback((updates: Partial<ProductWizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
  }, []);

  const setStepErrors = useCallback((step: number, stepErrors: Record<string, string>) => {
    setErrors((prev) => ({ ...prev, [step]: stepErrors }));
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Info
        if (!wizardData.name.trim()) {
          stepErrors.name = 'Product name is required';
        }
        if (!wizardData.description.trim()) {
          stepErrors.description = 'Product description is required';
        }
        break;

      case 2: // Attributes (only for variable)
        if (wizardData.productType === 'variable') {
          if (wizardData.attributes.length === 0) {
            stepErrors.attributes = 'At least one attribute is required for variable products';
          } else {
            wizardData.attributes.forEach((attr, index) => {
              if (!attr.name.trim()) {
                stepErrors[`attribute_${index}_name`] = 'Attribute name is required';
              }
              if (attr.values.length === 0) {
                stepErrors[`attribute_${index}_values`] = 'Attribute must have at least one value';
              }
            });
          }
        }
        break;

      case 3: // Variations (only for variable)
        if (wizardData.productType === 'variable') {
          if (wizardData.variations.length === 0) {
            stepErrors.variations = 'At least one variation is required for variable products';
          }
        }
        break;

      case 4: // Pricing
        if (!wizardData.regularPrice || parseFloat(wizardData.regularPrice) <= 0) {
          stepErrors.regularPrice = 'Valid regular price is required';
        }
        if (wizardData.manageStock && wizardData.stockQuantity < 0) {
          stepErrors.stockQuantity = 'Stock quantity cannot be negative';
        }
        break;

      case 5: // Images
        if (!wizardData.mainImage.trim()) {
          stepErrors.mainImage = 'Main product image is required';
        }
        break;

      case 6: // Categories (optional, no validation needed)
        break;

      case 7: // Additional Info (optional, no validation needed)
        break;

      case 8: // Review (final validation)
        // Re-validate all critical fields
        if (!wizardData.name.trim()) {
          stepErrors.name = 'Product name is required';
        }
        if (!wizardData.description.trim()) {
          stepErrors.description = 'Product description is required';
        }
        if (!wizardData.regularPrice || parseFloat(wizardData.regularPrice) <= 0) {
          stepErrors.regularPrice = 'Valid regular price is required';
        }
        if (!wizardData.mainImage.trim()) {
          stepErrors.mainImage = 'Main product image is required';
        }
        if (wizardData.productType === 'variable') {
          if (wizardData.attributes.length === 0) {
            stepErrors.attributes = 'At least one attribute is required';
          }
          if (wizardData.variations.length === 0) {
            stepErrors.variations = 'At least one variation is required';
          }
        }
        break;
    }

    setStepErrors(step, stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [wizardData, setStepErrors]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      // Skip steps 2 and 3 for simple products
      if (currentStep === 1 && wizardData.productType === 'simple') {
        setCurrentStep(4);
      } else if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
      }
    }
  }, [currentStep, wizardData.productType, validateStep]);

  const handlePrevious = useCallback(() => {
    // Skip steps 2 and 3 for simple products
    if (currentStep === 4 && wizardData.productType === 'simple') {
      setCurrentStep(1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, wizardData.productType]);

  const getVisibleStep = (): number => {
    if (wizardData.productType === 'simple') {
      if (currentStep <= 1) return 1;
      if (currentStep <= 3) return 4; // Skip 2 and 3
      return currentStep - 2; // Adjust for skipped steps
    }
    return currentStep;
  };

  const getTotalVisibleSteps = (): number => {
    return wizardData.productType === 'simple' ? TOTAL_STEPS - 2 : TOTAL_STEPS;
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const renderStep = () => {
    const stepErrors = errors[currentStep] || {};
    const commonProps = {
      data: wizardData,
      updateData: updateWizardData,
      errors: stepErrors,
      setErrors: (errs: Record<string, string>) => setStepErrors(currentStep, errs),
      currentTenantId,
    };

    switch (currentStep) {
      case 1:
        return <BasicInfoStep {...commonProps} />;
      case 2:
        return wizardData.productType === 'variable' ? (
          <AttributesStep {...commonProps} />
        ) : null;
      case 3:
        return wizardData.productType === 'variable' ? (
          <VariationsStep {...commonProps} />
        ) : null;
      case 4:
        return <PricingStep {...commonProps} />;
      case 5:
        return <ImagesStep {...commonProps} />;
      case 6:
        return <CategoriesStep {...commonProps} />;
      case 7:
        return <AdditionalInfoStep {...commonProps} />;
      case 8:
        return (
          <ReviewStep
            {...commonProps}
            onSuccess={onSuccess}
            currentTenantId={currentTenantId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {getVisibleStep()} of {getTotalVisibleSteps()}
          </span>
          <span className="text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {currentStep === 1 && 'Basic Information'}
              {currentStep === 2 && 'Product Attributes'}
              {currentStep === 3 && 'Product Variations'}
              {currentStep === 4 && 'Pricing & Inventory'}
              {currentStep === 5 && 'Product Images'}
              {currentStep === 6 && 'Categories & Tags'}
              {currentStep === 7 && 'Additional Information'}
              {currentStep === 8 && 'Review & Create'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentStep < TOTAL_STEPS && (
            <>
              <Button
                variant="outline"
                onClick={async () => {
                  // Save draft to localStorage
                  const draftKey = `product_draft_${currentTenantId}`;
                  localStorage.setItem(draftKey, JSON.stringify(wizardData));
                  alert('Draft saved! You can continue later.');
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
