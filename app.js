const state = { topic: '', birthDate: '', calendarType: '양력', birthTime: '', birthCity: '', concern: '', step: 1 };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const hero = $('#heroScreen');
const form = $('#formScreen');
const review = $('#reviewScreen');
const complete = $('#completeScreen');
const restart = $('#restartButton');

function showScreen(screen) {
  [hero, form, review, complete].forEach((item) => item.hidden = item !== screen);
  restart.hidden = screen === hero;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function syncProgress() {
  $$('.progress-dot').forEach((dot, index) => dot.classList.toggle('active', index < state.step));
  $$('.form-step').forEach((step) => step.classList.toggle('active', Number(step.dataset.step) === state.step));
  $$('.form-step').forEach((step) => step.hidden = !step.classList.contains('active'));
}

function moveTo(step) {
  state.step = step;
  syncProgress();
}

function validateStepTwo() {
  state.birthDate = formatBirthDate($('#birthDate').value);
  $('#birthDate').value = state.birthDate;
  state.calendarType = $('#calendarType').value;
  state.birthTime = $('#birthTime').value;
  state.birthCity = $('#birthCity').value.trim();
  if (!/^\d{4}\.\d{2}\.\d{2}$/.test(state.birthDate) || !state.birthTime || !state.birthCity) {
    alert('생년월일, 태어난 시간, 출생 도시를 입력해줘요.');
    return false;
  }
  return true;
}

function formatBirthDate(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}.${digits.slice(4)}`;
  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`;
}

function fillSummary() {
  $('#summaryTopic').textContent = state.topic;
  $('#summaryBirth').textContent = `${state.birthDate} (${state.calendarType})`;
  $('#summaryTime').textContent = state.birthTime;
  $('#summaryCity').textContent = state.birthCity;
  $('#summaryConcern').textContent = state.concern || '상담에서 이야기하고 싶어요.';
}

function hourFromBirthTime(value) {
  if (value.includes('자시')) return 23;
  if (value.includes('축시')) return 1;
  if (value.includes('인시')) return 3;
  if (value.includes('묘시')) return 5;
  if (value.includes('진시')) return 7;
  if (value.includes('사시')) return 9;
  if (value.includes('오시')) return 11;
  if (value.includes('미시')) return 13;
  if (value.includes('신시')) return 15;
  if (value.includes('유시')) return 17;
  if (value.includes('술시')) return 19;
  if (value.includes('해시')) return 21;
  return 12;
}

function mod(number, divisor) { return ((number % divisor) + divisor) % divisor; }

function julianDayNumber(year, month, day) {
  const adjust = Math.floor((14 - month) / 12);
  const adjustedYear = year + 4800 - adjust;
  const adjustedMonth = month + 12 * adjust - 3;
  return day + Math.floor((153 * adjustedMonth + 2) / 5) + 365 * adjustedYear + Math.floor(adjustedYear / 4) - Math.floor(adjustedYear / 100) + Math.floor(adjustedYear / 400) - 32045;
}

function simpleFourPillars(year, month, day, hour) {
  const stems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  const branches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  const boundaries = [null, 6, 4, 6, 5, 6, 6, 7, 8, 8, 7, 7];
  let monthIndex;
  if (month === 1) monthIndex = day >= 6 ? 11 : 10;
  else monthIndex = day >= boundaries[month] ? mod(month - 2, 12) : mod(month - 3, 12);
  const sajuYear = (month < 2 || (month === 2 && day < 4)) ? year - 1 : year;
  const yearIndex = mod(sajuYear - 4, 60);
  const yearStem = yearIndex % 10;
  const dayIndex = mod(julianDayNumber(year, month, day) + 49, 60);
  const dayStem = dayIndex % 10;
  const hourBranch = mod(Math.floor((hour + 1) / 2), 12);
  const hourStem = mod((dayStem % 5) * 2 + hourBranch, 10);
  const pillar = (stem, branch) => `${stems[stem]}${branches[branch]}`;
  return {
    year: pillar(yearStem, yearIndex % 12),
    month: pillar(mod(yearStem * 2 + 2 + monthIndex, 10), mod(2 + monthIndex, 12)),
    day: pillar(dayStem, dayIndex % 12),
    hour: pillar(hourStem, hourBranch),
  };
}

const DAY_PILLAR_READINGS = {
  정사: {
    title: '정사일주',
    intro: '촛불처럼 섬세하지만, 마음속 기준은 생각보다 뜨거운 사람이에요. 좋아하는 것과 아닌 것이 분명해요.',
    chapters: [
      ['결혼·연애', '마음이 열리면 깊게 몰입하지만, 애매한 태도가 길어지면 빠르게 지쳐요. 사랑에서도 말보다 행동과 일관성을 봐요.'],
      ['남자', '나를 가르치려 들거나 기세로 누르려는 사람보다, 자기 몫을 해내면서 대화가 되는 남자와 오래 가는 편이에요.'],
      ['일', '감각·표현·기획에 힘이 실리기 쉬워요. 사람의 마음을 읽어 말과 이야기로 풀어내는 일, 내 이름을 걸고 하는 일이 잘 맞을 수 있어요.'],
      ['일생의 흐름', '처음부터 편하게 맞춰가기보다, 시행착오 속에서 내 기준을 세우며 단단해지는 타입이에요. 선택을 줄이고 집중할수록 힘이 모여요.'],
    ],
  },
};

// 모든 일주는 같은 네 개의 챕터를 제공한다. 아래 결은 '확정'이 아니라
// 일주를 가볍게 읽는 첫 문장으로만 사용한다.
const STEM_TONES = {
  갑: { intro: '곧게 뻗는 나무처럼 자기 방향을 먼저 세우려는 결이 있어요.', relation: '관계에서도 존중받는 느낌이 중요하고, 지나친 간섭에는 금방 답답함을 느낄 수 있어요.', work: '시작을 만드는 일과 새로운 판을 여는 역할에서 힘이 나기 쉬워요.', flow: '초반에는 부딪히며 배우고, 자기 기준이 단단해질수록 속도가 붙는 편이에요.' },
  을: { intro: '부드러운 풀처럼 주변의 흐름을 읽고 연결하는 감각이 있어요.', relation: '다정함을 주고받을 때 편하지만, 마음을 알아주지 않는 관계에서는 쉽게 지칠 수 있어요.', work: '조율·기획·관계 관리처럼 섬세하게 이어가는 일에서 장점이 보여요.', flow: '빨리 밀어붙이기보다 환경을 내 편으로 만들며 꾸준히 커가는 흐름이에요.' },
  병: { intro: '햇빛처럼 솔직하고 바깥으로 에너지가 드러나는 결이 있어요.', relation: '답답한 눈치 게임보다 분명하고 밝은 소통에서 마음이 편해요.', work: '표현·홍보·리더십처럼 존재감을 쓰는 일에서 힘이 날 수 있어요.', flow: '경험이 쌓일수록 영향력과 자신감이 함께 커지는 편이에요.' },
  정: { intro: '촛불처럼 섬세하지만 마음속 기준은 뜨거운 결이 있어요.', relation: '말보다 태도와 일관성을 보고, 애매함이 길어지면 마음을 접기 쉬워요.', work: '감각·표현·기획처럼 마음을 읽어 이야기로 풀어내는 일에 강점이 있어요.', flow: '자기 리듬을 찾고 집중할수록 결과가 차곡차곡 쌓이는 편이에요.' },
  무: { intro: '큰 산처럼 책임과 중심을 중시하는 결이 있어요.', relation: '가벼운 말보다 신뢰가 중요하고, 오래 볼수록 마음을 여는 편이에요.', work: '관리·운영·판단처럼 든든하게 중심을 잡는 일에서 강점이 보여요.', flow: '빠른 변화보다 기반을 다져 갈수록 안정적인 성과가 나기 쉬워요.' },
  기: { intro: '잘 갈린 흙처럼 현실을 돌보고 키우는 결이 있어요.', relation: '작은 배려와 생활의 합이 맞을 때 관계에 깊은 안정을 느껴요.', work: '돌봄·실무·브랜딩처럼 손에 잡히는 결과를 만드는 일과 잘 맞을 수 있어요.', flow: '눈에 띄지 않는 준비가 나중에 큰 차이를 만드는 편이에요.' },
  경: { intro: '날이 선 쇠처럼 결단과 원칙이 분명한 결이 있어요.', relation: '돌려 말하기보다 솔직함을 선호하지만, 말의 온도는 의식할수록 관계가 편해져요.', work: '개척·결정·문제 해결처럼 답을 만들어야 하는 자리에서 힘이 나요.', flow: '부딪힘을 경험으로 바꿀수록 자기 실력이 뚜렷해지는 편이에요.' },
  신: { intro: '보석처럼 정교하고 섬세한 기준을 가진 결이 있어요.', relation: '취향과 예의가 맞는 관계에서 마음이 열리고, 무심함에는 예민해질 수 있어요.', work: '디테일·분석·미감처럼 완성도를 높이는 일에서 강점이 보여요.', flow: '천천히 고른 선택이 나중에 좋은 결과로 이어지기 쉬워요.' },
  임: { intro: '큰 물처럼 넓게 보고 크게 움직이려는 결이 있어요.', relation: '자유로운 대화와 성장감이 있어야 관계도 오래 즐길 수 있어요.', work: '기획·확장·이동처럼 넓은 판을 다루는 일에서 기운이 살아날 수 있어요.', flow: '방향을 정한 뒤에는 예상보다 멀리까지 나아가는 편이에요.' },
  계: { intro: '이슬비처럼 관찰력과 직감이 섬세한 결이 있어요.', relation: '표현은 조심스러워도 마음을 깊이 읽고, 안전한 관계에서 진심을 보여줘요.', work: '연구·상담·콘텐츠처럼 보이지 않는 결을 읽는 일에서 강점이 보여요.', flow: '조용히 쌓아 둔 감각이 결정적인 순간에 빛나는 편이에요.' },
};

const BRANCH_TONES = {
  자: '빠른 감각과 상황 판단이 더해져, 겉으로는 차분해도 속생각이 바쁠 수 있어요.',
  축: '신중함과 끈기가 더해져, 쉽게 약속하지 않지만 한 번 정하면 오래 가는 편이에요.',
  인: '도전심과 자존감이 더해져, 내 길이라는 확신이 생길 때 추진력이 커져요.',
  묘: '감수성과 미감이 더해져, 분위기와 말의 결을 세심하게 느끼는 편이에요.',
  진: '현실 감각과 확장성이 더해져, 작은 가능성도 크게 키우려는 면이 있어요.',
  사: '집중력과 직감이 더해져, 관심이 생긴 일에는 깊게 파고드는 편이에요.',
  오: '표현력과 속도가 더해져, 답답한 환경보다 활기 있는 흐름에서 힘이 나요.',
  미: '배려와 조화 감각이 더해져, 사람과 현실 사이의 균형을 오래 생각해요.',
  신: '재치와 전략이 더해져, 낯선 상황에서도 방법을 빨리 찾아내는 편이에요.',
  유: '정확함과 심미안이 더해져, 어설픈 것보다 깔끔한 기준을 선호해요.',
  술: '의리와 방어 본능이 더해져, 내 사람과 내 원칙을 지키려는 마음이 커요.',
  해: '공감과 상상력이 더해져, 사람의 속마음과 가능성을 넓게 바라보는 편이에요.',
};

function createDayPillarReading(dayPillar) {
  const stem = dayPillar[0];
  const branch = dayPillar[1];
  const tone = STEM_TONES[stem];
  const branchTone = BRANCH_TONES[branch];
  if (!tone || !branchTone) return null;
  return {
    title: `${dayPillar}일주`,
    intro: `${tone.intro} ${branchTone}`,
    chapters: [
      ['연애·관계', `${tone.relation} ${branchTone}`],
      ['사람', '잘 맞는 사람은 나를 함부로 규정하지 않고, 서로의 기준을 대화로 맞춰 가는 사람이에요. 일주 하나만으로 궁합 전체를 단정하진 않아요.'],
      ['일', `${tone.work} 사주 전체 구조와 시기에 따라 쓰이는 방식은 달라질 수 있어요.`],
      ['일생의 흐름', `${tone.flow} 지금의 운과 환경까지 함께 보면 더 구체적인 방향을 읽을 수 있어요.`],
    ],
  };
}

function renderDayPillarReading(dayPillar) {
  const preview = $('#readingPreview');
  const reading = DAY_PILLAR_READINGS[dayPillar] || createDayPillarReading(dayPillar);
  preview.hidden = false;
  if (!reading) {
    $('#readingTitle').textContent = `${dayPillar}일주`;
    $('#readingIntro').textContent = '일주는 나를 움직이는 기본 결을 보여주는 한 장면이에요.';
    $('#readingChapters').innerHTML = '<article class="reading-chapter"><strong>가벼운 미리보기</strong><p>지금은 사주팔자와 일주만 먼저 확인했어요. 관계, 일, 시기까지 자세히 보려면 유료 상담에서 전체 구조를 함께 읽어봐요.</p></article>';
    return;
  }
  $('#readingTitle').textContent = reading.title;
  $('#readingIntro').textContent = reading.intro;
  $('#readingChapters').innerHTML = reading.chapters.map(([title, body]) => `<article class="reading-chapter"><strong>${title}</strong><p>${body}</p></article>`).join('');
}

function fillManseyeokPreview() {
  const labels = { year: $('#pillarYear'), month: $('#pillarMonth'), day: $('#pillarDay'), hour: $('#pillarHour') };
  if (state.calendarType === '음력') {
    Object.values(labels).forEach((item) => { item.textContent = '—'; });
    $('#readingPreview').hidden = true;
    $('#pillarNote').textContent = '음력·윤달은 정식 만세력 계산에서 확인해요. 지금 미리보기는 양력 입력만 지원해.';
    return;
  }
  const [year, month, day] = state.birthDate.split('.').map(Number);
  const timeUnknown = state.birthTime.includes('모름');
  const result = simpleFourPillars(year, month, day, hourFromBirthTime(state.birthTime));
  labels.year.textContent = result.year;
  labels.month.textContent = result.month;
  labels.day.textContent = result.day;
  labels.hour.textContent = timeUnknown ? '미상' : result.hour;
  renderDayPillarReading(result.day);
  $('#pillarNote').textContent = timeUnknown ? '출생 시간이 없어 시주는 표시하지 않았어요. 년·월·일주는 확인할 수 있어요.' : '가벼운 양력 미리보기예요. 절기 경계·해외 출생·자정 전후는 상담 전 다시 확인해요.';
}

$('#startButton').addEventListener('click', () => { showScreen(form); moveTo(1); });
$('#birthDate').addEventListener('input', (event) => {
  event.target.value = formatBirthDate(event.target.value);
});
restart.addEventListener('click', () => showScreen(hero));
$('#homeButton').addEventListener('click', () => showScreen(hero));

$$('.choice-card').forEach((card) => card.addEventListener('click', () => {
  $$('.choice-card').forEach((item) => item.classList.remove('selected'));
  card.classList.add('selected');
  state.topic = card.dataset.topic;
  $('.form-step[data-step="1"] .next-button').disabled = false;
}));

$('.form-step[data-step="1"] .next-button').addEventListener('click', () => moveTo(2));
$('.form-step[data-step="2"] .back-button').addEventListener('click', () => moveTo(1));
$('.form-step[data-step="2"] .next-button').addEventListener('click', () => { if (validateStepTwo()) moveTo(3); });
$('.form-step[data-step="3"] .back-button').addEventListener('click', () => moveTo(2));
$('#concernText').addEventListener('input', (event) => {
  state.concern = event.target.value.trim();
  $('#charCount').textContent = `${event.target.value.length} / 160`;
});
$('#reviewButton').addEventListener('click', () => { state.concern = $('#concernText').value.trim(); fillSummary(); showScreen(review); fillManseyeokPreview(); });
$('#editButton').addEventListener('click', () => { showScreen(form); moveTo(3); });
$('#submitButton').addEventListener('click', () => showScreen(complete));
$('#copyButton').addEventListener('click', async () => {
  const message = `[팔자툰 상담 준비]\n주제: ${state.topic}\n생년월일: ${state.birthDate} (${state.calendarType})\n태어난 시간: ${state.birthTime}\n출생 도시: ${state.birthCity}\n고민: ${state.concern || '상담에서 이야기하고 싶어요.'}`;
  try { await navigator.clipboard.writeText(message); $('#copyButton').textContent = '복사됐어요'; }
  catch { $('#copyButton').textContent = '복사에 실패했어요'; }
});

syncProgress();
