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
			//window.$devHandle = await navigator.bluetooth.requestDevice({ filters: [{ services: [BT_SERVICE]}] })
			//window.$devHandle = await navigator.bluetooth.requestDevice({acceptAllDevices:true})
			//window.$devHandle = await navigator.bluetooth.requestDevice({ filters: [{ name: ['MPT-II']}] })
			
			window.$devHandle = await navigator.bluetooth.requestDevice({optionalServices:[BT_SERVICE], acceptAllDevices:true })
			
			txt_debug.innerHTML = `Selected Device: ${window.$devHandle.name}`
		} else {
			txt_debug.innerHTML = `Already Paired: ${window.$devHandle.name}`
		}

console.log(window.$devHandle)

		var server = await window.$devHandle.gatt.connect()
		var service = await server.getPrimaryService(BT_SERVICE)
		var characteristics = await service.getCharacteristics()
		var used_character_uuid = null;
		for (var character of characteristics) {
			if (character.properties.write) {
				used_character_uuid = character.uuid
				break;
			}
		}

		if (used_character_uuid!=null) {
			var channel = await service.getCharacteristic(used_character_uuid)
			await channel.writeValueWithResponse(new TextEncoder('utf-8').encode('\x1b' + '\x40'))
		}

	} catch (err) {
		txt_error.innerHTML = err.message;
	} finally {
		if (window.$devHandle!=null) {
			await window.$devHandle.gatt.disconnect();
		}
	}
	
}