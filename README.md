# CyberSecureX - Security Command Center & Threat Detection Platform

CyberSecureX is a full-stack cybersecurity command center designed to protect users against phishing, spam, malicious URLs, weak authentication, and online fraud. Featuring a modern dark glassmorphism dashboard, CyberSecureX integrates real-time threat detection modules with an AI-powered assistant trained on national cyber crime helpline procedures (1930).

---

## Table of Contents
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Directory Structure](#directory-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Author](#author)

---

## Key Features

### 1. Communication Threats
* **Email Scanner:** Analyzes email headers and body content for phishing signatures, spoofed domains, and malicious attachments.
* **SMS / WhatsApp Filter:** Scans SMS messages and chat payloads for smishing links and fraud patterns.
* **Mobile Spam Detection:** Cross-references phone numbers against spam registries and community reporting databases.

### 2. Account Security
* **Password Strength Audit:** Evaluates password entropy, complexity, and checks against exposed data breaches.
* **2FA Configuration:** Audits two-factor authentication readiness and guides multi-factor setup.
* **Instagram Fake Account Detector:** Analyzes social media profile metadata, follower ratios, and activity patterns to identify impersonators.

### 3. Digital Safety
* **Malicious URL Checker:** Conducts deep domain reputation checks, SSL certificate validations, and redirect path analysis.
* **Safe QR Code Scanner:** Decodes uploaded QR code images to inspect embedded links before execution.
* **Incident Dossier Logs:** Maintains persistent audit trails and logs for reported threats.

### 4. Cyber Awareness & Assistance
* **AI Cyber Assistant:** Real-time conversational helper configured for national cyber crime helpline (1930) reporting workflows.
* **Security Practice Quiz:** Interactive testing module to assess and train user cybersecurity knowledge.

---

## Tech Stack

* **Frontend:** HTML5, Tailwind CSS (Dark Glassmorphism Theme), JavaScript (ES6+ Fetch API, Dynamic DOM)
* **Backend:** Python 3.10+, Flask, Flask-CORS, Flask-Bcrypt
* **Database:** SQLite (Default / Development) / MongoDB
* **Deployment:** Render / Gunicorn WSGI Server

---

## Project Architecture

```text
                               ┌─────────────────────────┐
                               │     Web Browser Client  │
                               │ (Tailwind UI + JS API)  │
                               └────────────┬────────────┘
                                            │ HTTP / JSON
                                            v
                               ┌─────────────────────────┐
                               │   Flask REST API Server │
                               │        (app.py)         │
                               └────────────┬────────────┘
                                            │
        ┌───────────────────┬───────────────┼───────────────┬──────────────────┐
        v                   v               v               v                  v
┌──────────────┐    ┌──────────────┐ ┌──────────────┐ ┌─────────────┐   ┌──────────────┐
│ Email & SMS  │    │ Password/2FA │ │  URL / QR    │ │  AI Cyber   │   │ Incident Log │
│ Analyzer     │    │ Audit Engine │ │ Inspector    │ │ Assistant   │   │ Database     │
└──────────────┘    └──────────────┘ └──────────────┘ └─────────────┘   └──────────────┘
