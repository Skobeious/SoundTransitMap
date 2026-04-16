const C = { L1:'#28813F', L2:'#007CAD', LT:'#F38B00', LN:'#4A7FA5', LS:'#6B9ABF' }

export const DIAGRAM_LINES = {
  '1LINE': { color: C.L1, name: '1 Line (Link)' },
  '2LINE': { color: C.L2, name: '2 Line (Link)' },
  'TLINE': { color: C.LT, name: 'T Line (Tacoma Link)' },
  'NLINE': { color: C.LN, name: 'N Line (Sounder North)' },
  'SLINE': { color: C.LS, name: 'S Line (Sounder South)' },
}

// Each entry draws one polyline segment
export const DIAGRAM_PATHS = [
  // 1 Line spine — left offset on shared section, continues south
  { line:'1LINE', pts:[[416,60],[416,700],[416,1400]] },
  // 2 Line — right offset on shared spine, then east branch
  { line:'2LINE', pts:[[424,60],[424,700]] },
  { line:'2LINE', pts:[[420,700],[480,760],[780,760],[830,710],[830,290]] },
  // N Line — vertical south, 45° diagonal to King Street
  { line:'NLINE', pts:[[100,60],[100,520],[280,700]] },
  // King Street ↔ ID pedestrian link
  { line:'CONN',  pts:[[280,700],[420,700]], dashed:true },
  // S Line south from King Street
  { line:'SLINE', pts:[[280,700],[280,1430]] },
  // T Line east from Tacoma Dome
  { line:'TLINE', pts:[[280,1430],[790,1430]] },
]

export const DIAGRAM_STATIONS = [
  // ── Shared 1 + 2 Line spine ──
  { id:'LYN', name:'Lynnwood City Center',     x:420, y:60,   lines:['1LINE','2LINE'], lbl:'right' },
  { id:'MLT', name:'Mountlake Terrace',         x:420, y:120,  lines:['1LINE','2LINE'], lbl:'right' },
  { id:'SHN', name:'Shoreline North/185th',     x:420, y:180,  lines:['1LINE','2LINE'], lbl:'right' },
  { id:'SHS', name:'Shoreline South/148th',     x:420, y:240,  lines:['1LINE','2LINE'], lbl:'right' },
  { id:'NGT', name:'Northgate',                 x:420, y:300,  lines:['1LINE','2LINE'], lbl:'right' },
  { id:'ROO', name:'Roosevelt',                 x:420, y:360,  lines:['1LINE','2LINE'], lbl:'right' },
  { id:'UDS', name:'U District',                x:420, y:420,  lines:['1LINE','2LINE'], lbl:'right' },
  { id:'CAP', name:'Capitol Hill',              x:420, y:480,  lines:['1LINE','2LINE'], lbl:'right' },
  { id:'WES', name:'Westlake',                  x:420, y:540,  lines:['1LINE','2LINE'], lbl:'right' },
  { id:'UNS', name:'University Street',         x:420, y:590,  lines:['1LINE','2LINE'], lbl:'right' },
  { id:'PIR', name:'Pioneer Square',            x:420, y:640,  lines:['1LINE','2LINE'], lbl:'right' },
  { id:'IDS', name:"Int'l District",            x:420, y:700,  lines:['1LINE','2LINE'], lbl:'left',  xchg:true },
  // ── 1 Line south ──
  { id:'SOD', name:'SODO',                      x:420, y:760,  lines:['1LINE'], lbl:'right' },
  { id:'BCH', name:'Beacon Hill',               x:420, y:820,  lines:['1LINE'], lbl:'right' },
  { id:'MTB', name:'Mount Baker',               x:420, y:880,  lines:['1LINE'], lbl:'right' },
  { id:'CCT', name:'Columbia City',             x:420, y:940,  lines:['1LINE'], lbl:'right' },
  { id:'OTH', name:'Othello',                   x:420, y:1000, lines:['1LINE'], lbl:'right' },
  { id:'RNB', name:'Rainier Beach',             x:420, y:1060, lines:['1LINE'], lbl:'right' },
  { id:'TKI', name:"Tukwila Int'l Blvd",       x:420, y:1120, lines:['1LINE'], lbl:'right' },
  { id:'STC', name:'SeaTac/Airport',            x:420, y:1185, lines:['1LINE'], lbl:'right' },
  { id:'AGL', name:'Angle Lake',                x:420, y:1240, lines:['1LINE'], lbl:'right' },
  { id:'KDM', name:'Kent/Des Moines',           x:420, y:1295, lines:['1LINE'], lbl:'right' },
  { id:'STL', name:'Star Lake',                 x:420, y:1348, lines:['1LINE'], lbl:'right' },
  { id:'FWT', name:'Federal Way TC',            x:420, y:1400, lines:['1LINE'], lbl:'right' },
  // ── 2 Line east branch ──
  { id:'JUD', name:'Judkins Park',              x:480, y:760,  lines:['2LINE'], lbl:'below' },
  { id:'MRC', name:'Mercer Island',             x:565, y:760,  lines:['2LINE'], lbl:'above' },
  { id:'SBV', name:'South Bellevue',            x:645, y:760,  lines:['2LINE'], lbl:'below' },
  { id:'EMA', name:'East Main',                 x:713, y:760,  lines:['2LINE'], lbl:'above' },
  { id:'BDT', name:'Bellevue Downtown',         x:780, y:760,  lines:['2LINE'], lbl:'below', xchg:true },
  { id:'WIL', name:'Wilburton',                 x:830, y:710,  lines:['2LINE'], lbl:'right' },
  { id:'SPD', name:'Spring District',           x:830, y:650,  lines:['2LINE'], lbl:'right' },
  { id:'BLR', name:'Bel-Red/130th',             x:830, y:590,  lines:['2LINE'], lbl:'right' },
  { id:'OVL', name:'Overlake Village',          x:830, y:530,  lines:['2LINE'], lbl:'right' },
  { id:'RDT', name:'Redmond Technology',        x:830, y:470,  lines:['2LINE'], lbl:'right' },
  { id:'SER', name:'SE Redmond',                x:830, y:410,  lines:['2LINE'], lbl:'right' },
  { id:'MAR', name:'Marymoor Village',          x:830, y:350,  lines:['2LINE'], lbl:'right' },
  { id:'DRD', name:'Downtown Redmond',          x:830, y:290,  lines:['2LINE'], lbl:'right' },
  // ── N Line (Sounder North) ──
  { id:'EVR', name:'Everett',                   x:100, y:60,   lines:['NLINE'], lbl:'right' },
  { id:'MUK', name:'Mukilteo',                  x:100, y:200,  lines:['NLINE'], lbl:'right' },
  { id:'EDM', name:'Edmonds',                   x:100, y:340,  lines:['NLINE'], lbl:'right' },
  { id:'KST', name:'King Street',               x:280, y:700,  lines:['NLINE','SLINE'], lbl:'left', xchg:true },
  // ── S Line (Sounder South) ──
  { id:'TKS', name:'Tukwila',                   x:280, y:820,  lines:['SLINE'], lbl:'left' },
  { id:'KNT', name:'Kent',                      x:280, y:940,  lines:['SLINE'], lbl:'left' },
  { id:'AUB', name:'Auburn',                    x:280, y:1060, lines:['SLINE'], lbl:'left' },
  { id:'SUM', name:'Sumner',                    x:280, y:1180, lines:['SLINE'], lbl:'left' },
  { id:'PUY', name:'Puyallup',                  x:280, y:1300, lines:['SLINE'], lbl:'left' },
  { id:'TCD', name:'Tacoma Dome',               x:280, y:1430, lines:['SLINE','TLINE'], lbl:'left', xchg:true },
  { id:'LKW', name:'Lakewood',                  x:280, y:1520, lines:['SLINE'], lbl:'left' },
  // ── T Line (Tacoma Link) ──
  { id:'FRH', name:'Freighthouse Square',       x:360, y:1430, lines:['TLINE'], lbl:'above' },
  { id:'STD', name:'Stadium',                   x:430, y:1430, lines:['TLINE'], lbl:'below' },
  { id:'TCC', name:'Convention Center',         x:500, y:1430, lines:['TLINE'], lbl:'above' },
  { id:'THD', name:'Theater District',          x:575, y:1430, lines:['TLINE'], lbl:'below' },
  { id:'UNT', name:'Union Station',             x:645, y:1430, lines:['TLINE'], lbl:'above' },
  { id:'HLT', name:'Hilltop',                   x:715, y:1430, lines:['TLINE'], lbl:'below' },
  { id:'STJ', name:'St. Joseph',                x:790, y:1430, lines:['TLINE'], lbl:'above' },
]
