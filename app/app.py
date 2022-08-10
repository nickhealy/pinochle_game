import queue
import json
import uuid
from flask import request, Flask, Response, render_template, jsonify

app = Flask(__name__)


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


@app.route('/game/<id>')
def game(id):
    host_token = request.cookies.get('host_token')
    print(host_token)
    data = {"is_host": 1 if host_token is not None else 0,
            "host_id": 'host-12345'}
    print(data['is_host'])
    return render_template('test_app/game.html', data=data)


@app.route('/ping', methods=['GET'])
def hello_world():
    return 'pong'


@app.post('/rooms/<room_id>/join')
def join_room(room_id):
    req_data = request.json
    peer_id = req_data.get('peer_id')
    if peer_id is not None:
        data = json.dumps({"event": 'player_join_request', 'peer_id': peer_id})
        msg = format_sse(data)
        announcer.announce(room_id, msg=msg)
        return {}, 200
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

# if __name__ == "__main__":
#     app.run(host='localhost', port=5001, debug=True)


@app.post('/rooms/create')
def create_room():
    req_data = request.json
    room_id = uuid.uuid4().int
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
    return render_template('test_app/index.html')
