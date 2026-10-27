import sqlite3
import os
import json

DB_FILE = os.path.join(os.path.dirname(__file__), "marca_ai.db")
SCHEMA_FILE = os.path.join(os.path.dirname(__file__), "schema.sql")

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_connection()
    with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()

def get_all_partidas():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM partidas ORDER BY created_at DESC
    """)
    rows = cursor.fetchall()
    
    partidas = []
    for row in rows:
        p_dict = dict(row)
        p_id = p_dict["id"]
        
        # Buscar participantes
        cursor.execute("""
            SELECT user_id as id, user_name as name, user_role as role, is_organizer, is_waitlist
            FROM participantes
            WHERE partida_id = ?
            ORDER BY joined_at ASC
        """, (p_id,))
        parts = cursor.fetchall()
        
        players = []
        waitlist = []
        for pt in parts:
            pt_dict = {
                "id": pt["id"],
                "name": pt["name"],
                "role": pt["role"],
                "isOrganizer": bool(pt["is_organizer"])
            }
            if pt["is_waitlist"]:
                waitlist.append(pt_dict)
            else:
                players.append(pt_dict)
                
        p_dict["players"] = players
        p_dict["waitlist"] = waitlist
        p_dict["maxPlayers"] = p_dict["max_players"]
        p_dict["courtType"] = p_dict["court_type"]
        p_dict["hasLighting"] = bool(p_dict["has_lighting"])
        p_dict["hasGoaliePerk"] = bool(p_dict["has_goalie_perk"])
        p_dict["organizerId"] = p_dict["organizer_id"]
        
        partidas.append(p_dict)
        
    conn.close()
    return partidas

def create_partida(data):
    conn = get_connection()
    cursor = conn.cursor()
    
    p_id = data.get("id") or f"match-{int(os.times().elapsed * 1000)}"
    
    try:
        lat = float(data.get("lat")) if data.get("lat") is not None and str(data.get("lat")).strip() != "" else -15.7985
    except (ValueError, TypeError):
        lat = -15.7985

    try:
        lng = float(data.get("lng")) if data.get("lng") is not None and str(data.get("lng")).strip() != "" else -47.9045
    except (ValueError, TypeError):
        lng = -47.9045
    
    cursor.execute("""
        INSERT INTO partidas (
            id, title, sport, category, date, time, venue, address,
            court_type, has_lighting, lat, lng, level, max_players,
            has_goalie_perk, organizer_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        p_id,
        data.get("title", "Pelada").strip() or "Partida",
        data.get("sport", "Futebol Society"),
        data.get("category", "futebol"),
        data.get("date", "Hoje"),
        data.get("time", "19:30"),
        data.get("venue", "Quadra Pública").strip() or "Quadra Pública",
        (data.get("address") or data.get("venue") or "Brasília - DF").strip(),
        data.get("courtType", "Quadra Pública"),
        1 if data.get("hasLighting", True) else 0,
        lat,
        lng,
        data.get("level", "Casual / Resenha"),
        int(data.get("maxPlayers", 14)),
        1 if data.get("hasGoaliePerk", False) else 0,
        data.get("organizerId", "usr-01")
    ))
    
    # Inserir o criador como primeiro participante confirmado
    creator = data.get("creator") or {
        "id": data.get("organizerId", "usr-01"),
        "name": "Organizador",
        "role": "Organizador"
    }
    cursor.execute("""
        INSERT INTO participantes (partida_id, user_id, user_name, user_role, is_organizer, is_waitlist)
        VALUES (?, ?, ?, ?, 1, 0)
    """, (p_id, creator["id"], creator["name"], creator.get("role", "Jogador")))
    
    conn.commit()
    conn.close()
    return p_id

def join_partida(partida_id, user, as_waitlist=False):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id FROM participantes WHERE partida_id = ? AND user_id = ?
    """, (partida_id, user["id"]))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        return False, "Usuário já participa desta partida."
        
    cursor.execute("""
        INSERT INTO participantes (partida_id, user_id, user_name, user_role, is_organizer, is_waitlist)
        VALUES (?, ?, ?, ?, 0, ?)
    """, (partida_id, user["id"], user["name"], user.get("role", "Jogador"), 1 if as_waitlist else 0))
    
    conn.commit()
    conn.close()
    return True, "Presença registrada!"

def leave_partida(partida_id, user_id):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT is_waitlist FROM participantes WHERE partida_id = ? AND user_id = ?
    """, (partida_id, user_id))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        return False, "Usuário não encontrado na partida."
        
    was_waitlist = row["is_waitlist"]
    
    cursor.execute("""
        DELETE FROM participantes WHERE partida_id = ? AND user_id = ?
    """, (partida_id, user_id))
    
    promoted_user = None
    if not was_waitlist:
        cursor.execute("""
            SELECT id, user_name FROM participantes
            WHERE partida_id = ? AND is_waitlist = 1
            ORDER BY joined_at ASC LIMIT 1
        """, (partida_id,))
        next_waitlist = cursor.fetchone()
        if next_waitlist:
            cursor.execute("""
                UPDATE participantes SET is_waitlist = 0 WHERE id = ?
            """, (next_waitlist["id"],))
            promoted_user = next_waitlist["user_name"]
            
    conn.commit()
    conn.close()
    return True, promoted_user

def delete_partida(partida_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM partidas WHERE id = ?", (partida_id,))
    cursor.execute("DELETE FROM participantes WHERE partida_id = ?", (partida_id,))
    conn.commit()
    conn.close()
    return True

if __name__ == "__main__":
    init_db()
    print("Banco de dados SQLite inicializado com sucesso em marca_ai.db.")
