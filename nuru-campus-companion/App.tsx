import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Menu,
  X,
  Sparkles,
  Info,
  Code,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { SYSTEM_INSTRUCTION } from './constants';
import { decode, decodeAudioData, createPcmBlob } from './utils/audioUtils';
import Visualizer from './components/Visualizer';
import { useEtherealSound } from './hooks/useEtherealSound';
import { ConnectionState } from './types';

const App: React.FC = () => {
  // State
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Audio Hooks
  useEtherealSound(connectionState === 'connected');

  // Refs for Audio Handling
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null); 
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isConnectedRef = useRef<boolean>(false);

  const ensureAudioContext = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000, // Attempt 16k
      });
    }
    
    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (e) {
        console.warn("Audio context resume failed:", e);
      }
    }

    if (!outputAudioContextRef.current) {
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
    }
    if (outputAudioContextRef.current.state === 'suspended') {
        try {
            await outputAudioContextRef.current.resume();
        } catch (e) {
            console.warn("Output context resume failed:", e);
        }
    }
  };

  const connectToGemini = async () => {
    if (connectionState === 'connecting' || connectionState === 'connected') return;

    try {
      setConnectionState('connecting');
      setErrorMsg(null);
      await ensureAudioContext();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      };

      const inputCtx = audioContextRef.current!;
      const source = inputCtx.createMediaStreamSource(stream);
      
      const processor = inputCtx.createScriptProcessor(2048, 1, 1);
      inputProcessorRef.current = processor;

      const sessionPromise = ai.live.connect({
        ...config,
        callbacks: {
          onopen: () => {
            console.log("Session Opened");
            setConnectionState('connected');
            isConnectedRef.current = true;
            
            processor.onaudioprocess = (e) => {
              if (isMicMuted || !isConnectedRef.current) return;
              
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData, inputCtx.sampleRate);
              
              sessionPromise.then(session => {
                try {
                   session.sendRealtimeInput({ media: pcmBlob });
                } catch (e) {
                   console.error("Error sending audio input:", e);
                }
              }).catch(e => {
                  console.error("Session promise failed:", e);
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              setAiSpeaking(true);
              
              if (!outputAudioContextRef.current) {
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
              }
              const outputCtx = outputAudioContextRef.current;
              
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputCtx,
                24000,
                1
              );

              const sourceNode = outputCtx.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(outputCtx.destination);
              
              // Schedule next chunk
              const currentTime = outputCtx.currentTime;
              // Ensure we don't schedule in the past, but allow a tiny overlap to prevent gaps
              if (nextStartTimeRef.current < currentTime) {
                  nextStartTimeRef.current = currentTime;
              }

              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              
              audioSourcesRef.current.add(sourceNode);

              sourceNode.addEventListener('ended', () => {
                audioSourcesRef.current.delete(sourceNode);
                if (audioSourcesRef.current.size === 0) {
                  setTimeout(() => {
                      if (audioSourcesRef.current.size === 0) {
                          setAiSpeaking(false);
                      }
                  }, 200); // Slight buffer before declaring silence
                }
              });
            }

            if (msg.serverContent?.interrupted) {
              // Immediately stop audio if the server detects interruption
              audioSourcesRef.current.forEach(src => {
                  try { src.stop(); } catch(e) {}
              });
              audioSourcesRef.current.clear();
              setAiSpeaking(false);
              // Reset the timing cursor so new audio starts immediately
              if (outputAudioContextRef.current) {
                  nextStartTimeRef.current = outputAudioContextRef.current.currentTime;
              }
            }
          },
          onclose: () => {
            console.log("Session Closed");
            setConnectionState('disconnected');
            isConnectedRef.current = false;
          },
          onerror: (err) => {
            console.error("Session Error", err);
            setConnectionState('error');
            isConnectedRef.current = false;
            setErrorMsg("Connection error. Please try again.");
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (error) {
      console.error("Connection failed", error);
      setConnectionState('error');
      isConnectedRef.current = false;
      setErrorMsg("Failed to access microphone or connect.");
    }
  };

  const disconnectSession = () => {
    isConnectedRef.current = false;

    if (sessionRef.current) {
        sessionRef.current.then((session: any) => {
            if(session.close) session.close();
        }).catch(() => {});
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    if (inputProcessorRef.current) {
      inputProcessorRef.current.disconnect();
      inputProcessorRef.current = null;
    }

    audioSourcesRef.current.forEach(src => {
        try { src.stop(); } catch(e) {}
    });
    audioSourcesRef.current.clear();
    
    setConnectionState('disconnected');
    setAiSpeaking(false);
    setErrorMsg(null);
  };

  const toggleMic = () => {
    setIsMicMuted(!isMicMuted);
  };

  useEffect(() => {
    return () => {
        disconnectSession();
    };
  }, []);

  return (
    <div className="h-screen w-screen relative overflow-hidden flex flex-col items-center justify-center text-white selection:bg-white/30">
      
      {/* Background Aurora */}
      <div 
        className={`aurora-container transition-all duration-[2000ms] ease-in-out ${
            aiSpeaking ? 'opacity-80 saturate-150 brightness-110 scale-105' : 'opacity-40 saturate-100 brightness-100 scale-100'
        }`}
      >
          <div className="aurora-blob blob-1"></div>
          <div className="aurora-blob blob-2"></div>
          <div className="aurora-blob blob-3"></div>
      </div>

      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-[1500ms] bg-[radial-gradient(circle_at_center,transparent_0%,black_120%)] ${aiSpeaking ? 'opacity-40' : 'opacity-80'}`}></div>

      <Visualizer isActive={connectionState === 'connected'} isSpeaking={aiSpeaking} />

      {/* Top Controls */}
      <div className="absolute top-8 right-8 z-50">
        <button 
            onClick={() => setShowResources(true)} 
            className="p-3 bg-white/5 backdrop-blur-md rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-500 border border-white/5 hover:border-white/20"
        >
            <Menu size={20} />
        </button>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-6 text-center h-full">
        
        {/* Title State - Fades out smoothly on connect */}
        <div className={`absolute top-[15%] transition-all duration-1000 ease-in-out transform ${connectionState === 'connected' ? 'opacity-0 -translate-y-10 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'}`}>
            <h1 className="text-6xl md:text-8xl font-serif tracking-tight text-white mb-6 glow-text drop-shadow-2xl">
              NURU
            </h1>
            <p className="text-zinc-400 font-light text-sm tracking-[0.4em] uppercase opacity-70">
                {connectionState === 'connecting' ? "Establishing Link..." : "The Divine Companion"}
            </p>
        </div>

        {/* Error Message */}
        {connectionState === 'error' && (
            <div className="absolute top-[30%] p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 z-50">
                <AlertTriangle size={16} />
                <span>{errorMsg || "Connection interrupted."}</span>
                <button onClick={() => connectToGemini()} className="ml-2 p-1 hover:bg-white/10 rounded-full">
                    <RefreshCw size={14} />
                </button>
            </div>
        )}

        {/* Interaction Button / Portal - Dissolves on connect */}
        <div className={`relative transition-all duration-1000 ease-[cubic-bezier(0.22, 1, 0.36, 1)] ${
            connectionState === 'connected' 
                ? 'opacity-0 scale-[3] blur-3xl pointer-events-none' 
                : 'opacity-100 scale-100 blur-0'
        }`}>
            {connectionState !== 'connected' && (
                <div className="relative group cursor-pointer" onClick={() => connectToGemini()}>
                     {/* Orbit Rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] border border-white/5 rounded-full animate-[spin_8s_linear_infinite]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] border border-white/5 rounded-full animate-[spin_12s_linear_infinite_reverse]"></div>
                    
                    {/* Main Button */}
                    <button 
                        disabled={connectionState === 'connecting'}
                        className="relative w-32 h-32 rounded-full flex items-center justify-center z-20 transition-transform duration-500 group-hover:scale-105"
                    >
                        {/* Glow Effects */}
                        <div className="absolute inset-0 bg-white rounded-full blur-[40px] opacity-10 group-hover:opacity-30 transition-opacity duration-1000"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-500 border border-white/20 portal-glow backdrop-blur-sm"></div>
                        
                        {/* Icon/Spinner */}
                        {connectionState === 'connecting' ? (
                            <div className="absolute inset-0 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                             <Mic size={32} className="text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                        )}
                    </button>
                    
                    {/* Label */}
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs tracking-[0.3em] text-zinc-500 group-hover:text-white transition-colors duration-700 font-light">
                        {connectionState === 'connecting' ? "CONNECTING..." : "ENTER THE LIGHT"}
                    </div>
                </div>
            )}
        </div>

        {/* Active Controls - Slides up when connected */}
        <div className={`fixed bottom-12 flex items-center gap-6 transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) ${
            connectionState === 'connected' 
                ? 'opacity-100 translate-y-0 delay-500' 
                : 'opacity-0 translate-y-20 pointer-events-none'
        }`}>
             <button 
                onClick={toggleMic}
                className={`p-4 rounded-full border backdrop-blur-sm transition-all duration-500 ${
                    isMicMuted 
                        ? 'bg-red-500/10 border-red-500/30 text-red-300' 
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                }`}
            >
                {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            <button 
                onClick={() => disconnectSession()}
                className="p-4 rounded-full border border-white/5 bg-transparent text-zinc-500 hover:text-white hover:bg-white/5 transition-all duration-500 hover:border-red-500/30 hover:text-red-300"
            >
                <PhoneOff size={24} />
            </button>
        </div>

      </main>

      {/* Resources Modal */}
      {showResources && (
         <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-700">
            <div className="bg-black/40 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-500 shadow-[0_0_100px_rgba(255,255,255,0.05)]">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-serif text-white tracking-widest">GUIDANCE</h2>
                    <button onClick={() => setShowResources(false)} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4 font-light overflow-y-auto max-h-[60vh] scrollbar-hide">
                    
                    <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                        <h3 className="text-red-300 mb-2 flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
                            <AlertTriangle size={14} /> Emergency Support
                        </h3>
                        <ul className="space-y-2 text-sm text-zinc-300">
                            <li className="flex justify-between items-center">
                                <span>Kenya Red Cross</span>
                                <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded text-xs">1199</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>GBV Hotline</span>
                                <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded text-xs">1195</span>
                            </li>
                             <li className="flex justify-between items-center">
                                <span>JKUAT Student Counselor</span>
                                <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded text-xs">Dean of Students</span>
                            </li>
                        </ul>
                    </div>

                     <div className="p-4 bg-white/5 rounded-sm border-l-2 border-white/20 hover:border-white transition-all">
                        <h3 className="text-white mb-2 flex items-center gap-2 text-xs uppercase tracking-widest">
                            <Sparkles size={12} className="text-zinc-400"/> Topics
                        </h3>
                        <div className="flex flex-wrap gap-2">
                             <span className="text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-1 rounded-full text-zinc-400">Missing Marks</span>
                             <span className="text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-1 rounded-full text-zinc-400">Bursaries</span>
                             <span className="text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-1 rounded-full text-zinc-400">Hostels</span>
                             <span className="text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-1 rounded-full text-zinc-400">Relationships</span>
                        </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-sm border-l-2 border-white/20 hover:border-white transition-all">
                        <h3 className="text-white mb-1 flex items-center gap-2 text-xs uppercase tracking-widest">
                            <Info size={12} className="text-zinc-400"/> Essence
                        </h3>
                        <p className="text-sm text-zinc-400">A vessel for wisdom, guiding students through the trials of JKUAT with faith.</p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <div className="inline-block p-1 rounded-full border border-white/10 mb-2">
                             <Code size={14} className="text-zinc-500" />
                        </div>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Architect</p>
                        <p className="text-sm text-white font-serif">Jackson Alex</p>
                        <p className="text-[10px] text-zinc-600">Creator of KAVI & LIMA</p>
                    </div>

                </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default App;