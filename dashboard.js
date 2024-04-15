const api_URL = "http://MYKUL-MBP-02.local:3838";

// constant
const cnt_in_TSS_N = document.getElementById("cnt_in_TSS_N")
const cnt_in_TSS_S = document.getElementById("cnt_in_TSS_S")
const cnt_in_Sector7 = document.getElementById("cnt_in_Sector7")
const cnt_left_TSS_N = document.getElementById("cnt_left_TSS_N")
const cnt_left_TSS_S = document.getElementById("cnt_left_TSS_S")
const cnt_left_Sector7 = document.getElementById("cnt_left_Sector7")

const tss_north = document.getElementById("tss_north")
const tss_south = document.getElementById("tss_south")
const sector_7 = document.getElementById("sector_7")

const weather_data1 = document.getElementById("weather_data1")
const weather_data2 = document.getElementById("weather_data2")
const weather_data3 = document.getElementById("weather_data3")
const weather_data4 = document.getElementById("weather_data4")

const weather_mmsi1 = document.getElementById("weather_mmsi1")
const weather_mmsi2 = document.getElementById("weather_mmsi2")
const weather_mmsi3 = document.getElementById("weather_mmsi3")
const weather_mmsi4 = document.getElementById("weather_mmsi4")

const weather_ts1 = document.getElementById("weather_ts1")
const weather_ts2 = document.getElementById("weather_ts2")
const weather_ts3 = document.getElementById("weather_ts3")
const weather_ts4 = document.getElementById("weather_ts4")

const weather_latlng1 = document.getElementById("weather_latlng1")
const weather_latlng2 = document.getElementById("weather_latlng2")
const weather_latlng3 = document.getElementById("weather_latlng3")
const weather_latlng4 = document.getElementById("weather_latlng4")


// document setting
document.body.classList.toggle('dark-theme');



///////////////////
//     mapbox
///////////////////
// Create a popup, but don't add it to the map yet.
const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

mapboxgl.accessToken = 'pk.eyJ1IjoiYXp6dWxoaXNoYW0iLCJhIjoiY2s5bjR1NDBqMDJqNDNubjdveXdiOGswYyJ9.SYlfXRzRtpbFoM2PHskvBg';
// const map = new mapboxgl.Map({
//     container: 'map', // container ID
//     // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
//     style: 'mapbox://styles/mapbox/satellite-streets-v12', // style URL
//     center: [100.441885, 3.869975], // starting position [lng, lat]  
//     zoom: 5, // starting zoom
//     pitch: 30
// });

// // Add zoom and rotation controls to the map.
// map.addControl(new mapboxgl.NavigationControl());

// map.on('load', ()=> {
//     map.setFog();
// });

const deckgl = new deck.DeckGL({
    container: 'map',
    mapboxApiAccessToken: 'pk.eyJ1IjoiYXp6dWxoaXNoYW0iLCJhIjoiY2s5bjR1NDBqMDJqNDNubjdveXdiOGswYyJ9.SYlfXRzRtpbFoM2PHskvBg',
    mapStyle: 'mapbox://styles/mapbox/satellite-streets-v12',
    initialViewState: {
        longitude: 102.63394,
        latitude: 2.3604566667,
        zoom: 7,
        pitch: 30
    },
    controller: true
});

vesselsData = []


async function getVesselsInZone(zoneno){
    // Make a GET request using the fetch API
    const response = await fetch(api_URL + '/dashboard/getvesselsinzone/' + zoneno)

    if (response.status == 200){
        const rslt = await response.json()
        return rslt
    }
    else {
        return []
    }
}

function visualiseVesslesInZone(zoneno){
    getVesselsInZone(zoneno).then(
        (result) => {
            vesselsData = result

            const hexagonLayer = new deck.HexagonLayer({
                id: 'hexagon-layer',
                data: vesselsData,
                pickable: true,
                extruded: true,
                // radius: 500,
                // coverage: 30,
                // upperPercentile: 100,
                opacity:1,
                elevationScale: 50,
                // elevationRange: [0, 100],
                getPosition: d => [Number(d.longitude), Number(d.latitude)],
                // getElevationValue: d => d[0].exits,
                // getColorValue: d => d[0].exits,
                colorRange: [
                [255, 255, 178],
                [254, 217, 118],
                [254, 178, 76],
                [253, 141, 60],
                [240, 59, 32],
                [189, 0, 38]
                ],
                // onHover: info => {
                //   // Display a tooltip with the hexagon count and elevation value
                //   const el = document.getElementById('tooltip');
                //   if (info.object) {
                //     console.log(info.object)
                //     const {count, elevationValue} = info.object;
                //     el.innerHTML = `<h1>${count}</h1><p>${elevationValue}</p>`;
                //     el.style.display = 'block';
                //     el.style.opacity = 0.9;
                //     el.style.left = info.x + 'px';
                //     el.style.top = info.y + 'px';
                //   } else {
                //     el.style.opacity = 0.0;
                //   }
                // }
            });

            deckgl.setProps({
                layers: [hexagonLayer]
            });        
        }
    )
}


function hexlayer(vesselsData){
    const hexagonLayer = new deck.HexagonLayer({
        id: 'hexagon-layer',
        data: vesselsData,
        pickable: true,
        extruded: true,
        // radius: 500,
        // coverage: 30,
        // upperPercentile: 100,
        opacity:1,
        elevationScale: 50,
        // elevationRange: [0, 100],
        getPosition: d => [Number(d.longitude), Number(d.latitude)],
        // getElevationValue: d => d[0].exits,
        // getColorValue: d => d[0].exits,
        colorRange: [
        [255, 255, 178],
        [254, 217, 118],
        [254, 178, 76],
        [253, 141, 60],
        [240, 59, 32],
        [189, 0, 38]
        ],
        // onHover: info => {
        //   // Display a tooltip with the hexagon count and elevation value
        //   const el = document.getElementById('tooltip');
        //   if (info.object) {
        //     console.log(info.object)
        //     const {count, elevationValue} = info.object;
        //     el.innerHTML = `<h1>${count}</h1><p>${elevationValue}</p>`;
        //     el.style.display = 'block';
        //     el.style.opacity = 0.9;
        //     el.style.left = info.x + 'px';
        //     el.style.top = info.y + 'px';
        //   } else {
        //     el.style.opacity = 0.0;
        //   }
        // }
    });

    deckgl.setProps({
        layers: [hexagonLayer]
    }); 
}


// tss_north.addEventListener('click', () => {
//     visualiseVesslesInZone(1)
// })

// tss_south.addEventListener('click', () => {
//     visualiseVesslesInZone(2)
// })

//visualiseVesslesInZone(1)

/////////////////////////////////////////////////////////
// JavaScript example using WebSocket object
// Create a WebSocket object for realtime data
/////////////////////////////////////////////////////////
const ws_URL = "ws://MYKUL-MBP-02.local:28383";
// Define a heartbeat interval in milliseconds
const HEARTBEAT_INTERVAL = 30000;

// Define a variable to store the heartbeat timeout ID
let heartbeatTimeout;
lst_vessel = {};

let ws = new WebSocket(ws_URL);
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
        data = JSON.parse(event.data)
        cnt_in_TSS_N.innerText = data['cnt_in_TSS_N']
        cnt_in_TSS_S.innerText = data['cnt_in_TSS_S']
        cnt_in_Sector7.innerText = data['cnt_in_Sector7']
        cnt_left_TSS_N.innerText = data['cnt_left_TSS_N']
        cnt_left_TSS_S.innerText = data['cnt_left_TSS_S']
        cnt_left_Sector7.innerText = data['cnt_left_Sector7']


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
        location.reload();
    });
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
        ws2.send('getweatherwaterlevel:0')
        ws2.send('getvesselsinzone:0')
        
        // var interval = setInterval(getData, 10);
    });

    // Add an event listener for when a message is received from the server
    ws2.addEventListener("message", function(event) {
        let obj = JSON.parse(event.data);

        if (Array.isArray(obj)){
            hexlayer(obj)
        }
        else {
            if (obj['payload'] === 'getyesterdaychartdata') {
                addData(chart_yesterday, obj['ts'], [obj['cnt_tss1'], obj['cnt_tss2'], obj['cnt_sect7']])
                removeData(chart_yesterday)
            }

            if (obj['payload'] === 'getlastyearchartdata') {
                addData(chart_lastyear, obj['ts'], [obj['cnt_tss1'], obj['cnt_tss2'], obj['cnt_sect7']])
                removeData(chart_lastyear)
            }  
            
            if (obj['payload'] === 'getweatherwaterlevel') {
                weather_data1.innerText = 'water level : ' + obj['items'][0]['waterLevel'].toFixed(3)
                weather_data2.innerText = 'water level : ' + obj['items'][1]['waterLevel'].toFixed(3)
                weather_data3.innerText = 'water level : ' + obj['items'][2]['waterLevel'].toFixed(3)
                weather_data4.innerText = 'water level : ' + obj['items'][3]['waterLevel'].toFixed(3)

                weather_mmsi1.innerText = obj['items'][0]['mmsi']
                weather_mmsi2.innerText = obj['items'][1]['mmsi']
                weather_mmsi3.innerText = obj['items'][2]['mmsi']
                weather_mmsi4.innerText = obj['items'][3]['mmsi']

                weather_ts1.innerText = obj['items'][0]['ts']
                weather_ts2.innerText = obj['items'][1]['ts']
                weather_ts3.innerText = obj['items'][2]['ts']
                weather_ts4.innerText = obj['items'][3]['ts'] 
                
                weather_latlng1.innerText = '[' + obj['items'][0]['longitude'].toFixed(8) + ', ' + obj['items'][0]['latitude'].toFixed(8) + ']'
                weather_latlng2.innerText = '[' + obj['items'][1]['longitude'].toFixed(8) + ', ' + obj['items'][1]['latitude'].toFixed(8) + ']'
                weather_latlng3.innerText = '[' + obj['items'][2]['longitude'].toFixed(8) + ', ' + obj['items'][2]['latitude'].toFixed(8) + ']'
                weather_latlng4.innerText = '[' + obj['items'][3]['longitude'].toFixed(8) + ', ' + obj['items'][3]['latitude'].toFixed(8) + ']'
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



const menuBtn = document.querySelector('#menu-btn')
const closeBtn = document.querySelector('#close-btn')
const sideBar = document.querySelector('aside')

menuBtn.addEventListener('click', ()=>{
    sideBar.style.display = 'block'
})

closeBtn.addEventListener('click', ()=>{
    sideBar.style.display = 'none'
})

const themeBtn = document.querySelector('.theme-btn')

themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');

    themeBtn.querySelector('span:first-child').classList.toggle('active')
    themeBtn.querySelector('span:last-child').classList.toggle('active')
})


tss_north.addEventListener('click', () => {
    ws2.send('getvesselsinzone:0')
})

tss_south.addEventListener('click', () => {
    ws2.send('getvesselsinzone:1')
})

sector_7.addEventListener('click', () => {
    ws2.send('getvesselsinzone:2')
})

const chartdev1 = document.getElementById("summary-chart1");

const chart = new Chart(chartdev1, {
    type: 'line',
    data: {
        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        datasets: [
            {
                label: 'TSS Northbound',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: '#ff796f',
                borderWidth: 1
            },
            {
                label: 'TSS Southbound',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: 'rgb(129, 255, 129)',
                borderWidth: 1
            },
            {
                label: 'Sector 7',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: '#5d70ff',
                borderWidth: 1
            }                         
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                ticks: {
                    //autoSkip: false,
                    maxRotation: 90,
                    minRotation: 90,
                    font: {
                        size: 9 // Adjust the font size for x-axis ticks
                    }                     
                }
            },
            y: {
                display: true,
                ticks: {
                    // beginAtZero: true,
                    //steps: 5,
                    //stepValue: 5,
                    suggestedMin: 30.0,
                    suggestedMax: 130.0
                }
            }            
        },
        plugins: {
            title: {
                display: false,
                text: 'Last 100 minutes'
            },
            legend: {
                display: false,
            }            
        }        
    }    
})

const chartdev2 = document.getElementById("summary-chart2");

const chart_yesterday = new Chart(chartdev2, {
    type: 'line',
    data: {
        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        datasets: [
            {
                label: 'TSS Northbound',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: '#ff796f',
                borderWidth: 1
            },
            {
                label: 'TSS Southbound',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: 'rgb(129, 255, 129)',
                borderWidth: 1
            },
            {
                label: 'Sector 7',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: '#5d70ff',
                borderWidth: 1
            }                         
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                ticks: {
                    //autoSkip: false,
                    maxRotation: 90,
                    minRotation: 90,
                    font: {
                        size: 9 // Adjust the font size for x-axis ticks
                    }                    
                }
            },
            y: {
                display: true,
                ticks: {
                    // beginAtZero: true,
                    //steps: 5,
                    //stepValue: 5,
                    suggestedMin: 30.0,
                    suggestedMax: 130.0
                }
            }            
        },
        plugins: {
            title: {
                display: false,
                text: 'Last 100 minutes'
            },
            legend: {
                display: false,
            }            
        }        
    }    
})

const chartdev3 = document.getElementById("summary-chart3");

const chart_lastyear = new Chart(chartdev3, {
    type: 'line',
    data: {
        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        datasets: [
            {
                label: 'TSS Northbound',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: '#ff796f',
                borderWidth: 1
            },
            {
                label: 'TSS Southbound',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: 'rgb(129, 255, 129)',
                borderWidth: 1
            },
            {
                label: 'Sector 7',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: '#5d70ff',
                borderWidth: 1
            }                         
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                ticks: {
                    //autoSkip: false,
                    maxRotation: 90,
                    minRotation: 90,
                    font: {
                        size: 9 // Adjust the font size for x-axis ticks
                    }                    
                }
            },
            y: {
                display: true,
                ticks: {
                    // beginAtZero: true,
                    //steps: 5,
                    //stepValue: 5,
                    suggestedMin: 30.0,
                    suggestedMax: 130.0
                }
            }            
        },
        plugins: {
            title: {
                display: false,
                text: 'Last 100 minutes'
            },
            legend: {
                display: false,
            }            
        }        
    }    
})


// Add data to the chart
function addData(chart, label, newData) {
    chart.data.labels.push(label);
    dscnt = 0;
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(newData[dscnt]);
        dscnt += 1;
    });
    chart.update();
}

// Remove data from the chart
function removeData(chart) {
    chart.data.labels.shift();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.shift();
    });
    chart.update();
}

const updateChart = () => {
    const date = new Date();
    const isoString = date.toISOString();

    date.setHours(date.getHours() + 0);
    datestr = date.toLocaleTimeString('en-MY', { hour12: false });

    n = cnt_in_TSS_N.innerText
    s = cnt_in_TSS_S.innerText
    t = cnt_in_Sector7.innerText

    ws2.send('getyesterdaychartdata:' + isoString)
    ws2.send('getlastyearchartdata:' + isoString)

    addData(chart, datestr, [n, s, t])
    removeData(chart)
};


const updateWeatherDate = () => {
    ws2.send('getweatherwaterlevel:0')
}

setInterval(updateChart, 10000); // Repeat myFunction every 2 seconds
setInterval(updateWeatherDate, 20000); // Repeat myFunction every 2 seconds

