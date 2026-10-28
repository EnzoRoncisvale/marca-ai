/**
 * MARCA AÍ! - Core Application Engine
 * Plataforma Comunitária de Marcação e Descoberta de Partidas em Quadras Públicas
 * Integração com Banco de Dados SQLite (sem exemplos falsos)
 */

// =============================================================================
// 1. Estado da Aplicação & Configuração de Usuário
// =============================================================================

const DEFAULT_USER = {
  id: "usr-01",
  name: "Lucas Silva (Você)",
  avatar: "LS",
  position: "Meio-Campo",
  karma: "4.9 ★",
  gamesPlayed: 0,
  phone: "(61) 98765-4321"
};

// Sem dados de exemplo iniciais - Banco começa limpo para uso real
const INITIAL_MATCHES = [];

class MarcaAiApp {
  constructor() {
    this.currentUser = this.loadUser();
    this.matches = [];
    this.activeFilter = "todos";
    this.searchQuery = "";
    this.activeView = "map"; // 'map' | 'list' | 'my-matches'
    this.selectedMatchId = null;
    this.map = null;
    this.markers = {};
    this.tempPin = null;

    this.init();
  }

  // ===========================================================================
  // 2. Persistência & Integração com SQLite / API REST
  // ===========================================================================
  loadUser() {
    const saved = localStorage.getItem("marca_ai_user");
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  }

  saveUser() {
    localStorage.setItem("marca_ai_user", JSON.stringify(this.currentUser));
  }

  async loadMatches() {
    // Tenta carregar do backend SQLite
    try {
      const response = await fetch("/api/partidas");
      if (response.ok) {
        this.matches = await response.json();
        this.saveLocalCache();
        return;
      }
    } catch (e) {
      // Caso esteja rodando sem servidor (file:///), usa cache local limpo
      console.log("Servidor SQLite não detectado ou modo offline. Usando persistência local.");
    }

    const saved = localStorage.getItem("marca_ai_sqlite_cache");
    this.matches = saved ? JSON.parse(saved) : [];
  }

  saveLocalCache() {
    localStorage.setItem("marca_ai_sqlite_cache", JSON.stringify(this.matches));
  }

  // ===========================================================================
  // 3. Inicialização Geral
  // ===========================================================================
  async init() {
    this.updateUserUI();
    this.initMap();
    await this.loadMatches();
    this.renderSidebarMatches();
    this.renderMapMarkers();
    this.bindEvents();
    this.updateCounters();
  }

  updateUserUI() {
    const avatarEl = document.getElementById("header-user-avatar");
    const nameEl = document.getElementById("header-user-name");
    const karmaEl = document.getElementById("header-user-karma");
    if (avatarEl) avatarEl.textContent = this.currentUser.avatar || "U";
    if (nameEl) nameEl.textContent = this.currentUser.name || "Jogador";
    if (karmaEl) karmaEl.innerHTML = `<i class="fa-solid fa-star"></i> ${this.currentUser.karma || '5.0 ★'}`;
  }

  // ===========================================================================
  // 4. Motor do Mapa (Leaflet + OpenStreetMap)
  // ===========================================================================
  initMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    // Coordenadas iniciais padrão (Brasília)
    const initialLat = -15.7942;
    const initialLng = -47.8822;

    this.map = L.map("map", {
      zoomControl: false
    }).setView([initialLat, initialLng], 13);

    // 1. Camada Base Universal (OpenStreetMap - 100% livre e sem bloqueio de rede)
    const ruasLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    });

    // 2. Camada Satélite Fotográfico HD (Esri World Imagery)
    const sateliteLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: 'Imagens Satélite HD &copy; Esri'
    });

    // 3. Camada Noturna CartoDB Dark Matter
    const noturnoLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", {
      maxZoom: 19,
      subdomains: "abcd",
      attribution: '&copy; CARTO &copy; OpenStreetMap'
    });

    this.layers = {
      noturno: noturnoLayer,
      satelite: sateliteLayer,
      ruas: ruasLayer
    };

    // Adiciona OpenStreetMap como camada ativa e aplica classe de filtro escuro (.dark-map)
    ruasLayer.addTo(this.map);
    const mapEl = document.getElementById("map");
    if (mapEl) mapEl.classList.add("dark-map");

    // Seletor de Camadas nativo do Leaflet
    const baseLayers = {
      "🌙 Modo Noturno": ruasLayer,
      "🛰️ Satélite HD": sateliteLayer,
      "🗺️ Mapa de Ruas": ruasLayer
    };
    L.control.layers(baseLayers, null, { position: "topright" }).addTo(this.map);
    L.control.zoom({ position: "topright" }).addTo(this.map);

    // Força o Leaflet a recalcular o tamanho imediatamente e com delays para nunca ficar em branco
    this.map.invalidateSize();
    setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 100);
    setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 400);
    setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 1000);

    window.addEventListener("resize", () => {
      if (this.map) this.map.invalidateSize();
    });

    this.map.on("click", (e) => {
      this.handleMapClick(e.latlng);
    });
  }

  setMapTheme(theme) {
    if (!this.map || !this.layers) return;
    Object.values(this.layers).forEach(layer => this.map.removeLayer(layer));

    document.querySelectorAll(".map-theme-btn").forEach(b => b.classList.remove("active"));
    const activeBtn = document.querySelector(`.map-theme-btn[data-theme="${theme}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    const mapEl = document.getElementById("map");

    if (theme === "noturno") {
      this.layers.noturno.addTo(this.map);
      if (mapEl) mapEl.classList.add("dark-map");
      this.showToast("🌙 Modo Noturno ativado");
    } else if (theme === "satelite") {
      this.layers.satelite.addTo(this.map);
      if (mapEl) mapEl.classList.remove("dark-map");
      this.showToast("🛰️ Satélite HD ativado");
    } else {
      this.layers.ruas.addTo(this.map);
      if (mapEl) mapEl.classList.remove("dark-map");
      this.showToast("🗺️ Mapa de Ruas ativado");
    }
    this.map.invalidateSize();
  }

  goToRegion(lat, lng, zoom = 14) {
    if (this.map) {
      this.map.flyTo([lat, lng], zoom, { duration: 1.2 });
      this.showToast("📍 Navegando no mapa de Brasília...");
    }
  }

  getSportIcon(category) {
    switch (category) {
      case "futebol": return "fa-futbol";
      case "futsal": return "fa-futbol";
      case "basquete": return "fa-basketball";
      case "volei": return "fa-volleyball";
      case "beach-tennis": return "fa-table-tennis-paddle-ball";
      case "tenis": return "fa-baseball";
      default: return "fa-trophy";
    }
  }

  renderMapMarkers() {
    if (!this.map) return;
    Object.values(this.markers).forEach(m => this.map.removeLayer(m));
    this.markers = {};

    const filtered = this.getFilteredMatches();

    filtered.forEach(match => {
      const playersCount = match.players ? match.players.length : 0;
      const vagasRestantes = match.maxPlayers - playersCount;
      const isUrgente = vagasRestantes <= 2 && vagasRestantes > 0;
      const badgeBg = isUrgente ? '#ef4444' : (vagasRestantes === 0 ? '#64748b' : '#10b981');

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #ae2012, #ee9b00);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid #fff;
            cursor: pointer;
            position: relative;
            font-size: 16px;
          ">
            <i class="fa-solid ${this.getSportIcon(match.category)}"></i>
            <span style="
              position: absolute;
              top: -6px;
              right: -6px;
              background: ${badgeBg};
              color: white;
              font-size: 10px;
              font-weight: 800;
              padding: 2px 5px;
              border-radius: 10px;
              border: 1px solid white;
            ">${vagasRestantes > 0 ? vagasRestantes : 'Full'}</span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -22]
      });

      const marker = L.marker([match.lat, match.lng], { icon: customIcon }).addTo(this.map);

      marker.bindPopup(`
        <div style="font-family: Montserrat, sans-serif; padding: 4px; min-width: 200px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #ae2012;">${match.sport}</span>
            <span style="font-size: 9px; background: #ecfdf5; color: #047857; font-weight: 700; padding: 1px 5px; border-radius: 4px;">Pública / Livre</span>
          </div>
          <h4 style="margin: 4px 0; font-size: 14px; font-weight: 700;">${match.title}</h4>
          <p style="margin: 0; font-size: 12px; color: #64748b;"><i class="fa-regular fa-clock"></i> ${match.date} às ${match.time}</p>
          <p style="margin: 3px 0 8px; font-size: 12px; color: #64748b;"><i class="fa-solid fa-location-dot"></i> ${match.venue}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 12px; font-weight: 700; color: ${isUrgente ? '#ef4444' : '#10b981'};">
              ${vagasRestantes > 0 ? `${vagasRestantes} vagas abertas` : 'Partida Lotada'}
            </span>
            <span style="font-size: 11px; font-weight: 600; color: #047857;"><i class="fa-solid fa-tree"></i> ${match.courtType || 'Quadra Pública'}</span>
          </div>
          <button onclick="window.marcaApp.openMatchDetails('${match.id}')" style="
            width: 100%;
            background: linear-gradient(135deg, #ae2012, #ee9b00);
            color: #fff;
            border: none;
            padding: 7px 12px;
            font-size: 12px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
          ">Ver Partida & Entrar no Jogo</button>
        </div>
      `);

      marker.on("click", () => {
        this.highlightCard(match.id);
      });

      this.markers[match.id] = marker;
    });

    // Se houver partidas cadastradas, enquadra a visão do mapa nelas
    if (filtered.length > 0) {
      const group = new L.featureGroup(Object.values(this.markers));
      this.map.fitBounds(group.getBounds().pad(0.3));
    }
  }

  handleMapClick(latlng) {
    if (this.tempPin) {
      this.map.removeLayer(this.tempPin);
    }

    const tempIcon = L.divIcon({
      className: 'temp-marker',
      html: `
        <div style="background: #10b981; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white; animation: bounce 1s infinite;">
          <i class="fa-solid fa-plus"></i>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    this.tempPin = L.marker([latlng.lat, latlng.lng], { icon: tempIcon }).addTo(this.map);

    this.tempPin.bindPopup(`
      <div style="font-family: Montserrat, sans-serif; text-align: center; padding: 4px;">
        <h4 style="margin: 0 0 6px; font-size: 13px;">Marcar partida nesta quadra?</h4>
        <button onclick="window.marcaApp.openCreateModal(${latlng.lat}, ${latlng.lng})" style="
          background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer;
        ">+ Criar Partida Pública Aqui</button>
      </div>
    `).openPopup();
  }

  // ===========================================================================
  // 5. Filtros & Listagem Lateral / Grade
  // ===========================================================================
  getFilteredMatches() {
    return this.matches.filter(match => {
      const matchesCategory = (this.activeFilter === "todos") || 
        (this.activeFilter === match.category) ||
        (this.activeFilter === "futebol" && (match.category === "futebol" || match.category === "futsal"));

      const query = this.searchQuery.toLowerCase();
      const matchesSearch = !query || 
        (match.title && match.title.toLowerCase().includes(query)) ||
        (match.sport && match.sport.toLowerCase().includes(query)) ||
        (match.venue && match.venue.toLowerCase().includes(query)) ||
        (match.address && match.address.toLowerCase().includes(query));

      if (this.activeView === "my-matches") {
        const isParticipant = match.players && match.players.some(p => p.id === this.currentUser.id);
        const isOrganizer = match.organizerId === this.currentUser.id;
        return (isParticipant || isOrganizer) && matchesSearch;
      }

      return matchesCategory && matchesSearch;
    });
  }

  renderSidebarMatches() {
    const listContainer = document.getElementById("sidebar-match-list");
    const gridContainer = document.getElementById("grid-match-list");
    if (!listContainer) return;

    const filtered = this.getFilteredMatches();

    if (filtered.length === 0) {
      const emptyHtml = `
        <div style="text-align: center; padding: 3rem 1rem; color: #64748b;">
          <i class="fa-regular fa-futbol" style="font-size: 2.5rem; margin-bottom: 0.75rem; opacity: 0.4;"></i>
          <h4 style="font-weight: 700; margin-bottom: 0.25rem; color: #1e293b;">Nenhuma partida agendada ainda</h4>
          <p style="font-size: 0.85rem; margin-bottom: 1rem;">O banco de dados SQLite está limpo e pronto! Clique no botão abaixo ou no mapa para marcar a primeira pelada.</p>
          <button class="btn btn-primary" onclick="window.marcaApp.openCreateModal()">
            <i class="fa-solid fa-plus"></i> Marcar Primeiro Jogo
          </button>
        </div>
      `;
      listContainer.innerHTML = emptyHtml;
      if (gridContainer) gridContainer.innerHTML = emptyHtml;
      return;
    }

    const cardsHtml = filtered.map(match => this.generateMatchCardHtml(match)).join("");
    listContainer.innerHTML = cardsHtml;
    if (gridContainer) gridContainer.innerHTML = cardsHtml;
  }

  generateMatchCardHtml(match) {
    const playersCount = match.players ? match.players.length : 0;
    const vagasRestantes = match.maxPlayers - playersCount;
    let vagaClass = "abertas";
    let vagaTexto = `${vagasRestantes} vagas abertas`;

    if (vagasRestantes <= 0) {
      vagaClass = "lotado";
      vagaTexto = "Partida Lotada (Lista de Espera)";
    } else if (vagasRestantes <= 2) {
      vagaClass = "urgente";
      vagaTexto = `🔥 Falta ${vagasRestantes} pra fechar!`;
    }

    const isUserIn = match.players && match.players.some(p => p.id === this.currentUser.id);

    return `
      <div class="match-card ${this.selectedMatchId === match.id ? 'active' : ''}" id="card-${match.id}" onclick="window.marcaApp.selectMatch('${match.id}')">
        <div class="card-top">
          <div class="card-title">${match.title}</div>
          <span class="sport-tag tag-${match.category}">${match.sport}</span>
        </div>

        <div class="card-details">
          <div class="card-detail-item">
            <i class="fa-regular fa-calendar"></i>
            <span>${match.date} às <strong>${match.time}</strong></span>
          </div>
          <div class="card-detail-item">
            <i class="fa-solid fa-chart-simple"></i>
            <span>${match.level}</span>
          </div>
          <div class="card-detail-item" style="grid-column: span 2;">
            <i class="fa-solid fa-location-dot"></i>
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${match.venue}</span>
          </div>
        </div>

        <div class="card-footer">
          <div class="vagas-badge ${vagaClass}">
            <i class="fa-solid fa-users"></i>
            <span>${vagaTexto}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${isUserIn ? '<span style="background: #ecfdf5; color: #10b981; font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Confirmado</span>' : ''}
            <span class="public-court-badge"><i class="fa-solid fa-tree"></i> Pública</span>
          </div>
        </div>
      </div>
    `;
  }

  selectMatch(matchId) {
    this.selectedMatchId = matchId;
    const match = this.matches.find(m => m.id === matchId);
    if (!match) return;

    if (this.map && match.lat && match.lng) {
      this.map.flyTo([match.lat, match.lng], 15, { duration: 1.2 });
      if (this.markers[matchId]) {
        this.markers[matchId].openPopup();
      }
    }

    this.renderSidebarMatches();

    if (window.innerWidth <= 768) {
      this.showMobilePreview(match);
    } else {
      this.openMatchDetails(matchId);
    }
  }

  showMobilePreview(match) {
    const preview = document.getElementById("mobile-match-preview");
    const content = document.getElementById("mobile-preview-content");
    if (!preview || !content) return;

    const playersCount = match.players ? match.players.length : 0;
    const vagas = match.maxPlayers - playersCount;

    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
        <div>
          <span class="sport-tag tag-${match.category}">${match.sport}</span>
          <h4 style="margin: 4px 0 0; font-size: 1.05rem; font-weight: 800; color: #0f172a;">${match.title}</h4>
        </div>
        <button onclick="document.getElementById('mobile-match-preview').style.display='none'" style="border:none; background:transparent; font-size: 1.3rem; color: #94a3b8; cursor: pointer; padding: 2px 6px;">&times;</button>
      </div>
      <p style="font-size: 0.8rem; color: #64748b; margin: 0 0 0.75rem;">
        <i class="fa-regular fa-calendar"></i> ${match.date} às ${match.time} | <i class="fa-solid fa-location-dot"></i> ${match.venue}
      </p>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <span style="font-size: 0.8rem; font-weight: 700; color: ${vagas > 0 ? '#10b981' : '#64748b'};">
          ${vagas > 0 ? `${vagas} vagas abertas` : 'Lotado'}
        </span>
        <button class="btn btn-primary" style="flex: 1; padding: 0.55rem; font-size: 0.85rem;" onclick="window.marcaApp.openMatchDetails('${match.id}')">
          <i class="fa-solid fa-users"></i> Ver Vagas & Entrar
        </button>
      </div>
    `;
    preview.style.display = "block";
  }

  highlightCard(matchId) {
    this.selectedMatchId = matchId;
    this.renderSidebarMatches();
    const cardEl = document.getElementById(`card-${matchId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  updateCounters() {
    const countEl = document.getElementById("sidebar-match-count");
    if (countEl) {
      const filtered = this.getFilteredMatches();
      countEl.textContent = `${filtered.length} partida${filtered.length === 1 ? '' : 's'}`;
    }
  }

  // ===========================================================================
  // 6. Criação de Partida no SQLite
  // ===========================================================================
  openCreateModal(lat = null, lng = null) {
    const modal = document.getElementById("create-match-modal");
    if (!modal) return;

    const latInput = document.getElementById("form-lat");
    const lngInput = document.getElementById("form-lng");
    const coordsDisplay = document.getElementById("form-coords-display");

    let selectedLat = -15.7985;
    let selectedLng = -47.9045;

    if (lat !== null && !isNaN(lat)) {
      selectedLat = parseFloat(lat);
      selectedLng = parseFloat(lng);
    } else if (this.map) {
      const center = this.map.getCenter();
      selectedLat = center.lat;
      selectedLng = center.lng;
    }

    if (latInput) latInput.value = selectedLat.toFixed(6);
    if (lngInput) lngInput.value = selectedLng.toFixed(6);
    if (coordsDisplay) coordsDisplay.textContent = `${selectedLat.toFixed(4)}, ${selectedLng.toFixed(4)}`;

    modal.classList.add("active");
  }

  closeCreateModal() {
    const modal = document.getElementById("create-match-modal");
    if (modal) modal.classList.remove("active");
    if (this.tempPin && this.map) {
      this.map.removeLayer(this.tempPin);
      this.tempPin = null;
    }
  }

  async handleCreateMatchSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById("btn-submit-partida");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gravando no SQLite...';
    }

    const title = document.getElementById("form-title").value.trim() || "Racha";
    const sportSelect = document.getElementById("form-sport");
    const sport = sportSelect.value;
    const category = sportSelect.options[sportSelect.selectedIndex].dataset.category || "futebol";
    const date = document.getElementById("form-date").value;
    const time = document.getElementById("form-time").value;
    const venue = document.getElementById("form-venue").value.trim();
    const address = document.getElementById("form-address").value.trim() || venue;
    const courtType = document.getElementById("form-court-type") ? document.getElementById("form-court-type").value : "Quadra Pública";
    const level = document.getElementById("form-level").value;
    const maxPlayers = parseInt(document.getElementById("form-max-players").value, 10);
    const hasLighting = document.getElementById("form-lighting") ? document.getElementById("form-lighting").checked : true;
    const hasGoaliePerk = document.getElementById("form-goalie-perk")?.checked || false;
    const latVal = parseFloat(document.getElementById("form-lat")?.value);
    const lngVal = parseFloat(document.getElementById("form-lng")?.value);
    const lat = (!isNaN(latVal) && latVal !== 0) ? latVal : (this.map ? this.map.getCenter().lat : -15.7985);
    const lng = (!isNaN(lngVal) && lngVal !== 0) ? lngVal : (this.map ? this.map.getCenter().lng : -47.9045);

    const matchPayload = {
      id: "match-" + Date.now(),
      title,
      sport,
      category,
      date,
      time,
      venue,
      address,
      courtType,
      hasLighting,
      lat,
      lng,
      level,
      maxPlayers,
      hasGoaliePerk,
      organizerId: this.currentUser.id,
      creator: {
        id: this.currentUser.id,
        name: this.currentUser.name,
        role: this.currentUser.position
      }
    };

    // Tenta persistir na API SQLite
    try {
      const response = await fetch("/api/partidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonPayload(matchPayload)
      });
      if (response.ok) {
        await this.loadMatches();
        this.closeCreateModal();
        this.renderMapMarkers();
        this.renderSidebarMatches();
        this.updateCounters();
        this.showToast(`⚽ Partida "${title}" salva no SQLite com sucesso!`);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Confirmar e Salvar Partida no SQLite</span>';
        }
        this.selectMatch(matchPayload.id);
        return;
      }
    } catch (err) {
      console.log("Fallback para persistência local:", err);
    }

    // Fallback local se o servidor não estiver respondendo
    const localMatch = {
      ...matchPayload,
      players: [{
        id: this.currentUser.id,
        name: this.currentUser.name,
        role: this.currentUser.position,
        isOrganizer: true
      }],
      waitlist: []
    };
    this.matches.unshift(localMatch);
    this.saveLocalCache();
    this.closeCreateModal();
    this.renderMapMarkers();
    this.renderSidebarMatches();
    this.updateCounters();
    this.showToast(`⚽ Partida "${title}" criada com sucesso!`);
    this.selectMatch(localMatch.id);
  }

  // ===========================================================================
  // 7. Detalhes e Gestão de Presença no SQLite
  // ===========================================================================
  openMatchDetails(matchId) {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) return;

    this.selectedMatchId = matchId;
    const modal = document.getElementById("match-details-modal");
    if (!modal) return;

    document.getElementById("modal-detail-title").textContent = match.title;
    document.getElementById("modal-detail-sport").textContent = match.sport;
    document.getElementById("modal-detail-venue").innerHTML = `<i class="fa-solid fa-location-dot"></i> ${match.venue} (${match.address})`;
    document.getElementById("modal-detail-datetime").innerHTML = `<i class="fa-regular fa-calendar"></i> ${match.date} às ${match.time}`;
    document.getElementById("modal-detail-level").innerHTML = `<i class="fa-solid fa-chart-simple"></i> ${match.level}`;
    document.getElementById("modal-detail-court").innerHTML = `<i class="fa-solid fa-tree"></i> ${match.courtType || 'Quadra Pública / Acesso Livre'}`;

    this.renderPlayerList(match);
    this.updateModalActions(match);

    modal.classList.add("active");
  }

  closeMatchDetails() {
    const modal = document.getElementById("match-details-modal");
    if (modal) modal.classList.remove("active");
  }

  renderPlayerList(match) {
    const listEl = document.getElementById("modal-player-list");
    const waitlistEl = document.getElementById("modal-waitlist");
    const countEl = document.getElementById("modal-player-count");

    const players = match.players || [];
    const waitlist = match.waitlist || [];

    if (countEl) {
      countEl.textContent = `${players.length} / ${match.maxPlayers} confirmados`;
    }

    if (listEl) {
      listEl.innerHTML = players.map((p, index) => `
        <div class="player-item">
          <div class="player-info">
            <div class="player-avatar">${p.name.substring(0, 2).toUpperCase()}</div>
            <div>
              <div style="font-weight: 700; color: #0f172a;">${index + 1}. ${p.name} ${p.isOrganizer ? '<span style="font-size: 0.65rem; background: #ffedd5; color: #c2410c; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">Organizador</span>' : ''}</div>
              <div class="player-role"><i class="fa-solid fa-shield-halved"></i> ${p.role}</div>
            </div>
          </div>
          <div>
            <span class="player-status-tag status-pago">
              ✓ Confirmado
            </span>
          </div>
        </div>
      `).join("");
    }

    if (waitlistEl) {
      if (waitlist.length > 0) {
        waitlistEl.innerHTML = `
          <h5 style="margin: 1rem 0 0.5rem; font-weight: 700; color: #475569;">Lista de Espera (Prioridade por ordem de chegada):</h5>
          ${waitlist.map((w, i) => `
            <div class="player-item" style="opacity: 0.85;">
              <div class="player-info">
                <div class="player-avatar" style="background: #94a3b8;">${w.name.substring(0, 2).toUpperCase()}</div>
                <div>
                  <div style="font-weight: 600;">#${i + 1} ${w.name}</div>
                  <div class="player-role">${w.role}</div>
                </div>
              </div>
              <span class="player-status-tag status-espera">Na Fila</span>
            </div>
          `).join("")}
        `;
      } else {
        waitlistEl.innerHTML = "";
      }
    }
  }

  updateModalActions(match) {
    const players = match.players || [];
    const waitlist = match.waitlist || [];

    const isUserInMatch = players.some(p => p.id === this.currentUser.id);
    const isUserInWaitlist = waitlist.some(p => p.id === this.currentUser.id);
    const isFull = players.length >= match.maxPlayers;

    const actionContainer = document.getElementById("modal-action-buttons");
    if (!actionContainer) return;

    if (isUserInMatch) {
      actionContainer.innerHTML = `
        <span style="font-size: 0.85rem; color: #047857; font-weight: 700;">
          <i class="fa-solid fa-circle-check"></i> Você está confirmado nesta partida!
        </span>
        <button class="btn btn-outline" style="color: #ef4444; border-color: #fca5a5;" onclick="window.marcaApp.leaveMatch('${match.id}')">
          <i class="fa-solid fa-right-from-bracket"></i> Desistir / Liberar Vaga
        </button>
      `;
    } else if (isUserInWaitlist) {
      actionContainer.innerHTML = `
        <span style="font-size: 0.85rem; color: #b45309; font-weight: 600;">
          <i class="fa-solid fa-clock"></i> Você está na lista de espera!
        </span>
        <button class="btn btn-outline" onclick="window.marcaApp.leaveMatch('${match.id}')">
          Sair da Fila
        </button>
      `;
    } else if (isFull) {
      actionContainer.innerHTML = `
        <button class="btn btn-outline" onclick="window.marcaApp.joinMatch('${match.id}', true)">
          <i class="fa-solid fa-user-clock"></i> Entrar na Lista de Espera
        </button>
      `;
    } else {
      actionContainer.innerHTML = `
        <button class="btn btn-success" style="font-size: 1rem; padding: 0.65rem 1.5rem;" onclick="window.marcaApp.joinMatch('${match.id}', false)">
          <i class="fa-solid fa-check"></i> Quero Jogar! (Confirmar Presença)
        </button>
      `;
    }
  }

  async joinMatch(matchId, asWaitlist = false) {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) return;

    try {
      const response = await fetch(`/api/partidas/${matchId}/participar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonPayload({
          user: {
            id: this.currentUser.id,
            name: this.currentUser.name,
            role: this.currentUser.position
          },
          asWaitlist: asWaitlist || (match.players && match.players.length >= match.maxPlayers)
        })
      });
      if (response.ok) {
        await this.loadMatches();
        const updated = this.matches.find(m => m.id === matchId);
        this.renderPlayerList(updated);
        this.updateModalActions(updated);
        this.renderMapMarkers();
        this.renderSidebarMatches();
        this.showToast(asWaitlist ? "⏳ Você entrou na lista de espera." : `⚽ Presença confirmada!`);
        return;
      }
    } catch (e) {
      console.log("Fallback local para joinMatch");
    }

    // Fallback local
    match.players = match.players || [];
    match.waitlist = match.waitlist || [];

    if (asWaitlist || match.players.length >= match.maxPlayers) {
      match.waitlist.push({
        id: this.currentUser.id,
        name: this.currentUser.name,
        role: this.currentUser.position
      });
      this.showToast("⏳ Você entrou na lista de espera.");
    } else {
      match.players.push({
        id: this.currentUser.id,
        name: this.currentUser.name,
        role: this.currentUser.position,
        isOrganizer: false
      });
      this.showToast(`⚽ Presença confirmada no ${match.sport}!`);
    }

    this.saveLocalCache();
    this.renderPlayerList(match);
    this.updateModalActions(match);
    this.renderMapMarkers();
    this.renderSidebarMatches();
  }

  async leaveMatch(matchId) {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) return;

    try {
      const response = await fetch(`/api/partidas/${matchId}/sair`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonPayload({ userId: this.currentUser.id })
      });
      if (response.ok) {
        const resData = await response.json();
        await this.loadMatches();
        const updated = this.matches.find(m => m.id === matchId);
        this.renderPlayerList(updated);
        this.updateModalActions(updated);
        this.renderMapMarkers();
        this.renderSidebarMatches();
        this.showToast("Você liberou sua vaga.");
        if (resData.promotedUser) {
          this.showToast(`🎉 ${resData.promotedUser} assumiu a vaga titular!`);
        }
        return;
      }
    } catch (e) {
      console.log("Fallback local para leaveMatch");
    }

    // Fallback local
    match.players = match.players || [];
    match.waitlist = match.waitlist || [];

    const playerIndex = match.players.findIndex(p => p.id === this.currentUser.id);
    if (playerIndex !== -1) {
      match.players.splice(playerIndex, 1);
      this.showToast("Você liberou sua vaga.");

      if (match.waitlist.length > 0) {
        const nextInLine = match.waitlist.shift();
        match.players.push({
          id: nextInLine.id,
          name: nextInLine.name,
          role: nextInLine.role,
          isOrganizer: false
        });
        this.showToast(`🎉 ${nextInLine.name} assumiu a vaga titular!`);
      }
    } else {
      match.waitlist = match.waitlist.filter(p => p.id !== this.currentUser.id);
      this.showToast("Você saiu da lista de espera.");
    }

    this.saveLocalCache();
    this.renderPlayerList(match);
    this.updateModalActions(match);
    this.renderMapMarkers();
    this.renderSidebarMatches();
  }

  // ===========================================================================
  // 8. Sorteador Inteligente de Times (Panela Zero!)
  // ===========================================================================
  openSorteioModal() {
    const match = this.matches.find(m => m.id === this.selectedMatchId);
    if (!match) return;

    const modal = document.getElementById("sorteio-modal");
    if (!modal) return;

    this.sortearTimes(match);
    modal.classList.add("active");
  }

  closeSorteioModal() {
    const modal = document.getElementById("sorteio-modal");
    if (modal) modal.classList.remove("active");
  }

  sortearTimes(match) {
    const players = [...(match.players || [])];

    if (players.length < 2) {
      this.showToast("⚠️ É necessário pelo menos 2 jogadores confirmados para sortear times!");
      return;
    }

    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }

    const goalies = players.filter(p => p.role.toLowerCase().includes("goleiro"));
    const linePlayers = players.filter(p => !p.role.toLowerCase().includes("goleiro"));

    const team1 = [];
    const team2 = [];

    goalies.forEach((g, idx) => {
      if (idx % 2 === 0) team1.push(g);
      else team2.push(g);
    });

    linePlayers.forEach((p, idx) => {
      if (team1.length <= team2.length) team1.push(p);
      else team2.push(p);
    });

    this.renderTeamsUI(team1, team2);
    this.currentSortedTeams = { team1, team2, match };
  }

  renderTeamsUI(team1, team2) {
    const t1El = document.getElementById("team-1-players");
    const t2El = document.getElementById("team-2-players");

    if (t1El) {
      t1El.innerHTML = team1.map(p => `
        <div style="padding: 4px 0; border-bottom: 1px dashed #e2e8f0; font-size: 0.85rem; display: flex; justify-content: space-between;">
          <span><strong>${p.name}</strong></span>
          <span style="color: #64748b; font-size: 0.75rem;">${p.role}</span>
        </div>
      `).join("");
    }

    if (t2El) {
      t2El.innerHTML = team2.map(p => `
        <div style="padding: 4px 0; border-bottom: 1px dashed #e2e8f0; font-size: 0.85rem; display: flex; justify-content: space-between;">
          <span><strong>${p.name}</strong></span>
          <span style="color: #64748b; font-size: 0.75rem;">${p.role}</span>
        </div>
      `).join("");
    }
  }

  copyTeamsToWhatsApp() {
    if (!this.currentSortedTeams) return;
    const { team1, team2, match } = this.currentSortedTeams;

    let text = `⚽ *TIMES SORTEADOS - ${match.title.toUpperCase()}*\n`;
    text += `📍 ${match.venue} | ⏰ ${match.date} às ${match.time}\n\n`;

    text += `🎽 *TIME 1 (COLETE BRANCO)*:\n`;
    team1.forEach((p, i) => text += `${i + 1}. ${p.name} (${p.role})\n`);

    text += `\n🎽 *TIME 2 (COLETE COLORIDO)*:\n`;
    team2.forEach((p, i) => text += `${i + 1}. ${p.name} (${p.role})\n`);

    text += `\n🔥 Bora pro jogo! Organizado pelo app *Marca Aí!*`;

    navigator.clipboard.writeText(text);
    this.showToast("📋 Escalação copiada para o WhatsApp!");
  }

  // ===========================================================================
  // 9. Compartilhamento Formatado para WhatsApp & Radar "Falta 1"
  // ===========================================================================
  shareMatchOnWhatsApp() {
    const match = this.matches.find(m => m.id === this.selectedMatchId);
    if (!match) return;

    const playersCount = match.players ? match.players.length : 0;
    const vagasRestantes = match.maxPlayers - playersCount;
    let urgencia = vagasRestantes <= 2 && vagasRestantes > 0 ? "🔥 *FALTA POUCO / CONVOCAÇÃO URGENTE!* 🔥\n\n" : "";

    let message = `${urgencia}⚽ *${match.title.toUpperCase()}* (${match.sport})\n`;
    message += `📅 *Quando:* ${match.date} às ${match.time}\n`;
    message += `📍 *Onde:* ${match.venue} (${match.courtType || 'Quadra Pública'})\n`;
    message += `👥 *Vagas Restantes:* ${vagasRestantes > 0 ? `${vagasRestantes} vagas abertas!` : 'Lotado (Lista de Espera)'}\n`;
    message += `🎉 *Partida Gratuita e Aberta!*\n\n`;
    message += `👉 *Confirme sua presença no racha:* https://marca-ai.app/p/${match.id}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  // ===========================================================================
  // 10. Eventos e UI Helpers
  // ===========================================================================
  bindEvents() {
    document.querySelectorAll(".pill[data-sport]").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".pill[data-sport]").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.activeFilter = pill.dataset.sport;
        this.renderSidebarMatches();
        this.renderMapMarkers();
        this.updateCounters();
      });
    });

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        this.renderSidebarMatches();
        this.renderMapMarkers();
        this.updateCounters();
      });
    }

    document.querySelectorAll(".view-btn[data-view]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".view-btn[data-view]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.switchView(btn.dataset.view);
      });
    });

    const geoBtn = document.getElementById("btn-my-location");
    if (geoBtn) {
      geoBtn.addEventListener("click", () => {
        this.goToUserLocation();
      });
    }

    const createForm = document.getElementById("create-match-form");
    if (createForm) {
      createForm.addEventListener("submit", (e) => this.handleCreateMatchSubmit(e));
    }

    const profileForm = document.getElementById("profile-edit-form");
    if (profileForm) {
      profileForm.addEventListener("submit", (e) => this.handleProfileSubmit(e));
    }
  }

  switchView(view) {
    this.activeView = view;
    const mapViewWrapper = document.getElementById("map-view-wrapper");
    const gridViewContainer = document.getElementById("grid-view-container");
    const sidebar = document.getElementById("sidebar");

    document.querySelectorAll(".view-btn").forEach(b => b.classList.toggle("active", b.dataset.view === view));
    document.querySelectorAll(".mobile-bottom-nav .nav-item").forEach(item => {
      item.classList.toggle("active", item.dataset.tab === view);
    });

    if (view === "map") {
      if (mapViewWrapper) mapViewWrapper.style.display = "block";
      if (sidebar) sidebar.style.display = window.innerWidth <= 768 ? "none" : "flex";
      if (gridViewContainer) gridViewContainer.style.display = "none";
      if (this.map) {
        setTimeout(() => this.map.invalidateSize(), 150);
      }
    } else {
      if (mapViewWrapper) mapViewWrapper.style.display = "none";
      if (sidebar) sidebar.style.display = "none";
      if (gridViewContainer) gridViewContainer.style.display = "block";
    }

    this.renderSidebarMatches();
    this.updateCounters();
  }

  openProfileModal() {
    const modal = document.getElementById("user-profile-modal");
    if (!modal) return;

    const avatarEl = document.getElementById("profile-avatar");
    const nameEl = document.getElementById("profile-name");
    const roleEl = document.getElementById("profile-role");
    const karmaEl = document.getElementById("profile-karma");
    const inputName = document.getElementById("profile-input-name");
    const inputRole = document.getElementById("profile-input-role");
    const inputPhone = document.getElementById("profile-input-phone");

    if (avatarEl) avatarEl.textContent = this.currentUser.avatar || "U";
    if (nameEl) nameEl.textContent = this.currentUser.name || "Jogador";
    if (roleEl) roleEl.textContent = this.currentUser.position || "Jogador";
    if (karmaEl) karmaEl.innerHTML = `<i class="fa-solid fa-star"></i> ${this.currentUser.karma || '5.0 ★'} Fair Play`;
    if (inputName) inputName.value = this.currentUser.name || "";
    if (inputRole) inputRole.value = this.currentUser.position || "Meio-Campo";
    if (inputPhone) inputPhone.value = this.currentUser.phone || "";

    modal.classList.add("active");
  }

  closeProfileModal() {
    const modal = document.getElementById("user-profile-modal");
    if (modal) modal.classList.remove("active");
  }

  handleProfileSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("profile-input-name").value.trim();
    const role = document.getElementById("profile-input-role").value;
    const phone = document.getElementById("profile-input-phone").value.trim();

    if (!name) return;

    this.currentUser.name = name;
    this.currentUser.position = role;
    this.currentUser.phone = phone;
    this.currentUser.avatar = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "AT";

    this.saveUser();
    this.updateUserUI();
    this.closeProfileModal();
    this.showToast("✅ Perfil de atleta atualizado!");
  }

  goToUserLocation() {
    if ("geolocation" in navigator) {
      this.showToast("Buscando sua localização...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (this.map) {
            this.map.flyTo([latitude, longitude], 15);
            L.circle([latitude, longitude], {
              color: "#0284c7",
              fillColor: "#38bdf8",
              fillOpacity: 0.25,
              radius: 300
            }).addTo(this.map).bindPopup("Você está aqui!").openPopup();
          }
          this.showToast("📍 Localização encontrada!");
        },
        (err) => {
          this.showToast("⚠️ Não foi possível obter sua localização. Verifique as permissões.");
        }
      );
    } else {
      this.showToast("Seu navegador não suporta geolocalização.");
    }
  }

  showToast(message) {
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

function jsonPayload(obj) {
  return JSON.stringify(obj);
}

document.addEventListener("DOMContentLoaded", () => {
  window.marcaApp = new MarcaAiApp();
});
