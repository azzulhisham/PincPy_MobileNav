const api_URL = "http://MYKUL-MBP-02.local:3838";

const closeVesselInfo = document.getElementById("closeVesselInfo")
const vesselInfo = document.querySelector('.vessel-info')
const search_mmsi = document.getElementById("search_mmsi")
const meas_dist_func = document.getElementById("distance")
const meas_dist = document.getElementById('meas_dist')

meas_dist.value = "Meas. Distance:       "  + " km /       " + " NM"

//////////////////////
//     DOM Event
//////////////////////
closeVesselInfo.addEventListener('click', () => {
    vesselInfo.classList.remove('open')
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
    style: 'mapbox://styles/mapbox/satellite-streets-v12', // style URL
    center: [108.9227098, 4.1569843], // starting position [lng, lat]  
    zoom: 6, // starting zoom
    pitch: 30
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

    map.addSource('TSS-Northbound', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                // These coordinates outline Maine.
                'coordinates': [
                    [
                        [100.81183434, 3.04546854],
                        [100.78857422, 3.01186991],
                        [100.92864990, 2.89426660],
                        [100.99096298, 2.82448741],
                        [101.16983414, 2.73207069],
                        [101.22819901, 2.69983461],
                        [101.43934250, 2.58854501],
                        [101.44878387, 2.58357190],
                        [101.61975861, 2.45152024],
                        [101.68893814, 2.39800985],
                        [101.83811188, 2.28069134],
                        [101.87999725, 2.25015950],
                        [101.99157715, 2.16267711],
                        [102.07672119, 2.08977126],
                        [102.25542068, 1.92902351],
                        [102.41214752, 1.85404837],
                        [102.73057938, 1.70168649],
                        [102.80336380, 1.66428046],
                        [102.99957275, 1.53077984],
                        [103.17449570, 1.40859717],
                        [103.20505142, 1.38783233],
                        [103.39817047, 1.22960188],
                        [103.47301483, 1.20351523],
                        [103.49387169, 1.23831167],
                        [103.42082977, 1.25427241],
                        [103.33379745, 1.34085335],
                        [103.28358650, 1.39109294],
                        [103.28144073, 1.39606965],
                        [103.24710846, 1.42936183],
                        [103.17449570, 1.49182627],
                        [103.09656143, 1.56063806],
                        [103.00008774, 1.64386126],
                        [102.74688721, 1.75624996],
                        [102.62483597, 1.81115498],
                        [102.49214172, 1.87069073],
                        [102.27653503, 1.96711031],
                        [102.10521698, 2.12185026],
                        [102.10298538, 2.11996328],
                        [102.01698303, 2.19372537],
                        [101.99209213, 2.21671096],
                        [101.94917679, 2.25015950],
                        [101.94660187, 2.25067409],
                        [101.79759979, 2.36748054],
                        [101.71588898, 2.43162560],
                        [101.71382904, 2.42973902],
                        [101.64567947, 2.48290515],
                        [101.64430618, 2.48513466],
                        [101.52122498, 2.58065662],
                        [101.52122498, 2.58271446],
                        [101.46646500, 2.62558549],
                        [101.42389297, 2.64856375],
                        [101.40689850, 2.65559433],
                        [101.24879837, 2.73961518],
                        [101.24811172, 2.73858639],
                        [101.18974686, 2.77236458],
                        [100.99868774, 2.87540778],
                        [100.99473953, 2.87832234],
                        [100.81183434, 3.04546854]
                    ]
                ]
            }
        }
    });
         
    // Add a new layer to visualize the polygon.
    map.addLayer({
        'id': 'TSS-Northbound',
        'type': 'fill',
        'source': 'TSS-Northbound', // reference the data source
        'layout': {},
        'paint': {
            'fill-color': '#D18DFF', // blue color fill
            'fill-opacity': 0.3
        }
    });
        // Add a black outline around the polygon.
    map.addLayer({
        'id': 'outline-TSS-Northbound',
        'type': 'line',
        'source': 'TSS-Northbound',
        'layout': {},
        'paint': {
            'line-color': '#5D5D5D',
            'line-width': 1
        }
    });

    map.addSource('TSS-Southbound', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                // These coordinates outline Maine.
                'coordinates': [
                    [
                        [100.78385353, 3.00488435],
                        [100.90719223, 2.90236723],
                        [100.91860771, 2.89276648],
                        [100.92882156, 2.88247987],
                        [100.98993301, 2.81741496],
                        [101.11541748, 2.74994592],
                        [101.16545677, 2.72319728],
                        [101.22510910, 2.69370451],
                        [101.29875183, 2.65503703],
                        [101.30235672, 2.65220765],
                        [101.37248039, 2.61508222],
                        [101.42766953, 2.58738747],
                        [101.53521538, 2.50232741],
                        [101.61194801, 2.44110132],
                        [101.67975426, 2.38638993],
                        [101.85819626, 2.24844421],
                        [101.98282242, 2.15049779],
                        [102.06418991, 2.07604743],
                        [102.24666595, 1.91358267],
                        [102.54690170, 1.77169216],
                        [102.79975891, 1.65141124],
                        [102.99991608, 1.52031221],
                        [103.20505142, 1.38680267],
                        [103.38752747, 1.22119240],
                        [103.45636368, 1.17502558],
                        [103.44451904, 1.15408722],
                        [103.37757111, 1.19390430],
                        [103.23337555, 1.32244764],
                        [103.18239212, 1.36775376],
                        [102.98103333, 1.49011024],
                        [102.77812958, 1.61417585],
                        [102.53213882, 1.72999792],
                        [102.29764938, 1.84015102],
                        [102.22297668, 1.87532311],
                        [102.03826904, 2.04748431],
                        [101.95724487, 2.11936288],
                        [101.65477753, 2.35744689],
                        [101.38732910, 2.56702330],
                        [101.14528656, 2.68740291],
                        [100.89706421, 2.81771500],
                        [100.71613312, 2.91269651],
                        [100.78385353, 3.00488435]
                    ]
                ]
            }
        }
    });
         
    // Add a new layer to visualize the polygon.
    map.addLayer({
        'id': 'TSS-Southbound',
        'type': 'fill',
        'source': 'TSS-Southbound', // reference the data source
        'layout': {},
        'paint': {
            'fill-color': '#6F31FF', // blue color fill
            'fill-opacity': 0.3
        }
    });

    // Add a black outline around the polygon.
    map.addLayer({
        'id': 'outline-TSS-Southbound',
        'type': 'line',
        'source': 'TSS-Southbound',
        'layout': {},
        'paint': {
            'line-color': '#5D5D5D',
            'line-width': 1
        }
    });     

    map.addSource('Sector-7', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                // These coordinates outline Maine.
                'coordinates': [
                    [
                        [103.5296631, 1.3820834],
                        [103.4197998, 1.2550876],
                        [103.4197998, 1.1679031],
                        [103.6587524, 1.0264801],
                        [103.6580658, 1.2008551],
                        [103.6010742, 1.2138984],
                        [103.6010742, 1.2145849],
                        [103.5461426, 1.3841427],
                        [103.5296631, 1.3820834]
                    ]
                ]
            }
        }
    });
         
    // Add a new layer to visualize the polygon.
    map.addLayer({
        'id': 'Sector-7',
        'type': 'fill',
        'source': 'Sector-7', // reference the data source
        'layout': {},
        'paint': {
            'fill-color': '#00C814', // blue color fill
            'fill-opacity': 0.3
        }
    });

    // Add a black outline around the polygon.
    map.addLayer({
        'id': 'outline-Sector-7',
        'type': 'line',
        'source': 'Sector-7',
        'layout': {},
        'paint': {
            'line-color': '#5D5D5D',
            'line-width': 1
        }
    });     
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
    const vesselList = document.querySelectorAll('.vessels-on-sea')

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
            vesselInfoDet = await getLloydsDetail(elemid_text[1])
            vesselInfoImg = await getLloydsPhoto(elemid_text[1])
            vessel_info_panel(vesselInfoDet, vesselInfoImg)

            vesselInfo.classList.add('open')
        }
    }
}

function showVesselPopup(e) {
    elemId = this.id
    elemid_text = elemId.split('_')
    get_mmsi = lst_vessel[elemid_text[1]]

    const toggleBtn = document.getElementById("tog_btn_" + elemid_text[1])
    const coordinates = get_mmsi.getLngLat()

    if (!toggleBtn.classList.contains('open')) {
        const description = '<h4>' + elemid_text[1] + '</h4>' +
                            '<small> Longitude: ' + coordinates.lng + '</small><br>' +
                            '<small> Latitude: ' + coordinates.lat + '</small>'
       
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

function vessel_info_panel(data, imageDet){
    const detMMSI_title = document.getElementById('det-mmsi-title')
    const detShiptype = document.getElementById('det-shiptype')
    const detShipname = document.getElementById('det-shipname')
    const detMMSI = document.getElementById('det-mmsi')
    const detIMO = document.getElementById('det-imo')
    const detCallsign = document.getElementById('det-callsign')
    const detOfficialNo = document.getElementById('det-officialno')
    const detFlag = document.getElementById('det-flag')
    const detLength = document.getElementById('det-length')
    const detDepth = document.getElementById('det-depth')
    const detDraught = document.getElementById('det-draught')
    const detDeadWeight = document.getElementById('det-deadweight')
    const detGrossTonnage = document.getElementById('det-grosstonnage')
    const detNetTonnage = document.getElementById('det-nettonnage')
    const detCountryBuild = document.getElementById('det-countrybuild')
    const detYearofbuild = document.getElementById('det-yearofbuild')
    const detImage = document.getElementById('det-shipimg')

    detMMSI_title.innerText = ": " + data['mmsi'] 
    detShiptype.innerText = ": " + data['shiptype']
    detShipname.innerText = ": " + data['shipname']
    detMMSI.innerText = ": " + data['mmsi']
    detIMO.innerText = ": " + data['imo']
    detCallsign.innerText = ": " + data['callsign']
    detOfficialNo.innerText = ": " + data['officialnumber']
    detFlag.innerText = ": " + data['flag']
    detLength.innerText = ": " + data['length']
    detDepth.innerText = ": " + data['depth']
    detDraught.innerText = ": " + data['draught']
    detDeadWeight.innerText = ": " + data['deadweight']
    detGrossTonnage.innerText = ": " + data['grosstonnage']
    detNetTonnage.innerText = ": " + data['nettonnage']
    detCountryBuild.innerText = ": " + data['countryofbuild']
    detYearofbuild.innerText = ": " + data['yearofbuild']

    if (imageDet != null){
        detImage.setAttribute("src", imageDet['name']);
    }
    else {
        detImage.setAttribute("src", '');
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

        if (data['messageType'] == 1 || data['messageType'] == 2 || data['messageType'] == 3 ) {
            lat = data['latitude']
            lng = data['longitude']
            cog = data['cog']
            mmsi = data['mmsi']
    
            var size = Object.keys(lst_vessel).length;
            //console.log(size)
    
            if (lat > -90 && lat <= 90){
                get_mmsi = lst_vessel[mmsi]
    
                if (get_mmsi === undefined) {
                    const el = document.createElement('div');        
                    el.id = 'marker-green';
                    popupLabel = "<h3>MMSI : "  + mmsi + "</h1><p>Langkawi</p>"
                
                    const marker1 = new mapboxgl.Marker({element:el, rotation: cog})
                    .setLngLat([lng, lat])
                    //.setPopup(new mapboxgl.Popup().setHTML(popupLabel)) // add popup
                    .addTo(map); 
    
                    // add radical menu to vessel
                    const el_vessel = document.createElement('div')
                    el_vessel.className = 'vessels-on-sea'
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
                }
                else {
                    get_mmsi.setLngLat([lng, lat])
                    get_mmsi.setRotation(cog)
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