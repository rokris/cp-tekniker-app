from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# Configuration for Azure Function endpoints
AZURE_FUNCTION_BASE_URL = "http://localhost:7071/api"  # Update with actual URL if hosted externally

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_device_info', methods=['GET'])
def get_device_info():
    macaddr = request.args.get('macaddr')
    if not macaddr:
        return jsonify({"error": "MAC address is required."}), 400

    try:
        response = requests.get(f"{AZURE_FUNCTION_BASE_URL}/GetDeviceInfo", params={"macaddr": macaddr})
        response.raise_for_status()
        return jsonify(response.json())
    except requests.RequestException as e:
        return jsonify({"error": "Failed to fetch device info.", "details": str(e)}), 500

@app.route('/create_device', methods=['POST'])
def create_device():
    try:
        payload = request.json
        response = requests.post(f"{AZURE_FUNCTION_BASE_URL}/CreateDevice", json=payload)
        response.raise_for_status()
        return jsonify(response.json()), 201
    except requests.RequestException as e:
        return jsonify({"error": "Failed to create device.", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)