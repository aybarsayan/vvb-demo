'use client';

import { useState, useEffect } from 'react';
import AnalysisResponse from '../components/AnalysisResponse';

export default function TestPage() {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/call-detail?callId=1913');
        if (response.ok) {
          const data = await response.json();
          if (data.callInfo && data.callInfo.resultData) {
            setAnalysisData(data.callInfo.resultData);
          }
        }
      } catch (error) {
        console.error('Veri çekme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#F7F5FF] to-[#E9E4FF]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6B46C1] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-[#F7F5FF] to-[#E9E4FF]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#6B46C1] mb-4">Test Sayfası - Call ID: 1913</h1>
        <AnalysisResponse 
          data={analysisData}
          isVisible={true}
        />
      </div>
    </div>
  );
} 