import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Modality } from '@google/genai';

const audioUtils = {
    encode: (bytes: Uint8Array) => {
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    },
    decode: (base64: string) => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        return bytes;
    },
    decodeAudioData: async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
        const dataInt16 = new Int16Array(data.buffer);
        const frameCount = dataInt16.length / numChannels;
        const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < frameCount; i++) {
                channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
            }
        }
        return buffer;
    },
    createPcmBlob: (data: Float32Array) => {
        const int16 = new Int16Array(data.length);
        for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
        return { data: btoa(new Uint8Array(int16.buffer).reduce((d, b) => d + String.fromCharCode(b), '')), mimeType: 'audio/pcm;rate=16000' };
    }
};

const App = () => {
    const [isActive, setIsActive] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const outAudioCtxRef = useRef<AudioContext | null>(null);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const sessionRef = useRef<any>(null);

    const start = async () => {
        const apiKey = process.env.API_KEY || '';
        const ai = new GoogleGenAI({ apiKey });
        outAudioCtxRef.current = new AudioContext({ sampleRate: 24000 });
        const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
        const cam = await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => null);
        if (videoRef.current && cam) videoRef.current.srcObject = cam;

        const session = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            callbacks: {
                onopen: () => {
                    setIsActive(true);
                    const inCtx = new AudioContext({ sampleRate: 16000 });
                    const source = inCtx.createMediaStreamSource(mic);
                    const proc = inCtx.createScriptProcessor(4096, 1, 1);
                    proc.onaudioprocess = (e) => {
                        if (sessionRef.current) {
                            sessionRef.current.sendRealtimeInput({ media: audioUtils.createPcmBlob(e.inputBuffer.getChannelData(0)) });
                        }
                    };
                    source.connect(proc); proc.connect(inCtx.destination);
                    
                    if(cam) {
                        setInterval(() => {
                            if (videoRef.current) {
                                const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 240;
                                canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, 320, 240);
                                canvas.toBlob(b => b?.arrayBuffer().then(ab => {
                                    if (sessionRef.current) {
                                        sessionRef.current.sendRealtimeInput({ media: { data: btoa(new Uint8Array(ab).reduce((d, b) => d + String.fromCharCode(b), '')), mimeType: 'image/jpeg' } });
                                    }
                                }), 'image/jpeg', 0.5);
                            }
                        }, 1000);
                    }
                },
                onmessage: async (msg: any) => {
                    if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data && outAudioCtxRef.current) {
                        setIsSpeaking(true);
                        const buf = await audioUtils.decodeAudioData(audioUtils.decode(msg.serverContent.modelTurn.parts[0].inlineData.data), outAudioCtxRef.current, 24000, 1);
                        const s = outAudioCtxRef.current.createBufferSource(); s.buffer = buf; s.connect(outAudioCtxRef.current.destination);
                        s.onended = () => { sourcesRef.current.delete(s); if (sourcesRef.current.size === 0) setIsSpeaking(false); };
                        s.start(); sourcesRef.current.add(s);
                    }
                }
            },
            config: {
                responseModalities: [Modality.AUDIO],
                tools: [{ googleSearch: {} }],
                systemInstruction: `आपका नाम Jeet AI है। निर्माता: Jeet Boss। आप दुनिया की सभी भाषाएँ बोल सकते हैं। 
                सोने का भाव (Sona/Soni/Gold rate/Karat) या खबरें पूछने पर Investing.com India, MCX India, Goodreturns.in, Aaj Tak, NDTV, Reuters जैसी साइट्स से डेटा match करें। 
                रियल-टाइम में सही जानकारी दें और वेबसाइट्स का नाम बताएं। मज़ाकिया और वफादार रहें।`
            }
        });
        sessionRef.current = session;
    };

    return (
        <div className="neural-bg p-8">
            <header className="w-full max-w-7xl flex justify-between items-center mb-16">
                <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white">JEET<span className="text-orange-500">AI</span></h1>
                <span className="text-[11px] font-black uppercase tracking-[1em] text-white/10">v23.0 - Neural Financial Sync</span>
            </header>
            <main className="w-full max-w-7xl flex flex-col lg:flex-row gap-16 items-center">
                <div className="relative w-full max-w-xl aspect-square bg-black rounded-[6rem] overflow-hidden border border-white/5 shadow-2xl">
                    <video ref={videoRef} autoPlay muted className={`w-full h-full object-cover transition-opacity duration-2000 ${isActive ? 'opacity-40' : 'opacity-10'}`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-48 h-48 rounded-full border-[6px] ${isSpeaking ? 'border-orange-500 scale-125 shadow-[0_0_40px_rgba(249,115,22,0.5)]' : 'border-white/10'} transition-all duration-500`}></div>
                    </div>
                </div>
            </main>
            <footer className="fixed bottom-14">
                <button onClick={isActive ? () => window.location.reload() : start} className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-1000 shadow-3xl ${isActive ? 'bg-white text-black' : 'bg-orange-600 text-white hover:scale-110 active:scale-95'}`}>
                    <span className="font-black text-2xl uppercase italic tracking-tighter">{isActive ? 'BYE' : 'START'}</span>
                </button>
            </footer>
        </div>
    );
};

const rootEl = document.getElementById('root');
if (rootEl) {
    ReactDOM.createRoot(rootEl).render(<App />);
}
