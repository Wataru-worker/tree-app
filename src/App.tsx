import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Calculator, Flame, TrendingDown, TrendingUp } from 'lucide-react'

type Sex = 'male' | 'female'
type Screen = 'form' | 'result'

type FormState = {
  sex: Sex
  age: string
  height: string
  weight: string
  bodyFat: string
  activity: string
}

const activityOptions = [
  { label: 'デスクワーク中心（ほとんど運動しない）', value: 1.2 },
  { label: '軽い運動（週1〜2回）', value: 1.375 },
  { label: '中強度の運動（週3〜5回）', value: 1.55 },
  { label: '高強度の運動（週5〜6回）', value: 1.725 },
  { label: 'アスリートレベル（1日2回）', value: 1.9 },
]

function roundToNearest5(num: number) {
  return Math.round(num / 5) * 5
}

function calculateBMR({
  sex,
  age,
  height,
  weight,
  bodyFat,
}: {
  sex: Sex
  age: number
  height: number
  weight: number
  bodyFat?: number | null
}) {
  if (bodyFat !== null && bodyFat !== undefined && !Number.isNaN(bodyFat) && bodyFat > 0 && bodyFat < 70) {
    const leanBodyMass = weight * (1 - bodyFat / 100)
    return 370 + 21.6 * leanBodyMass
  }

  if (sex === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5
  }

  return 10 * weight + 6.25 * height - 5 * age - 161
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <section className="stat-card">
      <div className="stat-card__header">
        {icon}
        <p>{title}</p>
      </div>
      <p className="stat-card__value">{value}</p>
    </section>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('form')
  const [form, setForm] = useState<FormState>({
    sex: 'male',
    age: '25',
    height: '170',
    weight: '65',
    bodyFat: '',
    activity: '1.2',
  })

  const parsed = useMemo(() => {
    const age = Number(form.age)
    const height = Number(form.height)
    const weight = Number(form.weight)
    const bodyFat = form.bodyFat === '' ? null : Number(form.bodyFat)
    const activity = Number(form.activity)

    if (!age || !height || !weight || !activity) return null
    if (age <= 0 || height <= 0 || weight <= 0) return null

    const bmr = calculateBMR({
      sex: form.sex,
      age,
      height,
      weight,
      bodyFat,
    })

    const tdee = bmr * activity
    const bmi = weight / ((height / 100) * (height / 100))

    const cutStrong = tdee - weight * 11
    const cutCenter = tdee - weight * 7.7
    const cutMild = tdee - weight * 5.5
    const gainLow = tdee + weight * 2.75
    const gainHigh = tdee + weight * 5.5

    const activityCalories = activityOptions.map((option) => ({
      ...option,
      calories: roundToNearest5(bmr * option.value),
      isSelected: option.value === activity,
    }))

    const bmiCategory =
      bmi < 18.5 ? '低体重' :
      bmi < 25 ? '普通体重' :
      bmi < 30 ? '肥満（1度）' : '肥満'

    return {
      age,
      height,
      weight,
      bodyFat,
      activity,
      bmr,
      bmi,
      bmiCategory,
      maintain: roundToNearest5(tdee),
      maintainWeekly: roundToNearest5(tdee * 7),
      activityCalories,
      cutRange: {
        low: roundToNearest5(cutStrong),
        center: roundToNearest5(cutCenter),
        high: roundToNearest5(cutMild),
      },
      gainRange: {
        low: roundToNearest5(gainLow),
        high: roundToNearest5(gainHigh),
      },
    }
  }, [form])

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const selectedActivityLabel = activityOptions.find((item) => String(item.value) === form.activity)?.label

  return (
    <div className="page-shell">
      <div className="app-container">
        {screen === 'form' ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <section className="panel">
              <header className="panel__header">
                <div className="title-row">
                  <Calculator size={28} />
                  <h1>TDEE計算ツール</h1>
                </div>
                <p className="lead">
                  1日の消費カロリー（TDEE）を計算します。BMIや基礎代謝もあわせて確認できます。
                </p>
              </header>

              <div className="panel__content form-grid">
                <div>
                  <label className="field-label">性別</label>
                  <div className="segmented">
                    <button className={form.sex === 'male' ? 'segmented active' : 'segmented'} onClick={() => handleChange('sex', 'male')} type="button">男性</button>
                    <button className={form.sex === 'female' ? 'segmented active' : 'segmented'} onClick={() => handleChange('sex', 'female')} type="button">女性</button>
                  </div>
                </div>

                <div>
                  <label className="field-label" htmlFor="age">年齢</label>
                  <input id="age" className="text-input" type="number" value={form.age} onChange={(e) => handleChange('age', e.target.value)} placeholder="25" />
                </div>

                <div>
                  <label className="field-label" htmlFor="height">身長 (cm)</label>
                  <input id="height" className="text-input" type="number" value={form.height} onChange={(e) => handleChange('height', e.target.value)} placeholder="170" />
                </div>

                <div>
                  <label className="field-label" htmlFor="weight">体重 (kg)</label>
                  <input id="weight" className="text-input" type="number" value={form.weight} onChange={(e) => handleChange('weight', e.target.value)} placeholder="65" />
                </div>

                <div>
                  <label className="field-label" htmlFor="bodyfat">体脂肪率（任意）</label>
                  <input id="bodyfat" className="text-input" type="number" value={form.bodyFat} onChange={(e) => handleChange('bodyFat', e.target.value)} placeholder="例: 20" />
                  <p className="help-text">入力した場合は体脂肪率も考慮して計算します。</p>
                </div>

                <div>
                  <label className="field-label" htmlFor="activity">活動量</label>
                  <select id="activity" className="select-input" value={form.activity} onChange={(e) => handleChange('activity', e.target.value)}>
                    {activityOptions.map((option) => (
                      <option key={option.label} value={String(option.value)}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <button className="primary-button" type="button" disabled={!parsed} onClick={() => parsed && setScreen('result')}>
                  計測する
                </button>

                <section className="info-box">
                  <p>
                    TDEE（Total Daily Energy Expenditure）は、1日に消費する総カロリーの目安です。
                    基礎代謝（BMR）に日常の活動量を掛けて計算されます。
                  </p>
                  <div className="info-stack">
                    <div>
                      <p className="info-title">基礎代謝（約70%）</p>
                      <p>何もしていなくても消費されるエネルギーです。</p>
                    </div>
                    <div>
                      <p className="info-title">運動・日常活動（約20%）</p>
                      <p>歩行、運動、家事などで消費されるエネルギーです。</p>
                    </div>
                    <div>
                      <p className="info-title">食事誘発性熱産生（TEF）（約10%）</p>
                      <p>食べたものを消化・吸収する際に消費されるエネルギーです。</p>
                    </div>
                  </div>
                </section>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="result-stack">
            <button className="back-button" type="button" onClick={() => setScreen('form')}>
              <ArrowLeft size={18} />
              入力に戻る
            </button>

            <section className="summary-text">
              あなたは <strong>{parsed?.age}歳</strong> の <strong>{form.sex === 'male' ? '男性' : '女性'}</strong> で、
              身長 <strong>{parsed?.height}cm</strong>、体重 <strong>{parsed?.weight}kg</strong>、
              活動量は <strong>{selectedActivityLabel}</strong> です。
            </section>

            <section className="hero-result">
              <p className="hero-result__label">推定TDEE</p>
              <p className="hero-result__value">{parsed?.maintain} kcal / 日</p>
              <p className="hero-result__sub">週あたり {parsed?.maintainWeekly} kcal</p>
            </section>

            <section className="result-grid two-col">
              <section className="panel compact">
                <div className="panel__content">
                  <h2>BMI</h2>
                  <p className="big-number">{parsed?.bmi.toFixed(1)}</p>
                  <p className="muted-text">
                    BMIは <strong>{parsed?.bmi.toFixed(1)}</strong>、判定は <strong>{parsed?.bmiCategory}</strong> です。
                  </p>
                  <div className="list-box">
                    <div><span>18.5未満</span><span>低体重</span></div>
                    <div><span>18.5〜24.9</span><span>普通体重</span></div>
                    <div><span>25.0〜29.9</span><span>肥満（1度）</span></div>
                    <div><span>30以上</span><span>肥満</span></div>
                  </div>
                </div>
              </section>

              <section className="panel compact">
                <div className="panel__content">
                  <h2>活動量ごとの消費カロリー</h2>
                  <div className="list-box">
                    <div><span>基礎代謝</span><span>{roundToNearest5(parsed?.bmr ?? 0)} kcal / 日</span></div>
                    {parsed?.activityCalories.map((item) => (
                      <div key={item.label} className={item.isSelected ? 'selected-row' : ''}>
                        <span>{item.label}</span>
                        <span>{item.calories} kcal / 日</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </section>

            <section className="result-grid one-col">
              <StatCard title="維持" value={`${parsed?.maintain} kcal`} icon={<Flame size={20} />} />
              <StatCard title="減量" value={`${parsed?.cutRange.low}〜${parsed?.cutRange.high} kcal`} icon={<TrendingDown size={20} />} />
              <StatCard title="増量" value={`${parsed?.gainRange.low}〜${parsed?.gainRange.high} kcal`} icon={<TrendingUp size={20} />} />
            </section>
          </motion.div>
        )}
      </div>
    </div>
  )
}
