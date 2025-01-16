<?php
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    }

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }

    header("Access-Control-Max-Age: 86400");
    exit(0);
}

header('Content-Type: application/json');

$host = 'localhost';
$db_name = 'event_in';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['message' => 'Connection Error: ' . $e->getMessage()]);
    die();
}

$method = $_SERVER['REQUEST_METHOD'];

$id = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM events WHERE id = ?");
            $stmt->execute([$id]);
            $event = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($event) {
                echo json_encode($event);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Event tidak ditemukan']);
            }
        } else {
            $stmt = $conn->query("SELECT * FROM events ORDER BY created_at DESC");
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($events);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));

        if (!$data->nama_event || !$data->deskripsi || !$data->tanggal || !$data->waktu_mulai || !$data->waktu_selesai) {
            http_response_code(400);
            echo json_encode(['message' => 'Ada field yang belum diisi']);
            break;
        }

        $sql = "INSERT INTO events (nama_event, deskripsi, tanggal, waktu_mulai, waktu_selesai, link_meet, berulang, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";

        try {
            $stmt = $conn->prepare($sql);
            $berulang = isset($data->berulang) ? (bool)$data->berulang : false;
            $stmt->execute([
                $data->nama_event,
                $data->deskripsi,
                $data->tanggal,
                $data->waktu_mulai,
                $data->waktu_selesai,
                $data->link_meet ?? null,
                $berulang ? 1 : 0
            ]);

            $event_id = $conn->lastInsertId();

            http_response_code(201);
            echo json_encode([
                'message' => 'Event berhasil dibuat',
                'id' => $event_id
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Error membuat event: ' . $e->getMessage()]);
        }
        break;


    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID tidak ditemukan']);
            break;
        }

        $data = json_decode(file_get_contents("php://input"));

        if (!$data->nama_event || !$data->deskripsi || !$data->tanggal || !$data->waktu_mulai || !$data->waktu_selesai) {
            http_response_code(400);
            echo json_encode(['message' => 'Ada field yang belum diisi']);
            break;
        }

        $sql = "UPDATE events 
                SET nama_event = ?, deskripsi = ?, tanggal = ?, waktu_mulai = ?, waktu_selesai = ?, link_meet = ?, berulang = ?, updated_at = NOW()
                WHERE id = ?";

        try {
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $data->nama_event,
                $data->deskripsi,
                $data->tanggal,
                $data->waktu_mulai,
                $data->waktu_selesai,
                $data->link_meet ?? null,
                $data->berulang ?? false,
                $id
            ]);

            if ($stmt->rowCount()) {
                echo json_encode(['message' => 'Event berhasil diperbarui']);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Event tidak ditemukan']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Error memperbarui event: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID tidak ditemukan']);
            break;
        }

        try {
            $stmt = $conn->prepare("DELETE FROM events WHERE id = ?");
            $stmt->execute([$id]);

            if ($stmt->rowCount()) {
                echo json_encode(['message' => 'Event berhasil dihapus']);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Event tidak ditemukan']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Error menghapus event: ' . $e->getMessage()]);
        }
        break;


    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
        break;
}
