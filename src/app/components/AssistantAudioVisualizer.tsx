'use client';

import { useState, useEffect, useRef } from 'react';
import './AssistantAudioVisualizer.css';
import AnalysisResponse from './AnalysisResponse';
import LoadingOverlay from './LoadingOverlay';

interface AudioVisualizerProps {
  flowName?: string;
  assistantId?: number; // Asistan ID'si için prop
}

// AudioContext tipi tanımlaması
interface AudioContextConstructor {
  new (options?: AudioContextOptions): AudioContext;
}

// window.webkitAudioContext için tip tanımı
declare global {
  interface Window {
    webkitAudioContext?: AudioContextConstructor;
  }
}

const mockAnalysisData = {
  "analysis_timestamp": "2023-10-09T12:00:00Z",
  "scores": {
    "customer_emotional_state": {
      "anger_level": 90,
      "impatience": 85,
      "frustration": 80,
      "aggression": 70,
      "category_average": 81
    },
    "customer_communication_style": {
      "clarity": 50,
      "message_length": 60,
      "response_pattern": 70,
      "repetitive_complaints": 80,
      "category_average": 65
    },
    "issue_complexity": {
      "technical_difficulty": 70,
      "multiple_issues": 40,
      "non_standard_requests": 50,
      "previous_unresolved_cases": 30,
      "category_average": 47
    },
    "conversation_dynamics": {
      "conversation_length": 75,
      "off_topic": 20,
      "stance_shifts": 60,
      "deadlocks": 50,
      "category_average": 51
    },
    "assistant_difficulty_factors": {
      "emotional_burden": 80,
      "resource_deficiency": 40,
      "protocol_deviation": 50,
      "solution_impossibility": 60,
      "category_average": 57
    },
    "identity_verification_difficulty": {
      "information_lack": 20,
      "authority_ambiguity": 60,
      "verification_rejection": 30,
      "fraud_suspicion": 10,
      "category_average": 30
    }
  },
  "overall_difficulty_index": 78,
  "difficulty_level": "Yüksek Zorlayıcı",
  "notable_challenges": [
    {
      "metric_id": "customer_emotional_state.anger_level",
      "score": 90,
      "category": "Müşteri Duygusal Durumu",
      "description": "Müşteri yüksek öfke seviyesi gösteriyor."
    },
    {
      "metric_id": "customer_communication_style.repetitive_complaints",
      "score": 80,
      "category": "Müşteri İletişim Tarzı",
      "description": "Müşterinin sürekli tekrarlanan şikayetleri var."
    },
    {
      "metric_id": "issue_complexity.technical_difficulty",
      "score": 70,
      "category": "Sorun Kompleksitesi",
      "description": "Fatura ile ilgili sorun teknik bir karmaşıklık içeriyor."
    },
    {
      "metric_id": "conversation_dynamics.conversation_length",
      "score": 75,
      "category": "Görüşme Dinamikleri",
      "description": "Konuşma uzunluğu idealden fazla, müşteri şikayetlerini uzun bir süre dile getiriyor."
    },
    {
      "metric_id": "assistant_difficulty_factors.emotional_burden",
      "score": 80,
      "category": "Asistan Zorluğu",
      "description": "Asistan için yüksek duygusal yüke neden olan bir durum."
    }
  ],
  "key_phrases": [
    {
      "text": "BU NE REZALET!",
      "impact_level": 80,
      "related_metric": "customer_emotional_state.anger_level"
    },
    {
      "text": "VER ŞU FATURAYI!",
      "impact_level": 75,
      "related_metric": "customer_communication_style.repetitive_complaints"
    },
    {
      "text": "DERHAL O ÜCRETİ İPTAL EDİN!",
      "impact_level": 85,
      "related_metric": "customer_emotional_state.impatience"
    },
    {
      "text": "HEMEN O İNCELEMEYİ BAŞLATIN!",
      "impact_level": 80,
      "related_metric": "customer_emotional_state.frustration"
    },
    {
      "text": "İNSAN KOYUN ŞURAYA İNSAN!",
      "impact_level": 90,
      "related_metric": "customer_emotional_state.aggression"
    }
  ],
  "transcript_analysis_summary": "Müşteri, fatura ile ilgili yüksek öfke ve sabırsızlık gösteriyor. Faturanın detaylarından memnun kalmadığını, özellikle nakil ücreti konusunda ciddi bir itirazı olduğu anlaşılıyor. İletişim tarzı karışık ve tekrar eden şikayetler var. Asistan, bu durumu yatıştırmaya çalışsa da müşteri tarafından yeterli bir tatmin sağlanamamış."
};

const AssistantAudioVisualizer = ({ flowName: initialFlowName = "" }: AudioVisualizerProps) => {
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('Bağlı Değil');
  const [callId, setCallId] = useState('');
  const [waveIntensity, setWaveIntensity] = useState(0);
  const [isUserMessage, setIsUserMessage] = useState(false);
  const [flowName, setFlowName] = useState(initialFlowName);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // WebSocket ve Ses işleme için referanslar
  const websocketRef = useRef<WebSocket | null>(null);
  const audioContextSenderRef = useRef<AudioContext | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioContextReceiverRef = useRef<AudioContext | null>(null);
  const nextPlaybackTimeRef = useRef<number>(0);
  const audioBufferQueueRef = useRef<Float32Array[]>([]);
  const activeAudioSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const sendQueueRef = useRef<ArrayBuffer[]>([]);
  const isSendingRef = useRef<boolean>(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Sabitler
  const BUFFER_SIZE = 4096; // bytes
  const SAMPLE_RATE = 16000; // 16kHz
  const SAMPLE_RATE_RECEIVER = 16000;
  const BYTES_PER_SAMPLE = 2; // 16-bit
  const CHANNELS = 1; // Mono
  const MIN_BUFFER_SECONDS = 0.01; // Minimum tampon süresi
  const FFT_SIZE = 2048; // Ses analizi için FFT boyutu

  // Mobil cihaz kontrolü
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /iPhone|iPad|iPod|Android/i;
      setIsMobile(mobileRegex.test(userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Flow name prop değiştiğinde state'i güncelle
  useEffect(() => {
    if (initialFlowName) {
      setFlowName(initialFlowName);
      console.log(`Flow adı prop'tan alındı: ${initialFlowName}`);
    }
  }, [initialFlowName]);

  // WebSocket'e veri göndermek için sıraya ekleme
  const enqueueSend = (data: ArrayBuffer) => {
    sendQueueRef.current.push(data);
    processSendQueue();
  };

  // Sıradaki verileri işleme
  const processSendQueue = () => {
    if (isSendingRef.current) return;
    if (sendQueueRef.current.length === 0) return;
    if (websocketRef.current?.readyState !== WebSocket.OPEN) return;

    isSendingRef.current = true;
    const data = sendQueueRef.current.shift();

    if (data) {
      websocketRef.current.send(data);
    }

    setTimeout(() => {
      isSendingRef.current = false;
      processSendQueue();
    }, 0);
  };

  // Float32 ses verilerini 16-bit PCM'e dönüştürme
  const floatTo16BitPCM = (floatSamples: Float32Array) => {
    const buffer = new ArrayBuffer(floatSamples.length * BYTES_PER_SAMPLE);
    const view = new DataView(buffer);
    for (let i = 0; i < floatSamples.length; i++) {
      let s = Math.max(-1, Math.min(1, floatSamples[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7FFF;
      view.setInt16(i * BYTES_PER_SAMPLE, s, true); // littleEndian
    }
    return buffer;
  };

  // Int16 ses verilerini Float32'ye dönüştürme
  const int16ToFloat32 = (int16Array: Int16Array) => {
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }
    return float32Array;
  };

  // Gelen ses verilerini sıraya ekleme
  const enqueueAudio = (float32Array: Float32Array) => {
    if (!audioContextReceiverRef.current) return;

    if (float32Array.length === 0) {
      console.warn('Boş Float32Array eklenmeye çalışıldı.');
      return;
    }

    audioBufferQueueRef.current.push(float32Array);
    
    // Ses verileri geldiğinde AI'ın konuştuğunu belirtme
    setIsAISpeaking(true);
    setWaveIntensity(100);

    // Toplam tamponlanan süreyi hesaplama
    let totalBufferedSeconds = 0;
    audioBufferQueueRef.current.forEach(buffer => {
      totalBufferedSeconds += buffer.length / SAMPLE_RATE_RECEIVER;
    });

    console.log(`Tampon boyutu: ${totalBufferedSeconds.toFixed(2)} saniye`);

    // Tampon minimum eşiği geçerse işleme başla
    if (totalBufferedSeconds >= MIN_BUFFER_SECONDS) {
      processAudioBuffer();
    }
  };

  // Ses analizi için animasyon döngüsü
  const updateWaveform = () => {
    if (!analyserRef.current || !isAISpeaking) {
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
      return;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Ses seviyesini hesapla (0-100 arası)
    const bassFrequencies = dataArray.slice(0, 20);
    const midFrequencies = dataArray.slice(20, 100);
    const highFrequencies = dataArray.slice(100);

    const bassAverage = bassFrequencies.reduce((a, b) => a + b) / bassFrequencies.length;
    const midAverage = midFrequencies.reduce((a, b) => a + b) / midFrequencies.length;
    const highAverage = highFrequencies.reduce((a, b) => a + b) / highFrequencies.length;

    // Farklı frekans bantlarını ağırlıklandır
    const weightedAverage = (bassAverage * 2 + midAverage * 1.5 + highAverage) / 4.5;
    const rawIntensity = (weightedAverage / 16) * 100;
    const smoothedIntensity = Math.max(5, Math.min(100, rawIntensity));
    
    setWaveIntensity(smoothedIntensity);
    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  };

  // Ses tamponunu işleme
  const processAudioBuffer = () => {
    while (audioBufferQueueRef.current.length > 0) {
      const buffer = audioBufferQueueRef.current.shift();
      if (!buffer || !audioContextReceiverRef.current) continue;

      const duration = buffer.length / SAMPLE_RATE_RECEIVER;
      const currentTime = audioContextReceiverRef.current.currentTime;
      
      if (nextPlaybackTimeRef.current < currentTime + 0.01) {
        nextPlaybackTimeRef.current = currentTime + 0.01;
      }

      const audioBuffer = audioContextReceiverRef.current.createBuffer(1, buffer.length, SAMPLE_RATE_RECEIVER);
      audioBuffer.copyToChannel(buffer, 0, 0);

      const source = audioContextReceiverRef.current.createBufferSource();
      source.buffer = audioBuffer;

      // Ses analizi için bağlantıları kur
      if (analyserRef.current) {
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextReceiverRef.current.destination);
      } else {
        source.connect(audioContextReceiverRef.current.destination);
      }

      try {
        source.start(nextPlaybackTimeRef.current);
      } catch (e) {
        console.error('Ses kaynağını başlatırken hata:', e);
        continue;
      }

      activeAudioSourcesRef.current.push(source);

      source.onended = () => {
        const index = activeAudioSourcesRef.current.indexOf(source);
        if (index > -1) {
          activeAudioSourcesRef.current.splice(index, 1);
        }
        if (activeAudioSourcesRef.current.length === 0 && audioBufferQueueRef.current.length === 0) {
          setIsAISpeaking(false);
          setWaveIntensity(0);
        }
      };

      nextPlaybackTimeRef.current += duration;
    }
  };

  // Ses oynatıcıyı sıfırlama
  const resetPlayer = () => {
    console.log('Ses oynatıcı sıfırlanıyor...');

    // Tüm aktif ses kaynaklarını durdur
    activeAudioSourcesRef.current.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        console.warn('Kaynağı durdururken hata:', e);
      }
    });

    // Aktif kaynaklar listesini temizle
    activeAudioSourcesRef.current = [];

    // Ses tampon sırasını temizle
    audioBufferQueueRef.current = [];

    // Oynatma zamanını sıfırla
    if (audioContextReceiverRef.current) {
      nextPlaybackTimeRef.current = audioContextReceiverRef.current.currentTime + 0.01;
    }

    // AI konuşma durumunu güncelle
    setIsAISpeaking(false);
    setWaveIntensity(0);
    
    // Mesajı temizle
    setMessage('');
    setIsUserMessage(false);
  };

  // Ses alıcıyı hazırlama
  const setupAudioReceiver = () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContextReceiverRef.current = new AudioCtx({
      sampleRate: SAMPLE_RATE_RECEIVER
    });

    // AnalyserNode oluştur
    analyserRef.current = audioContextReceiverRef.current.createAnalyser();
    analyserRef.current.fftSize = FFT_SIZE;
    analyserRef.current.smoothingTimeConstant = 0.2;

    nextPlaybackTimeRef.current = audioContextReceiverRef.current.currentTime + 0.01;

    if (websocketRef.current) {
      websocketRef.current.onmessage = (event) => {
        if (typeof event.data === 'string') {
          // Metin mesajlarını işle
          console.log(`Metin mesajı alındı: ${event.data}`);
          
          // Call ID'yi kontrol et - çeşitli formatları destekle
          const data = event.data.trim();
          
          if (data.toLowerCase().includes('callid:') || 
              data.toLowerCase().includes('call id:') || 
              data.toLowerCase().includes('call_id:')) {
            
            // Metinden ID'yi çıkar
            let id = '';
            if (data.includes(':')) {
              id = data.split(':')[1].trim();
            } else {
              id = data.trim();
            }
            
            console.log(`Call ID yakalandı: ${id}`);
            if (id) {
              setCallId(id);
            }
          } else if (data === 'clear') {
            resetPlayer();
          } else if (data.startsWith("İnsan:") || data.startsWith("Human:") || data.startsWith("Kullanıcı:")) {
            // Kullanıcının kendi konuşmasını gösterme
            setIsUserMessage(true);
          } else {
            // Sadece asistanın yanıtlarını göster
            if (!isUserMessage) {
              //setMessage(data);
            }
            setIsUserMessage(false);
          }
        } else if (event.data instanceof ArrayBuffer) {
          const arrayBuffer = event.data;
          if (!arrayBuffer || arrayBuffer.byteLength === 0) return;

          const int16Array = new Int16Array(arrayBuffer);
          if (int16Array.length === 0) return;

          const float32Array = int16ToFloat32(int16Array);
          if (float32Array.length === 0) return;

          enqueueAudio(float32Array);
        } else {
          console.warn('Desteklenmeyen mesaj türü alındı.');
        }
      };
    }
  };

  // Kaynakları temizleme
  const cleanup = () => {
    // Oynatıcıyı sıfırla
    resetPlayer();
    
    // Call ID'yi sıfırla
    setCallId('');

    // Göndericinin ses bağlamını temizle
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current = null;
    }
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
    if (audioContextSenderRef.current) {
      audioContextSenderRef.current.close();
      audioContextSenderRef.current = null;
    }

    // Alıcının ses bağlamını temizle
    if (audioContextReceiverRef.current) {
      audioContextReceiverRef.current.close();
      audioContextReceiverRef.current = null;
      nextPlaybackTimeRef.current = 0;
      audioBufferQueueRef.current = [];
    }

    // Mesajı temizle
    setMessage('');
    setIsUserMessage(false);
  };

  const fetchCallDetails = async (id: string) => {
    console.log('Analiz verisi çekme başladı, Call ID:', id);
    setIsLoading(true);
    let retryCount = 0;
    const maxRetries = 20;
    const retryDelay = 2000; // 2 saniye

    const tryFetch = async () => {
      try {
        console.log(`API çağrısı yapılıyor... Deneme: ${retryCount + 1}/${maxRetries}`);
        const response = await fetch(`/api/call-detail?callId=${id}`);
        console.log('API yanıt durumu:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API yanıtı alındı:', data);
          
          if (data.callInfo && data.callInfo.resultData) {
            console.log('Analiz verisi bulundu:', data.callInfo.resultData);
            setAnalysisData(data.callInfo.resultData);
            setIsLoading(false);
            return true;
          } else {
            console.warn('API yanıtında resultData bulunamadı:', data);
            return false;
          }
        } else {
          console.error('API yanıtı başarısız:', response.status);
          return false;
        }
      } catch (error) {
        console.error('Veri çekme hatası:', error);
        return false;
      }
    };

    while (retryCount < maxRetries) {
      console.log(`Deneme ${retryCount + 1}/${maxRetries} başlıyor...`);
      const success = await tryFetch();
      
      if (success) {
        console.log('Veri başarıyla alındı');
        break;
      }

      retryCount++;
      if (retryCount < maxRetries) {
        console.log(`${retryDelay}ms sonra tekrar denenecek...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    if (retryCount === maxRetries) {
      console.error('Maksimum deneme sayısına ulaşıldı, veri alınamadı');
      setIsLoading(false);
    }
  };

  // WebSocket bağlantısını kurma
  const connect = async () => {
    try {
      setPermissionError(null);
      
      if (websocketRef.current) {
        disconnect();
      }

      // Mobil cihazlar için özel işlem
      if (isMobile) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              channelCount: 1,
              sampleRate: SAMPLE_RATE
            } 
          });
          stream.getTracks().forEach(track => track.stop());
        } catch (err) {
          console.error('Mikrofon izni alınamadı:', err);
          setPermissionError('Mikrofon erişimi reddedildi. Lütfen tarayıcı ayarlarından mikrofon iznini etkinleştirin.');
          return;
        }
      }

      const currentFlowName = flowName || 'demo';
      websocketRef.current = new WebSocket(`wss://duplexdev.virtualvoicebridge.com/ws?flowName=sirket-ici-demo`);
      websocketRef.current.binaryType = 'arraybuffer';

      websocketRef.current.onopen = async () => {
        console.log('WebSocket Bağlantısı Kuruldu');
        setStatus('Bağlandı');
        setIsConnected(true);

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContextSenderRef.current = new AudioCtx({
          sampleRate: SAMPLE_RATE,
          latencyHint: isMobile ? 'interactive' : 'playback'
        });

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              channelCount: 1,
              sampleRate: SAMPLE_RATE
            } 
          });
          
          microphoneRef.current = audioContextSenderRef.current.createMediaStreamSource(stream);
          const bufferSizeInSamples = BUFFER_SIZE / BYTES_PER_SAMPLE / CHANNELS;
          scriptProcessorRef.current = audioContextSenderRef.current.createScriptProcessor(bufferSizeInSamples, CHANNELS, CHANNELS);

          microphoneRef.current.connect(scriptProcessorRef.current);
          scriptProcessorRef.current.connect(audioContextSenderRef.current.destination);

          scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
            const inputBuffer = audioProcessingEvent.inputBuffer;
            const inputData = inputBuffer.getChannelData(0);
            const pcmBuffer = floatTo16BitPCM(inputData);
            if (pcmBuffer.byteLength > 0) {
              enqueueSend(pcmBuffer);
            }
          };

          await setupAudioReceiver();
        } catch (err) {
          console.error('Mikrofon erişiminde hata:', err);
          setStatus('Mikrofon Hatası');
          setPermissionError('Mikrofon erişimi sağlanamadı. Lütfen tarayıcı ayarlarınızı kontrol edin.');
        }
      };

      websocketRef.current.onclose = () => {
        console.log('WebSocket Bağlantısı Kesildi');
        setStatus('Bağlantı Kesildi');
        setIsConnected(false);
        cleanup();
      };

      websocketRef.current.onerror = (error) => {
        console.error('WebSocket Hatası:', error);
        setStatus('Hata');
      };
    } catch (err) {
      console.error('Bağlantı Hatası:', err);
      setStatus('Bağlantı Başarısız');
      setPermissionError('Bağlantı kurulamadı. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.');
    }
  };

  // WebSocket bağlantısını kesme
  const disconnect = async () => {
    console.log('Bağlantı kesiliyor...');
    if (websocketRef.current) {
      websocketRef.current.close();
    }
    cleanup();
    setStatus('Bağlantı Kesildi');
    setIsConnected(false);
    
    if (callId) {
      console.log('Call ID mevcut, analiz verisi çekilecek:', callId);
      setShowAnalysis(true);
      await fetchCallDetails(callId);
    } else {
      console.warn('Call ID bulunamadı, analiz verisi çekilemeyecek');
    }
  };

  // Bağlantı durumunu değiştirme
  const toggleConnection = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect();
    }
  };

  // AI konuşuyorsa dalgaları aktifleştir
  useEffect(() => {
    if (isAISpeaking) {
      updateWaveform();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setWaveIntensity(0);
    }
  }, [isAISpeaking]);

  // Component unmount olduğunda bağlantıyı temizleme
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      cleanup();
    };
  }, []);
  
  return (
    <div className="bg-[#F7F5FF]/30 rounded-lg p-3 shadow-inner">
      <LoadingOverlay isVisible={isLoading} />
      
      {permissionError && (
        <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {permissionError}
        </div>
      )}
      
      <div className="controls-section bg-white rounded-lg shadow-sm p-3 border border-[#E9E4FF]">
        <button 
          onClick={toggleConnection}
          className={`w-full transition-all duration-300 shadow-sm hover:shadow ${isConnected ? "connected-button" : "hover:bg-[#F7F5FF] hover:text-[#8B64E1]"}`}
        >
          {isConnected ? "Bağlantıyı Kes" : "Bağlan"}
        </button>
        
        <div className="connection-status mt-2">
          <p className="status-info">
            Durum: <span className={`status-${status.toLowerCase().replace(/\s+/g, '-')}`}>{status}</span>
          </p>
          
          <p className="instructions text-[#6B46C1]/80">
            {isConnected ? "Şu anda ses alışverişi aktif" : "Bağlan butonuna basarak görüşmeyi başlatın"}
          </p>
          
          {isConnected && (
            <p className="websocket-info text-[#6B46C1]/80">
              Bağlı olduğunuz asistan: <span className="font-medium">{flowName}</span>
            </p>
          )}
        </div>
      </div>
      
      <div className="visualizer-section mt-3 bg-white rounded-lg shadow-sm p-3 border border-[#E9E4FF]">
        <div className="audio-visualizer-container py-0">
          <div className="wave-container">
            <div className={`center-circle ${isAISpeaking ? 'speaking' : ''}`} />
            
            <div className={`wave wave1 ${isAISpeaking ? 'animate' : ''}`} 
              style={{ opacity: waveIntensity > 0 ? 0.8 : 0 }} />
              
            <div className={`wave wave2 ${isAISpeaking ? 'animate' : ''}`}
              style={{ opacity: waveIntensity > 20 ? 0.6 : 0 }} />
              
            <div className={`wave wave3 ${isAISpeaking ? 'animate' : ''}`}
              style={{ opacity: waveIntensity > 40 ? 0.4 : 0 }} />
              
            <div className={`wave wave4 ${isAISpeaking ? 'animate' : ''}`}
              style={{ opacity: waveIntensity > 60 ? 0.2 : 0 }} />
          </div>
        </div>
        
        {callId && (
          <div className="call-id-box mb-2 shadow-sm text-sm">
            <span className="font-semibold">Call ID:</span> {callId}
          </div>
        )}
        
        {message && !isUserMessage && (
          <div className="message-box border-[#E9E4FF] shadow-sm bg-[#F7F5FF]/50 text-[#6B46C1] text-sm">
            {message}
          </div>
        )}
      </div>
      
      <div className="mt-2 text-center text-[#6B46C1]/70 text-xs font-medium bg-white rounded-lg shadow-sm p-1 border border-[#E9E4FF]">
        Konuşmak için bağlantıyı başlatın ve mikrofon erişimine izin verin
      </div>

      <AnalysisResponse 
        data={analysisData}
        isVisible={showAnalysis}
      />
    </div>
  );
};

export default AssistantAudioVisualizer; 