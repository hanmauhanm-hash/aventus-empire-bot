# 🏰 Aventus Empire Discord Bot

<p align="center">
  <img src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&q=80" alt="Aventus Empire Banner" width="100%" style="border-radius: 10px;" />
</p>

<p align="center">
  <strong>The Official Discord Vanguard Bot for the Aventus Empire Clan</strong><br>
  <em>Dominating Minecraft Bedrock Lifeboat Survival Mode (<code>play.lbsg.net:19132</code>)</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v24%2B-green?logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Discord.js-v14-blue?logo=discord" alt="Discord.js">
  <img src="https://img.shields.io/badge/AI-Puter.js-purple" alt="Puter.js">
  <img src="https://img.shields.io/badge/Bedrock-1.20%2B-orange?logo=minecraft" alt="Minecraft Bedrock">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

---

## 🌟 Key Features

### 🖼️ 1. Incredible Dynamic Welcome & Leave Cards
* **High-Resolution Canvas Cards**: Rendered with `@napi-rs/canvas` featuring dark obsidian imperial themes, glowing gold rings (`#FFD700`), custom server banners, player avatars, and live member count badges (`Warrior #142 of the Empire`).
* **Auto-Role Assignment**: Automatically assigns a configured clan rank (e.g., `Recruit` or `Citizen`) when new players join.
* **Departure Logs**: Dynamic leave cards tracking departure time and remaining clan strength.
* **Instant Preview**: Test and preview your cards anytime with `/test-welcome`.

### 🐾 2. OwO-Style Clan RPG & Mini-Game ("The Imperial Hunt")
* **Wilderness Expeditions (`/hunt`)**: Venture into Lifeboat survival territories to hunt 25+ Bedrock mobs and mythical imperial beasts across 6 rarity tiers (`Common`, `Uncommon`, `Rare`, `Epic`, `Mythic`, `Legendary`).
* **Imperial Menagerie (`/zoo`)**: Showcase your collection of captured beasts, attack ratings, and health pools.
* **Turn-Based Battles (`/battle`)**: Form a squad of your strongest beasts and challenge Lifeboat dungeon raid bosses (Void Destroyer, Nether Colossus) in turn-based combat.
* **Imperial Economy & Gambling**:
  * `/daily`: Daily gold salary with streak multiplier.
  * `/coinflip`: High-stakes 50/50 gold wager.
  * `/slots`: Imperial slot machine with up to 10x jackpot multipliers.
  * `/trade`: Safely transfer Empire Gold ($EG) to clan members.
  * `/leaderboard`: Clan hall of fame ranking wealthiest members, highest levels, and top hunters.

### 🧠 3. Puter.js Multi-Model AI Advisor
* Powered by the `@heyputer/puter.js` SDK.
* Strategic AI advisor fine-tuned with knowledge of:
  * Minecraft Bedrock mechanics, add-ons, and command syntax.
  * Lifeboat Survival Mode economy, spawner farms, auction house, and base security.
  * Bedrock PvP tactics (combo locking, sprint-hitting, strength II, totems, potion meta).
* Use `/ask <question>` or simply **@mention** the bot anywhere in chat!

### 📦 4. Minecraft Java to Bedrock Pack & Mod Converter
* **Full Texture Pack Porting (`/convert`)**:
  * Upload any Java `.zip` resource pack directly in Discord.
  * Automatically remaps directory trees (`assets/minecraft/textures/block` ➔ `textures/blocks`, `item` ➔ `items`, `armor`, `ui`).
  * Resolves Bedrock file naming differences (`wooden_sword` ➔ `wood_sword`, `diorite` ➔ `stone_diorite`, etc.).
  * Generates valid Bedrock `manifest.json` with RFC4122 UUIDs, `terrain_texture.json`, and `item_texture.json`.
  * Compiles directly into a `.mcpack` file that mobile, console, and Windows 10/11 players can open with 1-click!
* **Java Mod Asset Scaffolder**:
  * Extracts custom textures, sounds, and models from Java `.jar` mods and generates Bedrock Behavior Pack templates and a porting checklist.

### 🎨 5. Texturepack Recolour Engine
* **Selective In-Discord Gear Recoloring (`/recolor`)**:
  * Upload an entire `.zip`/`.mcpack` or an individual `.png` texture image (e.g., Diamond Sword, Helmet, Chestplate, Boots, or Armor Model layers).
  * Built using `sharp` pixel processing: preserves Minecraft shading, highlights, outlines, and transparency without flat color washing!
* **Color Palettes & Custom Hex**:
  * 🔴 **Ruby / Crimson Blood** (`#E74C3C`)
  * 🟣 **Amethyst / Void Purple** (`#9B59B6`)
  * 🟢 **Emerald / Toxic Green** (`#2ECC71`)
  * 🌸 **Rose Gold / Sakura Pink** (`#FF69B4`)
  * 🖤 **Midnight Onyx / Obsidian** (`#222222`)
  * ❄️ **Glacier / Cyan Ice** (`#00FFFF`)
  * ☀️ **Sunset Gold / Amber** (`#FFA500`)
  * 🎨 **Custom Hex Code** (`#RRGGBB`)

### 🛡️ 6. Lifeboat Survival Clan Tools
* **Waypoint & Coordinate Vault (`/coords`)**:
  * Securely record clan base locations, spawners, mining shafts, and vaults.
  * Supports `Personal` (private to you) or `Clan` (shared with all members).
  * 🌀 **Nether Linkage Calculator**: Exact 8:1 coordinate math ($X/8, Z/8$ or $X \times 8, Z \times 8$) for 1:1 portal linking.
* **Live Server Pulse (`/lbsg`)**:
  * Real-time query to `play.lbsg.net:19132` returning online status, MOTD, and active player counts.
* **Imperial Raid War Room (`/raid`)**:
  * Schedule raids with interactive Discord buttons (`⚔️ Join Vanguard`, `🛡️ Base Defense`, `❌ Withdraw`).
* **Survival Market Tax Calculator (`/tax`)**:
  * Computes Lifeboat auction taxes, net seller proceeds, and target markup prices.

---

## 📋 Slash Command Reference

| Command | Category | Description |
| :--- | :--- | :--- |
| `/help` | General | View command codex and features |
| `/ping` | General | Check bot latency and Discord API heartbeat |
| `/botinfo` | General | View bot memory, uptime, and engine specifications |
| `/config-welcome` | Welcome | Configure welcome channel and auto-role |
| `/config-leave` | Welcome | Configure departure log channel |
| `/test-welcome` | Welcome | Preview the dynamic welcome card in chat |
| `/hunt` | OwO RPG | Hunt wild beasts, earn Empire Gold and XP |
| `/zoo` | OwO RPG | View your captured beasts and combat stats |
| `/battle` | OwO RPG | Battle your squad against Lifeboat raid bosses |
| `/daily` | Economy | Claim daily gold salary and build your streak |
| `/coinflip` | Economy | Wager gold on heads or tails |
| `/slots` | Economy | Spin the Imperial Slot Machine |
| `/trade` | Economy | Transfer Empire Gold to another member |
| `/leaderboard` | Economy | View top clan rankings in wealth, levels, and hunts |
| `/ask` | AI Advisor | Consult the Puter.js AI Imperial Strategist |
| `/convert` | Converter | Port Java packs (.zip) or mods (.jar) to Bedrock (.mcpack) |
| `/recolor` | Recolor | Recolor diamond gear, tools, or packs |
| `/coords` | Clan Tools | Add, list, or calculate Nether portal coordinates |
| `/lbsg` | Clan Tools | Check real-time Lifeboat Bedrock server status |
| `/raid` | Clan Tools | Schedule a clan raid with interactive RSVP buttons |
| `/tax` | Clan Tools | Calculate survival trade taxes and net profits |

---

## 🚀 Quick Start Guide (Local Setup)

### 1. Prerequisites
* [Node.js](https://nodejs.org/) **v20.0.0 or higher** (Tested on Node.js v24).
* A Discord Bot Application from the [Discord Developer Portal](https://discord.com/developers/applications).

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in:
* `DISCORD_TOKEN`: Your Discord bot token.
* `CLIENT_ID`: Your Discord application client ID.
* `PUTER_AUTH_TOKEN`: Your free Puter token from [puter.com/dashboard](https://puter.com/dashboard).
* `GUILD_ID`: *(Optional)* Your Discord Server ID for instant command updates during testing.

### 3. Register Slash Commands
```bash
npm run deploy-commands
```

### 4. Start the Bot
```bash
npm start
```

---

## 🚢 Deploying to GitHub & Hosting 24/7

### Step 1: Push Code to GitHub
Initialize a git repository on your machine and push to GitHub:
```bash
git init
git add .
git commit -m "feat: initial commit of Aventus Empire Discord Bot"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

---

### Step 2: 24/7 Hosting Options

#### Option A: Railway (Recommended — 1-Click Setup)
1. Go to [Railway.app](https://railway.app/) and sign in with GitHub.
2. Click **New Project** ➔ **Deploy from GitHub repo**.
3. Select your `Aventus Bot` repository.
4. In **Variables**, add:
   * `DISCORD_TOKEN` = `your_token`
   * `CLIENT_ID` = `your_client_id`
   * `PUTER_AUTH_TOKEN` = `your_puter_token`
5. Railway detects the `Procfile` and runs `node src/index.js` with 24/7 uptime!

#### Option B: Render (Background Worker)
1. Go to [Render.com](https://render.com/) and connect your GitHub repo.
2. Create a **Background Worker** (Node environment).
3. Set Build Command: `npm install`
4. Set Start Command: `node src/index.js`
5. Add your environment variables under the **Environment** tab.

#### Option C: Docker / VPS / Pterodactyl
The repository includes a ready-to-run `Dockerfile` and `docker-compose.yml`:
```bash
docker compose up -d --build
```

---

## 📜 Database & Persistence
The bot uses an embedded **SQLite** database (`data/aventus.sqlite`) running with Write-Ahead Logging (`WAL` mode). All user balances, inventories, server settings, and clan coordinates persist seamlessly across restarts.

---

## 🛡️ License
Distributed under the **MIT License**. Created with honor for the **Aventus Empire**.
