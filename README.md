# Diploma2Degree – College Predictor & Counseling Platform

Diploma2Degree is a web application designed to help diploma students find the best engineering colleges based on their scores, branch preferences, location, and reservation categories. The platform features advanced prediction algorithms, secure payment integration, and a user-friendly interface.

## Features

- 🎓 **College Predictor:** Get personalized college recommendations using historical cutoff data.
- 🏫 **Dynamic Filtering:** Filter colleges by branch, location, and reservation category.
- 🔒 **Secure Payments:** Integrated Razorpay for premium counseling services.
- 📊 **Admin Dashboard:** Manage reviews, mentorship requests, and college data efficiently.
- 💻 **Responsive UI:** Clean, intuitive design for seamless user experience across devices.

## Tech Stack

- **Frontend:** React, Next.js, TypeScript
- **Backend & Database:** Firebase
- **Payments:** Razorpay API
- **Other:** REST APIs, Framer Motion, CSS Modules

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/diploma2degree.git
   cd diploma2degree
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase:**
   - Create a Firebase project.
   - Add your Firebase config to `/lib/firebase.ts`.

4. **Configure Razorpay:**
   - Add your Razorpay API keys to the backend routes in `/app/api`.

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Screenshots

![College Predictor](screenshots/predictor.png)
![Counseling Dashboard](screenshots/dashboard.png)

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)

---

**Live:** [diploma2degree.co.in](https://diploma2degree.co.in)

**Contact:** [your.email@example.com](mailto:your.email@example.com)
