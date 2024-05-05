import {BT_SERVICE, BT_WRITE} from './jsbt-setting.mjs'

const btn_print_normal = document.getElementById('btn_print_normal')
const btn_print_bold = document.getElementById('btn_print_bold')
const btn_print_large = document.getElementById('btn_print_large')
const btn_linefeed = document.getElementById('btn_linefeed')
const btn_print_variasi = document.getElementById('btn_print_variasi')
const txt_error = document.getElementById('txt_error')
const txt_debug = document.getElementById('txt_debug') 
const txt_inputtext = document.getElementById('txt_inputtext')

export async function init() {
	btn_print_normal.addEventListener('click', (evt)=>{
		btn_print_normal_click(evt)
	})

	btn_print_bold.addEventListener('click', (evt)=>{
		btn_print_bold_click(evt)
	})


	btn_print_large.addEventListener('click', (evt)=>{
		btn_print_large_click(evt)
	})

	btn_linefeed.addEventListener('click', (evt)=>{
		btn_linefeed_click(evt)
	})

	btn_print_variasi.addEventListener('click', (evt)=>{
		btn_print_variasi_click(evt)
	})
}

async function btn_print_normal_click(evt) {
	try {
		var txttoprint = txt_inputtext.value
		var channel = await getPrinterChannel()
		var DATA = [
			'\x1B' + '\x40',   // initialize printer
			txttoprint,
			'\n\n\n'
		]

		var printdata = DATA.join('')
		await channel.writeValueWithResponse(new TextEncoder('utf-8').encode(printdata))
	} catch (err) {
		txt_error.innerHTML = err.message;
	} finally {
		if (window.$devHandle!=null) {
			await window.$devHandle.gatt.disconnect();
		}
	}
}

async function btn_print_bold_click(evt) {
	try {
		/*
		===format font===
		bit function 		value
							0 		1
		0 	font 			normal 	small
		1 	inverse 		cancel 	set
		2 	inversion 		cancel 	set
		3 	bold 			cancel 	set
		4 	double-height 	cancel 	set
		5 	double-width 	cancel 	set
		6 	underline 		cancel 	set
		7 	undefined

		contoh 
		huruf normal tebal  = 0001000  = \x08

		** catatan: tidak semua printer mendukung seluruh format
		            cek manual dari masing-masing printer

		*/


		var txttoprint = txt_inputtext.value
		var channel = await getPrinterChannel()
		var DATA = [
			'\x1b' + '\x40',   // initialize printer
			'\x1b' + '\x21' + '\x08',  // tebal
			txttoprint,
			'\n\n\n'
		]

		var printdata = DATA.join('')
		await channel.writeValueWithResponse(new TextEncoder('utf-8').encode(printdata))
		
	} catch (err) {
		txt_error.innerHTML = err.message;
	} finally {
		if (window.$devHandle!=null) {
			await window.$devHandle.gatt.disconnect();
		}
	}
}


async function btn_print_large_click(evt) {
	try {

		var txttoprint = txt_inputtext.value
		var channel = await getPrinterChannel()
		var DATA = [
			'\x1b' + '\x40',   // initialize printer
			'\x1d' + '\x21' + '\x10',  // lebar
			txttoprint,
			'\n\n\n',
		]
		
		var printdata = DATA.join('')
		await channel.writeValueWithResponse(new TextEncoder('utf-8').encode(printdata))
	} catch (err) {
		txt_error.innerHTML = err.message;
	} finally {
		if (window.$devHandle!=null) {
			await window.$devHandle.gatt.disconnect();
		}
	}	
}

async function btn_print_variasi_click(evt) {
	try {

		var txttoprint = txt_inputtext.value
		var channel = await getPrinterChannel()
		var DATA = [
			'\x1b' + '\x40',   // initialize printer
			'\x1d' + '\x21' + '\x10',  // lebar
			txttoprint,
			'\n\n',

			'\x1b' + '\x21' + '\x00',  // normal
			txttoprint + ' - normal',
			'\n',

			'\x1b' + '\x21' + '\x08',  // tebal
			txttoprint + ' - tebal',
			'\n',

			'\x1b' + '\x21' + '\x00',  // normal
			'\x1d' + '\x21' + '\x10',  // lebar 
			txttoprint + ' - lebar',
			'\n',

			'\x1b' + '\x21' + '\x08',  // normal
			'\x1d' + '\x21' + '\x10',  // lebar 
			txttoprint + ' - lebar tebal',

			'\n\n\n',
		]

		var printdata = DATA.join('')
		await channel.writeValueWithResponse(new TextEncoder('utf-8').encode(printdata))
	} catch (err) {
		txt_error.innerHTML = err.message;
	} finally {
		if (window.$devHandle!=null) {
			await window.$devHandle.gatt.disconnect();
		}
	}	
}

async function btn_linefeed_click(evt) {
	try {
		var channel = await getPrinterChannel()
		var DATA = [
			'\x0a' + '\x0d',   // LFCR
		]

		var printdata = DATA.join('')
		await channel.writeValueWithResponse(new TextEncoder('utf-8').encode(printdata))
	} catch (err) {
		txt_error.innerHTML = err.message;
	} finally {
		if (window.$devHandle!=null) {
			await window.$devHandle.gatt.disconnect();
		}
	}	
}



async function getPrinterChannel() {
	try {
		if (window.$devHandle==null) {
			window.$devHandle = await navigator.bluetooth.requestDevice({ filters: [{ services: [BT_SERVICE]}] })
			txt_debug.innerHTML = `Selected Device: ${window.$devHandle.name}`
		} else {
			txt_debug.innerHTML = `Already Paired: ${window.$devHandle.name}`
		}
		

		var server = await window.$devHandle.gatt.connect()
		var service = await server.getPrimaryService(BT_SERVICE)
		var channel = await service.getCharacteristic(BT_WRITE)

		return channel
	} catch (err) {
		throw err
	}	
}