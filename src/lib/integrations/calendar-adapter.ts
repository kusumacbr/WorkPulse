export interface CalendarEventInput {
  title: string;
  description?: string;
  startTime: string; // ISO
  endTime: string; // ISO
  attendeeEmails: string[];
  meetingId?: string;
}

export interface CalendarEventResult {
  success: boolean;
  externalEventId?: string;
  provider: string;
  syncStatus: "SYNCED" | "FAILED";
  error?: string;
}

export interface ICalendarAdapter {
  providerName: string;
  createEvent(event: CalendarEventInput): Promise<CalendarEventResult>;
  deleteEvent(externalEventId: string): Promise<boolean>;
}

export class GoogleCalendarAdapter implements ICalendarAdapter {
  providerName = "GOOGLE_CALENDAR";

  async createEvent(_event: CalendarEventInput): Promise<CalendarEventResult> {
    try {
      // Simulate Google Calendar API Call
      const externalId = `gcal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return {
        success: true,
        externalEventId: externalId,
        provider: this.providerName,
        syncStatus: "SYNCED",
      };
    } catch (err: any) {
      return {
        success: false,
        provider: this.providerName,
        syncStatus: "FAILED",
        error: err.message,
      };
    }
  }

  async deleteEvent(externalEventId: string): Promise<boolean> {
    if (!externalEventId.startsWith("gcal_")) return false;
    return true;
  }
}

export class OutlookCalendarAdapter implements ICalendarAdapter {
  providerName = "MICROSOFT_OUTLOOK";

  async createEvent(_event: CalendarEventInput): Promise<CalendarEventResult> {
    try {
      const externalId = `msout_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return {
        success: true,
        externalEventId: externalId,
        provider: this.providerName,
        syncStatus: "SYNCED",
      };
    } catch (err: any) {
      return {
        success: false,
        provider: this.providerName,
        syncStatus: "FAILED",
        error: err.message,
      };
    }
  }

  async deleteEvent(externalEventId: string): Promise<boolean> {
    if (!externalEventId.startsWith("msout_")) return false;
    return true;
  }
}

export class FailingCalendarAdapter implements ICalendarAdapter {
  providerName = "FAILING_CALENDAR_SERVICE";

  async createEvent(_event: CalendarEventInput): Promise<CalendarEventResult> {
    return {
      success: false,
      provider: this.providerName,
      syncStatus: "FAILED",
      error: "HTTP 503 Service Unavailable: Google/Outlook API outage",
    };
  }

  async deleteEvent(_externalEventId: string): Promise<boolean> {
    return false;
  }
}

/**
 * Graceful Degradation Wrapper:
 * Syncs event to external calendar without ever blocking or throwing inside the parent transaction.
 */
export async function safeSyncToCalendar(
  adapter: ICalendarAdapter,
  event: CalendarEventInput
): Promise<CalendarEventResult> {
  try {
    return await adapter.createEvent(event);
  } catch (err: any) {
    console.warn(`[CalendarAdapter] Non-blocking calendar sync warning (${adapter.providerName}):`, err.message);
    return {
      success: false,
      provider: adapter.providerName,
      syncStatus: "FAILED",
      error: err.message || "Unknown calendar sync error",
    };
  }
}
