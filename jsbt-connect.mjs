import {BT_SERVICE, BT_WRITE} from './jsbt-setting.mjs'

const btn_connect = document.getElementById('btn_connect')
const txt_error = document.getElementById('txt_error')
const txt_debug = document.getElementById('txt_debug') 

export async function init() {
	btn_connect.addEventListener('click', async (evt)=>{
		btn_connect_click(evt)
	})
}

async function btn_connect_click(evt) {
	try {
		txt_error.innerHTML = "";
		if (window.$devHandle==null) {
			window.$devHandle = await navigator.bluetooth.requestDevice({ filters: [{ services: [BT_SERVICE]}] })
			txt_debug.innerHTML = `Selected Device: ${window.$devHandle.name}`
		} else {
			txt_debug.innerHTML = `Already Paired: ${window.$devHandle.name}`
		}

	} catch (err) {
		txt_error.innerHTML = err.message;
	} finally {
		if (window.$devHandle!=null) {
			await window.$devHandle.gatt.disconnect();
		}
	}
	
}