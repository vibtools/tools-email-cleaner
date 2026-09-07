# Email Data Cleaner

A fast, private, and free web tool to clean, filter, and extract emails from messy data. Processed entirely in your browser.

![VibTools Logo](https://vibtools.github.io/vibtools-brand-assets/logos/icon-512.png)

## Features

- **Multi-Source Import**: Paste text directly or upload TXT, CSV, and Excel files.
- **Smart Extraction**: Automatically finds emails within any text format.
- **Deduplication**: Remove duplicate emails with one click.
- **Validation**: Filter out invalid email formats.
- **Normalization**: Convert all emails to lowercase and sort them alphabetically.
- **Domain Filtering**: Filter results by specific domains (e.g., gmail.com).
- **Domain Distribution**: View stats on email counts per domain.
- **Flexible Export**: Download cleaned lists as TXT or CSV files.
- **100% Private**: No data is ever sent to a server. All processing happens in your browser.

## Built By

**Vib Tools** builds practical desktop apps, self-hosted software, automation tooling, and developer utilities for real workflows.

- **Website**: [https://vib.tools/](https://vib.tools/)
- **GitHub**: [https://github.com/vibtools](https://github.com/vibtools)

## Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS** for styling
- **Motion** for animations
- **Lucide React** for icons
- **XLSX** for Excel file parsing
- **Web Workers** for background processing

## Deployment (Cloudflare Pages)

This project is optimized for deployment on **Cloudflare Pages**.

1. **Build Command**: `npm run build`
2. **Build Output Directory**: `dist`
3. **Subdomain**: Configure `cleanmail.vib.tools` in your Cloudflare dashboard.

The project includes `_redirects` and `_headers` files in the `public/` folder to handle SPA routing and security headers automatically on Cloudflare.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For technical support, contact [support@vib.tools](mailto:support@vib.tools).
For general inquiries, contact [hello@vib.tools](mailto:hello@vib.tools).

---
© 2026 Vib Tools. Practical software for real workflows.
