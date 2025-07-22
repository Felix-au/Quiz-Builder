import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUp, PlayCircle, RefreshCw, Mail } from 'lucide-react';

// Define the props type for Screen0
interface Screen0Props {
  loadFromSavedSession: () => void;
  startNewQuiz: () => void;
  importFromZip: (file: File) => void;
  importFromMultipleZips: (files: FileList) => void;
}

const Screen0: React.FC<Screen0Props> = ({ loadFromSavedSession, startNewQuiz, importFromZip, importFromMultipleZips }) => {
  return (
    <Card className="shadow-lg border-0 max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl text-center">Choose how you'd like to start creating your quiz</CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="space-y-4">
          <Button
            onClick={loadFromSavedSession}
            className="w-full h-16 md:h-16 min-h-[96px] md:min-h-[64px] text-left flex items-center gap-4 bg-green-600 hover:bg-green-700 text-white justify-start py-4"
            size="lg"
          >
            <PlayCircle className="h-6 w-6 flex-shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="font-semibold">Load Last Saved Session</div>
              <div className="text-sm opacity-90 leading-tight break-words whitespace-normal">Continue from where you left off</div>
            </div>
          </Button>
          <Button
            onClick={startNewQuiz}
            className="w-full h-16 md:h-16 min-h-[96px] md:min-h-[64px] text-left flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white justify-start py-4"
            size="lg"
          >
            <RefreshCw className="h-6 w-6 flex-shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="font-semibold">Start New Quiz</div>
              <div className="text-sm opacity-90 leading-tight break-words whitespace-normal">Begin with a fresh new quiz</div>
            </div>
          </Button>
          <div className="relative">
            <Input
              type="file"
              accept=".zip"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  if (files.length === 1) {
                    importFromZip(files[0]);
                  } else {
                    importFromMultipleZips(files);
                  }
                }
              }}
              className="hidden"
              id="import-zip"
            />
            <Label htmlFor="import-zip" className="cursor-pointer">
              <Button
                asChild
                className="w-full h-16 md:h-16 min-h-[96px] md:min-h-[64px] text-left flex items-center gap-4 bg-orange-600 hover:bg-orange-700 text-white justify-start py-4"
                size="lg"
              >
                <div>
                  <FileUp className="h-6 w-6 flex-shrink-0" />
                  <div className="flex flex-col justify-center">
                    <div className="font-semibold">Import from ZIP</div>
                    <div className="text-sm opacity-90 leading-tight break-words whitespace-normal">Load one or multiple exported quizzes</div>
                  </div>
                </div>
              </Button>
            </Label>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-8">
          Select an option above to begin creating your quiz
        </div>
        <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-200">
          <p>© Copyrighted by CAD-CS, BML Munjal University</p>
          <p><Mail className="inline-block w-4 h-4 mr-1 -mt-1 align-middle text-gray-500" /> : <a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Screen0; 