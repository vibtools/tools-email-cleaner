# Bulk Email List Cleaner & Scrubber - Free Online Email Verifier

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Privacy: 100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20Client--Side-brightgreen.svg)](#privacy-first-architecture)

The ultimate **privacy-first bulk email list cleaner** and scrubber. This professional-grade web tool helps you maintain high **email list hygiene** by removing duplicates, fixing common typos, and verifying email formats—all entirely within your browser.

**Live Demo:** [https://cleanmail.vib.tools/](https://cleanmail.vib.tools/)

---

## 🚀 Key Features

- **✅ Bulk Email List Scrubbing:** Process thousands of emails instantly from TXT, CSV, and Excel (XLSX) files.
- **🛡️ 100% Data Privacy:** Your files are **never uploaded to a server**. All processing happens locally on your machine using Web Workers.
- **🪄 Smart Auto-Correction:** Automatically detects and repairs common domain typos (e.g., `gamil.com` → `gmail.com`).
- **🔄 Sequential Batch Processing:** Upload multiple files one after another to create a consolidated master list.
- **🧹 Global Deduplication:** Remove duplicate entries across your entire batch session.
- **📊 Detailed Health Stats:** Real-time dashboard showing valid, duplicate, invalid, and auto-corrected counts.
- **🌐 Domain Distribution:** Analyze your list composition with instant domain-level statistics.

---

## 🛠️ How It Works

1. **Upload or Paste:** Drop your `.csv`, `.xlsx`, or `.txt` files into the tool or paste raw text.
2. **Auto-Clean:** The tool instantly identifies syntax errors, duplicates, and suspicious domains.
3. **Verify Health:** Use the visual indicators to see which emails are "Valid", "Suspicious", or "Auto-Fixed".
4. **Export:** Download your pristine list as a clean TXT or CSV file ready for your CRM (Mailchimp, HubSpot, etc.).

---

## 💎 Why Professional Marketers Choose This Tool?

### **1. Reduce Bounce Rates**
By verifying email formats and scrubbing invalid domains, you significantly lower your bounce rate and protect your **sender reputation**.

### **2. Save Valuable Leads**
Our unique **Auto-Correction engine** saves leads that would otherwise be lost to simple keyboard typos.

### **3. Zero Login Required**
No registration, no subscription, and no data collection. Just a pure, high-performance utility for real workflows.

---

## 💻 Technical Stack

- **Framework:** React 18 with TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS
- **Animations:** Motion (Framer Motion)
- **Processing:** Multithreaded Web Workers for background data scrubbing
- **Excel Support:** `XLSX` (SheetJS) for seamless spreadsheet parsing

---

## 📦 Installation & Local Development

If you want to run this tool locally or contribute:

```bash
# Clone the repository
git clone https://github.com/your-username/bulk-email-list-cleaner.git

# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

---

## 🔒 Privacy First Architecture

This tool was built with a "Privacy-by-Design" philosophy. Most online email verifiers require you to upload your sensitive customer data to their servers. **We don't.** 

By utilizing the modern browser's file API and Web Workers, we've moved the entire cleaning engine to your device. Your data stays in your RAM and disappears when you close the tab.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 🌟 Support Vib Tools

If this tool helped you clean your list, please consider giving this repository a ⭐ to help others discover it!

---
**Keywords:** bulk email cleaner, email list scrubber, free email verifier, email list hygiene, remove duplicate emails, fix email typos, browser-based email verifier, private email scrubbing tool, CSV email cleaner.
