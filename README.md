Leaflet Routing Machine / Valhalla by Mapzen
=====================================


     ██▒   █▓ ▄▄▄       ██▓     ██░ ██  ▄▄▄       ██▓     ██▓    ▄▄▄      
    ▓██░   █▒▒████▄    ▓██▒    ▓██░ ██▒▒████▄    ▓██▒    ▓██▒   ▒████▄    
     ▓██  █▒░▒██  ▀█▄  ▒██░    ▒██▀▀██░▒██  ▀█▄  ▒██░    ▒██░   ▒██  ▀█▄  
      ▒██ █░░░██▄▄▄▄██ ▒██░    ░▓█ ░██ ░██▄▄▄▄██ ▒██░    ▒██░   ░██▄▄▄▄██ 
       ▒▀█░   ▓█   ▓██▒░██████▒░▓█▒░██▓ ▓█   ▓██▒░██████▒░██████▒▓█   ▓██▒
       ░ ▐░   ▒▒   ▓▒█░░ ▒░▓  ░ ▒ ░░▒░▒ ▒▒   ▓▒█░░ ▒░▓  ░░ ▒░▓  ░▒▒   ▓▒█░
       ░ ░░    ▒   ▒▒ ░░ ░ ▒  ░ ▒ ░▒░ ░  ▒   ▒▒ ░░ ░ ▒  ░░ ░ ▒  ░ ▒   ▒▒ ░
         ░░    ░   ▒     ░ ░    ░  ░░ ░  ░   ▒     ░ ░     ░ ░    ░   ▒   
          ░        ░  ░    ░  ░ ░  ░  ░      ░  ░    ░  ░    ░  ░     ░  ░
         ░                                                                    


Extends [Leaflet Routing Machine](https://github.com/perliedman/leaflet-routing-machine) with support for [Valhalla](https://mapzen.com/projects/valhalla).

## Installing

You can install it through npm. Download link will come soon.

    npm install lrm-valhalla

## Running example

Examples is inside of examples folder. To run example, you need api key for Valhalla first which you can get for free from [mapzen.com/developers](https://mapzen.com/developers). After pasting your api key inside of example's [index.js](https://github.com/valhalla/lrm-valhalla/blob/master/examples/index.js#L23), turn on the local server. I am putting python simple server as example, but whatever local server you prefer would do a job.
    
    python -m SimpleHTTPServer 

Then check localhost:8000/exmaples on your browser, all assets to run valhalla are inside of examples folder.

## Using

You can use Valhalla routing machine with Leaflet Routing Machine plugin by replacing Router and Formatter instance. 

    var rr = L.Routing.control({
      // you can get api key from Mapzen developer (https://mapzen.com/developers)
      router: L.Routing.valhalla('my-api-key','auto'),
      formatter: new L.Routing.Valhalla.Formatter()
    }).addTo(map);


You can change transitmode for routing later by passing the options.
Currently (June 2015), Valhalla supports auto, bicycle, and pedestrian mode for routing.

     rr.route({transitmode: 'auto'});
