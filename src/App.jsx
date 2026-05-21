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
  const [blockCount, setBlockCount] = useState(3);

  const runOptimization = async () => {
    setLoading(true);
    try {
      const response = await fetch(
  `https://tersane-arayuz.onrender.com/solve?block_count=${blockCount}`
)
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
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>

  <input
    type="number"
    min="1"
    max="35"
    value={blockCount}
    onChange={(e) => setBlockCount(e.target.value)}
    placeholder="Blok sayısı giriniz"
    style={{
      padding: "14px",
      borderRadius: "10px",
      border: "1px solid #cbd5e1",
      fontSize: "15px",
      width: "230px"
    }}
  />

  <span style={{ fontSize: "13px", color: "#64748b" }}>
    Gemi blok sayısı (1-35)
  </span>

</div>

              <select style={select}>
  <option>Dengeli Amaç Fonksiyonu</option>
  <option>Cmax Öncelikli</option>
  <option>Ergonomi Öncelikli</option>
  <option>Sertifika Öncelikli</option>
  <option>İş Yükü Dengesi Öncelikli</option>
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
    Bu karar destek sistemi, tersane üretim sürecinde blok bazlı iş adımları için uygun işçilerin atanmasını, işlem sıralarının korunmasını ve süre çakışmalarının önlenmesini amaçlamaktadır.
  </p>

{!result ? (
  <div style={emptyDashboard}>
    Analiz çalıştırıldığında grafikler otomatik olarak oluşturulacaktır.
  </div>
) : (
  <div style={dashboardGrid}>
    
    <div style={chartCard}>
      <h3>İş Adımlarına Göre Kapasite Dağılımı</h3>

      <div style={barRow}>
        <span>CNC</span>
        <div style={barBg}>
          <div style={{...barFill,  width: result ? "18%":"0%"}} />
        </div>
        <b>1</b>
      </div>

      <div style={barRow}>
        <span>Montaj</span>
        <div style={barBg}>
          <div style={{...barFill,  width: result ? "85%":"0%"}} />
        </div>
        <b>5-6</b>
      </div>

      <div style={barRow}>
        <span>Kaynak</span>
        <div style={barBg}>
          <div style={{...barFill, width: result ? "100%":"0%"}} />
        </div>
        <b>6</b>
      </div>

      <div style={barRow}>
        <span>Donatım</span>
        <div style={barBg}>
          <div style={{...barFill, width: result ? "65%":"0%"}} />
        </div>
        <b>4</b>
      </div>

    </div>

    <div style={chartCard}>
      <h3>Ergonomik Risk Dağılımı</h3>

      <div style={riskBars}>
        <div style={{...riskBar, height:"45%"}}>8</div>
        <div style={{...riskBar, height:"60%"}}>12</div>
        <div style={{...riskBar, height:"75%"}}>15</div>
        <div style={{...riskBar, height:"90%"}}>20</div>
      </div>

      <p style={smallText}>
        İş adımlarına göre ER/ERT seviyeleri
      </p>
    </div>

    <div style={chartCard}>
      <h3>Modelin Değerlendirdiği Kriterler</h3>

      <div style={tagArea}>
        <span style={tag}>Süre</span>
        <span style={tag}>Sertifika</span>
        <span style={tag}>Ergonomi</span>
        <span style={tag}>Yorgunluk</span>
        <span style={tag}>Tercih</span>
        <span style={tag}>İş Yükü Dengesi</span>
        <span style={tag}>Tekrar Atama</span>
      </div>
    </div>

  </div>
  )}
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
const td = {
  padding: 12,
  border: "1px solid #e2e8f0",
  textAlign: "center"
};

const dashboardGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "18px",
  marginTop: "22px"
};

const chartCard = {
  background: "#fff",
  borderRadius: "16px",
  padding: "22px",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
  border: "1px solid #e5e7eb"
};

const barRow = {
  display: "grid",
  gridTemplateColumns: "95px 1fr 35px",
  alignItems: "center",
  gap: "10px",
  marginBottom: "12px",
  fontSize: "14px"
};

const barBg = {
  height: "12px",
  background: "#e5e7eb",
  borderRadius: "999px",
  overflow: "hidden"
};

const barFill = {
  height: "100%",
  background: "#0f766e",
  borderRadius: "999px",
  transition: "width 1.2s ease"
};

const riskBars = {
  height: "150px",
  display: "flex",
  alignItems: "end",
  justifyContent: "space-around",
  gap: "14px",
  marginTop: "20px"
};

const riskBar = {
  width: "45px",
  background: "#2563eb",
  color: "white",
  borderRadius: "10px 10px 0 0",
  display: "flex",
  alignItems: "start",
  justifyContent: "center",
  paddingTop: "8px",
  fontWeight: "bold"
};

const smallText = {
  textAlign: "center",
  color: "#64748b",
  fontSize: "13px",
  marginTop: "14px"
};

const tagArea = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "18px"
};

const tag = {
  background: "#ecfdf5",
  color: "#047857",
  padding: "9px 12px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: "600"
};