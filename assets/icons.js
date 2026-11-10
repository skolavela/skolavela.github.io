/* ==========================================================================
   Velappky - sada ikon
   Pravidla kreslení nových ikon:
   - viewBox 0 0 48 48, motiv zabírá zhruba 38 × 38 uprostřed
   - jen plné tvary (fill), žádné tenké obrysy; čáry min. 2,4 jednotky
   - barva VŽDY "currentColor" (přebírá tón tématu), druhý tón = currentColor + opacity 0.55
   - detaily bíle (#FFFFFF), max. 3 úrovně (sytá, světlejší, bílá)
   - motiv TÉMATU pro složky, motiv ČINNOSTI pro appky
   - text v ikoně jen výjimečně (Aa, čísla) a systémovým písmem
   ========================================================================== */
(function () {
  var F = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
  var svg = function (body) {
    return '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">' + body + '</svg>';
  };

  window.VELA_ICONS = {
    /* ---- Složky (témata) ---- */
    cestina: svg(
      '<path d="M10 7h28a6 6 0 0 1 6 6v17a6 6 0 0 1-6 6H22l-9 7v-7h-3a6 6 0 0 1-6-6V13a6 6 0 0 1 6-6z" fill="currentColor"/>' +
      '<text x="24" y="27.5" text-anchor="middle" font-family="' + F + '" font-size="15" font-weight="800" fill="#FFFFFF">Aa</text>'
    ),
    matematika: svg(
      '<rect x="5" y="5" width="17" height="17" rx="5" fill="currentColor"/>' +
      '<rect x="26" y="5" width="17" height="17" rx="5" fill="currentColor" opacity="0.55"/>' +
      '<rect x="5" y="26" width="17" height="17" rx="5" fill="currentColor" opacity="0.55"/>' +
      '<rect x="26" y="26" width="17" height="17" rx="5" fill="currentColor"/>' +
      '<path d="M13.5 9.5v8M9.5 13.5h8M30.5 13.5h8M10.6 31.1l5.8 5.8M16.4 31.1l-5.8 5.8M30.5 32.3h8M30.5 36.7h8" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" fill="none"/>'
    ),
    logika: svg(
      '<path d="M8 15a4 4 0 0 1 4-4h7a5 5 0 1 1 10 0h7a4 4 0 0 1 4 4v7a5 5 0 1 1 0 10v7a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill="currentColor"/>' +
      '<circle cx="16" cy="19" r="2.6" fill="#FFFFFF" opacity="0.6"/>'
    ),
    zabava: svg(
      '<g transform="rotate(-12 16 22)"><rect x="4" y="10" width="24" height="24" rx="6" fill="currentColor" opacity="0.55"/>' +
      '<circle cx="10.5" cy="16.5" r="2.4" fill="#FFFFFF"/><circle cx="21.5" cy="27.5" r="2.4" fill="#FFFFFF"/></g>' +
      '<g transform="rotate(10 32 28)"><rect x="20" y="16" width="24" height="24" rx="6" fill="currentColor"/>' +
      '<circle cx="26.5" cy="22.5" r="2.4" fill="#FFFFFF"/><circle cx="32" cy="28" r="2.4" fill="#FFFFFF"/><circle cx="37.5" cy="33.5" r="2.4" fill="#FFFFFF"/></g>'
    ),
    prirodoveda: svg(
      '<rect x="21.5" y="24" width="5" height="19" rx="2.5" fill="currentColor" opacity="0.55"/>' +
      '<g fill="currentColor"><circle cx="24" cy="16" r="11"/><circle cx="14.5" cy="24" r="8"/><circle cx="33.5" cy="24" r="8"/><rect x="14.5" y="22" width="19" height="10" rx="5"/></g>' +
      '<circle cx="19" cy="12.5" r="3" fill="#FFFFFF" opacity="0.4"/>'
    ),
    prijimacky: svg(
      '<path d="M12 23v9c0 3.5 5.4 7 12 7s12-3.5 12-7v-9l-12 5.7z" fill="currentColor" opacity="0.55"/>' +
      '<path d="M24 8L3 18l21 10 21-10z" fill="currentColor"/>' +
      '<path d="M41 19.5V31" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>' +
      '<circle cx="41" cy="33.5" r="2.8" fill="currentColor"/>'
    ),
    cteni: svg(
      '<path d="M24 12c-5-3.5-11-4.5-19-4.5v28c8 0 14 1 19 4.5z" fill="currentColor"/>' +
      '<path d="M24 12c5-3.5 11-4.5 19-4.5v28c-8 0-14 1-19 4.5z" fill="currentColor" opacity="0.55"/>' +
      '<path d="M10 15c4 .2 7.5 1 10 2.2M10 21c4 .2 7.5 1 10 2.2M10 27c4 .2 7.5 1 10 2.2" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" fill="none"/>'
    ),

    /* ---- Appky (činnosti) ---- */
    bludiste: svg(
      '<rect x="5" y="5" width="38" height="38" rx="10" fill="currentColor"/>' +
      '<path d="M12 12h11M30 12h6v12M12 12v18h8M20 20h9v10h7M12 36h12v-6M30 36h6" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="36" cy="36" r="3.2" fill="#FFFFFF"/>'
    ),
    slabiky: svg(
      '<rect x="3" y="9" width="42" height="30" rx="9" fill="currentColor"/>' +
      '<text x="24" y="29.5" text-anchor="middle" font-family="' + F + '" font-size="15" fill="#FFFFFF">' +
      '<tspan font-weight="900">ma</tspan><tspan font-weight="400" opacity="0.85">ma</tspan></text>'
    ),
    osmismerka: svg(
      '<rect x="5" y="5" width="38" height="38" rx="10" fill="currentColor"/>' +
      '<g fill="#FFFFFF" opacity="0.5"><circle cx="24" cy="14" r="2.2"/><circle cx="34" cy="14" r="2.2"/><circle cx="14" cy="24" r="2.2"/><circle cx="34" cy="24" r="2.2"/><circle cx="14" cy="34" r="2.2"/><circle cx="24" cy="34" r="2.2"/></g>' +
      '<path d="M14 14L34 34" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>' +
      '<g fill="currentColor"><circle cx="14" cy="14" r="2.2"/><circle cx="24" cy="24" r="2.2"/><circle cx="34" cy="34" r="2.2"/></g>'
    ),
    priroda: svg(
      '<path d="M18 26h12l1.6 12a4 4 0 0 1-4 4.5h-7.2a4 4 0 0 1-4-4.5z" fill="currentColor" opacity="0.55"/>' +
      '<path d="M5 24a19 16 0 0 1 38 0c0 2-1.5 3-3.5 3h-31C6.5 27 5 26 5 24z" fill="currentColor"/>' +
      '<g fill="#FFFFFF" opacity="0.85"><circle cx="15" cy="17" r="3"/><circle cx="26" cy="12.5" r="2.4"/><circle cx="33.5" cy="20" r="2"/></g>'
    ),
    stopky: svg(
      '<rect x="20" y="3" width="8" height="5" rx="2" fill="currentColor" opacity="0.55"/>' +
      '<path d="M36 10.5l3.5 3.5" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>' +
      '<circle cx="24" cy="27" r="17" fill="currentColor"/>' +
      '<path d="M24 27V17M24 27l6.5 4" stroke="#FFFFFF" stroke-width="3.4" stroke-linecap="round"/>' +
      '<circle cx="24" cy="27" r="2.2" fill="#FFFFFF"/>'
    ),
    sudoku: svg(
      '<rect x="5" y="5" width="38" height="38" rx="10" fill="currentColor"/>' +
      '<path d="M17.7 9v30M30.3 9v30M9 17.7h30M9 30.3h30" stroke="#FFFFFF" stroke-width="1.6" opacity="0.5"/>' +
      '<g fill="#FFFFFF" font-family="' + F + '" font-size="9" font-weight="800" text-anchor="middle">' +
      '<text x="11.4" y="14.6">5</text><text x="36.6" y="27.2">3</text><text x="24" y="39.8">8</text></g>'
    ),

    vyjmenovana: svg(
      '<path d="M9 6h22a5 5 0 0 1 5 5v26a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V11a5 5 0 0 1 5-5z" fill="currentColor"/>' +
      '<text x="21" y="33" text-anchor="middle" font-family="' + F + '" font-size="22" font-weight="800" fill="#FFFFFF">y</text>' +
      '<text x="34" y="22" text-anchor="middle" font-family="' + F + '" font-size="13" font-weight="700" fill="#FFFFFF" opacity="0.55">i</text>'
    ),

    souctove: svg(
      '<rect x="8.5" y="32" width="9" height="9" rx="2.5" fill="currentColor"/>' +
      '<rect x="19.5" y="32" width="9" height="9" rx="2.5" fill="currentColor"/>' +
      '<rect x="30.5" y="32" width="9" height="9" rx="2.5" fill="currentColor"/>' +
      '<rect x="14" y="21" width="9" height="9" rx="2.5" fill="currentColor" opacity="0.55"/>' +
      '<rect x="25" y="21" width="9" height="9" rx="2.5" fill="currentColor" opacity="0.55"/>' +
      '<rect x="19.5" y="10" width="9" height="9" rx="2.5" fill="currentColor"/>'
    ),

    /* ---- Náhradní ikony, když nová položka ještě nemá vlastní ---- */
    slozka: svg(
      '<path d="M5 13a5 5 0 0 1 5-5h9l4 5h15a5 5 0 0 1 5 5v17a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5z" fill="currentColor"/>' +
      '<rect x="5" y="17" width="38" height="4" fill="#FFFFFF" opacity="0.35"/>'
    ),
    appka: svg(
      '<rect x="5" y="5" width="38" height="38" rx="10" fill="currentColor"/>' +
      '<path d="M24 12l3.2 8.8L36 24l-8.8 3.2L24 36l-3.2-8.8L12 24l8.8-3.2z" fill="#FFFFFF"/>'
    ),

    /* ---- Ikony rozhraní (lupa, šipka zpět, vlnka...) ---- */
    ui_search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    ui_back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    ui_wave: '<svg viewBox="0 0 96 16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M3 8c5-6 10-6 15 0s10 6 15 0 10-6 15 0 10 6 15 0 10-6 15 0 10 6 15 0"/></svg>'
  };
})();
