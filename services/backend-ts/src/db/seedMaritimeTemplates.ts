import { createDocumentTemplate, getDocumentTemplateByCode } from "../store/documentStore";

const templates = [
  {
    code: "engine-room-log-v1",
    name: "Engine Room Log",
    description: "Watch-period engine room log for engineers. Covers main engine readings, fuel, pressures, temperatures, incidents, and handoff.",
    schema: {
      fields: [
        // Pre-filled from user profile
        { name: "vessel_name",     label: "Vessel Name",         type: "text", required: true,  prompt: "What is the vessel name?" },
        { name: "official_number", label: "Official Number",     type: "text", required: true,  prompt: "What is the vessel official number?" },
        { name: "imo_number",      label: "IMO Number",          type: "text", required: true,  prompt: "What is the IMO number?" },
        { name: "gross_tonnage",   label: "Gross Tonnage",       type: "text", required: true,  prompt: "What is the gross tonnage?" },
        { name: "flag",            label: "Flag State",          type: "text", required: true,  prompt: "What is the flag state?" },
        { name: "watch_date",      label: "Watch Date",          type: "text", required: true,  prompt: "What date is this log for?" },
        { name: "watch_period",    label: "Watch Period",        type: "text", required: true,  prompt: "What is the watch period?" },
        { name: "engineer_name",   label: "Engineer Name",       type: "text", required: true,  prompt: "What is the engineer's name?" },
        { name: "engineer_rank",   label: "Engineer Rank",       type: "text", required: true,  prompt: "What is your rank?" },
        { name: "main_engine_type",label: "Main Engine Type",    type: "text", required: true,  prompt: "What type of main engine does the vessel have?" },
        { name: "fuel_type",       label: "Fuel Type",           type: "text", required: true,  prompt: "What fuel type is in use?" },
        // Asked by AI
        { name: "avg_rpm",         label: "Average RPM",         type: "text", required: true,  prompt: "What was the average RPM across the watch?" },
        { name: "engine_load",     label: "Engine Load",         type: "text", required: true,  prompt: "What was the engine load percentage?" },
        { name: "fuel_consumption",label: "Fuel Consumption",    type: "text", required: true,  prompt: "What was the total fuel consumption for the watch in metric tons?" },
        { name: "hfo_rob",         label: "HFO Remaining on Board", type: "text", required: true, prompt: "What is the heavy fuel oil remaining on board in metric tons?" },
        { name: "jcw_pressure",    label: "JCW Pressure",        type: "text", required: true,  prompt: "What was the jacket cooling water pressure?" },
        { name: "lube_oil_pressure",label: "Lube Oil Pressure",  type: "text", required: true,  prompt: "What was the lube oil bearing pressure?" },
        { name: "exhaust_temps",   label: "Exhaust Temperatures",type: "text", required: true,  prompt: "What were the exhaust temperatures across all units?" },
        { name: "handoff_to",      label: "Watch Handoff",       type: "text", required: true,  prompt: "Who did you hand off the watch to, and at what time?" },
        { name: "incidents",       label: "Incidents / Alarms",  type: "textarea", required: false, prompt: "Any incidents, alarms, or machinery observations from the watch?" },
      ]
    }
  },
  {
    code: "oil-record-book-v1",
    name: "Oil Record Book Part I",
    description: "USCG CG-4602A — Machinery Space Operations. Section C: Collection of oil residues (sludge). Required daily under MARPOL 73/78 Annex I and 33 CFR 151.25.",
    schema: {
      fields: [
        // Pre-filled from user profile
        { name: "vessel_name",           label: "Vessel Name",              type: "text", required: true,  prompt: "What is the vessel name?" },
        { name: "official_number",       label: "Official Number",          type: "text", required: true,  prompt: "What is the vessel official number?" },
        { name: "imo_number",            label: "IMO Number",               type: "text", required: true,  prompt: "What is the IMO number?" },
        { name: "gross_tonnage",         label: "Gross Tonnage",            type: "text", required: true,  prompt: "What is the gross tonnage?" },
        { name: "owner",                 label: "Owner / Operator",         type: "text", required: true,  prompt: "Who is the vessel owner or operator?" },
        { name: "entry_date",            label: "Entry Date",               type: "text", required: true,  prompt: "What date is this entry for?" },
        { name: "engineer_name",         label: "Responsible Officer",      type: "text", required: true,  prompt: "Who is the responsible officer for this entry?" },
        { name: "engineer_rank",         label: "Rank",                     type: "text", required: true,  prompt: "What is your rank?" },
        { name: "sludge_tank_id",        label: "Sludge Tank Identity",     type: "text", required: true,  prompt: "What is the sludge tank identity?" },
        { name: "sludge_tank_capacity",  label: "Sludge Tank Capacity (m³)",type: "text", required: true,  prompt: "What is the sludge tank capacity in cubic meters?" },
        // Asked by AI
        { name: "total_retention_m3",    label: "Total Retention (m³)",     type: "text", required: true,  prompt: "What is the total quantity of sludge currently retained on board in cubic meters?" },
        { name: "manual_collection_m3",  label: "Manual Collection (m³)",   type: "text", required: true,  prompt: "Was any sludge collected manually during your watch? If so, how much in cubic meters?" },
        { name: "disposal_record",       label: "Transfer / Disposal",      type: "text", required: true,  prompt: "Any transfer or disposal of sludge to record, or is this a collection-only entry?" },
      ]
    }
  }
];

export function seedMaritimeTemplates() {
  for (const t of templates) {
    if (!getDocumentTemplateByCode(t.code)) {
      createDocumentTemplate({
        code: t.code,
        name: t.name,
        description: t.description,
        schemaJson: JSON.stringify(t.schema)
      });
      console.log(`[seed] Created template: ${t.code}`);
    }
  }
}
