import {BT_SERVICE, BT_WRITE} from './jsbt-setting.mjs'

const txt_rawdata = document.getElementById('txt_rawdata')
const btn_senddata = document.getElementById('btn_senddata')
const txt_error = document.getElementById('txt_error')
const txt_debug = document.getElementById('txt_debug') 

export async function init() {
	txt_rawdata.innerHTML = `Hallo Bluetooth\ntext ini dikirimkan ke printer\n\n\n`

	btn_senddata.addEventListener('click', (evt)=>{
		btn_senddata_click(evt)
	})
}

async function btn_senddata_click(evt) {
	try {
		txt_error.innerHTML = "";
		if (window.$devHandle==null) {
			window.$devHandle = await navigator.bluetooth.requestDevice({ filters: [{ services: [BT_SERVICE]}] })
			txt_debug.innerHTML = `Selected Device: ${window.$devHandle.name}`
		} else {
			txt_debug.innerHTML = `Already Paired: ${window.$devHandle.name}`
		}

		var printdata = txt_rawdata.value
		
		var server = await window.$devHandle.gatt.connect()
		var service = await server.getPrimaryService(BT_SERVICE)
		var channel = await service.getCharacteristic(BT_WRITE)

		await channel.writeValueWithResponse(new TextEncoder('utf-8').encode(printdata))
		

	} catch (err) {
		txt_error.innerHTML = err.message;
	} finally {
		if (window.$devHandle!=null) {
			await window.$devHandle.gatt.disconnect();
		}
	}
}