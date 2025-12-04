'use client';
import { useState, useEffect } from 'react';
import booksData from './data/books.json';

export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [testId, setTestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [videos, setVideos] = useState([]);
  const [fetchingVideos, setFetchingVideos] = useState(false);
  const [fetchStatus, setFetchStatus] = useState(null); // { type: 'loading' | 'success' | 'error', message: string }

  // Book Browser State
  const [books, setBooks] = useState(booksData);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookTests, setBookTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  // Theme Effect
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleFetch = async (idToFetch = testId) => {
    if (!idToFetch) return;

    setLoading(true);
    setError(null);
    setData(null);
    setVideos([]);
    setFetchingVideos(true);
    setFetchStatus({ type: 'loading', message: 'Hazırlanıyor...' });

    try {
      // 1. Fetch Answer Key
      const res = await fetch(`/api/proxy?testId=${idToFetch}`);

      if (!res.ok) throw new Error('Cevap anahtarı alınamadı');

      const jsonData = await res.json();

      setData(jsonData);

      // 2. Fetch Videos (Sequential)
      const totalQuestions = jsonData.SoruSayisi || 40; // Fallback to 40 if not found
      const newVideos = [];

      for (let i = 1; i <= totalQuestions; i++) {
        setFetchStatus({ type: 'loading', message: `${i}. soru çekiliyor...` });
        try {
          const videoRes = await fetch(`/api/video?testId=${idToFetch}&soruId=${i}`);
          const videoData = await videoRes.json();

          if (videoData.success && videoData.videoUrl) {
            newVideos.push({
              questionNumber: i,
              url: videoData.videoUrl
            });
            setVideos([...newVideos]); // Update state progressively
          }
        } catch (err) {
          console.error(`Error fetching video for question ${i}:`, err);
          // Continue to next question even if one fails
        }
      }

      setFetchStatus({ type: 'success', message: 'Başarılı' });

    } catch (err) {
      console.error('handleFetch error:', err);
      setError(err.message);
      setFetchStatus({ type: 'error', message: 'Hata oluştu' });
    } finally {
      setLoading(false);
      setFetchingVideos(false);
    }
  };

  const handleBookSelect = async (book) => {
    setSelectedBook(book);
    setBookTests([]);
    setSelectedTest(null);
    setData(null);
    setVideos([]);
    setLoadingTests(true);

    try {
      const res = await fetch('/api/book-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: book.id })
      });

      if (!res.ok) throw new Error('Testler alınamadı');

      const data = await res.json();
      if (data.success) {
        setBookTests(data.tests);
      }
    } catch (err) {
      console.error(err);
      setError('Kitap testleri yüklenirken hata oluştu');
    } finally {
      setLoadingTests(false);
    }
  };

  const handleTestSelect = (test) => {
    setSelectedTest(test);
    // test.id corresponds to the data-rowid extracted from the book page
    handleFetch(test.id);
  };

  return (
    <main className="main-container">
      <div className="content-wrapper">
        <div className="header-row">
          <h1 className="title">Diji-Fetch</h1>
          <button className="theme-toggle" onClick={toggleTheme} title="Temayı Değiştir">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Book Browser UI */}
        {!selectedBook ? (
          <div className="books-grid">
            {books.map((book) => (
              <div key={book.id} className="book-card" onClick={() => handleBookSelect(book)}>
                <h3>{book.name}</h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="book-detail">
            <div className="nav-header">
              <button className="back-button" onClick={() => setSelectedBook(null)}>
                ← Kitaplara Dön
              </button>
              <h2 className="subtitle">{selectedBook.name}</h2>
            </div>

            <div className="split-view">
              {/* Test List */}
              <div className="tests-list">
                {loadingTests ? <p style={{ color: 'var(--text-muted)' }}>Testler yükleniyor...</p> : (
                  bookTests.map((test) => (
                    <div
                      key={test.id}
                      className={`test-item ${selectedTest?.id === test.id ? 'active' : ''}`}
                      onClick={() => handleTestSelect(test)}
                    >
                      {test.name}
                      <span className="arrow">→</span>
                    </div>
                  ))
                )}
              </div>

              {/* Solutions View */}
              <div className="solutions-view">
                {selectedTest && (
                  <>
                    <h3 className="test-title">{selectedTest.name}</h3>

                    {loading && (
                      <div className="fetch-status-container">
                        <div className="status-circle loading"></div>
                        <span className="status-message">Cevap anahtarı getiriliyor...</span>
                      </div>
                    )}

                    {/* Answer Key Section */}
                    {data && (
                      <div className="section-card">
                        <div className="section-header">
                          <h4 className="section-title">Cevap Anahtarı</h4>
                        </div>
                        <div className="answers-grid">
                          {data.CevapAnahtari.split('').map((answer, index) => (
                            <div key={index} className="answer-bubble">
                              <span className="question-num">{index + 1}</span>
                              <span className="answer-text">{answer}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Indicator (Video Fetching) */}
                    {fetchStatus && (
                      <div className="fetch-status-container">
                        <div className={`status-circle ${fetchStatus.type}`}></div>
                        <span className="status-message">{fetchStatus.message}</span>
                      </div>
                    )}

                    {/* Video Solutions Section */}
                    {videos.length > 0 && (
                      <div className="section-card">
                        <div className="section-header">
                          <h4 className="section-title">Video Çözümler</h4>
                        </div>
                        <div className="questions-grid">
                          {videos.map((video) => (
                            <div key={video.questionNumber} className="video-card">
                              <div className="video-header">
                                <span className="question-number" style={{ color: 'white', fontWeight: 'bold' }}>Soru {video.questionNumber}</span>
                              </div>
                              <video controls src={video.url} className="video-player"></video>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {modalImage && (
          <div className="modal-overlay" onClick={() => setModalImage(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="close-button" onClick={() => setModalImage(null)}>×</button>
              <img src={modalImage} alt="Soru" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
