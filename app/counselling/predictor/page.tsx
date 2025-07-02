"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

interface Cutoff {
  Category: string;
  Rank: string;
  Score: string;
}

interface College {
  [key: string]: any;
  "College Code": string;
  "College Name": string;
  "Choice Code": string;
  "Course Name": string;
  Cutoffs: Cutoff[];
  City: string;
  Status: string;
}

const unique = (array: string[]) => Array.from(new Set(array));

export default function PredictorPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [stream, setStream] = useState("");
  const [location, setLocation] = useState("");
  const [predictions, setPredictions] = useState<College[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mainCategory, setMainCategory] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const clgRef = ref(database, "clgdb");
    const unsubscribe = onValue(clgRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data);
        setColleges(arr as College[]);
      } else {
        setColleges([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sort streams and locations alphabetically
  const streams = unique(colleges.map((c) => c["Course Name"]))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  const locations = unique(colleges.map((c) => c.City))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  // Mapping of main categories to their subcategories (from colleges page)
  const mainCategoryMap: { [key: string]: string[] } = {
    OBC: ["GOBC", "LOBC", "PWDR-OBC", "DEFR-OBC", "DEFA-OBC"],
    SC: ["GSC", "LSC", "PWDR-SC", "DEFR-SC"],
    ST: ["GST", "LST", "DEFR-ST"],
    SEBC: ["GSEBC", "LSEBC", "PWDA-SEBC", "PWDR-SEBC", "DEFR-SEBC"],
    "NT(A)": ["GNTA", "LNTA", "DEFR-NTA"],
    "NT(B)": ["GNTB", "LNTB", "DEFR-NTB"],
    "NT(C)": ["GNTC", "LNTC"],
    "NT(D)": ["GNTD", "LNTD"],
    "OPEN / GENERAL": ["GOPEN", "LOPEN", "PWD-O", "GORD"],
    EWS: ["EWS"],
    "Minority": ["MI"], 
    "PWD (Disability)": ["PWD-O", "PWDA-SEBC", "PWDR-OBC", "PWDR-SC", "PWDR-SEBC" ,"PWD-NTA","NTB","NTC","NTA","st"],
    DEFENCE: ["DEFR-OBC", "DEFR-SC", "DEFR-ST", "DEFR-SEBC", "DEFR-NTA", "DEFR-NTB", "DEFR-NTC", "DEFR-NTD" , "DEFA-OBC"]
  };
  const mainCategories = Object.keys(mainCategoryMap);

  // Mapping of city/district groups for broader search (expanded)
  const cityDistrictMap: { [key: string]: string[] } = {
    mumbai: ["mumbai", "thane", "navi mumbai", "panvel", "kalyan", "dombivli", "vasai", "virar", "andheri", "boisar", "ulhasnagar", "badlapur"],
    pune: ["pune", "pcmc", "hadapsar", "wagholi", "shivaji nagar", "kothrud", "baramati", "lonavala", "narhe", "pisoli", "ravet", "sasewadi", "warje", "bhor", "indapur"],
    nagpur: ["nagpur", "wardha", "bhandara", "ramtek", "sevagram", "sindhi", "badravati", "bamni"],
    nashik: ["nashik", "malegaon", "satana", "kopargaon", "sinnar", "niphad", "egatpuri", "phar"],
    aurangabad: ["aurangabad", "jalna", "paithan", "sambhajinagar", "beed", "ambejogai", "dharashiv", "tuljapur"],
    kolhapur: ["kolhapur", "ichalkaranji", "karvir", "gadhinglaj", "jaysingpur", "miraj", "sangli", "yadrav", "warananagar", "panhala"],
    ahmednagar: ["ahmednagar", "nagar", "sangamner", "nepti"],
    akola: ["akola"],
    amravati: ["amravati", "badnera", "chandrapur"],
    bhusawal: ["bhusawal"],
    buldhana: ["buldhana", "chikhali", "shegaon"],
    chandrapur: ["chandrapur"],
    dhule: ["dhule", "shirpur"],
    jalgaon: ["jalgaon", "faizpur"],
    karad: ["karad"],
    latur: ["latur", "tuljapur", "dharashiv"],
    nanded: ["nanded"],
    nandurbar: ["nandurbar"],
    parbhani: ["parbhani"],
    ratnagiri: ["ratnagiri", "deorukh", "kankavli"],
    sangli: ["sangli", "sangola", "miraj", "jaysingpur"],
    satara: ["satara", "phaltan", "panhala", "paniv"],
    solapur: ["solapur", "barshi", "pandharpur", "akluj"],
    wardha: ["wardha", "sevagram"],
    washim: ["washim"],
    yavatmal: ["yavatmal"],
    lonere: ["lonere"],
    akkalkuwa: ["akkalkuwa"],
    dumbarwadi: ["dumbarwadi"],
    haveli: ["haveli"],
    isigaon: ["isigaon"],
    karjat: ["karjat"],
    khurd: ["khurd"],
    kuran: ["kuran"],
    lakoll: ["lakoll"],
    nageer: ["nageer"],
    sakoll: ["sakoll"],
    shahapur: ["shahapur"],
    shirgaon: ["shirgaon"],
    sukhali: ["sukhali"],
    wadwadi: ["wadwadi"],
    waghall: ["waghall"],
    yelgaon: ["yelgaon"],
    panvel: ["panvel"],
    raigad: ["raigad"]
  };

  // Branch mapping for display/normalization
const branchMap: { [key: string]: string } = {
    "Artificial Intelligence and Data Science": "Artificial Intelligence and Data Science",
    "Artificial Intelligence (AI) and Data Science": "Artificial Intelligence and Data Science",
    "Computer Science and Engineering (Artificial Intelligence and Data Science)": "Artificial Intelligence and Data Science",
    "Computer Science and Engineering(Artificial Intelligence and Data Science)": "Artificial Intelligence and Data Science",
    "Artificial Intelligence and Machine Learning": "Artificial Intelligence and Machine Learning",
    "Computer Science and Engineering(Artificial Intelligence and Machine Learning)": "Artificial Intelligence and Machine Learning",
    "Computer Science and Engineering (Artificial Intelligence)": "Artificial Intelligence",
    "Artificial Intelligence": "Artificial Intelligence",
    "Computer Science and Engineering(Cyber Security)": "Cyber Security",
    "Cyber Security": "Cyber Security",
    "Computer Science and Engineering (Cyber Security)": "Cyber Security",
    "Data Science": "Data Science",
    "Computer Science and Engineering(Data Science)": "Data Science",
    "Internet of Things (IoT)": "Internet of Things",
    "Computer Science and Engineering (IoT)": "Internet of Things",
    "Industrial IoT": "Internet of Things",
    "Computer Science and Engineering (Internet of Things and Cyber Security Including Block Chain Technology)": "Internet of Things and Cyber Security Including Block Chain Technology",
    "Computer Science": "Computer Science and Engineering",
    "Computer Science and Engineering": "Computer Science and Engineering",
    "Computer Engineering": "Computer Science and Engineering",
    "Computer Technology": "Computer Science and Engineering",
    "Computer Science and Technology": "Computer Science and Engineering",
    "Information Technology": "Information Technology",
    "Electronics and Telecommunication Engineering": "Electronics and Telecommunication Engineering",
    "Electronics and Telecommunication Engg": "Electronics and Telecommunication Engineering",
    "Electronics and Telecommunication Engineering[Direct Second Year Second Shift]": "Electronics and Telecommunication Engineering",
    "Electronics Engineering": "Electronics Engineering",
    "Electrical Engineering": "Electrical Engineering",
    "Electrical and Electronics Engineering": "Electrical and Electronics Engineering",
    "Electrical Engg [Electrical and Power]": "Electrical Engineering",
    "Electrical Engg[Electronics and Power]": "Electrical Engineering",
    "Mechanical Engineering": "Mechanical Engineering",
    "Mechanical & Automation Engineering": "Mechanical Engineering",
    "Mechanical and Mechatronics Engineering (Additive Manufacturing)": "Mechanical Engineering",
    "Mechatronics Engineering": "Mechatronics Engineering",
    "Civil Engineering": "Civil Engineering",
    "Civil Engineering and Planning": "Civil Engineering",
    "Civil and Environmental Engineering": "Civil Engineering",
    "Civil and infrastructure Engineering": "Civil Engineering",
    "Instrumentation Engineering": "Instrumentation Engineering",
    "Instrumentation and Control Engineering": "Instrumentation Engineering",
    "Printing Technology": "Printing Technology",
    "Production Engineering": "Production Engineering",
    "Production Engineering[Sandwich]": "Production Engineering",
    "Robotics and Automation": "Robotics and Automation",
    "Robotics and Artificial Intelligence": "Robotics and Artificial Intelligence",
    // ... add more as needed ...
  };

// Reverse mapping: full branch name -> all possible variants
const reverseBranchMap: { [key: string]: string[] } = {};
Object.entries(branchMap).forEach(([variant, full]) => {
  if (!reverseBranchMap[full]) reverseBranchMap[full] = [];
  reverseBranchMap[full].push(variant);
});
  // Normalize branch names for filtering and display
  const normalizeBranch = (branch: string) => branchMap[branch] || branch;
  const requiredBranches = [
    "5G",
    "Aeronautical Engineering",
    "Agricultural Engineering",
    "Architecture",
    "Artificial Intelligence",
    "Automobile Engineering",
    "Bioinformatics",
    "Biomedical Engineering",
    "Chemical Engineering",
    "Civil Engineering",
    "Computer Science and Engineering",
    "Data Science",
    "Electrical Engineering",
    "Electronics and Communication Engineering",
    "Information Technology",
    "Instrumentation Engineering",
    "Mechanical Engineering",
    "Mechatronics",
    "Mining Engineering",
    "Petroleum Engineering",
    "Production Engineering",
    "Software Engineering",
    "Structural Engineering",
    "VLSI"
  ];
  const dataBranches = unique(colleges.map((c) => normalizeBranch(c["Course Name"])))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  const allBranches = unique([...dataBranches, ...requiredBranches.map(normalizeBranch)]).sort((a, b) => a.localeCompare(b));

  // Extended list of Maharashtra cities including new entries from user
  const maharashtraCities = [
    "Ahmednagar", "Akkalkuwa", "Akluj", "Akola", "Ambejogai", "Amravati", "Andheri", "Aurangabad", "Babulgaon", "Badlapur", "Badnera", "Badravati", "Bamni", "Baramati", "Barshi", "Beed", "Bhandara", "Bhandars", "Bhanders", "Bhima", "Bhor", "Bhusawal", "Boisar", "Buldhana", "Chandrapur", "Chikhali", "Deorukh", "Dharashiv", "Dhule", "Dumbarwadi", "Egaon", "Faizpur", "Falzpur", "Gadhinglaj", "Hagpur", "Haveli", "Indapur","Jalgaon", "Jalna", "Jaysingpur", "Kalyan", "Kankavli", "Karad", "Karjat", "Khurd", "Kolhapur", "Kopargaon", "Kuran", "Lakoll", "Latur", "Lonavala", "Lonere", "Mandal", "Miraj", "Mumbai", "Nagar",  "Nagpur", "Nanded", "Nandurbar", "Narhe", "Nashik", "Nepti", "Nile", "Ohar", "Palghar", "Pandharpur", "Panhala", "Paniv", "Panvel", "Parbhani", "Pisoli", "Pune", "Raigad", "Ramtek", "Ratnagiri", "Ravet","Sakoll", "Sambhajinagar",   "Sangamner", "Sangli", "Sangola", "Sasewadi", "Satara", "Sawantwadi", "Sevagram", "Shahapur", "Shegaon", "Shirgaon", "Shirpur", "Sindhi", "Sinnar", "Solapur", "Sukhall",  "Thane", "Tuljapur", "Ulhasnagar",  "Vasai", "Wadwadi", "Waghall", "Wagholi", "Warananagar", "Wardha", "Warghe", "Washim", "Yadrav", "Yavatmal", "Yelgaon"
  ].sort((a, b) => a.localeCompare(b));

  const handlePredict = () => {
    // Reverse city mapping: if a location is selected, get all related cities for that location
    let cityList: string[] = [location];
    if (location && cityDistrictMap[location.toLowerCase()]) {
      cityList = cityDistrictMap[location.toLowerCase()];
    } else if (location) {
      for (const [group, cities] of Object.entries(cityDistrictMap)) {
        if (cities.map(c => c.toLowerCase()).includes(location.toLowerCase())) {
          cityList = cities;
          break;
        }
      }
    }
    // Use reverseBranchMap for matching all variants of the selected stream
    const selectedBranchVariants = stream && reverseBranchMap[stream] ? reverseBranchMap[stream] : [stream];
    const result = colleges.filter((college) => {
      const matchesLocation = location ? cityList.map(c => c.toLowerCase()).includes(college.City.toLowerCase()) : true;
      // Use normalized branch for filtering
      const collegeBranch = normalizeBranch(college["Course Name"]);
      // Match if college branch is any of the selected branch's variants
      const matchesStream = stream ? selectedBranchVariants.includes(college["Course Name"]) : true;
      let minRank = null;
      if (college.Cutoffs && college.Cutoffs.length > 0 && category) {
        const cat = college.Cutoffs.find((c) => c.Category === category);
        if (cat && cat.Rank) {
          minRank = parseInt(cat.Rank);
        }
      } else if (college.Cutoffs && college.Cutoffs.length > 0) {
        const gopen = college.Cutoffs.find((c) => c.Category === "GOPEN");
        if (gopen && gopen.Rank) {
          minRank = parseInt(gopen.Rank);
        }
      }
      (college as any)._minRank = minRank;
      const matchesRank = score !== null ? (minRank !== null && score <= minRank) : true;
      return matchesStream && matchesLocation && matchesRank;
    })
    // Sort: exact match first, then by closest higher rank, then others
    .sort((a, b) => {
      const userRank = score || 0;
      const aRank = (a as any)._minRank;
      const bRank = (b as any)._minRank;
      // Exact match comes first
      if (aRank === userRank && bRank !== userRank) return -1;
      if (bRank === userRank && aRank !== userRank) return 1;
      // Then by how close the rank is (ascending order)
      if (aRank !== null && bRank !== null) {
        return Math.abs(userRank - aRank) - Math.abs(userRank - bRank);
      }
      if (aRank === null) return 1;
      if (bRank === null) return -1;
      return 0;
    });
    setPredictions(result.slice(0, 20));
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-[#E0F7FF] px-6 md:px-20 py-16 font-poppins">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-bold text-center text-[#4300FF] mb-10"
      >
        Rank Wise Prediction using Our AI Model
      </motion.h1>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white/80 p-4 md:p-8 rounded-2xl shadow-xl backdrop-blur-md border border-[#e0e7ff]">
        <input
          type="number"
          step="1"
          placeholder="Enter Your Rank"
          value={score || ""}
          onChange={(e) => setScore(e.target.value === "" ? null : parseInt(e.target.value))}
          className="p-3 border border-[#b3b3ff] rounded-lg focus:ring-2 focus:ring-[#4300FF] outline-none transition w-full text-gray-900 bg-white"
          required
        />
        <select
          value={stream}
          onChange={e => setStream(e.target.value)}
          className="p-3 border border-[#b3b3ff] rounded-lg focus:ring-2 focus:ring-[#4300FF] outline-none transition w-full text-gray-900 bg-white"
          required
        >
          <option value="">Select Branch</option>
          {requiredBranches.sort((a, b) => a.localeCompare(b)).map((s, i) => (
            <option key={i} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={mainCategory}
          onChange={e => {
            setMainCategory(e.target.value);
            setCategory("");
          }}
          className="p-3 border border-[#b3b3ff] rounded-lg focus:ring-2 focus:ring-[#4300FF] outline-none transition w-full text-gray-900 bg-white"
          required
        >
          <option value="">Select Main Category</option>
          {mainCategories.map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>
        {mainCategory && (
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="p-3 border border-[#b3b3ff] rounded-lg focus:ring-2 focus:ring-[#4300FF] outline-none transition w-full text-gray-900 bg-white"
          >
            <option value="">Select Sub Category</option>
            {mainCategoryMap[mainCategory].map((subcat, i) => (
              <option key={i} value={subcat}>{subcat}</option>
            ))}
          </select>
        )}
        <select
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="p-3 border border-[#b3b3ff] rounded-lg focus:ring-2 focus:ring-[#4300FF] outline-none transition w-full text-gray-900 bg-white"
          required
        >
          <option value="">Select City</option>
          {maharashtraCities.map((loc, i) => (
            <option key={i} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handlePredict}
        className="bg-[#0065F8] hover:bg-[#00CAFF] text-white px-6 py-3 rounded-lg shadow mx-auto block"
        disabled={loading || !score || !stream || !mainCategory || !location}
      >
        Predict Colleges
      </button>

      {/* Result */}
      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading colleges...</p>
      ) : !score || !stream || !mainCategory || !location ? (
        <p className="text-center text-red-500 mt-10 font-semibold">Please fill in Rank, Branch, Main Category, and City to see predictions.</p>
      ) : submitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10"
        >
          <h3 className="text-2xl font-semibold text-center text-[#0065F8] mb-6">
            {predictions.length > 0 ? "Colleges Matching Your Score" : "No Matches Found"}
          </h3>

          <div className="w-full flex flex-col gap-6">
            {predictions.map((college, index) => {
              const listNumber = index + 1;
              // If subcategory is selected, show only that cutoff
              if (category) {
                const selectedCutoff = college.Cutoffs && college.Cutoffs.find((cut) => cut.Category === category);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    viewport={{ once: true }}
                    className="bg-white/90 border border-[#e0e7ff] rounded-2xl shadow-lg hover:shadow-2xl transition flex flex-col md:flex-row items-start md:items-center p-5 md:p-8 gap-4 md:gap-8"
                  >
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-[#4300FF]">{listNumber}.</span>
                        <h3 className="text-xl md:text-2xl font-bold text-[#0065F8] flex flex-wrap items-center gap-2">
                          <span>{college["College Name"]}</span>
                          <span className="inline-block bg-[#E0F7FF] text-[#0065F8] text-xs font-semibold px-2 py-1 rounded-full ml-2">{college.Status}</span>
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-4 text-gray-700 text-base mb-2">
                        <span>📍 <span className="font-medium">{college.City}</span></span>
                        <span>🎓 <span className="font-medium">{normalizeBranch(college["Course Name"])}{/* Show normalized branch */}</span></span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-800">Cutoff ({category}):</span>
                        {selectedCutoff ? (
                          <span className="bg-[#F0F8FF] text-[#0065F8] px-3 py-1 rounded-full text-sm font-semibold">
                            {selectedCutoff.Score} <span className="text-gray-500">(Rank: {selectedCutoff.Rank})</span>
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">No cutoff data for this category.</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              } else if (mainCategory && mainCategoryMap[mainCategory]) {
                // If only mainCategory is selected, show all subcategory cutoffs for this main category
                const subCategories = mainCategoryMap[mainCategory];
                const cutoffs = (college.Cutoffs || []).filter((cut) => subCategories.includes(cut.Category));
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    viewport={{ once: true }}
                    className="bg-white/90 border border-[#e0e7ff] rounded-2xl shadow-lg hover:shadow-2xl transition flex flex-col md:flex-row items-start md:items-center p-5 md:p-8 gap-4 md:gap-8"
                  >
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-[#4300FF]">{listNumber}.</span>
                        <h3 className="text-xl md:text-2xl font-bold text-[#0065F8] flex flex-wrap items-center gap-2">
                          <span>{college["College Name"]}</span>
                          <span className="inline-block bg-[#E0F7FF] text-[#0065F8] text-xs font-semibold px-2 py-1 rounded-full ml-2">{college.Status}</span>
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-4 text-gray-700 text-base mb-2">
                        <span>📍 <span className="font-medium">{college.City}</span></span>
                        <span>🎓 <span className="font-medium">{college["Course Name"]}</span></span>
                      </div>
                      <div className="flex flex-col gap-1 mb-2">
                        <span className="font-semibold text-gray-800">Cutoffs ({mainCategory}):</span>
                        {cutoffs.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {cutoffs.map((cut, i) => (
                              <span key={i} className="bg-[#F0F8FF] text-[#0065F8] px-3 py-1 rounded-full text-sm font-semibold">
                                {cut.Category}: {cut.Score} <span className="text-gray-500">(Rank: {cut.Rank})</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">No cutoff data for these subcategories.</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              }
              return null;
            })}
          </div>
        </motion.div>
      )}
    </main>
  );
}
