import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/server/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Universal Server-Side Admin Sync Handler
 * Executes mutations directly with SUPABASE_SERVICE_ROLE_KEY to bypass Row Level Security (RLS)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, table, record, id, filter, employeeId, startDate, workDate } = body;

    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return apiSuccess({ success: true, mocked: true, message: "Supabase admin client unavailable, offline mode." });
    }

    switch (action) {
      case "upsert": {
        if (!table || !record) {
          return apiError("Missing 'table' or 'record' for upsert", 400);
        }
        const { data, error } = await supabaseAdmin.from(table).upsert(record);
        if (error) {
          console.error(`[Supabase Admin Sync] Upsert error on '${table}':`, error.message);
          return apiError(error.message, 500);
        }
        return apiSuccess({ success: true, data, message: `Record upserted in '${table}'` });
      }

      case "insert": {
        if (!table || !record) {
          return apiError("Missing 'table' or 'record' for insert", 400);
        }
        const { data, error } = await supabaseAdmin.from(table).insert(record);
        if (error) {
          console.error(`[Supabase Admin Sync] Insert error on '${table}':`, error.message);
          return apiError(error.message, 500);
        }
        return apiSuccess({ success: true, data, message: `Record inserted in '${table}'` });
      }

      case "update": {
        if (!table || !id || !record) {
          return apiError("Missing 'table', 'id', or 'record' for update", 400);
        }
        const { data, error } = await supabaseAdmin.from(table).update(record).eq("id", id);
        if (error) {
          console.error(`[Supabase Admin Sync] Update error on '${table}':`, error.message);
          return apiError(error.message, 500);
        }
        return apiSuccess({ success: true, data, message: `Record updated in '${table}'` });
      }

      case "delete": {
        if (!table) {
          return apiError("Missing 'table' for delete", 400);
        }
        let query = supabaseAdmin.from(table).delete();
        if (id) {
          query = query.eq("id", id);
        } else if (filter && typeof filter === "object") {
          query = query.match(filter);
        } else {
          return apiError("Missing 'id' or 'filter' for delete", 400);
        }
        const { data, error } = await query;
        if (error) {
          console.error(`[Supabase Admin Sync] Delete error on '${table}':`, error.message);
          return apiError(error.message, 500);
        }

        // If deleting a leave or wfh request, also delete by employee_id + start_date to catch any duplicates
        if ((table === "leave_requests" || table === "wfh_requests") && employeeId && startDate) {
          try {
            await supabaseAdmin.from(table).delete().eq("employee_id", employeeId).eq("start_date", startDate);
          } catch {}
        }

        return apiSuccess({ success: true, data, message: `Record deleted from '${table}'` });
      }

      case "delete_employee": {
        const empId = id || record?.id;
        const empEmail = record?.email;
        if (!empId) return apiError("Missing employee 'id'", 400);

        const idOrEmailFilter = empEmail
          ? `id.eq.${empId},email.eq.${empEmail}`
          : `id.eq.${empId},email.eq.${empId}`;
        const empIdOrEmailFilter = empEmail
          ? `employee_id.eq.${empId},employee_id.eq.${empEmail}`
          : `employee_id.eq.${empId},employee_id.eq.${empId}`;

        // Cascade delete related records across all child tables and clear manager links
        await Promise.allSettled([
          supabaseAdmin.from("leave_requests").delete().or(empIdOrEmailFilter),
          supabaseAdmin.from("wfh_requests").delete().or(empIdOrEmailFilter),
          supabaseAdmin.from("workdays").delete().or(empIdOrEmailFilter),
          supabaseAdmin.from("biometric_punches").delete().or(empIdOrEmailFilter),
          supabaseAdmin.from("feedbacks").delete().or(empIdOrEmailFilter),
          supabaseAdmin.from("regularization_requests").delete().or(empIdOrEmailFilter),
          supabaseAdmin.from("daily_tasks").delete().or(empIdOrEmailFilter),
          supabaseAdmin.from("notifications").delete().or(`user_id.eq.${empId},user_id.eq.${empEmail || empId}`),
          supabaseAdmin.from("profiles").delete().or(idOrEmailFilter),
          supabaseAdmin.from("employees").update({ manager_id: null, manager_name: null }).or(`manager_id.eq.${empId},manager_id.eq.${empEmail || empId}`),
        ]);
        const { data, error } = await supabaseAdmin.from("employees").delete().or(idOrEmailFilter);
        if (error) console.warn("[Supabase Admin Sync] Employee delete warning:", error.message);
        try {
          await supabaseAdmin.from("profiles").delete().or(idOrEmailFilter);
        } catch {}
        return apiSuccess({ success: true, data, message: `Employee '${empId}' and all associated records permanently deleted.` });
      }

      case "delete_sod": {
        const targetEmp = employeeId || id;
        const targetDate = workDate || startDate || new Date().toISOString().split("T")[0]!;
        if (!targetEmp) return apiError("Missing employeeId for delete_sod", 400);
        await supabaseAdmin.from("workdays").delete().match({ employee_id: targetEmp, date: targetDate });
        return apiSuccess({ success: true, message: `SOD for employee '${targetEmp}' on ${targetDate} deleted.` });
      }

      case "delete_eod": {
        const targetEmp = employeeId || id;
        const targetDate = workDate || startDate || new Date().toISOString().split("T")[0]!;
        if (!targetEmp) return apiError("Missing employeeId for delete_eod", 400);
        await supabaseAdmin.from("workdays").update({
          eod_status: null,
          eod_time: null,
          eod_verified_by: null,
          eod_verified_at: null,
          lead_rating: null,
          lead_feedback_note: null,
          lead_action_item: null,
          achievements: null,
          blockers: null,
          tomorrow_focus: null,
          overall_progress: null,
        }).match({ employee_id: targetEmp, date: targetDate });
        return apiSuccess({ success: true, message: `EOD for employee '${targetEmp}' on ${targetDate} reset.` });
      }

      case "update_employee": {
        const empId = id || record?.id;
        if (!empId) return apiError("Missing employee 'id'", 400);

        const name = record?.name;
        const email = record?.email;
        const department = record?.department || record?.departmentName;
        const departmentId = record?.department_id || record?.departmentId || "dept-development";
        const designation = record?.role_title || record?.designation;
        const workMode = record?.work_mode || record?.workMode;
        const leaveBalance = record?.leave_balance ?? record?.remainingLeaveBalance;
        const location = record?.location || record?.workLocation;
        const phoneNumber = record?.phone_number || record?.phoneNumber;
        const status = record?.status || "ACTIVE";
        const employmentType = record?.employment_type || record?.employmentType || "Full-Time";
        const managerId = record?.manager_id || record?.teamLeadId;
        const managerName = record?.manager_name || record?.teamLeadName;

        const idOrEmailFilter = email
          ? `id.eq.${empId},email.eq.${email}`
          : `id.eq.${empId},email.eq.${empId}`;
        const empIdOrEmailFilter = email
          ? `employee_id.eq.${empId},employee_id.eq.${email}`
          : `employee_id.eq.${empId},employee_id.eq.${empId}`;

        // 1. Try update first on matching rows by id OR email in public.employees
        const updatePayload: any = {
          updated_at: new Date().toISOString(),
        };
        if (name !== undefined) updatePayload.name = name;
        if (email !== undefined) updatePayload.email = email;
        if (designation !== undefined) updatePayload.role_title = designation;
        if (department !== undefined) updatePayload.department = department;
        if (departmentId !== undefined) updatePayload.department_id = departmentId;
        if (workMode !== undefined) updatePayload.work_mode = workMode;
        if (status !== undefined) updatePayload.status = status;
        if (employmentType !== undefined) updatePayload.employment_type = employmentType;
        if (managerId !== undefined) updatePayload.manager_id = managerId;
        if (managerName !== undefined) updatePayload.manager_name = managerName;
        if (phoneNumber !== undefined) updatePayload.phone_number = phoneNumber;
        if (location !== undefined) updatePayload.location = location;
        if (leaveBalance !== undefined) updatePayload.leave_balance = leaveBalance;

        const { data: updatedRows, error: updateErr } = await supabaseAdmin
          .from("employees")
          .update(updatePayload)
          .or(idOrEmailFilter)
          .select();

        if (updateErr || !updatedRows || updatedRows.length === 0) {
          // Fallback to upsert if row does not exist yet
          await supabaseAdmin.from("employees").upsert({
            id: empId,
            name: name || "Employee",
            email: email || `${empId}@xorstack.com`,
            role_title: designation || "Engineer",
            department: department || "Development",
            department_id: departmentId,
            work_mode: workMode || "OFFICE",
            status: status || "ACTIVE",
            employment_type: employmentType,
            manager_id: managerId,
            manager_name: managerName,
            phone_number: phoneNumber,
            location,
            leave_balance: leaveBalance !== undefined ? leaveBalance : 12.0,
            updated_at: new Date().toISOString(),
          });
        }

        // 2. Cascade update to public.profiles
        if (email || name) {
          try {
            await supabaseAdmin.from("profiles").update({
              ...(name ? { full_name: name } : {}),
              ...(department ? { department } : {}),
              ...(designation ? { designation } : {}),
              updated_at: new Date().toISOString(),
            }).or(idOrEmailFilter);
          } catch {}
        }

        // 3. Cascade update to all other connected tables
        const cascadeTasks: Promise<any>[] = [];

        // employees (update reportees' manager_name if this employee is a manager)
        if (name) {
          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("employees").update({
                manager_name: name,
              }).or(`manager_id.eq.${empId},manager_id.eq.${email || empId}`)
            )
          );
        }

        // workdays
        cascadeTasks.push(
          Promise.resolve(
            supabaseAdmin.from("workdays").update({
              ...(name ? { employee_name: name } : {}),
              ...(department ? { department_name: department } : {}),
              ...(workMode ? { work_mode: workMode } : {}),
              updated_at: new Date().toISOString(),
            }).or(empIdOrEmailFilter)
          )
        );

        // leave_requests
        cascadeTasks.push(
          Promise.resolve(
            supabaseAdmin.from("leave_requests").update({
              ...(name ? { employee_name: name } : {}),
              ...(email ? { employee_email: email } : {}),
              ...(department ? { department_name: department } : {}),
              ...(departmentId ? { department_id: departmentId } : {}),
              ...(designation ? { designation } : {}),
              updated_at: new Date().toISOString(),
            }).or(empIdOrEmailFilter)
          )
        );

        // wfh_requests
        cascadeTasks.push(
          Promise.resolve(
            supabaseAdmin.from("wfh_requests").update({
              ...(name ? { employee_name: name } : {}),
              ...(email ? { employee_email: email } : {}),
              ...(department ? { department_name: department } : {}),
              ...(departmentId ? { department_id: departmentId } : {}),
              ...(designation ? { designation } : {}),
              updated_at: new Date().toISOString(),
            }).or(empIdOrEmailFilter)
          )
        );

        // biometric_punches
        if (name) {
          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("biometric_punches").update({
                employee_name: name,
              }).or(empIdOrEmailFilter)
            )
          );
        }

        // feedbacks
        if (name) {
          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("feedbacks").update({
                employee_name: name,
              }).or(empIdOrEmailFilter)
            )
          );
          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("feedbacks").update({
                lead_name: name,
              }).or(`lead_id.eq.${empId},lead_id.eq.${email || empId}`)
            )
          );
        }

        // regularization_requests
        cascadeTasks.push(
          Promise.resolve(
            supabaseAdmin.from("regularization_requests").update({
              ...(name ? { employee_name: name } : {}),
              ...(department ? { department_name: department } : {}),
              ...(designation ? { designation } : {}),
            }).or(empIdOrEmailFilter)
          )
        );

        await Promise.allSettled(cascadeTasks);

        return apiSuccess({
          success: true,
          message: `Employee '${empId}' updated and cascaded across profiles, workdays, leave_requests, wfh_requests, biometric_punches, feedbacks, and regularization_requests.`
        });
      }

      case "sync_goal": {
        const goal = record;
        if (!goal || !goal.id) return apiError("Missing goal record or goal.id", 400);

        const goalId = goal.id;
        const title = goal.title || "Goal";
        const desc = goal.description || "";
        const targetEmp = goal.employeeId || employeeId || "emp-sarah";
        const empName = goal.employeeName || "Sarah Dev";
        const status = goal.status || "IN_PROGRESS";
        const progress = Number(goal.progressPercentage ?? goal.progress) || 0;
        const category = goal.category || "ENGINEERING";
        const outcome = goal.measurableOutcome || "Achieve target deliverables";

        // Persist goal to public.feedbacks with type/sentiment GOAL for executive tracking
        await supabaseAdmin.from("feedbacks").upsert({
          id: `fb-${goalId}`,
          employee_id: targetEmp,
          employee_name: empName,
          lead_id: "lead-alex",
          lead_name: "Alex Lead",
          date: new Date().toISOString().split("T")[0]!,
          rating: progress >= 100 ? 5 : progress >= 50 ? 4 : 3,
          sentiment: status === "COMPLETED" ? "EXCELLENT" : "GOOD",
          notes: `[GOAL - ${category}] ${title}: ${desc} (Progress: ${progress}%)`,
          action_item: `Outcome Target: ${outcome}`,
        });

        // Also persist in today's workday goals snapshot
        const today = new Date().toISOString().split("T")[0]!;
        const { data: existingWd } = await supabaseAdmin
          .from("workdays")
          .select("planned_tasks")
          .match({ employee_id: targetEmp, date: today })
          .maybeSingle();

        const currentTasks: any[] = existingWd?.planned_tasks || [];
        const filteredTasks = currentTasks.filter((t) => t.id !== goalId && t.id !== `goal-${goalId}`);
        filteredTasks.push({
          id: goalId,
          title: `[GOAL] ${title}`,
          description: desc,
          project: category,
          priority: goal.priority || "HIGH",
          taskType: "GOAL",
          status: status,
          completionPercentage: progress,
          expectedOutput: outcome,
        });

        await supabaseAdmin.from("workdays").upsert({
          id: `wd-${targetEmp}-${today}`,
          employee_id: targetEmp,
          employee_name: empName,
          date: today,
          work_mode: "OFFICE",
          planned_tasks: filteredTasks,
        });

        return apiSuccess({ success: true, message: `Goal '${goalId}' permanently synced to Supabase.` });
      }

      case "purge_leaves": {
        let query = supabaseAdmin.from("leave_requests").delete();
        if (employeeId) {
          query = query.eq("employee_id", employeeId);
        } else {
          query = query.neq("id", "__impossible_id__");
        }
        const { error } = await query;
        if (error) console.error("[Supabase Admin Sync] Purge leaves error:", error.message);
        return apiSuccess({ success: true, message: "Leave requests purged from Supabase." });
      }

      case "purge_wfh": {
        let query = supabaseAdmin.from("wfh_requests").delete();
        if (employeeId) {
          query = query.eq("employee_id", employeeId);
        } else {
          query = query.neq("id", "__impossible_id__");
        }
        const { error } = await query;
        if (error) console.error("[Supabase Admin Sync] Purge WFH error:", error.message);
        return apiSuccess({ success: true, message: "WFH requests purged from Supabase." });
      }

      case "broadcast_notification": {
        const notif = record;
        if (!notif) return apiError("Missing notification record", 400);

        await Promise.allSettled([
          supabaseAdmin.from("notifications").insert({
            id: notif.id,
            user_id: notif.userId || notif.user_id,
            actor_id: notif.actorId || notif.actor_id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            link_url: notif.linkUrl || notif.link_url,
            announcement_id: notif.announcementId || notif.announcement_id,
            read: Boolean(notif.read),
            created_at: notif.createdAt || notif.created_at || new Date().toISOString(),
          }),
          supabaseAdmin.from("feedbacks").upsert({
            id: notif.id,
            employee_id: notif.userId || notif.user_id || "all",
            employee_name: notif.title,
            lead_id: "NOTIFICATION",
            lead_name: notif.actorId || notif.actor_id || "HR - People Operations",
            date: (notif.createdAt || new Date().toISOString()).split("T")[0],
            rating: notif.read ? 1.0 : 0.0,
            sentiment: notif.type,
            notes: notif.message,
            action_item: JSON.stringify({
              announcementId: notif.announcementId || notif.announcement_id,
              linkUrl: notif.linkUrl || notif.link_url,
              read: Boolean(notif.read),
              createdAt: notif.createdAt || new Date().toISOString(),
              type: notif.type,
              userId: notif.userId || notif.user_id,
              title: notif.title,
              message: notif.message,
            }),
          }),
        ]);

        return apiSuccess({ success: true, message: `Notification '${notif.id}' broadcasted and synced to Supabase.` });
      }

      case "update_notification": {
        const notifId = id || record?.id;
        if (!notifId) return apiError("Missing notification 'id'", 400);

        const fbUpdates: any = {};
        if (record.title !== undefined) fbUpdates.employee_name = record.title;
        if (record.message !== undefined) fbUpdates.notes = record.message;
        if (record.read !== undefined) fbUpdates.rating = record.read ? 1.0 : 0.0;
        if (record.type !== undefined) fbUpdates.sentiment = record.type;

        await Promise.allSettled([
          supabaseAdmin.from("feedbacks").update(fbUpdates).eq("id", notifId),
          supabaseAdmin.from("notifications").update({
            title: record.title,
            message: record.message,
            read: record.read,
            type: record.type,
            link_url: record.linkUrl || record.link_url,
          }).eq("id", notifId),
        ]);

        return apiSuccess({ success: true, message: `Notification '${notifId}' updated in Supabase.` });
      }

      case "delete_notification": {
        const notifId = id || record?.id;
        if (!notifId) return apiError("Missing notification 'id'", 400);

        await Promise.allSettled([
          supabaseAdmin.from("feedbacks").delete().eq("id", notifId),
          supabaseAdmin.from("notifications").delete().eq("id", notifId),
        ]);

        return apiSuccess({ success: true, message: `Notification '${notifId}' deleted from Supabase.` });
      }

      case "delete_all_notifications": {
        const targetUser = employeeId || id || body.userId;
        if (!targetUser) return apiError("Missing target user id", 400);

        await Promise.allSettled([
          supabaseAdmin
            .from("feedbacks")
            .delete()
            .eq("lead_id", "NOTIFICATION")
            .or(`employee_id.eq.${targetUser},employee_id.eq.all`),
          supabaseAdmin
            .from("notifications")
            .delete()
            .or(`user_id.eq.${targetUser},user_id.eq.all`),
        ]);

        return apiSuccess({ success: true, message: `All notifications for '${targetUser}' deleted from Supabase.` });
      }

      default:
        return apiError(`Unsupported action '${action}'`, 400);
    }
  } catch (err: any) {
    console.error("[Supabase Admin Sync Handler Exception]", err);
    return apiError(err.message || "Admin sync failed", 500);
  }
}
