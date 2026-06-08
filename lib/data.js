/* ============================================================
   RecallOps Command — Mock data layer (window.RO)
   ------------------------------------------------------------
   TypeScript shapes (for the eventual lib/types.ts):
   RecallEvent, FivetranSyncRun, Location, InventoryItem, Sale,
   Shipment, Customer, ContainmentAction, AuditEvent
   ------------------------------------------------------------
   All demo data lives here. Replace with live openFDA / Fivetran
   MCP / BigQuery responses later — the UI only reads window.RO.*
   ============================================================ */
(function () {
  /* ---------------- The recall (openFDA food enforcement) ---------------- */
  const recall = {
    recallId: "F-1142-2026",
    source: "openFDA",
    classification: "Class I",
    productDescription: "Frozen Soft Pretzel Bites, 20 oz — Stadium Concession Pack",
    recallingFirm: "Northwind Provisions, LLC",
    reason: "Possible Listeria monocytogenes contamination identified during routine environmental sampling.",
    distributionPattern: "CA, NV, AZ, OR, WA — retail grocery and stadium concession channels.",
    eventDate: "2026-06-06",
    lotCodes: ["A4471", "A4472", "A4473"],
    upcs: ["8 12345 67890 1", "8 12345 67891 8"],
    sourceUrl: "https://api.fda.gov/food/enforcement.json?search=recall_number:F-1142-2026",
    skuMatches: ["NW-PRTZ-20", "NW-PRTZ-CONC", "NW-PRTZ-CS12"],
  };

  /* ---------------- Aggregate blast-radius stats ---------------- */
  const stats = {
    locationsAffected: 37,
    unitsInventory: 1842,
    unitsSold: 312,
    shipmentsInTransit: 6,
    customersToNotify: 284,
    criticalStores: 14,
    supplierHolds: 3,
    replacementPOs: 5,
    estContainmentMin: 12,
  };

  /* ---------------- Locations (37) ---------------- */
  const CITY = ["Oakland", "San José", "Fremont", "Sacramento", "Reno", "Fresno", "Stockton", "Modesto", "Sunnyvale", "Concord"];
  const STORE = ["Bay Foods", "GreenCart", "MetroMart", "Coliseum Concessions", "ValuGrocer", "FreshLine", "Harborside Market", "Sierra Provisions"];
  function rng(seed) { let s = seed; return () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; }
  const r = rng(42);
  const locations = [];
  for (let i = 0; i < 37; i++) {
    const t = i < 6 ? "stadium_concession" : i < 31 ? "store" : "warehouse";
    const tier = i < 14 ? "critical" : i < 24 ? "high" : i < 32 ? "medium" : "low";
    const city = CITY[Math.floor(r() * CITY.length)];
    const base = t === "warehouse" ? "DC" : t === "stadium_concession" ? "Coliseum Concessions" : STORE[Math.floor(r() * STORE.length)];
    locations.push({
      id: "loc_" + (1000 + i),
      name: t === "stadium_concession" ? base + " · Gate " + (String.fromCharCode(65 + (i % 6))) : base + " · " + city,
      type: t,
      city,
      // normalized map coords, clustered into a region
      mx: 0.08 + r() * 0.84,
      my: 0.12 + r() * 0.76,
      manager: ["A. Reyes", "J. Okafor", "M. Castellano", "L. Nguyen", "D. Park", "S. Whitfield", "R. Banerjee", "T. Alvarez"][i % 8],
      riskTier: tier,
      units: t === "warehouse" ? 240 + Math.floor(r() * 360) : 18 + Math.floor(r() * 70),
    });
  }

  /* ---------------- Shipments in transit (6) ---------------- */
  const shipments = [
    { id: "shp_5501", supplierId: "sup_01", locationId: "loc_1031", sku: "NW-PRTZ-CS12", lotCode: "A4472", status: "in_transit", eta: "2026-06-08T14:00:00Z", quantity: 480 },
    { id: "shp_5502", supplierId: "sup_01", locationId: "loc_1032", sku: "NW-PRTZ-CS12", lotCode: "A4471", status: "in_transit", eta: "2026-06-08T19:30:00Z", quantity: 360 },
    { id: "shp_5503", supplierId: "sup_02", locationId: "loc_1004", sku: "NW-PRTZ-CONC", lotCode: "A4471", status: "in_transit", eta: "2026-06-07T22:10:00Z", quantity: 240 },
    { id: "shp_5504", supplierId: "sup_01", locationId: "loc_1009", sku: "NW-PRTZ-20", lotCode: "A4473", status: "in_transit", eta: "2026-06-09T09:00:00Z", quantity: 120 },
    { id: "shp_5505", supplierId: "sup_03", locationId: "loc_1015", sku: "NW-PRTZ-20", lotCode: "A4472", status: "in_transit", eta: "2026-06-08T11:45:00Z", quantity: 96 },
    { id: "shp_5506", supplierId: "sup_01", locationId: "loc_1002", sku: "NW-PRTZ-CONC", lotCode: "A4471", status: "in_transit", eta: "2026-06-07T16:20:00Z", quantity: 300 },
  ];

  /* ---------------- Fivetran sync runs (8 sources → BigQuery) ---------------- */
  const now = Date.now();
  const ts = (secAgo) => new Date(now - secAgo * 1000).toISOString();
  const syncRuns = [
    { id: "sr_1", connector: "netsuite_inventory", source: "Inventory", destination: "BigQuery", status: "pending", recordsSynced: 12840, startedAt: ts(60) },
    { id: "sr_2", connector: "square_pos", source: "POS Sales", destination: "BigQuery", status: "pending", recordsSynced: 48211, startedAt: ts(60) },
    { id: "sr_3", connector: "shipstation", source: "Shipments", destination: "BigQuery", status: "pending", recordsSynced: 1304, startedAt: ts(60) },
    { id: "sr_4", connector: "salesforce_customers", source: "Customers", destination: "BigQuery", status: "pending", recordsSynced: 90211, startedAt: ts(60) },
    { id: "sr_5", connector: "sap_suppliers", source: "Suppliers", destination: "BigQuery", status: "pending", recordsSynced: 418, startedAt: ts(60) },
    { id: "sr_6", connector: "snowflake_locations", source: "Locations", destination: "BigQuery", status: "pending", recordsSynced: 37, startedAt: ts(60) },
    { id: "sr_7", connector: "workday_staff", source: "Staff & Manager Contacts", destination: "BigQuery", status: "pending", recordsSynced: 642, startedAt: ts(60) },
    { id: "sr_8", connector: "audit_log_stream", source: "Audit Log", destination: "BigQuery", status: "pending", recordsSynced: 5120, startedAt: ts(60) },
  ];

  /* ---------------- Reasoning trace lines ---------------- */
  const reasoning = [
    { t: "Parsed openFDA recall event F-1142-2026", tone: "cyan" },
    { t: "Extracted product, firm, reason, and distribution pattern", tone: "dim" },
    { t: "Asked Fivetran MCP for latest connector sync status", tone: "cyan" },
    { t: "Confirmed warehouse freshness within 15-min limit", tone: "ok" },
    { t: "Matched recalled product to 3 internal SKUs", tone: "dim" },
    { t: "Found affected lot A4471 in 37 locations", tone: "warn" },
    { t: "Found 1,842 units still in inventory", tone: "warn" },
    { t: "Found 312 units already sold", tone: "warn" },
    { t: "Found 6 shipments in transit", tone: "warn" },
    { t: "Drafting stop-sale, shelf-pull, supplier-hold, customer-notice, replacement-PO, and compliance-report actions", tone: "cyan" },
    { t: "Awaiting human approval", tone: "ok" },
  ];

  /* ---------------- Containment actions (6) ---------------- */
  const actions = [
    {
      id: "act_1", recallId: recall.recallId, type: "STOP_SALE", title: "Stop-sale on lot A4471 / A4472 / A4473", owner: "Store Operations",
      priority: "critical", scope: "37 locations · 3 SKUs · 1,842 units", evidenceIds: ["ev_inv", "ev_recall"],
      approvalState: "pending", status: "drafted", risk: "high",
      draft: "Block point-of-sale for SKUs NW-PRTZ-20, NW-PRTZ-CONC, NW-PRTZ-CS12 across all 37 affected locations effective immediately. Registers will reject scans of the listed UPCs.",
    },
    {
      id: "act_2", recallId: recall.recallId, type: "SHELF_PULL", title: "Shelf pull & quarantine", owner: "Store Managers",
      priority: "critical", scope: "14 critical stores first · then 23 remaining", evidenceIds: ["ev_inv", "ev_loc"],
      approvalState: "pending", status: "drafted", risk: "medium",
      draft: "Assign shelf-pull tasks to 37 store managers, prioritizing 14 critical-tier locations. Move 1,842 units to quarantine zone and photograph lot codes for audit.",
    },
    {
      id: "act_3", recallId: recall.recallId, type: "SUPPLIER_HOLD", title: "Supplier hold on Northwind Provisions", owner: "Procurement",
      priority: "high", scope: "3 suppliers · 6 in-transit shipments", evidenceIds: ["ev_ship", "ev_sup"],
      approvalState: "pending", status: "drafted", risk: "medium",
      draft: "Place receiving hold on Northwind Provisions and divert 6 in-transit shipments (1,596 units) to quarantine docks. Notify 3 supplier contacts of the hold.",
    },
    {
      id: "act_4", recallId: recall.recallId, type: "CUSTOMER_NOTICE", title: "Customer notification (consented only)", owner: "Customer Care",
      priority: "high", scope: "284 customers · email / SMS · opt-in only", evidenceIds: ["ev_sales", "ev_cust"],
      approvalState: "pending", status: "drafted", risk: "high",
      draft: "Notify 284 customers who purchased affected lots and consented to contact, via preferred channel. Suppress 41 non-consented records. No marketing language; recall and refund instructions only.",
    },
    {
      id: "act_5", recallId: recall.recallId, type: "REPLACEMENT_PO", title: "Replacement procurement", owner: "Procurement",
      priority: "medium", scope: "5 POs · alternate supplier · 1,900 units", evidenceIds: ["ev_inv"],
      approvalState: "pending", status: "drafted", risk: "low",
      draft: "Raise 5 replacement purchase orders with alternate supplier Cascade Foodworks to backfill pulled inventory at the 14 critical locations first.",
    },
    {
      id: "act_6", recallId: recall.recallId, type: "COMPLIANCE_REPORT", title: "Audit-ready compliance report", owner: "Compliance",
      priority: "medium", scope: "Full recall · evidence bundle · timeline", evidenceIds: ["ev_recall", "ev_inv", "ev_sales", "ev_ship", "ev_audit"],
      approvalState: "pending", status: "drafted", risk: "low",
      draft: "Generate an audit-ready compliance report assembling the openFDA source, Fivetran sync evidence, BigQuery blast-radius queries, approved actions, and the full audit timeline.",
    },
  ];

  /* ---------------- Audit timeline ---------------- */
  const audit = [
    { id: "au_1", recallId: recall.recallId, label: "Recall detected", actorType: "system", actorName: "openFDA poller", evidence: "F-1142-2026", status: "complete", phase: "intake" },
    { id: "au_2", recallId: recall.recallId, label: "Fivetran sync started", actorType: "agent", actorName: "RecallOps Agent", evidence: "8 connectors", status: "complete", phase: "sync" },
    { id: "au_3", recallId: recall.recallId, label: "BigQuery warehouse refreshed", actorType: "system", actorName: "Fivetran → BigQuery", evidence: "158,888 records", status: "complete", phase: "sync" },
    { id: "au_4", recallId: recall.recallId, label: "Gemini generated containment plan", actorType: "agent", actorName: "Gemini Agent", evidence: "6 actions drafted", status: "complete", phase: "reason" },
    { id: "au_5", recallId: recall.recallId, label: "Human approved stop-sale", actorType: "human", actorName: "Operator", evidence: "act_1", status: "pending", phase: "approve" },
    { id: "au_6", recallId: recall.recallId, label: "Shelf pull assigned", actorType: "human", actorName: "Operator", evidence: "act_2", status: "pending", phase: "approve" },
    { id: "au_7", recallId: recall.recallId, label: "Supplier hold approved", actorType: "human", actorName: "Operator", evidence: "act_3", status: "pending", phase: "approve" },
    { id: "au_8", recallId: recall.recallId, label: "Customer notice drafted", actorType: "agent", actorName: "Gemini Agent", evidence: "act_4", status: "pending", phase: "approve" },
    { id: "au_9", recallId: recall.recallId, label: "Compliance report generated", actorType: "agent", actorName: "RecallOps Agent", evidence: "report.pdf", status: "pending", phase: "report" },
  ];

  /* ---------------- Evidence registry ---------------- */
  const evidence = {
    ev_recall: { id: "ev_recall", label: "openFDA recall record", source: "openFDA", detail: "food/enforcement · F-1142-2026" },
    ev_inv:    { id: "ev_inv", label: "Inventory blast-radius query", source: "BigQuery", detail: "1,842 units · 37 locations" },
    ev_sales:  { id: "ev_sales", label: "POS sales of affected lots", source: "BigQuery", detail: "312 units · 284 customers" },
    ev_ship:   { id: "ev_ship", label: "In-transit shipments", source: "BigQuery", detail: "6 shipments · 1,596 units" },
    ev_sup:    { id: "ev_sup", label: "Supplier records", source: "Fivetran · SAP", detail: "Northwind Provisions" },
    ev_cust:   { id: "ev_cust", label: "Customer consent records", source: "Fivetran · Salesforce", detail: "284 consented · 41 suppressed" },
    ev_loc:    { id: "ev_loc", label: "Location master", source: "BigQuery", detail: "37 locations · risk-tiered" },
    ev_audit:  { id: "ev_audit", label: "Audit log stream", source: "Fivetran", detail: "5,120 events" },
  };

  /* ---------------- Integration health (settings) ---------------- */
  const integrations = [
    { id: "fivetran", name: "Fivetran", role: "Operational data sync", status: "connected", detail: "8 connectors · 6 min cadence", accent: "cyan" },
    { id: "fivetran_mcp", name: "Fivetran MCP Server", role: "Agent ↔ connector control", status: "active", detail: "stdio · 5 tools", accent: "cyan" },
    { id: "bigquery", name: "BigQuery", role: "Operational warehouse", status: "synced", detail: "158,888 rows · refreshed 42s ago", accent: "blue" },
    { id: "gemini", name: "Gemini (Agent Builder / ADK)", role: "Agent brain", status: "ready", detail: "gemini-3-pro · us-central1", accent: "blue" },
    { id: "cloudrun", name: "Cloud Run", role: "Runtime", status: "live", detail: "recallops-svc · rev 00018", accent: "success" },
    { id: "openfda", name: "openFDA", role: "Recall source", status: "connected", detail: "food/enforcement endpoint", accent: "cyan" },
    { id: "secret", name: "Secret Manager", role: "Secrets", status: "connected", detail: "6 secrets · auto-rotate", accent: "blue" },
    { id: "logging", name: "Cloud Logging", role: "Observability", status: "degraded", detail: "ingest lag 1.4s · retrying", accent: "warning" },
  ];

  const statusChips = [
    { label: "Gemini", state: "Ready", tone: "blue" },
    { label: "Fivetran", state: "Connected", tone: "cyan" },
    { label: "BigQuery", state: "Synced", tone: "blue" },
    { label: "MCP", state: "Active", tone: "cyan" },
    { label: "Cloud Run", state: "Live", tone: "success" },
    { label: "Memory", state: "Online", tone: "warning" },
    { label: "Evals", state: "Passing", tone: "success" },
  ];

  const routes = [
    { id: "cortex", label: "Cortex", path: "/", icon: "command" },
    { id: "radar", label: "Recall Radar", path: "/radar", icon: "radar" },
    { id: "fivetran", label: "Fivetran", path: "/fivetran", icon: "refresh" },
    { id: "graph", label: "RecallGraph", path: "/graph", icon: "graph" },
    { id: "context", label: "Context", path: "/context", icon: "layers" },
    { id: "evidence", label: "Evidence", path: "/evidence", icon: "database" },
    { id: "actions", label: "Actions", path: "/actions", icon: "shield" },
    { id: "llmops", label: "LLMOps", path: "/llmops", icon: "activity" },
    { id: "improvement", label: "Improvement", path: "/improvement", icon: "sparkles" },
    { id: "replay", label: "Replay", path: "/replay", icon: "play" },
    { id: "compliance", label: "Compliance", path: "/compliance", icon: "timeline" },
    { id: "report", label: "Report", path: "/report", icon: "fileCheck" },
    { id: "architecture", label: "Architecture", path: "/architecture", icon: "cpu" },
    { id: "settings", label: "Settings", path: "/settings", icon: "settings" },
  ];

  /* ============================================================
     RecallGraph — operational memory graph (nodes + edges)
     ============================================================ */
  const NODE_COLOR = {
    recall: "#EF4444", product: "#3B82F6", sku: "#60A5FA", lot: "#F59E0B",
    supplier: "#9B8CFF", shipment: "#FB923C", location: "#06B6D4", customer_segment: "#10B981",
    containment_action: "#34D399", evidence: "#60A5FA", audit_event: "#E5E7EB",
    playbook_memory: "#FBBF24", eval_case: "#A78BFA", improvement_proposal: "#2DD4BF",
  };
  const gNodes = [], gEdges = [];
  const N = (id, type, label, extra) => { gNodes.push(Object.assign({ id, type, label, color: NODE_COLOR[type], confidence: extra && extra.confidence != null ? extra.confidence : 0.98, source: (extra && extra.source) || "BigQuery", group: type }, extra || {})); return id; };
  const E = (s, t, type, conf, w) => { gEdges.push({ id: "e_" + gEdges.length, source: s, target: t, edge_type: type, confidence: conf == null ? 0.95 : conf, weight: w || 1 }); };

  N("recall", "recall", "FDA F-1142-2026", { source: "openFDA", severity: "Class I", val: 14, confidence: 1 });
  N("product", "product", "Soft Pretzel Bites 20oz", { source: "BigQuery · inventory", val: 9 });
  E("recall", "product", "recalls", 0.74);
  recall.skuMatches.forEach((sku, i) => { N("sku_" + i, "sku", sku, { source: "BigQuery · inventory", confidence: [0.98, 0.92, 0.88][i], val: 6 }); E("product", "sku_" + i, "has_sku", [0.98, 0.92, 0.88][i]); });
  recall.lotCodes.forEach((lot, i) => { N("lot_" + i, "lot", "Lot " + lot, { source: "BigQuery · inventory", confidence: [0.96, 0.9, 0.86][i], val: 5 }); E("sku_" + (i % 3), "lot_" + i, "produced_lot", [0.96, 0.9, 0.86][i]); });
  ["sup_01", "sup_02", "sup_03"].forEach((s, i) => { N(s, "supplier", ["Northwind Provisions", "Cascade Foodworks", "Harbor Cold Chain"][i], { source: "Fivetran · SAP", confidence: [0.88, 0.79, 0.72][i], val: 6 }); E(s, "lot_" + (i % 3), "supplied", [0.88, 0.79, 0.72][i]); });
  // locations (subset for graph clarity)
  const gLocs = locations.slice(0, 12);
  gLocs.forEach((l, i) => { N("loc_g" + i, "location", l.name.split(" · ")[0], { source: "BigQuery · locations", severity: l.riskTier, confidence: 0.95, val: 4, riskTier: l.riskTier }); E("lot_" + (i % 3), "loc_g" + i, "stocked_at", 0.95); });
  // shipments
  shipments.slice(0, 6).forEach((sh, i) => { N("shp_" + i, "shipment", sh.id, { source: "BigQuery · shipments", confidence: 0.94, val: 4 }); E("sup_0" + ((i % 3) + 1), "shp_" + i, "in_transit", 0.94); E("shp_" + i, "loc_g" + (i % 12), "bound_for", 0.9); });
  // customer segments
  ["High-frequency buyers", "Stadium concessions", "Delivery customers", "One-time purchasers"].forEach((c, i) => { N("seg_" + i, "customer_segment", c, { source: "BigQuery · sales", confidence: [0.9, 0.86, 0.82, 0.7][i], val: 5 }); E("loc_g" + (i * 2 % 12), "seg_" + i, "sold_to", [0.9, 0.86, 0.82, 0.7][i]); });
  // actions
  actions.forEach((a, i) => { N("act_g" + i, "containment_action", a.title.split(" ").slice(0, 3).join(" "), { source: "Gemini plan", confidence: 0.97, val: 6, actionId: a.id }); });
  E("lot_0", "act_g0", "triggers", 0.98); E("loc_g0", "act_g1", "triggers", 0.96); E("shp_0", "act_g2", "triggers", 0.94); E("seg_0", "act_g3", "triggers", 0.86); E("sku_0", "act_g4", "triggers", 0.9); E("recall", "act_g5", "triggers", 1);
  // evidence
  Object.keys(evidence).slice(0, 6).forEach((eid, i) => { N("ev_g" + i, "evidence", eid, { source: evidence[eid].source, confidence: 0.99, val: 3 }); E("act_g" + i, "ev_g" + i, "cites", 0.99); });
  // audit
  ["Recall detected", "Sync complete", "Plan drafted", "Stop-sale approved"].forEach((a, i) => { N("au_g" + i, "audit_event", a, { source: "Audit log", confidence: 1, val: 3 }); E("act_g" + (i % 6), "au_g" + i, "logged", 1); });
  // memory episodes
  ["Listeria pretzel 2024", "Spinach E.coli 2023", "Cheese dip 2025"].forEach((m, i) => { N("mem_" + i, "playbook_memory", m, { source: "Agent memory", confidence: [0.82, 0.71, 0.64][i], val: 5 }); E("recall", "mem_" + i, "similar_to", [0.82, 0.71, 0.64][i]); });
  // eval + improvement
  N("eval_0", "eval_case", "Low-confidence SKU match", { source: "Eval suite", confidence: 0.74, val: 4 }); E("sku_2", "eval_0", "flagged_by", 0.74);
  N("imp_0", "improvement_proposal", "Require exact lot match", { source: "Self-improve", confidence: 0.9, val: 5 }); E("eval_0", "imp_0", "proposes", 0.9);

  /* ---------------- Entity matches (evidence/resolver) ---------------- */
  const entityMatches = [
    { id: "m_upc", from: "FDA UPC 8-12345-67890-1", to: "SKU NW-PRTZ-20", type: "exact UPC", confidence: 0.98, status: "auto" },
    { id: "m_lot", from: "Recall lot A4471", to: "Internal lot A4471", type: "exact lot", confidence: 0.96, status: "auto" },
    { id: "m_sup", from: "Northwind Provisions, LLC", to: "supplier sup_01", type: "firm → supplier", confidence: 0.88, status: "auto" },
    { id: "m_prod", from: "“Frozen Soft Pretzel Bites”", to: "SKU NW-PRTZ-CONC", type: "semantic product", confidence: 0.74, status: "review" },
    { id: "m_region", from: "Distribution: CA, NV, AZ, OR, WA", to: "37 mapped locations", type: "distribution → regions", confidence: 0.91, status: "auto" },
    { id: "m_fuzzy", from: "“Pretzel Snack Pack 20oz”", to: "SKU NW-PRTZ-CS12", type: "fuzzy description", confidence: 0.61, status: "review" },
  ];

  /* ---------------- Context pack ---------------- */
  const contextPack = {
    id: "ctx_8841", recallId: recall.recallId, freshnessSec: 42, matchedRows: 1842,
    graphNodes: gNodes.length, similarRecalls: 3, playbookMemories: 2, riskConstraints: 4,
    json: {
      recall: recall.recallId, classification: recall.classification,
      fivetran_freshness_s: 42, bigquery_rows: 1842,
      graph_neighbors: ["product", "3 skus", "3 lots", "12 locations", "6 shipments", "4 segments"],
      similar_recalls: ["Listeria pretzel 2024", "Cheese dip 2025"],
      approved_memories: ["supplier_aliases.northwind", "policy.customer_notice_requires_approval"],
      risk_constraints: ["exact_lot_required_for_stop_sale", "customer_action_requires_approval", "freshness_lt_15min", "low_conf_requires_review"],
      human_policy: "no external action without approval",
    },
  };

  /* ---------------- LLMOps: agent runs + tool trace ---------------- */
  const TOOLS = ["search_openfda_recalls", "trigger_fivetran_sync", "get_fivetran_connector_status", "query_bigquery", "build_recall_graph", "get_graph_neighbors", "vector_search_similar_recalls", "generate_context_pack", "draft_containment_actions", "run_eval_suite", "propose_memory_update", "generate_compliance_report"];
  const agentRuns = [
    { run_id: "run_2042", recall_id: recall.recallId, prompt_version: "v1.4.2", model: "gemini-3-pro", tools: 12, latency_ms: 18420, token_count: 41280, cost: 0.214, eval_score: 0.94, status: "passed", actions: 6, approvals: 6 },
    { run_id: "run_2041", recall_id: "F-1139-2026", prompt_version: "v1.4.2", model: "gemini-3-pro", tools: 11, latency_ms: 20110, token_count: 38940, cost: 0.198, eval_score: 0.9, status: "passed", actions: 5, approvals: 5 },
    { run_id: "run_2040", recall_id: "F-1131-2026", prompt_version: "v1.4.1", model: "gemini-3-pro", tools: 12, latency_ms: 23880, token_count: 44120, cost: 0.231, eval_score: 0.79, status: "review", actions: 6, approvals: 4 },
    { run_id: "run_2039", recall_id: "F-1126-2026", prompt_version: "v1.4.1", model: "gemini-3-flash", tools: 10, latency_ms: 9120, token_count: 21040, cost: 0.061, eval_score: 0.72, status: "review", actions: 5, approvals: 3 },
    { run_id: "run_2038", recall_id: "F-1119-2026", prompt_version: "v1.4.0", model: "gemini-3-pro", tools: 11, latency_ms: 26010, token_count: 47880, cost: 0.248, eval_score: 0.68, status: "failed", actions: 4, approvals: 2 },
  ];
  const toolTrace = TOOLS.map((t, i) => ({
    name: t, status: i === 9 ? "success" : "success", latencyMs: [820, 1240, 410, 2180, 2640, 1180, 1520, 940, 3120, 4210, 760, 880][i] || 800,
    detail: ["1 recall", "8 connectors queued", "all healthy", "1,842 rows", gNodes.length + " nodes", "neighbors expanded", "3 similar", "ctx_8841", "6 actions", "10/10 checks", "1 proposal", "report.pdf"][i],
  }));

  /* ---------------- Eval suite ---------------- */
  const evalCases = [
    { id: "ev1", name: "Exact lot match correctness", passed: true, score: 1.0 },
    { id: "ev2", name: "UPC match correctness", passed: true, score: 0.98 },
    { id: "ev3", name: "No customer action without approval", passed: true, score: 1.0 },
    { id: "ev4", name: "All actions have evidence", passed: true, score: 1.0 },
    { id: "ev5", name: "Stop-sale exists for in-stock units", passed: true, score: 1.0 },
    { id: "ev6", name: "Supplier hold for in-transit shipments", passed: true, score: 1.0 },
    { id: "ev7", name: "Customer notice for sold units", passed: true, score: 1.0 },
    { id: "ev8", name: "Compliance report includes timeline", passed: true, score: 1.0 },
    { id: "ev9", name: "Low-confidence matches require review", passed: false, score: 0.74 },
    { id: "ev10", name: "Fivetran freshness checked before reasoning", passed: true, score: 1.0 },
  ];

  /* ---------------- Improvement proposals ---------------- */
  const improvements = [
    { id: "imp_1", type: "matching_rule", title: "Require exact lot match before stop-sale", risk: "low", before: "Stop-sale triggers on semantic product match (≥0.70).", after: "Stop-sale requires exact lot OR UPC match; semantic matches route to human review.", evalBefore: 0.74, evalAfter: 0.96, state: "pending", from: "ev9" },
    { id: "imp_2", type: "playbook_rule", title: "Customer notices always require human approval", risk: "low", before: "Notices auto-draft and could be flagged auto-send.", after: "All customer-facing notices are hard-gated behind human approval, no exceptions.", evalBefore: 0.88, evalAfter: 1.0, state: "approved", from: "ev3" },
    { id: "imp_3", type: "memory_update", title: "Supplier aliases for recalled firm", risk: "low", before: "‘Northwind Provisions LLC’ not linked to ‘Northwind Foods’.", after: "Add alias set {Northwind Provisions, Northwind Foods, NW Provisions} to supplier memory.", evalBefore: 0.79, evalAfter: 0.91, state: "pending", from: "ev6" },
    { id: "imp_4", type: "tool_policy", title: "Resync Fivetran if freshness > 15 min", risk: "medium", before: "Agent reasons on warehouse regardless of sync age.", after: "If BigQuery freshness > 15 min, trigger Fivetran resync before reasoning.", evalBefore: 0.9, evalAfter: 0.97, state: "pending", from: "ev10" },
    { id: "imp_5", type: "prompt_patch", title: "Cite evidence ID for every recommendation", risk: "low", before: "Some recommendations lacked explicit evidence IDs.", after: "Every drafted action must enumerate evidence IDs or be rejected by the eval gate.", evalBefore: 0.84, evalAfter: 0.99, state: "pending", from: "ev4" },
  ];

  /* ---------------- Memory episodes ---------------- */
  const memory = [
    { id: "mem_1", title: "Listeria — pretzel snack (2024)", similarity: 0.82, outcome: "Contained in 14 min", lesson: "Exact-lot routing prevented over-pull of unaffected stock.", approved: true },
    { id: "mem_2", title: "Cheese dip recall (2025)", similarity: 0.71, outcome: "Contained in 19 min", lesson: "Supplier hold on in-transit shipments avoided 1,200-unit loss.", approved: true },
    { id: "mem_3", title: "Spinach E. coli (2023)", similarity: 0.64, outcome: "Contained in 31 min", lesson: "Customer-notice consent suppression matters for compliance.", approved: false },
  ];

  /* ---------------- Replay events ---------------- */
  const replayEvents = [
    { t: 0, phase: "intake", label: "FDA recall ingested" },
    { t: 8, phase: "sync", label: "Fivetran sync started" },
    { t: 22, phase: "sync", label: "BigQuery warehouse refreshed" },
    { t: 30, phase: "graph", label: "RecallGraph expanded" },
    { t: 42, phase: "context", label: "Context pack generated" },
    { t: 55, phase: "reason", label: "Gemini drafted 6 actions" },
    { t: 70, phase: "approve", label: "Human approved stop-sale" },
    { t: 82, phase: "eval", label: "Eval suite passed 9/10" },
    { t: 90, phase: "report", label: "Report → CONTAINED" },
  ];

  const env = {
    OPENFDA_BASE: "https://api.fda.gov/food/enforcement.json",
    FIVETRAN_API: "https://api.fivetran.com/v1",
    FIVETRAN_MCP: "stdio://fivetran-mcp",
    BQ_DATASET: "recallops_cortex.operational",
    GEMINI_MODEL: "gemini-3-pro",
    CLOUD_RUN_BASE: "https://recallops-cortex-xxxx.run.app",
    cachedFallback: true,
  };

  window.RO = {
    recall, stats, locations, shipments, syncRuns, reasoning, actions, audit, evidence,
    integrations, statusChips, routes,
    graph: { nodes: gNodes, edges: gEdges, colors: NODE_COLOR },
    entityMatches, contextPack, agentRuns, toolTrace, TOOLS, evalCases, improvements, memory, replayEvents, env,
    cached: true,
  };
})();
