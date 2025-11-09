// UBT Exam System — updated:
// - images in question view are larger and clickable (lightbox modal)
// - Q21 audio play limited to 2 plays (then disabled)
// - selections remain in-memory only (no auto-select on load)
document.addEventListener('DOMContentLoaded', () => {
  // elements
  const loginCard = document.getElementById('loginCard');
  const brightnessCard = document.getElementById('brightnessCard');
  const volumeCard = document.getElementById('volumeCard');
  const infoCard = document.getElementById('infoCard');
  const startCard = document.getElementById('startCard');
  const examCard = document.getElementById('examCard');
  const questionViewCard = document.getElementById('questionViewCard');

  const loginForm = document.getElementById('loginForm');
  const examinee = document.getElementById('examinee');
  const fullname = document.getElementById('fullname');
  const dob = document.getElementById('dob');
  const msg = document.getElementById('msg');

  const infoExaminee = document.getElementById('infoExaminee');
  const infoName = document.getElementById('infoName');
  const infoDob = document.getElementById('infoDob');
  const startExaminee = document.getElementById('startExaminee');
  const startName = document.getElementById('startName');
  const candidateId = document.getElementById('candidateId');
  const timerEl = document.getElementById('timer');

  const brightnessRange = document.getElementById('brightnessRange');
  const brightnessValue = document.getElementById('brightnessValue');
  const backLogin = document.getElementById('backLogin');
  const toVolume = document.getElementById('toVolume');

  const volumeRange = document.getElementById('volumeRange');
  const playKorean = document.getElementById('playKorean');
  const backBrightness = document.getElementById('backBrightness');
  const toInfo = document.getElementById('toInfo');

  const backVolume = document.getElementById('backVolume');
  const toStart = document.getElementById('toStart');

  const backInfo = document.getElementById('backInfo');
  const startExamBtn = document.getElementById('startExamBtn');

  const gridReading = document.getElementById('gridReading');
  const gridListening = document.getElementById('gridListening');
  const finishExamBtn = document.getElementById('finishExamBtn');
  const examBackBtn = document.getElementById('examBackBtn');

  const qInstruction = document.getElementById('qInstruction');
  const qImage = document.getElementById('qImage');
  const qMediaWrap = document.getElementById('qMediaWrap');
  const audioIcon = document.getElementById('audioIcon');
  const audioPlayBtn = document.getElementById('audioPlayBtn');
  const audioStatus = document.getElementById('audioStatus');
  const qAudio = document.getElementById('qAudio');

  const questionViewTitle = document.getElementById('questionViewTitle');
  const qStemLabel = document.getElementById('qStemLabel');
  const qStemContent = document.getElementById('qStemContent');
  const qOptions = document.getElementById('qOptions');
  const qPrevBtn = document.getElementById('qPrevBtn');
  const qNextBtn = document.getElementById('qNextBtn');
  const allQBtn = document.getElementById('allQBtn');

  // lightbox modal
  const imgModal = document.getElementById('imgModal');
  const modalImg = document.getElementById('modalImg');

  // config
  const READING_COUNT = 20;
  const LISTENING_COUNT = 20;
  const TOTAL_QUESTIONS = READING_COUNT + LISTENING_COUNT + 1; // we added Q21
  const LISTENING_START = 21;
  const EXAM_DURATION_SECONDS = 50 * 60;

  // timer (persisted)
  let timerInterval = null;
  const msNow = () => Date.now();
  const setExamEndTimeFromNow = (seconds) => {
    const end = msNow() + seconds * 1000;
    localStorage.setItem('exam_end_time', String(end));
    return end;
  };
  const getExamEndTime = () => parseInt(localStorage.getItem('exam_end_time') || '0', 10);
  const clearExamEndTime = () => localStorage.removeItem('exam_end_time');

  function updateTimerDisplay(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    timerEl.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function startTimer() {
    stopTimer();
    let end = getExamEndTime();
    if (!end || end < msNow()) end = setExamEndTimeFromNow(EXAM_DURATION_SECONDS);

    function tick() {
      const remain = Math.floor((end - msNow()) / 1000);
      if (remain <= 0) {
        updateTimerDisplay(0);
        stopTimer();
        clearExamEndTime();
        alert("Time's up! Auto-submitting...");
        return;
      }
      updateTimerDisplay(remain);
    }
    tick();
    timerInterval = setInterval(tick, 1000);
  }

  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
  }

  const savedEnd = getExamEndTime();
  if (savedEnd && savedEnd > msNow()) startTimer();
  else updateTimerDisplay(EXAM_DURATION_SECONDS);

  // answers: in-memory only
  const answersMap = {};   // e.g. { 'R1': '2' }
  const answeredSet = new Set();

  // audio play counters: track plays per audio file (only Q21 currently)
  const audioPlayCounts = {}; // { '21-T.mp3': 1 }

  function keyFor(n) {
    return (n >= LISTENING_START) ? `L${n}` : `R${n}`;
  }

  // login flow
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.textContent = '';
    if (!examinee.value.trim()) { msg.textContent = 'Enter Examinee Number'; return; }
    if (!dob.value) { msg.textContent = 'Select DOB'; return; }

    localStorage.setItem('exam_examinee', examinee.value.trim());
    localStorage.setItem('exam_fullname', fullname.value.trim());
    localStorage.setItem('exam_dob', dob.value);

    candidateId.textContent = examinee.value.trim();
    loginCard.hidden = true;
    brightnessCard.hidden = false;
  });

  // brightness live
  if (brightnessRange && brightnessValue) {
    brightnessRange.addEventListener('input', () => {
      const val = parseFloat(brightnessRange.value);
      document.body.style.filter = `brightness(${val})`;
      brightnessValue.textContent = Math.round(val * 100) + '%';
    });
  }
  backLogin.addEventListener('click', () => { brightnessCard.hidden = true; loginCard.hidden = false; });
  toVolume.addEventListener('click', () => { document.body.style.filter = `brightness(${brightnessRange.value})`; brightnessCard.hidden = true; volumeCard.hidden = false; });

  // volume TTS
  if (playKorean) {
    playKorean.addEventListener('click', () => {
      const u = new SpeechSynthesisUtterance('한국 사랑해');
      u.lang = 'ko-KR';
      u.volume = parseFloat(volumeRange.value || '1');
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    });
  }
  backBrightness.addEventListener('click', () => { volumeCard.hidden = true; brightnessCard.hidden = false; });
  toInfo.addEventListener('click', () => {
    infoExaminee.textContent = examinee.value || '-';
    infoName.textContent = fullname.value || '-';
    infoDob.textContent = dob.value || '-';
    volumeCard.hidden = true; infoCard.hidden = false;
  });

  // info
  backVolume.addEventListener('click', () => { infoCard.hidden = true; volumeCard.hidden = false; });
  toStart.addEventListener('click', () => { startExaminee.textContent = examinee.value || '-'; startName.textContent = fullname.value || '-'; infoCard.hidden = true; startCard.hidden = false; });

  // start
  backInfo.addEventListener('click', () => { startCard.hidden = true; infoCard.hidden = false; });
  startExamBtn.addEventListener('click', () => {
    // reset in-memory answers at exam start
    for (const k in answersMap) delete answersMap[k];
    answeredSet.clear();
    // reset audio counts
    for (const k in audioPlayCounts) delete audioPlayCounts[k];

    startCard.hidden = true; examCard.hidden = false;
    clearExamEndTime(); setExamEndTimeFromNow(EXAM_DURATION_SECONDS); startTimer();
    buildPalette(); bindPaletteToOpenQuestions();
  });

  // build palette (numbers only; larger touch targets)
  function buildPalette() {
    if (!gridReading || !gridListening) return;
    gridReading.innerHTML = ''; gridListening.innerHTML = '';

    for (let i=1;i<=READING_COUNT;i++){
      const d = document.createElement('div');
      d.className = 'q-item'; d.textContent = i; d.dataset.q = `R${i}`; d.tabIndex = 0;
      if (answeredSet.has(`R${i}`)) d.classList.add('answered');
      d.addEventListener('click', ()=> openQuestion(i));
      gridReading.appendChild(d);
    }
    for (let i=21;i<=40;i++){
      const d = document.createElement('div');
      d.className = 'q-item'; d.textContent = i; d.dataset.q = `L${i}`; d.tabIndex = 0;
      if (answeredSet.has(`L${i}`)) d.classList.add('answered');
      d.addEventListener('click', ()=> openQuestion(i));
      gridListening.appendChild(d);
    }
  }

  // question data through Q21
  function getQuestionData(qNum){
    if (qNum === 1) return { title:`Question ${qNum}`, instruction:'다음을 보고 맞는 단어나 문장을 고르십시오.', image:'q1.png', options:['① 볼펜입니다.','② 가위입니다.','③ 안경입니다.','④ 가방입니다.'], correct:'4' };
    if (qNum === 2) return { title:`Question ${qNum}`, instruction:'다음을 보고 맞는 단어나 문장을 고르십시오.', image:'q2.png', options:['① 지게차입니다.','② 굴착기입니다.','③ 트랙터입니다.','④ 경운기입니다.'], correct:'1' };
    if (qNum === 3) return { title:`Question ${qNum}`, instruction:'다음을 보고 맞는 단어나 문장을 고르십시오.', image:'q3.png', options:['① 책을 읽고 있습니다.','② 밥을 먹고 있습니다.','③ 친구를 만나고 있습니다.','④ 피아노를 치고 있습니다.'], correct:'4' };
    if (qNum === 4) return { title:`Question ${qNum}`, instruction:'다음을 보고 맞는 단어나 문장을 고르십시오.', image:'q4.png', options:['① 전기가 흐르니까 조심하세요.','② 떨어질 수 있으니까 조심하세요.','③ 바닥이 미끄러우니까 조심하세요.','④ 불이 붙을 수 있으니까 조심하세요.'], correct:'2' };
    if (qNum === 5) return { title:`Question ${qNum}`, instruction:'5.다음 중 밑줄 친 부분이 맞는 것은 무엇입니까?', image:null, options:['① 집<span class="uline">을</span> 작아요.','② 딸기<span class="uline">가</span> 먹어요.','③ 회사<span class="uline">에</span> 다녀요.','④ 겨울<span class="uline">에서</span> 추워요.'], correct:'3' };
    if (qNum === 6) return { title:`Question ${qNum}`, instruction:'6.다음 중 밑줄 친 부분이 맞는 것은 무엇입니까?', image:null, options:['① 퇴근할 때 문을 <span class="uline">달으세요</span>.','② 친구한테서 선물을 <span class="uline">받았어요</span>.','③ 심심하면 한국 노래를 <span class="uline">듣어요</span>.','④ 오늘 시내에서 많이 <span class="uline">걷었어요</span>.'], correct:'2' };
    if (qNum === 7) return { title:`Question ${qNum}`, instruction:'[7~10] 다음 글을 읽고 물음에 답하십시오.\n7. 이 병원이 문을 여는 시간은 언제입니까?', image:'q7.png', options:['① 부천시입니다.','② 김미소입니다.','③ 튼튼치과입니다.','④ 오전 아홉 시입니다.'], correct:'4' };
    if (qNum === 8) return { title:`Question ${qNum}`, instruction:'8. 다음 단어와 관계있는 것은 무엇입니까?', image:'q8.png', options:['1. 컴퓨터','2. 작업복','3. 비빔밥','4. 기차표'], correct:'2' };
    if (qNum === 9) return { title:`Question ${qNum}`, instruction:'9. 다음 단어와 관계있는 것은 무엇입니까?', image:'q9.png', options:['① 근로자가 일하는 곳이에요.','② 근로자가 거주하는 곳이에요.','③ 근로자가 운동하는 곳이에요.','④ 근로자가 상담하는 곳이에요.'], correct:'1' };
    if (qNum === 10) return { title:`Question ${qNum}`, instruction:'10. 한국의 수산물 수입 현황에 대한 설명으로 맞는 것은 무엇입니까?', image:'q10.png', options:['① 한국은 수산물을 중국에서 가장 많이 수입합니다.','② 한국이 수입하는 수산물 중 베트남산은 5% 미만입니다.','③ 한국이 수산물을 수입하는 국가 중 2위는 노르웨이입니다.','④ 한국은 미국보다 러시아에서 수산물을 더 많이 수입합니다.'], correct:'4' };
    if (qNum === 11) return { title:`Question ${qNum}`, instruction:'빈칸에 들어갈 가장 알맞은 것을 고르십시오.', image:'q11.png', options:['1. 가족 모임','2. 생일 선물','3. 출근 시간','4. 통장 입금'], correct:'4' };
    if (qNum === 12) return { title:`Question ${qNum}`, instruction:'12. 빈칸에 들어갈 가장 알맞은 것을 고르십시오.', image:'q12.png', options:['① 듣느라고','② 들으려고','③ 들으면서','④ 듣자마자'], correct:'3' };
    if (qNum === 13) return { title:`Question ${qNum}`, instruction:'13. 빈칸에 들어갈 가장 알맞은 것을 고르십시오.', image:'q13.png', options:['① 조심하게','② 조심해서','③ 서두르게','④ 서둘러서'], correct:'4' };
    if (qNum === 14) return { title:`Question ${qNum}`, instruction:'14. 빈칸에 들어갈 가장 알맞은 것을 고르십시오.', image:'q14.png', options:['① 틀면','② 틀고','③ 틀려면','④ 틀려고'], correct:'2' };
    if (qNum === 15) return { title:`Question ${qNum}`, instruction:'15. 빈칸에 들어갈 가장 알맞은 것을 고르십시오.', image:'q15.png', options:['① 맞는 것이 좋습니다','② 놓는 것이 좋습니다','③ 맞지 않도록 합니다','④ 놓지 않도록 합니다'], correct:'1' };
    if (qNum === 16) return { title:`Question ${qNum}`, instruction:'16. 빈칸에 들어갈 가장 알맞은 것을 고르십시오.', image:'q16.png', options:['① 반사 조끼를 착용해야 합니다','② 보호 장갑을 구매해야 합니다','③ 비상 계단을 이용해야 합니다','④ 환기 장치를 작동해야 합니다'], correct:'1' };
    if (qNum === 17) return { title:`Question ${qNum}`, instruction:'17. 다음 설명에 알맞은 어휘를 고르십시오.', image:'q17.png', options:['① 토치','② 펜치','③ 쇠톱','④ 망치'], correct:'2' };
    if (qNum === 18) return { title:`Question ${qNum}`, instruction:'18. 다음 글을 읽고 무엇에 대한 글인지 고르십시오', image:'q18.png', options:['1 계절 음식','2 음식 재료','3 조리 방법','4 조리 시기'], correct:'1' };
    if (qNum === 19) return { title:`Question ${qNum}`, instruction:'19. 다음 글을 읽고 내용과 같은 것을 고르십시오', image:'q19.png', options:['1 사내 휴게실의 출입문 비밀번호는 따로 없습니다.','2 회사 직원은 누구나 휴게실을 이용할 수 있습니다.','3 휴게실 이용 후에는 문을 열어 두고 나가야 합니다.','4 점심 도시락을 싸 가서 휴게실에서 먹을 수 있습니다.'], correct:'2' };
    if (qNum === 20) return { title:`Question ${qNum}`, instruction:'20. 다음 글을 읽고 내용과 같은 것을 고르십시오.', image:'q20.png', options:['1 사업주는 4대 사회보험에 모두 가입해야 합니다.','2 산재보험은 근로자와 사업주가 모두 가입해야 합니다.','3 사업주는 사고가 발생하면 보험금을 받을 수 있습니다.','4 근로자는 가입하고 싶은 보험을 선택하여 가입할 수 있습니다.'], correct:'1' };

    // Q21 listening with audio limit
    if (qNum === 21) {
      return {
        title:`Question ${qNum}`,
        instruction:'21. 들은 것을 고르십시오.',
        image: null,
        audio: '21-T.mp3',
        options:[
          '1 가구',
          '2 기구',
          '3 가게',
          '4 거기'
        ],
        correct: '1'
      };
    }

    // fallback
    return { title:`Question ${qNum}`, instruction:'다음을 보고 맞는 단어나 문장을 고르십시오.', image:null, options:['Option A','Option B','Option C','Option D'] };
  }

  let currentQuestionNumber = 1;

  // open question view
  function openQuestion(qNum){
    currentQuestionNumber = qNum;
    const data = getQuestionData(qNum);
    if (questionViewTitle) questionViewTitle.textContent = `Question ${qNum}`;
    if (qInstruction) qInstruction.textContent = data.instruction || '';

    // reset media area
    if (qImage) { qImage.style.display = 'none'; qImage.src = ''; qImage.removeAttribute('data-src'); }
    audioIcon.style.display = 'none';
    qAudio.pause();
    qAudio.src = '';
    audioPlayBtn.setAttribute('aria-pressed','false');
    audioPlayBtn.textContent = '►';
    audioStatus.textContent = '';

    // show image or audio
    if (data.image) {
      qImage.src = data.image;
      qImage.style.display = 'block';
      qImage.setAttribute('data-src', data.image);
      audioIcon.style.display = 'none';
    } else if (data.audio) {
      audioIcon.style.display = 'flex';
      qAudio.src = data.audio;
      qAudio.load();
      audioStatus.textContent = 'Ready';
      // ensure play count exists
      audioPlayCounts[data.audio] = audioPlayCounts[data.audio] || 0;
      updateAudioButtonState(data.audio);
    }

    // options
    if (qOptions){
      qOptions.innerHTML = '';
      data.options.forEach((optText, idx)=>{
        const optNum = String(idx+1);
        const btn = document.createElement('button');
        btn.className = 'opt-btn'; btn.dataset.opt = optNum;
        btn.innerHTML = optText;

        // restore selection from in-memory only
        const existing = answersMap[keyFor(qNum)];
        if (existing && existing === optNum) btn.classList.add('selected');

        btn.addEventListener('click', ()=>{
          answersMap[keyFor(qNum)] = optNum;
          answeredSet.add(keyFor(qNum));
          qOptions.querySelectorAll('.opt-btn').forEach(s=>s.classList.remove('selected'));
          btn.classList.add('selected');
          const palEl = document.querySelector(`.q-item[data-q="${keyFor(qNum)}"]`);
          if (palEl) palEl.classList.add('answered');
        });
        qOptions.appendChild(btn);
      });
    }

    if (questionViewCard) questionViewCard.hidden = false;
    if (examCard) examCard.hidden = true;
    window.scrollTo({ top:0, behavior:'smooth' });
  }

  // update audio play button state depending on play count (max 2 plays)
  function updateAudioButtonState(audioFile) {
    const count = audioPlayCounts[audioFile] || 0;
    if (count >= 2) {
      audioPlayBtn.disabled = true;
      audioStatus.textContent = 'Disabled';
      audioPlayBtn.setAttribute('aria-pressed','false');
      audioPlayBtn.textContent = '►';
    } else {
      audioPlayBtn.disabled = false;
      // leave status as it is (Ready/Paused/etc.)
    }
  }

  // audio control
  audioPlayBtn.addEventListener('click', () => {
    // if no src or disabled, do nothing
    if (!qAudio.src) return;
    if (audioPlayBtn.disabled) return;

    const src = qAudio.src.split('/').pop();

    if (qAudio.paused) {
      // if playing now would exceed limit, prevent
      const used = audioPlayCounts[src] || 0;
      if (used >= 2) {
        updateAudioButtonState(src);
        return;
      }
      qAudio.volume = parseFloat(volumeRange.value || '1');
      qAudio.play();
      // increment play count immediately (counts starts when play triggered)
      audioPlayCounts[src] = (audioPlayCounts[src] || 0) + 1;
      updateAudioButtonState(src);
      audioPlayBtn.setAttribute('aria-pressed','true');
      audioPlayBtn.textContent = '❚❚';
      audioStatus.textContent = `Playing (${audioPlayCounts[src]}/2)`;
    } else {
      qAudio.pause();
      audioPlayBtn.setAttribute('aria-pressed','false');
      audioPlayBtn.textContent = '►';
      audioStatus.textContent = 'Paused';
    }
  });

  qAudio.addEventListener('ended', () => {
    const src = qAudio.src.split('/').pop();
    audioPlayBtn.setAttribute('aria-pressed','false');
    audioPlayBtn.textContent = '►';
    const used = audioPlayCounts[src] || 0;
    audioStatus.textContent = used >= 2 ? 'Disabled' : 'Ended';
    updateAudioButtonState(src);
  });

  // image click => open modal (lightbox)
  qImage.addEventListener('click', () => {
    const src = qImage.getAttribute('data-src') || qImage.src;
    if (!src) return;
    modalImg.src = src;
    imgModal.setAttribute('aria-hidden','false');
  });

  // close modal on click anywhere
  imgModal.addEventListener('click', () => {
    imgModal.setAttribute('aria-hidden','true');
    modalImg.src = '';
  });

  // navigation
  qPrevBtn.addEventListener('click', ()=> { let n = currentQuestionNumber; if(n>1) n--; openQuestion(n); });
  qNextBtn.addEventListener('click', ()=> { let n = currentQuestionNumber; if(n<40) n++; openQuestion(n); });
  allQBtn.addEventListener('click', ()=> { if(questionViewCard) questionViewCard.hidden=true; if(examCard) examCard.hidden=false; window.scrollTo({ top:0, behavior:'smooth' }); });

  function bindPaletteToOpenQuestions(){
    document.querySelectorAll('.q-item').forEach(el=>{
      if (el._openHandler) el.removeEventListener('click', el._openHandler);
      el._openHandler = ()=> { const qnum = parseInt(el.textContent,10); openQuestion(qnum); };
      el.addEventListener('click', el._openHandler);
    });
  }

  examBackBtn.addEventListener('click', ()=> { examCard.hidden = true; startCard.hidden = false; });
  finishExamBtn.addEventListener('click', ()=> {
    const answeredCount = answeredSet.size;
    if (!confirm(`You have answered ${answeredCount} questions. Submit exam?`)) return;
    alert('Exam submitted (demo).');
    clearExamEndTime(); stopTimer();
    // clear in-memory answers
    for (const k in answersMap) delete answersMap[k];
    answeredSet.clear();
  });

  // show stored candidate id if exists
  const storedId = localStorage.getItem('exam_examinee');
  if (storedId) candidateId.textContent = storedId;

  // initial palette build if needed
  // (only when user Start Exam will rebuild and bind)
  window.addEventListener('beforeunload', ()=> stopTimer());
});
