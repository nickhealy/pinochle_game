import queue
import json
import uuid
from flask import request, Flask, Response, render_template, jsonify

app = Flask(__name__, template_folder="game/dist", static_folder="game/dist", static_url_path="")


class MessageAnnouncer:
    def __init__(self):
        self.listeners = dict()

    def listen(self, room_id):
        q = queue.Queue(maxsize=5)
        self.listeners[room_id] = q
        return q

    def announce(self, room_id, msg):
        try:
            self.listeners[room_id].put_nowait(msg)
        except queue.Full:
            del self.listeners[room_id]


announcer = MessageAnnouncer()


def format_sse(data: str, event='message') -> str:
    msg = f'data: {data}\n\n'
    if event is not None:
        msg = f'event: {event}\n{msg}'
    return msg



@app.route('/ping', methods=['GET'])
def hello_world():
    return 'pong'


@app.post('/rooms/<room_id>/join')
def join_room(room_id):
    req_data = request.json
    peer_id = req_data.get('peer_id')
    name = req_data.get('name')
    if peer_id is not None:
        data = json.dumps({"event": 'player_join_request', 'peer_id': peer_id, 'name': name})
        msg = format_sse(data)
        announcer.announce(room_id, msg=msg)
        return {"room_id": room_id}, 200
    return 400, "MISSING_PEER_ID"


@app.route('/listen/<room_id>')
def listen(room_id):

    def stream():
        yield "CONNECTED"
        messages = announcer.listen(room_id=room_id)  # returns a queue.Queue
        while True:
            msg = messages.get()  # blocks until a new message arrives
            yield msg

    return Response(stream(), mimetype='text/event-stream')


room_registry = dict()



@app.post('/rooms/create')
def create_room():
    req_data = request.json
    room_id = '1234'
    own_peer_id = req_data.get('own_peer_id')
    if own_peer_id is not None:
        link = f'http://localhost:5000/game/{room_id}-{own_peer_id}'
        room_registry[room_id] = (room_id, own_peer_id)
        resp = jsonify(room_id=room_id, link=link)
        resp.set_cookie('host_token', '12345', httponly=True)
        return resp
    return 400


@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(host='192.168.1.246', port=5001, debug=True)
