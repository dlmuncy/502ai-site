/* Lead forms on the marketing pages. API base lives in this one constant. */
var API_BASE_URL = "https://n8n.damonmuncy.pro/webhook";

(function () {
  var SUPPORT = "info@502ai.pro";

  function labelOf(form) {
    var btn = form.querySelector("button[type='submit'], button:not([type])");
    if (!btn) return "";
    return btn.textContent.replace(/\s+/g, " ").trim();
  }

  function kindOf(form) {
    if (form.querySelector("[name='name'], [name='business_goals']")) return "consultation";
    var label = labelOf(form);
    if (
      label === "Send request" ||
      label === "Get the guide" ||
      label === "Email me the free guide" ||
      label === "Send me the free guide"
    ) {
      return form.closest("#free-guide") ? "home" : "checklist";
    }
    return "";
  }

  function textOf(form, name) {
    var el = form.querySelector("[name='" + name + "']");
    return el && typeof el.value === "string" ? el.value.trim() : "";
  }

  function reviewValue(form, label) {
    var terms = form.querySelectorAll("dt");
    for (var i = 0; i < terms.length; i++) {
      var term = terms[i].textContent.replace(/\s+/g, " ").trim();
      if (term !== label) continue;
      var dd = terms[i].nextElementSibling;
      if (!dd || dd.tagName !== "DD") return "";
      var value = dd.textContent.replace(/\s+/g, " ").trim();
      return value === "Not provided" ? "" : value;
    }
    return "";
  }

  function statusNode(form) {
    var next = form.nextElementSibling;
    if (next && next.classList && next.classList.contains("lead-status")) return next;
    var p = document.createElement("p");
    p.className = "lead-status";
    p.setAttribute("role", "status");
    p.style.marginTop = "0.75rem";
    p.style.maxWidth = "36rem";
    p.style.fontSize = "0.875rem";
    p.style.lineHeight = "1.5";
    form.insertAdjacentElement("afterend", p);
    return p;
  }

  function showStatus(form, ok, message) {
    var p = statusNode(form);
    while (p.firstChild) p.removeChild(p.firstChild);
    p.appendChild(document.createTextNode(message));
    if (!ok) {
      p.appendChild(document.createTextNode(" Or email "));
      var a = document.createElement("a");
      a.href = "mailto:" + SUPPORT;
      a.textContent = SUPPORT;
      a.className = "underline";
      p.appendChild(a);
      p.appendChild(document.createTextNode("."));
    }
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
  }

  function payloadFor(form, source) {
    if (source !== "consultation") {
      var nameField = form.querySelector("[name='name']");
      var name = nameField && typeof nameField.value === "string" ? nameField.value.trim() : "";
      if (!nameField) name = "Guide request";
      return { source: source, name: name.slice(0, 200), email: textOf(form, "email").slice(0, 254) };
    }
    var name = textOf(form, "name") || reviewValue(form, "Your name");
    var email = textOf(form, "email") || reviewValue(form, "Your email");
    var parts = [];
    function add(label, value) {
      if (value) parts.push(label + ": " + value);
    }
    add("Phone", textOf(form, "phone") || reviewValue(form, "Your phone number"));
    add("Business", textOf(form, "business_name") || reviewValue(form, "Business name"));
    var goals = textOf(form, "business_goals") || reviewValue(form, "What would you like to improve or understand?");
    var pain = textOf(form, "pain_points") || reviewValue(form, "Task, issue, or upcoming change");
    var tools = textOf(form, "existing_software") || reviewValue(form, "Current tools and setup");
    if (goals) parts.push(goals);
    if (pain) parts.push(pain);
    if (tools) parts.push(tools);
    return {
      source: "consultation",
      name: name.slice(0, 200),
      email: email.slice(0, 254),
      message: parts.join("\n\n").slice(0, 2000),
      goals: goals
    };
  }

  document.addEventListener(
    "click",
    function (event) {
      if (window.next) return;
      var target = event.target;
      var btn = target && target.closest ? target.closest("button[aria-controls]") : null;
      if (!btn || btn.getAttribute("data-orientation") !== "vertical") return;
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return;
      event.preventDefault();
      var open = btn.getAttribute("aria-expanded") === "true";
      var next = open ? "closed" : "open";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      btn.setAttribute("data-state", next);
      panel.setAttribute("data-state", next);
      if (open) panel.setAttribute("hidden", "");
      else panel.removeAttribute("hidden");
    },
    true
  );

  document.addEventListener(
    "submit",
    function (event) {
      var form = event.target;
      if (!form || form.tagName !== "FORM") return;
      var source = kindOf(form);
      if (!source) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      var data = payloadFor(form, source);
      if (source === "consultation" && !data.goals) {
        showStatus(form, false, "Please add what you would like to improve, then send the request again.");
        return;
      }
      if (!data.name && source === "consultation") {
        showStatus(form, false, "Please add your name and try again.");
        return;
      }
      if (!validEmail(data.email)) {
        showStatus(form, false, "Please enter a valid email address and try again.");
        return;
      }

      var body = { source: data.source, name: data.name, email: data.email };
      if (data.message) body.message = data.message;

      var btn = form.querySelector("button[type='submit'], button:not([type])");
      if (btn) btn.disabled = true;

      fetch(API_BASE_URL + "/502ai-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "omit",
        cache: "no-store",
        redirect: "error",
        body: JSON.stringify(body)
      })
        .then(function (res) {
          if (res.status === 429) {
            showStatus(form, false, "Too many requests right now. Please wait a few minutes and try again.");
            return null;
          }
          if (!res.ok) throw new Error("bad");
          return res.json();
        })
        .then(function (json) {
          if (json === null) return;
          if (!json || json.ok !== true) throw new Error("bad");
          showStatus(form, true, "Thanks. We received your request and will follow up by email.");
        })
        .catch(function () {
          showStatus(form, false, "Something went wrong and your request was not sent. Please try again.");
        })
        .then(function () {
          if (btn) btn.disabled = false;
        });
    },
    true
  );
})();
