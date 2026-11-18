# Job Application Tracker

A full-stack web application built with HTML5, CSS3, Vanilla JavaScript, and Supabase to track job applications, authenticate users, and monitor pipeline analytics in real time.

## Live Demo
[View Live Application](https://job-application-tracker-seven-mu.vercel.app/)

## Key Features
- **User Authentication & Cloud Sync:** Secure email/password sign-up and login powered by Supabase Auth, syncing application data across devices via PostgreSQL.
- **Row-Level Security (RLS):** Database policies ensure authenticated users can only view, create, update, and delete their own records.
- **Full CRUD Management:** Add, edit, and delete job applications with real-time DOM updates and XSS-safe HTML escaping.
- **Live Pipeline Analytics:** Dynamically calculates total applications alongside status breakdowns (*Applied*, *Interviewing*, *Offer*, *Rejected*).
- **Instant Search, Sorting & CSV Export:** Filter applications by company or role in real time, sort by multiple columns, and export a formatted `.csv` report directly in the browser.

## Tech Stack
- **Frontend:** HTML5, CSS3 (Grid & Flexbox), Vanilla JavaScript (ES6+)
- **Backend & Database:** Supabase (PostgreSQL, Auth, Row-Level Security)
- **Deployment:** Vercel