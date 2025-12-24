import { QuickSetupChat } from '../QuickSetupChat';
import { useQuickSetup } from '@/contexts/QuickSetupContext';

export const Step2AIQuestions = () => {
  const { sessionData, updateSessionData } = useQuickSetup();

  const handleComplete = (messages: any[]) => {
    // Extract Q&A pairs from messages
    const qaPairs = [];
    for (let i = 0; i < messages.length; i += 2) {
      if (messages[i]?.role === 'assistant' && messages[i + 1]?.role === 'user') {
        qaPairs.push({
          question: messages[i].content,
          answer: messages[i + 1].content,
        });
      }
    }
    
    updateSessionData({ ai_questions_answers: qaPairs });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Let's understand your business
        </h2>
        <p className="text-muted-foreground">
          Answer a few questions to help us create the perfect content strategy
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <QuickSetupChat
          websiteUrl={sessionData.website_url || ''}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
};
