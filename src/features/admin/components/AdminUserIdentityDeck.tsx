"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { AuditService } from "@/lib/audit/audit-service";
import { RoleType } from "@/lib/authorization/types";
import {
  Users,
  Search,
  Lock,
  CheckCircle2,
  Edit2,
  Check,
  X,
} from "lucide-react";

interface AdminUserRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  roles: RoleType[];
  status: "ACTIVE" | "SUSPENDED" | "INVITED" | "ARCHIVED";
  managerName?: string;
  managerId?: string;
  passkeyRegistered: boolean;
  lastActiveAt: string;
}

const INITIAL_ADMIN_USERS: AdminUserRecord[] = [
  {
    id: "emp-david",
    userId: "user-david",
    name: "David Admin",
    email: "admin@xorstack.com",
    department: "Executive & IT",
    designation: "IT SuperAdmin & SecOps Lead",
    roles: ["ADMIN", "EMPLOYEE"],
    status: "ACTIVE",
    managerName: "None (Executive Root)",
    passkeyRegistered: true,
    lastActiveAt: "Just now",
  },
  {
    id: "emp-rachel",
    userId: "user-rachel",
    name: "Rachel Green",
    email: "hr.rachel@xorstack.com",
    department: "People Operations",
    designation: "People Operations Lead",
    roles: ["HR", "EMPLOYEE"],
    status: "ACTIVE",
    managerName: "Victoria Director",
    managerId: "emp-victoria",
    passkeyRegistered: true,
    lastActiveAt: "10m ago",
  },
  {
    id: "emp-victoria",
    userId: "user-victoria",
    name: "Victoria Director",
    email: "victoria.director@xorstack.com",
    department: "Executive & IT",
    designation: "Director of Operations",
    roles: ["MANAGER", "EMPLOYEE"],
    status: "ACTIVE",
    managerName: "David Admin",
    managerId: "emp-david",
    passkeyRegistered: true,
    lastActiveAt: "25m ago",
  },
  {
    id: "emp-alex",
    userId: "user-alex",
    name: "Alex Lead",
    email: "lead.alex@xorstack.com",
    department: "Development",
    designation: "VP of Engineering & Team Lead",
    roles: ["MANAGER", "EMPLOYEE"],
    status: "ACTIVE",
    managerName: "Victoria Director",
    managerId: "emp-victoria",
    passkeyRegistered: true,
    lastActiveAt: "4m ago",
  },
  {
    id: "emp-maya",
    userId: "user-maya",
    name: "Dr. Maya Chen",
    email: "maya.rd@xorstack.com",
    department: "R & D",
    designation: "Principal AI Scientist & Lead",
    roles: ["MANAGER", "EMPLOYEE"],
    status: "ACTIVE",
    managerName: "Alex Lead",
    managerId: "emp-alex",
    passkeyRegistered: true,
    lastActiveAt: "1h ago",
  },
  {
    id: "emp-sarah",
    userId: "user-sarah",
    name: "Sarah Dev",
    email: "dev.sarah@xorstack.com",
    department: "Development",
    designation: "Senior Full-Stack Engineer",
    roles: ["EMPLOYEE"],
    status: "ACTIVE",
    managerName: "Alex Lead",
    managerId: "emp-alex",
    passkeyRegistered: true,
    lastActiveAt: "2m ago",
  },
  {
    id: "emp-farhan",
    userId: "user-farhan",
    name: "Farhan Ali",
    email: "farhan.ai@xorstack.com",
    department: "R & D",
    designation: "AI Research Engineer",
    roles: ["EMPLOYEE"],
    status: "ACTIVE",
    managerName: "Dr. Maya Chen",
    managerId: "emp-maya",
    passkeyRegistered: false,
    lastActiveAt: "Yesterday",
  },
];

export function AdminUserIdentityDeck() {
  const [users, setUsers] = useState<AdminUserRecord[]>(INITIAL_ADMIN_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Toggle user role
  const handleToggleRole = async (user: AdminUserRecord, role: RoleType) => {
    const hasRole = user.roles.includes(role);
    let newRoles: RoleType[];

    if (hasRole) {
      // Must retain at least EMPLOYEE
      if (role === "EMPLOYEE") {
        showToast("Cannot remove base EMPLOYEE role.");
        return;
      }
      newRoles = user.roles.filter((r) => r !== role);
    } else {
      newRoles = [...user.roles, role];
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, roles: newRoles } : u))
    );

    // Record audit log
    await AuditService.record({
      actorId: "user-david",
      action: "role_change",
      entity: "UserRole",
      entityId: user.userId,
      reason: `Admin updated roles for ${user.name}: [${newRoles.join(", ")}]`,
      beforeState: { roles: user.roles },
      afterState: { roles: newRoles },
    });

    showToast(`Role [${role}] ${hasRole ? "revoked from" : "granted to"} ${user.name}. ✓`);
  };

  // Force Session Revocation (Emergency Kill Switch)
  const handleRevokeSession = async (user: AdminUserRecord) => {
    await AuditService.record({
      actorId: "user-david",
      action: "session_revoked",
      entity: "Session",
      entityId: user.userId,
      reason: `Admin emergency session revocation for ${user.name}`,
    });

    showToast(`All active sessions terminated for ${user.name}! 🔒`);
  };

  // Toggle Account Suspension
  const handleToggleSuspension = async (user: AdminUserRecord) => {
    const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );

    await AuditService.record({
      actorId: "user-david",
      action: "account_status_change",
      entity: "User",
      entityId: user.userId,
      reason: `Admin changed account status to ${newStatus}`,
      beforeState: { status: user.status },
      afterState: { status: newStatus },
    });

    showToast(`Account for ${user.name} set to ${newStatus}.`);
  };

  // Save Manager Assignment
  const handleSaveManager = async (user: AdminUserRecord) => {
    const mgr = users.find((u) => u.id === selectedManagerId);
    const newManagerName = mgr ? mgr.name : "None (Unassigned)";

    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, managerName: newManagerName, managerId: selectedManagerId || undefined }
          : u
      )
    );

    await AuditService.record({
      actorId: "user-david",
      action: "manager_assignment_updated",
      entity: "ManagerAssignment",
      entityId: user.id,
      reason: `Admin reassigned reporting manager of ${user.name} to ${newManagerName}`,
    });

    setEditingUserId(null);
    showToast(`Reporting manager for ${user.name} updated to ${newManagerName}! ✓`);
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "ALL" || u.roles.includes(filterRole as any);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Roster & RBAC Management Card */}
      <Interactive3DCard className="p-6 border border-purple-500/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              Identity, Role Governance & Reporting Lines ({filteredUsers.length} Users)
            </h3>
            <p className="text-xs text-muted-foreground">
              Manage RBAC role assignments, force-terminate compromised sessions, and reassign ManagerAssignment reporting lines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-44">
              <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user..."
                className="h-8 text-xs pl-8"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="h-8 px-2.5 rounded-md border border-input bg-card text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="HR">HR</option>
              <option value="MANAGER">MANAGER</option>
              <option value="EMPLOYEE">EMPLOYEE</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto rounded-xl border border-border/80 bg-card/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/60">
              <tr>
                <th className="p-3">User & Email</th>
                <th className="p-3">Department & Role</th>
                <th className="p-3">Reporting Line (Manager)</th>
                <th className="p-3">Assigned RBAC Roles</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Security Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                  {/* User & Email */}
                  <td className="p-3">
                    <div className="font-bold text-foreground">{user.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{user.email}</div>
                  </td>

                  {/* Department & Role */}
                  <td className="p-3">
                    <div className="text-cyan-400 font-medium">{user.department}</div>
                    <div className="text-[11px] text-muted-foreground">{user.designation}</div>
                  </td>

                  {/* ManagerAssignment */}
                  <td className="p-3">
                    {editingUserId === user.id ? (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={selectedManagerId}
                          onChange={(e) => setSelectedManagerId(e.target.value)}
                          className="h-7 px-2 rounded border border-input bg-card text-[11px] font-semibold text-foreground focus:outline-none"
                        >
                          <option value="">None (Unassigned)</option>
                          {users
                            .filter((u) => u.id !== user.id)
                            .map((mgr) => (
                              <option key={mgr.id} value={mgr.id}>
                                {mgr.name} ({mgr.department})
                              </option>
                            ))}
                        </select>
                        <Button
                          size="sm"
                          variant="brand"
                          onClick={() => handleSaveManager(user)}
                          className="h-7 px-2 text-[10px] bg-emerald-500 hover:bg-emerald-600 text-black"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUserId(null)}
                          className="h-7 px-2 text-[10px]"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-[11px]">
                          {user.managerName || "None"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUserId(user.id);
                            setSelectedManagerId(user.managerId || "");
                          }}
                          className="text-muted-foreground hover:text-cyan-400 p-0.5"
                          title="Edit Manager"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* RBAC Role Badges & Toggles */}
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-1">
                      {(["ADMIN", "HR", "MANAGER", "EMPLOYEE"] as RoleType[]).map((r) => {
                        const active = user.roles.includes(r);
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => handleToggleRole(user, r)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                              active
                                ? r === "ADMIN"
                                  ? "bg-red-500/20 text-red-300 border-red-500/40"
                                  : r === "HR"
                                  ? "bg-pink-500/20 text-pink-300 border-pink-500/40"
                                  : r === "MANAGER"
                                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                                  : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                                : "bg-muted/30 text-muted-foreground/40 border-border/50 hover:text-foreground"
                            }`}
                            title={`Click to toggle ${r} role`}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-3 text-center">
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-bold ${
                        user.status === "ACTIVE"
                          ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                          : "border-rose-500/40 text-rose-400 bg-rose-500/10"
                      }`}
                    >
                      {user.status}
                    </Badge>
                  </td>

                  {/* Security Actions */}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeSession(user)}
                        className="text-[10px] h-6 px-2 border-border text-muted-foreground hover:text-rose-400 gap-1"
                        title="Force revoke all active web and API sessions"
                      >
                        <Lock className="h-2.5 w-2.5" />
                        <span>Kill Sessions</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleSuspension(user)}
                        className={`text-[10px] h-6 px-2 ${
                          user.status === "ACTIVE"
                            ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                            : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        }`}
                      >
                        {user.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Interactive3DCard>
    </div>
  );
}
