# 🤖 TRYHACKME AUTO EXTEND


[![GitHub license](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/multinike/tryhackme-auto-extend.svg?style=social)](https://github.com/YourUsername/tryhackme-auto-extend)


This repository provides two essential tools for an optimal TryHackMe (THM) machine experience:

1.  **Mozilla WebExtension**: Automatically monitors and extends the time remaining on your active THM machine, ensuring continuous access without manual intervention.

2.  **Python Utility**: A simple script to quickly and correctly update your `/etc/hosts` file with the target machine's IP address.


---


## 🎯 Features

### 🦊 Extension

* **Auto-Extend**: Runs silently in the background, automatically clicking the "Extend" button when the session time drops to a defined threshold.
* **Non-Intrusive**: Only runs on active TryHackMe machine pages.
* **Configuration**: Easy-to-adjust threshold for when the extension should trigger the extend action.

### 🐍 Python Utility

* **Cross-Platform**: Designed for Linux and macOS.
* **One-Command Setup**: Adds the machine IP and a user-defined alias (e.g., `target.thm`) to your hosts file.
* **Cleanup**: Provides an option to remove the entry once you are finished with the room.


---


## 🚀 Installation & Setup

### Part 1: Mozilla WebExtension

#### 1. Download the Extension Files
Clone this repository or download the `extension/` directory.

#### 2. Install in Firefox
Since this is an unsigned extension, you need to install it temporarily:

1.  Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2.  Click the "**Load Temporary Add-on...**" button.
3.  Navigate to the `extension/` folder in this repository and select any file within it (e.g., `manifest.json`).

The extension will now be active until you close or restart Firefox.

> **Note:** For permanent installation, you would need to self-sign the extension or follow the steps for submission to the Mozilla Add-ons store.

### Part 2: Python Hosts File Utility

1.  Ensure you have Python 3 installed.
2.  Download the `hosts_updater.py` script.
3.  (Optional but Recommended) Make the script executable:

    ```bash
    chmod +x thm_hosts_updater.py
    ```

---


## 💡 Usage

### 1. Auto Extend Extension (Automatic)

1.  Start any machine on TryHackMe.
2.  Navigate to the machine access page (the page showing the IP and timer).
3.  The extension will automatically begin monitoring the timer. **No user action is required.**
4.  It automatically detects a THM room url and whenever a tab is switched to, it starts listening for the machine timeout.

#### A. 🖥️ Server Mode (Recommended for Auto-Update)

This mode starts a local web server that communicates with the browser extension (`content-script.js`). When the extension detects a new machine IP, it sends the update to this server, which then automatically updates your `/etc/hosts` file.

**Steps:**

1.  **Start the Server:** Open a terminal and run the script without any arguments:

    ```bash
    python thm_hosts_updater.py
    ```

2.  **Verify Output:** The terminal should show the server starting and listening:

    > `THM Hosts Updater listening on http://127.0.0.1:8123`<br>
    > `Ready to auto-update machine.thm → use with the content.js script!`<br>
    > `    Serving Flask app 'thm_hosts_updater'`<br>
    > `    Debug mode: off`<br>
    > `WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.`<br>
    > `    Running on http://127.0.0.1:8123`<br>
    > `Press CTRL+C to quit`

3.  **Automatic Updates:** Once running, simply start a machine on TryHackMe. The browser extension will communicate with the server to automatically insert the machine's IP address under the alias `machine.thm` (or your configured alias).

4.  **On Update:** Your `/etc/hosts/` file should now contain an entry with the room ip and domain machine.thm with the room name. `10.48.168.71    machine.thm  # THM room: Scheme Catcher`
   
> **Note:** The server will likely prompt you for your `sudo` password the **first time** the extension pushes a new IP update, as modifying `/etc/hosts` requires root permissions. <br> <br> If you want to avoid entering your `sudo` password on every update, run the python script as root by switching to root user using `sudo su`.


---


## How to Contribute

We encourage you to contribute to this project!

1.  **Fork** the repository.
2.  Create a new branch: `git checkout -b feature/your-new-feature`
3.  Make your changes and commit them: `git commit -m 'feat: Add new feature X'`
4.  Push to the branch: `git push origin feature/your-new-feature`
5.  Open a **Pull Request** and describe your changes clearly.

For major changes, please open an issue first to discuss what you would like to change.


---


## 📄 License

[![GitHub license](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

This project is licensed under the **MIT License**. 

For the full terms and conditions, please see the [LICENSE](LICENSE) file in the root of the repository.

---
