<div align="center">
  <img src="public/icon-512.png" alt="7 Habits Tracker app icon" width="110" />
  <h1>7 Habits Tracker</h1>
  <p><strong>Turn timeless principles into a daily practice you can measure.</strong></p>
  <p>A mobile-first habit tracker inspired by Stephen R. Covey's <em>The 7 Habits of Highly Effective People</em>.</p>
  <p><a href="https://github.com/Toqh/seven-habits">View Repository</a></p> <p><a href="sevenhabits.space">sevenhabits.space</a></p>
</div>


About the app

7 Habits Tracker helps users move beyond simply reading about the seven habits and begin practising them intentionally. Each habit is broken into clear, practical actions that users can check off every day. The app calculates a daily score, records reflections, tracks progress over time, and syncs data across devices.

The habits are organised into Covey's three stages of growth:

Private Victory: Be Proactive, Begin with the End in Mind, and Put First Things First

Public Victory: Think Win-Win, Seek First to Understand, and Synergize

Renewal: Sharpen the Saw

Features

Daily checklist with practical actions for all seven habits

Automatic daily scores and save status

Habit-specific notes and personal reflections

Weekly, monthly, and all-time progress tracking

Current and best streak statistics

Progress charts and a daily journal history

Eisenhower Time Management Matrix with task history

Guided personal mission statement builder and weekly reflections

Email authentication, password reset, and cross-device cloud sync

List and grid checklist layouts

Light and dark themes

Configurable browser notifications for daily check-ins

Installable Progressive Web App (PWA)

Pro features

Detailed 30-day analytics

Custom actions and editable habit prompts

CSV and printable PDF history exports

Monthly streak-protection tokens

Tech stack

Technology

Purpose

React

User interface

Vite

Development and production builds

Supabase

Authentication, profiles, and cloud data

Recharts

Progress charts and analytics

Lucide React

Interface icons

Vite PWA

Service worker and installable app support

Getting started

Prerequisites

Node.js 20.19+ or 22.12+

npm

Installation

Clone the repository:

git clone https://github.com/Toqh/seven-habits.git
cd seven-habits

Install the dependencies:

npm install

Start the development server:

npm run dev

Open the local URL shown in your terminal, usually http://localhost:5173.

Supabase configuration

The Supabase client is configured in src/supabase.js. The app expects a Supabase project with email authentication and the following tables:

profiles for user settings, Pro status, custom actions, and mission statements

logs for daily habit scores, completed actions, and notes

matrix_tasks for Eisenhower Matrix tasks

licence_keys for Pro licence activation

To connect your own backend, replace the project URL and publishable key in src/supabase.js, then create compatible tables and Row Level Security policies in Supabase. Never expose a Supabase service-role key in the client application.

Available scripts

Command

Description

npm run dev

Start the Vite development server

npm run build

Create an optimised production build

npm run preview

Preview the production build locally

npm run lint

Check the code with ESLint

Project structure

seven-habits/
├── public/             # PWA manifest, icons, and redirect rules
├── src/
│   ├── assets/         # App images and visual assets
│   ├── App.jsx         # Main application and feature components
│   ├── App.css         # Component styles
│   ├── index.css       # Global styles
│   ├── main.jsx        # React entry point
│   └── supabase.js     # Supabase client configuration
├── index.html
├── package.json
└── vite.config.js      # Vite and PWA configuration

Production build

npm run build
npm run preview

The production files are generated in dist/. The included public/_redirects file supports single-page-app routing on compatible hosting services.

Contributing

Contributions are welcome. To propose a change:

Fork the repository.

Create a branch: git checkout -b feature/your-feature.

Make and test your changes.

Commit your work: git commit -m "Add your feature".

Push the branch and open a pull request.

Author

Created by Toqh.

Disclaimer

This is an independent practice companion inspired by the principles in The 7 Habits of Highly Effective People. It is not an official product of, or affiliated with, Stephen R. Covey or FranklinCovey.
