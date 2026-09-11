// City hub data for /flooring-in/[city]. One file per city in ./locations/ (Sep 11 2026 split —
// keeps each hub independently editable; key order = order of "Other Service Areas" links).
import markham from './locations/markham.js';
import toronto from './locations/toronto.js';
import stouffville from './locations/stouffville.js';
import richmondHill from './locations/richmond-hill.js';
import pickering from './locations/pickering.js';
import ajax from './locations/ajax.js';
import whitby from './locations/whitby.js';
import vaughan from './locations/vaughan.js';
import woodbridge from './locations/woodbridge.js';
import newmarket from './locations/newmarket.js';
import aurora from './locations/aurora.js';
import scarborough from './locations/scarborough.js';
import oshawa from './locations/oshawa.js';
import durham from './locations/durham.js';

export const locationData = {
  markham,
  toronto,
  stouffville,
  "richmond-hill": richmondHill,
  pickering,
  ajax,
  whitby,
  vaughan,
  woodbridge,
  newmarket,
  aurora,
  scarborough,
  oshawa,
  durham,
};
