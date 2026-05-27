import { google } from "googleapis";
import { env } from "./env";
import { LeadLogRow } from "./types";

const SHEET_RANGE = "Leads!A:L";
const HEADERS = [
  "Timestamp",
  "Telegram User",
  "Chat ID",
  "Lead Text",
  "Decision",
  "Score",
  "Reason",
  "Sector Match",
  "Employee Match",
  "Location Match",
  "Interest Match",
  "Model",
];

function sheetsClient() {
  const auth = new google.auth.JWT({
    email: env.googleClientEmail(),
    key: env.googlePrivateKey(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function ensureSheetHeaders() {
  const sheets = sheetsClient();
  const spreadsheetId = env.googleSheetId();

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Leads!A1:L1",
  }).catch(async (error) => {
    if (String(error?.message || "").includes("Unable to parse range")) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: "Leads" } } }] },
      });
      return { data: { values: [] } };
    }
    throw error;
  });

  if (!existing.data.values?.[0]?.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Leads!A1:L1",
      valueInputOption: "RAW",
      requestBody: { values: [HEADERS] },
    });
  }
}

export async function appendLeadLog(row: LeadLogRow) {
  await ensureSheetHeaders();
  const sheets = sheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: env.googleSheetId(),
    range: SHEET_RANGE,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[
        row.timestamp,
        row.telegramUser,
        row.chatId,
        row.leadText,
        row.decision,
        row.score,
        row.reason,
        row.sectorMatch,
        row.employeeMatch,
        row.locationMatch,
        row.interestMatch,
        row.model,
      ]],
    },
  });
}
