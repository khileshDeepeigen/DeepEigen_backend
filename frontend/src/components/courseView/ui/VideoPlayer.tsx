import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
    Settings, SkipBack, SkipForward, Check
} from 'lucide-react';

interface VideoPlayerProps {
    src: string;
    title: string;
    poster?: string;
    onEnded?: () => void;
    onProgress?: (progress: number) => void;
    onNext?: () => void;
    onPrevious?: () => void;
    hasNext?: boolean;
    hasPrevious?: boolean;
    autoPlay?: boolean;
}

const isVimeoEmbedUrl = (url: string): boolean => {
    return /player\.vimeo\.com\/video\/\d+/.test(url);
};

// Helper function to extract video ID from Vimeo URL
const getVimeoVideoId = (url: string): string | null => {
    const match = url.match(/player\.vimeo\.com\/video\/(\d+)/);
    return match ? match[1] : null;
};

// Playback rates
const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    src,
    title,
    poster,
    onEnded,
    onProgress,
    onNext,
    onPrevious,
    hasNext = false,
    hasPrevious = false,
    autoPlay = false
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [buffered, setBuffered] = useState(0);
    const [isVimeo, setIsVimeo] = useState(false);
    const [vimeoVideoId, setVimeoVideoId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const hasEndedRef = useRef(false);
    
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const vimeoPlayerRef = useRef<any>(null);
    const vimeoIframeRef = useRef<HTMLIFrameElement>(null);



    // Reset loading state and ended flag when src changes
    useEffect(() => {
        // Reset state for new video
        setIsLoading(true);
        setCurrentTime(0);
        setDuration(0);
        hasEndedRef.current = false;
        setIsPlaying(false); // Reset playing state
        
        if (isVimeoEmbedUrl(src)) {
            const videoId = getVimeoVideoId(src);
            setIsVimeo(true);
            setVimeoVideoId(videoId);
        } else {
            setIsVimeo(false);
            setVimeoVideoId(null);
        }
        
        // Auto-play video when src changes (for lecture switching)
        // We need to wait for the video to be ready
        if (!isVimeo && videoRef.current) {
            const video = videoRef.current;
            // Reset video element
            video.currentTime = 0;
            video.muted = false;
            setIsMuted(false);
            // Try to play when video is ready
            const tryPlay = () => {
                if (video) {
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => {
                                setIsPlaying(true);
                            })
                            .catch((err) => {
                                setIsPlaying(false);
                                console.log('Auto-play prevented:', err.message);
                            });
                    }
                }
            };
            // If video is already loaded enough, try to play
            if (video.readyState >= 2) {
                tryPlay();
            } else {
                // Wait for canplay event
                const handleCanPlay = () => {
                    tryPlay();
                    video.removeEventListener('canplay', handleCanPlay);
                };
                video.addEventListener('canplay', handleCanPlay);
            }
        }
    }, [src, autoPlay]);


    // Setup Vimeo player progress tracking
    useEffect(() => {
        if (isVimeo && vimeoVideoId) {
            // Dynamically load Vimeo Player SDK
            const loadVimeoSDK = async () => {
                if ((window as any).Vimeo && vimeoIframeRef.current) {
                    try {
                        const player = new (window as any).Vimeo.Player(vimeoIframeRef.current, {
                            id: parseInt(vimeoVideoId),
                            autoplay: true
                        });
                        
                        vimeoPlayerRef.current = player;
                        
                        player.on('progress', (data: { percent: number }) => {
                            const progressPercent = data.percent * 100;
                            onProgress?.(progressPercent);
                        });
                        
                        player.on('ended', () => {
                            onEnded?.();
                        });
                    } catch (err) {
                        console.error('Vimeo player error:', err);
                    }
                }
            };
            
            // Load Vimeo SDK script if not already loaded
            if (!(window as any).Vimeo) {
                const script = document.createElement('script');
                script.src = 'https://player.vimeo.com/api/player.js';
                script.async = true;
                script.onload = loadVimeoSDK;
                document.body.appendChild(script);
            } else {
                loadVimeoSDK();
            }
        }
        
        return () => {
            if (vimeoPlayerRef.current) {
                vimeoPlayerRef.current.destroy();
                vimeoPlayerRef.current = null;
            }
        };
    }, [isVimeo, vimeoVideoId, onProgress, onEnded]);




    // Format time as MM:SS
    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };



    // Handle play/pause
    const togglePlay = useCallback(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying]);




    // Handle volume change
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setIsMuted(newVolume === 0);
        }
    };



    // Handle mute toggle
    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };



    // Handle progress bar click
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (progressRef.current && videoRef.current) {
            const rect = progressRef.current.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            videoRef.current.currentTime = pos * duration;
        }
    };



    // Handle fullscreen toggle
    const toggleFullscreen = async () => {
        if (!containerRef.current) return;

        try {
            if (!document.fullscreenElement) {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error('Fullscreen error:', err);
        }
    };



    // Handle playback rate change
    const changePlaybackRate = (rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
            setShowSettings(false);
        }
    };




    // Update progress and buffered
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            
            const progressPercent = duration > 0 ? (videoRef.current.currentTime / duration) * 100 : 0;
            
            onProgress?.(progressPercent);
            
            // Update buffered
            if (videoRef.current.buffered.length > 0) {
                const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
                setBuffered((bufferedEnd / duration) * 100);
            }
        }
    };



    // Handle loaded metadata
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };



    // Handle video ended
    const handleEnded = () => {
        // Only trigger onEnded if we haven't already triggered
        if (!hasEndedRef.current) {
            hasEndedRef.current = true;
            if (videoRef.current) {
                const video = videoRef.current;
                // Check if video is actually at or near the end
                if (video.duration && video.currentTime >= video.duration - 0.5) {
                    setIsPlaying(false);
                    onEnded?.();
                    // Auto-switch to next video and autoplay
                    if (typeof onNext === 'function') {
                        setTimeout(() => {
                            onNext();
                        }, 300); // Small delay for UX
                    }
                    return;
                }
            }
            setIsPlaying(false);
            onEnded?.();
            // Auto-switch to next video and autoplay
            if (typeof onNext === 'function') {
                setTimeout(() => {
                    onNext();
                }, 300);
            }
        }
    };


    // Handle mouse movement for controls visibility
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    };



    // Update isPlaying state when video pauses/plays
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onPlay = () => {
            setIsPlaying(true);
            // Unmute after autoplay starts (user interaction is implied)
            if (video.muted && autoPlay) {
                video.muted = false;
                setIsMuted(false);
            }
        };
        const onPause = () => setIsPlaying(false);

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);

        return () => {
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
        };
    }, [autoPlay]);




    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!videoRef.current) return;
            
            switch (e.key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'm':
                    toggleMute();
                    break;
                case 'f':
                    toggleFullscreen();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    videoRef.current.currentTime -= 10;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    videoRef.current.currentTime += 10;
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    const newVol = Math.min(volume + 0.1, 1);
                    setVolume(newVol);
                    videoRef.current.volume = newVol;
                    setIsMuted(false);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    const newVol2 = Math.max(volume - 0.1, 0);
                    setVolume(newVol2);
                    videoRef.current.volume = newVol2;
                    setIsMuted(newVol2 === 0);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, volume]);

    return (
        <div 
            ref={containerRef}
            className="video-player-container relative w-full h-full bg-black group"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* Vimeo Video - Iframe */}
            {isVimeo && vimeoVideoId ? (
                <iframe
                    ref={vimeoIframeRef}
                    src={`https://player.vimeo.com/video/${vimeoVideoId}?autoplay=1`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={title}
                />
            ) : (
            /* Native Video Element */
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-contain"
                autoPlay={autoPlay}
                muted={autoPlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onClick={togglePlay}
                onWaiting={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                onCanPlayThrough={() => setIsLoading(false)}
                playsInline
            >
                <source src={src} type="video/mp4" />
                <source src={src} type="video/webm" />
                Your browser does not support the video tag.
            </video>
            )}

            {/* Big Play Button Overlay - Only for native video */}
            {!isPlaying && !isVimeo && (
                <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                    onClick={() => {
                        togglePlay();
                        setIsPlaying(true);
                    }}
                >
                    <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <Play size={40} className="text-gray-800 ml-2" fill="currentColor" />
                    </div>
                </div>
            )}

            {/* Loading Spinner Overlay */}
            {isLoading && !isVimeo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
            )}

            {/* Controls - Hidden for Vimeo since it has its own controls */}
            {!isVimeo && (
                <div 
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 py-3 transition-opacity duration-300 ${
                        showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    {/* Progress Bar */}
                    <div 
                        ref={progressRef}
                        className="relative h-1 bg-gray-600 cursor-pointer mb-3 group/progress"
                        onClick={handleProgressClick}
                    >
                        {/* Buffered Progress */}
                        <div 
                            className="absolute h-full bg-gray-500"
                            style={{ width: `${buffered}%` }}
                        />
                        {/* Play Progress */}
                        <div 
                            className="absolute h-full bg-red-600"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                        {/* Hover Progress */}
                        <div 
                            className="absolute h-3 bg-red-600 rounded-full top-1/2 -translate-y-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
                            style={{ left: `${(currentTime / duration) * 100}%`, width: 12 }}
                        />
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Play/Pause */}
                            <button 
                                onClick={togglePlay}
                                className="text-white hover:text-gray-300 transition-colors"
                                title={isPlaying ? 'Pause (k)' : 'Play (k)'}
                            >
                                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                            </button>

                            {/* Skip Buttons */}
                            <button 
                                onClick={onPrevious}
                                disabled={!hasPrevious}
                                className={`text-white transition-colors ${!hasPrevious ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-300'}`}
                                title="Previous (p)"
                            >
                                <SkipBack size={24} />
                            </button>
                            <button 
                                onClick={onNext}
                                disabled={!hasNext}
                                className={`text-white transition-colors ${!hasNext ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-300'}`}
                                title="Next (n)"
                            >
                                <SkipForward size={24} />
                            </button>

                            {/* Volume */}
                            <div className="flex items-center gap-2 group/volume">
                                <button 
                                    onClick={toggleMute}
                                    className="text-white hover:text-gray-300 transition-colors"
                                    title={isMuted ? 'Unmute (m)' : 'Mute (m)'}
                                >
                                    {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                </button>

                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-0 group-hover/volume:w-20 ml-5 transition-all duration-200 accent-red-600"
                                />
                            </div>

                            {/* Time */}
                            <span className="text-white text-sm">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Settings */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="text-white hover:text-gray-300 transition-colors"
                                    title="Settings"
                                >
                                    <Settings size={24} />
                                </button>

                                {/* Settings Menu */}
                                {showSettings && (
                                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg py-2 min-w-[150px] z-50">
                                        <div className="px-4 py-2 text-gray-400 text-sm border-b border-gray-700">
                                            Playback Speed
                                        </div>
                                        {playbackRates.map((rate) => (
                                            <button
                                                key={rate}
                                                onClick={() => changePlaybackRate(rate)}
                                                className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 flex items-center justify-between"
                                            >
                                                <span>{rate}x</span>
                                                {playbackRate === rate && <Check size={16} className="text-red-500" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Fullscreen */}
                            <button 
                                onClick={toggleFullscreen}
                                className="text-white hover:text-gray-300 transition-colors"
                                title={isFullscreen ? 'Exit fullscreen (f)' : 'Fullscreen (f)'}
                            >
                                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Title Overlay */}
            <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent px-4 py-3 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
            }`}>
                <h3 className="text-white font-medium text-lg">{title}</h3>
            </div>
        </div>
    );
};

export default VideoPlayer;
