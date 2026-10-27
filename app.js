/**
 * MARCA AÍ! - Core Application Engine
 * Plataforma Comunitária de Marcação e Descoberta de Partidas em Quadras Públicas
 * 100% Gratuito - Focado em Jogos Acontecendo na Área, Gestão de Presença e Sorteio de Times
 */

// =============================================================================
// 1. Estado da Aplicação & Dados Iniciais (Partidas Comunitárias / Gratuitas)
// =============================================================================

const DEFAULT_USER = {
  id: "usr-01",
  name: "Lucas Silva (Você)",
  avatar: "LS",
  position: "Meio-Campo",
  karma: "4.9 ★",
  gamesPlayed: 24,
  phone: "(61) 98765-4321"
};

const INITIAL_MATCHES = [
  {
    id: "match-1",
    title: "Pelada Resenha dos Amigos",
    sport: "Futebol Society",
    category: "futebol",
    date: "Hoje",
    time: "19:30",
    venue: "Quadra Poliesportiva do Parque da Cidade",
    address: "Estacionamento 4, Parque da Cidade, Brasília - DF",
    courtType: "Quadra Pública",
    hasLighting: true,
    lat: -15.7985,
    lng: -47.9045,
    level: "Casual / Resenha",
    maxPlayers: 14,
    hasGoaliePerk: true,
    organizerId: "usr-01",
    players: [
      { id: "usr-01", name: "Lucas Silva (Você)", role: "Meio-Campo", isOrganizer: true },
      { id: "usr-02", name: "Rodrigo 'Muralha'", role: "Goleiro", isOrganizer: false },
      { id: "usr-03", name: "Gabriel Souza", role: "Atacante", isOrganizer: false },
      { id: "usr-04", name: "Matheus Oliveira", role: "Zagueiro", isOrganizer: false },
      { id: "usr-05", name: "Felipe 'Canhoto'", role: "Lateral", isOrganizer: false },
      { id: "usr-06", name: "Thiago Rocha", role: "Meio-Campo", isOrganizer: false },
      { id: "usr-07", name: "Bruno Santos", role: "Atacante", isOrganizer: false },
      { id: "usr-08", name: "Diego Ramos", role: "Zagueiro", isOrganizer: false },
      { id: "usr-09", name: "Caio Mendes", role: "Lateral", isOrganizer: false },
      { id: "usr-10", name: "Vinicius Lima", role: "Meio-Campo", isOrganizer: false },
      { id: "usr-11", name: "Pedro Henrique", role: "Goleiro", isOrganizer: false },
      { id: "usr-12", name: "Rafael Costa", role: "Zagueiro", isOrganizer: false }
    ],
    waitlist: []
  },
  {
    id: "match-2",
    title: "Futsal da Comunidade",
    sport: "Futsal",
    category: "futsal",
    date: "Amanhã",
    time: "20:00",
    venue: "Praça Comunitária da EQN 704",
    address: "EQN 704/705, Asa Norte, Brasília - DF",
    courtType: "Quadra Pública",
    hasLighting: true,
    lat: -15.7725,
    lng: -47.8860,
    level: "Intermediário",
    maxPlayers: 10,
    hasGoaliePerk: true,
    organizerId: "usr-20",
    players: [
      { id: "usr-20", name: "André Martins", role: "Fixo", isOrganizer: true },
      { id: "usr-21", name: "Renan Silveira", role: "Goleiro", isOrganizer: false },
      { id: "usr-22", name: "Marcos Paulo", role: "Ala", isOrganizer: false },
      { id: "usr-23", name: "Lucas Ferreira", role: "Ala", isOrganizer: false },
      { id: "usr-24", name: "Igor Duarte", role: "Pivô", isOrganizer: false },
      { id: "usr-25", name: "Danilo Neves", role: "Fixo", isOrganizer: false },
      { id: "usr-26", name: "Guilherme Vaz", role: "Ala", isOrganizer: false },
      { id: "usr-27", name: "Leonardo Cruz", role: "Ala", isOrganizer: false },
      { id: "usr-28", name: "Bruno Cesar", role: "Pivô", isOrganizer: false },
      { id: "usr-29", name: "Fábio Santos", role: "Goleiro", isOrganizer: false }
    ],
    waitlist: [
      { id: "usr-30", name: "Marcelo Torres", role: "Ala" }
    ]
  },
  {
    id: "match-3",
    title: "Beach Tennis Aberto na Orla",
    sport: "Beach Tennis",
    category: "beach-tennis",
    date: "Sábado",
    time: "08:30",
    venue: "Quadras de Areia do Deck Sul",
    address: "Setor de Clubes Sul, Orla do Lago, Brasília - DF",
    courtType: "Quadra Pública",
    hasLighting: false,
    lat: -15.8230,
    lng: -47.8715,
    level: "Casual / Resenha",
    maxPlayers: 8,
    hasGoaliePerk: false,
    organizerId: "usr-40",
    players: [
      { id: "usr-40", name: "Carolina Becker", role: "Jogadora", isOrganizer: true },
      { id: "usr-41", name: "Juliana Andrade", role: "Jogadora", isOrganizer: false },
      { id: "usr-42", name: "Arthur Vieira", role: "Jogador", isOrganizer: false },
      { id: "usr-43", name: "Marina Lopes", role: "Jogadora", isOrganizer: false }
    ],
    waitlist: []
  },
  {
    id: "match-4",
    title: "Basquete 3x3 Streetball",
    sport: "Basquete",
    category: "basquete",
    date: "Domingo",
    time: "16:00",
    venue: "Parque Olhos D'Água - Quadra Pública",
    address: "SQN 413/414, Asa Norte, Brasília - DF",
    courtType: "Quadra Pública",
    hasLighting: true,
    lat: -15.7538,
    lng: -47.8839,
    level: "Competitivo",
    maxPlayers: 6,
    hasGoaliePerk: false,
    organizerId: "usr-50",
    players: [
      { id: "usr-50", name: "Otávio 'Crossover'", role: "Armador", isOrganizer: true },
      { id: "usr-51", name: "Hugo Valente", role: "Ala", isOrganizer: false },
      { id: "usr-52", name: "Samuel Dias", role: "Pivô", isOrganizer: false },
      { id: "usr-53", name: "Vitor Hugo", role: "Ala", isOrganizer: false },
      { id: "usr-54", name: "Erick B.", role: "Armador", isOrganizer: false }
    ],
    waitlist: []
  },
  {
    id: "match-5",
    title: "Vôlei de Areia dos Amigos",
    sport: "Vôlei",
    category: "volei",
    date: "Sexta",
    time: "18:00",
    venue: "Pontão do Lago Sul - Quadras Públicas",
    address: "SHIS QL 10, Lago Sul, Brasília - DF",
    courtType: "Quadra Pública",
    hasLighting: true,
    lat: -15.8285,
    lng: -47.8790,
    level: "Intermediário",
    maxPlayers: 8,
    hasGoaliePerk: false,
    organizerId: "usr-60",
    players: [
      { id: "usr-60", name: "Camila Ribeiro", role: "Levantadora", isOrganizer: true },
      { id: "usr-61", name: "Daniel Maia", role: "Ponteiro", isOrganizer: false },
      { id: "usr-62", name: "Beatriz M.", role: "Líbero", isOrganizer: false },
      { id: "usr-63", name: "Lucas Silva (Você)", role: "Ponteiro", isOrganizer: false },
      { id: "usr-64", name: "Gustavo Nogueira", role: "Central", isOrganizer: false },
      { id: "usr-65", name: "Mariana S.", role: "Ponteira", isOrganizer: false }
    ],
    waitlist: []
  }
];

class MarcaAiApp {
  constructor() {
    this.currentUser = this.loadUser();
    this.matches = this.loadMatches();
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
  // 2. Persistência
  // ===========================================================================
  loadUser() {
    const saved = localStorage.getItem("marca_ai_user");
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  }

  saveUser() {
    localStorage.setItem("marca_ai_user", JSON.stringify(this.currentUser));
  }

  loadMatches() {
    // Carrega do localStorage ou inicializa os dados sem pagamentos
    const saved = localStorage.getItem("marca_ai_matches_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao carregar partidas", e);
      }
    }
    localStorage.setItem("marca_ai_matches_v2", JSON.stringify(INITIAL_MATCHES));
    return INITIAL_MATCHES;
  }

  saveMatches() {
    localStorage.setItem("marca_ai_matches_v2", JSON.stringify(this.matches));
  }

  // ===========================================================================
  // 3. Inicialização Geral
  // ===========================================================================
  init() {
    this.updateUserUI();
    this.initMap();
    this.renderSidebarMatches();
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

    const initialLat = -15.7942;
    const initialLng = -47.8822;

    this.map = L.map("map", {
      zoomControl: false
    }).setView([initialLat, initialLng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    L.control.zoom({ position: "topright" }).addTo(this.map);

    this.map.on("click", (e) => {
      this.handleMapClick(e.latlng);
    });

    this.renderMapMarkers();
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
    Object.values(this.markers).forEach(m => this.map.removeLayer(m));
    this.markers = {};

    const filtered = this.getFilteredMatches();

    filtered.forEach(match => {
      const vagasRestantes = match.maxPlayers - match.players.length;
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
        match.title.toLowerCase().includes(query) ||
        match.sport.toLowerCase().includes(query) ||
        match.venue.toLowerCase().includes(query) ||
        match.address.toLowerCase().includes(query);

      if (this.activeView === "my-matches") {
        const isParticipant = match.players.some(p => p.id === this.currentUser.id);
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
          <h4 style="font-weight: 700; margin-bottom: 0.25rem;">Nenhuma partida encontrada nesta área</h4>
          <p style="font-size: 0.85rem;">Seja você o primeiro a marcar um jogo nessa quadra pública!</p>
          <button class="btn btn-primary" onclick="window.marcaApp.openCreateModal()" style="margin-top: 1rem;">
            + Marcar Jogo Agora
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
    const vagasRestantes = match.maxPlayers - match.players.length;
    let vagaClass = "abertas";
    let vagaTexto = `${vagasRestantes} vagas abertas`;

    if (vagasRestantes <= 0) {
      vagaClass = "lotado";
      vagaTexto = "Partida Lotada (Lista de Espera)";
    } else if (vagasRestantes <= 2) {
      vagaClass = "urgente";
      vagaTexto = `🔥 Falta ${vagasRestantes} pra fechar!`;
    }

    const isUserIn = match.players.some(p => p.id === this.currentUser.id);

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
    this.openMatchDetails(matchId);
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
  // 6. Modal de Criação de Partida Comunitária
  // ===========================================================================
  openCreateModal(lat = null, lng = null) {
    const modal = document.getElementById("create-match-modal");
    if (!modal) return;

    const latInput = document.getElementById("form-lat");
    const lngInput = document.getElementById("form-lng");
    const coordsDisplay = document.getElementById("form-coords-display");

    const selectedLat = lat || (this.map ? this.map.getCenter().lat : -15.7985);
    const selectedLng = lng || (this.map ? this.map.getCenter().lng : -47.9045);

    if (latInput) latInput.value = selectedLat.toFixed(6);
    if (lngInput) lngInput.value = selectedLng.toFixed(6);
    if (coordsDisplay) coordsDisplay.textContent = `${selectedLat.toFixed(4)}, ${selectedLng.toFixed(4)}`;

    modal.classList.add("active");
  }

  closeCreateModal() {
    const modal = document.getElementById("create-match-modal");
    if (modal) modal.classList.remove("active");
    if (this.tempPin) {
      this.map.removeLayer(this.tempPin);
      this.tempPin = null;
    }
  }

  handleCreateMatchSubmit(e) {
    e.preventDefault();

    const title = document.getElementById("form-title").value.trim();
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
    const lat = parseFloat(document.getElementById("form-lat").value);
    const lng = parseFloat(document.getElementById("form-lng").value);

    const newMatch = {
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
      players: [
        {
          id: this.currentUser.id,
          name: this.currentUser.name,
          role: this.currentUser.position,
          isOrganizer: true
        }
      ],
      waitlist: []
    };

    this.matches.unshift(newMatch);
    this.saveMatches();
    this.closeCreateModal();
    this.renderMapMarkers();
    this.renderSidebarMatches();
    this.updateCounters();
    this.showToast(`⚽ Partida "${title}" agendada! Convoque a galera no Zap.`);
    this.selectMatch(newMatch.id);
  }

  // ===========================================================================
  // 7. Modal de Detalhes da Partida & Gestão de Presença Direta
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

    if (countEl) {
      countEl.textContent = `${match.players.length} / ${match.maxPlayers} confirmados`;
    }

    if (listEl) {
      listEl.innerHTML = match.players.map((p, index) => `
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
      if (match.waitlist && match.waitlist.length > 0) {
        waitlistEl.innerHTML = `
          <h5 style="margin: 1rem 0 0.5rem; font-weight: 700; color: #475569;">Lista de Espera (Prioridade por ordem de chegada):</h5>
          ${match.waitlist.map((w, i) => `
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
    const isUserInMatch = match.players.some(p => p.id === this.currentUser.id);
    const isUserInWaitlist = match.waitlist && match.waitlist.some(p => p.id === this.currentUser.id);
    const isFull = match.players.length >= match.maxPlayers;

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

  joinMatch(matchId, asWaitlist = false) {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) return;

    if (asWaitlist || match.players.length >= match.maxPlayers) {
      match.waitlist = match.waitlist || [];
      match.waitlist.push({
        id: this.currentUser.id,
        name: this.currentUser.name,
        role: this.currentUser.position
      });
      this.showToast("⏳ Você entrou na lista de espera. Te avisaremos se alguém liberar vaga!");
    } else {
      match.players.push({
        id: this.currentUser.id,
        name: this.currentUser.name,
        role: this.currentUser.position,
        isOrganizer: false
      });
      this.showToast(`⚽ Presença confirmada no ${match.sport}! Bora pro jogo.`);
    }

    this.saveMatches();
    this.renderPlayerList(match);
    this.updateModalActions(match);
    this.renderMapMarkers();
    this.renderSidebarMatches();
  }

  leaveMatch(matchId) {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) return;

    const playerIndex = match.players.findIndex(p => p.id === this.currentUser.id);
    if (playerIndex !== -1) {
      match.players.splice(playerIndex, 1);
      this.showToast("Você liberou sua vaga.");

      if (match.waitlist && match.waitlist.length > 0) {
        const nextInLine = match.waitlist.shift();
        match.players.push({
          id: nextInLine.id,
          name: nextInLine.name,
          role: nextInLine.role,
          isOrganizer: false
        });
        this.showToast(`🎉 ${nextInLine.name} assumiu a vaga titular!`);
      }
    } else if (match.waitlist) {
      match.waitlist = match.waitlist.filter(p => p.id !== this.currentUser.id);
      this.showToast("Você saiu da lista de espera.");
    }

    this.saveMatches();
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
    const players = [...match.players];

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

    const vagasRestantes = match.maxPlayers - match.players.length;
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
  }

  switchView(view) {
    this.activeView = view;
    const mapViewWrapper = document.getElementById("map-view-wrapper");
    const gridViewContainer = document.getElementById("grid-view-container");
    const sidebar = document.getElementById("sidebar");

    if (view === "map") {
      if (mapViewWrapper) mapViewWrapper.style.display = "block";
      if (sidebar) sidebar.style.display = "flex";
      if (gridViewContainer) gridViewContainer.style.display = "none";
      if (this.map) this.map.invalidateSize();
    } else {
      if (mapViewWrapper) mapViewWrapper.style.display = "none";
      if (sidebar) sidebar.style.display = "none";
      if (gridViewContainer) gridViewContainer.style.display = "block";
    }

    this.renderSidebarMatches();
    this.updateCounters();
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

document.addEventListener("DOMContentLoaded", () => {
  window.marcaApp = new MarcaAiApp();
});
