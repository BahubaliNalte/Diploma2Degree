"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import UserTable from "./UserTable";
import PlusMemberTable from "./PlusMemberTable";
import CollegeRequestTable from "./CollegeRequestTable";
import ProjectRequestTable from "./ProjectRequestTable";
import AnnouncementAdmin from "./AnnouncementAdmin";
import ClientReviewAdmin from "./ClientReviewAdmin";
import BannerAdmin from "./BannerAdmin";
import FeedbackImageAdmin from "./FeedbackImageAdmin";
import MentorshipRequestTable from "./MentorshipRequestTable";
import { get, ref as dbRef, set } from "firebase/database";
import { database, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

const adminSections = [
	{
		key: "users",
		label: "User Management",
		desc: "View, search, filter, and manage all registered users.",
	},
	{
		key: "premium",
		label: "Premium/Plus Membership Management",
		desc: "View and manage premium/plus members and payments.",
	},
	{
		key: "collegeRequests",
		label: "Best College List Requests",
		desc: "View, process, and export best college list requests.",
	},
	{
		key: "projects",
		label: "Project Request Management",
		desc: "View and manage all project requests, assign and update status.",
	},
	{
		key: "notifications",
		label: "Notifications & Announcements",
		desc: "Create and manage notifications and announcements.",
	},
	{
		key: "content",
		label: "Content Management",
		desc: "Manage reviews and feedback images.",
	},
	{
		key: "mentorship",
		label: "1:1 Mentorship Requests",
		desc: "View and manage 1:1 mentorship session requests.",
	},
];

export default function AdminPage() {
	const [section, setSection] = useState(adminSections[0].key);
	const [premiumPrice, setPremiumPrice] = useState<number | null>(null);
	const [priceInput, setPriceInput] = useState("");
	const [priceLoading, setPriceLoading] = useState(false);
	const [priceMsg, setPriceMsg] = useState("");
	const [checkingAuth, setCheckingAuth] = useState(true);
	const router = useRouter();

	// Handle premium price change
	const handlePriceChange = async () => {
		if (!priceInput) {
			setPriceMsg("Please enter a price.");
			return;
		}
		const newPrice = parseInt(priceInput, 10);
		if (isNaN(newPrice) || newPrice <= 0) {
			setPriceMsg("Enter a valid price.");
			return;
		}
		setPriceLoading(true);
		setPriceMsg("");
		try {
			await set(dbRef(database, "AppConfig/PlusMembershipPrice"), newPrice);
			setPremiumPrice(newPrice);
			setPriceMsg("Price updated!");
			setPriceInput("");
		} catch (err) {
			setPriceMsg("Failed to update price.");
		}
		setPriceLoading(false);
	};

	useEffect(() => {
		// Fetch current premium price from AppConfig/PlusMembershipPrice
		const priceRef = dbRef(database, "AppConfig/PlusMembershipPrice");
		get(priceRef).then((snap) => {
			if (snap.exists()) {
				setPremiumPrice(snap.val());
			}
		});

		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				const userRef = dbRef(database, `Users/${user.uid}`);
				const snap = await get(userRef);
				if (snap.exists() && snap.val().role === "admin") {
					setCheckingAuth(false);
				} else {
					router.replace("/login");
				}
			} else {
				router.replace("/login");
			}
		});
		return () => unsubscribe();
	}, [router]);

	if (checkingAuth) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				Checking admin access...
			</div>
		);
	}

	return (
		<main className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#eef4ff] px-4 py-10 font-poppins">
			<motion.h1
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7 }}
				className="text-4xl font-bold text-center text-[#4300FF] mb-10"
			>
				Admin Dashboard
			</motion.h1>
			<div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
				{/* Sidebar */}
				<aside className="md:w-1/4 w-full bg-white rounded-xl shadow p-6 flex flex-col gap-4 mb-8 md:mb-0">
					{adminSections.map((s) => (
						<button
							key={s.key}
							onClick={() => setSection(s.key)}
							className={`text-left px-4 py-3 rounded-lg font-semibold transition border ${
								section === s.key
									? "bg-[#4300FF] text-white border-[#4300FF]"
									: "bg-gray-50 text-[#4300FF] border-transparent hover:bg-[#e0e7ff]"
							}`}
						>
							<div className="text-lg">{s.label}</div>
							<div className="text-xs text-gray-500 font-normal">
								{s.desc}
							</div>
						</button>
					))}
				</aside>
				{/* Main Content */}
				<section className="flex-1 bg-white rounded-xl shadow p-8 min-h-[400px]">
					{section === "users" && (
						<div>
							<h2 className="text-2xl font-bold mb-4 text-[#4300FF]">
								User Management
							</h2>
							<p className="mb-4">
								View, search, filter, and manage all registered users here.
							</p>
							<UserTable />
						</div>
					)}
					{section === "premium" && (
						<div>
							<h2 className="text-2xl font-bold mb-4 text-[#4300FF]">
								Premium/Plus Membership Management
							</h2>
							<p className="mb-4">
								View and manage premium/plus members and payments.
							</p>
							{/* Premium Price Management */}
							<div className="mb-8 p-4 bg-[#f0f4ff] rounded-xl flex flex-col md:flex-row items-center gap-4">
								<div className="font-semibold text-[#4300FF]">
									Current Premium Price:{" "}
									<span className="text-black">
										₹{premiumPrice !== null ? premiumPrice : "--"}
									</span>
								</div>
								<input
									type="number"
									className="border rounded px-3 py-2 w-32"
									value={priceInput}
									onChange={(e) => setPriceInput(e.target.value)}
									disabled={priceLoading}
									placeholder="New Price"
								/>
								<button
									onClick={handlePriceChange}
									className="bg-[#4300FF] text-white px-4 py-2 rounded font-semibold hover:bg-[#2d007a] disabled:opacity-50"
									disabled={priceLoading}
								>
									{priceLoading ? "Saving..." : "Change Price"}
								</button>
								{priceMsg && (
									<span className="ml-4 text-green-600 font-medium">
										{priceMsg}
									</span>
								)}
							</div>
							<PlusMemberTable />
						</div>
					)}
					{section === "collegeRequests" && (
						<div>
							<h2 className="text-2xl font-bold mb-4 text-[#4300FF]">
								Best College List Requests
							</h2>
							<p className="mb-4">
								View, process, and export best college list requests.
							</p>
							<CollegeRequestTable />
						</div>
					)}
					{section === "projects" && (
						<div>
							<h2 className="text-2xl font-bold mb-4 text-[#4300FF]">
								Project Request Management
							</h2>
							<p className="mb-4">
								View and manage all project requests, assign and update status.
							</p>
							<ProjectRequestTable />
						</div>
					)}
					{section === "notifications" && (
						<div>
							<h2 className="text-2xl font-bold mb-4 text-[#4300FF]">
								Notifications & Announcements
							</h2>
							<p className="mb-4">
								Create and manage notifications and announcements.
							</p>
							<AnnouncementAdmin />
						</div>
					)}
					{section === "content" && (
						<div>
							<h2 className="text-2xl font-bold mb-4 text-[#4300FF]">
								Content Management
							</h2>
							<p className="mb-4">
								Manage FAQs, banners, images, and client reviews.
							</p>
							<h2 className="text-xl font-bold mb-4 text">
								Add Banner Here
							</h2>
							<BannerAdmin />
							<h2 className="text-xl font-bold mb-4 text">
								Add Review Here
							</h2>
							<ClientReviewAdmin />
							<h2 className="text-xl font-bold mb-4 text">
								Add Feedback images Here
							</h2>
							<FeedbackImageAdmin />
						</div>
					)}
					{section === "mentorship" && (
						<div>
							<h2 className="text-2xl font-bold mb-4 text-[#4300FF]">
								1:1 Mentorship Requests
							</h2>
							<p className="mb-4">
								View and manage 1:1 mentorship session requests.
							</p>
							<MentorshipRequestTable />
						</div>
					)}
				</section>
			</div>
		</main>
	);
}
