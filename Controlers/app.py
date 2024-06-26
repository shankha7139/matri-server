from flask import Flask, request, jsonify, render_template
import requests
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate-captcha', methods=['POST'])
def generate_captcha():
    captcha_url = 'https://tathya.uidai.gov.in/audioCaptchaService/api/captcha/v3/generation'
    captcha_headers = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'verifyAadhaar_IN',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Origin': 'https://myaadhaar.uidai.gov.in',
        'Referer': 'https://myaadhaar.uidai.gov.in/',
        'User-Agent': 'Mozilla/5.0'
    }
    captcha_data = {
        "captchaLength": "6",
        "captchaType": "2",
        "audioCaptchaRequired": True
    }

    response = requests.post(captcha_url, headers=captcha_headers, json=captcha_data)
    captcha_response = response.json()
    
    return jsonify(captcha_response)

@app.route('/verify-aadhaar', methods=['POST'])
def verify_aadhaar():
    data = request.json
    verify_uid_url = 'https://tathya.uidai.gov.in/uidVerifyRetrieveService/api/verifyUID'
    verify_uid_headers = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'verifyAadhaar_IN',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Origin': 'https://myaadhaar.uidai.gov.in',
        'Referer': 'https://myaadhaar.uidai.gov.in/',
        'User-Agent': 'Mozilla/5.0'
    }

    verify_uid_data = {
        "uid": data["aadhaar_number"],
        "captchaTxnId": data["transaction_id"],
        "captcha": data["captcha"],
        "transactionId": data["transaction_id"],
        "captchaLogic": "V3"
    }

    response = requests.post(verify_uid_url, headers=verify_uid_headers, json=verify_uid_data)
    verify_uid_response = response.json()

    return jsonify(verify_uid_response)

if __name__ == '__main__':
    app.run(debug=True)
