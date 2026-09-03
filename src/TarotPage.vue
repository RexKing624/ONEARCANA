<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import tarotCards from './tarotData'
import { buildCopyPrompt, getCardText, tarotTranslations } from './tarotLocales'

const savedLanguage = localStorage.getItem('site-language')
const browserLanguage = (navigator.language || '').toLowerCase()
const detectedLanguage = browserLanguage.startsWith('zh') ? 'zh' : browserLanguage.startsWith('ja') ? 'ja' : 'en'
const language = ref(['zh', 'ja', 'en'].includes(savedLanguage) ? savedLanguage : detectedLanguage)
const savedTheme = localStorage.getItem('one-arcana-theme')
const theme = ref(savedTheme === 'light' ? 'light' : 'dark')
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
const sharePreview = ref(null)
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
let audioContext
let paperNoise
let lastShuffleSound = 0
let lastPickerHoverSound = 0

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

const ensureAudio = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return null
  if (!audioContext) {
    audioContext = new AudioContext()
    const noiseLength = Math.floor(audioContext.sampleRate * .5)
    paperNoise = audioContext.createBuffer(1, noiseLength, audioContext.sampleRate)
    const noise = paperNoise.getChannelData(0)
    const randomValues = new Uint8Array(noiseLength)
    crypto.getRandomValues(randomValues)
    for (let index = 0; index < noiseLength; index += 1) noise[index] = (randomValues[index] / 127.5) - 1
  }
  if (audioContext.state === 'suspended') audioContext.resume()
  return audioContext
}

const playPaperSound = (intensity = .5, delay = 0) => {
  const context = ensureAudio()
  if (!context || !paperNoise) return
  const duration = .04 + intensity * .055
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  const startAt = context.currentTime + delay
  source.buffer = paperNoise
  source.playbackRate.value = .82 + intensity * .32
  filter.type = 'bandpass'
  filter.frequency.value = 650 + intensity * 1100
  filter.Q.value = .72
  gain.gain.setValueAtTime(.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(.009 + intensity * .018, startAt + .012)
  gain.gain.exponentialRampToValueAtTime(.0001, startAt + duration)
  source.connect(filter).connect(gain).connect(context.destination)
  const maxOffset = Math.max(0, paperNoise.duration - duration)
  source.start(startAt, secureBetween(0, maxOffset), duration)
}

const playTone = (frequency, duration, volume, delay = 0) => {
  const context = ensureAudio()
  if (!context) return
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const startAt = context.currentTime + delay
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, startAt)
  oscillator.frequency.exponentialRampToValueAtTime(frequency * .82, startAt + duration)
  gain.gain.setValueAtTime(.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(volume, startAt + .012)
  gain.gain.exponentialRampToValueAtTime(.0001, startAt + duration)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start(startAt)
  oscillator.stop(startAt + duration + .02)
}

const playDeckSpread = () => {
  playPaperSound(.55)
  playPaperSound(.35, .075)
}

const playCardPick = () => {
  const context = ensureAudio()
  if (!context) return
  const startAt = context.currentTime
  const body = context.createOscillator()
  const bodyGain = context.createGain()
  body.type = 'triangle'
  body.frequency.setValueAtTime(245, startAt)
  body.frequency.exponentialRampToValueAtTime(112, startAt + .13)
  bodyGain.gain.setValueAtTime(.0001, startAt)
  bodyGain.gain.exponentialRampToValueAtTime(.032, startAt + .006)
  bodyGain.gain.exponentialRampToValueAtTime(.0001, startAt + .15)
  body.connect(bodyGain).connect(context.destination)
  body.start(startAt)
  body.stop(startAt + .17)
  playTone(680, .1, .012, .025)
}

const playCardReveal = () => {
  playPaperSound(.72)
  playTone(392, .34, .018, .06)
  playTone(523.25, .42, .012, .14)
}

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

watch(language, (value) => {
  localStorage.setItem('site-language', value)
  document.documentElement.lang = value === 'zh' ? 'zh-CN' : value
}, { immediate: true })

watch(theme, (value) => {
  localStorage.setItem('one-arcana-theme', value)
  document.documentElement.dataset.theme = value
}, { immediate: true })

const startShuffle = () => {
  createShuffleCards()
  stage.value = 'shuffle'
}

const handleQuestionKeydown = (event) => {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing || window.matchMedia('(max-width: 780px)').matches) return
  event.preventDefault()
  startShuffle()
}

const beginPointer = (event) => {
  if (deckIsSettled.value) return
  activePointer.value = event.pointerId
  lastPoint.value = { x: event.clientX, y: event.clientY }
  isPointerDown.value = true
  event.currentTarget.setPointerCapture?.(event.pointerId)
  window.clearTimeout(settleTimer)
  vibrate(7)
  playPaperSound(.22)
}

const movePointer = (event) => {
  if (!isPointerDown.value || activePointer.value !== event.pointerId || deckIsSettled.value) return
  const dx = event.clientX - lastPoint.value.x
  const dy = event.clientY - lastPoint.value.y
  if (Math.abs(dx) + Math.abs(dy) < 1) return
  hasShuffled.value = true
  const now = performance.now()
  const movement = Math.abs(dx) + Math.abs(dy)
  if (Math.abs(dx) + Math.abs(dy) > 7 && now - lastShuffleVibration > 90) {
    vibrate(6)
    lastShuffleVibration = now
  }
  if (movement > 3 && now - lastShuffleSound > 72) {
    playPaperSound(Math.min(1, movement / 28))
    lastShuffleSound = now
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
  playDeckSpread()
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

const playPickerHover = (event) => {
  if (event.pointerType !== 'mouse' || selectedBack.value !== null || pickerGesture.value) return
  const now = performance.now()
  if (now - lastPickerHoverSound < 48) return
  playPaperSound(.28)
  lastPickerHoverSound = now
}

const chooseCard = (index) => {
  if (selectedBack.value !== null) return
  vibrate([22, 34, 30])
  playCardPick()
  selectedBack.value = index
  const card = tarotCards[secureRandomInt(tarotCards.length)]
  const isReversed = secureRandomInt(2) === 1
  result.value = {
    card,
    isReversed,
    question: question.value.trim(),
  }
  stageTimer = window.setTimeout(() => {
    stage.value = 'reveal'
    stageTimer = window.setTimeout(() => {
      isRevealed.value = true
      vibrate(12)
      playCardReveal()
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
  const usesWords = /\s/.test(text.trim())
  const units = usesWords ? text.trim().split(/\s+/) : [...text]
  let line = ''
  let lines = 0
  units.forEach((unit, index) => {
    const testLine = line ? `${line}${usesWords ? ' ' : ''}${unit}` : unit
    if (context.measureText(testLine).width > maxWidth && line && lines < maxLines - 1) {
      context.fillText(line, x, y + lines * lineHeight)
      line = unit
      lines += 1
    } else {
      line = testLine
    }
    if (index === units.length - 1) context.fillText(line, x, y + lines * lineHeight)
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

  const brandText = 'ONE ARCANA'
  const brandSubtitle = 'Ask. Shuffle. Pick one.'
  context.font = '600 34px system-ui, sans-serif'
  context.letterSpacing = '3px'
  context.fillStyle = '#f1efe8'
  context.fillText('ONE', 104, 120)
  const arcanaX = 104 + context.measureText('ONE ').width
  context.fillStyle = '#b9a77d'
  context.fillText('ARCANA', arcanaX, 120)
  const brandWidth = context.measureText(brandText).width
  context.font = '16px system-ui, sans-serif'
  context.letterSpacing = '0px'
  const subtitleWidth = context.measureText(brandSubtitle).width
  const subtitleSpacing = Math.max(0, (brandWidth - subtitleWidth) / (brandSubtitle.length - 1))
  context.letterSpacing = `${subtitleSpacing}px`
  context.fillStyle = '#9d9f96'
  context.fillText(brandSubtitle, 104, 156)
  context.letterSpacing = '0px'

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
  context.fillText('onearcana.xergnik.com', 104, 1240)
  context.textAlign = 'right'
  context.fillText('@XER_GNIK', 976, 1240)
  context.textAlign = 'start'

  canvas.toBlob((blob) => {
    if (!blob) return
    if (sharePreview.value?.url) URL.revokeObjectURL(sharePreview.value.url)
    const fileName = `tarot-${result.value.card.id}-${result.value.isReversed ? 'reversed' : 'upright'}.png`
    sharePreview.value = { blob, fileName, url: URL.createObjectURL(blob) }
    showFeedback(t.value.previewReady)
  }, 'image/png')
}

const closeSharePreview = () => {
  if (sharePreview.value?.url) URL.revokeObjectURL(sharePreview.value.url)
  sharePreview.value = null
}

const downloadGeneratedCard = async () => {
  if (!sharePreview.value) return
  const { blob, fileName, url } = sharePreview.value
  const file = new File([blob], fileName, { type: 'image/png' })
  const isMobile = window.matchMedia('(max-width: 780px)').matches

  if (isMobile && navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'ONE ARCANA' })
      showFeedback(t.value.saved)
      return
    } catch (error) {
      if (error?.name === 'AbortError') return
    }
  }

  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  showFeedback(t.value.downloaded)
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
  closeSharePreview()
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
  closeSharePreview()
  audioContext?.close()
  audioContext = null
  vibrate(0)
})
</script>

<template>
  <main class="tarot-page" :class="{ 'scroll-locked': stage !== 'reveal', light: theme === 'light' }">
    <header class="tarot-header">
      <a href="/" :aria-label="t.back">ONE <span>ARCANA</span></a>
      <p>Ask. Shuffle. Pick one.</p>
      <div class="tarot-header-right">
        <div class="tarot-languages" role="group" :aria-label="t.language">
          <button v-for="item in [{ id: 'en', label: 'EN' }, { id: 'ja', label: '日' }, { id: 'zh', label: '中' }]" :key="item.id" type="button" :class="{ active: language === item.id }" :aria-pressed="language === item.id" @click="language = item.id">{{ item.label }}</button>
        </div>
        <button class="theme-switcher" type="button" :aria-label="t.theme" @click="theme = theme === 'light' ? 'dark' : 'light'">
          <span class="theme-track" aria-hidden="true"><span :class="{ dark: theme === 'dark' }"></span></span>
        </button>
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
          <textarea id="tarot-question" v-model="question" rows="4" maxlength="240" :placeholder="t.questionPlaceholder" @keydown="handleQuestionKeydown"></textarea>
          <div class="form-footer">
            <p>{{ t.privacy }}</p>
            <button type="submit">{{ t.begin }} <span>→</span></button>
          </div>
        </form>
      </div>
      <footer class="site-footer">
        <p>{{ t.footerLocation }}</p>
        <a href="https://github.com/RexKing624/ONEARCANA" target="_blank" rel="noreferrer">GitHub <span>ONEARCANA</span></a>
        <a href="https://xergnik.com/" target="_blank" rel="noreferrer">© 2026 XER_GNIK</a>
      </footer>
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
            @pointerenter="playPickerHover"
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

    <div v-if="sharePreview" class="share-preview-backdrop" role="presentation" @click.self="closeSharePreview">
      <section class="share-preview-dialog" role="dialog" aria-modal="true" :aria-label="t.imagePreview">
        <div class="share-preview-toolbar">
          <p>{{ t.imagePreview }}</p>
          <button type="button" :aria-label="t.closePreview" @click="closeSharePreview">×</button>
        </div>
        <img :src="sharePreview.url" :alt="t.imagePreview" />
        <button class="share-preview-download" type="button" @click="downloadGeneratedCard">{{ t.downloadImage }} <span>↓</span></button>
      </section>
    </div>

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
  transition: color .35s ease, background .35s ease;
}

.tarot-page.light {
  --tarot-bg: #efede6;
  --tarot-text: #171816;
  --tarot-muted: #686a63;
  --tarot-line: rgba(23, 24, 22, .17);
  --tarot-accent: #8b7548;
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
.theme-switcher { padding: 0; border: 0; background: transparent; cursor: pointer; }
.theme-track { position: relative; display: block; width: 42px; height: 24px; border: 1px solid var(--tarot-line); border-radius: 20px; }
.theme-track > span { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: var(--tarot-accent); transition: transform .25s ease, background .25s ease; }
.theme-track > span.dark { background: var(--tarot-text); transform: translateX(18px); }

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
  grid-template-rows: auto 1fr auto;
  padding: 36px 0 0;
}

.ask-layout {
  display: grid;
  grid-template-columns: 1.1fr .9fr;
  gap: clamp(60px, 10vw, 160px);
  align-items: center;
  padding-bottom: clamp(24px, 8vh, 96px);
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
  min-width: 112px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  flex: 0 0 auto;
  border: 0;
  border-bottom: 1px solid var(--tarot-text);
  padding: 6px 0;
  color: var(--tarot-text);
  background: none;
  line-height: 1.2;
  white-space: nowrap;
  cursor: pointer;
}
.form-footer button span, .shuffle-action button span { display: inline-flex; align-items: center; margin-left: 0; color: var(--tarot-accent); line-height: 1; transform: translateY(-1px); }

.site-footer { min-height: 74px; display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: center; border-top: 1px solid var(--tarot-line); color: var(--tarot-muted); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
.site-footer p { margin: 0; }
.site-footer a { color: var(--tarot-muted); transition: color .2s ease; }
.site-footer a:hover { color: var(--tarot-text); }
.site-footer a:nth-child(2) { justify-self: center; }
.site-footer a:last-child { justify-self: end; }
.site-footer span { margin-left: 8px; color: #c6c5bd; }

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

.share-preview-backdrop {
  position: fixed;
  z-index: 400;
  inset: 0;
  display: grid;
  place-items: center;
  padding: clamp(24px, 4vw, 56px);
  background: rgba(8, 9, 8, .78);
  backdrop-filter: blur(8px);
}
.share-preview-dialog {
  width: min(620px, calc(100vw - 48px));
  max-height: calc(100svh - 48px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--tarot-line);
  background: #171815;
  box-shadow: 0 28px 90px rgba(0, 0, 0, .58);
}
.share-preview-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.share-preview-toolbar p { margin: 0; color: var(--tarot-muted); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; }
.share-preview-toolbar button { width: 30px; height: 30px; padding: 0; border: 0; color: var(--tarot-muted); background: transparent; font-size: 22px; cursor: pointer; }
.share-preview-dialog img { width: 100%; height: 100%; min-height: 0; object-fit: contain; }
.share-preview-download { justify-self: stretch; border: 1px solid var(--tarot-line); padding: 14px 18px; color: var(--tarot-text); background: transparent; cursor: pointer; }
.share-preview-download span { float: right; color: var(--tarot-accent); }

.tarot-page.light .question-form textarea::placeholder { color: #98998f; }
.tarot-page.light .keywords, .tarot-page.light .meaning p:last-child { color: #4f514b; }
.tarot-page.light .shuffle-area { filter: drop-shadow(0 18px 24px rgba(104, 106, 99, .2)) drop-shadow(0 -4px 12px rgba(255, 255, 255, .48)); }
.tarot-page.light .shuffle-card, .tarot-page.light .shuffle-area.active .shuffle-card { box-shadow: none; }
.tarot-page.light .share-preview-backdrop { background: rgba(239, 237, 230, .78); }
.tarot-page.light .share-preview-dialog { background: #f5f2ea; box-shadow: 0 28px 90px rgba(23, 24, 22, .16); }
.tarot-page.light .feedback { color: #efede6; background: #171816; }

@keyframes chosen-card {
  from { opacity: .4; transform: translate(-50%, 20%) scale(.8) rotate(-4deg); }
  to { opacity: 1; transform: translate(-50%, -44%) scale(1.08) rotate(0); }
}

@media (max-width: 780px) {
  .tarot-page { padding: 0 20px; }
  .tarot-page.scroll-locked { position: fixed; inset: 0; width: 100%; height: 100svh; min-height: 0; overflow: hidden; overscroll-behavior: none; }
  .tarot-header { height: 72px; grid-template-columns: 1fr auto; }
  .tarot-header > a { font-size: 13px; letter-spacing: .1em; }
  .tarot-header > p { display: none; }
  .tarot-header-right > p { display: none; }
  .tarot-header-right { gap: 12px; }
  .ask-view { min-height: calc(100svh - 72px); padding: 28px 0 0; }
  .ask-layout { grid-template-columns: 1fr; gap: 48px; align-content: end; align-items: initial; padding-bottom: 0; }
  .ask-layout h1 { font-size: clamp(48px, 14vw, 70px); }
  .question-form textarea { font-size: 18px; }
  .form-footer { align-items: center; }
  .form-footer p { max-width: 190px; }
  .site-footer { min-height: 58px; margin-top: 24px; gap: 8px; font-size: 8px; letter-spacing: .04em; }
  .site-footer a:nth-child(2) span { display: none; }
  .site-footer a:last-child { text-align: right; }
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
  .share-preview-backdrop { padding: 14px; }
  .share-preview-dialog { width: calc(100vw - 28px); max-height: calc(100svh - 28px); gap: 12px; padding: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  .shuffle-card, .card-inner, .result-copy, .chosen-back { animation: none; transition-duration: .01ms; }
}
</style>
