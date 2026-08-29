<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import tarotCards from './tarotData'
import { buildCopyPrompt, getCardText, tarotTranslations } from './tarotLocales'

const savedLanguage = localStorage.getItem('site-language')
const browserLanguage = (navigator.language || '').toLowerCase()
const detectedLanguage = browserLanguage.startsWith('zh') ? 'zh' : browserLanguage.startsWith('ja') ? 'ja' : 'en'
const language = ref(['zh', 'ja', 'en'].includes(savedLanguage) ? savedLanguage : detectedLanguage)
const stage = ref('ask')
const question = ref('')
const result = ref(null)
const isPointerDown = ref(false)
const hasShuffled = ref(false)
const deckIsSettled = ref(false)
const selectedBack = ref(null)
const isRevealed = ref(false)
const cardImageLoaded = ref(false)
const feedback = ref('')
const activePointer = ref(null)
const lastPoint = ref({ x: 0, y: 0 })
const shuffleCards = ref([])
const cardImage = ref(null)
const pickerWindow = ref(null)
const activePickerCard = ref(null)
const pickerLift = ref(0)
const pickerGesture = ref(null)
const suppressCardClick = ref(false)
let settleTimer
let stageTimer
let feedbackTimer
let lastShuffleVibration = 0
let lastPickerVibrationLevel = 0

const vibrate = (pattern) => {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(pattern)
}

const secureRandomInt = (max) => {
  if (!Number.isInteger(max) || max <= 0) throw new RangeError('max must be a positive integer')
  const limit = Math.floor(0x100000000 / max) * max
  const values = new Uint32Array(1)
  do crypto.getRandomValues(values)
  while (values[0] >= limit)
  return values[0] % max
}

const secureBetween = (min, max) => min + (secureRandomInt(10000) / 9999) * (max - min)

const createShuffleCards = () => {
  shuffleCards.value = Array.from({ length: 24 }, (_, index) => ({
    id: index,
    x: secureBetween(-2, 2),
    y: secureBetween(-2, 2),
    rotation: secureBetween(-1.2, 1.2),
    driftX: secureBetween(.45, 1.15) * (index % 2 ? 1 : -1),
    driftY: secureBetween(.25, .85) * (index % 3 ? 1 : -1),
  }))
}

const t = computed(() => tarotTranslations[language.value])
const cardText = computed(() => result.value ? getCardText(result.value.card, language.value, result.value.isReversed) : null)
const currentKeywords = computed(() => cardText.value?.keywords || '')
const currentMeaning = computed(() => cardText.value?.meaning || '')
const localCardName = computed(() => cardText.value?.localName || '')
const orientationEn = computed(() => result.value?.isReversed ? 'Reversed' : 'Upright')
const orientationLocal = computed(() => result.value?.isReversed ? t.value.reversed : t.value.upright)
const dateLocale = computed(() => ({ zh: 'zh-CN', ja: 'ja-JP', en: 'en-CA' }[language.value]))
const displayDate = computed(() => result.value?.date || new Intl.DateTimeFormat(dateLocale.value, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()))

watch(language, (value) => {
  localStorage.setItem('site-language', value)
  document.documentElement.lang = value === 'zh' ? 'zh-CN' : value
}, { immediate: true })

const startShuffle = () => {
  createShuffleCards()
  stage.value = 'shuffle'
}

const beginPointer = (event) => {
  if (deckIsSettled.value) return
  activePointer.value = event.pointerId
  lastPoint.value = { x: event.clientX, y: event.clientY }
  isPointerDown.value = true
  event.currentTarget.setPointerCapture?.(event.pointerId)
  window.clearTimeout(settleTimer)
  vibrate(7)
}

const movePointer = (event) => {
  if (!isPointerDown.value || activePointer.value !== event.pointerId || deckIsSettled.value) return
  const dx = event.clientX - lastPoint.value.x
  const dy = event.clientY - lastPoint.value.y
  if (Math.abs(dx) + Math.abs(dy) < 1) return
  hasShuffled.value = true
  const now = performance.now()
  if (Math.abs(dx) + Math.abs(dy) > 7 && now - lastShuffleVibration > 90) {
    vibrate(6)
    lastShuffleVibration = now
  }
  lastPoint.value = { x: event.clientX, y: event.clientY }
  shuffleCards.value.forEach((card, index) => {
    const depth = .24 + (index / shuffleCards.value.length) * .76
    card.x = Math.max(-108, Math.min(108, card.x + dx * card.driftX * depth))
    card.y = Math.max(-78, Math.min(78, card.y + dy * card.driftY * depth))
    card.rotation = Math.max(-22, Math.min(22, card.rotation + (dx - dy) * .025 * card.driftX))
  })
}

const endPointer = (event) => {
  if (activePointer.value !== event.pointerId) return
  isPointerDown.value = false
  activePointer.value = null
  window.clearTimeout(settleTimer)
  if (!hasShuffled.value) return
  settleTimer = window.setTimeout(() => {
    deckIsSettled.value = true
    shuffleCards.value.forEach((card) => {
      card.x = secureBetween(-3, 3)
      card.y = secureBetween(-3, 3)
      card.rotation = secureBetween(-1.4, 1.4)
    })
    vibrate([14, 28, 20])
  }, 720)
}

const openDeck = async () => {
  if (!deckIsSettled.value) return
  vibrate(10)
  stage.value = 'choose'
  await nextTick()
  if (pickerWindow.value) pickerWindow.value.scrollLeft = (pickerWindow.value.scrollWidth - pickerWindow.value.clientWidth) / 2
}

const beginPickGesture = (event, index) => {
  if (selectedBack.value !== null) return
  activePickerCard.value = index
  pickerLift.value = 0
  suppressCardClick.value = false
  lastPickerVibrationLevel = 0
  pickerGesture.value = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startScroll: pickerWindow.value?.scrollLeft || 0,
  }
  event.currentTarget.setPointerCapture?.(event.pointerId)
  vibrate(7)
}

const movePickGesture = (event) => {
  const gesture = pickerGesture.value
  if (!gesture || gesture.pointerId !== event.pointerId || selectedBack.value !== null) return
  const dx = event.clientX - gesture.startX
  const dy = event.clientY - gesture.startY
  if (Math.abs(dx) > 7 || Math.abs(dy) > 7) suppressCardClick.value = true

  if (Math.abs(dx) > Math.abs(dy)) {
    pickerLift.value = 0
    if (pickerWindow.value) pickerWindow.value.scrollLeft = gesture.startScroll - dx
    return
  }

  pickerLift.value = Math.max(0, Math.min(82, -dy))
  const vibrationLevel = pickerLift.value >= 58 ? 2 : pickerLift.value >= 28 ? 1 : 0
  if (vibrationLevel > lastPickerVibrationLevel) {
    vibrate(vibrationLevel === 2 ? 14 : 8)
    lastPickerVibrationLevel = vibrationLevel
  }
}

const finishPickGesture = (event, index, cancelled = false) => {
  const gesture = pickerGesture.value
  if (!gesture || gesture.pointerId !== event.pointerId) return
  const shouldChoose = !cancelled && pickerLift.value >= 58
  pickerGesture.value = null
  activePickerCard.value = null
  pickerLift.value = 0
  if (shouldChoose) {
    chooseCard(index)
    return
  }
  window.setTimeout(() => { suppressCardClick.value = false }, 0)
}

const handleCardClick = (event, index) => {
  if (suppressCardClick.value) {
    event.preventDefault()
    return
  }
  chooseCard(index)
}

const chooseCard = (index) => {
  if (selectedBack.value !== null) return
  vibrate([22, 34, 30])
  selectedBack.value = index
  const card = tarotCards[secureRandomInt(tarotCards.length)]
  const isReversed = secureRandomInt(2) === 1
  result.value = {
    card,
    isReversed,
    question: question.value.trim(),
    date: new Intl.DateTimeFormat(dateLocale.value, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
  }
  stageTimer = window.setTimeout(() => {
    stage.value = 'reveal'
    stageTimer = window.setTimeout(() => {
      isRevealed.value = true
      vibrate(12)
    }, 120)
  }, 680)
}

const showFeedback = (message) => {
  feedback.value = message
  window.clearTimeout(feedbackTimer)
  feedbackTimer = window.setTimeout(() => { feedback.value = '' }, 2200)
}

const copyText = computed(() => result.value ? buildCopyPrompt({
  language: language.value,
  question: result.value.question,
  card: result.value.card,
  localName: localCardName.value,
  orientation: orientationLocal.value,
  keywords: currentKeywords.value,
}) : '')

const copyForAI = async () => {
  try {
    await navigator.clipboard.writeText(copyText.value)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = copyText.value
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
  }
  showFeedback(t.value.copied)
}

const wrapCanvasText = (context, text, x, y, maxWidth, lineHeight, maxLines = 4) => {
  const characters = [...text]
  let line = ''
  let lines = 0
  characters.forEach((character, index) => {
    const testLine = line + character
    if (context.measureText(testLine).width > maxWidth && line && lines < maxLines - 1) {
      context.fillText(line, x, y + lines * lineHeight)
      line = character
      lines += 1
    } else {
      line = testLine
    }
    if (index === characters.length - 1) context.fillText(line, x, y + lines * lineHeight)
  })
}

const generateCard = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1350
  const context = canvas.getContext('2d')
  context.fillStyle = '#111210'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = '#343630'
  context.lineWidth = 2
  context.strokeRect(58, 58, 964, 1234)

  context.fillStyle = '#9d9f96'
  context.font = '22px system-ui, sans-serif'
  context.letterSpacing = '5px'
  context.fillText('ONE ARCANA · ASK. SHUFFLE. PICK ONE.', 104, 122)
  context.fillText(displayDate.value, 824, 122)

  const imageX = 104
  const imageY = 184
  const imageWidth = 358
  const imageHeight = 626
  context.save()
  context.fillStyle = '#1a1b18'
  context.fillRect(imageX, imageY, imageWidth, imageHeight)
  context.strokeStyle = '#77796e'
  context.strokeRect(imageX, imageY, imageWidth, imageHeight)
  if (cardImageLoaded.value && cardImage.value?.complete) {
    if (result.value.isReversed) {
      context.translate(imageX + imageWidth / 2, imageY + imageHeight / 2)
      context.rotate(Math.PI)
      context.drawImage(cardImage.value, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight)
    } else {
      context.drawImage(cardImage.value, imageX, imageY, imageWidth, imageHeight)
    }
  } else {
    context.fillStyle = '#ede9dd'
    context.font = '82px Georgia, serif'
    context.textAlign = 'center'
    context.fillText(result.value.card.arcana === 'major' ? String(result.value.card.number).padStart(2, '0') : suitSymbol(result.value.card.suit), imageX + imageWidth / 2, imageY + 294)
    context.font = '24px Georgia, serif'
    context.fillText(result.value.card.nameEn.toUpperCase(), imageX + imageWidth / 2, imageY + 356)
    context.textAlign = 'start'
  }
  context.restore()

  context.fillStyle = '#f1efe8'
  context.font = '56px Georgia, serif'
  wrapCanvasText(context, result.value.card.nameEn, 530, 222, 430, 64, 3)
  context.font = '38px Georgia, serif'
  context.fillText(localCardName.value, 530, 416)
  context.fillStyle = '#b9a77d'
  context.font = '24px system-ui, sans-serif'
  context.fillText(`${orientationEn.value.toUpperCase()} · ${orientationLocal.value}`, 530, 474)
  context.fillStyle = '#c9c7bf'
  context.font = '28px system-ui, sans-serif'
  wrapCanvasText(context, currentKeywords.value, 530, 562, 420, 46, 4)

  context.strokeStyle = '#343630'
  context.beginPath()
  context.moveTo(104, 884)
  context.lineTo(976, 884)
  context.stroke()
  context.fillStyle = '#777970'
  context.font = '20px system-ui, sans-serif'
  context.fillText(t.value.canvasQuestion, 104, 948)
  context.fillStyle = '#f1efe8'
  context.font = '34px Georgia, serif'
  wrapCanvasText(context, result.value.question || t.value.noQuestion, 104, 1014, 850, 52, 4)
  context.fillStyle = '#777970'
  context.font = '18px system-ui, sans-serif'
  context.fillText(t.value.canvasFooter, 104, 1240)

  canvas.toBlob((blob) => {
    if (!blob) return
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `tarot-${result.value.card.id}-${result.value.isReversed ? 'reversed' : 'upright'}.png`
    link.click()
    URL.revokeObjectURL(url)
    showFeedback(t.value.generated)
  }, 'image/png')
}

const suitSymbol = (suit) => ({ wands: '│', cups: '◡', swords: '†', pentacles: '◇' }[suit] || '✦')

const resetReading = () => {
  window.clearTimeout(settleTimer)
  window.clearTimeout(stageTimer)
  stage.value = 'ask'
  result.value = null
  hasShuffled.value = false
  deckIsSettled.value = false
  selectedBack.value = null
  isRevealed.value = false
  cardImageLoaded.value = false
  activePickerCard.value = null
  pickerLift.value = 0
  pickerGesture.value = null
  createShuffleCards()
}

const previousTitle = document.title
onMounted(() => {
  document.title = 'ONE ARCANA — Ask. Shuffle. Pick one.'
  createShuffleCards()
})

onBeforeUnmount(() => {
  document.title = previousTitle
  window.clearTimeout(settleTimer)
  window.clearTimeout(stageTimer)
  window.clearTimeout(feedbackTimer)
  vibrate(0)
})
</script>

<template>
  <main class="tarot-page">
    <header class="tarot-header">
      <a href="/" :aria-label="t.back">ONE <span>ARCANA</span></a>
      <p>Ask. Shuffle. Pick one.</p>
      <div class="tarot-header-right">
        <p>{{ t.disclaimer }}</p>
        <div class="tarot-languages" role="group" :aria-label="t.language">
          <button v-for="item in [{ id: 'en', label: 'EN' }, { id: 'ja', label: '日' }, { id: 'zh', label: '中' }]" :key="item.id" type="button" :class="{ active: language === item.id }" :aria-pressed="language === item.id" @click="language = item.id">{{ item.label }}</button>
        </div>
      </div>
    </header>

    <section v-if="stage === 'ask'" class="ask-view" aria-labelledby="ask-title">
      <div class="step-label"><span>01</span> {{ t.steps[0] }}</div>
      <div class="ask-layout">
        <div>
          <p class="kicker">{{ t.askKicker }}</p>
          <h1 id="ask-title">{{ t.askTitle }}</h1>
        </div>
        <form class="question-form" @submit.prevent="startShuffle">
          <label for="tarot-question">{{ t.question }} <span>{{ t.optional }}</span></label>
          <textarea id="tarot-question" v-model="question" rows="4" maxlength="240" :placeholder="t.questionPlaceholder"></textarea>
          <div class="form-footer">
            <p>{{ t.privacy }}</p>
            <button type="submit">{{ t.begin }} <span>→</span></button>
          </div>
        </form>
      </div>
    </section>

    <section v-else-if="stage === 'shuffle'" class="shuffle-view" aria-labelledby="shuffle-title">
      <div class="stage-heading">
        <div class="step-label"><span>02</span> {{ t.steps[1] }}</div>
        <h1 id="shuffle-title">{{ t.shuffleTitle }}</h1>
        <p>{{ deckIsSettled ? t.deckQuiet : t.moveFreely }}</p>
      </div>
      <div
        class="shuffle-area"
        :class="{ active: isPointerDown, settled: deckIsSettled }"
        @pointerdown="beginPointer"
        @pointermove="movePointer"
        @pointerup="endPointer"
        @pointercancel="endPointer"
      >
        <div
          v-for="card in shuffleCards"
          :key="card.id"
          class="card-back shuffle-card"
          :style="{ transform: `translate3d(${card.x}px, ${card.y}px, 0) rotate(${card.rotation}deg)`, zIndex: card.id }"
        ><span>R</span></div>
      </div>
      <div class="shuffle-action">
        <p v-if="!hasShuffled">{{ t.shuffleHint }}</p>
        <p v-else-if="!deckIsSettled">{{ t.releaseHint }}</p>
        <button v-else type="button" @click="openDeck">{{ t.ready }} <span>→</span></button>
      </div>
    </section>

    <section v-else-if="stage === 'choose'" class="choose-view" aria-labelledby="choose-title">
      <div class="stage-heading compact">
        <div class="step-label"><span>03</span> {{ t.steps[2] }}</div>
        <h1 id="choose-title">{{ t.chooseTitle }}</h1>
        <p>{{ t.chooseHint }}</p>
      </div>
      <div ref="pickerWindow" class="picker-window" :class="{ choosing: selectedBack !== null, dragging: pickerGesture !== null }">
        <div class="picker-track">
          <button
            v-for="(_, index) in tarotCards"
            :key="index"
            type="button"
            class="card-back picker-card"
            :class="{ gesturing: activePickerCard === index }"
            :style="{ '--offset': index - 38.5, '--gesture-lift': activePickerCard === index ? pickerLift : 0, zIndex: activePickerCard === index ? 110 : index }"
            :aria-label="t.chooseCard.replace('{number}', index + 1)"
            @pointerdown="beginPickGesture($event, index)"
            @pointermove="movePickGesture"
            @pointerup="finishPickGesture($event, index)"
            @pointercancel="finishPickGesture($event, index, true)"
            @click="handleCardClick($event, index)"
          ><span>R</span></button>
        </div>
        <div v-if="selectedBack !== null" class="card-back chosen-back" aria-hidden="true"><span>R</span></div>
      </div>
      <p class="scroll-note">{{ t.scroll }}</p>
    </section>

    <section v-else class="result-view" aria-labelledby="result-title">
      <div class="result-card-column">
        <div class="tarot-card" :class="{ revealed: isRevealed }">
          <div class="card-inner">
            <div class="card-back result-back"><span>R</span></div>
            <div class="card-face">
              <div class="card-art" :class="{ reversed: result.isReversed, loaded: cardImageLoaded }">
                <img ref="cardImage" :src="result.card.image" :alt="result.card.nameEn" @load="cardImageLoaded = true" @error="cardImageLoaded = false" />
                <div class="placeholder-art">
                  <span>{{ result.card.arcana === 'major' ? String(result.card.number).padStart(2, '0') : suitSymbol(result.card.suit) }}</span>
                  <p>{{ result.card.nameEn }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p class="image-note" :class="{ hidden: cardImageLoaded }">Rider–Waite–Smith · 1909</p>
      </div>

      <div class="result-copy" :class="{ visible: isRevealed }">
        <div class="step-label"><span>04</span> {{ t.steps[3] }}</div>
        <p class="orientation">{{ orientationEn }} · {{ orientationLocal }}</p>
        <h1 id="result-title">{{ result.card.nameEn }}</h1>
        <h2 v-if="localCardName !== result.card.nameEn">{{ localCardName }}</h2>
        <p class="keywords">{{ currentKeywords }}</p>
        <div class="meaning">
          <p>{{ t.meaning }}</p>
          <p>{{ currentMeaning }}</p>
        </div>
        <div v-if="result.question" class="result-question">
          <p>{{ t.yourQuestion }}</p>
          <blockquote>{{ result.question }}</blockquote>
        </div>
        <div class="result-actions">
          <button class="primary-action" type="button" @click="copyForAI">{{ t.copy }} <span>↗</span></button>
          <button type="button" @click="generateCard">{{ t.generate }} <span>↓</span></button>
          <button type="button" @click="resetReading">{{ t.again }}</button>
        </div>
      </div>
    </section>

    <p class="feedback" :class="{ visible: feedback }" role="status">{{ feedback }}</p>
  </main>
</template>

<style scoped>
.tarot-page {
  --tarot-bg: #111210;
  --tarot-text: #efede6;
  --tarot-muted: #92948b;
  --tarot-line: rgba(239, 237, 230, .17);
  --tarot-accent: #b8a477;
  min-height: 100svh;
  overflow: hidden;
  padding: 0 4vw;
  color: var(--tarot-text);
  background: var(--tarot-bg);
}

.tarot-header {
  height: 88px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  border-bottom: 1px solid var(--tarot-line);
  font-size: 11px;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.tarot-header a { font-weight: 600; }
.tarot-header a span, .tarot-header p { color: var(--tarot-muted); }
.tarot-header > p { margin: 0; text-align: center; }
.tarot-header-right { display: flex; align-items: center; justify-content: flex-end; gap: 24px; }
.tarot-header-right p { margin: 0; text-align: right; }
.tarot-languages { display: flex; align-items: center; gap: 2px; }
.tarot-languages button { width: 28px; height: 28px; padding: 0; border: 0; border-radius: 50%; color: #74766e; background: transparent; font-size: 9px; cursor: pointer; transition: color .2s ease, background .2s ease; }
.tarot-languages button:hover { color: var(--tarot-text); }
.tarot-languages button.active { color: var(--tarot-bg); background: var(--tarot-text); }

.step-label {
  display: flex;
  align-items: center;
  gap: 14px;
  color: var(--tarot-muted);
  font-size: 11px;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.step-label span { color: var(--tarot-accent); }

.ask-view {
  min-height: calc(100svh - 88px);
  display: grid;
  grid-template-rows: auto 1fr;
  padding: 36px 0 7vh;
}

.ask-layout {
  display: grid;
  grid-template-columns: 1.1fr .9fr;
  gap: clamp(60px, 10vw, 160px);
  align-items: end;
}

.kicker { margin: 0 0 28px; color: var(--tarot-muted); font-size: 13px; }
.ask-layout h1, .stage-heading h1, .result-copy h1 {
  margin: 0;
  font-family: 'Noto Serif SC', Georgia, serif;
  font-size: clamp(56px, 7vw, 108px);
  font-weight: 500;
  line-height: .98;
  letter-spacing: -.055em;
}
.ask-layout h1 { max-width: 780px; }

.question-form { padding-bottom: 8px; }
.question-form label { display: flex; justify-content: space-between; color: var(--tarot-muted); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
.question-form label span { opacity: .65; }
.question-form textarea {
  width: 100%;
  margin-top: 18px;
  padding: 22px 0;
  resize: none;
  border: 0;
  border-top: 1px solid var(--tarot-line);
  border-bottom: 1px solid var(--tarot-line);
  border-radius: 0;
  outline: 0;
  color: var(--tarot-text);
  background: transparent;
  font: 22px/1.6 'Noto Serif SC', Georgia, serif;
}

.question-form textarea::placeholder { color: #5f615b; }
.question-form textarea:focus { border-color: var(--tarot-accent); }
.form-footer { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; margin-top: 22px; }
.form-footer p { max-width: 250px; margin: 0; color: var(--tarot-muted); font-size: 11px; line-height: 1.6; }
.form-footer button, .shuffle-action button {
  border: 0;
  border-bottom: 1px solid var(--tarot-text);
  padding: 6px 0;
  color: var(--tarot-text);
  background: none;
  cursor: pointer;
}
.form-footer button span, .shuffle-action button span { margin-left: 42px; color: var(--tarot-accent); }

.shuffle-view { position: relative; min-height: calc(100svh - 88px); padding: 36px 0; }
.stage-heading { position: relative; z-index: 40; pointer-events: none; }
.stage-heading h1 { margin-top: 26px; font-size: clamp(42px, 5.2vw, 76px); }
.stage-heading > p { margin: 22px 0 0; color: var(--tarot-muted); font-size: 12px; }
.stage-heading.compact { display: flex; flex-direction: column; align-items: center; text-align: center; }
.stage-heading.compact h1 { font-size: clamp(52px, 6vw, 84px); }

.shuffle-area {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  touch-action: none;
  cursor: grab;
  user-select: none;
}
.shuffle-area.active { cursor: grabbing; }

.card-back {
  display: grid;
  place-items: center;
  width: clamp(128px, 12vw, 174px);
  aspect-ratio: 2 / 3.48;
  border: 1px solid #77796e;
  border-radius: 4px;
  color: #e8e4d9;
  background: #1b1c19;
  box-shadow: 0 18px 55px rgba(0, 0, 0, .28);
}
.card-back::before { content: ''; position: absolute; inset: 8px; border: 1px solid rgba(232, 228, 217, .24); border-radius: 2px; }
.card-back::after { content: ''; position: absolute; width: 44%; aspect-ratio: 1; border: 1px solid rgba(232, 228, 217, .36); transform: rotate(45deg); }
.card-back span { z-index: 1; font-family: Georgia, serif; font-size: 16px; }
.shuffle-card { position: absolute; transition: transform .08s linear, box-shadow .25s ease; will-change: transform; }
.shuffle-area.active .shuffle-card { box-shadow: 0 25px 65px rgba(0, 0, 0, .42); }
.shuffle-area.settled .shuffle-card { transition: transform 1.05s cubic-bezier(.2,.7,.2,1); }
.shuffle-action { position: absolute; z-index: 50; right: 0; bottom: 42px; text-align: right; }
.shuffle-action p { margin: 0; color: var(--tarot-muted); font-size: 11px; }

.choose-view { position: relative; min-height: calc(100svh - 88px); padding: 36px 0 0; }
.picker-window { position: absolute; right: -4vw; bottom: 0; left: -4vw; height: 54vh; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; touch-action: none; cursor: grab; user-select: none; }
.picker-window.dragging { cursor: grabbing; }
.picker-window::-webkit-scrollbar { display: none; }
.picker-track { position: relative; width: 1240px; height: 100%; margin: 0 auto; }
.picker-card { position: absolute; left: calc(50% - 65px); bottom: -85px; width: 130px; padding: 0; transform: translateX(calc(var(--offset) * 14px)) translateY(calc(var(--gesture-lift) * -1px)) rotate(calc(var(--offset) * .28deg)); transform-origin: 50% 150%; transition: transform .35s ease, opacity .35s ease, filter .35s ease, box-shadow .25s ease; cursor: pointer; touch-action: none; will-change: transform; }
.picker-card:hover, .picker-card:focus-visible { z-index: 100 !important; outline: 0; transform: translateX(calc(var(--offset) * 14px)) translateY(-34px) rotate(calc(var(--offset) * .18deg)); }
.picker-card.gesturing { transform: translateX(calc(var(--offset) * 14px)) translateY(calc(var(--gesture-lift) * -1px)) rotate(calc(var(--offset) * .12deg)) scale(1.025); transition: none; filter: brightness(1.12); box-shadow: 0 30px 75px rgba(0, 0, 0, .48); }
.picker-window.choosing .picker-card { opacity: 0; filter: blur(3px); pointer-events: none; }
.chosen-back { position: fixed; z-index: 120; top: 50%; left: 50%; transform: translate(-50%, -44%) scale(1.08); animation: chosen-card .68s cubic-bezier(.2,.75,.25,1) both; }
.scroll-note { position: absolute; right: 0; bottom: 24px; z-index: 110; margin: 0; color: var(--tarot-muted); font-size: 10px; letter-spacing: .1em; text-transform: uppercase; }

.result-view {
  min-height: calc(100svh - 88px);
  display: grid;
  grid-template-columns: minmax(280px, .8fr) minmax(460px, 1.2fr);
  gap: clamp(60px, 10vw, 160px);
  align-items: center;
  padding: 7vh 6vw 7vh;
}
.result-card-column { display: flex; flex-direction: column; align-items: center; }
.tarot-card { width: min(100%, 360px); aspect-ratio: 2 / 3.48; perspective: 1500px; }
.card-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform 1s cubic-bezier(.2,.7,.2,1); }
.tarot-card.revealed .card-inner { transform: rotateY(180deg); }
.result-back, .card-face { position: absolute; inset: 0; width: 100%; backface-visibility: hidden; }
.result-back { height: 100%; }
.card-face { overflow: hidden; border: 1px solid #77796e; border-radius: 4px; background: #e7e2d6; transform: rotateY(180deg); }
.card-art { position: absolute; inset: 10px; overflow: hidden; border: 1px solid #4c4d46; color: #171816; background: #d5cfc0; transition: transform .7s ease .8s; }
.card-art.reversed { transform: rotate(180deg); }
.card-art img { position: absolute; z-index: 2; width: 100%; height: 100%; object-fit: cover; opacity: 0; }
.card-art.loaded img { opacity: 1; }
.placeholder-art { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 40px; padding: 20px; text-align: center; }
.placeholder-art::before, .placeholder-art::after { content: ''; position: absolute; right: 20px; left: 20px; height: 1px; background: rgba(23, 24, 22, .25); }
.placeholder-art::before { top: 27%; }
.placeholder-art::after { bottom: 27%; }
.placeholder-art span { font: 54px Georgia, serif; }
.placeholder-art p { margin: 0; font: 18px/1.25 Georgia, serif; letter-spacing: .08em; text-transform: uppercase; }
.image-note { margin: 16px 0 0; color: var(--tarot-muted); font-size: 9px; letter-spacing: .12em; text-transform: uppercase; transition: opacity .2s ease; }
.image-note.hidden { opacity: 0; }
.result-copy { opacity: 0; transform: translateY(18px); transition: opacity .7s ease .75s, transform .7s ease .75s; }
.result-copy.visible { opacity: 1; transform: translateY(0); }
.orientation { margin: 38px 0 12px; color: var(--tarot-accent); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; }
.result-copy h1 { max-width: 720px; font-size: clamp(48px, 6vw, 88px); line-height: .96; }
.result-copy h2 { margin: 16px 0 0; font: 400 clamp(22px, 2vw, 30px) 'Noto Serif SC', serif; }
.keywords { margin: 28px 0 0; color: #c6c5bd; font-size: 13px; letter-spacing: .04em; }
.meaning, .result-question { display: grid; grid-template-columns: 110px 1fr; gap: 28px; max-width: 680px; margin-top: 36px; padding-top: 20px; border-top: 1px solid var(--tarot-line); }
.meaning p, .result-question p { margin: 0; }
.meaning p:first-child, .result-question > p { color: var(--tarot-muted); font-size: 10px; letter-spacing: .1em; text-transform: uppercase; }
.meaning p:last-child { color: #b8b8b0; font-size: 13px; line-height: 1.75; }
.result-question blockquote { margin: 0; font: 15px/1.7 'Noto Serif SC', serif; }
.result-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 30px; margin-top: 38px; }
.result-actions button { border: 0; border-bottom: 1px solid var(--tarot-line); padding: 8px 0; color: var(--tarot-muted); background: transparent; font-size: 12px; cursor: pointer; }
.result-actions .primary-action { color: var(--tarot-text); border-color: var(--tarot-text); }
.result-actions button span { margin-left: 24px; color: var(--tarot-accent); }
.feedback { position: fixed; z-index: 300; right: 28px; bottom: 28px; margin: 0; padding: 13px 18px; color: #171816; background: #e9e5da; font-size: 11px; opacity: 0; transform: translateY(8px); transition: opacity .25s ease, transform .25s ease; pointer-events: none; }
.feedback.visible { opacity: 1; transform: translateY(0); }

@keyframes chosen-card {
  from { opacity: .4; transform: translate(-50%, 20%) scale(.8) rotate(-4deg); }
  to { opacity: 1; transform: translate(-50%, -44%) scale(1.08) rotate(0); }
}

@media (max-width: 780px) {
  .tarot-page { padding: 0 20px; }
  .tarot-header { height: 72px; grid-template-columns: 1fr auto; }
  .tarot-header > p { display: none; }
  .tarot-header-right > p { display: none; }
  .ask-view { min-height: calc(100svh - 72px); padding: 28px 0 32px; }
  .ask-layout { grid-template-columns: 1fr; gap: 48px; align-content: end; }
  .ask-layout h1 { font-size: clamp(48px, 14vw, 70px); }
  .question-form textarea { font-size: 18px; }
  .form-footer { align-items: center; }
  .form-footer p { max-width: 190px; }
  .shuffle-view, .choose-view { min-height: calc(100svh - 72px); padding-top: 28px; }
  .stage-heading h1 { font-size: clamp(38px, 11vw, 58px); }
  .shuffle-area { top: 80px; }
  .card-back { width: 118px; }
  .shuffle-action { right: 0; bottom: 28px; }
  .picker-window { right: -20px; left: -20px; height: 56vh; }
  .picker-track { width: 1080px; }
  .picker-card { left: calc(50% - 55px); width: 110px; transform: translateX(calc(var(--offset) * 12px)) translateY(calc(var(--gesture-lift) * -1px)) rotate(calc(var(--offset) * .28deg)); }
  .picker-card:hover, .picker-card:focus-visible { transform: translateX(calc(var(--offset) * 12px)) translateY(-26px) rotate(calc(var(--offset) * .18deg)); }
  .picker-card.gesturing { transform: translateX(calc(var(--offset) * 12px)) translateY(calc(var(--gesture-lift) * -1px)) rotate(calc(var(--offset) * .12deg)) scale(1.025); }
  .scroll-note { right: 0; bottom: 18px; }
  .result-view { min-height: auto; grid-template-columns: 1fr; gap: 48px; padding: 48px 0 72px; }
  .tarot-card { width: min(66vw, 280px); }
  .result-copy h1 { font-size: clamp(46px, 13vw, 68px); }
  .meaning, .result-question { grid-template-columns: 1fr; gap: 12px; }
  .feedback { right: 20px; bottom: 20px; left: 20px; text-align: center; }
}

@media (prefers-reduced-motion: reduce) {
  .shuffle-card, .card-inner, .result-copy, .chosen-back { animation: none; transition-duration: .01ms; }
}
</style>
