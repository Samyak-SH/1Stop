interface Station {
    name: string;
    coordinates: [number, number];
    line: string;
}

export const stationData: Station[] = [    
  { "name": "Nagasandra", "coordinates": [13.0461, 77.5149], "line": "green" },
  { "name": "Dasarahalli", "coordinates": [13.0382, 77.5111], "line": "green" },
  { "name": "Jalahalli", "coordinates": [13.0285, 77.5112], "line": "green" },
  { "name": "Peenya Industry", "coordinates": [13.0195, 77.5156], "line": "green" },
  { "name": "Peenya", "coordinates": [13.0108, 77.5196], "line": "green" },
  { "name": "Goraguntepalya", "coordinates": [13.0054, 77.5304], "line": "green" },
  { "name": "Yeshwanthpur", "coordinates": [13.0071, 77.5541], "line": "green" },
  { "name": "Sandal Soap Factory", "coordinates": [13.0093, 77.5542], "line": "green" },
  { "name": "Mahalakshmi", "coordinates": [13.0039, 77.5586], "line": "green" },
  { "name": "Rajajinagar", "coordinates": [12.9974, 77.5584], "line": "green" },
  { "name": "Kuvempu Road", "coordinates": [12.9923, 77.5584], "line": "green" },
  { "name": "Srirampura", "coordinates": [12.9876, 77.5585], "line": "green" },
  { "name": "Mantri Square Sampige Road", "coordinates": [12.9811, 77.5612], "line": "green" },
  { "name": "Majestic", "coordinates": [12.9776, 77.5728], "line": "green" },
  { "name": "Chickpete", "coordinates": [12.9714, 77.5761], "line": "green" },
  { "name": "Krishna Rajendra Market", "coordinates": [12.9653, 77.5759], "line": "green" },
  { "name": "National College", "coordinates": [12.9584, 77.5731], "line": "green" },
  { "name": "Lalbagh", "coordinates": [12.9513, 77.5735], "line": "green" },
  { "name": "South End Circle", "coordinates": [12.9429, 77.5735], "line": "green" },
  { "name": "Jayanagar", "coordinates": [12.9325, 77.5735], "line": "green" },
  { "name": "Rashtreeya Vidyalaya Road", "coordinates": [12.9241, 77.5734], "line": "green" },
  { "name": "Banashankari", "coordinates": [12.9172, 77.5734], "line": "green" },
  { "name": "Jaya Prakash Nagar", "coordinates": [12.9092, 77.5735], "line": "green" },
  { "name": "Yelachenahalli", "coordinates": [12.8875, 77.5692], "line": "green" },
  { "name": "Konanakunte Cross", "coordinates": [12.8769, 77.5669], "line": "green" },
  { "name": "Doddakallasandra", "coordinates": [12.8686, 77.5675], "line": "green" },
  { "name": "Vajrahalli", "coordinates": [12.8607, 77.5671], "line": "green" },
  { "name": "Thalaghattapura", "coordinates": [12.8496, 77.5635], "line": "green" },
  { "name": "Silk Institute", "coordinates": [12.8393, 77.5614], "line": "green" },
  { "name": "Challaghatta", "coordinates": [12.9576, 77.4782], "line": "purple" },
  { "name": "Kengeri", "coordinates": [12.9691, 77.4866], "line": "purple" },
  { "name": "Kengeri Bus Terminal", "coordinates": [12.9683, 77.4983], "line": "purple" },
  { "name": "Rajarajeshwari Nagar", "coordinates": [12.9615, 77.5114], "line": "purple" },
  { "name": "Jnanabharathi", "coordinates": [12.9516, 77.5207], "line": "purple" },
  { "name": "Pattanagere", "coordinates": [12.9436, 77.5289], "line": "purple" },
  { "name": "Mysore Road", "coordinates": [12.9345, 77.5362], "line": "purple" },
  { "name": "Deepanjali Nagar", "coordinates": [12.9263, 77.5448], "line": "purple" },
  { "name": "Attiguppe", "coordinates": [12.9206, 77.5535], "line": "purple" },
  { "name": "Vijayanagar", "coordinates": [12.9190, 77.5622], "line": "purple" },
  { "name": "Hosahalli", "coordinates": [12.9204, 77.5707], "line": "purple" },
  { "name": "Magadi Road", "coordinates": [12.9746, 77.5698], "line": "purple" },
  { "name": "Majestic", "coordinates": [12.9776, 77.5728], "line": "purple" },
  { "name": "Sir M. Visveshwaraya Station", "coordinates": [12.9783, 77.5792], "line": "purple" },
  { "name": "Vidhana Soudha", "coordinates": [12.9815, 77.5846], "line": "purple" },
  { "name": "Cubbon Park", "coordinates": [12.9828, 77.5910], "line": "purple" },
  { "name": "Mahatma Gandhi Road", "coordinates": [12.9741, 77.5994], "line": "purple" },
  { "name": "Trinity", "coordinates": [12.9742, 77.6077], "line": "purple" },
  { "name": "Halasuru", "coordinates": [12.9750, 77.6157], "line": "purple" },
  { "name": "Indiranagar", "coordinates": [12.9756, 77.6238], "line": "purple" },
  { "name": "Swami Vivekananda Road", "coordinates": [12.9760, 77.6330], "line": "purple" },
  { "name": "Baiyappanahalli", "coordinates": [12.9780, 77.6417], "line": "purple" },
  { "name": "KR Puram", "coordinates": [12.9962, 77.6600], "line": "purple" },
  { "name": "Mahadevapura", "coordinates": [13.0032, 77.6693], "line": "purple" },
  { "name": "Doddanekundi", "coordinates": [13.0125, 77.6781], "line": "purple" },
  { "name": "Marathahalli", "coordinates": [13.0194, 77.6855], "line": "purple" },
  { "name": "Kadubeesanahalli", "coordinates": [13.0277, 77.6938], "line": "purple" },
  { "name": "Bellandur", "coordinates": [13.0351, 77.7031], "line": "purple" },
  { "name": "Iblur", "coordinates": [13.0437, 77.7105], "line": "purple" },
  { "name": "HSR Layout", "coordinates": [13.0496, 77.7201], "line": "purple" },
  { "name": "Silk Board", "coordinates": [13.0582, 77.7283], "line": "purple" },
  { "name": "RV Road", "coordinates": [12.9241, 77.5734], "line": "yellow" },
  { "name": "Jayadeva", "coordinates": [12.9103, 77.6051], "line": "yellow" },
  { "name": "Central Silk Board", "coordinates": [12.9175, 77.6272], "line": "yellow" },
  { "name": "Electronic City", "coordinates": [12.8393, 77.6782], "line": "yellow" },
  { "name": "Bommasandra", "coordinates": [12.8116, 77.6937], "line": "yellow" }
];