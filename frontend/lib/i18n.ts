export interface TranslationDictionary {
  sihTag: string;
  subtitle: string;
  navHome: string;
  navChat: string;
  navSources: string;
  navGarden: string;
  navVault: string;
  navExperts: string;
  
  // Hero
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  analyzeBtn: string;
  popularLabel: string;
  
  // Chat
  chatHeader: string;
  chatSubtitle: string;
  askPlaceholder: string;
  askBtn: string;
  suggestedLabel: string;
  citationsLabel: string;
  copyBtn: string;
  copiedBtn: string;
  
  // Sources
  sourcesTitle: string;
  sourcesSubtitle: string;
  searchSourcesPlaceholder: string;
  
  // Jurisdiction Breakdown
  jurisdictionTitle: string;
  jurisdictionSubtitle: string;
  
  // Garden
  gardenTitle: string;
  gardenSubtitle: string;
  exploreBtn: string;
}

export class I18n {
  static translations: Record<string, TranslationDictionary> = {
    EN: {
      sihTag: "IP-SAKTI Sahayak",
      subtitle: "AI Assistant for Ayurveda IP & Regulatory Compliance",
      navHome: "Home",
      navChat: "AI Research Chat",
      navSources: "Source Library",
      navGarden: "Knowledge Garden",
      navVault: "Formula Vault",
      navExperts: "Experts",

      heroBadge: "EVIDENCE-FIRST AYURVEDA IP INTELLIGENCE",
      heroTitle1: "Master Ayurveda's IP & Regulatory Framework with ",
      heroTitle2: "Absolute Grounding.",
      heroSubtitle: "Source-grounded AI assistant powered by Gemini & 22 official statutory PDFs. Get instant, page-cited answers for Section 3(p), ABS, TKDL, and Rule 158-B.",
      searchPlaceholder: "Ask anything: Section 3(p), ABS guidelines, CITES, Rule 158-B...",
      analyzeBtn: "Analyze Query",
      popularLabel: "Try asking:",

      chatHeader: "DR. AYURVEDIC SATHI RESPONSE",
      chatSubtitle: "Source-Grounded Statutory AI Synthesis",
      askPlaceholder: "Type your statutory question or formula inquiry...",
      askBtn: "Ask Sathi",
      suggestedLabel: "SUGGESTED STATUTORY QUERIES:",
      citationsLabel: "Retrieved Statutory References",
      copyBtn: "Copy",
      copiedBtn: "Copied",

      sourcesTitle: "Official PDF Source Library",
      sourcesSubtitle: "Trusted statutory gazettes, prior art databases, AYUSH pharmacopoeial monographs, and international treaties indexed by IP-SAKTI.",
      searchSourcesPlaceholder: "Search by title, filename, category, or legal section...",

      jurisdictionTitle: "Jurisdiction & Country Regulatory Breakdown",
      jurisdictionSubtitle: "Compare compliance rules across India, USA, Europe, and Gulf Countries",

      gardenTitle: "Knowledge Garden",
      gardenSubtitle: "Explore structured statutory knowledge clusters indexed from official gazettes and treaties.",
      exploreBtn: "Explore Domain"
    },

    HI: {
      sihTag: "आईपी-शक्ति सहायक",
      subtitle: "आयुर्वेद बौद्धिक संपदा (IP) एवं नियामक अनुपालन प्रणाली",
      navHome: "मुख्य पृष्ठ",
      navChat: "एआई शोध चैट",
      navSources: "स्रोत पुस्तकालय",
      navGarden: "ज्ञान वाटिका",
      navVault: "औषधि वॉल्ट",
      navExperts: "विशेषज्ञ",

      heroBadge: "साक्ष्य-आधारित आयुर्वेद बौद्धिक संपदा बुद्धिमत्ता",
      heroTitle1: "आयुर्वेद के IP एवं नियामक ढांचे को समझें ",
      heroTitle2: "पूर्ण प्रमाणिकता के साथ।",
      heroSubtitle: "जैमिनी और 22 आधिकारिक वैधानिक पीडीएफ द्वारा संचालित AI सहायक। धारा 3(p), ABS, TKDL और नियम 158-B हेतु पृष्ठ-उद्धृत उत्तर प्राप्त करें।",
      searchPlaceholder: "कुछ भी पूछें: धारा 3(p), ABS दिशानिर्देश, CITES, नियम 158-B...",
      analyzeBtn: "विश्लेषण करें",
      popularLabel: "लोकप्रिय प्रश्न:",

      chatHeader: "डॉ. आयुर्वेदिक साथी उत्तर",
      chatSubtitle: "स्रोत-आधारित वैधानिक एआई संश्लेषण",
      askPlaceholder: "अपना वैधानिक प्रश्न या औषधि पूछताछ दर्ज करें...",
      askBtn: "साथी से पूछें",
      suggestedLabel: "सुझाए गए वैधानिक प्रश्न:",
      citationsLabel: "उद्धृत वैधानिक संदर्भ",
      copyBtn: "कॉपी करें",
      copiedBtn: "कॉपी हो गया",

      sourcesTitle: "आधिकारिक पीडीएफ स्रोत पुस्तकालय",
      sourcesSubtitle: "आधिकारिक राजपत्र, पूर्व कला डेटाबेस, आयुष भेषजसंहिता और अंतर्राष्ट्रीय संधियां।",
      searchSourcesPlaceholder: "शीर्षक, फ़ाइल नाम, श्रेणी या कानूनी धारा द्वारा खोजें...",

      jurisdictionTitle: "क्षेत्राधिकार एवं देशवार नियामक विभाजन",
      jurisdictionSubtitle: "भारत, अमेरिका, यूरोप और खाड़ी देशों के नियमों की तुलना करें",

      gardenTitle: "ज्ञान वाटिका (Knowledge Garden)",
      gardenSubtitle: "राजपत्रों और संधियों से अनुक्रमित संरचित वैधानिक ज्ञान क्लस्टर का अन्वेषण करें।",
      exploreBtn: "अन्वेषण करें"
    },

    TA: {
      sihTag: "ஐபி-சக்தி உதவியாளர்",
      subtitle: "ஆயுர்வேத காப்புரிமை (IP) மற்றும் ஒழுங்குமுறை வழிகாட்டுதல்",
      navHome: "முகப்பு",
      navChat: "ஆராய்ச்சி அரட்டை",
      navSources: "ஆதார நூலகம்",
      navGarden: "அறிவு தோட்டம்",
      navVault: "மருந்து பெட்டகம்",
      navExperts: "வல்லுநர்கள்",

      heroBadge: "ஆதாரங்களுடன் கூடிய ஆயுர்வேத காப்புரிமை தகவல்",
      heroTitle1: "ஆயுர்வேத காப்புரிமை சட்டங்களை அறிந்துகொள்ளுங்கள் ",
      heroTitle2: "முழு நம்பிக்கையுடன்.",
      heroSubtitle: "ஜெமினி AI மற்றும் 22 அதிகாரப்பூர்வ சட்ட ஆவணங்களால் இயங்குகிறது. பிரிவு 3(p), ABS மற்றும் விதி 158-B பதில்களைப் பெறுங்கள்.",
      searchPlaceholder: "கேள்வி கேட்கவும்: பிரிவு 3(p), ABS விதிகள், CITES...",
      analyzeBtn: "ஆய்வு செய்",
      popularLabel: "பரிந்துரைக்கப்பட்ட கேள்விகள்:",

      chatHeader: "டாக்டர் ஆயுர்வேத சாதி பதில்",
      chatSubtitle: "ஆதார அடிப்படையிலான AI பகுப்பாய்வு",
      askPlaceholder: "உங்கள் கேள்வியை உள்ளிடவும்...",
      askBtn: "கேட்கவும்",
      suggestedLabel: "பரிந்துரைக்கப்பட்ட வினாக்கள்:",
      citationsLabel: "குறிப்பிடப்பட்ட ஆதாரங்கள்",
      copyBtn: "நகலெடு",
      copiedBtn: "நகலெடுக்கப்பட்டது",

      sourcesTitle: "அதிகாரப்பூர்வ ஆவண நூலகம்",
      sourcesSubtitle: "அரசிதழ்கள், சட்டங்கள் மற்றும் சர்வதேச ஒப்பந்தங்கள்.",
      searchSourcesPlaceholder: "தலைப்பு அல்லது சட்டப் பிரிவின்படி தேடவும்...",

      jurisdictionTitle: "நாடுகள் வாரியான சட்டப் பகுப்பாய்வு",
      jurisdictionSubtitle: "இந்தியா, அமெரிக்கா, ஐரோப்பா மற்றும் வளைகுடா நாடுகளின் விதிகளை ஒப்பிடுக",

      gardenTitle: "அறிவு தோட்டம்",
      gardenSubtitle: "சட்டப் பிரிவுகள் மற்றும் ஆவணங்களை ஆராயுங்கள்.",
      exploreBtn: "ஆராய்க"
    },

    SK: {
      sihTag: "आईपी-शक्ति सहायकः",
      subtitle: "आयुर्वेद-बौद्धिक-सम्पदा तथा वैधानिक-अनुपालन-यन्त्रम्",
      navHome: "मुख्य-पृष्ठम्",
      navChat: "शोध-संवादः",
      navSources: "मूल-ग्रन्थालयः",
      navGarden: "ज्ञान-वाटिका",
      navVault: "योग-कोषः",
      navExperts: "विद्वान्सः",

      heroBadge: "प्रमाण-आधारित आयुर्वेद-बौद्धिक-सम्पदा-ज्ञानम्",
      heroTitle1: "आयुर्वेदस्य IP तथा नियामक-विधानं जानन्तु ",
      heroTitle2: "पूर्ण-विश्वसनीयतया।",
      heroSubtitle: "जैमिनी-AI तथा २२ आधिकारिक-वैधानिक-पत्राणि द्वारा संचालितम्। धारा ३(p), ABS तथा सूत्र १५८-B सम्बन्धि-प्रश्नानां उत्तराणि प्राप्नुवन्तु।",
      searchPlaceholder: "पृच्छन्तु: सूत्र ३(p), ABS नियमाः, CITES...",
      analyzeBtn: "परीक्षणं कुरु",
      popularLabel: "प्रस्तावित-प्रश्नाः:",

      chatHeader: "डॉ. आयुर्वेदिक साथी उत्तरम्",
      chatSubtitle: "मूल-आधारित-वैधानिक-संश्लेषणम्",
      askPlaceholder: "स्वकीय-वैधानिक-प्रश्नं लिखन्तु...",
      askBtn: "पृच्छन्तु",
      suggestedLabel: "प्रस्तावित-वैधानिक-प्रश्नाः:",
      citationsLabel: "उद्धृत-वैधानिक-प्रमाणाः",
      copyBtn: "प्रतिलिपिं कुरु",
      copiedBtn: "प्रतिलिपिः कृता",

      sourcesTitle: "आधिकारिक-पीडीएफ-मूल-ग्रन्थालयः",
      sourcesSubtitle: "राजपत्राणि, पूर्व-ज्ञान-कोषाः तथा अन्तर्राष्ट्रिय-सन्धयः।",
      searchSourcesPlaceholder: "शीर्षकेण, सूत्रेण वा अन्वेषणं कुरु...",

      jurisdictionTitle: "क्षेत्राधिकारं तथा देशानुसारं वैधानिक-विभाजनम्",
      jurisdictionSubtitle: "भारत, अमेरिका, यूरोप तथा खाड़ी-देशानां नियमानां तुलनां कुरु",

      gardenTitle: "ज्ञान-वाटिका",
      gardenSubtitle: "संरचित-वैधानिक-ज्ञान-समूहानाम् अन्वेषणं कुरु।",
      exploreBtn: "अन्वेषणं कुरु"
    }
  };

  static get(lang: string): TranslationDictionary {
    return this.translations[lang] || this.translations['EN'];
  }
}
