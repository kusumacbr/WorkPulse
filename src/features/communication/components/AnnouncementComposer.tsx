"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnnouncementRecord } from "@/server/services/announcement-service";
import {
  Megaphone,
  Plus,
  Bell,
  Eye,
  CheckCircle2,
  Users,
  X,
} from "lucide-react";

interface AnnouncementComposerProps {
  initialAnnouncements?: AnnouncementRecord[];
}

export function AnnouncementComposer({ initialAnnouncements }: AnnouncementComposerProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>(
    initialAnnouncements || [
      {
        id: "ann-1",
        organizationId: "org-xorstack",
        title: "Updated Q3 Engineering Remote Work & Security Guidelines",
        body: "Please review our updated device encryption, VPN compliance, and biometric attendance regularisation guidelines for hybrid teams.",
        category: "POLICY",
        priority: "HIGH",
        audienceType: "ALL",
        publishDate: new Date(Date.now() - 86400000).toISOString(),
        acknowledgementRequired: true,
        channels: ["IN_APP", "SLACK", "EMAIL"],
        authorId: "emp-priya",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        receipts: [
          { employeeId: "emp-sarah", readAt: new Date().toISOString(), acknowledgedAt: new Date().toISOString() },
          { employeeId: "emp-john", readAt: new Date().toISOString(), acknowledgedAt: null },
        ],
      },
    ]
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState<AnnouncementRecord["category"]>("GENERAL");
  const [newPriority, setNewPriority] = useState<AnnouncementRecord["priority"]>("NORMAL");
  const [ackRequired, setAckRequired] = useState(false);

  const handlePublish = () => {
    if (!newTitle || !newBody) return;

    const newAnn: AnnouncementRecord = {
      id: `ann-${Date.now()}`,
      organizationId: "org-xorstack",
      title: newTitle,
      body: newBody,
      category: newCategory,
      priority: newPriority,
      audienceType: "ALL",
      publishDate: new Date().toISOString(),
      acknowledgementRequired: ackRequired,
      channels: ["IN_APP", "SLACK"],
      authorId: "emp-priya",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      receipts: [],
    };

    setAnnouncements((prev) => [newAnn, ...prev]);
    setShowCreateModal(false);
    setNewTitle("");
    setNewBody("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-[var(--brand-primary)]" />
            Company Broadcasts & HR Announcements
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Publish organization-wide notices, policy changes, and birthday highlights with delivery metrics and read receipts.
          </p>
        </div>

        <Button
          variant="brand"
          size="sm"
          className="w-full sm:w-auto text-xs font-semibold gap-1.5 h-8 shrink-0 justify-center"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Publish Announcement
        </Button>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.map((ann) => {
          const totalReads = ann.receipts.length;
          const acks = ann.receipts.filter((r) => r.acknowledgedAt !== null).length;

          return (
            <Card key={ann.id} className="border-border hover:border-border/80 transition-all">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="brand" className="text-[10px] uppercase font-bold">
                        {ann.category}
                      </Badge>
                      {ann.priority === "HIGH" && (
                        <Badge variant="destructive" className="text-[10px]">
                          High Priority
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(ann.publishDate).toLocaleDateString()}
                      </span>
                    </div>

                    <CardTitle className="text-sm font-bold text-foreground">
                      {ann.title}
                    </CardTitle>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-blue-500" />
                      {totalReads} Reads
                    </span>
                    {ann.acknowledgementRequired && (
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {acks} Acknowledged
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 text-xs">
                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{ann.body}</p>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] flex-wrap gap-1">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" /> Audience: {ann.audienceType}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Bell className="h-3 w-3" /> Channels: {ann.channels.join(", ")}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Publish Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <Card className="w-full max-w-md border-border shadow-2xl bg-card max-h-[92vh] overflow-y-auto custom-scrollbar">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-[var(--brand-primary)]" />
                Publish HR Announcement
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowCreateModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Title *</label>
                <Input
                  placeholder="e.g. Q3 Security & Remote Work Policy Update"
                  value={newTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs font-medium"
                  >
                    <option value="GENERAL">General Information</option>
                    <option value="POLICY">Policy Update</option>
                    <option value="BIRTHDAY">Birthday & Welcome</option>
                    <option value="FESTIVAL">Festival & Holiday</option>
                    <option value="COMPANY_NEWS">Company News</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs font-medium"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Announcement Body *</label>
                <Textarea
                  placeholder="Enter full announcement message..."
                  value={newBody}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewBody(e.target.value)}
                  className="text-xs resize-none h-24"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-foreground select-none font-medium">
                  <input
                    type="checkbox"
                    checked={ackRequired}
                    onChange={(e) => setAckRequired(e.target.checked)}
                    className="rounded border-input text-[var(--brand-primary)]"
                  />
                  <span>Require mandatory employee read acknowledgement</span>
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button variant="brand" size="sm" onClick={handlePublish} className="w-full sm:w-auto">
                  Publish & Broadcast
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
