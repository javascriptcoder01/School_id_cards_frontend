// fieldIcons.js — card field icons ki curated catalog + lazy loaders (pure helpers, Redux nahi).
// Keys BILKUL Backend/src/constants/templateIconCatalog.js jaisi hain (backend unhi ko accept karta hai) —
// ek list badlo to doosri bhi badlo. Icon sets dynamic import se, sirf zaroorat par load hote hain.
import { lazy } from 'react';
import { TEMPLATE_UNITS, MM_PER_PT } from '../constants/template.js';

export const FIELD_ICON_SETS = {
  lucide: 'Lucide',
  fa6: 'Font Awesome',
  md: 'Material',
  io5: 'Ionicons',
  hi2: 'Heroicons',
  bi: 'Bootstrap',
  tb: 'Tabler',
  ri: 'Remix',
  si: 'Brands',
};

export const FIELD_ICON_CATEGORIES = {
  CONTACT: 'Contact',
  LOCATION: 'Location',
  PERSON: 'Person',
  DATES: 'Dates',
  HEALTH: 'Health',
  TRANSPORT: 'Transport',
  SOCIAL: 'Social',
  EDUCATION: 'Education',
  MISC: 'Misc',
};

const RAW = {
  CONTACT: [
    'lucide:Mail', 'lucide:MailOpen', 'lucide:AtSign', 'lucide:Phone', 'lucide:PhoneCall', 'lucide:Smartphone',
    'lucide:MessageCircle', 'lucide:MessageSquare', 'lucide:Globe', 'lucide:Link', 'lucide:Link2', 'lucide:Send',
    'lucide:Headset', 'lucide:Contact', 'lucide:Printer',
    'fa6:FaEnvelope', 'fa6:FaRegEnvelope', 'fa6:FaEnvelopeOpen', 'fa6:FaPhone', 'fa6:FaMobileScreen', 'fa6:FaWhatsapp',
    'fa6:FaGlobe', 'fa6:FaLink', 'fa6:FaFax', 'fa6:FaHeadset', 'fa6:FaComment',
    'md:MdEmail', 'md:MdAlternateEmail', 'md:MdPhone', 'md:MdLocalPhone', 'md:MdSmartphone', 'md:MdContactPhone',
    'md:MdLanguage', 'md:MdPublic', 'md:MdFax', 'md:MdWhatsapp',
    'io5:IoMail', 'io5:IoCall', 'io5:IoPhonePortrait', 'io5:IoGlobe', 'io5:IoLogoWhatsapp',
    'hi2:HiEnvelope', 'hi2:HiPhone', 'hi2:HiDevicePhoneMobile', 'hi2:HiGlobeAlt', 'hi2:HiLink', 'hi2:HiChatBubbleLeftRight',
    'bi:BiEnvelope', 'bi:BiPhone', 'bi:BiMobile', 'bi:BiGlobe', 'bi:BiLogoWhatsapp',
    'tb:TbMail', 'tb:TbPhone', 'tb:TbDeviceMobile', 'tb:TbWorld', 'tb:TbBrandWhatsapp',
    'ri:RiMailLine', 'ri:RiMailFill', 'ri:RiPhoneLine', 'ri:RiPhoneFill', 'ri:RiSmartphoneLine', 'ri:RiGlobalLine',
    'ri:RiWhatsappLine',
  ],
  LOCATION: [
    'lucide:MapPin', 'lucide:Map', 'lucide:House', 'lucide:Building', 'lucide:Building2', 'lucide:School',
    'lucide:Navigation', 'lucide:Compass', 'lucide:Landmark', 'lucide:Locate', 'lucide:Route', 'lucide:Signpost',
    'lucide:Store',
    'fa6:FaLocationDot', 'fa6:FaMapLocationDot', 'fa6:FaHouse', 'fa6:FaBuilding', 'fa6:FaSchool', 'fa6:FaBuildingColumns',
    'fa6:FaRoute', 'fa6:FaCompass',
    'md:MdLocationOn', 'md:MdPlace', 'md:MdHome', 'md:MdApartment', 'md:MdNavigation', 'md:MdSchool',
    'io5:IoLocation', 'io5:IoHome', 'io5:IoBusiness',
    'hi2:HiMapPin', 'hi2:HiHome', 'hi2:HiBuildingLibrary', 'hi2:HiBuildingOffice2',
    'bi:BiMap', 'bi:BiHome', 'bi:BiBuilding',
    'tb:TbMapPin', 'tb:TbHome', 'tb:TbBuildingCommunity', 'tb:TbSchool',
    'ri:RiMapPinLine', 'ri:RiMapPin2Fill', 'ri:RiHome4Line', 'ri:RiBuildingLine',
  ],
  PERSON: [
    'lucide:User', 'lucide:UserRound', 'lucide:Users', 'lucide:UserCheck', 'lucide:IdCard', 'lucide:Badge',
    'lucide:BadgeCheck', 'lucide:GraduationCap', 'lucide:Baby',
    'fa6:FaUser', 'fa6:FaUserGraduate', 'fa6:FaIdCard', 'fa6:FaIdBadge', 'fa6:FaPeopleGroup', 'fa6:FaChalkboardUser',
    'fa6:FaUserTie',
    'md:MdPerson', 'md:MdBadge', 'md:MdFamilyRestroom', 'md:MdSupervisorAccount',
    'io5:IoPerson', 'io5:IoPeople',
    'hi2:HiUser', 'hi2:HiIdentification', 'hi2:HiUserGroup',
    'bi:BiUser', 'bi:BiIdCard',
    'tb:TbUser', 'tb:TbId', 'tb:TbIdBadge2',
    'ri:RiUserLine', 'ri:RiContactsBook2Line', 'ri:RiParentLine',
  ],
  DATES: [
    'lucide:Calendar', 'lucide:CalendarDays', 'lucide:CalendarCheck', 'lucide:Cake', 'lucide:Clock', 'lucide:Timer',
    'lucide:Hourglass', 'lucide:AlarmClock',
    'fa6:FaCalendarDays', 'fa6:FaCalendarCheck', 'fa6:FaCakeCandles', 'fa6:FaClock', 'fa6:FaHourglassHalf',
    'md:MdCalendarToday', 'md:MdEvent', 'md:MdCake', 'md:MdAccessTime',
    'io5:IoCalendar', 'io5:IoTime',
    'hi2:HiCalendar', 'hi2:HiCake', 'hi2:HiClock',
    'bi:BiCalendar', 'bi:BiCake', 'bi:BiTime',
    'tb:TbCalendar', 'tb:TbCake', 'tb:TbClock',
    'ri:RiCalendarLine', 'ri:RiCake2Line', 'ri:RiTimeLine',
  ],
  HEALTH: [
    'lucide:Droplet', 'lucide:Droplets', 'lucide:HeartPulse', 'lucide:Heart', 'lucide:Cross', 'lucide:Stethoscope',
    'lucide:Pill', 'lucide:Ambulance', 'lucide:Hospital', 'lucide:Syringe', 'lucide:Activity',
    'fa6:FaDroplet', 'fa6:FaHeartPulse', 'fa6:FaKitMedical', 'fa6:FaTruckMedical', 'fa6:FaUserDoctor', 'fa6:FaHospital',
    'md:MdBloodtype', 'md:MdLocalHospital', 'md:MdHealthAndSafety', 'md:MdEmergency',
    'io5:IoWater', 'io5:IoHeart', 'io5:IoMedkit',
    'hi2:HiHeart',
    'bi:BiDroplet', 'bi:BiPlusMedical',
    'tb:TbDroplet', 'tb:TbHeartbeat', 'tb:TbFirstAidKit',
    'ri:RiDropLine', 'ri:RiHeartPulseLine', 'ri:RiFirstAidKitLine',
  ],
  TRANSPORT: [
    'lucide:Bus', 'lucide:BusFront', 'lucide:Car', 'lucide:CarFront', 'lucide:Bike', 'lucide:Train', 'lucide:TrainFront',
    'lucide:Plane', 'lucide:Truck',
    'fa6:FaBus', 'fa6:FaCar', 'fa6:FaBicycle', 'fa6:FaVanShuttle', 'fa6:FaTrain',
    'md:MdDirectionsBus', 'md:MdDirectionsCar', 'md:MdDirectionsBike',
    'io5:IoBus', 'io5:IoCar', 'io5:IoBicycle',
    'bi:BiBus', 'bi:BiCar', 'bi:BiCycling',
    'tb:TbBus', 'tb:TbCar', 'tb:TbBike',
    'ri:RiBusLine', 'ri:RiCarLine', 'ri:RiBikeLine',
  ],
  SOCIAL: [
    'fa6:FaFacebook', 'fa6:FaFacebookF', 'fa6:FaInstagram', 'fa6:FaYoutube', 'fa6:FaXTwitter', 'fa6:FaLinkedin',
    'fa6:FaTelegram', 'fa6:FaGoogle',
    'io5:IoLogoFacebook', 'io5:IoLogoInstagram', 'io5:IoLogoYoutube', 'io5:IoLogoLinkedin',
    'bi:BiLogoFacebook', 'bi:BiLogoInstagram', 'bi:BiLogoYoutube', 'bi:BiLogoLinkedin',
    'si:SiWhatsapp', 'si:SiFacebook', 'si:SiInstagram', 'si:SiYoutube', 'si:SiX', 'si:SiTelegram',
    'si:SiGmail', 'si:SiGooglemaps', 'si:SiGoogle', 'si:SiThreads', 'si:SiPinterest', 'si:SiSnapchat',
    'si:SiMessenger', 'si:SiGoogleclassroom', 'si:SiZoom',
  ],
  EDUCATION: [
    'lucide:Book', 'lucide:BookOpen', 'lucide:Library', 'lucide:Pencil', 'lucide:PenTool', 'lucide:Award',
    'lucide:Trophy', 'lucide:Medal', 'lucide:NotebookPen', 'lucide:Backpack', 'lucide:Ruler', 'lucide:Calculator',
    'lucide:FlaskConical', 'lucide:Microscope', 'lucide:Atom', 'lucide:Palette', 'lucide:Music',
    'fa6:FaBook', 'fa6:FaBookOpen', 'fa6:FaPencil', 'fa6:FaAward', 'fa6:FaTrophy', 'fa6:FaMedal', 'fa6:FaGraduationCap',
    'md:MdMenuBook', 'md:MdEmojiEvents',
    'io5:IoBook', 'io5:IoTrophy', 'io5:IoSchool',
    'hi2:HiAcademicCap', 'hi2:HiBookOpen', 'hi2:HiTrophy',
    'bi:BiBook', 'bi:BiTrophy',
    'tb:TbBook', 'tb:TbTrophy',
    'ri:RiBookOpenLine', 'ri:RiTrophyLine', 'ri:RiGraduationCapLine',
  ],
  MISC: [
    'lucide:Star', 'lucide:Shield', 'lucide:ShieldCheck', 'lucide:Info', 'lucide:QrCode', 'lucide:Key', 'lucide:Hash',
    'lucide:Lock', 'lucide:Bell', 'lucide:Flag', 'lucide:Lightbulb', 'lucide:Sun', 'lucide:Moon', 'lucide:Sparkles',
    'lucide:CircleCheck', 'lucide:CircleAlert', 'lucide:Wifi', 'lucide:Camera',
    'fa6:FaStar', 'fa6:FaShieldHalved', 'fa6:FaCircleInfo', 'fa6:FaQrcode', 'fa6:FaKey', 'fa6:FaHashtag', 'fa6:FaFlag',
    'fa6:FaBell', 'fa6:FaLock',
    'md:MdStar', 'md:MdVerifiedUser', 'md:MdInfo', 'md:MdQrCode', 'md:MdVpnKey', 'md:MdTag',
    'io5:IoStar', 'io5:IoShieldCheckmark', 'io5:IoInformationCircle', 'io5:IoQrCode', 'io5:IoKey',
    'hi2:HiStar', 'hi2:HiShieldCheck', 'hi2:HiInformationCircle', 'hi2:HiQrCode', 'hi2:HiKey', 'hi2:HiHashtag',
    'bi:BiStar', 'bi:BiShield', 'bi:BiInfoCircle', 'bi:BiQr', 'bi:BiKey', 'bi:BiHash',
    'tb:TbStar', 'tb:TbShieldCheck', 'tb:TbInfoCircle', 'tb:TbQrcode', 'tb:TbKey', 'tb:TbHash',
    'ri:RiStarLine', 'ri:RiShieldCheckLine', 'ri:RiInformationLine', 'ri:RiQrCodeLine', 'ri:RiKeyLine', 'ri:RiHashtag',
  ],
};

// Search ke liye milte-julte shabd (designer mein "email" likho to envelope bhi mile)
const SYNONYMS = [
  [/mail|envelope|email|gmail|at ?sign/, ['email', 'mail']],
  [/phone|call|mobile|smartphone|device|fax|headset/, ['phone', 'mobile', 'call', 'contact']],
  [/whatsapp|message|chat|comment|send|telegram|messenger/, ['chat', 'message', 'whatsapp']],
  [/globe|world|language|public|global|link/, ['website', 'web', 'internet']],
  [/map|location|pin|place|navigation|route|compass|locate|signpost/, ['address', 'location', 'map']],
  [/home|house/, ['address', 'home']],
  [/building|school|library|landmark|columns|apartment|business|community|office|store/, ['school', 'building', 'address']],
  [/user|person|people|contact|family|parent|supervisor|baby/, ['person', 'student', 'guardian', 'name']],
  [/id|badge|identification/, ['id', 'card', 'roll']],
  [/graduat|academic|chalkboard/, ['student', 'class', 'education']],
  [/calendar|event|today/, ['date', 'dob', 'valid', 'session']],
  [/cake/, ['birthday', 'dob', 'date of birth']],
  [/clock|time|timer|hourglass|alarm/, ['time', 'valid']],
  [/drop|droplet|water|blood/, ['blood', 'blood group']],
  [/heart|pulse|medical|medkit|hospital|doctor|stethoscope|pill|ambulance|syringe|first ?aid|emergency|health|cross|activity/, ['health', 'medical', 'emergency']],
  [/bus|car|bike|bicycle|cycling|train|plane|truck|van/, ['transport', 'bus', 'route']],
  [/facebook|instagram|youtube|twitter|x$|linkedin|threads|pinterest|snapchat|zoom|google/, ['social', 'brand']],
  [/book|pencil|pen|notebook|ruler|calculator|flask|microscope|atom|backpack|palette|music|menu/, ['education', 'subject']],
  [/trophy|award|medal|emoji ?events|star/, ['award', 'achievement']],
  [/shield|verified|lock|key|vpn/, ['security', 'verified']],
  [/qr/, ['qr', 'scan', 'verify']],
  [/hash|tag/, ['number', 'roll']],
];

const SET_PREFIX = /^(Fa|Md|Io|Hi|Bi|Tb|Ri|Si)(Reg)?/;

// "ri:RiMapPin2Fill" → "Map Pin 2 Fill"; "io5:IoLogoWhatsapp" → "Whatsapp"
const labelOf = (key) => {
  const [set, name] = key.split(':');
  const bare = set === 'lucide' ? name : name.replace(SET_PREFIX, '').replace(/^Logo/, '');
  // Picker mein FaEnvelope / FaRegEnvelope alag dikhein (sirf naam; key wahi)
  const outline = set === 'fa6' && /^FaReg/.test(name) ? ' Outline' : '';
  return `${bare
    .replace(/([a-z])([A-Z0-9])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/(\d)([A-Z])/g, '$1 $2')
    .trim()}${outline}`;
};

const tagsOf = (label, category) => {
  const text = label.toLowerCase();
  const tags = new Set([category.toLowerCase()]);
  SYNONYMS.forEach(([pattern, words]) => {
    if (pattern.test(text)) words.forEach((word) => tags.add(word));
  });
  return [...tags];
};

/**
 * Poori catalog: [{ key, set, label, category, tags }]
 */
export const FIELD_ICON_CATALOG = Object.freeze(
  Object.entries(RAW).flatMap(([category, keys]) =>
    keys.map((key) => {
      const label = labelOf(key);
      return Object.freeze({ key, set: key.split(':')[0], label, category, tags: tagsOf(label, category) });
    })
  )
);

export const FIELD_ICON_KEYS = new Set(FIELD_ICON_CATALOG.map((icon) => icon.key));

/* ------------------------------------------------------------------ */
/* Lazy icon components                                                */
/* ------------------------------------------------------------------ */

// Har set alag chhota chunk (fieldIconSets/<set>.js = sirf catalog ke icons), pehli baar zaroorat par download.
// Poori library import NAHI — lucide-react poora main bundle mein aa jata (baaki app uske named icons static leti hai).
const SET_LOADERS = {
  lucide: () => import('./fieldIconSets/lucide.js'),
  fa6: () => import('./fieldIconSets/fa6.js'),
  md: () => import('./fieldIconSets/md.js'),
  io5: () => import('./fieldIconSets/io5.js'),
  hi2: () => import('./fieldIconSets/hi2.js'),
  bi: () => import('./fieldIconSets/bi.js'),
  tb: () => import('./fieldIconSets/tb.js'),
  ri: () => import('./fieldIconSets/ri.js'),
  si: () => import('./fieldIconSets/si.js'),
};

const setCache = new Map();
const componentCache = new Map();

/**
 * Icon set load karta hai (promise cache; fail ho to agli baar dobara try)
 * @param {string} set - e.g. 'fa6'
 */
export const loadIconSet = (set) => {
  if (!SET_LOADERS[set]) return Promise.reject(new Error(`Unknown icon set ${set}`));
  if (!setCache.has(set)) {
    setCache.set(
      set,
      SET_LOADERS[set]().catch((error) => {
        setCache.delete(set);
        throw error;
      })
    );
  }
  return setCache.get(set);
};

// Set load na ho / icon na mile to kuch nahi dikhta (card ka baaki hissa chalta rahe)
const EmptyIcon = () => null;

/**
 * Catalog key → lazy React component (Suspense ke andar render karo). Unknown key → null.
 * Props: size, color, aur SVG attributes (x, y …).
 * @param {string} key - e.g. 'lucide:Mail'
 */
export const getIconComponent = (key) => {
  if (!FIELD_ICON_KEYS.has(key)) return null;
  if (!componentCache.has(key)) {
    const [set, name] = key.split(':');
    componentCache.set(
      key,
      lazy(() =>
        loadIconSet(set)
          .then((lib) => ({ default: lib[name] || EmptyIcon }))
          .catch(() => ({ default: EmptyIcon }))
      )
    );
  }
  return componentCache.get(key);
};

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

const CATALOG_BY_KEY = new Map(FIELD_ICON_CATALOG.map((icon) => [icon.key, icon]));

/** Catalog entry ({ key, set, label, category, tags }) ya null */
export const getIconMeta = (key) => CATALOG_BY_KEY.get(key) || null;

/** Picker trigger ke liye naam: "Mail · Lucide" / "Uploaded icon" / "No icon" */
export const fieldIconName = (icon) => {
  if (!icon) return 'No icon';
  if (icon.source === 'UPLOAD') return 'Uploaded icon';
  const meta = getIconMeta(icon.key);
  return meta ? `${meta.label} · ${FIELD_ICON_SETS[meta.set]}` : 'Unknown icon';
};

/**
 * Label + tags (+ set ka naam) mein search. Har shabd match hona chahiye.
 * @param {string} [query]
 * @param {string|null} [category] - FIELD_ICON_CATEGORIES ki key (CONTACT …); null = sab
 * @param {string|null} [set] - FIELD_ICON_SETS ki key (lucide, fa6 …); null = sab
 * @returns {object[]}
 */
export const searchIcons = (query = '', category = null, set = null) => {
  const words = String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
  return FIELD_ICON_CATALOG.filter((icon) => {
    if (category && icon.category !== category) return false;
    if (set && icon.set !== set) return false;
    if (words.length === 0) return true;
    const text = `${icon.label} ${icon.tags.join(' ')} ${FIELD_ICON_SETS[icon.set]}`.toLowerCase();
    return words.every((word) => text.includes(word));
  });
};

/* ------------------------------------------------------------------ */
/* Geometry — backend PDF (drawFieldIcon) jaise hi numbers              */
/* ------------------------------------------------------------------ */

export const ICON_AUTO_SIZE = 1.1; // × font size
export const ICON_AUTO_GAP = 0.35; // × font size
export const ICON_CHIP_INNER = 0.62; // background chip ke andar icon
// PDF (Helvetica) ki pehli line ki height ≈ 1.156 × font
const PDF_FIRST_LINE = 1.156;

const finite = (value, fallback) => {
  const n = Number(value);
  return value !== null && value !== undefined && value !== '' && Number.isFinite(n) ? n : fallback;
};

/**
 * Field icon kahan bane aur text kahan se shuru ho (sab template units mein).
 * @param {object} icon - renderData field.icon ({ size, gap, position })
 * @param {{ x, y, width, fontUnits, align }} box - text box; align = 'left' | 'center' | 'right'
 * @returns {{ iconX, iconY, size, textX, textY, textWidth }}
 */
export const fieldIconLayout = (icon, { x, y, width, fontUnits, align = 'left' }) => {
  const size = finite(icon?.size, 0) > 0 ? finite(icon.size, 0) : fontUnits * ICON_AUTO_SIZE;
  const gap = Math.max(finite(icon?.gap, fontUnits * ICON_AUTO_GAP), 0);
  const position = icon?.position || 'LEFT';
  const iconY = y + (fontUnits * PDF_FIRST_LINE - size) / 2;

  if (position === 'RIGHT') {
    return { iconX: x + width - size, iconY, size, textX: x, textY: y, textWidth: Math.max(width - size - gap, 1) };
  }
  if (position === 'TOP') {
    const iconX = align === 'center' ? x + (width - size) / 2 : align === 'right' ? x + width - size : x;
    return { iconX, iconY: y, size, textX: x, textY: y + size + gap, textWidth: width };
  }
  return { iconX: x, iconY, size, textX: x + size + gap, textY: y, textWidth: Math.max(width - size - gap, 1) };
};

/**
 * Designer ka icon (draft field) dikhega? backend iconForMode jaisa: sirf ICON / ICON_AND_LABEL par.
 */
export const fieldUsesIcon = (field) =>
  Boolean(field?.icon)
  && (field.displayMode === 'ICON' || field.displayMode === 'ICON_AND_LABEL')
  && Boolean(field.icon.source === 'UPLOAD' ? field.icon.url : field.icon.key);

/**
 * Selection box mein icon bhi: TOP icon box ko upar se lamba karta hai. LEFT / RIGHT text box ke andar hi hain.
 * @param {object} box - fieldBox() ka result
 * @param {object} field - draft field
 * @param {string} unit - TEMPLATE_UNITS
 */
export const withFieldIconBox = (box, field, unit) => {
  if (!fieldUsesIcon(field) || field.icon.position !== 'TOP') return box;
  const fontUnits = (Number(field.fontSize) || 12) * (unit === TEMPLATE_UNITS.MM ? MM_PER_PT : 1);
  const { size, textY } = fieldIconLayout(field.icon, { x: box.x, y: box.y, width: box.width, fontUnits });
  return { ...box, height: Math.max(box.height + (textY - box.y), size) };
};
