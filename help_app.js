/**
 * AI Music Competition — Live Evaluation & Stage Board Application Logic
 * Pure Client-Side JavaScript (Zero external dependencies)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const teams = window.TEAMS_DATA || [];
  let currentIdx = 0;
  let isPlaying = false;
  let autoAdvance = false;
  let activeView = 'stage'; // 'stage' or 'directory'
  let currentThemeFilter = 'ALL';
  let currentSort = 'sno_asc';
  let searchQuery = '';

  // DOM Elements - Navigation & Headers
  const totalTeamsCount = document.getElementById('totalTeamsCount');
  const currentTeamBadge = document.getElementById('currentTeamBadge');
  const nextTeamBadge = document.getElementById('nextTeamBadge');
  const viewToggleBtn = document.getElementById('viewToggleBtn');
  const viewModeText = document.getElementById('viewModeText');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  
  // Views
  const stageView = document.getElementById('stageView');
  const directoryView = document.getElementById('directoryView');
  
  // Stage Controls
  const prevTeamBtn = document.getElementById('prevTeamBtn');
  const nextTeamBtn = document.getElementById('nextTeamBtn');
  const teamSelectDropdown = document.getElementById('teamSelectDropdown');
  const callNextToStageBtn = document.getElementById('callNextToStageBtn');
  const autoAdvanceBtn = document.getElementById('autoAdvanceBtn');
  const autoNextStatus = document.getElementById('autoNextStatus');

  // Stage Active Team Elements
  const currentSno = document.getElementById('currentSno');
  const currentTeamName = document.getElementById('currentTeamName');
  const currentThemeTag = document.getElementById('currentThemeTag');
  const currentThemeText = document.getElementById('currentThemeText');
  const currentPhoneText = document.getElementById('currentPhoneText');
  
  // Scores & Rubric Bars
  const currentTotalScore = document.getElementById('currentTotalScore');
  const currentPercentage = document.getElementById('currentPercentage');
  const scoreTheme = document.getElementById('scoreTheme');
  const scoreLyrics = document.getElementById('scoreLyrics');
  const scorePrompt = document.getElementById('scorePrompt');
  const scoreCompleteness = document.getElementById('scoreCompleteness');
  const barTheme = document.getElementById('barTheme');
  const barLyrics = document.getElementById('barLyrics');
  const barPrompt = document.getElementById('barPrompt');
  const barCompleteness = document.getElementById('barCompleteness');

  // Audio Player Elements
  const mainAudioElement = document.getElementById('mainAudioElement');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const waveAnim = document.getElementById('waveAnim');
  const currentAudioFilename = document.getElementById('currentAudioFilename');
  const seekSlider = document.getElementById('seekSlider');
  const currentTimeDisplay = document.getElementById('currentTime');
  const totalDurationDisplay = document.getElementById('totalDuration');
  const volumeSlider = document.getElementById('volumeSlider');
  const muteBtn = document.getElementById('muteBtn');
  const rateBtns = document.querySelectorAll('.rate-btn');

  // Critique Lists
  const currentDeductionsList = document.getElementById('currentDeductionsList');
  const currentMeritsList = document.getElementById('currentMeritsList');
  const currentUserMark = document.getElementById('currentUserMark');
  const currentUserRemark = document.getElementById('currentUserRemark');

  // Deep-Dive Submission Content
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const currentLyricsText = document.getElementById('currentLyricsText');
  const currentPromptText = document.getElementById('currentPromptText');
  const currentToolsText = document.getElementById('currentToolsText');
  const currentWorkflowText = document.getElementById('currentWorkflowText');

  // Up Next Elements
  const nextSno = document.getElementById('nextSno');
  const nextTeamName = document.getElementById('nextTeamName');
  const nextThemeName = document.getElementById('nextThemeName');
  const nextTotalScore = document.getElementById('nextTotalScore');
  const rosterListContainer = document.getElementById('rosterListContainer');
  const rosterCount = document.getElementById('rosterCount');

  // Directory / Table Elements
  const tableSearchInput = document.getElementById('tableSearchInput');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const tableSortSelect = document.getElementById('tableSortSelect');
  const masterTableBody = document.getElementById('masterTableBody');

  // Initialize Application
  function init() {
    if (!teams || teams.length === 0) {
      console.error('No teams data found.');
      return;
    }
    
    totalTeamsCount.textContent = teams.length;
    rosterCount.textContent = `${teams.length} Teams`;

    populateTeamDropdown();
    renderStageView(currentIdx);
    renderRosterList();
    renderDirectoryTable();
    setupEventListeners();
  }

  // Format Helper: Format Seconds to MM:SS
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Populate Quick Select Dropdown
  function populateTeamDropdown() {
    teamSelectDropdown.innerHTML = '';
    teams.forEach((t, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `#${String(t.sno).padStart(2, '0')} - ${t.teamName} (${t.totalScore}/40)`;
      teamSelectDropdown.appendChild(opt);
    });
  }

  // Render Full Stage View for a Given Team Index
  function renderStageView(index) {
    if (index < 0 || index >= teams.length) return;
    currentIdx = index;
    const team = teams[currentIdx];
    const nextIdx = (currentIdx + 1) % teams.length;
    const nextTeam = teams[nextIdx];

    // Header Badges
    currentTeamBadge.textContent = `#${String(team.sno).padStart(2, '0')}`;
    nextTeamBadge.textContent = `#${String(nextTeam.sno).padStart(2, '0')}`;
    teamSelectDropdown.value = currentIdx;

    // Team Headline Details
    currentSno.textContent = `#${String(team.sno).padStart(2, '0')}`;
    currentTeamName.textContent = team.teamName;
    currentThemeTag.textContent = team.theme;
    currentThemeText.textContent = team.theme;
    currentPhoneText.textContent = team.phone || 'N/A';

    // Scores & Progress Bars
    currentTotalScore.textContent = team.totalScore.toFixed(1);
    currentPercentage.textContent = `${team.percentage.toFixed(1)}%`;
    
    scoreTheme.textContent = `${team.scores.themeRelevance.toFixed(1)} / 10`;
    scoreLyrics.textContent = `${team.scores.lyricsQuality.toFixed(1)} / 10`;
    scorePrompt.textContent = `${team.scores.promptEngineering.toFixed(1)} / 10`;
    scoreCompleteness.textContent = `${team.scores.submissionCompleteness.toFixed(1)} / 10`;

    barTheme.style.width = `${(team.scores.themeRelevance / 10) * 100}%`;
    barLyrics.style.width = `${(team.scores.lyricsQuality / 10) * 100}%`;
    barPrompt.style.width = `${(team.scores.promptEngineering / 10) * 100}%`;
    barCompleteness.style.width = `${(team.scores.submissionCompleteness / 10) * 100}%`;

    // Critique Lists: Deductions / Negatives for Judges
    currentDeductionsList.innerHTML = '';
    if (team.deductions && team.deductions.length > 0) {
      team.deductions.forEach(d => {
        const li = document.createElement('li');
        li.textContent = d;
        currentDeductionsList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'No major deductions recorded. High fidelity submission.';
      currentDeductionsList.appendChild(li);
    }

    // Key Merits
    currentMeritsList.innerHTML = '';
    if (team.merits && team.merits.length > 0) {
      team.merits.forEach(m => {
        const li = document.createElement('li');
        li.textContent = m;
        currentMeritsList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'Baseline submission standards met.';
      currentMeritsList.appendChild(li);
    }

    // Original Human Marks
    currentUserMark.textContent = team.userMarks || 'N/A';
    currentUserRemark.textContent = team.userRemarks || '-';

    // Submission Deep-Dive Content
    currentLyricsText.textContent = team.lyrics || 'No lyrics provided.';
    currentPromptText.textContent = team.prompts || 'No prompts provided.';
    currentToolsText.textContent = team.tools || 'None listed';
    currentWorkflowText.textContent = team.workflow || 'No workflow methodology described.';

    // Up Next Card
    nextSno.textContent = `#${String(nextTeam.sno).padStart(2, '0')}`;
    nextTeamName.textContent = nextTeam.teamName;
    nextThemeName.textContent = nextTeam.theme;
    nextTotalScore.textContent = `${nextTeam.totalScore.toFixed(1)} / 40 (${nextTeam.percentage.toFixed(1)}%)`;

    // Load Audio
    loadAudioTrack(team.audioSrc);
    updateRosterActiveState();
  }

  // Load and Set Audio Track
  function loadAudioTrack(src) {
    // Reset player state
    pauseAudio();
    mainAudioElement.src = src;
    mainAudioElement.load();
    
    // Display clean filename
    const filename = src.split('/').pop() || 'audio_track.mp3';
    currentAudioFilename.textContent = decodeURIComponent(filename);
    seekSlider.value = 0;
    currentTimeDisplay.textContent = '00:00';
    totalDurationDisplay.textContent = '00:00';
  }

  // Play / Pause Functions
  function playAudio() {
    mainAudioElement.play()
      .then(() => {
        isPlaying = true;
        playIcon.textContent = '⏸';
        waveAnim.classList.add('playing');
      })
      .catch(err => {
        console.warn('Audio playback error (waiting for user interaction):', err);
        isPlaying = false;
        playIcon.textContent = '▶';
        waveAnim.classList.remove('playing');
      });
  }

  function pauseAudio() {
    mainAudioElement.pause();
    isPlaying = false;
    playIcon.textContent = '▶';
    waveAnim.classList.remove('playing');
  }

  function toggleAudio() {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }

  // Update Roster Active Highlights
  function updateRosterActiveState() {
    const items = rosterListContainer.querySelectorAll('.roster-item');
    items.forEach((item, idx) => {
      item.classList.remove('active', 'up-next');
      if (idx === currentIdx) {
        item.classList.add('active');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else if (idx === (currentIdx + 1) % teams.length) {
        item.classList.add('up-next');
      }
    });
  }

  // Render Queue Roster List
  function renderRosterList() {
    rosterListContainer.innerHTML = '';
    teams.forEach((t, i) => {
      const div = document.createElement('div');
      div.className = 'roster-item';
      if (i === currentIdx) div.classList.add('active');
      if (i === (currentIdx + 1) % teams.length) div.classList.add('up-next');

      div.innerHTML = `
        <div class="roster-left">
          <span class="roster-num">#${String(t.sno).padStart(2, '0')}</span>
          <span class="roster-team">${t.teamName}</span>
        </div>
        <span class="roster-score">${t.totalScore.toFixed(1)}</span>
      `;

      div.addEventListener('click', () => {
        renderStageView(i);
      });

      rosterListContainer.appendChild(div);
    });
  }

  // Render Directory / Master Table
  function renderDirectoryTable() {
    masterTableBody.innerHTML = '';

    let filtered = teams.filter(t => {
      const matchTheme = (currentThemeFilter === 'ALL' || t.theme.toLowerCase().includes(currentThemeFilter.toLowerCase()));
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || 
        t.teamName.toLowerCase().includes(q) || 
        t.theme.toLowerCase().includes(q) || 
        (t.lyrics && t.lyrics.toLowerCase().includes(q));
      return matchTheme && matchSearch;
    });

    // Sorting
    if (currentSort === 'score_desc') {
      filtered.sort((a, b) => b.totalScore - a.totalScore);
    } else if (currentSort === 'score_asc') {
      filtered.sort((a, b) => a.totalScore - b.totalScore);
    } else if (currentSort === 'name_asc') {
      filtered.sort((a, b) => a.teamName.localeCompare(b.teamName));
    } else {
      // sno_asc
      filtered.sort((a, b) => a.sno - b.sno);
    }

    if (filtered.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="11" style="text-align: center; padding: 30px; color: var(--text-muted);">No matching teams found.</td>`;
      masterTableBody.appendChild(tr);
      return;
    }

    filtered.forEach(t => {
      const tr = document.createElement('tr');
      const deductionSnippet = (t.deductions && t.deductions.length > 0) ? t.deductions[0] : 'None';

      tr.innerHTML = `
        <td class="table-num">#${String(t.sno).padStart(2, '0')}</td>
        <td>
          <div class="table-team-cell">
            <span class="table-team-name">${t.teamName}</span>
          </div>
        </td>
        <td><span class="theme-tag" style="font-size: 11px;">${t.theme}</span></td>
        <td>${t.scores.themeRelevance.toFixed(1)}</td>
        <td>${t.scores.lyricsQuality.toFixed(1)}</td>
        <td>${t.scores.promptEngineering.toFixed(1)}</td>
        <td>${t.scores.submissionCompleteness.toFixed(1)}</td>
        <td><span class="table-score-badge">${t.totalScore.toFixed(1)}</span></td>
        <td><span class="table-pct-badge">${t.percentage.toFixed(1)}%</span></td>
        <td><div class="table-deduction-snippet">${deductionSnippet}</div></td>
        <td>
          <div class="table-actions-cell">
            <button class="btn btn-small btn-primary" onclick="window.sendTeamToStage(${t.sno - 1})">
              🎤 Stage
            </button>
            <button class="btn btn-small btn-secondary" onclick="window.playTableAudio(${t.sno - 1})">
              ▶ Play
            </button>
          </div>
        </td>
      `;

      masterTableBody.appendChild(tr);
    });
  }

  // Global window functions for table buttons
  window.sendTeamToStage = function(idx) {
    renderStageView(idx);
    switchView('stage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.playTableAudio = function(idx) {
    renderStageView(idx);
    setTimeout(() => {
      playAudio();
    }, 100);
  };

  // View Switcher (Stage vs Directory)
  function switchView(viewName) {
    activeView = viewName;
    if (activeView === 'stage') {
      stageView.classList.add('active-view');
      directoryView.classList.remove('active-view');
      viewModeText.textContent = 'All Teams Directory';
    } else {
      stageView.classList.remove('active-view');
      directoryView.classList.add('active-view');
      viewModeText.textContent = '🎤 Live Stage Board';
    }
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Navigation Buttons
    prevTeamBtn.addEventListener('click', () => {
      const newIdx = (currentIdx - 1 + teams.length) % teams.length;
      renderStageView(newIdx);
    });

    nextTeamBtn.addEventListener('click', () => {
      const newIdx = (currentIdx + 1) % teams.length;
      renderStageView(newIdx);
    });

    callNextToStageBtn.addEventListener('click', () => {
      const nextIdx = (currentIdx + 1) % teams.length;
      renderStageView(nextIdx);
      setTimeout(() => {
        playAudio();
      }, 150);
    });

    teamSelectDropdown.addEventListener('change', (e) => {
      renderStageView(parseInt(e.target.value, 10));
    });

    // Auto Advance Toggle
    autoAdvanceBtn.addEventListener('click', () => {
      autoAdvance = !autoAdvance;
      autoNextStatus.textContent = autoAdvance ? 'ON' : 'OFF';
      autoAdvanceBtn.classList.toggle('btn-success', autoAdvance);
      autoAdvanceBtn.classList.toggle('btn-outline', !autoAdvance);
    });

    // View Switch Toggle
    viewToggleBtn.addEventListener('click', () => {
      switchView(activeView === 'stage' ? 'directory' : 'stage');
    });

    // Theme Toggle
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      themeIcon.textContent = isLight ? '🌙' : '☀️';
    });

    // Audio Player Controls
    playPauseBtn.addEventListener('click', toggleAudio);

    mainAudioElement.addEventListener('loadedmetadata', () => {
      totalDurationDisplay.textContent = formatTime(mainAudioElement.duration);
      seekSlider.max = mainAudioElement.duration || 100;
    });

    mainAudioElement.addEventListener('timeupdate', () => {
      currentTimeDisplay.textContent = formatTime(mainAudioElement.currentTime);
      seekSlider.value = mainAudioElement.currentTime;
    });

    mainAudioElement.addEventListener('ended', () => {
      pauseAudio();
      if (autoAdvance) {
        const nextIdx = (currentIdx + 1) % teams.length;
        renderStageView(nextIdx);
        setTimeout(() => {
          playAudio();
        }, 300);
      }
    });

    seekSlider.addEventListener('input', (e) => {
      mainAudioElement.currentTime = e.target.value;
    });

    volumeSlider.addEventListener('input', (e) => {
      mainAudioElement.volume = e.target.value;
      muteBtn.textContent = e.target.value == 0 ? '🔇' : '🔊';
    });

    muteBtn.addEventListener('click', () => {
      if (mainAudioElement.muted) {
        mainAudioElement.muted = false;
        muteBtn.textContent = '🔊';
      } else {
        mainAudioElement.muted = true;
        muteBtn.textContent = '🔇';
      }
    });

    // Playback Rate Buttons
    rateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        rateBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mainAudioElement.playbackRate = parseFloat(btn.dataset.rate);
      });
    });

    // Deep Dive Tabs
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        document.getElementById(tabId).classList.add('active');
      });
    });

    // Table Search Input
    tableSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderDirectoryTable();
    });

    // Table Theme Filter Pills
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentThemeFilter = btn.dataset.theme;
        renderDirectoryTable();
      });
    });

    // Table Sort Select
    tableSortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderDirectoryTable();
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in search input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleAudio();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const nextIdx = (currentIdx + 1) % teams.length;
        renderStageView(nextIdx);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const prevIdx = (currentIdx - 1 + teams.length) % teams.length;
        renderStageView(prevIdx);
      }
    });
  }

  // Run Init
  init();
});
