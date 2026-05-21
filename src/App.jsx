import React, { useMemo, useState } from "react";

export default function App() {
  const [activePage, setActivePage] = useState("Ana Sayfa");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState("Tümü");
  const [blockCount, setBlockCount] = useState(3);

  const dashboard = result?.dashboard;
  const candidates = dashboard?.candidate_workers || [];
  const best = candidates[0];

  const runOptimization = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://tersane-arayuz.onrender.com/solve?block_count=${blockCount}`
      );
      const data = await response.json();
      setResult(data);
      setActivePage("Ana Sayfa");
    } catch (error) {
      alert("Backend bağlantı hatası oluştu.");
    }
    setLoading(false);
  };

  const filteredAssignments = useMemo(() => {
    if (!result) return [];
    if (selectedBlock === "Tümü") return result.assignments || [];
    return result.assignments.filter((a) => String(a.block) === selectedBlock);
  }, [result, selectedBlock]);

  return (
    <div style={page}>
      <aside style={sidebar}>
        <h1 style={logo}>⚓ TERSANE</h1>

        {["Ana Sayfa", "İş Adımları", "İşçiler", "Atama Analizi", "Sonuçlar", "Raporlar", "Ayarlar"].map((p) => (
          <button
            key={p}
            style={activePage === p ? activeBtn : menuBtn}
            onClick={() => setActivePage(p)}
          >
            {p}
          </button>
        ))}

        <div style={sideInfo}>
          <h3>Model Bilgileri</h3>
          <p>Blok Sayısı: {result ? result.block_count : blockCount}</p>
          <p>İş Adımı Sayısı: 11</p>
          <p>İşçi Sayısı: 51</p>
          <p>Sertifika Türü: 15</p>
          <p>Model: Gurobi Optimizer</p>
          <p>Durum: {result ? result.status : "Bekleniyor"}</p>
        </div>
      </aside>

      <main style={main}>
        <div style={topBar}>
          <div>
            <h1 style={title}>TERSANE İŞGÜCÜ KARAR DESTEK SİSTEMİ</h1>
            <p style={subtitle}>En uygun işçi ataması için çok kriterli optimizasyon</p>
          </div>

          <div style={statusBox}>
            <b>Model Durumu</b>
            <p style={{ color: result ? "#16a34a" : "#64748b" }}>
              ● {result ? "Optimum Çözüldü" : "Bekleniyor"}
            </p>
          </div>
        </div>

        {activePage === "Ana Sayfa" && (
          <>
            <div style={filters}>
              <div>
                <label style={label}>Blok Sayısı</label>
                <input
                  type="number"
                  min="1"
                  max="35"
                  value={blockCount}
                  onChange={(e) => setBlockCount(e.target.value)}
                  style={input}
                />
              </div>

              <div>
                <label style={label}>Öncelik Yapısı</label>
                <select style={select}>
                  <option>Dengeli Amaç Fonksiyonu</option>
                  <option>Temin Süresi Öncelikli</option>
                  <option>Ergonomi Öncelikli</option>
                  <option>Sertifika Öncelikli</option>
                  <option>İş Yükü Dengesi Öncelikli</option>
                </select>
              </div>

              <button style={runBtn} onClick={runOptimization}>
                {loading ? "Model Çalışıyor..." : "▷ Analiz Çalıştır"}
              </button>
            </div>

            {!result || !dashboard ? (
              <div style={emptyDashboard}>
                Analiz çalıştırıldığında uygun işçi önerisi, karşılaştırma tablosu ve grafikler otomatik olarak oluşturulacaktır.
              </div>
            ) : (
              <>
                <div style={metricGrid}>
                  <Metric icon="👥" title="Uygun İşçi Sayısı" value={`${dashboard.eligible_workers} / ${dashboard.total_workers}`} note="Sertifika uygun işçi" />
                  <Metric icon="⏱️" title="En İyi İşlem Süresi" value={`${dashboard.best_duration} saat`} note="Tahmini süre" />
                  <Metric icon="💛" title="En Düşük Ergonomik Risk" value={`${dashboard.min_ert} / 100`} note="ERT değeri" />
                  <Metric icon="⭐" title="En Yüksek Uygunluk Skoru" value={dashboard.best_score} note="0-1 arası normalize skor" />
                  <Metric icon="✅" title="Model Sonucu" value={result.status} note="Çözüm bulundu" green />
                </div>

                <div style={analysisGrid}>
                  <div style={recommendCard}>
                    <h3 style={{ color: "#15803d" }}>☘ EN UYGUN İŞÇİ ÖNERİSİ</h3>

                    <div style={recommendInner}>
                      <div style={avatar}>👷</div>
                      <h1>{dashboard.best_worker}</h1>
                      <span style={bestBadge}>En Uygun İşçi</span>
                      <p>⭐⭐⭐⭐⭐</p>
                      <p>Uygunluk Skoru</p>
                      <h2>{dashboard.best_score} / 1.000</h2>
                    </div>

                    <div style={miniInfo}>
                      <p>İşlem Süresi <b>{best?.duration ?? "-"} saat</b></p>
                      <p>Sertifika Uygunluğu <b>{best?.cert ?? "-"}%</b></p>
                      <p>Ergonomik Risk <b>{best?.ert ?? "-"}</b></p>
                      <p>Tekrar Atama Riski <b>{best?.repeat ?? "-"}</b></p>
                    </div>

                    <div style={successNote}>
                      ✅ Bu işçi seçildiğinde modelin toplam amacına en iyi katkı sağlanmaktadır.
                    </div>
                  </div>

                  <div style={tableCard}>
                    <h3>ADAY İŞÇİ KARŞILAŞTIRMASI</h3>
                    <table style={table}>
                      <thead>
                        <tr>
                          {["Sıra", "İşçi", "Sertifika (%)", "ERT", "Yorgunluk", "Tercih", "Süre", "Tekrar", "Skor"].map((h) => (
                            <th style={th} key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {candidates.map((row, i) => (
                          <tr key={i} style={i === 0 ? bestRow : {}}>
                            <td style={td}>{row.rank}</td>
                            <td style={td}>{row.worker}</td>
                            <td style={td}>{row.cert}</td>
                            <td style={td}>{row.ert}</td>
                            <td style={td}>{row.fatigue}</td>
                            <td style={td}>{row.cost}</td>
                            <td style={td}>{row.duration}</td>
                            <td style={td}>{row.repeat}</td>
                            <td style={td}>{row.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={bottomGrid}>
                  <div style={chartCard}>
                    <h3>KRİTERLERE GÖRE SKOR DAĞILIMI</h3>
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

                  <div style={chartCard}>
                    <h3>İŞÇİLERİN ERGONOMİK RİSK DAĞILIMI</h3>
                    <div style={riskBars}>
                      <RiskBar h="25%" v="2" label="0-20" />
                      <RiskBar h="45%" v="6" label="20-40" />
                      <RiskBar h="70%" v="14" label="40-60" />
                      <RiskBar h="90%" v="18" label="60-80" />
                      <RiskBar h="60%" v="11" label="80-100" />
                    </div>
                  </div>

                  <div style={chartCard}>
                    <h3>SEÇİLEN İŞ ADIMI BİLGİLERİ</h3>
                    <Info label="İş Adımı" value={dashboard.selected_job} />
                    <Info label="Kapasite" value={dashboard.capacity} />
                    <Info label="Uygun İşçi Sayısı" value={dashboard.eligible_workers} />
                    <Info label="Atanacak İşçi Sayısı" value={dashboard.assigned_worker_count} />
                    <div style={infoNote}>
                      ℹ️ Aynı işçinin aynı iş adımına ardışık bloklarda atanması kısıtlanmıştır.
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {activePage === "İş Adımları" && (
          <section style={panel}>
            <h2>İş Adımları</h2>
            <p>CNC Ön İmalat → CNC Panel → Ön İmalat / Panel → Blok İmalat → Ön Donatım → Erection → Boya</p>
          </section>
        )}

        {activePage === "İşçiler" && (
          <section style={panel}>
            <h2>İşçi Bilgi Ekranı</h2>
            <p>Modelde 51 işçi ve 15 sertifika türü dikkate alınmaktadır.</p>
          </section>
        )}

        {activePage === "Atama Analizi" && (
          <section style={panel}>
            <h2>Blok Bazlı Atama Analizi</h2>
            {!result ? <p>Önce Ana Sayfa üzerinden modeli çalıştır.</p> : (
              <>
                <select style={{ ...select, marginBottom: 20 }} value={selectedBlock} onChange={(e) => setSelectedBlock(e.target.value)}>
                  <option>Tümü</option>
                  {[...new Set(result.assignments.map((a) => a.block))].map((b) => <option key={b}>{b}</option>)}
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
            {!result ? <p>Henüz model çalıştırılmadı.</p> : (
              <div style={metricGrid}>
                <Metric title="Çözüm Durumu" value={result.status} />
                <Metric title="Blok Sayısı" value={result.block_count} />
                <Metric title="Temin Süresi" value={result.temin_süresi} />
                <Metric title="Amaç Değeri" value={result.objective} />
              </div>
            )}
          </section>
        )}

        {activePage === "Raporlar" && (
          <section style={panel}>
            <h2>Rapor Özeti</h2>
            {!result ? (
              <p>Rapor oluşturmak için önce modeli çalıştır.</p>
            ) : (
              <p>
                Model {result.block_count} blok için çözülmüş, Temin Süresi değeri {result.cmax} ve amaç fonksiyonu değeri {result.objective} olarak elde edilmiştir.
              </p>
            )}
          </section>
        )}

        {activePage === "Ayarlar" && (
          <section style={panel}>
            <h2>Ayarlar</h2>
            <p>Bu bölümde ileride model ağırlıkları ve analiz seçenekleri düzenlenebilir.</p>
          </section>
        )}
      </main>
    </div>
  );
}

function Metric({ icon, title, value, note, green }) {
  return (
    <div style={metricCard}>
      <div style={metricIcon}>{icon}</div>
      <p>{title}</p>
      <h2 style={{ color: green ? "#16a34a" : "#0f172a" }}>{value}</h2>
      <small>{note}</small>
    </div>
  );
}

function RiskBar({ h, v, label }) {
  return (
    <div style={riskItem}>
      <div style={{ ...riskBar, height: h }}>{v}</div>
      <small>{label}</small>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={infoRow}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

const page = { display: "flex", minHeight: "100vh", background: "#f5f7fb", fontFamily: "Arial" };
const sidebar = { width: 250, background: "#071a2f", color: "white", padding: 25, position: "sticky", top: 0, height: "100vh" };
const logo = { fontSize: 30, marginBottom: 35 };
const main = { flex: 1, padding: "24px 34px", maxWidth: 1500, margin: "0 auto" };
const topBar = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 };
const title = { fontSize: 30, color: "#0f172a", margin: 0 };
const subtitle = { color: "#475569", marginTop: 6 };
const statusBox = { background: "white", padding: "12px 18px", borderRadius: 14, boxShadow: "0 4px 14px rgba(0,0,0,.06)" };
const menuBtn = { display: "block", width: "100%", marginBottom: 12, padding: 15, background: "#0d2b4d", color: "white", border: 0, borderRadius: 10, textAlign: "left", cursor: "pointer", fontSize: 15 };
const activeBtn = { ...menuBtn, background: "#0d63b8", fontWeight: "bold" };
const sideInfo = { marginTop: 55, lineHeight: 1.7, fontSize: 14 };
const filters = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 220px",
  gap: 22,
  background: "white",
  padding: 18,
  borderRadius: 14,
  marginBottom: 18,
  boxShadow: "0 3px 12px rgba(15,23,42,.07)",
  border: "1px solid #e5e7eb"
};
const label = { display: "block", fontWeight: "bold", marginBottom: 8 };
const input = { padding: 14, borderRadius: 10, border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box" };
const select = { padding: 14, borderRadius: 10, border: "1px solid #cbd5e1", width: "100%" };
const runBtn = { background: "#071a2f", color: "white", border: 0, borderRadius: 10, padding: "12px 22px", fontWeight: "bold", cursor: "pointer" };
const emptyDashboard = { background: "white", padding: 35, borderRadius: 16, textAlign: "center", color: "#64748b", boxShadow: "0 4px 14px rgba(0,0,0,.06)" };
const metricGrid = { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18, marginBottom: 22 };
const metricCard = {
  background: "white",
  padding: "18px 16px",
  borderRadius: 14,
  boxShadow: "0 3px 12px rgba(15,23,42,.08)",
  textAlign: "left",
  minHeight: 105,
  border: "1px solid #edf2f7"
};
const metricIcon = {
  fontSize: 30,
  width: 46,
  height: 46,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 12,
  background: "#ecfdf5",
  marginBottom: 6
};
const analysisGrid = {
  display: "grid",
  gridTemplateColumns: "0.9fr 2fr",
  gap: 18,
  marginBottom: 18
};
const recommendCard = { background: "white", padding: 22, borderRadius: 16, boxShadow: "0 4px 14px rgba(0,0,0,.08)" };
const recommendInner = {
  background: "linear-gradient(135deg, #ecfdf5, #ffffff)",
  border: "1px solid #bbf7d0",
  borderRadius: 14,
  textAlign: "center",
  padding: 18
};
const avatar = { fontSize: 60 };
const bestBadge = { background: "#bbf7d0", color: "#166534", padding: "8px 12px", borderRadius: 20, fontWeight: "bold" };
const miniInfo = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 14 };
const successNote = { background: "#dcfce7", padding: 14, borderRadius: 12, marginTop: 12 };
const tableCard = {
  background: "white",
  padding: 18,
  borderRadius: 14,
  boxShadow: "0 3px 12px rgba(15,23,42,.08)",
  border: "1px solid #edf2f7",
  overflowX: "auto"
};
const table = { width: "100%", borderCollapse: "collapse" };
const th = { padding: 12, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 13 };
const td = { padding: 12, border: "1px solid #e2e8f0", textAlign: "center", fontSize: 13 };
const bestRow = { background: "#dcfce7", fontWeight: "bold" };
const bottomGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1.15fr 1fr",
  gap: 18
};
const chartCard = {
  background: "white",
  padding: 18,
  borderRadius: 14,
  boxShadow: "0 3px 12px rgba(15,23,42,.08)",
  border: "1px solid #edf2f7",
  minHeight: 245
};
const tagArea = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 };
const tag = { background: "#ecfdf5", color: "#047857", padding: "10px 14px", borderRadius: 999, fontWeight: "bold", fontSize: 13 };
const riskBars = { height: 210, display: "flex", alignItems: "end", justifyContent: "space-around", gap: 10 };
const riskItem = { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 };
const riskBar = { width: 48, background: "#22c55e", color: "white", borderRadius: "10px 10px 0 0", display: "flex", alignItems: "start", justifyContent: "center", paddingTop: 8, fontWeight: "bold" };
const infoRow = { display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", padding: "10px 0" };
const infoNote = { background: "#eff6ff", color: "#1d4ed8", padding: 14, borderRadius: 12, marginTop: 16 };
const panel = { background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 14px rgba(0,0,0,.08)" };