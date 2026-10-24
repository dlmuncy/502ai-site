/* Single place for the postal address.
   OPEN ITEM: replace this value before the site is published.
   While it still contains "{{", legal pages leave the address blank
   so visitors never see the placeholder. */
var POSTAL_ADDRESS = "{{POSTAL_ADDRESS}}";

(function () {
  var show =
    typeof POSTAL_ADDRESS === "string" &&
    POSTAL_ADDRESS.indexOf("{{") === -1 &&
    POSTAL_ADDRESS.trim() !== "";
  var nodes = document.querySelectorAll("[data-postal-address]");
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].textContent = show ? POSTAL_ADDRESS : "";
  }
})();
