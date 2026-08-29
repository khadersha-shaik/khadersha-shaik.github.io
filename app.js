/**
 * AI Music Competition — Live Stage Board Application Logic (Public View - No Scores)
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
  let currentSort = 'rank_asc';
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
  const rosterListContainer = document.getElementById('rosterListContainer');
  const rosterCount = document.getElementById('rosterCount');

  // Directory / Table Elements
  const tableSearchInput = document.getElementById('tableSearchInput');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const tableSortSelect = document.getElementById('tableSortSelect');
  const masterTableBody = document.getElementById('masterTableBody');
  const returnToStageBtn = document.getElementById('returnToStageBtn');

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
      opt.textContent = `#${String(t.sno).padStart(2, '0')} - ${t.teamName} [${t.theme}]`;
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

    // Deep-dive Submission Content
    currentLyricsText.textContent = team.lyrics && team.lyrics.trim() ? team.lyrics : 'No lyrics submitted by this team.';
    currentPromptText.textContent = team.prompts && team.prompts.trim() ? team.prompts : 'No prompt text submitted.';
    currentToolsText.textContent = team.tools && team.tools.trim() ? team.tools : 'N/A';
    currentWorkflowText.textContent = team.workflow && team.workflow.trim() ? team.workflow : 'No workflow narrative submitted.';

    // Setup Audio Track
    setupAudioTrack(team.audioSrc);

    // Render Up Next Card
    nextSno.textContent = `#${String(nextTeam.sno).padStart(2, '0')}`;
    nextTeamName.textContent = nextTeam.teamName;
    nextThemeName.textContent = nextTeam.theme;

    // Update active highlight in sidebar roster
    updateActiveRosterItem();
  }

  // Setup Audio Track and reset playback state
  function setupAudioTrack(audioSrc) {
    pauseAudio();
    mainAudioElement.src = audioSrc;
    mainAudioElement.load();
    seekSlider.value = 0;
    currentTimeDisplay.textContent = '00:00';
    totalDurationDisplay.textContent = '00:00';
    
    const filename = audioSrc.split('/').pop();
    currentAudioFilename.textContent = decodeURIComponent(filename);
  }

  // Audio Play / Pause Toggle
  function togglePlay() {
    if (!mainAudioElement.src) return;
    if (mainAudioElement.paused) {
      playAudio();
    } else {
      pauseAudio();
    }
  }

  function playAudio() {
    mainAudioElement.play().then(() => {
      isPlaying = true;
      playIcon.textContent = '⏸';
      waveAnim.classList.add('playing');
    }).catch(err => {
      console.warn('Playback error or user interaction needed:', err);
    });
  }

  function pauseAudio() {
    mainAudioElement.pause();
    isPlaying = false;
    playIcon.textContent = '▶';
    waveAnim.classList.remove('playing');
  }

  // Render Sidebar Roster List
  function renderRosterList() {
    rosterListContainer.innerHTML = '';
    teams.forEach((t, i) => {
      const item = document.createElement('div');
      item.className = `roster-item ${i === currentIdx ? 'active' : ''}`;
      item.dataset.index = i;
      item.innerHTML = `
        <div class="roster-item-info">
          <span class="roster-item-sno">#${String(t.sno).padStart(2, '0')}</span>
          <div class="roster-item-meta">
            <span class="roster-item-name">${t.teamName}</span>
            <span class="roster-item-theme">${t.theme}</span>
          </div>
        </div>
      `;
      item.addEventListener('click', () => {
        renderStageView(i);
      });
      rosterListContainer.appendChild(item);
    });
  }

  function updateActiveRosterItem() {
    const items = rosterListContainer.querySelectorAll('.roster-item');
    items.forEach((it, i) => {
      if (i === currentIdx) {
        it.classList.add('active');
        it.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        it.classList.remove('active');
      }
    });
  }

  // Render Directory / Master Table (NO SCORES)
  function renderDirectoryTable() {
    let filtered = teams.filter(t => {
      const matchTheme = (currentThemeFilter === 'ALL' || t.theme.toLowerCase() === currentThemeFilter.toLowerCase());
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = (!q || 
        t.teamName.toLowerCase().includes(q) || 
        t.theme.toLowerCase().includes(q) || 
        (t.phone && t.phone.toLowerCase().includes(q)) ||
        String(t.sno).includes(q)
      );
      return matchTheme && matchSearch;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (currentSort === 'rank_asc') return (a.finalRank || 99) - (b.finalRank || 99);
      if (currentSort === 'sno_asc') return a.sno - b.sno;
      if (currentSort === 'sno_desc') return b.sno - a.sno;
      if (currentSort === 'name_asc') return a.teamName.localeCompare(b.teamName);
      return 0;
    });

    masterTableBody.innerHTML = '';
    if (filtered.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `<td colspan="7" class="empty-table-cell">No teams matching current search/filter criteria.</td>`;
      masterTableBody.appendChild(emptyRow);
      return;
    }

    filtered.forEach(t => {
      const origIdx = teams.findIndex(item => item.sno === t.sno);
      const isCurrentActive = (origIdx === currentIdx);
      const row = document.createElement('tr');
      row.className = isCurrentActive ? 'table-row-active' : '';
      
      row.innerHTML = `
        <td class="col-rank"><span class="rank-badge-cell">#${String(t.finalRank || '-').padStart(2, '0')}</span></td>
        <td class="col-sno"><span class="sno-pill">#${String(t.sno).padStart(2, '0')}</span></td>
        <td class="col-team"><strong>${t.teamName}</strong></td>
        <td class="col-theme"><span class="badge badge-theme">${t.theme}</span></td>
        <td class="col-phone">${t.phone || 'N/A'}</td>
        <td class="col-audio">
          <button class="btn btn-small btn-secondary btn-table-play" data-src="${t.audioSrc}" data-idx="${origIdx}">
            <span>▶</span> Listen
          </button>
        </td>
        <td class="col-action" style="text-align: center;">
          <button class="btn btn-small btn-primary btn-load-stage" data-idx="${origIdx}">
            Stage View &rarr;
          </button>
        </td>
      `;
      masterTableBody.appendChild(row);
    });

    // Attach listeners for table actions
    masterTableBody.querySelectorAll('.btn-load-stage').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetIdx = parseInt(e.currentTarget.dataset.idx, 10);
        renderStageView(targetIdx);
        toggleMainView('stage');
      });
    });

    masterTableBody.querySelectorAll('.btn-table-play').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetIdx = parseInt(e.currentTarget.dataset.idx, 10);
        renderStageView(targetIdx);
        playAudio();
      });
    });
  }

  // Toggle View Mode: Stage vs Directory
  function toggleMainView(view) {
    activeView = view;
    if (activeView === 'stage') {
      stageView.classList.add('active-view');
      directoryView.classList.remove('active-view');
      viewModeText.textContent = 'All Teams Directory';
    } else {
      stageView.classList.remove('active-view');
      directoryView.classList.add('active-view');
      viewModeText.textContent = 'Live Stage View';
      renderDirectoryTable();
    }
  }

  // Event Listeners
  function setupEventListeners() {
    // Stage Navigation
    prevTeamBtn.addEventListener('click', () => {
      let prevIdx = currentIdx - 1;
      if (prevIdx < 0) prevIdx = teams.length - 1;
      renderStageView(prevIdx);
    });

    nextTeamBtn.addEventListener('click', () => {
      let nextIdx = (currentIdx + 1) % teams.length;
      renderStageView(nextIdx);
    });

    callNextToStageBtn.addEventListener('click', () => {
      let nextIdx = (currentIdx + 1) % teams.length;
      renderStageView(nextIdx);
    });

    teamSelectDropdown.addEventListener('change', (e) => {
      const selected = parseInt(e.target.value, 10);
      renderStageView(selected);
    });

    // Auto Advance Button
    autoAdvanceBtn.addEventListener('click', () => {
      autoAdvance = !autoAdvance;
      autoNextStatus.textContent = autoAdvance ? 'ON' : 'OFF';
      autoAdvanceBtn.classList.toggle('active', autoAdvance);
    });

    // Audio Events
    playPauseBtn.addEventListener('click', togglePlay);

    mainAudioElement.addEventListener('loadedmetadata', () => {
      totalDurationDisplay.textContent = formatTime(mainAudioElement.duration);
    });

    mainAudioElement.addEventListener('timeupdate', () => {
      if (!mainAudioElement.duration) return;
      const cur = mainAudioElement.currentTime;
      const dur = mainAudioElement.duration;
      currentTimeDisplay.textContent = formatTime(cur);
      seekSlider.value = (cur / dur) * 100;
    });

    seekSlider.addEventListener('input', (e) => {
      if (!mainAudioElement.duration) return;
      const seekTo = (e.target.value / 100) * mainAudioElement.duration;
      mainAudioElement.currentTime = seekTo;
    });

    mainAudioElement.addEventListener('ended', () => {
      pauseAudio();
      if (autoAdvance) {
        let nextIdx = (currentIdx + 1) % teams.length;
        renderStageView(nextIdx);
        setTimeout(() => playAudio(), 400);
      }
    });

    // Playback Rate Selector
    rateBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        rateBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const rate = parseFloat(e.target.dataset.rate);
        mainAudioElement.playbackRate = rate;
      });
    });

    // Volume & Mute
    volumeSlider.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      mainAudioElement.volume = vol;
      muteBtn.textContent = vol === 0 ? '🔇' : '🔊';
    });

    muteBtn.addEventListener('click', () => {
      if (mainAudioElement.volume > 0) {
        mainAudioElement.dataset.prevVol = mainAudioElement.volume;
        mainAudioElement.volume = 0;
        volumeSlider.value = 0;
        muteBtn.textContent = '🔇';
      } else {
        const prev = parseFloat(mainAudioElement.dataset.prevVol || 1);
        mainAudioElement.volume = prev;
        volumeSlider.value = prev;
        muteBtn.textContent = '🔊';
      }
    });

    // Tabs in Stage View
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        const tabId = e.target.dataset.tab;
        document.getElementById(tabId).classList.add('active');
      });
    });

    // View Mode Toggle
    viewToggleBtn.addEventListener('click', () => {
      toggleMainView(activeView === 'stage' ? 'directory' : 'stage');
    });

    if (returnToStageBtn) {
      returnToStageBtn.addEventListener('click', () => {
        toggleMainView('stage');
      });
    }

    // Theme Toggle (Dark / Light)
    themeToggleBtn.addEventListener('click', () => {
      const body = document.body;
      const isDark = body.classList.contains('dark-theme');
      if (isDark) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeIcon.textContent = '🌙';
      } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeIcon.textContent = '☀️';
      }
    });

    // Directory Search & Filters
    tableSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderDirectoryTable();
    });

    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentThemeFilter = e.target.dataset.theme;
        renderDirectoryTable();
      });
    });

    tableSortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderDirectoryTable();
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Ignore if user is typing in search input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        let nextIdx = (currentIdx + 1) % teams.length;
        renderStageView(nextIdx);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        let prevIdx = currentIdx - 1;
        if (prevIdx < 0) prevIdx = teams.length - 1;
        renderStageView(prevIdx);
      }
    });
  }

  // Run
  init();
});
