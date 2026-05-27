import { z } from "zod";

export const LeadQualificationSchema = z.object({
  decision: z.enum(["cualificado", "no_cualificado"]),
  score: z.number().int().min(0).max(100),
  reason: z.string().min(10).max(600),
  criteria: z.object({
    sector_match: z.boolean(),
    employee_match: z.boolean(),
    location_match: z.boolean(),
    interest_match: z.boolean(),
  }),
});

export type LeadQualification = z.infer<typeof LeadQualificationSchema>;

export type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    text?: string;
    date?: number;
    chat: {
      id: number;
      type: string;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
    from?: {
      id: number;
      is_bot: boolean;
      username?: string;
      first_name?: string;
      last_name?: string;
      language_code?: string;
    };
  };
};

export type LeadLogRow = {
  timestamp: string;
  telegramUser: string;
  chatId: string;
  leadText: string;
  decision: string;
  score: number | string;
  reason: string;
  sectorMatch: boolean | string;
  employeeMatch: boolean | string;
  locationMatch: boolean | string;
  interestMatch: boolean | string;
  model: string;
};
