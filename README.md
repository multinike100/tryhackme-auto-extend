# 🤖 TRYHACKME AUTO EXTEND

![GitHub license](https://img.shields.io/badge/License-MIT-blue.svg)
![GitHub stars](https://img.shields.io/github/stars/multinike/tryhackme-auto-extend.svg?style=social)

---

## ✨ Overview

This repository offers two essential tools for a seamless TryHackMe (THM) machine experience:

1.  **🦊 Mozilla WebExtension**: Automatically monitors and extends the time remaining on your active THM machine, ensuring continuous access without manual intervention.
2.  **🐍 Python Utility**: A simple script to quickly and correctly update your `/etc/hosts` file with the target machine's IP address.

---

## 🎯 Key Features

### WebExtension (Auto-Extend)

* **Silent Automation**: Runs in the background, automatically clicking the "Extend" button when the session time drops to a user-defined threshold.
* **Non-Intrusive**: Only activates on active TryHackMe machine pages.
* **Configurable**: Easily adjust the time threshold for when the extension should trigger the extend action.

### Python Utility (Hosts File)

* **Cross-Platform**: Designed for Linux and macOS environments.
* **One-Command Setup**: Adds the machine IP and a user-defined alias (e.g., `target.thm`) to your hosts file.
* **Cleanup Option**: Provides a command to remove the entry once you are finished with the room.

---

## 🚀 Installation & Setup

### Part 1: Mozilla WebExtension

#### 1. Download Files
Clone this repository or download the contents of the `extension/` directory.

#### 2. Install Temporarily in Firefox

Since this is an unsigned extension, temporary installation is required:

1.  Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2.  Click the "**Load Temporary Add-on...**" button.
3.  Navigate to the `extension/` folder and select any file within it (e.g., `manifest.json`).

> **⚠️ Note:** The extension will remain active **only until** you close or restart Firefox.

### Part 2: Python Hosts File Utility

1.  Ensure you have **Python 3** installed.
2.  Download the `hosts_updater.py` script.
3.  **(Recommended)** Make the script executable:

    ```bash
    chmod +x thm_hosts_updater.py
    ```

---

## 💡 Usage

### 1. Auto Extend Extension (Automatic)

1.  Start any machine on TryHackMe.
2.  Navigate to the machine access page (the one showing the IP and timer).
3.  The extension will **automatically** begin monitoring the timer. **No user action is required.**
4.  It detects the THM room URL and starts listening for the machine timeout whenever the tab is active.

### 2. 🖥️ Server Mode for Auto `/etc/hosts` Update (Recommended)

This mode starts a local web server to communicate with the browser extension (`content-script.js`). The extension sends the new machine IP to this server, which then automatically updates your `/etc/hosts` file.

**Steps:**

1.  **Start the Server:** Open a terminal and run the script without any arguments:

    ```bash
    python thm_hosts_updater.py
    ```

2.  **Verify Output:** The server should start and display a message similar to this:

    ```
    THM Hosts Updater listening on [http://127.0.0.1:8123](http://127.0.0.1:8123)
    Ready to auto-update machine.thm → use with the content.js script!
    ... (Flask server warnings)
    Press CTRL+C to quit
    ```

3.  **Automatic Updates:** Once running, start a machine on TryHackMe. The browser extension will communicate with the server to automatically insert the machine's IP address under the alias `machine.thm` (or your configured alias).

4.  **Example Hosts Entry:** After an update, your `/etc/hosts` file will contain an entry like:
    `10.48.168.71    machine.thm  # THM room: Scheme Catcher`

> **🔑 Root Permissions Note:** The server will likely prompt you for your `sudo` password the **first time** the extension pushes a new IP update, as modifying `/etc/hosts` requires root permissions.
>
> To avoid entering your `sudo` password on every update, run the python script as root using `sudo su` before execution.

---

## How to Contribute

We encourage you to contribute!

1.  **Fork** the repository.
2.  Create a new branch: `git checkout -b feature/your-new-feature`
3.  Make your changes and commit them: `git commit -m 'feat: Add new feature X'`
4.  Push to the branch: `git push origin feature/your-new-feature`
5.  Open a **Pull Request** and describe your changes clearly.

For major changes, please open an issue first to discuss your proposal.

---

## 📄 License

![GitHub license](https://img.shields.io/badge/License-MIT-blue.svg)

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for the full terms and conditions.
