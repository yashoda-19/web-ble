
import { useState } from "react";

const Home = (props) => {
	const [formData, setFormData] = useState({ sleepTime: "", numberOfImages: "", password: "" })
	const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
	const CHARACTERISTIC_PASSWORD_UUID = "aeb5483e-36e1-4688-b7f5-ea07361b26a8"
	const CHARACTERISTIC_SLEEP_TIME_UUID = "beb6483e-36e1-4688-b7f5-ea07361b26a7"
	const CHARACTERISTIC_NUMBER_OF_IMAGES_UUID = "ceb7483e-36e1-4688-b7f5-ea07361b26a8"
	const [gattCharacteristics, setGattCharacteristics] = useState([])
	const [bluetoothDeviceDetected, setBluetoothDeviceDetected] = useState(null)

	const getUint8String = (value) => {
		let data = new Uint8Array([100]);
		data = new TextEncoder("utf-8").encode(value)
		return data
	}

	const connectGatt = () => {
		if(bluetoothDeviceDetected && bluetoothDeviceDetected.gatt.connected && gattCharacteristics.length > 0) {
			return Promise.resolve()
		}
		return bluetoothDeviceDetected.gatt.connected()
				.then(server => {
					console.log('Getting GATT Service...')
					return server.getPrimaryService(SERVICE_UUID)
				})
				.then(service => {
					console.log('Getting device Characteristics...');
					setGattCharacteristics(service.getCharacteristics())
					return service.getCharacteristics()
				})
	}

	const getDeviceInfo = async () => {

		let options = {
			filters: [{ namePrefix: "Device" },],
			optionalServices: ["4fafc201-1fb5-459e-8fcc-c5c9c331914b"]
		}


		navigator.bluetooth.requestDevice(options)
			.then(device => {
				console.log('Connecting to GATT Server...');
				setBluetoothDeviceDetected(device)
				return device.gatt.connect();
			})
			.then(server => {
				console.log('Getting service uuid...');
				return server.getPrimaryService(SERVICE_UUID);
			})
			.then(service => {
				console.log('Getting device Characteristics...');
				setGattCharacteristics(service.getCharacteristics())
				return service.getCharacteristics()
				// return service.getCharacteristic(CHARACTERISTIC_PASSWORD_UUID);
			})
			// .then(characteristics => {
			// 	console.log("char: ", characteristics)
			// 	return characteristics[0]
			// })
			// .then(characteristic => {
			// 	console.log('Writing Password...');
			// 	let view = new Uint8Array([100]);
			// 	view = new TextEncoder("utf-8").encode("Password")
			// 	console.log('buffer view', view)
			// 	return characteristic.writeValue(view);
			// })
			.catch(error => {
				console.log('Argh! ' + error);
			});
	};

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value })
	}

	const submitData = async () => {
		console.log('form data', formData)
		console.log('gatt characteristics', await gattCharacteristics);
    let characteristics = await gattCharacteristics;
    let pass_char = ""
    for(let index = 0;  index < characteristics.length; index++) {
      let characteristic = characteristics[index]
      if(characteristic.uuid === CHARACTERISTIC_PASSWORD_UUID) {
        pass_char = characteristic
        continue
      }
      if(characteristic.uuid === CHARACTERISTIC_NUMBER_OF_IMAGES_UUID){
        let uintValue = getUint8String(String(formData.numberOfImages))
        console.log('number of images', uintValue)
        await characteristic.writeValue(uintValue)
      }
      if(characteristic.uuid === CHARACTERISTIC_SLEEP_TIME_UUID){
        let uintValue = getUint8String(String(formData.sleepTime))
        console.log('sleep time', uintValue)
        await characteristic.writeValue(uintValue)
      }
    }
    let uintValue = getUint8String(String(formData.password))
    pass_char.writeValue(uintValue)
	}

	return (
		<>
			<h1>Connect to Bluetooth</h1>
			<button onClick={getDeviceInfo}>Connect With BLE device</button>
      {
        bluetoothDeviceDetected ? 
          <div className="user-form">
            <div className="input-row">
              <div className="label">Sleep time:</div>
              <input name="sleepTime" value={formData.sleepTime} onChange={handleChange} placeholder="Enter sleep time" />
            </div>
            <div className="input-row" >
              <div className="label"> Number of Images</div>
              <input name="numberOfImages" value={formData.numberOfImages} onChange={handleChange} placeholder="Enter number of images" />
            </div>
            <div className="input-row" >
              <div className="label"> Password</div>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter password" />
            </div>
            <div className="input-row" style={{ textAlign: "center", marginTop: "5px" }}>
              <button onClick={submitData}>Submit </button>
            </div>
          </div>
           : null
      }
			{/*<button onClick={() => stop()}>Stop</button> */}

		</>
	)
}

export default Home