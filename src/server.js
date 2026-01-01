import http from 'node:http';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __rootDirectory = path.join(__dirname, '..')

const PORT = 3000


const server = http.createServer((req, res) => {
	// 1. Tentukan file yang diminta (jika "/" maka buka index.html)
	let filePath = path.join(__rootDirectory, 'public', req.url === '/' ? 'index.html' : req.url);

	// 2. Dapatkan ekstensi file (html, css, js, dll)
	const extname = path.extname(filePath);
	let contentType = 'text/html';

	// 3. Tentukan tipe konten agar browser tidak bingung
	switch (extname) {
		case '.js': contentType = 'text/javascript'; break;
		case '.mjs': contentType = 'text/javascript'; break;
		case '.css': contentType = 'text/css'; break;
		case '.json': contentType = 'application/json'; break;
		case '.png': contentType = 'image/png'; break;
		case '.jpg': contentType = 'image/jpg'; break;
		case '.svg': contentType = 'image/svg+xml'; break;
	}

	// 4. Baca file dari folder public
	fs.readFile(filePath, (error, content) => {
		if (error) {
			if (error.code === 'ENOENT') {
				// File tidak ditemukan (404)
				res.writeHead(404);
				res.end('Maaf, halaman tidak ditemukan');
			} else {
				// Error server (500)
				res.writeHead(500);
				res.end(`Server Error: ${error.code}`);
			}
		} else {
			// Berhasil mengirim file
			res.writeHead(200, { 'Content-Type': contentType });
			res.end(content, 'utf-8');
		}
	});
});

server.listen(PORT, () => {
	console.log(`Serving http://localhost:${PORT}`);
});