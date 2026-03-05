# Push-up Tracker — Setup Guide

Follow these steps exactly and you'll have the app on your iPhone in about 20 minutes.

---

## Step 1 — Create a GitHub account
Go to https://github.com and sign up for a free account.

---

## Step 2 — Create a new GitHub repository

1. Once logged in, click the **+** icon (top right) → **New repository**
2. Name it: `pushup-tracker`
3. Make sure it's set to **Public**
4. Click **Create repository**

---

## Step 3 — Upload the project files to GitHub

1. On your new empty repository page, click **"uploading an existing file"**
2. You need to upload the files keeping this folder structure:

```
pushup-tracker/
├── package.json
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── sw.js
└── src/
    ├── index.js
    └── App.js
```

3. Drag all files into the GitHub upload area (you can drag the whole folder)
4. Scroll down, click **Commit changes**

---

## Step 4 — Deploy on Vercel

1. Go to https://vercel.com
2. Click **Sign Up** → choose **Continue with GitHub**
3. Authorize Vercel to access your GitHub
4. Click **Add New Project**
5. Find `pushup-tracker` in the list → click **Import**
6. Leave all settings as default → click **Deploy**
7. Wait ~60 seconds — Vercel will give you a URL like `pushup-tracker.vercel.app`

---

## Step 5 — Add to your iPhone home screen

1. On your iPhone, open **Safari** (must be Safari, not Chrome)
2. Go to your Vercel URL
3. Tap the **Share button** (square with arrow pointing up, in the bottom bar)
4. Scroll down and tap **"Add to Home Screen"**
5. Name it **"Push-ups"** → tap **Add**

The app now lives on your home screen, opens fullscreen, and works offline! 🎉

---

## Your data
All your push-up data is saved locally on your iPhone. It will persist as long as you don't clear Safari's website data.
