"use client";

import { useState } from "react";

export default function Home() {
  const [testId, setTestId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [modalImage, setModalImage] = useState(null);

  const handleFetch = async () => {
    if (!testId.trim()) {
      setError("Lütfen bir Test ID girin");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`/api/proxy?testId=${testId}&programId=14308&testTur=1`);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Hata: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="glass-container">
      <header>
        <h1>Dijidemi Test Getirici</h1>
        <p>Detayları görmek için Test ID girin</p>
      </header>

      <section className="input-section">
        <div className="input-group">
          <input
            type="text"
            id="testIdInput"
            placeholder=" "
            autoComplete="off"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
          />
          <label htmlFor="testIdInput">Test ID</label>
        </div>
        <button id="fetchBtn" onClick={handleFetch} disabled={loading}>
          <span>{loading ? "Getiriliyor..." : "Verileri Getir"}</span>
          <div className="btn-glow"></div>
        </button>
      </section>

      {(data || error || loading) && (
        <section id="resultContainer" className="result-section">
          <div className="status-bar">
            <span className={`status-dot ${loading ? "loading" : error ? "error" : "success"}`}></span>
            <span id="statusText">
              {loading ? "Veri isteniyor..." : error ? error : "Başarılı"}
            </span>
          </div>

          <div id="jsonOutput">
            {error && <div className="error-msg">İstek başarısız oldu. Konsolu kontrol edin.</div>}

            {data && (
              <div className="test-content">
                {/* 1. Test Name */}
                {(data.Adi || data.TestAdi) && (
                  <h2 className="test-title">{data.Adi || data.TestAdi}</h2>
                )}

                {/* 2. Answer Key */}
                {data.CevapAnahtari && (
                  <div className="answer-key-container">
                    <h3 className="section-label">Cevap Anahtarı</h3>
                    <div className="answer-key-grid">
                      {data.CevapAnahtari.split("").map((answer, index) => (
                        <div key={index} className="answer-item">
                          <span className="q-num">{index + 1}</span>
                          <span className="q-ans">{answer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Questions */}
                {data.Sorular && Array.isArray(data.Sorular) ? (
                  <div className="questions-grid">
                    {data.Sorular.map((soru, index) => {
                      if (soru.SoruResmi || soru.URL) {
                        const imageUrl = soru.URL || soru.SoruResmi;
                        return (
                          <div key={index} className="question-card">
                            <div className="question-number">{index + 1}</div>
                            <img
                              src={imageUrl}
                              alt={`Soru ${index + 1}`}
                              loading="lazy"
                              style={{ cursor: "pointer" }}
                              onClick={() => setModalImage(imageUrl)}
                            />
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                ) : (
                  // Fallback if no questions found but data exists
                  !data.Sorular && <pre>{JSON.stringify(data, null, 2)}</pre>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Modal */}
      {modalImage && (
        <div className="modal" style={{ display: "block" }} onClick={() => setModalImage(null)}>
          <span className="close" onClick={() => setModalImage(null)}>&times;</span>
          <img className="modal-content" src={modalImage} alt="Full size" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </main>
  );
}
