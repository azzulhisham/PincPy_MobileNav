const api_URL = "http://MYKUL-MBP-02.local:3838";

const closeVesselInfo = document.getElementById("closeVesselInfo")
const vesselInfo = document.querySelector('.vessel-info')
const search_mmsi = document.getElementById("search_mmsi")
const meas_dist_func = document.getElementById("distance")
const meas_dist = document.getElementById('meas_dist')

const cnt_in_msg6 = document.getElementById('cnt_in_msg6')
const cnt_in_msg21 = document.getElementById('cnt_in_msg21')
const cnt_in_msg8 = document.getElementById('cnt_in_msg8')
const cnt_in_aton = document.getElementById('cnt_in_aton')
const cnt_in_offpos = document.getElementById('cnt_in_offpos')
const cnt_in_light = document.getElementById('cnt_in_light')
const cnt_in_ldr = document.getElementById('cnt_in_ldr')
const cnt_in_battAton = document.getElementById('cnt_in_battAton')
const cnt_in_battLant = document.getElementById('cnt_in_battLant')
const cnt_in_nomsg6 = document.getElementById('cnt_in_nomsg6')


meas_dist.value = "Meas. Distance:       "  + " km /       " + " NM"

//////////////////////
//     DOM Event
//////////////////////
closeVesselInfo.addEventListener('click', () => {
    if (vesselInfo.classList.contains('open')){
        vesselInfo.classList.remove('open')
    }
    
    if (vesselInfo.classList.contains('openwide')){
        vesselInfo.classList.remove('openwide')
    }
})

search_mmsi.addEventListener('focusout', () => {
    searchVessel(search_mmsi.value)
})

search_mmsi.addEventListener('keypress', (e) => {
    if (e.which === 13){
        searchVessel(search_mmsi.value)
    }  
})


///////////////////
//     mapbox
///////////////////
// Create a popup, but don't add it to the map yet.
const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});


// GeoJSON object to hold our measurement features
const geojson = {
    'type': 'FeatureCollection',
    'features': []
};
     
// Used to draw a line between points
const linestring = {
    'type': 'Feature',
    'geometry': {
        'type': 'LineString',
        'coordinates': []
    }
};

mapboxgl.accessToken = 'pk.eyJ1IjoiYXp6dWxoaXNoYW0iLCJhIjoiY2s5bjR1NDBqMDJqNDNubjdveXdiOGswYyJ9.SYlfXRzRtpbFoM2PHskvBg';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/satellite-v9', // style URL
    center: [99.088068, 4.139619], // starting position [lng, lat]  
    zoom: 6.5, // starting zoom
    pitch: 20
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

const draw = new MapboxDraw({
    displayControlsDefault: true,
    // Select which mapbox-gl-draw control buttons to add to the map.
    controls: {
        polygon: true,
        trash: true
    },
    // Set mapbox-gl-draw to draw by default.
    // The user does not have to click the polygon control button first.
    // defaultMode: 'draw_polygon'
});

map.addControl(draw);

map.on('draw.create', polygonDrawn);
map.on('draw.delete', polygonDrawn);
map.on('draw.update', polygonDrawn);
 
function polygonDrawn(e) {
    const data = draw.getAll();
    //const answer = document.getElementById('calculated-area');

    if (data.features.length > 0) {
        console.log(JSON.stringify(data))
        // const area = turf.area(data);
        // // Restrict the area to 2 decimal points.
        // const rounded_area = Math.round(area * 100) / 100;
        // answer.innerHTML = `<p><strong>${rounded_area}</strong></p><p>square meters</p>`;
    } 
}

map.on('load', ()=> {
    map.setFog();   
});


meas_dist_func.addEventListener('click', () => {
    // trigger distance measurement
    if (meas_dist_func.classList.contains('distance-bar-deactive')){
        meas_dist_func.classList.remove('distance-bar-deactive')
        meas_dist_func.classList.add('distance-bar-active')

        // distance measurement - data source
        map.addSource('geojson', {
            'type': 'geojson',
            'data': geojson
        });

        // distance measurement - add styles to the map
        map.addLayer({
            id: 'measure-points',
            type: 'circle',
            source: 'geojson',
            paint: {
                'circle-radius': 3,
                'circle-color': '#ffff66'
            },
            filter: ['in', '$type', 'Point']
        });   

        map.addLayer({
            id: 'measure-lines',
            type: 'line',
            source: 'geojson',
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            },
            paint: {
                'line-color': '#ffff66',
                'line-width': 1.5
            },
            filter: ['in', '$type', 'LineString']
        });        
        
        map.on('mousemove', measurementMousemove); 
        map.on('click', measurementVesselDistance);
    }
    else {
        meas_dist_func.classList.remove('distance-bar-active')
        meas_dist_func.classList.add('distance-bar-deactive')

        map.off('click', measurementVesselDistance);
        map.off('mousemove', measurementMousemove); 

        // distance measurement - add styles to the map
        map.removeLayer('measure-lines');  
        map.removeLayer('measure-points');  

        // distance measurement - data source
        map.removeSource('geojson');  
        geojson.features = []

        meas_dist.value = "Meas. Distance:       "  + " km /       " + " NM"
        map.getCanvas().style.cursor = 'grab'
    }
})


function measurementVesselDistance(e) {
    const features = map.queryRenderedFeatures(e.point, {
        layers: ['measure-points']
    });
         
    // Remove the linestring from the group
    // so we can redraw it based on the points collection.
    if (geojson.features.length > 1) geojson.features.pop();
         
    // If a feature was clicked, remove it from the map.
    if (features.length) {
        const id = features[0].properties.id;
        geojson.features = geojson.features.filter(
            (point) => point.properties.id !== id
        );
    } 
    else {
        const point = {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [e.lngLat.lng, e.lngLat.lat]
            },
            'properties': {
                'id': String(new Date().getTime())
            }
        };
         
        geojson.features.push(point);
    }
         
    if (geojson.features.length > 1) {
        linestring.geometry.coordinates = geojson.features.map(
            (point) => point.geometry.coordinates
        );
         
        geojson.features.push(linestring);
         
        // Populate the distanceContainer with total distance
        const value = document.createElement('pre');
        const distance = turf.length(linestring);

        nm = distance.toLocaleString() * 0.54
        meas_dist.value = "Meas. Distance: " + distance.toLocaleString() + " km / " + nm.toFixed(5) + " NM"
    }
         
    map.getSource('geojson').setData(geojson);    
}

function measurementMousemove(e) {
    const features = map.queryRenderedFeatures(e.point, {
        layers: ['measure-points']
    });
    // Change the cursor to a pointer when hovering over a point on the map.
    // Otherwise cursor is a crosshair.
    map.getCanvas().style.cursor = features.length ? 'pointer' : 'crosshair';
}

function searchVessel(mmsi){
    get_mmsi = lst_vessel[mmsi]

    if (get_mmsi != undefined){
        setFocusVessel(mmsi)

        posData = get_mmsi.getLngLat()
        map.flyTo({
            center: posData,
            zoom: 10,
            duration: 3000,
            essential: true // this animation is considered essential with respect to prefers-reduced-motion
        });
    }
}

// Radical Menu
function addVesselRadicalPopupMenu(mmsi){

    const p_nav = document.createElement('nav')
    const p_div = document.createElement('div')
    const p_divBtn = document.createElement('div')
    const p_divI = document.createElement('i')

    p_nav.id = "nav_" + mmsi
    p_divBtn.id = "tog_btn_" + mmsi

    p_divI.className = "fa-solid fa-plus"
    p_divBtn.className = "toggle-btn"
    p_div.className = 'nav-content'

    const p_spanI1 = document.createElement('i')
    p_spanI1.className = "fa-solid fa-earth-americas"
    const p_span1 = document.createElement('span')
    p_span1.className = "menu-item"
    p_span1.setAttribute("style", "--i:1;")
    p_span1.appendChild(p_spanI1)
    p_span1.id = "sp1_" + mmsi

    const p_spanI2 = document.createElement('i')
    p_spanI2.className = "fa-solid fa-database"
    const p_span2 = document.createElement('span')
    p_span2.className = "menu-item"
    p_span2.setAttribute("style", "--i:2;")
    p_span2.appendChild(p_spanI2)
    p_span2.id = "sp2_" + mmsi

    const p_spanI3 = document.createElement('i')
    p_spanI3.className = "fa-solid fa-calendar-day"
    const p_span3 = document.createElement('span')
    p_span3.className = "menu-item"
    p_span3.setAttribute("style", "--i:3;")
    p_span3.appendChild(p_spanI3)
    p_span3.id = "sp3_" + mmsi

    const p_spanI4 = document.createElement('i')
    p_spanI4.className = "fa-solid fa-magnifying-glass"
    const p_span4 = document.createElement('span')
    p_span4.className = "menu-item"
    p_span4.setAttribute("style", "--i:4;")
    p_span4.appendChild(p_spanI4)
    p_span4.id = "sp4_" + mmsi

    const p_spanI5 = document.createElement('i')
    p_spanI5.className = "fa-regular fa-images"
    const p_span5 = document.createElement('span')
    p_span5.className = "menu-item"
    p_span5.setAttribute("style", "--i:5;")
    p_span5.appendChild(p_spanI5)
    p_span5.id = "sp5_" + mmsi

    const p_spanI6 = document.createElement('i')
    p_spanI6.className = "fa-solid fa-timeline"
    const p_span6 = document.createElement('span')
    p_span6.className = "menu-item"
    p_span6.setAttribute("style", "--i:6;")
    p_span6.appendChild(p_spanI6)
    p_span6.id = "sp6_" + mmsi

    const p_spanI7 = document.createElement('i')
    p_spanI7.className = "fa-solid fa-expand"
    const p_span7 = document.createElement('span')
    p_span7.className = "menu-item"
    p_span7.setAttribute("style", "--i:7;")
    p_span7.appendChild(p_spanI7)
    p_span7.id = "sp7_" + mmsi

    const p_spanI8 = document.createElement('i')
    p_spanI8.className = "fa-solid fa-play"
    const p_span8 = document.createElement('span')
    p_span8.className = "menu-item"
    p_span8.setAttribute("style", "--i:8;")
    p_span8.appendChild(p_spanI8)
    p_span8.id = "sp8_" + mmsi

    const p_spanI9 = document.createElement('i')
    p_spanI9.className = "fa-solid fa-clock-rotate-left"
    const p_span9 = document.createElement('span')
    p_span9.className = "menu-item"
    p_span9.setAttribute("style", "--i:9;")
    p_span9.appendChild(p_spanI9)
    p_span9.id = "sp9_" + mmsi

    const p_spanI10 = document.createElement('i')
    p_spanI10.className = "fa-solid fa-gears"
    const p_span10 = document.createElement('span')
    p_span10.className = "menu-item"
    p_span10.setAttribute("style", "--i:10;")
    p_span10.appendChild(p_spanI10)
    p_span10.id = "sp10_" + mmsi

    const p_spanI11 = document.createElement('i')
    p_spanI11.className = "fa-solid fa-map-location-dot"
    const p_span11 = document.createElement('span')
    p_span11.className = "menu-item"
    p_span11.setAttribute("style", "--i:11;")
    p_span11.appendChild(p_spanI11)
    p_span11.id = "sp11_" + mmsi

    const p_spanI12 = document.createElement('i')
    p_spanI12.className = "fa-regular fa-floppy-disk"
    const p_span12 = document.createElement('span')
    p_span12.className = "menu-item"
    p_span12.setAttribute("style", "--i:12;")
    p_span12.appendChild(p_spanI12)
    p_span12.id = "sp12_" + mmsi

    p_divBtn.appendChild(p_divI)
    p_div.appendChild(p_divBtn)

    p_div.appendChild(p_span1)
    p_div.appendChild(p_span2)
    p_div.appendChild(p_span3)
    p_div.appendChild(p_span4)
    p_div.appendChild(p_span5)
    p_div.appendChild(p_span6)
    p_div.appendChild(p_span7)
    p_div.appendChild(p_span8)
    p_div.appendChild(p_span9)
    p_div.appendChild(p_span10)
    p_div.appendChild(p_span11)
    p_div.appendChild(p_span12)

    p_nav.appendChild(p_div)

    return p_nav
}

function clearFocusVessel(){
    const vesselList = document.querySelectorAll('.atons-on-sea')

    vesselList.forEach((itm) => {
        targetVessel = itm.style.getPropertyValue('--mmsi')
        targetelem = 'vessels-on-sea_' + targetVessel
        elem = document.getElementById(targetelem)

        child = elem.children[0]
        if (child.classList.contains('focus-top-left')) {
            child.classList.remove('focus-top-left')
        }

        child = elem.children[1]
        if (child.classList.contains('focus-top-right')){
            child.classList.remove('focus-top-right')
        }

        child = elem.children[2]
        if (child.classList.contains('focus-bottom-right')){
            child.classList.remove('focus-bottom-right')
        }

        child = elem.children[3]
        if (child.classList.contains('focus-bottom-left')){
            child.classList.remove('focus-bottom-left')
        }
    })  

    const lighthouseList = document.querySelectorAll('.atons-lh-on-sea')

    lighthouseList.forEach((itm) => {
        targetVessel = itm.style.getPropertyValue('--mmsi')
        targetelem = 'vessels-on-sea_' + targetVessel
        elem = document.getElementById(targetelem)

        child = elem.children[0]
        if (child.classList.contains('focus-top-left')) {
            child.classList.remove('focus-top-left')
        }

        child = elem.children[1]
        if (child.classList.contains('focus-top-right')){
            child.classList.remove('focus-top-right')
        }

        child = elem.children[2]
        if (child.classList.contains('focus-bottom-right')){
            child.classList.remove('focus-bottom-right')
        }

        child = elem.children[3]
        if (child.classList.contains('focus-bottom-left')){
            child.classList.remove('focus-bottom-left')
        }
    })     
}

function setFocusVessel(targetVessel){
        // focus marker on the vessel
        clearFocusVessel()
        targetelem = 'vessels-on-sea_' + targetVessel
        elem = document.getElementById(targetelem)
        child = elem.children[0]
        child.classList.add('focus-top-left')
        child = elem.children[1]
        child.classList.add('focus-top-right')
        child = elem.children[2]
        child.classList.add('focus-bottom-right')
        child = elem.children[3]
        child.classList.add('focus-bottom-left') 
}

function toggleRadicalMenu(e) {
    popup.remove();

    const selectedVessel = this.parentElement
    targetVessel = selectedVessel.style.getPropertyValue('--mmsi')

    // focus marker on the vessel
    setFocusVessel(targetVessel)


    if (e.which === 1) {

    }
    else if (e.which === 3 ){
        // Radical popup menu
        const toggleBtn = this.querySelector(".toggle-btn")
        
        this.classList.toggle("open")
        toggleBtn.classList.toggle("open")
    }
}

async function radicalMenuClick(e) {
    elemId = this.id
    elemid_text = elemId.split('_')
    //ws.send('playback:' + parseInt(elemid_text[1]))

    const navmenu = document.getElementById("nav_" + elemid_text[1])
    const toggleBtn = document.getElementById("tog_btn_" + elemid_text[1])

    if (toggleBtn.classList.contains('open')){
        navmenu.classList.toggle("open")
        toggleBtn.classList.toggle("open")

        if (elemid_text[0] == 'sp12'){
            vessel_info_panel(elemid_text[1])
            vesselInfo.classList.add('openwide')
        }
    }
}

function showVesselPopup(e) {
    elemId = this.id
    elemid_text = elemId.split('_')
    get_mmsi = lst_vessel[elemid_text[1]]
    get_atoninfo = lst_atoninfo[elemid_text[1]]

    const toggleBtn = document.getElementById("tog_btn_" + elemid_text[1])
    const coordinates = get_mmsi.getLngLat()

    if (!toggleBtn.classList.contains('open')) {
        const description = '<h4>' + elemid_text[1] + '</h4>' +
                            '<small> Name &nbsp;: ' + get_atoninfo['atonname'] + '</small><br>' +
                            '<small> Region &nbsp;: ' + get_atoninfo['region']  + '</small><br>' +
                            '<small> Latitude &nbsp;: ' + coordinates.lat + '</small><br>' +
                            '<small> Longitude &nbsp;: ' + coordinates.lng + '</small>'
       
        popup.setLngLat(coordinates).setHTML(description).addTo(map);
    }
}

function removeVesselPopup(e) {
    popup.remove();
}

async function getLloydsDetail(mmsi){
        // Make a GET request using the fetch API
        const response = await fetch(api_URL + '/lloyds/detail/' + mmsi)
        const rslt = await response.json()

        return rslt
}

async function getLloydsPhoto(mmsi){
    // Make a GET request using the fetch API
    const response = await fetch(api_URL + '/lloyds/photo/' + mmsi)

    if (response.status == 200){
        const rslt = await response.json()
        return rslt
    }
    else {
        return null
    }
}

function vessel_info_panel(mmsi){
    const ambient = ["No LDR", "Dark", "Dim", "Bright"]
    const lantern = ["No Light", "Primary", "secandary", "Emergency"]
    const lantern_batt = ["Unknown", "Bad", "Low", "Good"]
    const racon = ["Not Installed", "Not Monitor", "Operating", "Error"]
    const light = ["Not Installed", "Light ON", "Light OFF", "Error"]

    get_atoninfo = lst_atoninfo[mmsi]   // data from message 21
    get_atonData = lst_atonData[mmsi]   // data from message 6

    rms = false;
    elems = document.querySelectorAll('.aton-detail-info')

    elems.forEach((item) => {
        if (!item.classList.contains('hide-container')){
            item.classList.add('hide-container')
        }
    })

    const detMMSI_title = document.getElementById('det-mmsi-title')
    detMMSI_title.innerText = ": " + get_atoninfo['mmsi'] 

    if (rms){
        const panelId = document.getElementById('aton-info')
        panelId.classList.remove('hide-container')

        const detShiptype = document.getElementById('det-atontype')
        const detShipname = document.getElementById('det-atonname')
        const detMMSI = document.getElementById('det-atonmmsi')
        const detRegion = document.getElementById('det-atonregion')

        const det_aidType = document.getElementById('det-aidType')
        const det_aidTypeDesc = document.getElementById('det-aidTypeDesc')
        const det_aidName = document.getElementById('det-aidName')
        const det_positionAccuracyDesc = document.getElementById('det-positionAccuracyDesc')
        const det_longitude = document.getElementById('det-longitude')
        const det_latitude = document.getElementById('det-latitude')
        const det_to_bow = document.getElementById('det-to-bow')
        const det_to_stern = document.getElementById('det-to-stern')
        const det_to_port = document.getElementById('det-to-port')
        const det_to_starboard = document.getElementById('det-to-starboard')
        const det_epfdDesc = document.getElementById('det-epfdDesc')
        const det_utc_second = document.getElementById('det-utc-second')
        const det_off_position = document.getElementById('det-off-position')
        const det_regional = document.getElementById('det-regional')
        const det_raimFlag = document.getElementById('det-raimFlag')
        const det_virtualAid = document.getElementById('det-virtualAid')
        const det_assigned = document.getElementById('det-assigned')

        detShiptype.innerText = ": " + get_atoninfo['type']
        detShipname.innerText = ": " + get_atoninfo['atonname']
        detMMSI.innerText = ": " + get_atoninfo['mmsi']  
        detRegion.innerText = ": " + get_atoninfo['region']  

        det_aidType.innerText = ": " + get_atoninfo['aidType']  
        det_aidTypeDesc.innerText = ": " + get_atoninfo['aidTypeDesc']  
        det_aidName.innerText = ": " + get_atoninfo['aidName']  
        det_positionAccuracyDesc.innerText = ": " + get_atoninfo['positionAccuracyDesc']  
        det_longitude.innerText = ": " + get_atoninfo['longitude']  
        det_latitude.innerText = ": " + get_atoninfo['latitude']  
        det_to_bow.innerText = ": " + get_atoninfo['to_bow']  
        det_to_stern.innerText = ": " + get_atoninfo['to_stern']  
        det_to_port.innerText = ": " + get_atoninfo['to_port']  
        det_to_starboard.innerText = ": " + get_atoninfo['to_starboard']  
        det_epfdDesc.innerText = ": " + get_atoninfo['epfdDesc']  
        det_utc_second.innerText = ": " + get_atoninfo['utc_second']  
        det_off_position.innerText = ": " + get_atoninfo['off_position']  
        det_regional.innerText = ": " + get_atoninfo['regional']  
        det_raimFlag.innerText = ": " + get_atoninfo['raimFlag']  
        det_virtualAid.innerText = ": " + get_atoninfo['virtualAid']  
        det_assigned.innerText = ": " + get_atoninfo['assigned']  
    }
    else {
        dac = get_atonData['dac']
        fid = get_atonData['fid'] 

        if ((dac == 533 && fid == 1) || (dac == 235 && fid == 10)){
            const panelId = document.getElementById('dac533-fid1')
            panelId.classList.remove('hide-container')

            const detShiptype = document.getElementById('det-shiptype-fid1')
            const detShipname = document.getElementById('det-shipname-fid1')
            const detMMSI = document.getElementById('det-mmsi-fid2')

            const det_voltage_int = document.getElementById('det-voltage-int-fid1')
            const det_voltage_ext1 = document.getElementById('det-voltage-ext1-fid1')
            const det_thermal_temp = document.getElementById('det-thermal-temp-fid1')

            const det_racon = document.getElementById('det-racon-fid1')
            const det_light = document.getElementById('det-light-fid1')
            const det_health = document.getElementById('det-health-fid1')
        
            const det_beat = document.getElementById('det-beat-fid1')
            const det_alarm_active = document.getElementById('det-alarm-active-fid1')
            const det_buoy_led_power = document.getElementById('det-buoy-led-power-fid1')
            const det_buoy_low_vin = document.getElementById('det-buoy-low-vin-fid1')
            const det_buoy_photocell = document.getElementById('det-buoy-photocell-fid1')
            const det_buoy_temp = document.getElementById('det-buoy-temp-fid1')

            detShiptype.innerText = ": " + get_atoninfo['type']
            detShipname.innerText = ": " + get_atoninfo['atonname']
            detMMSI.innerText = ": " + get_atoninfo['mmsi']  

            det_voltage_int.innerText = ": " + get_atonData['volt_int']
            det_voltage_ext1.innerText = ": " + get_atonData['volt_ex1']
            det_thermal_temp.innerText = ": " + get_atonData['volt_ex2']

            det_racon.innerText = ": " + racon[get_atonData['racon']]
            det_light.innerText = ": " + light[get_atonData['light']]
            det_health.innerText = ": " + (get_atonData['health'] == 0 ? "Good" : "Alarm")
        
            det_beat.innerText = ": " + (get_atonData['beat'] == 0 ? "Tick" : "Tock")
            det_alarm_active.innerText = ": " + lantern_batt[get_atonData['lantern_batt']]
            det_buoy_led_power.innerText = ": " + lantern[get_atonData['lantern']]
            det_buoy_low_vin.innerText = ": " + ambient[get_atonData['ambient']]
            det_buoy_photocell.innerText = ": " + (get_atonData['hatch_door'] == 0 ? "Close" : "Open")
            det_buoy_temp.innerText = ": " + (get_atonData['off_pos'] == 0 ? "On Pos." : "Off Pos.")
        }

        if (dac == 533 && fid == 2){
            const panelId = document.getElementById('dac533-fid2')
            panelId.classList.remove('hide-container')

            const detShiptype = document.getElementById('det-shiptype-fid2')
            const detShipname = document.getElementById('det-shipname-fid2')
            const detMMSI = document.getElementById('det-mmsi-fid2')

            const det_voltage_int = document.getElementById('det-voltage-int-fid2')
            const det_voltage_ext1 = document.getElementById('det-voltage-ext1-fid2')
            const det_thermal_temp = document.getElementById('det-thermal-temp-fid2')
            const det_off_pos = document.getElementById('det-off-pos-fid2')
            const det_ldr = document.getElementById('det-ldr-fid2')
            const det_racon = document.getElementById('det-racon-fid2')
            const det_light = document.getElementById('det-light-fid2')
            const det_health = document.getElementById('det-health-fid2')
        
            const det_beat = document.getElementById('det-beat-fid2')
            const det_alarm_active = document.getElementById('det-alarm-active-fid2')
            const det_buoy_led_power = document.getElementById('det-buoy-led-power-fid2')
            const det_buoy_low_vin = document.getElementById('det-buoy-low-vin-fid2')
            const det_buoy_photocell = document.getElementById('det-buoy-photocell-fid2')
            const det_buoy_temp = document.getElementById('det-buoy-temp-fid2')
            const det_buoy_force_off = document.getElementById('det-buoy-force-off-fid2')
            const det_buoy_islight = document.getElementById('det-buoy-islight-fid2')
            const det_buoy_errled_short = document.getElementById('det-buoy-errled-short-fid2')
            const det_buoy_errled_open = document.getElementById('det-buoy-errled-open-fid2')
            const det_buoy_errled_voltlow = document.getElementById('det-buoy-errled-voltlow-fid2')
            const det_buoy_errled_vinlow = document.getElementById('det-buoy-errled-vinlow-fid2')
            const det_buoy_errled_power = document.getElementById('det-buoy-errled-power-fid2')
            const det_buoy_adjmaxpower = document.getElementById('det-buoy-adjmaxpower-fid2')

            detShiptype.innerText = ": " + get_atoninfo['type']
            detShipname.innerText = ": " + get_atoninfo['atonname']
            detMMSI.innerText = ": " + get_atoninfo['mmsi']  

            det_voltage_int.innerText = ": " + get_atonData['volt_int']
            det_voltage_ext1.innerText = ": " + get_atonData['volt_ex1']
            det_thermal_temp.innerText = ": " + get_atonData['volt_ex2']
            det_off_pos.innerText = ": " + (get_atonData['off_pos'] == 0 ? "On Pos." : "Off Pos.")
            det_ldr.innerText = ": " + ambient[get_atonData['ambient']]
            det_racon.innerText = ": " + racon[get_atonData['racon']]
            det_light.innerText = ": " + light[get_atonData['light']]
            det_health.innerText = ": " + (get_atonData['health'] == 0 ? "Good" : "Alarm")
        
            det_beat.innerText = ": " + (get_atonData['beat'] == 0 ? "Tick" : "Tock")
            det_alarm_active.innerText = ": " + (get_atonData['main_lantern_cond'] == 0 ? "Normal" : "Fail")
            det_buoy_led_power.innerText = ": " + (get_atonData['main_lantern_stat'] == 0 ? "Off" : "On")
            det_buoy_low_vin.innerText = ": " + (get_atonData['stdby_lantern_cond'] == 0 ? "Normal" : "Fail")
            det_buoy_photocell.innerText = ": " + (get_atonData['stdby_lantern_stat'] == 0 ? "Off" : "On")
            det_buoy_temp.innerText = ": " + (get_atonData['emerg_lantern_cond'] == 0 ? "Normal" : "Fail")
            det_buoy_force_off.innerText = ": " + (get_atonData['emerg_lantern_stat'] == 0 ? "Off" : "On")
            det_buoy_islight.innerText = ": " + (get_atonData['opticA_drive_stat'] == 0 ? "Off" : "On")
            det_buoy_errled_short.innerText = ": " + (get_atonData['opticA_drive_cond'] == 0 ? "Normal" : "Fail")
            det_buoy_errled_open.innerText = ": " + (get_atonData['opticB_drive_stat'] == 0 ? "Off" : "On")
            det_buoy_errled_voltlow.innerText = ": " + (get_atonData['opticB_drive_cond'] == 0 ? "Normal" : "Fail")
            det_buoy_errled_vinlow.innerText = ": " + (get_atonData['hatch_door'] == 0 ? "Close" : "Open")
            det_buoy_errled_power.innerText = ": " + (get_atonData['main_power'] == 0 ? "Off" : "On")
            det_buoy_adjmaxpower.innerText = ": " + (get_atonData['bms_cond'] == 0 ? "Normal" : "Fail")          
        }

        if (dac == 533 && fid == 4){
            const panelId = document.getElementById('dac533-fid4')
            panelId.classList.remove('hide-container')

            const detShiptype = document.getElementById('det-shiptype')
            const detShipname = document.getElementById('det-shipname')
            const detMMSI = document.getElementById('det-mmsi')

            const det_voltage_int = document.getElementById('det-voltage-int')
            const det_voltage_ext1 = document.getElementById('det-voltage-ext1')
            const det_thermal_temp = document.getElementById('det-thermal-temp')
            const det_off_pos = document.getElementById('det-off-pos')
            const det_ldr = document.getElementById('det-ldr')
            const det_racon = document.getElementById('det-racon')
            const det_light = document.getElementById('det-light')
            const det_health = document.getElementById('det-health')
        
            const det_beat = document.getElementById('det-beat')
            const det_alarm_active = document.getElementById('det-alarm-active')
            const det_buoy_led_power = document.getElementById('det-buoy-led-power')
            const det_buoy_low_vin = document.getElementById('det-buoy-low-vin')
            const det_buoy_photocell = document.getElementById('det-buoy-photocell')
            const det_buoy_temp = document.getElementById('det-buoy-temp')
            const det_buoy_force_off = document.getElementById('det-buoy-force-off')
            const det_buoy_islight = document.getElementById('det-buoy-islight')
            const det_buoy_errled_short = document.getElementById('det-buoy-errled-short')
            const det_buoy_errled_open = document.getElementById('det-buoy-errled-open')
            const det_buoy_errled_voltlow = document.getElementById('det-buoy-errled-voltlow')
            const det_buoy_errled_vinlow = document.getElementById('det-buoy-errled-vinlow')
            const det_buoy_errled_power = document.getElementById('det-buoy-errled-power')
            const det_buoy_adjmaxpower = document.getElementById('det-buoy-adjmaxpower')
            const det_buoy_sensor_interrupt = document.getElementById('det-buoy-sensor-interrupt')
            const det_buoy_solarcharging = document.getElementById('det-buoy-solarcharging')


            detShiptype.innerText = ": " + get_atoninfo['type']
            detShipname.innerText = ": " + get_atoninfo['atonname']
            detMMSI.innerText = ": " + get_atoninfo['mmsi']  

            det_voltage_int.innerText = ": " + get_atonData['volt_int']
            det_voltage_ext1.innerText = ": " + get_atonData['volt_ex1']
            det_thermal_temp.innerText = ": " + get_atonData['volt_ex2']
            det_off_pos.innerText = ": " + (get_atonData['off_pos'] == 0 ? "On Pos." : "Off Pos.")
            det_ldr.innerText = ": " + ambient[get_atonData['ambient']]
            det_racon.innerText = ": " + racon[get_atonData['racon']]
            det_light.innerText = ": " + light[get_atonData['light']]
            det_health.innerText = ": " + (get_atonData['health'] == 0 ? "Good" : "Alarm")
        
            det_beat.innerText = ": " + (get_atonData['beat'] == 0 ? "Tick" : "Tock")
            det_alarm_active.innerText = ": " + (get_atonData['alarm_active'] == 0 ? "No" : "Yes")
            det_buoy_led_power.innerText = ": " + (get_atonData['buoy_led_power'] == 0 ? "No" : "Yes")
            det_buoy_low_vin.innerText = ": " + (get_atonData['buoy_low_vin'] == 0 ? "No" : "Yes")
            det_buoy_photocell.innerText = ": " + (get_atonData['buoy_photocell'] == 0 ? "No" : "Yes")
            det_buoy_temp.innerText = ": " + (get_atonData['buoy_temp'] == 0 ? "No" : "Yes")
            det_buoy_force_off.innerText = ": " + (get_atonData['buoy_force_off'] == 0 ? "No" : "Yes")
            det_buoy_islight.innerText = ": " + (get_atonData['buoy_islight'] == 0 ? "No" : "Yes")
            det_buoy_errled_short.innerText = ": " + (get_atonData['buoy_errled_short'] == 0 ? "No" : "Yes")
            det_buoy_errled_open.innerText = ": " + (get_atonData['buoy_errled_open'] == 0 ? "No" : "Yes")
            det_buoy_errled_voltlow.innerText = ": " + (get_atonData['buoy_errled_voltlow'] == 0 ? "No" : "Yes")
            det_buoy_errled_vinlow.innerText = ": " + (get_atonData['buoy_errled_vinlow'] == 0 ? "No" : "Yes")
            det_buoy_errled_power.innerText = ": " + (get_atonData['buoy_errled_power'] == 0 ? "No" : "Yes")
            det_buoy_adjmaxpower.innerText = ": " + (get_atonData['buoy_adjmaxpower'] == 0 ? "No" : "Yes")
            det_buoy_sensor_interrupt.innerText = ": " + (get_atonData['buoy_sensor_interrupt'] == 0 ? "No" : "Yes")
            det_buoy_solarcharging.innerText = ": " + (get_atonData['buoy_solarcharging'] == 0 ? "No" : "Yes")            
        }

    }
}


/////////////////////////////////////////////////////////
// JavaScript example using WebSocket object
// Create a WebSocket object with the URL of the server
/////////////////////////////////////////////////////////
const ws_URL = "ws://MYKUL-MBP-02.local:18383";
let ws = new WebSocket(ws_URL);

// Define a heartbeat interval in milliseconds
const HEARTBEAT_INTERVAL = 30000;

// Define a variable to store the heartbeat timeout ID
let heartbeatTimeout;
lst_vessel = {};
lst_atoninfo = {};
lst_atonData = {};
init_WebSocket();

function init_WebSocket(){
    // Add an event listener for when the connection is opened
    ws.addEventListener("open", function(event) {
        // Send a message to the server
        // ws.send("Hello Server!");
        // Start the heartbeat timeout

        startHeartbeat();
        ws.send('-')
        // var interval = setInterval(getData, 10);
    });

    // Add an event listener for when a message is received from the server
    ws.addEventListener("message", function(event) {
        // Log the message from the server
        //console.log("Message from server: " + event.data);
        data = JSON.parse(event.data)

        if (data['messageType'] == 6) {
            atonStatus = 'ok'
            mmsi = data['mmsi']
            dac = data['dac']
            fid = data['fid']
            
            get_mmsi = lst_vessel[mmsi]
            atonInfo = lst_atoninfo[mmsi]

            if (get_mmsi !== undefined) { 
                lst_atonData[mmsi] = data
                
                if ((dac == 533 && (fid == 1 || fid == 2 || fid == 4)) || (dac == 235 && fid == 10)) {
                    light = data['light']
                    volt_int = data['volt_int']
                    volt_ex1 = data['volt_ex1']
                    off_pos = data['off_pos']
                
                    if (light != 3 && volt_int >= 12.5 && volt_ex1 >= 12.5 && off_pos == 0) {
                        atonStatus = 'ok'
                    }
                    else {
                        if (light === 3) {
                            atonStatus = 'ng'
                        }
                        else {
                            atonStatus = 'wn'
                        }
                    }

                    atonType = atonInfo['type'].toLowerCase() == 'lighthouse' ? '#aton-lighthouse' : '#aton'
                    vesselList = document.querySelectorAll(atonType)

                    vesselList.forEach((itm) => {
                        targetVessel = itm.style.getPropertyValue('--mmsi')

                        if (parseInt(targetVessel) === mmsi) {
                            if (atonStatus == 'ok'){
                                if (itm.classList.contains('aton-error') || itm.classList.contains('aton-warn')) {
                                    itm.classList.remove('aton-error')
                                    itm.classList.remove('aton-warn')
                                    itm.classList.add('aton-ok')
                                }
                                else if (!itm.classList.contains('aton-ok'))
                                {
                                    itm.classList.add('aton-ok')
                                }
                            }
                            else 
                            {
                                if (atonStatus == 'wn'){
                                    if (itm.classList.contains('aton-ok') || itm.classList.contains('aton-error')) {
                                        itm.classList.remove('aton-ok')
                                        itm.classList.remove('aton-error')
                                        itm.classList.add('aton-warn')
                                    }
                                    else if (!itm.classList.contains('aton-warn'))
                                    {
                                        itm.classList.add('aton-warn')
                                    }
                                }
                                else {
                                    if (itm.classList.contains('aton-ok') || itm.classList.contains('aton-warn')) {
                                        itm.classList.remove('aton-ok')
                                        itm.classList.remove('aton-warn')
                                        itm.classList.add('aton-error')
                                    }
                                    else if (!itm.classList.contains('aton-error'))
                                    {
                                        itm.classList.add('aton-error')
                                    }
                                }
                            }
                        }
                    })                  
                }
            }
        }

        if (data['messageType'] == 21) {
            lat = data['latitude']
            lng = data['longitude']
            mmsi = data['mmsi']
            atonName = data['atonname']
            region = data['region']
            type = data['type']
            cog = type.toLowerCase() == 'lighthouse' ? 0 : 45;            


            var size = Object.keys(lst_vessel).length;
            
    
            if (lat > -90 && lat <= 90){
                get_mmsi = lst_vessel[mmsi]
    
                if (get_mmsi === undefined) {
                    const el = document.createElement('div');        
                    el.id = type.toLowerCase() == 'lighthouse' ? 'aton-lighthouse' : 'aton' ;

                    if (type.toLowerCase() == 'buoy'){
                        el.className = 'buoyClass'
                    }

                    el.setAttribute('style', '--mmsi:' + mmsi);
                    popupLabel = "<h3>MMSI : "  + mmsi + "</h1><p>Langkawi</p>"
                
                    const marker1 = new mapboxgl.Marker({element:el, rotation: cog})
                    .setLngLat([lng, lat])
                    //.setPopup(new mapboxgl.Popup().setHTML(popupLabel)) // add popup
                    .addTo(map); 
    
                    // add radical menu to vessel
                    const el_vessel = document.createElement('div')
                    el_vessel.className = type.toLowerCase() == 'lighthouse' ? 'atons-lh-on-sea' : 'atons-on-sea';
                    el_vessel.setAttribute('style', '--mmsi:' + mmsi);
                    el_vessel.id = 'vessels-on-sea_' + mmsi
    
                    const vl_zoom1 = document.createElement('div')
                    vl_zoom1.className = 'corner'
                    vl_zoom1.id = 'top-left'
    
                    const vl_zoom2 = document.createElement('div')
                    vl_zoom2.className = 'corner'
                    vl_zoom2.id = 'top-right'
    
                    const vl_zoom3 = document.createElement('div')
                    vl_zoom3.className = 'corner'
                    vl_zoom3.id = 'bottom-right'
    
                    const vl_zoom4 = document.createElement('div')
                    vl_zoom4.className = 'corner'
                    vl_zoom4.id = 'bottom-left'
                    
                    el_vessel.appendChild(vl_zoom1)
                    el_vessel.appendChild(vl_zoom2)
                    el_vessel.appendChild(vl_zoom3)
                    el_vessel.appendChild(vl_zoom4)
    
                    const radical_menu = addVesselRadicalPopupMenu(mmsi)
                    radical_menu.style.transform = "rotate(-" + cog + "deg)"
                    el_vessel.appendChild(radical_menu)
                    el.appendChild(el_vessel)
                    el.style.zIndex = 100
    
                    const nav = document.getElementById("nav_" + mmsi)
                    nav.addEventListener('mouseup', toggleRadicalMenu)
                    nav.addEventListener('mouseenter', showVesselPopup)
                    nav.addEventListener('mouseleave', removeVesselPopup)
    
                    const menuList = nav.querySelectorAll('.menu-item')
    
                    menuList.forEach((itm) => {
                        itm.addEventListener('click', radicalMenuClick)
                    })   
            
                    lst_vessel[mmsi] = marker1
                    lst_atoninfo[mmsi] = data
                }
                else {
                    // get_mmsi.setLngLat([lng, lat])
                    // get_mmsi.setRotation(cog)
                }
            }    
        }

        // Reset the heartbeat timeout
        resetHeartbeat();
    });

    // Add an event listener for when an error occurs
    ws.addEventListener("error", function(event) {
        // Log the error
        console.log("Error: " + event.message);
    });

    // Add an event listener for when the connection is closed
    ws.addEventListener("close", function(event) {
        // Log the close code and reason
        console.log("Connection closed: " + event.code + " " + event.reason);
        // Clear the heartbeat timeout
        clearHeartbeat();

        alert("Connection closed: " + event.code + " " + event.reason)
        //setTimeout(reconnect_ws, 5000);
        location.reload();
    });
}


function reconnect_ws(){
    remove_WebSocket
    ws = new WebSocket(ws_URL);
    init_WebSocket
}

function startHeartbeat() {
    // Set a timeout to send a ping message after the heartbeat interval
    heartbeatTimeout = setTimeout(function() {
        // Send a ping message and log it
        ws.send("ping");
        console.log("Send a ping message!");
        // Start the heartbeat timeout again
        startHeartbeat();
    }, HEARTBEAT_INTERVAL);
}

// Define a function to reset the heartbeat timeout
function resetHeartbeat() {
    // Clear the existing heartbeat timeout
    clearHeartbeat();
    // Start the heartbeat timeout again
    startHeartbeat();
}

// Define a function to clear the heartbeat timeout
function clearHeartbeat() {
    // Clear the existing heartbeat timeout if any
    if (heartbeatTimeout) {
        clearTimeout(heartbeatTimeout);
        heartbeatTimeout = null;
    }
}


/////////////////////////////////////////////////////////
// JavaScript example using WebSocket object
// Create a WebSocket object for historical data
/////////////////////////////////////////////////////////
const ws2_URL = "ws://MYKUL-MBP-02.local:38381";
// Define a heartbeat interval in milliseconds
const HEARTBEAT_INTERVAL2 = 30000;

// Define a variable to store the heartbeat timeout ID
let heartbeatTimeout2;

let ws2 = new WebSocket(ws2_URL);
init_WebSocket2();

function init_WebSocket2(){
    // Add an event listener for when the connection is opened
    ws2.addEventListener("open", function(event) {
        // Send a message to the server
        // ws.send("Hello Server!");
        // Start the heartbeat timeout

        startHeartbeat2();
        ws2.send('getatoninitialcount:0')
        ws2.send('getallaton:0')
        ws2.send('getallatonmsg:0')
    });

    // Add an event listener for when a message is received from the server
    ws2.addEventListener("message", function(event) {
        let obj = JSON.parse(event.data);

        if (obj['payload'] === 'getatoninitialcount') {
            cnt_in_msg6.innerText = obj['msg6_cnt']
            cnt_in_msg21.innerText = obj['msg21_cnt']
            cnt_in_msg8.innerText = obj['msg8_cnt']
            cnt_in_aton.innerText = obj['aton_cnt']
            cnt_in_offpos.innerText = obj['offpos_cnt']
            cnt_in_light.innerText = obj['light_cnt']
            cnt_in_ldr.innerText = obj['ldr_cnt']
            cnt_in_battAton.innerText = obj['battAton_cnt']
            cnt_in_battLant.innerText = obj['battLant_cnt']
            cnt_in_nomsg6.innerText = obj['no_msg6_cnt']
        }

        if (obj['payload'] === 'getallaton') {
            if (obj['messageType'] == 21) {
                lat = obj['latitude']
                lng = obj['longitude']
                mmsi = obj['mmsi']
                atonName = obj['atonname']
                region = obj['region']
                type = obj['type']
                cog = type.toLowerCase() == 'lighthouse' ? 0 : 45;            

                var size = Object.keys(lst_vessel).length;
        
                if (lat > -90 && lat <= 90){
                    get_mmsi = lst_vessel[mmsi]
        
                    if (get_mmsi === undefined) {
                        
                        const el = document.createElement('div');        
                        el.id = type.toLowerCase() == 'lighthouse' ? 'aton-lighthouse' : 'aton' ;
    
                        if (type.toLowerCase() == 'buoy'){
                            el.className = 'buoyClass'
                        }
    
                        el.setAttribute('style', '--mmsi:' + mmsi);
                        popupLabel = "<h3>MMSI : "  + mmsi + "</h1><p>Langkawi</p>"
                    
                        const marker1 = new mapboxgl.Marker({element:el, rotation: cog})
                        .setLngLat([lng, lat])
                        //.setPopup(new mapboxgl.Popup().setHTML(popupLabel)) // add popup
                        .addTo(map); 
        
                        // add radical menu to vessel
                        const el_vessel = document.createElement('div')
                        el_vessel.className = type.toLowerCase() == 'lighthouse' ? 'atons-lh-on-sea' : 'atons-on-sea';
                        el_vessel.setAttribute('style', '--mmsi:' + mmsi);
                        el_vessel.id = 'vessels-on-sea_' + mmsi
        
                        const vl_zoom1 = document.createElement('div')
                        vl_zoom1.className = 'corner'
                        vl_zoom1.id = 'top-left'
        
                        const vl_zoom2 = document.createElement('div')
                        vl_zoom2.className = 'corner'
                        vl_zoom2.id = 'top-right'
        
                        const vl_zoom3 = document.createElement('div')
                        vl_zoom3.className = 'corner'
                        vl_zoom3.id = 'bottom-right'
        
                        const vl_zoom4 = document.createElement('div')
                        vl_zoom4.className = 'corner'
                        vl_zoom4.id = 'bottom-left'
                        
                        el_vessel.appendChild(vl_zoom1)
                        el_vessel.appendChild(vl_zoom2)
                        el_vessel.appendChild(vl_zoom3)
                        el_vessel.appendChild(vl_zoom4)
        
                        const radical_menu = addVesselRadicalPopupMenu(mmsi)
                        radical_menu.style.transform = "rotate(-" + cog + "deg)"
                        el_vessel.appendChild(radical_menu)
                        el.appendChild(el_vessel)
                        el.style.zIndex = 100
        
                        const nav = document.getElementById("nav_" + mmsi)
                        nav.addEventListener('mouseup', toggleRadicalMenu)
                        nav.addEventListener('mouseenter', showVesselPopup)
                        nav.addEventListener('mouseleave', removeVesselPopup)
        
                        const menuList = nav.querySelectorAll('.menu-item')
        
                        menuList.forEach((itm) => {
                            itm.addEventListener('click', radicalMenuClick)
                        })   
                
                        lst_vessel[mmsi] = marker1
                        lst_atoninfo[mmsi] = obj
                    }
                    else {
                        // get_mmsi.setLngLat([lng, lat])
                        // get_mmsi.setRotation(cog)
                    }
                }    
            }
        }

        if (obj['payload'] === 'getallatonmsg') {
            if (obj['messageType'] == 6) {
                atonStatus = 'ok'
                mmsi = obj['mmsi']
                dac = obj['dac']
                fid = obj['fid']
                
                get_mmsi = lst_vessel[mmsi]
                atonInfo = lst_atoninfo[mmsi]
    
                if (get_mmsi !== undefined) { 
                    lst_atonData[mmsi] = obj
                    
                    if ((dac == 533 && (fid == 1 || fid == 2 || fid == 4)) || (dac == 235 && fid == 10)) {
                        light = obj['light']
                        volt_int = obj['volt_int']
                        volt_ex1 = obj['volt_ex1']
                        off_pos = obj['off_pos']
                    
                        if (light != 3 && volt_int >= 12.5 && volt_ex1 >= 12.5 && off_pos == 0) {
                            atonStatus = 'ok'
                        }
                        else {
                            if (light === 3) {
                                atonStatus = 'ng'
                            }
                            else {
                                atonStatus = 'wn'
                            }
                        }
    
                        atonType = atonInfo['type'].toLowerCase() == 'lighthouse' ? '#aton-lighthouse' : '#aton'
                        vesselList = document.querySelectorAll(atonType)
    
                        vesselList.forEach((itm) => {
                            targetVessel = itm.style.getPropertyValue('--mmsi')
    
                            if (parseInt(targetVessel) === mmsi) {
                                if (atonStatus == 'ok'){
                                    if (itm.classList.contains('aton-error') || itm.classList.contains('aton-warn')) {
                                        itm.classList.remove('aton-error')
                                        itm.classList.remove('aton-warn')
                                        itm.classList.add('aton-ok')
                                    }
                                    else if (!itm.classList.contains('aton-ok'))
                                    {
                                        itm.classList.add('aton-ok')
                                    }
                                }
                                else 
                                {
                                    if (atonStatus == 'wn'){
                                        if (itm.classList.contains('aton-ok') || itm.classList.contains('aton-error')) {
                                            itm.classList.remove('aton-ok')
                                            itm.classList.remove('aton-error')
                                            itm.classList.add('aton-warn')
                                        }
                                        else if (!itm.classList.contains('aton-warn'))
                                        {
                                            itm.classList.add('aton-warn')
                                        }
                                    }
                                    else {
                                        if (itm.classList.contains('aton-ok') || itm.classList.contains('aton-warn')) {
                                            itm.classList.remove('aton-ok')
                                            itm.classList.remove('aton-warn')
                                            itm.classList.add('aton-error')
                                        }
                                        else if (!itm.classList.contains('aton-error'))
                                        {
                                            itm.classList.add('aton-error')
                                        }
                                    }
                                }
                            }
                        })                  
                    }
                }
            }
        }

        // Reset the heartbeat timeout
        resetHeartbeat2();
    });

    // Add an event listener for when an error occurs
    ws2.addEventListener("error", function(event) {
        // Log the error
        console.log("Error: " + event.message);
    });

    // Add an event listener for when the connection is closed
    ws2.addEventListener("close", function(event) {
        // Log the close code and reason
        console.log("Connection closed: " + event.code + " " + event.reason);
        // Clear the heartbeat timeout
        clearHeartbeat2();

        alert("Connection closed: " + event.code + " " + event.reason)
        location.reload();
    });
}


function startHeartbeat2() {
    // Set a timeout to send a ping message after the heartbeat interval
    heartbeatTimeout2 = setTimeout(function() {
        // Send a ping message and log it
        ws2.send("ping");
        console.log("Send a ping message!");
        // Start the heartbeat timeout again
        startHeartbeat2();
    }, HEARTBEAT_INTERVAL2);
}

// Define a function to reset the heartbeat timeout
function resetHeartbeat2() {
    // Clear the existing heartbeat timeout
    clearHeartbeat2();
    // Start the heartbeat timeout again
    startHeartbeat2();
}

// Define a function to clear the heartbeat timeout
function clearHeartbeat2() {
    // Clear the existing heartbeat timeout if any
    if (heartbeatTimeout2) {
        clearTimeout(heartbeatTimeout2);
        heartbeatTimeout2 = null;
    }
}

function updateDashboard(){
    ws2.send('getatoninitialcount:0')
}

setInterval(updateDashboard, 30000);


//fetchData()

function fetchData() {
    const apiHost = "http://aec45b1e527ea46d394dacdbe444e19c-806738025.ap-southeast-1.elb.amazonaws.com:3838";
    //let url = apiHost + "/getHistoricalData/2820574/2023-12-26 15:00:00";
    let url = apiHost + "/getLastPosition";

    // The fetch options
    const options = {
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    }
    };

    // The fetch call
    fetch(url, options)
    .then(response => {
        // Check if the response is ok
        if (response.ok) {
        // Parse the response as JSON
        return response.json();
        } else {
        // Throw an error
        throw new Error(`HTTP error: ${response.status}`);
        }
    })
    .then(data => {
        for (i=0; i<data.rows.length; i++){
            ts = data.rows[i][0]
            cog = data.rows[i][4];
            lat = data.rows[i][7];
            lng = data.rows[i][8];
    
    
            const el = document.createElement('div');        
            el.id = 'marker-green';
    
            const marker1 = new mapboxgl.Marker({element:el, rotation: cog})
            .setLngLat([lng, lat])
            .addTo(map);    
        }
    
    })
    .catch(error => {
        // Handle the error
        console.error(error);
    });
}