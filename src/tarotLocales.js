export const tarotTranslations = {
  zh: {
    language: '语言选择', back: '返回主页', subtitle: '单牌阵',
    steps: ['提问', '洗牌', '选牌', '翻牌'],
    askKicker: '从此刻真正关心的事开始。', askTitle: '你想问什么？', question: '你的问题', optional: '可不填', questionPlaceholder: '未来一个月我的桃花如何？', privacy: '问题只会保留在本次抽牌与生成的图片中。', begin: '开始',
    shuffleTitle: '移动牌堆，直到你觉得可以了。', deckQuiet: '牌堆已经安静下来。', moveFreely: '按住牌堆，自由移动。', shuffleHint: '用鼠标或手指亲手洗牌', releaseHint: '松开后，牌会慢慢收拢', ready: '准备好后，开始抽牌。',
    chooseTitle: '选一张。', chooseHint: '没有正确的位置。点击，或把想要的牌向上推出。', chooseCard: '选择第 {number} 张牌', scroll: '← 拖动牌组 · 向上推牌 ↑',
    upright: '正位', reversed: '逆位', meaning: '基础牌义', yourQuestion: '你的问题', copy: '复制给 AI', generate: '生成图片', again: '再抽一次', copied: '已复制，可以交给你的 AI Assistant', previewReady: '分享图片已生成', downloaded: '图片已下载', saved: '已打开系统保存菜单', imagePreview: '图片预览', closePreview: '关闭预览', downloadImage: '保存图片', noQuestion: '未填写特定问题', canvasQuestion: '你的问题', canvasCreator: '制作人', footerLocation: '东京 · 日本',
  },
  ja: {
    language: '言語を選択', back: 'ホームへ戻る', subtitle: 'ワンカード',
    steps: ['問い', 'シャッフル', '選ぶ', '開く'],
    askKicker: '今、心にあることから始めましょう。', askTitle: '何を問いかけますか？', question: 'あなたの質問', optional: '任意', questionPlaceholder: 'これから一か月の恋愛運は？', privacy: '質問は今回のリーディングと生成画像にだけ使用されます。', begin: '始める',
    shuffleTitle: 'しっくりくるまで、カードを動かしてください。', deckQuiet: 'カードが静まりました。', moveFreely: '押したまま、自由に動かしてください。', shuffleHint: 'マウスまたは指でシャッフル', releaseHint: '手を離すと、カードがゆっくり集まります', ready: '準備ができたら、引きましょう。',
    chooseTitle: '一枚選んで。', chooseHint: '正しい場所はありません。タップするか、選びたいカードを上へ押し出してください。', chooseCard: '{number}枚目のカードを選ぶ', scroll: '← カードを動かす · 上へ押す ↑',
    upright: '正位置', reversed: '逆位置', meaning: '基本の意味', yourQuestion: 'あなたの質問', copy: 'AI用にコピー', generate: '画像を生成', again: 'もう一度引く', copied: 'コピーしました。AI Assistant に貼り付けられます', previewReady: '共有画像を生成しました', downloaded: '画像をダウンロードしました', saved: 'システムの保存メニューを開きました', imagePreview: '画像プレビュー', closePreview: 'プレビューを閉じる', downloadImage: '画像を保存', noQuestion: '特定の質問なし', canvasQuestion: 'あなたの質問', canvasCreator: '制作', footerLocation: '東京 · 日本',
  },
  en: {
    language: 'Choose language', back: 'Back to home', subtitle: 'A single card',
    steps: ['Ask', 'Shuffle', 'Choose', 'Reveal'],
    askKicker: 'Begin with what is present.', askTitle: 'What would you like to ask?', question: 'Your question', optional: 'Optional', questionPlaceholder: 'What might shape my love life this month?', privacy: 'Your question stays within this reading and the image you generate.', begin: 'Begin',
    shuffleTitle: 'Move the deck until it feels right.', deckQuiet: 'The deck is quiet.', moveFreely: 'Press, hold, and move freely.', shuffleHint: 'Shuffle with your mouse or finger', releaseHint: 'Release and the cards will slowly gather', ready: "When you're ready, draw.",
    chooseTitle: 'Choose one.', chooseHint: 'There is no correct position. Tap, or push the card you want upward.', chooseCard: 'Choose card {number}', scroll: '← Drag the deck · Push up to pick ↑',
    upright: 'Upright', reversed: 'Reversed', meaning: 'Basic meaning', yourQuestion: 'Your question', copy: 'Copy for AI', generate: 'Generate Card', again: 'Draw again', copied: 'Copied — ready for your AI Assistant', previewReady: 'Share image ready', downloaded: 'Image downloaded', saved: 'System save menu opened', imagePreview: 'Image preview', closePreview: 'Close preview', downloadImage: 'Save image', noQuestion: 'No specific question', canvasQuestion: 'YOUR QUESTION', canvasCreator: 'CREATED BY', footerLocation: 'Tokyo · Japan',
  },
}

const majorNamesJa = {
  'the-fool': '愚者', 'the-magician': '魔術師', 'the-high-priestess': '女教皇', 'the-empress': '女帝', 'the-emperor': '皇帝', 'the-hierophant': '教皇', 'the-lovers': '恋人', 'the-chariot': '戦車', strength: '力', 'the-hermit': '隠者', 'wheel-of-fortune': '運命の輪', justice: '正義', 'the-hanged-man': '吊るされた男', death: '死神', temperance: '節制', 'the-devil': '悪魔', 'the-tower': '塔', 'the-star': '星', 'the-moon': '月', 'the-sun': '太陽', judgement: '審判', 'the-world': '世界',
}

const majorText = {
  'the-fool': [['Beginnings · Freedom · Trust · Adventure', 'Recklessness · Hesitation · Risk · Naivety', 'An open-hearted beginning and the willingness to step into new experience.', 'A leap made without preparation, or fear that keeps a necessary beginning on hold.'], ['始まり · 自由 · 信頼 · 冒険', '無謀 · ためらい · 危険 · 未熟', '心を開いて新しい旅に踏み出し、未知の可能性を信じることを示します。', '準備不足のまま進むこと、または未知への恐れで始められない状態を示します。']],
  'the-magician': [['Action · Creation · Focus · Skill', 'Manipulation · Distraction · Untapped potential · Deception', 'Turning intention into action through skill, focus, and the resources already at hand.', 'Ability may be unfocused or used without honesty; intention and method need alignment.'], ['行動 · 創造 · 集中 · 技量', '操作 · 散漫 · 未発揮の力 · 欺き', '手元の資源と技量を使い、意志を具体的な行動へ変える力です。', '力が十分に活かされていないか、意図と手段に誠実さが欠けている可能性があります。']],
  'the-high-priestess': [['Intuition · Stillness · Subconscious · Mystery', 'Ignoring intuition · Withdrawal · Secrets · Surface thinking', 'A pause for listening to intuition and information that has not yet fully surfaced.', 'Disconnection from inner knowing, or important information kept hidden or suppressed.'], ['直感 · 静けさ · 潜在意識 · 秘密', '直感の無視 · 孤立 · 隠し事 · 表面的', '行動を急がず、まだ表に出ていない情報と直感に耳を澄ませる時です。', '内なる感覚とのつながりが弱まり、重要な情報が抑えられている可能性があります。']],
  'the-empress': [['Abundance · Nurture · Sensuality · Creation', 'Scarcity · Overgiving · Dependence · Creative block', 'Nurturing conditions in which people, ideas, and life can grow naturally.', 'Care for others may eclipse self-care, or growth may lack space and resources.'], ['豊かさ · 養育 · 感覚 · 創造', '不足 · 与えすぎ · 依存 · 創造の停滞', '人やアイデアが自然に育つための豊かな環境を表します。', '他者を優先して自分を忘れること、または成長に必要な余白の不足を示します。']],
  'the-emperor': [['Structure · Responsibility · Boundaries · Stability', 'Rigidity · Control · Disorder · Conflict with authority', 'Clear structure, boundaries, and responsibility create dependable stability.', 'Rules may have become rigid, or necessary structure and accountability may be missing.'], ['秩序 · 責任 · 境界 · 安定', '硬直 · 支配 · 混乱 · 権威との衝突', '明確な構造と責任によって、信頼できる安定を築く力です。', '管理が強すぎるか、必要な秩序と責任が欠けている可能性があります。']],
  'the-hierophant': [['Tradition · Teaching · Belief · Belonging', 'Questioning tradition · Dogma · Nonconformity · Isolation', 'Learning through inherited knowledge, shared values, and an established tradition.', 'A need to question rigid rules and find values grounded in lived experience.'], ['伝統 · 教え · 信念 · 帰属', '反伝統 · 教条 · 疑問 · 不適応', '受け継がれた知識や共通の価値観から学ぶことを表します。', '硬直した規則を問い、自分の経験に合う価値観を探す必要があります。']],
  'the-lovers': [['Connection · Choice · Alignment · Intimacy', 'Imbalance · Conflict · Misaligned values · Distance', 'Honest connection and a choice that asks for alignment with core values.', 'Values or needs may conflict, preventing genuine agreement or closeness.'], ['結びつき · 選択 · 調和 · 親密さ', '不均衡 · 対立 · 価値観のずれ · 距離', '誠実なつながりと、核となる価値観に沿った選択を示します。', '価値観や必要としているものが食い違い、真の一致を妨げている可能性があります。']],
  'the-chariot': [['Will · Progress · Discipline · Direction', 'Loss of control · Obstacles · Confusion · Force', 'Opposing forces are gathered through discipline and directed toward a clear aim.', 'Direction may be unclear or forced; conflicting drives need coordination.'], ['意志 · 前進 · 自律 · 方向性', '制御不能 · 障害 · 混乱 · 強引さ', '相反する力をまとめ、意志と規律で明確な方向へ進むことを示します。', '方向が曖昧か、無理に進めているため、内なる動機の調整が必要です。']],
  strength: [['Courage · Gentleness · Patience · Inner strength', 'Self-doubt · Impatience · Suppression · Vulnerability', 'Instinct is met with patience and compassion rather than force.', 'Confidence may be shaken or emotion suppressed; a gentler response is needed.'], ['勇気 · 優しさ · 忍耐 · 内なる力', '自己不信 · 焦り · 抑圧 · 脆さ', '力で押さえ込むのではなく、忍耐と優しさで本能に向き合う姿勢です。', '自信が揺らいでいるか、感情を抑え込みすぎている可能性があります。']],
  'the-hermit': [['Solitude · Reflection · Search · Guidance', 'Isolation · Withdrawal · Feeling lost · Refusing help', 'Stepping away from noise to seek an answer through quiet reflection.', 'Solitude may have become isolation, cutting off useful support and connection.'], ['孤独 · 内省 · 探求 · 導き', '孤立 · 引きこもり · 迷い · 援助の拒否', '喧騒から離れ、静かな内省を通して自分の答えを探す時です。', '一人の時間が孤立へ変わり、必要なつながりまで遠ざけている可能性があります。']],
  'wheel-of-fortune': [['Change · Cycles · Opportunity · Movement', 'Stagnation · Repetition · Resistance · Poor timing', 'Circumstances move in cycles; a meaningful turn is beginning to form.', 'An old pattern may be repeating, or resistance is slowing inevitable change.'], ['変化 · 周期 · 機会 · 流れ', '停滞 · 反復 · 抵抗 · タイミングのずれ', '物事は周期の中で動き、新しい転機が形になり始めています。', '古いパターンが繰り返され、避けられない変化への抵抗が続いている可能性があります。']],
  justice: [['Fairness · Consequence · Honesty · Decision', 'Bias · Avoiding responsibility · Unfairness · Self-deception', 'A fair decision based on facts, with responsibility for its consequences.', 'Judgment may be biased, responsibility avoided, or the full truth not yet seen.'], ['公正 · 因果 · 誠実 · 判断', '偏見 · 責任回避 · 不公平 · 自己欺瞞', '事実に基づいて公平に判断し、その結果を引き受けることを示します。', '判断が偏っているか、責任や事実の一部から目を背けている可能性があります。']],
  'the-hanged-man': [['Pause · New perspective · Surrender · Waiting', 'Delay · Resistance · Needless sacrifice · Stagnation', 'A deliberate pause allows an old assumption to loosen and perspective to change.', 'Waiting may no longer be useful, or necessary surrender is still being resisted.'], ['停止 · 視点転換 · 手放し · 待機', '先延ばし · 抵抗 · 無意味な犠牲 · 停滞', '意識的に立ち止まり、古い見方を緩めて別の視点を得ることを示します。', '待つことが意味を失っているか、必要な手放しに抵抗している可能性があります。']],
  death: [['Ending · Transformation · Release · Renewal', 'Resistance · Stagnation · Lingering past · Fear of change', 'A necessary ending makes room for deep transformation and renewal.', 'Holding on to what has ended delays the transformation already underway.'], ['終わり · 変容 · 別れ · 再生', '抵抗 · 停滞 · 過去への執着 · 変化への恐れ', '必要な終わりによって、深い変容と新しい始まりの余地が生まれます。', '終わったものを握り続けることで、すでに始まった変化が遅れています。']],
  temperance: [['Balance · Harmony · Patience · Integration', 'Imbalance · Excess · Impatience · Discord', 'Differences are blended gradually through moderation, patience, and care.', 'Pace or investment may be uneven; extremes need to be brought back toward center.'], ['均衡 · 調和 · 忍耐 · 統合', '不均衡 · 過剰 · 焦り · 不調和', '異なるものを穏やかに混ぜ、時間をかけて統合することを表します。', 'ペースや力の配分が偏り、極端さを和らげる必要があります。']],
  'the-devil': [['Bondage · Desire · Attachment · Shadow', 'Release · Awareness · Choice · Recovery', 'Desire, fear, or attachment may be creating a bond that feels impossible to break.', 'The source of a bond is becoming visible, allowing choice and agency to return.'], ['束縛 · 欲望 · 執着 · 影', '解放 · 気づき · 選択 · 回復', '欲望や恐れ、執着が、抜け出せないように見える束縛を作っています。', '束縛の正体に気づき、自分の選択する力を取り戻し始めています。']],
  'the-tower': [['Upheaval · Collapse · Truth · Release', 'Delayed crisis · Inner turmoil · Resistance · Aftershock', 'An unstable structure breaks, making an obscured truth impossible to ignore.', 'Change may be internal or delayed, but the old structure still needs attention.'], ['激変 · 崩壊 · 真実 · 解放', '危機の遅延 · 内なる動揺 · 抵抗 · 余波', '不安定な構造が崩れ、隠されていた真実が明らかになります。', '変化が内側へ向かうか遅れていても、古い構造の見直しは必要です。']],
  'the-star': [['Hope · Healing · Openness · Inspiration', 'Disappointment · Distance · Lost faith · Depletion', 'Hope and quiet connection return after disruption, supporting gradual healing.', 'Faith in the future may be faint; depletion needs care before inspiration returns.'], ['希望 · 癒やし · 素直さ · ひらめき', '失望 · 距離 · 信頼の喪失 · 消耗', '混乱の後に希望と静かなつながりが戻り、回復を支えます。', '未来を信じにくい時。まず消耗を癒やし、本当の願いを取り戻す必要があります。']],
  'the-moon': [['Uncertainty · Dreams · Anxiety · Subconscious', 'Clarity · Releasing fear · Confusion fading · Self-deception', 'Information is incomplete while intuition, fear, and imagination overlap.', 'The fog may be lifting, though anxiety may still be disguised as certainty.'], ['曖昧さ · 夢 · 不安 · 潜在意識', '明晰さ · 恐れの解放 · 混乱の収束 · 自己欺瞞', '情報がまだ不明瞭で、直感と恐れ、想像が重なっている状態です。', '霧が晴れ始める一方、不安を確信のように扱っていないか注意が必要です。']],
  'the-sun': [['Joy · Clarity · Vitality · Success', 'Temporary sadness · Overconfidence · Delay · Inner joy', 'Visible warmth, vitality, and the freedom to share a clear success.', 'Joy may be obscured or expectations too high, but positive energy remains present.'], ['喜び · 明快さ · 活力 · 成功', '一時的な落ち込み · 楽観過剰 · 遅れ · 内なる喜び', '明るい生命力と、成果を素直に分かち合う喜びを表します。', '喜びが一時的に隠れているか、期待が高すぎても、前向きな力は残っています。']],
  judgement: [['Awakening · Calling · Reflection · Renewal', 'Self-doubt · Refusing the call · Harsh judgment · Avoidance', 'Past experience is reviewed so a clearer calling can be answered.', 'Self-judgment may be blocking a change that is already understood.'], ['目覚め · 使命 · 振り返り · 更新', '自己不信 · 呼びかけの拒否 · 厳しい評価 · 回避', '経験を振り返り、内なる呼びかけに新しい選択で応える時です。', '自己批判にとらわれ、すでに理解している変化を避けている可能性があります。']],
  'the-world': [['Completion · Integration · Achievement · New phase', 'Incomplete work · Delay · Missing piece · Difficulty closing', 'A cycle completes; experience is integrated before a new phase begins.', 'A key piece remains unfinished, or the old phase has not been properly closed.'], ['完成 · 統合 · 達成 · 新しい段階', '未完成 · 遅れ · 欠けた要素 · 締めくくれない', '一つの周期が完成し、経験を統合して次の段階へ進むことを示します。', '重要な部分が残り、古い段階をきちんと終えられていない可能性があります。']],
}

const rankText = {
  ace: [['Beginning · Potential · Opportunity · Seed', 'Delay · Blocked potential · Missed chance · Unprepared', 'New energy is available and asks for a grounded beginning.', 'Potential has not yet taken form; preparation or motive may need review.'], ['始まり · 可能性 · 機会 · 芽生え', '遅れ · 可能性の停滞 · 機会損失 · 準備不足', '新しいエネルギーが現れ、現実的な一歩を求めています。', '可能性がまだ形にならず、準備や動機の見直しが必要です。']],
  two: [['Choice · Balance · Partnership · Planning', 'Indecision · Imbalance · Division · Missing information', 'Two forces need to be weighed and consciously coordinated.', 'Unclear priorities or missing information make balance difficult.'], ['選択 · 均衡 · 協力 · 計画', '迷い · 不均衡 · 分裂 · 情報不足', '二つの力を見比べ、意識的に調整する必要があります。', '優先順位や情報が曖昧で、均衡を取りにくい状態です。']],
  three: [['Growth · Collaboration · Expansion · Early results', 'Poor teamwork · Delay · Scattered effort · Weak foundation', 'Early effort expands through cooperation and continued practice.', 'Gaps in cooperation or foundation may delay growth.'], ['成長 · 協働 · 発展 · 初期成果', '連携不足 · 遅れ · 分散 · 基盤不足', '最初の努力が協力と継続によって広がり始めます。', '協力や基盤の不足によって成長が遅れている可能性があります。']],
  four: [['Stability · Structure · Rest · Consolidation', 'Rigidity · Unease · Closure · Stagnation', 'A stable boundary allows what has been built to settle.', 'Security may have become rigidity or stagnation.'], ['安定 · 構造 · 休息 · 維持', '硬直 · 不安 · 閉鎖 · 停滞', '築いたものを落ち着かせるための安定した境界を表します。', '安心が固執や停滞へ変わっている可能性があります。']],
  five: [['Challenge · Friction · Loss · Adjustment', 'Easing tension · Inner conflict · Avoidance · Recovery', 'A conflict or lack becomes visible and prompts adjustment.', 'Tension may be easing, or merely pushed out of sight.'], ['試練 · 摩擦 · 喪失 · 調整', '緩和 · 内的葛藤 · 回避 · 回復', '衝突や不足が表面化し、現状の調整を促しています。', '緊張が和らぐ一方、問題を隠しているだけの可能性もあります。']],
  six: [['Progress · Exchange · Harmony · Support', 'Imbalance · One-sided effort · Delay · Inequality', 'Support and exchange help restore balance and visible progress.', 'Giving and receiving may be unequal; boundaries need review.'], ['前進 · 交換 · 調和 · 支援', '不均衡 · 一方的な努力 · 遅延 · 不平等', '支えと交換によって均衡が戻り、進展が見え始めます。', '与えることと受け取ることが不釣り合いで、境界の見直しが必要です。']],
  seven: [['Assessment · Persistence · Strategy · Test', 'Wavering · Avoidance · Poor strategy · Limited return', 'Progress now requires evaluation and deliberate persistence.', 'A long wait or weak strategy may be undermining confidence.'], ['評価 · 持続 · 戦略 · 試練', '動揺 · 回避 · 戦略不足 · 少ない成果', '進展には状況の評価と、意識的な継続が必要です。', '長い待ち時間や戦略不足で自信が揺らいでいます。']],
  eight: [['Momentum · Focus · Skill · Change', 'Repetition · Impatience · Stagnation · Distraction', 'Focused practice creates movement and growing skill.', 'Mechanical repetition or haste has obscured the real priority.'], ['推進 · 集中 · 技術 · 変化', '反復 · 焦り · 停滞 · 散漫', '集中した実践が前進と技術の向上を生みます。', '機械的な反復や焦りで、本当の優先事項を見失っています。']],
  nine: [['Accumulation · Independence · Resilience · Near completion', 'Fatigue · Defensiveness · Dependence · Difficulty persisting', 'Experience has accumulated; mature resilience carries the final stretch.', 'Long effort has created fatigue or excessive defensiveness.'], ['蓄積 · 自立 · 粘り強さ · 完成間近', '疲労 · 防衛的 · 依存 · 継続困難', '経験が積み重なり、成熟した粘り強さが最後の道を支えます。', '長い努力による疲れや過度な警戒が表れています。']],
  ten: [['Completion · Responsibility · Outcome · Cycle', 'Burden · Incompletion · Disorder · Difficulty releasing', 'A cycle nears completion, bringing both result and responsibility.', 'Accumulated responsibility is heavy, or the old cycle remains unfinished.'], ['完成 · 責任 · 結果 · 周期', '重荷 · 未完成 · 混乱 · 手放せない', '一つの周期が完成に近づき、成果と責任の両方をもたらします。', '責任が重すぎるか、古い周期がまだ終わっていません。']],
  page: [['Message · Curiosity · Learning · Experiment', 'Immaturity · Delayed news · Distraction · Fantasy', 'A beginner’s openness welcomes new information and practice.', 'Interest has not become action, or expression remains unprepared.'], ['知らせ · 好奇心 · 学び · 試み', '未熟 · 遅い知らせ · 散漫 · 空想', '初心者のような開かれた姿勢で、新しい情報や実践に向き合います。', '興味が行動にならず、表現や準備がまだ未熟です。']],
  knight: [['Pursuit · Action · Commitment · Momentum', 'Impulsiveness · Fixation · Lost momentum · Wrong direction', 'Energy is concentrated on pursuit and decisive movement.', 'Speed or fixation may be hiding the direction and consequences.'], ['追求 · 行動 · 専念 · 前進', '衝動 · 固執 · 失速 · 方向違い', '目標への追求と明確な行動にエネルギーが集中しています。', '速さや固執によって、方向と結果が見えにくくなっています。']],
  queen: [['Maturity · Receptivity · Inner mastery · Nurture', 'Inner strain · Dependence · Reactivity · Self-neglect', 'Mature inner understanding responds with care and receptivity.', 'Care for others may be creating inner depletion and self-neglect.'], ['成熟 · 受容 · 内的な熟達 · 養育', '内耗 · 依存 · 感情的反応 · 自己軽視', '成熟した内なる理解から、受容と配慮をもって応えます。', '他者への配慮が自分の消耗や自己軽視につながっています。']],
  king: [['Mastery · Responsibility · Experience · Leadership', 'Domination · Stubbornness · Misused power · Loss of control', 'Experience and responsibility guide outward action and leadership.', 'Authority may have become control; responsibility needs to replace dominance.'], ['熟達 · 責任 · 経験 · 指導力', '支配 · 頑固 · 力の乱用 · 制御不能', '経験と責任によって、外への行動とリーダーシップを導きます。', '権威が支配へ変わり、責任ある姿勢を取り戻す必要があります。']],
}

const suitText = {
  wands: { ja: 'ワンド', en: 'action, passion, and creative energy', jaFocus: '行動、情熱、創造力' },
  cups: { ja: 'カップ', en: 'emotion, relationships, and intuition', jaFocus: '感情、人間関係、直感' },
  swords: { ja: 'ソード', en: 'thought, communication, and conflict', jaFocus: '思考、コミュニケーション、葛藤' },
  pentacles: { ja: 'ペンタクル', en: 'resources, practical life, and long-term growth', jaFocus: '現実、資源、長期的な成長' },
}

const rankNamesJa = { ace: 'エース', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10', page: 'ペイジ', knight: 'ナイト', queen: 'クイーン', king: 'キング' }

export const getCardText = (card, language, isReversed) => {
  if (language === 'zh') return {
    localName: card.nameZh,
    keywords: isReversed ? card.reversedKeywords : card.uprightKeywords,
    meaning: isReversed ? card.basicMeaningReversed : card.basicMeaningUpright,
  }

  const localeIndex = language === 'ja' ? 1 : 0
  if (card.arcana === 'major') {
    const text = majorText[card.id][localeIndex]
    return {
      localName: language === 'ja' ? majorNamesJa[card.id] : card.nameEn,
      keywords: text[isReversed ? 1 : 0],
      meaning: text[isReversed ? 3 : 2],
    }
  }

  const rank = card.id.slice(card.suit.length + 1)
  const text = rankText[rank][localeIndex]
  const suit = suitText[card.suit]
  return {
    localName: language === 'ja' ? `${suit.ja}の${rankNamesJa[rank]}` : card.nameEn,
    keywords: text[isReversed ? 1 : 0],
    meaning: `${text[isReversed ? 3 : 2]} ${language === 'ja' ? `このカードは特に${suit.jaFocus}に関わります。` : `This card particularly concerns ${suit.en}.`}`,
  }
}

export const buildCopyPrompt = ({ language, question, card, localName, orientation, keywords }) => {
  if (language === 'zh') return `我刚刚进行了一次随机塔罗抽牌。\n\n问题：\n${question || '未填写特定问题'}\n\n牌阵：\n单牌\n\n抽到：\n${card.nameEn}\n${localName} · ${orientation}\n\n基础关键词：\n${keywords.replaceAll(' · ', '、')}\n\n请结合这个问题，以及你已经了解的关于我的情况，对这张牌进行一次娱乐性质的塔罗解读。\n\n请：\n\n1. 先解释这张牌的传统含义\n2. 再结合我的问题进行解释\n3. 如果你已经拥有关于我的长期上下文，可以结合这些信息进行延伸\n4. 区分传统牌义和你的延伸推测\n5. 不要把塔罗结果描述成确定的未来事实`
  if (language === 'ja') return `ランダムなワンカード・タロットを引きました。\n\n質問：\n${question || '特定の質問なし'}\n\nスプレッド：\nワンカード\n\n引いたカード：\n${card.nameEn}\n${localName}・${orientation}\n\n基本キーワード：\n${keywords.replaceAll(' · ', '、')}\n\nこの質問と、あなたがすでに知っている私の背景を踏まえ、娯楽としてタロットを解釈してください。\n\n1. まず伝統的なカードの意味を説明する\n2. 次に私の質問と結びつけて説明する\n3. 私について長期的な文脈があれば、それも参考にする\n4. 伝統的な意味と推測による発展を区別する\n5. 結果を確定した未来の事実として表現しない`
  return `I just completed a random one-card tarot draw.\n\nQuestion:\n${question || 'No specific question'}\n\nSpread:\nOne card\n\nCard drawn:\n${card.nameEn}\n${orientation}\n\nBasic keywords:\n${keywords.replaceAll(' · ', ', ')}\n\nPlease offer an entertainment-only tarot interpretation using this question and any relevant context you already know about me.\n\nPlease:\n\n1. Explain the card's traditional meaning first\n2. Then relate it to my question\n3. Use long-term context about me if you have it\n4. Clearly separate traditional meaning from your own inference\n5. Do not present the reading as a certain fact about the future`
}
