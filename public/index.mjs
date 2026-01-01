const btnConnect = document.getElementById('btnConnect')
const btnTestPrint = document.getElementById('btnTestPrint')
const txtData = document.getElementById('txtData')
const optProto = document.getElementById('optProto')


export const BT_SERVICE = '000018f0-0000-1000-8000-00805f9b34fb';
export const BT_WRITE = '00002af1-0000-1000-8000-00805f9b34fb';

export default class program {
	
	async main() {
		const self = this

		txtData.value = `SIZE 38 mm,15 mm
GAP 3 mm,0
REFERENCE 0,0
DIRECTION 0
CLS
BARCODE 10,10,"128",80,1,0,2,4,"TM34567890123"
PRINT 1`

		btnConnect.addEventListener('click', (evt)=>{
			btnConnect_click(self, evt)
		})

		btnTestPrint.addEventListener('click', (evt)=>{
			btnTestPrint_click(self, evt)
		})




		await program_main(self)
	}
}


async function program_main(self) {
	console.log('starting program')

	const img = document.getElementById('imgLogo');


	const canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;

	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);

	// Ambil pixel RGBA
	window['imageDataLogo'] = ctx.getImageData(0, 0, canvas.width, canvas.height);

}



async function btnConnect_click(self, evt) {
	console.log('Connecting to BT Printer')

	// cek dengan chrome://bluetooth-internals
	
	// Label:
	// cari RPP02N-7D90_Ble
	// service: 00001101-0000-1000-8000-00805f9b34fb


	// Receipt
	// cari RPP02N-7D90_Ble
	// service: 00001101-0000-1000-8000-00805f9b34fb




	const BT_SERVICES = ['0000fff0-0000-1000-8000-00805f9b34fb', '0000eee0-0000-1000-8000-00805f9b34fb'];

	try {
		

		if (window.writeChar==null) {
			const device = await navigator.bluetooth.requestDevice({filters:[{ name: 'RPP02N-7D91_Ble' }], optionalServices:BT_SERVICES})
			// const device = await navigator.bluetooth.requestDevice({optionalServices:BT_SERVICES, acceptAllDevices:true })
			const server = await device.gatt.connect();
			await new Promise(r => setTimeout(r, 500))

			console.log('connected')	

			
			for (const uuid of BT_SERVICES) {
				try {
					const service = await server.getPrimaryService(uuid)
					const chars = await service.getCharacteristics()

					window.writeChar = chars.find(c =>
						c.properties.writeWithoutResponse || c.properties.write
					)

					if (window.writeChar) break
				} catch (err) {
					console.log(e)
				}
			}

			if (!window.writeChar) {
				console.error('ESC/POS write characteristic not found')
				return
			}

			console.log(window.writeChar)
		} else {
			console.log('Already Connected')
		}



		


		

		// const encoder = new TextEncoder()
		// const tspl = `
		// 	SIZE 38 mm,35 mm
		// 	GAP 3 mm,0
		// 	REFERENCE 0,0
		// 	DIRECTION 0
		// 	CLS

		// 	BARCODE 10,10,"128",80,1,0,2,4,"TM34567890123"

		// 	PRINT 1
		// `
		// await writeChunks(writeChar, encoder.encode(tspl))


		await writeChunks(writeChar, escposText('TEST 1\nBARIS2\nBARIS3'))

	

	} catch (err) {
		console.log(err.message)
	}
	
}

function escposText(str) {
	const init = [0x1B, 0x40];
	const textBytes = Array.from(new TextEncoder().encode(str));
	const newline = [0x0A]; 
	return new Uint8Array([...init, ...textBytes, ...newline]);
}

async function writeChunks(char, data, size = 20) {
  for (let i = 0; i < data.length; i += size) {
    await char.writeValueWithoutResponse(
      data.slice(i, i + size)
    )
    await new Promise(r => setTimeout(r, 30))
  }
}


async function btnTestPrint_click(evt) {
	if (window.writeChar==null) {
		console.error('Printer not connected')
		return
	}

	const proto = optProto.value




	if (proto=='TSPL') {
		const encoder = new TextEncoder()
		const tspl = txtData.value
		console.log(tspl)
		await writeChunks(writeChar, encoder.encode(tspl))
	} else {

		const logoData = await getLogo()
		console.log(logoData)
		await writeChunks(writeChar, logoData)

		const text = escposText(txtData.value)
		console.log(text)
		await writeChunks(writeChar, text)
	}
}

function getDarkPixel(canvas, imageData, x, y, threshold = 128) {
	// // Return the pixels that will be printed black
	const idx = ((canvas.width * y) + x) * 4;
	const r = imageData[idx];
	const g = imageData[idx + 1];
	const b = imageData[idx + 2];

	// Konversi ke grayscale (luma)
	const gray = 0.299 * r + 0.587 * g + 0.114 * b;

	// Mapping: 1 = hitam (dot ON), 0 = putih (dot OFF)
	return gray < threshold ? 1 : 0;
}


async function getLogo(maxWidthDots = 384, threshold = 180) {
  const image = document.getElementById('imgLogo');

  const canvas = document.createElement('canvas');
  // resize agar sesuai lebar head printer
  const scale = Math.min(1, maxWidthDots / image.width);
  canvas.width = Math.floor(image.width * scale);
  canvas.height = Math.floor(image.height * scale);

  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  try {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    if (!imageData) throw new Error('No image to print!');

    const widthBytes = Math.ceil(canvas.width / 8);
    const height = canvas.height;

    // total panjang = header (8) + payload
    const printData = new Uint8Array(8 + widthBytes * height);

    // Header GS v 0
    printData[0] = 0x1D; // GS
    printData[1] = 0x76; // 'v'
    printData[2] = 0x30; // '0'
    printData[3] = 0x00; // mode normal
    printData[4] = widthBytes & 0xFF;       // xL
    printData[5] = (widthBytes >> 8) & 0xFF; // xH
    printData[6] = height & 0xFF;           // yL
    printData[7] = (height >> 8) & 0xFF;    // yH

    let offset = 8;

    // Loop baris
    for (let y = 0; y < height; y++) {
      for (let xb = 0; xb < widthBytes; xb++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          const x = xb * 8 + bit;
          if (x < canvas.width) {
            const pixel = getDarkPixel(canvas, imageData, x, y, threshold);
            if (pixel === 1) {
              byte |= (1 << (7 - bit));
            }
          }
        }
        printData[offset++] = byte;
      }
    }

    return printData;

  } catch (err) {
    throw err;
  }
}


// async function getLogo(maxWidthDots = 384, threshold = 180) {
// 	const image = document.getElementById('imgLogo');


// 	var canvas = document.createElement('canvas');
// 	canvas.width = image.width;
// 	canvas.height = image.height;

// 	var context = canvas.getContext("2d");
// 	context.drawImage(image, 0, 0, canvas.width, canvas.height);
// 	try {
// 		var imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
// 		if (imageData == null) {
// 			throw new Error('No image to print!');
// 		}

// 		var printData = new Uint8Array(canvas.width / 8 * canvas.height + 8);
// 		 var offset = 0;


// 		printData[0] = 29;  // Print raster bitmap
// 		printData[1] = 118; // Print raster bitmap
// 		printData[2] = 48; // Print raster bitmap
// 		printData[3] = 0;  // Normal 203.2 DPI
// 		printData[4] = canvas.width / 8; // Number of horizontal data bits (LSB)
// 		printData[5] = 0; // Number of horizontal data bits (MSB)
// 		printData[6] = canvas.height % 256; // Number of vertical data bits (LSB)
// 		printData[7] = canvas.height / 256;  // Number of vertical data bits (MSB)
// 		offset = 7;
		
// 		// Loop through image rows in bytes
// 		for (let i = 0; i < canvas.height; ++i) {
// 			for (let k = 0; k < canvas.width / 8; ++k) {
// 				let k8 = k * 8;
// 				//  Pixel to bit position mapping
// 				printData[++offset] = getDarkPixel(canvas, imageData, k8 + 0, i) * 128 + getDarkPixel(canvas, imageData, k8 + 1, i) * 64 +
// 							getDarkPixel(canvas, imageData, k8 + 2, i) * 32 + getDarkPixel(canvas, imageData, k8 + 3, i) * 16 +
// 							getDarkPixel(canvas, imageData, k8 + 4, i) * 8 + getDarkPixel(canvas, imageData, k8 + 5, i) * 4 +
// 							getDarkPixel(canvas, imageData, k8 + 6, i) * 2 + getDarkPixel(canvas, imageData, k8 + 7, i);
// 			}
// 		}

// 		return printData;

// 	} catch (err) {
// 		throw err;
// 	}

// }


