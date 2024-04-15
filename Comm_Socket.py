from Nav_Analytics import *
from Nav_ClickHouse import *

import websockets
import asyncio
import json
import pandas as pd
import sqlalchemy as sa
from crate import client
import clickhouse_connect
from geojson import LineString

import time
from datetime import datetime, timedelta


def loaddata():
    global df
    df = pd.read_csv('/Users/zultan/sources/python/Py_MobileNav/docs/atonlist.csv') 


def getAton(mmsi):
    aton = df[df['mmsi'] == mmsi]
    return aton



HEARTBEAT_INTERVAL = 30
vesselInZone = []

# preprocessing data to identify vessels in zone
gdf_tss1 = PyNav.getVesselsInZone(1)
vesselInZone.append(gdf_tss1.to_json(orient='records'))

gdf_tss2 = PyNav.getVesselsInZone(2)
vesselInZone.append(gdf_tss2.to_json(orient='records'))

gdf_sect7 = PyNav.getVesselsInZone(3)
vesselInZone.append(gdf_sect7.to_json(orient='records'))

gdf_tss1_lastyear = PyNav.getVesselsInZoneLastYear(1)
gdf_tss2_lastyear = PyNav.getVesselsInZoneLastYear(2)
gdf_sect7_lastyear = PyNav.getVesselsInZoneLastYear(3)

# with Windows Function method, partition data by mmsi 
# and then shift the column ts up 1 row to get the next timestamp
# for each dataframe
groupby = gdf_tss1.groupby('mmsi')
gdf_tss1['next_ts'] = groupby['ts'].shift(-1)

groupby = gdf_tss2.groupby('mmsi')
gdf_tss2['next_ts'] = groupby['ts'].shift(-1)

groupby = gdf_sect7.groupby('mmsi')
gdf_sect7['next_ts'] = groupby['ts'].shift(-1)

groupby = gdf_tss1_lastyear.groupby('mmsi')
gdf_tss1_lastyear['next_ts'] = groupby['ts'].shift(-1)

groupby = gdf_tss2_lastyear.groupby('mmsi')
gdf_tss2_lastyear['next_ts'] = groupby['ts'].shift(-1)

groupby = gdf_sect7_lastyear.groupby('mmsi')
gdf_sect7_lastyear['next_ts'] = groupby['ts'].shift(-1)


loaddata()
print('Server is running.....')


async def handler(websocket, path):
    # Start a task for sending ping messages periodically
    ping_task = asyncio.create_task(send_ping(websocket))

    print(f"[PATH]:: {path}")

    try:
        # Receive messages from the client
        async for message in websocket:
            print(f"[MEESSAGE]:: {message}")
            msg = message.split(':')

            if msg[0] == "getvesselsinzone":
                zone_no = int(msg[1])
                # gdf = PyNav.getVesselsInZone(zone_no)
                # data = gdf.to_json(orient='records')
                        
                await websocket.send(vesselInZone[zone_no]) 

            if msg[0] == 'getyesterdaychartdata':
                ts = message.replace('getyesterdaychartdata:', '')

                # convert iso timestamp to datetime
                utc_ts = datetime.fromisoformat(ts)      
                
                # add 8 hours for local time
                new_Date = utc_ts + timedelta(hours=8) 
                
                # convert datetime to string
                ts = new_Date.strftime('%Y-%m-%d %H:%M:%S')

                # TODO
                ts = ts.replace(ts[0:10], '2023-01-03')
                tm = ts.split(' ')
                
                tmp = gdf_tss1[(gdf_tss1['ts'] <= ts)  & (gdf_tss1['next_ts'] >= ts)]
                cnt_tss1 = len(tmp['mmsi'].unique())

                tmp = gdf_tss2[(gdf_tss2['ts'] <= ts)  & (gdf_tss2['next_ts'] >= ts)]
                cnt_tss2 = len(tmp['mmsi'].unique())

                tmp = gdf_sect7[(gdf_sect7['ts'] <= ts)  & (gdf_sect7['next_ts'] >= ts)]
                cnt_sect7 = len(tmp['mmsi'].unique())

                data = {
                    'payload': 'getyesterdaychartdata',
                    'cnt_tss1': cnt_tss1,
                    'cnt_tss2': cnt_tss2,
                    'cnt_sect7': cnt_sect7,
                    'ts': tm[1]
                }

                await websocket.send(json.dumps(data)) 

            if msg[0] == 'getlastyearchartdata':
                ts = message.replace('getlastyearchartdata:', '')

                # convert iso timestamp to datetime
                utc_ts = datetime.fromisoformat(ts)      
                
                # add 8 hours for local time
                new_Date = utc_ts + timedelta(hours=8) 
                
                # convert datetime to string
                ts = new_Date.strftime('%Y-%m-%d %H:%M:%S')

                # TODO
                ts = ts.replace(ts[0:10], '2023-01-01')
                tm = ts.split(' ')
                
                tmp = gdf_tss1_lastyear[(gdf_tss1_lastyear['ts'] <= ts)  & (gdf_tss1_lastyear['next_ts'] >= ts)]
                cnt_tss1 = len(tmp['mmsi'].unique())

                tmp = gdf_tss2_lastyear[(gdf_tss2_lastyear['ts'] <= ts)  & (gdf_tss2_lastyear['next_ts'] >= ts)]
                cnt_tss2 = len(tmp['mmsi'].unique())

                tmp = gdf_sect7_lastyear[(gdf_sect7_lastyear['ts'] <= ts)  & (gdf_sect7_lastyear['next_ts'] >= ts)]
                cnt_sect7 = len(tmp['mmsi'].unique())

                data = {
                    'payload': 'getlastyearchartdata',
                    'cnt_tss1': cnt_tss1,
                    'cnt_tss2': cnt_tss2,
                    'cnt_sect7': cnt_sect7,
                    'ts': tm[1]
                }

                await websocket.send(json.dumps(data)) 


            if msg[0] == 'getatoninitialcount':
                data = {
                    'payload': 'getatoninitialcount'
                }

                data.update(PyCH.get_init_msg_count()) 
                await websocket.send(json.dumps(data)) 


            if msg[0] == 'getallaton':
                atons = PyCH.get_all_aton()

                for i in atons:
                    aton = getAton(i["mmsi"])

                    if aton.shape[0] > 0 :
                        aton_info = {
                            'atonname': aton.iloc[0]['name'],
                            'region': aton.iloc[0]['region'],
                            'type': aton.iloc[0]['type']
                        }

                        i.update(aton_info)

                        data = {
                            'payload': 'getallaton'
                        }

                        data.update(i)
                        await websocket.send(json.dumps(data))    


            if msg[0] == 'getallatonmsg':
                atons = PyCH.get_all_aton_msg()

                for i in atons:
                    aton = getAton(i["mmsi"])

                    if aton.shape[0] > 0 :
                        data = {
                            'payload': 'getallatonmsg'
                        }

                        data.update(i)
                        await websocket.send(json.dumps(data))       


            if msg[0] == 'getweatherwaterlevel':
                waterlevel_result = PyCH.get_weather_waterLevel()
                data = {
                    'payload': 'getweatherwaterlevel',
                    'items': waterlevel_result
                } 
                 
                await websocket.send(json.dumps(data))    


    finally:
        # Cancel the ping task when the connection is closed
        ping_task.cancel()


async def send_ping(websocket):
    # Send ping messages periodically
    while True:
        # Wait for the heartbeat interval
        await asyncio.sleep(HEARTBEAT_INTERVAL)
        # Send a ping message and wait for a pong response
        await websocket.ping()
        print("Send a ping message!")


# Create a WebSocket server using the handler function
server = websockets.serve(handler, "localhost", 38381)

# Run the server using the asyncio event loop
asyncio.get_event_loop().run_until_complete(server)
asyncio.get_event_loop().run_forever()
