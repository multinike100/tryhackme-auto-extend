// ==UserScript==
// @name         THM Auto-IP + Smart Auto-Extend (Dec 2025+)
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  Automatically updates /etc/hosts via local server and extends machines before they expire
// @author       You + Grok fixes
// @match        https://tryhackme.com/room/*
// @match        https://tryhackme.com/hacktivities*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';

  const LOCAL_SERVER = 'http://localhost:8123';           // Your local Flask/FastAPI/etc server
  const MACHINES_URL = 'https://tryhackme.com/api/v2/vms/running';
  const EXTEND_URL = 'https://tryhackme.com/api/v2/vms/extend';
  const CSRF_URL = "https://tryhackme.com/api/v2/auth/csrf"
  let extendRetires = 0
  let currentSlug = null;
  let lastIp = null;

  const sleep = ms => new Promise(res => setTimeout(res, ms));

  const getCSRF = async () => {
    try {
      const resp = await fetch(CSRF_URL)
      if (resp.ok) {
        const data = await resp.json()
        const csrf = data.data.token
        return csrf
      }
      return null
    } catch {
      return null
    } finally {

    }
  }

  const getAuthHeaders = async () => {
    // THM now requires CSRF + cookies. Tampermonkey automatically sends cookies.
    const cookie = document.cookie;
    const csrf = await getCSRF()
    return csrf ? { 'Cookie': cookie, "csrf-token": csrf } : { 'Cookie': cookie };
  };

  const fetchWithAuth = async (url, options = {}) => {
    return fetch(url, {
      ...options,
      credentials: 'include', // Important: send cookies
      headers: {
        'Content-Type': 'application/json',
        ...await getAuthHeaders(),
        ...options.headers
      }
    });
  };

  const getRunningMachines = async () => {
    try {
      const resp = await fetchWithAuth(MACHINES_URL);
      if (!resp.ok) return [];
      const json = await resp.json();
      return json.data || [];
    } catch (e) {
      console.error('[THM] Failed to fetch running machines', e);
      return [];
    }
  };

  const extendMachine = async (machineId) => {

    try {
      const resp = await fetchWithAuth(EXTEND_URL, {
        method: 'POST',
        body: JSON.stringify({ "id": machineId })
      });

      const result = await resp.json();
      if (result.status === 'success') {
        console.log('[THM] Successfully extended machine by 1 hour');
        return true;
      } else {
        console.warn('[THM] Extend request failed:', result.data.message);
        return false;
      }
    } catch (e) {
      console.error('[THM] Extend error:', e);
      return false;
    }
  };

  const sendIpToLocal = async (ip, slug) => {
    if (ip === lastIp) return; // avoid duplicate requests

    try {
      const resp = await fetch(`${LOCAL_SERVER}/update-hosts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, slug }),
        keepalive: true
      });

      if (resp.ok) {
        console.log(`[THM] Hosts updated → ${ip} ${slug}.thm`);
        lastIp = ip;
      } else {
        const message = await resp.json()
        if (message.error === "Already in hosts file!") {
          lastIp = ip
          console.warn(`[THM] ${message.error}`);
          return
        }
        console.warn('[THM] Local server responded with', resp.status, message);
      }
    } catch (e) {
      console.error('[THM] Could not reach local server (is it running?)', e);
    }
  };

  const getCurrentSlug = () => window.location.pathname.split('/').filter(Boolean).pop().trim();

  const poll = async () => {
    const slug = getCurrentSlug();
    // Detect room change
    if (slug && slug !== currentSlug) {
      console.log(`[THM] Room changed → ${slug}`);
      currentSlug = slug;
      lastIp = null;
    }

    if (!slug) {
      console.log("No Slug!")
      return
    };

    const machines = await getRunningMachines();
    if (machines.length === 0) {
      // No machine running — optionally clear hosts here if you want
      return;
    }

    // Use the most recently started machine
    const machine = machines.filter(mac => mac.roomCode === currentSlug)[0]

    if (!machine.internalIP) {
      console.log('[THM] Machine starting, waiting for IP...');
      return;
    }

    // Send IP to local server
    await sendIpToLocal(machine.internalIP, machine.roomTitle);

    // Auto-extend logic: when ≤6 minutes left
    const now = new Date(new Date().toISOString())
    const expires = new Date(machine.expires);
    const minutesLeft = parseInt((expires - now) / (1000 * 60))
    if (minutesLeft <= 10 && minutesLeft > 0 && extendRetires <= 2) {
      console.info(`[THM] Only ${minutesLeft.toFixed(1)} min left → extending...`);
      const success = await extendMachine(machine.id);
      if (success) {
        // Small delay then refresh to get new expiry time
        await sleep(3000);
        window.location.reload();
        extendRetires = 0
      } else {
        extendRetires++;
      }
    } else if (minutesLeft <= 14) {
      console.info(`[THM] Time remaining: ${minutesLeft} min`);
    }
  };

  // Run immediately, then every 15 seconds
  poll();
  setInterval(poll, 15000);

  console.log('THM Auto-IP + Smart Auto-Extend v2.4 loaded – Dec 2025');
})();