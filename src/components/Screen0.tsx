import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, PlayCircle, RefreshCw } from 'lucide-react';

// Define the props type for Screen0
interface Screen0Props {
  loadFromSavedSession: () => void;
  startNewQuiz: () => void;
  openZipImportModal: () => void;
}

const Screen0: React.FC<Screen0Props> = ({ loadFromSavedSession, startNewQuiz, openZipImportModal }) => {
  return (
    <Card className="shadow-lg border-0 max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-3xl text-center">Choose how you'd like to start creating your quiz</CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6 text-base">
        <div className="space-y-4">
          <Button
            onClick={loadFromSavedSession}
            className="w-full h-16 md:h-16 min-h-[96px] md:min-h-[64px] text-left flex items-center gap-4 bg-green-600 hover:bg-green-700 text-white justify-start py-4 text-lg font-semibold"
            size="lg"
          >
            <PlayCircle className="h-7 w-7 flex-shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="font-semibold text-lg">Load Last Saved Session</div>
              <div className="text-base opacity-90 leading-tight break-words whitespace-normal">Continue from where you left off</div>
            </div>
          </Button>
          <Button
            onClick={startNewQuiz}
            className="w-full h-16 md:h-16 min-h-[96px] md:min-h-[64px] text-left flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white justify-start py-4 text-lg font-semibold"
            size="lg"
          >
            <RefreshCw className="h-7 w-7 flex-shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="font-semibold text-lg">Start New Quiz</div>
              <div className="text-base opacity-90 leading-tight break-words whitespace-normal">Begin with a fresh new quiz</div>
            </div>
          </Button>
          <Button
            onClick={openZipImportModal}
            className="w-full h-16 md:h-16 min-h-[96px] md:min-h-[64px] text-left flex items-center gap-4 bg-orange-600 hover:bg-orange-700 text-white justify-start py-4 text-lg font-semibold"
            size="lg"
          >
            <FileUp className="h-7 w-7 flex-shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="font-semibold text-lg">Import from ZIP</div>
              <div className="text-base opacity-90 leading-tight break-words whitespace-normal">Load one or multiple exported quizzes</div>
            </div>
          </Button>
          {/* PDF Manual Button */}
 
        </div>
        
        
      </CardContent>
    </Card>
  );
};

export default Screen0; 
