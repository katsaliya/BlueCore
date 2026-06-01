type FieldMap = Record<string, string>;

function val(fields: FieldMap, key: string, fallback = "") {
  return fields[key] ?? fallback;
}

export function renderEngineRoomLogHtml(fields: FieldMap, mode: "draft" | "final"): string {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 10px; color: #000; background: #fff; padding: 24px; }
  .page { max-width: 740px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 10px; }
  .header h1 { font-size: 15px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
  .header h2 { font-size: 11px; font-weight: normal; margin-top: 2px; }
  .draft-banner { background: #fff3cd; border: 1px solid #f0ad4e; text-align: center; padding: 4px; font-weight: bold; font-size: 10px; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  td, th { border: 1px solid #333; padding: 4px 6px; vertical-align: top; }
  th { background: #e8e8e8; font-weight: bold; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; width: 38%; }
  .section-header { background: #222; color: #fff; font-weight: bold; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; padding: 4px 6px; }
  .value { font-size: 10px; }
  .missing { color: #cc0000; font-style: italic; }
  .two-col td { width: 50%; }
  .full-row td:last-child { width: 62%; }
  .sig-row { height: 36px; }
  .footer { margin-top: 10px; font-size: 8px; color: #666; text-align: right; }
  .stamp { float: right; border: 2px solid #000; width: 100px; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #aaa; margin-left: 10px; }
</style>
</head>
<body>
<div class="page">
  ${mode === "draft" ? '<div class="draft-banner">⚠ DRAFT — NOT FOR SUBMISSION</div>' : ""}

  <div class="header">
    <h1>Engine Room Log</h1>
    <h2>Watch Period Record — Machinery Space Operations</h2>
  </div>

  <!-- Vessel Particulars -->
  <table>
    <tr><td class="section-header" colspan="4">Vessel Particulars</td></tr>
    <tr>
      <th>Vessel Name</th><td class="value">${val(fields, "vessel_name")}</td>
      <th>Official No.</th><td class="value">${val(fields, "official_number")}</td>
    </tr>
    <tr>
      <th>IMO Number</th><td class="value">${val(fields, "imo_number")}</td>
      <th>Gross Tonnage</th><td class="value">${val(fields, "gross_tonnage")}</td>
    </tr>
    <tr>
      <th>Flag State</th><td class="value">${val(fields, "flag")}</td>
      <th>Fuel Type</th><td class="value">${val(fields, "fuel_type")}</td>
    </tr>
  </table>

  <!-- Watch Details -->
  <table>
    <tr><td class="section-header" colspan="4">Watch Details</td></tr>
    <tr>
      <th>Date</th><td class="value">${val(fields, "watch_date")}</td>
      <th>Watch Period</th><td class="value">${val(fields, "watch_period")}</td>
    </tr>
    <tr>
      <th>Engineer Name</th><td class="value">${val(fields, "engineer_name")}</td>
      <th>Rank</th><td class="value">${val(fields, "engineer_rank")}</td>
    </tr>
    <tr>
      <th>Main Engine Type</th><td class="value" colspan="3">${val(fields, "main_engine_type")}</td>
    </tr>
  </table>

  <!-- Main Engine Readings -->
  <table>
    <tr><td class="section-header" colspan="4">Main Engine Readings</td></tr>
    <tr>
      <th>Average RPM</th><td class="value">${val(fields, "avg_rpm")}</td>
      <th>Engine Load (%)</th><td class="value">${val(fields, "engine_load")}</td>
    </tr>
    <tr>
      <th>Fuel Consumption</th><td class="value">${val(fields, "fuel_consumption")}</td>
      <th>HFO Remaining on Board</th><td class="value">${val(fields, "hfo_rob")}</td>
    </tr>
  </table>

  <!-- Pressures & Temperatures -->
  <table>
    <tr><td class="section-header" colspan="4">Pressures &amp; Temperatures</td></tr>
    <tr>
      <th>JCW Pressure</th><td class="value">${val(fields, "jcw_pressure")}</td>
      <th>Lube Oil Pressure</th><td class="value">${val(fields, "lube_oil_pressure")}</td>
    </tr>
    <tr>
      <th>Exhaust Temperatures</th><td class="value" colspan="3">${val(fields, "exhaust_temps")}</td>
    </tr>
  </table>

  <!-- Incidents & Handoff -->
  <table>
    <tr><td class="section-header" colspan="2">Incidents / Alarms / Observations</td></tr>
    <tr>
      <td colspan="2" class="value" style="min-height:40px; padding: 6px;">${val(fields, "incidents", "None recorded.")}</td>
    </tr>
  </table>

  <table>
    <tr><td class="section-header" colspan="2">Watch Handoff</td></tr>
    <tr>
      <th>Handoff To</th><td class="value">${val(fields, "handoff_to")}</td>
    </tr>
  </table>

  <!-- Signature -->
  <table>
    <tr><td class="section-header" colspan="4">Certification</td></tr>
    <tr class="sig-row">
      <th>Engineer Signature</th>
      <td class="value">${mode === "final" ? val(fields, "engineer_name") : ""}</td>
      <th>Date Signed</th>
      <td class="value">${mode === "final" ? date : ""}</td>
    </tr>
  </table>

  <div class="footer">Generated by BlueCore · ${date} · ${mode === "final" ? "FINAL" : "DRAFT"}</div>
</div>
</body>
</html>`;
}

export function renderOilRecordBookHtml(fields: FieldMap, mode: "draft" | "final"): string {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 10px; color: #000; background: #fff; padding: 24px; }
  .page { max-width: 740px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 10px; }
  .header .form-no { font-size: 9px; color: #555; margin-bottom: 4px; }
  .header h1 { font-size: 14px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
  .header h2 { font-size: 11px; font-weight: normal; margin-top: 2px; }
  .header h3 { font-size: 10px; font-weight: normal; margin-top: 2px; color: #444; }
  .draft-banner { background: #fff3cd; border: 1px solid #f0ad4e; text-align: center; padding: 4px; font-weight: bold; font-size: 10px; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  td, th { border: 1px solid #333; padding: 4px 6px; vertical-align: top; }
  th { background: #e8e8e8; font-weight: bold; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; width: 38%; }
  .section-header { background: #222; color: #fff; font-weight: bold; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; padding: 4px 6px; }
  .item-header { background: #555; color: #fff; font-size: 9px; padding: 3px 6px; font-weight: bold; }
  .value { font-size: 10px; }
  .item-num { font-weight: bold; color: #444; font-size: 9px; }
  .sig-row { height: 36px; }
  .footer { margin-top: 10px; font-size: 8px; color: #666; text-align: right; }
  .marpol-note { font-size: 8px; color: #555; font-style: italic; margin-bottom: 6px; padding: 4px 6px; border-left: 3px solid #888; }
</style>
</head>
<body>
<div class="page">
  ${mode === "draft" ? '<div class="draft-banner">⚠ DRAFT — NOT FOR SUBMISSION</div>' : ""}

  <div class="header">
    <div class="form-no">USCG Form CG-4602A (Rev. 04-19)</div>
    <h1>Oil Record Book — Part I</h1>
    <h2>Machinery Space Operations</h2>
    <h3>Required under MARPOL 73/78 Annex I · 33 CFR 151.25</h3>
  </div>

  <!-- Vessel Particulars -->
  <table>
    <tr><td class="section-header" colspan="4">Vessel Particulars</td></tr>
    <tr>
      <th>Name of Ship</th><td class="value">${val(fields, "vessel_name")}</td>
      <th>Official No.</th><td class="value">${val(fields, "official_number")}</td>
    </tr>
    <tr>
      <th>IMO Number</th><td class="value">${val(fields, "imo_number")}</td>
      <th>Gross Tonnage</th><td class="value">${val(fields, "gross_tonnage")}</td>
    </tr>
    <tr>
      <th>Owner / Operator</th><td class="value" colspan="3">${val(fields, "owner")}</td>
    </tr>
  </table>

  <!-- Entry Details -->
  <table>
    <tr><td class="section-header" colspan="4">Entry Details</td></tr>
    <tr>
      <th>Date of Entry</th><td class="value">${val(fields, "entry_date")}</td>
      <th>Responsible Officer</th><td class="value">${val(fields, "engineer_name")}</td>
    </tr>
    <tr>
      <th>Rank</th><td class="value">${val(fields, "engineer_rank")}</td>
      <th>Operation Type</th><td class="value">Section C — Collection of Oil Residues (Sludge)</td>
    </tr>
  </table>

  <!-- Sludge Tank -->
  <table>
    <tr><td class="section-header" colspan="4">Sludge Tank Particulars</td></tr>
    <tr>
      <th>Tank Identity</th><td class="value">${val(fields, "sludge_tank_id")}</td>
      <th>Tank Capacity (m³)</th><td class="value">${val(fields, "sludge_tank_capacity")}</td>
    </tr>
  </table>

  <!-- Section C: Sludge Collection -->
  <table>
    <tr><td class="section-header" colspan="2">Section C — Oil Residues (Sludge)</td></tr>
    <tr>
      <td class="item-header" colspan="2">Item 11 — Quantity of Residues</td>
    </tr>
    <tr>
      <th><span class="item-num">11.3</span> Total retention quantity (m³)</th>
      <td class="value">${val(fields, "total_retention_m3")}</td>
    </tr>
    <tr>
      <th><span class="item-num">11.4</span> Manual collection during period (m³)</th>
      <td class="value">${val(fields, "manual_collection_m3")}</td>
    </tr>
    <tr>
      <td class="item-header" colspan="2">Item 12 — Transfer / Disposal</td>
    </tr>
    <tr>
      <th><span class="item-num">12</span> Disposal record</th>
      <td class="value">${val(fields, "disposal_record")}</td>
    </tr>
  </table>

  <div class="marpol-note">
    This entry is made in compliance with MARPOL 73/78 Annex I Regulation 17 and 33 CFR 151.25.
    All quantities are in cubic meters (m³).
  </div>

  <!-- Signature -->
  <table>
    <tr><td class="section-header" colspan="4">Officer's Declaration</td></tr>
    <tr class="sig-row">
      <th>Signature of Officer in Charge</th>
      <td class="value">${mode === "final" ? val(fields, "engineer_name") : ""}</td>
      <th>Date</th>
      <td class="value">${mode === "final" ? date : ""}</td>
    </tr>
    <tr class="sig-row">
      <th>Master's Countersignature</th>
      <td class="value"></td>
      <th>Date</th>
      <td class="value"></td>
    </tr>
  </table>

  <div class="footer">Generated by BlueCore · ${date} · ${mode === "final" ? "FINAL" : "DRAFT"}</div>
</div>
</body>
</html>`;
}
