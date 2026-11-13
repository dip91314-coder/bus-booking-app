import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';

const ROUTES = [
  { name: 'Home', path: '/' },
  { name: 'Search_Results', path: '/buses' },
  { name: 'Search_Results_Query', path: '/search?from=Delhi&to=Jaipur&date=2026-11-20' },
  { name: 'Seat_Selection', path: '/bus/1/seats' },
  { name: 'Passenger_Details', path: '/booking/passengers' },
  { name: 'Payment', path: '/booking/payment' },
  { name: 'Confirmation', path: '/booking/confirmation/BK12345' },
  { name: 'Login', path: '/login' },
  { name: 'Register', path: '/register' },
  { name: 'Forgot_Password', path: '/forgot-password' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
  { name: 'Destinations', path: '/destinations' },
  { name: 'Routes', path: '/routes' },
  { name: 'Help', path: '/help' },
  { name: 'Privacy_Policy', path: '/privacy-policy' },
  { name: 'Terms_Conditions', path: '/terms-and-conditions' },
  { name: 'Admin_Dashboard', path: '/admin/dashboard' },
  { name: 'Admin_Buses', path: '/admin/buses' },
  { name: 'Admin_Routes', path: '/admin/routes' },
  { name: 'Admin_Schedules', path: '/admin/schedules' },
  { name: 'Admin_Bookings', path: '/admin/bookings' },
  { name: 'Admin_Passengers', path: '/admin/passengers' },
  { name: 'Admin_Drivers', path: '/admin/drivers' },
  { name: 'Admin_Staff', path: '/admin/staff' },
  { name: 'Admin_Payments', path: '/admin/payments' },
  { name: 'Admin_Offers', path: '/admin/offers' },
  { name: 'Admin_Reviews', path: '/admin/reviews' },
  { name: 'Admin_Reports', path: '/admin/reports' },
  { name: 'Admin_Notifications', path: '/admin/notifications' },
  { name: 'Admin_Settings', path: '/admin/settings' }
];

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 375, height: 667 }
];

async function deepAudit() {
  const screenshotDir = path.resolve('audit-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });

  const issues = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n===========================================`);
    console.log(`Starting Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`===========================================`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height }
    });
    const page = await context.newPage();

    page.on('pageerror', err => {
      console.error(`[PAGE ERROR] [${vp.name}] ${err.message}`);
      issues.push({ type: 'PageError', viewport: vp.name, message: err.message });
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        // filter out react-devtools or 404 images if any
        console.warn(`[CONSOLE ERROR] [${vp.name}] ${msg.text()}`);
        issues.push({ type: 'ConsoleError', viewport: vp.name, message: msg.text() });
      }
    });

    for (const route of ROUTES) {
      const url = `${BASE_URL}${route.path}`;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
        await page.waitForTimeout(600); // let UI settle

        // Check for horizontal overflow (common mobile/desktop UI bug)
        const overflow = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollW = Math.max(docEl.scrollWidth, body.scrollWidth);
          const clientW = window.innerWidth;
          const isOverflowing = scrollW > clientW + 2; // allowance of 2px
          
          let offendingElements = [];
          if (isOverflowing) {
            const all = document.querySelectorAll('*');
            for (const el of all) {
              const rect = el.getBoundingClientRect();
              if (rect.right > clientW + 2) {
                offendingElements.push({
                  tag: el.tagName,
                  className: (el.className || '').toString().slice(0, 50),
                  right: rect.right
                });
                if (offendingElements.length >= 3) break;
              }
            }
          }
          return { isOverflowing, scrollW, clientW, offendingElements };
        });

        if (overflow.isOverflowing) {
          console.warn(`[OVERFLOW] ${vp.name} ${route.path}: scrollWidth (${overflow.scrollW}) > clientWidth (${overflow.clientW})`);
          issues.push({
            type: 'HorizontalOverflow',
            viewport: vp.name,
            route: route.path,
            details: overflow
          });
        }

        // Check for broken images (naturalWidth === 0)
        const brokenImages = await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll('img'));
          return imgs
            .filter(img => img.complete && img.naturalWidth === 0)
            .map(img => img.src);
        });

        if (brokenImages.length > 0) {
          console.warn(`[BROKEN IMAGES] ${vp.name} ${route.path}:`, brokenImages);
          issues.push({
            type: 'BrokenImages',
            viewport: vp.name,
            route: route.path,
            images: brokenImages
          });
        }

        // Check for buttons or links with no accessible text/aria or missing icons
        const emptyInteractables = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button, a'));
          const empty = [];
          for (const b of btns) {
            const hasText = b.innerText.trim().length > 0;
            const hasAria = b.getAttribute('aria-label') || b.getAttribute('title');
            const hasSvgOrImg = b.querySelector('svg, img');
            if (!hasText && !hasAria && !hasSvgOrImg) {
              empty.push({ tag: b.tagName, html: b.outerHTML.slice(0, 60) });
            }
          }
          return empty;
        });

        if (emptyInteractables.length > 0) {
          issues.push({
            type: 'EmptyButtons',
            viewport: vp.name,
            route: route.path,
            count: emptyInteractables.length
          });
        }

      } catch (err) {
        console.error(`[VISIT FAILED] ${vp.name} ${route.path}:`, err.message);
        issues.push({
          type: 'NavigationFailure',
          viewport: vp.name,
          route: route.path,
          error: err.message
        });
      }
    }

    await context.close();
  }

  await browser.close();

  console.log(`\n===========================================`);
  console.log(`AUDIT FINISHED. Total issues detected: ${issues.length}`);
  console.log(`===========================================`);
  fs.writeFileSync('audit-report.json', JSON.stringify(issues, null, 2));
  console.log('Saved report to frontend/audit-report.json');
}

deepAudit().catch(console.error);
