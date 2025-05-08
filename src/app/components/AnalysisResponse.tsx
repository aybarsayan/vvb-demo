import React from 'react';

interface Score {
  [key: string]: number;
}

interface CategoryScores {
  [key: string]: Score;
}

interface NotableChallenge {
  metric_id: string;
  score: number;
  category: string;
  description: string;
}

interface KeyPhrase {
  text: string;
  impact_level: number;
  related_metric: string;
}

interface AnalysisData {
  scores: CategoryScores;
  overall_difficulty_index: number;
  difficulty_level: string;
  notable_challenges: NotableChallenge[];
  key_phrases: KeyPhrase[];
  transcript_analysis_summary: string;
}

interface AnalysisResponseProps {
  data?: AnalysisData;
  isVisible: boolean;
}

const AnalysisResponse: React.FC<AnalysisResponseProps> = ({ data, isVisible }) => {
  if (!isVisible || !data) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-700';
    if (score >= 60) return 'text-orange-700';
    if (score >= 40) return 'text-yellow-700';
    return 'text-green-700';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-red-100';
    if (score >= 60) return 'bg-orange-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  // Toplam puanı hesapla
  const calculateTotalScore = () => {
    let total = 0;
    Object.values(data.scores).forEach(category => {
      Object.entries(category).forEach(([key, score]) => {
        // category_average'ı hariç tut
        if (key !== 'category_average' && typeof score === 'number' && !isNaN(score)) {
          total += score;
        }
      });
    });
    return total;
  };

  const totalScore = calculateTotalScore();

  // Puan aralığına göre başlık ve resim belirle
  const getScoreInfo = (score: number) => {
    if (score >= 1600) {
      return {
        title: "Şeytan aradı, yarın işe başlamak ister misin diye soruyor",
        image: "foto6.jpg",
        color: "text-red-700",
        bgColor: "bg-red-100"
      };
    } else if (score >= 1300) {
      return {
        title: "Twitter hesabını görmek istiyorum, ama korkuyorum dehşete düşeceğim diye",
        image: "foto5.jpg",
        color: "text-orange-700",
        bgColor: "bg-orange-100"
      };
    } else if (score >= 1200) {
      return {
        title: "Sinir seni yönetiyor. Bunu sevdim.",
        image: "foto4.jpg",
        color: "text-yellow-700",
        bgColor: "bg-yellow-100"
      };
    } else if (score >= 1000) {
      return {
        title: "Sen var olmak sahip pontansiyel - Master Yoda",
        image: "foto3.jpg",
        color: "text-green-700",
        bgColor: "bg-green-100"
      };
    } else if (score >= 500) {
      return {
        title: "İçindeki çirkefliği çıkarmalısın",
        image: "foto2.jpg",
        color: "text-blue-700",
        bgColor: "bg-blue-100"
      };
    } else {
      return {
        title: "Aramıza hoşgeldin Ebubekir Sıddık Bebek",
        image: "foto1.jpg",
        color: "text-purple-700",
        bgColor: "bg-purple-100"
      };
    }
  };

  const scoreInfo = getScoreInfo(totalScore);

  // Kategori isimlerini Türkçeleştir
  const getCategoryName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'customer_emotional_state': 'Müşteri Duygusal Durumu',
      'customer_communication_style': 'Müşteri İletişim Tarzı',
      'issue_complexity': 'Sorun Kompleksitesi',
      'conversation_dynamics': 'Görüşme Dinamikleri',
      'assistant_difficulty_factors': 'Asistan Zorluk Faktörleri',
      'identity_verification_difficulty': 'Kimlik Doğrulama Zorluğu'
    };
    return categoryMap[category] || category;
  };

  // Metrik isimlerini Türkçeleştir
  const getMetricName = (metric: string) => {
    const metricMap: { [key: string]: string } = {
      'anger_level': 'Öfke Seviyesi',
      'impatience': 'Sabırsızlık',
      'frustration': 'Hayal Kırıklığı',
      'aggression': 'Saldırganlık',
      'clarity': 'Netlik',
      'message_length': 'Mesaj Uzunluğu',
      'response_pattern': 'Yanıt Şekli',
      'repetitive_complaints': 'Tekrarlanan Şikayetler',
      'technical_difficulty': 'Teknik Zorluk',
      'multiple_issues': 'Çoklu Sorunlar',
      'non_standard_requests': 'Standart Dışı İstekler',
      'previous_unresolved_cases': 'Önceki Çözülmemiş Durumlar',
      'conversation_length': 'Görüşme Uzunluğu',
      'off_topic': 'Konu Dışı',
      'stance_shifts': 'Tavır Değişimleri',
      'deadlocks': 'Çıkmazlar',
      'emotional_burden': 'Duygusal Yük',
      'resource_deficiency': 'Kaynak Eksikliği',
      'protocol_deviation': 'Protokol Sapması',
      'solution_impossibility': 'Çözüm İmkansızlığı',
      'information_lack': 'Bilgi Eksikliği',
      'authority_ambiguity': 'Yetki Belirsizliği',
      'verification_rejection': 'Doğrulama Reddi',
      'fraud_suspicion': 'Dolandırıcılık Şüphesi',
      'category_average': 'Kategori Ortalaması'
    };
    return metricMap[metric] || metric;
  };

  return (
    <div className="mt-4 bg-white rounded-lg shadow-sm p-4 border border-[#E9E4FF]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#6B46C1] mb-2">Analiz Sonuçları</h2>
        
        {/* Toplam Puan ve Başlık Bölümü */}
        <div className="flex flex-col items-center gap-4 bg-[#F7F5FF]/30 rounded-lg p-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-[#6B46C1] mb-2">Toplam Puan</h3>
            <div className="text-4xl font-bold mb-2 text-[#6B46C1]">{totalScore}</div>
            <div className="text-sm text-gray-500">Maksimum: 3000</div>
          </div>
          
          <div className="w-48">
            <img 
              src={scoreInfo.image} 
              alt="Puan seviyesi" 
              className="w-full h-auto object-contain"
            />
          </div>
          
          <div className={`text-center px-4 py-2 rounded-lg ${scoreInfo.bgColor}`}>
            <p className={`font-medium ${scoreInfo.color}`}>{scoreInfo.title}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">Zorluk Seviyesi:</span>
          <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreBackground(data.overall_difficulty_index)} ${getScoreColor(data.overall_difficulty_index)}`}>
            {data.difficulty_level}
          </span>
        </div> 
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(data.scores).map(([category, scores]) => (
          <div key={category} className="bg-[#F7F5FF]/30 rounded-lg p-3">
            <h3 className="text-sm font-medium text-[#6B46C1] mb-2">
              {getCategoryName(category)}
            </h3>
            <div className="space-y-2">
              {Object.entries(scores).map(([metric, score]) => (
                <div key={metric} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {getMetricName(metric)}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getScoreBackground(score)}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                      {score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {data.notable_challenges && data.notable_challenges.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-[#6B46C1] mb-2">Önemli Zorluklar</h3>
          <div className="space-y-2">
            {data.notable_challenges.map((challenge, index) => (
              <div key={index} className="flex items-start gap-2 bg-[#F7F5FF]/30 rounded-lg p-2">
                <span className="text-red-500">⚠️</span>
                <div>
                  <p className="text-sm text-gray-700">{challenge.description}</p>
                  <p className="text-xs text-gray-500">{getCategoryName(challenge.category)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.key_phrases && data.key_phrases.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-[#6B46C1] mb-2">Anahtar İfadeler</h3>
          <div className="flex flex-wrap gap-2">
            {data.key_phrases.map((phrase, index) => (
              <div 
                key={index}
                className="relative group"
              >
                <div className="px-3 py-1 bg-[#F7F5FF] rounded-full text-sm text-[#6B46C1] cursor-help">
                  {phrase.text}
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                  <div className="bg-[#6B46C1] text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    Etki Seviyesi: {phrase.impact_level}
                  </div>
                  <div className="w-2 h-2 bg-[#6B46C1] transform rotate-45 absolute left-1/2 -bottom-1 -translate-x-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.transcript_analysis_summary && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-[#6B46C1] mb-2">Özet</h3>
          <p className="text-sm text-gray-700 bg-[#F7F5FF]/30 rounded-lg p-3">
            {data.transcript_analysis_summary}
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalysisResponse; 