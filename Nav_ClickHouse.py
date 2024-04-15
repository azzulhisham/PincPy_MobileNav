
import json
import pandas as pd
import sqlalchemy as sa
import clickhouse_connect
import time
from datetime import datetime, timedelta

try:
    client = clickhouse_connect.get_client(host='10.10.20.50', port=8123)
except:
    ...

class PyCH:
    def get_init_msg_count():
        now = datetime.now()
        today = datetime(now.year, now.month, now.day)
        utc_today = today - timedelta(hours=8)
        utc_next_day = utc_today + timedelta(hours=24)


        try:
            # total sites

            result = client.query(
            f'''
                with rowcountdata as (
                    select *, row_number() over (partition by mmsi order by ts desc) as rowcountby_mmsi
                    from pnav.ais_type21
                    where ts>='{utc_today.strftime("%Y-%m-%d %H:%M:%S")}' and ts<'{utc_next_day.strftime("%Y-%m-%d %H:%M:%S")}' 
                )
                select count()
                from rowcountdata
                where rowcountby_mmsi = 1
            '''
            )

            aton_cnt = result.result_rows[0][0]       


            # total message received from station

            result = client.query(
            f'''
                with rowcountdata as (
                    select *, row_number() over (partition by mmsi order by ts desc) as rowcountby_mmsi
                    from pnav.ais_type6_533
                    where ts>='{utc_today.strftime("%Y-%m-%d %H:%M:%S")}' and ts<'{utc_next_day.strftime("%Y-%m-%d %H:%M:%S")}' 
                )
                select count()
                from rowcountdata
                where rowcountby_mmsi = 1
            '''
            )

            msg6_recv_cnt = result.result_rows[0][0]    


            # message counting 

            result = client.query(
            f'''
                select count(*) from pnav.ais_type21
                where ts>='{utc_today.strftime("%Y-%m-%d %H:%M:%S")}' and ts<'{utc_next_day.strftime("%Y-%m-%d %H:%M:%S")}' 
            '''
            )
            
            msg21_cnt = result.result_rows[0][0]


            result = client.query(
            f'''
                select count(*) from pnav.ais_type6_533
                where ts>='{utc_today.strftime("%Y-%m-%d %H:%M:%S")}' and ts<'{utc_next_day.strftime("%Y-%m-%d %H:%M:%S")}' 
            '''
            )

            msg6_cnt = result.result_rows[0][0]


            result = client.query(
            f'''
                select count(*) from pnav.ais_meteorological
                where ts>='{utc_today.strftime("%Y-%m-%d %H:%M:%S")}' and ts<'{utc_next_day.strftime("%Y-%m-%d %H:%M:%S")}' 
            '''
            )

            msg8_cnt = result.result_rows[0][0]     


            # Alarm Section   

            result = client.query(
            f'''
                with rowcountdata as (
                    select *, row_number() over (partition by mmsi order by ts desc) as rowcountby_mmsi
                    from pnav.ais_type6_533
                    where ts>='{utc_today.strftime("%Y-%m-%d %H:%M:%S")}' and ts<'{utc_next_day.strftime("%Y-%m-%d %H:%M:%S")}' 
                )
                select count()
                from rowcountdata
                where rowcountby_mmsi = 1 and light=3
            '''
            )

            light_cnt = result.result_rows[0][0] 


            result = client.query(
            f'''
                with rowcountdata as (
                    select *, row_number() over (partition by mmsi order by ts desc) as rowcountby_mmsi
                    from pnav.ais_type6_533
                    where ts>='{utc_today.strftime("%Y-%m-%d %H:%M:%S")}' and ts<'{utc_next_day.strftime("%Y-%m-%d %H:%M:%S")}' 
                )
                select count()
                from rowcountdata
                where rowcountby_mmsi = 1 and ambient=1
            '''
            )

            ldr_cnt = result.result_rows[0][0] 

            result = client.query(
            f'''
                with rowcountdata as (
                    select *, row_number() over (partition by mmsi order by ts desc) as rowcountby_mmsi
                    from pnav.ais_type6_533
                    where ts>='{utc_today.strftime("%Y-%m-%d %H:%M:%S")}' and ts<'{utc_next_day.strftime("%Y-%m-%d %H:%M:%S")}' 
                )
                select count()
                from rowcountdata
                where rowcountby_mmsi = 1 and off_pos=1
            '''
            )

            offpos_cnt = result.result_rows[0][0] 


            result = client.query(
            f'''
                with rowcountdata as (
                    select *, row_number() over (partition by mmsi order by ts desc) as rowcountby_mmsi
                    from pnav.ais_type6_533
                    where ts>='{utc_today.strftime("%Y-%m-%d %H:%M:%S")}' and ts<'{utc_next_day.strftime("%Y-%m-%d %H:%M:%S")}' 
                )
                select count()
                from rowcountdata
                where rowcountby_mmsi = 1 and volt_int<12.5
            '''
            )

            battAton_cnt = result.result_rows[0][0] 


            result = client.query(
            f'''
                with rowcountdata as (
                    select *, row_number() over (partition by mmsi order by ts desc) as rowcountby_mmsi
                    from pnav.ais_type6_533
                    where ts>='{utc_today.strftime("%Y-%m-%d %H:%M:%S")}' and ts<'{utc_next_day.strftime("%Y-%m-%d %H:%M:%S")}' 
                )
                select count()
                from rowcountdata
                where rowcountby_mmsi = 1 and volt_ex1<12.5
            '''
            )

            battLant_cnt = result.result_rows[0][0] 


            result = {
                'aton_cnt': aton_cnt,
                'msg21_cnt': msg21_cnt,
                'msg6_cnt': msg6_cnt,
                'msg8_cnt': msg8_cnt,
                'light_cnt': light_cnt,
                'ldr_cnt': ldr_cnt,
                'offpos_cnt': offpos_cnt,
                'battAton_cnt': battAton_cnt,
                'battLant_cnt': battLant_cnt,
                'no_msg6_cnt': aton_cnt - msg6_recv_cnt
            }

        except:
             result = {
                'aton_cnt': 0,
                'msg21_cnt': 0,
                'msg6_cnt': 0,
                'msg8_cnt': 0,
                'light_cnt': 0,
                'ldr_cnt': 0,
                'offpos_cnt': 0,
                'battAton_cnt': 0,
                'battLant_cnt': 0,
                'no_msg6_cnt': 0 
            }

        return result           


    def get_all_aton():
        now = datetime.now()
        today = datetime(now.year, now.month, now.day)
        utc_today = today - timedelta(hours=8)
        utc_next_day = utc_today + timedelta(hours=24)

        result = client.query(
        f'''
            with rowcountdata as (
                select *, row_number() over (partition by mmsi order by ts desc) as rowcountby_mmsi
                from pnav.ais_type21
                where ts>='{utc_today.strftime("%Y-%m-%d %H:%M:%S")}' and ts<'{utc_next_day.strftime("%Y-%m-%d %H:%M:%S")}' 
            )
            select *
            from rowcountdata
            where rowcountby_mmsi = 1
        '''
        )

        ret_result = []

        for i in result.result_rows:
            data = {
                'packageType': i[1],
                'packageID': i[2],
                'packageCh': i[3],
                'messageType': i[4],
                'messageTypeDesc': i[5],
                'repeat': i[6],
                'mmsi': i[7],
                'aidType': i[8],
                'aidTypeDesc': i[9],
                'aidName': i[10],
                'positionAccuracy': i[11],
                'positionAccuracyDesc': i[12],
                'longitude': i[13],
                'latitude': i[14],
                'to_bow': i[15],
                'to_stern': i[16],
                'to_port': i[17],
                'to_starboard': i[18],
                'epfd': i[19],
                'epfdDesc': i[20],
                'utc_second': i[21],
                'off_position': i[22],
                'regional': i[23],
                'raimFlag': i[24],
                'virtualAid': i[25],
                'assigned': i[26]
            }

            ret_result.append(data)

        return ret_result      

    def get_all_aton_msg():
        now = datetime.now()
        today = datetime(now.year, now.month, now.day)
        utc_today = today - timedelta(hours=8)
        utc_next_day = utc_today + timedelta(hours=24)

        result = client.query(
        f'''
            with rowcountdata as (
                select *, row_number() over (partition by mmsi order by ts desc) as rowcountby_mmsi
                from pnav.ais_type6_533
                where ts>='{utc_today.strftime("%Y-%m-%d %H:%M:%S")}' and ts<'{utc_next_day.strftime("%Y-%m-%d %H:%M:%S")}' 
            )
            select *
            from rowcountdata
            where rowcountby_mmsi = 1
        '''
        )

        ret_result = []

        for i in result.result_rows:
            data = {
                'packageType': i[1],
                'packageID': i[2],
                'packageCh': i[3],
                'messageType': i[4],
                'messageTypeDesc': i[5],
                'repeat': i[6],
                'mmsi': i[7],
                'seqno': i[8],
                'dest_mmsi': i[9],
                'retransmit': i[10],
                'dac': i[11],
                'fid': i[12],
                'volt_int': i[13],
                'volt_ex1': i[14],
                'volt_ex2': i[15],
                'off_pos': i[16],
                'ambient': i[17],
                'racon': i[18],
                'light': i[19],
                'health': i[20],
                'beat': i[21],
                'alarm_active': i[22],
                'buoy_led_power': i[23],
                'buoy_low_vin': i[24],
                'buoy_photocell': i[25],
                'buoy_temp': i[26],
                'buoy_force_off': i[27],
                'buoy_islight': i[28],
                'buoy_errled_short': i[29],
                'buoy_errled_open': i[30],
                'buoy_errled_voltlow': i[31],
                'buoy_errled_vinlow': i[32],
                'buoy_errled_power': i[33],
                'buoy_adjmaxpower': i[34],
                'buoy_sensor_interrupt': i[35],
                'buoy_solarcharging': i[36]    
            }   

            ret_result.append(data)    

        return ret_result     


    def get_weather_waterLevel():
        result = client.query(
        f'''
            with rowcountdata as (
                select *, row_number() over (partition by mmsi order by ts desc) as rowcountby_mmsi
                from pnav.ais_meteorological 
                where waterLevel > 0
            )
            select top 4 ts, mmsi, latitude, longitude, (waterLevel/100 - 10) as waterLevel
            from rowcountdata
            where rowcountby_mmsi = 1
            order by mmsi
        '''
        )

        ret_result = []

        for i in result.result_rows:
            data = {
                'ts': (i[0] + timedelta(hours=8)).strftime("%Y-%m-%d %H:%M:%S"),
                'mmsi': i[1],
                'latitude': i[2],
                'longitude': i[3],
                'waterLevel': i[4]
            }

            ret_result.append(data)    

        return ret_result 