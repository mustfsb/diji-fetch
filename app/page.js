'use client';
import { useState, useEffect, useMemo } from 'react';
import booksData from './data/books.json';

// Kitapları derslere göre gruplandıran yardımcı fonksiyon
const groupBooksBySubject = (books) => {
  const subjectGroups = {};
  
  // Kitap adından ders adını çıkarmak için basit bir regex kullanılır
  // Örn: "ETAP TYT TÜRKÇE 1.SAYI -2026" -> "TÜRKÇE"
  const subjectRegex = /(TÜRKÇE|MATEMATİK|KİMYA|FİZİK|GEOMETRİ|BİYOLOJİ)/i;

  books.forEach(book => {
    const match = book.name.match(subjectRegex);
    let subject = 'Diğer'; // Varsayılan ders

    if (match) {
      // Bulunan ders adını büyük harfle al
      subject = match[1].toUpperCase();
      
      // AYT/TYT Matematik ve Geometri'yi ayırmak için ek kontrol
      if (subject === 'MATEMATİK' || subject === 'GEOMETRİ') {
        if (book.name.includes('AYT MATEMATİK')) {
          subject = 'AYT MATEMATİK';
        } else if (book.name.includes('TYT MATEMATİK')) {
          subject = 'TYT MATEMATİK';
        } else if (book.name.includes('YKS GEOMETRİ')) {
          subject = 'GEOMETRİ';
        }
      }
      if (subject === 'TÜRKÇE') {
         if (book.name.includes('TYT TÜRKÇE')) {
          subject = 'TYT TÜRKÇE';
        }
      }
      
      // Kimya, Fizik, Biyoloji TYT/AYT ayrımı yapılmadı (şimdilik hepsi YKS olduğu varsayıldı)
      if (subject === 'KİMYA' || subject === 'FİZİK' || subject === 'BİYOLOJİ') {
        subject = `YKS ${subject}`;
      }
      
    }
    
    if (!subjectGroups[subject]) {
      subjectGroups[subject] = [];
    }
    subjectGroups[subject].push(book);
  });
  
  return subjectGroups;
};


export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [testId, setTestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [videos, setVideos] = useState([]);
  const [fetchingVideos, setFetchingVideos] = useState(false);
  const [fetchStatus, setFetchStatus] = useState(null); 

  // Book Browser State
  const [books, setBooks] = useState(booksData);
  // Yeni durum: Seçilen ders (örn: 'TYT MATEMATİK')
  const [selectedSubject, setSelectedSubject] = useState(null); 
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookTests, setBookTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  // Kitapları derse göre gruplandırmak için useMemo kullanıldı
  const groupedBooks = useMemo(() => groupBooksBySubject(books), [books]);
  const subjects = useMemo(() => Object.keys(groupedBooks).sort(), [groupedBooks]);
  
  // Seçilen derse ait kitapları tutan değişken
  const currentBooks = selectedSubject ? groupedBooks[selectedSubject] : [];


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
            // State'i yavaş yavaş güncellemek yerine, döngü sonunda toplu güncelleme daha verimli olabilir, 
            // ancak progresif yükleme için bu şekilde bırakıldı.
            setVideos([...newVideos]); 
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
    handleFetch(test.id);
  };
  
  // Ders seçme işlevi
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setSelectedBook(null); // Yeni ders seçildiğinde kitap seçimi sıfırlanır
  };
  
  // Geri butonuna basıldığında ders listesine dönme
  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedBook(null);
    setSelectedTest(null);
    setBookTests([]);
    setData(null);
    setVideos([]);
    setError(null);
  }

  // Geri butonuna basıldığında kitap listesine dönme
  const handleBackToBooks = () => {
    setSelectedBook(null);
    setSelectedTest(null);
    setBookTests([]);
    setData(null);
    setVideos([]);
    setError(null);
  }


  return (
    <main className="main-container">
      <div className="content-wrapper">
        <div className="header-row">
          <h1 className="title">Diji-Fetch</h1>
          <button className="theme-toggle" onClick={toggleTheme} title="Temayı Değiştir">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>

        {/* 📚 Kitap Tarayıcısı Arayüzü */}
        {/* Adım 1: Ders Seçimi */}
        {!selectedSubject && (
          <div className="books-grid">
            {subjects.map((subject) => (
              <div 
                key={subject} 
                className="book-card subject-card" 
                onClick={() => handleSubjectSelect(subject)}
              >
                <h3>{subject}</h3>
              </div>
            ))}
          </div>
        )}
        
        {/* Adım 2: Kitap Seçimi (Bir Ders Seçildikten Sonra) */}
        {selectedSubject && !selectedBook && (
          <div className="book-list-container">
             <div className="nav-header">
                <button className="back-button" onClick={handleBackToSubjects}>
                  ← Derslere Dön
                </button>
                <h2 className="subtitle">{selectedSubject} Kitapları</h2>
              </div>
            <div className="books-grid books-in-subject">
              {currentBooks.map((book) => (
                <div key={book.id} className="book-card" onClick={() => handleBookSelect(book)}>
                  <h3>{book.name}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adım 3: Test ve Çözüm Görünümü (Bir Kitap Seçildikten Sonra) */}
        {selectedBook && (
          <div className="book-detail">
            <div className="nav-header">
              <button className="back-button" onClick={handleBackToBooks}>
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
                    
                    {error && (
                      <div className="error-message">
                         ⚠️ Hata: {error}
                      </div>
                    )}

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
                    {fetchStatus && fetchStatus.type !== 'success' && (
                      <div className="fetch-status-container">
                        <div className={`status-circle ${fetchStatus.type}`}></div>
                        <span className="status-message">{fetchStatus.message}</span>
                      </div>
                    )}
                    {fetchStatus && fetchStatus.type === 'success' && (
                        <div className="fetch-status-container success-box">
                            <div className="status-circle success"></div>
                            <span className="status-message">{fetchStatus.message}</span>
                        </div>
                    )}

                    {/* Video Solutions Section */}
                    {videos.length > 0 && (
                      <div className="section-card">
                        <div className="section-header">
                          <h4 className="section-title">Video Çözümler ({videos.length} adet)</h4>
                        </div>
                        <div className="questions-grid">
                          {videos.map((video) => (
                            <div key={video.questionNumber} className="video-card">
                              <div className="video-header">
                                <span className="question-number">Soru {video.questionNumber}</span>
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
