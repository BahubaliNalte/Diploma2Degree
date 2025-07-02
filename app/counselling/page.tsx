"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaUniversity, FaBrain, FaBell, FaCrown, FaGift, FaMapMarkedAlt } from "react-icons/fa";
import { useEffect, useState } from "react";

const counsellingServices = [
	{
		title: "Prepare a College List",
		href: "/counselling/colleges",
		icon: <FaUniversity />,
		description: (
			<>
				Explore engineering colleges with location, stream and Cutoff filters with our <b>AI model</b>.
			</>
		),
		color: "bg-gradient-to-r from-blue-500 to-blue-700",
	},
	{
<<<<<<< HEAD
		title: "Rankwise Clg Prediction",
=======
		title: "Cutoff Predictor",
>>>>>>> 319ab366af1a7894d15d8a336cf1997cea2e37e1
		href: "/counselling/predictor",
		icon: <FaBrain />,
		description: (
			<>
				Find which colleges you might get into based on your <b>Rank</b> using our <b>AI Model</b>.
			</>
		),
		color: "bg-gradient-to-r from-purple-500 to-purple-700",
	},
	{
		title: "Admission Notifications",
		href: "/counselling/notifications",
		icon: <FaBell />,
		description: (
			<>
				Stay updated on admission <b>deadlines</b>, <b>CAP rounds</b>, and important dates.
			</>
		),
		color: "bg-gradient-to-r from-yellow-500 to-yellow-700",
	},
	{
		title: "Premium Counselling",
		href: "/counselling/premium",
		icon: <FaCrown />,
		description: (
			<>
				Book a <b>personal counselling session</b> and get expert guidance.
			</>
		),
		color: "bg-gradient-to-r from-pink-500 to-pink-700",
	},
	{
		title: "Scholarship Info",
		href: "/counselling/scholarships",
		icon: <FaGift />,
		description: (
			<>
				Explore available <b>scholarships</b> for diploma and engineering students.
			</>
		),
		color: "bg-gradient-to-r from-green-500 to-green-700",
	},
	{
		title: "All Maharashtra Colleges",
		href: "/counselling/maharashtra-colleges",
		icon: <FaMapMarkedAlt />,
		description: (
			<>
				View a complete list of engineering colleges in <b>Maharashtra</b>.
			</>
		),
		color: "bg-gradient-to-r from-indigo-500 to-indigo-700",
	},
];

export default function CounsellingHomePage() {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	if (!mounted) return null;

	return (
		<main className="min-h-screen bg-gradient-to-br from-[#4300FF] to-[#00FFDE] px-6 md:px-20 py-16 font-poppins">
			<motion.h1
				initial={{ opacity: 0, y: -30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1 }}
				className="text-4xl md:text-5xl font-bold text-white text-center mb-12"
			>
				Counselling Services
			</motion.h1>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
				{counsellingServices.map((service, index) => (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: index * 0.1 }}
						viewport={{ once: true }}
						className={`rounded-xl p-6 shadow-lg text-white ${service.color}`}
					>
						<Link href={service.href} className="block hover:opacity-90">
							<div className="flex items-center gap-4 mb-4 text-3xl">
								<span>{service.icon}</span>
								<h3 className="text-2xl font-semibold">{service.title}</h3>
							</div>
							<p className="text-white text-base">{service.description}</p>
						</Link>
					</motion.div>
				))}
			</div>
		</main>
	);
}
