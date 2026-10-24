/* Customer portal. The API base URL lives in this one constant. */
var API_BASE_URL = "https://n8n.damonmuncy.pro/webhook";

(function () {
  var SUPPORT = "info@502ai.pro";
  var token = readToken();
  stripTokenFromAddressBar();

  var root = document.getElementById("app");
  if (!token) {
    renderInvalid();
    return;
  }
  lookup();

  function readToken() {
    var hash = location.hash || "";
    if (hash.indexOf("#t=") !== 0) return "";
    var raw = hash.slice(3).split("&")[0];
    if (!raw || raw.length > 2000) return "";
    try {
      return decodeURIComponent(raw);
    } catch (err) {
      return "";
    }
  }

  function stripTokenFromAddressBar() {
    var params = new URLSearchParams(location.search);
    params.delete("t");
    var query = params.toString();
    var next = location.pathname + (query ? "?" + query : "");
    if (location.hash || /(^|[?&])t=/.test(location.search)) {
      history.replaceState(null, "", next);
    }
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  var ALLOWED_LINK_HOSTS = {
    "502ai.pro": true,
    "www.502ai.pro": true,
    "n8n.damonmuncy.pro": true,
    "checkout.stripe.com": true,
    "billing.stripe.com": true,
    "pay.stripe.com": true,
    "buy.stripe.com": true,
    "invoice.stripe.com": true
  };

  function safeHttps(value) {
    if (typeof value !== "string" || value.length > 2000) return "";
    try {
      var url = new URL(value);
      if (url.protocol !== "https:") return "";
      if (url.username || url.password) return "";
      var host = url.hostname;
      if (!Object.prototype.hasOwnProperty.call(ALLOWED_LINK_HOSTS, host)) return "";
      return url.href;
    } catch (err) {
      return "";
    }
  }

  function mailHref(orderId) {
    var id = String(orderId || "").replace(/[\r\n\u0000]/g, "").slice(0, 80);
    return "mailto:" + SUPPORT + "?subject=" + encodeURIComponent(id ? "Order " + id : "502ai order");
  }

  function link(href, text, className) {
    var a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    if (className) a.className = className;
    a.rel = "noopener noreferrer";
    a.referrerPolicy = "no-referrer";
    return a;
  }

  function panel() {
    return el("section", "panel");
  }

  function post(path, body) {
    return fetch(API_BASE_URL + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "omit",
      cache: "no-store",
      redirect: "error",
      body: JSON.stringify(body)
    });
  }

  function lookup() {
    clear(root);
    root.appendChild(el("p", "lede", "Loading your order…"));
    post("/502ai-portal-lookup", { t: token })
      .then(function (res) {
        if (res.status === 404) return { kind: "missing" };
        if (res.status === 429) return { kind: "limited" };
        if (!res.ok) return { kind: "down" };
        return res.json().then(function (data) {
          if (!data || !data.order) return { kind: "down" };
          return { kind: "order", order: data.order };
        });
      })
      .then(function (result) {
        if (result.kind === "order") renderOrder(result.order);
        else if (result.kind === "missing") renderInvalid();
        else if (result.kind === "limited") renderLimited();
        else renderDown();
      })
      .catch(function () {
        renderDown();
      });
  }

  function renderInvalid() {
    clear(root);
    var box = panel();
    box.appendChild(el("h1", null, "This link isn't valid"));
    box.appendChild(el("p", "lede", "This link isn't valid. Reply to your order email and we'll send a new one."));
    var actions = el("div", "actions");
    actions.appendChild(link("mailto:" + SUPPORT, "Email " + SUPPORT, "button"));
    box.appendChild(actions);
    box.appendChild(resendForm());
    root.appendChild(box);
  }

  function renderLimited() {
    clear(root);
    var box = panel();
    box.appendChild(el("h1", null, "Please wait a moment"));
    box.appendChild(el("p", "lede", "Too many tries from this network. Wait a minute, then try this page again. Your order details stay hidden until then."));
    var retry = el("button", null, "Try again");
    retry.type = "button";
    retry.addEventListener("click", lookup);
    box.appendChild(retry);
    box.appendChild(resendForm());
    root.appendChild(box);
  }

  function renderDown() {
    clear(root);
    var box = panel();
    box.appendChild(el("h1", null, "We could not load your order"));
    box.appendChild(el("p", "lede", "Check your connection and try again. If it keeps happening, email us and we will help."));
    var actions = el("div", "actions");
    var retry = el("button", null, "Try again");
    retry.type = "button";
    retry.addEventListener("click", lookup);
    actions.appendChild(retry);
    actions.appendChild(link("mailto:" + SUPPORT, "Email " + SUPPORT, "button secondary"));
    box.appendChild(actions);
    root.appendChild(box);
  }

  function resendForm() {
    var wrap = el("div");
    wrap.appendChild(el("h2", null, "Request a new link"));
    wrap.appendChild(el("p", "quiet", "Enter the email you used at checkout. If we have an order for it, we will send a new link. We show the same confirmation either way."));
    var form = document.createElement("form");
    var label = el("label", null, "Email");
    label.htmlFor = "resend-email";
    var input = document.createElement("input");
    input.id = "resend-email";
    input.name = "email";
    input.type = "email";
    input.autocomplete = "email";
    input.required = true;
    input.maxLength = 254;
    var button = el("button", null, "Email me a new link");
    button.type = "submit";
    var note = el("p", "quiet");
    note.hidden = true;
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(button);
    form.appendChild(note);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        note.hidden = false;
        note.textContent = "Please enter a valid email address.";
        return;
      }
      button.disabled = true;
      post("/502ai-portal-resend", { email: email })
        .then(function (res) {
          if (res.status === 429) {
            note.hidden = false;
            note.textContent = "Too many requests right now. Please wait and try again, or email " + SUPPORT + ".";
            return null;
          }
          if (!res.ok) throw new Error("bad");
          return res.json();
        })
        .then(function (json) {
          if (json === null) return;
          if (!json || json.ok !== true) throw new Error("bad");
          note.hidden = false;
          note.textContent = "If we have an order for that email, we will send a new link. Check your inbox.";
          input.value = "";
        })
        .catch(function () {
          note.hidden = false;
          note.textContent = "We could not send that just now. Please try again in a little while, or email " + SUPPORT + ".";
        })
        .then(function () {
          button.disabled = false;
        });
    });
    wrap.appendChild(form);
    return wrap;
  }

  function offerKey(order) {
    var key = order && order.offer;
    if (key === "kit" || key === "audit" || key === "qualifier" || key === "website") return key;
    return "";
  }

  function offerName(order) {
    if (order && typeof order.offer_name === "string" && order.offer_name.trim()) return order.offer_name.trim();
    var names = {
      kit: "Website Starter Kit",
      audit: "AI Automation Audit",
      qualifier: "AI Lead Qualifier Setup",
      website: "One-Page Website"
    };
    return names[offerKey(order)] || "Your order";
  }

  function plainText(value) {
    if (typeof value !== "string") return "";
    var text = value.replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim();
    return text.slice(0, 2000);
  }

  function firstName(order) {
    if (order && typeof order.first_name === "string" && order.first_name.trim()) return order.first_name.trim();
    return "there";
  }

  function renderOrder(order) {
    clear(root);
    var key = offerKey(order);
    root.appendChild(renderHeader(order));
    if (key === "kit") root.appendChild(renderDownloads(order, true));
    root.appendChild(renderStatus(order, key));
    root.appendChild(renderNext(key));
    if (key !== "kit") root.appendChild(renderIntake(order, key));
    if (key !== "kit") {
      var laterFiles = renderDownloads(order, false);
      if (laterFiles.childNodes.length) root.appendChild(laterFiles);
    }
    root.appendChild(renderContact(order, key));
    root.appendChild(renderSupport(key));
  }

  function renderHeader(order) {
    var box = panel();
    box.appendChild(el("p", "kicker", "Your order"));
    box.appendChild(el("h1", null, "Thanks, " + firstName(order) + "."));
    var bits = [offerName(order)];
    if (order.id) bits.push("Order " + String(order.id));
    if (order.date_display) bits.push("Paid " + String(order.date_display));
    if (order.amount_display) bits.push(String(order.amount_display));
    box.appendChild(el("p", "meta", bits.join(" | ")));
    var receipt = safeHttps(order.receipt_url);
    if (receipt) {
      var actions = el("div", "actions");
      actions.appendChild(link(receipt, "View receipt", "button secondary"));
      box.appendChild(actions);
    }
    box.appendChild(el("p", "promise", "Every price up front. No hourly billing, no surprises."));
    return box;
  }

  function renderStatus(order, key) {
    var box = panel();
    box.appendChild(el("h2", null, "Where things stand"));
    var steps = [
      ["received", "Received", "We have your order."],
      ["in_progress", "In progress", "We are working on it."],
      ["delivered", "Delivered", "Everything for this order is ready."]
    ];
    var current = order.status === "in_progress" || order.status === "delivered" ? order.status : "received";
    var rank = { received: 0, in_progress: 1, delivered: 2 };
    var list = el("ol", "tracker");
    steps.forEach(function (step) {
      var item = el("li");
      if (rank[step[0]] < rank[current]) item.className = "is-done";
      if (step[0] === current) item.className = "is-current";
      item.appendChild(el("strong", null, step[1]));
      item.appendChild(el("span", null, step[2]));
      list.appendChild(item);
    });
    box.appendChild(list);
    if (key === "kit" && current === "delivered") {
      box.appendChild(el("p", "quiet", "Your Starter Kit is delivered. Download it above."));
    }
    var note = plainText(order.status_note);
    var updated = plainText(order.status_updated_display) || plainText(order.status_updated_at) || plainText(order.updated_at);
    if (note) box.appendChild(el("p", "lede", note));
    if (updated) box.appendChild(el("p", "quiet", "Updated " + updated));
    return box;
  }

  function renderNext(key) {
    var copy = {
      kit: [
        ["You", "Download your kit using the button above."],
        ["You", "Follow the quick start guide in the zip file. It covers unzipping, picking a template, editing it, and publishing it."],
        ["You", "Stuck? Email us and we will help."]
      ],
      audit: [
        ["You", "Fill in the short form below so we know about your business."],
        ["Us", "We review your business and website."],
        ["Us", "Your written audit will be emailed to you."],
        ["You", "Reply with any questions."]
      ],
      qualifier: [
        ["You", "Fill in the short form below."],
        ["You", "Book a kickoff call."],
        ["Us", "We build your lead qualifier."],
        ["You + Us", "We review it together on a call."],
        ["Us", "We hand it over to you."]
      ],
      website: [
        ["You", "Fill in the form below and send your logo and photos."],
        ["You", "Check your domain details with us."],
        ["Us", "Your draft preview link will be emailed to you."],
        ["You", "Send one round of feedback."],
        ["Us", "We launch your site."]
      ]
    };
    var rows = copy[key] || [
      ["You", "Email us if you have a question about this order."],
      ["Us", "We reply by email."]
    ];
    var box = panel();
    box.appendChild(el("h2", null, "What happens next"));
    var list = el("ol", "steps");
    rows.forEach(function (row) {
      var item = el("li");
      item.appendChild(el("span", "who", row[0]));
      item.appendChild(el("span", null, row[1]));
      list.appendChild(item);
    });
    box.appendChild(list);
    if (key === "audit") {
      box.appendChild(el("p", "quiet", "Your $149 counts toward the AI Lead Qualifier Setup ($497) if you buy within 30 days. It is a credit, not a cash refund."));
    }
    return box;
  }

  function renderDownloads(order, kit) {
    var files = Array.isArray(order.downloads) ? order.downloads : [];
    var ready = [];
    var supplied = 0;
    files.forEach(function (file) {
      if (!file || typeof file !== "object") return;
      supplied += 1;
      var href = safeHttps(file.url);
      var label = typeof file.label === "string" && file.label.trim() ? file.label.trim() : "Download";
      if (href) ready.push({ href: href, label: label });
    });
    if (!kit && !ready.length && !supplied) return el("div");
    if (!ready.length && supplied) {
      var blocked = panel();
      blocked.appendChild(el("p", "lede", "We could not show that link. Email us and we will send a new one."));
      var blockedActions = el("div", "actions");
      blockedActions.appendChild(link(mailHref(order.id), "Email us", "button secondary"));
      blocked.appendChild(blockedActions);
      return blocked;
    }
    var box = panel();
    if (kit) {
      box.appendChild(el("h2", null, "Your Website Starter Kit"));
      if (ready.length) {
        var list = el("ul", "file-list");
        ready.forEach(function (file) {
          var item = el("li");
          item.appendChild(link(file.href, file.label === "Download" ? "Download the kit" : file.label));
          list.appendChild(item);
        });
        box.appendChild(list);
        box.appendChild(el("p", "quiet", "Contains four ready-to-edit one-page templates (Restaurant, Plumber, Generic Business, Fitness Studio) and a quick start guide."));
      } else {
        box.appendChild(el("p", "lede", "Your download will appear here when it is ready."));
      }
      box.appendChild(el("p", "quiet", "License: personal use and use on client sites you build. Please do not resell, share, or redistribute the templates or the kit."));
      box.appendChild(el("p", "quiet", "If a download link stops working, email us and we will send a new one."));
      var actions = el("div", "actions");
      actions.appendChild(link(mailHref(order.id), "Email us for a new download link", "button secondary"));
      box.appendChild(actions);
      return box;
    }
    var headings = {
      audit: ["Your written audit is ready", "This is your plan of what to automate first. Reply with any questions."],
      qualifier: ["Your lead qualifier pack is ready", "Everything you need to review and use your lead qualifier."],
      website: ["Your site preview is ready", "Take a look and send us your feedback. We will launch it when you say it is ready."]
    };
    var head = headings[offerKey(order)] || ["Your files", "These files are ready for this order."];
    box.appendChild(el("h2", null, head[0]));
    box.appendChild(el("p", "lede", head[1]));
    var list2 = el("ul", "file-list");
    ready.forEach(function (file) {
      var item = el("li");
      item.appendChild(link(file.href, file.label));
      list2.appendChild(item);
    });
    box.appendChild(list2);
    return box;
  }

  function renderIntake(order, key) {
    var box = panel();
    box.appendChild(el("h2", null, "Tell us about your business"));
    if (order.intake_submitted) {
      box.appendChild(el("p", "ok-note", "Got it, thanks. We have your details."));
      return box;
    }
    box.appendChild(el("p", "lede", "A few details help us do this properly. Please do not paste passwords, access codes, or card numbers here."));
    var helpers = {
      audit: "Which tasks take the most time? Which tools do you use?",
      qualifier: "Which form or page should we connect? What does a good lead look like? Who should receive leads?",
      website: "What do you do, where are you, what are your hours, and how should customers contact you? For a logo or photos, paste a Google Drive or Dropbox link, or email the files to " + SUPPORT + "."
    };
    var form = document.createElement("form");
    form.appendChild(field("Business name", "business_name", "text", true, 200, "Required."));
    form.appendChild(field("Website address", "website", "text", false, 500, "Optional. Write \"none yet\" if you do not have one."));
    var notes = document.createElement("textarea");
    notes.name = "notes";
    notes.id = "intake-notes";
    notes.maxLength = 1000;
    notes.required = false;
    var notesLabel = el("label", null, "Notes");
    notesLabel.htmlFor = "intake-notes";
    var count = el("p", "help", "0 / 1000");
    notes.addEventListener("input", function () {
      count.textContent = String(notes.value.length) + " / 1000";
    });
    form.appendChild(notesLabel);
    form.appendChild(el("p", "help", helpers[key] || "Anything we should know."));
    form.appendChild(notes);
    form.appendChild(count);
    var button = el("button", null, "Send");
    button.type = "submit";
    var err = el("p", "warn");
    err.hidden = true;
    form.appendChild(button);
    form.appendChild(err);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var fields = {
        business_name: valueOf(form, "business_name"),
        website: valueOf(form, "website"),
        notes: notes.value.trim()
      };
      if (!fields.business_name) {
        err.hidden = false;
        err.textContent = "Please add your business name.";
        return;
      }
      if (fields.business_name.length > 2000 || fields.website.length > 2000 || fields.notes.length > 2000) {
        err.hidden = false;
        err.textContent = "One of the answers is too long. Please shorten it and try again.";
        return;
      }
      button.disabled = true;
      err.hidden = true;
      post("/502ai-portal-intake", { t: token, fields: fields })
        .then(function (res) {
          if (res.status === 404) {
            renderInvalid();
            return null;
          }
          if (res.status === 429) {
            err.hidden = false;
            err.textContent = "Too many attempts. Please wait and try again, or email " + SUPPORT + ".";
            return null;
          }
          if (!res.ok) throw new Error("bad");
          return res.json();
        })
        .then(function (json) {
          if (json === null) return;
          if (!json || json.ok !== true) throw new Error("bad");
          showAnswers(box, fields);
        })
        .catch(function () {
          err.hidden = false;
          err.textContent = "Something went wrong and your answers were not saved. Please try again or email " + SUPPORT + ".";
        })
        .then(function () {
          button.disabled = false;
        });
    });
    box.appendChild(form);
    return box;
  }

  function field(labelText, name, type, required, max, help) {
    var wrap = el("div");
    var id = "intake-" + name;
    var label = el("label", null, labelText + (required ? " (required)" : " (optional)"));
    label.htmlFor = id;
    var input = document.createElement("input");
    input.id = id;
    input.name = name;
    input.type = type;
    input.maxLength = max;
    input.required = required;
    if (name === "website") input.inputMode = "url";
    wrap.appendChild(label);
    wrap.appendChild(el("p", "help", help));
    wrap.appendChild(input);
    return wrap;
  }

  function valueOf(form, name) {
    var input = form.querySelector("[name='" + name + "']");
    return input && typeof input.value === "string" ? input.value.trim() : "";
  }

  function showAnswers(box, fields) {
    clear(box);
    box.appendChild(el("h2", null, "Tell us about your business"));
    box.appendChild(el("p", "ok-note", "Got it, thanks. Here is what you sent."));
    var list = document.createElement("dl");
    function row(term, value) {
      list.appendChild(el("dt", null, term));
      list.appendChild(el("dd", null, value || "Not provided"));
    }
    row("Business name", fields.business_name);
    row("Website address", fields.website);
    row("Notes", fields.notes);
    box.appendChild(list);
  }

  function renderContact(order, key) {
    var box = panel();
    if (key === "qualifier") {
      box.appendChild(el("h2", null, "Book your call"));
      box.appendChild(el("p", "lede", "Email us with two or three days and times that work for you, including your time zone. We confirm times within 1 business day."));
      box.appendChild(el("p", "quiet", "No time works? Email us and we will find one."));
    }
    box.appendChild(el("h2", null, "Questions?"));
    var actions = el("div", "actions");
    actions.appendChild(link(mailHref(order.id), "Email us", "button"));
    box.appendChild(actions);
    box.appendChild(el("p", "quiet", "Opens an email to " + SUPPORT + " with your order id in the subject."));
    if (key === "website") {
      box.appendChild(el("h2", null, "Your $19 per month plan"));
      var plan = order.plan && typeof order.plan === "object" ? order.plan : null;
      var planLine = "Hosting, security updates, and one small edit per month. To cancel, email " + SUPPORT + ".";
      if (plan && typeof plan.name === "string" && plan.name.trim()) planLine = plan.name.trim() + ". " + planLine;
      if (plan && typeof plan.price_display === "string" && plan.price_display.trim()) planLine += " (" + plan.price_display.trim() + ")";
      box.appendChild(el("p", "lede", planLine));
      var manage = plan ? safeHttps(plan.manage_url) : "";
      if (manage) {
        var row = el("div", "actions");
        row.appendChild(link(manage, "Manage your $19/mo plan", "button secondary"));
        box.appendChild(row);
        box.appendChild(el("p", "quiet", "We never see your full card number."));
      }
    }
    return box;
  }

  function renderSupport(key) {
    var box = panel();
    box.appendChild(el("h2", null, "Support"));
    var items = [
      ["When will I hear back?", "Email us any time and we will reply. We do not promise a specific response time."],
      ["Where is my receipt?", "At the top of this page, under View receipt, when a receipt link is available. Stripe also emailed a receipt to the address you used at checkout."],
      ["How do I get my file again?", key === "kit"
        ? "Use the download section on this page. If a link stops working, email us and we will send a new one."
        : "We email your deliverable. If you need another copy, reply to your order email."],
      ["How do changes work?", "Tell us what you would like changed and where, by email. A short note and an example or screenshot help most."],
      ["How do I reach a person?", "Use the Email us button or reply to your order email. We read every message."],
      ["Refunds", "Refund terms are on the Terms page. If you ask within 7 days and work has not started, we refund the purchase. We do not promise a number of days to finish the work."]
    ];
    items.forEach(function (item) {
      var detail = document.createElement("details");
      var summary = document.createElement("summary");
      summary.textContent = item[0];
      detail.appendChild(summary);
      detail.appendChild(el("p", null, item[1]));
      box.appendChild(detail);
    });
    return box;
  }
})();
