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

function renderDayPillarReading(dayPillar) {
  const preview = $('#readingPreview');
  const reading = DAY_PILLAR_READINGS[dayPillar];
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
