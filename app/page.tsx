'use client';
import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import booksData from './data/books.json';
import LoginModal from '@/components/LoginModal';
import Dither from '@/components/Dither';
import AnimatedList from '@/components/AnimatedList';
import type {
    Book,
    BooksBySubject,
    Test,
    TestData,
    Assignment,
    Video,
    ToastState,
    UserAnswers,
    AssignmentContext,
    LoginResponse
} from '@/types';

// --- Helper Functions ---
const groupBooksBySubject = (books: Book[]): BooksBySubject => {
    const subjectGroups: BooksBySubject = {};
    const subjectRegex = /(TÜRKÇE|MATEMATİK|KİMYA|FİZİK|GEOMETRİ|BİYOLOJİ)/i;
    books.forEach(book => {
        const match = book.name.match(subjectRegex);
        let subject = 'Diğer';
        if (match) {
            subject = match[1].toUpperCase();
            if (['MATEMATİK', 'GEOMETRİ'].includes(subject)) {
                if (book.name.includes('AYT MATEMATİK')) subject = 'AYT MATEMATİK';
                else if (book.name.includes('TYT MATEMATİK')) subject = 'TYT MATEMATİK';
                else if (book.name.includes('YKS GEOMETRİ')) subject = 'GEOMETRİ';
            }
            if (subject === 'TÜRKÇE' && book.name.includes('TYT TÜRKÇE')) subject = 'TYT TÜRKÇE';
            if (['KİMYA', 'FİZİK', 'BİYOLOJİ'].includes(subject)) subject = `YKS ${subject}`;
        }
        if (!subjectGroups[subject]) subjectGroups[subject] = [];
        subjectGroups[subject].push(book);
    });
    return subjectGroups;
};

type ActiveTab = 'books' | 'assignments' | 'test-view';

export default function Home() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<TestData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [videoStatus, setVideoStatus] = useState<string | null>(null);

    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>('books');
    const [assignments, setAssignments] = useState<Assignment[]>([]);

    // Load login state from localStorage on mount
    useEffect(() => {
        const savedLoginState = localStorage.getItem('isLoggedIn');
        if (savedLoginState === 'true') {
            setIsLoggedIn(true);
            setActiveTab('assignments');
            fetchAssignments();
        }
    }, []);

    // Book Navigation
    const [books] = useState<Book[]>(booksData as Book[]);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [bookTests, setBookTests] = useState<Test[]>([]);
    const [loadingTests, setLoadingTests] = useState<boolean>(false);
    const [selectedTest, setSelectedTest] = useState<Test | null>(null);

    // Context
    const [assignmentContext, setAssignmentContext] = useState<AssignmentContext | null>(null);

    // Answering & Toast
    const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

    // Settings & Theme
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [accentColor, setAccentColor] = useState<'red' | 'blue' | 'purple' | 'black'>('red');
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

    // Color Themes with Dither colors
    const colorThemes = {
        red: { primary: '#ef4444', light: 'rgba(239, 68, 68, 0.15)', glow: 'rgba(239, 68, 68, 0.15)', ditherDark: [0.3, 0.05, 0.05] as [number, number, number], ditherLight: [0.95, 0.7, 0.7] as [number, number, number] },
        blue: { primary: '#3b82f6', light: 'rgba(59, 130, 246, 0.15)', glow: 'rgba(59, 130, 246, 0.15)', ditherDark: [0.05, 0.15, 0.35] as [number, number, number], ditherLight: [0.7, 0.8, 0.95] as [number, number, number] },
        purple: { primary: '#8b5cf6', light: 'rgba(139, 92, 246, 0.15)', glow: 'rgba(139, 92, 246, 0.15)', ditherDark: [0.2, 0.05, 0.35] as [number, number, number], ditherLight: [0.85, 0.75, 0.95] as [number, number, number] },
        black: { primary: '#1f2937', light: 'rgba(31, 41, 55, 0.15)', glow: 'rgba(31, 41, 55, 0.2)', ditherDark: [0.08, 0.08, 0.1] as [number, number, number], ditherLight: [0.85, 0.85, 0.87] as [number, number, number] },
    };

    // Load saved theme from localStorage
    useEffect(() => {
        const savedColor = localStorage.getItem('accentColor') as 'red' | 'blue' | 'purple' | 'black';
        if (savedColor && colorThemes[savedColor]) {
            setAccentColor(savedColor);
        }
    }, []);

    // Save theme and apply CSS variables
    const saveTheme = (color: 'red' | 'blue' | 'purple' | 'black') => {
        setAccentColor(color);
        localStorage.setItem('accentColor', color);
        setShowSettings(false);
        showToast('✅ Tema kaydedildi!', 'success');
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success'): void => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000);
    };

    const groupedBooks = useMemo(() => groupBooksBySubject(books), [books]);
    const subjects = useMemo(() => Object.keys(groupedBooks).sort(), [groupedBooks]);
    const currentBooks = selectedSubject ? groupedBooks[selectedSubject] : [];

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    // Scroll-based navbar opacity
    const [scrollY, setScrollY] = useState(0);
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on desktop resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768 && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mobileMenuOpen]);

    // Calculate header background opacity: starts transparent, becomes more opaque as scroll increases
    const headerBgOpacity = Math.min(0.05 + (scrollY / 200) * 0.85, 0.9);

    const handleLoginSuccess = (): void => {
        setIsLoggedIn(true);
        setShowLoginModal(false);
        setActiveTab('assignments');
        localStorage.setItem('isLoggedIn', 'true');
        fetchAssignments();
    };

    const fetchAssignments = async (): Promise<void> => {
        setLoading(true);
        try {
            const res = await fetch('/api/student/assignments', { method: 'POST' });
            if (res.status === 401) {
                setIsLoggedIn(false);
                localStorage.removeItem('isLoggedIn');
                throw new Error('Oturum sonlandı.');
            }
            const da = await res.json();
            if (da.assignments) setAssignments(da.assignments);
            else throw new Error('Ödev listesi yüklenemedi.');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
        }
        finally { setLoading(false); }
    };

    const loadTest = async (tId: string, context: AssignmentContext | null = null): Promise<void> => {
        setLoading(true);
        setError(null);
        setData(null);
        setVideos([]);
        setUserAnswers({});
        setVideoStatus('Hazırlanıyor...');
        setAssignmentContext(context);

        try {
            const res = await fetch(`/api/proxy?testId=${tId}`);
            if (!res.ok) throw new Error('Test verisi alınamadı');
            const json: TestData = await res.json();
            setData(json);

            const count = json.SoruSayisi || 40;
            for (let i = 1; i <= count; i++) {
                setVideoStatus(`${i}. soru çekiliyor...`);
                fetch(`/api/video?testId=${tId}&soruId=${i}`)
                    .then(r => r.json())
                    .then(d => {
                        if (d.success && d.videoUrl) {
                            setVideos(p => [...p, { q: i, url: d.videoUrl }].sort((a, b) => a.q - b.q));
                        }
                    }).catch(() => { });
            }
            setVideoStatus('Tamamlandı');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
            setVideoStatus('Hata');
        } finally {
            setLoading(false);
        }
    };

    const handleBookClick = async (book: Book): Promise<void> => {
        setSelectedBook(book);
        setLoadingTests(true);
        try {
            const res = await fetch('/api/book-tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: book.id })
            });
            const d = await res.json();
            if (d.success) setBookTests(d.tests);
        } catch (e) {
            setError('Testler yüklenemedi');
        }
        finally { setLoadingTests(false); }
    };

    const handleAssignmentClick = (asgn: Assignment): void => {
        setSelectedTest({ id: asgn.id, name: asgn.title });
        loadTest(asgn.id, { odevId: asgn.id });
        setActiveTab('test-view');
    };

    const saveAnswers = async (): Promise<void> => {
        if (!selectedTest) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/student/save-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    testId: selectedTest.id,
                    answers: userAnswers,
                    totalQuestions: data?.SoruSayisi || 40,
                    odevId: assignmentContext?.odevId || 0,
                })
            });
            if (!res.ok) throw new Error('Hata');
            showToast('✅ Cevaplar kaydedildi!', 'success');
        } catch (e) {
            showToast('❌ Kayıt başarısız.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="app">
            {/* Dither Background Effect */}
            <div className="dither-background">
                <Dither
                    waveSpeed={0.05}
                    waveFrequency={3}
                    waveAmplitude={0.5}
                    waveColor={theme === 'dark' ? colorThemes[accentColor].ditherDark : colorThemes[accentColor].ditherLight}
                    colorNum={5}
                    pixelSize={2}
                    disableAnimation={false}
                    enableMouseInteraction={false}
                    mouseRadius={0}
                />
            </div>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onLoginSuccess={handleLoginSuccess} accentColor={colorThemes[accentColor].primary} />}

            {/* Header */}
            <header className="header" style={{ background: `rgba(255, 255, 255, ${headerBgOpacity * 0.1})` }}>
                <div className="logo" onClick={() => { setActiveTab('books'); setSelectedTest(null); setSelectedSubject(null); setSelectedBook(null); }} style={{ color: colorThemes[accentColor].primary }}>
                    DIJI-FETCH
                </div>

                {/* Desktop Nav */}
                <nav className="nav desktop-nav">
                    {isLoggedIn ? (
                        <>
                            <button className={activeTab === 'assignments' ? 'active' : ''} onClick={() => setActiveTab('assignments')} style={activeTab === 'assignments' ? { color: colorThemes[accentColor].primary, background: colorThemes[accentColor].light, borderColor: colorThemes[accentColor].primary } : {}}>Ödevlerim</button>
                            <button className={activeTab === 'books' ? 'active' : ''} onClick={() => setActiveTab('books')} style={activeTab === 'books' ? { color: colorThemes[accentColor].primary, background: colorThemes[accentColor].light, borderColor: colorThemes[accentColor].primary } : {}}>Kitaplar</button>
                            <button onClick={() => setShowSettings(true)}>⚙️ Ayarlar</button>
                        </>
                    ) : (
                        <button className="login-btn" onClick={() => setShowLoginModal(true)} style={{ background: colorThemes[accentColor].primary }}>Giriş Yap</button>
                    )}
                    <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '🌙' : '☀️'}</button>
                </nav>

                {/* Mobile Hamburger */}
                <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? '✕' : '☰'}
                </button>
            </header>

            {/* Mobile Nav Menu */}
            {mobileMenuOpen && (
                <div className="mobile-nav">
                    {isLoggedIn ? (
                        <>
                            <button onClick={() => { setActiveTab('assignments'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'assignments' ? colorThemes[accentColor].primary : 'inherit' }}>Ödevlerim</button>
                            <button onClick={() => { setActiveTab('books'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'books' ? colorThemes[accentColor].primary : 'inherit' }}>Kitaplar</button>
                            <button onClick={() => { setShowSettings(true); setMobileMenuOpen(false); }}>⚙️ Ayarlar</button>
                        </>
                    ) : (
                        <button onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }} style={{ background: colorThemes[accentColor].primary, color: 'white' }}>Giriş Yap</button>
                    )}
                    <button onClick={() => { setTheme(t => t === 'dark' ? 'light' : 'dark'); setMobileMenuOpen(false); }}>{theme === 'dark' ? '🌙 Koyu Mod' : '☀️ Açık Mod'}</button>
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="modal-overlay" onClick={() => setShowSettings(false)}>
                    <div className="settings-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>⚙️ Ayarlar</h3>
                            <button onClick={() => setShowSettings(false)}>✕</button>
                        </div>
                        <div className="modal-content">
                            <h4>Tema Rengi</h4>
                            <div className="color-options">
                                <button className={`color-btn ${accentColor === 'red' ? 'active' : ''}`} onClick={() => saveTheme('red')}>
                                    <span className="color-dot" style={{ background: '#ef4444' }}></span>
                                    Kırmızı
                                </button>
                                <button className={`color-btn ${accentColor === 'blue' ? 'active' : ''}`} onClick={() => saveTheme('blue')}>
                                    <span className="color-dot" style={{ background: '#3b82f6' }}></span>
                                    Mavi
                                </button>
                                <button className={`color-btn ${accentColor === 'purple' ? 'active' : ''}`} onClick={() => saveTheme('purple')}>
                                    <span className="color-dot" style={{ background: '#8b5cf6' }}></span>
                                    Mor
                                </button>
                                <button className={`color-btn ${accentColor === 'black' ? 'active' : ''}`} onClick={() => saveTheme('black')}>
                                    <span className="color-dot" style={{ background: '#374151' }}></span>
                                    Siyah
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <main className="main">
                {error && <div className="error-banner">{error}</div>}

                {activeTab === 'books' && !selectedTest && (
                    !selectedSubject ? (
                        <div className="grid">
                            {subjects.map(s => (
                                <div key={s} className="card subject-card" onClick={() => setSelectedSubject(s)} style={{ '--hover-color': colorThemes[accentColor].primary } as React.CSSProperties}>
                                    <h3>{s}</h3>
                                </div>
                            ))}
                        </div>
                    ) : !selectedBook ? (
                        <div className="section">
                            <button className="back-btn" onClick={() => setSelectedSubject(null)}>← Derslere Dön</button>
                            <h2 className="section-title">{selectedSubject}</h2>
                            <div className="grid">
                                {currentBooks.map(b => (
                                    <div key={b.id} className="card book-card" onClick={() => handleBookClick(b)} style={{ '--hover-color': colorThemes[accentColor].primary } as React.CSSProperties}>
                                        <h3>{b.name}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="section">
                            <button className="back-btn" onClick={() => setSelectedBook(null)}>← Kitaplara Dön</button>
                            <h2 className="section-title">{selectedBook.name}</h2>
                            {loadingTests ? (
                                <div className="loader">Yükleniyor...</div>
                            ) : (
                                <div className="animated-list-wrapper">
                                    <AnimatedList
                                        items={bookTests.map(t => t.name)}
                                        onItemSelect={(item, index) => {
                                            const test = bookTests[index];
                                            setSelectedTest(test);
                                            loadTest(test.id);
                                        }}
                                        showGradients={false}
                                        enableArrowNavigation={true}
                                        displayScrollbar={true}
                                        className="animated-list-custom"
                                        itemClassName="animated-list-item"
                                    />
                                </div>
                            )}
                        </div>
                    )
                )}

                {activeTab === 'assignments' && !selectedTest && (
                    <div className="section">
                        <h2 className="section-title">Ödevlerim</h2>
                        <div className="grid assignments-grid">
                            {loading && <div className="loader">Yükleniyor...</div>}
                            {assignments.length > 0 ? assignments.map(a => (
                                <div key={a.id} className="card assignment-card" onClick={() => handleAssignmentClick(a)} style={{ '--hover-color': colorThemes[accentColor].primary } as React.CSSProperties}>
                                    <div className="card-header">
                                        <span className="badge" style={{ background: colorThemes[accentColor].light, color: colorThemes[accentColor].primary }}>ÖDEV</span>
                                        <span className="date">{a.dateRange}</span>
                                    </div>
                                    <h3>{a.title}</h3>
                                    <div className="card-footer" style={{ color: colorThemes[accentColor].primary }}>Testi Çöz →</div>
                                </div>
                            )) : !loading && <p className="empty-msg">Aktif ödev bulunamadı.</p>}
                        </div>
                    </div>
                )}

                {(selectedTest || activeTab === 'test-view') && selectedTest && (
                    <div className="test-view">
                        <div className="test-toolbar">
                            <button className="back-btn" onClick={() => {
                                setSelectedTest(null);
                                setVideos([]);
                                setActiveTab(isLoggedIn && assignmentContext ? 'assignments' : 'books');
                            }}>← Geri Dön</button>
                            <h2>{selectedTest.name}</h2>
                            {isLoggedIn && (
                                <div className="save-wrapper">
                                    <button className="save-btn" onClick={saveAnswers} disabled={isSaving}>
                                        {isSaving ? '...' : 'Cevapları Kaydet'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="split-layout">
                            {data && (
                                <div className="panel answer-panel">
                                    <div className="panel-header">Cevap Anahtarı</div>
                                    <div className="answers-grid">
                                        {data.CevapAnahtari.split('').map((ans, i) => (
                                            <div key={i} className="answer-item">
                                                <div className="q-num">{i + 1}</div>
                                                <div className="q-val" style={{ color: colorThemes[accentColor].primary }}>{ans}</div>
                                                {isLoggedIn && (
                                                    <select
                                                        className="user-select"
                                                        value={userAnswers[i + 1] || ''}
                                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setUserAnswers({ ...userAnswers, [i + 1]: e.target.value })}
                                                    >
                                                        <option value="">-</option>
                                                        {['A', 'B', 'C', 'D', 'E'].map(o => <option key={o} value={o}>{o}</option>)}
                                                    </select>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="panel video-panel">
                                <div className="panel-header">
                                    Video Çözümler
                                    <span className={`status-indicator ${videoStatus === 'Tamamlandı' ? 'success' : videoStatus === 'Hata' ? 'error' : 'loading'}`}>
                                        <span className="status-dot"></span>
                                        {videoStatus}
                                    </span>
                                </div>
                                <div className="video-list">
                                    {videos.map((v, index) => (
                                        <div key={v.q} className="video-item" id={`video-${v.q}`}>
                                            <div className="video-title">Soru {v.q}</div>
                                            <div className="video-container">
                                                <video controls src={v.url} />
                                                <div className="fullscreen-nav">
                                                    {index > 0 && (
                                                        <button
                                                            className="fs-nav-btn prev"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const prevVideo = document.querySelector(`#video-${videos[index - 1].q} .video-container`) as HTMLElement;
                                                                if (prevVideo && document.fullscreenElement) {
                                                                    document.exitFullscreen().then(() => {
                                                                        prevVideo.requestFullscreen();
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            ← Önceki
                                                        </button>
                                                    )}
                                                    {index < videos.length - 1 && (
                                                        <button
                                                            className="fs-nav-btn next"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const nextVideo = document.querySelector(`#video-${videos[index + 1].q} .video-container`) as HTMLElement;
                                                                if (nextVideo && document.fullscreenElement) {
                                                                    document.exitFullscreen().then(() => {
                                                                        nextVideo.requestFullscreen();
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            Sonraki →
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Normal view navigation buttons */}
                                            <div className="video-nav-buttons">
                                                {index > 0 && (
                                                    <button onClick={() => document.getElementById(`video-${videos[index - 1].q}`)?.scrollIntoView({ behavior: 'smooth' })}>
                                                        ← Önceki Soru
                                                    </button>
                                                )}
                                                {index < videos.length - 1 && (
                                                    <button onClick={() => document.getElementById(`video-${videos[index + 1].q}`)?.scrollIntoView({ behavior: 'smooth' })}>
                                                        Sonraki Soru →
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                <div className={`toast-notification ${toast.show ? 'show' : ''} ${toast.type}`}>
                    {toast.message}
                </div>
            </main>

            <style jsx global>{`
           :root {
               --bg: #0f1115;
               --card-bg: #181b21;
               --text: #ffffff;
               --text-muted: #8b949e;
               --primary: #3b82f6;
               --primary-hover: #2563eb;
               --border: #2d333b;
               --success: #10b981;
               --error: #ef4444;
           }
           [data-theme="light"] {
               --bg: #f3f4f6;
               --card-bg: #ffffff;
               --text: #111827;
               --text-muted: #6b7280;
               --primary: #2563eb;
               --border: #e5e7eb;
           }
           
           * { box-sizing: border-box; }
           body { margin: 0; font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; transition: background 0.3s, color 0.3s; }
           
           .app { min-height: 100vh; display: flex; flex-direction: column; position: relative; }
           
           /* Dither Background */
           .dither-background {
               position: fixed;
               top: 0;
               left: 0;
               width: 100%;
               height: 100%;
               z-index: 0;
               pointer-events: none;
           }
           .dither-background canvas {
               pointer-events: auto;
           }
           
           /* Header */
           .header {
               display: flex;
               justify-content: space-between;
               align-items: center;
               padding: 1rem 2rem;
               background: rgba(0, 0, 0, 0.1);
               backdrop-filter: blur(20px);
               -webkit-backdrop-filter: blur(20px);
               border: 1px solid rgba(0, 0, 0, 0.1);
               border-radius: 20px;
               margin: 1rem auto;
               width: 85%;
               position: sticky;
               top: 1rem;
               z-index: 100;
           }
           [data-theme="light"] .header {
               background: rgba(255, 255, 255, 0.8);
               border-color: rgba(0, 0, 0, 0.1);
           }
           .logo {
               font-size: 1.5rem;
               font-weight: 800;
               color: #ef4444;
               cursor: pointer;
               letter-spacing: -1px;
               transition: transform 0.2s ease;
           }
           .logo:hover {
               transform: scale(1.05);
           }
           .nav {
               display: flex;
               gap: 0.5rem;
               align-items: center;
           }
           .nav button {
               background: rgba(0, 0, 0, 0.1);
               border: 1px solid transparent;
               color: var(--text-muted);
               cursor: pointer;
               font-weight: 500;
               font-size: 0.9rem;
               padding: 0.6rem 1.2rem;
               border-radius: 12px;
               transition: all 0.2s ease;
           }
           .nav button:hover {
               color: var(--text);
               background: rgba(0, 0, 0, 0.1);
               border-color: var(--border);
           }
           .nav button.active {
               color: #ef4444;
               background: rgba(239, 68, 68, 0.15);
               border-color: #ef4444;
           }
           .nav .login-btn {
               background: #ef4444;
               color: white;
               border: none;
           }
           .nav .login-btn:hover {
               opacity: 0.9;
               transform: translateY(-2px);
           }
           .nav .theme-toggle {
               font-size: 1.2rem;
               padding: 0.5rem 0.8rem;
           }

           /* Mobile Menu Button */
           .mobile-menu-btn {
               display: none;
               background: transparent;
               border: none;
               font-size: 1.5rem;
               color: var(--text);
               cursor: pointer;
               padding: 0.5rem;
           }
           @media (max-width: 768px) {
               .desktop-nav { display: none !important; }
               .mobile-menu-btn { display: block; }
           }

           /* Mobile Nav */
           .mobile-nav {
               position: fixed;
               top: 80px;
               left: 5%;
               right: 5%;
               width: 90%;
               background: var(--card-bg);
               backdrop-filter: blur(20px);
               -webkit-backdrop-filter: blur(20px);
               border: 1px solid var(--border);
               border-radius: 16px;
               padding: 1rem;
               display: flex;
               flex-direction: column;
               gap: 0.5rem;
               z-index: 101;
               animation: slideDown 0.3s ease;
           }
           @keyframes slideDown {
               from { opacity: 0; transform: translateY(-10px); }
               to { opacity: 1; transform: translateY(0); }
           }
           .mobile-nav button {
               background: transparent;
               border: 1px solid var(--border);
               color: var(--text);
               padding: 1rem;
               border-radius: 12px;
               font-size: 1rem;
               cursor: pointer;
               text-align: left;
               transition: all 0.2s ease;
           }
           .mobile-nav button:hover {
               background: rgba(0, 0, 0, 0.1);
           }

           /* Settings Modal */
           .modal-overlay {
               position: fixed;
               top: 0;
               left: 0;
               right: 0;
               bottom: 0;
               background: rgba(0, 0, 0, 0.7);
               backdrop-filter: blur(8px);
               display: flex;
               align-items: center;
               justify-content: center;
               z-index: 1000;
           }
           .settings-modal {
               background: var(--card-bg);
               border: 1px solid var(--border);
               border-radius: 20px;
               width: 90%;
               max-width: 400px;
               overflow: hidden;
           }
           .settings-modal .modal-header {
               display: flex;
               justify-content: space-between;
               align-items: center;
               padding: 1.5rem;
               border-bottom: 1px solid var(--border);
           }
           .settings-modal .modal-header h3 {
               margin: 0;
               font-size: 1.2rem;
           }
           .settings-modal .modal-header button {
               background: transparent;
               border: none;
               font-size: 1.2rem;
               color: var(--text-muted);
               cursor: pointer;
           }
           .settings-modal .modal-content {
               padding: 1.5rem;
           }
           .settings-modal .modal-content h4 {
               margin: 0 0 1rem 0;
               font-size: 0.9rem;
               color: var(--text-muted);
               text-transform: uppercase;
               letter-spacing: 1px;
           }
           .color-options {
               display: grid;
               grid-template-columns: repeat(2, 1fr);
               gap: 0.75rem;
           }
           .color-btn {
               display: flex;
               align-items: center;
               gap: 0.75rem;
               padding: 1rem;
               background: rgba(0, 0, 0, 0.1);
               border: 2px solid transparent;
               border-radius: 12px;
               color: var(--text);
               cursor: pointer;
               transition: all 0.2s ease;
           }
           .color-btn:hover {
               background: rgba(0, 0, 0, 0.1);
           }
           .color-btn.active {
               border-color: var(--text);
               background: rgba(0, 0, 0, 0.1);
           }
           .color-dot {
               width: 24px;
               height: 24px;
               border-radius: 50%;
               flex-shrink: 0;
           }
           
           /* AnimatedList Custom Styles */
           .animated-list-wrapper {
               width: 100%;
               max-width: 100%;
               border: 1px solid var(--border);
               border-radius: 16px;
               overflow: hidden;
               background: rgba(0, 0, 0, 0.1);
               backdrop-filter: blur(12px);
               -webkit-backdrop-filter: blur(12px);
           }
           .animated-list-custom {
               width: 100% !important;
               max-width: 100% !important;
           }
           .animated-list-custom > div {
               max-height: 60vh !important;
               scrollbar-color: #ef4444 transparent;
           }
           .animated-list-item {
               background: transparent !important;
               border: none !important;
               border-bottom: 1px solid var(--border) !important;
               border-radius: 0 !important;
               padding: 1.2rem 1.5rem !important;
               transition: all 0.3s ease !important;
           }
           .animated-list-item:first-child {
               border-radius: 16px 16px 0 0 !important;
           }
           .animated-list-item:last-child {
               border-radius: 0 0 16px 16px !important;
               border-bottom: none !important;
           }
           .animated-list-item:only-child {
               border-radius: 16px !important;
           }
           .animated-list-item:hover {
               background: rgba(59, 130, 246, 0.1) !important;
               padding-left: 2rem !important;
               border-radius: 0 !important;
           }
           .animated-list-item p {
               color: var(--text) !important;
               font-size: 1rem !important;
               font-weight: 500 !important;
           }

           .main { flex: 1; padding: 2rem 0; width: 85%; max-width: 85%; margin: 0 auto; position: relative; z-index: 10; }
           
           .section-title { font-size: 1.8rem; font-weight: 700; margin-bottom: 2rem; }
           .back-btn { color: var(--text-muted); cursor: pointer; margin-bottom: 1rem; display: inline-flex; align-items: center; gap: 0.5rem; background: none; border: none; font-size: 0.9rem; }
           .back-btn:hover { color: var(--text); }
            /* Responsive grid: phone 1, small tablet 2, tablet 3, desktop 4 */
             .grid {
                 display: grid;
                 grid-template-columns: repeat(1, 1fr);
                 gap: 1rem;
                 width: 100%;
                 padding: 1.5rem;
                 border: 1px solid var(--border);
                 border-radius: 20px;
                 background: rgba(0, 0, 0, 0.1);
             }
             @media (min-width: 480px) {
                 .grid {
                     grid-template-columns: repeat(2, 1fr);
                 }
             }
             @media (min-width: 768px) {
                 .grid {
                     grid-template-columns: repeat(3, 1fr);
                 }
             }
             @media (min-width: 1200px) {
                 .grid {
                     grid-template-columns: repeat(4, 1fr);
                 }
             }

            .card { 
               background: rgba(0, 0, 0, 0.1);
               backdrop-filter: blur(16px);
               -webkit-backdrop-filter: blur(16px);
               border: 1px solid rgba(0, 0, 0, 0.1);
               border-radius: 20px;
               padding: 1.5rem;
               cursor: pointer;
               transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
               display: flex;
               flex-direction: column;
               position: relative;
               overflow: hidden;
            }
            .card::before {
               content: '';
               position: absolute;
               top: 0;
               left: -50%;
               width: 100%;
               height: 100%;
               background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
               transform: skewX(-15deg);
               transition: left 0.5s ease;
            }
            .card:hover::before {
               left: 150%;
            }
            .card:hover { 
               transform: translateY(-8px) scale(1.02);
               border-color: var(--hover-color, #ef4444);
               box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
            }
            [data-theme="light"] .card {
               background: rgba(255, 255, 255, 0.7);
               border-color: rgba(0, 0, 0, 0.08);
            }
            [data-theme="light"] .card:hover {
               box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 0 30px rgba(59, 130, 246, 0.1);
            }
            .subject-card { 
               align-items: center;
               justify-content: center;
               min-height: 120px;
               text-align: center;
               background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
            }
            .subject-card h3 { 
               font-size: 1.1rem;
               font-weight: 700;
               margin: 0;
               letter-spacing: 0.5px;
            }
            .book-card { 
               min-height: 100px;
               justify-content: center;
            }
            .book-card h3 { 
               font-size: 0.95rem;
               font-weight: 500;
               margin: 0;
               line-height: 1.5;
               color: var(--text);
            }
           
           .list-container { background: var(--card-bg); border-radius: 16px; border: 1px solid var(--border); overflow: hidden; }
           .list-item { padding: 1.2rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; cursor: pointer; transition: background 0.2s; }
           .list-item:hover { background: rgba(255,255,255,0.03); }
           .list-item:last-child { border-bottom: none; }
           
           .assignments-grid .card-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem; }
           .badge { background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 1px 6px; border-radius: 4px; font-weight: 600; font-size: 0.75rem; }
           .date { color: var(--text-muted); }
           .card-footer { margin-top: auto; color: #ef4444; font-size: 0.9rem; font-weight: 600; padding-top: 1rem; }
           
           .test-toolbar { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 2rem; }
           .test-toolbar h2 { margin: 0; font-size: 2rem; }
           .save-wrapper { display: flex; align-items: center; gap: 1rem; margin-top: 1rem; }
           .save-btn { background: var(--success); color: white; border: none; padding: 0.8rem 2rem; border-radius: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
           .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
           
           .split-layout { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; }
           @media (max-width: 900px) { .split-layout { grid-template-columns: 1fr; } }
           
           .panel { 
               background: rgba(0, 0, 0, 0.1);
               backdrop-filter: blur(12px);
               -webkit-backdrop-filter: blur(12px);
               border: 1px solid var(--border); 
               border-radius: 16px; 
               overflow: visible;
               height: fit-content;
            }
            [data-theme="light"] .panel {
               background: rgba(255, 255, 255, 0.5);
            }
           .panel-header { padding: 1.5rem; border-bottom: 1px solid var(--border); font-weight: 700; font-size: 1.1rem; display: flex; justify-content: space-between; align-items: center; }
           
           /* Status Indicator */
           .status-indicator {
               display: flex;
               align-items: center;
               gap: 8px;
               font-weight: 400;
               font-size: 0.9rem;
               padding: 4px 12px;
               border-radius: 20px;
               background: rgba(0, 0, 0, 0.1);
           }
           .status-dot {
               width: 10px;
               height: 10px;
               border-radius: 50%;
               display: inline-block;
           }
           .status-indicator.loading .status-dot {
               background: #eab308;
               animation: blink 1s ease-in-out infinite;
           }
           .status-indicator.loading {
               color: #eab308;
           }
           .status-indicator.success .status-dot {
               background: #22c55e;
           }
           .status-indicator.success {
               color: #22c55e;
           }
           .status-indicator.error .status-dot {
               background: #ef4444;
           }
           .status-indicator.error {
               color: #ef4444;
           }
           @keyframes blink {
               0%, 100% { opacity: 1; }
               50% { opacity: 0.3; }
           }
           
           .answers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); padding: 1rem; gap: 10px; }
           .answer-item { display: flex; flex-direction: column; align-items: center; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid transparent; }
           .answer-item:hover { border-color: var(--border); }
           .q-num { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px; }
           .q-val { font-size: 1.2rem; font-weight: 700; color: #ef4444; margin-bottom: 8px; }
           .user-select { background: var(--bg); color: var(--text); border: 1px solid var(--border); border-radius: 6px; padding: 4px; width: 100%; text-align: center; cursor: pointer; outline: none; }
           .user-select:focus { border-color: #ef4444; }
           
           .video-list { padding: 1.5rem; display: flex; flex-direction: column; gap: 2rem; }
           .video-container { position: relative; }
           .video-container video { width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
           .video-title { margin-bottom: 0.5rem; font-weight: 600; color: var(--text-muted); }
           
           /* Fullscreen navigation */
           .fullscreen-nav {
               display: none;
               position: absolute;
               bottom: 60px;
               left: 50%;
               transform: translateX(-50%);
               gap: 1rem;
               z-index: 9999;
           }
           .video-container:fullscreen .fullscreen-nav {
               display: flex;
           }
           .fs-nav-btn {
               background: rgba(0, 0, 0, 0.7);
               color: white;
               border: 1px solid rgba(255, 255, 255, 0.3);
               padding: 12px 24px;
               border-radius: 30px;
               font-size: 1rem;
               font-weight: 600;
               cursor: pointer;
               transition: all 0.2s ease;
               backdrop-filter: blur(8px);
           }
           .fs-nav-btn:hover {
               background: rgba(0, 0, 0, 0.9);
               border-color: rgba(255, 255, 255, 0.6);
           }

           /* Normal view video navigation */
           .video-nav-buttons {
               display: flex;
               justify-content: space-between;
               gap: 1rem;
               margin-top: 1rem;
           }
           .video-nav-buttons button {
               flex: 1;
               background: rgba(0, 0, 0, 0.1);
               border: 1px solid var(--border);
               color: var(--text);
               padding: 10px 16px;
               border-radius: 10px;
               font-size: 0.9rem;
               font-weight: 500;
               cursor: pointer;
               transition: all 0.2s ease;
           }
           .video-nav-buttons button:hover {
               background: rgba(0, 0, 0, 0.1);
               border-color: var(--text-muted);
           }
           
           .error-banner { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: var(--error); padding: 1rem; border-radius: 12px; margin-bottom: 2rem; }
           .loader { color: var(--text-muted); padding: 2rem; text-align: center; }
           .empty-msg { text-align: center; padding: 3rem; color: var(--text-muted); font-style: italic; }

           /* TOAST STYLES */
           .toast-notification {
               position: fixed;
               bottom: 30px;
               right: 30px;
               background: var(--card-bg);
               color: var(--text);
               padding: 1rem 1.5rem;
               border-radius: 12px;
               box-shadow: 0 10px 30px rgba(0,0,0,0.3);
               border: 1px solid var(--border);
               z-index: 1000;
               transform: translateY(100px);
               opacity: 0;
               transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
               font-weight: 600;
               display: flex;
               align-items: center;
               gap: 10px;
           }
           .toast-notification.show {
               transform: translateY(0);
               opacity: 1;
           }
           .toast-notification.success { border-color: var(--success); }
           .toast-notification.error { border-color: var(--error); }
        `}</style>
        </div>
    );
}
