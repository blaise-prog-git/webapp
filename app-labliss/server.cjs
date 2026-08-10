const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

loadEnv();

const PORT = Number(process.env.PORT || 3000);
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;
const ADMIN_PIN = process.env.ADMIN_PIN || "admin123";
const STAFF_PIN = process.env.STAFF_PIN || "staff123";
const DB_PATH = path.join(__dirname, "data", "db.json");
// Serve frontend build from client/dist
const PUBLIC_DIR = path.join(__dirname, "dist");

const defaultMenu = [
  { id: "meatpie", name: "Meatpie", category: "Pastries", price: 900, minQty: 10, available: true, prepMinutes: 35 },
  { id: "sausage", name: "Sausage Roll", category: "Pastries", price: 700, minQty: 10, available: true, prepMinutes: 30 },
  // Shawarma parent item (displayed in menu with variant picker)
  { id: "shawarma", name: "Shawarma", category: "Meals", price: 3000, minQty: 5, available: true, prepMinutes: 45, hasVariants: true },
  // Shawarma variants (hidden from menu grid, for server lookup only)
  { id: "shawarma-beef", name: "Shawarma (Beef)", category: "Meals", price: 3000, minQty: 5, available: true, prepMinutes: 45, isVariant: true },
  { id: "shawarma-chicken", name: "Shawarma (Chicken)", category: "Meals", price: 3800, minQty: 5, available: true, prepMinutes: 45, isVariant: true },
  { id: "shawarma-hotdog", name: "Shawarma (Hotdog)", category: "Meals", price: 3500, minQty: 5, available: true, prepMinutes: 45, isVariant: true },
  { id: "shawarma-chicken-hotdog", name: "Shawarma (Chicken & Hotdog)", category: "Meals", price: 4300, minQty: 5, available: true, prepMinutes: 50, isVariant: true },
  { id: "shawarma-beef-chicken", name: "Shawarma (Beef & Chicken)", category: "Meals", price: 4200, minQty: 5, available: true, prepMinutes: 50, isVariant: true },
  { id: "shawarma-jumbo", name: "Shawarma (Jumbo)", category: "Meals", price: 5300, minQty: 3, available: true, prepMinutes: 55, isVariant: true },
  { id: "shawarma-super-jumbo", name: "Shawarma (Super Jumbo)", category: "Meals", price: 6500, minQty: 2, available: true, prepMinutes: 60, isVariant: true },
  { id: "shawarma-special", name: "Shawarma (La_Bliss Special)", category: "Meals", price: 7000, minQty: 2, available: true, prepMinutes: 60, isVariant: true },
  { id: "spaghetti", name: "Spaghetti Pack", category: "Meals", price: 2500, minQty: 5, available: true, prepMinutes: 50 },
  { id: "fruit-parfait", name: "Fruit Parfait", category: "Treats", price: 1800, minQty: 6, available: true, prepMinutes: 25 },
  { id: "yogurt", name: "Yogurt", category: "Drinks", price: 1200, minQty: 6, available: true, prepMinutes: 15 },
  // Soft Drinks parent item (displayed in menu with variant picker)
  { id: "soft-drink", name: "Soft Drink", category: "Drinks", price: 500, minQty: 12, available: true, prepMinutes: 10, hasVariants: true },
  // Soft drink variants (hidden from menu grid, for server lookup only)
  { id: "soft-drink-pepsi", name: "Soft Drink (Pepsi)", category: "Drinks", price: 500, minQty: 12, available: true, prepMinutes: 10, isVariant: true },
  { id: "soft-drink-fanta", name: "Soft Drink (Fanta)", category: "Drinks", price: 500, minQty: 12, available: true, prepMinutes: 10, isVariant: true },
  { id: "soft-drink-sprite", name: "Soft Drink (Sprite)", category: "Drinks", price: 500, minQty: 12, available: true, prepMinutes: 10, isVariant: true },
  { id: "soft-drink-coca-cola", name: "Soft Drink (Coca-Cola)", category: "Drinks", price: 500, minQty: 12, available: true, prepMinutes: 10, isVariant: true },
  { id: "soft-drink-fanta-blackcurrant", name: "Soft Drink (Fanta Blackcurrant)", category: "Drinks", price: 500, minQty: 12, available: true, prepMinutes: 10, isVariant: true },
  { id: "soft-drink-schweppes", name: "Soft Drink (Schweppes)", category: "Drinks", price: 600, minQty: 12, available: true, prepMinutes: 10, isVariant: true },
  { id: "soft-drink-5alive", name: "Soft Drink (5 Alive)", category: "Drinks", price: 800, minQty: 12, available: true, prepMinutes: 10, isVariant: true },
  { id: "soft-drink-chivita", name: "Soft Drink (Chivita)", category: "Drinks", price: 800, minQty: 12, available: true, prepMinutes: 10, isVariant: true },
  { id: "juice", name: "Juice", category: "Drinks", price: 1000, minQty: 6, available: true, prepMinutes: 10 }
];

const defaultDeliveryZones = [
  { id: "pickup", name: "Pickup at store", km: 0, minutes: 0 },
  { id: "near", name: "Nearby, 0-5 km", km: 5, minutes: 20 },
  { id: "mid", name: "Within town, 6-12 km", km: 12, minutes: 35 },
  { id: "far", name: "Farther location, 13-25 km", km: 25, minutes: 60 },
  { id: "custom", name: "Custom distance", km: 1, minutes: 15 }
];

const defaultBusinessInfo = {
  businessName: "Labliss Cakes and Sweeties",
  domain: "Lablisscakesandsweeties.com.ng",
  headline: "Order fresh meatpie, shawarma and sweet treats in large quantity.",
  intro: "Build your order, choose delivery or pickup, get instant totals in naira, pay securely with Paystack, and receive a receipt with delivery time.",
  phone: "+2348065964065",
  whatsapp: "+2348065964065",
  instagram: "la_blisscakesnsweeties",
  tiktok: "La_blisscakesnsweeties",
  email: "orders@lablisscakesandsweeties.com.ng",
  address: "Mbaise Owerri Road, Imo State",
  serviceFeePercent: 1.5,
  deliveryBaseFee: 1000,
  deliveryPerKm: 220,
  longDistanceSurcharge: 1500,
  longDistanceKm: 15
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

ensureDb();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, SITE_URL);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, error.status || 500, { error: error.message || "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`=======================================`);
  console.log(`  Labliss Cakes and Sweeties`);
  console.log(`  Running at: ${SITE_URL}`);
  console.log(`  Customer:   ${SITE_URL}/`);
  console.log(`  Staff:      ${SITE_URL}/staff.html`);
  console.log(`  Admin:      ${SITE_URL}/admin.html`);
  console.log(`=======================================`);
});

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/public-config") {
    const db = readDb();
    // Filter out isVariant items — they are lookup entries for the server only
    const displayMenu = db.menu.filter((item) => item.available && !item.isVariant);
    sendJson(res, 200, {
      menu: displayMenu,
      deliveryZones: db.deliveryZones,
      businessInfo: db.businessInfo,
      currency: "NGN",
      paystackPublicKeyConfigured: Boolean(process.env.PAYSTACK_PUBLIC_KEY)
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/quote") {
    const body = await readJson(req);
    sendJson(res, 200, buildQuote(body.items || [], body.fulfillment || {}));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/ai-assistant") {
    const body = await readJson(req);
    const quote = buildQuote(body.items || [], body.fulfillment || {});
    sendJson(res, 200, buildAssistantReply(body.message || "", quote));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/signup") {
    const user = createUser(await readJson(req));
    sendJson(res, 201, { user: publicUser(user), token: user.token });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/login") {
    const body = await readJson(req);
    const user = loginUser(body.email, body.password);
    sendJson(res, 200, { user: publicUser(user), token: user.token });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/paystack/initialize") {
    sendJson(res, 200, await initializePayment(await readJson(req)));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/paystack/verify") {
    sendJson(res, 200, await verifyPayment(url.searchParams.get("reference")));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/staff/orders") {
    requireStaff(req);
    sendJson(res, 200, { orders: sortedOrders() });
    return;
  }

  if (req.method === "PATCH" && url.pathname.startsWith("/api/staff/orders/")) {
    requireStaff(req);
    const id = url.pathname.split("/").pop();
    const body = await readJson(req);
    sendJson(res, 200, { order: updateOrder(id, body) });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/admin/config") {
    requireAdmin(req);
    const db = readDb();
    sendJson(res, 200, {
      businessInfo: db.businessInfo,
      menu: db.menu,
      deliveryZones: db.deliveryZones,
      orders: sortedOrders()
    });
    return;
  }

  if (req.method === "PUT" && url.pathname === "/api/admin/business-info") {
    requireAdmin(req);
    const db = readDb();
    db.businessInfo = normalizeBusinessInfo(await readJson(req));
    writeDb(db);
    sendJson(res, 200, { businessInfo: db.businessInfo });
    return;
  }

  if (req.method === "PUT" && url.pathname === "/api/admin/menu") {
    requireAdmin(req);
    const body = await readJson(req);
    const db = readDb();
    db.menu = normalizeMenu(body.menu || []);
    writeDb(db);
    sendJson(res, 200, { menu: db.menu });
    return;
  }

  if (req.method === "PUT" && url.pathname === "/api/admin/delivery-zones") {
    requireAdmin(req);
    const body = await readJson(req);
    const db = readDb();
    db.deliveryZones = normalizeDeliveryZones(body.deliveryZones || []);
    writeDb(db);
    sendJson(res, 200, { deliveryZones: db.deliveryZones });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/admin/paystack-status") {
    requireAdmin(req);
    sendJson(res, 200, {
      publicKeyConfigured: Boolean(process.env.PAYSTACK_PUBLIC_KEY),
      secretKeyConfigured: Boolean(process.env.PAYSTACK_SECRET_KEY),
      mode: process.env.PAYSTACK_SECRET_KEY ? "paystack" : "demo"
    });
    return;
  }

  sendJson(res, 404, { error: "Not found" });
}

function serveStatic(req, res, url) {
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = path.normalize(decodeURIComponent(requested)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendText(res, 403, "Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      // Fallback to index.html for SPA routing
      const indexPath = path.join(PUBLIC_DIR, "index.html");
      fs.readFile(indexPath, (err, indexData) => {
        if (err) {
          sendText(res, 404, "Not found. Please build the frontend first: cd client && npm install && npm run build");
          return;
        }
        sendBuffer(res, 200, indexData, "text/html; charset=utf-8");
      });
      return;
    }
    sendBuffer(res, 200, data, mimeTypes[path.extname(filePath)] || "application/octet-stream");
  });
}

function buildQuote(items, fulfillment) {
  const db = readDb();
  const normalized = items
    .map((item) => {
      const product = db.menu.find((entry) => entry.id === item.id && entry.available);
      if (!product) return null;
      const quantity = Math.max(0, Number(item.quantity || 0));
      if (!quantity) return null;
      return {
        id: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity,
        lineTotal: product.price * quantity,
        minQty: product.minQty,
        prepMinutes: product.prepMinutes,
        belowMinimum: quantity < product.minQty
      };
    })
    .filter(Boolean);

  const subtotal = normalized.reduce((sum, item) => sum + item.lineTotal, 0);
  const fulfillmentType = fulfillment.type === "pickup" ? "pickup" : "delivery";
  const distanceKm = fulfillmentType === "pickup" ? 0 : getDistanceKm(fulfillment, db.deliveryZones);
  const deliveryFee = fulfillmentType === "pickup" ? 0 : calculateDeliveryFee(distanceKm, db.businessInfo);
  const prepMinutes = normalized.reduce((max, item) => Math.max(max, item.prepMinutes), 0);
  const deliveryMinutes = fulfillmentType === "pickup" ? 0 : Math.max(15, Math.round(15 + distanceKm * 3));
  const serviceFee = subtotal ? Math.round(subtotal * (Number(db.businessInfo.serviceFeePercent || 0) / 100)) : 0;
  const total = subtotal + deliveryFee + serviceFee;
  const warnings = normalized.filter((item) => item.belowMinimum).map((item) => `${item.name} minimum order is ${item.minQty}.`);

  return {
    items: normalized,
    subtotal,
    serviceFee,
    deliveryFee,
    total,
    currency: "NGN",
    fulfillmentType,
    distanceKm,
    prepMinutes,
    deliveryMinutes,
    estimatedMinutes: prepMinutes + deliveryMinutes,
    warnings
  };
}

function getDistanceKm(fulfillment, deliveryZones) {
  if (fulfillment.zone === "custom") return clamp(Number(fulfillment.distanceKm || 1), 1, 80);
  const zone = deliveryZones.find((entry) => entry.id === fulfillment.zone);
  return zone ? Number(zone.km) : 8;
}

function calculateDeliveryFee(distanceKm, info) {
  const base = Number(info.deliveryBaseFee || 0);
  const perKm = Number(info.deliveryPerKm || 0);
  const surcharge = distanceKm > Number(info.longDistanceKm || 999) ? Number(info.longDistanceSurcharge || 0) : 0;
  return Math.round(base + distanceKm * perKm + surcharge);
}

function buildAssistantReply(message, quote) {
  const db = readDb();
  const available = db.menu.filter((item) => item.available).map((item) => item.name).join(", ");
  const text = quote.items.length
    ? `Your order has ${quote.items.length} item type(s). Subtotal is ${formatNaira(quote.subtotal)}, charges are ${formatNaira(quote.deliveryFee + quote.serviceFee)}, and total is ${formatNaira(quote.total)}. Estimated ${quote.fulfillmentType === "pickup" ? "pickup readiness" : "delivery time"} is about ${quote.estimatedMinutes} minutes.`
    : `Available items are: ${available}. Add quantities and I will calculate the full order total, delivery fee, payment amount, and receipt details.`;
  const lower = message.toLowerCase();
  const hint = lower.includes("pickup") ? "Pickup has no delivery fee." : "Delivery fee is based on the selected distance zone.";
  return { reply: `${text} ${hint}`, availableMenu: db.menu.filter((item) => item.available), quote };
}

async function initializePayment(body) {
  const customer = validateCustomer(body.customer || {});
  const quote = buildQuote(body.items || [], body.fulfillment || {});
  if (!quote.items.length) throw httpError(400, "Add at least one available item.");
  if (quote.warnings.length) throw httpError(400, quote.warnings.join(" "));

  const db = readDb();
  const order = {
    id: createId("ord"),
    reference: createId("lbl"),
    status: "pending_payment",
    paymentStatus: "unpaid",
    customer,
    userId: getUserIdFromToken(body.token),
    fulfillment: {
      type: quote.fulfillmentType,
      address: body.fulfillment?.address || "",
      zone: body.fulfillment?.zone || "",
      distanceKm: quote.distanceKm,
      pickupTime: body.fulfillment?.pickupTime || ""
    },
    quote,
    receipt: null,
    staffNote: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.orders.push(order);
  writeDb(db);

  if (!process.env.PAYSTACK_SECRET_KEY) {
    order.paymentStatus = "demo";
    order.status = "confirmed";
    order.receipt = buildReceipt(order);
    updateOrder(order.id, order);
    return {
      mode: "demo",
      message: "PAYSTACK_SECRET_KEY is not set. Demo order confirmed without charging a card.",
      order,
      authorizationUrl: `/receipt?reference=${encodeURIComponent(order.reference)}`
    };
  }

  const payload = {
    email: customer.email,
    amount: quote.total * 100,
    currency: "NGN",
    reference: order.reference,
    callback_url: `${SITE_URL}/receipt?reference=${encodeURIComponent(order.reference)}`,
    metadata: {
      orderId: order.id,
      customerName: customer.name,
      phone: customer.phone,
      custom_fields: [
        { display_name: "Order ID", variable_name: "order_id", value: order.id },
        { display_name: "Delivery Method", variable_name: "fulfillment", value: quote.fulfillmentType }
      ]
    }
  };

  const paystack = await paystackRequest("POST", "/transaction/initialize", payload);
  return {
    mode: "paystack",
    order,
    authorizationUrl: paystack.data.authorization_url,
    accessCode: paystack.data.access_code,
    reference: order.reference
  };
}

async function verifyPayment(reference) {
  if (!reference) throw httpError(400, "Payment reference is required.");
  const db = readDb();
  const order = db.orders.find((item) => item.reference === reference);
  if (!order) throw httpError(404, "Order not found.");

  if (!process.env.PAYSTACK_SECRET_KEY || order.paymentStatus === "demo") {
    order.status = "confirmed";
    order.paymentStatus = "demo";
    order.receipt = order.receipt || buildReceipt(order);
    order.updatedAt = new Date().toISOString();
    writeDb(db);
    return { order, verified: true, mode: "demo" };
  }

  const paystack = await paystackRequest("GET", `/transaction/verify/${encodeURIComponent(reference)}`);
  if (paystack.data.status === "success") {
    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.receipt = buildReceipt(order);
    order.updatedAt = new Date().toISOString();
    writeDb(db);
    return { order, verified: true, mode: "paystack" };
  }
  return { order, verified: false, mode: "paystack", paymentStatus: paystack.data.status };
}

function buildReceipt(order) {
  const db = readDb();
  return {
    receiptNo: `LCS-${new Date().getFullYear()}-${order.reference.slice(-6).toUpperCase()}`,
    issuedAt: new Date().toISOString(),
    business: db.businessInfo.businessName,
    customer: order.customer,
    items: order.quote.items,
    total: order.quote.total,
    currency: order.quote.currency,
    fulfillment: order.fulfillment,
    estimatedMinutes: order.quote.estimatedMinutes,
    paymentReference: order.reference
  };
}

function updateOrder(id, patch) {
  const db = readDb();
  const order = db.orders.find((item) => item.id === id);
  if (!order) throw httpError(404, "Order not found");
  order.status = patch.status || order.status;
  order.staffNote = patch.staffNote ?? order.staffNote ?? "";
  order.paymentStatus = patch.paymentStatus || order.paymentStatus;
  order.receipt = patch.receipt || order.receipt;
  order.updatedAt = new Date().toISOString();
  writeDb(db);
  return order;
}

function sortedOrders() {
  return readDb().orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function createUser(body) {
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const password = String(body.password || "");
  if (!name || !email || !phone || password.length < 6) throw httpError(400, "Name, email, phone, and a 6+ character password are required.");
  const db = readDb();
  if (db.users.some((user) => user.email === email)) throw httpError(409, "An account already exists with that email.");
  const salt = crypto.randomBytes(16).toString("hex");
  const user = { id: createId("usr"), name, email, phone, salt, passwordHash: hashPassword(password, salt), token: createToken(), createdAt: new Date().toISOString() };
  db.users.push(user);
  writeDb(db);
  return user;
}

function loginUser(emailInput, passwordInput) {
  const email = String(emailInput || "").trim().toLowerCase();
  const password = String(passwordInput || "");
  const db = readDb();
  const user = db.users.find((item) => item.email === email);
  if (!user || user.passwordHash !== hashPassword(password, user.salt)) throw httpError(401, "Invalid email or password.");
  user.token = createToken();
  writeDb(db);
  return user;
}

function getUserIdFromToken(token) {
  if (!token) return null;
  const user = readDb().users.find((item) => item.token === token);
  return user ? user.id : null;
}

function validateCustomer(customer) {
  const normalized = {
    name: String(customer.name || "").trim(),
    email: String(customer.email || "").trim().toLowerCase(),
    phone: String(customer.phone || "").trim(),
    note: String(customer.note || "").trim()
  };
  if (!normalized.name || !normalized.email || !normalized.phone) throw httpError(400, "Customer name, email, and phone are required.");
  return normalized;
}

function normalizeBusinessInfo(body) {
  return {
    ...defaultBusinessInfo,
    ...body,
    phone: String(body.phone ?? defaultBusinessInfo.phone).trim(),
    whatsapp: String(body.whatsapp ?? defaultBusinessInfo.whatsapp).trim(),
    instagram: String(body.instagram ?? defaultBusinessInfo.instagram).trim(),
    tiktok: String(body.tiktok ?? defaultBusinessInfo.tiktok).trim(),
    email: String(body.email ?? defaultBusinessInfo.email).trim(),
    address: String(body.address ?? defaultBusinessInfo.address).trim(),
    serviceFeePercent: clamp(Number(body.serviceFeePercent ?? defaultBusinessInfo.serviceFeePercent), 0, 20),
    deliveryBaseFee: clamp(Number(body.deliveryBaseFee ?? defaultBusinessInfo.deliveryBaseFee), 0, 100000),
    deliveryPerKm: clamp(Number(body.deliveryPerKm ?? defaultBusinessInfo.deliveryPerKm), 0, 10000),
    longDistanceSurcharge: clamp(Number(body.longDistanceSurcharge ?? defaultBusinessInfo.longDistanceSurcharge), 0, 100000),
    longDistanceKm: clamp(Number(body.longDistanceKm ?? defaultBusinessInfo.longDistanceKm), 1, 100)
  };
}

function normalizeMenu(items) {
  const normalized = items.map((item) => ({
    id: slug(item.id || item.name || createId("item")),
    name: String(item.name || "Untitled item").trim(),
    category: String(item.category || "Menu").trim(),
    price: clamp(Number(item.price || 0), 0, 10000000),
    minQty: clamp(Number(item.minQty || 1), 1, 10000),
    available: Boolean(item.available),
    prepMinutes: clamp(Number(item.prepMinutes || 10), 1, 1000)
  }));
  if (!normalized.length) throw httpError(400, "Menu must include at least one item.");
  return normalized;
}

function normalizeDeliveryZones(zones) {
  const normalized = zones.map((zone) => ({
    id: zone.id === "pickup" ? "pickup" : slug(zone.id || zone.name || createId("zone")),
    name: String(zone.name || "Delivery zone").trim(),
    km: clamp(Number(zone.km || 0), 0, 100),
    minutes: clamp(Number(zone.minutes || 0), 0, 300)
  }));
  if (!normalized.some((zone) => zone.id === "pickup")) normalized.unshift(defaultDeliveryZones[0]);
  return normalized;
}

function paystackRequest(method, endpoint, payload) {
  return new Promise((resolve, reject) => {
    const body = payload ? JSON.stringify(payload) : null;
    const request = https.request(
      {
        hostname: "api.paystack.co",
        path: endpoint,
        method,
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
          ...(body ? { "Content-Length": Buffer.byteLength(body) } : {})
        }
      },
      (response) => {
        let data = "";
        response.on("data", (chunk) => { data += chunk; });
        response.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (response.statusCode >= 400 || parsed.status === false) reject(httpError(response.statusCode, parsed.message || "Paystack request failed."));
            else resolve(parsed);
          } catch (error) {
            reject(error);
          }
        });
      }
    );
    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
}

function requireAdmin(req) {
  if (req.headers["x-admin-pin"] !== ADMIN_PIN) throw httpError(401, "Admin PIN required.");
}

function requireStaff(req) {
  const pin = req.headers["x-staff-pin"];
  if (pin !== STAFF_PIN && pin !== ADMIN_PIN) throw httpError(401, "Staff PIN required.");
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        req.destroy();
        reject(httpError(413, "Request body too large."));
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(httpError(400, "Invalid JSON."));
      }
    });
  });
}

function ensureDb() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const current = fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH, "utf8")) : {};
  const db = {
    users: Array.isArray(current.users) ? current.users : [],
    orders: Array.isArray(current.orders) ? current.orders : [],
    menu: Array.isArray(current.menu) && current.menu.length ? current.menu : defaultMenu,
    deliveryZones: Array.isArray(current.deliveryZones) && current.deliveryZones.length ? current.deliveryZones : defaultDeliveryZones,
    businessInfo: current.businessInfo ? { ...defaultBusinessInfo, ...current.businessInfo } : defaultBusinessInfo
  };
  writeDb(db);
}

function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone };
}

function formatNaira(value) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

function clamp(value, min, max) {
  return Math.min(Math.max(Number.isFinite(value) ? value : min, min), max);
}

function slug(value) {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || createId("id");
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sendJson(res, status, data) {
  sendBuffer(res, status, Buffer.from(JSON.stringify(data)), "application/json; charset=utf-8");
}

function sendText(res, status, text) {
  sendBuffer(res, status, Buffer.from(text), "text/plain; charset=utf-8");
}

function sendBuffer(res, status, data, contentType) {
  res.writeHead(status, { "Content-Type": contentType, "Cache-Control": "no-store" });
  res.end(data);
}
