import React, {useEffect} from 'react';
import '../../Map.css';
import {Map, View} from 'ol';
import {Vector as LayerVector} from 'ol/layer';
import TileLayer from 'ol/layer/Tile';
import {TileJSON, Vector} from "ol/source";
import {Attribution, defaults} from "ol/control";
import {fromLonLat} from "ol/proj";
import {GeoJSON} from "ol/format";
import {Fill, Stroke, Style, Circle} from "ol/style";

const MapComponent = () => {
    useEffect(() => {
        const attribution = new Attribution({
            collapsible: false,
        });

        const source = new TileJSON({
            url: `https://api.maptiler.com/maps/streets-v2/tiles.json?key=${process.env.REACT_APP_MAPTILER_KEY}`, // source URL
            tileSize: 512,
            crossOrigin: 'anonymous'
        });

        const map = new Map({
            layers: [
                new TileLayer({
                    source: source
                })
            ],
            controls: defaults({attribution: false}).extend([attribution]),
            target: 'map',
            view: new View({
                constrainResolution: true,
                center: fromLonLat([27.555696, 53.902735,]), // starting position [lng, lat]
                zoom: 12, // starting zoom,
            }),

        });

        const layer = new LayerVector({
            source: new Vector({
                url: `${process.env.REACT_APP_SERVER_ADDRESS}/api/data`,
                format: new GeoJSON(),
            }),
            style: new Style({
                stroke: new Stroke({
                    color: 'rgba(0, 136, 136, 0.8)',
                }),
                fill: new Fill({
                    color: 'rgba(0, 136, 136, 0.2)',
                }),
                image: new Circle({
                    radius: 6,
                    fill: new Fill({color: 'blue'}),
                    stroke: new Stroke({
                        color: [0, 0, 255], width: 2
                    })
                })
            })
        });

        map.addLayer(layer);
    }, []);


    return (
        <div id="map">
            <a href="https://www.maptiler.com" style={{position: "absolute", left: "10px", bottom: "10px", zIndex: 999}}>
                <img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo"/>
            </a>
        </div>
    );
};

export default MapComponent;