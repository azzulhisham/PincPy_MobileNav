from flask import Flask, render_template, url_for, request
from flask_restful import Api, Resource, reqparse, abort, request
from flask_cors import cross_origin
from flask_cors import CORS

from Nav_Analytics import *

import requests
import json
import os


app = Flask(__name__)
api = Api(app)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/")
@app.route("/home")
@app.route("/index")
def home(): 
    return render_template('login.html', title="PiNC NAVIGATION")    

@app.route("/dashboard")
def dashboard():
    return render_template('dashboard.html', title="PiNC NAVIGATION")   

@app.route("/realtime_monitoring")
def realtime_monitoring():
    return render_template('home.html', title="PiNC NAVIGATION")

@app.route("/playback")
def playback():
    return render_template('playback.html', title="PiNC NAVIGATION")

@app.route("/aton")
def aton():
    return render_template('aton.html', title="PiNC NAVIGATION")


# API
@app.route("/lloyds/detail/<string:mmsi>")
@cross_origin()
def getLloydsDetail(mmsi):
    url = f'https://datasvc.web-vts.com/ShipService2/LloydsService.svc/DataApi?i=0&mmsi={mmsi}'

    headers = {
                'Content-type': 'application/json', 
            }

    resp = requests.get(url, headers=headers)

    rslt = resp.content[1:]
    rslt = rslt[:-1]
    rslt_dict = json.loads(rslt)

    data = {}

    for i in rslt_dict['items']:
        tmp = {}

        if i['label'] == 'IMO Ship No':
            tmp = {
                'imo': i['text']
            }
        elif '(MMSI)' in i['label']:
            tmp = {
                'mmsi': i['text']
            }
        elif i['label'] == 'Ship Name':
            tmp = {
                'shipname': i['text']
            }       
        elif i['label'] == 'Ex Name':
            tmp = {
                'shipname': i['text']
            } 
        elif i['label'] == 'Call Sign':
            tmp = {
                'callsign': i['text']
            } 
        elif i['label'] == 'Flag Name':
            tmp = {
                'flag': i['text']
            } 
        elif i['label'] == 'Ship Status':
            tmp = {
                'shipstatus': i['text']
            } 
        elif i['label'] == 'Ship Type':
            tmp = {
                'shiptype': i['text']
            } 
        elif i['label'] == 'Yard Number':
            tmp = {
                'yardnumber': i['text']
            } 
        elif i['label'] == 'Official Number':
            tmp = {
                'officialnumber': i['text']
            } 
        elif i['label'] == 'Port of Registry':
            tmp = {
                'portofregistry': i['text']
            } 
        elif i['label'] == 'Year Of Build':
            tmp = {
                'yearofbuild': i['text']
            } 
        elif i['label'] == 'Ship Builder':
            tmp = {
                'shipbuilder': i['text']
            } 
        elif i['label'] == 'Country Of Build':
            tmp = {
                'countryofbuild': i['text']
            } 
        elif i['label'] == 'Length':
            tmp = {
                'length': i['text']
            } 
        elif i['label'] == 'Length Between Perpendiculars LBP':
            tmp = {
                'length_LBP': i['text']
            } 
        elif i['label'] == 'Deadweight':
            tmp = {
                'deadweight': i['text']
            } 
        elif i['label'] == 'Gross Tonnage':
            tmp = {
                'grosstonnage': i['text']
            } 
        elif i['label'] == 'Net tonnage':
            tmp = {
                'nettonnage': i['text']
            } 
        elif i['label'] == 'Breadth Extreme':
            tmp = {
                'breadthextreme': i['text']
            } 
        elif i['label'] == 'Breadth Moulded':
            tmp = {
                'breadthmoulded': i['text']
            } 
        elif i['label'] == 'Depth':
            tmp = {
                'depth': i['text']
            } 
        elif i['label'] == 'Draught':
            tmp = {
                'draught': i['text']
            } 


        data.update(tmp)

    return json.dumps(data), resp.status_code


@app.route("/lloyds/photo/<string:mmsi>")
@cross_origin()
def getLloydsPhoto(mmsi):
    url = f'https://photosvc.web-vts.com/ShipPhotoService/QueryService.svc/PhotosApi?i=0&mmsi={mmsi}'

    headers = {
                'Content-type': 'application/json', 
            }

    resp = requests.get(url, headers=headers)

    rslt = resp.content[1:]
    rslt = rslt[:-1]
    rslt_dict = json.loads(rslt)

    return max(rslt_dict['items'], key=lambda x: x["PicID"])


@app.route("/dashboard/getvesselsinzone/<string:zoneno>")
@cross_origin()
def getVesselsInZone(zoneno):
    zone_no = int(zoneno)
    rslt = PyNav.getVesselsInZone(zone_no)
    return rslt


@app.route("/realtime")
def realtime():
    qry = request.args
    mmsi = ''
    startDateTime = ''

    try:
        mmsi = qry.get('mmsi')
    except:
        mmsi = ''

    try:
        startDateTime = qry.get('startDateTime')
    except:
        startDateTime = ''


    return render_template('realtime.html', title="Mobile Navigation", mmsi=mmsi, startDateTime=startDateTime)


if __name__ == '__main__':
    # app.run(debug=True)
    app.run(host="0.0.0.0", port=os.environ['py_flask_port'] if os.environ.get('py_flask_port') else 3838)