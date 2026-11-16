# Job Application Tracker

A responsive, client-side web application built with vanilla HTML, CSS, and JavaScript to track job applications, monitor pipeline metrics, and export application history.

## Key Features
- **Full CRUD Management:** Add, edit, and delete job applications with real-time DOM updates.
- **Persistent Client Storage:** Automatically saves and restores application records using the browser's `localStorage` API.
- **Live Pipeline Analytics:** Dynamically calculates total applications alongside status breakdowns (*Applied*, *Interviewing*, *Offer*, *Rejected*).
- **Instant Search & Multi-Column Sorting:** Filter applications by company or role in real time and sort chronologically or alphabetically.
- **One-Click CSV Export:** Generates and downloads a formatted `.csv` report directly in the browser using `Blob` and `URL.createObjectURL`.

## Tech Stack
- **Frontend:** HTML5, CSS3 (CSS Grid & Flexbox), Vanilla JavaScript (ES6+)
- **Storage & Export:** Web Storage API (`localStorage`), Browser File/Blob API