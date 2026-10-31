// Base URL da API para suportar tanto Web quanto APK Android nativo (Capacitor)
const API_BASE_URL = (typeof window !== "undefined" && ((window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) || window.location.protocol === "file:" || (window.location.hostname === "localhost" && !window.location.port))) ? "https://marca-ai-kappa.vercel.app" : "";

﻿/**
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

// =============================================================================
// Levantamento de Quadras Públicas e Pontos Pré-Estabelecidos no DF
// (Asa Norte, Asa Sul e Parque da Cidade Dona Sarah Kubitschek)
// =============================================================================
const PRESET_PUBLIC_COURTS = [
  // --- PARQUE DA CIDADE ---
  {
    id: "bsb-parque-04",
    name: "Parque da Cidade - Estacionamento 4",
    region: "Parque da Cidade",
    sports: ["Futsal", "Basquete", "Futebol Society"],
    defaultSport: "Futsal",
    category: "futebol",
    surface: "Piso de Cimento Polido",
    venue: "Parque da Cidade - Estacionamento 4",
    address: "Parque da Cidade Dona Sarah Kubitschek, Estac. 4 - Brasília, DF",
    courtType: "Parque Municipal",
    hasLighting: true,
    lat: -15.7972,
    lng: -47.9022
  },
  {
    id: "bsb-parque-07",
    name: "Parque da Cidade - Estacionamento 7 (Areia)",
    region: "Parque da Cidade",
    sports: ["Vôlei de Areia", "Futevôlei", "Beach Tennis"],
    defaultSport: "Vôlei",
    category: "volei",
    surface: "Areia de Praia",
    venue: "Parque da Cidade - Quadras de Areia Estac. 7",
    address: "Parque da Cidade, Estacionamento 7 - Brasília, DF",
    courtType: "Parque Municipal",
    hasLighting: true,
    lat: -15.8015,
    lng: -47.9078
  },
  {
    id: "bsb-parque-10",
    name: "Parque da Cidade - Praça das Fontes (Estac. 9/10)",
    region: "Parque da Cidade",
    sports: ["Basquete Streetball", "Futsal"],
    defaultSport: "Basquete",
    category: "basquete",
    surface: "Piso Asfáltico Pintado",
    venue: "Praça das Fontes - Parque da Cidade",
    address: "Parque da Cidade, Estacionamento 9/10 - Brasília, DF",
    courtType: "Parque Municipal",
    hasLighting: true,
    lat: -15.7950,
    lng: -47.8995
  },

  // --- ASA NORTE ---
  {
    id: "bsb-norte-408",
    name: "Quadra Poliesportiva da SQN 408/409",
    region: "Asa Norte",
    sports: ["Futsal", "Basquete Street", "Vôlei"],
    defaultSport: "Futsal",
    category: "futebol",
    surface: "Concreto com Alambrado",
    venue: "Quadra Comunitária da SQN 408/409 Norte",
    address: "SQN 408, Área Especial - Asa Norte, Brasília - DF",
    courtType: "Quadra Pública",
    hasLighting: true,
    lat: -15.7655,
    lng: -47.8778
  },
  {
    id: "bsb-norte-104",
    name: "Quadra Poliesportiva da SQN 104/105",
    region: "Asa Norte",
    sports: ["Futsal", "Vôlei"],
    defaultSport: "Futebol Society",
    category: "futebol",
    surface: "Cimento Pintado",
    venue: "Quadra Poliesportiva SQN 104/105 Norte",
    address: "SQN 104/105, Entrequadra - Asa Norte, Brasília - DF",
    courtType: "Quadra Pública",
    hasLighting: true,
    lat: -15.7790,
    lng: -47.8845
  },
  {
    id: "bsb-norte-210",
    name: "Quadra da SQN 210/211 (Olhos D'Água)",
    region: "Asa Norte",
    sports: ["Futsal", "Basquete"],
    defaultSport: "Basquete",
    category: "basquete",
    surface: "Concreto com Tabelas",
    venue: "Quadra de Esportes SQN 210/211 Norte",
    address: "SQN 210/211 (Próximo ao Parque Olhos D'Água) - Asa Norte, Brasília - DF",
    courtType: "Quadra Pública",
    hasLighting: true,
    lat: -15.7512,
    lng: -47.8860
  },
  {
    id: "bsb-norte-315",
    name: "Quadra de Esportes da SQN 315/316",
    region: "Asa Norte",
    sports: ["Futsal", "Handebol", "Vôlei"],
    defaultSport: "Futsal",
    category: "futebol",
    surface: "Cimento com Traves",
    venue: "Quadra Poliesportiva SQN 315/316 Norte",
    address: "SQN 315/316 Norte - Asa Norte, Brasília - DF",
    courtType: "Quadra Pública",
    hasLighting: true,
    lat: -15.7380,
    lng: -47.8965
  },
  {
    id: "bsb-norte-unb",
    name: "UnB - Centro Olímpico (Quadras Externas)",
    region: "Asa Norte",
    sports: ["Futsal", "Basquete", "Vôlei"],
    defaultSport: "Basquete",
    category: "basquete",
    surface: "Quadras Oficiais Poliesportivas",
    venue: "Centro Olímpico da UnB - Quadras Externas",
    address: "Campus Universitário Darcy Ribeiro - Asa Norte, Brasília - DF",
    courtType: "Complexo Esportivo Universitário Livre",
    hasLighting: true,
    lat: -15.7620,
    lng: -47.8690
  },
  {
    id: "bsb-norte-lago",
    name: "Calçadão do Lago Norte (Areia)",
    region: "Asa Norte / Lago",
    sports: ["Vôlei de Praia", "Futevôlei", "Beach Tennis"],
    defaultSport: "Beach Tennis",
    category: "beach-tennis",
    surface: "Areia Fina",
    venue: "Calçadão do Lago Norte / Ponte do Bragueto",
    address: "Orla do Lago Paranoá, Final da Asa Norte - Brasília - DF",
    courtType: "Parque / Orla Pública",
    hasLighting: true,
    lat: -15.7410,
    lng: -47.8685
  },

  // --- ASA SUL ---
  {
    id: "bsb-sul-104",
    name: "Quadra Poliesportiva da SQS 104/105 Sul",
    region: "Asa Sul",
    sports: ["Basquete Streetball", "Futsal"],
    defaultSport: "Basquete",
    category: "basquete",
    surface: "Piso Especial Streetball com Tabelas de Vidro",
    venue: "Quadra de Basquete e Futsal SQS 104/105 Sul",
    address: "SQS 104/105, Entrequadra - Asa Sul, Brasília - DF",
    courtType: "Quadra Pública",
    hasLighting: true,
    lat: -15.8080,
    lng: -47.9045
  },
  {
    id: "bsb-sul-308",
    name: "Quadra Modelo da SQS 308 Sul (Burle Marx)",
    region: "Asa Sul",
    sports: ["Futsal", "Vôlei"],
    defaultSport: "Futebol Society",
    category: "futebol",
    surface: "Cimento e Convivência",
    venue: "Quadra de Esportes da Superquadra Modelo 308 Sul",
    address: "SQS 308 Sul - Asa Sul, Brasília - DF",
    courtType: "Quadra Pública Histórica",
    hasLighting: true,
    lat: -15.8135,
    lng: -47.9100
  },
  {
    id: "bsb-sul-412",
    name: "Quadra Poliesportiva da SQS 412/413 Sul",
    region: "Asa Sul",
    sports: ["Futsal", "Vôlei", "Basquete"],
    defaultSport: "Futsal",
    category: "futebol",
    surface: "Cimento com Alambrado Completo",
    venue: "Quadra Comunitária da SQS 412/413 Sul",
    address: "SQS 412/413 Sul - Asa Sul, Brasília - DF",
    courtType: "Quadra Pública",
    hasLighting: true,
    lat: -15.8340,
    lng: -47.9150
  },
  {
    id: "bsb-sul-214",
    name: "Quadra de Esportes da SQS 214/215 Sul",
    region: "Asa Sul",
    sports: ["Futsal", "Basquete"],
    defaultSport: "Futsal",
    category: "futebol",
    surface: "Cimento Polido",
    venue: "Quadra Poliesportiva SQS 214/215 Sul",
    address: "SQS 214/215 Sul - Asa Sul, Brasília - DF",
    courtType: "Quadra Pública",
    hasLighting: true,
    lat: -15.8395,
    lng: -47.9255
  },
  {
    id: "bsb-sul-parque",
    name: "Parque Ecológico Asa Sul (SGAS 614)",
    region: "Asa Sul",
    sports: ["Futsal", "Basquete", "Circuito Funcional"],
    defaultSport: "Futsal",
    category: "futebol",
    surface: "Quadras Poliesportivas Integradas",
    venue: "Parque Ecológico da Asa Sul",
    address: "SGAS 614 Sul, Lote 100 - Asa Sul, Brasília - DF",
    courtType: "Parque Ecológico Público",
    hasLighting: true,
    lat: -15.8360,
    lng: -47.9290
  },

  {
    id: "bsb-sul-cief",
    name: "CIEF - Centro Interescolar (SGAS 907)",
    region: "Asa Sul",
    sports: ["Vôlei de Areia", "Basquete", "Futsal", "Atletismo"],
    defaultSport: "Vôlei",
    category: "volei",
    surface: "Quadras de Areia e Poliesportivas",
    venue: "Complexo Esportivo CIEF",
    address: "SGAS 907 Sul, Módulo 23 - Asa Sul, Brasília - DF",
    courtType: "Complexo Esportivo Público",
    hasLighting: true,
    lat: -15.8175,
    lng: -47.9180
  },

  // --- SETOR SUDOESTE ---
  {
    id: "bsb-sudoeste-bosque",
    name: "Parque Urbano Bosque do Sudoeste",
    region: "Sudoeste",
    sports: ["Futsal", "Vôlei de Areia", "Basquete", "Futevôlei"],
    defaultSport: "Futsal",
    category: "futebol",
    surface: "Piso Asfáltico Pintado e Areia",
    venue: "Parque Bosque do Sudoeste",
    address: "2ª Avenida, Entre as Quadras 100/300 - Sudoeste, Brasília - DF",
    courtType: "Parque Urbano / Público",
    hasLighting: true,
    lat: -15.7964,
    lng: -47.9264
  },
  {
    id: "bsb-sudoeste-304",
    name: "Quadra Poliesportiva SQSW 304/305",
    region: "Sudoeste",
    sports: ["Futsal", "Basquete", "Vôlei"],
    defaultSport: "Futsal",
    category: "futebol",
    surface: "Concreto com Alambrado",
    venue: "Praça de Esportes SQSW 304/305",
    address: "SQSW 304/305, Entrequadra - Sudoeste, Brasília - DF",
    courtType: "Quadra Pública",
    hasLighting: true,
    lat: -15.7925,
    lng: -47.9288
  },
  {
    id: "bsb-sudoeste-300",
    name: "Quadra Poliesportiva da SQSW 300",
    region: "Sudoeste",
    sports: ["Basquete Streetball", "Futsal"],
    defaultSport: "Basquete",
    category: "basquete",
    surface: "Piso Asfáltico Especial",
    venue: "Praça Central da SQSW 300",
    address: "SQSW 300, Área Especial - Sudoeste, Brasília - DF",
    courtType: "Quadra Pública",
    hasLighting: true,
    lat: -15.7990,
    lng: -47.9220
  },
  {
    id: "bsb-sudoeste-qrsw",
    name: "Complexo Esportivo da QRSW 04/05",
    region: "Sudoeste",
    sports: ["Futebol Society", "Futsal", "Futevôlei"],
    defaultSport: "Futebol Society",
    category: "futebol",
    surface: "Concreto Polido e Caixa de Areia",
    venue: "Área de Esportes Comunitária QRSW 04",
    address: "QRSW 04, Área Especial - Sudoeste, Brasília - DF",
    courtType: "Quadra Pública",
    hasLighting: true,
    lat: -15.7938,
    lng: -47.9345
  },

  // --- ÁGUAS CLARAS ---
  {
    id: "bsb-aguas-parque",
    name: "Parque Ecológico de Águas Claras (Poliesportiva)",
    region: "Águas Claras",
    sports: ["Futsal", "Basquete", "Handebol"],
    defaultSport: "Futsal",
    category: "futebol",
    surface: "Piso de Concreto Pintado",
    venue: "Parque Ecológico de Águas Claras",
    address: "Avenida das Castanheiras, s/n - Águas Claras, Brasília - DF",
    courtType: "Parque Urbano / Público",
    hasLighting: true,
    lat: -15.8328,
    lng: -48.0303
  },
  {
    id: "bsb-aguas-areia",
    name: "Parque de Águas Claras (Quadras de Areia)",
    region: "Águas Claras",
    sports: ["Vôlei de Praia", "Futevôlei", "Beach Tennis"],
    defaultSport: "Vôlei",
    category: "volei",
    surface: "Areia de Praia Fina",
    venue: "Complexo de Areia - Parque de Águas Claras",
    address: "Próximo à Lagoa dos Patos - Águas Claras, Brasília - DF",
    courtType: "Parque Urbano / Público",
    hasLighting: true,
    lat: -15.8340,
    lng: -48.0295
  },
  {
    id: "bsb-aguas-gaivotas",
    name: "Quadra Poliesportiva Praça das Gaivotas",
    region: "Águas Claras",
    sports: ["Futsal", "Basquete", "Vôlei"],
    defaultSport: "Futebol Society",
    category: "futebol",
    surface: "Piso Cimentado com Alambrado",
    venue: "Praça das Gaivotas",
    address: "Avenida Parque Águas Claras, Quadra 105 - Águas Claras, Brasília - DF",
    courtType: "Quadra Pública",
    hasLighting: true,
    lat: -15.8375,
    lng: -48.0350
  }
];

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
    this.publicCourts = PRESET_PUBLIC_COURTS;
    this.showPublicCourts = true;
    this.currentLeaderboardCourtId = null;

    // Histórico de frequência comunitária das quadras de Brasília (Strava Segment Benchmark)
    this.courtHistorySeed = {
      "bsb-parque-04": [
        { name: "Felipe Canhoto", avatar: "FC", role: "Atacante", matches: 6 },
        { name: "Rodrigo Paredão", avatar: "RP", role: "Goleiro", matches: 4 },
        { name: "Lucas Silva (Você)", avatar: "LS", role: "Meio-Campo", matches: 2 }
      ],
      "bsb-parque-07": [
        { name: "Camila Vôlei", avatar: "CV", role: "Levantadora", matches: 7 },
        { name: "Bruno Beach", avatar: "BB", role: "Defesa", matches: 5 },
        { name: "Lucas Silva (Você)", avatar: "LS", role: "Meio-Campo", matches: 1 }
      ],
      "bsb-parque-10": [
        { name: "Gabriel Dunk", avatar: "GD", role: "Armador", matches: 8 },
        { name: "Marcos Ala", avatar: "MA", role: "Ala", matches: 5 }
      ],
      "bsb-norte-408": [
        { name: "Lucas Silva (Você)", avatar: "LS", role: "Meio-Campo", matches: 5 },
        { name: "Thiago Futsal", avatar: "TF", role: "Fixo", matches: 4 },
        { name: "Enzo 10", avatar: "EN", role: "Pivô", matches: 3 }
      ],
      "bsb-norte-104": [
        { name: "Danilo Silva", avatar: "DS", role: "Zagueiro", matches: 5 },
        { name: "Matheus", avatar: "MT", role: "Lateral", matches: 3 }
      ],
      "bsb-norte-210": [
        { name: "Leo Street", avatar: "LS", role: "Armador", matches: 6 },
        { name: "Rafael Cestinha", avatar: "RC", role: "Ala/Pivô", matches: 4 }
      ],
      "bsb-sul-308": [
        { name: "Gustavo Society", avatar: "GS", role: "Meia", matches: 6 },
        { name: "Fábio Muralha", avatar: "FM", role: "Goleiro", matches: 4 }
      ],
      "bsb-sul-415": [
        { name: "Diego Sintético", avatar: "DS", role: "Pivô", matches: 7 },
        { name: "André Fixo", avatar: "AF", role: "Fixo", matches: 4 }
      ],
      "bsb-sul-108": [
        { name: "Cláudio Vôlei", avatar: "CV", role: "Atacante", matches: 5 },
        { name: "Renato DF", avatar: "RD", role: "Defesa", matches: 3 }
      ],
      "bsb-sudoeste-bosque": [
        { name: "Marcelo Bosque", avatar: "MB", role: "Atacante", matches: 7 },
        { name: "Ana Beach", avatar: "AB", role: "Levantadora", matches: 5 },
        { name: "Lucas Silva (Você)", avatar: "LS", role: "Meio-Campo", matches: 2 }
      ],
      "bsb-sudoeste-304": [
        { name: "Leandro Futsal", avatar: "LF", role: "Pivô", matches: 6 },
        { name: "Thiago 304", avatar: "T3", role: "Fixo", matches: 4 }
      ],
      "bsb-sudoeste-300": [
        { name: "Vitor Street", avatar: "VS", role: "Armador", matches: 8 },
        { name: "Lucas Cestinha", avatar: "LC", role: "Ala", matches: 5 }
      ],
      "bsb-sudoeste-qrsw": [
        { name: "Paulo Society", avatar: "PS", role: "Zagueiro", matches: 6 },
        { name: "Rafael Econômico", avatar: "RE", role: "Meia", matches: 4 }
      ],
      "bsb-aguas-parque": [
        { name: "Daniel Castanheiras", avatar: "DC", role: "Meio-Campo", matches: 7 },
        { name: "Marcos Ala", avatar: "MA", role: "Ala", matches: 5 }
      ],
      "bsb-aguas-areia": [
        { name: "Camila Praia", avatar: "CP", role: "Levantadora", matches: 8 },
        { name: "Felipe Futevôlei", avatar: "FF", role: "Ataque", matches: 6 }
      ],
      "bsb-aguas-gaivotas": [
        { name: "Rodrigo Gaivotas", avatar: "RG", role: "Pivô", matches: 5 },
        { name: "Matheus DF", avatar: "MD", role: "Goleiro", matches: 3 }
      ]
    };
    this.courtMarkers = {};

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
    const saved = localStorage.getItem("marca_ai_sqlite_cache");
    const localMatches = saved ? JSON.parse(saved) : [];

    // Tenta carregar do backend SQLite (local ou Vercel Serverless)
    try {
      const response = await fetch(API_BASE_URL + "/api/partidas");
      if (response.ok) {
        const serverMatches = await response.json();
        if (Array.isArray(serverMatches) && serverMatches.length > 0) {
          this.matches = serverMatches;
          this.saveLocalCache();
          return;
        } else if (localMatches.length > 0) {
          // Se o container serverless iniciou limpo, re-sincroniza com as partidas locais salvas
          for (const m of localMatches) {
            try {
              await fetch(API_BASE_URL + "/api/partidas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: jsonPayload(m)
              });
            } catch (_) {}
          }
          this.matches = localMatches;
          return;
        } else {
          this.matches = [];
          this.saveLocalCache();
          return;
        }
      }
    } catch (e) {
      console.log("Servidor SQLite não detectado ou modo offline. Usando persistência local:", e);
    }

    this.matches = localMatches;
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
    this.renderPublicCourtMarkers();
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

    this.layers = {
      ruas: ruasLayer,
      satelite: sateliteLayer
    };

    // Adiciona Mapa de Ruas (OpenStreetMap) como camada ativa e confiável
    ruasLayer.addTo(this.map);

    // Seletor de Camadas nativo do Leaflet (apenas Ruas e Satelite)
    const baseLayers = {
      "🗺️ Mapa de Ruas": ruasLayer,
      "🛰️ Satélite HD": sateliteLayer
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

    if (theme === "satelite") {
      this.layers.satelite.addTo(this.map);
      this.showToast("🛰️ Satélite HD ativado");
    } else {
      this.layers.ruas.addTo(this.map);
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

      const isRadar = this.isRadarMatch(match);
      const radarRings = isRadar ? `
        <span class="marker-radar-ring"></span>
        <span class="marker-radar-ring delay"></span>
      ` : '';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; width: 40px; height: 40px;">
            ${radarRings}
            <div style="
              background: ${isRadar ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #dc2626, #e11d48)'};
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #fff;
              box-shadow: 0 4px 12px ${isRadar ? 'rgba(239, 68, 68, 0.55)' : 'rgba(0,0,0,0.3)'};
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
              ">${isRadar ? `🚨 ${vagasRestantes}v` : (vagasRestantes > 0 ? vagasRestantes : 'Full')}</span>
            </div>
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
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #dc2626;">${match.sport}</span>
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
            background: linear-gradient(135deg, #dc2626, #e11d48);
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

  // ===========================================================================
  // Quadras Públicas Verificadas (DF: Asa Norte, Asa Sul, Parque da Cidade)
  // ===========================================================================
  renderPublicCourtMarkers() {
    if (!this.map) return;
    Object.values(this.courtMarkers).forEach(m => this.map.removeLayer(m));
    this.courtMarkers = {};

    if (!this.showPublicCourts) return;

    this.publicCourts.forEach(court => {
      const courtIcon = L.divIcon({
        className: 'custom-court-marker',
        html: `
          <div class="court-pin-inner" title="${court.name}">
            <svg class="court-rect-icon" viewBox="0 0 24 16" width="22" height="15" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <!-- Borda externa retangular da quadra esportiva -->
              <rect x="1" y="1" width="22" height="14" rx="2" stroke="#ffffff" stroke-width="1.7"/>
              <!-- Linha divisória de meio-campo / rede -->
              <line x1="12" y1="1" x2="12" y2="15" stroke="#ffffff" stroke-width="1.5"/>
              <!-- Círculo central da quadra -->
              <circle cx="12" cy="8" r="3.2" stroke="#ffffff" stroke-width="1.4"/>
              <!-- Áreas de gol / garrafão nos dois lados da quadra -->
              <path d="M 1 4.5 H 4.5 V 11.5 H 1" stroke="#ffffff" stroke-width="1.3"/>
              <path d="M 23 4.5 H 19.5 V 11.5 H 23" stroke="#ffffff" stroke-width="1.3"/>
            </svg>
          </div>
        `,
        iconSize: [38, 36],
        iconAnchor: [19, 36],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([court.lat, court.lng], { icon: courtIcon }).addTo(this.map);

      marker.bindPopup(`
        <div style="font-family: Montserrat, sans-serif; padding: 4px; min-width: 220px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 10px; background: rgba(220, 38, 38, 0.15); color: #ef4444; border: 1px solid rgba(220, 38, 38, 0.3); font-weight: 800; padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
              <svg viewBox="0 0 24 16" width="12" height="8" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="1" width="22" height="14" rx="1.5"/><line x1="12" y1="1" x2="12" y2="15"/><circle cx="12" cy="8" r="3"/></svg> Quadra Pública DF
            </span>
            <span style="font-size: 10px; color: #64748b; font-weight: 600;">${court.region}</span>
          </div>
          <h4 style="margin: 4px 0 2px; font-size: 13px; font-weight: 800; color: #0f172a;">${court.name}</h4>
          <p style="margin: 0 0 6px; font-size: 11px; color: #64748b;"><i class="fa-solid fa-location-dot"></i> ${court.address}</p>
          <div style="background: #f8fafc; border-radius: 6px; padding: 6px; margin-bottom: 8px; font-size: 11px; display: flex; flex-direction: column; gap: 2px;">
            <div><strong>Esportes:</strong> ${court.sports.join(", ")}</div>
            <div><strong>Piso:</strong> ${court.surface}</div>
            <div>${court.hasLighting ? '💡 Iluminação Noturna Ativa' : '☀️ Uso Diurno'}</div>
          </div>
          <div class="court-legend-badge">
            <span>👑 Lenda Local:</span> <strong>${this.getCourtLeaderboard(court.id).legend ? this.getCourtLeaderboard(court.id).legend.name : 'Seja o Primeiro!'}</strong> (${this.getCourtLeaderboard(court.id).legend ? this.getCourtLeaderboard(court.id).legend.matches : 0} jogos)
          </div>
          <button onclick="window.marcaApp.openCourtLeaderboard('${court.id}')" class="btn-court-leaderboard">
            <i class="fa-solid fa-trophy"></i> Ver Ranking da Quadra
          </button>
          <button onclick="window.marcaApp.openCreateModalWithPreset('${court.id}')" style="margin-top: 8px; 
            width: 100%;
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: #ffffff;
            border: none;
            padding: 9px 12px;
            font-size: 12px;
            font-weight: 800;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
            transition: all 0.2s ease;
          ">
            <svg viewBox="0 0 24 16" width="16" height="11" fill="none" stroke="#ffffff" stroke-width="1.8" style="flex-shrink:0;">
              <rect x="1" y="1" width="22" height="14" rx="2" stroke="#ffffff"/>
              <line x1="12" y1="1" x2="12" y2="15" stroke="#ffffff"/>
              <circle cx="12" cy="8" r="3" stroke="#ffffff"/>
            </svg>
            <span>Marcar Partida Nesta Quadra</span>
          </button>
        </div>
      `);

      this.courtMarkers[court.id] = marker;
    });
  }

  togglePublicCourts() {
    this.showPublicCourts = !this.showPublicCourts;
    this.renderPublicCourtMarkers();
    const btn = document.getElementById("btn-toggle-courts");
    if (btn) {
      if (this.showPublicCourts) {
        btn.style.background = "rgba(220, 38, 38, 0.22)";
        btn.style.color = "#fca5a5";
        btn.style.borderColor = "#dc2626";
        this.showToast(`🏟️ Exibindo ${this.publicCourts.length} quadras públicas de Brasília.`);
      } else {
        btn.style.background = "rgba(15, 23, 42, 0.6)";
        btn.style.color = "#94a3b8";
        btn.style.borderColor = "#334155";
        this.showToast("Camada de quadras públicas ocultada.");
      }
    }
  }

  openCreateModalWithPreset(courtId) {
    const court = this.publicCourts.find(c => c.id === courtId);
    if (!court) return;

    this.openCreateModal(court.lat, court.lng);
    this.onSelectPresetCourt(courtId);
  }

  onSelectPresetCourt(courtId) {
    const court = this.publicCourts.find(c => c.id === courtId);
    if (!court) return;

    const selectEl = document.getElementById("form-preset-court");
    if (selectEl) selectEl.value = courtId;

    const titleEl = document.getElementById("form-title");
    if (titleEl && (!titleEl.value || titleEl.value.startsWith("Partida") || titleEl.value.startsWith("Racha"))) {
      titleEl.value = `Racha no ${court.name.split(" - ")[0]}`;
    }

    const venueEl = document.getElementById("form-venue");
    if (venueEl) venueEl.value = court.venue;

    const addressEl = document.getElementById("form-address");
    if (addressEl) addressEl.value = court.address;

    const courtTypeEl = document.getElementById("form-court-type");
    if (courtTypeEl) courtTypeEl.value = court.courtType;

    const lightingEl = document.getElementById("form-lighting");
    if (lightingEl) lightingEl.checked = court.hasLighting;

    const latEl = document.getElementById("form-lat");
    if (latEl) latEl.value = court.lat;

    const lngEl = document.getElementById("form-lng");
    if (lngEl) lngEl.value = court.lng;

    const coordsDisplay = document.getElementById("form-coords-display");
    if (coordsDisplay) {
      coordsDisplay.textContent = `${court.lat.toFixed(4)}, ${court.lng.toFixed(4)} (${court.name})`;
    }

    // Seleciona modalidade correspondente no select
    const sportEl = document.getElementById("form-sport");
    if (sportEl) {
      for (let i = 0; i < sportEl.options.length; i++) {
        if (sportEl.options[i].value.toLowerCase().includes(court.defaultSport.toLowerCase())) {
          sportEl.selectedIndex = i;
          break;
        }
      }
    }

    // Se o mapa estiver aberto, navega até a quadra
    if (this.map) {
      this.map.flyTo([court.lat, court.lng], 16, { duration: 1.2 });
    }

    this.showToast(`📍 Quadra "${court.name}" selecionada com sucesso!`);
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
  isRadarMatch(match) {
    const playersCount = match.players ? match.players.length : 0;
    const vagas = match.maxPlayers - playersCount;
    return vagas > 0 && vagas <= 2;
  }

  getFilteredMatches() {
    return this.matches.filter(match => {
      let matchesCategory = false;
      if (this.activeFilter === "radar") {
        matchesCategory = this.isRadarMatch(match);
      } else if (this.activeFilter === "todos") {
        matchesCategory = true;
      } else if (this.activeFilter === "futebol") {
        matchesCategory = (match.category === "futebol" || match.category === "futsal");
      } else {
        matchesCategory = (this.activeFilter === match.category);
      }

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
    const isRadar = this.isRadarMatch(match);

    const radarBanner = isRadar ? `
      <div class="radar-card-badge">
        <span class="radar-dot"></span>
        <span><strong>RADAR FALTA ${vagasRestantes}:</strong> Jogo precisa de você agora!</span>
      </div>
    ` : '';

    const checklist = match.checklist || [];
    const missingEssential = checklist.filter(it => it.isEssential && !it.assignedTo);
    let missingBadge = '';
    if (missingEssential.length > 0) {
      const names = missingEssential.map(it => it.name.split(" ")[0]).slice(0, 2).join(", ");
      missingBadge = `
        <div class="missing-materials-badge">
          <i class="fa-solid fa-triangle-exclamation"></i> Falta: ${names}
        </div>
      `;
    }

    return `
      <div class="match-card ${this.selectedMatchId === match.id ? 'active' : ''} ${isRadar ? 'match-card-radar' : ''}" id="card-${match.id}" onclick="window.marcaApp.selectMatch('${match.id}')">
        ${radarBanner}
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
          <div style="display: flex; flex-direction: column;">
            <div class="vagas-badge ${vagaClass}">
              <i class="fa-solid fa-users"></i>
              <span>${vagaTexto}</span>
            </div>
            ${missingBadge}
          </div>
          <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; justify-content: flex-end;">
            ${match.status === 'completed' ? `<span style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 0.7rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);"><i class="fa-solid fa-check"></i> ${match.scoreTeam1 ?? 0} x ${match.scoreTeam2 ?? 0}</span>` : ''}
            <span class="toca-ai-mini-badge ${(Array.isArray(match.tocaAiUsers) && match.tocaAiUsers.includes(this.currentUser.id)) ? 'active' : ''}" onclick="event.stopPropagation(); window.marcaApp.toggleMatchTocaAi('${match.id}')" title="Toca Aí! (Kudos da Pelada)">
              <span class="toca-hand">✋</span> ${match.tocaAiCount || (Array.isArray(match.tocaAiUsers) ? match.tocaAiUsers.length : 0)}
            </span>
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
      const response = await fetch(API_BASE_URL + "/api/partidas", {
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
    this.renderChecklist(match);
    this.updateModalActions(match);
    this.renderMatchResenhaUI(match);

    modal.classList.add("active");
  }

  closeMatchDetails() {
    const modal = document.getElementById("match-details-modal");
    if (modal) modal.classList.remove("active");
  }

  renderChecklist(match) {
    const container = document.getElementById("modal-checklist-items");
    const statusEl = document.getElementById("modal-checklist-status");
    if (!container || !statusEl) return;

    const items = match.checklist || [];
    if (items.length === 0) {
      container.innerHTML = `<p style="font-size: 0.8rem; color: #64748b; margin: 0.5rem 0;">Nenhum material listado para esta partida.</p>`;
      statusEl.className = "checklist-status-badge pronto";
      statusEl.textContent = "Sem pendências";
      return;
    }

    const missingEssential = items.filter(it => it.isEssential && !it.assignedTo);

    if (missingEssential.length === 0) {
      statusEl.className = "checklist-status-badge pronto";
      statusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Materiais Essenciais Prontos!`;
    } else {
      statusEl.className = "checklist-status-badge pendente";
      statusEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Faltam ${missingEssential.length} essenciais`;
    }

    container.innerHTML = items.map(item => {
      const isClaimed = !!item.assignedTo;
      const isClaimedByMe = item.assignedTo === this.currentUser.id;

      let actionHtml = '';
      if (isClaimedByMe) {
        actionHtml = `
          <button type="button" class="btn-release-item" onclick="window.marcaApp.toggleChecklistItem('${match.id}', '${item.id}', 'release')">
            <i class="fa-solid fa-xmark"></i> Não vou levar
          </button>
        `;
      } else if (isClaimed) {
        actionHtml = `
          <span class="badge-assigned-other">
            <i class="fa-solid fa-circle-check"></i> ${item.assignedName ? item.assignedName.split(" ")[0] : 'Confirmado'}
          </span>
        `;
      } else {
        actionHtml = `
          <button type="button" class="btn-claim-item" onclick="window.marcaApp.toggleChecklistItem('${match.id}', '${item.id}', 'claim')">
            <i class="fa-solid fa-hand-holding-hand"></i> Eu Levo!
          </button>
        `;
      }

      const statusText = isClaimed
        ? `Garantido por: <strong>${item.assignedName}</strong>`
        : `<span style="color: #b45309;">Ninguém assumiu ainda ${item.isEssential ? '<strong>(Essencial!)</strong>' : ''}</span>`;

      return `
        <div class="checklist-item ${isClaimed ? 'claimed' : ''}">
          <div class="checklist-item-left">
            <div class="checklist-item-icon">
              <i class="fa-solid ${item.icon || 'fa-box'}"></i>
            </div>
            <div class="checklist-item-info">
              <span class="checklist-item-name">
                ${item.name}
                ${item.isEssential ? '<span style="font-size: 0.65rem; background: #fee2e2; color: #b91c1c; padding: 1px 5px; border-radius: 4px; font-weight: 700;">Essencial</span>' : ''}
              </span>
              <span class="checklist-item-status">${statusText}</span>
            </div>
          </div>
          <div>${actionHtml}</div>
        </div>
      `;
    }).join("");
  }

  async toggleChecklistItem(matchId, itemId, action, customName = null) {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) return;

    match.checklist = match.checklist || [];

    if (action === "claim") {
      const item = match.checklist.find(i => i.id === itemId);
      if (item) {
        item.assignedTo = this.currentUser.id;
        item.assignedName = this.currentUser.name;
        this.showToast(`🎒 Valeu! Você vai levar: ${item.name}`);
      }
    } else if (action === "release") {
      const item = match.checklist.find(i => i.id === itemId);
      if (item) {
        item.assignedTo = null;
        item.assignedName = null;
        this.showToast("Material liberado para outro atleta levar.");
      }
    } else if (action === "add" && customName) {
      match.checklist.push({
        id: "item-" + Date.now(),
        name: customName,
        icon: "fa-box",
        isEssential: false,
        assignedTo: this.currentUser.id,
        assignedName: this.currentUser.name
      });
      this.showToast(`🎒 Material "${customName}" adicionado e assumido por você!`);
    }

    this.saveLocalCache();
    this.renderChecklist(match);
    this.renderSidebarMatches();

    // Sincroniza com a API SQLite
    try {
      await fetch(`${API_BASE_URL}/api/partidas/${matchId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonPayload({
          action,
          itemId,
          userId: this.currentUser.id,
          userName: this.currentUser.name,
          customName
        })
      });
    } catch (e) {
      console.log("Sincronização offline do checklist.");
    }
  }

  promptAddChecklistItem() {
    const name = prompt("Qual material você quer levar ou solicitar para a partida? (ex: Caixa de Gelo, Apito, Calibrador):");
    if (name && name.trim()) {
      this.toggleChecklistItem(this.selectedMatchId, null, "add", name.trim());
    }
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
      const response = await fetch(`${API_BASE_URL}/api/partidas/${matchId}/participar`, {
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
      const response = await fetch(`${API_BASE_URL}/api/partidas/${matchId}/sair`, {
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
    const isRadar = vagasRestantes <= 2 && vagasRestantes > 0;

    let message = "";
    if (isRadar) {
      message += "🚨 *RADAR FALTA " + vagasRestantes + " - CHAMADA DE EMERGÊNCIA!* 🚨\n";
      message += "Galera, estamos precisando com urgência de atleta(s) para fechar o racha hoje!\n\n";
    } else {
      message += "⚽ *MARCA AÍ! - BORA PRO JOGO?* ⚽\n\n";
    }

    message += "🏆 *" + match.title.toUpperCase() + "* (" + match.sport + ")\n";
    message += "📅 *Quando:* " + match.date + " às " + match.time + "\n";
    message += "📍 *Onde:* " + match.venue + " (" + (match.address || 'Brasília - DF') + ")\n";
    message += "👥 *Vagas Restantes:* " + (vagasRestantes > 0 ? (vagasRestantes + " vaga(s) aberta(s)!") : "Lotado (Lista de Espera)") + "\n";
    message += "🌳 *Acesso:* " + (match.courtType || "Quadra Pública / Gratuito") + "\n\n";

    if (match.checklist && match.checklist.length > 0) {
      message += "🎒 *Checklist de Materiais:*\n";
      match.checklist.forEach(it => {
        message += " • " + it.name + ": " + (it.assignedName ? ("✅ (" + it.assignedName.split(" ")[0] + ")") : "⚠️ *Falta alguém levar!*") + "\n";
      });
      message += "\n";
    }

    message += "👉 *Confirme sua presença no racha:* https://marca-ai-kappa.vercel.app/";

    const url = "https://api.whatsapp.com/send?text=" + encodeURIComponent(message);
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

    // Atualiza contadores Strava no Perfil
    const gamesCountEl = document.getElementById("profile-games-count");
    const crownsCountEl = document.getElementById("profile-crowns-count");
    const tocaCountEl = document.getElementById("profile-toca-ai-count");

    // Total de partidas participadas
    const userMatchesCount = this.matches.filter(m => 
      Array.isArray(m.players) && m.players.some(p => p.id === this.currentUser.id || p.name === this.currentUser.name)
    ).length;

    // Total de Toca Aí! recebidos
    let totalToca = 0;
    this.matches.forEach(m => {
      const isParticipant = Array.isArray(m.players) && m.players.some(p => p.id === this.currentUser.id || p.name === this.currentUser.name);
      if (isParticipant || m.organizerId === this.currentUser.id) {
        totalToca += (m.tocaAiCount || (Array.isArray(m.tocaAiUsers) ? m.tocaAiUsers.length : 0));
      }
    });

    // Quantas quadras onde o usuário é a Lenda
    let crownsCount = 0;
    this.publicCourts.forEach(c => {
      const lb = this.getCourtLeaderboard(c.id);
      if (lb.legend && (lb.legend.name.includes("(Você)") || lb.legend.name.toLowerCase() === this.currentUser.name.toLowerCase())) {
        crownsCount++;
      }
    });

    if (gamesCountEl) gamesCountEl.textContent = userMatchesCount;
    if (crownsCountEl) crownsCountEl.textContent = `👑 ${crownsCount}`;
    if (tocaCountEl) tocaCountEl.textContent = `✋ ${totalToca}`;

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

  // ===========================================================================
  // 10. STRAVA BENCHMARK: LENDA DA QUADRA & LEADERBOARD (SEGMENTOS)
  // ===========================================================================
  getCourtLeaderboard(courtId) {
    const court = this.publicCourts.find(c => c.id === courtId);
    if (!court) return { court: null, legend: null, ranking: [], userMatches: 0, diffToLead: 1 };

    // Partidas jogadas nesta quadra
    const courtMatches = this.matches.filter(m => {
      if (m.courtId && m.courtId === courtId) return true;
      if (m.venue && court.venue && m.venue.toLowerCase().includes(court.venue.toLowerCase().substring(0, 15))) return true;
      return false;
    });

    const playerCounts = {};

    // 1. Dados de histórico inicial
    const seed = this.courtHistorySeed[courtId] || [];
    seed.forEach(item => {
      playerCounts[item.name] = {
        name: item.name,
        avatar: item.avatar,
        role: item.role,
        matches: item.matches
      };
    });

    // 2. Incrementa com as partidas cadastradas no app
    courtMatches.forEach(match => {
      const players = match.players || [];
      players.forEach(p => {
        const pName = p.name || "Peladeiro";
        const isUser = p.id === this.currentUser.id || pName.toLowerCase() === this.currentUser.name.toLowerCase();
        const effectiveName = isUser ? `${this.currentUser.name} (Você)` : pName;
        if (!playerCounts[effectiveName]) {
          playerCounts[effectiveName] = {
            name: effectiveName,
            avatar: p.name ? p.name.substring(0, 2).toUpperCase() : "AT",
            role: p.role || "Jogador",
            matches: 0
          };
        }
        playerCounts[effectiveName].matches += 1;
      });
    });

    const ranking = Object.values(playerCounts).sort((a, b) => b.matches - a.matches);
    const legend = ranking.length > 0 ? ranking[0] : null;

    const userEntry = ranking.find(r => r.name.includes("(Você)") || r.name.toLowerCase() === this.currentUser.name.toLowerCase());
    const userMatches = userEntry ? userEntry.matches : 0;
    const diffToLead = legend ? Math.max(1, (legend.matches - userMatches) + (legend === userEntry ? 0 : 1)) : 1;

    return { court, legend, ranking, userMatches, diffToLead };
  }

  openCourtLeaderboard(courtId) {
    const lb = this.getCourtLeaderboard(courtId);
    if (!lb || !lb.court) return;

    this.currentLeaderboardCourtId = courtId;
    const modal = document.getElementById("court-leaderboard-modal");
    if (!modal) return;

    document.getElementById("leaderboard-court-title").textContent = lb.court.name;
    document.getElementById("leaderboard-court-region").textContent = lb.court.region;

    // Render Hero (Lenda da Quadra Atual)
    const heroBox = document.getElementById("leaderboard-hero-box");
    if (heroBox) {
      if (lb.legend) {
        heroBox.innerHTML = `
          <div class="legend-avatar-wrapper">
            <i class="fa-solid fa-crown legend-crown-icon"></i>
            <div class="user-avatar">${lb.legend.avatar}</div>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; margin: 4px 0 2px;">${lb.legend.name}</h3>
          <div style="font-size: 0.775rem; color: #f59e0b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            👑 Lenda da Quadra • Dono da Casa
          </div>
          <p style="font-size: 0.8rem; color: #94a3b8; margin: 6px 0 0;">
            <strong>${lb.legend.matches}</strong> partidas disputadas nesta quadra pública
          </p>
        `;
      } else {
        heroBox.innerHTML = `
          <div class="user-avatar" style="margin: 0 auto 0.5rem;">?</div>
          <h3 style="font-size: 1.1rem; font-weight: 800; color: #ffffff;">Seja a Primeira Lenda!</h3>
          <p style="font-size: 0.8rem; color: #94a3b8;">Nenhum racha registrado ainda nesta quadra pública.</p>
        `;
      }
    }

    // Progresso do Usuário
    const progressBox = document.getElementById("leaderboard-user-progress");
    if (progressBox) {
      const isUserLegend = lb.legend && (lb.legend.name.includes("(Você)") || lb.legend.name.toLowerCase() === this.currentUser.name.toLowerCase());
      if (isUserLegend) {
        progressBox.innerHTML = `
          <div style="font-size: 1.35rem; color: #f59e0b;"><i class="fa-solid fa-trophy"></i></div>
          <div>
            <strong style="color: #f59e0b;">Você é a Lenda Oficial desta Quadra!</strong>
            <p style="margin: 2px 0 0; font-size: 0.75rem; color: #94a3b8;">Você lidera o pódio com ${lb.userMatches} partidas jogadas aqui.</p>
          </div>
        `;
      } else {
        progressBox.innerHTML = `
          <div style="font-size: 1.35rem; color: var(--primary);"><i class="fa-solid fa-person-running"></i></div>
          <div>
            <strong style="color: #ffffff;">Seu Progresso: ${lb.userMatches} partida(s) jogada(s) aqui</strong>
            <p style="margin: 2px 0 0; font-size: 0.75rem; color: #94a3b8;">Faltam <strong>${lb.diffToLead}</strong> partidas para você assumir a coroa de Lenda da Quadra!</p>
          </div>
        `;
      }
    }

    // Lista Top 5
    const listEl = document.getElementById("leaderboard-list-container");
    if (listEl) {
      if (lb.ranking.length === 0) {
        listEl.innerHTML = `<p style="font-size: 0.8rem; color: #64748b; text-align: center; padding: 1rem 0;">Nenhum peladeiro ranqueado ainda.</p>`;
      } else {
        const rankBadges = ["🥇", "🥈", "🥉", "4º", "5º"];
        listEl.innerHTML = lb.ranking.slice(0, 5).map((player, idx) => {
          const isUser = player.name.includes("(Você)") || player.name.toLowerCase() === this.currentUser.name.toLowerCase();
          const rankClass = idx === 0 ? "rank-1" : idx === 1 ? "rank-2" : idx === 2 ? "rank-3" : "rank-other";
          return `
            <div class="leaderboard-item ${rankClass} ${isUser ? 'is-current-user' : ''}">
              <div class="leaderboard-rank-badge">${rankBadges[idx] || (idx + 1) + 'º'}</div>
              <div class="leaderboard-player-info">
                <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.75rem;">${player.avatar}</div>
                <div>
                  <div style="font-size: 0.85rem; font-weight: 700; color: #ffffff;">${player.name}</div>
                  <div style="font-size: 0.7rem; color: #94a3b8;">${player.role}</div>
                </div>
              </div>
              <div class="leaderboard-matches-count">
                ${player.matches} ${player.matches === 1 ? 'partida' : 'partidas'}
              </div>
            </div>
          `;
        }).join("");
      }
    }

    modal.classList.add("active");
  }

  closeCourtLeaderboard() {
    const modal = document.getElementById("court-leaderboard-modal");
    if (modal) modal.classList.remove("active");
  }

  createMatchAtCurrentLeaderboardCourt() {
    const courtId = this.currentLeaderboardCourtId;
    this.closeCourtLeaderboard();
    if (courtId) {
      this.openCreateModalWithPreset(courtId);
    } else {
      this.openCreateModal();
    }
  }

  // ===========================================================================
  // 11. STRAVA BENCHMARK: TOCA AÍ! ✋ (KUDOS) & SÚMULA / RESENHA PÓS-JOGO
  // ===========================================================================
  renderMatchResenhaUI(match) {
    const container = document.getElementById("modal-resenha-container");
    const btnToca = document.getElementById("modal-btn-toca-ai");
    const tocaCountEl = document.getElementById("modal-toca-ai-count");
    const btnResenhaText = document.getElementById("modal-btn-resenha-text");

    const tocaUsers = Array.isArray(match.tocaAiUsers) ? match.tocaAiUsers : [];
    const hasTocado = tocaUsers.includes(this.currentUser.id);
    const count = match.tocaAiCount || tocaUsers.length || 0;

    if (btnToca) {
      btnToca.classList.toggle("active", hasTocado);
    }
    if (tocaCountEl) {
      tocaCountEl.textContent = count;
    }
    if (btnResenhaText) {
      btnResenhaText.textContent = match.status === 'completed' ? 'Editar Súmula' : 'Súmula & Placar';
    }

    if (!container) return;

    if (match.status === 'completed') {
      container.innerHTML = `
        <div class="match-resenha-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
            <span style="font-size: 0.725rem; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 0.5px;">
              <i class="fa-solid fa-circle-check"></i> Súmula Final do Racha
            </span>
            <span style="font-size: 0.725rem; color: #94a3b8;">Partida Encerrada</span>
          </div>
          <div class="resenha-scoreboard">
            <div class="team-score-block">
              <div class="team-score-name">${match.team1Name || 'Time 1'}</div>
              <div class="team-score-digits">${match.scoreTeam1 ?? 0}</div>
            </div>
            <div class="scoreboard-vs">X</div>
            <div class="team-score-block">
              <div class="team-score-name">${match.team2Name || 'Time 2'}</div>
              <div class="team-score-digits">${match.scoreTeam2 ?? 0}</div>
            </div>
          </div>
          ${(match.mvpPlayer || match.bestGk) ? `
          <div class="resenha-highlights-grid">
            ${match.mvpPlayer ? `
            <div class="resenha-highlight-pill">
              <span class="highlight-icon">🌟</span>
              <div>
                <div class="highlight-label">Craque do Jogo</div>
                <div class="highlight-player">${match.mvpPlayer}</div>
              </div>
            </div>` : ''}
            ${match.bestGk ? `
            <div class="resenha-highlight-pill">
              <span class="highlight-icon">🧤</span>
              <div>
                <div class="highlight-label">Paredão do Dia</div>
                <div class="highlight-player">${match.bestGk}</div>
              </div>
            </div>` : ''}
          </div>` : ''}
          ${match.resenhaNotes ? `
          <div class="resenha-quote">
            <i class="fa-solid fa-quote-left" style="opacity: 0.4; margin-right: 4px;"></i>
            ${match.resenhaNotes}
          </div>` : ''}
        </div>
      `;
    } else {
      container.innerHTML = "";
    }
  }

  toggleCurrentMatchTocaAi() {
    if (!this.selectedMatchId) return;
    this.toggleMatchTocaAi(this.selectedMatchId);
  }

  async toggleMatchTocaAi(matchId) {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) return;

    if (!Array.isArray(match.tocaAiUsers)) {
      match.tocaAiUsers = [];
    }

    const userId = this.currentUser.id;
    const userIndex = match.tocaAiUsers.indexOf(userId);
    let hasTocado = false;

    if (userIndex > -1) {
      match.tocaAiUsers.splice(userIndex, 1);
      hasTocado = false;
    } else {
      match.tocaAiUsers.push(userId);
      hasTocado = true;
    }

    match.tocaAiCount = match.tocaAiUsers.length;
    this.saveLocalCache();
    this.renderSidebarMatches();

    if (this.selectedMatchId === matchId) {
      this.renderMatchResenhaUI(match);
      const btn = document.getElementById("modal-btn-toca-ai");
      if (btn) {
        btn.classList.add("animating");
        setTimeout(() => btn.classList.remove("animating"), 400);
      }
    }

    if (hasTocado) {
      this.showToast("✋ Toca aí! Você bateu na mão da galera desta pelada!");
    } else {
      this.showToast("Toca aí removido.");
    }

    try {
      await fetch(`${API_BASE_URL}/api/partidas/${matchId}/toca-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonPayload({ userId })
      });
    } catch (e) {
      console.log("Offline mode - Toca Aí salvo localmente");
    }
  }

  openResenhaModal() {
    const match = this.matches.find(m => m.id === this.selectedMatchId);
    if (!match) return;

    const modal = document.getElementById("resenha-modal");
    if (!modal) return;

    document.getElementById("resenha-team1-name").value = match.team1Name || "Time Colete";
    document.getElementById("resenha-team2-name").value = match.team2Name || "Sem Colete";
    document.getElementById("resenha-team1-score").value = match.scoreTeam1 ?? 0;
    document.getElementById("resenha-team2-score").value = match.scoreTeam2 ?? 0;
    document.getElementById("resenha-notes-input").value = match.resenhaNotes || "";

    // Popular dropdowns com jogadores confirmados
    const mvpSelect = document.getElementById("resenha-mvp-select");
    const gkSelect = document.getElementById("resenha-gk-select");
    const players = match.players || [];

    const optionsHtml = '<option value="">Selecione o destaque...</option>' + 
      players.map(p => `<option value="${p.name}">${p.name} (${p.role})</option>`).join("");

    if (mvpSelect) {
      mvpSelect.innerHTML = optionsHtml;
      mvpSelect.value = match.mvpPlayer || "";
    }
    if (gkSelect) {
      gkSelect.innerHTML = optionsHtml;
      gkSelect.value = match.bestGk || "";
    }

    modal.classList.add("active");
  }

  closeResenhaModal() {
    const modal = document.getElementById("resenha-modal");
    if (modal) modal.classList.remove("active");
  }

  async submitResenha(e) {
    e.preventDefault();
    const match = this.matches.find(m => m.id === this.selectedMatchId);
    if (!match) return;

    const team1Name = document.getElementById("resenha-team1-name").value.trim() || "Time 1";
    const team2Name = document.getElementById("resenha-team2-name").value.trim() || "Time 2";
    const scoreTeam1 = parseInt(document.getElementById("resenha-team1-score").value, 10) || 0;
    const scoreTeam2 = parseInt(document.getElementById("resenha-team2-score").value, 10) || 0;
    const mvpPlayer = document.getElementById("resenha-mvp-select").value;
    const bestGk = document.getElementById("resenha-gk-select").value;
    const notes = document.getElementById("resenha-notes-input").value.trim();

    match.status = 'completed';
    match.team1Name = team1Name;
    match.team2Name = team2Name;
    match.scoreTeam1 = scoreTeam1;
    match.scoreTeam2 = scoreTeam2;
    match.mvpPlayer = mvpPlayer;
    match.bestGk = bestGk;
    match.resenhaNotes = notes;

    this.saveLocalCache();
    this.closeResenhaModal();
    this.renderSidebarMatches();
    this.renderMatchResenhaUI(match);
    this.showToast("🏆 Súmula e placar do racha salvos com sucesso!");

    try {
      await fetch(`${API_BASE_URL}/api/partidas/${match.id}/resenha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonPayload({
          scoreTeam1,
          scoreTeam2,
          team1Name,
          team2Name,
          mvpPlayer,
          bestGk,
          notes
        })
      });
    } catch (err) {
      console.log("Offline mode - Resenha salva localmente");
    }
  }

}

function jsonPayload(obj) {
  return JSON.stringify(obj);
}

document.addEventListener("DOMContentLoaded", () => {
  window.marcaApp = new MarcaAiApp();
});
