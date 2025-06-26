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

export default function CollegeListPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [location, setLocation] = useState("");
  const [stream, setStream] = useState("");
  const [category, setCategory] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [diplomaPercent, setDiplomaPercent] = useState<number | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clgRef = ref(database, "clgdb");
    const unsubscribe = onValue(clgRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Flatten data if stored as object
        const arr = Array.isArray(data) ? data : Object.values(data);
        setColleges(arr as College[]);
      } else {
        setColleges([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sort locations and streams alphabetically
  const locations = unique(colleges.map((c) => c.City))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  const streams = unique(colleges.map((c) => c["Course Name"]))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  // List of all required categories
  const requiredCategories = [
    "DEFA-OBC",
    "DEFR-DBC",
    "DEFR-NTA",
    "DEFR-NTB",
    "DEFR-OBC",
    "DEFR-SC",
    "DEFR-SEBC",
    "DEFR-ST",
    "EWS",
    "GBEBC",
    "GNTA",
    "GNTB",
    "GNTC",
    "GNTD",
    "GNTE",
    "GNTO",
    "GOBC",
    "GOPEN",
    "GORD",
    "GSC",
    "GSEBC",
    "GSEBO",
    "GSESC",
    "GST",
    "L",
    "LBC",
    "LEC",
    "LGENC",
    "LIST",
    "LNTA",
    "LNTB",
    "LNTC",
    "LNTD",
    "LNTE",
    "LNTH",
    "LNTO",
    "LNTTD",
    "LOBC",
    "LODC",
    "LOE",
    "LOEC",
    "LOOC",
    "LOPEN",
    "LOSC",
    "LOUC",
    "LSC",
    "LSEBC",
    "LSEBO",
    "LSESC",
    "LST",
    "PWD-O",
    "PWDA-SEBC",
    "PWDR-OBC",
    "PWDR-SC",
    "PWDR-SEBC",
    "minority"
  ];
  // Branches list (union of all branches in data + required list)
  const requiredBranches = [
    "5G",
    "Aeronautical Engineering",
    "Agricultural Engineering",
    "Artificial Intelligence",
    "Artificial Intelligence (AI) and Data Science",
    "Artificial Intelligence (Al) and Data Science",
    "Artificial Intelligence and Data Science",
    "Artificial Intelligence and Machine Learning",
    "Artificial intelligence and Machine Learning",
    "Automation and Robotics",
    "Automobile Engineering",
    "Bio Medical Engineering",
    "Bio Technology",
    "Chemical Engineering",
    "Civil Engineering",
    "Civil Engineering and Planning",
    "Civil and Environmental Engineering",
    "Civil and infrastructure Engineering",
    "Commuter Science and Engineering(Data Science)",
    "Computer Engineering",
    "Computer Engineering (Software Engineering)",
    "Computer Engineering[Direct Second Year Second Shift]",
    "Computer Science",
    "Computer Science and Business Systems",
    "Computer Science and Design",
    "Computer Science and Engineering",
    "Computer Science and Engineering (Artificial Intelligence and Data Science)",
    "Computer Science and Engineering (Artificial Intelligence)",
    "Computer Science and Engineering (Cyber Security)",
    "Computer Science and Engineering (Internet of Things and Cyber Security Including Block Chain Technology)",
    "Computer Science and Engineering (IoT)",
    "Computer Science and Engineering(Artificial Intelligence and Machine Learning)",
    "Computer Science and Engineering(Cyber Security)",
    "Computer Science and Engineering(Data Science)",
    "Computer Science and Information Technology",
    "Computer Science and Technology",
    "Computer Technology",
    "Cyber Security",
    "Data Engineering",
    "Data Science",
    "Electrical Engg Electronics and Power]",
    "Electrical Engg [Electrical and Power]",
    "Electrical Engg[Electronics and Power]",
    "Electrical Engineering",
    "Electrical and Computer Engineering",
    "Electrical and Electronics Engineering",
    "Electronics Engineering",
    "Electronics Engineering ( VLSI Design and Technology)",
    "Electronics Engineering (VLSI Design and Technology)",
    "Electronics and Biomedical Engineering",
    "Electronics and Communication (Advanced Communication Technology)",
    "Electronics and Communication Engineering",
    "Electronics and Communication(Advanced Communication Technology)",
    "Electronics and Computer Engineering",
    "Electronics and Computer Science",
    "Electronics and Telecommunication Engg",
    "Electronics and Telecommunication Engg[Direct Second Year Second Shift]",
    "Fashion Technology",
    "Food Technology",
    "Food Technology And Management",
    "Industrial IoT",
    "Information Technology",
    "Instrumentation Engineering",
    "Instrumentation and Control Engineering",
    "Internet of Things (IoT)",
    "Man Made Textile Technology",
    "Manufacturing Science and Engineering",
    "Mechanical & Automation Engineering",
    "Mechanical Engineering",
    "Mechanical Engineering[Sandwich]",
    "Mechanical and Mechatronics Engineering (Additive Manufacturing)",
    "Mechatronics Engineering",
    "Metallurgy and Material Technology",
    "Mining Engineering",
    "Oil Fats and Waxes Technology",
    "Oil Technology",
    "Paints Technology",
    "Paper and Pulp Technology",
    "Petro Chemical Engineering",
    "Petro Chemical Technology",
    "Plastic Technology",
    "Plastic and Polymer Engineering",
    "Plastic and Polymer Technology",
    "Printing Technology",
    "Production Engineering",
    "Production Engineering[Sandwich]",
    "Robotics and Artificial Intelligence",
    "Robotics and Automation",
    "Safety and Fire Engineering",
    "Structural Engineering",
    "Surface Coating Technology",
    "Textile Chemistry",
    "Textile Engineering / Technology",
    "Textile Plant Engineering",
    "Textile Technology",
    "VLSI"
  ];
  const dataBranches = unique(colleges.map((c) => c["Course Name"]))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  const allBranches = unique([...dataBranches, ...requiredBranches]).sort((a, b) => a.localeCompare(b));
  // Merge unique categories from data and required list
  const categories = unique([
    ...colleges.flatMap((c) => c.Cutoffs ? c.Cutoffs.map((cut: Cutoff) => cut.Category) : []),
    ...requiredCategories
  ]);

  // Mapping of main categories to their subcategories (from image)
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
    "Minority": ["Mi"],
    "PWD (Disability)": ["PWD-O", "PWDA-SEBC", "PWDR-OBC", "PWDR-SC", "PWDR-SEBC"],
    DEFENCE: ["DEFR-OBC", "DEFR-SC", "DEFR-ST", "DEFR-SEBC", "DEFR-NTA", "DEFR-NTB", "DEFR-DBC", "DEFA-OBC"]
  };
  const mainCategories = Object.keys(mainCategoryMap);


 const cityDistrictMap: { [key: string]: string[] } = {
  "Mumbai": ["Mumbai", "Andheri", "Panvel", "Thane", "Kalyan", "Ulhasnagar", "Vasai", "Virar", "Navi Mumbai", "Dombivli"],
  "Pune": ["Pune", "Ravet", "Narhe", "Wagholi", "Lonavala", "Pisoli", "Sasewadi"],
  "Nagpur": ["Nagpur", "Ramtek"],
  "Aurangabad": ["Aurangabad", "Sambhajinagar"],
  "Nashik": ["Nashik", "Ohar"],
  "Kolhapur": ["Kolhapur", "Warananagar", "Gadhinglaj"],
  "Solapur": ["Solapur", "Pandharpur"]
};

  // Filtering logic
  const filtered = colleges.filter((college) => {
   const cityList = cityDistrictMap[location] || [location];
const matchesLocation = location ? cityList.includes(college.City) : true;
    const matchesStream = stream ? college["Course Name"] === stream : true;
    let minCutoff = null;
    if (college.Cutoffs && college.Cutoffs.length > 0 && category) {
      const cat = college.Cutoffs.find((c) => c.Category === category);
      if (cat && cat.Score) {
        minCutoff = parseFloat(cat.Score.replace("%", ""));
      }
    } else if (college.Cutoffs && college.Cutoffs.length > 0) {
      const gopen = college.Cutoffs.find((c) => c.Category === "GOPEN");
      if (gopen && gopen.Score) {
        minCutoff = parseFloat(gopen.Score.replace("%", ""));
      }
    }
    // Attach minCutoff to college for sorting
    (college as any)._minCutoff = minCutoff;
    const matchesCutoff = diplomaPercent !== null ? (minCutoff !== null && diplomaPercent >= minCutoff) : true;
    return matchesLocation && matchesStream && matchesCutoff;
  })
  // Sort: exact match first, then by closest higher cutoff, then others
  .sort((a, b) => {
    const userCutoff = diplomaPercent || 0;
    const aCut = (a as any)._minCutoff;
    const bCut = (b as any)._minCutoff;
    // Exact match comes first
    if (aCut === userCutoff && bCut !== userCutoff) return -1;
    if (bCut === userCutoff && aCut !== userCutoff) return 1;
    // Then by how close the cutoff is (descending order)
    if (aCut !== null && bCut !== null) {
      return Math.abs(userCutoff - aCut) - Math.abs(userCutoff - bCut);
    }
    if (aCut === null) return 1;
    if (bCut === null) return -1;
    return 0;
  });

  // Extended list of Maharashtra cities including new entries from user
  const maharashtraCities = [
    "Ahmednagar", "Akkalkuwa", "Akluj", "Akola", "Ambejogai", "Amravati", "Andheri", "Aurangabad", "Babulgaon", "Badlapur", "Badnera", "Badravati", "Bamni", "Baramati", "Barshi", "Beed", "Bhandara", "Bhandars", "Bhanders", "Bhima", "Bhor", "Bhusawal", "Boisar", "Buldhana", "Chandrapur", "Chikhali", "Deorukh", "Dharashiv", "Dhule", "Dumbarwadi", "Egaon", "Faizpur", "Falzpur", "Gadhinglaj", "Hagpur", "Haveli", "Indapur","Jalgaon", "Jalna", "Jaysingpur", "Kalyan", "Kankavli", "Karad", "Karjat", "Khurd", "Kolhapur", "Kopargaon", "Kuran", "Lakoll", "Latur", "Lonavala", "Lonere", "Mandal", "Miraj", "Mumbai", "Nagar",  "Nagpur", "Nanded", "Nandurbar", "Narhe", "Nashik", "Nepti", "Nile", "Ohar", "Palghar", "Pandharpur", "Panhala", "Paniv", "Panvel", "Parbhani", "Pisoli", "Pune", "Raigad", "Ramtek", "Ratnagiri", "Ravet","Sakoll", "Sambhajinagar",   "Sangamner", "Sangli", "Sangola", "Sasewadi", "Satara", "Sawantwadi", "Sevagram", "Shahapur", "Shegaon", "Shirgaon", "Shirpur", "Sindhi", "Sinnar", "Solapur", "Sukhall",  "Thane", "Tuljapur", "Ulhasnagar",  "Vasai", "Wadwadi", "Waghall", "Wagholi", "Warananagar", "Wardha", "Warghe", "Washim", "Yadrav", "Yavatmal", "Yelgaon"
  ].sort((a, b) => a.localeCompare(b));

  // Handlers to reset formSubmitted if any input is cleared
  const handleDiplomaPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? null : parseFloat(e.target.value);
    setDiplomaPercent(value);
    if (value === null) setFormSubmitted(false);
  };
  const handleStreamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStream(e.target.value);
    if (e.target.value === "") setFormSubmitted(false);
  };
  const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMainCategory(e.target.value);
    setCategory("");
    if (e.target.value === "") setFormSubmitted(false);
  };
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    if (e.target.value === "") setFormSubmitted(false);
  };
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocation(e.target.value);
    if (e.target.value === "") setFormSubmitted(false);
  };

  // Reset formSubmitted if any required input is deselected (subcategory is NOT required for list)
  useEffect(() => {
    if (
      diplomaPercent === null ||
      stream === "" ||
      mainCategory === "" ||
      location === ""
    ) {
      if (formSubmitted) setFormSubmitted(false);
    }
  }, [diplomaPercent, stream, mainCategory, location]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f8faff] to-[#e0e7ff] px-2 md:px-20 py-8 md:py-16 font-poppins">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl md:text-5xl font-extrabold text-center text-[#4300FF] mb-8 md:mb-12 drop-shadow-lg"
      >
        Explore Engineering Colleges With Our AI model
      </motion.h1>

      {/* Filter Form */}
      <form
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white/80 p-4 md:p-8 rounded-2xl shadow-xl backdrop-blur-md border border-[#e0e7ff]"
        onSubmit={e => {
          e.preventDefault();
          setFormSubmitted(true);
        }}
      >
        <input
          type="number"
          step="0.01"
          placeholder="Diploma Percentage"
          value={diplomaPercent || ""}
          onChange={handleDiplomaPercentChange}
          className="p-3 border border-[#b3b3ff] rounded-lg focus:ring-2 focus:ring-[#4300FF] outline-none transition w-full text-gray-900 bg-white"
          min={0}
          max={100}
          required
        />
        <select
          value={stream}
          onChange={handleStreamChange}
          className="p-3 border border-[#b3b3ff] rounded-lg focus:ring-2 focus:ring-[#4300FF] outline-none transition w-full text-gray-900 bg-white"
          required
        >
          <option value="">Select Branch</option>
          {allBranches.map((s, i) => (
            <option key={i} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={mainCategory}
          onChange={handleMainCategoryChange}
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
            onChange={handleCategoryChange}
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
          onChange={handleLocationChange}
          className="p-3 border border-[#b3b3ff] rounded-lg focus:ring-2 focus:ring-[#4300FF] outline-none transition w-full text-gray-900 bg-white"
          required
        >
          <option value="">Select City</option>
          {maharashtraCities.map((loc, i) => (
            <option key={i} value={loc}>{loc}</option>
          ))}
        </select>
        <button
          type="submit"
          className="md:col-span-4 bg-gradient-to-r from-[#4300FF] to-[#00CAFF] hover:from-[#00CAFF] hover:to-[#4300FF] text-white px-6 py-3 rounded-xl shadow-lg font-bold text-lg transition mt-2 w-full"
        >
          Generate List
        </button>
      </form>

      {/* College Cards */}
      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading colleges...</p>
      ) : formSubmitted && diplomaPercent !== null && stream && mainCategory && location ? (
        <div className="w-full flex flex-col gap-6">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 mt-10 col-span-full">No colleges match your criteria.</p>
          ) : (
            <div className="w-full flex flex-col gap-6">
              {filtered.slice(0, 20).map((college, index) => {
                // If subcategory is selected, show only that cutoff
                if (category) {
                  const selectedCutoff = college.Cutoffs && college.Cutoffs.find((cut: Cutoff) => cut.Category === category);
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
                          <span className="text-lg font-bold text-[#4300FF]">{index + 1}.</span>
                          <h3 className="text-xl md:text-2xl font-bold text-[#0065F8] flex flex-wrap items-center gap-2">
                            <span>{college["College Name"]}</span>
                            <span className="inline-block bg-[#E0F7FF] text-[#0065F8] text-xs font-semibold px-2 py-1 rounded-full ml-2">{college.Status}</span>
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-4 text-gray-700 text-base mb-2">
                          <span>📍 <span className="font-medium">{college.City}</span></span>
                          <span>🎓 <span className="font-medium">{college["Course Name"]}</span></span>
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
                  const cutoffs = (college.Cutoffs || []).filter((cut: Cutoff) => subCategories.includes(cut.Category));
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
                          <span className="text-lg font-bold text-[#4300FF]">{index + 1}.</span>
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
          )}
        </div>
      ) : null}
    </main>
  );
}
