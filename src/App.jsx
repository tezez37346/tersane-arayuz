import React, { useMemo, useState } from "react";

const workersData = [
  { id: "W1", cert: "Boya", skill: 90 },
  { id: "W2", cert: "Blok İmalat Kaynak", skill: 92 },
  { id: "W3", cert: "Panel Kaynak", skill: 88 },
  { id: "W4", cert: "CNC Ön İmalat", skill: 95 },
  { id: "W5", cert: "Boya", skill: 84 },
  { id: "W6", cert: "Erection", skill: 89 },
  { id: "W7", cert: "Blok İmalat Kaynak", skill: 91 },
  { id: "W8", cert: "Panel Kaynak", skill: 93 },
  { id: "W9", cert: "CNC Ön İmalat", skill: 90 },
  { id: "W10", cert: "Boya", skill: 87 },
  { id: "W11", cert: "Erection", skill: 94 },
  { id: "W12", cert: "Panel Kaynak", skill: 86 },
];

export default function App() {
  const [activePage, setActivePage] = useState("Ana Sayfa");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState("Tümü");

  const runOptimization = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/solve?block_count=35");
      const data = await response.json();
      setResult(data);
      setActivePage("Atama Analizi");
    } catch (error) {
      alert("Backend bağlantı hatası oluştu.");
    }
    setLoading(false);
  };

  const filteredAssignments = useMemo(() => {
    if (!result) return [];
    if (selectedBlock === "Tümü") return result.assignments;
    return result.assignments.filter((a) => String(a.block) === selectedBlock);
  }, [result, selectedBlock]);

  return (
    <div style={page}>
      <aside style={sidebar}>
        <h1 style={logo}>⚓ TERSANE</h1>

        {["Ana Sayfa", "İşçiler", "Atama Analizi", "Sonuçlar", "Raporlar"].map((p) => (
          <button
            key={p}
            style={activePage === p ? activeBtn : menuBtn}
            onClick={() => setActivePage(p)}
          >
            {p}
          </button>
        ))}

        <div style={sideInfo}>
          <p>İşçi Sayısı: 51</p>
          <p>İş Adımı: 11</p>
          <p>Sertifika Türü: 15</p>
          <p>Model: Gurobi Optimizer</p>
          <p>Durum: {result ? result.status : "Bekleniyor"}</p>
        </div>
      </aside>

      <main style={main}>
        <h1 style={title}>TERSANE İŞGÜCÜ KARAR DESTEK SİSTEMİ</h1>
        <p style={subtitle}>Çok kriterli işgücü atama ve çizelgeleme arayüzü</p>

        {activePage === "Ana Sayfa" && (
          <>
            <div style={filters}>
              <select style={select}>
                <option>Yeni Gemi - 3 Blok Test</option>
                <option>Yeni Gemi - 35 Blok</option>
              </select>

              <select style={select}>
                <option>Dengeli Amaç Fonksiyonu</option>
                <option>Cmax Öncelikli</option>
                <option>Ergonomi Öncelikli</option>
                <option>Sertifika Öncelikli</option>
              </select>

              <button style={runBtn} onClick={runOptimization}>
                {loading ? "Model Çalışıyor..." : "Analiz Çalıştır"}
              </button>
            </div>

            <div style={cards}>
              <Card title="Model Durumu" value={result ? result.status : "Hazır"} />
              <Card title="Blok Sayısı" value={result ? result.block_count : "-"} />
              <Card title="Cmax" value={result ? result.cmax : "-"} />
              <Card title="Amaç Değeri" value={result ? result.objective : "-"} />
            </div>

            <section style={panel}>
              <h2>Arayüz Amacı</h2>
              <p>
                Bu karar destek sistemi, tersane üretim sürecinde blok bazlı iş adımları için uygun işçilerin
                atanmasını, işlem sıralarının korunmasını ve süre çakışmalarının önlenmesini amaçlamaktadır.
              </p>
            </section>
          </>
        )}

        {activePage === "İşçiler" && (
          <section style={panel}>
            <h2>İşçi Bilgi Ekranı</h2>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>İşçi</th>
                  <th style={th}>Ana Uygunluk Alanı</th>
                  <th style={th}>Yetenek Skoru</th>
                </tr>
              </thead>
              <tbody>
                {workersData.map((w) => (
                  <tr key={w.id}>
                    <td style={td}>{w.id}</td>
                    <td style={td}>{w.cert}</td>
                    <td style={td}>{w.skill}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activePage === "Atama Analizi" && (
          <section style={panel}>
            <h2>Blok Bazlı Atama Analizi</h2>

            {!result ? (
              <p>Önce Ana Sayfa üzerinden modeli çalıştır.</p>
            ) : (
              <>
                <select
                  style={{ ...select, marginBottom: 20 }}
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                >
                  <option>Tümü</option>
                  {[...new Set(result.assignments.map((a) => a.block))].map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>

                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Blok</th>
                      <th style={th}>İş</th>
                      <th style={th}>Atanan İşçiler</th>
                      <th style={th}>Başlangıç</th>
                      <th style={th}>Bitiş</th>
                      <th style={th}>Süre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((a, i) => (
                      <tr key={i}>
                        <td style={td}>{a.block}</td>
                        <td style={td}>{a.job}</td>
                        <td style={td}>{a.workers.join(", ")}</td>
                        <td style={td}>{a.start}</td>
                        <td style={td}>{a.finish}</td>
                        <td style={td}>{a.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </section>
        )}

        {activePage === "Sonuçlar" && (
          <section style={panel}>
            <h2>Optimizasyon Sonuçları</h2>

            {!result ? (
              <p>Henüz model çalıştırılmadı.</p>
            ) : (
              <div style={cards}>
                <Card title="Çözüm Durumu" value={result.status} />
                <Card title="Blok Sayısı" value={result.block_count} />
                <Card title="Cmax" value={result.cmax} />
                <Card title="Amaç Değeri" value={result.objective} />
              </div>
            )}
          </section>
        )}

        {activePage === "Raporlar" && (
          <section style={panel}>
            <h2>Tez Rapor Yorumu</h2>

            {!result ? (
              <p>Rapor oluşturmak için önce modeli çalıştır.</p>
            ) : (
              <p>
                Geliştirilen karar destek sistemi ile {result.block_count} blok için işgücü atama ve çizelgeleme
                problemi çözülmüş, model {result.status} çözüm durumuna ulaşmıştır. Elde edilen çözümde toplam
                tamamlanma süresi Cmax = {result.cmax} olarak bulunmuştur. Atama sonuçları incelendiğinde iş
                adımları arasındaki öncelik ilişkilerinin korunduğu, blok bazlı işlem sırasının sağlandığı ve işçilerin
                belirlenen kapasite kısıtları altında görevlendirildiği görülmektedir.
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={card}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

const page = { display: "flex", minHeight: "100vh", background: "#f5f7fb", fontFamily: "Arial" };
const sidebar = { width: 260, background: "#071a2f", color: "white", padding: 25 };
const logo = { fontSize: 32, marginBottom: 35 };
const main = { flex: 1, padding: 35 };
const title = { fontSize: 34, color: "#0f172a" };
const subtitle = { color: "#475569", marginBottom: 25 };
const menuBtn = { display: "block", width: "100%", marginBottom: 10, padding: 15, background: "#0d2b4d", color: "white", border: 0, borderRadius: 10, textAlign: "left", cursor: "pointer" };
const activeBtn = { ...menuBtn, background: "#0d63b8", fontWeight: "bold" };
const sideInfo = { marginTop: 45, lineHeight: 1.8, fontSize: 14 };
const filters = { display: "flex", gap: 20, background: "white", padding: 20, borderRadius: 15, marginBottom: 20 };
const select = { padding: 13, borderRadius: 10, border: "1px solid #cbd5e1", minWidth: 230 };
const runBtn = { background: "#071a2f", color: "white", border: 0, borderRadius: 10, padding: "12px 22px", fontWeight: "bold", cursor: "pointer" };
const cards = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 20 };
const card = { background: "white", padding: 22, borderRadius: 15, boxShadow: "0 2px 8px rgba(0,0,0,.08)", textAlign: "center" };
const panel = { background: "white", borderRadius: 15, padding: 25, boxShadow: "0 2px 8px rgba(0,0,0,.08)", marginBottom: 20 };
const table = { width: "100%", borderCollapse: "collapse", marginTop: 15 };
const th = { padding: 12, border: "1px solid #e2e8f0", background: "#f1f5f9" };
const td = { padding: 12, border: "1px solid #e2e8f0", textAlign: "center" };