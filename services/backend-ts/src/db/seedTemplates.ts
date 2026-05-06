import { runMigrations } from "./migrate";
import {
  createDocumentTemplate,
  getDocumentTemplateByCode
} from "../store/documentStore";

runMigrations();

const code = "shift-log-v1";

const existing = getDocumentTemplateByCode(code);

if (existing) {
  console.log("Template already exists:", existing);
  process.exit(0);
}

const schema = {
  fields: [
    { name: "vessel_name", label: "Vessel Name", type: "text", required: true },
    { name: "worker_name", label: "Worker Name", type: "text", required: true },
    { name: "role", label: "Role", type: "text", required: true },
    { name: "shift_date", label: "Shift Date", type: "date", required: true },
    { name: "shift_start", label: "Shift Start", type: "time", required: true },
    { name: "shift_end", label: "Shift End", type: "time", required: true },
    { name: "task_summary", label: "Task Summary", type: "textarea", required: true },
    { name: "incidents_observed", label: "Incidents Observed", type: "textarea", required: false },
    { name: "equipment_status", label: "Equipment Status", type: "textarea", required: false },
    { name: "fatigue_level", label: "Fatigue Level", type: "text", required: false },
    { name: "additional_notes", label: "Additional Notes", type: "textarea", required: false }
  ]
};

const created = createDocumentTemplate({
  code,
  name: "Placeholder Shift Log",
  description: "A placeholder shift log template that can be replaced later with a real maritime form.",
  schemaJson: JSON.stringify(schema)
});

console.log("Created template:", created);