import AssistantAudioVisualizer from './components/AssistantAudioVisualizer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#F7F5FF] to-[#E9E4FF]">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border border-[#E9E4FF]">
        <div className="text-center mb-8">
          <div className="inline-block p-2 bg-[#F7F5FF] rounded-full mb-4">
            <svg className="w-8 h-8 text-[#6B46C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-[#6B46C1] mb-4">
            Virtual Voice Bridge Demo
          </h1>
          
          <div className="bg-[#F7F5FF]/50 rounded-xl p-6 mb-6">
            <p className="text-[#6B46C1]/90 text-lg leading-relaxed">
              Asistanı kızdırmaya çalışın ve en yüksek puanı almaya çalışın! 
              Puanınızı görmek için bağlantıyı kesmeniz gerekiyor. 
              Ne kadar sinirlendirebilirsiniz?
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-[#6B46C1]/70">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Puanınızı görmek için "Bağlantıyı Kes" butonuna tıklayın</span>
          </div>
        </div>
        
        <div className="border-t border-[#E9E4FF] pt-8">
          <AssistantAudioVisualizer />
        </div>
      </div>
    </div>
  );
}
