export interface CityData {
  [state: string]: string[];
}

export interface CountryData {
  states: string[];
  cities: CityData;
}

export const CRYPTO_LEGAL_COUNTRIES: Record<string, CountryData> = {
  "United States": {
    states: ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"],
    cities: {
      "California": ["Los Angeles","San Francisco","San Diego","San Jose","Sacramento","Oakland","Fresno","Long Beach"],
      "Texas": ["Houston","Dallas","Austin","San Antonio","Fort Worth","El Paso","Arlington","Plano"],
      "New York": ["New York City","Buffalo","Rochester","Yonkers","Syracuse","Albany","New Rochelle"],
      "Florida": ["Miami","Orlando","Tampa","Jacksonville","Fort Lauderdale","St. Petersburg","Tallahassee"],
      "Illinois": ["Chicago","Aurora","Naperville","Joliet","Rockford","Springfield","Elgin"],
      "Washington": ["Seattle","Spokane","Tacoma","Vancouver","Bellevue","Kirkland","Redmond"],
      "Colorado": ["Denver","Colorado Springs","Aurora","Fort Collins","Lakewood","Thornton","Arvada"],
      "Nevada": ["Las Vegas","Henderson","Reno","Paradise","Sunrise Manor","North Las Vegas"],
      "Arizona": ["Phoenix","Tucson","Mesa","Chandler","Glendale","Scottsdale","Gilbert"],
      "Georgia": ["Atlanta","Columbus","Augusta","Savannah","Athens","Sandy Springs","Macon"],
    }
  },
  "United Kingdom": {
    states: ["England","Scotland","Wales","Northern Ireland"],
    cities: {
      "England": ["London","Manchester","Birmingham","Leeds","Sheffield","Liverpool","Bristol","Newcastle","Nottingham","Leicester"],
      "Scotland": ["Edinburgh","Glasgow","Aberdeen","Dundee","Inverness","Stirling","Perth"],
      "Wales": ["Cardiff","Swansea","Newport","Bangor","Wrexham"],
      "Northern Ireland": ["Belfast","Londonderry","Lisburn","Newry","Armagh"],
    }
  },
  "Canada": {
    states: ["Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador","Nova Scotia","Ontario","Prince Edward Island","Quebec","Saskatchewan","Northwest Territories","Nunavut","Yukon"],
    cities: {
      "Ontario": ["Toronto","Ottawa","Mississauga","Brampton","Hamilton","London","Markham","Vaughan"],
      "British Columbia": ["Vancouver","Victoria","Surrey","Burnaby","Richmond","Kelowna","Abbotsford"],
      "Alberta": ["Calgary","Edmonton","Red Deer","Lethbridge","St. Albert","Medicine Hat"],
      "Quebec": ["Montreal","Quebec City","Laval","Gatineau","Longueuil","Sherbrooke"],
    }
  },
  "Germany": {
    states: ["Baden-Württemberg","Bavaria","Berlin","Brandenburg","Bremen","Hamburg","Hesse","Lower Saxony","Mecklenburg-Vorpommern","North Rhine-Westphalia","Rhineland-Palatinate","Saarland","Saxony","Saxony-Anhalt","Schleswig-Holstein","Thuringia"],
    cities: {
      "Bavaria": ["Munich","Nuremberg","Augsburg","Regensburg","Würzburg","Ingolstadt","Fürth"],
      "North Rhine-Westphalia": ["Cologne","Düsseldorf","Dortmund","Essen","Duisburg","Bochum","Wuppertal"],
      "Berlin": ["Berlin"],
      "Hamburg": ["Hamburg"],
      "Hesse": ["Frankfurt","Wiesbaden","Kassel","Darmstadt","Offenbach"],
      "Baden-Württemberg": ["Stuttgart","Karlsruhe","Mannheim","Freiburg","Heidelberg"],
    }
  },
  "France": {
    states: ["Île-de-France","Auvergne-Rhône-Alpes","Nouvelle-Aquitaine","Occitanie","Hauts-de-France","Grand Est","Provence-Alpes-Côte d'Azur","Pays de la Loire","Normandie","Bretagne","Bourgogne-Franche-Comté","Centre-Val de Loire","Corse"],
    cities: {
      "Île-de-France": ["Paris","Boulogne-Billancourt","Saint-Denis","Argenteuil","Montreuil","Versailles"],
      "Auvergne-Rhône-Alpes": ["Lyon","Grenoble","Saint-Étienne","Clermont-Ferrand","Villeurbanne"],
      "Provence-Alpes-Côte d'Azur": ["Marseille","Nice","Toulon","Aix-en-Provence","Avignon"],
      "Occitanie": ["Toulouse","Montpellier","Nîmes","Perpignan","Béziers"],
      "Hauts-de-France": ["Lille","Amiens","Roubaix","Tourcoing","Dunkerque"],
    }
  },
  "Japan": {
    states: ["Tokyo","Osaka","Kanagawa","Aichi","Saitama","Chiba","Hyogo","Hokkaido","Fukuoka","Shizuoka","Hiroshima","Kyoto","Miyagi","Niigana","Nagano","Okinawa","Gunma","Tochigi","Ibaraki","Ehime"],
    cities: {
      "Tokyo": ["Shinjuku","Shibuya","Akihabara","Harajuku","Ginza","Roppongi","Asakusa","Ikebukuro"],
      "Osaka": ["Osaka City","Sakai","Higashiosaka","Hirakata","Toyonaka"],
      "Kanagawa": ["Yokohama","Kawasaki","Sagamihara","Kamakura","Fujisawa"],
      "Aichi": ["Nagoya","Toyota","Okazaki","Ichinomiya","Kasugai"],
      "Fukuoka": ["Fukuoka City","Kitakyushu","Kurume","Omuta","Iizuka"],
    }
  },
  "Australia": {
    states: ["New South Wales","Victoria","Queensland","Western Australia","South Australia","Tasmania","Australian Capital Territory","Northern Territory"],
    cities: {
      "New South Wales": ["Sydney","Newcastle","Wollongong","Central Coast","Maitland","Coffs Harbour"],
      "Victoria": ["Melbourne","Geelong","Ballarat","Bendigo","Shepparton","Melton"],
      "Queensland": ["Brisbane","Gold Coast","Sunshine Coast","Townsville","Cairns","Toowoomba"],
      "Western Australia": ["Perth","Mandurah","Bunbury","Geraldton","Albany","Kalgoorlie"],
      "South Australia": ["Adelaide","Mount Gambier","Gawler","Whyalla","Murray Bridge"],
    }
  },
  "Singapore": {
    states: ["Central Region","East Region","North Region","North-East Region","West Region"],
    cities: {
      "Central Region": ["Singapore City","Orchard","Marina Bay","Chinatown","Little India"],
      "East Region": ["Tampines","Pasir Ris","Bedok","Changi"],
      "North Region": ["Woodlands","Sembawang","Yishun","Mandai"],
      "North-East Region": ["Sengkang","Hougang","Punggol","Serangoon"],
      "West Region": ["Jurong","Bukit Batok","Choa Chu Kang","Clementi"],
    }
  },
  "Switzerland": {
    states: ["Zurich","Bern","Geneva","Basel","Lucerne","Vaud","Aargau","St. Gallen","Zug","Ticino"],
    cities: {
      "Zurich": ["Zurich","Winterthur","Kloten","Uster","Dübendorf"],
      "Bern": ["Bern","Biel","Thun","Köniz","Langenthal"],
      "Geneva": ["Geneva","Vernier","Lancy","Meyrin","Carouge"],
      "Zug": ["Zug","Baar","Cham","Steinhausen"],
      "Ticino": ["Lugano","Bellinzona","Locarno","Mendrisio"],
    }
  },
  "Netherlands": {
    states: ["North Holland","South Holland","Utrecht","North Brabant","Gelderland","Overijssel","Limburg","Friesland","Groningen","Drenthe","Zeeland","Flevoland"],
    cities: {
      "North Holland": ["Amsterdam","Haarlem","Zaandam","Alkmaar","Hilversum","Purmerend"],
      "South Holland": ["Rotterdam","The Hague","Dordrecht","Leiden","Delft","Zoetermeer"],
      "Utrecht": ["Utrecht","Amersfoort","Nieuwegein","Veenendaal","Houten"],
      "North Brabant": ["Eindhoven","Tilburg","Breda","Helmond","Den Bosch"],
    }
  },
  "Brazil": {
    states: ["São Paulo","Rio de Janeiro","Minas Gerais","Bahia","Paraná","Rio Grande do Sul","Pernambuco","Ceará","Pará","Santa Catarina","Goiás","Amazonas","Espírito Santo","Mato Grosso","Mato Grosso do Sul","Maranhão","Piauí","Alagoas","Sergipe","Paraíba","Roraima","Amapá","Acre","Tocantins","Rondônia","Distrito Federal"],
    cities: {
      "São Paulo": ["São Paulo","Guarulhos","Campinas","Santos","Ribeirão Preto","São Bernardo do Campo"],
      "Rio de Janeiro": ["Rio de Janeiro","Niterói","Nova Iguaçu","Duque de Caxias","Belford Roxo"],
      "Minas Gerais": ["Belo Horizonte","Uberlândia","Contagem","Juiz de Fora","Betim"],
      "Paraná": ["Curitiba","Londrina","Maringá","Ponta Grossa","Cascavel"],
      "Bahia": ["Salvador","Feira de Santana","Vitória da Conquista","Camaçari"],
    }
  },
  "Mexico": {
    states: ["Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua","Ciudad de México","Coahuila","Colima","Durango","Estado de México","Guanajuato","Guerrero","Hidalgo","Jalisco","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas"],
    cities: {
      "Ciudad de México": ["Mexico City","Tlalpan","Xochimilco","Coyoacán","Gustavo A. Madero"],
      "Jalisco": ["Guadalajara","Zapopan","Tlaquepaque","Tonalá","San Pedro Tlaquepaque"],
      "Nuevo León": ["Monterrey","San Nicolás","Guadalupe","San Pedro Garza García","Apodaca"],
      "Puebla": ["Puebla","Tehuacán","San Andrés Cholula","Cuautlancingo"],
      "Yucatán": ["Mérida","Progreso","Valladolid","Tizimín"],
    }
  },
  "India": {
    states: ["Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"],
    cities: {
      "Maharashtra": ["Mumbai","Pune","Nagpur","Thane","Nashik","Aurangabad","Solapur"],
      "Karnataka": ["Bangalore","Mysore","Hubli","Mangalore","Belgaum","Gulbarga"],
      "Delhi": ["New Delhi","Dwarka","Rohini","Saket","Lajpat Nagar"],
      "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem"],
      "Telangana": ["Hyderabad","Warangal","Nizamabad","Karimnagar","Khammam"],
      "Uttar Pradesh": ["Lucknow","Kanpur","Agra","Varanasi","Allahabad","Meerut"],
      "West Bengal": ["Kolkata","Howrah","Durgapur","Asansol","Siliguri"],
      "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Gandhinagar","Bhavnagar"],
    }
  },
  "South Korea": {
    states: ["Seoul","Busan","Incheon","Daegu","Daejeon","Gwangju","Ulsan","Gyeonggi","Gangwon","North Chungcheong","South Chungcheong","North Jeolla","South Jeolla","North Gyeongsang","South Gyeongsang","Jeju"],
    cities: {
      "Seoul": ["Gangnam","Mapo","Jongno","Seocho","Songpa","Yongsan","Seongdong"],
      "Busan": ["Haeundae","Suyeong","Yeonje","Nam","Dong"],
      "Gyeonggi": ["Suwon","Seongnam","Goyang","Yongin","Bucheon","Ansan"],
      "Incheon": ["Jung","Nam","Namdong","Yeonsu","Seo"],
    }
  },
  "United Arab Emirates": {
    states: ["Abu Dhabi","Dubai","Sharjah","Ajman","Umm Al Quwain","Ras Al Khaimah","Fujairah"],
    cities: {
      "Dubai": ["Downtown Dubai","Business Bay","Jumeirah","Deira","Bur Dubai","Dubai Marina","JLT"],
      "Abu Dhabi": ["Abu Dhabi City","Al Ain","Al Gharbia","Khalifa City","Masdar City"],
      "Sharjah": ["Sharjah City","Al Dhaid","Khor Fakkan","Kalba"],
    }
  },
  "Portugal": {
    states: ["Lisboa","Porto","Braga","Setúbal","Aveiro","Leiria","Faro","Coimbra","Santarém","Évora","Beja","Guarda","Viana do Castelo","Vila Real","Castelo Branco","Portalegre","Bragança","Açores","Madeira"],
    cities: {
      "Lisboa": ["Lisbon","Sintra","Cascais","Loures","Amadora","Almada"],
      "Porto": ["Porto","Vila Nova de Gaia","Matosinhos","Gondomar","Maia","Valongo"],
      "Braga": ["Braga","Guimarães","Barcelos","Famalicão"],
      "Faro": ["Faro","Portimão","Albufeira","Loulé","Tavira"],
    }
  },
  "Spain": {
    states: ["Andalusia","Aragon","Asturias","Balearic Islands","Basque Country","Canary Islands","Cantabria","Castile-La Mancha","Castile and León","Catalonia","Extremadura","Galicia","La Rioja","Community of Madrid","Region of Murcia","Navarre","Valencian Community"],
    cities: {
      "Community of Madrid": ["Madrid","Móstoles","Alcalá de Henares","Fuenlabrada","Leganés"],
      "Catalonia": ["Barcelona","Hospitalet","Badalona","Terrassa","Sabadell","Lleida"],
      "Andalusia": ["Seville","Málaga","Córdoba","Granada","Almería","Jerez"],
      "Valencian Community": ["Valencia","Alicante","Elche","Castellón"],
      "Basque Country": ["Bilbao","San Sebastián","Vitoria-Gasteiz","Barakaldo"],
    }
  },
  "Italy": {
    states: ["Abruzzo","Basilicata","Calabria","Campania","Emilia-Romagna","Friuli-Venezia Giulia","Lazio","Liguria","Lombardy","Marche","Molise","Piedmont","Apulia","Sardinia","Sicily","Tuscany","Trentino-Alto Adige","Umbria","Aosta Valley","Veneto"],
    cities: {
      "Lombardy": ["Milan","Bergamo","Brescia","Monza","Como","Pavia"],
      "Lazio": ["Rome","Latina","Frosinone","Viterbo","Rieti"],
      "Campania": ["Naples","Salerno","Caserta","Benevento","Avellino"],
      "Sicily": ["Palermo","Catania","Messina","Syracuse","Trapani"],
      "Tuscany": ["Florence","Prato","Livorno","Pisa","Arezzo","Siena"],
      "Veneto": ["Venice","Verona","Padova","Vicenza","Treviso"],
    }
  },
  "El Salvador": {
    states: ["Ahuachapán","Cabañas","Chalatenango","Cuscatlán","La Libertad","La Paz","La Unión","Morazán","San Miguel","San Salvador","San Vicente","Santa Ana","Sonsonate","Usulután"],
    cities: {
      "San Salvador": ["San Salvador","Soyapango","Santa Tecla","Mejicanos","Apopa"],
      "Santa Ana": ["Santa Ana","Chalchuapa","Metapán"],
      "San Miguel": ["San Miguel","Ciudad Barrios","Moncagua"],
    }
  },
  "Argentina": {
    states: ["Buenos Aires","Catamarca","Chaco","Chubut","Córdoba","Corrientes","Entre Ríos","Formosa","Jujuy","La Pampa","La Rioja","Mendoza","Misiones","Neuquén","Río Negro","Salta","San Juan","San Luis","Santa Cruz","Santa Fe","Santiago del Estero","Tierra del Fuego","Tucumán","Ciudad de Buenos Aires"],
    cities: {
      "Ciudad de Buenos Aires": ["Buenos Aires","Palermo","San Telmo","Belgrano","Recoleta"],
      "Córdoba": ["Córdoba","Villa Carlos Paz","Río Cuarto","San Francisco","Villa María"],
      "Mendoza": ["Mendoza","San Rafael","Godoy Cruz","Las Heras","Guaymallén"],
      "Santa Fe": ["Rosario","Santa Fe","Venado Tuerto","Rafaela","Villa Constitución"],
    }
  },
  "South Africa": {
    states: ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Limpopo","Mpumalanga","North West","Free State","Northern Cape"],
    cities: {
      "Gauteng": ["Johannesburg","Pretoria","Soweto","Sandton","Randburg","Midrand"],
      "Western Cape": ["Cape Town","Stellenbosch","Paarl","George","Oudtshoorn"],
      "KwaZulu-Natal": ["Durban","Pietermaritzburg","Richards Bay","Newcastle","Ladysmith"],
      "Eastern Cape": ["Port Elizabeth","East London","Mthatha","Uitenhage","Queenstown"],
    }
  },
  "Poland": {
    states: ["Lower Silesia","Kuyavian-Pomeranian","Lublin","Lubusz","Łódź","Lesser Poland","Masovian","Opole","Subcarpathian","Podlaskie","Pomeranian","Silesian","Holy Cross","Warmian-Masurian","Greater Poland","West Pomeranian"],
    cities: {
      "Masovian": ["Warsaw","Radom","Płock","Siedlce","Ostrołęka"],
      "Silesian": ["Katowice","Częstochowa","Sosnowiec","Gliwice","Zabrze","Bytom"],
      "Lesser Poland": ["Kraków","Tarnów","Nowy Sącz","Oświęcim"],
      "Greater Poland": ["Poznań","Kalisz","Gniezno","Konin","Piła"],
      "Pomeranian": ["Gdańsk","Gdynia","Sopot","Słupsk","Tczew"],
    }
  },
  "Turkey": {
    states: ["Istanbul","Ankara","Izmir","Bursa","Antalya","Adana","Konya","Gaziantep","Kocaeli","Mersin","Diyarbakır","Hatay","Manisa","Kayseri","Samsun","Balıkesir","Kahramanmaraş","Van","Aydın","Tekirdağ"],
    cities: {
      "Istanbul": ["Kadıköy","Beşiktaş","Fatih","Üsküdar","Beyoğlu","Bakırköy","Şişli"],
      "Ankara": ["Çankaya","Keçiören","Mamak","Yenimahalle","Etimesgut"],
      "Izmir": ["Konak","Karşıyaka","Bornova","Buca","Bayraklı"],
      "Antalya": ["Muratpaşa","Kepez","Alanya","Manavgat"],
    }
  },
  "Ukraine": {
    states: ["Kyiv","Kharkiv","Odessa","Dnipro","Donetsk","Zaporizhzhia","Lviv","Kryvyi Rih","Mykolaiv","Mariupol","Luhansk","Vinnytsia","Makiivka","Sevastopol","Simferopol"],
    cities: {
      "Kyiv": ["Kyiv"],
      "Kharkiv": ["Kharkiv","Lozova","Chuhuiv","Izium"],
      "Odessa": ["Odessa","Bilhorod-Dnistrovskyi","Izmayil","Chornomorsk"],
      "Lviv": ["Lviv","Drohobych","Stryi","Boryslav"],
    }
  },
  "Israel": {
    states: ["Tel Aviv","Jerusalem","Haifa","Be'er Sheva","Rishon LeZion","Petah Tikva","Ashdod","Netanya","Holon","B'nei B'raq","Ramat Gan","Rehovot","Bat Yam","Ashkelon","Herzliya","Kfar Saba","Eilat","Ra'anana","Nazareth","Hadera"],
    cities: {
      "Tel Aviv": ["Tel Aviv","Jaffa","Florentin"],
      "Jerusalem": ["Jerusalem","Ein Karem","Malha"],
      "Haifa": ["Haifa","Hadar","Neve Sha'anan"],
    }
  },
  "Nigeria": {
    states: ["Lagos","Abuja","Kano","Ibadan","Kaduna","Port Harcourt","Benin City","Maiduguri","Zaria","Aba","Jos","Enugu","Onitsha","Warri","Sokoto","Abeokuta","Oyo","Mushin","Ado-Ekiti","Akure"],
    cities: {
      "Lagos": ["Lagos Island","Victoria Island","Lekki","Ikeja","Surulere","Yaba","Apapa"],
      "Abuja": ["Garki","Wuse","Maitama","Asokoro","Gwarinpa"],
      "Kano": ["Kano City","Wudil","Bichi","Gwarzo"],
    }
  },
  "Kenya": {
    states: ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Malindi","Kitale","Garissa","Kakamega","Nyeri","Meru","Machakos","Uasin Gishu","Kiambu"],
    cities: {
      "Nairobi": ["Westlands","Kilimani","Karen","Eastleigh","Kasarani","Embakasi"],
      "Mombasa": ["Old Town","Nyali","Likoni","Kisauni"],
      "Kisumu": ["Kisumu City","Mamboleo","Milimani"],
    }
  },
  "Ghana": {
    states: ["Greater Accra","Ashanti","Western","Central","Eastern","Northern","Volta","Brong-Ahafo","Upper East","Upper West"],
    cities: {
      "Greater Accra": ["Accra","Tema","Madina","Adenta","Dome","Kasoa","Teshie"],
      "Ashanti": ["Kumasi","Obuasi","Ejisu","Konongo","Mampong"],
      "Western": ["Takoradi","Tarkwa","Axim","Prestea"],
    }
  },
  "Philippines": {
    states: ["NCR","Ilocos","Cagayan Valley","Central Luzon","CALABARZON","MIMAROPA","Bicol","Western Visayas","Central Visayas","Eastern Visayas","Zamboanga Peninsula","Northern Mindanao","Davao","SOCCSKSARGEN","Caraga","ARMM","CAR","NIR"],
    cities: {
      "NCR": ["Manila","Quezon City","Caloocan","Makati","Taguig","Pasig","Marikina","Parañaque"],
      "Central Visayas": ["Cebu City","Mandaue","Lapu-Lapu","Talisay","Danao"],
      "Davao": ["Davao City","Tagum","Panabo","Samal","Digos"],
      "Central Luzon": ["Angeles","San Fernando","Olongapo","Malolos","Cabanatuan"],
    }
  },
  "Thailand": {
    states: ["Bangkok","Chiang Mai","Phuket","Pattaya","Nonthaburi","Pathum Thani","Samut Prakan","Samut Sakhon","Rayong","Chonburi","Khon Kaen","Udon Thani","Nakhon Ratchasima","Songkhla","Surat Thani"],
    cities: {
      "Bangkok": ["Sukhumvit","Silom","Siam","Chatuchak","On Nut","Sathorn"],
      "Chiang Mai": ["Nimman","Old City","Santitham","Hang Dong"],
      "Phuket": ["Patong","Kata","Karon","Rawai","Chalong"],
    }
  },
  "Hong Kong": {
    states: ["Hong Kong Island","Kowloon","New Territories"],
    cities: {
      "Hong Kong Island": ["Central","Wan Chai","Causeway Bay","Aberdeen","Ap Lei Chau"],
      "Kowloon": ["Tsim Sha Tsui","Mong Kok","Yau Ma Tei","Kwun Tong","Kowloon Bay"],
      "New Territories": ["Sha Tin","Tuen Mun","Yuen Long","Tai Po","Sai Kung"],
    }
  },
  "New Zealand": {
    states: ["Auckland","Bay of Plenty","Canterbury","Gisborne","Hawke's Bay","Manawatu-Whanganui","Marlborough","Nelson","Northland","Otago","Southland","Taranaki","Tasman","Waikato","Wellington","West Coast"],
    cities: {
      "Auckland": ["Auckland City","North Shore","Waitakere","Manukau","Hamilton"],
      "Wellington": ["Wellington City","Lower Hutt","Upper Hutt","Porirua"],
      "Canterbury": ["Christchurch","Timaru","Ashburton","Rangiora"],
    }
  },
  "Sweden": {
    states: ["Stockholm","Västra Götaland","Skåne","Uppsala","Östergötland","Jönköping","Halland","Örebro","Dalarna","Gävleborg","Västmanland","Norrbotten","Västernorrland","Värmland","Jämtland","Sörmland","Blekinge","Västerbotten","Kronoberg","Kalmar","Gotland"],
    cities: {
      "Stockholm": ["Stockholm","Solna","Sundbyberg","Södertälje","Huddinge"],
      "Västra Götaland": ["Gothenburg","Borås","Mölndal","Trollhättan","Skövde"],
      "Skåne": ["Malmö","Helsingborg","Lund","Kristianstad","Hässleholm"],
    }
  },
  "Norway": {
    states: ["Oslo","Viken","Innlandet","Vestfold og Telemark","Agder","Rogaland","Vestland","Møre og Romsdal","Trøndelag","Nordland","Troms og Finnmark"],
    cities: {
      "Oslo": ["Oslo","Bærum","Asker"],
      "Viken": ["Fredrikstad","Sarpsborg","Drammen","Lillestrøm","Jessheim"],
      "Rogaland": ["Stavanger","Sandnes","Haugesund","Bryne","Egersund"],
      "Vestland": ["Bergen","Ålesund","Florø","Voss"],
    }
  },
  "Denmark": {
    states: ["Capital Region","Central Denmark","North Denmark","Region Zealand","Southern Denmark"],
    cities: {
      "Capital Region": ["Copenhagen","Frederiksberg","Gentofte","Gladsaxe","Ballerup"],
      "Central Denmark": ["Aarhus","Viborg","Herning","Silkeborg","Randers"],
      "Southern Denmark": ["Odense","Esbjerg","Kolding","Vejle","Horsens"],
    }
  },
  "Finland": {
    states: ["Uusimaa","Pirkanmaa","Southwest Finland","North Ostrobothnia","Central Finland","Ostrobothnia","South Karelia","Kanta-Häme","Satakunta","North Savo","South Savo","Kymenlaakso","Päijät-Häme","Lapland","North Karelia","South Ostrobothnia","Central Ostrobothnia","Kainuu","Tavastia Proper","Åland"],
    cities: {
      "Uusimaa": ["Helsinki","Espoo","Vantaa","Tampere","Turku"],
      "Pirkanmaa": ["Tampere","Nokia","Kangasala","Ylöjärvi"],
      "Southwest Finland": ["Turku","Naantali","Raisio","Kaarina"],
    }
  },
  "Colombia": {
    states: ["Bogotá D.C.","Antioquia","Valle del Cauca","Cundinamarca","Atlántico","Bolívar","Santander","Córdoba","Nariño","Cauca","Tolima","Meta","Boyacá","Magdalena","Cesar","Chocó","Huila","La Guajira","Sucre","Norte de Santander"],
    cities: {
      "Bogotá D.C.": ["Bogotá","Usaquén","Chapinero","Santa Fe","Suba","Kennedy"],
      "Antioquia": ["Medellín","Bello","Itagüí","Envigado","Bucaramanga"],
      "Valle del Cauca": ["Cali","Buenaventura","Palmira","Buga","Tuluá"],
    }
  },
  "Chile": {
    states: ["Arica y Parinacota","Tarapacá","Antofagasta","Atacama","Coquimbo","Valparaíso","Metropolitana de Santiago","O'Higgins","Maule","Ñuble","Biobío","La Araucanía","Los Ríos","Los Lagos","Aysén","Magallanes"],
    cities: {
      "Metropolitana de Santiago": ["Santiago","Puente Alto","Maipú","La Florida","Las Condes","Providencia"],
      "Valparaíso": ["Valparaíso","Viña del Mar","Quilpué","Villa Alemana","Concón"],
      "Biobío": ["Concepción","Talcahuano","Chillán","Los Ángeles","Coronel"],
    }
  },
  "Peru": {
    states: ["Lima","Arequipa","La Libertad","Piura","Lambayeque","Junín","Cusco","Áncash","Loreto","Ica","San Martín","Cajamarca","Huánuco","Puno","Ucayali","Tacna","Tumbes","Moquegua","Madre de Dios","Huancavelica","Apurímac","Pasco","Amazonas","Ayacucho","Callao"],
    cities: {
      "Lima": ["Lima City","Miraflores","San Isidro","Barranco","Surco","La Molina"],
      "Arequipa": ["Arequipa","Cayma","Cerro Colorado","Paucarpata"],
      "Cusco": ["Cusco","Wanchaq","San Sebastián","San Jerónimo"],
    }
  },
  "Panama": {
    states: ["Bocas del Toro","Chiriquí","Coclé","Colón","Darién","Herrera","Los Santos","Panamá","Panamá Oeste","Veraguas","Guna Yala","Emberá","Ngäbe-Buglé","Naso Tjër Di"],
    cities: {
      "Panamá": ["Panama City","San Miguelito","Tocumen","Pacora","Alcalde Díaz"],
      "Chiriquí": ["David","Boquete","La Concepción","Bugaba"],
      "Colón": ["Colón City","La Pintada","Portobelo"],
    }
  },
  "Estonia": {
    states: ["Harjumaa","Hiiumaa","Ida-Virumaa","Järvamaa","Jõgevamaa","Läänemaa","Lääne-Virumaa","Põlvamaa","Pärnumaa","Raplamaa","Saaremaa","Tartumaa","Valgamaa","Viljandimaa","Võrumaa"],
    cities: {
      "Harjumaa": ["Tallinn","Maardu","Keila","Saue","Paldiski"],
      "Tartumaa": ["Tartu","Elva","Räpina","Põlva"],
      "Ida-Virumaa": ["Narva","Kohtla-Järve","Sillamäe","Jõhvi"],
    }
  },
  "Malta": {
    states: ["Northern Malta","Northern Harbour","Southern Harbour","Western Malta","Gozo and Comino"],
    cities: {
      "Northern Harbour": ["Valletta","Msida","Gżira","Sliema","St. Julian's"],
      "Northern Malta": ["Birkirkara","Qormi","Mosta","St. Paul's Bay"],
      "Southern Harbour": ["Birżebbuġa","Marsaxlokk","Żejtun"],
      "Gozo and Comino": ["Victoria","Żebbuġ","Nadur","Mgarr"],
    }
  },
  "Luxembourg": {
    states: ["Luxembourg","Esch-sur-Alzette","Diekirch","Grevenmacher","Remich","Wiltz","Vianden","Clervaux","Mersch","Echternach","Redange"],
    cities: {
      "Luxembourg": ["Luxembourg City","Strassen","Bertrange","Hesperange"],
      "Esch-sur-Alzette": ["Esch-sur-Alzette","Differdange","Dudelange","Petange"],
    }
  },
};

export const CRYPTO_COUNTRY_NAMES = Object.keys(CRYPTO_LEGAL_COUNTRIES).sort();

export function getStates(country: string): string[] {
  return CRYPTO_LEGAL_COUNTRIES[country]?.states ?? [];
}

export function getCities(country: string, state: string): string[] {
  return CRYPTO_LEGAL_COUNTRIES[country]?.cities[state] ?? [];
}
