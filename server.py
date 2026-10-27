import http.server
import socketserver
import json
import os
import urllib.parse
import db

PORT = 8000
HOST = "127.0.0.1"
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Inicializa o banco de dados SQLite caso ainda não exista
db.init_db()

class MarcaAiHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def _send_json(self, data, status=200):
        response_bytes = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path == "/api/partidas":
            try:
                partidas = db.get_all_partidas()
                self._send_json(partidas)
            except Exception as e:
                self._send_json({"error": str(e)}, status=500)
            return

        # Serve arquivos estáticos normalmente (index.html, app.js, app.css, etc.)
        return super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode("utf-8")) if post_data else {}

        # Criar nova partida
        if path == "/api/partidas":
            try:
                p_id = db.create_partida(data)
                self._send_json({"success": True, "id": p_id}, status=201)
            except Exception as e:
                self._send_json({"error": str(e)}, status=500)
            return

        # Participar de partida (/api/partidas/<id>/participar)
        if path.startswith("/api/partidas/") and path.endswith("/participar"):
            parts = path.strip("/").split("/")
            partida_id = parts[2]
            user = data.get("user")
            as_waitlist = data.get("asWaitlist", False)
            try:
                ok, msg = db.join_partida(partida_id, user, as_waitlist)
                self._send_json({"success": ok, "message": msg}, status=200 if ok else 400)
            except Exception as e:
                self._send_json({"error": str(e)}, status=500)
            return

        # Sair de partida (/api/partidas/<id>/sair)
        if path.startswith("/api/partidas/") and path.endswith("/sair"):
            parts = path.strip("/").split("/")
            partida_id = parts[2]
            user_id = data.get("userId")
            try:
                ok, promoted = db.leave_partida(partida_id, user_id)
                self._send_json({"success": ok, "promotedUser": promoted}, status=200 if ok else 400)
            except Exception as e:
                self._send_json({"error": str(e)}, status=500)
            return

        self._send_json({"error": "Endpoint não encontrado"}, status=404)

    def do_DELETE(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path.startswith("/api/partidas/"):
            parts = path.strip("/").split("/")
            partida_id = parts[2]
            try:
                db.delete_partida(partida_id)
                self._send_json({"success": True, "message": "Partida removida"})
            except Exception as e:
                self._send_json({"error": str(e)}, status=500)
            return

        self._send_json({"error": "Endpoint não encontrado"}, status=404)

def run_server():
    server_address = (HOST, PORT)
    try:
        httpd = socketserver.TCPServer(server_address, MarcaAiHandler)
    except OSError:
        # Se a 8000 estiver ocupada, tenta 8080
        alt_port = 8080
        httpd = socketserver.TCPServer((HOST, alt_port), MarcaAiHandler)
        print(f"Porta {PORT} ocupada, iniciando na porta {alt_port}")
        
    print(f"\n==================================================================")
    print(f"🚀 Servidor Marca Aí! iniciado com SQLite:")
    print(f"👉 Acesse: http://{HOST}:{httpd.server_address[1]}")
    print(f"📁 Banco de dados SQLite ativo: marca_ai.db (Sem exemplos falsos)")
    print(f"==================================================================\n")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
