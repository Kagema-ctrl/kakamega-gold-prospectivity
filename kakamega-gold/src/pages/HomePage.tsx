import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGeoData } from '../hooks/useGeoData'
import { computeHomeStats } from '../utils/dataUtils'
import MapSwipe from '../components/MapSwipe'
import StatCard from '../components/StatCard'

/* ── Fade-up observer hook ──────────────────────── */
function useFadeUp() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.fade-up')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.15 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

/* ── Section components ─────────────────────────── */

function HeroSection() {
  return (
    <section
      className="snap-section"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 40% 60%, #2a1f00 0%, #1a0e00 40%, #0d0900 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '80px 24px 0',
      }}
    >
      {/* Subtle grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,179,0,0.06) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', maxWidth: 860, margin: '0 auto' }}>
        <div style={{
          fontSize: 13, fontWeight: 600, letterSpacing: '0.25em',
          color: '#FF8C00', textTransform: 'uppercase', marginBottom: 24,
        }}>
          Kakamega County, Kenya &nbsp;·&nbsp; Machine Learning Prospectivity
        </div>

        <h1
          className="shimmer-text"
          style={{
            fontSize: 'clamp(52px, 10vw, 100px)',
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
            marginBottom: 32,
          }}
        >
          GOLD IN<br />KAKAMEGA
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 22px)',
          color: '#FFF8E1',
          opacity: 0.85,
          lineHeight: 1.7,
          maxWidth: 620, margin: '0 auto 48px',
        }}>
          A machine learning approach to mineral prospectivity mapping
          in western Kenya's ancient greenstone terrane.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'RF Model', value: 'Random Forest' },
            { label: 'Classifier', value: 'SVM' },
            { label: 'Prospectivity Classes', value: '5' },
            { label: 'Sub-Counties', value: '9' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'rgba(42,31,0,0.7)',
              border: '1px solid #5C3D00',
              borderRadius: 8,
              padding: '10px 20px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#FFB300', fontWeight: 700, fontSize: 16 }}>{value}</div>
              <div style={{ color: '#D4A017', fontSize: 11, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll arrow */}
      <div className="bounce-arrow" style={{
        position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
        color: '#FFB300', fontSize: 28,
      }}>
        ↓
      </div>
    </section>
  )
}

function GoldenBeltSection() {
  return (
    <section
      className="snap-section"
      style={{
        minHeight: '100vh',
        background: '#0d0900',
        display: 'flex', alignItems: 'stretch',
      }}
    >
      {/* Left — image placeholder */}
      <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(135deg, #1a0e00 0%, #2a1f00 50%, #1a0e00 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', minHeight: '100vh',
      }}>
        {/* USER_IMAGE_PLACEHOLDER — replace src with actual image path */}
        <img
          src="/images/kakamega_geology.jpg"
          alt="Kakamega geological map"
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', position: 'absolute', inset: 0,
            opacity: 0.6,
          }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        {/* Placeholder shown when image not found */}
        <div style={{
          position: 'relative', zIndex: 1,
          textAlign: 'center', padding: 40,
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🗺️</div>
          <div style={{ color: '#5C3D00', fontSize: 13, fontStyle: 'italic' }}>
            USER_IMAGE_PLACEHOLDER<br />
            Drop geology map image at<br />
            <code style={{ color: '#FFB300', fontSize: 11 }}>/public/images/kakamega_geology.jpg</code>
          </div>
        </div>
      </div>

      {/* Right — narrative */}
      <div style={{
        flex: 1,
        padding: 'clamp(48px, 8vh, 100px) clamp(32px, 5vw, 80px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div className="fade-up" style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.2em',
          color: '#FF8C00', textTransform: 'uppercase', marginBottom: 20,
        }}>
          The Geological Setting
        </div>

        <h2 className="fade-up" style={{
          fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.15,
          color: '#FFD700', marginBottom: 28,
        }}>
          The Golden Belt
        </h2>

        {[
          `Kakamega County sits within the Lake Victoria Goldfields, one of East Africa's most significant geological terranes — a Archaean-Proterozoic orogenic belt stretching from Uganda through western Kenya into Tanzania.`,
          `The Nzoia greenstone belt hosts a diverse assemblage of lithologies: contaminated and sheared granites, basalts, andesites, rhyolites, mudstones, and syenites — many of which provide the structural and geochemical conditions favourable for orogenic gold mineralisation.`,
          `Gold occurrences in Kakamega have been documented since colonial times. Modern exploration has accelerated following Kenya's transformative 2016 Mining Act, which streamlined licensing and attracted international junior explorers including Shanta Gold and Gold Rim Exploration.`,
        ].map((text, i) => (
          <p key={i} className="fade-up" style={{
            color: '#FFF8E1', fontSize: 15, lineHeight: 1.9, marginBottom: 20,
            opacity: 0.9,
          }}>
            {text}
          </p>
        ))}

        {/* Pull quote */}
        <blockquote className="fade-up" style={{
          borderLeft: '3px solid #FFB300',
          paddingLeft: 20, marginTop: 16,
          fontFamily: 'Playfair Display, serif',
          fontSize: 19, fontStyle: 'italic',
          color: '#FFD700', lineHeight: 1.6,
        }}>
          "Kakamega sits atop one of East Africa's most promising gold corridors."
        </blockquote>
      </div>
    </section>
  )
}

interface MLSectionProps {
  rfHighArea:  number
  svmHighArea: number
  consensus:   number
}

function MLModelsSection({ rfHighArea, svmHighArea, consensus }: MLSectionProps) {
  return (
    <section className="snap-section" style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0d0900 0%, #120c00 100%)',
      display: 'flex', alignItems: 'center',
      padding: '80px clamp(24px, 5vw, 80px)',
      gap: 60, flexWrap: 'wrap',
    }}>
      {/* Left — narrative */}
      <div style={{ flex: '1 1 400px', maxWidth: 560 }}>
        <div className="fade-up" style={{
          fontSize: 11, color: '#FF8C00', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 20,
        }}>
          Machine Learning Models
        </div>
        <h2 className="fade-up" style={{
          fontSize: 'clamp(28px, 4vw, 44px)', color: '#FFD700',
          lineHeight: 1.2, marginBottom: 28,
        }}>
          Two Models.<br />One Ground Truth.
        </h2>
        {[
          `Two complementary machine learning algorithms were independently trained on integrated geochemical, lithological, and structural datasets covering the entire county — delivering a multi-evidence approach to gold targeting.`,
          `Random Forest (RF) is an ensemble decision-tree classifier that handles non-linear geochemical relationships and is robust to noise. Support Vector Machine (SVM) uses a kernel-based hyperplane to partition geochemical feature space with maximum margin.`,
          `Each model independently classified prospectivity into five classes: Very Low → Low → Moderate → High → Very High. Where both models agree on High or Very High, the confidence is greatest — defining a consensus zone of 202.4 km².`,
        ].map((t, i) => (
          <p key={i} className="fade-up" style={{
            color: '#FFF8E1', fontSize: 15, lineHeight: 1.9, opacity: 0.9, marginBottom: 18,
          }}>
            {t}
          </p>
        ))}
      </div>

      {/* Right — stat cards */}
      <div style={{
        flex: '1 1 300px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <StatCard
          value={rfHighArea}
          label="High + Very High Area — Random Forest"
          icon="🌲"
          decimals={1}
          accent="#FFB300"
        />
        <StatCard
          value={svmHighArea}
          label="High + Very High Area — SVM"
          icon="⚙️"
          decimals={1}
          accent="#FF8C00"
        />
        <StatCard
          value={consensus}
          label="RF + SVM Consensus Zone"
          icon="🎯"
          decimals={1}
          accent="#FFD700"
          subtitle="Highest-confidence targeting area"
        />
      </div>
    </section>
  )
}

interface SwipeSectionProps {
  rfData:  ReturnType<typeof useGeoData>['rf']
  svmData: ReturnType<typeof useGeoData>['svm']
}

function SwipeMapSection({ rfData, svmData }: SwipeSectionProps) {
  return (
    <section className="snap-section" style={{
      minHeight: '100vh',
      background: '#0d0900',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '28px 40px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #2a1f00', flexShrink: 0,
      }}>
        <div>
          <h2 style={{ fontSize: 22, color: '#FFD700', marginBottom: 4 }}>
            RF vs SVM — Side-by-Side
          </h2>
          <p style={{ color: '#D4A017', fontSize: 13 }}>
            Drag the handle to compare both model outputs over the same area
          </p>
        </div>
        <div style={{
          display: 'flex', gap: 16, fontSize: 12, color: '#D4A017',
        }}>
          <span>⬅ Random Forest</span>
          <span>|</span>
          <span>SVM ➡</span>
        </div>
      </div>

      {/* Map takes remaining height */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {rfData && svmData
          ? <MapSwipe rfData={rfData} svmData={svmData} />
          : (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100%', flexDirection: 'column', gap: 16,
            }}>
              <div className="gold-spinner" />
              <span style={{ color: '#D4A017', fontSize: 13 }}>Loading map data…</span>
            </div>
          )
        }
      </div>
    </section>
  )
}

interface GeochemSectionProps {
  means: { As: number; Sb: number; Ag: number }
}

function GeochemSection({ means }: GeochemSectionProps) {
  const cards = [
    {
      symbol: 'As', name: 'Arsenic',
      value: means.As, unit: 'ppm',
      desc: 'Classic gold pathfinder element; elevated As anomalies trace orogenic shear zones and quartz-carbonate veins where free gold precipitates.',
      icon: '⚗️',
    },
    {
      symbol: 'Sb', name: 'Antimony',
      value: means.Sb, unit: 'ppm',
      desc: 'Co-precipitates with gold during hydrothermal fluid cooling. High Sb/As ratios indicate epithermal-style overprinting on orogenic gold systems.',
      icon: '🧪',
    },
    {
      symbol: 'Ag', name: 'Silver',
      value: means.Ag, unit: 'ppb',
      desc: 'Direct gold indicator — elevated Ag in soil and stream sediments reflects Au-Ag telluride mineralisation at depth.',
      icon: '✨',
    },
  ]

  return (
    <section className="snap-section golden-grid" style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '80px clamp(24px, 5vw, 80px)',
      textAlign: 'center',
    }}>
      <div className="fade-up" style={{
        fontSize: 11, color: '#FF8C00', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 20,
      }}>
        Geochemical Signature
      </div>
      <h2 className="fade-up" style={{
        fontSize: 'clamp(28px, 5vw, 52px)', color: '#FFD700', marginBottom: 16,
      }}>
        The Earth Speaks in Elements
      </h2>
      <p className="fade-up" style={{
        color: '#FFF8E1', fontSize: 16, lineHeight: 1.8, opacity: 0.85,
        maxWidth: 680, marginBottom: 56,
      }}>
        Pathfinder element anomalies in soil and stream-sediment geochemistry reveal
        the hidden geometry of gold-bearing hydrothermal systems — guiding drill targeting
        in Kakamega's complex greenstone terrane.
      </p>

      <div style={{
        display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center',
        maxWidth: 900,
      }}>
        {cards.map(({ symbol, name, value, unit, desc, icon }) => (
          <div key={symbol} className="fade-up" style={{
            flex: '1 1 240px',
            background: '#1a1200',
            border: '1px solid #5C3D00',
            borderRadius: 16, padding: '28px 24px',
            textAlign: 'left',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#FFB300'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 20px rgba(255,179,0,0.2)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#5C3D00'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
            }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8,
            }}>
              <span style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 28, fontWeight: 700, color: '#FFD700',
              }}>
                {value.toFixed(2)}
              </span>
              <span style={{ color: '#D4A017', fontSize: 13 }}>{unit}</span>
            </div>
            <div style={{ color: '#FFB300', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              {symbol} — {name}
            </div>
            <div style={{ fontSize: 11, color: '#D4A017', marginBottom: 12, fontStyle: 'italic' }}>
              Mean in High + Very High zones
            </div>
            <p style={{ color: '#FFF8E1', fontSize: 13, lineHeight: 1.7, opacity: 0.85 }}>
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function CTASection() {
  const navigate = useNavigate()

  const cards = [
    {
      title: 'Geological Analysis',
      emoji: '🔬',
      desc: 'Deep-dive into model accuracy, lithological controls, pathfinder element distributions, and sub-county prospectivity statistics.',
      audience: 'For geologists & researchers',
      path: '/geological',
      color: '#FFB300',
    },
    {
      title: 'Investor View',
      emoji: '📊',
      desc: 'Executive KPIs, license coverage analysis, priority unlicensed zones, and sub-county investment opportunity matrix.',
      audience: 'For mining companies & investors',
      path: '/investor',
      color: '#FF8C00',
    },
  ]

  return (
    <section className="snap-section" style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 80%, #2a1f00 0%, #0d0900 70%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '80px clamp(24px, 5vw, 80px)',
      textAlign: 'center',
    }}>
      <div className="fade-up" style={{
        fontSize: 11, color: '#FF8C00', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 20,
      }}>
        Explore the Data
      </div>
      <h2 className="fade-up" style={{
        fontSize: 'clamp(28px, 5vw, 52px)', color: '#FFD700', marginBottom: 16,
      }}>
        Where do you want to go?
      </h2>
      <p className="fade-up" style={{
        color: '#FFF8E1', fontSize: 16, lineHeight: 1.8, opacity: 0.8,
        maxWidth: 560, marginBottom: 56,
      }}>
        The same underlying prospectivity data — presented through two distinct lenses
        for two distinct audiences.
      </p>

      <div style={{
        display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center',
        maxWidth: 900,
      }}>
        {cards.map(({ title, emoji, desc, audience, path, color }) => (
          <div
            key={path}
            className="cta-card fade-up"
            onClick={() => navigate(path)}
            style={{
              flex: '1 1 320px', maxWidth: 420,
              background: '#1a1200',
              borderRadius: 20,
              padding: '40px 36px',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 20 }}>{emoji}</div>
            <h3 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 26, color, marginBottom: 12,
            }}>
              {title} →
            </h3>
            <p style={{
              color: '#FFF8E1', fontSize: 14, lineHeight: 1.8, opacity: 0.85, marginBottom: 24,
            }}>
              {desc}
            </p>
            <div style={{
              display: 'inline-block',
              background: `rgba(${color === '#FFB300' ? '255,179,0' : '255,140,0'},0.1)`,
              border: `1px solid ${color}`,
              borderRadius: 20, padding: '4px 14px',
              fontSize: 11, color,
            }}>
              {audience}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Main page ──────────────────────────────────── */

export default function HomePage() {
  const { rf, svm, loading } = useGeoData()
  const [stats, setStats] = useState({ rfHighArea: 0, svmHighArea: 0, consensusArea: 202.4, rfMeans: { As: 0, Sb: 0, Ag: 0 } })

  useFadeUp()

  useEffect(() => {
    if (rf && svm) {
      setStats(computeHomeStats(rf.features, svm.features))
    }
  }, [rf, svm])

  return (
    <div style={{ paddingTop: 60 }}>
      <HeroSection />
      <GoldenBeltSection />
      <MLModelsSection
        rfHighArea={loading ? 226.5 : stats.rfHighArea}
        svmHighArea={loading ? 0 : stats.svmHighArea}
        consensus={stats.consensusArea}
      />
      <SwipeMapSection rfData={rf} svmData={svm} />
      <GeochemSection means={stats.rfMeans} />
      <CTASection />
    </div>
  )
}
