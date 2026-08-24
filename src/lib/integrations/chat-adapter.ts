export interface ChatMessageInput {
  title: string;
  body: string;
  category: "ANNOUNCEMENT" | "BLOCKER" | "APPROVAL" | "BADGE" | "PIP_ALERT" | "PRIVATE_FEEDBACK" | "GENERAL";
  isConfidential?: boolean;
  deepLinkUrl?: string;
}

export interface ChatMessageResult {
  success: boolean;
  channelOrRecipient: string;
  provider: string;
  wasSanitizedForPrivacy: boolean;
  error?: string;
}

export interface IChatAdapter {
  providerName: string;
  sendChannelMessage(channelName: string, message: ChatMessageInput): Promise<ChatMessageResult>;
  sendDirectMessage(userEmail: string, message: ChatMessageInput): Promise<ChatMessageResult>;
}

export class SlackAdapter implements IChatAdapter {
  providerName = "SLACK";

  async sendChannelMessage(channelName: string, message: ChatMessageInput): Promise<ChatMessageResult> {
    if (message.isConfidential || message.category === "PIP_ALERT" || message.category === "PRIVATE_FEEDBACK") {
      return {
        success: true,
        channelOrRecipient: channelName,
        provider: this.providerName,
        wasSanitizedForPrivacy: true,
      };
    }

    return {
      success: true,
      channelOrRecipient: channelName,
      provider: this.providerName,
      wasSanitizedForPrivacy: false,
    };
  }

  async sendDirectMessage(userEmail: string, _message: ChatMessageInput): Promise<ChatMessageResult> {
    return {
      success: true,
      channelOrRecipient: userEmail,
      provider: this.providerName,
      wasSanitizedForPrivacy: false,
    };
  }
}

export class TeamsAdapter implements IChatAdapter {
  providerName = "MS_TEAMS";

  async sendChannelMessage(channelName: string, message: ChatMessageInput): Promise<ChatMessageResult> {
    if (message.isConfidential || message.category === "PIP_ALERT" || message.category === "PRIVATE_FEEDBACK") {
      return {
        success: true,
        channelOrRecipient: channelName,
        provider: this.providerName,
        wasSanitizedForPrivacy: true,
      };
    }

    return {
      success: true,
      channelOrRecipient: channelName,
      provider: this.providerName,
      wasSanitizedForPrivacy: false,
    };
  }

  async sendDirectMessage(userEmail: string, _message: ChatMessageInput): Promise<ChatMessageResult> {
    return {
      success: true,
      channelOrRecipient: userEmail,
      provider: this.providerName,
      wasSanitizedForPrivacy: false,
    };
  }
}

export class FailingChatAdapter implements IChatAdapter {
  providerName = "FAILING_CHAT_SERVICE";

  async sendChannelMessage(channelName: string, _message: ChatMessageInput): Promise<ChatMessageResult> {
    return {
      success: false,
      channelOrRecipient: channelName,
      provider: this.providerName,
      wasSanitizedForPrivacy: false,
      error: "HTTP 500 Webhook Connection Refused (Slack/Teams Outage)",
    };
  }

  async sendDirectMessage(userEmail: string, _message: ChatMessageInput): Promise<ChatMessageResult> {
    return {
      success: false,
      channelOrRecipient: userEmail,
      provider: this.providerName,
      wasSanitizedForPrivacy: false,
      error: "HTTP 500 Webhook Connection Refused (Slack/Teams Outage)",
    };
  }
}

/**
 * Graceful Degradation Wrapper:
 * Dispatches chat messages without ever breaking internal transaction execution.
 */
export async function safeNotifyChat(
  adapter: IChatAdapter,
  destination: { type: "CHANNEL" | "DM"; target: string },
  message: ChatMessageInput
): Promise<ChatMessageResult> {
  try {
    if (destination.type === "CHANNEL") {
      return await adapter.sendChannelMessage(destination.target, message);
    } else {
      return await adapter.sendDirectMessage(destination.target, message);
    }
  } catch (err: any) {
    console.warn(`[ChatAdapter] Non-blocking chat dispatch warning (${adapter.providerName}):`, err.message);
    return {
      success: false,
      channelOrRecipient: destination.target,
      provider: adapter.providerName,
      wasSanitizedForPrivacy: false,
      error: err.message || "Unknown chat dispatch error",
    };
  }
}
