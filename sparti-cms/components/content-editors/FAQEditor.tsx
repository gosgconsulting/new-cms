import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export interface FAQItem {
  key: string;
  type?: string;
  question: string;
  answer: string;
}

interface FAQEditorProps {
  items?: FAQItem[];
  onChange?: (items: FAQItem[]) => void;
  className?: string;
}

export const FAQEditor: React.FC<FAQEditorProps> = ({
  items = [],
  onChange,
  className = ''
}) => {
  // Use provided items directly without adding default items
  const [faqs, setFaqs] = useState<FAQItem[]>(items);

  const handleQuestionChange = (index: number, question: string) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index] = { ...updatedFaqs[index], question };
    setFaqs(updatedFaqs);
    onChange?.(updatedFaqs);
  };

  const handleAnswerChange = (index: number, answer: string) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index] = { ...updatedFaqs[index], answer };
    setFaqs(updatedFaqs);
    onChange?.(updatedFaqs);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div 
            key={faq.key} 
            className="border border-gray-200 rounded-md overflow-hidden bg-white p-4"
          >
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <input
                type="text"
                value={faq.question}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                placeholder="Enter question"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
              <textarea
                value={faq.answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder="Enter answer"
                rows={4}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQEditor;
